import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Music, 
  Calendar, 
  DollarSign, 
  Award, 
  Users, 
  Headphones,
  Shield,
  FileText,
  BarChart3,
  Settings,
  CreditCard,
  Star,
  Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ArtistIDCard from "@/components/Artist/ArtistIDCard";

interface ArtistMembership {
  id: string;
  artist_id_number: string;
  stage_name: string;
  real_name: string;
  membership_active: boolean;
  membership_expires_at?: string;
  id_card_url?: string;
  features_enabled: any;
}

const ArtistDashboard = () => {
  const { toast } = useToast();
  const [artistData, setArtistData] = useState<ArtistMembership | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtistData();
  }, []);

  const fetchArtistData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('artist_memberships')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setArtistData(data);
    } catch (error) {
      console.error("Error fetching artist data:", error);
    } finally {
      setLoading(false);
    }
  };

  const featureCards = [
    {
      title: "CamerPlay",
      description: "Upload and manage your music",
      icon: Music,
      enabled: artistData?.features_enabled?.camerplay || false,
      comingSoon: false,
      action: "Manage Music"
    },
    {
      title: "Album Store",
      description: "Sell your music directly",
      icon: DollarSign,
      enabled: artistData?.features_enabled?.album_store || false,
      comingSoon: false,
      action: "Open Store"
    },
    {
      title: "Events & Tickets",
      description: "Create and sell event tickets",
      icon: Calendar,
      enabled: artistData?.features_enabled?.events || false,
      comingSoon: false,
      action: "Create Event"
    },
    {
      title: "Awards Eligibility",
      description: "Eligible for CamerPulse awards",
      icon: Award,
      enabled: artistData?.features_enabled?.awards || false,
      comingSoon: false,
      action: "View Awards"
    },
    {
      title: "Brand Ambassador",
      description: "Access brand partnerships",
      icon: Users,
      enabled: artistData?.features_enabled?.brand_ambassador || false,
      comingSoon: false,
      action: "View Deals"
    },
    {
      title: "Streaming Panel",
      description: "Control streaming platforms",
      icon: Headphones,
      enabled: artistData?.features_enabled?.streaming || false,
      comingSoon: false,
      action: "Manage Streaming"
    },
    {
      title: "Earnings Dashboard",
      description: "Track royalties and sales",
      icon: BarChart3,
      enabled: artistData?.features_enabled?.earnings_dashboard || false,
      comingSoon: false,
      action: "View Earnings"
    },
    {
      title: "Legal Documents",
      description: "Contracts and templates",
      icon: FileText,
      enabled: true,
      comingSoon: false,
      action: "Access Documents"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading your artist dashboard...</p>
        </div>
      </div>
    );
  }

  if (!artistData) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Artist Access Required</h2>
        <p className="text-muted-foreground mb-6">
          You need to be a verified CamerPulse artist to access this dashboard.
        </p>
        <Button>Apply for Artist Verification</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">Welcome back, {artistData.stage_name}</h1>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <Shield className="w-3 h-3 mr-1" />
              Verified Artist
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Manage your music career from your professional dashboard
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Artist ID</p>
          <p className="font-mono font-semibold">{artistData.artist_id_number}</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="music">Music</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Music className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">0</div>
                <p className="text-sm text-muted-foreground">Tracks Uploaded</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">0</div>
                <p className="text-sm text-muted-foreground">Events Created</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">0 FCFA</div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">0</div>
                <p className="text-sm text-muted-foreground">Fans Following</p>
              </CardContent>
            </Card>
          </div>

          {/* Artist Features */}
          <Card>
            <CardHeader>
              <CardTitle>Your Artist Features</CardTitle>
              <CardDescription>
                Access all the tools you need to grow your music career
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {featureCards.map((feature, index) => (
                  <Card key={index} className={`relative ${!feature.enabled ? 'opacity-60' : ''}`}>
                    <CardContent className="p-4 text-center">
                      <feature.icon className={`w-8 h-8 mx-auto mb-3 ${feature.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                      <Button 
                        size="sm" 
                        variant={feature.enabled ? "default" : "secondary"}
                        disabled={!feature.enabled || feature.comingSoon}
                        className="w-full"
                      >
                        {feature.comingSoon ? "Coming Soon" : feature.action}
                      </Button>
                      {feature.enabled && (
                        <Badge className="absolute -top-2 -right-2 bg-green-600">✓</Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Artist ID Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your Official Artist ID</CardTitle>
              <CardDescription>
                Your verified CamerPulse Artist identification card
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ArtistIDCard artistData={artistData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="music" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                CamerPlay Music Management
              </CardTitle>
              <CardDescription>
                Upload, manage, and distribute your music
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Start Your Music Journey</h3>
              <p className="text-muted-foreground mb-6">
                Upload your first track to begin building your catalog
              </p>
              <Button>Upload Your First Track</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Events & Ticket Sales
              </CardTitle>
              <CardDescription>
                Create events and sell tickets to your fans
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Create Your First Event</h3>
              <p className="text-muted-foreground mb-6">
                Set up concerts, meet & greets, or virtual performances
              </p>
              <Button>Create Event</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Earnings Dashboard
              </CardTitle>
              <CardDescription>
                Track your royalties, sales, and revenue streams
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Earnings Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start uploading music and creating events to see your earnings here
              </p>
              <div className="flex gap-3 justify-center">
                <Button>Upload Music</Button>
                <Button variant="outline">Create Event</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Artist Settings
              </CardTitle>
              <CardDescription>
                Manage your artist profile and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">Profile Settings</h4>
                  <Button variant="outline" className="w-full justify-start">
                    Edit Artist Profile
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Update Social Media Links
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Change Profile Photo
                  </Button>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Account Settings</h4>
                  <Button variant="outline" className="w-full justify-start">
                    Payment Methods
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Notification Preferences
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Privacy Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArtistDashboard;