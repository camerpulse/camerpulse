import React from "react";
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { MobileProvider } from "./contexts/MobileContext";
import { PanAfricaProvider } from "./contexts/PanAfricaContext";
import { AuthProvider } from "./contexts/AuthContext";
import { PluginProvider } from "./contexts/PluginContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AppRouter } from "./components/routing/LanguageRoutes";

import { PWAInstallPrompt } from "./components/pwa/PWAInstallPrompt";
import { OfflineIndicator } from "./components/pwa/OfflineIndicator";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { setupGlobalErrorHandling } from "./hooks/useErrorHandler";
import { setupLogging } from "./utils/logger";
import { queryClient, backgroundSync, cleanupQueries } from "./lib/queryClient";
import { productionMonitor } from "./utils/productionMonitor";

// Setup production-ready monitoring and error handling
setupGlobalErrorHandling();
setupLogging();

// Initialize production monitoring
if (typeof window !== 'undefined') {
  productionMonitor.measureCoreWebVitals();
}

// Start background synchronization
backgroundSync.start();

// Cleanup queries every hour
setInterval(cleanupQueries, 60 * 60 * 1000);

const App = () => {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PluginProvider>
            <TooltipProvider>
              <PanAfricaProvider>
                <MobileProvider>
                  <BrowserRouter>
                    <LanguageProvider>
                      <Toaster />
                      <Sonner />
                      <PWAInstallPrompt />
                      <OfflineIndicator />
                      <AppRouter />
                    </LanguageProvider>
                  </BrowserRouter>
                </MobileProvider>
              </PanAfricaProvider>
            </TooltipProvider>
          </PluginProvider>
        </AuthProvider>
      </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
