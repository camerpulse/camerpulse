import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Briefcase, 
  Clock, 
  TrendingUp, 
  Award, 
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Download,
  MessageSquare,
  FileText,
  Calendar,
  MapPin,
  Building,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface BidData {
  id: string;
  tenderTitle: string;
  tenderCategory: string;
  region: string;
  status: 'SUBMITTED' | 'EVALUATION' | 'SHORTLISTED' | 'AWARDED' | 'REJECTED' | 'WITHDRAWN';
  bidAmount: number;
  submittedOn: string;
  outcome: 'PENDING' | 'WON' | 'LOST' | 'CANCELLED';
  deadline: string;
  issuer: string;
}

interface BidderStats {
  totalBids: number;
  activeBids: number;
  wonTenders: number;
  successRate: number;
}

export default function BidderDashboard() {
  const [bids, setBids] = useState<BidData[]>([]);
  const [stats, setStats] = useState<BidderStats>({
    totalBids: 0,
    activeBids: 0,
    wonTenders: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockBids: BidData[] = [
      {
        id: '1',
        tenderTitle: 'Road Construction – Bamenda Highway Expansion',
        tenderCategory: 'Construction',
        region: 'Northwest',
        status: 'EVALUATION',
        bidAmount: 35000000,
        submittedOn: '2024-07-03',
        outcome: 'PENDING',
        deadline: '2024-07-28',
        issuer: 'Ministry of Public Works'
      },
      {
        id: '2',
        tenderTitle: 'ICT Center Project - Digital Infrastructure',
        tenderCategory: 'ICT',
        region: 'Centre',
        status: 'SHORTLISTED',
        bidAmount: 22000000,
        submittedOn: '2024-07-15',
        outcome: 'PENDING',
        deadline: '2024-08-12',
        issuer: 'Ministry of Education'
      },
      {
        id: '3',
        tenderTitle: 'Medical Equipment Procurement',
        tenderCategory: 'Medical',
        region: 'Littoral',
        status: 'AWARDED',
        bidAmount: 18500000,
        submittedOn: '2024-06-20',
        outcome: 'WON',
        deadline: '2024-07-15',
        issuer: 'Regional Hospital Douala'
      },
      {
        id: '4',
        tenderTitle: 'School Building Construction',
        tenderCategory: 'Construction',
        region: 'East',
        status: 'REJECTED',
        bidAmount: 45000000,
        submittedOn: '2024-06-10',
        outcome: 'LOST',
        deadline: '2024-06-30',
        issuer: 'Ministry of Education'
      }
    ];

    const mockStats: BidderStats = {
      totalBids: mockBids.length,
      activeBids: mockBids.filter(b => ['SUBMITTED', 'EVALUATION', 'SHORTLISTED'].includes(b.status)).length,
      wonTenders: mockBids.filter(b => b.outcome === 'WON').length,
      successRate: (mockBids.filter(b => b.outcome === 'WON').length / mockBids.filter(b => b.outcome !== 'PENDING').length) * 100
    };

    setBids(mockBids);
    setStats(mockStats);
    setLoading(false);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      notation: 'compact'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800';
      case 'EVALUATION': return 'bg-yellow-100 text-yellow-800';
      case 'SHORTLISTED': return 'bg-green-100 text-green-800';
      case 'AWARDED': return 'bg-emerald-100 text-emerald-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'WITHDRAWN': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'WON': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'LOST': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'PENDING': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleBidAction = (bidId: string, action: string) => {
    toast.success(`${action} action performed for bid ${bidId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Bids Dashboard</h1>
          <p className="text-muted-foreground">Track your tender submissions and manage proposals</p>
        </div>
        <Link to="/tenders">
          <Button className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Browse Tenders
          </Button>
        </Link>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Bids</p>
                <p className="text-2xl font-bold">{stats.totalBids}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Bids</p>
                <p className="text-2xl font-bold">{stats.activeBids}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Won Tenders</p>
                <p className="text-2xl font-bold">{stats.wonTenders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bids Management Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            My Submitted Bids
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tender</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bid Amount</TableHead>
                <TableHead>Submitted On</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bids.map((bid) => (
                <TableRow key={bid.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium line-clamp-1">{bid.tenderTitle}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building className="h-3 w-3" />
                        <span>{bid.tenderCategory}</span>
                        <MapPin className="h-3 w-3" />
                        <span>{bid.region}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{bid.issuer}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(bid.status)}>
                      {bid.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span className="font-medium">{formatCurrency(bid.bidAmount)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {new Date(bid.submittedOn).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {new Date(bid.deadline).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getOutcomeIcon(bid.outcome)}
                      <span className="text-sm font-medium">{bid.outcome}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBidAction(bid.id, 'View')}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      {bid.status === 'SUBMITTED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBidAction(bid.id, 'Edit')}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBidAction(bid.id, 'Download')}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      {['SUBMITTED', 'EVALUATION'].includes(bid.status) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBidAction(bid.id, 'Message')}
                        >
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                      )}
                      {bid.status === 'SUBMITTED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBidAction(bid.id, 'Withdraw')}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Certificates Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Bid Certificates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Download official bid certificates for your submissions
            </p>
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download All Certificates
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Award Certificates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View and download certificates for awarded tenders
            </p>
            <Button variant="outline" className="w-full">
              <Award className="h-4 w-4 mr-2" />
              View Award Certificates ({stats.wonTenders})
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}