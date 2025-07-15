import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppErrorBoundary } from "./components/ErrorBoundary/AppErrorBoundary";
import { SafeRender } from "./components/SafeRender/SafeRender";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PulseFeed from "./pages/PulseFeed";
import Politicians from "./pages/Politicians";
import Security from "./pages/Security";
import Marketplace from "./pages/Marketplace";
import Polls from "./pages/Polls";
import Donations from "./pages/Donations";
import Social from "./pages/Social";
import News from "./pages/News";
import Admin from "./pages/Admin";
import PoliticalParties from "./pages/PoliticalParties";
import PoliticalPartyDetail from "./pages/PoliticalPartyDetail";
import PoliticaAI from "./pages/PoliticaAI";
import CamerPulseIntelligence from "./pages/CamerPulseIntelligence";
import CivicPublicPortal from "./pages/CivicPublicPortal";
import Promises from "./pages/Promises";
import RegionalAnalytics from "./pages/RegionalAnalytics";
import OrderSuccess from "./pages/OrderSuccess";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { MobileProvider } from "./contexts/MobileContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PanAfricaProvider } from "./contexts/PanAfricaContext";
import DynamicCountryRouter from "./components/routing/DynamicCountryRouter";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const App = () => {
  useEffect(() => {
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Global error handler for unhandled errors
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      try {
        localStorage.setItem('global_error_log', JSON.stringify({
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          timestamp: new Date().toISOString(),
          url: window.location.href
        }));
      } catch (e) {
        console.error('Failed to log global error:', e);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      try {
        localStorage.setItem('promise_rejection_log', JSON.stringify({
          reason: String(event.reason),
          timestamp: new Date().toISOString(),
          url: window.location.href
        }));
      } catch (e) {
        console.error('Failed to log promise rejection:', e);
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppErrorBoundary>
          <ThemeProvider>
            <AppErrorBoundary>
              <MobileProvider>
                <AppErrorBoundary>
                  <PanAfricaProvider>
                    <AppErrorBoundary>
                      <AuthProvider>
                        <TooltipProvider>
                          <Toaster />
                          <Sonner />
                          <BrowserRouter>
                            <SafeRender>
                              <Routes>
                                <Route path="/" element={
                                  <SafeRender fallback={<div className="p-8 text-center">Home page temporarily unavailable</div>}>
                                    <Index />
                                  </SafeRender>
                                } />
                                <Route path="/auth" element={
                                  <SafeRender fallback={<div className="p-8 text-center">Auth page temporarily unavailable</div>}>
                                    <Auth />
                                  </SafeRender>
                                } />
                                <Route path="/pulse" element={
                                  <SafeRender fallback={<div className="p-8 text-center">Pulse feed temporarily unavailable</div>}>
                                    <PulseFeed />
                                  </SafeRender>
                                } />
                                <Route path="/politicians" element={
                                  <SafeRender fallback={<div className="p-8 text-center">Politicians page temporarily unavailable</div>}>
                                    <Politicians />
                                  </SafeRender>
                                } />
                                <Route path="/security" element={
                                  <SafeRender fallback={<div className="p-8 text-center">Security page temporarily unavailable</div>}>
                                    <Security />
                                  </SafeRender>
                                } />
                                <Route path="/marketplace" element={
                                  <SafeRender fallback={<div className="p-8 text-center">Marketplace temporarily unavailable</div>}>
                                    <Marketplace />
                                  </SafeRender>
                                } />
                                <Route path="/polls" element={
                                  <SafeRender fallback={<div className="p-8 text-center">Polls page temporarily unavailable</div>}>
                                    <Polls />
                                  </SafeRender>
                                } />
                                <Route path="/political-parties" element={
                                  <SafeRender fallback={<div className="p-8 text-center">Political parties page temporarily unavailable</div>}>
                                    <PoliticalParties />
                                  </SafeRender>
                                } />
                                <Route path="/donate" element={
                                  <SafeRender fallback={<div className="p-8 text-center">Donations page temporarily unavailable</div>}>
                                    <Donations />
                                  </SafeRender>
                                } />
                                <Route path="/social" element={
                                  <SafeRender fallback={<div className="p-8 text-center">Social page temporarily unavailable</div>}>
                                    <Social />
                                  </SafeRender>
                                } />
                                <Route path="/news" element={
                                  <SafeRender fallback={<div className="p-8 text-center">News page temporarily unavailable</div>}>
                                    <News />
                                  </SafeRender>
                                } />
                                <Route path="/political-parties/:id" element={
                                  <SafeRender fallback={<div className="p-8 text-center">Party detail temporarily unavailable</div>}>
                                    <PoliticalPartyDetail />
                                  </SafeRender>
                                } />
                                <Route path="/admin" element={
                                  <SafeRender fallback={<div className="p-8 text-center">Admin panel temporarily unavailable</div>}>
                                    <Admin />
                                  </SafeRender>
                                } />
                                <Route path="/politica-ai" element={
                                  <SafeRender fallback={<div className="p-8 text-center">PoliticaAI temporarily unavailable</div>}>
                                    <PoliticaAI />
                                  </SafeRender>
                                } />
                                <Route path="/camerpulse-intelligence" element={
                                  <SafeRender fallback={<div className="p-8 text-center">Intelligence dashboard temporarily unavailable</div>}>
                                    <DynamicCountryRouter>
                                      <CamerPulseIntelligence />
                                    </DynamicCountryRouter>
                                  </SafeRender>
                                } />
                                <Route path="/camerpulse/:countryCode" element={
                                  <SafeRender fallback={<div className="p-8 text-center">Country intelligence temporarily unavailable</div>}>
                                    <DynamicCountryRouter>
                                      <CamerPulseIntelligence />
                                    </DynamicCountryRouter>
                                  </SafeRender>
                                } />
                                <Route path="/civic-portal" element={
                                  <SafeRender fallback={<div className="p-8 text-center">Civic portal temporarily unavailable</div>}>
                                    <CivicPublicPortal />
                                  </SafeRender>
                                } />
                                <Route path="/promises" element={
                                  <SafeRender fallback={<div className="p-8 text-center">Promises tracker temporarily unavailable</div>}>
                                    <Promises />
                                  </SafeRender>
                                } />
                                <Route path="/regional-analytics" element={
                                  <SafeRender fallback={<div className="p-8 text-center">Regional analytics temporarily unavailable</div>}>
                                    <RegionalAnalytics />
                                  </SafeRender>
                                } />
                                <Route path="/marketplace/order-success" element={
                                  <SafeRender fallback={<div className="p-8 text-center">Order confirmation temporarily unavailable</div>}>
                                    <OrderSuccess />
                                  </SafeRender>
                                } />
                                <Route path="*" element={<NotFound />} />
                              </Routes>
                            </SafeRender>
                          </BrowserRouter>
                        </TooltipProvider>
                      </AuthProvider>
                    </AppErrorBoundary>
                  </PanAfricaProvider>
                </AppErrorBoundary>
              </MobileProvider>
            </AppErrorBoundary>
          </ThemeProvider>
        </AppErrorBoundary>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
};

export default App;
