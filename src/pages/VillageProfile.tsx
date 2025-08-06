import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useVillageSlug } from '@/hooks/useSlugResolver';
import { 
  MapPin, Star, Users, Crown, Calendar, Phone, Globe, 
  Facebook, MessageCircle, Plus, ChevronRight, Heart,
  Award, DollarSign, Building, AlertTriangle, Vote,
  Camera, Edit, Share2, Eye, Languages, UserPlus,
  ChevronDown, ExternalLink, Mail, CheckCircle,
  Home, ArrowLeft, Navigation, Map, Clock,
  UsersIcon, BookOpen, GraduationCap, Hospital,
  Briefcase, Image, Calendar as CalendarIcon,
  FileText, UserCheck, Flag, Megaphone, Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { VillageHeader } from '@/components/villages/VillageHeader';
import { VillageOverview } from '@/components/villages/VillageOverview';
import { VillageGallery } from '@/components/villages/VillageGallery';
import { VillageMembers } from '@/components/villages/VillageMembers';
import { VillageInstitutions } from '@/components/villages/VillageInstitutions';
import { VillageProjects } from '@/components/villages/VillageProjects';
import { VillageEvents } from '@/components/villages/VillageEvents';
import { VillagePetitions } from '@/components/villages/VillagePetitions';
import { VillageContributions } from '@/components/villages/VillageContributions';

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
  village_image?: string;
  leadership_contact?: string;
  village_phone?: string;
  village_email?: string;
}

const VillageProfile = () => {
  const { entity: village, loading: villageLoading, error, entityId } = useVillageSlug();
  const [villageData, setVillageData] = useState<VillageData | null>(null);
  const [user, setUser] = useState(null);
  const [userMembership, setUserMembership] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    if (village) {
      setVillageData(village);
      incrementViewCount();
      checkUserMembership();
    }
  }, [village, entityId]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

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

  const checkUserMembership = async () => {
    if (!user || !entityId) return;
    
    try {
      const { data } = await supabase
        .from('village_memberships')
        .select('*')
        .eq('village_id', entityId)
        .eq('user_id', user.id)
        .single();
      
      setUserMembership(data);
    } catch (error) {
      // User is not a member, which is fine
    }
  };

  const handleJoinVillage = async () => {
    if (!user) {
      toast.error('Please log in to join this village');
      navigate('/auth');
      return;
    }

    try {
      const { error } = await supabase
        .from('village_memberships')
        .insert({
          village_id: entityId,
          user_id: user.id,
          membership_type: 'son_daughter',
          status: 'pending'
        });

      if (error) throw error;
      
      toast.success('Membership request submitted for verification!');
      checkUserMembership();
    } catch (error) {
      console.error('Error joining village:', error);
      toast.error('Failed to submit membership request');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${villageData?.village_name} - CamerPulse`,
          text: `Discover ${villageData?.village_name}, ${villageData?.region} on CamerPulse`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (villageLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Loading skeleton */}
        <div className="animate-pulse">
          <div className="h-80 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !villageData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md text-center p-8">
          <CardContent className="space-y-4">
            <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto" />
            <h2 className="text-2xl font-bold">Village Not Found</h2>
            <p className="text-muted-foreground">
              {error || "The village you're looking for doesn't exist or has been removed."}
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Link to="/villages">
                <Button>Browse Villages</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb Navigation */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground flex items-center">
              <Home className="h-4 w-4 mr-1" />
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link to="/villages" className="text-muted-foreground hover:text-foreground">
              Villages
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{villageData.village_name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Header */}
      <VillageHeader 
        village={villageData}
        userMembership={userMembership}
        onJoinVillage={handleJoinVillage}
        onShare={handleShare}
      />

      {/* Quick Stats */}
      <div className="bg-muted/30 py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="text-center p-4 hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-primary">{villageData.sons_daughters_count || 0}</div>
              <div className="text-sm text-muted-foreground">Members</div>
            </Card>
            <Card className="text-center p-4 hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-secondary">
                {villageData.population_estimate ? (villageData.population_estimate / 1000).toFixed(1) + 'K' : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Population</div>
            </Card>
            <Card className="text-center p-4 hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-accent">{villageData.overall_rating.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Rating</div>
            </Card>
            <Card className="text-center p-4 hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-success">{villageData.infrastructure_score || 0}</div>
              <div className="text-sm text-muted-foreground">Infrastructure</div>
            </Card>
            <Card className="text-center p-4 hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-warning">{villageData.education_score || 0}</div>
              <div className="text-sm text-muted-foreground">Education</div>
            </Card>
            <Card className="text-center p-4 hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-info">{villageData.view_count || 0}</div>
              <div className="text-sm text-muted-foreground">Views</div>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-8 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Gallery</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Members</span>
            </TabsTrigger>
            <TabsTrigger value="institutions" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">Directory</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Projects</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Events</span>
            </TabsTrigger>
            <TabsTrigger value="petitions" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Petitions</span>
            </TabsTrigger>
            <TabsTrigger value="contribute" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Contribute</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <VillageOverview village={villageData} />
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            <VillageGallery villageId={entityId} />
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <VillageMembers villageId={entityId} />
          </TabsContent>

          <TabsContent value="institutions" className="space-y-6">
            <VillageInstitutions village={villageData} />
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <VillageProjects villageId={entityId} />
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <VillageEvents villageId={entityId} />
          </TabsContent>

          <TabsContent value="petitions" className="space-y-6">
            <VillagePetitions villageId={entityId} />
          </TabsContent>

          <TabsContent value="contribute" className="space-y-6">
            <VillageContributions villageId={entityId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VillageProfile;