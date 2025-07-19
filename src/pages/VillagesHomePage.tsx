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
import { FeaturedVillagers } from '../components/villages/FeaturedVillagers';
import { VillageSearch } from '../components/villages/VillageSearch';
import { MobileVillageActions } from '../components/villages/MobileVillageActions';
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
        
        {/* Search Section */}
        <div data-component="village-search">
          <VillageSearch showFilters={true} />
        </div>
        
        {/* Interactive Map */}
        <div data-component="interactive-map">
          <InteractiveMap />
        </div>
        
        {/* Village Rankings */}
        <VillageRankings />
        
        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Village Feed */}
            <VillageFeed />
            
            {/* Featured Villagers */}
            <FeaturedVillagers />
            
            {/* Civic Categories */}
            <div data-component="civic-categories">
              <CivicCategories />
            </div>
          </div>
          
          {/* Right Column - 1/3 width */}
          <div className="space-y-8">
            {/* Add Village Widget */}
            <div data-component="add-village-widget">
              <AddVillageWidget />
            </div>
            
            {/* Village Spotlight */}
            <VillageSpotlight />
          </div>
        </div>
      </div>
      
      {/* Community Actions Footer */}
      <CommunityActions />
      
      {/* Mobile Actions */}
      <MobileVillageActions />
    </div>
  );
};