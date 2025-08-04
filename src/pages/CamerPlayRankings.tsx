import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, Star, TrendingUp, Users, Music, Calendar,
  ArrowLeft, Award, Vote, Crown, Medal, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

const CamerPlayRankings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [timeFilter, setTimeFilter] = useState('week');
  const [regionFilter, setRegionFilter] = useState('all');

  // Mock data for rankings
  const rankings = {
    artists: [
      { id: 1, name: 'Stanley Enow', points: 2850, change: '+125', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', region: 'Southwest' },
      { id: 2, name: 'Charlotte Dipanda', points: 2720, change: '+89', avatar: 'https://images.unsplash.com/photo-1494790108755-2616c739256b?w=100', region: 'Centre' },
      { id: 3, name: 'Mr. Leo', points: 2650, change: '+67', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', region: 'Centre' },
      { id: 4, name: 'Daphne', points: 2580, change: '+45', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', region: 'Northwest' },
      { id: 5, name: 'Locko', points: 2520, change: '+23', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', region: 'Centre' },
    ],
    songs: [
      { id: 1, title: 'Mama Africa', artist: 'Stanley Enow', streams: 284000, change: '+15K' },
      { id: 2, title: 'Cameroon Pride', artist: 'Charlotte Dipanda', streams: 195000, change: '+12K' },
      { id: 3, title: 'African Queen', artist: 'Mr. Leo', streams: 172000, change: '+8K' },
      { id: 4, title: 'Sunshine Vibes', artist: 'Daphne', streams: 158000, change: '+6K' },
      { id: 5, title: 'Bamileke Power', artist: 'Locko', streams: 142000, change: '+4K' },
    ],
    events: [
      { id: 1, name: 'Douala Music Festival', tickets: 2500, date: '2024-02-15', location: 'Douala' },
      { id: 2, name: 'Yaoundé Concert Night', tickets: 1800, date: '2024-02-20', location: 'Yaoundé' },
      { id: 3, name: 'Bamenda Live Show', tickets: 1200, date: '2024-02-25', location: 'Bamenda' },
    ],
    regions: [
      { name: 'Centre', points: 12850, artists: 45 },
      { name: 'Southwest', points: 11200, artists: 32 },
      { name: 'Northwest', points: 9800, artists: 28 },
      { name: 'Littoral', points: 8500, artists: 35 },
      { name: 'West', points: 7200, artists: 22 },
    ]
  };

  const handleVote = (itemId, type) => {
    toast({
      title: "Vote Recorded",
      description: `Your vote for ${type} has been recorded!`,
    });
  };

  const getRankIcon = (position) => {
    switch (position) {
      case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Medal className="h-6 w-6 text-orange-600" />;
      default: return <Target className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getRankBadgeColor = (position) => {
    switch (position) {
      case 1: return 'bg-yellow-500 text-black';
      case 2: return 'bg-gray-400 text-white';
      case 3: return 'bg-orange-600 text-white';
      default: return 'bg-primary text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-accent to-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/camerplay')}
            className="text-white hover:bg-white/10 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to CamerPlay
          </Button>

          <div className="flex items-center gap-4 mb-6">
            <Trophy className="h-12 w-12" />
            <div>
              <h1 className="text-5xl font-black">Rankings</h1>
              <p className="text-xl opacity-90">CamerPlay Charts & Leaderboards</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={() => setTimeFilter('week')}
              className={timeFilter === 'week' ? 'bg-white text-black' : 'bg-white/20 text-white'}
            >
              This Week
            </Button>
            <Button 
              onClick={() => setTimeFilter('month')}
              className={timeFilter === 'month' ? 'bg-white text-black' : 'bg-white/20 text-white'}
            >
              This Month
            </Button>
            <Button 
              onClick={() => setTimeFilter('year')}
              className={timeFilter === 'year' ? 'bg-white text-black' : 'bg-white/20 text-white'}
            >
              This Year
            </Button>
          </div>
        </div>
      </div>

      {/* Rankings Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="artists" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="artists" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Top Artists
            </TabsTrigger>
            <TabsTrigger value="songs" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              Top Songs
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Hot Events
            </TabsTrigger>
            <TabsTrigger value="regions" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Regions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="artists" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Top 3 Podium */}
              <div className="lg:col-span-2">
                <h3 className="text-2xl font-bold mb-6">Artist Rankings</h3>
                <div className="space-y-4">
                  {rankings.artists.map((artist, index) => (
                    <Card key={artist.id} className={`hover:shadow-lg transition-all ${index < 3 ? 'border-2' : ''} ${
                      index === 0 ? 'border-yellow-500 bg-gradient-to-r from-yellow-50 to-transparent' :
                      index === 1 ? 'border-gray-400 bg-gradient-to-r from-gray-50 to-transparent' :
                      index === 2 ? 'border-orange-600 bg-gradient-to-r from-orange-50 to-transparent' : ''
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            <Badge className={`w-8 h-8 rounded-full flex items-center justify-center ${getRankBadgeColor(index + 1)}`}>
                              {index + 1}
                            </Badge>
                            {getRankIcon(index + 1)}
                          </div>
                          
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={artist.avatar} alt={artist.name} />
                            <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <h4 className="text-xl font-bold">{artist.name}</h4>
                            <p className="text-muted-foreground">{artist.region} Region</p>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="text-lg font-semibold text-primary">
                                {artist.points.toLocaleString()} pts
                              </div>
                              <Badge variant="secondary" className="text-green-600">
                                {artist.change}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => navigate(`/camerplay/artists/${artist.id}`)}>
                              View Profile
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleVote(artist.id, 'artist')}>
                              <Vote className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Stats Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Weekly Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Total Votes Cast</span>
                        <span>12.5K</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>New Artists</span>
                        <span>8</span>
                      </div>
                      <Progress value={40} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Active Regions</span>
                        <span>10/10</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Trending Up</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {rankings.artists.slice(0, 3).map((artist, index) => (
                      <div key={artist.id} className="flex items-center gap-3">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={artist.avatar} />
                          <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{artist.name}</div>
                          <div className="text-xs text-green-600">{artist.change}</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="songs" className="space-y-6">
            <h3 className="text-2xl font-bold">Top Songs</h3>
            <div className="space-y-4">
              {rankings.songs.map((song, index) => (
                <Card key={song.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Badge className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${getRankBadgeColor(index + 1)}`}>
                        {index + 1}
                      </Badge>
                      
                      <img 
                        src={`https://images.unsplash.com/photo-149322545712${index + 1}?w=80`}
                        className="w-16 h-16 object-cover rounded-lg"
                        alt={song.title}
                      />
                      
                      <div className="flex-1">
                        <h4 className="text-lg font-bold">{song.title}</h4>
                        <p className="text-muted-foreground">{song.artist}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="text-lg font-semibold text-primary">
                            {song.streams.toLocaleString()} streams
                          </div>
                          <Badge variant="secondary" className="text-green-600">
                            {song.change}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm">
                          Play
                        </Button>
                        <Button size="sm" variant="outline">
                          Buy
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleVote(song.id, 'song')}>
                          <Vote className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <h3 className="text-2xl font-bold">Hottest Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rankings.events.map((event, index) => (
                <Card key={event.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className={`${getRankBadgeColor(index + 1)}`}>
                        #{index + 1}
                      </Badge>
                      <div className="text-right">
                        <div className="font-bold text-lg">{event.tickets}</div>
                        <div className="text-sm text-muted-foreground">tickets sold</div>
                      </div>
                    </div>
                    
                    <h4 className="font-bold text-lg mb-2">{event.name}</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {event.location}
                      </div>
                    </div>
                    
                    <Button className="w-full mt-4">Get Tickets</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="regions" className="space-y-6">
            <h3 className="text-2xl font-bold">Regional Rankings</h3>
            <div className="space-y-4">
              {rankings.regions.map((region, index) => (
                <Card key={region.name} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Badge className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${getRankBadgeColor(index + 1)}`}>
                        {index + 1}
                      </Badge>
                      
                      <div className="flex-1">
                        <h4 className="text-xl font-bold">{region.name} Region</h4>
                        <p className="text-muted-foreground">{region.artists} active artists</p>
                        <div className="mt-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Regional Score</span>
                            <span className="font-semibold">{region.points.toLocaleString()} pts</span>
                          </div>
                          <Progress value={(region.points / 15000) * 100} className="h-2" />
                        </div>
                      </div>
                      
                      <Button variant="outline">
                        View Artists
                      </Button>
                    </div>
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

export default CamerPlayRankings;