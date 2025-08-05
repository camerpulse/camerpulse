import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { VillageRegistry } from '@/components/civic/VillageRegistry';

const VillagesDirectory: React.FC = () => {
  return (
    <MainLayout>
      <VillageRegistry />
    </MainLayout>
  );
};

export default VillagesDirectory;