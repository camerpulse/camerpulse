import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOfficials } from '@/hooks/useOfficials';
import { useMPs } from '@/hooks/useMPs';
import { useSenators } from '@/hooks/useSenators';
import { OfficialCard } from '@/components/camerpulse/OfficialCard';
import { MPCard } from '@/components/MPs/MPCard';
import { SenatorCard } from '@/components/Senators/SenatorCard';
import { Search, Filter, Crown, Users, Building, TrendingUp } from 'lucide-react';

export const PoliticiansPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [sortBy, setSortBy] = useState('rating');
  const [activeTab, setActiveTab] = useState('all');

  const { data: allOfficials = [], isLoading: loadingOfficials } = useOfficials({
    search: searchTerm,
    region: selectedRegion,
    sortBy
  });

  const { data: mps = [], isLoading: loadingMPs } = useMPs();
  const { data: senators = [], isLoading: loadingSenators } = useSenators();

  const regions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const filteredMPs = mps.filter(mp => 
    (!searchTerm || mp.full_name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!selectedRegion || mp.region === selectedRegion)
  );

  const filteredSenators = senators.filter(senator => 
    (!searchTerm || senator.full_name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!selectedRegion || senator.region === selectedRegion)
  );

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'mps': return filteredMPs.length;
      case 'senators': return filteredSenators.length;
      case 'ministers': return allOfficials.filter(o => o.category === 'minister').length;
      default: return allOfficials.length;
    }
  };

  const isLoading = loadingOfficials || loadingMPs || loadingSenators;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-civic rounded-xl">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-civic bg-clip-text text-transparent">
              Politicians Directory
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with your elected representatives. Rate their performance, track their promises, 
            and engage in meaningful civic dialogue.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search politicians..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Regions</SelectItem>
              {regions.map(region => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="name">Alphabetical</SelectItem>
              <SelectItem value="date">Recently Added</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Advanced Filters
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">{allOfficials.length}</div>
              <div className="text-sm text-blue-600">Total Officials</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200">
            <CardContent className="p-4 text-center">
              <Building className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">{mps.length}</div>
              <div className="text-sm text-green-600">MPs</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200">
            <CardContent className="p-4 text-center">
              <Crown className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-700">{senators.length}</div>
              <div className="text-sm text-purple-600">Senators</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-700">4.2</div>
              <div className="text-sm text-orange-600">Avg Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Politicians Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="gap-2">
              All <Badge variant="secondary">{getTabCount('all')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="mps" className="gap-2">
              MPs <Badge variant="secondary">{getTabCount('mps')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="senators" className="gap-2">
              Senators <Badge variant="secondary">{getTabCount('senators')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="ministers" className="gap-2">
              Ministers <Badge variant="secondary">{getTabCount('ministers')}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="h-64">
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="h-20 bg-muted rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allOfficials.map((official) => (
                  <Card key={official.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-civic rounded-full flex items-center justify-center text-white font-bold">
                          {official.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{official.name}</h3>
                          <p className="text-muted-foreground">{official.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{official.party || 'Independent'}</Badge>
                            <Badge variant="secondary">{official.region || 'National'}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {official.average_rating ? official.average_rating.toFixed(1) : 'N/A'}★
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {official.total_ratings || 0} ratings
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">View Profile</Button>
                        <Button size="sm" variant="outline">Rate</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="mps" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMPs.map((mp) => (
                <MPCard key={mp.id} mp={mp} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="senators" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSenators.map((senator) => (
                <SenatorCard key={senator.id} senator={senator} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ministers" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allOfficials
                .filter(official => official.category === 'minister')
                .map((minister) => (
                  <Card key={minister.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-civic rounded-full flex items-center justify-center text-white font-bold">
                          {minister.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{minister.name}</h3>
                          <p className="text-muted-foreground">{minister.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{minister.party || 'Independent'}</Badge>
                            <Badge variant="secondary">{minister.region || 'National'}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {minister.average_rating ? minister.average_rating.toFixed(1) : 'N/A'}★
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {minister.total_ratings || 0} ratings
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">View Profile</Button>
                        <Button size="sm" variant="outline">Rate</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-civic text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Get Involved in Democracy</h3>
              <p className="mb-6 opacity-90">
                Your voice matters. Rate politicians, track promises, and stay informed about your representatives.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button variant="secondary" size="lg">
                  View Rankings
                </Button>
                <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Track Promises
                </Button>
                <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Submit Feedback
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};