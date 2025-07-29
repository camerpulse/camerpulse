import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, MapPin, RefreshCw, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ElectionForecast {
  id: string;
  forecast_date: string;
  region: string;
  party_name: string;
  demographic_group: string;
  predicted_vote_percentage: number;
  confidence_interval_lower: number;
  confidence_interval_upper: number;
  sample_size: number;
  methodology: string;
}

interface ForecastSummary {
  party_name: string;
  national_average: number;
  regions_leading: number;
  weighted_average: number;
  last_updated: string;
}

const PARTY_COLORS = {
  'CPDM': '#1f77b4',
  'SDF': '#ff7f0e', 
  'UNDP': '#2ca02c',
  'UPC': '#d62728',
  'MDR': '#9467bd',
  'Other': '#8c564b'
};

export default function ElectionForecast() {
  const [forecasts, setForecasts] = useState<ElectionForecast[]>([]);
  const [summary, setSummary] = useState<ForecastSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedDemographic, setSelectedDemographic] = useState<string>('All Demographics');

  const fetchForecasts = async () => {
    try {
      const { data: forecastData, error: forecastError } = await supabase
        .from('election_forecasts')
        .select('*')
        .eq('forecast_date', new Date().toISOString().split('T')[0])
        .order('predicted_vote_percentage', { ascending: false });

      if (forecastError) throw forecastError;

      const { data: summaryData, error: summaryError } = await supabase
        .from('election_forecast_summary')
        .select('*');

      if (summaryError) throw summaryError;

      setForecasts(forecastData || []);
      setSummary(summaryData || []);
    } catch (error) {
      console.error('Error fetching forecasts:', error);
      toast.error('Failed to load election forecasts');
    } finally {
      setLoading(false);
    }
  };

  const generateForecast = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.rpc('generate_election_forecast');
      
      if (error) throw error;
      
      toast.success(`Generated ${data[0]?.forecasts_created || 0} forecasts for ${data[0]?.regions_processed || 0} regions`);
      await fetchForecasts();
    } catch (error) {
      console.error('Error generating forecast:', error);
      toast.error('Failed to generate election forecast');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchForecasts();
  }, []);

  const filteredForecasts = forecasts.filter(f => 
    (selectedRegion === 'All' || f.region === selectedRegion) &&
    f.demographic_group === selectedDemographic
  );

  const regions = [...new Set(forecasts.map(f => f.region))].filter(Boolean);
  const demographics = [...new Set(forecasts.map(f => f.demographic_group))];

  const chartData = filteredForecasts.reduce((acc, forecast) => {
    const existing = acc.find(item => item.party === forecast.party_name);
    if (existing) {
      existing.percentage += forecast.predicted_vote_percentage;
      existing.count += 1;
    } else {
      acc.push({
        party: forecast.party_name,
        percentage: forecast.predicted_vote_percentage,
        count: 1,
        lower: forecast.confidence_interval_lower,
        upper: forecast.confidence_interval_upper
      });
    }
    return acc;
  }, [] as any[]);

  chartData.forEach(item => {
    item.percentage = item.percentage / item.count;
  });

  const pieData = summary.map(s => ({
    name: s.party_name,
    value: s.national_average,
    color: PARTY_COLORS[s.party_name as keyof typeof PARTY_COLORS] || '#999999'
  }));

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Election Forecast</h1>
          <p className="text-muted-foreground">
            AI-powered election predictions based on poll trends and demographic analysis
          </p>
        </div>
        <Button 
          onClick={generateForecast} 
          disabled={generating}
          className="flex items-center gap-2"
        >
          {generating ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <BarChart3 className="h-4 w-4" />
          )}
          {generating ? 'Generating...' : 'Generate Forecast'}
        </Button>
      </div>

      {summary.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {summary.slice(0, 3).map((party, index) => (
            <Card key={party.party_name}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{party.party_name}</CardTitle>
                  <Badge variant={index === 0 ? "default" : "secondary"}>
                    #{index + 1}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {party.national_average.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Leading in {party.regions_leading} regions
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="regional">Regional Analysis</TabsTrigger>
          <TabsTrigger value="demographic">Demographics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  National Vote Share
                </CardTitle>
                <CardDescription>
                  Predicted vote percentages by party
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Vote Projections
                </CardTitle>
                <CardDescription>
                  With confidence intervals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="party" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="regional" className="space-y-4">
          <div className="flex gap-4 mb-4">
            <select 
              value={selectedRegion} 
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="All">All Regions</option>
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regions.map(region => {
              const regionData = forecasts.filter(f => 
                f.region === region && f.demographic_group === 'All Demographics'
              ).sort((a, b) => b.predicted_vote_percentage - a.predicted_vote_percentage);

              return (
                <Card key={region}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MapPin className="h-4 w-4" />
                      {region}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {regionData.slice(0, 3).map((forecast, index) => (
                      <div key={forecast.id} className="flex justify-between items-center">
                        <span className="font-medium">{forecast.party_name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={index === 0 ? "default" : "secondary"}>
                            {forecast.predicted_vote_percentage.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="demographic" className="space-y-4">
          <div className="flex gap-4 mb-4">
            <select 
              value={selectedDemographic} 
              onChange={(e) => setSelectedDemographic(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              {demographics.map(demo => (
                <option key={demo} value={demo}>{demo}</option>
              ))}
            </select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Demographic Analysis: {selectedDemographic}
              </CardTitle>
              <CardDescription>
                Vote share predictions by demographic group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="party" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [`${value.toFixed(1)}%`, 'Vote Share']}
                  />
                  <Bar dataKey="percentage" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {forecasts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Forecasts Available</h3>
            <p className="text-muted-foreground text-center mb-4">
              Generate election forecasts based on current poll trends to see predictions.
            </p>
            <Button onClick={generateForecast} disabled={generating}>
              {generating ? 'Generating...' : 'Generate First Forecast'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}