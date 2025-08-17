import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Search, 
  Globe, 
  Calendar, 
  Star,
  Filter,
  ExternalLink,
  Building2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { NavigationBreadcrumb } from '@/components/Navigation/NavigationBreadcrumb';
import { PoliticalNavigationMenu } from '@/components/Politicians/PoliticalNavigationMenu';

interface PoliticalParty {
  id: string;
  name: string;
  acronym?: string;
  logo_url?: string;
  party_president?: string;
  official_website?: string;
  founded_date?: string;
  claim_status?: string;
  member_count?: number;
}

export default function PoliticalPartiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  const { data: parties, isLoading, error } = useQuery({
    queryKey: ['political-parties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('political_parties')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      // Get member counts for each party
      const partiesWithCounts = await Promise.all(
        (data || []).map(async (party) => {
          const [senatorsRes, ministersRes, mpsRes, politiciansRes] = await Promise.all([
            supabase.from('senators').select('id', { count: 'exact' }).eq('political_party_id', party.id),
            supabase.from('ministers').select('id', { count: 'exact' }).eq('political_party_id', party.id),
            supabase.from('mps').select('id', { count: 'exact' }).eq('political_party_id', party.id),
            supabase.from('politicians').select('id', { count: 'exact' }).eq('political_party_id', party.id),
          ]);

          const memberCount = 
            (senatorsRes.count || 0) + 
            (ministersRes.count || 0) + 
            (mpsRes.count || 0) + 
            (politiciansRes.count || 0);

          return {
            ...party,
            member_count: memberCount,
          };
        })
      );

      return partiesWithCounts as PoliticalParty[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter and sort parties
  const filteredParties = React.useMemo(() => {
    if (!parties) return [];

    let filtered = parties.filter(party => {
      const matchesSearch = 
        party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (party.acronym && party.acronym.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (party.party_president && party.party_president.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || party.claim_status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort parties
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'members':
          return (b.member_count || 0) - (a.member_count || 0);
        case 'founded':
          return new Date(b.founded_date || '').getTime() - new Date(a.founded_date || '').getTime();
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [parties, searchTerm, statusFilter, sortBy]);

  if (isLoading) {
    return (
      <AppLayout>
        <NavigationBreadcrumb 
          items={[
            { label: 'Politics', href: '/politics' },
            { label: 'Political Parties', href: '/political-parties' }
          ]} 
        />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading political parties...</div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <NavigationBreadcrumb 
          items={[
            { label: 'Politics', href: '/politics' },
            { label: 'Political Parties', href: '/political-parties' }
          ]} 
        />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error Loading Parties</h1>
            <p className="text-muted-foreground">
              There was an error loading the political parties. Please try again later.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <NavigationBreadcrumb 
        items={[
          { label: 'Politics', href: '/politics' },
          { label: 'Political Parties', href: '/political-parties' }
        ]} 
      />
      
      <div className="container mx-auto px-4 py-8">
        <PoliticalNavigationMenu />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Political Parties Directory</h1>
          <p className="text-muted-foreground mb-6">
            Comprehensive directory of political parties in Cameroon with their members and information.
          </p>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Parties</p>
                    <p className="text-2xl font-bold">{parties?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Members</p>
                    <p className="text-2xl font-bold">
                      {parties?.reduce((sum, party) => sum + (party.member_count || 0), 0) || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Verified Parties</p>
                    <p className="text-2xl font-bold">
                      {parties?.filter(p => p.claim_status === 'verified').length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">With Websites</p>
                    <p className="text-2xl font-bold">
                      {parties?.filter(p => p.official_website).length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search parties by name, acronym, or president..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Parties</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="unclaimed">Unclaimed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="members">Member Count</SelectItem>
                  <SelectItem value="founded">Founded Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredParties.length} of {parties?.length || 0} political parties
          </p>
        </div>

        {/* Parties Grid */}
        {filteredParties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredParties.map((party) => (
              <Link key={party.id} to={`/political-parties/${party.id}`}>
                <Card className="hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      {party.logo_url ? (
                        <img 
                          src={party.logo_url} 
                          alt={party.name}
                          className="w-16 h-16 object-contain rounded-lg border flex-shrink-0"
                        />
                      ) : (
                        <Avatar className="h-16 w-16 flex-shrink-0">
                          <AvatarFallback className="text-lg font-bold">
                            {party.acronym || party.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg leading-tight mb-1 truncate">
                          {party.name}
                        </h3>
                        {party.acronym && (
                          <Badge variant="outline" className="text-xs mb-2">
                            {party.acronym}
                          </Badge>
                        )}
                        {party.party_president && (
                          <p className="text-sm text-muted-foreground truncate">
                            President: {party.party_president}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Members</span>
                        <span className="font-medium">{party.member_count || 0}</span>
                      </div>
                      
                      {party.founded_date && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Founded</span>
                          <span className="font-medium">
                            {new Date(party.founded_date).getFullYear()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {party.claim_status === 'verified' && (
                          <Badge variant="secondary" className="text-xs">
                            Verified
                          </Badge>
                        )}
                        {party.official_website && (
                          <Badge variant="outline" className="text-xs">
                            <Globe className="h-3 w-3 mr-1" />
                            Website
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-1" />
                        {party.member_count || 0}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Political Parties Found</h3>
              <p className="text-muted-foreground">
                No parties match your current search criteria. Try adjusting your filters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}