import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, Star, Users, Crown, Calendar, Phone, Globe, 
  Facebook, MessageCircle, Plus, ChevronRight, Heart,
  Award, DollarSign, Building, AlertTriangle, Vote,
  Camera, Edit, Share2, Eye
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
  const { id } = useParams<{ id: string }>();
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
    if (id) {
      fetchVillageData();
      incrementViewCount();
    }
  }, [id]);

  const fetchVillageData = async () => {
    try {
      // Fetch village basic info
      const { data: villageData, error: villageError } = await supabase
        .from('villages')
        .select('*')
        .eq('id', id)
        .single();

      if (villageError) throw villageError;
      setVillage(villageData);

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
        supabase.from('village_leaders').select('*').eq('village_id', id),
        supabase.from('village_projects').select('*').eq('village_id', id),
        supabase.from('village_billionaires').select('*').eq('village_id', id),
        supabase.from('village_celebrities').select('*').eq('village_id', id),
        supabase.from('village_petitions').select('*').eq('village_id', id),
        supabase.from('village_conflicts').select('*').eq('village_id', id),
        supabase.from('village_photos').select('*').eq('village_id', id)
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
      await supabase
        .from('villages')
        .update({ view_count: (village?.view_count || 0) + 1 })
        .eq('id', id);
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
          village_id: id,
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
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="leaders">Leadership</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="people">Notable People</TabsTrigger>
            <TabsTrigger value="civic">Civic Activity</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
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
          </TabsContent>

          <TabsContent value="leaders">
            <div className="space-y-6">
              {leaders.map((leader: any) => (
                <Card key={leader.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={leader.photo_url} alt={leader.leader_name} />
                        <AvatarFallback>
                          {leader.leader_name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{leader.leader_name}</h3>
                          <Badge variant="outline" className="capitalize">
                            {leader.leader_type}
                          </Badge>
                          {leader.is_current && (
                            <Badge variant="success">Current</Badge>
                          )}
                        </div>
                        
                        {leader.years_in_power && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {leader.years_in_power} years in office
                          </p>
                        )}

                        {leader.bio && (
                          <p className="text-muted-foreground mb-3">{leader.bio}</p>
                        )}

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center">
                            <span className="text-muted-foreground mr-1">Integrity:</span>
                            {renderStars(leader.integrity_rating)}
                          </div>
                          <div className="flex items-center">
                            <span className="text-muted-foreground mr-1">Development:</span>
                            {renderStars(leader.development_rating)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {leaders.length === 0 && (
                <Card className="text-center py-12">
                  <CardContent>
                    <Crown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Leaders Listed</h3>
                    <p className="text-muted-foreground">
                      Be the first to add information about village leadership.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="projects">
            <div className="space-y-6">
              {projects.map((project: any) => (
                <Card key={project.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{project.project_name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getProjectStatusColor(project.project_status)} className="capitalize">
                            {project.project_status}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {project.project_type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      {project.funding_amount && (
                        <div className="text-right">
                          <div className="text-lg font-semibold text-primary">
                            {project.funding_amount.toLocaleString()} FCFA
                          </div>
                          <div className="text-sm text-muted-foreground">Budget</div>
                        </div>
                      )}
                    </div>

                    {project.description && (
                      <p className="text-muted-foreground mb-3">{project.description}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {project.year_started && (
                        <div>
                          <span className="text-muted-foreground">Started:</span>
                          <span className="ml-1 font-medium">{project.year_started}</span>
                        </div>
                      )}
                      {project.year_completed && (
                        <div>
                          <span className="text-muted-foreground">Completed:</span>
                          <span className="ml-1 font-medium">{project.year_completed}</span>
                        </div>
                      )}
                      {project.funding_source && (
                        <div>
                          <span className="text-muted-foreground">Funded by:</span>
                          <span className="ml-1 font-medium">{project.funding_source}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {projects.length === 0 && (
                <Card className="text-center py-12">
                  <CardContent>
                    <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Projects Listed</h3>
                    <p className="text-muted-foreground">
                      Help build the village profile by adding development projects.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="people">
            <div className="space-y-8">
              {/* Billionaires Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Notable Billionaires
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {billionaires.map((billionaire: any) => (
                    <Card key={billionaire.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={billionaire.photo_url} alt={billionaire.billionaire_name} />
                            <AvatarFallback>
                              {billionaire.billionaire_name.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-semibold">{billionaire.billionaire_name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{billionaire.main_sector}</p>
                            {billionaire.estimated_net_worth_usd && (
                              <p className="text-sm font-medium text-primary">
                                ~${billionaire.estimated_net_worth_usd.toLocaleString()} USD
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Celebrities Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Famous Personalities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {celebrities.map((celebrity: any) => (
                    <Card key={celebrity.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={celebrity.photo_url} alt={celebrity.celebrity_name} />
                            <AvatarFallback>
                              {celebrity.celebrity_name.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-semibold">{celebrity.celebrity_name}</h4>
                            <p className="text-sm text-muted-foreground mb-2 capitalize">{celebrity.profession}</p>
                            {celebrity.highlights && (
                              <p className="text-sm">{celebrity.highlights}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {(billionaires.length === 0 && celebrities.length === 0) && (
                <Card className="text-center py-12">
                  <CardContent>
                    <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Notable People Listed</h3>
                    <p className="text-muted-foreground">
                      Help celebrate your village by adding famous personalities and successful individuals.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="civic">
            <div className="space-y-8">
              {/* Petitions Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Vote className="h-5 w-5 mr-2" />
                  Active Petitions
                </h3>
                <div className="space-y-4">
                  {petitions.filter((p: any) => p.petition_status === 'active').map((petition: any) => (
                    <Card key={petition.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-2">{petition.petition_title}</h4>
                            <p className="text-muted-foreground text-sm mb-3">{petition.petition_body}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span>Target: {petition.target_audience}</span>
                              <span>Signatures: {petition.signatures_count}</span>
                            </div>
                          </div>
                          <Badge variant="secondary">{petition.petition_status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Conflicts Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Community Issues
                </h3>
                <div className="space-y-4">
                  {conflicts.map((conflict: any) => (
                    <Card key={conflict.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-2">{conflict.conflict_name}</h4>
                            <p className="text-muted-foreground text-sm mb-3">{conflict.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span>Type: {conflict.conflict_type}</span>
                              {conflict.timeline_start && (
                                <span>Since: {new Date(conflict.timeline_start).getFullYear()}</span>
                              )}
                            </div>
                          </div>
                          <Badge 
                            variant={conflict.current_status === 'resolved' ? 'success' : 'warning'}
                            className="capitalize"
                          >
                            {conflict.current_status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {(petitions.length === 0 && conflicts.length === 0) && (
                <Card className="text-center py-12">
                  <CardContent>
                    <Vote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Civic Activity</h3>
                    <p className="text-muted-foreground">
                      Start engaging with your community by creating petitions or reporting issues.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="gallery">
            <VillagePhotoGallery villageId={id!} />
          </TabsContent>

          <TabsContent value="discussions" className="space-y-6">
            <VillageDiscussions villageId={id!} />
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <VillageEvents villageId={id!} />
          </TabsContent>

          <TabsContent value="comments" className="space-y-6">
            <VillageComments villageId={id!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VillageProfile;