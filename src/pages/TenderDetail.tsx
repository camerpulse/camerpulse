import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Building, 
  Clock, 
  Eye, 
  FileText, 
  Upload, 
  Send, 
  Download, 
  MessageSquare, 
  Flag, 
  Share2,
  Bookmark,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  Target,
  FileCheck,
  Users
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TenderDetail {
  id: string;
  title: string;
  description: string;
  requirements: string;
  category: string;
  region: string;
  tender_type: string;
  budget_min: number;
  budget_max: number;
  submission_deadline: string;
  publication_date: string;
  status: string;
  published_by: string;
  contact_email: string;
  contact_phone: string;
  document_attachments: any[];
  evaluation_criteria: any[];
  bidding_instructions: string;
  views_count: number;
  bids_count: number;
  created_at: string;
}

interface Comment {
  id: string;
  user_id: string;
  comment_text: string;
  is_question: boolean;
  created_at: string;
  profiles?: { email?: string };
}

interface TenderUpdate {
  id: string;
  update_type: string;
  title: string;
  description: string;
  created_at: string;
}

export default function TenderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tender, setTender] = useState<TenderDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [updates, setUpdates] = useState<TenderUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingBid, setSubmittingBid] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isQuestion, setIsQuestion] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Bid form state
  const [bidForm, setBidForm] = useState({
    company_name: '',
    bid_amount: '',
    proposal_text: '',
    contact_email: '',
    contact_phone: '',
    experience_years: '',
    attachments: [] as File[]
  });

  useEffect(() => {
    if (id) {
      fetchTenderDetails();
      fetchComments();
      fetchUpdates();
      incrementViewCount();
    }
  }, [id]);

  const fetchTenderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('tenders')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      setTender(data);
    } catch (error) {
      console.error('Error fetching tender details:', error);
      toast.error('Failed to load tender details');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('tender_comments')
        .select(`
          *,
          profiles(email)
        `)
        .eq('tender_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
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
    }
  };

  const incrementViewCount = async () => {
    try {
      await supabase.rpc('increment_tender_views', { tender_id: id });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleBidSubmission = async () => {
    if (!bidForm.company_name || !bidForm.bid_amount || !bidForm.proposal_text) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmittingBid(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to submit a bid');
        return;
      }

      const { error } = await supabase
        .from('tender_bids')
        .insert({
          tender_id: id,
          bidder_user_id: user.id,
          company_name: bidForm.company_name,
          bid_amount: parseInt(bidForm.bid_amount),
          proposal_text: bidForm.proposal_text,
          contact_email: bidForm.contact_email,
          contact_phone: bidForm.contact_phone,
          experience_years: bidForm.experience_years ? parseInt(bidForm.experience_years) : null
        });

      if (error) throw error;

      toast.success('Bid submitted successfully!');
      setBidForm({
        company_name: '',
        bid_amount: '',
        proposal_text: '',
        contact_email: '',
        contact_phone: '',
        experience_years: '',
        attachments: []
      });
      
      // Refresh tender to update bid count
      fetchTenderDetails();
    } catch (error) {
      console.error('Error submitting bid:', error);
      toast.error('Failed to submit bid');
    } finally {
      setSubmittingBid(false);
    }
  };

  const handleCommentSubmission = async () => {
    if (!newComment.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to comment');
        return;
      }

      const { error } = await supabase
        .from('tender_comments')
        .insert({
          tender_id: id,
          user_id: user.id,
          comment_text: newComment,
          is_question: isQuestion
        });

      if (error) throw error;

      setNewComment('');
      setIsQuestion(false);
      fetchComments();
      toast.success('Comment posted successfully!');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      notation: 'compact'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'awarded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-48 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Tender Not Found</h1>
          <p className="text-muted-foreground mb-4">The tender you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/tenders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tenders
          </Button>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(tender.submission_deadline);
  const isExpired = daysRemaining < 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/tenders')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tenders
        </Button>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Bookmark className="h-4 w-4 mr-2" />
            Bookmark
          </Button>
          <Button variant="outline" size="sm">
            <Flag className="h-4 w-4 mr-2" />
            Report
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tender Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold">{tender.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {tender.category}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {tender.region}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {tender.views_count} views
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {tender.bids_count} bids
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(tender.status)}>
                  {tender.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Budget Range</p>
                    <p className="font-semibold">
                      {formatCurrency(tender.budget_min)} - {formatCurrency(tender.budget_max)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Submission Deadline</p>
                    <p className="font-semibold">{formatDate(tender.submission_deadline)}</p>
                    {!isExpired && (
                      <p className="text-sm text-orange-600">{daysRemaining} days remaining</p>
                    )}
                    {isExpired && (
                      <p className="text-sm text-red-600">Expired</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Published</p>
                    <p className="font-semibold">{formatDate(tender.publication_date)}</p>
                    <p className="text-sm text-muted-foreground">by {tender.published_by}</p>
                  </div>
                </div>
              </div>

              {isExpired && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-red-800 font-medium">This tender has expired and is no longer accepting bids.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{tender.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {tender.requirements && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{tender.requirements}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Evaluation Criteria */}
          {tender.evaluation_criteria && tender.evaluation_criteria.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Evaluation Criteria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {tender.evaluation_criteria.map((criteria, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>{criteria}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments & Questions ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Comment Form */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Ask a question or leave a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isQuestion"
                      checked={isQuestion}
                      onChange={(e) => setIsQuestion(e.target.checked)}
                    />
                    <Label htmlFor="isQuestion" className="text-sm">Mark as question</Label>
                  </div>
                  <Button onClick={handleCommentSubmission} disabled={!newComment.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Post Comment
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="space-y-2">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {comment.profiles?.email || 'Anonymous User'}
                          </span>
                          {comment.is_question && (
                            <Badge variant="outline" className="text-xs">Question</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm">{comment.comment_text}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No comments yet. Be the first to ask a question or leave a comment!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Bid Form & Contact Info */}
        <div className="space-y-6">
          {/* Bid Submission Form */}
          {!isExpired && tender.status.toLowerCase() === 'open' && (
            <Card>
              <CardHeader>
                <CardTitle>Submit Your Bid</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name *</Label>
                  <Input
                    id="company"
                    value={bidForm.company_name}
                    onChange={(e) => setBidForm(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder="Your company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Bid Amount (XAF) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={bidForm.bid_amount}
                    onChange={(e) => setBidForm(prev => ({ ...prev, bid_amount: e.target.value }))}
                    placeholder="Enter your bid amount"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proposal">Proposal *</Label>
                  <Textarea
                    id="proposal"
                    value={bidForm.proposal_text}
                    onChange={(e) => setBidForm(prev => ({ ...prev, proposal_text: e.target.value }))}
                    placeholder="Describe your proposal and approach..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={bidForm.contact_email}
                    onChange={(e) => setBidForm(prev => ({ ...prev, contact_email: e.target.value }))}
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Phone</Label>
                  <Input
                    id="phone"
                    value={bidForm.contact_phone}
                    onChange={(e) => setBidForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                    placeholder="+237 XXX XXX XXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={bidForm.experience_years}
                    onChange={(e) => setBidForm(prev => ({ ...prev, experience_years: e.target.value }))}
                    placeholder="Years in business"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Attachments</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload supporting documents (PDF, DOC, XLS)
                      </p>
                      <Button variant="outline" size="sm">
                        Choose Files
                      </Button>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleBidSubmission}
                  disabled={submittingBid}
                >
                  {submittingBid ? 'Submitting...' : 'Submit Bid'}
                </Button>

                <p className="text-xs text-muted-foreground">
                  By submitting a bid, you agree to the terms and conditions of this tender.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{tender.published_by}</span>
              </div>
              {tender.contact_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${tender.contact_email}`} className="text-sm text-primary hover:underline">
                    {tender.contact_email}
                  </a>
                </div>
              )}
              {tender.contact_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${tender.contact_phone}`} className="text-sm text-primary hover:underline">
                    {tender.contact_phone}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Tender Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Views</span>
                <span className="font-medium">{tender.views_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Bids Submitted</span>
                <span className="font-medium">{tender.bids_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Days Published</span>
                <span className="font-medium">
                  {Math.floor((new Date().getTime() - new Date(tender.publication_date).getTime()) / (1000 * 60 * 60 * 24))}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}