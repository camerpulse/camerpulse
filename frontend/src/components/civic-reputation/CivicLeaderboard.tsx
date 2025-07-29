import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Trophy, Medal, Award, TrendingUp, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LeaderboardEntry {
  id: string;
  category: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  score: number;
  rank_position: number;
  region: string;
  period_type: string;
  period_start: string;
  period_end: string;
}

interface ReputationScore {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  total_score: number;
  reputation_badge: 'excellent' | 'trusted' | 'under_watch' | 'flagged';
  total_ratings: number;
  average_rating: number;
  transparency_score: number;
  performance_score: number;
  citizen_rating_score: number;
  engagement_score: number;
  region: string;
}

const CivicLeaderboard: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [reputationData, setReputationData] = useState<ReputationScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('top_officials');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const categories = [
    { value: 'top_officials', label: 'Top-Rated Officials', icon: Trophy },
    { value: 'best_ministries', label: 'Best Performing Ministries', icon: Medal },
    { value: 'trusted_hospitals', label: 'Most Trusted Hospitals', icon: Award },
    { value: 'best_schools', label: 'Best Schools', icon: Star },
    { value: 'cleanest_councils', label: 'Cleanest Councils', icon: TrendingUp },
    { value: 'highest_villages', label: 'Highest-Rated Villages', icon: Trophy },
    { value: 'transparent_projects', label: 'Most Transparent Projects', icon: Medal }
  ];

  const periods = [
    { value: 'weekly', label: 'This Week' },
    { value: 'monthly', label: 'This Month' },
    { value: 'yearly', label: 'This Year' }
  ];

  const regions = [
    { value: 'all', label: 'All Regions' },
    { value: 'Centre', label: 'Centre' },
    { value: 'Littoral', label: 'Littoral' },
    { value: 'West', label: 'West' },
    { value: 'Southwest', label: 'Southwest' },
    { value: 'Northwest', label: 'Northwest' },
    { value: 'North', label: 'North' },
    { value: 'Far North', label: 'Far North' },
    { value: 'Adamawa', label: 'Adamawa' },
    { value: 'East', label: 'East' },
    { value: 'South', label: 'South' }
  ];

  useEffect(() => {
    fetchLeaderboardData();
    fetchReputationData();
  }, [selectedCategory, selectedPeriod, selectedRegion]);

  const fetchLeaderboardData = async () => {
    try {
      let query = supabase
        .from('civic_leaderboards')
        .select('*')
        .eq('category', selectedCategory)
        .eq('period_type', selectedPeriod)
        .order('rank_position', { ascending: true })
        .limit(10);

      if (selectedRegion !== 'all') {
        query = query.eq('region', selectedRegion);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLeaderboardData(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard data');
    }
  };

  const fetchReputationData = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('civic_reputation_scores')
        .select('*')
        .order('total_score', { ascending: false })
        .limit(20);

      if (selectedRegion !== 'all') {
        query = query.eq('region', selectedRegion);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReputationData(data || []);
    } catch (error) {
      console.error('Error fetching reputation data:', error);
      toast.error('Failed to load reputation data');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'excellent': return 'bg-green-500';
      case 'trusted': return 'bg-blue-500';
      case 'under_watch': return 'bg-yellow-500';
      case 'flagged': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <span className="text-lg font-bold">#{position}</span>;
    }
  };

  const formatEntityType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Civic Reputation Leaderboard</h1>
          <p className="text-muted-foreground">
            Discover and recognize the best-performing civic entities in Cameroon
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.value} value={region.value}>
                  {region.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              {periods.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <TabsTrigger 
                key={category.value} 
                value={category.value}
                className="flex items-center gap-2"
              >
                <IconComponent className="h-4 w-4" />
                <span className="hidden lg:inline">{category.label}</span>
                <span className="lg:hidden">{category.label.split(' ')[0]}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.value} value={category.value} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <category.icon className="h-5 w-5" />
                  {category.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-muted rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : leaderboardData.length > 0 ? (
                  <div className="space-y-4">
                    {leaderboardData.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-12 h-12">
                            {getRankIcon(entry.rank_position)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{entry.entity_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {formatEntityType(entry.entity_type)}
                              {entry.region && ` • ${entry.region}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{entry.score.toFixed(1)}</div>
                          <div className="text-sm text-muted-foreground">Score</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No leaderboard data available for this category.</p>
                    <Button variant="outline" onClick={fetchLeaderboardData} className="mt-4">
                      Refresh Data
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Overall Reputation Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Top Reputation Scores</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-muted rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {reputationData.slice(0, 10).map((score, index) => (
                <div
                  key={score.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10">
                      <span className="text-lg font-bold">#{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{score.entity_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatEntityType(score.entity_type)}
                        {score.region && ` • ${score.region}`}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{score.average_rating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">
                            ({score.total_ratings} reviews)
                          </span>
                        </div>
                        <Badge className={`${getBadgeColor(score.reputation_badge)} text-white`}>
                          {score.reputation_badge.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{score.total_score.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                    <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                      <div>T: {score.transparency_score.toFixed(0)}</div>
                      <div>P: {score.performance_score.toFixed(0)}</div>
                      <div>C: {score.citizen_rating_score.toFixed(0)}</div>
                      <div>E: {score.engagement_score.toFixed(0)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CivicLeaderboard;