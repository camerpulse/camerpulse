import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Search, 
  Filter,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Shipment {
  id: string;
  tracking_number: string;
  status: string;
  sender_info: any;
  receiver_info: any;
  origin_address: string;
  destination_address: string;
  shipping_type: string;
  service_level: string;
  shipping_cost: number;
  weight_kg: number;
  created_at: string;
  updated_at: string;
}

const ShipmentManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      checkUserCompany();
    }
  }, [user]);

  useEffect(() => {
    if (companyId) {
      fetchShipments();
    }
  }, [companyId, statusFilter]);

  const checkUserCompany = async () => {
    try {
      const { data, error } = await supabase
        .from('shipping_company_staff')
        .select('company_id')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .single();

      if (error) {
        toast({
          title: "Access Required",
          description: "You need to be associated with a shipping company.",
          variant: "destructive"
        });
        navigate('/shipping/register');
        return;
      }

      setCompanyId(data.company_id);
    } catch (error) {
      console.error('Error checking user company:', error);
    }
  };

  const fetchShipments = async () => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('shipments')
        .select('*')
        .eq('shipping_company_id', companyId)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setShipments(data || []);
    } catch (error) {
      console.error('Error fetching shipments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch shipments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateShipmentStatus = async (shipmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('shipments')
        .update({ status: newStatus })
        .eq('id', shipmentId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Shipment status updated to ${newStatus}`
      });

      fetchShipments();
    } catch (error) {
      console.error('Error updating shipment status:', error);
      toast({
        title: "Error",
        description: "Failed to update shipment status",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_transit':
      case 'out_for_delivery':
        return <Truck className="h-4 w-4 text-blue-600" />;
      case 'exception':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800';
      case 'exception':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shipment.sender_info?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shipment.receiver_info?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getShipmentCounts = () => {
    return {
      total: shipments.length,
      pending: shipments.filter(s => s.status === 'pending').length,
      in_transit: shipments.filter(s => ['in_transit', 'out_for_delivery'].includes(s.status)).length,
      delivered: shipments.filter(s => s.status === 'delivered').length,
      exception: shipments.filter(s => s.status === 'exception').length
    };
  };

  const counts = getShipmentCounts();

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Shipment Management</h1>
                <p className="text-muted-foreground">Manage and track all your shipments</p>
              </div>
            </div>
            
            <Button onClick={() => navigate('/shipping/create')} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Shipment
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{counts.total}</p>
                  </div>
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">{counts.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">In Transit</p>
                    <p className="text-2xl font-bold">{counts.in_transit}</p>
                  </div>
                  <Truck className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                    <p className="text-2xl font-bold">{counts.delivered}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Exceptions</p>
                    <p className="text-2xl font-bold">{counts.exception}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by tracking number, sender, or receiver..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="picked_up">Picked Up</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                      <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="exception">Exception</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipments List */}
          <Card>
            <CardHeader>
              <CardTitle>Shipments ({filteredShipments.length})</CardTitle>
              <CardDescription>Manage your shipments and update their status</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading shipments...</p>
                </div>
              ) : filteredShipments.length > 0 ? (
                <div className="space-y-4">
                  {filteredShipments.map((shipment) => (
                    <div key={shipment.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium">{shipment.tracking_number}</h3>
                            <Badge className={getStatusColor(shipment.status)}>
                              {getStatusIcon(shipment.status)}
                              <span className="ml-1">{formatStatus(shipment.status)}</span>
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                              <div>
                                <span className="font-medium">From:</span> {shipment.sender_info?.name}
                              </div>
                              <div>
                                <span className="font-medium">To:</span> {shipment.receiver_info?.name}
                              </div>
                              <div>
                                <span className="font-medium">Weight:</span> {shipment.weight_kg}kg
                              </div>
                              <div>
                                <span className="font-medium">Created:</span> {formatDistanceToNow(new Date(shipment.created_at))} ago
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Select 
                            value={shipment.status} 
                            onValueChange={(value) => updateShipmentStatus(shipment.id, value)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="picked_up">Picked Up</SelectItem>
                              <SelectItem value="in_transit">In Transit</SelectItem>
                              <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="exception">Exception</SelectItem>
                              <SelectItem value="returned">Returned</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/shipping/track/${shipment.tracking_number}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No shipments found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? 'Try adjusting your search criteria' : 'Create your first shipment to get started'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => navigate('/shipping/create')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Shipment
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default ShipmentManagement;