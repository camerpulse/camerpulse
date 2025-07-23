import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Smartphone, Download, Share, Camera, Bell, 
  Wifi, WifiOff, Battery, Settings, MapPin, Fingerprint
} from 'lucide-react';

interface MobileFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  available: boolean;
  status: 'supported' | 'limited' | 'unavailable';
}

export const MobileAppFeatures: React.FC = () => {
  const { toast } = useToast();
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');
  const [batteryLevel, setBatteryLevel] = useState<number>(85);

  const mobileFeatures: MobileFeature[] = [
    {
      id: 'camera',
      name: 'Camera Access',
      description: 'Take photos for tender submissions and verification',
      icon: Camera,
      available: true,
      status: 'supported'
    },
    {
      id: 'notifications',
      name: 'Push Notifications',
      description: 'Real-time alerts for tender updates and deadlines',
      icon: Bell,
      available: true,
      status: 'supported'
    },
    {
      id: 'geolocation',
      name: 'Location Services',
      description: 'Auto-detect location for local tenders',
      icon: MapPin,
      available: true,
      status: 'supported'
    },
    {
      id: 'biometric',
      name: 'Biometric Auth',
      description: 'Secure login with fingerprint or face recognition',
      icon: Fingerprint,
      available: true,
      status: 'supported'
    },
    {
      id: 'offline',
      name: 'Offline Support',
      description: 'View cached tenders when offline',
      icon: WifiOff,
      available: true,
      status: 'limited'
    },
    {
      id: 'sharing',
      name: 'Native Sharing',
      description: 'Share tenders via system share sheet',
      icon: Share,
      available: true,
      status: 'supported'
    }
  ];

  const handleTestFeature = async (featureId: string) => {
    switch (featureId) {
      case 'camera':
        if ('navigator' in window && 'mediaDevices' in navigator) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            toast({
              title: "Camera Access",
              description: "Camera permissions granted successfully!",
            });
            stream.getTracks().forEach(track => track.stop());
          } catch (error) {
            toast({
              title: "Camera Error",
              description: "Camera access denied or not available.",
              variant: "destructive",
            });
          }
        }
        break;
        
      case 'notifications':
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            new Notification('CamerPulse', {
              body: 'Push notifications are working!',
              icon: '/favicon.ico'
            });
            toast({
              title: "Notifications Enabled",
              description: "You'll receive tender updates and alerts.",
            });
          }
        }
        break;
        
      case 'geolocation':
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              toast({
                title: "Location Found",
                description: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`,
              });
            },
            (error) => {
              toast({
                title: "Location Error",
                description: "Unable to access location services.",
                variant: "destructive",
              });
            }
          );
        }
        break;
        
      case 'sharing':
        if ('share' in navigator) {
          try {
            await (navigator as any).share({
              title: 'CamerPulse - Tender Platform',
              text: 'Check out this innovative tender platform for Cameroon',
              url: window.location.href
            });
            toast({
              title: "Shared Successfully",
              description: "Content shared via native share sheet.",
            });
          } catch (error) {
            toast({
              title: "Share Error",
              description: "Native sharing not supported on this device.",
              variant: "destructive",
            });
          }
        } else {
          // Fallback to clipboard
          await navigator.clipboard.writeText(window.location.href);
          toast({
            title: "Link Copied",
            description: "Link copied to clipboard for sharing.",
          });
        }
        break;
        
      default:
        toast({
          title: "Feature Test",
          description: `Testing ${featureId} feature...`,
        });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'supported': return 'bg-green-100 text-green-800';
      case 'limited': return 'bg-yellow-100 text-yellow-800';
      case 'unavailable': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mobile App Features</h2>
          <p className="text-muted-foreground">Native mobile capabilities for enhanced user experience</p>
        </div>
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          <span className="text-sm font-medium">Mobile Ready</span>
        </div>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              {networkStatus === 'online' ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
              <span className="text-sm">
                Network: <strong className={networkStatus === 'online' ? 'text-green-600' : 'text-red-600'}>
                  {networkStatus}
                </strong>
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Battery className="h-5 w-5 text-blue-600" />
              <span className="text-sm">
                Battery: <strong>{batteryLevel}%</strong>
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-purple-600" />
              <span className="text-sm">
                Platform: <strong>
                  {navigator.platform || 'Unknown'}
                </strong>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mobileFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    <CardTitle className="text-lg">{feature.name}</CardTitle>
                  </div>
                  <Badge className={getStatusColor(feature.status)}>
                    {feature.status}
                  </Badge>
                </div>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleTestFeature(feature.id)}
                  disabled={!feature.available || feature.status === 'unavailable'}
                  className="w-full"
                  variant={feature.status === 'supported' ? 'default' : 'outline'}
                >
                  Test Feature
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Installation Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Install Mobile App
          </CardTitle>
          <CardDescription>
            Get the full mobile experience with our native app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <h4 className="font-medium mb-2">For Developers:</h4>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Export this project to your GitHub repository</li>
                <li>Clone the repository locally and run <code className="bg-muted px-1 rounded">npm install</code></li>
                <li>Add platforms: <code className="bg-muted px-1 rounded">npx cap add ios</code> and/or <code className="bg-muted px-1 rounded">npx cap add android</code></li>
                <li>Build the project: <code className="bg-muted px-1 rounded">npm run build</code></li>
                <li>Sync with native platforms: <code className="bg-muted px-1 rounded">npx cap sync</code></li>
                <li>Run on device: <code className="bg-muted px-1 rounded">npx cap run ios</code> or <code className="bg-muted px-1 rounded">npx cap run android</code></li>
              </ol>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This is a Progressive Web App (PWA) that can also be installed directly from your browser. 
                Look for the "Install" or "Add to Home Screen" option in your browser menu.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};