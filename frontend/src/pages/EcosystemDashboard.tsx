import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Music, 
  Trophy, 
  DollarSign, 
  Calendar,
  Star,
  PlayCircle,
  Award,
  Heart
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface EcosystemStats {
  totalArtists: number;
  totalFans: number;
  totalStreams: number;
  totalRevenue: number;
  activeAwards: number;
  monthlyGrowth: number;
}

interface ArtistDashboardData {
  totalStreams: number;
  totalEarnings: number;
  fanCount: number;
  currentRank: number;
  recentPlays: any[];
  upcomingEvents: any[];
}

const EcosystemDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [ecosystemStats, setEcosystemStats] = useState<EcosystemStats>({
    totalArtists: 0,
    totalFans: 0,
    totalStreams: 0,
    totalRevenue: 0,
    activeAwards: 0,
    monthlyGrowth: 0
  });
  
  const [artistData, setArtistData] = useState<ArtistDashboardData | null>(null);
  const [isArtist, setIsArtist] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEcosystemData();
    checkArtistStatus();
  }, [user]);

  const loadEcosystemData = async () => {
    try {
      // Get total artists
      const { count: artistCount } = await supabase
        .from('artist_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('membership_active', true);

      // Get total fans
      const { count: fanCount } = await supabase
        .from('fan_profiles')
        .select('*', { count: 'exact', head: true });

      // Get total streams
      const { count: streamCount } = await supabase
        .from('music_tracks')
        .select('*', { count: 'exact', head: true });

      // Get active awards
      const { count: awardCount } = await supabase
        .from('awards')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      setEcosystemStats({
        totalArtists: artistCount || 0,
        totalFans: fanCount || 0,
        totalStreams: streamCount || 0,
        totalRevenue: 2500000, // Sample data in FCFA
        activeAwards: awardCount || 0,
        monthlyGrowth: 12.5
      });

    } catch (error) {
      console.error('Error loading ecosystem data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkArtistStatus = async () => {
    if (!user) return;

    try {
      const { data: membership } = await supabase
        .from('artist_memberships')
        .select('*')
        .eq('user_id', user.id)
        .eq('membership_active', true)
        .single();

      if (membership) {
        setIsArtist(true);
        await loadArtistData(membership.id);
      }
    } catch (error) {
      console.error('Error checking artist status:', error);
    }
  };

  const loadArtistData = async (artistId: string) => {
    try {
      // Mock artist data - in a real app this would come from music tables
      const mockTrackData = [
        { play_count: 1500, download_count: 200 },
        { play_count: 2300, download_count: 150 },
        { play_count: 800, download_count: 100 }
      ];

      const totalStreams = mockTrackData.reduce((sum, track) => sum + track.play_count, 0);
      const totalEarnings = totalStreams * 10; // Sample calculation: 10 FCFA per stream

      setArtistData({
        totalStreams,
        totalEarnings,
        fanCount: Math.floor(Math.random() * 1000) + 50,
        currentRank: Math.floor(Math.random() * 100) + 1,
        recentPlays: [],
        upcomingEvents: []
      });

    } catch (error) {
      console.error('Error loading artist data:', error);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading Ecosystem Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            CamerPulse Ecosystem
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete overview of the Cameroonian music and civic ecosystem
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => navigate('/camerplay')}>
            <Music className="h-4 w-4 mr-2" />
            CamerPlay
          </Button>
          <Button variant="outline" onClick={() => navigate('/camerplay/awards')}>
            <Trophy className="h-4 w-4 mr-2" />
            Awards
          </Button>
        </div>
      </div>

      {/* Ecosystem Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Artists</p>
                <p className="text-2xl font-bold">{formatNumber(ecosystemStats.totalArtists)}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-green-600">
                +{ecosystemStats.monthlyGrowth}% this month
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Fans</p>
                <p className="text-2xl font-bold">{formatNumber(ecosystemStats.totalFans)}</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-green-600">
                +{(ecosystemStats.monthlyGrowth * 1.5).toFixed(1)}% this month
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tracks</p>
                <p className="text-2xl font-bold">{formatNumber(ecosystemStats.totalStreams)}</p>
              </div>
              <PlayCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-green-600">
                +{(ecosystemStats.monthlyGrowth * 2).toFixed(1)}% this month
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(ecosystemStats.totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-green-600">
                +{ecosystemStats.monthlyGrowth}% this month
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="artists">Artists</TabsTrigger>
          <TabsTrigger value="music">Music</TabsTrigger>
          <TabsTrigger value="awards">Awards</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Artist Dashboard (if user is an artist) */}
          {isArtist && artistData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Your Artist Dashboard
                </CardTitle>
                <CardDescription>
                  Your performance metrics and earnings overview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{formatNumber(artistData.totalStreams)}</p>
                    <p className="text-sm text-muted-foreground">Total Streams</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(artistData.totalEarnings)}</p>
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{formatNumber(artistData.fanCount)}</p>
                    <p className="text-sm text-muted-foreground">Fans</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">#{artistData.currentRank}</p>
                    <p className="text-sm text-muted-foreground">Current Rank</p>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-2">
                  <Button onClick={() => navigate('/artist-dashboard')}>
                    View Full Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/camerplay/upload')}>
                    Upload Music
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/camerplay')}>
              <CardContent className="p-6 text-center">
                <Music className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Explore Music</h3>
                <p className="text-sm text-muted-foreground">Discover the latest Cameroonian music</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/camerplay/awards')}>
              <CardContent className="p-6 text-center">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                <h3 className="font-semibold mb-2">Awards Voting</h3>
                <p className="text-sm text-muted-foreground">Vote for your favorite artists</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/artist-register')}>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="font-semibold mb-2">Join as Artist</h3>
                <p className="text-sm text-muted-foreground">Start your music career</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="artists">
          <Card>
            <CardHeader>
              <CardTitle>Artist Ecosystem</CardTitle>
              <CardDescription>
                Growth and performance metrics for Cameroonian artists
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Registered Artists</span>
                  <Badge>{ecosystemStats.totalArtists}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Active This Month</span>
                  <Badge variant="outline">{Math.floor(ecosystemStats.totalArtists * 0.7)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Average Monthly Growth</span>
                  <Badge className="bg-green-500">{ecosystemStats.monthlyGrowth}%</Badge>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Artist Distribution by Region</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Centre</span>
                      <Progress value={35} className="w-32" />
                      <span className="text-sm">35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Littoral</span>
                      <Progress value={25} className="w-32" />
                      <span className="text-sm">25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">West</span>
                      <Progress value={20} className="w-32" />
                      <span className="text-sm">20%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Other</span>
                      <Progress value={20} className="w-32" />
                      <span className="text-sm">20%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="music">
          <Card>
            <CardHeader>
              <CardTitle>Music Platform Analytics</CardTitle>
              <CardDescription>
                Streaming and engagement metrics for CamerPlay
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Top Genres</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Afrobeats</span>
                      <div className="flex items-center gap-2">
                        <Progress value={45} className="w-20" />
                        <span className="text-sm">45%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Makossa</span>
                      <div className="flex items-center gap-2">
                        <Progress value={30} className="w-20" />
                        <span className="text-sm">30%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Bikutsi</span>
                      <div className="flex items-center gap-2">
                        <Progress value={15} className="w-20" />
                        <span className="text-sm">15%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Other</span>
                      <div className="flex items-center gap-2">
                        <Progress value={10} className="w-20" />
                        <span className="text-sm">10%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Platform Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Total Uploads</span>
                      <Badge>{formatNumber(ecosystemStats.totalStreams)}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Monthly Uploads</span>
                      <Badge variant="outline">{formatNumber(ecosystemStats.totalStreams * 0.1)}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Revenue Generated</span>
                      <Badge className="bg-green-500">{formatCurrency(ecosystemStats.totalRevenue)}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="awards">
          <Card>
            <CardHeader>
              <CardTitle>Awards System</CardTitle>
              <CardDescription>
                Recognition and celebration of Cameroonian talent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Active Awards</span>
                  <Badge>{ecosystemStats.activeAwards}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Prize Pool</span>
                  <Badge variant="outline">{formatCurrency(5000000)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Categories Available</span>
                  <Badge className="bg-yellow-500">12</Badge>
                </div>
                
                <div className="mt-6 flex gap-2">
                  <Button onClick={() => navigate('/camerplay/awards')}>
                    <Trophy className="h-4 w-4 mr-2" />
                    View Awards
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/fan-portal')}>
                    <Heart className="h-4 w-4 mr-2" />
                    Fan Portal
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

export default EcosystemDashboard;