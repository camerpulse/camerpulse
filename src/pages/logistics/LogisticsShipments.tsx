import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CamerLogisticsLayout } from '@/components/Layout/CamerLogisticsLayout';
import { 
  Package, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  User,
  Truck,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Shipment {
  id: string;
  tracking_number: string;
  status: string;
  origin_address: string;
  destination_address: string;
  sender_info: any;
  receiver_info: any;
  shipping_cost: number;
  created_at: string;
  estimated_delivery_date: string;
}

export const LogisticsShipments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (user) {
      fetchShipments();
    }
  }, [user]);

  useEffect(() => {
    filterShipments();
  }, [shipments, searchTerm, activeTab]);

  const fetchShipments = async () => {
    try {
      // Get shipments for current user (as sender)
      const { data: userShipments, error: userError } = await supabase
        .from('shipments')
        .select('*')
        .contains('sender_info', { user_id: user?.id });

      if (userError) throw userError;

      setShipments(userShipments || []);
    } catch (error) {
      console.error('Error fetching shipments:', error);
      toast({
        title: "Error",
        description: "Failed to load shipments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterShipments = () => {
    let filtered = [...shipments];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(shipment => 
        shipment.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.destination_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.origin_address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(shipment => {
        switch (activeTab) {
          case 'active':
            return ['pending', 'in_transit', 'out_for_delivery'].includes(shipment.status);
          case 'delivered':
            return shipment.status === 'delivered';
          case 'cancelled':
            return shipment.status === 'cancelled';
          default:
            return true;
        }
      });
    }

    setFilteredShipments(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'in_transit':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Transit</Badge>;
      case 'out_for_delivery':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Out for Delivery</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'in_transit':
      case 'out_for_delivery':
        return <Truck className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  if (!user) {
    return (
      <CamerLogisticsLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Login Required</h2>
              <p className="text-muted-foreground mb-4">
                Please log in to view your shipments.
              </p>
              <Button onClick={() => window.location.href = '/auth'}>
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </CamerLogisticsLayout>
    );
  }

  if (loading) {
    return (
      <CamerLogisticsLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </CamerLogisticsLayout>
    );
  }

  return (
    <CamerLogisticsLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Shipments</h1>
            <p className="text-muted-foreground">Track and manage all your shipments</p>
          </div>
          <Button onClick={() => window.location.href = '/logistics/ship'}>
            <Plus className="h-4 w-4 mr-2" />
            Ship New Package
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by tracking number, address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({shipments.length})</TabsTrigger>
            <TabsTrigger value="active">
              Active ({shipments.filter(s => ['pending', 'in_transit', 'out_for_delivery'].includes(s.status)).length})
            </TabsTrigger>
            <TabsTrigger value="delivered">
              Delivered ({shipments.filter(s => s.status === 'delivered').length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({shipments.filter(s => s.status === 'cancelled').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredShipments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Shipments Found</h3>
                  <p className="text-muted-foreground mb-6">
                    {shipments.length === 0 
                      ? "You haven't shipped any packages yet." 
                      : "No shipments match your current filters."}
                  </p>
                  {shipments.length === 0 && (
                    <Button onClick={() => window.location.href = '/logistics/ship'}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ship Your First Package
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredShipments.map((shipment) => (
                  <Card key={shipment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(shipment.status)}
                            <div>
                              <h3 className="font-semibold text-lg">{shipment.tracking_number}</h3>
                              <p className="text-sm text-muted-foreground">
                                Created on {new Date(shipment.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="ml-auto">
                              {getStatusBadge(shipment.status)}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium">From</p>
                                <p className="text-sm text-muted-foreground">{shipment.origin_address}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium">To</p>
                                <p className="text-sm text-muted-foreground">{shipment.destination_address}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>To: {shipment.receiver_info?.name || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                ETA: {shipment.estimated_delivery_date 
                                  ? new Date(shipment.estimated_delivery_date).toLocaleDateString()
                                  : 'Not set'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:items-end">
                          <div className="text-right">
                            <p className="text-lg font-bold">{shipment.shipping_cost?.toLocaleString()} FCFA</p>
                            <p className="text-sm text-muted-foreground">Shipping cost</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = `/logistics/tracking/${shipment.tracking_number}`}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Track
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </CamerLogisticsLayout>
  );
};