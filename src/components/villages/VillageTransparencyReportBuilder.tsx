import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Calendar, BarChart3, Users, Building, Trophy, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useVillageTransparencyPDF } from '@/hooks/useVillageTransparencyPDF';
import type { Village } from '@/hooks/useVillages';

interface VillageTransparencyReportBuilderProps {
  village: Village;
  transparencyData?: {
    projectCompletionRate: number;
    corruptionReportsCount: number;
    verifiedCorruptionCount: number;
    citizenSatisfactionScore: number;
    transparencyScore: number;
    developmentProgressScore: number;
    civicEngagementScore: number;
    officialPerformanceScore: number;
    overallReputationScore: number;
    reputationBadge: string;
    recentProjects?: any[];
    recentVotes?: any[];
    corruptionReports?: any[];
  };
  className?: string;
}

export const VillageTransparencyReportBuilder: React.FC<VillageTransparencyReportBuilderProps> = ({
  village,
  transparencyData,
  className = '',
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateTransparencyReport } = useVillageTransparencyPDF();
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      await generateTransparencyReport({
        village,
        transparencyData: transparencyData || {
          projectCompletionRate: village.achievements_score * 10,
          corruptionReportsCount: 0,
          verifiedCorruptionCount: 0,
          citizenSatisfactionScore: village.overall_rating * 10,
          transparencyScore: village.governance_score * 10,
          developmentProgressScore: village.infrastructure_score * 10,
          civicEngagementScore: village.civic_participation_score * 10,
          officialPerformanceScore: village.governance_score * 10,
          overallReputationScore: village.overall_rating * 10,
          reputationBadge: village.overall_rating >= 8 ? 'excellent' : village.overall_rating >= 6 ? 'good' : 'average',
          recentProjects: [],
          recentVotes: [],
          corruptionReports: [],
        },
      });
    } catch (error) {
      console.error('Error generating transparency report:', error);
      toast({
        title: "Report Generation Failed",
        description: "There was an error generating the transparency report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-cm-green';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cm-green/10 rounded-lg">
            <FileText className="h-6 w-6 text-cm-green" />
          </div>
          <div>
            <CardTitle className="text-xl text-cm-green">Transparency Report</CardTitle>
            <CardDescription>
              Generate a comprehensive transparency and accountability report for {village.village_name}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Report Preview Section */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-cm-green flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Report Preview
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-cm-green">{village.overall_rating}/10</div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-cm-green">{village.governance_score}/10</div>
              <div className="text-sm text-muted-foreground">Governance</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-cm-green">{village.infrastructure_score}/10</div>
              <div className="text-sm text-muted-foreground">Infrastructure</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-cm-green">{village.civic_participation_score}/10</div>
              <div className="text-sm text-muted-foreground">Civic Engagement</div>
            </div>
          </div>

          <Separator />

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-cm-green flex items-center gap-2">
                <Building className="h-4 w-4" />
                Development Metrics
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Education Score:</span>
                  <Badge variant={getScoreBadgeVariant(village.education_score * 10)}>
                    {village.education_score}/10
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Health Score:</span>
                  <Badge variant={getScoreBadgeVariant(village.health_score * 10)}>
                    {village.health_score}/10
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Economic Activity:</span>
                  <Badge variant={getScoreBadgeVariant(village.economic_activity_score * 10)}>
                    {village.economic_activity_score}/10
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-cm-green flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Community Metrics
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Social Spirit:</span>
                  <Badge variant={getScoreBadgeVariant(village.social_spirit_score * 10)}>
                    {village.social_spirit_score}/10
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Peace & Security:</span>
                  <Badge variant={getScoreBadgeVariant(village.peace_security_score * 10)}>
                    {village.peace_security_score}/10
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Diaspora Engagement:</span>
                  <Badge variant={getScoreBadgeVariant(village.diaspora_engagement_score * 10)}>
                    {village.diaspora_engagement_score}/10
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Village Information */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Region:</span>
              <div className="font-medium">{village.region}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Division:</span>
              <div className="font-medium">{village.division}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Population:</span>
              <div className="font-medium">{village.population_estimate?.toLocaleString() || 'N/A'}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Verification Status:</span>
              <Badge variant={village.is_verified ? 'default' : 'secondary'}>
                {village.is_verified ? 'Verified' : 'Pending'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Report Contents */}
        <div className="space-y-3">
          <h3 className="font-semibold text-cm-green">Report Will Include:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Trophy className="h-3 w-3 text-cm-green" />
              Overall transparency scorecard
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-3 w-3 text-cm-green" />
              Development progress metrics
            </div>
            <div className="flex items-center gap-2">
              <Building className="h-3 w-3 text-cm-green" />
              Infrastructure & services analysis
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3 text-cm-green" />
              Community engagement data
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-cm-green" />
              Historical performance trends
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-3 w-3 text-cm-green" />
              Governance & accountability metrics
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="w-full"
          variant="cm-green"
          size="lg"
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
              Generating Report...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Generate Transparency Report
            </div>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Report will be generated as a PDF document with comprehensive transparency metrics and data visualizations.
        </p>
      </CardContent>
    </Card>
  );
};