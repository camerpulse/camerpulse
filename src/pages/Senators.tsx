import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { EnhancedSenatorCard } from '@/components/Senators/EnhancedSenatorCard';
import { useSenators, useImportSenators } from '@/hooks/useSenators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, Search, Download, Users, Filter, Star, 
  TrendingUp, Award, Shield, CheckCircle, AlertTriangle 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SuggestionButton } from '@/components/CivicSuggestions/SuggestionButton';

export default function SenatorsPage() {
  const { data: senators, isLoading } = useSenators();
  const { user } = useAuth();
  const importSenators = useImportSenators();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('position_order');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterParty, setFilterParty] = useState('all');
  const [filterPosition, setFilterPosition] = useState('all');
  const [transparencyFilter, setTransparencyFilter] = useState('all');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (user) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
        setIsAdmin(!!data);
      }
    };
    checkAdminRole();
  }, [user]);

  // Get unique values for filters
  const regions = senators ? [...new Set(senators.map(s => s.region).filter(Boolean))] : [];
  const parties = senators ? [...new Set(senators.map(s => s.political_party || s.party_affiliation).filter(Boolean))] : [];
  const positions = senators ? [...new Set(senators.map(s => {
    // Extract main position type
    if (s.position.includes('Senate President') || s.position.includes('President of the Senate')) return 'President';
    if (s.position.includes('Vice President') || s.position.includes('Vice-President')) return 'Vice President';
    if (s.position.includes('Secretary')) return 'Secretary';
    if (s.position.includes('Questor')) return 'Questor';
    if (s.position.includes('Rapporteur')) return 'Rapporteur';
    return 'Member';
  }))] : [];

  // Filter senators
  const filteredSenators = senators?.filter(senator => {
    const matchesSearch = 
      senator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      senator.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      senator.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (senator.political_party || senator.party_affiliation)?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRegion = filterRegion === 'all' || senator.region === filterRegion;
    const matchesParty = filterParty === 'all' || 
      (senator.political_party === filterParty || senator.party_affiliation === filterParty);
    
    const senatorPositionType = senator.position.includes('Senate President') || senator.position.includes('President of the Senate') ? 'President' :
      senator.position.includes('Vice President') || senator.position.includes('Vice-President') ? 'Vice President' :
      senator.position.includes('Secretary') ? 'Secretary' :
      senator.position.includes('Questor') ? 'Questor' :
      senator.position.includes('Rapporteur') ? 'Rapporteur' : 'Member';
    const matchesPosition = filterPosition === 'all' || senatorPositionType === filterPosition;

    const matchesTransparency = transparencyFilter === 'all' ||
      (transparencyFilter === 'high' && (senator.transparency_score || 0) >= 75) ||
      (transparencyFilter === 'medium' && (senator.transparency_score || 0) >= 50 && (senator.transparency_score || 0) < 75) ||
      (transparencyFilter === 'low' && (senator.transparency_score || 0) < 50);

    return matchesSearch && matchesRegion && matchesParty && matchesPosition && matchesTransparency;
  }) || [];

  // Sort senators
  const sortedSenators = [...filteredSenators].sort((a, b) => {
    switch (sortBy) {
      case 'performance_score':
        return (b.performance_score || 0) - (a.performance_score || 0);
      case 'highest_rating':
        return b.average_rating - a.average_rating;
      case 'most_bills_passed':
        return (b.bills_passed_count || 0) - (a.bills_passed_count || 0);
      case 'position_order':
        const getPositionOrder = (pos: string) => {
          if (pos.includes('Senate President') || pos.includes('President of the Senate')) return 0;
          if (pos.includes('1st Vice President') || pos.includes('First Vice President')) return 1;
          if (pos.includes('Vice President of Senate Bureau')) return 2;
          if (pos.includes('Vice President') && !pos.includes('Bureau')) return 3;
          if (pos.includes('Secretary of Senate Bureau')) return 4;
          if (pos.includes('Secretary') && !pos.includes('Bureau')) return 5;
          if (pos.includes('Questor of Senate Bureau')) return 6;
          if (pos.includes('General Rapporteur')) return 7;
          if (pos.includes('Commission President') || pos.includes('Committee Chair')) return 8;
          if (pos.includes('Commission Chairwoman') || pos.includes('Committee Chairwoman')) return 9;
          if (pos.includes('Commission Vice President') || pos.includes('Committee Vice Chair')) return 10;
          if (pos.includes('Commission Vice Chairwoman')) return 11;
          if (pos.includes('Commission Secretary') || pos.includes('Committee Secretary')) return 12;
          if (pos.includes('Parliamentary Group President') || pos.includes('Deputy Parliamentary Group President')) return 13;
          if (pos.includes('Member of') || pos.includes('member of')) return 14;
          if (pos.includes('member of age bureau')) return 15;
          return 16; // For other positions or empty positions
        };
        return getPositionOrder(a.position) - getPositionOrder(b.position);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Calculate stats
  const stats = {
    total: senators?.length || 0,
    highPerformers: senators?.filter(s => (s.performance_score || 0) >= 75).length || 0,
    highTransparency: senators?.filter(s => (s.transparency_score || 0) >= 75).length || 0,
    activeBillProposers: senators?.filter(s => (s.bills_proposed_count || 0) > 0).length || 0
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent mb-2">
                Cameroon Senate Directory
              </h1>
              <p className="text-lg text-muted-foreground">
                Complete profiles of all 100 Cameroonian senators with transparency ratings
              </p>
            </div>
            
            <div className="flex gap-3">
              <SuggestionButton 
                mode="suggest_new" 
                entityType="senator"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              />
              {isAdmin && (
                <Button
                  onClick={() => importSenators.mutate()}
                  disabled={importSenators.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {importSenators.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Update Senate Data
                </Button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Senators</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">High Performers</p>
                  <p className="text-2xl font-bold text-foreground">{stats.highPerformers}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">High Transparency</p>
                  <p className="text-2xl font-bold text-foreground">{stats.highTransparency}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Legislators</p>
                  <p className="text-2xl font-bold text-foreground">{stats.activeBillProposers}</p>
                </div>
                <Award className="h-8 w-8 text-purple-500" />
              </div>
            </Card>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-8">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search senators by name, position, region, or political party..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-base"
              />
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="performance_score">Performance Score</SelectItem>
                  <SelectItem value="highest_rating">Highest Rating</SelectItem>
                  <SelectItem value="most_bills_passed">Most Bills Passed</SelectItem>
                  <SelectItem value="position_order">Position Order</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterRegion} onValueChange={setFilterRegion}>
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

              <Select value={filterParty} onValueChange={setFilterParty}>
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

              <Select value={filterPosition} onValueChange={setFilterPosition}>
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

              <Select value={transparencyFilter} onValueChange={setTransparencyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Transparency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transparency</SelectItem>
                  <SelectItem value="high">High (75%+)</SelectItem>
                  <SelectItem value="medium">Medium (50-74%)</SelectItem>
                  <SelectItem value="low">Low (&lt;50%)</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterRegion('all');
                  setFilterParty('all');
                  setFilterPosition('all');
                  setTransparencyFilter('all');
                  setSortBy('performance_score');
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>

            {/* Active Filters Display */}
            {(searchTerm || filterRegion !== 'all' || filterParty !== 'all' || filterPosition !== 'all' || transparencyFilter !== 'all') && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchTerm && (
                  <Badge variant="secondary">Search: {searchTerm}</Badge>
                )}
                {filterRegion !== 'all' && (
                  <Badge variant="secondary">Region: {filterRegion}</Badge>
                )}
                {filterParty !== 'all' && (
                  <Badge variant="secondary">Party: {filterParty}</Badge>
                )}
                {filterPosition !== 'all' && (
                  <Badge variant="secondary">Position: {filterPosition}</Badge>
                )}
                {transparencyFilter !== 'all' && (
                  <Badge variant="secondary">Transparency: {transparencyFilter}</Badge>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-sm">
              <Users className="h-3 w-3 mr-1" />
              {sortedSenators.length} of {senators?.length || 0} senators
            </Badge>
          </div>
        </div>

        {/* Senators Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-xl aspect-square mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))
          ) : sortedSenators.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No senators found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          ) : (
            sortedSenators.map((senator) => (
              <EnhancedSenatorCard key={senator.id} senator={senator} />
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}