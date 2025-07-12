import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if app is already installed
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppMode = (window.navigator as any).standalone === true;
    
    if (isInStandaloneMode || isInWebAppMode) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA: beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install prompt after a delay (better UX)
      setTimeout(() => {
        if (!localStorage.getItem('pwa-prompt-dismissed')) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      console.log('PWA: App was installed successfully');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      toast({
        title: "🎉 CamerPulse Installed!",
        description: "App installed successfully. You can now access it from your home screen.",
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback for browsers that don't support the install prompt
      toast({
        title: "Install CamerPulse",
        description: "Add CamerPulse to your home screen using your browser's menu → 'Add to Home Screen'",
      });
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt');
        toast({
          title: "Installing CamerPulse...",
          description: "The app is being added to your device.",
        });
      } else {
        console.log('PWA: User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('PWA: Error during installation:', error);
      toast({
        title: "Installation Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if already installed or dismissed
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 z-40 md:bottom-4 md:left-auto md:right-4 md:max-w-sm">
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 shadow-elegant">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1">
                Install CamerPulse
              </h3>
              <p className="text-xs text-primary-foreground/90 mb-3">
                Get the full app experience! Install CamerPulse for faster access and offline features.
              </p>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={handleInstallClick}
                  className="bg-white text-primary hover:bg-white/90 text-xs h-8 px-3"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Install
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-primary-foreground hover:bg-white/10 text-xs h-8 px-2"
                >
                  Later
                </Button>
              </div>
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="flex-shrink-0 text-primary-foreground hover:bg-white/10 h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};