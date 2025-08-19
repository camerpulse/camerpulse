import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Award, Crown, Users } from 'lucide-react';
import { useTopCivicPerformers } from '@/hooks/useCivicIncentives';

export const CivicLeaderboards: React.FC = () => {
  const { data: topPerformers } = useTopCivicPerformers();

  const leaderboardCategories = [
    { id: 'overall', label: 'Overall', icon: Crown },
    { id: 'youth', label: 'Youth (18-30)', icon: Trophy },
    { id: 'villages', label: 'Villages', icon: Users },
    { id: 'monthly', label: 'This Month', icon: Medal }
  ];

  const mockLeaderboards = {
    overall: topPerformers?.slice(0, 10) || [],
    youth: topPerformers?.slice(0, 8) || [],
    villages: [
      { name: "Bamenda Central", score: 2850, members: 45 },
      { name: "Douala Maritime", score: 2720, members: 38 },
      { name: "Yaounde Centre", score: 2650, members: 42 }
    ],
    monthly: topPerformers?.slice(0, 5) || []
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">{position}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Civic Leaderboards</h2>
        <p className="text-muted-foreground">
          See how you rank among Cameroon's civic champions
        </p>
      </div>

      <Tabs defaultValue="overall" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          {leaderboardCategories.map((category) => {
            const Icon = category.icon;
            return (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="overall">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Overall Civic Champions
              </CardTitle>
              <CardDescription>
                Top civic performers across all categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLeaderboards.overall.map((performer, index) => (
                  <div key={performer.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getRankIcon(index + 1)}
                      <div>
                        <h4 className="font-medium">User #{performer.user_id?.slice(-6)}</h4>
                        <p className="text-sm text-muted-foreground">
                          {performer.quiz_completions} quizzes • {performer.petitions_supported} petitions supported
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="default" className="text-lg px-3 py-1">
                        {performer.total_civic_score}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">Civic Score</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="youth">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-blue-500" />
                Youth Leaders (18-30)
              </CardTitle>
              <CardDescription>
                Young civic champions leading the change
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLeaderboards.youth.map((performer, index) => (
                  <div key={performer.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getRankIcon(index + 1)}
                      <div>
                        <h4 className="font-medium">Youth Champion #{index + 1}</h4>
                        <p className="text-sm text-muted-foreground">
                          {performer.badges_earned} badges • {performer.streak_days} day streak
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">{performer.total_civic_score}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="villages">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Top Civic Villages
              </CardTitle>
              <CardDescription>
                Villages with the highest collective civic engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLeaderboards.villages.map((village, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getRankIcon(index + 1)}
                      <div>
                        <h4 className="font-medium">{village.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {village.members} active members
                        </p>
                      </div>
                    </div>
                    <Badge variant="default">{village.score}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Medal className="h-5 w-5 text-purple-500" />
                This Month's Champions
              </CardTitle>
              <CardDescription>
                Top performers for the current month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLeaderboards.monthly.map((performer, index) => (
                  <div key={performer.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getRankIcon(index + 1)}
                      <div>
                        <h4 className="font-medium">Monthly Star #{index + 1}</h4>
                        <p className="text-sm text-muted-foreground">
                          {performer.monthly_score} points this month
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">{performer.monthly_score}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Your Ranking */}
      <Card>
        <CardHeader>
          <CardTitle>Your Current Ranking</CardTitle>
          <CardDescription>
            See where you stand among civic champions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">42</div>
              <div className="text-sm text-muted-foreground">Overall Rank</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">18</div>
              <div className="text-sm text-muted-foreground">In Your Region</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-sm text-muted-foreground">In Age Group</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">3</div>
              <div className="text-sm text-muted-foreground">This Month</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Button>View Detailed Stats</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};