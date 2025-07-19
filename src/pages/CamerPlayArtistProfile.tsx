import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Play, Users, Calendar, Award, Music, 
  ExternalLink, MapPin, Heart, Share2, Download,
  Trophy, Star, Headphones, ShoppingCart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const CamerPlayArtistProfile = () => {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [artist, setArtist] = useState(null);
  const [artistData, setArtistData] = useState({
    music: [],
    events: [],
    awards: [],
    stats: {
      totalStreams: 0,
      totalSales: 0,
      followers: 0,
      monthlyListeners: 0
    }
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
      
      // Fetch artist info
      const { data: artistInfo } = await supabase
        .from('artist_memberships')
        .select('*')
        .eq('id', artistId)
        .single();

      if (artistInfo) {
        setArtist(artistInfo);

        // Fetch artist's music
        const { data: music } = await supabase
          .from('music_tracks')
          .select('*, release:music_releases(title, cover_image_url, release_date)')
          .limit(10);

        // Fetch artist's events  
        const { data: events } = await supabase
          .from('events')
          .select('*')
          .limit(6);

        setArtistData({
          music: music || [],
          events: events || [],
          awards: [], // Mock for now
          stats: {
            totalStreams: music?.reduce((sum, track) => sum + (track.play_count || 0), 0) || 0,
            totalSales: music?.reduce((sum, track) => sum + (track.download_count || 0), 0) || 0,
            followers: Math.floor(Math.random() * 100000) + 50000, // Mock
            monthlyListeners: Math.floor(Math.random() * 50000) + 10000 // Mock
          }
        });
      }
    } catch (error) {
      console.error('Error fetching artist data:', error);
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

  const handlePlaySong = (song) => {
    toast({
      title: "🎵 Now Playing",
      description: `${song.title} by ${artist?.stage_name}`,
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
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary via-accent to-secondary text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/camerplay')}
            className="text-white hover:bg-white/10 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to CamerPlay
          </Button>

          <div className="flex flex-col md:flex-row items-start gap-8">
            <Avatar className="w-48 h-48 border-4 border-white">
              <AvatarImage 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300" 
                alt={artist.stage_name} 
              />
              <AvatarFallback className="text-4xl">
                {artist.stage_name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-5xl font-black">{artist.stage_name}</h1>
                <Badge className="bg-blue-500 text-white">✓ Verified</Badge>
              </div>
              
              <p className="text-xl opacity-90 mb-4">{artist.real_name}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{artistData.stats.followers.toLocaleString()}</div>
                  <div className="text-sm opacity-80">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{artistData.stats.totalStreams.toLocaleString()}</div>
                  <div className="text-sm opacity-80">Total Streams</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{artistData.stats.monthlyListeners.toLocaleString()}</div>
                  <div className="text-sm opacity-80">Monthly Listeners</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{artistData.stats.totalSales}</div>
                  <div className="text-sm opacity-80">Downloads</div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  size="lg"
                  onClick={handleFollow}
                  className={following ? "bg-green-600 hover:bg-green-700" : "bg-white text-black hover:bg-gray-100"}
                >
                  <Heart className={`h-5 w-5 mr-2 ${following ? 'fill-current' : ''}`} />
                  {following ? 'Following' : 'Follow'}
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                  <Play className="h-5 w-5 mr-2" />
                  Play All
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="music" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="music" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              Music
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="awards" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Awards
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

          <TabsContent value="music" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold">Discography</h3>
              <Button variant="outline" onClick={() => navigate('/camerplay/player')}>
                <Headphones className="h-4 w-4 mr-2" />
                Open in Player
              </Button>
            </div>

            <div className="space-y-4">
              {artistData.music.map((song, index) => (
                <Card key={song.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <img 
                          src={song.release?.cover_image_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80"}
                          className="w-16 h-16 object-cover rounded-lg"
                          alt={song.title}
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{song.title}</h4>
                        <p className="text-muted-foreground">{song.release?.title}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>{song.play_count || 0} plays</span>
                          <span>{song.duration || '3:45'}</span>
                          <span>{new Date(song.release?.release_date).getFullYear()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => handlePlaySong(song)}>
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
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold">Upcoming Events</h3>
              <Button variant="outline">View All Events</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artistData.events.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <img 
                      src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300"
                      className="w-full h-32 object-cover rounded-lg mb-4"
                      alt={event.title}
                    />
                    <h4 className="font-semibold mb-2">{event.title}</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(event.start_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                    </div>
                    <Button className="w-full mt-4">Get Tickets</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="awards" className="space-y-6">
            <h3 className="text-2xl font-bold">Awards & Recognition</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    2024 CamerPlay Awards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Best Male Artist</span>
                      <Badge className="bg-yellow-500 text-black">Winner</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Song of the Year</span>
                      <Badge variant="outline">Nominated</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-purple-500" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>100K+ Streams</span>
                      <Badge className="bg-green-500">Achieved</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Top 10 Charts</span>
                      <Badge className="bg-blue-500">Achieved</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <h3 className="text-2xl font-bold">About {artist.stage_name}</h3>
            
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold mb-4">Artist Information</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium">Real Name:</span>
                        <span className="ml-2 text-muted-foreground">{artist.real_name}</span>
                      </div>
                      <div>
                        <span className="font-medium">Stage Name:</span>
                        <span className="ml-2 text-muted-foreground">{artist.stage_name}</span>
                      </div>
                      <div>
                        <span className="font-medium">Member Since:</span>
                        <span className="ml-2 text-muted-foreground">
                          {new Date(artist.created_at).getFullYear()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-4">Social Media</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Official Website
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Instagram
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Twitter
                      </Button>
                    </div>
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