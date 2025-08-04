import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Music, Users, Calendar, Award, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

const CamerPlaySearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchResults, setSearchResults] = useState({
    artists: [],
    songs: [],
    events: [],
    awards: []
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      // Search artists
      const { data: artists } = await supabase
        .from('artist_memberships')
        .select('*')
        .or(`stage_name.ilike.%${searchQuery}%,real_name.ilike.%${searchQuery}%`)
        .limit(10);

      // Search music tracks
      const { data: songs } = await supabase
        .from('music_tracks')
        .select(`
          *,
          release:music_releases(
            title, cover_image_url,
            artist:artist_memberships(stage_name, real_name)
          )
        `)
        .ilike('title', `%${searchQuery}%`)
        .limit(10);

      // Search events
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .limit(10);

      setSearchResults({
        artists: artists || [],
        songs: songs || [],
        events: events || [],
        awards: [] // Mock for now
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalResults = searchResults.artists.length + searchResults.songs.length + 
                      searchResults.events.length + searchResults.awards.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-accent to-secondary text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/camerplay')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to CamerPlay
            </Button>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <Search className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Search Results</h1>
          </div>
          
          <p className="text-xl opacity-90">
            {loading ? 'Searching...' : `Found ${totalResults} results for "${query}"`}
          </p>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
            <TabsTrigger value="artists">Artists ({searchResults.artists.length})</TabsTrigger>
            <TabsTrigger value="songs">Songs ({searchResults.songs.length})</TabsTrigger>
            <TabsTrigger value="events">Events ({searchResults.events.length})</TabsTrigger>
            <TabsTrigger value="awards">Awards ({searchResults.awards.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            {/* Artists Section */}
            {searchResults.artists.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Artists
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {searchResults.artists.slice(0, 4).map((artist) => (
                    <Card key={artist.id} className="hover:shadow-lg transition-all cursor-pointer">
                      <CardContent className="p-4">
                        <img 
                          src={`https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150`}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                          alt={artist.stage_name}
                        />
                        <h4 className="font-semibold">{artist.stage_name}</h4>
                        <p className="text-sm text-muted-foreground">{artist.real_name}</p>
                        <Badge variant="secondary" className="mt-2">Verified</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Songs Section */}
            {searchResults.songs.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Music className="h-6 w-6" />
                  Songs
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.songs.slice(0, 4).map((song) => (
                    <Card key={song.id} className="hover:shadow-lg transition-all cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={song.release?.cover_image_url || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80`}
                            className="w-16 h-16 object-cover rounded-lg"
                            alt={song.title}
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold">{song.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {song.release?.artist?.stage_name || 'Unknown Artist'}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Button size="sm">Play</Button>
                              <Button size="sm" variant="outline">Buy</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Events Section */}
            {searchResults.events.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="h-6 w-6" />
                  Events
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.events.slice(0, 3).map((event) => (
                    <Card key={event.id} className="hover:shadow-lg transition-all cursor-pointer">
                      <CardContent className="p-4">
                        <img 
                          src={`https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300`}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                          alt={event.title}
                        />
                        <h4 className="font-semibold">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">{event.location}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.start_date).toLocaleDateString()}
                        </p>
                        <Button className="w-full mt-3">View Event</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Individual tab contents */}
          <TabsContent value="artists">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {searchResults.artists.map((artist) => (
                <Card key={artist.id} className="hover:shadow-lg transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <img 
                      src={`https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200`}
                      className="w-full h-40 object-cover rounded-lg mb-3"
                      alt={artist.stage_name}
                    />
                    <h4 className="font-semibold">{artist.stage_name}</h4>
                    <p className="text-sm text-muted-foreground">{artist.real_name}</p>
                    <Badge variant="secondary" className="mt-2">Verified</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="songs">
            <div className="space-y-4">
              {searchResults.songs.map((song) => (
                <Card key={song.id} className="hover:shadow-lg transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={song.release?.cover_image_url || `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80`}
                        className="w-20 h-20 object-cover rounded-lg"
                        alt={song.title}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{song.title}</h4>
                        <p className="text-muted-foreground">
                          {song.release?.artist?.stage_name || 'Unknown Artist'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {song.play_count || 0} plays
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button>Play</Button>
                        <Button variant="outline">Buy</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.events.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <img 
                      src={`https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300`}
                      className="w-full h-40 object-cover rounded-lg mb-3"
                      alt={event.title}
                    />
                    <h4 className="font-semibold">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.start_date).toLocaleDateString()}
                    </p>
                    <Button className="w-full mt-3">View Event</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="awards">
            <div className="text-center py-12">
              <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">Awards search coming soon</p>
            </div>
          </TabsContent>
        </Tabs>

        {!loading && totalResults === 0 && query && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Try searching with different keywords or check your spelling
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CamerPlaySearch;