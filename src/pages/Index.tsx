import React from 'react';
import { ThemeAwareHero } from "@/components/Homepage/ThemeAwareHero";
import { AppLayout } from "@/components/Layout/AppLayout";

const Index = () => {
  return (
    <AppLayout>
      <ThemeAwareHero />
    </AppLayout>
  );
};

export default Index;