import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Building2, 
  Download, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  FileText,
  Globe
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface ImportStats {
  totalParties: number;
  totalPoliticians: number;
  claimedParties: number;
  claimedPoliticians: number;
  pendingClaims: number;
  approvedClaims: number;
}

export const PoliticalImportDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Fetch import statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['political-import-stats'],
    queryFn: async (): Promise<ImportStats> => {
      const [partiesResponse, politiciansResponse, partyClaimsResponse, politicianClaimsResponse] = await Promise.all([
        supabase.from('political_parties').select('id, is_claimed').eq('auto_imported', true),
        supabase.from('politicians').select('id, is_claimed').eq('auto_imported', true),
        supabase.from('party_claims').select('id, status'),
        supabase.from('politician_claims').select('id, status')
      ]);

      const parties = partiesResponse.data || [];
      const politicians = politiciansResponse.data || [];
      const partyClaims = partyClaimsResponse.data || [];
      const politicianClaims = politicianClaimsResponse.data || [];

      return {
        totalParties: parties.length,
        totalPoliticians: politicians.length,
        claimedParties: parties.filter(p => p.is_claimed).length,
        claimedPoliticians: politicians.filter(p => p.is_claimed).length,
        pendingClaims: [...partyClaims, ...politicianClaims].filter(c => c.status === 'pending').length,
        approvedClaims: [...partyClaims, ...politicianClaims].filter(c => c.status === 'approved').length
      };
    }
  });

  // Fetch recent political parties
  const { data: recentParties } = useQuery({
    queryKey: ['recent-parties', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('political_parties')
        .select('*')
        .eq('auto_imported', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,acronym.ilike.%${searchTerm}%`);
      }

      const { data } = await query;
      return data || [];
    }
  });

  // Fetch recent politicians
  const { data: recentPoliticians } = useQuery({
    queryKey: ['recent-politicians', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('politicians')
        .select('*, political_parties(name, acronym)')
        .eq('auto_imported', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,role_title.ilike.%${searchTerm}%`);
      }

      const { data } = await query;
      return data || [];
    }
  });

  const importProgress = stats ? {
    parties: Math.min((stats.totalParties / 300) * 100, 100),
    politicians: Math.min((stats.totalPoliticians / 1000) * 100, 100)
  } : { parties: 0, politicians: 0 };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Political Import Dashboard</h1>
          <p className="text-muted-foreground">
            Manage imported political parties and politicians for Cameroon
          </p>
        </div>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Parties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalParties || 0}</div>
            <p className="text-xs text-muted-foreground">
              Target: 300+ parties
            </p>
            <Progress value={importProgress.parties} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Politicians</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPoliticians || 0}</div>
            <p className="text-xs text-muted-foreground">
              Target: 1000+ politicians
            </p>
            <Progress value={importProgress.politicians} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Claimed Profiles</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.claimedParties || 0) + (stats?.claimedPoliticians || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.claimedParties || 0} parties, {stats?.claimedPoliticians || 0} politicians
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingClaims || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search parties or politicians..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Data Tables */}
      <Tabs defaultValue="parties" className="space-y-4">
        <TabsList>
          <TabsTrigger value="parties">Political Parties</TabsTrigger>
          <TabsTrigger value="politicians">Politicians</TabsTrigger>
          <TabsTrigger value="claims">Claim Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="parties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Political Parties</CardTitle>
              <CardDescription>
                Latest imported political parties from official registries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentParties?.map((party) => (
                  <div key={party.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-medium">{party.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {party.acronym} • {party.headquarters_city}, {party.headquarters_region}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={party.is_claimed ? "default" : "secondary"}>
                        {party.is_claimed ? "Claimed" : "Unclaimed"}
                      </Badge>
                      {party.official_website && (
                        <Button size="sm" variant="outline" className="gap-2">
                          <Globe className="h-4 w-4" />
                          Website
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="politicians" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Politicians</CardTitle>
              <CardDescription>
                Latest imported politicians from official sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPoliticians?.map((politician) => (
                  <div key={politician.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-medium">{politician.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {politician.role_title} • {politician.party}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {politician.region} • {politician.level_of_office}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={politician.is_claimed ? "default" : "secondary"}>
                        {politician.is_claimed ? "Claimed" : "Unclaimed"}
                      </Badge>
                      {politician.verified && (
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Claim Management</CardTitle>
              <CardDescription>
                Review and manage profile claim requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No pending claims at the moment
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};