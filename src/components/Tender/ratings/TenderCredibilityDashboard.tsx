import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CredibilityScoreCard } from './CredibilityScoreCard';
import { RatingStars } from '@/components/camerpulse/RatingStars';
import { Search, Filter, TrendingUp, TrendingDown, Award, AlertTriangle } from 'lucide-react';

export function TenderCredibilityDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('6m');

  // Fetch top-rated issuers
  const { data: topIssuers } = useQuery({
    queryKey: ['top-issuers', selectedRegion, selectedSector, selectedTimeframe],
    queryFn: async () => {
      let query = supabase
        .from('issuer_credibility_scores')
        .select('*')
        .order('credibility_score', { ascending: false })
        .limit(10);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch top-rated bidders
  const { data: topBidders } = useQuery({
    queryKey: ['top-bidders', selectedRegion, selectedSector, selectedTimeframe],
    queryFn: async () => {
      let query = supabase
        .from('bidder_credibility_scores')
        .select('*')
        .order('credibility_score', { ascending: false })
        .limit(10);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch best performing tenders
  const { data: topTenders } = useQuery({
    queryKey: ['top-tenders', selectedRegion, selectedSector, selectedTimeframe],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tender_credibility_aggregates')
        .select(`
          *,
          tenders (
            id,
            title,
            category,
            status,
            issuer_name
          )
        `)
        .gte('total_ratings', 3) // Only tenders with meaningful ratings
        .order('overall_average', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch flagged entities
  const { data: flaggedEntities } = useQuery({
    queryKey: ['flagged-entities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flagged_tender_entities')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['credibility-stats'],
    queryFn: async () => {
      const [issuersResult, biddersResult, tendersResult, flaggedResult] = await Promise.all([
        supabase.from('issuer_credibility_scores').select('credibility_level', { count: 'exact' }),
        supabase.from('bidder_credibility_scores').select('credibility_score', { count: 'exact' }),
        supabase.from('tender_credibility_aggregates').select('credibility_status', { count: 'exact' }),
        supabase.from('flagged_tender_entities').select('id', { count: 'exact' }).eq('status', 'active'),
      ]);

      return {
        totalIssuers: issuersResult.count || 0,
        totalBidders: biddersResult.count || 0,
        totalTenders: tendersResult.count || 0,
        totalFlags: flaggedResult.count || 0,
      };
    },
  });

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: 'default',
      medium: 'secondary',
      high: 'destructive',
      critical: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[severity as keyof typeof variants] || 'outline'}>
        {severity}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tender Credibility Dashboard</h1>
          <p className="text-muted-foreground">
            Transparency and accountability metrics for the tender ecosystem
          </p>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Issuers</p>
                <p className="text-2xl font-bold">{stats?.totalIssuers || 0}</p>
              </div>
              <Award className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Bidders</p>
                <p className="text-2xl font-bold">{stats?.totalBidders || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rated Tenders</p>
                <p className="text-2xl font-bold">{stats?.totalTenders || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Flags</p>
                <p className="text-2xl font-bold text-red-600">{stats?.totalFlags || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search entities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="centre">Centre</SelectItem>
                <SelectItem value="littoral">Littoral</SelectItem>
                <SelectItem value="west">West</SelectItem>
                <SelectItem value="northwest">Northwest</SelectItem>
                <SelectItem value="southwest">Southwest</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                <SelectItem value="infrastructure">Infrastructure</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">Last Month</SelectItem>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="leaderboards" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
          <TabsTrigger value="tenders">Best Tenders</TabsTrigger>
          <TabsTrigger value="flagged">Flagged Entities</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboards" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Issuers */}
            <Card>
              <CardHeader>
                <CardTitle>Top-Rated Issuers</CardTitle>
                <CardDescription>
                  Most credible tender issuers based on performance and transparency
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {topIssuers?.map((issuer, index) => (
                  <div key={issuer.id} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <CredibilityScoreCard
                      score={issuer.credibility_score}
                      level={issuer.credibility_level}
                      entityType="issuer"
                      entityName={issuer.issuer_name}
                      stats={{
                        tenders_posted: issuer.tenders_posted,
                        tenders_awarded: issuer.tenders_awarded,
                        fraud_flags_count: issuer.fraud_flags_count,
                        complaints_count: issuer.complaints_count,
                        average_rating: issuer.average_rating,
                      }}
                      compact={true}
                    />
                  </div>
                ))}
                {(!topIssuers || topIssuers.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">
                    No issuer data available yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Top Bidders */}
            <Card>
              <CardHeader>
                <CardTitle>Top-Rated Bidders</CardTitle>
                <CardDescription>
                  Most credible bidders based on performance and delivery success
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {topBidders?.map((bidder, index) => (
                  <div key={bidder.id} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <CredibilityScoreCard
                      score={bidder.credibility_score}
                      level={bidder.credibility_score >= 90 ? 'high' : bidder.credibility_score >= 70 ? 'moderate' : 'low'}
                      entityType="bidder"
                      entityName={bidder.bidder_name}
                      stats={{
                        bids_submitted: bidder.bids_submitted,
                        bids_won: bidder.bids_won,
                        win_ratio: bidder.win_ratio,
                        complaints_count: bidder.complaints_count,
                        average_rating: bidder.average_rating,
                        badges: bidder.badges || [],
                      }}
                      compact={true}
                    />
                  </div>
                ))}
                {(!topBidders || topBidders.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">
                    No bidder data available yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tenders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Best Performing Tenders</CardTitle>
              <CardDescription>
                Tenders with highest ratings for quality, transparency, and execution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTenders?.map((tender, index) => (
                  <div key={tender.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs">
                            {index + 1}
                          </span>
                          <h3 className="font-semibold">{tender.tenders?.title}</h3>
                          <Badge variant={tender.credibility_status === 'excellent' ? 'default' : 'secondary'}>
                            {tender.credibility_status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Issued by: {tender.tenders?.issuer_name}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <RatingStars rating={tender.overall_average} size="sm" disabled />
                            <span className="font-medium">{tender.overall_average}/5</span>
                          </div>
                          <span className="text-muted-foreground">
                            {tender.total_ratings} rating{tender.total_ratings !== 1 ? 's' : ''}
                          </span>
                          <span className="text-muted-foreground">
                            Category: {tender.tenders?.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {(!topTenders || topTenders.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">
                    No rated tenders available yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flagged" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Entities</CardTitle>
              <CardDescription>
                Entities with active fraud flags or credibility concerns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flaggedEntities?.map((entity) => (
                  <div key={entity.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <h3 className="font-semibold">{entity.entity_name}</h3>
                          <Badge variant="outline" className="capitalize">
                            {entity.entity_type}
                          </Badge>
                          {getSeverityBadge(entity.severity)}
                        </div>
                        <p className="text-sm text-red-700 mb-2">
                          <strong>Flag Type:</strong> {entity.flag_type.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-red-600">
                          <strong>Reason:</strong> {entity.flag_reason}
                        </p>
                        {entity.evidence && (
                          <p className="text-sm text-red-600 mt-1">
                            <strong>Evidence:</strong> {entity.evidence}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Flagged on {new Date(entity.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {(!flaggedEntities || flaggedEntities.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">
                    No active flags at this time
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}