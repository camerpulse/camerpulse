import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  DollarSign, 
  Upload, 
  Send,
  Award,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Trophy
} from 'lucide-react';
import { format } from 'date-fns';

interface TenderBid {
  id: string;
  tender_id: string;
  bidder_user_id: string;
  company_name: string;
  company_registration_number?: string;
  bid_amount: number;
  bid_currency: string;
  proposal_summary: string;
  proposal_document_url?: string;
  technical_score: number;
  financial_score: number;
  overall_score: number;
  bid_status: string;
  is_compliant?: boolean;
  compliance_notes?: string;
  submission_deadline: string;
  submitted_at: string;
  bid_rank?: number;
  created_at: string;
  updated_at: string;
}

interface BidActivity {
  id: string;
  tender_id: string;
  bid_id: string;
  activity_type: string;
  activity_title: string;
  activity_description?: string;
  is_public: boolean;
  created_at: string;
}

interface BiddingInterfaceProps {
  tenderId: string;
  tenderTitle: string;
  submissionDeadline: string;
  isExpired: boolean;
}

export const BiddingInterface: React.FC<BiddingInterfaceProps> = ({ 
  tenderId, 
  tenderTitle, 
  submissionDeadline,
  isExpired 
}) => {
  const [bidForm, setBidForm] = useState({
    company_name: '',
    company_registration_number: '',
    bid_amount: '',
    proposal_summary: '',
    proposal_document_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current user's bid for this tender
  const { data: userBid, isLoading: bidLoading } = useQuery({
    queryKey: ['user_bid', tenderId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .eq('tender_id', tenderId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user bid:', error);
        return null;
      }

      return data;
    }
  });

  // Fetch all bids for leaderboard (public transparency)
  const { data: allBids, isLoading: bidsLoading } = useQuery({
    queryKey: ['tender_bids', tenderId],
    queryFn: async (): Promise<TenderBid[]> => {
      const { data, error } = await supabase
        .from('tender_bids')
        .select('*')
        .eq('tender_id', tenderId)
        .in('bid_status', ['submitted', 'under_review', 'shortlisted', 'accepted', 'rejected'])
        .order('bid_rank', { ascending: true });

      if (error) {
        console.error('Error fetching bids:', error);
        return [];
      }

      return data || [];
    }
  });

  // Fetch bid activities for real-time tracking
  const { data: activities } = useQuery({
    queryKey: ['bid_activities', tenderId],
    queryFn: async (): Promise<BidActivity[]> => {
      const { data, error } = await supabase
        .from('bid_activities')
        .select('*')
        .eq('tender_id', tenderId)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching activities:', error);
        return [];
      }

      return data || [];
    }
  });

  // Real-time subscription for bid updates
  useEffect(() => {
    const channel = supabase
      .channel('tender-bids-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tender_bids',
          filter: `tender_id=eq.${tenderId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['tender_bids', tenderId] });
          queryClient.invalidateQueries({ queryKey: ['user_bid', tenderId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bid_activities',
          filter: `tender_id=eq.${tenderId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['bid_activities', tenderId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenderId, queryClient]);

  // Submit bid mutation
  const submitBidMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const bidData = {
        tender_id: tenderId,
        bidder_user_id: user.id,
        company_name: bidForm.company_name,
        company_registration_number: bidForm.company_registration_number,
        bid_amount: parseInt(bidForm.bid_amount) * 100, // Convert to cents
        bid_currency: 'FCFA',
        proposal_summary: bidForm.proposal_summary,
        proposal_document_url: bidForm.proposal_document_url,
        submission_deadline: submissionDeadline,
        bid_status: 'submitted'
      };

      const { data, error } = await supabase
        .from('tender_bids')
        .insert(bidData)
        .select()
        .single();

      if (error) throw error;

      // Create activity log
      await supabase
        .from('bid_activities')
        .insert({
          tender_id: tenderId,
          bid_id: data.id,
          activity_type: 'bid_submitted',
          activity_title: 'New Bid Submitted',
          activity_description: `${bidForm.company_name} submitted a bid of ${parseInt(bidForm.bid_amount).toLocaleString()} FCFA`,
          triggered_by: user.id,
          is_public: true
        });

      return data;
    },
    onSuccess: () => {
      toast({ title: "Bid submitted successfully!" });
      setBidForm({
        company_name: '',
        company_registration_number: '',
        bid_amount: '',
        proposal_summary: '',
        proposal_document_url: ''
      });
      queryClient.invalidateQueries({ queryKey: ['user_bid', tenderId] });
      queryClient.invalidateQueries({ queryKey: ['tender_bids', tenderId] });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to submit bid", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleSubmitBid = () => {
    if (!bidForm.company_name.trim() || !bidForm.bid_amount.trim() || !bidForm.proposal_summary.trim()) {
      toast({
        title: "Incomplete form",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    submitBidMutation.mutate();
    setIsSubmitting(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted': return 'bg-green-100 text-green-800';
      case 'accepted': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <Clock className="w-4 h-4" />;
      case 'under_review': return <Eye className="w-4 h-4" />;
      case 'shortlisted': return <TrendingUp className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'withdrawn': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (bidLoading || bidsLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bidding Form */}
      {!userBid && !isExpired ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="w-5 h-5" />
              <span>Submit Your Bid</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={bidForm.company_name}
                  onChange={(e) => setBidForm({...bidForm, company_name: e.target.value})}
                  placeholder="Your company name"
                />
              </div>
              <div>
                <Label htmlFor="registration_number">Registration Number</Label>
                <Input
                  id="registration_number"
                  value={bidForm.company_registration_number}
                  onChange={(e) => setBidForm({...bidForm, company_registration_number: e.target.value})}
                  placeholder="Company registration number"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bid_amount">Bid Amount (FCFA) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="bid_amount"
                  type="number"
                  value={bidForm.bid_amount}
                  onChange={(e) => setBidForm({...bidForm, bid_amount: e.target.value})}
                  placeholder="Enter your bid amount"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="proposal_summary">Proposal Summary *</Label>
              <Textarea
                id="proposal_summary"
                value={bidForm.proposal_summary}
                onChange={(e) => setBidForm({...bidForm, proposal_summary: e.target.value})}
                placeholder="Describe your proposal and how you plan to deliver this project..."
                className="min-h-[120px]"
              />
            </div>

            <div>
              <Label htmlFor="document_url">Supporting Document URL</Label>
              <div className="relative">
                <Upload className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="document_url"
                  value={bidForm.proposal_document_url}
                  onChange={(e) => setBidForm({...bidForm, proposal_document_url: e.target.value})}
                  placeholder="Upload your detailed proposal document"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-muted-foreground">
                Deadline: {format(new Date(submissionDeadline), 'PPp')}
              </div>
              <Button 
                onClick={handleSubmitBid}
                disabled={isSubmitting || submitBidMutation.isPending}
                className="px-6"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Bid
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : userBid ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Your Bid Status</span>
              </div>
              <Badge className={getStatusColor(userBid.bid_status)}>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(userBid.bid_status)}
                  <span>{userBid.bid_status.replace('_', ' ').toUpperCase()}</span>
                </div>
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Company</p>
                <p className="font-semibold">{userBid.company_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bid Amount</p>
                <p className="font-semibold text-lg">{(userBid.bid_amount / 100).toLocaleString()} FCFA</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Rank</p>
                <p className="font-semibold flex items-center">
                  <Trophy className="w-4 h-4 mr-1" />
                  #{userBid.bid_rank || 'TBD'}
                </p>
              </div>
            </div>
            {userBid.overall_score > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Overall Score</p>
                <div className="flex items-center space-x-4">
                  <Progress value={userBid.overall_score} className="flex-1" />
                  <span className="font-semibold">{userBid.overall_score}/100</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : isExpired ? (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Bidding Closed</h3>
            <p className="text-muted-foreground">The deadline for this tender has passed.</p>
          </CardContent>
        </Card>
      ) : null}

      {/* Real-time Bid Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Live Bid Leaderboard ({allBids.length} bids)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allBids.length > 0 ? (
            <div className="space-y-3">
              {allBids.slice(0, 10).map((bid, index) => (
                <div key={bid.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      #{bid.bid_rank || index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{bid.company_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Submitted {format(new Date(bid.submitted_at), 'MMM d, HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{(bid.bid_amount / 100).toLocaleString()} FCFA</p>
                    <Badge className={getStatusColor(bid.bid_status)} size="sm">
                      {bid.bid_status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No bids submitted yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Feed */}
      {activities && activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.activity_title}</p>
                    {activity.activity_description && (
                      <p className="text-sm text-muted-foreground">{activity.activity_description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(activity.created_at), 'MMM d, HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};