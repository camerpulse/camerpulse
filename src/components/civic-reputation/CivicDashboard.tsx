import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, TrendingUp, Award, Shield, AlertTriangle, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CivicLeaderboard from "./CivicLeaderboard";

interface DashboardStats {
  totalEntities: number;
  averageScore: number;
  topPerformers: number;
  flaggedEntities: number;
  totalRatings: number;
  activeUsers: number;
}

interface TrendingEntity {
  id: string;
  entity_name: string;
  entity_type: string;
  total_score: number;
  reputation_badge: string;
  total_ratings: number;
  trend_direction: 'up' | 'down' | 'stable';
  score_change: number;
}

const CivicDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEntities: 0,
    averageScore: 0,
    topPerformers: 0,
    flaggedEntities: 0,
    totalRatings: 0,
    activeUsers: 0
  });
  const [trendingEntities, setTrendingEntities] = useState<TrendingEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedRegion]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch overall statistics
      const { data: reputationData, error: reputationError } = await supabase
        .from('civic_reputation_scores')
        .select('*');

      if (reputationError) throw reputationError;

      if (reputationData) {
        const totalEntities = reputationData.length;
        const averageScore = reputationData.reduce((sum, entity) => sum + entity.total_score, 0) / totalEntities;
        const topPerformers = reputationData.filter(entity => entity.reputation_badge === 'excellent').length;
        const flaggedEntities = reputationData.filter(entity => entity.reputation_badge === 'flagged').length;
        const totalRatings = reputationData.reduce((sum, entity) => sum + entity.total_ratings, 0);

        setStats({
          totalEntities,
          averageScore: averageScore || 0,
          topPerformers,
          flaggedEntities,
          totalRatings,
          activeUsers: 0 // Would be calculated from actual user data
        });

        // Set trending entities (mock trend data for now)
        const trending = reputationData
          .slice(0, 5)
          .map(entity => ({
            ...entity,
            trend_direction: Math.random() > 0.5 ? 'up' : 'down' as 'up' | 'down',
            score_change: Math.floor(Math.random() * 10) - 5
          }));
        
        setTrendingEntities(trending);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'excellent': return 'bg-green-500 text-white';
      case 'trusted': return 'bg-blue-500 text-white';
      case 'under_watch': return 'bg-yellow-500 text-white';
      case 'flagged': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const regions = [
    { value: 'all', label: 'All Regions' },
    { value: 'adamawa', label: 'Adamawa' },
    { value: 'centre', label: 'Centre' },
    { value: 'east', label: 'East' },
    { value: 'far_north', label: 'Far North' },
    { value: 'littoral', label: 'Littoral' },
    { value: 'north', label: 'North' },
    { value: 'northwest', label: 'Northwest' },
    { value: 'south', label: 'South' },
    { value: 'southwest', label: 'Southwest' },
    { value: 'west', label: 'West' }
  ];

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Civic Reputation Dashboard</h1>
          <p className="text-muted-foreground">Real-time civic performance and citizen trust metrics</p>
        </div>
        <select 
          value={selectedRegion} 
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          {regions.map(region => (
            <option key={region.value} value={region.value}>{region.label}</option>
          ))}
        </select>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entities</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEntities}</div>
            <p className="text-xs text-muted-foreground">Tracked entities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Out of 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.topPerformers}</div>
            <p className="text-xs text-muted-foreground">Excellent rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Entities</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.flaggedEntities}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ratings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRatings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Citizen reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Trending Entities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trending This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trendingEntities.map((entity, index) => (
              <div key={entity.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{entity.entity_name}</h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {entity.entity_type.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getBadgeColor(entity.reputation_badge)}>
                    {entity.reputation_badge.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <div className="text-right">
                    <div className="font-bold">{entity.total_score.toFixed(1)}</div>
                    <div className={`text-sm flex items-center gap-1 ${
                      entity.trend_direction === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendingUp className={`h-3 w-3 ${
                        entity.trend_direction === 'down' ? 'rotate-180' : ''
                      }`} />
                      {Math.abs(entity.score_change)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboards */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="ministries">Ministries</TabsTrigger>
          <TabsTrigger value="politicians">Politicians</TabsTrigger>
          <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
          <TabsTrigger value="schools">Schools</TabsTrigger>
          <TabsTrigger value="villages">Villages</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="petitions">Petitions</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <CivicLeaderboard />
        </TabsContent>

        <TabsContent value="ministries">
          <CivicLeaderboard />
        </TabsContent>

        <TabsContent value="politicians">
          <CivicLeaderboard />
        </TabsContent>

        <TabsContent value="hospitals">
          <CivicLeaderboard />
        </TabsContent>

        <TabsContent value="schools">
          <CivicLeaderboard />
        </TabsContent>

        <TabsContent value="villages">
          <CivicLeaderboard />
        </TabsContent>

        <TabsContent value="projects">
          <CivicLeaderboard />
        </TabsContent>

        <TabsContent value="petitions">
          <CivicLeaderboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CivicDashboard;