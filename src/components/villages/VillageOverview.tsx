import React from 'react';
import { 
  MapPin, Users, Calendar, Crown, Star, TrendingUp,
  Shield, GraduationCap, Building2, Heart, Zap,
  Award, Target, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface VillageOverviewProps {
  village: any;
}

export const VillageOverview: React.FC<VillageOverviewProps> = ({ village }) => {
  const scoreCategories = [
    { name: 'Infrastructure', score: village.infrastructure_score, icon: Building2, color: 'text-blue-600' },
    { name: 'Education', score: village.education_score, icon: GraduationCap, color: 'text-green-600' },
    { name: 'Health', score: village.health_score, icon: Heart, color: 'text-red-600' },
    { name: 'Security', score: village.peace_security_score, icon: Shield, color: 'text-purple-600' },
    { name: 'Economy', score: village.economic_activity_score, icon: TrendingUp, color: 'text-orange-600' },
    { name: 'Governance', score: village.governance_score, icon: Crown, color: 'text-indigo-600' },
    { name: 'Social Spirit', score: village.social_spirit_score, icon: Users, color: 'text-pink-600' },
    { name: 'Diaspora', score: village.diaspora_engagement_score, icon: Activity, color: 'text-teal-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Village Identity & Heritage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Village Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {village.year_founded && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Founded</label>
                  <div className="font-semibold text-lg">{village.year_founded}</div>
                </div>
              )}
              {village.population_estimate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Population</label>
                  <div className="font-semibold text-lg">{village.population_estimate.toLocaleString()}</div>
                </div>
              )}
              {village.ethnic_groups?.length > 0 && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Ethnic Groups</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {village.ethnic_groups.map((group: string, index: number) => (
                      <Badge key={index} variant="secondary">{group}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {village.traditional_languages?.length > 0 && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Languages</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {village.traditional_languages.map((lang: string, index: number) => (
                      <Badge key={index} variant="outline">{lang}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {village.totem_symbol && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Totem/Symbol</label>
                  <div className="font-semibold">{village.totem_symbol}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Community Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scoreCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <IconComponent className={`h-4 w-4 mr-2 ${category.color}`} />
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <span className="text-sm font-bold">{category.score || 0}/100</span>
                    </div>
                    <Progress value={category.score || 0} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heritage & History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {village.founding_story && (
          <Card>
            <CardHeader>
              <CardTitle>Founding Story</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{village.founding_story}</p>
            </CardContent>
          </Card>
        )}

        {village.migration_legend && (
          <Card>
            <CardHeader>
              <CardTitle>Migration Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{village.migration_legend}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {village.notable_events && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Notable Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{village.notable_events}</p>
          </CardContent>
        </Card>
      )}

      {village.oral_traditions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Oral Traditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{village.oral_traditions}</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Get Involved</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="font-semibold">Join Community</h4>
              <p className="text-sm text-muted-foreground">Connect with fellow villagers</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="font-semibold">Start Project</h4>
              <p className="text-sm text-muted-foreground">Initiate community development</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="font-semibold">Organize Event</h4>
              <p className="text-sm text-muted-foreground">Bring the community together</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};