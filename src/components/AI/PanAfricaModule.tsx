import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  Map, 
  BarChart3, 
  TrendingUp, 
  Flag, 
  Users,
  AlertTriangle,
  ArrowUpDown,
  MapPin,
  Languages,
  Zap,
  Eye,
  Activity
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

interface CountryComparison {
  country_code: string;
  country_name: string;
  flag_emoji: string;
  sentiment_score: number;
  top_issues: string[];
  threat_level: string;
  volume: number;
}

interface CrossCountryAnalytics {
  analysis_type: string;
  countries_compared: string[];
  analysis_data: any;
  insights: any;
  analysis_date: string;
}

const PanAfricaModule = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('CM');
  const [countryComparisons, setCountryComparisons] = useState<CountryComparison[]>([]);
  const [crossCountryAnalytics, setCrossCountryAnalytics] = useState<CrossCountryAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPanAfricaData();
  }, []);

  const loadPanAfricaData = async () => {
    setIsLoading(true);
    try {
      // Load countries from the database
      const { data: countryData } = await supabase
        .from('pan_africa_countries')
        .select('*')
        .eq('is_active', true)
        .order('country_name');

      if (countryData && countryData.length > 0) {
        setCountries(countryData as Country[]);
      } else {
        // Fallback to mock data if no countries in database
        const mockCountries: Country[] = [
          {
            country_code: 'CM',
            country_name: 'Cameroon',
            country_name_local: 'Cameroun',
            flag_emoji: '🇨🇲',
            primary_language: 'fr',
            supported_languages: ['fr', 'en'],
            currency_code: 'XAF',
            region: 'Central Africa',
            capital_city: 'Yaoundé',
            is_active: true
          },
          {
            country_code: 'NG',
            country_name: 'Nigeria',
            country_name_local: 'Nigeria',
            flag_emoji: '🇳🇬',
            primary_language: 'en',
            supported_languages: ['en', 'ha', 'yo', 'ig'],
            currency_code: 'NGN',
            region: 'West Africa',
            capital_city: 'Abuja',
            is_active: true
          },
          {
            country_code: 'GH',
            country_name: 'Ghana',
            country_name_local: 'Ghana',
            flag_emoji: '🇬🇭',
            primary_language: 'en',
            supported_languages: ['en', 'tw', 'ha'],
            currency_code: 'GHS',
            region: 'West Africa',
            capital_city: 'Accra',
            is_active: true
          },
          {
            country_code: 'KE',
            country_name: 'Kenya',
            country_name_local: 'Kenya',
            flag_emoji: '🇰🇪',
            primary_language: 'sw',
            supported_languages: ['sw', 'en'],
            currency_code: 'KES',
            region: 'East Africa',
            capital_city: 'Nairobi',
            is_active: true
          },
          {
            country_code: 'ZA',
            country_name: 'South Africa',
            country_name_local: 'South Africa',
            flag_emoji: '🇿🇦',
            primary_language: 'en',
            supported_languages: ['af', 'en', 'zu', 'xh'],
            currency_code: 'ZAR',
            region: 'Southern Africa',
            capital_city: 'Cape Town',
            is_active: true
          },
          {
            country_code: 'EG',
            country_name: 'Egypt',
            country_name_local: 'مصر',
            flag_emoji: '🇪🇬',
            primary_language: 'ar',
            supported_languages: ['ar', 'en'],
            currency_code: 'EGP',
            region: 'North Africa',
            capital_city: 'Cairo',
            is_active: true
          }
        ];
        setCountries(mockCountries);
      }

      // Load cross-country analytics
      const { data: analyticsData } = await supabase
        .from('pan_africa_cross_country_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Generate mock comparison data based on available countries
      const mockComparisons: CountryComparison[] = [
        {
          country_code: 'CM',
          country_name: 'Cameroon',
          flag_emoji: '🇨🇲',
          sentiment_score: 0.2,
          top_issues: ['Education', 'Anglophone Crisis', 'Security'],
          threat_level: 'medium',
          volume: 1250
        },
        {
          country_code: 'NG',
          country_name: 'Nigeria',
          flag_emoji: '🇳🇬',
          sentiment_score: -0.1,
          top_issues: ['Security', 'Fuel Subsidy', 'Elections'],
          threat_level: 'high',
          volume: 4500
        },
        {
          country_code: 'GH',
          country_name: 'Ghana',
          flag_emoji: '🇬🇭',
          sentiment_score: 0.4,
          top_issues: ['Economy', 'Dumsor', 'Education'],
          threat_level: 'low',
          volume: 800
        },
        {
          country_code: 'KE',
          country_name: 'Kenya',
          flag_emoji: '🇰🇪',
          sentiment_score: 0.1,
          top_issues: ['Economy', 'Healthcare', 'Elections'],
          threat_level: 'medium',
          volume: 2100
        },
        {
          country_code: 'ZA',
          country_name: 'South Africa',
          flag_emoji: '🇿🇦',
          sentiment_score: -0.2,
          top_issues: ['Economy', 'Crime', 'Loadshedding'],
          threat_level: 'medium',
          volume: 3200
        },
        {
          country_code: 'EG',
          country_name: 'Egypt',
          flag_emoji: '🇪🇬',
          sentiment_score: 0.05,
          top_issues: ['Economy', 'Infrastructure', 'Security'],
          threat_level: 'medium',
          volume: 1800
        }
      ];

      setCountryComparisons(mockComparisons);

      // Mock cross-country analytics
      const mockAnalytics: CrossCountryAnalytics[] = [
        {
          analysis_type: 'sentiment_comparison',
          countries_compared: ['CM', 'NG', 'GH', 'KE', 'ZA', 'EG'],
          analysis_data: {
            avg_sentiment: 0.08,
            most_positive: 'GH',
            most_negative: 'ZA',
            trending_up: ['CM', 'KE'],
            trending_down: ['NG']
          },
          insights: {
            regional_patterns: 'West Africa showing mixed signals with Ghana leading positive sentiment',
            risk_factors: 'Nigeria and South Africa showing sustained negative sentiment patterns'
          },
          analysis_date: new Date().toISOString().split('T')[0]
        }
      ];

      setCrossCountryAnalytics(analyticsData && analyticsData.length > 0 ? analyticsData : mockAnalytics);

    } catch (error) {
      console.error('Error loading Pan-Africa data:', error);
      toast({
        title: "Data Loading Error",
        description: "Failed to load Pan-African data. Using demo data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.2) return 'text-success';
    if (score > -0.2) return 'text-warning';
    return 'text-destructive';
  };

  const getSentimentLabel = (score: number) => {
    if (score > 0.2) return 'Positive';
    if (score > -0.2) return 'Neutral';
    return 'Negative';
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-success text-success-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'high': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const selectedCountryData = countries.find(c => c.country_code === selectedCountry);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <Activity className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading Pan-African Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Country Selector */}
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <Globe className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Pan-African Civic Intelligence</h1>
              <p className="text-primary-foreground/90">Multi-country sentiment & civic monitoring</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm text-primary-foreground/90">Active Country</p>
              <p className="text-lg font-semibold">
                {selectedCountryData?.flag_emoji} {selectedCountryData?.country_name}
              </p>
            </div>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-48 bg-white/10 border-white/20 text-primary-foreground">
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.country_code} value={country.country_code}>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{country.flag_emoji}</span>
                      <span>{country.country_name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Continental Overview</TabsTrigger>
          <TabsTrigger value="comparison">Country Comparison</TabsTrigger>
          <TabsTrigger value="analytics">Cross-Border Analytics</TabsTrigger>
          <TabsTrigger value="config">Regional Config</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Continental Sentiment Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Globe className="h-5 w-5" />
                  <span>Active Countries</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">
                  {countries.filter(c => c.is_active).length}
                </div>
                <p className="text-sm text-muted-foreground">
                  Across 6 African regions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Activity className="h-5 w-5" />
                  <span>Continental Pulse</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-warning mb-2">
                  Mixed
                </div>
                <p className="text-sm text-muted-foreground">
                  Avg: +0.08 sentiment score
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <TrendingUp className="h-5 w-5" />
                  <span>Daily Volume</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">
                  13.7K
                </div>
                <p className="text-sm text-muted-foreground">
                  Civic reports today
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Regional Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Map className="h-5 w-5" />
                <span>Regional Sentiment Heatmap</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['West Africa', 'Central Africa', 'East Africa', 'Southern Africa', 'North Africa'].map((region) => {
                  const regionCountries = countries.filter(c => c.region === region);
                  const avgSentiment = countryComparisons
                    .filter(c => regionCountries.some(rc => rc.country_code === c.country_code))
                    .reduce((acc, c) => acc + c.sentiment_score, 0) / regionCountries.length || 0;
                  
                  return (
                    <div key={region} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">{region}</h3>
                      <div className={`text-xl font-bold mb-2 ${getSentimentColor(avgSentiment)}`}>
                        {getSentimentLabel(avgSentiment)}
                      </div>
                      <Progress value={(avgSentiment + 1) * 50} className="mb-2 h-2" />
                      <div className="flex flex-wrap gap-1">
                        {regionCountries.map(country => (
                          <span key={country.country_code} className="text-lg">
                            {country.flag_emoji}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ArrowUpDown className="h-5 w-5" />
                <span>Country-by-Country Comparison</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {countryComparisons.map((country) => (
                  <div key={country.country_code} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{country.flag_emoji}</span>
                        <div>
                          <h3 className="font-bold text-lg">{country.country_name}</h3>
                          <p className="text-sm text-muted-foreground">Volume: {country.volume} reports</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getThreatColor(country.threat_level)}>
                          {country.threat_level.charAt(0).toUpperCase() + country.threat_level.slice(1)} Risk
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Sentiment</p>
                        <div className={`text-2xl font-bold ${getSentimentColor(country.sentiment_score)}`}>
                          {getSentimentLabel(country.sentiment_score)}
                        </div>
                        <Progress value={(country.sentiment_score + 1) * 50} className="mt-2 h-2" />
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Top Issues</p>
                        <div className="flex flex-wrap gap-1">
                          {country.top_issues.map((issue, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {issue}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Cross-Border Intelligence</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {crossCountryAnalytics.map((analytics, idx) => (
                <div key={idx} className="space-y-4">
                  <Alert>
                    <Eye className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <h4 className="font-semibold">Continental Sentiment Analysis</h4>
                        <p className="text-sm">{analytics.insights.regional_patterns}</p>
                        <div className="text-xs text-muted-foreground">
                          Risk Factors: {analytics.insights.risk_factors}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Most Positive</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <span className="text-2xl">🇬🇭</span>
                          <p className="font-semibold">Ghana</p>
                          <p className="text-sm text-success">+0.4 sentiment</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Most Negative</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <span className="text-2xl">🇿🇦</span>
                          <p className="font-semibold">South Africa</p>
                          <p className="text-sm text-destructive">-0.2 sentiment</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Trending Up</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center space-y-1">
                          <div>🇨🇲 🇰🇪</div>
                          <p className="text-sm font-semibold">Cameroon & Kenya</p>
                          <p className="text-xs text-success">+12% this week</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Flag className="h-5 w-5" />
                <span>Country Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCountryData && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <span className="text-6xl">{selectedCountryData.flag_emoji}</span>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedCountryData.country_name}</h2>
                      <p className="text-lg text-muted-foreground">{selectedCountryData.country_name_local}</p>
                      <p className="text-sm text-muted-foreground">{selectedCountryData.region}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          Geographic Details
                        </h3>
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Capital:</span> {selectedCountryData.capital_city}</p>
                          <p><span className="font-medium">Region:</span> {selectedCountryData.region}</p>
                          <p><span className="font-medium">Currency:</span> {selectedCountryData.currency_code}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2 flex items-center">
                          <Languages className="h-4 w-4 mr-2" />
                          Language Configuration
                        </h3>
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Primary:</span> {selectedCountryData.primary_language.toUpperCase()}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedCountryData.supported_languages.map((lang, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {lang.toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center">
                          <Zap className="h-4 w-4 mr-2" />
                          System Status
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Data Collection</span>
                            <Badge className="bg-success text-success-foreground">Active</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Sentiment Analysis</span>
                            <Badge className="bg-success text-success-foreground">Online</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Civic Intelligence</span>
                            <Badge className="bg-warning text-warning-foreground">Beta</Badge>
                          </div>
                        </div>
                      </div>

                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          <strong>Demo Mode:</strong> This is a demonstration of Pan-African capabilities. 
                          Full deployment requires country-specific data setup and API integrations.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PanAfricaModule;