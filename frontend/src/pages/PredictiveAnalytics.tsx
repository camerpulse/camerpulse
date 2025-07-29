import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Vote,
  Target,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Zap,
  Settings,
  Download,
  Eye
} from 'lucide-react';

const PredictiveAnalytics = () => {
  const [selectedModel, setSelectedModel] = useState('civic_participation');

  const predictionModels = [
    {
      id: 'civic_participation',
      name: 'Civic Participation Predictor',
      type: 'Engagement Forecast',
      accuracy: 87.3,
      lastTrained: '2024-01-15',
      status: 'active',
      description: 'Predicts future civic engagement levels based on historical trends and demographic data'
    },
    {
      id: 'voter_turnout',
      name: 'Election Turnout Model',
      type: 'Voter Turnout',
      accuracy: 82.1,
      lastTrained: '2024-01-10',
      status: 'active',
      description: 'Forecasts voter turnout for upcoming elections using historical voting patterns'
    },
    {
      id: 'sentiment_trend',
      name: 'Public Sentiment Forecaster',
      type: 'Sentiment Trend',
      accuracy: 79.8,
      lastTrained: '2024-01-12',
      status: 'training',
      description: 'Predicts future sentiment trends based on current public opinion dynamics'
    },
    {
      id: 'policy_impact',
      name: 'Policy Impact Analyzer',
      type: 'Policy Outcome',
      accuracy: 74.5,
      lastTrained: '2024-01-08',
      status: 'active',
      description: 'Estimates the potential impact and public reception of proposed policies'
    }
  ];

  const currentPredictions = [
    {
      id: 1,
      title: 'Civic Participation Rate - Next 30 Days',
      predicted_value: 73.2,
      confidence: 87.3,
      trend: 'increasing',
      change: '+5.4%',
      timeframe: '30 days',
      factors: ['Historical patterns', 'Seasonal trends', 'Recent policy announcements'],
      risk_level: 'low'
    },
    {
      id: 2,
      title: 'Voter Turnout - Next Election',
      predicted_value: 68.7,
      confidence: 82.1,
      trend: 'stable',
      change: '+1.2%',
      timeframe: '6 months',
      factors: ['Demographics', 'Political climate', 'Registration campaigns'],
      risk_level: 'medium'
    },
    {
      id: 3,
      title: 'Education Engagement - Q2 2024',
      predicted_value: 45.1,
      confidence: 78.9,
      trend: 'increasing',
      change: '+2.8%',
      timeframe: '90 days',
      factors: ['Content quality', 'User feedback', 'Platform improvements'],
      risk_level: 'low'
    },
    {
      id: 4,
      title: 'Public Sentiment - Healthcare Policy',
      predicted_value: 62.3,
      confidence: 74.5,
      trend: 'increasing',
      change: '+8.1%',
      timeframe: '60 days',
      factors: ['Media coverage', 'Policy details', 'Implementation timeline'],
      risk_level: 'medium'
    }
  ];

  const regionalPredictions = [
    { region: 'Centre', participation: 75.2, turnout: 71.3, confidence: 85.1 },
    { region: 'Littoral', participation: 72.8, turnout: 69.7, confidence: 83.4 },
    { region: 'West', participation: 69.5, turnout: 66.2, confidence: 81.8 },
    { region: 'Northwest', participation: 64.1, turnout: 62.8, confidence: 78.9 },
    { region: 'Southwest', participation: 62.7, turnout: 61.5, confidence: 77.2 },
    { region: 'North', participation: 67.3, turnout: 64.9, confidence: 79.6 },
    { region: 'East', participation: 70.8, turnout: 67.4, confidence: 82.3 },
    { region: 'Adamawa', participation: 65.9, turnout: 63.1, confidence: 78.5 },
    { region: 'South', participation: 71.4, turnout: 68.8, confidence: 83.0 },
    { region: 'Far North', participation: 63.2, turnout: 60.7, confidence: 76.8 }
  ];

  const demographicPredictions = [
    { demographic: 'Youth (18-25)', participation: 58.3, engagement: 42.7, growth: '+15.2%' },
    { demographic: 'Young Adults (26-35)', participation: 72.1, engagement: 68.4, growth: '+8.7%' },
    { demographic: 'Middle Age (36-50)', participation: 78.9, engagement: 75.2, growth: '+3.4%' },
    { demographic: 'Seniors (50+)', participation: 82.4, engagement: 79.8, growth: '+1.8%' },
    { demographic: 'Urban Population', participation: 75.6, engagement: 71.3, growth: '+6.9%' },
    { demographic: 'Rural Population', participation: 64.2, engagement: 58.7, growth: '+12.1%' }
  ];

  const modelMetrics = {
    civic_participation: {
      accuracy: 87.3,
      precision: 85.1,
      recall: 89.4,
      f1_score: 87.2,
      predictions_made: 1247,
      successful_predictions: 1088
    },
    voter_turnout: {
      accuracy: 82.1,
      precision: 80.5,
      recall: 83.7,
      f1_score: 82.1,
      predictions_made: 892,
      successful_predictions: 732
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'decreasing': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default: return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500 hover:bg-green-600';
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'high': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'training': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Brain className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Predictive Analytics</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            AI-powered forecasting for civic engagement, voting patterns, and policy outcomes
          </p>
        </div>

        {/* Model Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {predictionModels.map((model) => (
            <Card 
              key={model.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedModel === model.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedModel(model.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  {getStatusIcon(model.status)}
                </div>
                <div className="space-y-2">
                  <div className="font-semibold text-sm">{model.name}</div>
                  <div className="text-xs text-muted-foreground">{model.type}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Accuracy</span>
                    <span className="text-sm font-semibold">{model.accuracy}%</span>
                  </div>
                  <Progress value={model.accuracy} className="h-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="current" className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <TabsList className="w-fit">
              <TabsTrigger value="current">Current Predictions</TabsTrigger>
              <TabsTrigger value="regional">Regional Forecasts</TabsTrigger>
              <TabsTrigger value="demographic">Demographics</TabsTrigger>
              <TabsTrigger value="models">Model Performance</TabsTrigger>
            </TabsList>

            <div className="flex space-x-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Predictions
              </Button>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Model Settings
              </Button>
              <Button>
                <Zap className="w-4 h-4 mr-2" />
                Generate New
              </Button>
            </div>
          </div>

          <TabsContent value="current" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currentPredictions.map((prediction) => (
                <Card key={prediction.id} className="hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{prediction.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={getRiskColor(prediction.risk_level)}>
                            {prediction.risk_level} risk
                          </Badge>
                          <Badge variant="outline">
                            {prediction.timeframe}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Prediction Value */}
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-3xl font-bold text-primary mb-2">
                          {prediction.predicted_value}%
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          {getTrendIcon(prediction.trend)}
                          <span className="text-sm font-medium">{prediction.change}</span>
                        </div>
                      </div>

                      {/* Confidence Score */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Confidence Level</span>
                          <span className="font-medium">{prediction.confidence}%</span>
                        </div>
                        <Progress value={prediction.confidence} className="h-2" />
                      </div>

                      {/* Contributing Factors */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Key Factors:</div>
                        <div className="space-y-1">
                          {prediction.factors.map((factor, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                              <span>{factor}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Calendar className="w-4 h-4 mr-2" />
                          Track
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="regional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Regional Predictions</CardTitle>
                <CardDescription>
                  Forecasted civic engagement and voter turnout by region
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {regionalPredictions.map((region, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="font-medium">{region.region}</div>
                      
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Civic Participation</div>
                        <div className="font-semibold">{region.participation}%</div>
                        <Progress value={region.participation} className="h-1" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Voter Turnout</div>
                        <div className="font-semibold">{region.turnout}%</div>
                        <Progress value={region.turnout} className="h-1" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Confidence</div>
                        <div className="font-semibold">{region.confidence}%</div>
                        <Progress value={region.confidence} className="h-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demographic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Demographic Predictions</CardTitle>
                <CardDescription>
                  Engagement forecasts across different demographic groups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demographicPredictions.map((demo, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="font-medium">{demo.demographic}</div>
                      
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Participation Rate</div>
                        <div className="font-semibold">{demo.participation}%</div>
                        <Progress value={demo.participation} className="h-1" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Engagement Score</div>
                        <div className="font-semibold">{demo.engagement}%</div>
                        <Progress value={demo.engagement} className="h-1" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Projected Growth</div>
                        <div className="font-semibold text-green-600">{demo.growth}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Model Performance Metrics</CardTitle>
                  <CardDescription>
                    Statistical performance of prediction models
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(modelMetrics).map(([modelId, metrics]) => {
                      const model = predictionModels.find(m => m.id === modelId);
                      return (
                        <div key={modelId} className="space-y-3">
                          <div className="font-medium">{model?.name}</div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">Accuracy</div>
                              <div className="font-semibold">{metrics.accuracy}%</div>
                              <Progress value={metrics.accuracy} className="h-1" />
                            </div>
                            
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">Precision</div>
                              <div className="font-semibold">{metrics.precision}%</div>
                              <Progress value={metrics.precision} className="h-1" />
                            </div>
                            
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">Recall</div>
                              <div className="font-semibold">{metrics.recall}%</div>
                              <Progress value={metrics.recall} className="h-1" />
                            </div>
                            
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">F1 Score</div>
                              <div className="font-semibold">{metrics.f1_score}%</div>
                              <Progress value={metrics.f1_score} className="h-1" />
                            </div>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            {metrics.successful_predictions}/{metrics.predictions_made} successful predictions
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Model Training Schedule</CardTitle>
                  <CardDescription>
                    Upcoming model training and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {predictionModels.map((model, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(model.status)}
                          <div>
                            <div className="font-medium text-sm">{model.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Last trained: {model.lastTrained}
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          {model.status === 'training' ? 'View Progress' : 'Retrain'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PredictiveAnalytics;