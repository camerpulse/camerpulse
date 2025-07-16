import React from 'react';
import { ThemeAwareHero } from "@/components/Homepage/ThemeAwareHero";
import { AppLayout } from "@/components/Layout/AppLayout";
import { LuxAeternaAchievements } from "@/components/Theme/LuxAeternaAchievements";
import { PatrioticDataVisualization } from "@/components/Theme/PatrioticDataVisualization";
import { CivicPollCreator } from "@/components/Polls/CivicPollCreator";
import { YouthPollCreator } from "@/components/Polls/YouthPollCreator";
import { PresidentialPollCreator } from "@/components/Polls/PresidentialPollCreator";
import { ElectricityPollCreator } from "@/components/Polls/ElectricityPollCreator";

const Index = () => {
  return (
    <AppLayout>
      <ThemeAwareHero />
      <div className="container mx-auto px-4 py-8">
        <PatrioticDataVisualization />
      </div>
      <div className="container mx-auto px-4 py-8 space-y-12">
        <PresidentialPollCreator />
        <ElectricityPollCreator />
        <CivicPollCreator />
        <YouthPollCreator />
      </div>
      <LuxAeternaAchievements />
    </AppLayout>
  );
};

export default Index;