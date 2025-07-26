import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, Star, Users, Crown, Calendar, Phone, Globe, 
  Facebook, MessageCircle, Plus, ChevronRight, Heart,
  Award, DollarSign, Building, AlertTriangle, Vote,
  Camera, Edit, Share2, Eye, FileText, School, 
  Hospital, Droplet, Zap, Wifi, Home, ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { VillageReputationEngine } from '@/components/villages/VillageReputationEngine';
import { VillageReputationTimeline } from '@/components/villages/VillageReputationTimeline';


interface VillageData {
  id: string;
  village_name: string;
  region: string;
  division: string;
  subdivision: string;
  slug?: string;
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
  schools_count?: number;
  hospitals_count?: number;
  water_sources_count?: number;
  electricity_coverage_percentage?: number;
  road_network_km?: number;
  mtn_coverage?: boolean;
  orange_coverage?: boolean;
  nexttel_coverage?: boolean;
  main_economic_activity?: string;
  development_partners?: any;
  village_scorecard_rating?: number;
  flag_image_url?: string;
  logo_image_url?: string;
  village_anthem_url?: string;
}

const VillageProfile = () => {
  const { id, slug } = useParams<{ id: string; slug: string }>();
  const [village, setVillage] = useState<VillageData | null>(null);
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
    if (id || slug) {
      fetchVillageData();
      incrementViewCount();
    }
  }, [id, slug]);

  const fetchVillageData = async () => {
    try {
      // Fetch village basic info - support both ID and slug
      let query = supabase.from('villages').select('*');
      
      if (slug) {
        query = query.eq('slug', slug);
      } else if (id) {
        query = query.eq('id', id);
      } else {
        throw new Error('No village identifier provided');
      }

      const { data: villageData, error: villageError } = await query.single();

      if (villageError) throw villageError;
      setVillage(villageData);

      // Use the actual village ID for related data
      const villageId = villageData.id;

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
        supabase.from('village_leaders').select('*').eq('village_id', villageId),
        supabase.from('village_projects').select('*').eq('village_id', villageId),
        supabase.from('village_billionaires').select('*').eq('village_id', villageId),
        supabase.from('village_celebrities').select('*').eq('village_id', villageId),
        supabase.from('village_petitions').select('*').eq('village_id', villageId),
        supabase.from('village_conflicts').select('*').eq('village_id', villageId),
        supabase.from('village_photos').select('*').eq('village_id', villageId)
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
    try {
      const villageId = village?.id || (slug ? village?.id : id);
      if (villageId) {
        await supabase
          .from('villages')
          .update({ view_count: (village?.view_count || 0) + 1 })
          .eq('id', villageId);
      }
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

      const villageId = village?.id;
      if (!villageId) {
        toast.error('Village ID not found');
        return;
      }

      const { error } = await supabase
        .from('village_memberships')
        .insert({
          village_id: villageId,
          user_id: user.id,
          membership_type: 'son_daughter'
        });

      if (error) throw error;
      
      toast.success('Successfully claimed as son/daughter of this village!');
      fetchVillageData(); // Refresh data
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

  if (loading) {
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

  if (!village) {
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
      {/* Breadcrumb Navigation */}
      <div className="bg-muted/50 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link to="/villages" className="text-muted-foreground hover:text-foreground">
              Villages Directory
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{village.village_name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-civic text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{village.village_name}</h1>
                {village.is_verified && (
                  <Badge variant="secondary" className="text-white border-white">
                    <Crown className="h-4 w-4 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center text-lg opacity-90 mb-4">
                <MapPin className="h-5 w-5 mr-2" />
                {village.subdivision}, {village.division}, {village.region}
              </div>

              {village.village_motto && (
                <blockquote className="text-lg italic opacity-90 mb-4">
                  "{village.village_motto}"
                </blockquote>
              )}

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center">
                  {renderStars(village.overall_rating)}
                  <span className="ml-2 font-medium">
                    {village.overall_rating.toFixed(1)} ({village.total_ratings_count} reviews)
                  </span>
                </div>
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {village.view_count} views
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link to="/villages">
                <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-primary">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Directory
                </Button>
              </Link>
              
              <Button 
                onClick={handleClaimMembership}
                variant="secondary" 
                className="text-primary hover:text-primary-foreground"
              >
                <Heart className="h-4 w-4 mr-2" />
                I'm From Here
              </Button>
              
              <div className="flex gap-2">
                {village.whatsapp_link && (
                  <Button size="sm" variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                )}
                {village.facebook_link && (
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
              <div className="text-2xl font-bold text-primary">{village.sons_daughters_count}</div>
              <div className="text-sm text-muted-foreground">Sons & Daughters</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-secondary">{village.infrastructure_score}</div>
              <div className="text-sm text-muted-foreground">Infrastructure</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-accent">{village.education_score}</div>
              <div className="text-sm text-muted-foreground">Education</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-success">{village.health_score}</div>
              <div className="text-sm text-muted-foreground">Health</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-warning">{village.governance_score}</div>
              <div className="text-sm text-muted-foreground">Governance</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-info">{village.diaspora_engagement_score}</div>
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
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-14">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reputation">Reputation</TabsTrigger>
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
                  {village.year_founded && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Founded</label>
                      <div className="font-semibold">{village.year_founded}</div>
                    </div>
                  )}
                  {village.population_estimate && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Population</label>
                      <div className="font-semibold">{village.population_estimate.toLocaleString()}</div>
                    </div>
                  )}
                  {village.traditional_languages.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Languages</label>
                      <div className="font-semibold">{village.traditional_languages.join(', ')}</div>
                    </div>
                  )}
                  {village.ethnic_groups.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Ethnic Groups</label>
                      <div className="font-semibold">{village.ethnic_groups.join(', ')}</div>
                    </div>
                  )}
                  {village.totem_symbol && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Totem/Symbol</label>
                      <div className="font-semibold">{village.totem_symbol}</div>
                    </div>
                  )}
                </div>

                {village.founding_story && (
                  <div>
                    <h4 className="font-semibold mb-2">Founding Story</h4>
                    <p className="text-muted-foreground">{village.founding_story}</p>
                  </div>
                )}

                {village.migration_legend && (
                  <div>
                    <h4 className="font-semibold mb-2">Migration Legend</h4>
                    <p className="text-muted-foreground">{village.migration_legend}</p>
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
                    { label: 'Infrastructure', score: village.infrastructure_score, max: 20, color: 'primary' },
                    { label: 'Education', score: village.education_score, max: 10, color: 'secondary' },
                    { label: 'Health', score: village.health_score, max: 10, color: 'accent' },
                    { label: 'Peace & Security', score: village.peace_security_score, max: 10, color: 'success' },
                    { label: 'Economic Activity', score: village.economic_activity_score, max: 10, color: 'warning' },
                    { label: 'Governance', score: village.governance_score, max: 10, color: 'info' },
                    { label: 'Social Spirit', score: village.social_spirit_score, max: 10, color: 'primary' },
                    { label: 'Diaspora Engagement', score: village.diaspora_engagement_score, max: 10, color: 'secondary' }
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

            {/* Infrastructure & Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Infrastructure & Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <School className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-lg font-bold">{village.schools_count || 0}</div>
                    <div className="text-sm text-muted-foreground">Schools</div>
                  </div>
                  <div className="text-center">
                    <Hospital className="h-8 w-8 mx-auto mb-2 text-accent" />
                    <div className="text-lg font-bold">{village.hospitals_count || 0}</div>
                    <div className="text-sm text-muted-foreground">Health Centers</div>
                  </div>
                  <div className="text-center">
                    <Droplet className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-lg font-bold">{village.water_sources_count || 0}</div>
                    <div className="text-sm text-muted-foreground">Water Sources</div>
                  </div>
                  <div className="text-center">
                    <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                    <div className="text-lg font-bold">{village.electricity_coverage_percentage || 0}%</div>
                    <div className="text-sm text-muted-foreground">Electricity</div>
                  </div>
                </div>

                {/* Network Coverage */}
                <Separator className="my-6" />
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Wifi className="h-4 w-4 mr-2" />
                    Network Coverage
                  </h4>
                  <div className="flex gap-4">
                    <Badge variant={village.mtn_coverage ? "default" : "outline"}>
                      MTN {village.mtn_coverage ? "✓" : "✗"}
                    </Badge>
                    <Badge variant={village.orange_coverage ? "default" : "outline"}>
                      Orange {village.orange_coverage ? "✓" : "✗"}
                    </Badge>
                    <Badge variant={village.nexttel_coverage ? "default" : "outline"}>
                      Nexttel {village.nexttel_coverage ? "✓" : "✗"}
                    </Badge>
                  </div>
                </div>

                {/* Economic Activity */}
                {village.main_economic_activity && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Main Economic Activity
                      </h4>
                      <p className="text-muted-foreground">{village.main_economic_activity}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Civic Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Vote className="h-5 w-5 mr-2" />
                  Take Action
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Link to={`/petitions/new?village=${village.id}`}>
                    <Button variant="outline" className="w-full h-auto p-4 flex flex-col gap-2">
                      <FileText className="h-6 w-6" />
                      <span>Raise Petition</span>
                    </Button>
                  </Link>
                  <Link to={`/projects/new?village=${village.id}`}>
                    <Button variant="outline" className="w-full h-auto p-4 flex flex-col gap-2">
                      <Building className="h-6 w-6" />
                      <span>Propose Project</span>
                    </Button>
                  </Link>
                  <Link to={`/reports/new?village=${village.id}`}>
                    <Button variant="outline" className="w-full h-auto p-4 flex flex-col gap-2">
                      <AlertTriangle className="h-6 w-6" />
                      <span>Report Problem</span>
                    </Button>
                  </Link>
                  <Link to={`/villages/${village.id}/officials`}>
                    <Button variant="outline" className="w-full h-auto p-4 flex flex-col gap-2">
                      <Users className="h-6 w-6" />
                      <span>View Officials</span>
                    </Button>
                  </Link>
                  <Link to={`/villages/${village.id}/edit`}>
                    <Button variant="outline" className="w-full h-auto p-4 flex flex-col gap-2">
                      <Edit className="h-6 w-6" />
                      <span>Submit Update</span>
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full h-auto p-4 flex flex-col gap-2">
                    <FileText className="h-6 w-6" />
                    <span>Village Report PDF</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reputation">
            <VillageReputationEngine 
              villageId={village.id} 
              villageName={village.village_name} 
            />
          </TabsContent>

          <TabsContent value="membership">
            <VillageMembership villageId={village.id} villageName={village.village_name} />
          </TabsContent>

          <TabsContent value="leaders">
            <VillageLeadership villageId={village.id} villageName={village.village_name} />
          </TabsContent>

          <TabsContent value="projects">
            <VillageProjects villageId={village.id} villageName={village.village_name} />
          </TabsContent>

          <TabsContent value="people">
            <VillageNotablePeople villageId={village.id} villageName={village.village_name} />
          </TabsContent>

          <TabsContent value="civic">
            <VillageCivicActivity villageId={village.id} villageName={village.village_name} />
          </TabsContent>

          <TabsContent value="gallery">
            <VillagePhotoGallery villageId={village.id} />
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
            <VillageDiscussions villageId={village.id} />
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <VillageEvents villageId={village.id} />
          </TabsContent>

          <TabsContent value="comments" className="space-y-6">
            <VillageComments villageId={village.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VillageProfile;