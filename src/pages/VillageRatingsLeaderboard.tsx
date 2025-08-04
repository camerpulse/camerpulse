import React, { useState } from 'react';
import { Crown, Star, TrendingUp, Users, MapPin, Award, Medal, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { useTopVillages } from '@/hooks/useVillages';

const VillageRatingsLeaderboard = () => {
  const { data: topRatedVillages } = useTopVillages('', 20);
  const { data: mostDeveloped } = useTopVillages('developed', 20);
  const { data: bestEducation } = useTopVillages('education', 20);
  const { data: bestDiaspora } = useTopVillages('diaspora', 20);

  const getRankIcon = (position: number) => {
    if (position === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (position === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (position === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{position}</span>;
  };

  const LeaderboardCard = ({ village, position, scoreType }: { village: any; position: number; scoreType: string }) => {
    const getScore = () => {
      switch (scoreType) {
        case 'overall': return village.overall_rating?.toFixed(1);
        case 'infrastructure': return `${village.infrastructure_score}/20`;
        case 'education': return `${village.education_score}/10`;
        case 'diaspora': return `${village.diaspora_engagement_score}/10`;
        default: return village.overall_rating?.toFixed(1);
      }
    };

    return (
      <Card className="hover:shadow-lg transition-all duration-300 group">
        <Link to={`/village/${village.slug || village.id}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                {getRankIcon(position)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {village.village_name}
                  </h3>
                  {village.is_verified && (
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                      <Crown className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {village.subdivision}, {village.division}, {village.region}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                    <span>{getScore()}</span>
                  </div>
                  <span className="text-muted-foreground">{village.total_ratings_count} ratings</span>
                  <span className="text-muted-foreground">{village.sons_daughters_count} community</span>
                </div>
              </div>
              <div className={`text-right ${position <= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className="text-2xl font-bold">
                  {getScore()}
                </div>
                <div className="text-xs">Score</div>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-8 w-8" />
            <h1 className="text-4xl font-bold">Village Ratings Leaderboard</h1>
          </div>
          <p className="text-primary-foreground/80 text-lg">
            Discover the highest-rated villages across different categories
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overall" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overall">Overall Rating</TabsTrigger>
            <TabsTrigger value="infrastructure">Development</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="diaspora">Diaspora Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="overall" className="space-y-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Top Rated Villages</h2>
              <p className="text-muted-foreground">Villages with the highest overall ratings from community members</p>
            </div>
            {topRatedVillages?.map((village, index) => (
              <LeaderboardCard 
                key={village.id} 
                village={village} 
                position={index + 1} 
                scoreType="overall" 
              />
            ))}
          </TabsContent>

          <TabsContent value="infrastructure" className="space-y-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Most Developed Villages</h2>
              <p className="text-muted-foreground">Villages with the best infrastructure and development scores</p>
            </div>
            {mostDeveloped?.map((village, index) => (
              <LeaderboardCard 
                key={village.id} 
                village={village} 
                position={index + 1} 
                scoreType="infrastructure" 
              />
            ))}
          </TabsContent>

          <TabsContent value="education" className="space-y-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Education Leaders</h2>
              <p className="text-muted-foreground">Villages excelling in educational development and opportunities</p>
            </div>
            {bestEducation?.map((village, index) => (
              <LeaderboardCard 
                key={village.id} 
                village={village} 
                position={index + 1} 
                scoreType="education" 
              />
            ))}
          </TabsContent>

          <TabsContent value="diaspora" className="space-y-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Diaspora Connected Villages</h2>
              <p className="text-muted-foreground">Villages with strong diaspora engagement and support</p>
            </div>
            {bestDiaspora?.map((village, index) => (
              <LeaderboardCard 
                key={village.id} 
                village={village} 
                position={index + 1} 
                scoreType="diaspora" 
              />
            ))}
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <Link to="/villages">
            <Button variant="outline" size="lg">
              View All Villages
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VillageRatingsLeaderboard;