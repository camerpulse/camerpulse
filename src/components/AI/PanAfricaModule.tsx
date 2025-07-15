import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  MapPin, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Flag,
  Languages,
  Zap,
  ArrowUpDown,
  AlertTriangle,
  Activity,
  Radar,
  Settings,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Country {
  country_code: string;
  country_name: string;
  country_name_local: string;
  flag_emoji: string;
  primary_language: string;
  supported_languages: string[];
  currency_code: string;
  region: string;
  capital_city: string;
  is_active: boolean;
}

interface AdministrativeDivision {
  id: string;
  country_code: string;
  division_type: string;
  division_name: string;
  division_code: string;
}

interface CountryConfig {
  config_type: string;
  config_key: string;
  config_value: any;
}

interface CountrySentiment {
  country_code: string;
  sentiment_score: number;
  volume: number;
  threat_level: string;
  top_emotions: string[];
}

interface CrossCountryComparison {
  country_a: string;
  country_b: string;
  sentiment_diff: number;
  common_issues: string[];
  unique_issues_a: string[];
  unique_issues_b: string[];
}

const PanAfricaModule = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>('CM');
  const [countries, setCountries] = useState<Country[]>([]);
  const [divisions, setDivisions] = useState<AdministrativeDivision[]>([]);
  const [countryConfig, setCountryConfig] = useState<CountryConfig[]>([]);
  const [countrySentiments, setCountrySentiments] = useState<CountrySentiment[]>([]);
  const [crossCountryComparisons, setCrossCountryComparisons] = useState<CrossCountryComparison[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    loadPanAfricaData();
    const interval = setInterval(loadPanAfricaData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      loadCountrySpecificData(selectedCountry);
    }
  }, [selectedCountry]);

  const loadPanAfricaData = async () => {
    try {
      setIsLoading(true);

      // Load countries
      const { data: countriesData } = await supabase
        .from('pan_africa_countries')
        .select('*')
        .eq('is_active', true)
        .order('country_name');

      if (countriesData) {
        setCountries(countriesData);
      }

      // Load cross-country sentiment data (mock for now)
      generateMockSentimentData(countriesData || []);

    } catch (error) {
      console.error('Error loading Pan-Africa data:', error);
      toast({
        title: "Data Loading Failed",
        description: "Could not load Pan-African intelligence data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCountrySpecificData = async (countryCode: string) => {
    try {
      // Load administrative divisions
      const { data: divisionsData } = await supabase
        .from('country_administrative_divisions')
        .select('*')
        .eq('country_code', countryCode)
        .order('division_name');

      // Load country configuration
      const { data: configData } = await supabase
        .from('country_civic_config')
        .select('*')
        .eq('country_code', countryCode);

      if (divisionsData) setDivisions(divisionsData);
      if (configData) setCountryConfig(configData);

    } catch (error) {
      console.error('Error loading country-specific data:', error);
    }
  };

  const generateMockSentimentData = (countriesData: Country[]) => {
    const mockSentiments = countriesData.map(country => ({
      country_code: country.country_code,
      sentiment_score: Math.random() * 2 - 1, // -1 to 1
      volume: Math.floor(Math.random() * 10000),
      threat_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      top_emotions: ['hope', 'concern', 'anger', 'optimism'].slice(0, Math.floor(Math.random() * 3) + 1)
    }));
    setCountrySentiments(mockSentiments);

    // Generate cross-country comparisons
    const comparisons: CrossCountryComparison[] = [];
    for (let i = 0; i < Math.min(5, countriesData.length - 1); i++) {
      const countryA = countriesData[i];
      const countryB = countriesData[i + 1];
      if (countryA && countryB) {
        comparisons.push({
          country_a: countryA.country_code,
          country_b: countryB.country_code,
          sentiment_diff: Math.random() * 1 - 0.5,
          common_issues: ['Education', 'Healthcare', 'Economy'],
          unique_issues_a: ['Anglophone Crisis'],
          unique_issues_b: ['Power Supply']
        });
      }
    }
    setCrossCountryComparisons(comparisons);
  };

  const getCurrentCountry = () => countries.find(c => c.country_code === selectedCountry);
  const currentCountry = getCurrentCountry();

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return 'text-success';
    if (score > -0.3) return 'text-warning';
    return 'text-destructive';
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-destructive';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-success';
      default: return 'bg-muted';
    }
  };

  const getRegionColor = (region: string) => {
    const colors = {
      'West Africa': 'bg-blue-500',
      'Central Africa': 'bg-green-500',
      'East Africa': 'bg-purple-500',
      'Southern Africa': 'bg-orange-500',
      'North Africa': 'bg-red-500'
    };
    return colors[region as keyof typeof colors] || 'bg-gray-500';
  };

  const getCivicIssues = () => {
    const config = countryConfig.find(c => c.config_key === 'primary_issues');
    return config ? config.config_value : [];
  };

  const getPoliticalParties = () => {
    const config = countryConfig.find(c => c.config_key === 'major_parties');
    return config ? config.config_value : [];
  };

  return (
    <div className="space-y-6">
      {/* Pan-African Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Globe className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Pan-African Civic Intelligence</h1>
              <p className="opacity-90">Continental sentiment and civic monitoring across {countries.length} African countries</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="text-primary-foreground border-primary-foreground/50">
              <Activity className="h-3 w-3 mr-1" />
              Live Intelligence
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={loadPanAfricaData}
              disabled={isLoading}
              className="text-primary-foreground border-primary-foreground/50 hover:bg-primary-foreground/10"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Country Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Flag className="h-5 w-5" />
            <span>Country Selection</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Country</label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.country_code} value={country.country_code}>
                      <div className="flex items-center space-x-2">
                        <span>{country.flag_emoji}</span>
                        <span>{country.country_name}</span>
                        <Badge variant="outline" className="ml-2">
                          {country.region}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {currentCountry && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Current Selection</div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <span className="text-2xl">{currentCountry.flag_emoji}</span>
                  <div>
                    <div className="font-semibold">{currentCountry.country_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {currentCountry.capital_city} • {currentCountry.currency_code}
                    </div>
                  </div>
                  <Badge className={getRegionColor(currentCountry.region)}>
                    {currentCountry.region}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Continental Overview</TabsTrigger>
          <TabsTrigger value="country">Country Details</TabsTrigger>
          <TabsTrigger value="comparison">Cross-Country</TabsTrigger>
          <TabsTrigger value="heatmap">Africa Heatmap</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        {/* Continental Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Globe className="h-8 w-8 text-primary" />
                  <div>
                    <div className="text-2xl font-bold">{countries.length}</div>
                    <div className="text-sm text-muted-foreground">Active Countries</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-8 w-8 text-success" />
                  <div>
                    <div className="text-2xl font-bold">
                      {countrySentiments.filter(s => s.sentiment_score > 0).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Positive Sentiment</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-8 w-8 text-warning" />
                  <div>
                    <div className="text-2xl font-bold">
                      {countrySentiments.filter(s => s.threat_level === 'high').length}
                    </div>
                    <div className="text-sm text-muted-foreground">High Alert Countries</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Activity className="h-8 w-8 text-primary" />
                  <div>
                    <div className="text-2xl font-bold">
                      {countrySentiments.reduce((sum, s) => sum + s.volume, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Data Points</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Regional Sentiment Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['West Africa', 'Central Africa', 'East Africa', 'Southern Africa', 'North Africa'].map((region) => {
                  const regionCountries = countries.filter(c => c.region === region);
                  const regionSentiments = countrySentiments.filter(s => 
                    regionCountries.some(c => c.country_code === s.country_code)
                  );
                  const avgSentiment = regionSentiments.length > 0 
                    ? regionSentiments.reduce((sum, s) => sum + s.sentiment_score, 0) / regionSentiments.length 
                    : 0;

                  return (
                    <div key={region} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getRegionColor(region)}`} />
                          <span className="font-medium">{region}</span>
                          <Badge variant="outline">{regionCountries.length} countries</Badge>
                        </div>
                        <div className={`font-semibold ${getSentimentColor(avgSentiment)}`}>
                          {avgSentiment > 0 ? 'Positive' : avgSentiment < -0.3 ? 'Negative' : 'Neutral'}
                        </div>
                      </div>
                      <Progress value={(avgSentiment + 1) * 50} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Country Details */}
        <TabsContent value="country" className="space-y-6">
          {currentCountry && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="text-2xl">{currentCountry.flag_emoji}</span>
                    <span>{currentCountry.country_name} Intelligence Profile</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Country Information</h4>
                      <div className="space-y-1 text-sm">
                        <div><strong>Capital:</strong> {currentCountry.capital_city}</div>
                        <div><strong>Currency:</strong> {currentCountry.currency_code}</div>
                        <div><strong>Languages:</strong> {currentCountry.supported_languages.join(', ')}</div>
                        <div><strong>Region:</strong> {currentCountry.region}</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Administrative Divisions</h4>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          {divisions.length} {divisions[0]?.division_type || 'divisions'}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {divisions.slice(0, 6).map((div) => (
                            <Badge key={div.id} variant="outline" className="text-xs">
                              {div.division_name}
                            </Badge>
                          ))}
                          {divisions.length > 6 && (
                            <Badge variant="outline" className="text-xs">
                              +{divisions.length - 6} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Current Sentiment</h4>
                      {(() => {
                        const sentiment = countrySentiments.find(s => s.country_code === selectedCountry);
                        if (sentiment) {
                          return (
                            <div className="space-y-2">
                              <div className={`text-lg font-semibold ${getSentimentColor(sentiment.sentiment_score)}`}>
                                {sentiment.sentiment_score > 0.3 ? 'Positive' : 
                                 sentiment.sentiment_score < -0.3 ? 'Negative' : 'Neutral'}
                              </div>
                              <Progress value={(sentiment.sentiment_score + 1) * 50} className="h-2" />
                              <Badge className={getThreatColor(sentiment.threat_level)}>
                                {sentiment.threat_level.toUpperCase()} Threat
                              </Badge>
                            </div>
                          );
                        }
                        return <div className="text-sm text-muted-foreground">No data available</div>;
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Primary Civic Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {getCivicIssues().map((issue: string, idx: number) => (
                        <Badge key={idx} variant="secondary">
                          {issue}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Major Political Parties</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {getPoliticalParties().map((party: string, idx: number) => (
                        <Badge key={idx} variant="outline">
                          {party}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Cross-Country Comparison */}
        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ArrowUpDown className="h-5 w-5" />
                <span>Cross-Country Sentiment Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {crossCountryComparisons.map((comparison, idx) => {
                  const countryA = countries.find(c => c.country_code === comparison.country_a);
                  const countryB = countries.find(c => c.country_code === comparison.country_b);
                  if (!countryA || !countryB) return null;

                  return (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span>{countryA.flag_emoji}</span>
                            <span className="font-medium">{countryA.country_name}</span>
                          </div>
                          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                          <div className="flex items-center space-x-2">
                            <span>{countryB.flag_emoji}</span>
                            <span className="font-medium">{countryB.country_name}</span>
                          </div>
                        </div>
                        <Badge 
                          variant={Math.abs(comparison.sentiment_diff) > 0.3 ? "destructive" : "secondary"}
                        >
                          {Math.abs(comparison.sentiment_diff) > 0.3 ? 'High Divergence' : 'Similar Sentiment'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <h5 className="font-medium mb-1">Common Issues</h5>
                          <div className="flex flex-wrap gap-1">
                            {comparison.common_issues.map((issue, issueIdx) => (
                              <Badge key={issueIdx} variant="outline" className="text-xs">
                                {issue}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium mb-1">{countryA.country_name} Specific</h5>
                          <div className="flex flex-wrap gap-1">
                            {comparison.unique_issues_a.map((issue, issueIdx) => (
                              <Badge key={issueIdx} variant="secondary" className="text-xs">
                                {issue}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium mb-1">{countryB.country_name} Specific</h5>
                          <div className="flex flex-wrap gap-1">
                            {comparison.unique_issues_b.map((issue, issueIdx) => (
                              <Badge key={issueIdx} variant="secondary" className="text-xs">
                                {issue}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Africa Heatmap */}
        <TabsContent value="heatmap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Radar className="h-5 w-5" />
                <span>Continental Sentiment Heatmap</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {countries.map((country) => {
                  const sentiment = countrySentiments.find(s => s.country_code === country.country_code);
                  return (
                    <div 
                      key={country.country_code}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
                        selectedCountry === country.country_code ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                      onClick={() => setSelectedCountry(country.country_code)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{country.flag_emoji}</span>
                          <span className="font-medium text-sm">{country.country_name}</span>
                        </div>
                        {sentiment && (
                          <Badge className={getThreatColor(sentiment.threat_level)} variant="secondary">
                            {sentiment.threat_level}
                          </Badge>
                        )}
                      </div>
                      
                      {sentiment && (
                        <div className="space-y-2">
                          <div className={`text-xs font-medium ${getSentimentColor(sentiment.sentiment_score)}`}>
                            {sentiment.sentiment_score > 0.3 ? 'Positive' : 
                             sentiment.sentiment_score < -0.3 ? 'Negative' : 'Neutral'}
                          </div>
                          <Progress value={(sentiment.sentiment_score + 1) * 50} className="h-1" />
                          <div className="text-xs text-muted-foreground">
                            {sentiment.volume.toLocaleString()} data points
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration */}
        <TabsContent value="config" className="space-y-6">
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              <strong>Pan-African Configuration:</strong> This module automatically adapts to each country's 
              unique administrative structure, languages, political parties, and civic issues. All data is 
              separated by country to ensure accurate regional intelligence.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Supported Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Languages className="h-4 w-4 text-success" />
                    <span className="text-sm">Multi-language sentiment detection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-success" />
                    <span className="text-sm">Country-specific administrative divisions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-success" />
                    <span className="text-sm">Regional sentiment aggregation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-success" />
                    <span className="text-sm">Real-time cross-country comparisons</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-success" />
                    <span className="text-sm">Continental heatmap visualization</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>Sentiment Analysis:</strong> Multi-platform social media monitoring</div>
                  <div><strong>Administrative Data:</strong> Official government divisions</div>
                  <div><strong>Political Intelligence:</strong> Party configurations and civic issues</div>
                  <div><strong>Language Processing:</strong> Country-specific slang and terminology</div>
                  <div><strong>Cross-Border Analytics:</strong> Regional comparison algorithms</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PanAfricaModule;