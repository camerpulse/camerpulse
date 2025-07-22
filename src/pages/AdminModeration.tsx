import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Eye, Flag, CheckCircle, XCircle, AlertTriangle, FileText, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function AdminModeration() {
  const [tenders, setTenders] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [moderationDialog, setModerationDialog] = useState(false);
  const [moderationNotes, setModerationNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadModerationData();
  }, []);

  const loadModerationData = async () => {
    try {
      const [tendersRes, bidsRes, verificationsRes] = await Promise.all([
        supabase.from('tenders').select('*').in('status', ['pending', 'flagged']),
        supabase.from('tender_bids').select('*, tenders(title)').eq('status', 'pending'),
        supabase.from('business_verifications').select('*').in('verification_status', ['pending', 'in_review'])
      ]);

      setTenders(tendersRes.data || []);
      setBids(bidsRes.data || []);
      setVerifications(verificationsRes.data || []);
    } catch (error) {
      console.error('Error loading moderation data:', error);
      toast({
        title: "Error",
        description: "Failed to load moderation data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModeration = async (action: string) => {
    if (!selectedItem) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Record moderation action based on item type
      if (selectedItem.title) {
        // It's a tender
        await supabase.from('tender_moderation').insert({
          tender_id: selectedItem.id,
          moderator_id: user.user.id,
          moderation_action: action,
          moderation_notes: moderationNotes,
          previous_status: selectedItem.status,
          new_status: action === 'approve' ? 'active' : action === 'reject' ? 'rejected' : 'flagged'
        });

        await supabase.from('tenders').update({
          status: action === 'approve' ? 'active' : action === 'reject' ? 'rejected' : 'flagged'
        }).eq('id', selectedItem.id);

      } else if (selectedItem.company_name) {
        // It's a business verification
        await supabase.from('business_verifications').update({
          verification_status: action === 'approve' ? 'approved' : 'rejected',
          verification_notes: moderationNotes,
          verified_by: user.user.id,
          verified_at: new Date().toISOString()
        }).eq('id', selectedItem.id);

      } else {
        // It's a bid
        await supabase.from('bid_moderation').insert({
          bid_id: selectedItem.id,
          moderator_id: user.user.id,
          moderation_action: action,
          moderation_notes: moderationNotes
        });
      }

      toast({
        title: "Success",
        description: `Item ${action}d successfully`,
      });

      setModerationDialog(false);
      setSelectedItem(null);
      setModerationNotes('');
      loadModerationData();

    } catch (error) {
      console.error('Error handling moderation:', error);
      toast({
        title: "Error",
        description: "Failed to process moderation action",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'flagged': return 'destructive';
      case 'approved': return 'default';
      case 'rejected': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading moderation dashboard...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Moderation</h1>
          </div>
          <p className="text-muted-foreground">
            Review and moderate tenders, bids, and business verifications
          </p>
        </div>

        <Tabs defaultValue="tenders" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tenders">
              Tenders ({tenders.length})
            </TabsTrigger>
            <TabsTrigger value="bids">
              Bids ({bids.length})
            </TabsTrigger>
            <TabsTrigger value="verifications">
              Business Verifications ({verifications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tenders" className="space-y-4">
            {tenders.map((tender) => (
              <Card key={tender.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {tender.title}
                    </CardTitle>
                    <Badge variant={getStatusColor(tender.status)}>
                      {tender.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {tender.category} • {tender.region} • Budget: {tender.budget_max} {tender.currency}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {tender.description?.substring(0, 200)}...
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedItem(tender);
                        setModerationDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="verifications" className="space-y-4">
            {verifications.map((verification) => (
              <Card key={verification.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {verification.company_name}
                    </CardTitle>
                    <Badge variant={getStatusColor(verification.verification_status)}>
                      {verification.verification_status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {verification.company_type} • {verification.industry_sector}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>Registration:</strong> {verification.registration_number}</p>
                    <p><strong>Address:</strong> {verification.business_address}</p>
                    <p><strong>Contact:</strong> {verification.email} • {verification.phone_number}</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedItem(verification);
                        setModerationDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Moderation Dialog */}
        <Dialog open={moderationDialog} onOpenChange={setModerationDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Moderate Item</DialogTitle>
              <DialogDescription>
                Review and take action on this item
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Moderation Notes</label>
                <Textarea
                  value={moderationNotes}
                  onChange={(e) => setModerationNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setModerationDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => handleModeration('approve')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleModeration('reject')}
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleModeration('flag')}
                  variant="secondary"
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Flag
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}