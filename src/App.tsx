import * as React from "react";
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
import PollsLandingPage from "./pages/PollsLandingPage";
import PollsDashboard from "./pages/PollsDashboard";
import PollsDiscovery from "./pages/PollsDiscovery";
import Donations from "./pages/Donations";
import Social from "./pages/Social";
import News from "./pages/News";
import Admin from "./pages/Admin";
import CamerPulseAdminCore from "./pages/CamerPulseAdminCore";
import PoliticalParties from "./pages/PoliticalParties";
import PoliticalPartyDetail from "./pages/PoliticalPartyDetail";
import PoliticaAI from "./pages/PoliticaAI";
import CamerPulseIntelligence from "./pages/CamerPulseIntelligence";
import CivicPublicPortal from "./pages/CivicPublicPortal";
import Promises from "./pages/Promises";
import RegionalAnalytics from "./pages/RegionalAnalytics";
import OrderSuccess from "./pages/OrderSuccess";
import NotFound from "./pages/NotFound";
import CompanyDirectory from "./pages/CompanyDirectory";
import CompanyRegister from "./pages/CompanyRegister";
import CompanyProfile from "./pages/CompanyProfile";
import CompanyDashboard from "./pages/CompanyDashboard";
import CompanyCreationRequest from "./pages/CompanyCreationRequest";
import BillionaireTracker from "./pages/BillionaireTracker";
import BillionaireApplication from "./pages/BillionaireApplication";
import BillionaireProfile from "./pages/BillionaireProfile";
import BillionaireAdmin from "./pages/BillionaireAdmin";
import NationalDebtTracker from "./pages/NationalDebtTracker";
import DebtAdmin from "./pages/DebtAdmin";
import ElectionForecast from "./pages/ElectionForecast";
import RewardsCenter from "./pages/RewardsCenter";
import PollArchive from "./pages/PollArchive";
import PollResultsPage from "./pages/PollResultsPage";
import PollEmbedGeneratorPage from "./pages/PollEmbedGeneratorPage";
import PollEmbedViewerPage from "./pages/PollEmbedViewerPage";
import MessengerPage from "./pages/MessengerPage";
import { AuthProvider } from "./contexts/AuthContext";
import { MobileProvider } from "./contexts/MobileContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PanAfricaProvider } from "./contexts/PanAfricaContext";
import DynamicCountryRouter from "./components/routing/DynamicCountryRouter";

const queryClient = new QueryClient();

const App = () => {
  React.useEffect(() => {
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
              <Route path="/polls" element={<PollsLandingPage />} />
              <Route path="/polls/discover" element={<PollsDiscovery />} />
          <Route path="/polls/results/:poll_id" element={<PollResultsPage />} />
          <Route path="/polls/embed/:poll_id" element={<PollEmbedViewerPage />} />
          <Route path="/polls/embed-generator/:poll_id" element={<PollEmbedGeneratorPage />} />
          <Route path="/messenger" element={<MessengerPage />} />
              <Route path="/dashboard/polls" element={<PollsDashboard />} />
              <Route path="/political-parties" element={<PoliticalParties />} />
              <Route path="/donate" element={<Donations />} />
              <Route path="/social" element={<Social />} />
              <Route path="/news" element={<News />} />
              <Route path="/political-parties" element={<PoliticalParties />} />
              <Route path="/political-parties/:id" element={<PoliticalPartyDetail />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/core" element={<CamerPulseAdminCore />} />
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
              <Route path="/companies" element={<CompanyDirectory />} />
              <Route path="/companies/register" element={<CompanyRegister />} />
              <Route path="/companies/create-request" element={<CompanyCreationRequest />} />
              <Route path="/companies/dashboard" element={<CompanyDashboard />} />
              <Route path="/companies/:id" element={<CompanyProfile />} />
          <Route path="/billionaires" element={<BillionaireTracker />} />
          <Route path="/billionaires/apply" element={<BillionaireApplication />} />
          <Route path="/billionaires/:id" element={<BillionaireProfile />} />
          <Route path="/admin/billionaires" element={<BillionaireAdmin />} />
          <Route path="/national-debt" element={<NationalDebtTracker />} />
          <Route path="/admin/debt" element={<DebtAdmin />} />
          <Route path="/election-forecast" element={<ElectionForecast />} />
          <Route path="/rewards" element={<RewardsCenter />} />
          <Route path="/poll-archive" element={<PollArchive />} />
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
