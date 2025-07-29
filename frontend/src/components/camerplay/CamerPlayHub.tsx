import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Music, Award, Calendar, Ticket, TrendingUp, Users, 
  Play, Search, Star, ShoppingCart, MapPin, Filter,
  ChevronRight, Trophy, Headphones, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CamerPlayHubProps {
  className?: string;
}

const CamerPlayHub: React.FC<CamerPlayHubProps> = ({ className }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [trendingData, setTrendingData] = useState({
    artists: [],
    songs: [],
    events: [],
    awards: []
  });
  const [stats, setStats] = useState({
    totalArtists: 0,
    totalStreams: 0,
    upcomingEvents: 0,
    activeAwards: 0
  });

  useEffect(() => {
    fetchCamerPlayData();
  }, []);

  const fetchCamerPlayData = async () => {
    try {
      // Fetch integrated data from all modules
      const [artistsRes, tracksRes, eventsRes] = await Promise.all([
        supabase.from('artist_memberships').select('*').limit(8),
        supabase.from('music_tracks').select(`
          *, 
          release:music_releases(
            title, cover_image_url, artist_id,
            artist:artist_memberships(stage_name, real_name)
          )
        `).limit(8),
        supabase.from('events').select('*').limit(6)
      ]);

      if (artistsRes.data) {
        setTrendingData(prev => ({ ...prev, artists: artistsRes.data }));
      }
      
      if (tracksRes.data) {
        setTrendingData(prev => ({ ...prev, songs: tracksRes.data }));
      }

      if (eventsRes.data) {
        setTrendingData(prev => ({ ...prev, events: eventsRes.data }));
      }

      // Calculate stats
      setStats({
        totalArtists: artistsRes.data?.length || 0,
        totalStreams: tracksRes.data?.reduce((sum, track) => sum + (track.play_count || 0), 0) || 0,
        upcomingEvents: eventsRes.data?.length || 0,
        activeAwards: 3 // Mock for now
      });

    } catch (error) {
      console.error('Error fetching CamerPlay data:', error);
    }
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/camerplay/search?q=${encodeURIComponent(query)}`);
    }
  };

  const QuickStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Card className="border-primary/20 hover:border-primary/40 transition-colors">
        <CardContent className="p-4 text-center">
          <Users className="h-8 w-8 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold">{stats.totalArtists}</div>
          <div className="text-sm text-muted-foreground">Artists</div>
        </CardContent>
      </Card>
      <Card className="border-accent/20 hover:border-accent/40 transition-colors">
        <CardContent className="p-4 text-center">
          <Headphones className="h-8 w-8 text-accent mx-auto mb-2" />
          <div className="text-2xl font-bold">{stats.totalStreams.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Total Streams</div>
        </CardContent>
      </Card>
      <Card className="border-secondary/20 hover:border-secondary/40 transition-colors">
        <CardContent className="p-4 text-center">
          <Calendar className="h-8 w-8 text-secondary mx-auto mb-2" />
          <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
          <div className="text-sm text-muted-foreground">Upcoming Events</div>
        </CardContent>
      </Card>
      <Card className="border-yellow-500/20 hover:border-yellow-500/40 transition-colors">
        <CardContent className="p-4 text-center">
          <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{stats.activeAwards}</div>
          <div className="text-sm text-muted-foreground">Active Awards</div>
        </CardContent>
      </Card>
    </div>
  );

  const FeaturedArtist = () => (
    <Card className="mb-8 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border-primary/20">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"
              alt="Artist of the Week"
              className="w-32 h-32 rounded-full object-cover border-4 border-primary"
            />
            <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-black">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2">Artist of the Week</h3>
            <p className="text-lg text-muted-foreground mb-4">Stanley Enow - Hip-Hop Pioneer</p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
              <Badge variant="secondary">850K Followers</Badge>
              <Badge variant="secondary">2.1M Streams</Badge>
              <Badge variant="secondary">Southwest Region</Badge>
            </div>
            <div className="flex gap-2 justify-center md:justify-start">
              <Button onClick={() => navigate('/camerplay/artists/stanley-enow')}>
                <Users className="h-4 w-4 mr-2" />
                View Profile
              </Button>
              <Button variant="outline" onClick={() => navigate('/camerplay/player')}>
                <Play className="h-4 w-4 mr-2" />
                Play Top Songs
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background via-background to-muted/20 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-accent to-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-black mb-4">
              <Music className="inline h-12 w-12 mr-4" />
              CamerPlay
            </h1>
            <p className="text-xl opacity-90">
              The Complete Cameroonian Entertainment Ecosystem
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search artists, songs, events, awards..."
              className="pl-12 pr-4 py-3 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/60"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
            />
            <Button 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white text-primary hover:bg-white/90"
              onClick={() => handleSearch(searchQuery)}
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <QuickStats />
        <FeaturedArtist />

        {/* Module Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="artists" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Artists
            </TabsTrigger>
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
            <TabsTrigger value="rankings" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Rankings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Trending Now */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trending Now
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-primary">🎵 Top Songs</h4>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                          {i}
                        </div>
                        <div>
                          <div className="font-medium">Song Title {i}</div>
                          <div className="text-sm text-muted-foreground">Artist Name</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-accent">🎤 Rising Artists</h4>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                        <img 
                          src={`https://images.unsplash.com/photo-150${i}003211169-0a1dd7228f2d?w=40`}
                          className="w-10 h-10 rounded-full object-cover"
                          alt="Artist"
                        />
                        <div>
                          <div className="font-medium">Artist {i}</div>
                          <div className="text-sm text-muted-foreground">+25% growth</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-secondary">🎟️ Hot Events</h4>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                        <Calendar className="w-10 h-10 p-2 bg-secondary text-white rounded-lg" />
                        <div>
                          <div className="font-medium">Event {i}</div>
                          <div className="text-sm text-muted-foreground">Dec 2{i}, 2024</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                className="h-20 flex flex-col gap-2" 
                onClick={() => navigate('/camerplay/upload')}
              >
                <Music className="h-6 w-6" />
                Upload Music
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => navigate('/camerplay/events/create')}
              >
                <Calendar className="h-6 w-6" />
                Create Event
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => navigate('/camerplay/awards')}
              >
                <Award className="h-6 w-6" />
                Submit for Awards
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => navigate('/camerplay/rankings')}
              >
                <TrendingUp className="h-6 w-6" />
                View Rankings
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="artists">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Artists grid will be populated from database */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <CardContent className="p-4">
                    <img 
                      src={`https://images.unsplash.com/photo-150${i}003211169-0a1dd7228f2d?w=200`}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                      alt="Artist"
                    />
                    <h3 className="font-semibold">Artist Name {i}</h3>
                    <p className="text-sm text-muted-foreground">Genre • Region</p>
                    <div className="flex justify-between items-center mt-3">
                      <Badge variant="secondary">Verified</Badge>
                      <Button size="sm" variant="outline">
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="music">
            <div className="space-y-6">
              {/* Music categories and player interface */}
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">Music Library</h3>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genres</SelectItem>
                      <SelectItem value="afrobeat">Afrobeat</SelectItem>
                      <SelectItem value="makossa">Makossa</SelectItem>
                      <SelectItem value="hip-hop">Hip-Hop</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => navigate('/camerplay/player')}>
                    <Play className="h-4 w-4 mr-2" />
                    Open Player
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={`https://images.unsplash.com/photo-149322545712${i}?w=80`}
                          className="w-16 h-16 object-cover rounded-lg"
                          alt="Album"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">Song Title {i}</h4>
                          <p className="text-sm text-muted-foreground">Artist Name</p>
                          <div className="flex gap-2 mt-2">
                            <Button size="sm">
                              <Play className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <ShoppingCart className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Heart className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="events">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">Upcoming Events</h3>
                <Button onClick={() => navigate('/camerplay/events/create')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-4">
                      <img 
                        src={`https://images.unsplash.com/photo-151${i}379938547-c1f69419868d?w=300`}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                        alt="Event"
                      />
                      <h4 className="font-semibold">Concert Event {i}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        Douala, Cameroon
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">Dec 2{i}, 2024</p>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <Ticket className="h-3 w-3 mr-1" />
                          Buy Tickets
                        </Button>
                        <Button size="sm" variant="outline">
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="awards">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">CamerPlay Awards</h3>
                <Button onClick={() => navigate('/camerplay/awards')}>
                  <Award className="h-4 w-4 mr-2" />
                  View All Awards
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['Best Male Artist', 'Best Female Artist', 'Best Song', 'Rising Star'].map((award, i) => (
                  <Card key={i} className="group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Trophy className="h-8 w-8 text-yellow-500" />
                        <div>
                          <h4 className="font-semibold">{award}</h4>
                          <p className="text-sm text-muted-foreground">2024 Category</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Voting Progress</span>
                          <span>67%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{width: '67%'}} />
                        </div>
                      </div>
                      <Button className="w-full mt-4" variant="outline">
                        View Nominees
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rankings">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">CamerPlay Rankings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top Artists</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          i === 1 ? 'bg-yellow-500' : i === 2 ? 'bg-gray-400' : i === 3 ? 'bg-orange-600' : 'bg-primary'
                        }`}>
                          {i}
                        </div>
                        <img 
                          src={`https://images.unsplash.com/photo-150${i}003211169-0a1dd7228f2d?w=40`}
                          className="w-8 h-8 rounded-full object-cover"
                          alt="Artist"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">Artist {i}</div>
                          <div className="text-xs text-muted-foreground">{(1000 - i * 50).toLocaleString()} pts</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top Songs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          i === 1 ? 'bg-yellow-500' : i === 2 ? 'bg-gray-400' : i === 3 ? 'bg-orange-600' : 'bg-accent'
                        }`}>
                          {i}
                        </div>
                        <img 
                          src={`https://images.unsplash.com/photo-149322545712${i}?w=40`}
                          className="w-8 h-8 rounded object-cover"
                          alt="Song"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">Song {i}</div>
                          <div className="text-xs text-muted-foreground">{(500 - i * 25).toLocaleString()} streams</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Hot Events</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          i === 1 ? 'bg-yellow-500' : i === 2 ? 'bg-gray-400' : i === 3 ? 'bg-orange-600' : 'bg-secondary'
                        }`}>
                          {i}
                        </div>
                        <Calendar className="w-8 h-8 p-1 bg-secondary text-white rounded" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">Event {i}</div>
                          <div className="text-xs text-muted-foreground">{(200 - i * 10)} tickets sold</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CamerPlayHub;