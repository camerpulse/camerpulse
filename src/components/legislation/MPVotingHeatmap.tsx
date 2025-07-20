import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const MPVotingHeatmap = () => {
  const { data: mpStats } = useQuery({
    queryKey: ['mp-legislative-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mp_legislative_stats')
        .select('*')
        .order('attendance_rate', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          MP Legislative Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mpStats?.map((mp) => (
            <Card key={mp.id} className="p-4">
              <div className="space-y-2">
                <h4 className="font-medium line-clamp-1">{mp.mp_name}</h4>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Attendance:</span>
                    <Badge variant={
                      mp.attendance_rate >= 80 ? 'default' :
                      mp.attendance_rate >= 60 ? 'outline' : 'destructive'
                    }>
                      {mp.attendance_rate.toFixed(1)}%
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Total Votes:</span>
                    <span>{mp.total_votes_cast}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Bills Authored:</span>
                    <span>{mp.bills_authored}</span>
                  </div>
                </div>
                
                {/* Voting pattern visualization */}
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Voting Pattern</div>
                  <div className="flex gap-1 h-2">
                    <div 
                      className="bg-green-500 rounded-sm"
                      style={{ 
                        width: `${(mp.total_votes_yes / mp.total_votes_cast) * 100}%` 
                      }}
                      title={`Yes votes: ${mp.total_votes_yes}`}
                    />
                    <div 
                      className="bg-red-500 rounded-sm"
                      style={{ 
                        width: `${(mp.total_votes_no / mp.total_votes_cast) * 100}%` 
                      }}
                      title={`No votes: ${mp.total_votes_no}`}
                    />
                    <div 
                      className="bg-gray-400 rounded-sm"
                      style={{ 
                        width: `${(mp.total_abstentions / mp.total_votes_cast) * 100}%` 
                      }}
                      title={`Abstentions: ${mp.total_abstentions}`}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{mp.total_votes_yes}Y</span>
                    <span>{mp.total_votes_no}N</span>
                    <span>{mp.total_abstentions}A</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {!mpStats?.length && (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No MP performance data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};