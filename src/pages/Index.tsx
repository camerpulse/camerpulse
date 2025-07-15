import React from 'react';
import { ThemeAwareHero } from "@/components/Homepage/ThemeAwareHero";
import { AppLayout } from "@/components/Layout/AppLayout";
import { LuxAeternaAchievements } from "@/components/Theme/LuxAeternaAchievements";

const Index = () => {
  return (
    <AppLayout>
      <ThemeAwareHero />
      <LuxAeternaAchievements />
    </AppLayout>
  );
};

export default Index;