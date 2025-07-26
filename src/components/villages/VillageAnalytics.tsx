
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MapPin,
  Award,
  Star,
  Eye
} from 'lucide-react';
import { useVillageStats } from '@/hooks/useVillages';

export const VillageAnalytics: React.FC = () => {
  const { data: stats, isLoading } = useVillageStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-16 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const analyticsCards = [
    {
      title: 'Total Villages',
      value: stats?.total_villages || 0,
      icon: MapPin,
      color: 'text-blue-600',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Active Community',
      value: stats?.total_villagers || 0,
      icon: Users,
      color: 'text-green-600',
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Verified Chiefs',
      value: stats?.verified_chiefs || 0,
      icon: Award,
      color: 'text-purple-600',
      trend: '+15%',
      trendUp: true
    },
    {
      title: 'Active Projects',
      value: stats?.total_projects || 0,
      icon: BarChart3,
      color: 'text-orange-600',
      trend: '+5%',
      trendUp: true
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Village Directory Analytics</h2>
        <p className="text-muted-foreground">
          Real-time insights into Cameroonian village engagement and development
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {analyticsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-5 w-5 ${card.color}`} />
                  <Badge 
                    variant={card.trendUp ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {card.trendUp ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {card.trend}
                  </Badge>
                </div>
                <div className="text-2xl font-bold mb-1">
                  {card.value.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {card.title}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Top Performing Regions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['Centre', 'Littoral', 'Northwest', 'West'].map((region, index) => (
                <div key={region} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{region}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      {Math.floor(Math.random() * 50 + 50)} villages
                    </div>
                    <Badge variant="secondary">
                      {(Math.random() * 2 + 7).toFixed(1)}★
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              Engagement Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Village Views</span>
                  <span className="text-sm text-green-600">↗ +23%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Community Growth</span>
                  <span className="text-sm text-green-600">↗ +18%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Project Completion</span>
                  <span className="text-sm text-orange-600">↗ +12%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
