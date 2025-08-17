import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music, Users, Play, Download, Star, MapPin, Calendar, Search, Filter, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface ArtistProfile {
  id: string;
  user_id: string;
  stage_name: string;
  real_name?: string;
  slug: string;
  genre: string[];
  bio?: string;
  profile_image_url?: string;
  banner_image_url?: string;
  country: string;
  city?: string;
  social_links: any;
  verification_status: string;
  is_featured: boolean;
  total_streams: number;
  total_downloads: number;
  monthly_listeners: number;
  created_at: string;
}

interface MusicRelease {
  id: string;
  artist_id: string;
  title: string;
  slug: string;
  release_type: string;
  cover_art_url?: string;
  release_date: string;
  description?: string;
  total_tracks: number;
  genre: string[];
  language: string;
  status: string;
  artist_profiles: ArtistProfile;
}

export default function ArtistEcosystem() {
  const [artists, setArtists] = useState<ArtistProfile[]>([]);
  const [releases, setReleases] = useState<MusicRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('artists');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch artists
      const { data: artistsData, error: artistsError } = await supabase
        .from('artist_profiles')
        .select('*')
        .order('total_streams', { ascending: false });

      if (artistsError) throw artistsError;

      // Fetch releases with artist info
      const { data: releasesData, error: releasesError } = await supabase
        .from('music_releases')
        .select(`
          *,
          artist_profiles!inner(*)
        `)
        .eq('status', 'published')
        .order('release_date', { ascending: false });

      if (releasesError) throw releasesError;

      setArtists(artistsData || []);
      setReleases(releasesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load artist data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const allGenres = [...new Set([
    ...artists.flatMap(a => a.genre || []),
    ...releases.flatMap(r => r.genre || [])
  ])];

  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.stage_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.real_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = genreFilter === 'all' || artist.genre?.includes(genreFilter);
    return matchesSearch && matchesGenre;
  });

  const filteredReleases = releases.filter(release => {
    const matchesSearch = release.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         release.artist_profiles.stage_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = genreFilter === 'all' || release.genre?.includes(genreFilter);
    return matchesSearch && matchesGenre;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Music className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading artist ecosystem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Music className="h-8 w-8 text-purple-600 mr-3" />
            <h1 className="text-3xl font-bold">Cameroon Artist Ecosystem</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Discover and support local artists, explore their music, and connect with Cameroon's vibrant music scene
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Artists</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{artists.length}</div>
              <p className="text-xs text-muted-foreground">
                +{Math.floor(artists.length * 0.1)} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Music Releases</CardTitle>
              <Music className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{releases.length}</div>
              <p className="text-xs text-muted-foreground">
                Published tracks and albums
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Streams</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(artists.reduce((sum, a) => sum + a.total_streams, 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all artists
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(artists.reduce((sum, a) => sum + a.total_downloads, 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                Total downloads
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search artists or music..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={genreFilter} onValueChange={setGenreFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {allGenres.map(genre => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="artists">Artists</TabsTrigger>
            <TabsTrigger value="releases">Latest Releases</TabsTrigger>
          </TabsList>

          <TabsContent value="artists" className="space-y-6">
            {filteredArtists.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Artists Found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || genreFilter !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'No artists registered yet'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArtists.map((artist) => (
                  <Card key={artist.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={artist.profile_image_url} alt={artist.stage_name} />
                          <AvatarFallback>{artist.stage_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{artist.stage_name}</h3>
                          {artist.real_name && (
                            <p className="text-sm text-muted-foreground">{artist.real_name}</p>
                          )}
                          <div className="flex items-center mt-1">
                            {artist.city && (
                              <Badge variant="outline" className="flex items-center mr-2">
                                <MapPin className="h-3 w-3 mr-1" />
                                {artist.city}
                              </Badge>
                            )}
                            {artist.verification_status === 'verified' && (
                              <Badge className="bg-blue-100 text-blue-800">
                                <Star className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {artist.genre && artist.genre.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {artist.genre.slice(0, 3).map((genre) => (
                            <Badge key={genre} variant="secondary" className="text-xs">
                              {genre}
                            </Badge>
                          ))}
                          {artist.genre.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{artist.genre.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-4 text-center mb-4">
                        <div>
                          <div className="font-semibold text-sm">{formatNumber(artist.total_streams)}</div>
                          <div className="text-xs text-muted-foreground">Streams</div>
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{formatNumber(artist.total_downloads)}</div>
                          <div className="text-xs text-muted-foreground">Downloads</div>
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{formatNumber(artist.monthly_listeners)}</div>
                          <div className="text-xs text-muted-foreground">Monthly</div>
                        </div>
                      </div>

                      {artist.bio && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {artist.bio}
                        </p>
                      )}

                      <Button variant="outline" className="w-full" asChild>
                        <Link to={`/artist/${artist.slug}`}>
                          View Profile
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="releases" className="space-y-6">
            {filteredReleases.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Releases Found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || genreFilter !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'No music releases available yet'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReleases.map((release) => (
                  <Card key={release.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      {release.cover_art_url && (
                        <div className="aspect-square bg-gradient-to-br from-purple-400 to-purple-600 rounded-t-lg"></div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="capitalize">
                            {release.release_type}
                          </Badge>
                          <Badge variant="secondary" className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(release.release_date).getFullYear()}
                          </Badge>
                        </div>
                        
                        <h3 className="font-bold text-lg mb-2">{release.title}</h3>
                        
                        <div className="flex items-center space-x-2 mb-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={release.artist_profiles.profile_image_url} />
                            <AvatarFallback>
                              {release.artist_profiles.stage_name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {release.artist_profiles.stage_name}
                          </span>
                        </div>

                        {release.genre && release.genre.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {release.genre.slice(0, 2).map((genre) => (
                              <Badge key={genre} variant="secondary" className="text-xs">
                                {genre}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                          <span>{release.total_tracks} track{release.total_tracks !== 1 ? 's' : ''}</span>
                          <span>{release.language.toUpperCase()}</span>
                        </div>

                        {release.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {release.description}
                          </p>
                        )}

                        <div className="flex space-x-2">
                          <Button size="sm" className="flex-1">
                            <Play className="h-4 w-4 mr-1" />
                            Play
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <Card className="mt-12">
          <CardContent className="text-center py-12">
            <Music className="h-16 w-16 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Join the Ecosystem</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Are you an artist? Join our platform to showcase your music, connect with fans, 
              and grow your career in Cameroon's music industry.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/auth">Register as Artist</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/music">Explore Music</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}