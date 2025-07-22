import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, Shield, TrendingUp, Users, Eye } from 'lucide-react';
import { Senator } from '@/hooks/useSenators';

interface CivicRatingsWidgetProps {
  senator: Senator;
}

export function CivicRatingsWidget({ senator }: CivicRatingsWidgetProps) {
  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-500';
    if (rating >= 3) return 'text-yellow-500';
    if (rating >= 2) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Civic Ratings
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            <Shield className="h-3 w-3 mr-1" />
            Verified by CamerPulse Intelligence
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Approval Rating */}
        <div className="text-center p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className={`h-6 w-6 fill-current ${getRatingColor(senator.average_rating)}`} />
            <span className="text-3xl font-bold">{senator.average_rating?.toFixed(1) || 'N/A'}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Approval Rating ({senator.total_ratings} reviews)
          </p>
        </div>

        {/* Individual Scores */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Civic Engagement
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(senator.civic_engagement_score || 0)}`}>
                {senator.civic_engagement_score || 0}/100
              </span>
            </div>
            <Progress value={senator.civic_engagement_score || 0} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Town halls, media visibility, citizen outreach
            </p>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                Transparency Score
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(senator.transparency_score || 0)}`}>
                {senator.transparency_score || 0}/100
              </span>
            </div>
            <Progress value={senator.transparency_score || 0} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Asset disclosures, voting records, public information
            </p>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Performance Score
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(senator.performance_score || 0)}`}>
                {senator.performance_score || 0}/100
              </span>
            </div>
            <Progress value={senator.performance_score || 0} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Legislative effectiveness, bills passed, civic impact
            </p>
          </div>
        </div>

        {/* Rating Methodology */}
        <div className="pt-4 border-t">
          <details className="group">
            <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
              How are these ratings calculated? ↓
            </summary>
            <div className="mt-3 text-xs text-muted-foreground space-y-2 pl-4 border-l-2 border-muted">
              <p>• <strong>Civic Engagement:</strong> Media appearances, town halls, social media activity, citizen interactions</p>
              <p>• <strong>Transparency:</strong> Asset disclosures, voting record accessibility, public information sharing</p>
              <p>• <strong>Performance:</strong> Bills sponsored/passed, committee participation, legislative impact</p>
              <p>• <strong>Approval Rating:</strong> Verified citizen reviews and feedback aggregated by CamerPulse</p>
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
}