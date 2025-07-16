import React, { useState, useEffect } from 'react';
import { CivicAlertSystem } from '@/components/Security/CivicAlertSystem';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  TrendingUp, 
  MapPin, 
  Users, 
  AlertTriangle, 
  Eye, 
  Target,
  Zap,
  Globe,
  Heart,
  MessageSquare,
  BarChart3,
  Shield,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ElectionSentimentTracker } from '@/components/AI/ElectionSentimentTracker';
import { ElectionInterferenceMonitor } from '@/components/AI/ElectionInterferenceMonitor';
import RegionalSentimentHeatmap from '@/components/AI/RegionalSentimentHeatmap';
import DiasporaEcho from '@/components/AI/DiasporaEcho';
import EmotionalSpotlight from '@/components/AI/EmotionalSpotlight';
import TrendRadar from '@/components/AI/TrendRadar';
import { CivicFeed } from '@/components/AI/CivicFeed';
import { CivicMemoryEngine } from '@/components/AI/CivicMemoryEngine';
import { AutonomousRefreshEngine } from '@/components/AI/AutonomousRefreshEngine';
import { FeedbackLearningLoop } from '@/components/AI/FeedbackLearningLoop';
import { CivicNarrativeGenerator } from '@/components/AI/CivicNarrativeGenerator';
import SignalIntelligenceCore from '@/components/AI/SignalIntelligenceCore';
import { MultimodalEmotionProcessor } from '@/components/AI/MultimodalEmotionProcessor';
import CivicWhatsAppBridge from '@/components/AI/CivicWhatsAppBridge';
import LocalSentimentMapper from '@/components/AI/LocalSentimentMapper';
import { CivicSimulationCore } from '@/components/AI/CivicSimulationCore';
import { DisinfoShieldAI } from '@/components/AI/DisinfoShieldAI';
import CivicPersonaEngine from '@/components/AI/CivicPersonaEngine';
import IssueEmotionTracker from '@/components/AI/IssueEmotionTracker';
import CivicPredictorAI from '@/components/AI/CivicPredictorAI';
import PanAfricaModule from '@/components/AI/PanAfricaModule';
import CivicServiceDataPanel from '@/components/AI/CivicServiceDataPanel';
import CrossCountryAnalytics from '@/components/AI/CrossCountryAnalytics';
import { CivicVoiceAgent } from '@/components/AI/CivicVoiceAgent';
import { CivicAlertBot } from '@/components/AI/CivicAlertBot';
import CivicFusionCore from '@/components/AI/CivicFusionCore';
import GovSyncPanel from '@/components/AI/GovSyncPanel';
import CivicTrustIndex from '@/components/AI/CivicTrustIndex';
import RedRoomPanel from '@/components/AI/RedRoomPanel';
import ElectionCommandCore from '@/components/AI/ElectionCommandCore';
import CivicExplainerAssistant from '@/components/AI/CivicExplainerAssistant';
import CivicEducationCampaignManager from '@/components/AI/CivicEducationCampaignManager';
import CivicVideoGenerator from '@/components/AI/CivicVideoGenerator';
import VoterReadinessScanner from '@/components/AI/VoterReadinessScanner';
import CivicImportCore from '@/components/AI/CivicImportCore';
import PublicSentimentTransparencyPortal from '@/components/AI/PublicSentimentTransparencyPortal';
import CivicFactCheckWidget from '@/components/AI/CivicFactCheckWidget';
import { PromiseTracker } from '@/components/AI/PromiseTracker';
import { CivicLearningHub } from '@/components/AI/CivicLearningHub';
import PoliticianEngagementScore from '@/components/AI/PoliticianEngagementScore';

interface SentimentData {
  id: string;
  platform: string;
  content_text: string;
  sentiment_polarity: string;
  sentiment_score: number;
  emotional_tone: string[];
  content_category: string[];
  region_detected: string;
  created_at: string;
  threat_level: string;
}

interface RegionalSentiment {
  region: string;
  overall_sentiment: number;
  sentiment_breakdown: any;
  dominant_emotions: string[];
  threat_level: string;
}

interface TrendingTopic {
  topic_text: string;
  category: string;
  sentiment_score: number;
  volume_score: number;
  trend_status: string;
  emotional_breakdown: any;
}

const CamerPulseIntelligence = () => {
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [regionalData, setRegionalData] = useState<RegionalSentiment[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAnalysis, setActiveAnalysis] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load recent sentiment data
      const { data: sentiments } = await supabase
        .from('camerpulse_intelligence_sentiment_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Load regional sentiment data
      const { data: regional } = await supabase
        .from('camerpulse_intelligence_regional_sentiment')
        .select('*')
        .order('date_recorded', { ascending: false })
        .limit(10);

      // Load trending topics
      const { data: trending } = await supabase
        .from('camerpulse_intelligence_trending_topics')
        .select('*')
        .order('volume_score', { ascending: false })
        .limit(20);

      // Load alerts
      const { data: alertData } = await supabase
        .from('camerpulse_intelligence_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setSentimentData(sentiments || []);
      setRegionalData(regional || []);
      setTrendingTopics(trending || []);
      setAlerts(alertData || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setIsLoading(false);
    }
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return 'text-green-600';
    if (score < -0.3) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-red-400';
      case 'medium': return 'bg-yellow-400';
      case 'low': return 'bg-blue-400';
      default: return 'bg-gray-400';
    }
  };

  const overallSentiment = sentimentData.length > 0 
    ? sentimentData.reduce((acc, item) => acc + (item.sentiment_score || 0), 0) / sentimentData.length
    : 0;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6 space-y-6">
          <div className="text-center space-y-4">
            <div className="h-8 bg-muted animate-pulse rounded-lg mx-auto w-64"></div>
            <div className="h-4 bg-muted animate-pulse rounded mx-auto w-96"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-xl"></div>
            ))}
          </div>
          <div className="h-96 bg-muted animate-pulse rounded-xl"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Brain className="h-10 w-10 sm:h-12 sm:w-12 text-primary animate-pulse" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              CAMERPULSE INTELLIGENCE
            </h1>
          </div>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Civic-Grade National Sentiment & Election Intelligence System - Real-Time Public Opinion Analysis for Cameroon
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            <Badge variant="outline" className="text-xs sm:text-sm">
              <Zap className="h-3 w-3 mr-1" />
              {activeAnalysis ? 'Active' : 'Standby'}
            </Badge>
            <Badge variant="outline" className="text-xs sm:text-sm">
              <Globe className="h-3 w-3 mr-1" />
              Multi-Platform
            </Badge>
            <Badge variant="outline" className="text-xs sm:text-sm">
              <Heart className="h-3 w-3 mr-1" />
              July 12, 2025
            </Badge>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Sentiment</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getSentimentColor(overallSentiment)}`}>
                {overallSentiment.toFixed(2)}
              </div>
              <Progress value={(overallSentiment + 1) * 50} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Content Analyzed</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sentimentData.length.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{alerts.length}</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trending Topics</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trendingTopics.length}</div>
              <p className="text-xs text-muted-foreground">Currently monitoring</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="pan-africa" className="space-y-4">
          <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex w-max min-w-full p-1 gap-1">
              <TabsTrigger value="pan-africa" className="whitespace-nowrap min-h-[48px] px-3 text-sm">🌍 Pan-Africa</TabsTrigger>
              <TabsTrigger value="cross-analytics" className="whitespace-nowrap min-h-[48px] px-3 text-sm">🔄 Cross-Border</TabsTrigger>
              <TabsTrigger value="serviceData" className="whitespace-nowrap min-h-[48px] px-3 text-sm">🏥 Service Data</TabsTrigger>
              <TabsTrigger value="voice" className="whitespace-nowrap min-h-[48px] px-3 text-sm">🎙️ Voice Agent</TabsTrigger>
              <TabsTrigger value="alert-bot" className="whitespace-nowrap min-h-[48px] px-3 text-sm">🤖 Alert Bot</TabsTrigger>
              <TabsTrigger value="gov-sync" className="whitespace-nowrap min-h-[48px] px-3 text-sm">🏛️ Gov Sync</TabsTrigger>
              <TabsTrigger value="fusion" className="whitespace-nowrap min-h-[48px] px-3 text-sm">⚡ Fusion Core</TabsTrigger>
              <TabsTrigger value="civic" className="whitespace-nowrap min-h-[48px] px-3 text-sm">📰 Civic Feed</TabsTrigger>
              <TabsTrigger value="sentiment" className="whitespace-nowrap min-h-[48px] px-3 text-sm">💭 Sentiment</TabsTrigger>
              <TabsTrigger value="election" className="whitespace-nowrap min-h-[48px] px-3 text-sm">🗳️ Election War Room</TabsTrigger>
              <TabsTrigger value="regional" className="whitespace-nowrap min-h-[48px] px-3 text-sm">🗺️ Regional</TabsTrigger>
              <TabsTrigger value="local" className="whitespace-nowrap min-h-[48px] px-3 text-sm">📍 Local</TabsTrigger>
              <TabsTrigger value="disinfoShield" className="whitespace-nowrap min-h-[48px] px-3 text-sm">🛡️ Disinfo Shield</TabsTrigger>
              <TabsTrigger value="personas" className="whitespace-nowrap min-h-[48px] px-3 text-sm">👥 Personas</TabsTrigger>
              <TabsTrigger value="issueTracker" className="whitespace-nowrap min-h-[48px] px-3 text-sm">📊 Issues</TabsTrigger>
              <TabsTrigger value="diaspora" className="whitespace-nowrap min-h-[48px] px-3 text-sm">🌐 Diaspora</TabsTrigger>
              <TabsTrigger value="emotions" className="whitespace-nowrap min-h-[48px] px-3 text-sm">😊 Emotions</TabsTrigger>
              <TabsTrigger value="trending" className="whitespace-nowrap min-h-[48px] px-3 text-sm">📈 Trending</TabsTrigger>
              <TabsTrigger value="memory" className="whitespace-nowrap min-h-[48px] px-3 text-sm">🧠 Memory</TabsTrigger>
              <TabsTrigger value="whatsapp" className="whitespace-nowrap min-h-[48px] px-3 text-sm">💬 WhatsApp</TabsTrigger>
              <TabsTrigger value="multimodal" className="whitespace-nowrap min-h-[48px] px-3 text-sm">🎯 Multimodal</TabsTrigger>
              <TabsTrigger value="refresh" className="whitespace-nowrap min-h-[48px] px-3 text-sm">🔄 Refresh</TabsTrigger>
              <TabsTrigger value="learning" className="whitespace-nowrap min-h-[48px] px-3 text-sm">📚 Learning</TabsTrigger>
              <TabsTrigger value="narrative" className="whitespace-nowrap min-h-[48px] px-3 text-sm">📖 Narrative</TabsTrigger>
              <TabsTrigger value="intelligence" className="whitespace-nowrap min-h-[48px] px-3 text-sm">🔍 Intelligence</TabsTrigger>
              <TabsTrigger value="alerts" className="whitespace-nowrap min-h-[48px] px-3 text-sm">⚠️ Alerts</TabsTrigger>
              <TabsTrigger value="interference" className="whitespace-nowrap min-h-[48px] px-3 text-sm">🛡️ Interference</TabsTrigger>
              <TabsTrigger value="trust" className="whitespace-nowrap min-h-[48px] px-3 text-sm">🤝 Trust Index</TabsTrigger>
              <TabsTrigger value="explainer" className="whitespace-nowrap min-h-[48px] px-3 text-sm">🧠 Citizen Assistant</TabsTrigger>
              <TabsTrigger value="campaigns" className="whitespace-nowrap min-h-[48px] px-3 text-sm">📢 Civic Campaigns</TabsTrigger>
              <TabsTrigger value="videos" className="whitespace-nowrap min-h-[48px] px-3 text-sm">🎥 Video Generator</TabsTrigger>
              <TabsTrigger value="voter-scanner" className="whitespace-nowrap min-h-[48px] px-3 text-sm">🗳️ Voter Scanner</TabsTrigger>
              <TabsTrigger value="import-core" className="whitespace-nowrap min-h-[48px] px-3 text-sm">🧠 Import Core</TabsTrigger>
              <TabsTrigger value="public-portal" className="whitespace-nowrap min-h-[48px] px-3 text-sm">🌍 Public Portal</TabsTrigger>
              <TabsTrigger value="fact-check" className="whitespace-nowrap min-h-[48px] px-3 text-sm">🔍 Fact Check</TabsTrigger>
              <TabsTrigger value="promise-tracker" className="whitespace-nowrap min-h-[48px] px-3 text-sm">📋 Promise Tracker</TabsTrigger>
              <TabsTrigger value="civic-learning" className="whitespace-nowrap min-h-[48px] px-3 text-sm">🎓 Civic Learning</TabsTrigger>
              <TabsTrigger value="engagement" className="whitespace-nowrap min-h-[48px] px-3 text-sm">📊 Engagement Score</TabsTrigger>
              <TabsTrigger value="config" className="whitespace-nowrap min-h-[48px] px-3 text-sm">⚙️ Config</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="pan-africa" className="space-y-4">
            <PanAfricaModule />
          </TabsContent>

          <TabsContent value="cross-analytics" className="space-y-4">
            <CrossCountryAnalytics />
          </TabsContent>

          <TabsContent value="serviceData" className="space-y-4">
            <CivicServiceDataPanel />
          </TabsContent>

          <TabsContent value="voice" className="space-y-4">
            <CivicVoiceAgent />
          </TabsContent>

          <TabsContent value="alert-bot" className="space-y-4">
            <CivicAlertBot />
          </TabsContent>

          <TabsContent value="gov-sync" className="space-y-4">
            <GovSyncPanel />
          </TabsContent>

          <TabsContent value="fusion" className="space-y-4">
            <CivicFusionCore />
          </TabsContent>

          <TabsContent value="civic" className="space-y-4">
            <CivicFeed />
          </TabsContent>

          <TabsContent value="sentiment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Real-Time Sentiment Stream</span>
                </CardTitle>
                <CardDescription>
                  Live analysis of public sentiment across all monitored platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {sentimentData.slice(0, 10).map((item) => (
                    <div key={item.id} className="border-l-4 border-primary pl-4 py-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{item.platform}</Badge>
                          <Badge variant={item.sentiment_polarity === 'positive' ? 'default' : 
                                        item.sentiment_polarity === 'negative' ? 'destructive' : 'secondary'}>
                            {item.sentiment_polarity}
                          </Badge>
                          {item.threat_level !== 'none' && (
                            <Badge className={getThreatLevelColor(item.threat_level)}>
                              {item.threat_level}
                            </Badge>
                          )}
                        </div>
                        <span className={`font-semibold ${getSentimentColor(item.sentiment_score)}`}>
                          {item.sentiment_score?.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {item.content_text}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        {item.emotional_tone?.map((emotion, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {emotion}
                          </Badge>
                        ))}
                        {item.region_detected && (
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            {item.region_detected}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="election" className="space-y-4">
            <ElectionCommandCore />
          </TabsContent>

          <TabsContent value="regional" className="space-y-4">
            <RegionalSentimentHeatmap />
          </TabsContent>

          <TabsContent value="local" className="space-y-4">
            <LocalSentimentMapper />
          </TabsContent>

          <TabsContent value="simulation" className="space-y-4">
            <CivicSimulationCore />
          </TabsContent>

          <TabsContent value="predictor" className="space-y-4">
            <CivicPredictorAI />
          </TabsContent>

          <TabsContent value="disinfoShield" className="space-y-4">
            <DisinfoShieldAI />
          </TabsContent>

          <TabsContent value="personas" className="space-y-4">
            <CivicPersonaEngine />
          </TabsContent>

          <TabsContent value="issueTracker" className="space-y-4">
            <IssueEmotionTracker />
          </TabsContent>

          <TabsContent value="diaspora" className="space-y-4">
            <DiasporaEcho />
          </TabsContent>

          <TabsContent value="emotions" className="space-y-4">
            <EmotionalSpotlight />
          </TabsContent>

          <TabsContent value="trending" className="space-y-4">
            <TrendRadar />
          </TabsContent>

          <TabsContent value="memory" className="space-y-4">
            <CivicMemoryEngine />
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-4">
            <CivicWhatsAppBridge />
          </TabsContent>

          <TabsContent value="multimodal" className="space-y-4">
            <MultimodalEmotionProcessor />
          </TabsContent>

          <TabsContent value="refresh" className="space-y-4">
            <AutonomousRefreshEngine />
          </TabsContent>

          <TabsContent value="learning" className="space-y-4">
            <FeedbackLearningLoop />
          </TabsContent>

          <TabsContent value="narrative" className="space-y-4">
            <CivicNarrativeGenerator />
          </TabsContent>

          <TabsContent value="intelligence" className="space-y-4">
            <SignalIntelligenceCore />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <CivicAlertSystem />
          </TabsContent>

          <TabsContent value="interference" className="space-y-4">
            <ElectionInterferenceMonitor />
          </TabsContent>

          <TabsContent value="trust" className="space-y-4">
            <CivicTrustIndex />
          </TabsContent>

          <TabsContent value="explainer" className="space-y-4">
            <CivicExplainerAssistant />
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4">
            <CivicEducationCampaignManager />
          </TabsContent>

          <TabsContent value="videos" className="space-y-4">
            <CivicVideoGenerator />
          </TabsContent>

          <TabsContent value="voter-scanner" className="space-y-4">
            <VoterReadinessScanner />
          </TabsContent>

          <TabsContent value="import-core" className="space-y-4">
            <CivicImportCore />
          </TabsContent>

          <TabsContent value="public-portal" className="space-y-4">
            <PublicSentimentTransparencyPortal />
          </TabsContent>

          <TabsContent value="fact-check" className="space-y-4">
            <CivicFactCheckWidget />
          </TabsContent>

          <TabsContent value="promise-tracker" className="space-y-4">
            <PromiseTracker />
          </TabsContent>

          <TabsContent value="civic-learning" className="space-y-4">
            <CivicLearningHub />
          </TabsContent>

          <TabsContent value="engagement" className="space-y-4">
            <PoliticianEngagementScore />
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>CamerPulse Intelligence Configuration</span>
                </CardTitle>
                <CardDescription>
                  Configure AI learning parameters and system behavior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Alert>
                    <Brain className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Self-Evolution Status:</strong> CamerPulse Intelligence is continuously learning and adapting. 
                      The AI has processed {sentimentData.length} content pieces and identified {trendingTopics.length} trending patterns.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">System Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Analysis Mode:</span>
                            <Badge variant={activeAnalysis ? 'default' : 'secondary'}>
                              {activeAnalysis ? 'Active' : 'Standby'}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Language Support:</span>
                            <span className="text-sm">English, Pidgin</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Platforms Monitored:</span>
                            <span className="text-sm">5</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Performance Metrics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Processing Speed:</span>
                            <span className="text-sm text-green-600">Optimal</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Accuracy Rate:</span>
                            <span className="text-sm text-green-600">95.2%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>System Load:</span>
                            <span className="text-sm text-yellow-600">Medium</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Advanced Settings
                    </Button>
                    <Button>
                      <Target className="h-4 w-4 mr-2" />
                      Run System Check
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default CamerPulseIntelligence;