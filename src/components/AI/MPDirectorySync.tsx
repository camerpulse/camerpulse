import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Download, 
  Users, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Building
} from 'lucide-react';

export function MPDirectorySync() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mpCount, setMpCount] = useState(0);

  // Start MP import process
  const importMPsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('assembly-scraper', {
        body: { 
          action: 'import_mps',
          source_url: 'https://www.assnat.cm/index.php/en/members/10th-legislative',
          legislative_session: '10th Legislature'
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "MP Import Started",
        description: `Importing ${data?.total_pages || 10} pages of National Assembly members...`,
      });
      queryClient.invalidateQueries({ queryKey: ['politicians'] });
    },
    onError: (error) => {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Verify existing MP data
  const verifyMPsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('assembly-scraper', {
        body: { 
          action: 'verify_mps',
          legislative_session: '10th Legislature'
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "MP Verification Started",
        description: "Validating existing MP data against official sources...",
      });
      queryClient.invalidateQueries({ queryKey: ['politicians'] });
    },
    onError: (error) => {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update MP party affiliations
  const updateAffiliationsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('assembly-scraper', {
        body: { 
          action: 'update_affiliations',
          legislative_session: '10th Legislature'
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Affiliation Update Started",
        description: "Matching MPs to political parties...",
      });
      queryClient.invalidateQueries({ queryKey: ['politicians'] });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isLoading = importMPsMutation.isPending || verifyMPsMutation.isPending || updateAffiliationsMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            MP Directory Sync - 10th Legislative Assembly
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Import and sync all Members of Parliament from the National Assembly website (assnat.cm). 
                This will scrape all 10+ pages of MPs from the 10th Legislative Assembly.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {mpCount}
                </div>
                <div className="text-sm text-muted-foreground">MPs Currently in System</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">
                  ~19
                </div>
                <div className="text-sm text-muted-foreground">Political Parties Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">
                  ~180
                </div>
                <div className="text-sm text-muted-foreground">Expected Total MPs</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Import Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => importMPsMutation.mutate()}
              disabled={isLoading}
              size="lg"
              className="w-full"
            >
              {importMPsMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Import All MPs
            </Button>

            <Button
              onClick={() => verifyMPsMutation.mutate()}
              disabled={isLoading}
              variant="secondary"
              size="lg"
              className="w-full"
            >
              {verifyMPsMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Verify Existing
            </Button>

            <Button
              onClick={() => updateAffiliationsMutation.mutate()}
              disabled={isLoading}
              variant="outline"
              size="lg"
              className="w-full"
            >
              {updateAffiliationsMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Building className="h-4 w-4 mr-2" />
              )}
              Update Parties
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Technical Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <strong>Source:</strong> https://www.assnat.cm/index.php/en/members/10th-legislative
            </div>
            <div>
              <strong>Data Points Extracted:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Full Name and Official Photo</li>
                <li>Political Party Affiliation</li>
                <li>Region/Constituency</li>
                <li>Position/Title in Assembly</li>
                <li>Biography and Background</li>
                <li>Committee Memberships</li>
                <li>Legislative Entry Date</li>
              </ul>
            </div>
            <div>
              <strong>Post-Processing:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Party name matching and auto-creation</li>
                <li>Image verification and validation</li>
                <li>Rating system initialization (0-5 stars)</li>
                <li>Legislative session tagging</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}