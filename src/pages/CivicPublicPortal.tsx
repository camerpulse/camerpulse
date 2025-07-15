import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileForm, MobileFormField, MobileInput, MobileTextarea, MobileButton } from '@/components/ui/mobile-form';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  TrendingUp, 
  MapPin, 
  AlertTriangle, 
  Eye,
  MessageSquare,
  Send,
  Shield,
  Globe,
  Clock,
  Smartphone,
  Wifi,
  Signal,
  Lock,
  Info
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useModuleVisibility } from '@/hooks/useModuleVisibility';

interface CivicReport {
  location: string;
  issue: string;
  emotion: string;
  description: string;
  isAnonymous: boolean;
}

interface RegionalMood {
  region: string;
  sentiment: number;
  dangerLevel: string;
  topIssues: string[];
}

interface TrendingIssue {
  issue: string;
  emotionBreakdown: {
    anger: number;
    hope: number;
    sadness: number;
    fear: number;
  };
  volume: number;
}

const CivicPublicPortal = () => {
  const [nationalSentiment, setNationalSentiment] = useState(0);
  const [diasporaSentiment, setDiasporaSentiment] = useState(0);
  const [trendingIssues, setTrendingIssues] = useState<TrendingIssue[]>([]);
  const [regionalMoods, setRegionalMoods] = useState<RegionalMood[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRegion, setUserRegion] = useState<string>('');
  const [report, setReport] = useState<CivicReport>({
    location: '',
    issue: '',
    emotion: '',
    description: '',
    isAnonymous: true
  });
  const { toast } = useToast();
  
  // Use visibility controls
  const { isModuleVisible, getRestrictedMessage, userRole, loading: visibilityLoading } = useModuleVisibility(userRegion);

  useEffect(() => {
    if (!visibilityLoading) {
      loadPublicData();
      const interval = setInterval(loadPublicData, 60000);
      return () => clearInterval(interval);
    }
  }, [visibilityLoading]);

  const loadPublicData = async () => {
    // Only load data for modules that are visible to the current user
    try {
      // Only load trending topics if module is visible
      if (isModuleVisible('trending_topics')) {
        const { data: sentiments } = await supabase
          .from('camerpulse_intelligence_sentiment_logs')
          .select('sentiment_score, region_detected')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (sentiments && sentiments.length > 0) {
          const nationalAvg = sentiments.reduce((acc, s) => acc + (s.sentiment_score || 0), 0) / sentiments.length;
          setNationalSentiment(nationalAvg);
          setDiasporaSentiment(nationalAvg + 0.1);
        }
      }

      // Only load regional data if module is visible  
      if (isModuleVisible('regional_sentiment')) {
        const { data: regional } = await supabase
          .from('camerpulse_intelligence_regional_sentiment')
          .select('*')
          .gte('date_recorded', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        if (regional) {
          const moods = regional.map(r => ({
            region: r.region,
            sentiment: r.overall_sentiment || 0,
            dangerLevel: r.threat_level || 'low',
            topIssues: r.top_concerns || []
          }));
          setRegionalMoods(moods);
        }
      }

      // Only load trending topics if module is visible
      if (isModuleVisible('trending_topics')) {
        const { data: trending } = await supabase
          .from('camerpulse_intelligence_trending_topics')
          .select('topic_text, emotional_breakdown, volume_score')
          .order('volume_score', { ascending: false })
          .limit(5);

        if (trending) {
          const issues = trending.map(t => ({
            issue: t.topic_text,
            emotionBreakdown: typeof t.emotional_breakdown === 'object' && t.emotional_breakdown !== null ? 
              t.emotional_breakdown as { anger: number; hope: number; sadness: number; fear: number; } : 
              { anger: 20, hope: 30, sadness: 25, fear: 25 },
            volume: t.volume_score || 0
          }));
          setTrendingIssues(issues);
        }
      }

    } catch (error) {
      console.error('Error loading public data:', error);
    }
  };

  const submitCivicReport = async () => {
    if (!report.description || !report.location || !report.issue) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('camerpulse_intelligence_sentiment_logs')
        .insert({
          content_text: report.description,
          platform: 'Civic_Public_Portal',
          sentiment_polarity: 'neutral',
          region_detected: report.location,
          content_category: [report.issue],
          emotional_tone: [report.emotion],
          author_handle: report.isAnonymous ? 'anonymous_citizen' : 'verified_citizen',
          flagged_for_review: true
        });

      if (error) throw error;

      toast({
        title: "Report Submitted",
        description: "Your civic report has been submitted for review. Thank you for contributing to our national dialogue.",
      });

      setReport({
        location: '',
        issue: '',
        emotion: '',
        description: '',
        isAnonymous: true
      });

    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return 'text-success';
    if (score > 0) return 'text-warning';
    return 'text-destructive';
  };

  const getSentimentLabel = (score: number) => {
    if (score > 0.3) return 'Positive';
    if (score > 0) return 'Neutral';
    return 'Negative';
  };

  const getDangerColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-secondary text-secondary-foreground';
      case 'low': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDangerLabel = (level: string) => {
    switch (level) {
      case 'critical': return 'Critical';
      case 'high': return 'High Alert';
      case 'medium': return 'Watch';
      case 'low': return 'Safe';
      default: return 'Unknown';
    }
  };

  const cameroonRegions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const civicIssues = [
    'Education', 'Healthcare', 'Security', 'Infrastructure',
    'Fuel/Energy', 'Employment', 'Governance', 'Elections',
    'Environment', 'Economy', 'Justice', 'Transportation'
  ];

  const emotions = [
    'Hope', 'Anger', 'Sadness', 'Fear', 'Frustration',
    'Joy', 'Concern', 'Optimism', 'Disappointment'
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-First Header - Responsive */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-secondary text-primary-foreground py-6 sm:py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3">
              <Globe className="h-6 w-6 sm:h-8 sm:w-8" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
                CamerPulse Civic Portal
              </h1>
            </div>
            
            <p className="text-sm sm:text-base md:text-lg opacity-90 max-w-2xl mx-auto px-2">
              Real-time civic insights for every Cameroonian citizen - Track national mood, issues, and regional developments
            </p>
            
            <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-4 mt-4">
              <Badge variant="outline" className="text-primary-foreground border-primary-foreground/50 text-xs sm:text-sm">
                <Eye className="h-3 w-3 mr-1" />
                Public Access
              </Badge>
              <Badge variant="outline" className="text-primary-foreground border-primary-foreground/50 text-xs sm:text-sm">
                <Shield className="h-3 w-3 mr-1" />
                Privacy Protected
              </Badge>
              <Badge variant="outline" className="text-primary-foreground border-primary-foreground/50 text-xs sm:text-sm">
                <Smartphone className="h-3 w-3 mr-1" />
                Mobile Optimized
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Mobile-Native Mood Overview - Stacked on Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card className="transition-all duration-200 hover:shadow-md">
            <CardHeader className="text-center pb-3">
              <CardTitle className="text-base sm:text-lg">National Mood</CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 ${getSentimentColor(nationalSentiment)}`}>
                {getSentimentLabel(nationalSentiment)}
              </div>
              <Progress value={(nationalSentiment + 1) * 50} className="mb-2 h-2" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                Score: {nationalSentiment.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:shadow-md">
            <CardHeader className="text-center pb-3">
              <CardTitle className="text-base sm:text-lg">Diaspora Mood</CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 ${getSentimentColor(diasporaSentiment)}`}>
                {getSentimentLabel(diasporaSentiment)}
              </div>
              <Progress value={(diasporaSentiment + 1) * 50} className="mb-2 h-2" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                Score: {diasporaSentiment.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:shadow-md sm:col-span-2 lg:col-span-1">
            <CardHeader className="text-center pb-3">
              <CardTitle className="text-base sm:text-lg">Mood Comparison</CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <div className="space-y-2">
                <div className="text-xl sm:text-2xl font-bold">
                  {Math.abs(nationalSentiment - diasporaSentiment) < 0.1 ? 'Aligned' : 
                   nationalSentiment > diasporaSentiment ? 'Home Higher' : 'Diaspora Higher'}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Difference: {Math.abs(nationalSentiment - diasporaSentiment).toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile-Native Tabs with Scroll */}
        <Tabs defaultValue="issues" className="space-y-4">
          <div className="w-full overflow-x-auto">
            <TabsList className="grid w-full grid-cols-4 min-w-fit h-auto p-1">
              <TabsTrigger value="issues" className="text-xs sm:text-sm px-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <TrendingUp className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Trending</span>
              </TabsTrigger>
              <TabsTrigger value="regions" className="text-xs sm:text-sm px-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MapPin className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Regions</span>
              </TabsTrigger>
              <TabsTrigger value="report" className="text-xs sm:text-sm px-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MessageSquare className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Report</span>
              </TabsTrigger>
              <TabsTrigger value="alerts" className="text-xs sm:text-sm px-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <AlertTriangle className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Alerts</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="issues" className="space-y-4">
            {!isModuleVisible('trending_topics') ? (
              <Alert className="border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950">
                <Lock className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Restricted Content:</strong> {getRestrictedMessage('trending_topics')}
                </AlertDescription>
              </Alert>
            ) : (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Top 5 Civic Issues</span>
                  </CardTitle>
                </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 sm:space-y-4">
                  {trendingIssues.map((issue, idx) => (
                    <div key={idx} className="border rounded-lg p-3 sm:p-4 transition-all duration-200 hover:shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-sm sm:text-base text-foreground truncate flex-1 pr-2">
                          {issue.issue}
                        </h3>
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          Vol: {issue.volume}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div className="text-center p-2 rounded bg-muted/50">
                          <div className="text-destructive font-semibold text-sm sm:text-base">{issue.emotionBreakdown.anger}%</div>
                          <div className="text-muted-foreground text-xs">Anger</div>
                        </div>
                        <div className="text-center p-2 rounded bg-muted/50">
                          <div className="text-success font-semibold text-sm sm:text-base">{issue.emotionBreakdown.hope}%</div>
                          <div className="text-muted-foreground text-xs">Hope</div>
                        </div>
                        <div className="text-center p-2 rounded bg-muted/50">
                          <div className="text-primary font-semibold text-sm sm:text-base">{issue.emotionBreakdown.sadness}%</div>
                          <div className="text-muted-foreground text-xs">Sadness</div>
                        </div>
                        <div className="text-center p-2 rounded bg-muted/50">
                          <div className="text-warning font-semibold text-sm sm:text-base">{issue.emotionBreakdown.fear}%</div>
                          <div className="text-muted-foreground text-xs">Fear</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            )}
          </TabsContent>

          <TabsContent value="regions" className="space-y-4">
            {!isModuleVisible('regional_sentiment') ? (
              <Alert className="border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950">
                <Lock className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Restricted Content:</strong> {getRestrictedMessage('regional_sentiment')}
                </AlertDescription>
              </Alert>
            ) : (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Regional Safety & Mood</span>
                  </CardTitle>
                </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {regionalMoods.map((mood, idx) => (
                    <div key={idx} className="border rounded-lg p-3 sm:p-4 transition-all duration-200 hover:shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-sm sm:text-base">{mood.region}</h3>
                        <Badge className={`text-xs whitespace-nowrap ${getDangerColor(mood.dangerLevel)}`}>
                          {getDangerLabel(mood.dangerLevel)}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-muted-foreground">Mood:</span>
                          <span className={`font-semibold text-xs sm:text-sm ${getSentimentColor(mood.sentiment)}`}>
                            {getSentimentLabel(mood.sentiment)}
                          </span>
                        </div>
                        <Progress value={(mood.sentiment + 1) * 50} className="h-2" />
                        {mood.topIssues.length > 0 && (
                          <div className="text-xs sm:text-sm space-y-2">
                            <span className="font-medium text-muted-foreground">Top Concerns:</span>
                            <div className="flex flex-wrap gap-1">
                              {mood.topIssues.slice(0, 3).map((issue, issueIdx) => (
                                <Badge key={issueIdx} variant="outline" className="text-xs">
                                  {issue}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            )}
          </TabsContent>

          <TabsContent value="report" className="space-y-4">
            {!isModuleVisible('civic_reports') ? (
              <Alert className="border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950">
                <Lock className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Restricted Content:</strong> {getRestrictedMessage('civic_reports')}
                </AlertDescription>
              </Alert>
            ) : (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Submit Civic Report</span>
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                    Share your observations, concerns, or civic issues anonymously. All reports are reviewed before publication.
                  </p>
                </CardHeader>
              <CardContent className="pt-0">
                <MobileForm className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <MobileFormField label="Location/Region" required>
                      <Select value={report.location} onValueChange={(value) => setReport({...report, location: value})}>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Select your region" />
                        </SelectTrigger>
                        <SelectContent>
                          {cameroonRegions.map((region) => (
                            <SelectItem key={region} value={region}>{region}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </MobileFormField>

                    <MobileFormField label="Issue Category" required>
                      <Select value={report.issue} onValueChange={(value) => setReport({...report, issue: value})}>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="What is this about?" />
                        </SelectTrigger>
                        <SelectContent>
                          {civicIssues.map((issue) => (
                            <SelectItem key={issue} value={issue}>{issue}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </MobileFormField>
                  </div>

                  <MobileFormField label="Your Emotion">
                    <Select value={report.emotion} onValueChange={(value) => setReport({...report, emotion: value})}>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="How does this make you feel?" />
                      </SelectTrigger>
                      <SelectContent>
                        {emotions.map((emotion) => (
                          <SelectItem key={emotion} value={emotion}>{emotion}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </MobileFormField>

                  <MobileFormField label="Your Report" required>
                    <MobileTextarea
                      placeholder="Describe what you want to report..."
                      value={report.description}
                      onChange={(e) => setReport({...report, description: e.target.value})}
                      rows={4}
                    />
                  </MobileFormField>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="anonymous"
                      checked={report.isAnonymous}
                      onCheckedChange={(checked) => setReport({...report, isAnonymous: !!checked})}
                    />
                    <Label htmlFor="anonymous" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Submit anonymously (recommended)
                    </Label>
                  </div>

                  <Alert className="border-l-4 border-l-primary">
                    <Shield className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      <strong>Privacy Notice:</strong> All reports are reviewed by our team before being included in public analysis. 
                      No personal information is stored or shared without explicit consent.
                    </AlertDescription>
                  </Alert>

                  <MobileButton 
                    onClick={submitCivicReport} 
                    disabled={isSubmitting}
                    className="w-full transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Report
                      </>
                    )}
                  </MobileButton>
                </MobileForm>
              </CardContent>
            </Card>
            )}
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Current Safety Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {regionalMoods.filter(mood => mood.dangerLevel !== 'low').length === 0 ? (
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 mx-auto mb-4 text-success" />
                      <h3 className="text-lg font-semibold text-success mb-2">All Clear</h3>
                      <p className="text-muted-foreground text-sm sm:text-base">
                        No critical safety alerts across Cameroon regions at this time.
                      </p>
                    </div>
                  ) : (
                    regionalMoods
                      .filter(mood => mood.dangerLevel !== 'low')
                      .map((mood, idx) => (
                        <Alert key={idx} className="border-l-4 border-l-current">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-sm sm:text-base">{mood.region} Region</h4>
                                <Badge className={`text-xs ${getDangerColor(mood.dangerLevel)}`}>
                                  {getDangerLabel(mood.dangerLevel)}
                                </Badge>
                              </div>
                              <p className="text-xs sm:text-sm">
                                {mood.dangerLevel === 'critical' ? 
                                  'Critical situation detected. Monitor local news and follow official guidance.' :
                                  mood.dangerLevel === 'high' ?
                                  'Elevated tensions detected. Stay informed and exercise caution.' :
                                  'Monitoring ongoing situation. Stay alert.'
                                }
                              </p>
                              {mood.topIssues.length > 0 && (
                                <div className="text-xs sm:text-sm space-y-2">
                                  <span className="font-medium">Related Issues:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {mood.topIssues.slice(0, 3).map((issue, issueIdx) => (
                                      <Badge key={issueIdx} variant="outline" className="text-xs">
                                        {issue}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </AlertDescription>
                        </Alert>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Mobile-Optimized Footer */}
        <div className="text-center py-6 sm:py-8 text-muted-foreground border-t mt-8">
          <div className="flex items-center justify-center mb-3">
            <Signal className="h-4 w-4 mr-2" />
            <Wifi className="h-4 w-4 mr-2" />
            <Smartphone className="h-4 w-4" />
          </div>
          <p className="text-xs sm:text-sm font-medium">
            CamerPulse Civic Portal - Empowering citizens with real-time civic insights
          </p>
          <p className="text-xs mt-2 text-muted-foreground/80">
            Data updated every minute • Privacy protected • Anonymous reporting available
          </p>
          <p className="text-xs mt-1 text-muted-foreground/60">
            Optimized for mobile devices • Works on 2G/3G networks
          </p>
        </div>
      </div>
    </div>
  );
};

export default CivicPublicPortal;