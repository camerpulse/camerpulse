import React from 'react';
import { CivicLayout } from '@/components/camerpulse/CivicLayout';
import { OneAndIndivisibleSection } from '@/components/unity/OneAndIndivisibleSection';

export const OneAndIndivisiblePage: React.FC = () => {
  return (
    <CivicLayout className="bg-gradient-sacred-unity">
      <OneAndIndivisibleSection />
    </CivicLayout>
  );
};