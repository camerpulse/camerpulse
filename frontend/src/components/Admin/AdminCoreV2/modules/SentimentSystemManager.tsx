import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Brain, MapPin, TrendingUp, Filter, Download, BarChart3, PieChart, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SentimentSystemManagerProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

const REGIONS = [
  'All Regions', 'Adamawa', 'Centre', 'East', 'Far North', 
  'Littoral', 'North', 'Northwest', 'South', 'Southwest', 'West'
];

const EMOTION_COLORS = {
  Positive: '#22c55e',
  Neutral: '#64748b', 
  Negative: '#ef4444',
  Angry: '#dc2626',
  Happy: '#10b981',
  Sad: '#f59e0b',
  Fearful: '#8b5cf6',
  Surprised: '#06b6d4'
};

export const SentimentSystemManager: React.FC<SentimentSystemManagerProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [emotionFilter, setEmotionFilter] = useState('all');
  const [enableRealTime, setEnableRealTime] = useState(true);

  // Mock sentiment data with trends
  const sentimentTrendData = [
    { time: '00:00', Positive: 35, Negative: 15, Neutral: 50 },
    { time: '04:00', Positive: 32, Negative: 18, Neutral: 50 },
    { time: '08:00', Positive: 28, Negative: 25, Neutral: 47 },
    { time: '12:00', Positive: 40, Negative: 20, Neutral: 40 },
    { time: '16:00', Positive: 45, Negative: 15, Neutral: 40 },
    { time: '20:00', Positive: 38, Negative: 22, Neutral: 40 },
  ];

  const emotionBreakdown = [
    { name: 'Positive', value: 35, change: '+5%' },
    { name: 'Neutral', value: 42, change: '-2%' },
    { name: 'Negative', value: 18, change: '-3%' },
    { name: 'Angry', value: 5, change: '+1%' }
  ];

  const regionalData = [
    { region: 'Centre', positive: 38, negative: 15, neutral: 47, total: 2450 },
    { region: 'Littoral', positive: 42, negative: 18, neutral: 40, total: 1890 },
    { region: 'Northwest', positive: 25, negative: 35, neutral: 40, total: 1654 },
    { region: 'Southwest', positive: 28, negative: 32, neutral: 40, total: 1203 },
    { region: 'West', positive: 45, negative: 12, neutral: 43, total: 980 }
  ];

  const exportData = () => {
    logActivity('sentiment_data_export', { 
      region: selectedRegion, 
      timeRange: selectedTimeRange,
      timestamp: new Date().toISOString() 
    });
    // Export implementation would go here
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Brain className="h-6 w-6 mr-2 text-indigo-600" />
            Sentiment System Management
          </h2>
          <p className="text-muted-foreground">AI-powered sentiment analysis and regional monitoring</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={enableRealTime} onCheckedChange={setEnableRealTime} />
            <span className="text-sm">Real-time updates</span>
          </div>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Analysis Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Region</Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Time Range</Label>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Emotion Filter</Label>
              <Select value={emotionFilter} onValueChange={setEmotionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Emotions</SelectItem>
                  <SelectItem value="positive">Positive Only</SelectItem>
                  <SelectItem value="negative">Negative Only</SelectItem>
                  <SelectItem value="neutral">Neutral Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Analysis
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Sentiment</p>
                <p className="text-2xl font-bold text-green-600">Positive</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-green-600 mt-2">+8% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Data Points</p>
                <p className="text-2xl font-bold">24.8K</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-blue-600 mt-2">Today's analysis</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Regions</p>
                <p className="text-2xl font-bold">9/10</p>
              </div>
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-purple-600 mt-2">Regional coverage</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-2xl font-bold">94.2%</p>
              </div>
              <PieChart className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-xs text-orange-600 mt-2">AI confidence</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Trends (24h)</CardTitle>
            <CardDescription>Real-time emotion tracking over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sentimentTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Positive" stroke="#22c55e" strokeWidth={2} />
                <Line type="monotone" dataKey="Negative" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="Neutral" stroke="#64748b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Emotion Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Emotion Distribution</CardTitle>
            <CardDescription>Current emotional breakdown with trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emotionBreakdown.map((emotion, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: EMOTION_COLORS[emotion.name as keyof typeof EMOTION_COLORS] }}
                    />
                    <span className="font-medium">{emotion.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{emotion.value}%</span>
                    <Badge variant={emotion.change.startsWith('+') ? 'default' : 'secondary'}>
                      {emotion.change}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Regional Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Regional Sentiment Map</CardTitle>
            <CardDescription>Sentiment breakdown by region</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="positive" fill="#22c55e" />
                <Bar dataKey="negative" fill="#ef4444" />
                <Bar dataKey="neutral" fill="#64748b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Issues by Sentiment */}
        <Card>
          <CardHeader>
            <CardTitle>Trending Issues</CardTitle>
            <CardDescription>Most discussed topics with sentiment scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { issue: 'Electricity Crisis', sentiment: 'negative', mentions: 2450, score: -0.7 },
                { issue: 'Road Infrastructure', sentiment: 'mixed', mentions: 1890, score: 0.1 },
                { issue: 'Education Reform', sentiment: 'positive', mentions: 1654, score: 0.6 },
                { issue: 'Healthcare Access', sentiment: 'negative', mentions: 1203, score: -0.3 }
              ].map((issue, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{issue.issue}</p>
                    <p className="text-sm text-muted-foreground">{issue.mentions.toLocaleString()} mentions</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      issue.sentiment === 'positive' ? 'default' : 
                      issue.sentiment === 'negative' ? 'destructive' : 'secondary'
                    }>
                      {issue.sentiment}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">Score: {issue.score}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
          <CardDescription>Configure sentiment analysis parameters and thresholds</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Alert Threshold (%)</Label>
                <Input type="number" placeholder="25" min="0" max="100" />
              </div>
              <div>
                <Label>Minimum Confidence</Label>
                <Input type="number" placeholder="0.8" min="0" max="1" step="0.1" />
              </div>
              <div className="flex items-center gap-2">
                <Switch />
                <Label>Enable Auto-Alerts</Label>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Analysis Window (hours)</Label>
                <Input type="number" placeholder="24" min="1" max="168" />
              </div>
              <div>
                <Label>Update Frequency (seconds)</Label>
                <Input type="number" placeholder="30" min="10" max="300" />
              </div>
              <div className="flex items-center gap-2">
                <Switch />
                <Label>Regional Breakdown</Label>
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="flex gap-4">
            <Button>Save Configuration</Button>
            <Button variant="outline">Reset to Default</Button>
            <Button variant="outline">Test Analysis</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};