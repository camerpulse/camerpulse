import React, { useState } from 'react';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, TrendingUp, Target, Zap, Database, 
  BarChart3, AlertTriangle, CheckCircle, Eye, Cpu
} from 'lucide-react';

interface MachineLearningAnalyticsModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const MachineLearningAnalyticsModule: React.FC<MachineLearningAnalyticsModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('models');

  const mlModels = [
    {
      id: 1,
      name: 'Sentiment Prediction Model',
      type: 'Classification',
      status: 'active',
      accuracy: 94.2,
      lastTrained: '2024-01-14 16:00',
      predictions24h: 12450,
      confidence: 96.8,
      dataPoints: 850000,
      version: 'v2.1.0'
    },
    {
      id: 2,
      name: 'Political Trend Forecaster',
      type: 'Time Series',
      status: 'training',
      accuracy: 89.7,
      lastTrained: '2024-01-15 10:30',
      predictions24h: 0,
      confidence: 0,
      dataPoints: 234000,
      version: 'v1.8.2'
    },
    {
      id: 3,
      name: 'User Engagement Predictor',
      type: 'Regression',
      status: 'active',
      accuracy: 91.5,
      lastTrained: '2024-01-13 14:20',
      predictions24h: 8970,
      confidence: 94.1,
      dataPoints: 567000,
      version: 'v3.0.1'
    },
    {
      id: 4,
      name: 'Fraud Detection System',
      type: 'Anomaly Detection',
      status: 'active',
      accuracy: 98.9,
      lastTrained: '2024-01-15 08:00',
      predictions24h: 3420,
      confidence: 99.2,
      dataPoints: 1200000,
      version: 'v1.5.4'
    }
  ];

  const predictionResults = [
    {
      id: 1,
      model: 'Political Trend Forecaster',
      prediction: 'Increased political engagement in North Region',
      confidence: 87.3,
      timeframe: 'Next 7 days',
      impact: 'high',
      dataSource: 'Social media, news, polls',
      generatedAt: '2024-01-15 14:30'
    },
    {
      id: 2,
      model: 'User Engagement Predictor',
      prediction: 'Mobile app usage will peak on January 20th',
      confidence: 92.1,
      timeframe: 'Next 5 days',
      impact: 'medium',
      dataSource: 'User behavior analytics',
      generatedAt: '2024-01-15 13:45'
    },
    {
      id: 3,
      model: 'Sentiment Prediction Model',
      prediction: 'Positive sentiment shift in economic discussions',
      confidence: 89.4,
      timeframe: 'Next 3 days',
      impact: 'high',
      dataSource: 'News articles, social posts',
      generatedAt: '2024-01-15 12:20'
    }
  ];

  const dataProcessing = [
    {
      id: 1,
      pipeline: 'Real-time Sentiment Analysis',
      status: 'running',
      processed24h: 45230,
      averageLatency: '125ms',
      throughput: '850 req/min',
      errorRate: 0.2,
      lastUpdate: '2024-01-15 14:55'
    },
    {
      id: 2,
      pipeline: 'User Behavior Analytics',
      status: 'running',
      processed24h: 23450,
      averageLatency: '89ms',
      throughput: '420 req/min',
      errorRate: 0.1,
      lastUpdate: '2024-01-15 14:54'
    },
    {
      id: 3,
      pipeline: 'Content Classification',
      status: 'paused',
      processed24h: 0,
      averageLatency: 'N/A',
      throughput: '0 req/min',
      errorRate: 0,
      lastUpdate: '2024-01-14 18:30'
    }
  ];

  const modelPerformance = [
    {
      id: 1,
      metric: 'Overall Model Accuracy',
      current: 93.8,
      target: 95.0,
      trend: 'improving',
      change: '+2.1%',
      period: 'this month'
    },
    {
      id: 2,
      metric: 'Prediction Confidence',
      current: 94.7,
      target: 92.0,
      trend: 'stable',
      change: '+0.3%',
      period: 'this week'
    },
    {
      id: 3,
      metric: 'Processing Speed',
      current: 98.2,
      target: 95.0,
      trend: 'improving',
      change: '+5.4%',
      period: 'this week'
    },
    {
      id: 4,
      metric: 'Data Quality Score',
      current: 91.4,
      target: 90.0,
      trend: 'stable',
      change: '+0.8%',
      period: 'this month'
    }
  ];

  const handleTrainModel = (modelId: number) => {
    logActivity('ml_model_train', { model_id: modelId });
  };

  const handleDeployModel = (modelId: number) => {
    logActivity('ml_model_deploy', { model_id: modelId });
  };

  const handleStartPipeline = (pipelineId: number) => {
    logActivity('ml_pipeline_start', { pipeline_id: pipelineId });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'training':
        return <Cpu className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'paused':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-600 rotate-90" />;
    }
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Machine Learning Analytics"
        description="Advanced ML models, predictions, and data processing pipelines"
        icon={Brain}
        iconColor="text-blue-600"
        onRefresh={() => {
          logActivity('ml_analytics_refresh', { timestamp: new Date() });
        }}
      />

      {/* ML Analytics Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Models"
          value="12"
          icon={Brain}
          description="ML models in production"
          badge={{ text: "High Performance", variant: "default" }}
        />
        <StatCard
          title="Predictions/Day"
          value="24.8K"
          icon={Target}
          trend={{ value: 15.2, isPositive: true, period: "vs yesterday" }}
          description="Model predictions generated"
        />
        <StatCard
          title="Accuracy Score"
          value="94.2%"
          icon={CheckCircle}
          trend={{ value: 2.1, isPositive: true, period: "this month" }}
          description="Average model accuracy"
        />
        <StatCard
          title="Processing Speed"
          value="125ms"
          icon={Zap}
          trend={{ value: -15, isPositive: true, period: "avg latency" }}
          description="Average response time"
        />
      </div>

      {/* ML Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="models">ML Models</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="pipelines">Data Processing</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Machine Learning Models
              </CardTitle>
              <CardDescription>
                Monitor and manage ML models in your system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mlModels.map((model) => (
                  <div key={model.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(model.status)}
                        <div>
                          <h4 className="font-semibold">{model.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{model.type}</Badge>
                            <span>v{model.version}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            model.status === 'active' ? 'default' :
                            model.status === 'training' ? 'secondary' : 'outline'
                          }
                        >
                          {model.status}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleTrainModel(model.id)}
                        >
                          {model.status === 'training' ? 'Training...' : 'Retrain'}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Accuracy:</span>
                        <p className="font-medium">{model.accuracy}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Predictions (24h):</span>
                        <p className="font-medium">{model.predictions24h.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Confidence:</span>
                        <p className="font-medium">{model.confidence}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Data Points:</span>
                        <p className="font-medium">{model.dataPoints.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Model Accuracy</span>
                        <span>{model.accuracy}%</span>
                      </div>
                      <Progress value={model.accuracy} className="h-2" />
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Last trained: {model.lastTrained}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                ML Predictions & Insights
              </CardTitle>
              <CardDescription>
                Latest predictions and forecasts from your ML models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictionResults.map((prediction) => (
                  <div key={prediction.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{prediction.model}</Badge>
                          <Badge className={getImpactColor(prediction.impact)}>
                            {prediction.impact} impact
                          </Badge>
                        </div>
                        <h4 className="font-semibold mb-2">{prediction.prediction}</h4>
                        <p className="text-sm text-muted-foreground">
                          Data sources: {prediction.dataSource}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {prediction.confidence}%
                        </div>
                        <p className="text-sm text-muted-foreground">confidence</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Timeframe:</span>
                        <p className="font-medium">{prediction.timeframe}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Generated:</span>
                        <p className="font-medium">{prediction.generatedAt}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Prediction Confidence</span>
                        <span>{prediction.confidence}%</span>
                      </div>
                      <Progress value={prediction.confidence} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipelines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Processing Pipelines
              </CardTitle>
              <CardDescription>
                Monitor real-time data processing and ML pipelines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataProcessing.map((pipeline) => (
                  <div key={pipeline.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(pipeline.status)}
                        <div>
                          <h4 className="font-semibold">{pipeline.pipeline}</h4>
                          <p className="text-sm text-muted-foreground">
                            Last update: {pipeline.lastUpdate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            pipeline.status === 'running' ? 'default' : 'secondary'
                          }
                        >
                          {pipeline.status}
                        </Badge>
                        <Button 
                          size="sm" 
                          onClick={() => handleStartPipeline(pipeline.id)}
                        >
                          {pipeline.status === 'running' ? 'Stop' : 'Start'}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Processed (24h):</span>
                        <p className="font-medium">{pipeline.processed24h.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Latency:</span>
                        <p className="font-medium">{pipeline.averageLatency}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Throughput:</span>
                        <p className="font-medium">{pipeline.throughput}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Error Rate:</span>
                        <p className="font-medium">{pipeline.errorRate}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                Track ML system performance and optimization metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modelPerformance.map((metric) => (
                  <div key={metric.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                          <BarChart3 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{metric.metric}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {getTrendIcon(metric.trend)}
                            <span>{metric.change} {metric.period}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {metric.current}%
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Target: {metric.target}%
                        </p>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Performance Score</span>
                        <span>{metric.current}%</span>
                      </div>
                      <Progress 
                        value={Math.min((metric.current / metric.target) * 100, 100)} 
                        className="h-2" 
                      />
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