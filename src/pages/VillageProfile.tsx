import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useVillageSlug } from '@/hooks/useSlugResolver';
import { 
  MapPin, Star, Users, Crown, Calendar, Phone, Globe, 
  Facebook, MessageCircle, Plus, ChevronRight, Heart,
  Award, DollarSign, Building, AlertTriangle, Vote,
  Camera, Edit, Share2, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SuggestionButton } from '@/components/CivicSuggestions/SuggestionButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { VillageComments } from '@/components/villages/VillageComments';
import { VillageDiscussions } from '@/components/villages/VillageDiscussions';
import { VillageEvents } from '@/components/villages/VillageEvents';
import { VillagePhotoGallery } from '@/components/villages/VillagePhotoGallery';
import { VillageMembership } from '@/components/villages/VillageMembership';
import { VillageLeadership } from '@/components/villages/VillageLeadership';
import { VillageProjects } from '@/components/villages/VillageProjects';
import { VillageNotablePeople } from '@/components/villages/VillageNotablePeople';
import { VillageCivicActivity } from '@/components/villages/VillageCivicActivity';
import { VillageChat } from '@/components/villages/VillageChat';
import { VillageAnalytics } from '@/components/villages/VillageAnalytics';
import { VillageLeaderboards } from '@/components/villages/VillageLeaderboards';


interface VillageData {
  id: string;
  village_name: string;
  region: string;
  division: string;
  subdivision: string;
  year_founded?: number;
  gps_latitude?: number;
  gps_longitude?: number;
  traditional_languages: string[];
  ethnic_groups: string[];
  totem_symbol?: string;
  population_estimate?: number;
  village_motto?: string;
  founding_story?: string;
  migration_legend?: string;
  notable_events?: string;
  oral_traditions?: string;
  overall_rating: number;
  infrastructure_score: number;
  education_score: number;
  health_score: number;
  peace_security_score: number;
  economic_activity_score: number;
  governance_score: number;
  social_spirit_score: number;
  diaspora_engagement_score: number;
  civic_participation_score: number;
  achievements_score: number;
  total_ratings_count: number;
  sons_daughters_count: number;
  view_count: number;
  is_verified: boolean;
  whatsapp_link?: string;
  facebook_link?: string;
  community_chat_link?: string;
}

const VillageProfile = () => {
  const { entity: village, loading: villageLoading, error, entityId } = useVillageSlug();
  const [villageData, setVillageData] = useState<VillageData | null>(null);
  const [leaders, setLeaders] = useState([]);
  const [projects, setProjects] = useState([]);
  const [billionaires, setBillionaires] = useState([]);
  const [celebrities, setCelebrities] = useState([]);
  const [petitions, setPetitions] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userMembership, setUserMembership] = useState(null);

  useEffect(() => {
    if (village) {
      setVillageData(village);
      fetchRelatedData();
      incrementViewCount();
    }
  }, [village, entityId]);

  const fetchRelatedData = async () => {
    if (!entityId) return;
    
    try {
      // Fetch related data
      const [
        leadersResponse,
        projectsResponse,
        billionairesResponse,
        celebritiesResponse,
        petitionsResponse,
        conflictsResponse,
        photosResponse
      ] = await Promise.all([
        supabase.from('village_leaders').select('*').eq('village_id', entityId),
        supabase.from('village_projects').select('*').eq('village_id', entityId),
        supabase.from('village_billionaires').select('*').eq('village_id', entityId),
        supabase.from('village_celebrities').select('*').eq('village_id', entityId),
        supabase.from('village_petitions').select('*').eq('village_id', entityId),
        supabase.from('village_conflicts').select('*').eq('village_id', entityId),
        supabase.from('village_photos').select('*').eq('village_id', entityId)
      ]);

      setLeaders(leadersResponse.data || []);
      setProjects(projectsResponse.data || []);
      setBillionaires(billionairesResponse.data || []);
      setCelebrities(celebritiesResponse.data || []);
      setPetitions(petitionsResponse.data || []);
      setConflicts(conflictsResponse.data || []);
      setPhotos(photosResponse.data || []);

    } catch (error) {
      console.error('Error fetching village data:', error);
      toast.error('Failed to load village information');
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    if (!entityId || !villageData) return;
    
    try {
      await supabase
        .from('villages')
        .update({ view_count: (villageData?.view_count || 0) + 1 })
        .eq('id', entityId);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleClaimMembership = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please log in to claim membership');
        return;
      }

      const { error } = await supabase
        .from('village_memberships')
        .insert({
          village_id: entityId,
          user_id: user.id,
          membership_type: 'son_daughter'
        });

      if (error) throw error;
      
      toast.success('Successfully claimed as son/daughter of this village!');
      fetchRelatedData(); // Refresh data
    } catch (error) {
      console.error('Error claiming membership:', error);
      toast.error('Failed to claim membership');
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-primary text-primary" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-primary/50 text-primary" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground" />);
    }

    return stars;
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'ongoing': return 'secondary';
      case 'abandoned': return 'destructive';
      case 'planned': return 'outline';
      default: return 'outline';
    }
  };

  if (villageLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!villageData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="text-center p-8">
          <CardContent>
            <h2 className="text-2xl font-bold mb-4">Village Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The village you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/villages">
              <Button>Back to Villages Directory</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-civic text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{villageData.village_name}</h1>
                {villageData.is_verified && (
                  <Badge variant="secondary" className="text-white border-white">
                    <Crown className="h-4 w-4 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center text-lg opacity-90 mb-4">
                <MapPin className="h-5 w-5 mr-2" />
                {villageData.subdivision}, {villageData.division}, {villageData.region}
              </div>

              {villageData.village_motto && (
                <blockquote className="text-lg italic opacity-90 mb-4">
                  "{villageData.village_motto}"
                </blockquote>
              )}

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center">
                  {renderStars(villageData.overall_rating)}
                  <span className="ml-2 font-medium">
                    {villageData.overall_rating.toFixed(1)} ({villageData.total_ratings_count} reviews)
                  </span>
                </div>
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {villageData.view_count} views
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleClaimMembership}
                variant="secondary" 
                className="text-primary hover:text-primary-foreground"
              >
                <Heart className="h-4 w-4 mr-2" />
                I'm From Here
              </Button>
              
              <div className="flex gap-2">
                {villageData.whatsapp_link && (
                  <Button size="sm" variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                )}
                {villageData.facebook_link && (
                  <Button size="sm" variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
                    <Facebook className="h-4 w-4" />
                  </Button>
                )}
                <Button size="sm" variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-primary">{villageData.sons_daughters_count}</div>
              <div className="text-sm text-muted-foreground">Sons & Daughters</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-secondary">{villageData.infrastructure_score}</div>
              <div className="text-sm text-muted-foreground">Infrastructure</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-accent">{villageData.education_score}</div>
              <div className="text-sm text-muted-foreground">Education</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-success">{villageData.health_score}</div>
              <div className="text-sm text-muted-foreground">Health</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-warning">{villageData.governance_score}</div>
              <div className="text-sm text-muted-foreground">Governance</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-info">{villageData.diaspora_engagement_score}</div>
              <div className="text-sm text-muted-foreground">Diaspora</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-primary">{projects.length}</div>
              <div className="text-sm text-muted-foreground">Projects</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-secondary">{billionaires.length}</div>
              <div className="text-sm text-muted-foreground">Billionaires</div>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-13">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="membership">Members</TabsTrigger>
            <TabsTrigger value="leaders">Leadership</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="people">Notable People</TabsTrigger>
            <TabsTrigger value="civic">Civic Activity</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="leaderboards">Rankings</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Village Identity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Village Identity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {villageData.year_founded && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Founded</label>
                      <div className="font-semibold">{villageData.year_founded}</div>
                    </div>
                  )}
                  {villageData.population_estimate && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Population</label>
                      <div className="font-semibold">{villageData.population_estimate.toLocaleString()}</div>
                    </div>
                  )}
                  {villageData.traditional_languages.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Languages</label>
                      <div className="font-semibold">{villageData.traditional_languages.join(', ')}</div>
                    </div>
                  )}
                  {villageData.ethnic_groups.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Ethnic Groups</label>
                      <div className="font-semibold">{villageData.ethnic_groups.join(', ')}</div>
                    </div>
                  )}
                  {villageData.totem_symbol && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Totem/Symbol</label>
                      <div className="font-semibold">{villageData.totem_symbol}</div>
                    </div>
                  )}
                </div>

                {villageData.founding_story && (
                  <div>
                    <h4 className="font-semibold mb-2">Founding Story</h4>
                    <p className="text-muted-foreground">{villageData.founding_story}</p>
                  </div>
                )}

                {villageData.migration_legend && (
                  <div>
                    <h4 className="font-semibold mb-2">Migration Legend</h4>
                    <p className="text-muted-foreground">{villageData.migration_legend}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ratings Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Community Ratings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Infrastructure', score: villageData.infrastructure_score, max: 20, color: 'primary' },
                    { label: 'Education', score: villageData.education_score, max: 10, color: 'secondary' },
                    { label: 'Health', score: villageData.health_score, max: 10, color: 'accent' },
                    { label: 'Peace & Security', score: villageData.peace_security_score, max: 10, color: 'success' },
                    { label: 'Economic Activity', score: villageData.economic_activity_score, max: 10, color: 'warning' },
                    { label: 'Governance', score: villageData.governance_score, max: 10, color: 'info' },
                    { label: 'Social Spirit', score: villageData.social_spirit_score, max: 10, color: 'primary' },
                    { label: 'Diaspora Engagement', score: villageData.diaspora_engagement_score, max: 10, color: 'secondary' }
                  ].map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.score}/{item.max}
                        </span>
                      </div>
                      <Progress value={(item.score / item.max) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="membership">
            <VillageMembership villageId={entityId!} villageName={villageData.village_name} />
          </TabsContent>

          <TabsContent value="leaders">
            <VillageLeadership villageId={entityId!} villageName={villageData.village_name} />
          </TabsContent>

          <TabsContent value="projects">
            <VillageProjects villageId={entityId!} villageName={villageData.village_name} />
          </TabsContent>

          <TabsContent value="people">
            <VillageNotablePeople villageId={entityId!} villageName={villageData.village_name} />
          </TabsContent>

          <TabsContent value="civic">
            <VillageCivicActivity villageId={entityId!} villageName={villageData.village_name} />
          </TabsContent>

          <TabsContent value="gallery">
            <VillagePhotoGallery villageId={entityId!} />
          </TabsContent>

          <TabsContent value="chat">
            <VillageChat />
          </TabsContent>

          <TabsContent value="analytics">
            <VillageAnalytics />
          </TabsContent>

          <TabsContent value="leaderboards">
            <VillageLeaderboards />
          </TabsContent>

          <TabsContent value="discussions" className="space-y-6">
            <VillageDiscussions villageId={entityId!} />
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <VillageEvents villageId={entityId!} />
          </TabsContent>

          <TabsContent value="comments" className="space-y-6">
            <VillageComments villageId={entityId!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VillageProfile;