import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  User,
  Building2,
  Home,
  RefreshCw,
  Bell
} from 'lucide-react';

interface ScoreChange {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  old_score: number;
  new_score: number;
  change_reason: string;
  calculation_details: any;
  created_at: string;
  score_difference: number;
}

export function RecentScoreChanges() {
  const [scoreChanges, setScoreChanges] = useState<ScoreChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecentChanges();
    
    if (isLive) {
      // Set up real-time subscription for score changes
      const channel = supabase
        .channel('civic-reputation-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'civic_reputation_history'
          },
          (payload) => {
            handleRealtimeChange(payload.new);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'civic_reputation_scores'
          },
          (payload) => {
            handleRealtimeScoreUpdate(payload.new, payload.old);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isLive]);

  const fetchRecentChanges = async () => {
    try {
      setLoading(true);
      
      // Mock data for recent reputation history until database is ready
      const mockData: ScoreChange[] = [
        {
          id: '1',
          entity_type: 'politician',
          entity_id: 'pol-1',
          entity_name: 'Hon. John Tamfu',
          old_score: 75,
          new_score: 82,
          change_reason: 'Successful bill passage',
          calculation_details: { bill_id: 'bill-123', impact: 7 },
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          score_difference: 7
        },
        {
          id: '2',
          entity_type: 'village',
          entity_id: 'vil-1',
          entity_name: 'Bamunka',
          old_score: 68,
          new_score: 64,
          change_reason: 'Infrastructure project delay',
          calculation_details: { project_id: 'proj-456', delay_days: 45 },
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          score_difference: -4
        },
        {
          id: '3',
          entity_type: 'ministry',
          entity_id: 'min-1',
          entity_name: 'Ministry of Health',
          old_score: 72,
          new_score: 78,
          change_reason: 'Improved healthcare delivery',
          calculation_details: { hospital_count: 3, patient_satisfaction: 0.85 },
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
          score_difference: 6
        }
      ];

      setScoreChanges(mockData);
    } catch (error) {
      console.error('Error fetching recent changes:', error);
      toast({
        title: "Error",
        description: "Failed to load recent score changes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRealtimeChange = (newChange: any) => {
    const processedChange = {
      ...newChange,
      score_difference: newChange.new_score - newChange.old_score
    };

    setScoreChanges(prev => [processedChange, ...prev.slice(0, 19)]);
    
    // Show notification for significant changes
    if (Math.abs(processedChange.score_difference) >= 10) {
      toast({
        title: "Significant Score Change",
        description: `${processedChange.entity_name} score ${processedChange.score_difference > 0 ? 'increased' : 'decreased'} by ${Math.abs(processedChange.score_difference)} points`,
        duration: 5000
      });
    }
  };

  const handleRealtimeScoreUpdate = (newData: any, oldData: any) => {
    if (newData.total_score !== oldData.total_score) {
      // Create a synthetic history entry for real-time display
      const syntheticChange = {
        id: `synthetic-${Date.now()}`,
        entity_type: newData.entity_type,
        entity_id: newData.entity_id,
        entity_name: newData.entity_name,
        old_score: oldData.total_score,
        new_score: newData.total_score,
        change_reason: 'Real-time update',
        calculation_details: {},
        created_at: new Date().toISOString(),
        score_difference: newData.total_score - oldData.total_score
      };

      handleRealtimeChange(syntheticChange);
    }
  };

  const getChangeIcon = (difference: number) => {
    if (difference > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (difference < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <Clock className="h-4 w-4 text-gray-400" />;
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case 'politician':
      case 'senator':
      case 'minister':
        return <User className="h-4 w-4" />;
      case 'ministry':
      case 'government_agency':
        return <Building2 className="h-4 w-4" />;
      case 'village':
        return <Home className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getChangeDescription = (change: ScoreChange) => {
    const direction = change.score_difference > 0 ? 'increased' : 'decreased';
    const points = Math.abs(change.score_difference);
    
    let reason = '';
    if (change.change_reason) {
      reason = ` due to ${change.change_reason.toLowerCase()}`;
    }

    return `score ${direction} to ${change.new_score} (${change.score_difference > 0 ? '+' : ''}${change.score_difference} points)${reason}`;
  };

  const getTimeSince = (timestamp: string) => {
    const now = new Date();
    const changeTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - changeTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Score Changes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Score Changes
            {isLive && (
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                Live
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLive(!isLive)}
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              {isLive ? 'Disable Live' : 'Enable Live'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRecentChanges}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {scoreChanges.map((change) => (
            <div key={change.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2 mt-1">
                {getChangeIcon(change.score_difference)}
                {getEntityIcon(change.entity_type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium truncate">{change.entity_name}</span>
                  <Badge variant="outline" className="text-xs">
                    {change.entity_type}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {getChangeDescription(change)}
                </p>
                
                {change.calculation_details && Object.keys(change.calculation_details).length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Details: {JSON.stringify(change.calculation_details).slice(0, 100)}...
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <span className={`text-sm font-medium ${
                  change.score_difference > 0 ? 'text-green-600' : 
                  change.score_difference < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {change.score_difference > 0 ? '+' : ''}{change.score_difference}
                </span>
                <span className="text-xs text-muted-foreground">
                  {getTimeSince(change.created_at)}
                </span>
              </div>
            </div>
          ))}
          
          {scoreChanges.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No recent score changes</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}