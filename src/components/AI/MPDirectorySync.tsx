
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

  // Get current MP count
  const { data: mpCount = 0 } = useQuery({
    queryKey: ['mp-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('mps')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Import MPs mutation
  const importMPsMutation = useMutation({
    mutationFn: async () => {
      console.log('Starting MP import...');
      const { data, error } = await supabase.functions.invoke('mp-data-importer');

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }
      
      console.log('Import response:', data);
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "MP Import Completed",
        description: `Successfully imported ${data?.imported || 0} MPs from the National Assembly website.`,
      });
      queryClient.invalidateQueries({ queryKey: ['mp-count'] });
      queryClient.invalidateQueries({ queryKey: ['mps'] });
    },
    onError: (error) => {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: error.message || "Failed to import MPs. Please try again.",
        variant: "destructive",
      });
    },
  });

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
                Import all Members of Parliament from the National Assembly website (assnat.cm). 
                This will scrape MPs from the 10th Legislative Assembly.
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
                  ~10
                </div>
                <div className="text-sm text-muted-foreground">Regions Represented</div>
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
          <div className="flex justify-center">
            <Button
              onClick={() => importMPsMutation.mutate()}
              disabled={importMPsMutation.isPending}
              size="lg"
              className="w-full max-w-md"
            >
              {importMPsMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {importMPsMutation.isPending ? 'Importing MPs...' : 'Import All MPs'}
            </Button>
          </div>
          
          {mpCount > 0 && (
            <div className="mt-4 text-center">
              <Badge variant="secondary" className="flex items-center gap-1 w-fit mx-auto">
                <CheckCircle className="h-4 w-4" />
                {mpCount} MPs already imported
              </Badge>
            </div>
          )}
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
                <li>Full Name and Honorific Titles</li>
                <li>Political Party Affiliation</li>
                <li>Region/Constituency</li>
                <li>Legislative Session Information</li>
                <li>Term Start and End Dates</li>
              </ul>
            </div>
            <div>
              <strong>Post-Processing:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Automatic scoring system initialization</li>
                <li>Rating system setup (0-5 stars)</li>
                <li>Legislative activity tracking</li>
                <li>Duplicate prevention</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
