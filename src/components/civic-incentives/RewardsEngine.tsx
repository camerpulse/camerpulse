import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Award, Star, Trophy, Zap, Target } from 'lucide-react';
import { useCivicRewards, useUserCivicRewards } from '@/hooks/useCivicIncentives';
import { useAuth } from '@/contexts/AuthContext';

export const RewardsEngine: React.FC = () => {
  const { user } = useAuth();
  const { data: rewards } = useCivicRewards();
  const { data: userRewards } = useUserCivicRewards(user?.id);

  const categories = [
    { name: 'education', icon: Award, color: 'text-blue-600' },
    { name: 'civic_engagement', icon: Star, color: 'text-green-600' },
    { name: 'innovation', icon: Zap, color: 'text-purple-600' },
    { name: 'achievement', icon: Trophy, color: 'text-yellow-600' }
  ];

  const milestones = [
    { name: "First Quiz", requirement: "Complete 1 civic quiz", points: 10, achieved: true },
    { name: "Petition Supporter", requirement: "Support 5 petitions", points: 25, achieved: true },
    { name: "Community Builder", requirement: "Contribute to 3 projects", points: 50, achieved: false },
    { name: "Civic Champion", requirement: "Earn 1000 civic points", points: 200, achieved: false }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Civic Rewards & Badges</h2>
        <p className="text-muted-foreground">
          Earn badges and unlock features through civic participation
        </p>
      </div>

      {/* Your Badges */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Your Achievements
            </CardTitle>
            <CardDescription>
              Badges earned through civic engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {userRewards?.slice(0, 8).map((userReward) => (
                <div key={userReward.id} className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-medium text-sm">{userReward.civic_rewards?.reward_name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {userReward.civic_rewards?.points_value} points
                  </p>
                </div>
              )) || (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No badges earned yet. Start participating to earn your first badge!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Rewards by Category */}
      <div className="grid gap-6">
        {categories.map((category) => {
          const categoryRewards = rewards?.filter(r => r.category === category.name) || [];
          const Icon = category.icon;
          
          return (
            <Card key={category.name}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  <Icon className={`h-5 w-5 ${category.color}`} />
                  {category.name.replace('_', ' ')} Rewards
                </CardTitle>
                <CardDescription>
                  Earn badges for {category.name.replace('_', ' ')} activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryRewards.map((reward) => (
                    <div key={reward.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{reward.reward_name}</h4>
                        <Badge variant="secondary">{reward.points_value} pts</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {reward.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {reward.reward_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {reward.current_recipients} earned
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Milestone Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Milestone Progress
          </CardTitle>
          <CardDescription>
            Track your progress toward major achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{milestone.name}</h4>
                    <p className="text-sm text-muted-foreground">{milestone.requirement}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={milestone.achieved ? "default" : "outline"}>
                      {milestone.points} points
                    </Badge>
                    {milestone.achieved && (
                      <p className="text-xs text-green-600 mt-1">Completed!</p>
                    )}
                  </div>
                </div>
                <Progress value={milestone.achieved ? 100 : 65} className="w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Access */}
      <Card>
        <CardHeader>
          <CardTitle>Premium Features</CardTitle>
          <CardDescription>
            Unlock advanced features with civic rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Verified Badge</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Get a verified checkmark for 500+ civic points
              </p>
              <Button variant="outline" size="sm">Unlock</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Priority Support</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Access priority customer support for civic champions
              </p>
              <Button variant="outline" size="sm">Unlock</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};