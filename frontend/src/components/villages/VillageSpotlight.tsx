import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFeaturedVillage } from '@/hooks/useVillages';
import { MapPin, Users, Star, ExternalLink } from 'lucide-react';
import villageChiefPortrait from '../../assets/village-chief-portrait.jpg';

export const VillageSpotlight: React.FC = () => {
  const { data: featuredVillage, isLoading } = useFeaturedVillage();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded mb-4"></div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-48 bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (!featuredVillage) return null;

  return (
    <Card className="p-6 bg-gradient-ancestral shadow-royal-forest">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-amber-100 mb-2">
          🌟 Village of the Week Spotlight
        </h2>
        <p className="text-amber-200">
          Celebrating the heritage and progress of our communities
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-center">
        {/* Village Image */}
        <div className="relative">
          <img 
            src={villageChiefPortrait} 
            alt={`${featuredVillage.village_name} spotlight`}
            className="w-full h-64 object-cover rounded-lg shadow-ancestral-glow"
          />
          <Badge className="absolute top-3 left-3 bg-amber-600 text-white">
            Featured Village
          </Badge>
        </div>

        {/* Village Information */}
        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-amber-100 mb-2">
              {featuredVillage.village_name}
            </h3>
            <div className="flex items-center gap-2 text-amber-200 mb-3">
              <MapPin className="w-4 h-4" />
              <span>{featuredVillage.division}, {featuredVillage.region}</span>
              {featuredVillage.is_verified && (
                <Badge variant="secondary" className="bg-green-600 text-white ml-2">
                  ✓ Verified
                </Badge>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white/10 rounded-lg">
              <div className="text-xl font-bold text-amber-100">
                {featuredVillage.overall_rating.toFixed(1)}★
              </div>
              <div className="text-sm text-amber-200">Overall Rating</div>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-lg">
              <div className="text-xl font-bold text-amber-100">
                {featuredVillage.sons_daughters_count || 0}
              </div>
              <div className="text-sm text-amber-200">Sons & Daughters</div>
            </div>
          </div>

          {/* Key Achievements */}
          <div className="space-y-2">
            <h4 className="font-semibold text-amber-100">Key Achievements:</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-amber-200">Infrastructure:</span>
                <span className="text-amber-100">{featuredVillage.infrastructure_score}/10</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-amber-200">Education:</span>
                <span className="text-amber-100">{featuredVillage.education_score}/10</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-amber-200">Governance:</span>
                <span className="text-amber-100">{featuredVillage.governance_score}/10</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            size="lg"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Visit Village Page
          </Button>
        </div>
      </div>
    </Card>
  );
};