import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollText, Users, Calendar, TrendingUp, ExternalLink } from 'lucide-react';
import { Senator } from '@/hooks/useSenators';

interface LegislationPanelProps {
  senator: Senator;
}

export function LegislationPanel({ senator }: LegislationPanelProps) {
  const attendanceRate = 85; // This would come from actual data
  const participationScore = 78; // This would come from actual data

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScrollText className="h-5 w-5" />
          Legislative Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bills Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Bills Sponsored</span>
              <ScrollText className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">{senator.bills_proposed_count || 0}</p>
          </div>
          
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Bills Passed</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">{senator.bills_passed_count || 0}</p>
          </div>
        </div>

        {/* Committee Memberships */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Committee Memberships
          </h4>
          {senator.committee_memberships && senator.committee_memberships.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {senator.committee_memberships.map((committee: any, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {typeof committee === 'string' ? committee : committee.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No committee information available</p>
          )}
        </div>

        {/* Attendance & Participation */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Attendance & Participation
          </h4>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Session Attendance</span>
                <span className="font-medium">{attendanceRate}%</span>
              </div>
              <Progress value={attendanceRate} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Active Participation</span>
                <span className="font-medium">{participationScore}%</span>
              </div>
              <Progress value={participationScore} className="h-2" />
            </div>
          </div>
        </div>

        {/* Legislative Scorecard */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3">📈 Legislative Scorecard</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-muted/30 rounded">
              <p className="text-xs text-muted-foreground">Effectiveness</p>
              <p className="text-lg font-bold text-primary">
                {senator.performance_score ? `${senator.performance_score}/100` : 'N/A'}
              </p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded">
              <p className="text-xs text-muted-foreground">Activity Level</p>
              <p className="text-lg font-bold text-primary">High</p>
            </div>
          </div>
        </div>

        {/* Link to Bill Tracker */}
        <div className="pt-4 border-t">
          <Button variant="outline" className="w-full" asChild>
            <Link to="/legislation" className="flex items-center justify-center gap-2">
              View Full Legislative History
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}