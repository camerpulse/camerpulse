import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Trophy, 
  Crown, 
  Medal, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Users, 
  Flag,
  Award,
  Target,
  BarChart3,
  CheckCircle,
  Calendar,
  MapPin,
  Building
} from 'lucide-react';

interface RankingPolitician {
  id: string;
  name: string;
  position: string;
  party: string;
  region: string;
  photo_url?: string;
  overall_rating: number;
  performance_scores: {
    governance: number;
    transparency: number;
    promises_kept: number;
    public_engagement: number;
    economic_impact: number;
  };
  total_ratings: number;
  rank_change: number; // +/- from last period
  achievements: string[];
  term_start: string;
}

const mockRankingData: RankingPolitician[] = [
  {
    id: '1',
    name: 'Dr. Sarah Mbah',
    position: 'Minister of Health',
    party: 'CPDM',
    region: 'Centre',
    overall_rating: 4.7,
    performance_scores: {
      governance: 92,
      transparency: 88,
      promises_kept: 85,
      public_engagement: 90,
      economic_impact: 78
    },
    total_ratings: 2547,
    rank_change: 2,
    achievements: ['Healthcare Reform Implementation', 'COVID-19 Response Leadership', 'Rural Health Initiative'],
    term_start: '2022-01-15'
  },
  {
    id: '2',
    name: 'Hon. Jean-Pierre Nkomo',
    position: 'MP for Kribi',
    party: 'SDF',
    region: 'South',
    overall_rating: 4.5,
    performance_scores: {
      governance: 89,
      transparency: 95,
      promises_kept: 82,
      public_engagement: 87,
      economic_impact: 75
    },
    total_ratings: 1834,
    rank_change: -1,
    achievements: ['Coastal Development Project', 'Youth Employment Program', 'Transparency Initiative'],
    term_start: '2020-05-10'
  },
  {
    id: '3',
    name: 'Prof. Marie Tchoumi',
    position: 'Senator',
    party: 'MRC',
    region: 'Littoral',
    overall_rating: 4.3,
    performance_scores: {
      governance: 86,
      transparency: 91,
      promises_kept: 79,
      public_engagement: 84,
      economic_impact: 82
    },
    total_ratings: 1623,
    rank_change: 1,
    achievements: ['Education Access Bill', 'Women Empowerment Initiative', 'Anti-Corruption Advocacy'],
    term_start: '2021-03-20'
  }
];

const rankingCategories = [
  {
    key: 'overall',
    title: 'Overall Performance',
    icon: Trophy,
    color: 'text-yellow-600',
    description: 'Comprehensive rating across all metrics'
  },
  {
    key: 'governance',
    title: 'Governance Excellence',
    icon: Crown,
    color: 'text-purple-600',
    description: 'Leadership and administrative effectiveness'
  },
  {
    key: 'transparency',
    title: 'Transparency Champions',
    icon: Award,
    color: 'text-blue-600',
    description: 'Openness and accountability in governance'
  },
  {
    key: 'promises',
    title: 'Promise Keepers',
    icon: CheckCircle,
    color: 'text-green-600',
    description: 'Track record of fulfilling campaign promises'
  },
  {
    key: 'engagement',
    title: 'Public Engagement',
    icon: Users,
    color: 'text-pink-600',
    description: 'Active interaction with constituents'
  },
  {
    key: 'impact',
    title: 'Economic Impact',
    icon: TrendingUp,
    color: 'text-orange-600',
    description: 'Contribution to economic development'
  }
];

export const PoliticalRankingsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('overall');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [timeframe, setTimeframe] = useState('current');

  const regions = ['Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 'North', 'Northwest', 'South', 'Southwest', 'West'];
  const positions = ['MP', 'Senator', 'Minister', 'Governor', 'Mayor'];

  const selectedCategoryData = rankingCategories.find(cat => cat.key === selectedCategory);

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <div className="w-6 h-6 flex items-center justify-center bg-muted rounded-full text-sm font-bold">{position}</div>;
    }
  };

  const getRankChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <div className="w-4 h-4" />;
  };

  const getScoreForCategory = (politician: RankingPolitician, category: string) => {
    switch (category) {
      case 'governance': return politician.performance_scores.governance;
      case 'transparency': return politician.performance_scores.transparency;
      case 'promises': return politician.performance_scores.promises_kept;
      case 'engagement': return politician.performance_scores.public_engagement;
      case 'impact': return politician.performance_scores.economic_impact;
      default: return politician.overall_rating * 20; // Convert to percentage
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-civic rounded-xl">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-civic bg-clip-text text-transparent">
              Political Rankings & Leaderboards
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Data-driven rankings of political leaders based on performance, transparency, 
            and public engagement metrics across Cameroon.
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger>
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Regions</SelectItem>
              {regions.map(region => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPosition} onValueChange={setSelectedPosition}>
            <SelectTrigger>
              <SelectValue placeholder="All Positions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Positions</SelectItem>
              {positions.map(position => (
                <SelectItem key={position} value={position}>{position}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Term</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Export Rankings
          </Button>
        </div>

        {/* Category Selector */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {rankingCategories.map((category) => (
            <Button
              key={category.key}
              variant={selectedCategory === category.key ? "default" : "outline"}
              className="h-auto p-4 flex flex-col items-center gap-2 text-center"
              onClick={() => setSelectedCategory(category.key)}
            >
              <category.icon className={`w-5 h-5 ${selectedCategory === category.key ? 'text-white' : category.color}`} />
              <div className="space-y-1">
                <div className="text-sm font-medium">{category.title}</div>
                <div className="text-xs opacity-70">{category.description}</div>
              </div>
            </Button>
          ))}
        </div>

        {/* Rankings Display */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedCategoryData && (
                  <selectedCategoryData.icon className={`w-6 h-6 ${selectedCategoryData.color}`} />
                )}
                <div>
                  <CardTitle className="text-xl">Top Performers - {selectedCategoryData?.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{selectedCategoryData?.description}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-sm">
                {mockRankingData.length} Politicians Ranked
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {mockRankingData.map((politician, index) => (
                <Card key={politician.id} className={`transition-all duration-300 hover:shadow-md ${index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                      {/* Rank */}
                      <div className="flex flex-col items-center">
                        {getRankIcon(index + 1)}
                        <div className="mt-2 flex items-center gap-1">
                          {getRankChangeIcon(politician.rank_change)}
                          {politician.rank_change !== 0 && (
                            <span className={`text-xs ${politician.rank_change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {Math.abs(politician.rank_change)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Profile */}
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={politician.photo_url} />
                          <AvatarFallback className="bg-gradient-civic text-white">
                            {getInitials(politician.name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-bold">{politician.name}</h3>
                          <p className="text-muted-foreground">{politician.position}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Flag className="w-3 h-3" />
                              {politician.party}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {politician.region}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Since {new Date(politician.term_start).getFullYear()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">
                          {selectedCategory === 'overall' 
                            ? politician.overall_rating.toFixed(1)
                            : getScoreForCategory(politician, selectedCategory)
                          }
                          {selectedCategory === 'overall' ? '★' : '%'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {politician.total_ratings} ratings
                        </div>
                      </div>

                      {/* Performance Breakdown */}
                      <div className="w-48">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Governance</span>
                            <span>{politician.performance_scores.governance}%</span>
                          </div>
                          <Progress value={politician.performance_scores.governance} className="h-1" />
                          
                          <div className="flex justify-between text-xs">
                            <span>Transparency</span>
                            <span>{politician.performance_scores.transparency}%</span>
                          </div>
                          <Progress value={politician.performance_scores.transparency} className="h-1" />
                          
                          <div className="flex justify-between text-xs">
                            <span>Promises</span>
                            <span>{politician.performance_scores.promises_kept}%</span>
                          </div>
                          <Progress value={politician.performance_scores.promises_kept} className="h-1" />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline">
                          View Profile
                        </Button>
                        <Button size="sm" variant="outline">
                          Rate Performance
                        </Button>
                      </div>
                    </div>

                    {/* Achievements */}
                    {politician.achievements.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="text-sm font-medium mb-2">Key Achievements:</div>
                        <div className="flex flex-wrap gap-2">
                          {politician.achievements.slice(0, 3).map((achievement, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {achievement}
                            </Badge>
                          ))}
                          {politician.achievements.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{politician.achievements.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Methodology & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Ranking Methodology
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Data Sources</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Public performance metrics</li>
                  <li>• Citizen rating submissions</li>
                  <li>• Independent assessments</li>
                  <li>• Electoral promise tracking</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Scoring Criteria</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Governance effectiveness (25%)</li>
                  <li>• Transparency & accountability (25%)</li>
                  <li>• Promise fulfillment (20%)</li>
                  <li>• Public engagement (15%)</li>
                  <li>• Economic impact (15%)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Ranking Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Top Trends</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Ministers showing highest transparency scores</li>
                  <li>• MPs from opposition parties leading engagement</li>
                  <li>• Rural representatives excelling in promise delivery</li>
                  <li>• Women leaders outperforming in governance metrics</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Recent Changes</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 15% increase in transparency ratings</li>
                  <li>• Public engagement scores up 8%</li>
                  <li>• Promise fulfillment showing improvement</li>
                  <li>• Cross-party collaboration initiatives rising</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};