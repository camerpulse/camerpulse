import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Settings, Vote, BarChart3, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PollOption {
  text: string;
  color?: string;
  weight?: number;
}

interface AdvancedPollConfig {
  pollType: 'single_choice' | 'multiple_choice' | 'ranked_choice' | 'rating_scale' | 'matrix';
  title: string;
  description: string;
  options: PollOption[];
  settings: {
    allowMultipleVotes: boolean;
    maxSelections?: number;
    ratingScale?: { min: number; max: number };
    matrixQuestions?: string[];
    enableComments: boolean;
    requireEmail: boolean;
    scheduledStart?: Date;
    autoClose?: Date;
    resultsVisibility: 'public' | 'private' | 'after_vote';
  };
  security: {
    enableCaptcha: boolean;
    enableBotDetection: boolean;
    maxVotesPerIP: number;
    maxVotesPerSession: number;
  };
}

export const AdvancedPollCreator = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<AdvancedPollConfig>({
    pollType: 'single_choice',
    title: '',
    description: '',
    options: [{ text: '' }, { text: '' }],
    settings: {
      allowMultipleVotes: false,
      enableComments: false,
      requireEmail: false,
      resultsVisibility: 'public'
    },
    security: {
      enableCaptcha: true,
      enableBotDetection: true,
      maxVotesPerIP: 1,
      maxVotesPerSession: 1
    }
  });

  const [isCreating, setIsCreating] = useState(false);

  const addOption = () => {
    setConfig(prev => ({
      ...prev,
      options: [...prev.options, { text: '' }]
    }));
  };

  const removeOption = (index: number) => {
    if (config.options.length > 2) {
      setConfig(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const updateOption = (index: number, text: string) => {
    setConfig(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index ? { ...opt, text } : opt
      )
    }));
  };

  const createPoll = async () => {
    if (!config.title.trim() || config.options.some(opt => !opt.text.trim())) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
      // Create the poll
      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .insert({
          title: config.title,
          description: config.description,
          options: config.options.map(opt => opt.text),
          creator_id: (await supabase.auth.getUser()).data.user?.id,
          privacy_mode: config.settings.resultsVisibility === 'private' ? 'private' : 'public',
          ends_at: config.settings.autoClose ? config.settings.autoClose.toISOString() : null
        })
        .select()
        .single();

      if (pollError) throw pollError;

      // Create advanced configuration
      const { error: configError } = await supabase
        .from('poll_advanced_config')
        .insert({
          poll_id: poll.id,
          poll_type: config.pollType,
          advanced_settings: {
            ...config.settings,
            scheduledStart: config.settings.scheduledStart?.toISOString(),
            autoClose: config.settings.autoClose?.toISOString()
          },
          validation_rules: config.security
        });

      if (configError) throw configError;

      // Create fraud protection settings
      const { error: fraudError } = await supabase
        .from('poll_fraud_settings')
        .insert({
          poll_id: poll.id,
          enable_captcha: config.security.enableCaptcha,
          enable_rate_limiting: true,
          max_votes_per_ip: config.security.maxVotesPerIP,
          max_votes_per_session: config.security.maxVotesPerSession,
          alert_threshold: 50
        });

      if (fraudError) throw fraudError;

      toast({
        title: "Poll Created Successfully",
        description: `Your ${config.pollType.replace('_', ' ')} poll has been created with advanced security features.`
      });

      // Reset form
      setConfig({
        pollType: 'single_choice',
        title: '',
        description: '',
        options: [{ text: '' }, { text: '' }],
        settings: {
          allowMultipleVotes: false,
          enableComments: false,
          requireEmail: false,
          resultsVisibility: 'public'
        },
        security: {
          enableCaptcha: true,
          enableBotDetection: true,
          maxVotesPerIP: 1,
          maxVotesPerSession: 1
        }
      });

    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: "Error",
        description: "Failed to create poll. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="w-5 h-5" />
            Create Advanced Poll
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Poll Type Selection */}
          <div className="space-y-2">
            <Label>Poll Type</Label>
            <Select
              value={config.pollType}
              onValueChange={(value: any) => setConfig(prev => ({ ...prev, pollType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single_choice">Single Choice</SelectItem>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                <SelectItem value="ranked_choice">Ranked Choice</SelectItem>
                <SelectItem value="rating_scale">Rating Scale</SelectItem>
                <SelectItem value="matrix">Matrix Questions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Poll Title *</Label>
              <Input
                id="title"
                value={config.title}
                onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter your poll question"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={config.description}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description for your poll"
                rows={3}
              />
            </div>
          </div>

          {/* Poll Options */}
          <div className="space-y-4">
            <Label>Poll Options *</Label>
            {config.options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option.text}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                {config.options.length > 2 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeOption(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" onClick={addOption} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Option
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Advanced Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Poll Behavior */}
          <div className="space-y-4">
            <h4 className="font-medium">Poll Behavior</h4>
            
            {config.pollType === 'multiple_choice' && (
              <div className="flex items-center justify-between">
                <Label htmlFor="multipleVotes">Allow Multiple Selections</Label>
                <Switch
                  id="multipleVotes"
                  checked={config.settings.allowMultipleVotes}
                  onCheckedChange={(checked) =>
                    setConfig(prev => ({
                      ...prev,
                      settings: { ...prev.settings, allowMultipleVotes: checked }
                    }))
                  }
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label htmlFor="enableComments">Enable Comments</Label>
              <Switch
                id="enableComments"
                checked={config.settings.enableComments}
                onCheckedChange={(checked) =>
                  setConfig(prev => ({
                    ...prev,
                    settings: { ...prev.settings, enableComments: checked }
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Results Visibility</Label>
              <Select
                value={config.settings.resultsVisibility}
                onValueChange={(value: any) =>
                  setConfig(prev => ({
                    ...prev,
                    settings: { ...prev.settings, resultsVisibility: value }
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public (visible to all)</SelectItem>
                  <SelectItem value="after_vote">After voting</SelectItem>
                  <SelectItem value="private">Private (creator only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Security Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Security & Fraud Protection</h4>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="enableCaptcha">Enable CAPTCHA</Label>
              <Switch
                id="enableCaptcha"
                checked={config.security.enableCaptcha}
                onCheckedChange={(checked) =>
                  setConfig(prev => ({
                    ...prev,
                    security: { ...prev.security, enableCaptcha: checked }
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="enableBotDetection">Enhanced Bot Detection</Label>
              <Switch
                id="enableBotDetection"
                checked={config.security.enableBotDetection}
                onCheckedChange={(checked) =>
                  setConfig(prev => ({
                    ...prev,
                    security: { ...prev.security, enableBotDetection: checked }
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxVotesIP">Max Votes per IP</Label>
                <Input
                  id="maxVotesIP"
                  type="number"
                  min="1"
                  value={config.security.maxVotesPerIP}
                  onChange={(e) =>
                    setConfig(prev => ({
                      ...prev,
                      security: { ...prev.security, maxVotesPerIP: parseInt(e.target.value) || 1 }
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxVotesSession">Max Votes per Session</Label>
                <Input
                  id="maxVotesSession"
                  type="number"
                  min="1"
                  value={config.security.maxVotesPerSession}
                  onChange={(e) =>
                    setConfig(prev => ({
                      ...prev,
                      security: { ...prev.security, maxVotesPerSession: parseInt(e.target.value) || 1 }
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Ready to create your poll?</p>
              <div className="flex gap-2">
                <Badge variant="secondary">
                  {config.pollType.replace('_', ' ')}
                </Badge>
                {config.security.enableCaptcha && (
                  <Badge variant="outline">CAPTCHA Protected</Badge>
                )}
                {config.security.enableBotDetection && (
                  <Badge variant="outline">Bot Detection</Badge>
                )}
              </div>
            </div>
            
            <Button 
              onClick={createPoll} 
              disabled={isCreating}
              className="min-w-[120px]"
            >
              {isCreating ? "Creating..." : "Create Poll"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};