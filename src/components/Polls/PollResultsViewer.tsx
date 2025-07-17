import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Share2, 
  Download, 
  Users, 
  Calendar, 
  MapPin, 
  BarChart3,
  PieChart,
  Eye,
  QrCode
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Poll {
  id: string;
  title: string;
  description?: string;
  options: string[];
  vote_results?: number[];
  votes_count: number;
  creator_name?: string;
  region?: string;
  created_at: string;
  expires_at?: string;
  anonymous_voting: boolean;
  is_active: boolean;
  poll_type?: string;
  custom_settings?: any;
}

interface RegionalResult {
  region: string;
  total_votes: number;
  option_results: number[];
}

const PollResultsViewer = () => {
  const { poll_id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [regionalResults, setRegionalResults] = useState<RegionalResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

  useEffect(() => {
    if (poll_id) {
      fetchPollResults();
    }
  }, [poll_id]);

  const fetchPollResults = async () => {
    try {
      // Fetch poll data
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .select('*')
        .eq('id', poll_id)
        .single();

      if (pollError) throw pollError;

      // Get vote results
      const { data: voteData, error: voteError } = await supabase
        .from('poll_votes')
        .select('option_index')
        .eq('poll_id', poll_id);

      if (voteError) throw voteError;

      // Calculate vote results
      const optionsArray = Array.isArray(pollData.options) 
        ? pollData.options.map((opt: any) => typeof opt === 'string' ? opt : String(opt))
        : [];
      const voteResults = new Array(optionsArray.length).fill(0);
      voteData.forEach(vote => {
        if (vote.option_index < voteResults.length) {
          voteResults[vote.option_index]++;
        }
      });

      setPoll({
        ...pollData,
        options: optionsArray,
        vote_results: voteResults,
        votes_count: voteData.length,
        anonymous_voting: pollData.anonymous_mode || false
      });

      // Skip regional results for now - we'll implement this properly later
      setRegionalResults([]);

    } catch (error) {
      console.error('Error fetching poll results:', error);
      toast.error('Failed to load poll results');
    } finally {
      setLoading(false);
    }
  };

  const getWinningOption = () => {
    if (!poll?.vote_results) return null;
    const maxVotes = Math.max(...poll.vote_results);
    const winningIndex = poll.vote_results.findIndex(votes => votes === maxVotes);
    return {
      index: winningIndex,
      option: poll.options[winningIndex],
      votes: maxVotes,
      percentage: poll.votes_count > 0 ? (maxVotes / poll.votes_count) * 100 : 0
    };
  };

  const handleShare = async (platform: string) => {
    const shareUrl = window.location.href;
    const shareText = `Check out this poll result: "${poll?.title}"`;
    
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    };

    if (platform in urls) {
      window.open(urls[platform as keyof typeof urls], '_blank');
    } else if (platform === 'copy') {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    }
  };

  const generateQRCode = () => {
    const url = window.location.href;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    window.open(qrUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Poll Not Found</h2>
            <p className="text-muted-foreground mb-4">The poll you're looking for doesn't exist or may have been removed.</p>
            <Button onClick={() => navigate('/polls')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Polls
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const winningOption = getWinningOption();
  const isExpired = poll.expires_at && new Date(poll.expires_at) < new Date();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/polls')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Poll Results</h1>
              <p className="text-sm text-muted-foreground">Real-time civic engagement data</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Poll Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-xl">{poll.title}</CardTitle>
                {poll.description && (
                  <p className="text-muted-foreground">{poll.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Badge variant={poll.is_active ? "default" : "secondary"}>
                  {poll.is_active ? "Active" : "Ended"}
                </Badge>
                {poll.anonymous_voting && (
                  <Badge variant="outline">Anonymous</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Votes</p>
                  <p className="font-semibold">{poll.votes_count.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-semibold">{formatDistanceToNow(new Date(poll.created_at))} ago</p>
                </div>
              </div>
              {poll.region && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Region</p>
                    <p className="font-semibold">{poll.region}</p>
                  </div>
                </div>
              )}
              {poll.creator_name && !poll.anonymous_voting && (
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Creator</p>
                    <p className="font-semibold">{poll.creator_name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Winning Option Highlight */}
            {winningOption && poll.votes_count > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h3 className="font-semibold text-primary mb-2">Leading Option</h3>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{winningOption.option}</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-primary">{winningOption.percentage.toFixed(1)}%</span>
                    <p className="text-sm text-muted-foreground">{winningOption.votes} votes</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Display */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Poll Results
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={chartType === 'bar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('bar')}
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={chartType === 'pie' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('pie')}
                >
                  <PieChart className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {poll.votes_count === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No votes have been cast yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {poll.options.map((option, index) => {
                  const votes = poll.vote_results?.[index] || 0;
                  const percentage = poll.votes_count > 0 ? (votes / poll.votes_count) * 100 : 0;
                  const isWinning = votes === Math.max(...(poll.vote_results || []));

                  return (
                    <div key={index} className={`p-4 rounded-lg border ${isWinning ? 'border-primary bg-primary/5' : 'border-border'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{option}</span>
                        <div className="text-right">
                          <span className="font-semibold">{percentage.toFixed(1)}%</span>
                          <p className="text-sm text-muted-foreground">{votes} votes</p>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Regional Results */}
        {regionalResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Regional Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regionalResults.map((region, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{region.region}</h4>
                      <Badge variant="outline">{region.total_votes} votes</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {region.option_results.map((votes, optionIndex) => {
                        const percentage = region.total_votes > 0 ? (votes / region.total_votes) * 100 : 0;
                        return (
                          <div key={optionIndex} className="flex items-center justify-between text-sm">
                            <span>{poll.options[optionIndex]}</span>
                            <span>{percentage.toFixed(1)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sharing Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Share Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" onClick={() => handleShare('whatsapp')} className="justify-start">
                <span className="text-green-600 mr-2">📱</span>
                WhatsApp
              </Button>
              <Button variant="outline" onClick={() => handleShare('facebook')} className="justify-start">
                <span className="text-blue-600 mr-2">📘</span>
                Facebook
              </Button>
              <Button variant="outline" onClick={() => handleShare('twitter')} className="justify-start">
                <span className="text-blue-400 mr-2">🐦</span>
                Twitter
              </Button>
              <Button variant="outline" onClick={() => handleShare('copy')} className="justify-start">
                <Share2 className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
            <Separator className="my-4" />
            <div className="flex gap-3">
              <Button variant="outline" onClick={generateQRCode}>
                <QrCode className="w-4 h-4 mr-2" />
                Generate QR Code
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        {poll.anonymous_voting && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <CardContent className="p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                🔒 This poll was conducted with anonymous voting. Individual voter identities are protected and not displayed.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PollResultsViewer;