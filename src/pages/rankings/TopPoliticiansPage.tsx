import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ReputationWidget } from '@/components/civic/ReputationWidget';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, TrendingUp, Users, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PoliticianRanking {
  id: string;
  entity_name: string;
  total_score: number;
  reputation_badge: 'excellent' | 'trusted' | 'under_watch' | 'flagged';
  last_calculated_at: string;
  entity_type: 'politician' | 'ministry' | 'government_agency' | 'political_party' | 'civil_society_org' | 'media_outlet' | 'election_event' | 'policy_document' | 'government_statement';
  transparency_score: number;
  performance_score: number;
  citizen_rating_score: number;
}

export default function TopPoliticiansPage() {
  const [rankings, setRankings] = useState<PoliticianRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week');
  const [entityType, setEntityType] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchTopPoliticians();
  }, [timeframe, entityType]);

  const fetchTopPoliticians = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('civic_reputation_scores')
        .select('*')
        .in('entity_type', ['politician', 'ministry', 'government_agency'])
        .order('total_score', { ascending: false })
        .limit(50);

      // Filter by entity type if not 'all'
      if (entityType !== 'all') {
        query = query.eq('entity_type', entityType as any);
      }

      // Filter by timeframe
      const now = new Date();
      let timeframeCutoff: Date;
      
      switch (timeframe) {
        case 'week':
          timeframeCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          timeframeCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          timeframeCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          timeframeCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      query = query.gte('last_calculated_at', timeframeCutoff.toISOString());

      const { data, error } = await query;

      if (error) throw error;

      setRankings(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load politician rankings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTimeframeLabel = () => {
    switch (timeframe) {
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'quarter': return 'This Quarter';
      default: return 'This Week';
    }
  };

  const getTrendIcon = (position: number) => {
    if (position <= 3) return <Award className="h-4 w-4 text-amber-500" />;
    if (position <= 10) return <TrendingUp className="h-4 w-4 text-green-500" />;
    return <Users className="h-4 w-4 text-blue-500" />;
  };

  const getPositionBadge = (position: number) => {
    if (position === 1) return <Badge className="bg-amber-100 text-amber-800 border-amber-200">🥇 #1</Badge>;
    if (position === 2) return <Badge className="bg-gray-100 text-gray-800 border-gray-200">🥈 #2</Badge>;
    if (position === 3) return <Badge className="bg-orange-100 text-orange-800 border-orange-200">🥉 #3</Badge>;
    return <Badge variant="outline">#{position}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Award className="h-8 w-8" />
            <h1 className="text-4xl font-bold">Top Rated Politicians</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the highest-rated political leaders based on their civic reputation scores
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Ranking Filters
            </CardTitle>
            <CardDescription>
              Customize the ranking view by timeframe and position type
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Timeframe</label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Position Type</label>
              <Select value={entityType} onValueChange={setEntityType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  <SelectItem value="politician">Politicians</SelectItem>
                  <SelectItem value="ministry">Ministries</SelectItem>
                  <SelectItem value="government_agency">Agencies</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={fetchTopPoliticians} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh Rankings'}
            </Button>
          </CardContent>
        </Card>

        {/* Rankings Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🏆 Top Politicians - {getTimeframeLabel()}</span>
              <Badge variant="secondary">{rankings.length} Leaders</Badge>
            </CardTitle>
            <CardDescription>
              Rankings based on verified performance data, citizen feedback, and transparency scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading rankings...</p>
              </div>
            ) : rankings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No politicians found for the selected criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rankings.map((politician, index) => (
                  <div key={politician.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {getTrendIcon(index + 1)}
                      {getPositionBadge(index + 1)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{politician.entity_name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{politician.entity_type}</p>
                      <p className="text-xs text-muted-foreground">
                        Last updated: {new Date(politician.last_calculated_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex-shrink-0">
                      <ReputationWidget
                        score={politician.total_score}
                        level={politician.reputation_badge === 'excellent' ? 'excellent' : 
                               politician.reputation_badge === 'trusted' ? 'good' :
                               politician.reputation_badge === 'under_watch' ? 'average' : 'poor'}
                        trend="stable"
                        entityName={politician.entity_name}
                        entityType={politician.entity_type}
                        compact={true}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Insights */}
        {rankings.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Highest Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {Math.max(...rankings.map(r => r.total_score))}/100
                </div>
                <p className="text-sm text-muted-foreground">Best performer</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(rankings.reduce((sum, r) => sum + r.total_score, 0) / rankings.length)}/100
                </div>
                <p className="text-sm text-muted-foreground">Overall average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {rankings.filter(r => r.reputation_badge === 'excellent').length}
                </div>
                <p className="text-sm text-muted-foreground">Excellent ratings</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}