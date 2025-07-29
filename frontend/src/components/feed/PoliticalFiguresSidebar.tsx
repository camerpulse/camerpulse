import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Crown, 
  Shield, 
  Building2, 
  Star, 
  MessageCircle, 
  MapPin,
  TrendingUp,
  Vote
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { FollowButton } from '@/components/Social/FollowButton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PoliticalFigure {
  id: string;
  user_id: string;
  name: string;
  username: string;
  avatar_url: string;
  position: string;
  party_affiliation: string;
  region: string;
  figure_type: 'politician' | 'mp' | 'senator' | 'chief' | 'king' | 'party_official';
  average_rating: number;
  total_ratings: number;
  influence_score: number;
  verification_status: string;
  bio: string;
}

export const PoliticalFiguresSidebar = () => {
  const { user } = useAuth();
  const [figures, setFigures] = useState<PoliticalFigure[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trending');

  useEffect(() => {
    const fetchPoliticalFigures = async () => {
      if (!user) return;
      
      try {
        // Mock data for now - in production this would come from profiles table
        const mockFigures: PoliticalFigure[] = [
          {
            id: '1',
            user_id: 'pol-1',
            name: 'Hon. Paul Atanga Nji',
            username: 'paulatanganji',
            avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
            position: 'Minister of Territorial Administration',
            party_affiliation: 'CPDM',
            region: 'Northwest',
            figure_type: 'politician',
            average_rating: 4.2,
            total_ratings: 1247,
            influence_score: 95,
            verification_status: 'verified',
            bio: 'Serving the people of Cameroon with dedication and transparency.'
          },
          {
            id: '2',
            user_id: 'mp-1',
            name: 'Hon. Cavaye Yeguie Djibril',
            username: 'cavayeyeguie',
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
            position: 'Speaker of National Assembly',
            party_affiliation: 'CPDM',
            region: 'Far North',
            figure_type: 'mp',
            average_rating: 4.0,
            total_ratings: 892,
            influence_score: 88,
            verification_status: 'verified',
            bio: 'Leading parliamentary proceedings with wisdom and fairness.'
          },
          {
            id: '3',
            user_id: 'senator-1',
            name: 'Sen. Marcel Niat Njifenji',
            username: 'marcelniat',
            avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7',
            position: 'Senate President',
            party_affiliation: 'CPDM',
            region: 'Centre',
            figure_type: 'senator',
            average_rating: 4.1,
            total_ratings: 634,
            influence_score: 85,
            verification_status: 'verified',
            bio: 'Championing legislative excellence in the upper chamber.'
          },
          {
            id: '4',
            user_id: 'chief-1',
            name: 'HRH Fon Angwafor III',
            username: 'fonangwafor',
            avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
            position: 'Fon of Mankon',
            party_affiliation: 'Traditional Authority',
            region: 'Northwest',
            figure_type: 'chief',
            average_rating: 4.5,
            total_ratings: 456,
            influence_score: 72,
            verification_status: 'verified',
            bio: 'Preserving culture and promoting peace in our community.'
          }
        ];
        
        setFigures(mockFigures);
      } catch (error) {
        console.error('Error fetching political figures:', error);
        toast.error('Failed to load political figures');
      } finally {
        setLoading(false);
      }
    };

    fetchPoliticalFigures();
  }, [user]);

  const getFigureIcon = (type: string) => {
    const iconMap = {
      'politician': Users,
      'mp': Shield,
      'senator': Crown,
      'chief': Crown,
      'king': Crown,
      'party_official': Building2,
    };
    return iconMap[type as keyof typeof iconMap] || Users;
  };

  const handleMessage = (figure: PoliticalFigure) => {
    toast.success(`Opening conversation with ${figure.name}`);
    // TODO: Implement messaging system
  };

  const handleRate = (figure: PoliticalFigure) => {
    toast.success(`Rate ${figure.name}`);
    // TODO: Implement rating system
  };

  const filteredFigures = figures.filter(figure => {
    if (activeTab === 'trending') return figure.influence_score > 80;
    if (activeTab === 'local') return figure.region === 'Centre'; // User's region
    if (activeTab === 'rated') return figure.average_rating >= 4.0;
    return true;
  });

  if (loading) {
    return (
      <Card className="w-80">
        <CardHeader>
          <div className="h-6 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-muted animate-pulse rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-80 space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Vote className="h-5 w-5 text-blue-600" />
            Political Leaders
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-transparent">
              <TabsTrigger value="trending" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="local" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                Local
              </TabsTrigger>
              <TabsTrigger value="rated" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Top Rated
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0 p-4 space-y-4">
              {filteredFigures.slice(0, 4).map((figure) => {
                const IconComponent = getFigureIcon(figure.figure_type);
                
                return (
                  <div key={figure.id} className="group">
                    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/70 transition-all duration-200">
                      <div className="relative">
                        <Avatar className="h-12 w-12 ring-2 ring-blue-200 group-hover:ring-blue-300 transition-all">
                          <AvatarImage src={figure.avatar_url} alt={figure.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-800">
                            {figure.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center border border-blue-200">
                          <IconComponent className="h-2.5 w-2.5 text-blue-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                          <h4 className="font-semibold text-sm text-gray-900 truncate">
                            {figure.name}
                          </h4>
                          {figure.verification_status === 'verified' && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 px-1 py-0">
                              ✓
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-600 truncate mb-1">
                          {figure.position}
                        </p>
                        
                        <p className="text-xs text-blue-600 font-medium truncate mb-2">
                          {figure.party_affiliation}
                        </p>
                        
                        {figure.average_rating > 0 && (
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium">{figure.average_rating.toFixed(1)}</span>
                            <span className="text-xs text-gray-500">({figure.total_ratings})</span>
                          </div>
                        )}
                        
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-6 px-2 flex-1"
                            onClick={() => handleMessage(figure)}
                          >
                            <MessageCircle className="h-2.5 w-2.5 mr-1" />
                            Message
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-6 px-2"
                            onClick={() => handleRate(figure)}
                          >
                            <Star className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                        
                        <div className="mt-2">
                          <FollowButton
                            targetUserId={figure.user_id}
                            targetUsername={figure.username}
                            variant="default"
                            size="sm"
                            className="w-full text-xs h-6"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};