import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Weight,
  Ruler,
  DollarSign
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Shipment {
  id: string;
  tracking_number: string;
  status: string;
  sender_info: any;
  receiver_info: any;
  package_details: any;
  origin_address: string;
  destination_address: string;
  shipping_type: string;
  service_level: string;
  estimated_delivery_date: string;
  actual_delivery_date: string;
  shipping_cost: number;
  weight_kg: number;
  dimensions: any;
  created_at: string;
  updated_at: string;
}

interface TrackingEvent {
  id: string;
  event_type: string;
  event_description: string;
  location: string;
  facility_name: string;
  event_timestamp: string;
  metadata: any;
}

interface StatusHistory {
  id: string;
  status: string;
  location: string;
  description: string;
  timestamp: string;
}

const TrackShipment = () => {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState(trackingNumber || '');
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (trackingNumber) {
      searchShipment(trackingNumber);
    }
  }, [trackingNumber]);

  const searchShipment = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      // Fetch shipment details
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .select('*')
        .eq('tracking_number', query.trim())
        .maybeSingle();

      if (shipmentError) {
        toast({
          title: "Error",
          description: "Failed to fetch shipment information",
          variant: "destructive"
        });
        setShipment(null);
        return;
      }

      if (!shipmentData) {
        toast({
          title: "Tracking Number Not Found",
          description: "Please check your tracking number and try again.",
          variant: "destructive"
        });
        setShipment(null);
        return;
      }

      setShipment(shipmentData);

      // Fetch tracking events
      const { data: eventsData, error: eventsError } = await supabase
        .from('shipment_tracking_events')
        .select('*')
        .eq('shipment_id', shipmentData.id)
        .order('event_timestamp', { ascending: false });

      if (eventsError) throw eventsError;
      setTrackingEvents(eventsData || []);

      // Fetch status history
      const { data: historyData, error: historyError } = await supabase
        .from('shipment_status_history')
        .select('*')
        .eq('shipment_id', shipmentData.id)
        .order('timestamp', { ascending: false });

      if (historyError) throw historyError;
      setStatusHistory(historyData || []);

      // Update URL if tracking from search
      if (!trackingNumber && query) {
        navigate(`/shipping/track/${query}`, { replace: true });
      }

    } catch (error) {
      console.error('Error fetching shipment:', error);
      toast({
        title: "Error",
        description: "Failed to fetch shipment information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchShipment(searchQuery);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_transit':
      case 'out_for_delivery':
        return <Truck className="h-5 w-5 text-blue-600" />;
      case 'exception':
        return <Clock className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in_transit':
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'exception':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Search className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Track Your Shipment</h1>
              <p className="text-muted-foreground">Enter your tracking number to get real-time updates</p>
            </div>
          </div>

          {/* Search Form */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex gap-4">
                <Input
                  placeholder="Enter tracking number (e.g., TRK-20241128-12345678)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={loading} className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  {loading ? 'Searching...' : 'Track'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {shipment && (
            <div className="space-y-6">
              {/* Shipment Overview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Tracking: {shipment.tracking_number}
                      </CardTitle>
                      <CardDescription>
                        Created {formatDistanceToNow(new Date(shipment.created_at))} ago
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(shipment.status)}>
                      {getStatusIcon(shipment.status)}
                      <span className="ml-1">{formatStatus(shipment.status)}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Weight className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{shipment.weight_kg} kg</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{formatStatus(shipment.service_level)}</span>
                    </div>
                    {shipment.shipping_cost && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{shipment.shipping_cost.toLocaleString()} FCFA</span>
                      </div>
                    )}
                    {shipment.estimated_delivery_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          ETA: {new Date(shipment.estimated_delivery_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Tracking Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Tracking History</CardTitle>
                  <CardDescription>Real-time updates on your shipment's journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statusHistory.length > 0 ? (
                      statusHistory.map((event, index) => (
                        <div key={event.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            {getStatusIcon(event.status)}
                            {index < statusHistory.length - 1 && (
                              <div className="w-px h-8 bg-border mt-2" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{formatStatus(event.status)}</h3>
                              <time className="text-sm text-muted-foreground">
                                {new Date(event.timestamp).toLocaleString()}
                              </time>
                            </div>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                            {event.location && (
                              <div className="flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{event.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No tracking history available yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Shipment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sender Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sender Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-medium">{shipment.sender_info?.name}</p>
                      {shipment.sender_info?.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {shipment.sender_info.phone}
                        </div>
                      )}
                      {shipment.sender_info?.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {shipment.sender_info.email}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">From:</p>
                      <p className="text-sm">{shipment.origin_address}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Receiver Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Receiver Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-medium">{shipment.receiver_info?.name}</p>
                      {shipment.receiver_info?.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {shipment.receiver_info.phone}
                        </div>
                      )}
                      {shipment.receiver_info?.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {shipment.receiver_info.email}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">To:</p>
                      <p className="text-sm">{shipment.destination_address}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Package Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Package Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Description:</p>
                      <p className="text-sm">{shipment.package_details?.description || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Weight:</span>
                        <span>{shipment.weight_kg} kg</span>
                      </div>
                      {shipment.dimensions && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Dimensions:</span>
                          <span>
                            {shipment.dimensions.length} × {shipment.dimensions.width} × {shipment.dimensions.height} cm
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Service:</span>
                        <span>{formatStatus(shipment.service_level)} {formatStatus(shipment.shipping_type)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default TrackShipment;