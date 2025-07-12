import React from 'react';
import { HeroSection } from "@/components/Homepage/HeroSection";
import { AppLayout } from "@/components/Layout/AppLayout";
import { useTheme } from '@/contexts/ThemeContext';
import { Emergence2035HomePage } from '@/components/Theme/Emergence2035HomePage';

const Index = () => {
  const { currentTheme } = useTheme();
  
  // Show Emergence 2035 theme if active
  if (currentTheme.id === 'emergence-2035') {
    return (
      <AppLayout>
        <Emergence2035HomePage />
      </AppLayout>
    );
  }

  // Default homepage
  return (
    <AppLayout>
      <HeroSection />
    </AppLayout>
  );
};

export default Index;