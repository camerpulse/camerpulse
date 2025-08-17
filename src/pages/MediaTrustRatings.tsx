import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Shield, AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown, Search, Filter, Star, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MediaSource {
  id: string;
  name: string;
  slug: string;
  source_type: string;
  website_url?: string;
  description?: string;
  founded_year?: number;
  headquarters?: string;
  ownership_type: string;
  bias_score: number;
  trust_score: number;
  fact_check_score: number;
  transparency_score: number;
  reliability_score: number;
  last_monitored_at?: string;
  created_at: string;
}

interface TrustMetrics {
  total_sources: number;
  avg_trust_score: number;
  high_trust_count: number;
  low_trust_count: number;
  flagged_count: number;
}

export default function MediaTrustRatings() {
  const [mediaSources, setMediaSources] = useState<MediaSource[]>([]);
  const [metrics, setMetrics] = useState<TrustMetrics>({
    total_sources: 0,
    avg_trust_score: 0,
    high_trust_count: 0,
    low_trust_count: 0,
    flagged_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [trustFilter, setTrustFilter] = useState('all');

  useEffect(() => {
    fetchMediaSources();
  }, []);

  const fetchMediaSources = async () => {
    try {
      setLoading(true);
      
      // Check if media_sources table exists, if not create dummy data
      const { data, error } = await supabase
        .from('media_sources')
        .select('*')
        .order('trust_score', { ascending: false });

      if (error && error.code === '42P01') {
        // Table doesn't exist, use dummy data
        setMediaSources(getDummyMediaSources());
        setMetrics(calculateMetrics(getDummyMediaSources()));
      } else if (error) {
        throw error;
      } else {
        setMediaSources(data || []);
        setMetrics(calculateMetrics(data || []));
      }
    } catch (error) {
      console.error('Error fetching media sources:', error);
      // Fallback to dummy data
      const dummyData = getDummyMediaSources();
      setMediaSources(dummyData);
      setMetrics(calculateMetrics(dummyData));
      toast.error('Using demo data - database not fully configured');
    } finally {
      setLoading(false);
    }
  };

  const getDummyMediaSources = (): MediaSource[] => [
    {
      id: '1',
      name: 'Cameroon Tribune',
      slug: 'cameroon-tribune',
      source_type: 'newspaper',
      website_url: 'https://www.cameroon-tribune.cm',
      description: 'Official government newspaper of Cameroon',
      founded_year: 1979,
      headquarters: 'Yaoundé',
      ownership_type: 'government',
      bias_score: 65,
      trust_score: 72,
      fact_check_score: 68,
      transparency_score: 45,
      reliability_score: 70,
      last_monitored_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Journal du Cameroun',
      slug: 'journal-du-cameroun',
      source_type: 'online',
      website_url: 'https://www.journalducameroun.com',
      description: 'Independent news portal',
      founded_year: 2010,
      headquarters: 'Douala',
      ownership_type: 'private',
      bias_score: 45,
      trust_score: 85,
      fact_check_score: 88,
      transparency_score: 82,
      reliability_score: 86,
      last_monitored_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'CRTV',
      slug: 'crtv',
      source_type: 'tv',
      website_url: 'https://www.crtv.cm',
      description: 'Cameroon Radio Television',
      founded_year: 1987,
      headquarters: 'Yaoundé',
      ownership_type: 'government',
      bias_score: 70,
      trust_score: 65,
      fact_check_score: 62,
      transparency_score: 40,
      reliability_score: 68,
      last_monitored_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Business in Cameroon',
      slug: 'business-in-cameroon',
      source_type: 'online',
      website_url: 'https://www.businessincameroon.com',
      description: 'Business and economic news',
      founded_year: 2012,
      headquarters: 'Douala',
      ownership_type: 'private',
      bias_score: 35,
      trust_score: 90,
      fact_check_score: 92,
      transparency_score: 88,
      reliability_score: 91,
      last_monitored_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: '5',
      name: 'Equinoxe TV',
      slug: 'equinoxe-tv',
      source_type: 'tv',
      website_url: 'https://www.equinoxetv.com',
      description: 'Private television station',
      founded_year: 2001,
      headquarters: 'Douala',
      ownership_type: 'private',
      bias_score: 50,
      trust_score: 78,
      fact_check_score: 75,
      transparency_score: 70,
      reliability_score: 76,
      last_monitored_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: '6',
      name: 'The Guardian Post',
      slug: 'guardian-post',
      source_type: 'newspaper',
      website_url: 'https://www.theguardianpost.com',
      description: 'Weekly English-language newspaper',
      founded_year: 1993,
      headquarters: 'Bamenda',
      ownership_type: 'private',
      bias_score: 40,
      trust_score: 82,
      fact_check_score: 85,
      transparency_score: 78,
      reliability_score: 83,
      last_monitored_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
  ];

  const calculateMetrics = (sources: MediaSource[]): TrustMetrics => {
    const total = sources.length;
    const avgTrust = total > 0 ? sources.reduce((sum, s) => sum + s.trust_score, 0) / total : 0;
    const highTrust = sources.filter(s => s.trust_score >= 80).length;
    const lowTrust = sources.filter(s => s.trust_score < 50).length;
    const flagged = sources.filter(s => s.bias_score > 70 || s.trust_score < 40).length;

    return {
      total_sources: total,
      avg_trust_score: Math.round(avgTrust),
      high_trust_count: highTrust,
      low_trust_count: lowTrust,
      flagged_count: flagged
    };
  };

  const getTrustBadge = (score: number) => {
    if (score >= 80) return { label: 'High Trust', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    if (score >= 60) return { label: 'Moderate Trust', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
    return { label: 'Low Trust', color: 'bg-red-100 text-red-800', icon: XCircle };
  };

  const getBiasLevel = (score: number) => {
    if (score <= 30) return { label: 'Minimal Bias', color: 'text-green-600' };
    if (score <= 50) return { label: 'Some Bias', color: 'text-yellow-600' };
    if (score <= 70) return { label: 'Notable Bias', color: 'text-orange-600' };
    return { label: 'High Bias', color: 'text-red-600' };
  };

  const sourceTypes = [...new Set(mediaSources.map(s => s.source_type))];

  const filteredSources = mediaSources.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         source.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || source.source_type === typeFilter;
    const matchesTrust = trustFilter === 'all' || 
      (trustFilter === 'high' && source.trust_score >= 80) ||
      (trustFilter === 'moderate' && source.trust_score >= 60 && source.trust_score < 80) ||
      (trustFilter === 'low' && source.trust_score < 60);
    
    return matchesSearch && matchesType && matchesTrust;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading trust ratings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold">Media Trust Ratings</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Independent analysis of media reliability, bias, and trustworthiness in Cameroon
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total_sources}</div>
              <p className="text-xs text-muted-foreground">Media outlets monitored</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Trust Score</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avg_trust_score}%</div>
              <p className="text-xs text-muted-foreground">Overall trust rating</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Trust</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.high_trust_count}</div>
              <p className="text-xs text-muted-foreground">Sources above 80%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Trust</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.low_trust_count}</div>
              <p className="text-xs text-muted-foreground">Sources below 50%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flagged</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{metrics.flagged_count}</div>
              <p className="text-xs text-muted-foreground">Requiring attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search media sources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {sourceTypes.map(type => (
                    <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={trustFilter} onValueChange={setTrustFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by trust" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trust Levels</SelectItem>
                  <SelectItem value="high">High Trust (80%+)</SelectItem>
                  <SelectItem value="moderate">Moderate Trust (60-79%)</SelectItem>
                  <SelectItem value="low">Low Trust (&lt;60%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Media Sources List */}
        <div className="space-y-6">
          {filteredSources.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Media Sources Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || typeFilter !== 'all' || trustFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'No media sources available yet'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredSources.map((source) => {
              const trustBadge = getTrustBadge(source.trust_score);
              const biasLevel = getBiasLevel(source.bias_score);
              const TrustIcon = trustBadge.icon;

              return (
                <Card key={source.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold">{source.name}</h3>
                          <Badge variant="outline" className="capitalize">{source.source_type}</Badge>
                          <Badge className={trustBadge.color}>
                            <TrustIcon className="h-3 w-3 mr-1" />
                            {trustBadge.label}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-2">{source.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          {source.founded_year && (
                            <span>Founded: {source.founded_year}</span>
                          )}
                          {source.headquarters && (
                            <span>HQ: {source.headquarters}</span>
                          )}
                          <span className="capitalize">Ownership: {source.ownership_type}</span>
                          {source.website_url && (
                            <a 
                              href={source.website_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Website
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 lg:mt-0 lg:ml-6">
                        <div className="text-right mb-2">
                          <div className="text-2xl font-bold text-primary">{source.trust_score}%</div>
                          <div className="text-sm text-muted-foreground">Trust Score</div>
                        </div>
                        <div className={`text-sm font-medium ${biasLevel.color}`}>
                          {biasLevel.label}
                        </div>
                      </div>
                    </div>

                    {/* Detailed Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Fact Check</span>
                          <span className="text-sm">{source.fact_check_score}%</span>
                        </div>
                        <Progress value={source.fact_check_score} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Transparency</span>
                          <span className="text-sm">{source.transparency_score}%</span>
                        </div>
                        <Progress value={source.transparency_score} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Reliability</span>
                          <span className="text-sm">{source.reliability_score}%</span>
                        </div>
                        <Progress value={source.reliability_score} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Bias Level</span>
                          <span className="text-sm">{source.bias_score}%</span>
                        </div>
                        <Progress value={source.bias_score} className="h-2" />
                      </div>
                    </div>

                    {source.last_monitored_at && (
                      <div className="mt-4 text-xs text-muted-foreground">
                        Last updated: {new Date(source.last_monitored_at).toLocaleString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Methodology */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Trust Rating Methodology</CardTitle>
            <CardDescription>How we calculate media trust and bias scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Trust Score Components:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <strong>Fact-checking accuracy:</strong> Verification of published information</li>
                  <li>• <strong>Source transparency:</strong> Disclosure of funding and ownership</li>
                  <li>• <strong>Editorial independence:</strong> Freedom from external pressure</li>
                  <li>• <strong>Correction practices:</strong> How errors are handled and corrected</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Bias Assessment:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <strong>Content analysis:</strong> Language and framing patterns</li>
                  <li>• <strong>Source diversity:</strong> Range of perspectives presented</li>
                  <li>• <strong>Political leaning:</strong> Systematic political preferences</li>
                  <li>• <strong>Balanced reporting:</strong> Fair representation of different views</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}