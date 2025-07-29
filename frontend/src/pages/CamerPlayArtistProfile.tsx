import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Play, Users, Calendar, Award, Music, 
  ExternalLink, MapPin, Heart, Share2, Download,
  Trophy, Star, Headphones, ShoppingCart, Ticket,
  BarChart3, DollarSign, Globe, MessageCircle,
  Instagram, Facebook, Youtube, Verified, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ArtistProfile {
  id: string;
  stage_name: string;
  real_name: string;
  bio: string;
  genres: string[];
  region: string;
  country: string;
  profile_photo_url: string;
  social_media_links: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    website?: string;
  };
  is_verified: boolean;
  member_since: string;
  features_enabled: Record<string, boolean>;
}

interface MusicTrack {
  id: string;
  title: string;
  duration: string;
  play_count: number;
  download_count: number;
  price_fcfa?: number;
  cover_image_url: string;
  release_date: string;
  album_title?: string;
  is_single: boolean;
  stream_url?: string;
}

interface LiveEvent {
  id: string;
  title: string;
  date: string;
  venue: string;
  location: string;
  ticket_price_min: number;
  ticket_price_max: number;
  tickets_sold: number;
  total_capacity: number;
  status: 'upcoming' | 'past' | 'live';
  replay_available: boolean;
  event_image_url: string;
}

interface AwardRecord {
  id: string;
  category: string;
  year: number;
  status: 'winner' | 'nominee';
  points_breakdown: {
    streams_percentage: number;
    sales_percentage: number;
    external_percentage: number;
    voting_percentage: number;
  };
  voting_open: boolean;
  current_votes?: number;
}

const CamerPlayArtistProfile = () => {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [musicData, setMusicData] = useState<{
    singles: MusicTrack[];
    albums: any[];
    features: MusicTrack[];
  }>({
    singles: [],
    albums: [],
    features: []
  });
  const [eventsData, setEventsData] = useState<{
    upcoming: LiveEvent[];
    past: LiveEvent[];
  }>({
    upcoming: [],
    past: []
  });
  const [awardsData, setAwardsData] = useState<AwardRecord[]>([]);
  const [artistStats, setArtistStats] = useState({
    totalStreams: 0,
    albumsReleased: 0,
    awardsWon: 0,
    eventsPerformed: 0,
    followers: 0,
    monthlyListeners: 0,
    topRegions: ['Southwest', 'Northwest', 'Centre'],
    recentGrowth: 15.4
  });
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    if (artistId) {
      fetchArtistData();
    }
  }, [artistId]);

  const fetchArtistData = async () => {
    try {
      setLoading(true);
      
      // For demo, create a comprehensive artist profile
      const mockArtist: ArtistProfile = {
        id: artistId || '1',
        stage_name: artistId === 'boy-takunda' ? 'Boy Takunda' : 'Artist Name',
        real_name: 'Takunda Emmanuel Ngwa',
        bio: 'Rising star from Southwest Cameroon, blending Afrobeats with traditional Cameroonian rhythms. Known for powerful vocals and conscious lyrics that speak to the youth.',
        genres: ['Afrobeats', 'Traditional', 'Gospel'],
        region: 'Southwest',
        country: 'Cameroon',
        profile_photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        social_media_links: {
          instagram: '@boytakunda',
          facebook: 'BoyTakundaOfficial',
          youtube: 'BoyTakundaTV',
          website: 'https://boytakunda.com'
        },
        is_verified: true,
        member_since: '2023',
        features_enabled: {
          streaming: true,
          sales: true,
          events: true,
          awards: true
        }
      };

      setArtist(mockArtist);

      // Mock music data
      const mockMusic = {
        singles: [
          {
            id: '1',
            title: 'Cameroon Rising',
            duration: '3:45',
            play_count: 125000,
            download_count: 5600,
            price_fcfa: 1500,
            cover_image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300',
            release_date: '2024-03-15',
            is_single: true,
            stream_url: '/stream/1'
          },
          {
            id: '2',
            title: 'Village Pride',
            duration: '4:12',
            play_count: 98000,
            download_count: 4200,
            price_fcfa: 1500,
            cover_image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300',
            release_date: '2024-01-20',
            is_single: true,
            stream_url: '/stream/2'
          }
        ],
        albums: [],
        features: []
      };

      setMusicData(mockMusic);

      // Mock events data
      const mockEvents = {
        upcoming: [
          {
            id: '1',
            title: 'Cameroon Unity Concert',
            date: '2024-08-15T19:00:00',
            venue: 'Buea Mountain Hotel',
            location: 'Buea, Southwest',
            ticket_price_min: 5000,
            ticket_price_max: 25000,
            tickets_sold: 342,
            total_capacity: 500,
            status: 'upcoming' as const,
            replay_available: false,
            event_image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400'
          }
        ],
        past: [
          {
            id: '2',
            title: 'New Year Celebration',
            date: '2024-01-01T20:00:00',
            venue: 'Limbe Beach Resort',
            location: 'Limbe, Southwest',
            ticket_price_min: 3000,
            ticket_price_max: 15000,
            tickets_sold: 800,
            total_capacity: 800,
            status: 'past' as const,
            replay_available: true,
            event_image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400'
          }
        ]
      };

      setEventsData(mockEvents);

      // Mock awards data
      const mockAwards: AwardRecord[] = [
        {
          id: '1',
          category: 'Best Male Artist 2024',
          year: 2024,
          status: 'winner',
          points_breakdown: {
            streams_percentage: 45,
            sales_percentage: 25,
            external_percentage: 20,
            voting_percentage: 10
          },
          voting_open: false
        },
        {
          id: '2',
          category: 'Song of the Year 2024',
          year: 2024,
          status: 'nominee',
          points_breakdown: {
            streams_percentage: 35,
            sales_percentage: 30,
            external_percentage: 25,
            voting_percentage: 10
          },
          voting_open: true,
          current_votes: 1250
        }
      ];

      setAwardsData(mockAwards);

      // Calculate stats
      const totalStreams = mockMusic.singles.reduce((sum, track) => sum + track.play_count, 0);
      const totalDownloads = mockMusic.singles.reduce((sum, track) => sum + track.download_count, 0);
      const awardsWon = mockAwards.filter(award => award.status === 'winner').length;
      const eventsPerformed = mockEvents.past.length + mockEvents.upcoming.length;

      setArtistStats({
        totalStreams,
        albumsReleased: mockMusic.albums.length,
        awardsWon,
        eventsPerformed,
        followers: 75420,
        monthlyListeners: 45000,
        topRegions: ['Southwest', 'Northwest', 'Centre'],
        recentGrowth: 15.4
      });

    } catch (error) {
      console.error('Error fetching artist data:', error);
      toast({
        title: "Error",
        description: "Failed to load artist data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = () => {
    setFollowing(!following);
    toast({
      title: following ? "Unfollowed" : "Following",
      description: `You ${following ? 'unfollowed' : 'are now following'} ${artist?.stage_name}`,
    });
  };

  const handlePlaySong = (song: MusicTrack) => {
    toast({
      title: "🎵 Now Playing",
      description: `${song.title} by ${artist?.stage_name}`,
    });
  };

  const handlePurchaseTicket = (event: LiveEvent) => {
    navigate(`/camerplay/tickets/${event.id}`);
  };

  const handleVoteForAward = (award: AwardRecord) => {
    toast({
      title: "Vote Cast",
      description: `Your vote for ${artist?.stage_name} in ${award.category} has been recorded!`,
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Artist Not Found</h2>
          <Button onClick={() => navigate('/camerplay')}>Back to CamerPlay</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Banner Section */}
      <div className="relative bg-gradient-to-r from-primary via-accent to-secondary text-white min-h-[500px]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/camerplay')}
            className="text-white hover:bg-white/10 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to CamerPlay
          </Button>

          <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
            {/* Artist Image */}
            <div className="relative">
              <Avatar className="w-48 h-48 border-4 border-white shadow-2xl">
                <AvatarImage 
                  src={artist.profile_photo_url} 
                  alt={artist.stage_name} 
                />
                <AvatarFallback className="text-4xl bg-primary text-white">
                  {artist.stage_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {artist.is_verified && (
                <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-2">
                  <Verified className="h-6 w-6 text-white fill-current" />
                </div>
              )}
            </div>

            {/* Artist Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl md:text-6xl font-black">{artist.stage_name}</h1>
                {artist.is_verified && (
                  <Badge className="bg-blue-500 text-white text-sm">
                    <Verified className="h-4 w-4 mr-1" />
                    Verified Artist
                  </Badge>
                )}
              </div>
              
              <p className="text-xl opacity-90 mb-2">{artist.real_name}</p>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{artist.region}, {artist.country}</span>
                </div>
                <div className="flex gap-2">
                  {artist.genres.map((genre) => (
                    <Badge key={genre} variant="outline" className="text-white border-white">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{artistStats.followers.toLocaleString()}</div>
                  <div className="text-sm opacity-80">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{artistStats.totalStreams.toLocaleString()}</div>
                  <div className="text-sm opacity-80">Total Streams</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{artistStats.albumsReleased}</div>
                  <div className="text-sm opacity-80">Albums</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{artistStats.awardsWon}</div>
                  <div className="text-sm opacity-80">Awards Won</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{artistStats.eventsPerformed}</div>
                  <div className="text-sm opacity-80">Events</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onClick={handleFollow}
                  className={following ? 
                    "bg-green-600 hover:bg-green-700 text-white" : 
                    "bg-white text-black hover:bg-gray-100"
                  }
                >
                  <Heart className={`h-5 w-5 mr-2 ${following ? 'fill-current' : ''}`} />
                  {following ? 'Following' : 'Follow Artist'}
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                  <Play className="h-5 w-5 mr-2" />
                  Play All Songs
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Support Artist
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                  <Share2 className="h-5 w-5 mr-2" />
                  Share Profile
                </Button>
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="flex gap-4">
            {artist.social_media_links.website && (
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <Globe className="h-4 w-4 mr-2" />
                Website
              </Button>
            )}
            {artist.social_media_links.instagram && (
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <Instagram className="h-4 w-4 mr-2" />
                Instagram
              </Button>
            )}
            {artist.social_media_links.facebook && (
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
            )}
            {artist.social_media_links.youtube && (
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <Youtube className="h-4 w-4 mr-2" />
                YouTube
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="music" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="music" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              Music
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="awards" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Awards
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              About
            </TabsTrigger>
            <TabsTrigger value="store" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Store
            </TabsTrigger>
          </TabsList>

          {/* Music Tab */}
          <TabsContent value="music" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold">Discography</h3>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
                <Button variant="outline" onClick={() => navigate('/camerplay/player')}>
                  <Headphones className="h-4 w-4 mr-2" />
                  Open Player
                </Button>
              </div>
            </div>

            {/* Music Categories */}
            <div className="space-y-8">
              {/* Singles */}
              <div>
                <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Singles ({musicData.singles.length})
                </h4>
                <div className="grid gap-4">
                  {musicData.singles.map((song, index) => (
                    <Card key={song.id} className="hover:shadow-lg transition-all group">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                              {index + 1}
                            </div>
                            <img 
                              src={song.cover_image_url}
                              className="w-16 h-16 object-cover rounded-lg shadow-md"
                              alt={song.title}
                            />
                          </div>
                          
                          <div className="flex-1">
                            <h5 className="font-semibold text-lg">{song.title}</h5>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Headphones className="h-3 w-3" />
                                {song.play_count.toLocaleString()} plays
                              </span>
                              <span>{song.duration}</span>
                              <span>{new Date(song.release_date).getFullYear()}</span>
                              {song.price_fcfa && (
                                <span className="text-primary font-medium">
                                  {song.price_fcfa.toLocaleString()} FCFA
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" onClick={() => handlePlaySong(song)} className="bg-primary">
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Heart className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Albums Section (if any) */}
              {musicData.albums.length > 0 && (
                <div>
                  <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Albums ({musicData.albums.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Album cards would go here */}
                  </div>
                </div>
              )}

              {/* Features Section (if any) */}
              {musicData.features.length > 0 && (
                <div>
                  <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Features ({musicData.features.length})
                  </h4>
                  <div className="grid gap-4">
                    {/* Feature tracks would go here */}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            {/* Upcoming Events */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Upcoming Events</h3>
                <Button variant="outline" onClick={() => navigate('/camerplay/events')}>
                  View All Events
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventsData.upcoming.map((event) => (
                  <Card key={event.id} className="hover:shadow-lg transition-all overflow-hidden">
                    <div className="relative">
                      <img 
                        src={event.event_image_url}
                        className="w-full h-48 object-cover"
                        alt={event.title}
                      />
                      <Badge className="absolute top-3 right-3 bg-green-500">
                        {event.status.toUpperCase()}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-lg mb-2">{event.title}</h4>
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {event.venue}, {event.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4" />
                          {event.tickets_sold}/{event.total_capacity} tickets sold
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">From</p>
                          <p className="font-semibold">{event.ticket_price_min.toLocaleString()} FCFA</p>
                        </div>
                        <Progress 
                          value={(event.tickets_sold / event.total_capacity) * 100} 
                          className="w-20 h-2"
                        />
                      </div>
                      
                      <Button 
                        className="w-full"
                        onClick={() => handlePurchaseTicket(event)}
                      >
                        <Ticket className="h-4 w-4 mr-2" />
                        Get Tickets
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Past Events */}
            <div>
              <h4 className="text-xl font-semibold mb-4">Past Events</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventsData.past.map((event) => (
                  <Card key={event.id} className="hover:shadow-lg transition-all opacity-75">
                    <div className="relative">
                      <img 
                        src={event.event_image_url}
                        className="w-full h-40 object-cover"
                        alt={event.title}
                      />
                      {event.replay_available && (
                        <Badge className="absolute top-3 right-3 bg-purple-500">
                          <Play className="h-3 w-3 mr-1" />
                          Replay
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h5 className="font-semibold mb-2">{event.title}</h5>
                      <div className="text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          {event.tickets_sold} attended
                        </div>
                      </div>
                      {event.replay_available && (
                        <Button variant="outline" className="w-full" size="sm">
                          <Play className="h-3 w-3 mr-2" />
                          Watch Replay
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Awards Tab */}
          <TabsContent value="awards" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold">Awards & Recognition</h3>
              <Button variant="outline" onClick={() => navigate('/camerplay/awards')}>
                View All Awards
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Award Categories */}
              {awardsData.map((award) => (
                <Card key={award.id} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className={`h-5 w-5 ${award.status === 'winner' ? 'text-yellow-500' : 'text-gray-400'}`} />
                        {award.category}
                      </div>
                      {award.status === 'winner' ? (
                        <Badge className="bg-yellow-500 text-black">
                          <Crown className="h-3 w-3 mr-1" />
                          Winner
                        </Badge>
                      ) : (
                        <Badge variant="outline">Nominee</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Points Breakdown */}
                      <div>
                        <h5 className="font-semibold mb-2">Points Breakdown</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">CamerPlay Streams</span>
                            <span className="font-medium">{award.points_breakdown.streams_percentage}%</span>
                          </div>
                          <Progress value={award.points_breakdown.streams_percentage} className="h-2" />
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Sales</span>
                            <span className="font-medium">{award.points_breakdown.sales_percentage}%</span>
                          </div>
                          <Progress value={award.points_breakdown.sales_percentage} className="h-2" />
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm">External Streams</span>
                            <span className="font-medium">{award.points_breakdown.external_percentage}%</span>
                          </div>
                          <Progress value={award.points_breakdown.external_percentage} className="h-2" />
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Public Voting</span>
                            <span className="font-medium">{award.points_breakdown.voting_percentage}%</span>
                          </div>
                          <Progress value={award.points_breakdown.voting_percentage} className="h-2" />
                        </div>
                      </div>

                      {/* Voting Section */}
                      {award.voting_open && (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold">Public Voting</span>
                            <span className="text-sm text-muted-foreground">
                              {award.current_votes} votes
                            </span>
                          </div>
                          <Button 
                            className="w-full"
                            onClick={() => handleVoteForAward(award)}
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            Vote for {artist.stage_name}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-purple-500" />
                    Platform Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>100K+ Total Streams</span>
                      <Badge className="bg-green-500">
                        <Star className="h-3 w-3 mr-1" />
                        Achieved
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Top 10 Artist</span>
                      <Badge className="bg-blue-500">
                        <Trophy className="h-3 w-3 mr-1" />
                        Achieved
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Verified Artist</span>
                      <Badge className="bg-purple-500">
                        <Verified className="h-3 w-3 mr-1" />
                        Achieved
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>50+ Followers</span>
                      <Badge className="bg-orange-500">
                        <Users className="h-3 w-3 mr-1" />
                        Achieved
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold">Streaming Analytics</h3>
              <Badge variant="outline">Last 30 Days</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Listeners</p>
                      <p className="text-2xl font-bold">{artistStats.monthlyListeners.toLocaleString()}</p>
                    </div>
                    <Headphones className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-green-600">+{artistStats.recentGrowth}%</span>
                    <span className="text-sm text-muted-foreground ml-2">vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Streams</p>
                      <p className="text-2xl font-bold">{artistStats.totalStreams.toLocaleString()}</p>
                    </div>
                    <Play className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-muted-foreground">Most played:</span>
                    <span className="text-sm ml-2">Cameroon Rising</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Top Region</p>
                      <p className="text-2xl font-bold">{artistStats.topRegions[0]}</p>
                    </div>
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-muted-foreground">32% of streams</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Fan Engagement</p>
                      <p className="text-2xl font-bold">8.5/10</p>
                    </div>
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-green-600">High</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Regional Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Regional Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {artistStats.topRegions.map((region, index) => {
                    const percentage = [32, 24, 18, 15, 11][index] || 0;
                    return (
                      <div key={region} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">#{index + 1}</span>
                          <span>{region}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={percentage} className="w-20 h-2" />
                          <span className="text-sm text-muted-foreground w-12">{percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <h3 className="text-2xl font-bold">About {artist.stage_name}</h3>
            
            {/* Biography */}
            <Card>
              <CardHeader>
                <CardTitle>Artist Story</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {artist.bio}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Artist Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Artist Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Real Name:</span>
                      <span className="text-muted-foreground">{artist.real_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Stage Name:</span>
                      <span className="text-muted-foreground">{artist.stage_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Origin:</span>
                      <span className="text-muted-foreground">{artist.region}, {artist.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Member Since:</span>
                      <span className="text-muted-foreground">{artist.member_since}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Genres:</span>
                      <span className="text-muted-foreground">{artist.genres.join(', ')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Social Media */}
              <Card>
                <CardHeader>
                  <CardTitle>Connect</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {artist.social_media_links.website && (
                      <Button variant="outline" className="w-full justify-start">
                        <Globe className="h-4 w-4 mr-2" />
                        Official Website
                      </Button>
                    )}
                    {artist.social_media_links.instagram && (
                      <Button variant="outline" className="w-full justify-start">
                        <Instagram className="h-4 w-4 mr-2" />
                        @{artist.social_media_links.instagram}
                      </Button>
                    )}
                    {artist.social_media_links.facebook && (
                      <Button variant="outline" className="w-full justify-start">
                        <Facebook className="h-4 w-4 mr-2" />
                        {artist.social_media_links.facebook}
                      </Button>
                    )}
                    {artist.social_media_links.youtube && (
                      <Button variant="outline" className="w-full justify-start">
                        <Youtube className="h-4 w-4 mr-2" />
                        {artist.social_media_links.youtube}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Fan Engagement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Fan Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Recent followers</span>
                    <Badge>+127 this week</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Comments on songs</span>
                    <Badge variant="outline">45 new</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Artist activity</span>
                    <Badge className="bg-green-500">Active daily</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="store" className="space-y-6">
            <h3 className="text-2xl font-bold">Artist Store</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Merchandise items */}
              {[
                { name: 'Official T-Shirt', price: 15000, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300' },
                { name: 'Signed Album', price: 25000, image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300' },
                { name: 'Concert Poster', price: 8000, image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300' }
              ].map((item, index) => (
                <Card key={index} className="hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <img 
                      src={item.image}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                      alt={item.name}
                    />
                    <h4 className="font-semibold mb-2">{item.name}</h4>
                    <p className="text-lg font-bold text-primary mb-4">
                      {item.price.toLocaleString()} FCFA
                    </p>
                    <Button className="w-full">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CamerPlayArtistProfile;