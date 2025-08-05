import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Vote, Calendar, BarChart3, Users } from 'lucide-react';

interface ElectionManagerProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const ElectionManager: React.FC<ElectionManagerProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const { data: forecasts, isLoading } = useQuery({
    queryKey: ['admin-election-forecasts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('election_forecasts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    }
  });

  const handleGenerateForecasts = async () => {
    const { data, error } = await supabase.rpc('generate_election_forecast');
    if (!error) {
      logActivity('election_forecasts_generated', { forecasts_created: data });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center">
          <Vote className="h-6 w-6 mr-2 text-purple-600" />
          Election Management
        </h2>
        <p className="text-muted-foreground">Monitor election forecasts and voting trends</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Vote className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{forecasts?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Active Forecasts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">10</p>
                <p className="text-sm text-muted-foreground">Regions Covered</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-muted-foreground">Major Parties</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                  {forecasts?.length ? Math.round(forecasts[0]?.predicted_vote_percentage || 0) : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Leading Prediction</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Forecast Management</CardTitle>
            <CardDescription>Generate and manage election forecasts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={handleGenerateForecasts} className="w-full">
                Generate New Forecasts
              </Button>
              
              {isLoading ? (
                <div className="text-center py-8">Loading forecasts...</div>
              ) : forecasts?.length ? (
                <div className="space-y-3">
                  {forecasts.slice(0, 5).map((forecast) => (
                    <div key={forecast.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{forecast.party_name}</h4>
                        <p className="text-sm text-muted-foreground">{forecast.region}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{Math.round(forecast.predicted_vote_percentage)}%</p>
                        <p className="text-xs text-muted-foreground">
                          ±{Math.round(forecast.confidence_interval_upper - forecast.predicted_vote_percentage)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No forecasts available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Election Settings</CardTitle>
            <CardDescription>Configure election parameters and rules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Forecast Parameters</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Sample Size:</span>
                    <span>500-1500 voters</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Confidence Interval:</span>
                    <span>±8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Update Frequency:</span>
                    <span>Weekly</span>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                Configure Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};