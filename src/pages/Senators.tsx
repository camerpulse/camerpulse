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
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

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
    if (s.position.includes('Président du Sénat')) return 'President';
    if (s.position.includes('Vice-président')) return 'Vice President';
    if (s.position.includes('Secrétaire')) return 'Secretary';
    if (s.position.includes('Questeur')) return 'Questor';
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
    
    const senatorPositionType = senator.position.includes('Président du Sénat') ? 'President' :
      senator.position.includes('Vice-président') ? 'Vice President' :
      senator.position.includes('Secrétaire') ? 'Secretary' :
      senator.position.includes('Questeur') ? 'Questor' :
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
          if (pos.includes('Président du Sénat')) return 0;
          if (pos.includes('1er Vice président')) return 1;
          if (pos.includes('Vice-président au Bureau du Sénat')) return 2;
          if (pos.includes('Vice-président') && !pos.includes('au Bureau')) return 3;
          if (pos.includes('Secrétaire au Bureau du Sénat') || pos.includes('Secrétaire au bureau du sénat')) return 4;
          if (pos.includes('Secrétaire') && !pos.includes('au Bureau')) return 5;
          if (pos.includes('Questeur au Bureau du Sénat')) return 6;
          if (pos.includes('Rapporteur général')) return 7;
          if (pos.includes('Président de la Commission')) return 8;
          if (pos.includes('Présidente de la commission')) return 9;
          if (pos.includes('Vice-président de la commission')) return 10;
          if (pos.includes('Vice-présidente de la commission')) return 11;
          if (pos.includes('Secrétaire de la Commission') || pos.includes('Secrétaire de la commission')) return 12;
          if (pos.includes('Président du groupe parlementaire') || pos.includes('Présidente Adjoint du Groupe Parlementaire')) return 13;
          if (pos.includes('Membre de') || pos.includes('membre de')) return 14;
          if (pos.includes('membre du bureau d\'âge')) return 15;
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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sortedSenators.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchTerm || filterRegion !== 'all' || filterParty !== 'all' || filterPosition !== 'all' || transparencyFilter !== 'all' 
                ? 'No senators match your filters' 
                : 'No senators available'
              }
            </h3>
            <p className="text-muted-foreground">
              {searchTerm || filterRegion !== 'all' || filterParty !== 'all' || filterPosition !== 'all' || transparencyFilter !== 'all'
                ? 'Try adjusting your search criteria or clearing filters' 
                : 'Senate data will be imported soon'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedSenators.map((senator) => (
              <EnhancedSenatorCard key={senator.id} senator={senator} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}