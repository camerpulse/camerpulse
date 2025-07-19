import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Music, Users, BookOpen, ExternalLink, MapPin } from 'lucide-react';

interface FeaturedPerson {
  id: string;
  name: string;
  title: string;
  village: string;
  region: string;
  category: 'billionaire' | 'artist' | 'youth_leader' | 'elder';
  achievement: string;
  imageUrl?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
}

// Mock data - in real app this would come from database
const featuredPeople: FeaturedPerson[] = [
  {
    id: '1',
    name: 'Dr. Fotso Victor',
    title: 'Business Magnate',
    village: 'Bandjoun',
    region: 'West',
    category: 'billionaire',
    achievement: 'FMCG Empire across Central Africa',
    imageUrl: '/placeholder-avatar.jpg'
  },
  {
    id: '2',
    name: 'Charlotte Dipanda',
    title: 'International Artist',
    village: 'Douala',
    region: 'Littoral',
    category: 'artist',
    achievement: 'Grammy-nominated Afro-Jazz musician',
    socialLinks: {
      instagram: '@charlottedipanda',
      twitter: '@charlottedipanda'
    }
  },
  {
    id: '3',
    name: 'Anicet Lafortune',
    title: 'Youth Activist',
    village: 'Kumbo',
    region: 'Northwest',
    category: 'youth_leader',
    achievement: 'Founded 50+ youth cooperatives',
    imageUrl: '/placeholder-avatar.jpg'
  },
  {
    id: '4',
    name: 'Mama Ngozi',
    title: 'Cultural Historian',
    village: 'Bafut',
    region: 'Northwest',
    category: 'elder',
    achievement: 'Preserved 200+ oral traditions',
    imageUrl: '/placeholder-avatar.jpg'
  }
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'billionaire': return Crown;
    case 'artist': return Music;
    case 'youth_leader': return Users;
    case 'elder': return BookOpen;
    default: return Users;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'billionaire': return 'bg-yellow-100 text-yellow-800';
    case 'artist': return 'bg-purple-100 text-purple-800';
    case 'youth_leader': return 'bg-green-100 text-green-800';
    case 'elder': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'billionaire': return 'Billionaire of the Week';
    case 'artist': return 'Featured Artist';
    case 'youth_leader': return 'Youth Leader';
    case 'elder': return 'Cultural Elder';
    default: return 'Featured Person';
  }
};

export const FeaturedVillagers: React.FC = () => {
  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">⭐ Featured Villagers</h2>
        <p className="text-muted-foreground">
          Celebrating the sons and daughters who make our villages proud
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {featuredPeople.map((person) => {
          const CategoryIcon = getCategoryIcon(person.category);
          
          return (
            <div
              key={person.id}
              className="bg-gradient-to-br from-white to-gray-50 border rounded-lg p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Category Badge */}
              <div className="flex justify-between items-start mb-3">
                <Badge className={`text-xs ${getCategoryColor(person.category)}`}>
                  {getCategoryLabel(person.category)}
                </Badge>
                <CategoryIcon className="w-4 h-4 text-gray-400" />
              </div>

              {/* Profile Image Placeholder */}
              <div className="w-16 h-16 bg-gradient-civic rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {person.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>

              {/* Person Info */}
              <div className="text-center mb-3">
                <h3 className="font-semibold text-sm mb-1">{person.name}</h3>
                <p className="text-xs text-gray-600 mb-1">{person.title}</p>
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span>{person.village}, {person.region}</span>
                </div>
              </div>

              {/* Achievement */}
              <div className="mb-3">
                <p className="text-xs text-gray-600 text-center line-clamp-2">
                  {person.achievement}
                </p>
              </div>

              {/* Social Links */}
              {person.socialLinks && (
                <div className="flex justify-center gap-2 mb-3">
                  {person.socialLinks.instagram && (
                    <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">
                      IG
                    </span>
                  )}
                  {person.socialLinks.twitter && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      X
                    </span>
                  )}
                  {person.socialLinks.tiktok && (
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      TT
                    </span>
                  )}
                </div>
              )}

              {/* Action Button */}
              <Button size="sm" variant="outline" className="w-full text-xs">
                <ExternalLink className="w-3 h-3 mr-1" />
                Visit {person.village}
              </Button>
            </div>
          );
        })}
      </div>

      {/* View More Button */}
      <div className="text-center mt-6">
        <Button variant="outline">
          View All Featured Villagers
        </Button>
      </div>
    </Card>
  );
};