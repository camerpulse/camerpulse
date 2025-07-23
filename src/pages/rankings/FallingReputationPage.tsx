import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ReputationWidget } from '@/components/civic/ReputationWidget';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, AlertTriangle, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FallingLeader {
  id: string;
  entity_name: string;
  total_score: number;
  reputation_badge: 'excellent' | 'trusted' | 'under_watch' | 'flagged';
  last_calculated_at: string;
  entity_type: string;
  transparency_score: number;
  performance_score: number;
  citizen_rating_score: number;
}

export default function FallingReputationPage() {
  const [leaders, setLeaders] = useState<FallingLeader[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFallingLeaders();
  }, []);

  const fetchFallingLeaders = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('civic_reputation_scores')
        .select('*')
        .in('entity_type', ['politician', 'ministry', 'government_agency'])
        .lte('total_score', 60) // Focus on lower scores
        .order('total_score', { ascending: true }) // Lowest first
        .limit(30);

      if (error) throw error;

      setLeaders(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load reputation data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAlertBadge = (score: number) => {
    if (score <= 30) return <Badge variant="destructive">🚨 Critical</Badge>;
    if (score <= 50) return <Badge className="bg-orange-100 text-orange-800">⚠️ Concerning</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-800">📉 Declining</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-destructive">
            <TrendingDown className="h-8 w-8" />
            <h1 className="text-4xl font-bold">Ministers with Falling Reputation</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Leaders requiring attention due to declining reputation scores
          </p>
        </div>

        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-red-800 text-sm">
            These leaders have reputation scores below 60/100, indicating areas for improvement in transparency, performance, or citizen satisfaction.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>📉 Leaders Needing Attention</span>
              <Badge variant="destructive">{leaders.length} Leaders</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading data...</p>
              </div>
            ) : leaders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No leaders found with declining reputation</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leaders.map((leader, index) => (
                  <div key={leader.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingDown className="h-5 w-5 text-red-500" />
                      {getAlertBadge(leader.total_score)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{leader.entity_name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{leader.entity_type}</p>
                    </div>

                    <div className="flex-shrink-0">
                      <ReputationWidget
                        score={leader.total_score}
                        level={leader.total_score <= 30 ? 'critical' : leader.total_score <= 50 ? 'poor' : 'average'}
                        trend="falling"
                        entityName={leader.entity_name}
                        entityType={leader.entity_type}
                        compact={true}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}