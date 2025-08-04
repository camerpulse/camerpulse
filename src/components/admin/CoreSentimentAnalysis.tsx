import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SentimentData {
  id: string;
  content_id?: string;
  content_type: string;
  content_text: string;
  sentiment_score: number;
  sentiment_label: string;
  confidence_score: number;
  region?: string;
  language: string;
  analyzed_at: string;
  created_at: string;
}

export const CoreSentimentAnalysis = () => {
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [newAnalysis, setNewAnalysis] = useState({
    content_type: 'post',
    content_text: '',
    region: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSentimentData();
  }, []);

  const fetchSentimentData = async () => {
    try {
      const { data, error } = await supabase
        .from('core_sentiment_analysis')
        .select('*')
        .order('analyzed_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSentimentData(data || []);
    } catch (error) {
      console.error('Error fetching sentiment data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sentiment data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeSentiment = async (text: string): Promise<{ score: number; label: string; confidence: number }> => {
    // Simple sentiment analysis - in production, this would call an AI service
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'happy', 'love', 'perfect', 'best'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disgusting', 'sad', 'angry'];
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
    
    const total = positiveCount + negativeCount;
    if (total === 0) {
      return { score: 0, label: 'neutral', confidence: 0.5 };
    }
    
    const score = (positiveCount - negativeCount) / words.length;
    const normalizedScore = Math.max(-1, Math.min(1, score));
    
    let label = 'neutral';
    if (normalizedScore > 0.1) label = 'positive';
    else if (normalizedScore < -0.1) label = 'negative';
    
    const confidence = Math.min(0.95, 0.5 + Math.abs(normalizedScore) * 0.5);
    
    return { score: normalizedScore, label, confidence };
  };

  const performAnalysis = async () => {
    if (!newAnalysis.content_text.trim()) {
      toast({
        title: "Error",
        description: "Please enter content to analyze",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    try {
      const analysis = await analyzeSentiment(newAnalysis.content_text);
      
      const { error } = await supabase
        .from('core_sentiment_analysis')
        .insert([{
          content_type: newAnalysis.content_type,
          content_text: newAnalysis.content_text,
          sentiment_score: analysis.score,
          sentiment_label: analysis.label,
          confidence_score: analysis.confidence,
          region: newAnalysis.region || null,
          language: 'en'
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sentiment analysis completed successfully"
      });

      setNewAnalysis({
        content_type: 'post',
        content_text: '',
        region: ''
      });

      fetchSentimentData();
    } catch (error) {
      console.error('Error performing sentiment analysis:', error);
      toast({
        title: "Error",
        description: "Failed to perform sentiment analysis",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getSentimentIcon = (label: string) => {
    switch (label) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSentimentColor = (label: string) => {
    switch (label) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading sentiment analysis...</div>
      </div>
    );
  }

  const positiveCount = sentimentData.filter(d => d.sentiment_label === 'positive').length;
  const negativeCount = sentimentData.filter(d => d.sentiment_label === 'negative').length;
  const neutralCount = sentimentData.filter(d => d.sentiment_label === 'neutral').length;
  const averageScore = sentimentData.length > 0 
    ? sentimentData.reduce((sum, d) => sum + d.sentiment_score, 0) / sentimentData.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Core Sentiment Analysis</h1>
        <p className="text-muted-foreground">
          Simplified sentiment tracking for civic content
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{positiveCount}</div>
            <div className="text-sm text-muted-foreground">Positive</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{negativeCount}</div>
            <div className="text-sm text-muted-foreground">Negative</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{neutralCount}</div>
            <div className="text-sm text-muted-foreground">Neutral</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {averageScore.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Average Score</div>
          </CardContent>
        </Card>
      </div>

      {/* New Analysis Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analyze New Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Content Type</label>
              <Select
                value={newAnalysis.content_type}
                onValueChange={(value) => setNewAnalysis({ ...newAnalysis, content_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="poll">Poll</SelectItem>
                  <SelectItem value="post">Post</SelectItem>
                  <SelectItem value="comment">Comment</SelectItem>
                  <SelectItem value="message">Message</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Region (Optional)</label>
              <Input
                value={newAnalysis.region}
                onChange={(e) => setNewAnalysis({ ...newAnalysis, region: e.target.value })}
                placeholder="e.g., Centre, Littoral, Nord"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Content Text</label>
            <Textarea
              value={newAnalysis.content_text}
              onChange={(e) => setNewAnalysis({ ...newAnalysis, content_text: e.target.value })}
              placeholder="Enter the content to analyze for sentiment..."
              rows={4}
            />
          </div>
          <Button 
            onClick={performAnalysis}
            disabled={analyzing}
            className="w-full"
          >
            {analyzing ? 'Analyzing...' : 'Analyze Sentiment'}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Analysis Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Analysis Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sentimentData.map((data) => (
              <div key={data.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{data.content_type}</Badge>
                    {data.region && (
                      <Badge variant="secondary">{data.region}</Badge>
                    )}
                    <div className="flex items-center gap-1">
                      {getSentimentIcon(data.sentiment_label)}
                      <Badge className={getSentimentColor(data.sentiment_label)}>
                        {data.sentiment_label}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(data.analyzed_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-sm bg-muted p-2 rounded mb-2">
                  {data.content_text}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Score: {data.sentiment_score.toFixed(2)}</span>
                  <span>Confidence: {(data.confidence_score * 100).toFixed(1)}%</span>
                  <span>Language: {data.language}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};