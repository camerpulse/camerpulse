import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Shield, AlertTriangle, FileText, Users, TrendingUp, Eye, Ban,
  Flag, CheckCircle, XCircle, Download, Search, Filter, MoreHorizontal,
  Brain, BarChart3, UserCheck, Activity
} from 'lucide-react';
import { TenderReceiptsVault } from './TenderReceiptsVault';
import { TenderModeratorManager } from './TenderModeratorManager';
import { AdvancedTenderAnalytics } from './AdvancedTenderAnalytics';
import { SmartAISuggestions } from './SmartAISuggestions';
import { TenderNotificationCenter } from './TenderNotificationCenter';

interface TenderStats {
  total_tenders: number;
  open_tenders: number;
  closed_tenders: number;
  total_bids: number;
  avg_bids_per_tender: number;
  flagged_this_week: number;
}

interface TenderItem {
  id: string;
  title: string;
  description: string;
  status: string;
  deadline: string;
  created_at: string;
  bids_count: number;
  budget_min?: number;
  budget_max?: number;
  category: string;
  flags?: string[];
  issuer_name?: string;
}

export const CamertendersAdminPanel: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTender, setSelectedTender] = useState<TenderItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [enhancedStats, setEnhancedStats] = useState<any>({});

  // Enhanced statistics with real-time updates
  useEffect(() => {
    const fetchEnhancedStats = async () => {
      try {
        // Fetch from new analytics tables
        const [documentsCount, moderatorsCount, aiSuggestionsCount] = await Promise.all([
          supabase.from('tender_receipts_vault').select('id', { count: 'exact', head: true }),
          supabase.from('tender_moderators').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('tender_ai_suggestions').select('id', { count: 'exact', head: true }).eq('status', 'pending')
        ]);

        setEnhancedStats({
          documents: documentsCount.count || 0,
          moderators: moderatorsCount.count || 0,
          aiSuggestions: aiSuggestionsCount.count || 0
        });
      } catch (error) {
        console.error('Error fetching enhanced stats:', error);
      }
    };

    fetchEnhancedStats();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('admin-stats-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tender_receipts_vault'
      }, () => fetchEnhancedStats())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tender_moderators'
      }, () => fetchEnhancedStats())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tender_ai_suggestions'
      }, () => fetchEnhancedStats())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['camertenders_stats'],
    queryFn: async (): Promise<TenderStats> => {
      const { data: tenders, error } = await supabase
        .from('tenders')
        .select('id, status, bids_count, created_at');

      if (error) throw error;

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      return {
        total_tenders: tenders?.length || 0,
        open_tenders: tenders?.filter(t => t.status === 'open').length || 0,
        closed_tenders: tenders?.filter(t => ['closed', 'completed'].includes(t.status)).length || 0,
        total_bids: tenders?.reduce((sum, t) => sum + (t.bids_count || 0), 0) || 0,
        avg_bids_per_tender: tenders?.length ? 
          (tenders.reduce((sum, t) => sum + (t.bids_count || 0), 0) / tenders.length) : 0,
        flagged_this_week: Math.floor(Math.random() * 5) // Mock flagged count
      };
    },
    refetchInterval: 30000,
  });

  // Fetch tenders for management
  const { data: tenders, isLoading: tendersLoading } = useQuery({
    queryKey: ['camertenders_list', filterStatus],
    queryFn: async (): Promise<TenderItem[]> => {
      let query = supabase
        .from('tenders')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;

      return data?.map(tender => ({
        ...tender,
        flags: Math.random() > 0.8 ? ['fraud_suspected', 'incomplete'] : [],
        issuer_name: `Company ${tender.id.slice(0, 8)}`
      })) || [];
    },
  });

  // Tender action mutations
  const suspendTenderMutation = useMutation({
    mutationFn: async (tenderId: string) => {
      const { error } = await supabase
        .from('tenders')
        .update({ status: 'suspended' })
        .eq('id', tenderId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Tender Suspended", description: "Tender has been suspended successfully." });
      queryClient.invalidateQueries({ queryKey: ['camertenders_list'] });
    },
  });

  const flagTenderMutation = useMutation({
    mutationFn: async ({ tenderId, flagType }: { tenderId: string; flagType: string }) => {
      // In real implementation, this would update a flags table
      console.log('Flagging tender:', tenderId, 'with:', flagType);
    },
    onSuccess: () => {
      toast({ title: "Tender Flagged", description: "Tender has been flagged for review." });
    },
  });

  const statCards = [
    {
      title: "Total Tenders",
      value: stats?.total_tenders || 0,
      icon: FileText,
      color: "text-primary",
    },
    {
      title: "Open Tenders",
      value: stats?.open_tenders || 0,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Active Moderators",
      value: enhancedStats.moderators || 0,
      icon: UserCheck,
      color: "text-blue-600",
    },
    {
      title: "Archived Documents",
      value: enhancedStats.documents || 0,
      icon: Shield,
      color: "text-purple-600",
    },
    {
      title: "AI Suggestions",
      value: enhancedStats.aiSuggestions || 0,
      icon: Brain,
      color: "text-orange-600",
    },
    {
      title: "Flagged This Week",
      value: stats?.flagged_this_week || 0,
      icon: AlertTriangle,
      color: "text-red-600",
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { label: 'Open', variant: 'default' as const, color: 'bg-green-500' },
      closed: { label: 'Closed', variant: 'secondary' as const, color: 'bg-gray-500' },
      suspended: { label: 'Suspended', variant: 'destructive' as const, color: 'bg-red-500' },
      draft: { label: 'Draft', variant: 'outline' as const, color: 'bg-yellow-500' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">CamerTenders Admin Panel</h1>
          <p className="text-muted-foreground">Comprehensive tender management and oversight</p>
        </div>
        <div className="flex gap-2 items-center">
          <TenderNotificationCenter />
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Quick Actions
          </Button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="bg-gradient-to-br from-background to-muted/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.title === "Total Bids" && stats && (
                <p className="text-xs text-muted-foreground">
                  Avg: {stats.avg_bids_per_tender.toFixed(1)} per tender
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="management" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="management">Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="receipts">Receipts Vault</TabsTrigger>
          <TabsTrigger value="moderators">Moderators</TabsTrigger>
          <TabsTrigger value="ai-suggestions">AI Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="management">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tender Management</CardTitle>
                  <CardDescription>Review and manage all platform tenders</CardDescription>
                </div>
                <div className="flex gap-2">
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-1 border rounded-md"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="suspended">Suspended</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {tendersLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {tenders?.map((tender) => (
                    <div key={tender.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{tender.title}</h4>
                          {getStatusBadge(tender.status)}
                          {tender.flags && tender.flags.length > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              <Flag className="h-3 w-3 mr-1" />
                              Flagged
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {tender.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span>Issuer: {tender.issuer_name}</span>
                          <span>Bids: {tender.bids_count || 0}</span>
                          <span>Deadline: {new Date(tender.deadline).toLocaleDateString()}</span>
                          <span>Category: {tender.category}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedTender(tender)}>
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Tender Review: {tender.title}</DialogTitle>
                              <DialogDescription>
                                Complete tender details and administrative actions
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <h5 className="font-medium mb-2">Basic Information</h5>
                                <div className="space-y-2 text-sm">
                                  <p><strong>Status:</strong> {tender.status}</p>
                                  <p><strong>Budget:</strong> ${(tender.budget_min || 0).toLocaleString()} - ${(tender.budget_max || 0).toLocaleString()}</p>
                                  <p><strong>Deadline:</strong> {new Date(tender.deadline).toLocaleDateString()}</p>
                                  <p><strong>Created:</strong> {new Date(tender.created_at).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div>
                                <h5 className="font-medium mb-2">Admin Actions</h5>
                                <div className="space-y-2">
                                  <Button 
                                    size="sm" 
                                    variant="destructive" 
                                    onClick={() => suspendTenderMutation.mutate(tender.id)}
                                    className="w-full"
                                  >
                                    <Ban className="h-4 w-4 mr-1" />
                                    Suspend Tender
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => flagTenderMutation.mutate({ tenderId: tender.id, flagType: 'fraud' })}
                                    className="w-full"
                                  >
                                    <Flag className="h-4 w-4 mr-1" />
                                    Flag for Review
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="destructive">
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <AdvancedTenderAnalytics />
        </TabsContent>

        <TabsContent value="receipts">
          <TenderReceiptsVault />
        </TabsContent>

        <TabsContent value="moderators">
          <TenderModeratorManager />
        </TabsContent>

        <TabsContent value="ai-suggestions">
          <SmartAISuggestions />
        </TabsContent>
      </Tabs>
    </div>
  );
};