import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Scroll, 
  Camera, 
  Crown, 
  AlertTriangle, 
  Droplets, 
  Stethoscope, 
  FileText, 
  GraduationCap,
  ChevronRight 
} from 'lucide-react';

interface CategoryButton {
  icon: React.ElementType;
  label: string;
  count: number;
  color: string;
  description: string;
}

const categories: CategoryButton[] = [
  {
    icon: Scroll,
    label: 'Historical Archives',
    count: 45,
    color: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
    description: 'Villages with documented history'
  },
  {
    icon: Camera,
    label: 'Photo Galleries',
    count: 67,
    color: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    description: 'Villages with image collections'
  },
  {
    icon: Crown,
    label: 'Kingdom Status',
    count: 23,
    color: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    description: 'Fons, Sultans, Lamidos'
  },
  {
    icon: AlertTriangle,
    label: 'Conflict Zones',
    count: 12,
    color: 'bg-red-100 text-red-800 hover:bg-red-200',
    description: 'Areas needing peace support'
  },
  {
    icon: Droplets,
    label: 'Water Projects',
    count: 89,
    color: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200',
    description: 'Water, education, health initiatives'
  },
  {
    icon: Stethoscope,
    label: 'Health Facilities',
    count: 34,
    color: 'bg-green-100 text-green-800 hover:bg-green-200',
    description: 'Clinics and pharmacies'
  },
  {
    icon: FileText,
    label: 'Active Petitions',
    count: 156,
    color: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    description: 'Ongoing civic campaigns'
  },
  {
    icon: GraduationCap,
    label: 'Education Leaders',
    count: 78,
    color: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
    description: 'Highest youth literacy rates'
  }
];

export const CivicCategories: React.FC = () => {
  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">🎯 Quick Access Civic Categories</h2>
        <p className="text-muted-foreground">
          Explore villages by their unique civic characteristics and achievements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category, index) => (
          <Button
            key={index}
            variant="outline"
            className={`h-auto p-4 flex flex-col items-start gap-3 hover:shadow-md transition-all ${category.color} border-2`}
          >
            <div className="flex items-center justify-between w-full">
              <category.icon className="w-5 h-5" />
              <ChevronRight className="w-4 h-4 opacity-50" />
            </div>
            
            <div className="text-left w-full">
              <h3 className="font-semibold text-sm mb-1">{category.label}</h3>
              <p className="text-xs opacity-75 mb-2">{category.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">{category.count}</span>
                <span className="text-xs opacity-60">villages</span>
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* Additional Quick Actions */}
      <div className="mt-6 pt-4 border-t">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" size="sm" className="justify-start">
            🗺️ Map View
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            📊 Analytics
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            🔍 Advanced Search
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            📱 Mobile App
          </Button>
        </div>
      </div>
    </Card>
  );
};