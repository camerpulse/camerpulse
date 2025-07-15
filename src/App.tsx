import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MobileProvider>
          <PanAfricaProvider>
            <AuthProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/pulse" element={<PulseFeed />} />
              <Route path="/politicians" element={<Politicians />} />
              <Route path="/security" element={<Security />} />
<Route path="/marketplace" element={<Marketplace />} />
              <Route path="/polls" element={<Polls />} />
              <Route path="/political-parties" element={<PoliticalParties />} />
              <Route path="/donate" element={<Donations />} />
              <Route path="/social" element={<Social />} />
              <Route path="/news" element={<News />} />
              <Route path="/political-parties" element={<PoliticalParties />} />
              <Route path="/political-parties/:id" element={<PoliticalPartyDetail />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/politica-ai" element={<PoliticaAI />} />
              <Route path="/camerpulse-intelligence" element={
                <DynamicCountryRouter>
                  <CamerPulseIntelligence />
                </DynamicCountryRouter>
              } />
              <Route path="/camerpulse/:countryCode" element={
                <DynamicCountryRouter>
                  <CamerPulseIntelligence />
                </DynamicCountryRouter>
              } />
              <Route path="/civic-portal" element={<CivicPublicPortal />} />
              <Route path="/promises" element={<Promises />} />
              <Route path="/regional-analytics" element={<RegionalAnalytics />} />
              <Route path="/marketplace/order-success" element={<OrderSuccess />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
                </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </AuthProvider>
          </PanAfricaProvider>
        </MobileProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
