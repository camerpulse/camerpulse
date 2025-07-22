import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DocumentManager } from "@/components/Tenders/DocumentManager";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Calendar, 
  MapPin, 
  Building2, 
  DollarSign, 
  FileText, 
  Clock, 
  Bookmark,
  Download,
  Flag,
  Users,
  CheckCircle2
} from "lucide-react";

interface Tender {
  id: string;
  title: string;
  description: string;
  category: string;
  region: string;
  tender_type: string;
  budget_min: number;
  budget_max: number;
  submission_deadline: string;
  requirements?: string;
  evaluation_criteria?: string;
  status: string;
  published_by: string;
  bids_count: number;
  created_at: string;
  // Additional database fields that might be present
  award_amount?: number;
  awarded_at?: string;
  awarded_to_company_id?: string;
  bid_opening_date?: string;
  views_count?: number;
}

export default function TenderDetail() {
  const { id } = useParams();
  const [tender, setTender] = useState<Tender | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTenderDetails();
      checkBookmarkStatus();
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
      if (!data) {
        setTender(null);
        return;
      }

      // Map the database fields to our interface structure safely
      const mappedTender: Tender = {
        id: data.id,
        title: data.title,
        description: data.description,
        category: data.category,
        region: data.region,
        tender_type: data.tender_type,
        budget_min: data.budget_min,
        budget_max: data.budget_max,
        submission_deadline: (data as any).submission_deadline || (data as any).deadline || '',
        requirements: (data as any).requirements || '',
        evaluation_criteria: (data as any).evaluation_criteria || '',
        status: data.status,
        published_by: (data as any).published_by || '',
        bids_count: data.bids_count || 0,
        created_at: data.created_at,
        award_amount: (data as any).award_amount,
        awarded_at: (data as any).awarded_at,
        awarded_to_company_id: (data as any).awarded_to_company_id,
        bid_opening_date: (data as any).bid_opening_date,
        views_count: (data as any).views_count
      };
      
      setTender(mappedTender);
    } catch (error) {
      console.error('Error fetching tender:', error);
      toast.error('Failed to load tender details');
    } finally {
      setLoading(false);
    }
  };

  const checkBookmarkStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('tender_bookmarks')
        .select('id')
        .eq('tender_id', id)
        .eq('user_id', user.id)
        .single();

      setIsBookmarked(!!data);
    } catch (error) {
      // User not logged in or bookmark doesn't exist
    }
  };

  const toggleBookmark = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to bookmark tenders');
        return;
      }

      if (isBookmarked) {
        await supabase
          .from('tender_bookmarks')
          .delete()
          .eq('tender_id', id)
          .eq('user_id', user.id);
        setIsBookmarked(false);
        toast.success('Bookmark removed');
      } else {
        await supabase
          .from('tender_bookmarks')
          .insert({
            tender_id: id,
            user_id: user.id
          });
        setIsBookmarked(true);
        toast.success('Tender bookmarked');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmark');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-500';
      case 'closed': return 'bg-red-500';
      case 'draft': return 'bg-yellow-500';
      case 'awarded': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Tender Not Found</h1>
          <p className="text-gray-600 mb-6">The tender you're looking for doesn't exist or has been removed.</p>
          <Link to="/tenders">
            <Button>Back to Tenders</Button>
          </Link>
        </div>
      </div>
    );
  }

  const daysRemaining = calculateDaysRemaining(tender.submission_deadline);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Tender Summary Banner */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${getStatusColor(tender.status)} text-white`}>
                    {tender.status.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">{tender.tender_type}</Badge>
                </div>
                <CardTitle className="text-2xl lg:text-3xl mb-4">{tender.title}</CardTitle>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{formatCurrency(tender.budget_min)} - {formatCurrency(tender.budget_max)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{tender.region}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{tender.bids_count} bids</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 lg:min-w-[200px]">
                <Dialog open={showBidModal} onOpenChange={setShowBidModal}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="w-full" disabled={daysRemaining <= 0}>
                      {daysRemaining <= 0 ? 'Deadline Passed' : 'Submit Bid'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Submit Your Bid</DialogTitle>
                    </DialogHeader>
                    <div className="p-4">
                      <p className="text-center text-muted-foreground">
                        Bid submission form will be implemented here
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleBookmark}
                    className="flex-1"
                  >
                    <Bookmark className={`h-4 w-4 mr-1 ${isBookmarked ? 'fill-current' : ''}`} />
                    {isBookmarked ? 'Saved' : 'Save'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabbed Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
            <TabsTrigger value="criteria">Criteria</TabsTrigger>
            <TabsTrigger value="issuer">Issuer</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Tender Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {tender.description}
                  </p>
                </div>
                
                <Separator className="my-6" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Tender Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <span>{tender.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span>{tender.tender_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Published:</span>
                        <span>{new Date(tender.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Deadline:</span>
                        <span>{new Date(tender.submission_deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Budget Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Minimum:</span>
                        <span>{formatCurrency(tender.budget_min)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Maximum:</span>
                        <span>{formatCurrency(tender.budget_max)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Currency:</span>
                        <span>XAF (CFA Franc)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents & Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentManager 
                  bucket="tender-documents" 
                  folder={`tender-${tender.id}`}
                  allowUpload={false}
                  allowDelete={false}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="eligibility">
            <Card>
              <CardHeader>
                <CardTitle>Eligibility & Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {tender.requirements || 'No specific eligibility requirements have been provided for this tender.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="criteria">
            <Card>
              <CardHeader>
                <CardTitle>Bid Evaluation Criteria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {tender.evaluation_criteria || 'No evaluation criteria have been specified for this tender.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issuer">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Issuer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Issuer profile information will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Bidder Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Total Bids</span>
                    </div>
                    <Badge variant="secondary">{tender.bids_count}</Badge>
                  </div>
                  
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Detailed bidder activity and comments will be shown here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}