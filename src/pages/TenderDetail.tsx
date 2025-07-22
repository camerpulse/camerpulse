import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Clock, 
  Eye, 
  Users, 
  Building, 
  Send,
  ArrowLeft,
  Award,
  FileText,
  AlertCircle,
  MessageCircle,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define interfaces based on actual database schema
interface TenderDetail {
  id: string;
  title: string;
  description: string;
  tender_type: string;
  category: string;
  region: string;
  published_by_company_id?: string;
  published_by_user_id: string;
  budget_min?: number;
  budget_max?: number;
  currency: string;
  deadline: string;
  bid_opening_date?: string;
  eligibility_criteria?: string;
  instructions?: string;
  evaluation_criteria?: string;
  documents?: any;
  status: string;
  is_featured: boolean;
  views_count: number;
  bids_count: number;
  awarded_to_company_id?: string;
  awarded_at?: string;
  award_amount?: number;
  created_at: string;
  updated_at: string;
  payment_plan_id?: string;
  payment_status?: string;
}

interface TenderBid {
  id: string;
  tender_id: string;
  company_id: string;
  user_id: string;
  technical_proposal: string;
  financial_proposal: any;
  bid_amount: number;
  currency: string;
  documents?: any;
  status: string;
  notes?: string;
  submitted_at: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

interface Comment {
  id: string;
  tender_id: string;
  user_id: string;
  comment_text: string;
  parent_comment_id?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface TenderUpdate {
  id: string;
  tender_id: string;
  update_type: string;
  title: string;
  content: string;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export default function TenderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [tender, setTender] = useState<TenderDetail | null>(null);
  const [bids, setBids] = useState<TenderBid[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [updates, setUpdates] = useState<TenderUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Bid form state
  const [bidForm, setBidForm] = useState({
    technical_proposal: '',
    bid_amount: '',
    currency: 'FCFA',
    notes: ''
  });
  
  // Comment form state
  const [newComment, setNewComment] = useState('');
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTenderDetails();
      fetchBids();
      fetchComments();
      fetchUpdates();
      incrementViews();
    }
  }, [id]);

  const fetchTenderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('tenders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setTender(data);
    } catch (error) {
      console.error('Error fetching tender:', error);
      toast({
        title: "Error",
        description: "Failed to load tender details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    try {
      const { data, error } = await supabase
        .from('tender_bids')
        .select('*')
        .eq('tender_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBids(data || []);
    } catch (error) {
      console.error('Error fetching bids:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('tender_comments')
        .select('*')
        .eq('tender_id', id)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Set empty array if table doesn't exist yet or other error
      setComments([]);
    }
  };

  const fetchUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('tender_updates')
        .select('*')
        .eq('tender_id', id)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error('Error fetching updates:', error);
      // Set empty array if table doesn't exist yet or other error
      setUpdates([]);
    }
  };

  const incrementViews = async () => {
    try {
      if (tender) {
        await supabase
          .from('tenders')
          .update({ views_count: tender.views_count + 1 })
          .eq('id', id);
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bidForm.technical_proposal || !bidForm.bid_amount) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required bid fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmittingBid(true);

    try {
      const { error } = await supabase
        .from('tender_bids')
        .insert({
          tender_id: id!,
          user_id: 'temp-user-id', // Will be replaced with actual user ID when auth is implemented
          company_id: 'temp-company-id',
          technical_proposal: bidForm.technical_proposal,
          financial_proposal: { details: 'Financial proposal details' },
          bid_amount: parseInt(bidForm.bid_amount),
          currency: bidForm.currency,
          notes: bidForm.notes,
          status: 'submitted'
        });

      if (error) throw error;

      toast({
        title: "Bid Submitted Successfully",
        description: "Your bid has been submitted and is under review."
      });

      setBidForm({
        technical_proposal: '',
        bid_amount: '',
        currency: 'FCFA',
        notes: ''
      });

      fetchBids();
    } catch (error: any) {
      toast({
        title: "Error Submitting Bid",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingBid(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);

    try {
      const { error } = await supabase
        .from('tender_comments')
        .insert({
          tender_id: id!,
          user_id: 'temp-user-id', // Will be replaced with actual user ID when auth is implemented
          comment_text: newComment.trim(),
          is_public: true
        });

      if (error) throw error;

      toast({
        title: "Comment Added",
        description: "Your comment has been posted."
      });

      setNewComment('');
      fetchComments();
    } catch (error: any) {
      toast({
        title: "Error Adding Comment",
        description: "Could not add comment at this time.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'FCFA') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency === 'FCFA' ? 'XAF' : currency,
      minimumFractionDigits: 0,
      notation: 'compact'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-red-100 text-red-800 border-red-200';
      case 'awarded': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading tender details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Tender Not Found</h1>
          <p className="text-muted-foreground mb-4">The tender you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/tenders')}>Back to Tenders</Button>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(tender.deadline);
  const isExpired = daysRemaining < 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/tenders')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tenders
        </Button>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(tender.status)}>
                {tender.status.toUpperCase()}
              </Badge>
              {tender.is_featured && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Award className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{tender.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {tender.region}
              </span>
              <span className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                {tender.category}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {tender.views_count} views
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {tender.bids_count} bids
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-foreground mb-1">
              {tender.budget_min && tender.budget_max 
                ? `${formatCurrency(tender.budget_min)} - ${formatCurrency(tender.budget_max, tender.currency)}`
                : 'Budget TBD'
              }
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              {isExpired ? (
                <span className="text-red-600 font-medium">Expired</span>
              ) : (
                <span className="text-green-600 font-medium">
                  {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Deadline: {format(new Date(tender.deadline), 'PPP')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bid">Submit Bid</TabsTrigger>
          <TabsTrigger value="discussion">Discussion ({comments.length})</TabsTrigger>
          <TabsTrigger value="updates">Updates ({updates.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground whitespace-pre-wrap">{tender.description}</p>
            </CardContent>
          </Card>

          {/* Requirements & Criteria */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tender.eligibility_criteria && (
              <Card>
                <CardHeader>
                  <CardTitle>Eligibility Criteria</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{tender.eligibility_criteria}</p>
                </CardContent>
              </Card>
            )}

            {tender.evaluation_criteria && (
              <Card>
                <CardHeader>
                  <CardTitle>Evaluation Criteria</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{tender.evaluation_criteria}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Submission Instructions */}
          {tender.instructions && (
            <Card>
              <CardHeader>
                <CardTitle>Submission Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{tender.instructions}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bid" className="space-y-6">
          {isExpired ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Bidding Closed</h3>
                  <p className="text-muted-foreground">The deadline for this tender has passed.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Submit Your Bid</CardTitle>
                <CardDescription>
                  Please provide your technical and financial proposal for this tender.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBidSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="technical_proposal">Technical Proposal *</Label>
                    <Textarea
                      id="technical_proposal"
                      value={bidForm.technical_proposal}
                      onChange={(e) => setBidForm(prev => ({ ...prev, technical_proposal: e.target.value }))}
                      placeholder="Describe your approach, methodology, and technical solution..."
                      className="mt-1 min-h-32"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bid_amount">Bid Amount *</Label>
                      <Input
                        id="bid_amount"
                        type="number"
                        value={bidForm.bid_amount}
                        onChange={(e) => setBidForm(prev => ({ ...prev, bid_amount: e.target.value }))}
                        placeholder="Enter your bid amount"
                        className="mt-1"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <select
                        id="currency"
                        value={bidForm.currency}
                        onChange={(e) => setBidForm(prev => ({ ...prev, currency: e.target.value }))}
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="FCFA">FCFA</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={bidForm.notes}
                      onChange={(e) => setBidForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any additional information or clarifications..."
                      className="mt-1"
                    />
                  </div>

                  <div className="flex justify-end">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button type="button" disabled={isSubmittingBid}>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Bid
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Bid Submission</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to submit this bid? Once submitted, you may not be able to modify it.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleBidSubmit}>
                            Yes, Submit Bid
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="discussion" className="space-y-6">
          {/* Add Comment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Join the Discussion</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts or ask questions about this tender..."
                  className="min-h-24"
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmittingComment || !newComment.trim()}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Post Comment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">Anonymous User</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.created_at), 'PPp')}
                      </span>
                    </div>
                    <p className="text-foreground">{comment.comment_text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Comments Yet</h3>
                  <p className="text-muted-foreground">Be the first to start the discussion!</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="updates" className="space-y-6">
          {updates.length > 0 ? (
            <div className="space-y-4">
              {updates.map((update) => (
                <Card key={update.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{update.title}</CardTitle>
                      <Badge variant="outline">{update.update_type}</Badge>
                    </div>
                    <CardDescription>
                      {format(new Date(update.created_at), 'PPp')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground whitespace-pre-wrap">{update.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Info className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Updates Yet</h3>
                  <p className="text-muted-foreground">Updates and announcements will appear here.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}