
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Trophy, TrendingUp, Award, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTopVillages } from '@/hooks/useVillages';

export const VillageRankingPanel: React.FC = () => {
  const { data: topRated } = useTopVillages('', 5);
  const { data: mostDeveloped } = useTopVillages('developed', 5);
  const { data: bestEducation } = useTopVillages('education', 5);

  const getRankIcon = (position: number) => {
    if (position === 1) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (position === 2) return <Trophy className="h-4 w-4 text-gray-400" />;
    if (position === 3) return <Award className="h-4 w-4 text-amber-600" />;
    return <span className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-bold">{position}</span>;
  };

  const RankingList = ({ villages, scoreType }: { villages: any[], scoreType: string }) => (
    <div className="space-y-2">
      {villages?.slice(0, 5).map((village, index) => (
        <div key={village.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            {getRankIcon(index + 1)}
            <div>
              <h4 className="font-medium text-sm">{village.village_name}</h4>
              <p className="text-xs text-muted-foreground">{village.region}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-sm">
              {scoreType === 'overall' ? village.overall_rating?.toFixed(1) : 
               scoreType === 'infrastructure' ? `${village.infrastructure_score}/20` :
               `${village.education_score}/10`}
            </div>
            <div className="text-xs text-muted-foreground">
              {village.total_ratings_count} ratings
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Village Rankings
          </CardTitle>
          <Link to="/village-ratings-leaderboard">
            <Button variant="outline" size="sm">
              View All Rankings
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overall" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overall">Overall</TabsTrigger>
            <TabsTrigger value="development">Development</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
          </TabsList>

          <TabsContent value="overall">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-medium text-sm">Top Rated Villages</span>
              </div>
              <RankingList villages={topRated || []} scoreType="overall" />
            </div>
          </TabsContent>

          <TabsContent value="development">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-sm">Most Developed</span>
              </div>
              <RankingList villages={mostDeveloped || []} scoreType="infrastructure" />
            </div>
          </TabsContent>

          <TabsContent value="education">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-4 w-4 text-green-500" />
                <span className="font-medium text-sm">Education Leaders</span>
              </div>
              <RankingList villages={bestEducation || []} scoreType="education" />
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 p-3 bg-primary/10 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Weekly Update</p>
              <p className="text-xs text-muted-foreground">Rankings update every Sunday</p>
            </div>
            <Badge variant="default" className="bg-primary/20 text-primary">
              Live
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
