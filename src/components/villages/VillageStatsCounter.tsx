import React from 'react';
import { Card } from '@/components/ui/card';
import { useVillageStats } from '@/hooks/useVillages';
import { MapPin, BarChart3, Users, FileText, Crown } from 'lucide-react';

export const VillageStatsCounter: React.FC = () => {
  const { data: stats, isLoading } = useVillageStats();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const statItems = [
    {
      icon: MapPin,
      label: 'Villages Listed',
      value: stats?.total_villages.toLocaleString() || '0',
      color: 'text-green-600'
    },
    {
      icon: BarChart3,
      label: 'Projects Tracked',
      value: stats?.total_projects.toLocaleString() || '0',
      color: 'text-blue-600'
    },
    {
      icon: Users,
      label: 'Registered Villagers',
      value: stats?.total_villagers.toLocaleString() || '0',
      color: 'text-purple-600'
    },
    {
      icon: FileText,
      label: 'Civic Petitions',
      value: stats?.total_petitions.toLocaleString() || '0',
      color: 'text-orange-600'
    },
    {
      icon: Crown,
      label: 'Chiefs/Dons Verified',
      value: stats?.verified_chiefs.toLocaleString() || '0',
      color: 'text-amber-600'
    }
  ];

  return (
    <Card className="p-6 bg-gradient-civic shadow-elegant">
      <h3 className="text-xl font-bold text-center mb-6 text-white">
        Live Civic Statistics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statItems.map((item, index) => (
          <div key={index} className="text-center">
            <div className="flex justify-center mb-2">
              <item.icon className={`w-6 h-6 ${item.color}`} />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {item.value}
            </div>
            <div className="text-sm text-white/80">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};