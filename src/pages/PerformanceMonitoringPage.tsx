import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PerformanceMonitoringDashboard } from '@/components/monitoring/PerformanceMonitoringDashboard';
import { ProtectedRoute } from '@/components/routing/ProtectedRoute';

const PerformanceMonitoringPage: React.FC = () => {
  return (
    <ProtectedRoute requireAdmin={true}>
      <MainLayout>
        <PerformanceMonitoringDashboard />
      </MainLayout>
    </ProtectedRoute>
  );
};

export default PerformanceMonitoringPage;