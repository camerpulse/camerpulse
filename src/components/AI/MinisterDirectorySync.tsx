import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  ExternalLink
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface Minister {
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
}

const MinisterDirectorySync = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrapingInProgress, setIsScrapingInProgress] = useState(false);

  // Fetch current ministers
  const { data: ministers, isLoading } = useQuery({
    queryKey: ['ministers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('politicians')
        .select('*')
        .ilike('role_title', '%minister%')
        .order('name');
      
      if (error) throw error;
      return data as Minister[];
    }
  });

  // Scrape ministers from government sources
  const scrapeMinistersMutation = useMutation({
    mutationFn: async () => {
      setIsScrapingInProgress(true);
      const { data, error } = await supabase.functions.invoke('government-minister-scraper', {
        body: { 
          sources: [
            'https://www.prc.cm/',
            'https://www.spm.gov.cm/',
            'https://www.crtv.cm/'
          ]
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Minister Sync Complete",
        description: `Successfully processed ${data.processed || 0} ministers. ${data.updated || 0} updated, ${data.created || 0} new entries.`,
      });
      queryClient.invalidateQueries({ queryKey: ['ministers'] });
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

  // Update minister verification status
  const updateVerificationMutation = useMutation({
    mutationFn: async ({ ministerId, verified }: { ministerId: string; verified: boolean }) => {
      const { error } = await supabase
        .from('politicians')
        .update({ verified, updated_at: new Date().toISOString() })
        .eq('id', ministerId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ministers'] });
      toast({
        title: "Verification Updated",
        description: "Minister verification status updated successfully.",
      });
    }
  });

  const filteredMinisters = ministers?.filter(minister =>
    minister.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    minister.role_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    minister.party?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const stats = {
    total: ministers?.length || 0,
    verified: ministers?.filter(m => m.verified).length || 0,
    unverified: ministers?.filter(m => !m.verified).length || 0,
    autoImported: ministers?.filter(m => m.auto_imported).length || 0,
    withPhotos: ministers?.filter(m => m.profile_image_url).length || 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Minister Directory Sync</h2>
          <p className="text-muted-foreground">
            Import and manage current Cameroonian government ministers
          </p>
        </div>
        <Button
          onClick={() => scrapeMinistersMutation.mutate()}
          disabled={isScrapingInProgress || scrapeMinistersMutation.isPending}
          className="flex items-center gap-2"
        >
          {isScrapingInProgress ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isScrapingInProgress ? 'Syncing...' : 'Sync from Government Sources'}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Ministers</p>
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
      </div>

      {/* Sync Status Alert */}
      {isScrapingInProgress && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Syncing minister data from government sources. This may take a few minutes...
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Minister Directory ({filteredMinisters.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Search ministers by name, title, or party..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Ministers List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading ministers...</div>
            ) : filteredMinisters.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No ministers found. Try adjusting your search or sync from government sources.
              </div>
            ) : (
              filteredMinisters.map((minister) => (
                <Card key={minister.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                          {minister.profile_image_url ? (
                            <img 
                              src={minister.profile_image_url} 
                              alt={minister.name}
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
                            <h3 className="font-semibold">{minister.name}</h3>
                            {minister.verified ? (
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
                            {minister.auto_imported && (
                              <Badge variant="outline">Auto-Imported</Badge>
                            )}
                          </div>
                          
                          <p className="text-sm font-medium text-primary mb-2">
                            {minister.role_title}
                          </p>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {minister.party && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                {minister.party}
                              </div>
                            )}
                            {minister.region && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {minister.region}
                              </div>
                            )}
                            {minister.term_start_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Since {new Date(minister.term_start_date).getFullYear()}
                              </div>
                            )}
                          </div>
                          
                          {minister.education && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Education: {minister.education}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Score: {minister.civic_score || 0}
                        </Badge>
                        <Button
                          size="sm"
                          variant={minister.verified ? "outline" : "default"}
                          onClick={() => updateVerificationMutation.mutate({
                            ministerId: minister.id,
                            verified: !minister.verified
                          })}
                          disabled={updateVerificationMutation.isPending}
                        >
                          {minister.verified ? 'Unverify' : 'Verify'}
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

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Official Data Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Primary</Badge>
              <a 
                href="https://www.prc.cm/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Presidency of Cameroon (prc.cm)
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Secondary</Badge>
              <a 
                href="https://www.spm.gov.cm/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Prime Minister's Office (spm.gov.cm)
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Media</Badge>
              <a 
                href="https://www.crtv.cm/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                CRTV (crtv.cm)
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MinisterDirectorySync;