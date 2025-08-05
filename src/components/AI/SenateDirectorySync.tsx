import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Building2,
  Crown,
  Star,
  MapPin,
  Calendar,
  ExternalLink,
  Filter,
  UserCheck,
  Globe
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface Senator {
  id: string;
  name: string;
  role_title: string;
  party: string;
  region: string;
  level_of_office: string;
  profile_image_url?: string;
  verified: boolean;
  civic_score: number;
  auto_imported: boolean;
  term_start_date?: string;
  birth_date?: string;
  education?: string;
  career_background?: string;
  gender?: string;
  constituency?: string;
}

const cameroonRegions = [
  'All Regions',
  'Adamawa',
  'Centre',
  'East',
  'Far North',
  'Littoral',
  'North',
  'North West',
  'South',
  'South West',
  'West'
];

const SenateDirectorySync = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedParty, setSelectedParty] = useState('All Parties');
  const [isScrapingInProgress, setIsScrapingInProgress] = useState(false);

  // Fetch current senators
  const { data: senators, isLoading } = useQuery({
    queryKey: ['senators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('politicians')
        .select('*')
        .ilike('role_title', '%senator%')
        .order('name');
      
      if (error) throw error;
      return data as Senator[];
    }
  });

  // Get unique parties for filter
  const uniqueParties = ['All Parties', ...new Set(senators?.map(s => s.party).filter(Boolean) || [])];

  // Scrape senators from Senate website
  const scrapeSenatorsMutation = useMutation({
    mutationFn: async () => {
      setIsScrapingInProgress(true);
      const { data, error } = await supabase.functions.invoke('senate-scraper', {
        body: { 
          source_url: 'https://senat.cm/?page_id=2323&lang=en',
          verify_images: true,
          link_parties: true
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Senate Sync Complete",
        description: `Successfully processed ${data.processed || 0} senators. ${data.updated || 0} updated, ${data.created || 0} new entries.`,
      });
      queryClient.invalidateQueries({ queryKey: ['senators'] });
    },
    onError: (error) => {
      toast({
        title: "Scraping Failed",
        description: error.message,
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsScrapingInProgress(false);
    }
  });

  // Update senator verification status
  const updateVerificationMutation = useMutation({
    mutationFn: async ({ senatorId, verified }: { senatorId: string; verified: boolean }) => {
      const { error } = await supabase
        .from('politicians')
        .update({ verified, updated_at: new Date().toISOString() })
        .eq('id', senatorId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['senators'] });
      toast({
        title: "Verification Updated",
        description: "Senator verification status updated successfully.",
      });
    }
  });

  const filteredSenators = senators?.filter(senator => {
    const matchesSearch = senator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         senator.role_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         senator.party?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         senator.constituency?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = selectedRegion === 'All Regions' || senator.region === selectedRegion;
    const matchesParty = selectedParty === 'All Parties' || senator.party === selectedParty;
    
    return matchesSearch && matchesRegion && matchesParty;
  }) || [];

  const stats = {
    total: senators?.length || 0,
    target: 100, // Expected total senators
    verified: senators?.filter(s => s.verified).length || 0,
    unverified: senators?.filter(s => !s.verified).length || 0,
    autoImported: senators?.filter(s => s.auto_imported).length || 0,
    withPhotos: senators?.filter(s => s.profile_image_url).length || 0,
    byRegion: cameroonRegions.slice(1).reduce((acc, region) => {
      acc[region] = senators?.filter(s => s.region === region).length || 0;
      return acc;
    }, {} as Record<string, number>)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Senate Directory Sync</h2>
          <p className="text-muted-foreground">
            Import and manage all 100 Cameroonian senators from the official Senate website
          </p>
        </div>
        <Button
          onClick={() => scrapeSenatorsMutation.mutate()}
          disabled={isScrapingInProgress || scrapeSenatorsMutation.isPending}
          className="flex items-center gap-2"
        >
          {isScrapingInProgress ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isScrapingInProgress ? 'Syncing...' : 'Sync from Senate.cm'}
        </Button>
      </div>

      {/* Progress Alert */}
      <Alert className={stats.total >= stats.target ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}>
        <Globe className="h-4 w-4" />
        <AlertDescription>
          <strong>Senate Import Progress:</strong> {stats.total} of {stats.target} senators imported
          {stats.total < stats.target && (
            <span className="ml-2 text-amber-700">
              ({stats.target - stats.total} senators still needed)
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Senators</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-amber-600" />
              <div>
                <p className="text-sm text-muted-foreground">Unverified</p>
                <p className="text-2xl font-bold text-amber-600">{stats.unverified}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Auto-Imported</p>
                <p className="text-2xl font-bold text-blue-600">{stats.autoImported}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">With Photos</p>
                <p className="text-2xl font-bold text-purple-600">{stats.withPhotos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-indigo-600" />
              <div>
                <p className="text-sm text-muted-foreground">Regions</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {Object.values(stats.byRegion).filter(count => count > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Status Alert */}
      {isScrapingInProgress && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Syncing senator data from senat.cm. This may take a few minutes as we process all 100 senators...
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Senate Directory ({filteredSenators.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <Input
              placeholder="Search senators by name, title, party, or constituency..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by region" />
              </SelectTrigger>
              <SelectContent>
                {cameroonRegions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region} {region !== 'All Regions' && `(${stats.byRegion[region] || 0})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedParty} onValueChange={setSelectedParty}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by party" />
              </SelectTrigger>
              <SelectContent>
                {uniqueParties.map((party) => (
                  <SelectItem key={party} value={party}>
                    {party}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Senators List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading senators...</div>
            ) : filteredSenators.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No senators found. Try adjusting your search or sync from the Senate website.
              </div>
            ) : (
              filteredSenators.map((senator) => (
                <Card key={senator.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                          {senator.profile_image_url ? (
                            <img 
                              src={senator.profile_image_url} 
                              alt={senator.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{senator.name}</h3>
                            {senator.verified ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Unverified
                              </Badge>
                            )}
                            {senator.auto_imported && (
                              <Badge variant="outline">Auto-Imported</Badge>
                            )}
                            {senator.gender && (
                              <Badge variant="outline" className="text-xs">
                                {senator.gender}
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm font-medium text-primary mb-2">
                            {senator.role_title}
                          </p>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {senator.party && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                {senator.party}
                              </div>
                            )}
                            {senator.region && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {senator.region}
                              </div>
                            )}
                            {senator.constituency && (
                              <div className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {senator.constituency}
                              </div>
                            )}
                            {senator.term_start_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Since {new Date(senator.term_start_date).getFullYear()}
                              </div>
                            )}
                          </div>
                          
                          {senator.education && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Education: {senator.education}
                            </p>
                          )}
                          
                          {senator.career_background && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Background: {senator.career_background}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Score: {senator.civic_score || 0}
                        </Badge>
                        <Button
                          size="sm"
                          variant={senator.verified ? "outline" : "default"}
                          onClick={() => updateVerificationMutation.mutate({
                            senatorId: senator.id,
                            verified: !senator.verified
                          })}
                          disabled={updateVerificationMutation.isPending}
                        >
                          {senator.verified ? 'Unverify' : 'Verify'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Source */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Official Data Source
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Primary</Badge>
            <a 
              href="https://senat.cm/?page_id=2323&lang=en" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Senate of Cameroon (senat.cm)
            </a>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Official list of all 100 senators with photos, regional representation, and party affiliations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SenateDirectorySync;