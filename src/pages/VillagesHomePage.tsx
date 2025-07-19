import React from 'react';
import { VillagesHeroSection } from '../components/villages/VillagesHeroSection';
import { VillageStatsCounter } from '../components/villages/VillageStatsCounter';
import { InteractiveMap } from '../components/villages/InteractiveMap';
import { VillageRankings } from '../components/villages/VillageRankings';
import { VillageFeed } from '../components/villages/VillageFeed';
import { AddVillageWidget } from '../components/villages/AddVillageWidget';
import { CivicCategories } from '../components/villages/CivicCategories';
import { VillageSpotlight } from '../components/villages/VillageSpotlight';
import { CommunityActions } from '../components/villages/CommunityActions';

export const VillagesHomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <VillagesHeroSection />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Live Statistics */}
        <VillageStatsCounter />
        
        {/* Interactive Map */}
        <InteractiveMap />
        
        {/* Village Rankings */}
        <VillageRankings />
        
        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Village Feed */}
            <VillageFeed />
            
            {/* Civic Categories */}
            <CivicCategories />
          </div>
          
          {/* Right Column - 1/3 width */}
          <div className="space-y-8">
            {/* Add Village Widget */}
            <AddVillageWidget />
            
            {/* Village Spotlight */}
            <VillageSpotlight />
          </div>
        </div>
      </div>
      
      {/* Community Actions Footer */}
      <CommunityActions />
    </div>
  );
};