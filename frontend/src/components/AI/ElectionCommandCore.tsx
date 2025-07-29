import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Radar, 
  Satellite, 
  Search, 
  Megaphone, 
  TrendingUp, 
  MapPin, 
  Heart,
  AlertTriangle,
  Brain,
  Target,
  Activity,
  BarChart3,
  Zap,
  Clock
} from 'lucide-react';

const ElectionCommandCore = () => {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demo
  const manipulationAlerts = [
    { id: '1', type: 'Bot Network', severity: 'high', description: 'Coordinated hashtag campaign detected' },
    { id: '2', type: 'Fake Accounts', severity: 'medium', description: 'Suspicious account creation spike' }
  ];

  const trustScores = [
    { region: 'Centre', score: 72, sentiment: 75, disinformation: 68, promises: 70, credibility: 76 },
    { region: 'Littoral', score: 68, sentiment: 70, disinformation: 65, promises: 68, credibility: 69 },
    { region: 'North-West', score: 45, sentiment: 40, disinformation: 35, promises: 50, credibility: 55 },
    { region: 'South-West', score: 42, sentiment: 38, disinformation: 32, promises: 48, credibility: 50 }
  ];

  const volatilityData = [
    { region: 'North-West', risk: 'high', indicators: 85, factors: ['Separatist activity', 'Low trust'], confidence: 92 },
    { region: 'South-West', risk: 'high', indicators: 82, factors: ['Security concerns', 'Electoral distrust'], confidence: 88 },
    { region: 'Centre', risk: 'medium', indicators: 45, factors: ['Political tensions', 'Economic concerns'], confidence: 75 }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const activateElectionCore = () => {
    setIsActive(true);
    console.log('Election Command Core v2 Activated');
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-red-400';
      case 'medium': return 'bg-yellow-400';
      case 'low': return 'bg-green-400';
      default: return 'bg-gray-400';
    }
  };

  const getTrustColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded-lg w-64"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Shield className="h-10 w-10 text-primary animate-pulse" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-yellow-600 to-green-600 bg-clip-text text-transparent">
            ELECTION COMMAND CORE v2
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Defense-Grade Civic War Room - Predictive Risk Assessment & Electoral Intelligence
        </p>
        <div className="flex items-center justify-center gap-4">
          {!isActive ? (
            <Button onClick={activateElectionCore} className="bg-red-600 hover:bg-red-700">
              <Zap className="h-4 w-4 mr-2" />
              ACTIVATE WAR ROOM
            </Button>
          ) : (
            <Badge className="bg-green-600 text-white">
              <Activity className="h-3 w-3 mr-1" />
              ACTIVE - MONITORING
            </Badge>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manipulation Alerts</CardTitle>
            <Radar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{manipulationAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Active threats detected</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ground Activities</CardTitle>
            <Satellite className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">47</div>
            <p className="text-xs text-muted-foreground">Real-world observations</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Trust Score</CardTitle>
            <Heart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(trustScores.reduce((acc, item) => acc + item.score, 0) / trustScores.length)}%
            </div>
            <p className="text-xs text-muted-foreground">Civic confidence index</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turnout Forecast</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">67.5%</div>
            <p className="text-xs text-muted-foreground">Predicted voter turnout</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="war-room" className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="war-room">🎯 War Room</TabsTrigger>
          <TabsTrigger value="manipulation">🧠 Manipulation</TabsTrigger>
          <TabsTrigger value="ground">🛰️ Ground Intel</TabsTrigger>
          <TabsTrigger value="interference">📡 Interference</TabsTrigger>
          <TabsTrigger value="campaigns">🪧 Campaigns</TabsTrigger>
          <TabsTrigger value="forecast">📊 Forecast</TabsTrigger>
          <TabsTrigger value="trust">🧾 Trust Index</TabsTrigger>
          <TabsTrigger value="volatility">📍 Volatility</TabsTrigger>
        </TabsList>

        {/* War Room Overview */}
        <TabsContent value="war-room" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  Volatility Heatmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {volatilityData.map((region, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{region.region}</div>
                        <div className="text-sm text-muted-foreground">
                          {region.factors.slice(0, 2).join(', ')}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getThreatColor(region.risk)}>
                          {region.risk.toUpperCase()}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          {region.indicators}% risk
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-green-600" />
                  Trust Scores by Region
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trustScores.map((region, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{region.region}</span>
                        <span className={`font-bold ${getTrustColor(region.score)}`}>
                          {region.score}%
                        </span>
                      </div>
                      <Progress value={region.score} className="h-2" />
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>Sentiment: {region.sentiment}%</div>
                        <div>Disinfo: {region.disinformation}%</div>
                        <div>Promises: {region.promises}%</div>
                        <div>Credibility: {region.credibility}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Voter Manipulation Radar */}
        <TabsContent value="manipulation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Voter Manipulation Radar
              </CardTitle>
              <CardDescription>
                Detecting coordinated campaigns, bot networks, and disinformation patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">12</div>
                  <div className="text-sm text-muted-foreground">Bot Networks</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">8</div>
                  <div className="text-sm text-muted-foreground">Coordinated Hashtags</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">23</div>
                  <div className="text-sm text-muted-foreground">Paid Influencers</div>
                </div>
              </div>
              
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>High-confidence manipulation detected:</strong> Coordinated hashtag campaign 
                  "#VoteAgainstCorruption" showing artificial amplification patterns across 150+ accounts 
                  created in the last 48 hours.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ground Observer AI */}
        <TabsContent value="ground" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Satellite className="h-5 w-5 text-blue-600" />
                Ground Observer AI
              </CardTitle>
              <CardDescription>
                Real-world election monitoring from social media and citizen reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">WhatsApp</Badge>
                      <Badge variant="default">Douala</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs text-muted-foreground">2 hours ago</span>
                    </div>
                  </div>
                  <p className="text-sm mt-1">Long queues observed at polling station, peaceful atmosphere</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Facebook</Badge>
                      <Badge variant="secondary">Yaounde</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs text-muted-foreground">3 hours ago</span>
                    </div>
                  </div>
                  <p className="text-sm mt-1">Multiple reports of voting machines malfunctioning in Centre region</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Electoral Interference Scanner */}
        <TabsContent value="interference" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-red-600" />
                Electoral Interference Scanner
              </CardTitle>
              <CardDescription>
                Advanced detection of deepfakes, account manipulation, and foreign interference
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Threat Detection</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Deepfake Detection</span>
                      <Badge className="bg-green-600">CLEAR</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Account Creation Spikes</span>
                      <Badge className="bg-yellow-600">MONITORING</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Geo-fenced Propaganda</span>
                      <Badge className="bg-red-600">DETECTED</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Interference Metrics</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Foreign IP Activity</span>
                        <span>23%</span>
                      </div>
                      <Progress value={23} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Suspicious Accounts</span>
                        <span>67%</span>
                      </div>
                      <Progress value={67} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaign & Rally Tracker */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-green-600" />
                Campaign & Rally Tracker
              </CardTitle>
              <CardDescription>
                Monitoring political rallies, campaign themes, and speech analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Recent Rallies</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium">Douala Rally - CPDM</div>
                      <div className="text-sm text-muted-foreground">Est. 15,000 attendees</div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">Economic Development</Badge>
                        <Badge variant="outline">Unity</Badge>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium">Bamenda Rally - SDF</div>
                      <div className="text-sm text-muted-foreground">Est. 8,000 attendees</div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">Democratic Reform</Badge>
                        <Badge variant="outline">Federalism</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Theme Analysis</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Hope/Optimism</span>
                        <span>45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Fear/Security</span>
                        <span>30%</span>
                      </div>
                      <Progress value={30} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Ethnic References</span>
                        <span>15%</span>
                      </div>
                      <Progress value={15} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Civic Turnout Forecast Engine */}
        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Civic Turnout Forecast Engine
              </CardTitle>
              <CardDescription>
                AI-powered predictions based on sentiment, engagement, and historical patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-6 border rounded-lg">
                  <div className="text-4xl font-bold text-blue-600 mb-2">67.5%</div>
                  <div className="text-lg font-medium">Predicted Turnout</div>
                  <div className="text-sm text-muted-foreground">National Average</div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Regional Forecasts</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Centre Region</span>
                      <span className="font-medium">72%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Littoral</span>
                      <span className="font-medium">69%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>North-West</span>
                      <span className="font-medium text-red-600">35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>South-West</span>
                      <span className="font-medium text-red-600">32%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Election Trust Score */}
        <TabsContent value="trust" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-green-600" />
                Election Trust Score
              </CardTitle>
              <CardDescription>
                Real-time civic confidence index updated every 6 hours during election season
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {trustScores.map((region, idx) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold">{region.region}</h4>
                      <div className={`text-2xl font-bold ${getTrustColor(region.score)}`}>
                        {region.score}/100
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Sentiment</div>
                        <div className="font-medium">{region.sentiment}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Anti-Disinfo</div>
                        <div className="font-medium">{region.disinformation}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Promises Kept</div>
                        <div className="font-medium">{region.promises}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Credibility</div>
                        <div className="font-medium">{region.credibility}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Volatility Heatmap */}
        <TabsContent value="volatility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-red-600" />
                Volatility Heatmap
              </CardTitle>
              <CardDescription>
                Real-time regional risk assessment and flashpoint prediction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {volatilityData.map((region, idx) => (
                  <div key={idx} className="p-4 border-l-4 border-red-500 bg-red-50/30 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{region.region}</h4>
                        <Badge className={getThreatColor(region.risk)}>
                          {region.risk.toUpperCase()} RISK
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-600">
                          {region.indicators}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {region.confidence}% confidence
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="font-medium text-sm">Risk Factors:</div>
                      <div className="flex flex-wrap gap-2">
                        {region.factors.map((factor, factorIdx) => (
                          <Badge key={factorIdx} variant="outline" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ElectionCommandCore;