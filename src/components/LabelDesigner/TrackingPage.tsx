import React, { useState, useEffect } from 'react';
import { CamerLogisticsLayout } from '@/components/Layout/CamerLogisticsLayout';
import { MobileCard, MobileCardContent, MobileCardHeader, MobileCardTitle } from '@/components/ui/mobile-card';
import { MobileButton, MobileInput } from '@/components/ui/mobile-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useIsMobile } from '@/hooks/use-mobile';
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
  Navigation,
  ArrowRight,
  Star,
  Timer,
  Target,
  Zap
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
  const isMobile = useIsMobile();
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber || '');
  const [shipmentData, setShipmentData] = useState<ShipmentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState(0);

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
      console.log('Tracking number:', trackingNumber);
      console.log('Making request to:', `https://wsiorhtiovwcajiarydw.supabase.co/functions/v1/track-shipment/${trackingNumber}`);
      
      // Call the tracking API endpoint
      const response = await fetch(`https://wsiorhtiovwcajiarydw.supabase.co/functions/v1/track-shipment/${trackingNumber}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzaW9yaHRpb3Z3Y2FqaWFyeWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODE3ODAsImV4cCI6MjA2Nzg1Nzc4MH0.4GKFhQTxlEzj6oTcfnAZQpPxPHW0nqGDEfBe-gVGoNE`,
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzaW9yaHRpb3Z3Y2FqaWFyeWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODE3ODAsImV4cCI6MjA2Nzg1Nzc4MH0.4GKFhQTxlEzj6oTcfnAZQpPxPHW0nqGDEfBe-gVGoNE'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      // Transform the API response to match our interface
      const transformedData: ShipmentData = {
        trackingNumber: data.tracking_number,
        status: data.status,
        sender: {
          name: data.sender_info?.name || 'Unknown Sender',
          address: data.sender_info?.address || 'Unknown Address',
          phone: data.sender_info?.phone
        },
        receiver: {
          name: data.receiver_info?.name || 'Unknown Receiver',
          address: data.receiver_info?.address || 'Unknown Address',
          phone: data.receiver_info?.phone
        },
        deliveryType: data.delivery_type || 'Standard',
        estimatedDelivery: data.estimated_delivery || new Date().toISOString(),
        events: data.events || [],
        lastScannedLocation: data.last_scanned_location
      };
      
      setShipmentData(transformedData);
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

  const getStatusIcon = (status: string, isActive = false) => {
    const baseClasses = isActive ? "h-6 w-6" : "h-5 w-5";
    const animationClasses = isActive ? "animate-pulse" : "";
    
    switch (status) {
      case 'delivered':
        return <CheckCircle className={`${baseClasses} text-primary ${animationClasses}`} />;
      case 'exception':
        return <AlertCircle className={`${baseClasses} text-destructive ${animationClasses}`} />;
      case 'in_transit':
      case 'out_for_delivery':
        return <Truck className={`${baseClasses} text-secondary ${animationClasses}`} />;
      default:
        return <Package className={`${baseClasses} text-muted-foreground ${animationClasses}`} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'exception':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'in_transit':
      case 'out_for_delivery':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'pending': return 10;
      case 'picked_up': return 25;
      case 'in_transit': return 60;
      case 'out_for_delivery': return 85;
      case 'delivered': return 100;
      default: return 0;
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

  useEffect(() => {
    if (shipmentData) {
      const progress = getProgressValue(shipmentData.status);
      setProgressValue(progress);
    }
  }, [shipmentData]);

  return (
    <CamerLogisticsLayout>
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary-glow/20 text-white border-primary-glow/30">
              <Navigation className="h-4 w-4 mr-2" />
              Real-Time Package Tracking
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Track Your Package
            </h1>
            
            <p className="text-lg sm:text-xl text-primary-foreground/90 max-w-3xl mx-auto mb-8">
              Get real-time updates on your package location and delivery status with our advanced tracking system.
            </p>

            {/* Enhanced Search Box */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 lg:p-8 max-w-3xl mx-auto border border-white/20 shadow-glow">
              <div className="flex flex-col sm:flex-row gap-4">
                {isMobile ? (
                  <>
                    <MobileInput
                      placeholder="Enter tracking number (e.g., CP2024010001)"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="bg-white text-foreground border-0 flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <MobileButton 
                      onClick={handleSearch} 
                      disabled={loading}
                      className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                    >
                      {loading ? (
                        <>
                          <Timer className="h-5 w-5 mr-2 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="h-5 w-5 mr-2" />
                          Track Package
                        </>
                      )}
                    </MobileButton>
                  </>
                ) : (
                  <>
                    <Input
                      placeholder="Enter tracking number (e.g., CP2024010001)"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="bg-white text-foreground border-0 flex-1 h-14 text-lg"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button 
                      onClick={handleSearch} 
                      disabled={loading}
                      size="lg"
                      className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-14 px-8"
                    >
                      {loading ? (
                        <>
                          <Timer className="h-5 w-5 mr-2 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="h-5 w-5 mr-2" />
                          Track Package
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Error State */}
          {error && (
            <div className="mb-8 animate-fade-in">
              <MobileCard className="border-destructive/20 bg-destructive/5">
                <MobileCardContent className="p-6">
                  <div className="flex items-center gap-3 text-destructive">
                    <AlertCircle className="h-6 w-6 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Package Not Found</h3>
                      <p className="text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </MobileCardContent>
              </MobileCard>
            </div>
          )}

          {/* Shipment Data */}
          {shipmentData && (
            <div className="space-y-8 animate-fade-in">
              {/* Status Overview */}
              <MobileCard className="overflow-hidden">
                <MobileCardContent className="p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                        {getStatusIcon(shipmentData.status, true)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">
                          #{shipmentData.trackingNumber}
                        </h2>
                        <Badge className={`mt-2 ${getStatusColor(shipmentData.status)} px-3 py-1`}>
                          {shipmentData.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-center lg:text-right">
                      <p className="text-sm text-muted-foreground mb-1">Delivery Type</p>
                      <p className="font-semibold text-lg flex items-center gap-2">
                        <Zap className="h-5 w-5 text-secondary" />
                        {shipmentData.deliveryType}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Delivery Progress</span>
                      <span className="text-sm text-muted-foreground">{progressValue}%</span>
                    </div>
                    <Progress value={progressValue} className="h-3 animate-pulse" />
                  </div>

                  {/* Last Scanned Location */}
                  {shipmentData.lastScannedLocation && (
                    <div className="mt-6 p-4 bg-secondary/10 border border-secondary/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                          <Navigation className="h-5 w-5 text-secondary" />
                        </div>
                        <div>
                          <p className="font-medium text-secondary">Current Location</p>
                          <p className="text-sm text-muted-foreground">
                            {shipmentData.lastScannedLocation.city}, {shipmentData.lastScannedLocation.region} — {formatDateTime(shipmentData.lastScannedLocation.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </MobileCardContent>
              </MobileCard>

              {/* Delivery Information */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Sender Information */}
                <MobileCard className="hover:shadow-elegant transition-all duration-300">
                  <MobileCardHeader>
                    <MobileCardTitle className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      Sender Information
                    </MobileCardTitle>
                  </MobileCardHeader>
                  <MobileCardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{shipmentData.sender.name}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <span className="text-sm text-muted-foreground">{shipmentData.sender.address}</span>
                    </div>
                    {shipmentData.sender.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{shipmentData.sender.phone}</span>
                      </div>
                    )}
                  </MobileCardContent>
                </MobileCard>

                {/* Receiver Information */}
                <MobileCard className="hover:shadow-elegant transition-all duration-300">
                  <MobileCardHeader>
                    <MobileCardTitle className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                        <Target className="h-5 w-5 text-secondary" />
                      </div>
                      Receiver Information
                    </MobileCardTitle>
                  </MobileCardHeader>
                  <MobileCardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{shipmentData.receiver.name}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <span className="text-sm text-muted-foreground">{shipmentData.receiver.address}</span>
                    </div>
                    {shipmentData.receiver.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{shipmentData.receiver.phone}</span>
                      </div>
                    )}
                  </MobileCardContent>
                </MobileCard>
              </div>

              {/* Enhanced Delivery Timeline */}
              <MobileCard className="overflow-hidden">
                <MobileCardHeader>
                  <MobileCardTitle className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    Delivery Timeline
                  </MobileCardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Estimated Delivery: {formatDateTime(shipmentData.estimatedDelivery)}</span>
                    </div>
                  </div>
                </MobileCardHeader>
                <MobileCardContent>
                  <div className="space-y-6">
                    {shipmentData.events.map((event, index) => (
                      <div key={event.id} className="relative animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                        {index < shipmentData.events.length - 1 && (
                          <div className="absolute left-6 top-12 h-8 w-0.5 bg-border"></div>
                        )}
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20">
                              {getStatusIcon(event.status)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="bg-muted/30 rounded-xl p-4 hover:bg-muted/50 transition-colors">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-semibold text-foreground">{event.description}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">{event.location}</span>
                                  </div>
                                  {event.details && (
                                    <p className="text-sm text-muted-foreground mt-2 italic">{event.details}</p>
                                  )}
                                </div>
                                <div className="text-right ml-4">
                                  <Badge variant="outline" className="text-xs">
                                    {formatDateTime(event.timestamp)}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </MobileCardContent>
              </MobileCard>
            </div>
          )}
        </div>
      </section>
    </CamerLogisticsLayout>
  );
};