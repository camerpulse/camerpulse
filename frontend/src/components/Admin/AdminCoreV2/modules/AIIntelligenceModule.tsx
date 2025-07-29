import React, { useState } from 'react';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, Zap, Eye, AlertTriangle, TrendingUp, Clock, 
  Settings, Activity, Target, Database, Shield, Layers
} from 'lucide-react';

interface AIIntelligenceModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const AIIntelligenceModule: React.FC<AIIntelligenceModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('insights');

  // Mock data - replace with real data
  const aiInsights = [
    { 
      id: 1, 
      title: 'Unusual Voting Pattern Detected', 
      type: 'fraud_detection', 
      confidence: 0.89, 
      priority: 'high',
      affected_entities: 3,
      created_at: '2024-01-15T10:30:00Z'
    },
    { 
      id: 2, 
      title: 'Economic Sentiment Shift in Douala', 
      type: 'sentiment_analysis', 
      confidence: 0.76, 
      priority: 'medium',
      affected_entities: 1,
      created_at: '2024-01-15T09:15:00Z'
    },
    { 
      id: 3, 
      title: 'Potential Infrastructure Crisis in North Region', 
      type: 'predictive_alert', 
      confidence: 0.94, 
      priority: 'critical',
      affected_entities: 12,
      created_at: '2024-01-15T08:45:00Z'
    }
  ];

  const intelligenceAlerts = [
    { id: 1, message: 'Spike in negative sentiment regarding healthcare', severity: 'high', region: 'Centre', status: 'active' },
    { id: 2, message: 'Anomalous political campaign funding detected', severity: 'critical', region: 'Littoral', status: 'investigating' },
    { id: 3, message: 'Public trust index declining in education sector', severity: 'medium', region: 'West', status: 'monitoring' }
  ];

  const trendingTopics = [
    { id: 1, topic: 'Government Transparency', mentions: 15600, sentiment: 0.72, trend: 'rising' },
    { id: 2, topic: 'Infrastructure Development', mentions: 12400, sentiment: 0.68, trend: 'stable' },
    { id: 3, topic: 'Youth Employment', mentions: 9800, sentiment: 0.45, trend: 'declining' },
    { id: 4, topic: 'Healthcare Access', mentions: 8900, sentiment: 0.38, trend: 'rising' }
  ];

  const aiGenerationSchedule = [
    { id: 1, name: 'Daily Civic Insights', frequency: 'daily', last_run: '2024-01-15T06:00:00Z', next_run: '2024-01-16T06:00:00Z', status: 'active' },
    { id: 2, name: 'Weekly Political Analysis', frequency: 'weekly', last_run: '2024-01-14T12:00:00Z', next_run: '2024-01-21T12:00:00Z', status: 'active' },
    { id: 3, name: 'Monthly Economic Forecast', frequency: 'monthly', last_run: '2024-01-01T00:00:00Z', next_run: '2024-02-01T00:00:00Z', status: 'pending' }
  ];

  const handleAcknowledgeInsight = (id: number) => {
    logActivity('ai_insight_acknowledged', { insight_id: id });
  };

  const handleInvestigateAlert = (id: number) => {
    logActivity('intelligence_alert_investigated', { alert_id: id });
  };

  const handleRunGeneration = (id: number) => {
    logActivity('ai_generation_triggered', { schedule_id: id });
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="AI Intelligence & Insights"
        description="Advanced AI-powered intelligence generation and automated insights"
        icon={Brain}
        iconColor="text-purple-600"
        badge={{
          text: "Neural Network",
          variant: "default"
        }}
        searchPlaceholder="Search insights, alerts, trends..."
        onSearch={(query) => {
          console.log('Searching intelligence:', query);
        }}
        onRefresh={() => {
          logActivity('ai_intelligence_refresh', { timestamp: new Date() });
        }}
      />

      {/* AI Intelligence Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="AI Insights"
          value="1,247"
          icon={Brain}
          trend={{ value: 18.2, isPositive: true, period: "this week" }}
          description="Generated this month"
        />
        <StatCard
          title="Active Alerts"
          value="23"
          icon={AlertTriangle}
          description="Requiring attention"
          badge={{ text: "High Priority", variant: "destructive" }}
        />
        <StatCard
          title="Prediction Accuracy"
          value="92.4%"
          icon={Target}
          trend={{ value: 3.1, isPositive: true, period: "this month" }}
          description="Model performance"
        />
        <StatCard
          title="Data Processing"
          value="2.8M"
          icon={Database}
          description="Records processed daily"
          badge={{ text: "Real-time", variant: "default" }}
        />
      </div>

      {/* AI Intelligence Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="alerts">Intelligence Alerts</TabsTrigger>
          <TabsTrigger value="trends">Trending Topics</TabsTrigger>
          <TabsTrigger value="schedule">Generation Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Generated Insights
              </CardTitle>
              <CardDescription>
                Automated insights generated from cross-platform data analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiInsights.map((insight) => (
                  <div key={insight.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        insight.priority === 'critical' ? 'bg-red-100' :
                        insight.priority === 'high' ? 'bg-orange-100' : 'bg-blue-100'
                      }`}>
                        <Brain className={`h-6 w-6 ${
                          insight.priority === 'critical' ? 'text-red-600' :
                          insight.priority === 'high' ? 'text-orange-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{insight.title}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <Badge variant="outline">{insight.type.replace('_', ' ')}</Badge>
                          <span>Confidence: {(insight.confidence * 100).toFixed(1)}%</span>
                          <span>{insight.affected_entities} entities</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          insight.priority === 'critical' ? 'destructive' :
                          insight.priority === 'high' ? 'secondary' : 'outline'
                        }
                      >
                        {insight.priority}
                      </Badge>
                      <Button 
                        size="sm" 
                        onClick={() => handleAcknowledgeInsight(insight.id)}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Intelligence Alerts
              </CardTitle>
              <CardDescription>
                Real-time alerts from intelligence monitoring systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {intelligenceAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        alert.severity === 'critical' ? 'bg-red-100' :
                        alert.severity === 'high' ? 'bg-orange-100' : 'bg-yellow-100'
                      }`}>
                        <AlertTriangle className={`h-6 w-6 ${
                          alert.severity === 'critical' ? 'text-red-600' :
                          alert.severity === 'high' ? 'text-orange-600' : 'text-yellow-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{alert.message}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>Region: {alert.region}</span>
                          <Badge variant="outline">{alert.status}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          alert.severity === 'critical' ? 'destructive' :
                          alert.severity === 'high' ? 'secondary' : 'outline'
                        }
                      >
                        {alert.severity}
                      </Badge>
                      {alert.status === 'active' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleInvestigateAlert(alert.id)}
                        >
                          Investigate
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trending Topics Detection
              </CardTitle>
              <CardDescription>
                AI-detected trending topics and sentiment analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendingTopics.map((topic) => (
                  <div key={topic.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        topic.trend === 'rising' ? 'bg-green-100' :
                        topic.trend === 'declining' ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        <TrendingUp className={`h-6 w-6 ${
                          topic.trend === 'rising' ? 'text-green-600' :
                          topic.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{topic.topic}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{topic.mentions.toLocaleString()} mentions</span>
                          <span>Sentiment: {(topic.sentiment * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={
                          topic.trend === 'rising' ? 'default' :
                          topic.trend === 'declining' ? 'destructive' : 'secondary'
                        }
                      >
                        {topic.trend}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                AI Generation Schedule
              </CardTitle>
              <CardDescription>
                Manage automated AI insight generation schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiGenerationSchedule.map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-lg flex items-center justify-center">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{schedule.name}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>Frequency: {schedule.frequency}</span>
                          <span>Last run: {new Date(schedule.last_run).toLocaleDateString()}</span>
                          <span>Next run: {new Date(schedule.next_run).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={schedule.status === 'active' ? 'default' : 'secondary'}
                      >
                        {schedule.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        onClick={() => handleRunGeneration(schedule.id)}
                      >
                        Run Now
                      </Button>
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