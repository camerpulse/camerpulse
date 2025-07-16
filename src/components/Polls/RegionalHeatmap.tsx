import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, BarChart3, TrendingUp } from 'lucide-react';

interface RegionalVoteData {
  poll_id: string;
  region: string;
  option_index: number;
  vote_count: number;
  percentage: number;
}

interface RegionalHeatmapProps {
  pollId: string;
  pollOptions: string[];
  isVisible?: boolean;
}

const CAMEROON_REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
  'North', 'Northwest', 'Southwest', 'South', 'West'
];

export const RegionalHeatmap: React.FC<RegionalHeatmapProps> = ({ 
  pollId, 
  pollOptions, 
  isVisible = true 
}) => {
  const [regionalData, setRegionalData] = useState<RegionalVoteData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isVisible) {
      fetchRegionalData();
      setupRealtimeSubscription();
    }
  }, [pollId, isVisible]);

  const fetchRegionalData = async () => {
    try {
      const { data, error } = await supabase
        .from('poll_regional_results')
        .select('*')
        .eq('poll_id', pollId);

      if (error) throw error;
      setRegionalData(data || []);
    } catch (error) {
      console.error('Error fetching regional data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('regional-poll-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'poll_votes',
          filter: `poll_id=eq.${pollId}`
        },
        () => {
          fetchRegionalData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getRegionData = (region: string) => {
    const regionVotes = regionalData.filter(data => data.region === region);
    const totalVotes = regionVotes.reduce((sum, vote) => sum + vote.vote_count, 0);
    const leadingOption = regionVotes.reduce((leading, current) => 
      current.vote_count > (leading?.vote_count || 0) ? current : leading, 
      null as RegionalVoteData | null
    );

    return {
      totalVotes,
      leadingOption,
      votes: regionVotes
    };
  };

  const getColorIntensity = (percentage: number) => {
    if (percentage >= 70) return 'bg-cm-green/90 text-white';
    if (percentage >= 60) return 'bg-cm-green/70 text-white';
    if (percentage >= 50) return 'bg-cm-green/50 text-white';
    if (percentage >= 40) return 'bg-cm-yellow/70 text-gray-900';
    if (percentage >= 30) return 'bg-cm-yellow/50 text-gray-900';
    return 'bg-muted text-muted-foreground';
  };

  const getOverallStats = () => {
    const totalRegionalVotes = regionalData.reduce((sum, vote) => sum + vote.vote_count, 0);
    const regionsWithData = [...new Set(regionalData.map(data => data.region))].length;
    
    return {
      totalRegionalVotes,
      regionsWithData,
      totalRegions: CAMEROON_REGIONS.length
    };
  };

  if (!isVisible) return null;

  const stats = getOverallStats();

  return (
    <Card className="border-0 shadow-elegant">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Regional Vote Distribution
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              {stats.regionsWithData}/{stats.totalRegions} regions
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {stats.totalRegionalVotes} regional votes
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {CAMEROON_REGIONS.map((region) => (
              <div key={region} className="p-4 bg-muted rounded-lg animate-pulse">
                <div className="h-4 bg-muted-foreground/20 rounded mb-2"></div>
                <div className="h-3 bg-muted-foreground/20 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Heatmap Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
              {CAMEROON_REGIONS.map((region) => {
                const regionData = getRegionData(region);
                const leadingPercentage = regionData.leadingOption?.percentage || 0;
                const leadingOptionText = regionData.leadingOption 
                  ? pollOptions[regionData.leadingOption.option_index] 
                  : 'No votes';

                return (
                  <div
                    key={region}
                    className={`p-4 rounded-lg border transition-all duration-300 hover:scale-105 ${
                      regionData.totalVotes > 0 
                        ? getColorIntensity(leadingPercentage)
                        : 'bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <div className="font-semibold text-sm mb-1">{region}</div>
                    <div className="text-xs opacity-90">
                      {regionData.totalVotes > 0 ? (
                        <>
                          <div className="font-medium">{leadingOptionText}</div>
                          <div>{leadingPercentage.toFixed(1)}% • {regionData.totalVotes} votes</div>
                        </>
                      ) : (
                        'No data'
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detailed Breakdown */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Detailed Regional Breakdown
              </h4>
              
              <div className="grid gap-4 md:grid-cols-2">
                {CAMEROON_REGIONS.filter(region => getRegionData(region).totalVotes > 0)
                  .map((region) => {
                    const regionData = getRegionData(region);
                    
                    return (
                      <div key={region} className="p-4 bg-background border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold">{region}</h5>
                          <Badge variant="outline">
                            {regionData.totalVotes} votes
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          {regionData.votes
                            .sort((a, b) => b.vote_count - a.vote_count)
                            .map((vote) => (
                              <div key={vote.option_index} className="flex items-center justify-between">
                                <span className="text-sm">{pollOptions[vote.option_index]}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-muted rounded-full h-2">
                                    <div 
                                      className="h-full bg-primary rounded-full transition-all duration-300"
                                      style={{ width: `${vote.percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground w-12 text-right">
                                    {vote.percentage.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {stats.regionsWithData === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No regional voting data available yet.</p>
                  <p className="text-sm">Regional data will appear as people vote.</p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};