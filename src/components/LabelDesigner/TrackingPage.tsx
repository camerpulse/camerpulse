import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Truck, 
  Search,
  Calendar,
  User,
  Phone,
  Building2,
  Navigation
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TrackingEvent {
  id: string;
  timestamp: string;
  location: string;
  description: string;
  status: 'in_transit' | 'delivered' | 'exception' | 'pending';
  details?: string;
}

interface ShipmentData {
  trackingNumber: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';
  sender: {
    name: string;
    address: string;
    phone?: string;
  };
  receiver: {
    name: string;
    address: string;
    phone?: string;
  };
  deliveryType: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  events: TrackingEvent[];
  lastScannedLocation?: {
    city: string;
    region: string;
    timestamp: string;
    scanType: 'departure' | 'arrival' | 'processing' | 'delivery_attempt';
  };
}

interface TrackingPageProps {
  trackingNumber?: string;
}

export const TrackingPage: React.FC<TrackingPageProps> = ({ trackingNumber: initialTrackingNumber }) => {
  const { toast } = useToast();
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber || '');
  const [shipmentData, setShipmentData] = useState<ShipmentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demo purposes
  const mockShipmentData: ShipmentData = {
    trackingNumber: 'CP2024010001',
    status: 'in_transit',
    sender: {
      name: 'Tech Solutions Ltd',
      address: 'Douala, Littoral Region, Cameroon',
      phone: '+237 6XX XXX XXX'
    },
    receiver: {
      name: 'John Doe',
      address: 'Yaoundé, Centre Region, Cameroon',
      phone: '+237 6XX XXX XXX'
    },
    deliveryType: 'Express Delivery',
    estimatedDelivery: '2024-01-15 17:00',
    lastScannedLocation: {
      city: 'Douala',
      region: 'Littoral',
      timestamp: '2024-01-12 14:30:00',
      scanType: 'departure'
    },
    events: [
      {
        id: '1',
        timestamp: '2024-01-10 09:00:00',
        location: 'Douala Distribution Center',
        description: 'Package received at facility',
        status: 'in_transit'
      },
      {
        id: '2',
        timestamp: '2024-01-10 10:30:00',
        location: 'Douala Distribution Center',
        description: 'Package processed and sorted',
        status: 'in_transit'
      },
      {
        id: '3',
        timestamp: '2024-01-11 08:15:00',
        location: 'Douala Hub',
        description: 'Package loaded for transport',
        status: 'in_transit'
      },
      {
        id: '4',
        timestamp: '2024-01-12 14:30:00',
        location: 'Douala, Littoral',
        description: 'Package departed facility',
        status: 'in_transit'
      }
    ]
  };

  const handleSearch = async () => {
    if (!trackingNumber.trim()) {
      toast({
        title: "Tracking Number Required",
        description: "Please enter a tracking number to search",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the tracking API endpoint
      const response = await fetch(`https://wsiorhtiovwcajiarydw.supabase.co/functions/v1/track-shipment/${trackingNumber}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzaW9yaHRpb3Z3Y2FqaWFyeWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODE3ODAsImV4cCI6MjA2Nzg1Nzc4MH0.4GKFhQTxlEzj6oTcfnAZQpPxPHW0nqGDEfBe-gVGoNE'}`,
        }
      });

      if (!response.ok) {
        throw new Error('Tracking number not found');
      }

      const data = await response.json();
      setShipmentData(data);
    } catch (err) {
      console.error('Tracking error:', err);
      // Fallback to mock data if API fails
      if (trackingNumber.toLowerCase().includes('cp2024')) {
        setShipmentData(mockShipmentData);
      } else {
        setError('Tracking number not found. Please check the number and try again.');
        setShipmentData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'exception':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'in_transit':
      case 'out_for_delivery':
        return <Truck className="h-5 w-5 text-blue-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'exception':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'in_transit':
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    if (initialTrackingNumber) {
      handleSearch();
    }
  }, [initialTrackingNumber]);

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            Package Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter tracking number (e.g., CP2024010001)"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Searching...' : 'Track'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shipment Data */}
      {shipmentData && (
        <>
          {/* Status Overview */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(shipmentData.status)}
                  <div>
                    <h3 className="font-semibold text-lg">
                      Tracking #{shipmentData.trackingNumber}
                    </h3>
                    <Badge className={`mt-1 ${getStatusColor(shipmentData.status)}`}>
                      {shipmentData.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Delivery Type</p>
                  <p className="font-medium">{shipmentData.deliveryType}</p>
                </div>
              </div>

              {/* Last Scanned Location Enhancement */}
              {shipmentData.lastScannedLocation && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Last seen at {shipmentData.lastScannedLocation.city}, {shipmentData.lastScannedLocation.region} — {formatDateTime(shipmentData.lastScannedLocation.timestamp)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sender Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Sender
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{shipmentData.sender.name}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{shipmentData.sender.address}</span>
                </div>
                {shipmentData.sender.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{shipmentData.sender.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Receiver Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Receiver
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{shipmentData.receiver.name}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{shipmentData.receiver.address}</span>
                </div>
                {shipmentData.receiver.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{shipmentData.receiver.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Delivery Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Delivery Timeline
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Estimated Delivery: {formatDateTime(shipmentData.estimatedDelivery)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shipmentData.events.map((event, index) => (
                  <div key={event.id} className="relative">
                    {index < shipmentData.events.length - 1 && (
                      <div className="absolute left-2.5 top-6 h-8 w-0.5 bg-gray-200"></div>
                    )}
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        {getStatusIcon(event.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm">{event.description}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </p>
                            {event.details && (
                              <p className="text-xs text-muted-foreground mt-1">{event.details}</p>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDateTime(event.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};