import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown, 
  Star,
  Users,
  TrendingUp,
  Target,
  Heart,
  Zap,
  Calendar
} from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar?: string;
  score: number;
  change: number;
  badges: string[];
  category?: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedBy: number;
  totalMembers: number;
}

export const VillageLeaderboards: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('overall');

  // Demo leaderboard data
  const leaderboards: Record<string, LeaderboardEntry[]> = {
    overall: [
      { rank: 1, name: 'Chief Mballa', score: 2850, change: 12, badges: ['Leader', 'Visionary', 'Community Builder'] },
      { rank: 2, name: 'Marie Nkomo', score: 2340, change: 8, badges: ['Educator', 'Mentor', 'Organizer'] },
      { rank: 3, name: 'Dr. Paul Essomba', score: 2180, change: 15, badges: ['Healer', 'Innovator', 'Dedicated'] },
      { rank: 4, name: 'Grace Fotso', score: 1890, change: -3, badges: ['Teacher', 'Patient', 'Inspiring'] },
      { rank: 5, name: 'Engineer Kamga', score: 1765, change: 22, badges: ['Builder', 'Problem Solver', 'Technical'] },
      { rank: 6, name: 'Mama Ashu', score: 1650, change: 5, badges: ['Elder', 'Wise', 'Peacemaker'] },
      { rank: 7, name: 'Samuel Biya', score: 1540, change: -1, badges: ['Young Leader', 'Energetic'] },
      { rank: 8, name: 'Sister Catherine', score: 1420, change: 11, badges: ['Caregiver', 'Compassionate'] },
      { rank: 9, name: 'Farmer John', score: 1380, change: 7, badges: ['Provider', 'Hardworking'] },
      { rank: 10, name: 'Teacher Agnes', score: 1290, change: 4, badges: ['Educator', 'Patient'] }
    ],
    development: [
      { rank: 1, name: 'Engineer Kamga', score: 95, change: 8, badges: ['Master Builder'], category: 'Infrastructure' },
      { rank: 2, name: 'Chief Mballa', score: 88, change: 3, badges: ['Project Leader'], category: 'Planning' },
      { rank: 3, name: 'Marie Nkomo', score: 82, change: 12, badges: ['Community Organizer'], category: 'Social Development' }
    ],
    engagement: [
      { rank: 1, name: 'Grace Fotso', score: 156, change: 24, badges: ['Super Active'], category: 'Participation' },
      { rank: 2, name: 'Samuel Biya', score: 142, change: 18, badges: ['Youth Ambassador'], category: 'Youth Engagement' },
      { rank: 3, name: 'Mama Ashu', score: 128, change: 6, badges: ['Wisdom Keeper'], category: 'Elder Engagement' }
    ],
    contribution: [
      { rank: 1, name: 'Dr. Paul Essomba', score: 78, change: 5, badges: ['Health Champion'], category: 'Healthcare' },
      { rank: 2, name: 'Chief Mballa', score: 72, change: 2, badges: ['Resource Provider'], category: 'Leadership' },
      { rank: 3, name: 'Sister Catherine', score: 68, change: 9, badges: ['Care Giver'], category: 'Social Support' }
    ]
  };

  const achievements: Achievement[] = [
    {
      id: '1',
      name: 'Village Champion',
      description: 'Top contributor for 3 consecutive months',
      icon: <Crown className="h-6 w-6" />,
      rarity: 'legendary',
      unlockedBy: 3,
      totalMembers: 2847
    },
    {
      id: '2',
      name: 'Community Builder',
      description: 'Organized 10+ community events',
      icon: <Users className="h-6 w-6" />,
      rarity: 'epic',
      unlockedBy: 12,
      totalMembers: 2847
    },
    {
      id: '3',
      name: 'Problem Solver',
      description: 'Resolved 5+ community issues',
      icon: <Target className="h-6 w-6" />,
      rarity: 'rare',
      unlockedBy: 28,
      totalMembers: 2847
    },
    {
      id: '4',
      name: 'Helping Hand',
      description: 'Volunteered 50+ hours',
      icon: <Heart className="h-6 w-6" />,
      rarity: 'common',
      unlockedBy: 156,
      totalMembers: 2847
    },
    {
      id: '5',
      name: 'Innovation Leader',
      description: 'Introduced new technology or method',
      icon: <Zap className="h-6 w-6" />,
      rarity: 'epic',
      unlockedBy: 8,
      totalMembers: 2847
    },
    {
      id: '6',
      name: 'Mentor',
      description: 'Guided 10+ community members',
      icon: <Star className="h-6 w-6" />,
      rarity: 'rare',
      unlockedBy: 34,
      totalMembers: 2847
    }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'epic': return 'bg-gradient-to-r from-purple-400 to-pink-500';
      case 'rare': return 'bg-gradient-to-r from-blue-400 to-blue-600';
      case 'common': return 'bg-gradient-to-r from-gray-400 to-gray-600';
      default: return 'bg-gray-500';
    }
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (change < 0) return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
    return <span className="text-xs text-muted-foreground">—</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center mb-2">
          <Trophy className="h-6 w-6 mr-2 text-primary" />
          Village Leaderboards
        </h2>
        <p className="text-muted-foreground">Recognize and celebrate community contributions</p>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overall">Overall</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="contribution">Contribution</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {Object.entries(leaderboards).map(([category, entries]) => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top 3 Podium */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Trophy className="h-5 w-5 mr-2" />
                      Top Contributors - {category.charAt(0).toUpperCase() + category.slice(1)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Podium for Top 3 */}
                    <div className="flex justify-center items-end space-x-4 mb-6">
                      {entries.slice(0, 3).map((entry, index) => {
                        const heights = ['h-24', 'h-32', 'h-20'];
                        const positions = [1, 0, 2]; // 2nd, 1st, 3rd
                        const actualIndex = positions[index];
                        const actualEntry = entries[actualIndex];
                        
                        return (
                          <div key={actualEntry.rank} className="flex flex-col items-center">
                            <Avatar className="h-12 w-12 mb-2">
                              <AvatarImage src={actualEntry.avatar} />
                              <AvatarFallback>
                                {actualEntry.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`${heights[index]} w-20 bg-gradient-to-t from-primary/20 to-primary/40 rounded-t-lg flex flex-col justify-end items-center p-2`}>
                              {getRankIcon(actualEntry.rank)}
                              <div className="text-center mt-1">
                                <p className="text-xs font-medium truncate w-full">{actualEntry.name}</p>
                                <p className="text-xs text-muted-foreground">{actualEntry.score}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Full Leaderboard */}
                    <div className="space-y-2">
                      {entries.map((entry) => (
                        <div key={entry.rank} className={`flex items-center justify-between p-3 rounded-lg border ${
                          entry.rank <= 3 ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 flex justify-center">
                              {getRankIcon(entry.rank)}
                            </div>
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={entry.avatar} />
                              <AvatarFallback className="text-xs">
                                {entry.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{entry.name}</p>
                              {entry.category && (
                                <p className="text-xs text-muted-foreground">{entry.category}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="font-bold">{entry.score}</p>
                              <div className="flex items-center space-x-1">
                                {getTrendIcon(entry.change)}
                                <span className={`text-xs ${
                                  entry.change > 0 ? 'text-green-600' : 
                                  entry.change < 0 ? 'text-red-600' : 'text-muted-foreground'
                                }`}>
                                  {entry.change !== 0 && Math.abs(entry.change)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Badges & Stats */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Top Performer Badges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {entries.slice(0, 3).map((entry) => (
                        <div key={entry.rank} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            {getRankIcon(entry.rank)}
                            <span className="text-sm font-medium truncate">{entry.name}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {entry.badges.map((badge, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Participants</span>
                      <span className="text-sm font-medium">{entries.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Average Score</span>
                      <span className="text-sm font-medium">
                        {Math.round(entries.reduce((acc, e) => acc + e.score, 0) / entries.length)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Top Score</span>
                      <span className="text-sm font-medium">{entries[0]?.score}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Most Improved</span>
                      <span className="text-sm font-medium text-green-600">
                        +{Math.max(...entries.map(e => e.change))}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        ))}

        <TabsContent value="achievements">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 ${getRarityColor(achievement.rarity)}`}></div>
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getRarityColor(achievement.rarity)} text-white`}>
                      {achievement.icon}
                    </div>
                    <div>
                      <CardTitle className="text-sm">{achievement.name}</CardTitle>
                      <Badge variant="outline" className="capitalize text-xs">
                        {achievement.rarity}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Unlocked by</span>
                      <span className="font-medium">
                        {achievement.unlockedBy} / {achievement.totalMembers}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${getRarityColor(achievement.rarity)}`}
                        style={{ width: `${(achievement.unlockedBy / achievement.totalMembers) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {((achievement.unlockedBy / achievement.totalMembers) * 100).toFixed(1)}% completion rate
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};