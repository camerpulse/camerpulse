import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { RefreshCw, Shield, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIVerificationModalProps {
  targetId: string;
  targetType: "politician" | "political_party";
  targetName: string;
  children: React.ReactNode;
}

export const AIVerificationModal = ({ 
  targetId, 
  targetType, 
  targetName, 
  children 
}: AIVerificationModalProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch verification data
  const { data: verification, isLoading } = useQuery({
    queryKey: ["ai-verification", targetType, targetId],
    queryFn: async () => {
      const table = targetType === "politician" ? "politician_ai_verification" : "party_ai_verification";
      const { data, error } = await supabase
        .from(table as any)
        .select("*")
        .eq(targetType === "politician" ? "politician_id" : "party_id", targetId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: open
  });

  // Fetch recent logs
  const { data: recentLogs } = useQuery({
    queryKey: ["ai-verification-logs", targetType, targetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("politica_ai_logs")
        .select("*")
        .eq("target_type", targetType)
        .eq("target_id", targetId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: open
  });

  // Request rescan mutation
  const rescanMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('politica-ai-scanner', {
        body: {
          target_id: targetId,
          target_type: targetType,
          manual_scan: true
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Rescan Requested",
        description: `AI verification rescan started for ${targetName}`,
      });
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["ai-verification", targetType, targetId] });
      queryClient.invalidateQueries({ queryKey: ["ai-verification-logs", targetType, targetId] });
    },
    onError: (error: any) => {
      toast({
        title: "Rescan Failed",
        description: error.message || "Failed to request AI rescan",
        variant: "destructive",
      });
    }
  });

  const handleRequestRescan = () => {
    rescanMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            AI Verification - {targetName}
          </DialogTitle>
          <DialogDescription>
            Detailed Politica AI verification status and history
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {isLoading ? (
            <div>Loading verification data...</div>
          ) : verification ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Verification Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <Badge variant={
                    (verification as any)?.verification_status === 'verified' ? 'default' :
                    (verification as any)?.verification_status === 'disputed' ? 'destructive' : 'secondary'
                  }>
                    {(verification as any)?.verification_status || 'unknown'}
                  </Badge>
                </div>
                
                {(verification as any)?.verification_score && (
                  <div className="flex items-center justify-between">
                    <span>Confidence Score:</span>
                    <span>{Math.round((verification as any).verification_score * 100)}%</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span>Sources Verified:</span>
                  <span>{(verification as any)?.sources_count || 0}</span>
                </div>
                
                {(verification as any)?.last_verified_at && (
                  <div className="flex items-center justify-between">
                    <span>Last Verified:</span>
                    <span className="text-sm">
                      {new Date((verification as any).last_verified_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={handleRequestRescan}
                  disabled={rescanMutation.isPending}
                  className="w-full"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${rescanMutation.isPending ? 'animate-spin' : ''}`} />
                  {rescanMutation.isPending ? 'Scanning...' : 'Request Re-scan'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Not Yet Verified</h3>
                <p className="text-muted-foreground mb-4">
                  This profile hasn't been scanned by Politica AI yet.
                </p>
                <Button onClick={handleRequestRescan} disabled={rescanMutation.isPending}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${rescanMutation.isPending ? 'animate-spin' : ''}`} />
                  {rescanMutation.isPending ? 'Scanning...' : 'Start Verification'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          {recentLogs && recentLogs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent AI Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                      <div>
                        <span className="font-medium">{log.action_type}</span>
                        <span className="text-muted-foreground ml-2">
                          {new Date(log.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <Badge variant={
                        log.status === 'completed' ? 'default' :
                        log.status === 'failed' ? 'destructive' : 'secondary'
                      }>
                        {log.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" asChild className="flex-1">
              <a href="/politica-ai" target="_blank">
                <ExternalLink className="w-4 h-4 mr-2" />
                View AI Dashboard
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};