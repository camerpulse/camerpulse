import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Search, Download, TrendingUp, TrendingDown, AlertTriangle, Activity, Heart, Zap, Smile, Frown, Angry } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TimelineData {
  id: string;
  subject_type: string;
  subject_name: string;
  date: string;
  sentiment_score: number;
  emotions: Record<string, number>;
  trust_ratio: number;
  approval_rating: number;
  region?: string;
  age_group?: string;
}

interface SpikeData {
  id: string;
  date: string;
  subject_name: string;
  spike_type: string;
  spike_intensity: number;
  detected_cause?: string;
  event_title?: string;
  confidence_score: number;
}

interface SentimentTimelineProps {
  className?: string;
}

const CivicSentimentTimeline: React.FC<SentimentTimelineProps> = ({ className }) => {
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [spikes, setSpikes] = useState<SpikeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectType, setSubjectType] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [dateRange, setDateRange] = useState("3months");
  const [activeView, setActiveView] = useState("timeline");
  const { toast } = useToast();

  // Fetch sentiment timeline data
  const fetchTimelineData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_sentiment_timeline', {
        p_subject_type: subjectType === 'all' ? null : subjectType,
        p_subject_name: searchQuery || null,
        p_region: selectedRegion === 'all' ? null : selectedRegion,
        p_start_date: getStartDate(dateRange),
        p_end_date: new Date().toISOString().split('T')[0]
      });

      if (error) throw error;

      const result = data as any;
      setTimelineData(result?.timeline || []);
      setSpikes(result?.spikes || []);
    } catch (error) {
      console.error('Error fetching timeline data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch timeline data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = (range: string) => {
    const now = new Date();
    switch (range) {
      case '1month':
        return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString().split('T')[0];
      case '3months':
        return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).toISOString().split('T')[0];
      case '6months':
        return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).toISOString().split('T')[0];
      case '1year':
        return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString().split('T')[0];
      default:
        return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).toISOString().split('T')[0];
    }
  };

  useEffect(() => {
    fetchTimelineData();
  }, [subjectType, selectedRegion, dateRange]);

  const getSentimentColor = (score: number) => {
    if (score >= 30) return "hsl(var(--success))";
    if (score >= -10) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  const getSentimentLabel = (score: number) => {
    if (score >= 50) return "Very Positive";
    if (score >= 20) return "Positive";
    if (score >= -10) return "Neutral";
    if (score >= -40) return "Negative";
    return "Very Negative";
  };

  const getEmotionIcon = (emotion: string, intensity: number) => {
    const size = Math.max(12, intensity * 24);
    const opacity = Math.max(0.3, intensity);
    
    switch (emotion) {
      case 'joy':
        return <Smile size={size} style={{ opacity }} className="text-yellow-500" />;
      case 'anger':
        return <Angry size={size} style={{ opacity }} className="text-red-500" />;
      case 'fear':
        return <AlertTriangle size={size} style={{ opacity }} className="text-orange-500" />;
      case 'hope':
        return <Heart size={size} style={{ opacity }} className="text-green-500" />;
      case 'sadness':
        return <Frown size={size} style={{ opacity }} className="text-blue-500" />;
      default:
        return <Activity size={size} style={{ opacity }} className="text-muted-foreground" />;
    }
  };

  // Process data for charts
  const chartData = timelineData.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sentiment: item.sentiment_score,
    trust: item.trust_ratio,
    approval: item.approval_rating,
    subject: item.subject_name
  }));

  const emotionChartData = timelineData.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    joy: (item.emotions.joy || 0) * 100,
    anger: (item.emotions.anger || 0) * 100,
    fear: (item.emotions.fear || 0) * 100,
    hope: (item.emotions.hope || 0) * 100,
    sadness: (item.emotions.sadness || 0) * 100
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            📆 Civic Sentiment Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <Label htmlFor="search">Search Subject</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="e.g. Paul Biya, RDPC, Fuel Prices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="subject-type">Subject Type</Label>
              <Select value={subjectType} onValueChange={setSubjectType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="politician">Politicians</SelectItem>
                  <SelectItem value="party">Political Parties</SelectItem>
                  <SelectItem value="issue">National Issues</SelectItem>
                  <SelectItem value="government_branch">Government Branches</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="region">Region</Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="Centre">Centre</SelectItem>
                  <SelectItem value="Littoral">Littoral</SelectItem>
                  <SelectItem value="West">West</SelectItem>
                  <SelectItem value="Northwest">Northwest</SelectItem>
                  <SelectItem value="Southwest">Southwest</SelectItem>
                  <SelectItem value="East">East</SelectItem>
                  <SelectItem value="Adamawa">Adamawa</SelectItem>
                  <SelectItem value="North">North</SelectItem>
                  <SelectItem value="Far North">Far North</SelectItem>
                  <SelectItem value="South">South</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date-range">Time Period</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">Last Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={fetchTimelineData} disabled={loading}>
              {loading ? "Loading..." : "Search Timeline"}
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">📊 Timeline View</TabsTrigger>
          <TabsTrigger value="emotions">🎭 Emotions</TabsTrigger>
          <TabsTrigger value="spikes">⚡ Spike Analysis</TabsTrigger>
          <TabsTrigger value="compare">🔍 Compare</TabsTrigger>
        </TabsList>

        {/* Timeline View */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Trends Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[-100, 100]} />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        `${value}%`,
                        name.charAt(0).toUpperCase() + name.slice(1)
                      ]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="sentiment" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      name="Sentiment Score"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="trust" 
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={2}
                      name="Trust Ratio"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="approval" 
                      stroke="hsl(var(--chart-3))" 
                      strokeWidth={2}
                      name="Approval Rating"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No timeline data found. Try adjusting your search filters.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline Summary Cards */}
          {timelineData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Average Sentiment</p>
                      <p className="text-2xl font-bold">
                        {Math.round(timelineData.reduce((acc, item) => acc + item.sentiment_score, 0) / timelineData.length)}%
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Data Points</p>
                      <p className="text-2xl font-bold">{timelineData.length}</p>
                    </div>
                    <Activity className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Detected Spikes</p>
                      <p className="text-2xl font-bold">{spikes.length}</p>
                    </div>
                    <Zap className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Emotions View */}
        <TabsContent value="emotions">
          <Card>
            <CardHeader>
              <CardTitle>Emotional Breakdown Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {emotionChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={emotionChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value: any) => [`${value}%`]} />
                    <Legend />
                    <Area type="monotone" dataKey="joy" stackId="1" stroke="#eab308" fill="#eab308" fillOpacity={0.6} name="Joy" />
                    <Area type="monotone" dataKey="hope" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} name="Hope" />
                    <Area type="monotone" dataKey="anger" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Anger" />
                    <Area type="monotone" dataKey="fear" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.6} name="Fear" />
                    <Area type="monotone" dataKey="sadness" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Sadness" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No emotion data found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spike Analysis */}
        <TabsContent value="spikes">
          <Card>
            <CardHeader>
              <CardTitle>🧠 AI Spike Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {spikes.length > 0 ? (
                <div className="space-y-4">
                  {spikes.map((spike) => (
                    <div key={spike.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={spike.spike_type === 'positive' ? 'default' : 'destructive'}>
                              {spike.spike_type === 'positive' ? '📈' : '📉'} {spike.spike_type}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(spike.date).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-semibold">{spike.subject_name}</h4>
                          {spike.event_title && (
                            <p className="text-sm text-muted-foreground mt-1">{spike.event_title}</p>
                          )}
                          {spike.detected_cause && (
                            <p className="text-sm mt-2">{spike.detected_cause}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {Math.round(spike.spike_intensity)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round(spike.confidence_score * 100)}% confidence
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No significant spikes detected in the selected timeframe.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compare View */}
        <TabsContent value="compare">
          <Card>
            <CardHeader>
              <CardTitle>🔍 Subject Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Comparison feature coming soon. This will allow side-by-side analysis of multiple subjects.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CivicSentimentTimeline;