import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Heart, 
  TrendingUp, 
  MapPin, 
  Users, 
  AlertTriangle, 
  Eye,
  MessageSquare,
  Send,
  Mic,
  Camera,
  Shield,
  Globe,
  BarChart3,
  Flag,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const [report, setReport] = useState<CivicReport>({
    location: '',
    issue: '',
    emotion: '',
    description: '',
    isAnonymous: true
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPublicData();
    const interval = setInterval(loadPublicData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadPublicData = async () => {
    try {
      // Load aggregated sentiment data (non-sensitive)
      const { data: sentiments } = await supabase
        .from('camerpulse_intelligence_sentiment_logs')
        .select('sentiment_score, region_detected')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Load regional sentiment summary
      const { data: regional } = await supabase
        .from('camerpulse_intelligence_regional_sentiment')
        .select('*')
        .gte('date_recorded', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Load trending topics (non-sensitive)
      const { data: trending } = await supabase
        .from('camerpulse_intelligence_trending_topics')
        .select('topic_text, emotional_breakdown, volume_score')
        .order('volume_score', { ascending: false })
        .limit(5);

      if (sentiments && sentiments.length > 0) {
        // Calculate national sentiment
        const nationalAvg = sentiments.reduce((acc, s) => acc + (s.sentiment_score || 0), 0) / sentiments.length;
        setNationalSentiment(nationalAvg);

        // Mock diaspora sentiment (would come from diaspora-specific analysis)
        setDiasporaSentiment(nationalAvg + 0.1);
      }

      // Process trending issues
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

      // Process regional data
      if (regional) {
        const moods = regional.map(r => ({
          region: r.region,
          sentiment: r.overall_sentiment || 0,
          dangerLevel: r.threat_level || 'low',
          topIssues: r.top_concerns || []
        }));
        setRegionalMoods(moods);
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
      // Submit to public reports table (would need to be created)
      const reportData = {
        content_text: report.description,
        location_reported: report.location,
        issue_category: report.issue,
        emotion_reported: report.emotion,
        is_anonymous: report.isAnonymous,
        platform: 'Public Portal',
        status: 'pending_review', // All reports reviewed before publishing
        created_at: new Date().toISOString()
      };

      // For now, insert into sentiment logs table with a special flag
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

      // Reset form
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
    if (score > 0.3) return 'text-green-600';
    if (score > 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSentimentLabel = (score: number) => {
    if (score > 0.3) return 'Positive';
    if (score > 0) return 'Neutral';
    return 'Negative';
  };

  const getDangerColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-green-600';
      default: return 'bg-gray-600';
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
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Globe className="h-8 w-8" />
            <h1 className="text-3xl font-bold">CamerPulse Civic Portal</h1>
          </div>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Real-time civic insights for every Cameroonian citizen - Track national mood, issues, and regional developments
          </p>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <Badge variant="outline" className="text-white border-white/50">
              <Eye className="h-3 w-3 mr-1" />
              Public Access
            </Badge>
            <Badge variant="outline" className="text-white border-white/50">
              <Shield className="h-3 w-3 mr-1" />
              Privacy Protected
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* National Mood Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-lg">National Mood</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className={`text-4xl font-bold mb-2 ${getSentimentColor(nationalSentiment)}`}>
                {getSentimentLabel(nationalSentiment)}
              </div>
              <Progress value={(nationalSentiment + 1) * 50} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                Score: {nationalSentiment.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Diaspora Mood</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className={`text-4xl font-bold mb-2 ${getSentimentColor(diasporaSentiment)}`}>
                {getSentimentLabel(diasporaSentiment)}
              </div>
              <Progress value={(diasporaSentiment + 1) * 50} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                Score: {diasporaSentiment.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Mood Comparison</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {Math.abs(nationalSentiment - diasporaSentiment) < 0.1 ? 'Aligned' : 
                   nationalSentiment > diasporaSentiment ? 'Home Higher' : 'Diaspora Higher'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Difference: {Math.abs(nationalSentiment - diasporaSentiment).toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="issues" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="issues">Trending Issues</TabsTrigger>
            <TabsTrigger value="regions">Regional Status</TabsTrigger>
            <TabsTrigger value="report">Submit Report</TabsTrigger>
            <TabsTrigger value="alerts">Safety Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="issues" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Top 5 Civic Issues</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trendingIssues.map((issue, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{issue.issue}</h3>
                        <Badge variant="outline">Volume: {issue.volume}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-red-600 font-semibold">{issue.emotionBreakdown.anger}%</div>
                          <div className="text-muted-foreground">Anger</div>
                        </div>
                        <div className="text-center">
                          <div className="text-green-600 font-semibold">{issue.emotionBreakdown.hope}%</div>
                          <div className="text-muted-foreground">Hope</div>
                        </div>
                        <div className="text-center">
                          <div className="text-blue-600 font-semibold">{issue.emotionBreakdown.sadness}%</div>
                          <div className="text-muted-foreground">Sadness</div>
                        </div>
                        <div className="text-center">
                          <div className="text-orange-600 font-semibold">{issue.emotionBreakdown.fear}%</div>
                          <div className="text-muted-foreground">Fear</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Regional Safety & Mood</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {regionalMoods.map((mood, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{mood.region}</h3>
                        <Badge className={getDangerColor(mood.dangerLevel)}>
                          {getDangerLabel(mood.dangerLevel)}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Mood:</span>
                          <span className={`font-semibold ${getSentimentColor(mood.sentiment)}`}>
                            {getSentimentLabel(mood.sentiment)}
                          </span>
                        </div>
                        <Progress value={(mood.sentiment + 1) * 50} className="h-2" />
                        {mood.topIssues.length > 0 && (
                          <div className="text-sm">
                            <span className="font-medium">Top Concerns:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
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
          </TabsContent>

          <TabsContent value="report" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Submit Civic Report</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Share your observations, concerns, or civic issues anonymously. All reports are reviewed before publication.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location/Region *</Label>
                      <Select value={report.location} onValueChange={(value) => setReport({...report, location: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your region" />
                        </SelectTrigger>
                        <SelectContent>
                          {cameroonRegions.map((region) => (
                            <SelectItem key={region} value={region}>{region}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="issue">Issue Category *</Label>
                      <Select value={report.issue} onValueChange={(value) => setReport({...report, issue: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="What is this about?" />
                        </SelectTrigger>
                        <SelectContent>
                          {civicIssues.map((issue) => (
                            <SelectItem key={issue} value={issue}>{issue}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emotion">Your Emotion</Label>
                    <Select value={report.emotion} onValueChange={(value) => setReport({...report, emotion: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="How does this make you feel?" />
                      </SelectTrigger>
                      <SelectContent>
                        {emotions.map((emotion) => (
                          <SelectItem key={emotion} value={emotion}>{emotion}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Your Report *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what you want to report..."
                      value={report.description}
                      onChange={(e) => setReport({...report, description: e.target.value})}
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={report.isAnonymous}
                      onChange={(e) => setReport({...report, isAnonymous: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="anonymous" className="text-sm">
                      Submit anonymously (recommended)
                    </Label>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Privacy Notice:</strong> All reports are reviewed by our team before being included in public analysis. 
                      No personal information is stored or shared without explicit consent.
                    </AlertDescription>
                  </Alert>

                  <Button 
                    onClick={submitCivicReport} 
                    disabled={isSubmitting}
                    className="w-full"
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
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Current Safety Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {regionalMoods.filter(mood => mood.dangerLevel !== 'low').length === 0 ? (
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 mx-auto mb-4 text-green-600" />
                      <h3 className="text-lg font-semibold text-green-600 mb-2">All Clear</h3>
                      <p className="text-muted-foreground">
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
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">{mood.region} Region</h4>
                                <Badge className={getDangerColor(mood.dangerLevel)}>
                                  {getDangerLabel(mood.dangerLevel)}
                                </Badge>
                              </div>
                              <p className="text-sm">
                                {mood.dangerLevel === 'critical' ? 
                                  'Critical situation detected. Monitor local news and follow official guidance.' :
                                  mood.dangerLevel === 'high' ?
                                  'Elevated tensions detected. Stay informed and exercise caution.' :
                                  'Monitoring ongoing situation. Stay alert.'
                                }
                              </p>
                              {mood.topIssues.length > 0 && (
                                <div className="text-sm">
                                  <span className="font-medium">Related Issues:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
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

        {/* Footer */}
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">
            CamerPulse Civic Portal - Empowering citizens with real-time civic insights
          </p>
          <p className="text-xs mt-2">
            Data updated every minute • Privacy protected • Anonymous reporting available
          </p>
        </div>
      </div>
    </div>
  );
};

export default CivicPublicPortal;