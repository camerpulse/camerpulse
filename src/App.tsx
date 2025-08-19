import React from "react";
import { HelmetProvider } from 'react-helmet-async';
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { MobileProvider } from "./contexts/MobileContext";
import { PanAfricaProvider } from "./contexts/PanAfricaContext";

import { AppRouter } from "./components/routing/AppRouter";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { PWAInstallPrompt } from "./components/Layout/PWAInstallPrompt";
import { SecurityMonitor } from "./components/Security/SecurityMonitor";

import { queryClient } from "./services/api";
import { setupGlobalErrorHandling } from "./utils/errorHandling";
import { setupLogging } from "./utils/logger";
import { performanceMonitor } from "./utils/performance";

import "./App.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "@/styles/globals.css";

// Initialize global services
setupGlobalErrorHandling();
setupLogging();

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.init();
  // Set document language to English globally
  document.documentElement.lang = 'en';
}

/**
 * Root App Component - English Only
 * CamerPulse platform configured for English-only operation
 */
const App: React.FC = () => {
  return (
    <React.StrictMode>
      <ErrorBoundary>
        <HelmetProvider>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <TooltipProvider>
                <AppProvider>
                  <AuthProvider>
                    <PanAfricaProvider>
                      <MobileProvider>
                        <Toaster />
                        <Sonner />
                        <PWAInstallPrompt />
                        <SecurityMonitor />
                        <AppRouter />
                      </MobileProvider>
                    </PanAfricaProvider>
                  </AuthProvider>
                </AppProvider>
              </TooltipProvider>
            </BrowserRouter>
          </QueryClientProvider>
        </HelmetProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
};

export default App;