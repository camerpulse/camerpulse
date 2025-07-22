import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface SenatorData {
  name: string;
  position: string;
  photo_url?: string;
  about?: string;
}

async function scrapeSenators(): Promise<SenatorData[]> {
  try {
    const response = await fetch('https://senat.cm/?page_id=869');
    const html = await response.text();
    
    const senators: SenatorData[] = [];
    
    // Parse HTML to extract senator information
    const senatorPattern = /## ([^#\n]+)\n\n#### ([^\n]+)\n(?:\n([^#\n\[]*))?/g;
    let match;
    
    // Also extract image URLs
    const imagePattern = /\[(.*?)\]\((https:\/\/senat\.cm\/wp-content\/uploads\/[^)]+)\)/g;
    const images: string[] = [];
    let imageMatch;
    
    while ((imageMatch = imagePattern.exec(html)) !== null) {
      if (imageMatch[2]) {
        images.push(imageMatch[2]);
      }
    }
    
    let imageIndex = 0;
    while ((match = senatorPattern.exec(html)) !== null) {
      const name = match[1]?.trim();
      const position = match[2]?.trim();
      const about = match[3]?.trim() || '';
      
      if (name && position) {
        // Skip if it's just "Senateurs" header
        if (name.toLowerCase() === 'senateurs') continue;
        
        const senator: SenatorData = {
          name,
          position,
          about: about || ''
        };
        
        // Assign photo if available
        if (imageIndex < images.length) {
          senator.photo_url = images[imageIndex];
          imageIndex++;
        }
        
        senators.push(senator);
      }
    }
    
    console.log(`Scraped ${senators.length} senators`);
    return senators;
  } catch (error) {
    console.error('Error scraping senators:', error);
    throw new Error('Failed to scrape senators data');
  }
}

async function importSenators(senators: SenatorData[]) {
  try {
    // Clear existing senators
    await supabase.from('senators').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Insert new senators
    const { data, error } = await supabase
      .from('senators')
      .insert(senators)
      .select();
    
    if (error) {
      console.error('Database error:', error);
      throw error;
    }
    
    console.log(`Imported ${data?.length} senators successfully`);
    return data;
  } catch (error) {
    console.error('Error importing senators:', error);
    throw error;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting senators import...');
    
    const senators = await scrapeSenators();
    const imported = await importSenators(senators);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully imported ${imported?.length} senators`,
        data: imported
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});