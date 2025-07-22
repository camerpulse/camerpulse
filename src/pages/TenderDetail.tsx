import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft,
  Calendar,
  MapPin,
  Building2,
  FileText,
  Clock,
  Eye,
  Users,
  DollarSign,
  Download,
  Bookmark,
  Share2,
  AlertTriangle,
  CheckCircle,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Tender {
  id: string;
  title: string;
  description: string;
  tender_type: string;
  category: string;
  region: string;
  published_by_company_id: string | null;
  published_by_user_id: string;
  budget_min: number;
  budget_max: number;
  currency: string;
  deadline: string;
  bid_opening_date: string | null;
  eligibility_criteria: string | null;
  instructions: string | null;
  evaluation_criteria: string | null;
  documents: any;
  status: string;
  views_count: number;
  bids_count: number;
  is_featured: boolean;
  created_at: string;
}

interface TenderBid {
  id: string;
  company_id: string;
  user_id: string;
  bid_amount: number;
  currency: string;
  status: string;
  submitted_at: string;
}

const TenderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [tender, setTender] = useState<Tender | null>(null);
  const [bids, setBids] = useState<TenderBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (id) {
      fetchTenderDetails();
      incrementViewCount();
    }
  }, [id]);

  const fetchTenderDetails = async () => {
    try {
      const { data: tenderData, error: tenderError } = await supabase
        .from('tenders')
        .select('*')
        .eq('id', id)
        .single();

      if (tenderError) throw tenderError;
      setTender(tenderData);

      // Fetch bids for tender owners/admins
      const { data: bidsData, error: bidsError } = await supabase
        .from('tender_bids')
        .select('*')
        .eq('tender_id', id)
        .order('submitted_at', { ascending: false });

      if (!bidsError) {
        setBids(bidsData || []);
      }
    } catch (error) {
      console.error('Error fetching tender details:', error);
      toast.error('Failed to load tender details');
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      // Get current tender to increment view count
      const { data: currentTender } = await supabase
        .from('tenders')
        .select('views_count')
        .eq('id', id)
        .single();

      if (currentTender) {
        await supabase
          .from('tenders')
          .update({ views_count: (currentTender.views_count || 0) + 1 })
          .eq('id', id);
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const formatBudget = (min: number, max: number, currency: string) => {
    const formatAmount = (amount: number) => {
      if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)}B`;
      if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
      if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
      return amount.toString();
    };

    if (min && max) {
      return `${formatAmount(min)} - ${formatAmount(max)} ${currency}`;
    } else if (min) {
      return `From ${formatAmount(min)} ${currency}`;
    } else if (max) {
      return `Up to ${formatAmount(max)} ${currency}`;
    }
    return 'Budget not specified';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'public': 'bg-blue-100 text-blue-800',
      'private': 'bg-green-100 text-green-800',
      'ngo_donor': 'bg-purple-100 text-purple-800',
      'international': 'bg-orange-100 text-orange-800',
      'construction': 'bg-yellow-100 text-yellow-800',
      'ict_software': 'bg-cyan-100 text-cyan-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': 'bg-green-100 text-green-800',
      'closed': 'bg-red-100 text-red-800',
      'awarded': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tender not found</h3>
            <p className="text-muted-foreground mb-4">
              The tender you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/tenders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tenders
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = new Date(tender.deadline) < new Date();
  const daysUntilDeadline = Math.ceil(
    (new Date(tender.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link to="/tenders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tenders
            </Link>
          </Button>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Bookmark className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={getTypeColor(tender.tender_type)}>
                    {tender.tender_type.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Badge variant="outline">{tender.category}</Badge>
                  <Badge className={getStatusColor(tender.status)}>
                    {tender.status.toUpperCase()}
                  </Badge>
                  {tender.is_featured && (
                    <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                  )}
                </div>
                <CardTitle className="text-2xl">{tender.title}</CardTitle>
                <CardDescription className="text-base">
                  {tender.description}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="bids">Bids ({bids.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tender Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">Location</h4>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{tender.region} Region</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Budget</h4>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>{formatBudget(tender.budget_min, tender.budget_max, tender.currency)}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Submission Deadline</h4>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(tender.deadline), 'PPP')}</span>
                        </div>
                      </div>
                      {tender.bid_opening_date && (
                        <div>
                          <h4 className="font-semibold mb-2">Bid Opening</h4>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{format(new Date(tender.bid_opening_date), 'PPP')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span>{tender.views_count} views</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{tender.bids_count} bids</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Posted {format(new Date(tender.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requirements" className="mt-6">
                <div className="space-y-6">
                  {tender.eligibility_criteria && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Eligibility Criteria</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none">
                          {tender.eligibility_criteria.split('\n').map((line, index) => (
                            <p key={index} className="mb-2">{line}</p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {tender.instructions && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Application Instructions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none">
                          {tender.instructions.split('\n').map((line, index) => (
                            <p key={index} className="mb-2">{line}</p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {tender.evaluation_criteria && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Evaluation Criteria</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none">
                          {tender.evaluation_criteria.split('\n').map((line, index) => (
                            <p key={index} className="mb-2">{line}</p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="documents" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tender Documents</CardTitle>
                    <CardDescription>
                      Download the official tender documents and specifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tender.documents && tender.documents.length > 0 ? (
                      <div className="space-y-3">
                        {tender.documents.map((doc: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <p className="text-sm text-muted-foreground">{doc.size}</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No documents available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bids" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Submitted Bids</CardTitle>
                    <CardDescription>
                      Overview of all bids submitted for this tender
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {bids.length > 0 ? (
                      <div className="space-y-4">
                        {bids.map((bid) => (
                          <div key={bid.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>
                                  <Building2 className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">Company #{bid.company_id.slice(0, 8)}</p>
                                <p className="text-sm text-muted-foreground">
                                  Submitted {format(new Date(bid.submitted_at), 'MMM dd, yyyy')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{bid.bid_amount.toLocaleString()} {bid.currency}</p>
                              <Badge variant={bid.status === 'accepted' ? 'default' : 'secondary'}>
                                {bid.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No bids submitted yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-6">
              {/* Deadline Alert */}
              <Card>
                <CardContent className="p-4">
                  {isExpired ? (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      <div>
                        <p className="font-semibold">Deadline Passed</p>
                        <p className="text-sm">This tender is no longer accepting bids</p>
                      </div>
                    </div>
                  ) : daysUntilDeadline <= 7 ? (
                    <div className="flex items-center gap-2 text-orange-600">
                      <Clock className="h-5 w-5" />
                      <div>
                        <p className="font-semibold">{daysUntilDeadline} days left</p>
                        <p className="text-sm">Deadline approaching soon</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <div>
                        <p className="font-semibold">{daysUntilDeadline} days left</p>
                        <p className="text-sm">Still time to prepare your bid</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <Button 
                    className="w-full" 
                    disabled={isExpired || tender.status !== 'active'}
                    asChild
                  >
                    <Link to={`/tenders/${tender.id}/bid`}>
                      Submit Bid
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full">
                    <User className="h-4 w-4 mr-2" />
                    Contact Publisher
                  </Button>
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Download All Documents
                  </Button>
                </CardContent>
              </Card>

              {/* Publisher Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Published By</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        <Building2 className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {tender.published_by_company_id ? 'Verified Company' : 'Individual Publisher'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Member since 2023
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenderDetail;