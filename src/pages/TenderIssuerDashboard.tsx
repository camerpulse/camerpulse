import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Building, 
  Clock, 
  TrendingUp, 
  Award, 
  CreditCard,
  Plus,
  Eye,
  Edit,
  X,
  Trophy,
  BarChart3,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Flag,
  MessageSquare,
  Settings
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface TenderData {
  id: string;
  title: string;
  status: 'OPEN' | 'CLOSED' | 'AWARDED' | 'DRAFT';
  deadline: string;
  bidsReceived: number;
  lastUpdated: string;
  budget: number;
  category: string;
}

interface DashboardStats {
  activeTenders: number;
  pendingEvaluations: number;
  totalBids: number;
  tendersAwarded: number;
  boostStatus: string;
}

export default function TenderIssuerDashboard() {
  const [tenders, setTenders] = useState<TenderData[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    activeTenders: 0,
    pendingEvaluations: 0,
    totalBids: 0,
    tendersAwarded: 0,
    boostStatus: 'Free Plan'
  });
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockTenders: TenderData[] = [
      {
        id: '1',
        title: 'ICT Center Project - Digital Infrastructure',
        status: 'OPEN',
        deadline: '2024-08-12',
        bidsReceived: 17,
        lastUpdated: '3 hours ago',
        budget: 25000000,
        category: 'ICT'
      },
      {
        id: '2',
        title: 'Road Construction - Bamenda Highway',
        status: 'OPEN',
        deadline: '2024-07-28',
        bidsReceived: 8,
        lastUpdated: '1 day ago',
        budget: 150000000,
        category: 'Construction'
      },
      {
        id: '3',
        title: 'Medical Equipment Procurement',
        status: 'AWARDED',
        deadline: '2024-07-15',
        bidsReceived: 12,
        lastUpdated: '5 days ago',
        budget: 45000000,
        category: 'Medical'
      }
    ];

    const mockStats: DashboardStats = {
      activeTenders: mockTenders.filter(t => t.status === 'OPEN').length,
      pendingEvaluations: mockTenders.filter(t => t.status === 'CLOSED').length,
      totalBids: mockTenders.reduce((sum, t) => sum + t.bidsReceived, 0),
      tendersAwarded: mockTenders.filter(t => t.status === 'AWARDED').length,
      boostStatus: 'Professional Plan'
    };

    setTenders(mockTenders);
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
      case 'OPEN': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-yellow-100 text-yellow-800';
      case 'AWARDED': return 'bg-blue-100 text-blue-800';
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTenderAction = (tenderId: string, action: string) => {
    toast.success(`${action} action performed for tender ${tenderId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-foreground">Tender Issuer Dashboard</h1>
          <p className="text-muted-foreground">Manage your tenders and track bidding activity</p>
        </div>
        <Link to="/create-tender">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Post New Tender
          </Button>
        </Link>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">My Active Tenders</p>
                <p className="text-2xl font-bold">{stats.activeTenders}</p>
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
                <p className="text-sm text-muted-foreground">Pending Evaluations</p>
                <p className="text-2xl font-bold">{stats.pendingEvaluations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Bids Received</p>
                <p className="text-2xl font-bold">{stats.totalBids}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Award className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tenders Awarded</p>
                <p className="text-2xl font-bold">{stats.tendersAwarded}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Boost Status</p>
                <p className="text-sm font-medium">{stats.boostStatus}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tender Management Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            My Tenders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tender Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Bids Received</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenders.map((tender) => (
                <TableRow key={tender.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{tender.title}</p>
                      <p className="text-sm text-muted-foreground">{tender.category}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(tender.status)}>
                      {tender.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {new Date(tender.deadline).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{tender.bidsReceived}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {tender.lastUpdated}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {formatCurrency(tender.budget)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTenderAction(tender.id, 'View')}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      {tender.status === 'OPEN' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTenderAction(tender.id, 'Edit')}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTenderAction(tender.id, 'Analytics')}
                      >
                        <BarChart3 className="h-3 w-3" />
                      </Button>
                      {tender.status === 'OPEN' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTenderAction(tender.id, 'Close')}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                      {(tender.status === 'CLOSED' || tender.bidsReceived > 0) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTenderAction(tender.id, 'Award')}
                        >
                          <Trophy className="h-3 w-3" />
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Bid Analytics</h3>
            <p className="text-sm text-muted-foreground">View detailed bidding trends and insights</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Bidder Communication</h3>
            <p className="text-sm text-muted-foreground">Message and manage bidder interactions</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Settings className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Tender Settings</h3>
            <p className="text-sm text-muted-foreground">Configure notifications and preferences</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}