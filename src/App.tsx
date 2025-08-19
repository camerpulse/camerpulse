import React from "react";
import { HelmetProvider } from 'react-helmet-async';
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

// Context Providers
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { MobileProvider } from "./contexts/MobileContext";
import { PanAfricaProvider } from "./contexts/PanAfricaContext";

// Core Components
import { AppRouter } from "./components/routing/AppRouter";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { PWAInstallPrompt } from "./components/Layout/PWAInstallPrompt";
import { SecurityMonitor } from "./components/Security/SecurityMonitor";

// Services & Utilities
import { queryClient } from "./services/api";
import { setupGlobalErrorHandling } from "./utils/errorHandling";
import { setupLogging } from "./utils/logger";
import { performanceMonitor } from "./utils/performance";

// Initialize global services
setupGlobalErrorHandling();
setupLogging();

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.init();
}

/**
 * Root App Component
 * 
 * Sets up all providers and global services for CamerPulse platform.
 * Uses hierarchical provider structure for optimal performance.
 */
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <TooltipProvider>
              <AppProvider>
                <AuthProvider>
                  <PanAfricaProvider>
                    <MobileProvider>
                      <LanguageProvider>
                        {/* UI Components */}
                        <Toaster />
                        <Sonner />
                        <PWAInstallPrompt />
                        <SecurityMonitor />
                        
                        {/* Main Application Router */}
                        <AppRouter />
                      </LanguageProvider>
                    </MobileProvider>
                  </PanAfricaProvider>
                </AuthProvider>
              </AppProvider>
            </TooltipProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;