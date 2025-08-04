import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Copy, 
  Eye, 
  Settings,
  BarChart3,
  PieChart,
  CreditCard,
  Code
} from 'lucide-react';

interface Poll {
  id: string;
  title: string;
  description?: string;
  options: string[];
  vote_results?: number[];
  votes_count: number;
  creator_id: string;
  creator_name?: string;
  region?: string;
  created_at: string;
  is_active: boolean;
  anonymous_voting: boolean;
}

interface EmbedSettings {
  style: 'compact' | 'full-chart' | 'clean-text';
  theme: 'light' | 'dark';
  showCreator: boolean;
  showRegionalMap: boolean;
  width: string;
  height: string;
}

const PollEmbedGenerator = () => {
  const { poll_id } = useParams();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [canGenerateEmbed, setCanGenerateEmbed] = useState(false);
  const [embedSettings, setEmbedSettings] = useState<EmbedSettings>({
    style: 'compact',
    theme: 'light',
    showCreator: true,
    showRegionalMap: false,
    width: '100%',
    height: '300'
  });

  useEffect(() => {
    if (poll_id) {
      fetchPoll();
    }
  }, [poll_id]);

  const fetchPoll = async () => {
    try {
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

      const pollWithResults = {
        ...pollData,
        options: optionsArray,
        vote_results: voteResults,
        votes_count: voteData.length,
        anonymous_voting: pollData.anonymous_mode || false
      };

      setPoll(pollWithResults);

      // Check if user can generate embed (creator or admin)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const isCreator = user.id === pollData.creator_id;
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        
        const isAdmin = userRoles?.some(role => role.role === 'admin');
        setCanGenerateEmbed(isCreator || isAdmin);
      }

    } catch (error) {
      console.error('Error fetching poll:', error);
      toast.error('Failed to load poll');
    } finally {
      setLoading(false);
    }
  };

  const generateEmbedCode = () => {
    const baseUrl = window.location.origin;
    const embedUrl = `${baseUrl}/polls/embed/${poll_id}?style=${embedSettings.style}&theme=${embedSettings.theme}&creator=${embedSettings.showCreator}&regional=${embedSettings.showRegionalMap}`;
    
    return `<iframe 
  src="${embedUrl}" 
  width="${embedSettings.width}" 
  height="${embedSettings.height}"
  style="border: none; border-radius: 10px;"
  title="CamerPulse Poll: ${poll?.title}">
</iframe>`;
  };

  const copyEmbedCode = async () => {
    const embedCode = generateEmbedCode();
    await navigator.clipboard.writeText(embedCode);
    toast.success('Embed code copied to clipboard!');
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
            <p className="text-muted-foreground">The poll you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canGenerateEmbed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">Only poll creators and administrators can generate embed codes.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const winningOption = poll.vote_results && poll.votes_count > 0 
    ? poll.vote_results.reduce((maxIndex, votes, index, arr) => votes > arr[maxIndex] ? index : maxIndex, 0)
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Code className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-lg font-semibold">Poll Embed Generator</h1>
              <p className="text-sm text-muted-foreground">Create embeddable widgets for your poll</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Embed Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Style Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Embed Style</Label>
                <Tabs value={embedSettings.style} onValueChange={(value: any) => 
                  setEmbedSettings(prev => ({ ...prev, style: value }))}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="compact" className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Compact
                    </TabsTrigger>
                    <TabsTrigger value="full-chart" className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Chart
                    </TabsTrigger>
                    <TabsTrigger value="clean-text" className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Clean
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Theme Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Theme</Label>
                <Tabs value={embedSettings.theme} onValueChange={(value: any) => 
                  setEmbedSettings(prev => ({ ...prev, theme: value }))}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="light">Light</TabsTrigger>
                    <TabsTrigger value="dark">Dark</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Display Options */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Display Options</Label>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-creator">Show Creator</Label>
                    <p className="text-sm text-muted-foreground">Display poll creator name</p>
                  </div>
                  <Switch
                    id="show-creator"
                    checked={embedSettings.showCreator}
                    onCheckedChange={(checked) => 
                      setEmbedSettings(prev => ({ ...prev, showCreator: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-regional">Regional Map</Label>
                    <p className="text-sm text-muted-foreground">Show regional breakdown if available</p>
                  </div>
                  <Switch
                    id="show-regional"
                    checked={embedSettings.showRegionalMap}
                    onCheckedChange={(checked) => 
                      setEmbedSettings(prev => ({ ...prev, showRegionalMap: checked }))}
                  />
                </div>
              </div>

              {/* Size Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width">Width</Label>
                  <select 
                    id="width"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={embedSettings.width}
                    onChange={(e) => setEmbedSettings(prev => ({ ...prev, width: e.target.value }))}
                  >
                    <option value="100%">100%</option>
                    <option value="800px">800px</option>
                    <option value="600px">600px</option>
                    <option value="400px">400px</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height</Label>
                  <select 
                    id="height"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={embedSettings.height}
                    onChange={(e) => setEmbedSettings(prev => ({ ...prev, height: e.target.value }))}
                  >
                    <option value="200">200px</option>
                    <option value="300">300px</option>
                    <option value="400">400px</option>
                    <option value="500">500px</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Embed Code */}
          <Card>
            <CardHeader>
              <CardTitle>Embed Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={generateEmbedCode()}
                readOnly
                className="min-h-[120px] font-mono text-xs"
              />
              <Button onClick={copyEmbedCode} className="w-full">
                <Copy className="w-4 h-4 mr-2" />
                Copy Embed Code
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-4 bg-white text-gray-900">
                {/* Poll Preview */}
                {embedSettings.style === 'compact' && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">{poll.title}</h3>
                    {embedSettings.showCreator && poll.creator_name && (
                      <p className="text-sm opacity-75">by {poll.creator_name}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span>Total Votes:</span>
                      <Badge>{poll.votes_count}</Badge>
                    </div>
                    {winningOption !== null && (
                      <div className="bg-primary/10 p-3 rounded">
                        <p className="text-sm font-medium">Leading Option:</p>
                        <p className="font-semibold">{poll.options[winningOption]}</p>
                      </div>
                    )}
                  </div>
                )}

                {embedSettings.style === 'full-chart' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">{poll.title}</h3>
                    {embedSettings.showCreator && poll.creator_name && (
                      <p className="text-sm opacity-75">by {poll.creator_name}</p>
                    )}
                    <div className="space-y-3">
                      {poll.options.map((option, index) => {
                        const votes = poll.vote_results?.[index] || 0;
                        const percentage = poll.votes_count > 0 ? (votes / poll.votes_count) * 100 : 0;
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{option}</span>
                              <span>{percentage.toFixed(1)}%</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {embedSettings.style === 'clean-text' && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">{poll.title}</h3>
                    {embedSettings.showCreator && poll.creator_name && (
                      <p className="text-sm opacity-75">by {poll.creator_name}</p>
                    )}
                    <ul className="space-y-2">
                      {poll.options.map((option, index) => {
                        const votes = poll.vote_results?.[index] || 0;
                        const percentage = poll.votes_count > 0 ? (votes / poll.votes_count) * 100 : 0;
                        return (
                          <li key={index} className="flex justify-between">
                            <span>{option}</span>
                            <span className="font-medium">{percentage.toFixed(1)}%</span>
                          </li>
                        );
                      })}
                    </ul>
                    <p className="text-sm opacity-75">{poll.votes_count} total votes</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Poll Info */}
          <Card>
            <CardHeader>
              <CardTitle>Poll Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Title:</span>
                <span className="font-medium">{poll.title}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Votes:</span>
                <span className="font-medium">{poll.votes_count}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge variant={poll.is_active ? "default" : "secondary"}>
                  {poll.is_active ? "Active" : "Ended"}
                </Badge>
              </div>
              {poll.region && (
                <div className="flex justify-between">
                  <span>Region:</span>
                  <span className="font-medium">{poll.region}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PollEmbedGenerator;