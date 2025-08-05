import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Star,
  TrendingUp,
  Users,
  Shield,
  AlertTriangle,
  BarChart3,
  Heart,
  MessageSquare,
  Check,
  X
} from 'lucide-react';

interface RatingStats {
  totalRatings: number;
  averageRating: number;
  ratingBreakdown: { [key: number]: number };
  recentTrend: 'up' | 'down' | 'stable';
}

interface EntityRating {
  id: string;
  name: string;
  type: 'politician' | 'party';
  averageRating: number;
  totalRatings: number;
  userRating?: number;
  detailedRatings?: {
    integrity?: number;
    transparency?: number;
    development?: number;
    leadership?: number;
    responsiveness?: number;
  };
}

export const CivicTrustRatingEngine: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [politicians, setPoliticians] = useState<EntityRating[]>([]);
  const [parties, setParties] = useState<EntityRating[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<EntityRating | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [detailedRatings, setDetailedRatings] = useState({
    integrity: 0,
    transparency: 0,
    development: 0,
    leadership: 0,
    responsiveness: 0
  });
  const [abuseAlerts, setAbuseAlerts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('politicians');

  useEffect(() => {
    loadEntities();
    if (user) {
      loadAbuseAlerts();
    }
  }, [user]);

  const loadEntities = async () => {
    setLoading(true);
    try {
      // Load politicians with ratings
      const { data: politicianData, error: politicianError } = await supabase
        .from('politicians')
        .select(`
          id,
          name,
          approval_ratings(rating, user_id)
        `)
        .order('name');

      if (politicianError) throw politicianError;

      // Load parties with ratings  
      const { data: partyData, error: partyError } = await supabase
        .from('political_parties')
        .select(`
          id,
          name
        `)
        .order('name');

      if (partyError) throw partyError;

      // Process politicians
      const processedPoliticians = politicianData?.map(p => {
        const ratings = p.approval_ratings || [];
        const userRating = user ? ratings.find(r => r.user_id === user.id)?.rating : undefined;
        const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length : 0;

        return {
          id: p.id,
          name: p.name,
          type: 'politician' as const,
          averageRating,
          totalRatings: ratings.length,
          userRating
        };
      }) || [];

      // Process parties
      const processedParties = partyData?.map(p => {
        return {
          id: p.id,
          name: p.name,
          type: 'party' as const,
          averageRating: 0,
          totalRatings: 0,
          userRating: undefined
        };
      }) || [];

      setPoliticians(processedPoliticians);
      setParties(processedParties);
    } catch (error) {
      console.error('Error loading entities:', error);
      toast({
        title: "Error",
        description: "Failed to load rating data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAbuseAlerts = async () => {
    // Skip loading abuse alerts for now since table might not exist
    setAbuseAlerts([]);
  };

  const submitRating = async () => {
    if (!user || !selectedEntity) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit ratings",
        variant: "destructive"
      });
      return;
    }

    if (userRating === 0 && Object.values(detailedRatings).every(r => r === 0)) {
      toast({
        title: "Rating Required",
        description: "Please provide at least one rating",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (selectedEntity.type === 'politician') {
        // Submit politician rating using existing approval_ratings table
        const { error } = await supabase
          .from('approval_ratings')
          .upsert({
            politician_id: selectedEntity.id,
            user_id: user.id,
            rating: userRating || Math.round((Object.values(detailedRatings).reduce((a, b) => a + b, 0) / 5)),
            comment: userComment || null
          });

        if (error) throw error;
      } else {
        // For parties, we'll just show a message for now
        toast({
          title: "Coming Soon",
          description: "Party ratings will be available once the database is fully set up",
          variant: "default"
        });
        return;
      }

      toast({
        title: "Rating Submitted",
        description: "Your rating has been saved successfully"
      });

      // Reset form
      setSelectedEntity(null);
      setUserRating(0);
      setUserComment('');
      setDetailedRatings({
        integrity: 0,
        transparency: 0,
        development: 0,
        leadership: 0,
        responsiveness: 0
      });

      // Reload data
      loadEntities();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange?.(star)}
            className={`p-1 ${onRatingChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!onRatingChange}
          >
            <Star 
              className={`w-5 h-5 ${
                star <= rating 
                  ? 'text-cm-yellow fill-current' 
                  : 'text-muted-foreground'
              }`} 
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {rating.toFixed(1)}/5
        </span>
      </div>
    );
  };

  const EntityCard = ({ entity }: { entity: EntityRating }) => (
    <Card className="hover:shadow-elegant transition-all cursor-pointer" 
          onClick={() => setSelectedEntity(entity)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-foreground">{entity.name}</h3>
            <Badge variant="outline" className="mt-1">
              {entity.type === 'politician' ? 'Politician' : 'Party'}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {entity.averageRating.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">
              {entity.totalRatings} ratings
            </div>
          </div>
        </div>
        
        {renderStars(entity.averageRating)}
        
        {entity.userRating && (
          <div className="mt-2 text-sm text-primary">
            <Check className="w-4 h-4 inline mr-1" />
            You rated: {entity.userRating.toFixed(1)}/5
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-6 h-6 text-cm-yellow" />
            Civic Trust Rating Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Rate politicians and political parties to help build civic trust and accountability.
            Your ratings contribute to the national civic trust index.
          </p>

          {abuseAlerts.length > 0 && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">
                  {abuseAlerts.length} potential abuse alerts detected
                </span>
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="politicians">Politicians</TabsTrigger>
              <TabsTrigger value="parties">Parties</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="politicians" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {politicians.map(politician => (
                  <EntityCard key={politician.id} entity={politician} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="parties" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {parties.map(party => (
                  <EntityCard key={party.id} entity={party} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">
                      {politicians.reduce((sum, p) => sum + p.totalRatings, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Politician Ratings
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">
                      {parties.reduce((sum, p) => sum + p.totalRatings, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Party Ratings
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <BarChart3 className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">
                      {(
                        [...politicians, ...parties]
                          .reduce((sum, e) => sum + e.averageRating, 0) / 
                        [...politicians, ...parties].length
                      ).toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Overall Trust Index
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Rating Modal */}
      {selectedEntity && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Rate: {selectedEntity.name}</span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedEntity(null)}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedEntity.type === 'politician' ? (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Integrity</label>
                    {renderStars(detailedRatings.integrity, (rating) => 
                      setDetailedRatings(prev => ({ ...prev, integrity: rating }))
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Transparency</label>
                    {renderStars(detailedRatings.transparency, (rating) => 
                      setDetailedRatings(prev => ({ ...prev, transparency: rating }))
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Development Impact</label>
                    {renderStars(detailedRatings.development, (rating) => 
                      setDetailedRatings(prev => ({ ...prev, development: rating }))
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Leadership</label>
                    {renderStars(detailedRatings.leadership, (rating) => 
                      setDetailedRatings(prev => ({ ...prev, leadership: rating }))
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Responsiveness</label>
                    {renderStars(detailedRatings.responsiveness, (rating) => 
                      setDetailedRatings(prev => ({ ...prev, responsiveness: rating }))
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Overall Trust</label>
                    {renderStars(userRating, setUserRating)}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Transparency</label>
                    {renderStars(detailedRatings.transparency, (rating) => 
                      setDetailedRatings(prev => ({ ...prev, transparency: rating }))
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Development Focus</label>
                    {renderStars(detailedRatings.development, (rating) => 
                      setDetailedRatings(prev => ({ ...prev, development: rating }))
                    )}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Comment (Optional)</label>
              <Textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Share your thoughts about this entity..."
                className="resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={submitRating} disabled={loading} className="flex-1">
                {loading ? 'Submitting...' : 'Submit Rating'}
              </Button>
              <Button variant="outline" onClick={() => setSelectedEntity(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};