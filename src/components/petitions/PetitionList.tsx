import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { URLBuilder } from '@/utils/slug';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, Clock, MapPin, Target, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Petition {
  id: string;
  title: string;
  description: string;
  target_institution: string;
  goal_signatures: number;
  current_signatures: number;
  status: string;
  category: string;
  location: string;
  created_at: string;
  deadline?: string;
  creator_id: string;
}

interface PetitionListProps {
  category?: string;
  searchQuery?: string;
  limit?: number;
}

export const PetitionList: React.FC<PetitionListProps> = ({
  category,
  searchQuery,
  limit = 20
}) => {
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPetitions();
  }, [category, searchQuery]);

  const fetchPetitions = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('petitions')
        .select('*')
        .eq('status', 'active')
        .order('current_signatures', { ascending: false })
        .limit(limit);

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPetitions(data || []);
    } catch (error) {
      console.error('Error fetching petitions:', error);
      toast.error('Failed to load petitions');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      governance: '🏛️',
      justice: '⚖️',
      education: '📚',
      health: '🏥',
      agriculture: '🌾',
      digital_rights: '💻',
      local_issues: '🏘️',
      corruption: '🛡️',
      security: '🔒',
      environment: '🌍',
      traditional_authority: '👑',
      others: '📝'
    };
    return icons[category as keyof typeof icons] || '📝';
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (petitions.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="text-muted-foreground mb-4">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No petitions found</h3>
            <p>
              {searchQuery 
                ? `No petitions match "${searchQuery}"`
                : category 
                ? `No petitions in the ${category} category`
                : 'No active petitions at the moment'
              }
            </p>
          </div>
          <Link to={URLBuilder.petitions.create()}>
            <Button>Create the First Petition</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {petitions.map((petition) => (
        <Card key={petition.id} className="petition-card hover-scale transition-all duration-200">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="petition-category-badge">
                      {getCategoryIcon(petition.category)} {petition.category.replace('_', ' ')}
                    </Badge>
                    {petition.location && (
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="h-3 w-3 mr-1" />
                        {petition.location}
                      </Badge>
                    )}
                  </div>
                  
                  <Link to={URLBuilder.petitions.detail({ id: petition.id, title: petition.title })}>
                    <h3 className="text-xl font-semibold hover:text-primary transition-colors line-clamp-2">
                      {petition.title}
                    </h3>
                  </Link>
                  
                  <p className="text-muted-foreground line-clamp-2">
                    {petition.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      {petition.target_institution}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatTimeAgo(petition.created_at)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1 font-medium">
                    <Users className="h-4 w-4" />
                    {petition.current_signatures.toLocaleString()} signatures
                  </div>
                  <div className="text-muted-foreground">
                    Goal: {petition.goal_signatures.toLocaleString()}
                  </div>
                </div>
                
                <Progress 
                  value={getProgressPercentage(petition.current_signatures, petition.goal_signatures)}
                  className="h-2 petition-progress"
                />
                
                <div className="text-xs text-muted-foreground">
                  {getProgressPercentage(petition.current_signatures, petition.goal_signatures).toFixed(1)}% complete
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Link to={URLBuilder.petitions.detail({ id: petition.id, title: petition.title })} className="flex-1">
                  <Button variant="default" className="w-full petition-btn-sign">
                    Sign Petition
                  </Button>
                </Link>
                <Button variant="outline" size="sm" className="petition-btn-share">
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};