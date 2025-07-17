import React, { useState, useEffect } from 'react';
import { Play, ShoppingCart, Heart, TrendingUp, MapPin, Users, Star, Music, ChevronRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const CamerPlayHome = () => {
  const { toast } = useToast();
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const [newAlbums, setNewAlbums] = useState([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [filterGenre, setFilterGenre] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterTime, setFilterTime] = useState('week');

  useEffect(() => {
    fetchTrendingSongs();
    fetchFeaturedArtists();
    fetchNewAlbums();
  }, [filterGenre, filterRegion, filterTime]);

  const fetchTrendingSongs = async () => {
    try {
      const { data, error } = await supabase
        .from('music_tracks')
        .select(`
          *,
          music_releases (
            title,
            artist_id,
            cover_image_url
          ),
          artist_memberships (
            stage_name,
            real_name
          )
        `)
        .order('play_count', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTrendingSongs(data || []);
    } catch (error) {
      console.error('Error fetching trending songs:', error);
    }
  };

  const fetchFeaturedArtists = async () => {
    try {
      const { data, error } = await supabase
        .from('artist_memberships')
        .select('*')
        .eq('membership_active', true)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      setFeaturedArtists(data || []);
    } catch (error) {
      console.error('Error fetching featured artists:', error);
    }
  };

  const fetchNewAlbums = async () => {
    try {
      const { data, error } = await supabase
        .from('music_releases')
        .select(`
          *,
          artist_memberships (
            stage_name,
            real_name
          )
        `)
        .order('release_date', { ascending: false })
        .limit(12);

      if (error) throw error;
      setNewAlbums(data || []);
    } catch (error) {
      console.error('Error fetching new albums:', error);
    }
  };

  const handlePlaySong = (song) => {
    setCurrentlyPlaying(song);
    toast({
      title: "Now Playing",
      description: `${song.title} by ${song.artist_memberships?.stage_name}`,
    });
  };

  const handleAddToCart = (item) => {
    toast({
      title: "Added to Cart",
      description: `${item.title} has been added to your cart`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative h-96 md:h-[500px] bg-gradient-to-r from-primary/20 via-accent/30 to-secondary/20 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/20" />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Stream & Support the Sound of Africa
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover New Artists. Buy. Vote. Repeat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:scale-105 transition-transform">
              <Music className="mr-2 h-5 w-5" />
              Explore Music
            </Button>
            <Button size="lg" variant="outline" className="hover:scale-105 transition-transform">
              <TrendingUp className="mr-2 h-5 w-5" />
              Top Charts
            </Button>
            <Button size="lg" variant="secondary" className="hover:scale-105 transition-transform">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Buy Albums
            </Button>
          </div>
        </div>
      </section>

      {/* Trending Songs */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center">
              <TrendingUp className="mr-2 h-6 w-6 text-primary" />
              Trending Songs
            </h2>
            <p className="text-muted-foreground">CamerPlay Charts</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <Select value={filterGenre} onValueChange={setFilterGenre}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                <SelectItem value="afrobeat">Afrobeat</SelectItem>
                <SelectItem value="makossa">Makossa</SelectItem>
                <SelectItem value="bikutsi">Bikutsi</SelectItem>
                <SelectItem value="hip-hop">Hip-Hop</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRegion} onValueChange={setFilterRegion}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="cameroon">Cameroon</SelectItem>
                <SelectItem value="west-africa">West Africa</SelectItem>
                <SelectItem value="diaspora">Diaspora</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTime} onValueChange={setFilterTime}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24hrs</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex overflow-x-auto space-x-4 pb-4">
          {trendingSongs.map((song, index) => (
            <Card key={song.id} className="min-w-64 flex-shrink-0 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={song.music_releases?.cover_image_url || '/placeholder.svg'}
                      alt={song.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
                      onClick={() => handlePlaySong(song)}
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{song.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {song.artist_memberships?.stage_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {song.play_count?.toLocaleString()} plays
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="p-2"
                    onClick={() => handleAddToCart(song)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Artists */}
      <section className="py-12 px-4 max-w-7xl mx-auto bg-muted/30 rounded-2xl mx-4">
        <h2 className="text-3xl font-bold mb-8 text-center">
          <Star className="inline mr-2 h-6 w-6 text-accent" />
          Featured Artists
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredArtists.map((artist) => (
            <Card key={artist.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {artist.stage_name?.charAt(0)}
                </div>
                <h3 className="font-bold text-lg mb-1">{artist.stage_name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{artist.real_name}</p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    View Profile
                  </Button>
                  <Button size="sm" className="w-full">
                    Visit Store
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* New Album Drops */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 flex items-center">
          <Music className="mr-2 h-6 w-6 text-primary" />
          New Album Drops
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {newAlbums.map((album) => (
            <Card key={album.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={album.cover_image_url || '/placeholder.svg'}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button size="sm" className="mr-2">
                    <Play className="mr-1 h-4 w-4" />
                    Play
                  </Button>
                  <Button size="sm" variant="secondary">
                    <ShoppingCart className="mr-1 h-4 w-4" />
                    Buy
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1">{album.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {album.artist_memberships?.stage_name}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {album.price_fcfa ? `${album.price_fcfa} FCFA` : 'Free'}
                  </span>
                  <Badge variant="secondary">New</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Regional Spotlight */}
      <section className="py-12 px-4 max-w-7xl mx-auto bg-gradient-to-r from-secondary/20 to-accent/20 rounded-2xl mx-4">
        <h2 className="text-3xl font-bold mb-8 text-center flex items-center justify-center">
          <MapPin className="mr-2 h-6 w-6 text-primary" />
          Regional Spotlight
        </h2>
        <Tabs defaultValue="cameroon" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cameroon">Cameroon</TabsTrigger>
            <TabsTrigger value="west-africa">West Africa</TabsTrigger>
            <TabsTrigger value="diaspora">Diaspora</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>
          <TabsContent value="cameroon" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Centre', 'Littoral', 'West', 'Northwest', 'Southwest', 'North', 'Far North', 'East'].map((region) => (
                <Card key={region} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <MapPin className="mx-auto mb-2 h-8 w-8 text-primary" />
                    <h3 className="font-semibold">{region}</h3>
                    <p className="text-sm text-muted-foreground">Explore</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="west-africa" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Nigeria', 'Ghana', "Côte d'Ivoire", 'Senegal', 'Mali', 'Burkina Faso'].map((country) => (
                <Card key={country} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <MapPin className="mx-auto mb-2 h-8 w-8 text-primary" />
                    <h3 className="font-semibold">{country}</h3>
                    <p className="text-sm text-muted-foreground">Discover</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Fan Leaderboard */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 flex items-center">
          <Users className="mr-2 h-6 w-6 text-primary" />
          Top Fans This Week
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { rank: 1, name: "MusicLover237", points: 15420, badge: "Gold Supporter" },
            { rank: 2, name: "AfroVibes", points: 12890, badge: "Diamond Fan" },
            { rank: 3, name: "CamerBeats", points: 11250, badge: "Platinum" },
            { rank: 4, name: "SoundExplorer", points: 9870, badge: "Gold Fan" },
            { rank: 5, name: "RhythmMaster", points: 8965, badge: "Silver Fan" },
          ].map((fan) => (
            <Card key={fan.rank} className={`${fan.rank <= 3 ? 'ring-2 ring-primary/20' : ''}`}>
              <CardContent className="p-4 flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                  fan.rank === 1 ? 'bg-yellow-500' :
                  fan.rank === 2 ? 'bg-gray-400' :
                  fan.rank === 3 ? 'bg-orange-600' : 'bg-primary'
                }`}>
                  #{fan.rank}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{fan.name}</h3>
                  <p className="text-sm text-muted-foreground">{fan.points.toLocaleString()} points</p>
                  <Badge variant="secondary" className="mt-1">{fan.badge}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Sticky Audio Player */}
      {currentlyPlaying && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={currentlyPlaying.music_releases?.cover_image_url || '/placeholder.svg'}
                  alt={currentlyPlaying.title}
                  className="w-12 h-12 rounded object-cover"
                />
                <div>
                  <h4 className="font-semibold text-sm">{currentlyPlaying.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {currentlyPlaying.artist_memberships?.stage_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="ghost">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Play className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-muted mt-16 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">CamerPlay</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The official music platform of CamerPulse. Stream, support, and discover African music.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Artists</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary">Register as Artist</a></li>
                <li><a href="#" className="hover:text-primary">Upload Music</a></li>
                <li><a href="#" className="hover:text-primary">Artist Dashboard</a></li>
                <li><a href="#" className="hover:text-primary">Brand Partnerships</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Fans</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary">Download App</a></li>
                <li><a href="#" className="hover:text-primary">Create Playlist</a></li>
                <li><a href="#" className="hover:text-primary">Fan Rewards</a></li>
                <li><a href="#" className="hover:text-primary">Vote for Artists</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary">Help Center</a></li>
                <li><a href="#" className="hover:text-primary">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 CamerPulse. All rights reserved. Made with ❤️ for African Music.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CamerPlayHome;