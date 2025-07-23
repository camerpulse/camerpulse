import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Download,
  Flag,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';

interface BidderViewModalProps {
  bid: any;
  isOpen: boolean;
  onClose: () => void;
  onShortlist: (bidId: string) => void;
  onReject: (bidId: string) => void;
  onFlag: (bidId: string, reason: string) => void;
}

export default function BidderViewModal({
  bid,
  isOpen,
  onClose,
  onShortlist,
  onReject,
  onFlag
}: BidderViewModalProps) {
  const [flagReason, setFlagReason] = useState('');

  if (!bid) return null;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shortlisted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'under_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'FCFA') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency === 'FCFA' ? 'XAF' : currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Mock company data (would come from database in real app)
  const company = {
    name: 'ABC Construction Ltd',
    registration_number: 'RC-2019-B-12345',
    email: 'contact@abcconstruction.cm',
    phone: '+237 6 78 90 12 34',
    address: 'Bonanjo, Douala, Cameroon',
    established: '2019',
    employees: '50-100',
    verification_status: 'verified',
    rating: 4.5,
    completed_projects: 23,
    certifications: ['ISO 9001', 'ISO 14001', 'OHSAS 18001']
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Bid Details</span>
            <Badge className={getStatusColor(bid.status)}>
              {bid.status?.toUpperCase() || 'SUBMITTED'}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Submitted on {format(new Date(bid.created_at), 'PPP')}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="proposal">Proposal</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] mt-4">
            <TabsContent value="overview" className="space-y-6">
              {/* Bid Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Bid Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Bid Amount</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(bid.bid_amount, bid.currency)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Submitted</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(bid.created_at), 'PPP')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {bid.notes && (
                    <div>
                      <p className="font-medium mb-2">Additional Notes</p>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                        {bid.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                  <CardDescription>Manage this bid submission</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={() => onShortlist(bid.id)}
                      disabled={bid.status === 'shortlisted'}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Shortlist
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => onReject(bid.id)}
                      disabled={bid.status === 'rejected'}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline">
                          <Flag className="h-4 w-4 mr-2" />
                          Flag/Report
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Flag Bidder</AlertDialogTitle>
                          <AlertDialogDescription>
                            Report this bidder for suspicious activity or policy violations.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Reason for flagging</label>
                            <textarea
                              className="w-full mt-1 p-2 border rounded-md"
                              rows={3}
                              value={flagReason}
                              onChange={(e) => setFlagReason(e.target.value)}
                              placeholder="Describe the issue..."
                            />
                          </div>
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              onFlag(bid.id, flagReason);
                              setFlagReason('');
                            }}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Submit Report
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="company" className="space-y-6">
              {/* Company Overview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        {company.name}
                      </CardTitle>
                      <CardDescription>Registration: {company.registration_number}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {company.verification_status === 'verified' && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{company.rating}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{company.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">{company.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Address</p>
                        <p className="text-sm text-muted-foreground">{company.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Established</p>
                        <p className="text-sm text-muted-foreground">{company.established}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{company.completed_projects}</div>
                      <div className="text-sm text-muted-foreground">Completed Projects</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{company.employees}</div>
                      <div className="text-sm text-muted-foreground">Employees</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{company.certifications.length}</div>
                      <div className="text-sm text-muted-foreground">Certifications</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Certifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {company.certifications.map((cert, index) => (
                      <Badge key={index} variant="outline">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="proposal" className="space-y-6">
              {/* Technical Proposal */}
              <Card>
                <CardHeader>
                  <CardTitle>Technical Proposal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed bg-muted p-4 rounded-lg">
                    {bid.technical_proposal}
                  </div>
                </CardContent>
              </Card>

              {/* Financial Proposal */}
              <Card>
                <CardHeader>
                  <CardTitle>Financial Proposal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <span className="font-medium">Total Bid Amount</span>
                      <span className="text-2xl font-bold text-primary">
                        {formatCurrency(bid.bid_amount, bid.currency)}
                      </span>
                    </div>
                    
                    {bid.financial_proposal && typeof bid.financial_proposal === 'object' && (
                      <div className="space-y-2">
                        {Object.entries(bid.financial_proposal).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                            <span>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              {/* Uploaded Documents */}
              <Card>
                <CardHeader>
                  <CardTitle>Supporting Documents</CardTitle>
                  <CardDescription>Files submitted with this bid</CardDescription>
                </CardHeader>
                <CardContent>
                  {bid.documents?.files?.length > 0 ? (
                    <div className="space-y-3">
                      {bid.documents.files.map((doc: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {doc.type} • {doc.size ? `${Math.round(doc.size / 1024)} KB` : 'Unknown size'}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No documents submitted</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}