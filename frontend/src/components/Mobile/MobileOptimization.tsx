import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

interface MobileOptimizationProps {
  children: React.ReactNode;
}

export const MobileOptimization = ({ children }: MobileOptimizationProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isNativeApp, setIsNativeApp] = useState(false);

  useEffect(() => {
    // Detect if running on mobile
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    // Check if running as native app
    setIsNativeApp(Capacitor.isNativePlatform());

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isNativeApp) {
      // Add native app specific styling
      document.body.classList.add('native-app');
      
      // Handle native app lifecycle
      const handleAppStateChange = () => {
        // Add any app state change logic here
        console.log('App state changed');
      };

      document.addEventListener('visibilitychange', handleAppStateChange);
      
      return () => {
        document.removeEventListener('visibilitychange', handleAppStateChange);
      };
    }
  }, [isNativeApp]);

  // Add mobile-specific CSS classes
  useEffect(() => {
    if (isMobile) {
      document.body.classList.add('mobile-optimized');
    } else {
      document.body.classList.remove('mobile-optimized');
    }
  }, [isMobile]);

  return (
    <div className={`
      min-h-screen 
      ${isMobile ? 'mobile-layout' : 'desktop-layout'}
      ${isNativeApp ? 'native-app-layout' : 'web-app-layout'}
    `}>
      {children}
      
      {/* Mobile-specific UI enhancements */}
      {isMobile && (
        <style dangerouslySetInnerHTML={{
          __html: `
          .mobile-optimized {
            -webkit-overflow-scrolling: touch;
            -webkit-user-select: none;
            -webkit-tap-highlight-color: transparent;
          }
          
          .mobile-layout {
            font-size: 16px; /* Prevent zoom on iOS */
          }
          
          .mobile-layout input,
          .mobile-layout textarea {
            font-size: 16px; /* Prevent zoom on focus */
          }
          
          .mobile-layout .card {
            margin: 0.5rem;
            border-radius: 12px;
          }
          
          .mobile-layout .button {
            min-height: 44px; /* iOS touch target size */
            padding: 12px 16px;
          }
          
          .native-app-layout {
            padding-top: env(safe-area-inset-top);
            padding-bottom: env(safe-area-inset-bottom);
            padding-left: env(safe-area-inset-left);
            padding-right: env(safe-area-inset-right);
          }
          
          /* Touch-friendly spacing */
          .mobile-layout .space-y-2 > * + * {
            margin-top: 0.75rem;
          }
          
          .mobile-layout .space-y-4 > * + * {
            margin-top: 1.5rem;
          }
          
          /* Larger tap targets */
          .mobile-layout .cursor-pointer {
            min-height: 44px;
            display: flex;
            align-items: center;
          }
          
          /* Optimized modal spacing */
          .mobile-layout .modal-content {
            margin: 1rem;
            max-height: calc(100vh - 2rem);
            overflow-y: auto;
          }
          
          /* Sticky headers for better navigation */
          .mobile-layout .sticky-header {
            position: sticky;
            top: 0;
            z-index: 10;
            background: white;
            border-bottom: 1px solid #e5e7eb;
          }
          
          /* Swipe indicators */
          .mobile-layout .swipeable {
            position: relative;
          }
          
          .mobile-layout .swipeable::after {
            content: '';
            position: absolute;
            bottom: 8px;
            left: 50%;
            transform: translateX(-50%);
            width: 36px;
            height: 4px;
            background: #d1d5db;
            border-radius: 2px;
          }
          `
        }} />
      )}
    </div>
  );
};

// Hook for mobile-specific functionality
export const useMobileOptimization = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isNativeApp, setIsNativeApp] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    setIsNativeApp(Capacitor.isNativePlatform());
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const showNativeToast = (message: string) => {
    if (isNativeApp) {
      // Use native toast if available
      toast(message);
    } else {
      toast(message);
    }
  };

  const hapticFeedback = () => {
    if (isNativeApp && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  return {
    isMobile,
    isNativeApp,
    showNativeToast,
    hapticFeedback,
  };
};