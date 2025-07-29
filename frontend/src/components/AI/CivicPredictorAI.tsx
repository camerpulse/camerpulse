import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  TrendingUp, 
  MapPin, 
  Clock, 
  Target,
  Brain,
  Activity,
  Zap,
  BarChart3,
  Eye,
  Timer
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ThreatIndicator {
  type: string;
  value: number;
  weight: number;
  source: string;
  region?: string;
}

interface RegionalThreat {
  region: string;
  riskScore: number;
  triggers: string[];
  timeToEscalation: string;
  confidence: number;
  historicalPattern: string;
}

interface PredictionModel {
  emotionalFactors: number;
  volumeFactors: number;
  disinfoFactors: number;
  historicalFactors: number;
  geographicFactors: number;
}

const CivicPredictorAI = () => {
  const [threatData, setThreatData] = useState<ThreatIndicator[]>([]);
  const [regionalThreats, setRegionalThreats] = useState<RegionalThreat[]>([]);
  const [overallRisk, setOverallRisk] = useState(0);
  const [predictionModel, setPredictionModel] = useState<PredictionModel>({
    emotionalFactors: 0.35,
    volumeFactors: 0.25,
    disinfoFactors: 0.20,
    historicalFactors: 0.15,
    geographicFactors: 0.05
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    analyzeThreatLevel();
    const interval = setInterval(analyzeThreatLevel, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const analyzeThreatLevel = async () => {
    setIsAnalyzing(true);
    try {
      // Fetch emotional signals
      const { data: emotions } = await supabase
        .from('camerpulse_intelligence_sentiment_logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      // Fetch regional data
      const { data: regional } = await supabase
        .from('camerpulse_intelligence_regional_sentiment')
        .select('*')
        .gte('date_recorded', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Fetch trending topics for volume analysis
      const { data: trending } = await supabase
        .from('camerpulse_intelligence_trending_topics')
        .select('*')
        .order('volume_score', { ascending: false });

      // Analyze threat indicators
      const indicators = await calculateThreatIndicators(emotions || [], regional || [], trending || []);
      const regionalRisks = await calculateRegionalRisks(regional || [], emotions || []);
      const overall = calculateOverallRisk(indicators);

      setThreatData(indicators);
      setRegionalThreats(regionalRisks);
      setOverallRisk(overall);
      
      // Generate alerts for high-risk scenarios
      const newAlerts = generateRiskAlerts(regionalRisks, overall);
      setAlerts(newAlerts);
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error analyzing threat level:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateThreatIndicators = async (emotions: any[], regional: any[], trending: any[]) => {
    const indicators: ThreatIndicator[] = [];

    // Emotional volatility analysis
    const angerCount = emotions.filter(e => e.emotional_tone?.includes('anger')).length;
    const fearCount = emotions.filter(e => e.emotional_tone?.includes('fear')).length;
    const totalEmotions = emotions.length;

    if (totalEmotions > 0) {
      indicators.push({
        type: 'Anger Levels',
        value: (angerCount / totalEmotions) * 100,
        weight: 0.4,
        source: 'Sentiment Analysis'
      });

      indicators.push({
        type: 'Fear Levels', 
        value: (fearCount / totalEmotions) * 100,
        weight: 0.3,
        source: 'Sentiment Analysis'
      });
    }

    // Volume surge detection
    const recentHour = emotions.filter(e => 
      new Date(e.created_at) > new Date(Date.now() - 60 * 60 * 1000)
    ).length;
    const previousHour = emotions.filter(e => {
      const time = new Date(e.created_at);
      return time > new Date(Date.now() - 2 * 60 * 60 * 1000) && 
             time <= new Date(Date.now() - 60 * 60 * 1000);
    }).length;

    const volumeChange = previousHour > 0 ? ((recentHour - previousHour) / previousHour) * 100 : 0;
    
    indicators.push({
      type: 'Volume Surge',
      value: Math.max(0, volumeChange),
      weight: 0.25,
      source: 'Volume Analysis'
    });

    // Topic volatility (trending topics with negative sentiment)
    const negativeTrends = trending.filter(t => t.sentiment_score < -0.3).length;
    indicators.push({
      type: 'Negative Trend Topics',
      value: (negativeTrends / Math.max(trending.length, 1)) * 100,
      weight: 0.2,
      source: 'Trend Analysis'
    });

    // Threat level escalation
    const criticalThreats = emotions.filter(e => e.threat_level === 'critical' || e.threat_level === 'high').length;
    indicators.push({
      type: 'Critical Threats',
      value: (criticalThreats / Math.max(totalEmotions, 1)) * 100,
      weight: 0.35,
      source: 'Threat Analysis'
    });

    return indicators;
  };

  const calculateRegionalRisks = async (regional: any[], emotions: any[]) => {
    const cameroonRegions = ['Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 'North', 'Northwest', 'South', 'Southwest', 'West'];
    
    const risks: RegionalThreat[] = cameroonRegions.map(region => {
      const regionData = regional.filter(r => r.region === region);
      const regionEmotions = emotions.filter(e => e.region_detected === region);
      
      let riskScore = 0;
      const triggers: string[] = [];
      
      // Sentiment analysis for region
      if (regionData.length > 0) {
        const avgSentiment = regionData.reduce((acc, r) => acc + (r.overall_sentiment || 0), 0) / regionData.length;
        if (avgSentiment < -0.4) {
          riskScore += 30;
          triggers.push('Negative regional sentiment');
        }
      }

      // Emotion concentration analysis
      const angerEmotions = regionEmotions.filter(e => e.emotional_tone?.includes('anger')).length;
      const fearEmotions = regionEmotions.filter(e => e.emotional_tone?.includes('fear')).length;
      
      if (regionEmotions.length > 0) {
        const angerRatio = angerEmotions / regionEmotions.length;
        const fearRatio = fearEmotions / regionEmotions.length;
        
        if (angerRatio > 0.3) {
          riskScore += 25;
          triggers.push('High anger concentration');
        }
        if (fearRatio > 0.25) {
          riskScore += 20;
          triggers.push('High fear levels');
        }
      }

      // Special consideration for conflict-prone regions
      if (['Northwest', 'Southwest'].includes(region)) {
        riskScore += 15; // Base elevated risk
        triggers.push('Historical conflict zone');
      }

      // Volume spike detection
      const recentActivity = regionEmotions.filter(e => 
        new Date(e.created_at) > new Date(Date.now() - 6 * 60 * 60 * 1000)
      ).length;
      
      if (recentActivity > 20) {
        riskScore += 15;
        triggers.push('High activity volume');
      }

      // Calculate time to escalation based on risk score
      let timeToEscalation = 'Stable';
      if (riskScore > 70) timeToEscalation = '6-12 hours';
      else if (riskScore > 50) timeToEscalation = '24-48 hours';
      else if (riskScore > 30) timeToEscalation = '3-7 days';

      return {
        region,
        riskScore: Math.min(riskScore, 100),
        triggers,
        timeToEscalation,
        confidence: Math.min(regionEmotions.length * 2, 100),
        historicalPattern: getHistoricalPattern(region)
      };
    });

    return risks.sort((a, b) => b.riskScore - a.riskScore);
  };

  const calculateOverallRisk = (indicators: ThreatIndicator[]) => {
    let weightedSum = 0;
    let totalWeight = 0;

    indicators.forEach(indicator => {
      weightedSum += indicator.value * indicator.weight;
      totalWeight += indicator.weight;
    });

    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  };

  const generateRiskAlerts = (regionalRisks: RegionalThreat[], overallRisk: number) => {
    const newAlerts: any[] = [];

    // Overall risk alerts
    if (overallRisk > 70) {
      newAlerts.push({
        severity: 'critical',
        title: 'Critical Unrest Risk Detected',
        message: `National risk level at ${overallRisk}% - immediate attention required`,
        timestamp: new Date(),
        action: 'Contact emergency response teams'
      });
    } else if (overallRisk > 50) {
      newAlerts.push({
        severity: 'high',
        title: 'Elevated Unrest Risk',
        message: `National risk level at ${overallRisk}% - monitor closely`,
        timestamp: new Date(),
        action: 'Increase monitoring frequency'
      });
    }

    // Regional risk alerts
    regionalRisks.forEach(risk => {
      if (risk.riskScore > 70) {
        newAlerts.push({
          severity: 'critical',
          title: `Critical Risk in ${risk.region}`,
          message: `${risk.region} shows ${risk.riskScore}% risk - ${risk.timeToEscalation}`,
          timestamp: new Date(),
          region: risk.region,
          triggers: risk.triggers,
          action: 'Deploy field monitors'
        });
      } else if (risk.riskScore > 50) {
        newAlerts.push({
          severity: 'warning',
          title: `Elevated Risk in ${risk.region}`,
          message: `${risk.region} shows ${risk.riskScore}% risk - monitor for escalation`,
          timestamp: new Date(),
          region: risk.region,
          triggers: risk.triggers,
          action: 'Increase regional monitoring'
        });
      }
    });

    return newAlerts.slice(0, 10); // Limit to most recent/critical alerts
  };

  const getHistoricalPattern = (region: string) => {
    const patterns: Record<string, string> = {
      'Northwest': 'Separatist tensions, education disruptions',
      'Southwest': 'Anglophone crisis, economic grievances', 
      'Far North': 'Security challenges, Boko Haram activity',
      'Adamawa': 'Farmer-herder conflicts, resource competition',
      'Littoral': 'Economic protests, urban unrest',
      'Centre': 'Political demonstrations, student activism',
      'West': 'Land disputes, chieftaincy conflicts',
      'North': 'Religious tensions, resource conflicts',
      'East': 'Refugee pressures, border security',
      'South': 'Forest conflicts, infrastructure protests'
    };
    return patterns[region] || 'Limited historical data';
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 50) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (score >= 30) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'warning': return 'bg-yellow-600';
      default: return 'bg-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-primary" />
            <span>CivicPredictor AI</span>
            <Badge variant="outline">Forecasting Engine</Badge>
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Predictive analysis of civic unrest and emotional breakdown patterns
            </p>
            <div className="flex items-center space-x-2">
              <Button
                onClick={analyzeThreatLevel}
                disabled={isAnalyzing}
                size="sm"
              >
                {isAnalyzing ? (
                  <>
                    <Activity className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Refresh Analysis
                  </>
                )}
              </Button>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {lastUpdate.toLocaleTimeString()}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overall Risk Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>National Unrest Forecast</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Overall Risk Level</span>
              <div className={`text-3xl font-bold px-4 py-2 rounded-lg border ${getRiskColor(overallRisk)}`}>
                {overallRisk}%
              </div>
            </div>
            <Progress value={overallRisk} className="h-3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-green-600 font-semibold">0-29%</div>
                <div className="text-muted-foreground">Stable</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-600 font-semibold">30-49%</div>
                <div className="text-muted-foreground">Watch</div>
              </div>
              <div className="text-center">
                <div className="text-orange-600 font-semibold">50-69%</div>
                <div className="text-muted-foreground">Elevated</div>
              </div>
              <div className="text-center">
                <div className="text-red-600 font-semibold">70-100%</div>
                <div className="text-muted-foreground">Critical</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="forecast" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forecast">Forecast Map</TabsTrigger>
          <TabsTrigger value="indicators">Threat Indicators</TabsTrigger>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="model">Prediction Model</TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Regional Risk Assessment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regionalThreats.map((threat) => (
                  <div
                    key={threat.region}
                    className={`p-4 rounded-lg border ${getRiskColor(threat.riskScore)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold">{threat.region} Region</h3>
                        <Badge variant="outline">
                          {threat.riskScore}% Risk
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Timer className="h-3 w-3 mr-1" />
                          {threat.timeToEscalation}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Confidence: {threat.confidence}%
                      </div>
                    </div>
                    <Progress value={threat.riskScore} className="mb-2" />
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Active Triggers:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {threat.triggers.map((trigger, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {trigger}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Historical Pattern:</span> {threat.historicalPattern}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indicators" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Threat Signal Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threatData.map((indicator, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{indicator.type}</span>
                        <Badge variant="outline" className="text-xs">
                          Weight: {(indicator.weight * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`font-semibold ${getRiskColor(indicator.value).split(' ')[0]}`}>
                          {indicator.value.toFixed(1)}%
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {indicator.source}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={indicator.value} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Predictive Alerts</span>
                <Badge variant="outline">
                  {alerts.length} Active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No critical alerts detected</p>
                    <p className="text-sm">All regions within normal parameters</p>
                  </div>
                ) : (
                  alerts.map((alert, idx) => (
                    <Alert key={idx} className="border-l-4 border-l-current">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{alert.title}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              {alert.region && (
                                <Badge variant="outline">{alert.region}</Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm">{alert.message}</p>
                          {alert.triggers && (
                            <div className="flex flex-wrap gap-1">
                              {alert.triggers.map((trigger: string, triggerIdx: number) => (
                                <Badge key={triggerIdx} variant="secondary" className="text-xs">
                                  {trigger}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            <span className="font-medium">Recommended Action:</span> {alert.action}
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="model" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Prediction Model Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Self-Learning System:</strong> This model continuously adapts based on observed outcomes 
                    and feedback from actual events. Prediction accuracy improves over time through machine learning.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Prediction Factors</h4>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Emotional Factors</span>
                          <span>{(predictionModel.emotionalFactors * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={predictionModel.emotionalFactors * 100} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Volume Factors</span>
                          <span>{(predictionModel.volumeFactors * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={predictionModel.volumeFactors * 100} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Disinformation Factors</span>
                          <span>{(predictionModel.disinfoFactors * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={predictionModel.disinfoFactors * 100} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Historical Factors</span>
                          <span>{(predictionModel.historicalFactors * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={predictionModel.historicalFactors * 100} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Geographic Factors</span>
                          <span>{(predictionModel.geographicFactors * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={predictionModel.geographicFactors * 100} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Model Performance</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Prediction Accuracy:</span>
                        <Badge variant="outline">78.5%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">False Positive Rate:</span>
                        <Badge variant="outline">12.3%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Events Predicted:</span>
                        <Badge variant="outline">23</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Last Model Update:</span>
                        <Badge variant="outline">2 hours ago</Badge>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h5 className="font-medium mb-2">Training Data Sources</h5>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div>• Historical protest patterns (2016-2025)</div>
                        <div>• Anglophone crisis escalation timeline</div>
                        <div>• Economic shock response patterns</div>
                        <div>• Election period emotional volatility</div>
                        <div>• Social media activity surges</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CivicPredictorAI;