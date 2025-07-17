import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Music, 
  Download, 
  Play, 
  Star, 
  Users,
  Wallet,
  Trophy,
  Calendar,
  Search,
  Filter,
  PlayCircle,
  Plus
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FanProfile {
  id: string;
  display_name: string;
  bio: string;
  total_spent: number;
  favorite_genres: string[];
  following_count: number;
  playlists_count: number;
}

interface Artist {
  id: string;
  stage_name: string;
  profile_photo_url: string;
  followers_count: number;
  monthly_listeners: number;
  is_following: boolean;
}

interface Track {
  id: string;
  title: string;
  artist_name: string;
  cover_art_url: string;
  duration: number;
  price_fcfa: number;
  is_liked: boolean;
  is_purchased: boolean;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  track_count: number;
  is_public: boolean;
  cover_image_url: string;
}

const FanPortal: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [fanProfile, setFanProfile] = useState<FanProfile | null>(null);
  const [trendingArtists, setTrendingArtists] = useState<Artist[]>([]);
  const [newReleases, setNewReleases] = useState<Track[]>([]);
  const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    if (user) {
      loadFanData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadFanData = async () => {
    try {
      setLoading(true);
      
      // Load fan profile
      const { data: profileData } = await supabase
        .from('fan_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (profileData) {
        setFanProfile(profileData);
      }

      // Load wallet balance
      const { data: walletData } = await supabase
        .from('fan_wallet_transactions')
        .select('amount')
        .eq('user_id', user?.id)
        .eq('transaction_type', 'credit');

      const totalCredits = walletData?.reduce((sum, transaction) => sum + (transaction.amount || 0), 0) || 0;
      setWalletBalance(totalCredits);

      // Load trending artists
      const { data: artistsData } = await supabase
        .from('artist_memberships')
        .select(`
          id,
          stage_name,
          profile_photo_url,
          artist_fan_interactions (
            interaction_type
          )
        `)
        .eq('membership_active', true)
        .limit(6);

      if (artistsData) {
        const formattedArtists = artistsData.map(artist => ({
          id: artist.id,
          stage_name: artist.stage_name,
          profile_photo_url: artist.profile_photo_url || '/placeholder-artist.png',
          followers_count: Math.floor(Math.random() * 10000) + 1000,
          monthly_listeners: Math.floor(Math.random() * 50000) + 5000,
          is_following: false
        }));
        setTrendingArtists(formattedArtists);
      }

      // Load new releases
      const { data: tracksData } = await supabase
        .from('music_tracks')
        .select(`
          id,
          title,
          duration,
          cover_art_url,
          price_fcfa,
          music_releases (
            title,
            artist_memberships (
              stage_name
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(8);

      if (tracksData) {
        const formattedTracks = tracksData.map(track => ({
          id: track.id,
          title: track.title,
          artist_name: track.music_releases?.artist_memberships?.stage_name || 'Unknown Artist',
          cover_art_url: track.cover_art_url || '/placeholder-album.png',
          duration: track.duration || 180,
          price_fcfa: track.price_fcfa || 500,
          is_liked: false,
          is_purchased: false
        }));
        setNewReleases(formattedTracks);
      }

      // Load user playlists
      const { data: playlistsData } = await supabase
        .from('fan_playlists')
        .select(`
          id,
          name,
          description,
          is_public,
          cover_image_url,
          playlist_tracks (
            id
          )
        `)
        .eq('user_id', user?.id);

      if (playlistsData) {
        const formattedPlaylists = playlistsData.map(playlist => ({
          id: playlist.id,
          name: playlist.name,
          description: playlist.description || '',
          track_count: playlist.playlist_tracks?.length || 0,
          is_public: playlist.is_public,
          cover_image_url: playlist.cover_image_url || '/placeholder-playlist.png'
        }));
        setMyPlaylists(formattedPlaylists);
      }

    } catch (error) {
      console.error('Error loading fan data:', error);
      toast({
        title: "Error",
        description: "Failed to load fan portal data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFollowArtist = async (artistId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to follow artists",
        variant: "default",
      });
      navigate('/auth');
      return;
    }

    try {
      await supabase
        .from('artist_fan_interactions')
        .insert({
          artist_id: artistId,
          user_id: user.id,
          interaction_type: 'follow'
        });

      // Update local state
      setTrendingArtists(prev => 
        prev.map(artist => 
          artist.id === artistId 
            ? { ...artist, is_following: true, followers_count: artist.followers_count + 1 }
            : artist
        )
      );

      toast({
        title: "Success",
        description: "Now following artist!",
        variant: "default",
      });

    } catch (error) {
      console.error('Error following artist:', error);
      toast({
        title: "Error",
        description: "Failed to follow artist",
        variant: "destructive",
      });
    }
  };

  const handleLikeTrack = async (trackId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to like tracks",
        variant: "default",
      });
      navigate('/auth');
      return;
    }

    try {
      // Add to user's liked tracks
      await supabase
        .from('artist_fan_interactions')
        .insert({
          user_id: user.id,
          interaction_type: 'like_track',
          track_id: trackId
        });

      // Update local state
      setNewReleases(prev => 
        prev.map(track => 
          track.id === trackId 
            ? { ...track, is_liked: true }
            : track
        )
      );

      toast({
        title: "Success",
        description: "Track added to your likes!",
        variant: "default",
      });

    } catch (error) {
      console.error('Error liking track:', error);
      toast({
        title: "Error",
        description: "Failed to like track",
        variant: "destructive",
      });
    }
  };

  const handlePurchaseTrack = async (trackId: string, price: number) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to purchase tracks",
        variant: "default",
      });
      navigate('/auth');
      return;
    }

    if (walletBalance < price) {
      toast({
        title: "Insufficient Balance",
        description: "Please add funds to your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      // Record purchase
      await supabase
        .from('music_purchases')
        .insert({
          track_id: trackId,
          user_id: user.id,
          purchase_type: 'download',
          amount_paid: price,
          currency: 'FCFA'
        });

      // Deduct from wallet
      await supabase
        .from('fan_wallet_transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'debit',
          amount: price,
          description: 'Track purchase',
          transaction_reference: `track_${trackId}`
        });

      // Update local state
      setWalletBalance(prev => prev - price);
      setNewReleases(prev => 
        prev.map(track => 
          track.id === trackId 
            ? { ...track, is_purchased: true }
            : track
        )
      );

      toast({
        title: "Purchase Successful",
        description: "Track downloaded to your library!",
        variant: "default",
      });

    } catch (error) {
      console.error('Error purchasing track:', error);
      toast({
        title: "Error",
        description: "Failed to purchase track",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
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
        <p className="mt-4 text-muted-foreground">Loading Fan Portal...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-4">Join the CamerPulse Community</h2>
        <p className="text-muted-foreground mb-6">
          Sign up to discover amazing Cameroonian music, support your favorite artists, and join exclusive events.
        </p>
        <Button onClick={() => navigate('/auth')}>
          Sign Up / Log In
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500" />
            Fan Portal
          </h1>
          <p className="text-muted-foreground mt-2">
            Discover, support, and connect with Cameroonian artists
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-green-500" />
            <span className="font-semibold">{formatCurrency(walletBalance)}</span>
          </div>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Funds
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search for artists, songs, or albums..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="library">My Library</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="awards">Awards</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          {/* Trending Artists */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Trending Artists</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingArtists.map((artist) => (
                <Card key={artist.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-square bg-muted overflow-hidden">
                      <img 
                        src={artist.profile_photo_url} 
                        alt={artist.stage_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold truncate">{artist.stage_name}</h3>
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>{artist.followers_count.toLocaleString()} followers</span>
                        <span>{artist.monthly_listeners.toLocaleString()} monthly</span>
                      </div>
                      <Button 
                        className="w-full mt-3" 
                        size="sm"
                        variant={artist.is_following ? "outline" : "default"}
                        onClick={() => handleFollowArtist(artist.id)}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        {artist.is_following ? 'Following' : 'Follow'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* New Releases */}
          <div>
            <h2 className="text-2xl font-bold mb-4">New Releases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {newReleases.map((track) => (
                <Card key={track.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-square bg-muted overflow-hidden relative">
                      <img 
                        src={track.cover_art_url} 
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                      <Button 
                        size="icon" 
                        className="absolute top-2 right-2 rounded-full"
                        variant="secondary"
                      >
                        <PlayCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold truncate">{track.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">{track.artist_name}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm">{formatTime(track.duration)}</span>
                        <Badge variant="outline">{formatCurrency(track.price_fcfa)}</Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button 
                          size="sm" 
                          variant={track.is_liked ? "default" : "outline"}
                          className="flex-1"
                          onClick={() => handleLikeTrack(track.id)}
                        >
                          <Heart className={`h-4 w-4 ${track.is_liked ? 'fill-current' : ''}`} />
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          disabled={track.is_purchased}
                          onClick={() => handlePurchaseTrack(track.id, track.price_fcfa)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          {track.is_purchased ? 'Owned' : 'Buy'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="library">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Music Library</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Playlist
              </Button>
            </div>

            {/* My Playlists */}
            <div>
              <h3 className="text-lg font-semibold mb-4">My Playlists</h3>
              {myPlaylists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myPlaylists.map((playlist) => (
                    <Card key={playlist.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-muted rounded-md overflow-hidden">
                            <img 
                              src={playlist.cover_image_url} 
                              alt={playlist.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold truncate">{playlist.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {playlist.track_count} tracks
                            </p>
                          </div>
                          <Badge variant={playlist.is_public ? "default" : "outline"}>
                            {playlist.is_public ? 'Public' : 'Private'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No playlists yet. Create your first playlist!</p>
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Playlist
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Recently Played */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Recently Played</h3>
              <Card>
                <CardContent className="p-8 text-center">
                  <Play className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Start listening to see your recently played tracks here</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="following">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Artists You Follow</h2>
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  You haven't followed any artists yet. Discover amazing Cameroonian artists!
                </p>
                <Button className="mt-4">
                  Discover Artists
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="awards">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">CamerPulse Awards</h2>
              <Button onClick={() => navigate('/camerplay/awards')}>
                <Trophy className="h-4 w-4 mr-2" />
                View All Awards
              </Button>
            </div>

            <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  2024 CamerPulse Awards
                </CardTitle>
                <CardDescription>
                  Vote for your favorite artists and help them win ₣100M in prizes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <p className="font-semibold">Voting Ends</p>
                    <p className="text-sm text-muted-foreground">December 15, 2024</p>
                  </div>
                  <div className="text-center">
                    <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                    <p className="font-semibold">Categories</p>
                    <p className="text-sm text-muted-foreground">15 Award Categories</p>
                  </div>
                  <div className="text-center">
                    <Trophy className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="font-semibold">Prize Pool</p>
                    <p className="text-sm text-muted-foreground">₣100,000,000</p>
                  </div>
                </div>
                <Button className="w-full mt-4" onClick={() => navigate('/camerplay/awards')}>
                  Start Voting Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FanPortal;