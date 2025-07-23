import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, X, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AdminTenderRatingsPage() {
  const queryClient = useQueryClient();

  // Fetch pending flags for admin review
  const { data: pendingFlags } = useQuery({
    queryKey: ['admin-pending-flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flagged_tender_entities')
        .select('*')
        .eq('status', 'active')
        .order('severity', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch recent ratings for moderation
  const { data: recentRatings } = useQuery({
    queryKey: ['admin-recent-ratings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tender_ratings')
        .select(`
          *,
          tenders (title, issuer_name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Resolve flag mutation
  const resolveFlagMutation = useMutation({
    mutationFn: async ({ flagId, resolution }: { flagId: string; resolution: 'resolved' | 'dismissed' }) => {
      const { error } = await supabase
        .from('flagged_tender_entities')
        .update({
          status: resolution,
          resolved_by: (await supabase.auth.getUser()).data.user?.id,
          resolved_at: new Date().toISOString(),
          resolution_notes: `${resolution} by admin`
        })
        .eq('id', flagId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Flag resolved successfully" });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-flags'] });
    },
  });

  // Delete rating mutation
  const deleteRatingMutation = useMutation({
    mutationFn: async (ratingId: string) => {
      const { error } = await supabase
        .from('tender_ratings')
        .delete()
        .eq('id', ratingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Rating removed successfully" });
      queryClient.invalidateQueries({ queryKey: ['admin-recent-ratings'] });
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin: Tender Ratings</h1>
          <p className="text-muted-foreground">
            Manage ratings, resolve flags, and maintain system integrity
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Settings className="h-3 w-3" />
          Admin Control
        </Badge>
      </div>

      <Tabs defaultValue="flags" className="space-y-4">
        <TabsList>
          <TabsTrigger value="flags">Pending Flags ({pendingFlags?.length || 0})</TabsTrigger>
          <TabsTrigger value="ratings">Recent Ratings</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="flags">
          <Card>
            <CardHeader>
              <CardTitle>Pending Flag Reviews</CardTitle>
              <CardDescription>Review and resolve entity flags</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingFlags?.map((flag) => (
                <div key={flag.id} className="border rounded-lg p-4 bg-amber-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <h3 className="font-semibold">{flag.entity_name}</h3>
                        <Badge variant="outline">{flag.entity_type}</Badge>
                        <Badge variant="destructive">{flag.severity}</Badge>
                      </div>
                      <p className="text-sm mb-1"><strong>Type:</strong> {flag.flag_type}</p>
                      <p className="text-sm mb-1"><strong>Reason:</strong> {flag.flag_reason}</p>
                      {flag.evidence && <p className="text-sm"><strong>Evidence:</strong> {flag.evidence}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => resolveFlagMutation.mutate({ flagId: flag.id, resolution: 'resolved' })}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => resolveFlagMutation.mutate({ flagId: flag.id, resolution: 'dismissed' })}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {(!pendingFlags || pendingFlags.length === 0) && (
                <p className="text-center text-muted-foreground py-8">No pending flags</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratings">
          <Card>
            <CardHeader>
              <CardTitle>Recent Ratings</CardTitle>
              <CardDescription>Monitor and moderate ratings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentRatings?.map((rating) => (
                <div key={rating.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{rating.tenders?.title}</h3>
                      <p className="text-sm text-muted-foreground">by {rating.tenders?.issuer_name}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span>Overall: {rating.overall_rating}/5</span>
                        <span>Quality: {rating.quality_rating}/5</span>
                        <span>Budget: {rating.budget_fidelity_rating}/5</span>
                        {rating.fraud_flag && <Badge variant="destructive">Fraud Flagged</Badge>}
                      </div>
                      {rating.comment && <p className="text-sm mt-1">"{rating.comment}"</p>}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => deleteRatingMutation.mutate(rating.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure rating system parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Rating system configuration controls coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}