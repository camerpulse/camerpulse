import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Smartphone, 
  X, 
  Monitor,
  Wifi,
  Zap,
  Shield
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
      setIsInstalled(isStandaloneMode);
    };

    checkStandalone();

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const beforeInstallPromptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(beforeInstallPromptEvent);
      setIsInstallable(true);
      
      // Show prompt after a short delay if not dismissed before
      setTimeout(() => {
        if (!isInstalled && !localStorage.getItem('pwa-install-dismissed')) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or running in standalone mode
  if (isInstalled || isStandalone) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-green-800">App Installed</h3>
              <p className="text-sm text-green-600">
                CamerPulse is running as an installed app!
              </p>
            </div>
            <Badge variant="outline" className="border-green-300 text-green-700">
              Installed
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't show if not installable
  if (!isInstallable && !showPrompt) {
    return null;
  }

  return (
    <>
      {/* Install Prompt Card */}
      {showPrompt && (
        <Card className="border-blue-200 bg-blue-50 mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Download className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-blue-800 mb-1">
                  Install CamerPulse App
                </h3>
                <p className="text-sm text-blue-600 mb-3">
                  Get the full app experience with offline access, push notifications, and faster loading.
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={handleInstallClick}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Install
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleDismiss}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    Not Now
                  </Button>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-blue-600 hover:bg-blue-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Card */}
      {isInstallable && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Install CamerPulse</h3>
              <p className="text-muted-foreground">
                Transform your browser experience into a native app
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <Wifi className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Offline Access</p>
                  <p className="text-xs text-muted-foreground">
                    Browse and receive notifications offline
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Faster Loading</p>
                  <p className="text-xs text-muted-foreground">
                    Instant startup and navigation
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Monitor className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Native Feel</p>
                  <p className="text-xs text-muted-foreground">
                    Full-screen app experience
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Secure & Private</p>
                  <p className="text-xs text-muted-foreground">
                    No app store, direct install
                  </p>
                </div>
              </div>
            </div>

            {!showPrompt && deferredPrompt && (
              <Button onClick={handleInstallClick} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Install CamerPulse App
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};