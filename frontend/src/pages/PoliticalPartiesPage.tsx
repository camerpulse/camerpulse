import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Users, 
  TrendingUp, 
  MapPin, 
  Calendar,
  Star,
  Crown,
  Flag,
  Building,
  Vote,
  ExternalLink,
  MessageSquare,
  Heart,
  BarChart3
} from 'lucide-react';

interface PoliticalParty {
  id: string;
  name: string;
  acronym: string;
  logo_url?: string;
  description: string;
  ideology: string;
  founded_year: number;
  headquarters: string;
  leader: string;
  member_count: number;
  approval_rating: number;
  verified: boolean;
  website?: string;
  social_media?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  performance_metrics: {
    seats_held: number;
    electoral_success_rate: number;
    promise_fulfillment: number;
    transparency_score: number;
  };
  recent_activities: Array<{
    type: string;
    description: string;
    date: string;
  }>;
}

const mockPoliticalParties: PoliticalParty[] = [
  {
    id: '1',
    name: 'Cameroon People\'s Democratic Movement',
    acronym: 'CPDM',
    description: 'The ruling party of Cameroon since 1985, advocating for unity, progress, and democracy.',
    ideology: 'Democratic Socialist',
    founded_year: 1985,
    headquarters: 'Yaoundé',
    leader: 'Paul Biya',
    member_count: 2500000,
    approval_rating: 68,
    verified: true,
    website: 'https://cpdm.cm',
    performance_metrics: {
      seats_held: 152,
      electoral_success_rate: 78,
      promise_fulfillment: 65,
      transparency_score: 72
    },
    recent_activities: [
      { type: 'campaign', description: 'Launched infrastructure development campaign', date: '2024-01-15' },
      { type: 'policy', description: 'Proposed education reform bill', date: '2024-01-10' }
    ]
  },
  {
    id: '2',
    name: 'Social Democratic Front',
    acronym: 'SDF',
    description: 'Main opposition party advocating for federalism, good governance, and democratic reforms.',
    ideology: 'Social Democratic',
    founded_year: 1990,
    headquarters: 'Bamenda',
    leader: 'Joshua Osih',
    member_count: 850000,
    approval_rating: 45,
    verified: true,
    performance_metrics: {
      seats_held: 18,
      electoral_success_rate: 32,
      promise_fulfillment: 58,
      transparency_score: 85
    },
    recent_activities: [
      { type: 'protest', description: 'Organized peaceful demonstration for electoral reforms', date: '2024-01-20' },
      { type: 'policy', description: 'Submitted anti-corruption proposal', date: '2024-01-12' }
    ]
  },
  {
    id: '3',
    name: 'Cameroon Renaissance Movement',
    acronym: 'MRC',
    description: 'Opposition party focused on economic transformation and youth empowerment.',
    ideology: 'Progressive',
    founded_year: 2012,
    headquarters: 'Douala',
    leader: 'Maurice Kamto',
    member_count: 650000,
    approval_rating: 42,
    verified: true,
    performance_metrics: {
      seats_held: 5,
      electoral_success_rate: 28,
      promise_fulfillment: 72,
      transparency_score: 88
    },
    recent_activities: [
      { type: 'rally', description: 'Youth empowerment rally in Douala', date: '2024-01-18' },
      { type: 'policy', description: 'Economic reform proposal submitted', date: '2024-01-08' }
    ]
  }
];

export const PoliticalPartiesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIdeology, setSelectedIdeology] = useState<string>('');
  const [sortBy, setSortBy] = useState('approval_rating');
  const [activeTab, setActiveTab] = useState('all');

  const ideologies = ['Democratic Socialist', 'Social Democratic', 'Progressive', 'Conservative', 'Liberal'];

  const filteredParties = mockPoliticalParties.filter(party => 
    (!searchTerm || party.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     party.acronym.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!selectedIdeology || party.ideology === selectedIdeology)
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2);
  };

  const getApprovalColor = (rating: number) => {
    if (rating >= 70) return 'text-green-600';
    if (rating >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const PartyCard = ({ party }: { party: PoliticalParty }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={party.logo_url} />
              <AvatarFallback className="bg-gradient-civic text-white text-lg font-bold">
                {party.acronym}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                  {party.name}
                </h3>
                {party.verified && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Crown className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-lg font-semibold text-primary">{party.acronym}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Founded {party.founded_year}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {party.headquarters}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-2xl font-bold ${getApprovalColor(party.approval_rating)}`}>
              {party.approval_rating}%
            </div>
            <div className="text-sm text-muted-foreground">Approval</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{party.description}</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Ideology</div>
            <Badge variant="outline">{party.ideology}</Badge>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Leader</div>
            <div className="font-medium">{party.leader}</div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Electoral Success</span>
            <span className="font-medium">{party.performance_metrics.electoral_success_rate}%</span>
          </div>
          <Progress value={party.performance_metrics.electoral_success_rate} className="h-2" />
          
          <div className="flex items-center justify-between text-sm">
            <span>Promise Fulfillment</span>
            <span className="font-medium">{party.performance_metrics.promise_fulfillment}%</span>
          </div>
          <Progress value={party.performance_metrics.promise_fulfillment} className="h-2" />
          
          <div className="flex items-center justify-between text-sm">
            <span>Transparency Score</span>
            <span className="font-medium">{party.performance_metrics.transparency_score}%</span>
          </div>
          <Progress value={party.performance_metrics.transparency_score} className="h-2" />
        </div>
        
        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <div className="text-center">
            <div className="font-bold text-lg">{party.performance_metrics.seats_held}</div>
            <div className="text-xs text-muted-foreground">Seats</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">{(party.member_count / 1000000).toFixed(1)}M</div>
            <div className="text-xs text-muted-foreground">Members</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">{party.recent_activities.length}</div>
            <div className="text-xs text-muted-foreground">Activities</div>
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button size="sm" className="flex-1">
            <Users className="w-4 h-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" size="sm">
            <Heart className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <MessageSquare className="w-4 h-4" />
          </Button>
          {party.website && (
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-civic rounded-xl">
              <Flag className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-civic bg-clip-text text-transparent">
              Political Parties Directory
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore Cameroon's political landscape. Compare party platforms, track performance, 
            and understand the forces shaping our democracy.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search parties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedIdeology} onValueChange={setSelectedIdeology}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by ideology" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Ideologies</SelectItem>
              {ideologies.map(ideology => (
                <SelectItem key={ideology} value={ideology}>{ideology}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="approval_rating">Highest Approval</SelectItem>
              <SelectItem value="member_count">Most Members</SelectItem>
              <SelectItem value="founded_year">Newest First</SelectItem>
              <SelectItem value="name">Alphabetical</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Compare Parties
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200">
            <CardContent className="p-4 text-center">
              <Flag className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">{filteredParties.length}</div>
              <div className="text-sm text-blue-600">Active Parties</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200">
            <CardContent className="p-4 text-center">
              <Vote className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">
                {mockPoliticalParties.reduce((sum, party) => sum + party.performance_metrics.seats_held, 0)}
              </div>
              <div className="text-sm text-green-600">Total Seats</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-700">
                {(mockPoliticalParties.reduce((sum, party) => sum + party.member_count, 0) / 1000000).toFixed(1)}M
              </div>
              <div className="text-sm text-purple-600">Total Members</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-700">
                {Math.round(mockPoliticalParties.reduce((sum, party) => sum + party.approval_rating, 0) / mockPoliticalParties.length)}%
              </div>
              <div className="text-sm text-orange-600">Avg Approval</div>
            </CardContent>
          </Card>
        </div>

        {/* Parties Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {filteredParties.map((party) => (
            <PartyCard key={party.id} party={party} />
          ))}
        </div>

        {/* Analysis Section */}
        <Card className="bg-gradient-civic text-white mb-8">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-4">Political Landscape Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Ruling Coalition</h4>
                <p className="opacity-90 text-sm">
                  CPDM maintains majority control with strong performance in rural regions and established governance structure.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Opposition Forces</h4>
                <p className="opacity-90 text-sm">
                  SDF and MRC lead opposition movements, focusing on transparency, federalism, and democratic reforms.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Emerging Trends</h4>
                <p className="opacity-90 text-sm">
                  Youth-focused parties gaining traction, emphasizing economic transformation and digital governance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};