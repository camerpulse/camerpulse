import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Plus, FileText } from 'lucide-react';
import villagesHeroBg from '../../assets/villages-hero-bg.jpg';

export const VillagesHeroSection: React.FC = () => {
  return (
    <div className="relative h-[500px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={villagesHeroBg} 
          alt="Cameroonian village landscape" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-royal-forest opacity-80" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-4xl text-center mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-amber-100 mb-6 shadow-sacred-depth">
            Every Cameroonian is Born from a Village
          </h1>
          <p className="text-xl md:text-2xl text-amber-200 mb-8 max-w-3xl mx-auto">
            Explore the history, people, power, and progress of our villages. 
            This is where identity begins.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 text-lg shadow-ancestral-glow"
            >
              <Search className="w-5 h-5 mr-2" />
              Find Your Village
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-amber-300 text-amber-100 hover:bg-amber-100 hover:text-amber-900 px-8 py-3 text-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add My Village
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-amber-300 text-amber-100 hover:bg-amber-100 hover:text-amber-900 px-8 py-3 text-lg"
            >
              <FileText className="w-5 h-5 mr-2" />
              Start a Petition
            </Button>
          </div>
        </div>
      </div>
      
      {/* Floating Stats */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <Card className="bg-white/10 backdrop-blur-sm border-amber-300/30 text-center">
          <div className="p-4">
            <p className="text-amber-100 text-sm font-medium">
              🏛️ The beating heart of CamerPulse - where all civic life begins
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};