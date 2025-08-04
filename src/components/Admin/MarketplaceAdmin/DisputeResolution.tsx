import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  User,
  Building,
  Package,
  DollarSign,
  FileText,
  MessageSquare,
  Filter,
  Search
} from 'lucide-react';

interface DisputeResolutionProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
}

export const DisputeResolution: React.FC<DisputeResolutionProps> = ({
  hasPermission,
  logActivity
}) => {
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [compensationAmount, setCompensationAmount] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch disputes with filters
  const { data: disputes, isLoading } = useQuery({
    queryKey: ['marketplace-disputes', statusFilter, priorityFilter, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('marketplace_disputes')
        .select(`
          *,
          marketplace_vendors(business_name, contact_email),
          marketplace_orders(order_number, total_amount),
          marketplace_products(name, price)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (priorityFilter !== 'all') {
        query = query.eq('priority_level', priorityFilter);
      }

      if (searchTerm) {
        query = query.or(
          `dispute_number.ilike.%${searchTerm}%,dispute_reason.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Update dispute status mutation
  const updateDisputeMutation = useMutation({
    mutationFn: async ({ disputeId, updates }: { disputeId: string; updates: any }) => {
      const { data, error } = await supabase
        .from('marketplace_disputes')
        .update(updates)
        .eq('id', disputeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-disputes'] });
      logActivity('dispute_updated', { 
        disputeId: variables.disputeId, 
        updates: variables.updates 
      });
      toast({
        title: "Dispute Updated",
        description: "The dispute has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update dispute. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleAssignDispute = async (disputeId: string) => {
    await updateDisputeMutation.mutateAsync({
      disputeId,
      updates: {
        assigned_admin_id: (await supabase.auth.getUser()).data.user?.id,
        status: 'in_progress'
      }
    });
  };

  const handleResolveDispute = async (disputeId: string) => {
    const updates: any = {
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      resolution_details: resolutionNotes
    };

    if (compensationAmount) {
      updates.compensation_amount = parseFloat(compensationAmount);
    }

    await updateDisputeMutation.mutateAsync({ disputeId, updates });
    setSelectedDispute(null);
    setResolutionNotes('');
    setCompensationAmount('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'in_progress': return 'secondary';
      case 'resolved': return 'default';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dispute Resolution</h1>
          <p className="text-muted-foreground">
            Manage and resolve marketplace disputes
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search disputes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {disputes?.length || 0} disputes found
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disputes List */}
      <div className="grid gap-4">
        {disputes?.map((dispute) => (
          <Card key={dispute.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(dispute.status)}
                    <span className="font-medium text-lg">{dispute.dispute_number}</span>
                    <Badge variant={getStatusColor(dispute.status)}>
                      {dispute.status}
                    </Badge>
                    <Badge variant={getPriorityColor(dispute.priority_level)}>
                      {dispute.priority_level} priority
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span>Vendor: {dispute.marketplace_vendors?.business_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span>Order: {dispute.marketplace_orders?.order_number || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span>Type: {dispute.dispute_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span>
                        Amount: {dispute.marketplace_orders?.total_amount 
                          ? new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'XAF'
                            }).format(Number(dispute.marketplace_orders.total_amount))
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium">Dispute Reason:</p>
                    <p className="text-sm text-muted-foreground">{dispute.dispute_reason}</p>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(dispute.created_at).toLocaleString()}
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {dispute.status === 'open' && (
                    <Button
                      size="sm"
                      onClick={() => handleAssignDispute(dispute.id)}
                      disabled={updateDisputeMutation.isPending}
                    >
                      Assign to Me
                    </Button>
                  )}
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedDispute(dispute)}
                      >
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Dispute Details - {dispute.dispute_number}</DialogTitle>
                      </DialogHeader>
                      
                      {selectedDispute && (
                        <div className="space-y-6">
                          {/* Dispute Info */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="font-medium">Status</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={getStatusColor(selectedDispute.status)}>
                                  {selectedDispute.status}
                                </Badge>
                                <Badge variant={getPriorityColor(selectedDispute.priority_level)}>
                                  {selectedDispute.priority_level} priority
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <Label className="font-medium">Type & Category</Label>
                              <p className="text-sm mt-1">
                                {selectedDispute.dispute_type} - {selectedDispute.dispute_category}
                              </p>
                            </div>
                          </div>

                          {/* Evidence */}
                          <div className="space-y-4">
                            <div>
                              <Label className="font-medium">Customer Evidence</Label>
                              <div className="mt-2 p-3 border rounded-md bg-muted/50">
                                <pre className="text-sm whitespace-pre-wrap">
                                  {JSON.stringify(selectedDispute.customer_evidence, null, 2)}
                                </pre>
                              </div>
                            </div>

                            {selectedDispute.vendor_response && Object.keys(selectedDispute.vendor_response).length > 0 && (
                              <div>
                                <Label className="font-medium">Vendor Response</Label>
                                <div className="mt-2 p-3 border rounded-md bg-muted/50">
                                  <pre className="text-sm whitespace-pre-wrap">
                                    {JSON.stringify(selectedDispute.vendor_response, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Resolution Section */}
                          {selectedDispute.status !== 'resolved' && (
                            <div className="space-y-4 border-t pt-4">
                              <Label className="font-medium">Resolution</Label>
                              <Textarea
                                placeholder="Enter resolution notes..."
                                value={resolutionNotes}
                                onChange={(e) => setResolutionNotes(e.target.value)}
                                rows={4}
                              />
                              <div>
                                <Label htmlFor="compensation">Compensation Amount (XAF)</Label>
                                <Input
                                  id="compensation"
                                  type="number"
                                  placeholder="0"
                                  value={compensationAmount}
                                  onChange={(e) => setCompensationAmount(e.target.value)}
                                />
                              </div>
                              <Button
                                onClick={() => handleResolveDispute(selectedDispute.id)}
                                disabled={!resolutionNotes || updateDisputeMutation.isPending}
                                className="w-full"
                              >
                                Resolve Dispute
                              </Button>
                            </div>
                          )}

                          {/* Resolved Details */}
                          {selectedDispute.status === 'resolved' && (
                            <div className="space-y-4 border-t pt-4">
                              <Label className="font-medium">Resolution Details</Label>
                              <div className="p-3 border rounded-md bg-green-50">
                                <p className="text-sm">{selectedDispute.resolution_details}</p>
                                {selectedDispute.compensation_amount > 0 && (
                                  <p className="text-sm font-medium mt-2">
                                    Compensation: {new Intl.NumberFormat('fr-FR', {
                                      style: 'currency',
                                      currency: 'XAF'
                                    }).format(Number(selectedDispute.compensation_amount))}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-2">
                                  Resolved: {new Date(selectedDispute.resolved_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {!disputes?.length && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No disputes found</h3>
              <p className="text-muted-foreground text-center">
                No disputes match your current filters. Try adjusting your search criteria.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};