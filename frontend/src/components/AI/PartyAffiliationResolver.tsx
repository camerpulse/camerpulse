import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Link, 
  Users, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Building,
  Search,
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface AffiliationStats {
  total_politicians: number;
  missing_parties: number;
  linked_parties: number;
  uncertain_affiliations: number;
}

interface MatchResult {
  politician_id: string;
  politician_name: string;
  position: string;
  old_party?: string;
  new_party: string;
  confidence_score: number;
  match_type: 'exact' | 'fuzzy' | 'manual';
}

export function PartyAffiliationResolver() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResults, setLastResults] = useState<MatchResult[]>([]);

  // Fetch affiliation statistics
  const [affiliationStats, setAffiliationStats] = useState<AffiliationStats>({
    total_politicians: 0,
    missing_parties: 0,
    linked_parties: 0,
    uncertain_affiliations: 0
  });

  // Fetch available parties
  const [availableParties, setAvailableParties] = useState<any[]>([]);

  // Run party affiliation resolver
  const resolveAffiliationsMutation = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      setProgress(0);

      const { data, error } = await supabase.functions.invoke('party-affiliation-resolver', {
        body: { 
          action: 'resolve_all_affiliations',
          confidence_threshold: 85,
          auto_link: true
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setLastResults(data?.matches || []);
      setProgress(100);
      setIsProcessing(false);
      toast({
        title: "Affiliation Resolution Complete",
        description: `Processed ${data?.total_processed || 0} politicians, made ${data?.successful_links || 0} new connections.`,
      });
      queryClient.invalidateQueries({ queryKey: ['affiliation_stats'] });
      queryClient.invalidateQueries({ queryKey: ['politicians'] });
    },
    onError: (error) => {
      setIsProcessing(false);
      setProgress(0);
      toast({
        title: "Resolution failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Scan for broken links
  const scanBrokenLinksMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('party-affiliation-resolver', {
        body: { 
          action: 'scan_broken_links'
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Scan Complete",
        description: `Found ${data?.broken_links || 0} broken party links and ${data?.missing_affiliations || 0} missing affiliations.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Scan failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fix uncertain affiliations
  const fixUncertainMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('party-affiliation-resolver', {
        body: { 
          action: 'fix_uncertain_affiliations',
          confidence_threshold: 75
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Uncertain Affiliations Fixed",
        description: `Resolved ${data?.fixed_count || 0} uncertain affiliations.`,
      });
      queryClient.invalidateQueries({ queryKey: ['affiliation_stats'] });
    },
    onError: (error) => {
      toast({
        title: "Fix failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isLoading = resolveAffiliationsMutation.isPending || scanBrokenLinksMutation.isPending || fixUncertainMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Party Affiliation Resolver
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Automatically link politicians to their correct political parties using fuzzy matching and official sources.
                This ensures accurate party membership data for analytics and civic accountability.
              </AlertDescription>
            </Alert>

            {affiliationStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {affiliationStats.total_politicians}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Politicians</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {affiliationStats.linked_parties}
                  </div>
                  <div className="text-sm text-muted-foreground">Linked to Parties</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {affiliationStats.missing_parties}
                  </div>
                  <div className="text-sm text-muted-foreground">Missing Party Links</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {affiliationStats.uncertain_affiliations}
                  </div>
                  <div className="text-sm text-muted-foreground">Uncertain Affiliations</div>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing affiliations...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Resolution Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => resolveAffiliationsMutation.mutate()}
              disabled={isLoading}
              size="lg"
              className="w-full"
            >
              {resolveAffiliationsMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Link className="h-4 w-4 mr-2" />
              )}
              Resolve All Affiliations
            </Button>

            <Button
              onClick={() => scanBrokenLinksMutation.mutate()}
              disabled={isLoading}
              variant="secondary"
              size="lg"
              className="w-full"
            >
              {scanBrokenLinksMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Scan Broken Links
            </Button>

            <Button
              onClick={() => fixUncertainMutation.mutate()}
              disabled={isLoading}
              variant="outline"
              size="lg"
              className="w-full"
            >
              {fixUncertainMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Fix Uncertain Links
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Parties Overview */}
      {availableParties && availableParties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Available Political Parties ({availableParties.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {availableParties.map((party) => (
                  <div key={party.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium text-sm">{party.name}</div>
                      {party.acronym && (
                        <div className="text-xs text-muted-foreground">{party.acronym}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Recent Resolution Results */}
      {lastResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Recent Resolution Results ({lastResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {lastResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">{result.politician_name}</div>
                        <div className="text-sm text-muted-foreground">{result.position}</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{result.new_party}</div>
                        <div className="text-xs text-muted-foreground">
                          {result.confidence_score}% confidence
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={
                          result.match_type === 'exact' ? 'default' : 
                          result.match_type === 'fuzzy' ? 'secondary' : 'outline'
                        }
                      >
                        {result.match_type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

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
              <strong>Matching Algorithm:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Exact name matching (party name, acronym)</li>
                <li>Fuzzy string matching (≥85% similarity)</li>
                <li>President name cross-referencing</li>
                <li>Regional party alignment</li>
              </ul>
            </div>
            <div>
              <strong>Affiliation Priority:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Official government records first</li>
                <li>Recent election data second</li>
                <li>Historical party membership third</li>
                <li>Unknown status for unresolved cases</li>
              </ul>
            </div>
            <div>
              <strong>Audit Trail:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All changes logged with timestamps</li>
                <li>Confidence scores tracked</li>
                <li>Manual override capability</li>
                <li>Party member count auto-updates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}