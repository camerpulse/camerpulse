import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Star,
  Users,
  Vote,
  MapPin,
  Calendar,
  Award,
  ThumbsUp,
  ThumbsDown,
  Minus
} from 'lucide-react';

interface PoliticianRanking {
  id: string;
  name: string;
  position: string;
  party: string;
  region: string;
  approval_rating: number;
  trend: 'up' | 'down' | 'stable';
  rank: number;
  previous_rank: number;
  image_url?: string;
  achievements: number;
  promises_kept: number;
  total_promises: number;
}

// Mock data for demonstration
const mockRankings: PoliticianRanking[] = [
  {
    id: '1',
    name: 'Dr. Jane Mballa',
    position: 'Mayor of Douala',
    party: 'Democratic Party',
    region: 'Littoral',
    approval_rating: 87,
    trend: 'up',
    rank: 1,
    previous_rank: 3,
    achievements: 15,
    promises_kept: 23,
    total_promises: 28
  },
  {
    id: '2',
    name: 'Hon. Paul Ngozi',
    position: 'Deputy Minister of Health',
    party: 'People\'s Party',
    region: 'Centre',
    approval_rating: 78,
    trend: 'stable',
    rank: 2,
    previous_rank: 2,
    achievements: 12,
    promises_kept: 18,
    total_promises: 25
  },
  {
    id: '3',
    name: 'Prof. Marie Tabi',
    position: 'Minister of Education',
    party: 'Reform Alliance',
    region: 'West',
    approval_rating: 72,
    trend: 'down',
    rank: 3,
    previous_rank: 1,
    achievements: 8,
    promises_kept: 15,
    total_promises: 22
  },
  {
    id: '4',
    name: 'Dr. Emmanuel Fon',
    position: 'Governor of North West',
    party: 'Unity Party',
    region: 'North West',
    approval_rating: 69,
    trend: 'up',
    rank: 4,
    previous_rank: 6,
    achievements: 10,
    promises_kept: 12,
    total_promises: 20
  },
  {
    id: '5',
    name: 'Hon. Grace Biya',
    position: 'Mayor of Yaoundé',
    party: 'Progressive Front',
    region: 'Centre',
    approval_rating: 65,
    trend: 'stable',
    rank: 5,
    previous_rank: 5,
    achievements: 7,
    promises_kept: 14,
    total_promises: 24
  }
];

export default function PoliticalRankingsPage() {
  const [rankings, setRankings] = useState<PoliticianRanking[]>(mockRankings);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedParty, setSelectedParty] = useState<string>('all');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');

  const regions = ['Centre', 'Littoral', 'West', 'North West', 'South West', 'East', 'Adamawa', 'North', 'Far North', 'South'];
  const parties = ['Democratic Party', 'People\'s Party', 'Reform Alliance', 'Unity Party', 'Progressive Front'];
  const positions = ['Mayor', 'Minister', 'Deputy Minister', 'Governor', 'Senator', 'Deputy'];

  const filteredRankings = rankings.filter(politician => {
    const matchesSearch = politician.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         politician.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || politician.region === selectedRegion;
    const matchesParty = selectedParty === 'all' || politician.party === selectedParty;
    const matchesPosition = selectedPosition === 'all' || politician.position.toLowerCase().includes(selectedPosition.toLowerCase());

    return matchesSearch && matchesRegion && matchesParty && matchesPosition;
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank <= 3) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank <= 10) return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Political Rankings</h1>
          <p className="text-muted-foreground">Performance rankings based on citizen feedback and achievements</p>
        </div>
        <div className="flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <span className="text-sm text-muted-foreground">Updated weekly</span>
        </div>
      </div>

      {/* Top Performers Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-6 text-center">
            <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-800">{rankings[0]?.name}</div>
            <p className="text-sm text-yellow-600">{rankings[0]?.approval_rating}% Approval</p>
            <Badge className="mt-2 bg-yellow-600 text-white">Top Performer</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {rankings.filter(p => p.trend === 'up').length}
            </div>
            <p className="text-sm text-muted-foreground">Rising Stars</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Star className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {Math.round(rankings.reduce((acc, p) => acc + p.approval_rating, 0) / rankings.length)}%
            </div>
            <p className="text-sm text-muted-foreground">Average Approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search politicians..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedParty} onValueChange={setSelectedParty}>
              <SelectTrigger>
                <SelectValue placeholder="All Parties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Parties</SelectItem>
                {parties.map(party => (
                  <SelectItem key={party} value={party}>{party}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger>
                <SelectValue placeholder="All Positions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {positions.map(position => (
                  <SelectItem key={position} value={position}>{position}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rankings List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Rankings</CardTitle>
          <CardDescription>
            Showing {filteredRankings.length} politicians ranked by approval rating and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRankings.map((politician, index) => (
              <div key={politician.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4">
                  {/* Rank Badge */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getRankBadgeColor(politician.rank)}`}>
                    {politician.rank}
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={politician.image_url} alt={politician.name} />
                    <AvatarFallback>
                      {politician.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  {/* Main Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-lg">{politician.name}</h3>
                      {getTrendIcon(politician.trend)}
                      {politician.rank !== politician.previous_rank && (
                        <Badge variant="outline" className="text-xs">
                          {politician.rank < politician.previous_rank ? '+' : ''}{politician.previous_rank - politician.rank}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center">
                        <Vote className="h-3 w-3 mr-1" />
                        {politician.position}
                      </span>
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {politician.party}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {politician.region}
                      </span>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium w-20">Approval:</span>
                        <Progress value={politician.approval_rating} className="flex-1 h-2" />
                        <span className="text-xs font-medium w-8">{politician.approval_rating}%</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium w-20">Promises:</span>
                        <Progress 
                          value={(politician.promises_kept / politician.total_promises) * 100} 
                          className="flex-1 h-2" 
                        />
                        <span className="text-xs font-medium w-8">
                          {Math.round((politician.promises_kept / politician.total_promises) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-center">
                    <div className="flex space-x-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{politician.promises_kept}</div>
                        <div className="text-xs text-muted-foreground">Kept</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{politician.achievements}</div>
                        <div className="text-xs text-muted-foreground">Achievements</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      View Profile
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredRankings.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No politicians found matching your criteria.</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Methodology */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking Methodology</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start space-x-2">
              <ThumbsUp className="h-4 w-4 text-green-500 mt-1" />
              <div>
                <p className="font-medium">Citizen Approval (40%)</p>
                <p className="text-muted-foreground">Based on verified citizen feedback and ratings</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Award className="h-4 w-4 text-blue-500 mt-1" />
              <div>
                <p className="font-medium">Promise Delivery (35%)</p>
                <p className="text-muted-foreground">Percentage of campaign promises fulfilled</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Star className="h-4 w-4 text-purple-500 mt-1" />
              <div>
                <p className="font-medium">Achievements (25%)</p>
                <p className="text-muted-foreground">Tangible accomplishments and impact metrics</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}