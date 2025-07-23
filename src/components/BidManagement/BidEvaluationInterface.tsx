import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FileText, Award, Star, Clock, CheckCircle, XCircle, 
  Users, DollarSign, Calendar, TrendingUp, Eye, MessageSquare 
} from 'lucide-react';

interface Bid {
  id: string;
  tender_id: string;
  bidder_company_id: string;
  bid_amount_fcfa: number;
  proposal_summary: string;
  status: string;
  submitted_at: string;
  evaluation_score?: number;
  evaluation_notes?: string;
  companies?: {
    company_name: string;
    industry_sector: string;
  };
}

interface Tender {
  id: string;
  title: string;
  budget_min_fcfa: number;
  budget_max_fcfa: number;
  closing_date: string;
  status: string;
}

export const BidEvaluationInterface: React.FC<{ tenderId?: string }> = ({ tenderId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bids, setBids] = useState<Bid[]>([]);
  const [tender, setTender] = useState<Tender | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [evaluationData, setEvaluationData] = useState({
    score: 0,
    notes: '',
    status: 'under_review'
  });

  useEffect(() => {
    if (tenderId) {
      fetchTenderAndBids();
    }
  }, [tenderId]);

  const fetchTenderAndBids = async () => {
    if (!tenderId) return;

    try {
      // Fetch tender details
      const { data: tenderData, error: tenderError } = await supabase
        .from('tenders')
        .select('*')
        .eq('id', tenderId)
        .single();

      if (tenderError) throw tenderError;
      setTender(tenderData);

      // Fetch bids for this tender
      const { data: bidsData, error: bidsError } = await supabase
        .from('tender_bids')
        .select(`
          *,
          companies(company_name, industry_sector)
        `)
        .eq('tender_id', tenderId)
        .order('submitted_at', { ascending: false });

      if (bidsError) throw bidsError;
      setBids(bidsData || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const evaluateBid = async () => {
    if (!selectedBid) return;

    try {
      const { error } = await supabase
        .from('tender_bids')
        .update({
          evaluation_score: evaluationData.score,
          evaluation_notes: evaluationData.notes,
          status: evaluationData.status
        })
        .eq('id', selectedBid.id);

      if (error) throw error;

      toast({
        title: 'Bid Evaluated',
        description: 'Bid evaluation has been saved successfully.',
      });

      await fetchTenderAndBids();
      setSelectedBid(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const awardBid = async (bidId: string) => {
    try {
      // Update bid status to awarded
      const { error: bidError } = await supabase
        .from('tender_bids')
        .update({ status: 'awarded' })
        .eq('id', bidId);

      if (bidError) throw bidError;

      // Update other bids to rejected
      const { error: otherBidsError } = await supabase
        .from('tender_bids')
        .update({ status: 'rejected' })
        .eq('tender_id', tenderId)
        .neq('id', bidId);

      if (otherBidsError) throw otherBidsError;

      // Update tender status
      const { error: tenderError } = await supabase
        .from('tenders')
        .update({ status: 'awarded' })
        .eq('id', tenderId);

      if (tenderError) throw tenderError;

      // Send award notifications
      await supabase.functions.invoke('send-award-notifications', {
        body: { tender_id: tenderId, awarded_bid_id: bidId }
      });

      toast({
        title: 'Bid Awarded',
        description: 'The bid has been awarded and notifications sent.',
      });

      await fetchTenderAndBids();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      submitted: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      under_review: { color: 'bg-yellow-100 text-yellow-800', icon: Eye },
      awarded: { color: 'bg-green-100 text-green-800', icon: Award },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.submitted;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading bids...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tender && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              {tender.title}
            </CardTitle>
            <CardDescription>
              Budget: {tender.budget_min_fcfa.toLocaleString()} - {tender.budget_max_fcfa.toLocaleString()} FCFA
              • Closing: {new Date(tender.closing_date).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comparison">Compare Bids</TabsTrigger>
          <TabsTrigger value="evaluation">Evaluate</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4">
            {bids.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No bids submitted yet.</p>
                </CardContent>
              </Card>
            ) : (
              bids.map(bid => (
                <Card key={bid.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{bid.companies?.company_name}</h3>
                        <p className="text-sm text-muted-foreground">{bid.companies?.industry_sector}</p>
                      </div>
                      {getStatusBadge(bid.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
                        <span className="font-medium">{bid.bid_amount_fcfa.toLocaleString()} FCFA</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                        <span className="text-sm">{new Date(bid.submitted_at).toLocaleDateString()}</span>
                      </div>
                      {bid.evaluation_score && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-muted-foreground mr-2" />
                          <span className="text-sm">Score: {bid.evaluation_score}/100</span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{bid.proposal_summary}</p>

                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedBid(bid)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Evaluate
                      </Button>
                      {bid.status === 'under_review' && (
                        <Button 
                          size="sm"
                          onClick={() => awardBid(bid.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Award className="h-4 w-4 mr-1" />
                          Award
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Bid Comparison</CardTitle>
              <CardDescription>Compare bids side by side</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Company</th>
                      <th className="text-left p-2">Amount (FCFA)</th>
                      <th className="text-left p-2">Score</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bids.map(bid => (
                      <tr key={bid.id} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{bid.companies?.company_name}</td>
                        <td className="p-2">{bid.bid_amount_fcfa.toLocaleString()}</td>
                        <td className="p-2">{bid.evaluation_score || 'N/A'}</td>
                        <td className="p-2">{getStatusBadge(bid.status)}</td>
                        <td className="p-2">{new Date(bid.submitted_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluation">
          {selectedBid ? (
            <Card>
              <CardHeader>
                <CardTitle>Evaluate Bid: {selectedBid.companies?.company_name}</CardTitle>
                <CardDescription>Provide evaluation score and feedback</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="score">Evaluation Score (0-100)</Label>
                  <Select value={evaluationData.score.toString()} onValueChange={(value) => 
                    setEvaluationData(prev => ({ ...prev, score: parseInt(value) }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 21 }, (_, i) => i * 5).map(score => (
                        <SelectItem key={score} value={score.toString()}>{score}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={evaluationData.status} onValueChange={(value) => 
                    setEvaluationData(prev => ({ ...prev, status: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Evaluation Notes</Label>
                  <Textarea
                    id="notes"
                    value={evaluationData.notes}
                    onChange={(e) => setEvaluationData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    placeholder="Enter evaluation comments and feedback..."
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={evaluateBid}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Save Evaluation
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedBid(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a bid from the overview to evaluate.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};