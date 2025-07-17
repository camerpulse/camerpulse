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
  const [trendingSongs, setTrendingSongs] = useState([
    {
      id: 1,
      title: "Mama Africa",
      artist: "Davido x Burna Boy",
      streams: 2840000,
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
      genre: "Afrobeat",
      duration: "3:45"
    },
    {
      id: 2,
      title: "Cameroon Pride",
      artist: "Stanley Enow",
      streams: 1950000,
      image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400",
      genre: "Hip-Hop",
      duration: "4:12"
    },
    {
      id: 3,
      title: "African Queen Remix",
      artist: "Charlotte Dipanda",
      streams: 1720000,
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400",
      genre: "Makossa",
      duration: "3:28"
    },
    {
      id: 4,
      title: "Sunshine Vibes",
      artist: "Mr. Leo",
      streams: 1580000,
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
      genre: "Afrobeat",
      duration: "3:52"
    },
    {
      id: 5,
      title: "Bamileke Power",
      artist: "Locko",
      streams: 1420000,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
      genre: "Bikutsi",
      duration: "4:05"
    },
    {
      id: 6,
      title: "Paris-Douala",
      artist: "Franko",
      streams: 1350000,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
      genre: "Afro-Pop",
      duration: "3:18"
    },
    {
      id: 7,
      title: "Empire State",
      artist: "Ko-C",
      streams: 1280000,
      image: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=400",
      genre: "Rap",
      duration: "3:41"
    },
    {
      id: 8,
      title: "Mon Cœur",
      artist: "Daphne",
      streams: 1150000,
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400",
      genre: "R&B",
      duration: "4:22"
    }
  ]);
  
  const [featuredArtists, setFeaturedArtists] = useState([
    {
      id: 1,
      stage_name: "Stanley Enow",
      real_name: "Stanley Ebai Enow",
      genre: "Hip-Hop/Rap",
      region: "Southwest",
      fanRank: 1,
      verified: true,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
      followers: 850000
    },
    {
      id: 2,
      stage_name: "Charlotte Dipanda",
      real_name: "Charlotte Dipanda Ebele",
      genre: "Makossa/World",
      region: "Centre",
      fanRank: 2,
      verified: true,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616c739256b?w=300",
      followers: 720000
    },
    {
      id: 3,
      stage_name: "Mr. Leo",
      real_name: "Léonard Likonza",
      genre: "Afrobeat",
      region: "Centre",
      fanRank: 3,
      verified: true,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300",
      followers: 680000
    },
    {
      id: 4,
      stage_name: "Daphne",
      real_name: "Daphné Njie Efundem",
      genre: "Afro-Pop/R&B",
      region: "Northwest",
      fanRank: 4,
      verified: true,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300",
      followers: 620000
    },
    {
      id: 5,
      stage_name: "Locko",
      real_name: "Charles Arthur Locko",
      genre: "Afrobeat/R&B",
      region: "Centre",
      fanRank: 5,
      verified: true,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
      followers: 580000
    },
    {
      id: 6,
      stage_name: "Ko-C",
      real_name: "Njoya Conrad",
      genre: "Rap/Hip-Hop",
      region: "West",
      fanRank: 6,
      verified: true,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
      followers: 540000
    },
    {
      id: 7,
      stage_name: "Salatiel",
      real_name: "Salatiel Livenja",
      genre: "Afrobeat/Pop",
      region: "Centre",
      fanRank: 7,
      verified: true,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300",
      followers: 490000
    },
    {
      id: 8,
      stage_name: "Blanche Bailly",
      real_name: "Bailly Blanche",
      genre: "Afro-Pop",
      region: "Littoral",
      fanRank: 8,
      verified: true,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616c739256b?w=300",
      followers: 450000
    }
  ]);
  
  const [newAlbums, setNewAlbums] = useState([
    {
      id: 1,
      title: "Soldier Like My Papa",
      artist: "Stanley Enow",
      price: 5000,
      releaseDate: "2024-01-15",
      tracks: 12,
      cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
      genre: "Hip-Hop"
    },
    {
      id: 2,
      title: "Afrikan Roots",
      artist: "Charlotte Dipanda",
      price: 4500,
      releaseDate: "2024-01-10",
      tracks: 10,
      cover: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400",
      genre: "World Music"
    },
    {
      id: 3,
      title: "Love & Light",
      artist: "Mr. Leo",
      price: 4000,
      releaseDate: "2024-01-08",
      tracks: 14,
      cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400",
      genre: "Afrobeat"
    },
    {
      id: 4,
      title: "Elevation",
      artist: "Daphne",
      price: 3500,
      releaseDate: "2024-01-05",
      tracks: 11,
      cover: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
      genre: "R&B"
    },
    {
      id: 5,
      title: "West Side Stories",
      artist: "Ko-C",
      price: 4200,
      releaseDate: "2024-01-03",
      tracks: 15,
      cover: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
      genre: "Rap"
    },
    {
      id: 6,
      title: "Bamileke Vibes",
      artist: "Locko",
      price: 3800,
      releaseDate: "2024-01-01",
      tracks: 9,
      cover: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=400",
      genre: "Afro-Pop"
    },
    {
      id: 7,
      title: "Douala Nights",
      artist: "Salatiel",
      price: 4100,
      releaseDate: "2023-12-28",
      tracks: 13,
      cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
      genre: "Afrobeat"
    },
    {
      id: 8,
      title: "Golden Voice",
      artist: "Blanche Bailly",
      price: 3600,
      releaseDate: "2023-12-25",
      tracks: 8,
      cover: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400",
      genre: "Pop"
    }
  ]);
  
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [filterGenre, setFilterGenre] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterTime, setFilterTime] = useState('week');

  // Mock data is already set in state, so no need for useEffect or fetch functions

  const handlePlaySong = (song) => {
    setCurrentlyPlaying(song);
    toast({
      title: "🎵 Now Playing",
      description: `${song.title} by ${song.artist}`,
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
      <section className="relative h-[70vh] bg-gradient-to-r from-primary via-accent to-secondary flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30" />
        <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent leading-tight">
              Stream & Support the 
              <span className="block text-6xl md:text-8xl bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Sound of Africa
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto font-medium">
              🎵 Discover New Artists • 🛒 Buy • 🗳️ Vote • 🔄 Repeat
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-black font-bold text-lg px-8 py-4 hover:scale-110 transform transition-all duration-300 shadow-2xl">
                <Music className="mr-3 h-6 w-6" />
                🎧 Explore Music
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-black font-bold text-lg px-8 py-4 hover:scale-110 transform transition-all duration-300 shadow-2xl">
                <TrendingUp className="mr-3 h-6 w-6" />
                🔥 Top Charts
              </Button>
              <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg px-8 py-4 hover:scale-110 transform transition-all duration-300 shadow-2xl">
                <ShoppingCart className="mr-3 h-6 w-6" />
                🛒 Buy Albums
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
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

        <div className="flex overflow-x-auto space-x-6 pb-6 snap-x snap-mandatory">
          {trendingSongs.map((song, index) => (
            <Card key={song.id} className="min-w-80 flex-shrink-0 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 snap-start group bg-gradient-to-br from-card to-muted/20 border-2 hover:border-primary/50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white z-10 ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-600' : 'bg-primary'
                    }`}>
                      #{index + 1}
                    </div>
                    <img
                      src={song.image}
                      alt={song.title}
                      className="w-20 h-20 rounded-xl object-cover shadow-lg group-hover:scale-110 transition-transform duration-300"
                    />
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full p-0 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:scale-110 transition-all duration-300"
                      onClick={() => handlePlaySong(song)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate mb-1">{song.title}</h3>
                    <p className="text-sm text-muted-foreground truncate mb-2 font-medium">
                      {song.artist}
                    </p>
                    <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        🎵 {song.streams?.toLocaleString()} streams
                      </span>
                      <Badge variant="secondary" className="text-xs">{song.genre}</Badge>
                      <span>{song.duration}</span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="p-2 hover:scale-110 transition-transform"
                      onClick={() => handleAddToCart(song)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="p-2 hover:scale-110 transition-transform"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredArtists.map((artist, index) => (
            <Card key={artist.id} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 bg-gradient-to-br from-card to-muted/30 border-2 hover:border-accent overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={artist.avatar}
                    alt={artist.stage_name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    {artist.verified && (
                      <Badge className="bg-blue-500 text-white text-xs">
                        ✓ Verified
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-3 left-3">
                    <Badge className={`text-white text-xs ${
                      index < 3 ? 'bg-yellow-500' : 'bg-primary'
                    }`}>
                      #{artist.fanRank} Fan Favorite
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                    {artist.stage_name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1">{artist.real_name}</p>
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <Badge variant="secondary" className="text-xs">{artist.genre}</Badge>
                    <Badge variant="outline" className="text-xs">📍 {artist.region}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    👥 {artist.followers?.toLocaleString()} followers
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full hover:scale-105 transition-transform">
                      👤 View Profile
                    </Button>
                    <Button size="sm" className="w-full bg-gradient-to-r from-primary to-accent hover:scale-105 transition-transform">
                      🛒 Visit Store
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full hover:scale-105 transition-transform">
                      💼 Brand Ambassador
                    </Button>
                  </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {newAlbums.map((album, index) => (
            <Card key={album.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-card to-muted/20 border-2 hover:border-primary/50">
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={album.cover}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-red-500 text-white text-xs animate-pulse">
                    🔥 NEW DROP
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="text-xs">
                    {album.tracks} tracks
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex space-x-3">
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 transform hover:scale-110 transition-all">
                      <Play className="mr-1 h-4 w-4" />
                      🎵 Play
                    </Button>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600 transform hover:scale-110 transition-all">
                      <ShoppingCart className="mr-1 h-4 w-4" />
                      💳 Buy
                    </Button>
                  </div>
                </div>
              </div>
              <CardContent className="p-5">
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                  {album.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 font-medium">
                  🎤 {album.artist}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="text-xs">{album.genre}</Badge>
                  <span className="text-xs text-muted-foreground">
                    📅 {new Date(album.releaseDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-primary">
                    💰 {album.price.toLocaleString()} FCFA
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <Star className="h-4 w-4 fill-gray-300 text-gray-300" />
                  </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { rank: 1, name: "🎵 MusicLover237", points: 15420, badge: "💎 Diamond Supporter", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", activity: "Streamed 847 songs this week" },
            { rank: 2, name: "🔥 AfroVibes", points: 12890, badge: "🏆 Platinum Fan", avatar: "https://images.unsplash.com/photo-1494790108755-2616c739256b?w=100", activity: "Tipped 15 artists" },
            { rank: 3, name: "🎤 CamerBeats", points: 11250, badge: "⭐ Gold Fan", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100", activity: "Voted on 32 tracks" },
            { rank: 4, name: "🎧 SoundExplorer", points: 9870, badge: "🎯 Top Discoverer", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100", activity: "Discovered 23 new artists" },
            { rank: 5, name: "🌟 RhythmMaster", points: 8965, badge: "🎼 Music Guru", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100", activity: "Created 12 playlists" },
            { rank: 6, name: "🎶 BeatLover", points: 7845, badge: "🎵 Melody Hunter", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", activity: "Shared 45 tracks" },
            { rank: 7, name: "🔊 BassDrop", points: 7240, badge: "🎸 Rock Supporter", avatar: "https://images.unsplash.com/photo-1494790108755-2616c739256b?w=100", activity: "Attended 8 virtual concerts" },
            { rank: 8, name: "🎺 JazzFan237", points: 6890, badge: "🎷 Jazz Enthusiast", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100", activity: "Reviewed 67 albums" },
            { rank: 9, name: "🪘 AfricanSoul", points: 6125, badge: "🌍 Cultural Ambassador", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100", activity: "Promoted 19 regional artists" }
          ].map((fan) => (
            <Card key={fan.rank} className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
              fan.rank <= 3 ? 'ring-2 ring-gradient-to-r from-yellow-400 to-orange-500 bg-gradient-to-br from-yellow-50 to-orange-50' : 'hover:ring-2 hover:ring-primary/30'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={fan.avatar}
                      alt={fan.name}
                      className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-110 transition-transform"
                    />
                    <div className={`absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                      fan.rank === 1 ? 'bg-yellow-500 animate-pulse' :
                      fan.rank === 2 ? 'bg-gray-400' :
                      fan.rank === 3 ? 'bg-orange-600' : 'bg-primary'
                    }`}>
                      #{fan.rank}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                      {fan.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      🏆 {fan.points.toLocaleString()} points
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {fan.activity}
                    </p>
                    <Badge variant="secondary" className="text-xs bg-gradient-to-r from-primary/20 to-accent/20">
                      {fan.badge}
                    </Badge>
                  </div>
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