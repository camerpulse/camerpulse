import React, { lazy, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Lazy load AI components to reduce initial bundle size
const PoliticaAIDashboard = lazy(() => import('./PoliticaAIDashboard').then(module => ({ default: module.PoliticaAIDashboard })));
const AIVerificationModal = lazy(() => import('./AIVerificationModal').then(module => ({ default: module.AIVerificationModal })));
const CivicPerformanceRanking = lazy(() => import('./CivicPerformanceRanking').then(module => ({ default: module.CivicPerformanceRanking })));

// Loading component for AI modules
const AILoadingFallback = ({ text = "Loading AI module..." }) => (
  <Card className="w-full">
    <CardContent className="flex items-center justify-center p-8">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-muted-foreground">{text}</span>
      </div>
    </CardContent>
  </Card>
);

// Lazy-loaded wrappers
export const LazyPoliticaAIDashboard = ({ ...props }) => (
  <Suspense fallback={<AILoadingFallback text="Loading Politica AI Dashboard..." />}>
    <PoliticaAIDashboard {...props} />
  </Suspense>
);

export const LazyAIVerificationModal = ({ ...props }) => (
  <Suspense fallback={<AILoadingFallback text="Loading AI Verification..." />}>
    <AIVerificationModal {...props} />
  </Suspense>
);

export const LazyCivicPerformanceRanking = ({ ...props }) => (
  <Suspense fallback={<AILoadingFallback text="Loading Performance Analytics..." />}>
    <CivicPerformanceRanking {...props} />
  </Suspense>
);

// Export individual components for selective loading
export {
  PoliticaAIDashboard as LazyPoliticaAIDashboardDirect,
  AIVerificationModal as LazyAIVerificationModalDirect,
  CivicPerformanceRanking as LazyCivicPerformanceRankingDirect
};