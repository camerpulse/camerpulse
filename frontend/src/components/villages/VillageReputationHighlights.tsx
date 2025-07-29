import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Shield, 
  AlertTriangle, 
  Award, 
  MapPin,
  Star,
  Users,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface VillageHighlight {
  id: string;
  village_name: string;
  slug: string;
  region: string;
  overall_reputation_score: number;
  reputation_badge: string;
  votes_this_month: number;
  transparency_score: number;
  corruption_reports_count: number;
}

export function VillageReputationHighlights() {
  const [mostRated, setMostRated] = useState<VillageHighlight[]>([]);
  const [mostTransparent, setMostTransparent] = useState<VillageHighlight[]>([]);
  const [mostReported, setMostReported] = useState<VillageHighlight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHighlights();
  }, []);

  const loadHighlights = async () => {
    try {
      // Get current month for vote counting
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';

      // Most rated villages this month
      const { data: ratedData } = await supabase
        .from('villages')
        .select(`
          id,
          village_name,
          slug,
          region,
          village_transparency_metrics(
            overall_reputation_score,
            reputation_badge,
            transparency_score,
            corruption_reports_count
          ),
          village_monthly_votes!inner(vote_month)
        `)
        .eq('village_monthly_votes.vote_month', currentMonth)
        .order('village_monthly_votes(count)', { ascending: false })
        .limit(5);

      // Most transparent villages
      const { data: transparentData } = await supabase
        .from('villages')
        .select(`
          id,
          village_name,
          slug,
          region,
          village_transparency_metrics!inner(
            overall_reputation_score,
            reputation_badge,
            transparency_score,
            corruption_reports_count
          )
        `)
        .gte('village_transparency_metrics.transparency_score', 70)
        .order('village_transparency_metrics.transparency_score', { ascending: false })
        .limit(5);

      // Most reported villages (problematic ones)
      const { data: reportedData } = await supabase
        .from('villages')
        .select(`
          id,
          village_name,
          slug,
          region,
          village_transparency_metrics!inner(
            overall_reputation_score,
            reputation_badge,
            transparency_score,
            corruption_reports_count
          )
        `)
        .gt('village_transparency_metrics.corruption_reports_count', 0)
        .order('village_transparency_metrics.corruption_reports_count', { ascending: false })
        .limit(5);

      // Process the data
      const processVillageData = (data: any[], votesThisMonth = 0) => {
        return data?.map(village => ({
          id: village.id,
          village_name: village.village_name,
          slug: village.slug,
          region: village.region,
          overall_reputation_score: village.village_transparency_metrics?.overall_reputation_score || 0,
          reputation_badge: village.village_transparency_metrics?.reputation_badge || 'under_assessment',
          transparency_score: village.village_transparency_metrics?.transparency_score || 0,
          corruption_reports_count: village.village_transparency_metrics?.corruption_reports_count || 0,
          votes_this_month: votesThisMonth
        })) || [];
      };

      setMostRated(processVillageData(ratedData));
      setMostTransparent(processVillageData(transparentData));
      setMostReported(processVillageData(reportedData));
    } catch (error) {
      console.error('Error loading village highlights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'excellent': return 'bg-green-500 text-white';
      case 'good': return 'bg-blue-500 text-white';
      case 'average': return 'bg-yellow-500 text-white';
      case 'poor': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-16 bg-muted rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Village Transparency Highlights</h2>
        <p className="text-muted-foreground">
          Discover the most active, transparent, and engaged villages in Cameroon
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Most Rated Villages This Month */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <TrendingUp className="h-5 w-5" />
              Most Active This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mostRated.length > 0 ? (
                mostRated.map((village, index) => (
                  <Link 
                    key={village.id} 
                    to={`/village/${village.slug}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{village.village_name}</h4>
                          <p className="text-xs text-muted-foreground">{village.region}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${getScoreColor(village.overall_reputation_score)}`}>
                          {village.overall_reputation_score.toFixed(0)}%
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {village.votes_this_month}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No villages voted on this month yet
                </p>
              )}
            </div>
            <Link to="/villages">
              <Button variant="outline" size="sm" className="w-full mt-4">
                <BarChart3 className="h-4 w-4 mr-2" />
                View All Villages
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Most Transparent Villages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Shield className="h-5 w-5" />
              Most Transparent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mostTransparent.length > 0 ? (
                mostTransparent.map((village, index) => (
                  <Link 
                    key={village.id} 
                    to={`/village/${village.slug}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{village.village_name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className={getBadgeColor(village.reputation_badge)}>
                              {village.reputation_badge.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-600">
                          {village.transparency_score.toFixed(0)}%
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Award className="h-3 w-3" />
                          Clean
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No transparency data available yet
                </p>
              )}
            </div>
            <Link to="/villages?filter=transparent">
              <Button variant="outline" size="sm" className="w-full mt-4">
                <Shield className="h-4 w-4 mr-2" />
                View Transparent Villages
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Most Reported Villages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mostReported.length > 0 ? (
                mostReported.map((village, index) => (
                  <Link 
                    key={village.id} 
                    to={`/village/${village.slug}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{village.village_name}</h4>
                          <p className="text-xs text-muted-foreground">{village.region}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-red-600">
                          {village.corruption_reports_count} reports
                        </div>
                        <div className={`text-xs ${getScoreColor(village.overall_reputation_score)}`}>
                          {village.overall_reputation_score.toFixed(0)}% score
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No corruption reports yet
                </p>
              )}
            </div>
            <Link to="/villages?filter=reported">
              <Button variant="outline" size="sm" className="w-full mt-4">
                <AlertTriangle className="h-4 w-4 mr-2" />
                View All Reports
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="text-center py-8">
          <h3 className="text-xl font-bold mb-2">Help Build Village Transparency</h3>
          <p className="text-muted-foreground mb-4">
            Your voice matters. Rate your village's development and report issues to help improve governance.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/villages">
              <Button>
                <MapPin className="h-4 w-4 mr-2" />
                Find Your Village
              </Button>
            </Link>
            <Link to="/civic/report">
              <Button variant="outline">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report an Issue
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}