import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, TrendingUp, Users, Building, MapPin, Clock } from 'lucide-react';
import { useHiringLeaderboard, useTopSponsors } from '@/hooks/useHiring';
import { CamerJobsLayout } from '@/components/Layout/CamerJobsLayout';

const RegionalHiringLeaderboard = () => {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('week');
  const [sponsorTimeframe, setSponsorTimeframe] = useState<'week' | 'month' | 'quarter'>('month');
  
  const { data: leaderboard, isLoading: leaderboardLoading } = useHiringLeaderboard(timeframe);
  const { data: topSponsors, isLoading: sponsorsLoading } = useTopSponsors(sponsorTimeframe);

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return null;
    }
  };

  const getTimeframeLabel = (timeframe: string) => {
    switch (timeframe) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'quarter': return 'This Quarter';
      default: return timeframe;
    }
  };

  return (
    <CamerJobsLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4 flex items-center justify-center gap-2">
            <MapPin className="h-8 w-8" />
            📍 Regional Hiring Leaderboard (Live)
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time hiring activity across Cameroon's regions. Updated every 2 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Regional Leaderboard */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Regional Hiring Leaders
                </CardTitle>
                <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Live updates every 2 minutes
              </p>
            </CardHeader>
            <CardContent>
              {leaderboardLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full"></div>
                        <div className="space-y-1">
                          <div className="w-24 h-4 bg-muted rounded"></div>
                          <div className="w-16 h-3 bg-muted rounded"></div>
                        </div>
                      </div>
                      <div className="w-12 h-6 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard?.map((region, index) => (
                    <div
                      key={region.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-muted/50 ${
                        index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-background'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-sm font-bold">
                          {getMedalIcon(index + 1) || index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{region.region}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {region.active_employers} employers
                            </span>
                            {region.top_sectors.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                Top: {region.top_sectors[0]?.sector || 'N/A'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{region.total_hires}</p>
                        <p className="text-xs text-muted-foreground">hires {getTimeframeLabel(timeframe).toLowerCase()}</p>
                      </div>
                    </div>
                  ))}
                  
                  {!leaderboard?.length && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hiring data available for {getTimeframeLabel(timeframe).toLowerCase()}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Impact Sponsors */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Top Impact Investors
                </CardTitle>
                <Select value={sponsorTimeframe} onValueChange={(value: any) => setSponsorTimeframe(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                Organizations making the biggest hiring impact
              </p>
            </CardHeader>
            <CardContent>
              {sponsorsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-lg"></div>
                        <div className="space-y-1">
                          <div className="w-32 h-4 bg-muted rounded"></div>
                          <div className="w-20 h-3 bg-muted rounded"></div>
                        </div>
                      </div>
                      <div className="w-12 h-6 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {topSponsors?.map((sponsor, index) => (
                    <div
                      key={sponsor.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-muted/50 ${
                        index < 3 ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' : 'bg-background'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-sm font-bold text-green-700">
                          {getMedalIcon(index + 1) || index + 1}
                        </div>
                        <div className="flex items-center gap-3">
                          {sponsor.logo_url && (
                            <img 
                              src={sponsor.logo_url} 
                              alt={sponsor.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <p className="font-semibold">{sponsor.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {sponsor.sponsor_type.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">{sponsor.hires}</p>
                        <p className="text-xs text-muted-foreground">sponsored hires</p>
                      </div>
                    </div>
                  ))}
                  
                  {!topSponsors?.length && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No sponsor data available for {getTimeframeLabel(sponsorTimeframe).toLowerCase()}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {leaderboard?.reduce((sum, region) => sum + region.total_hires, 0) || 0}
              </div>
              <p className="text-sm text-muted-foreground">Total Hires {getTimeframeLabel(timeframe)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {leaderboard?.reduce((sum, region) => sum + region.active_employers, 0) || 0}
              </div>
              <p className="text-sm text-muted-foreground">Active Employers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {leaderboard?.length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Regions Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {topSponsors?.length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Impact Sponsors</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-4">Join the Movement</h3>
              <p className="text-muted-foreground mb-6">
                Be part of Cameroon's employment revolution. Find jobs, hire talent, or sponsor hiring campaigns.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/jobs/board">Find Jobs</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/jobs/company">Post Jobs</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CamerJobsLayout>
  );
};

export default RegionalHiringLeaderboard;