import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import { LegislationTracker } from "./pages/LegislationTracker";
import HospitalsDirectory from "./pages/HospitalsDirectory";
import Tenders from "./pages/Tenders";
import TenderDetail from "./pages/TenderDetail";
import CreateTender from "./pages/CreateTender";
import TenderAnalytics from "./pages/TenderAnalytics";
import SearchInterface from "./components/SearchInterface";
import TenderIssuerDashboard from "./pages/TenderIssuerDashboard";
import BidderDashboard from "./pages/BidderDashboard";
import DiasporaConnect from "./pages/DiasporaConnect";
import { AuthProvider } from "./contexts/AuthContext";
import { PluginProvider } from "./contexts/PluginContext";
import { RealtimeProvider } from "./contexts/RealtimeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { OfflineIndicator } from "./components/pwa/OfflineIndicator";

const queryClient = new QueryClient();

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
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PluginProvider>
            <RealtimeProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <OfflineIndicator />
              <BrowserRouter>
                <Navigation />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/legislation" element={<LegislationTracker />} />
                  <Route path="/hospitals" element={<HospitalsDirectory />} />
                  <Route path="/tenders" element={<Tenders />} />
                  <Route path="/tenders/create" element={<CreateTender />} />
                  <Route path="/tenders/:id" element={<TenderDetail />} />
                  <Route path="/tenders/:id/analytics" element={<TenderAnalytics />} />
                  <Route path="/search" element={<SearchInterface />} />
                  <Route path="/analytics" element={<TenderAnalytics />} />
                  <Route path="/dashboard/tenders" element={<TenderIssuerDashboard />} />
                  <Route path="/my-bids" element={<BidderDashboard />} />
                  <Route path="/diaspora-connect" element={<DiasporaConnect />} />
                </Routes>
              </BrowserRouter>
              </TooltipProvider>
            </RealtimeProvider>
          </PluginProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;