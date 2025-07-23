import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ReputationWidget } from '@/components/civic/ReputationWidget';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Shield, Users, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MayorRanking {
  id: string;
  entity_name: string;
  total_score: number;
  reputation_badge: 'excellent' | 'trusted' | 'under_watch' | 'flagged';
  last_calculated_at: string;
  entity_type: string;
  transparency_score: number;
  performance_score: number;
  citizen_rating_score: number;
  region: string | null;
}

const CAMEROON_REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 
  'Littoral', 'North', 'Northwest', 'South', 
  'Southwest', 'West'
];

export default function TrustedMayorsPage() {
  const [mayors, setMayors] = useState<MayorRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('Northwest');
  const { toast } = useToast();

  useEffect(() => {
    fetchTrustedMayors();
  }, [selectedRegion]);

  const fetchTrustedMayors = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('civic_reputation_scores')
        .select('*')
        .in('entity_type', ['politician', 'government_agency'])
        .gte('total_score', 70) // Only trusted leaders (70+)
        .order('total_score', { ascending: false })
        .limit(30);

      // Filter by region if selected
      if (selectedRegion !== 'all') {
        query = query.eq('region', selectedRegion);
      }

      // Filter for recent data (last 3 months)
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      query = query.gte('last_calculated_at', threeMonthsAgo.toISOString());

      const { data, error } = await query;

      if (error) throw error;

      setMayors(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load trusted mayors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTrustBadge = (score: number, badge: string) => {
    if (score >= 90) return <Badge className="bg-green-100 text-green-800 border-green-200">🛡️ Highly Trusted</Badge>;
    if (score >= 80) return <Badge className="bg-blue-100 text-blue-800 border-blue-200">✅ Trusted</Badge>;
    if (score >= 70) return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">⭐ Reliable</Badge>;
    return <Badge variant="outline">🔍 Under Review</Badge>;
  };

  const getPositionIcon = (position: number) => {
    if (position <= 3) return <Award className="h-5 w-5 text-amber-500" />;
    if (position <= 10) return <Shield className="h-5 w-5 text-blue-500" />;
    return <Users className="h-5 w-5 text-green-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Shield className="h-8 w-8" />
            <h1 className="text-4xl font-bold">Most Trusted Mayors</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the most trusted local leaders in {selectedRegion === 'all' ? 'Cameroon' : selectedRegion} Region
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Regional Filter
            </CardTitle>
            <CardDescription>
              Select a region to view the most trusted mayors and local leaders
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Region</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {CAMEROON_REGIONS.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={fetchTrustedMayors} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh Rankings'}
            </Button>
          </CardContent>
        </Card>

        {/* Trust Criteria Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Trust Criteria</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm">Score ≥ 70/100</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span className="text-sm">High Transparency</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">Strong Citizen Rating</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mayors Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🏆 Most Trusted Leaders - {selectedRegion === 'all' ? 'All Regions' : selectedRegion}</span>
              <Badge variant="secondary">{mayors.length} Trusted Leaders</Badge>
            </CardTitle>
            <CardDescription>
              Leaders with reputation scores of 70+ based on transparency, performance, and citizen feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading trusted mayors...</p>
              </div>
            ) : mayors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No trusted mayors found for {selectedRegion === 'all' ? 'any region' : selectedRegion + ' region'}</p>
                <p className="text-sm mt-2">Try selecting a different region or check back later</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mayors.map((mayor, index) => (
                  <div key={mayor.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {getPositionIcon(index + 1)}
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">#{index + 1}</div>
                        {getTrustBadge(mayor.total_score, mayor.reputation_badge)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{mayor.entity_name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="capitalize">{mayor.region || 'Unknown Region'}</span>
                        <span>•</span>
                        <span className="capitalize">{mayor.entity_type}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Last verified: {new Date(mayor.last_calculated_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="text-sm text-muted-foreground">Trust Breakdown:</div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-medium">{Math.round(mayor.transparency_score)}</div>
                          <div className="text-muted-foreground">Transparency</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{Math.round(mayor.performance_score)}</div>
                          <div className="text-muted-foreground">Performance</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{Math.round(mayor.citizen_rating_score)}</div>
                          <div className="text-muted-foreground">Citizen Rating</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <ReputationWidget
                        score={mayor.total_score}
                        level={mayor.reputation_badge === 'excellent' ? 'excellent' : 
                               mayor.reputation_badge === 'trusted' ? 'good' :
                               mayor.reputation_badge === 'under_watch' ? 'average' : 'poor'}
                        trend="stable"
                        entityName={mayor.entity_name}
                        entityType={mayor.entity_type}
                        compact={true}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Regional Insights */}
        {mayors.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Highest Trust Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {Math.max(...mayors.map(r => r.total_score))}/100
                </div>
                <p className="text-sm text-muted-foreground">Most trusted leader</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Average Trust</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(mayors.reduce((sum, r) => sum + r.total_score, 0) / mayors.length)}/100
                </div>
                <p className="text-sm text-muted-foreground">Regional average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Highly Trusted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {mayors.filter(r => r.total_score >= 90).length}
                </div>
                <p className="text-sm text-muted-foreground">Score ≥ 90</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}