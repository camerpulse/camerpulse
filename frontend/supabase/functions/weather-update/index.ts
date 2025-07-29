import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WeatherApiResponse {
  location: {
    name: string;
    region: string;
    country: string;
  };
  current: {
    temp_c: number;
    humidity: number;
    wind_kph: number;
    condition: {
      text: string;
    };
    precip_mm: number;
  };
}

interface CameroonWeatherLocation {
  name: string;
  region: string;
  lat: number;
  lon: number;
}

const CAMEROON_LOCATIONS: CameroonWeatherLocation[] = [
  { name: "Douala", region: "Littoral", lat: 4.0511, lon: 9.7679 },
  { name: "Yaoundé", region: "Centre", lat: 3.8480, lon: 11.5021 },
  { name: "Bamenda", region: "Northwest", lat: 5.9597, lon: 10.1491 },
  { name: "Garoua", region: "North", lat: 9.3265, lon: 13.3962 },
  { name: "Maroua", region: "Far North", lat: 10.5906, lon: 14.3197 },
  { name: "Ngaoundéré", region: "Adamawa", lat: 7.3167, lon: 13.5833 },
  { name: "Bertoua", region: "East", lat: 4.5774, lon: 13.6848 },
  { name: "Bafoussam", region: "West", lat: 5.4781, lon: 10.4171 },
  { name: "Kumba", region: "Southwest", lat: 4.6364, lon: 9.4469 },
  { name: "Kribi", region: "South", lat: 2.9450, lon: 9.9057 }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const weatherApiKey = Deno.env.get('WEATHER_API_KEY')

    if (!weatherApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Weather API key not configured',
          message: 'Please add WEATHER_API_KEY to Supabase Edge Function secrets'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Starting weather update for Cameroon locations...')

    // Get weather data for each major location
    const weatherUpdates = await Promise.allSettled(
      CAMEROON_LOCATIONS.map(async (location) => {
        try {
          // Using WeatherAPI.com - free tier allows 1M calls/month
          const weatherUrl = `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${location.lat},${location.lon}&aqi=no`
          
          console.log(`Fetching weather for ${location.name}...`)
          
          const response = await fetch(weatherUrl)
          if (!response.ok) {
            throw new Error(`Weather API error: ${response.statusText}`)
          }

          const weatherData: WeatherApiResponse = await response.json()

          // Find the corresponding village in our database
          const { data: village } = await supabase
            .from('villages')
            .select('id')
            .eq('village_name', location.name)
            .single()

          if (!village) {
            console.log(`Village ${location.name} not found in database`)
            return { location: location.name, status: 'village_not_found' }
          }

          // Insert or update weather data
          const { error: insertError } = await supabase
            .from('weather_data')
            .upsert({
              region: location.region,
              village_id: village.id,
              date: new Date().toISOString().split('T')[0], // Today's date
              temperature_celsius: weatherData.current.temp_c,
              humidity_percentage: weatherData.current.humidity,
              rainfall_mm: weatherData.current.precip_mm,
              wind_speed_kmh: weatherData.current.wind_kph,
              weather_condition: weatherData.current.condition.text
            }, {
              onConflict: 'region,village_id,date'
            })

          if (insertError) {
            console.error(`Error inserting weather data for ${location.name}:`, insertError)
            return { 
              location: location.name, 
              status: 'database_error', 
              error: insertError.message 
            }
          }

          console.log(`Weather data updated for ${location.name}`)
          return { 
            location: location.name, 
            status: 'success',
            temperature: weatherData.current.temp_c,
            condition: weatherData.current.condition.text
          }

        } catch (error) {
          console.error(`Error processing ${location.name}:`, error)
          return { 
            location: location.name, 
            status: 'error', 
            error: error.message 
          }
        }
      })
    )

    const results = weatherUpdates.map(result => 
      result.status === 'fulfilled' ? result.value : { status: 'promise_failed' }
    )

    const successCount = results.filter(r => r.status === 'success').length
    const errorCount = results.filter(r => r.status !== 'success').length

    console.log(`Weather update complete: ${successCount} success, ${errorCount} errors`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Weather data updated for ${successCount} locations`,
        summary: {
          total: CAMEROON_LOCATIONS.length,
          successful: successCount,
          failed: errorCount
        },
        results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Weather update function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})