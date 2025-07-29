import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, TrendingUp, Shield, Users, Eye, AlertTriangle } from 'lucide-react';
import { Senator } from '@/hooks/useSenators';

interface SenatorBadgesDisplayProps {
  senator: Senator;
}

export function SenatorBadgesDisplay({ senator }: SenatorBadgesDisplayProps) {
  // Badge configuration with icons and colors
  const badgeConfig: Record<string, { icon: React.ElementType; color: string; description: string }> = {
    'civic_champion': {
      icon: Award,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      description: 'Outstanding civic engagement and community involvement'
    },
    'high_performer': {
      icon: TrendingUp,
      color: 'bg-green-100 text-green-800 border-green-300',
      description: 'Exceptional legislative performance and effectiveness'
    },
    'low_transparency': {
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-800 border-red-300',
      description: 'Below average transparency in public disclosures'
    },
    'election_winner': {
      icon: Shield,
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      description: 'Recently elected or re-elected to office'
    },
    'most_followed': {
      icon: Users,
      color: 'bg-purple-100 text-purple-800 border-purple-300',
      description: 'High citizen engagement and social media following'
    },
    'transparency_leader': {
      icon: Eye,
      color: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      description: 'Exceptional transparency in government operations'
    }
  };

  // Generate badges based on senator data
  const generateBadges = () => {
    const badges = [];
    
    // Add existing badges from senator data
    if (senator.badges && senator.badges.length > 0) {
      senator.badges.forEach(badge => {
        if (badgeConfig[badge]) {
          badges.push({
            id: badge,
            name: badge.replace('_', ' ').toUpperCase(),
            ...badgeConfig[badge]
          });
        }
      });
    }

    // Auto-generate badges based on performance
    if (senator.civic_engagement_score && senator.civic_engagement_score >= 90) {
      badges.push({
        id: 'civic_champion',
        name: '🏅 CIVIC CHAMPION',
        ...badgeConfig.civic_champion
      });
    }

    if (senator.performance_score && senator.performance_score >= 85) {
      badges.push({
        id: 'high_performer',
        name: '📊 HIGH PERFORMER',
        ...badgeConfig.high_performer
      });
    }

    if (senator.transparency_score && senator.transparency_score < 40) {
      badges.push({
        id: 'low_transparency',
        name: '🔒 LOW TRANSPARENCY',
        ...badgeConfig.low_transparency
      });
    } else if (senator.transparency_score && senator.transparency_score >= 90) {
      badges.push({
        id: 'transparency_leader',
        name: '👁️ TRANSPARENCY LEADER',
        ...badgeConfig.transparency_leader
      });
    }

    // Election winner badge (mock logic)
    if (senator.created_at && new Date(senator.created_at) > new Date('2023-01-01')) {
      badges.push({
        id: 'election_winner',
        name: '🎯 ELECTION WINNER',
        ...badgeConfig.election_winner
      });
    }

    // Most followed badge (mock logic based on average rating and total ratings)
    if (senator.total_ratings > 100 && senator.average_rating > 4) {
      badges.push({
        id: 'most_followed',
        name: '👥 MOST FOLLOWED',
        ...badgeConfig.most_followed
      });
    }

    return badges;
  };

  const badges = generateBadges();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Senator Badges & Recognition
        </CardTitle>
      </CardHeader>
      <CardContent>
        {badges.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {badges.map((badge) => {
                const IconComponent = badge.icon;
                return (
                  <div 
                    key={badge.id}
                    className={`p-4 rounded-lg border-2 ${badge.color} transition-all hover:shadow-md`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <IconComponent className="h-5 w-5" />
                      <span className="font-bold text-sm">{badge.name}</span>
                    </div>
                    <p className="text-xs leading-relaxed opacity-90">
                      {badge.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Badge Legend */}
            <div className="pt-4 border-t">
              <details className="group">
                <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  How are badges earned? ↓
                </summary>
                <div className="mt-3 text-xs text-muted-foreground space-y-2 pl-4 border-l-2 border-muted">
                  <p>• <strong>Civic Champion:</strong> 90+ civic engagement score</p>
                  <p>• <strong>High Performer:</strong> 85+ performance score</p>
                  <p>• <strong>Transparency Leader:</strong> 90+ transparency score</p>
                  <p>• <strong>Most Followed:</strong> High citizen engagement (100+ reviews, 4+ rating)</p>
                  <p>• <strong>Election Winner:</strong> Recently elected to office</p>
                  <p>• <strong>Low Transparency:</strong> Below 40 transparency score</p>
                </div>
              </details>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground">No badges earned yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Badges are earned based on civic performance and citizen engagement
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}