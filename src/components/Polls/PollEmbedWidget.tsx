import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { CaptchaWidget, useFraudProtection } from './CaptchaWidget';
import { toast } from 'sonner';
import { 
  Share2, 
  Copy, 
  Eye, 
  Users, 
  BarChart3, 
  Shield,
  AlertTriangle,
  Clock,
  Palette,
  Code,
  Globe
} from 'lucide-react';

interface PollEmbedWidgetProps {
  pollId: string;
  title?: string;
  showTitle?: boolean;
  showResults?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  primaryColor?: string;
  width?: string;
  height?: string;
  border?: boolean;
  borderRadius?: string;
}

interface Poll {
  id: string;
  title: string;
  description?: string;
  options: string[];
  votes_count: number;
  is_active: boolean;
  created_at: string;
}

export const PollEmbedWidget: React.FC<PollEmbedWidgetProps> = ({
  pollId,
  title,
  showTitle = true,
  showResults = true,
  theme = 'light',
  primaryColor = '#3b82f6',
  width = '100%',
  height = 'auto',
  border = true,
  borderRadius = '8px'
}) => {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [voteResults, setVoteResults] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number>(-1);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  
  const {
    riskScore,
    isBlocked,
    captchaRequired,
    captchaToken,
    checkFraudRisk,
    checkRateLimit,
    verifyCaptcha
  } = useFraudProtection(pollId);

  useEffect(() => {
    loadPoll();
    checkUserVoted();
    
    // Track view
    trackView();
    
    // Check for fraud risk
    checkFraudRisk({
      deviceFingerprint: generateDeviceFingerprint()
    });
  }, [pollId]);

  const loadPoll = async () => {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('id', pollId)
        .single();

      if (error) throw error;
      
      setPoll({
        ...data,
        options: Array.isArray(data.options) ? data.options : []
      });
      
      // Load vote results
      const { data: votes } = await supabase
        .from('poll_votes')
        .select('option_index')
        .eq('poll_id', pollId);

      if (votes) {
        const options = Array.isArray(data.options) ? data.options : [];
        const counts = new Array(options.length).fill(0);
        votes.forEach(vote => {
          if (vote.option_index < counts.length) {
            counts[vote.option_index]++;
          }
        });
        setVoteResults(counts);
      }
    } catch (error) {
      console.error('Error loading poll:', error);
      toast.error('Failed to load poll');
    } finally {
      setLoading(false);
    }
  };

  const checkUserVoted = async () => {
    try {
      const sessionId = getSessionId();
      const { data } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('session_id', sessionId)
        .limit(1);

      if (data && data.length > 0) {
        setHasVoted(true);
      }
    } catch (error) {
      console.error('Error checking vote status:', error);
    }
  };

  const trackView = async () => {
    try {
      // Increment view count
      await supabase.rpc('increment_poll_view_count', {
        p_poll_id: pollId
      });
      
      // Log view for analytics
      await supabase
        .from('poll_view_log')
        .insert([{
          poll_id: pollId,
          session_id: getSessionId(),
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
          timestamp: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const getSessionId = (): string => {
    let sessionId = sessionStorage.getItem('poll_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('poll_session_id', sessionId);
    }
    return sessionId;
  };

  const generateDeviceFingerprint = (): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    return btoa(fingerprint).substr(0, 32);
  };

  const handleVote = async () => {
    if (selectedOption === -1 || hasVoted || isBlocked) return;

    // Check rate limiting
    const rateLimitOk = await checkRateLimit('vote');
    if (!rateLimitOk) return;

    // Require CAPTCHA for high-risk sessions
    if (captchaRequired && !captchaToken) {
      setShowCaptcha(true);
      return;
    }

    setIsVoting(true);

    try {
      const voteData = {
        poll_id: pollId,
        option_index: selectedOption,
        user_id: '00000000-0000-0000-0000-000000000000', // Anonymous user for embeds
        session_id: getSessionId(),
        device_fingerprint: generateDeviceFingerprint(),
        user_agent: navigator.userAgent,
        region: 'web_embed'
      };

      const { error } = await supabase
        .from('poll_votes')
        .insert([voteData]);

      if (error) throw error;

      // Mark CAPTCHA as used if it was required
      if (captchaToken) {
        await supabase
          .from('poll_captcha_verifications')
          .update({ used: true })
          .eq('captcha_token', captchaToken);
      }

      setHasVoted(true);
      setShowCaptcha(false);
      toast.success('Vote recorded successfully!');
      
      // Reload results
      loadPoll();

    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to record vote');
    } finally {
      setIsVoting(false);
    }
  };

  const getThemeStyles = () => {
    const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    return {
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      color: isDark ? '#f3f4f6' : '#1f2937',
      borderColor: isDark ? '#374151' : '#e5e7eb'
    };
  };

  if (loading) {
    return (
      <Card 
        style={{ 
          width, 
          height, 
          border: border ? `1px solid ${getThemeStyles().borderColor}` : 'none',
          borderRadius,
          ...getThemeStyles()
        }}
      >
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: primaryColor }}></div>
        </CardContent>
      </Card>
    );
  }

  if (!poll) {
    return (
      <Card 
        style={{ 
          width, 
          height, 
          border: border ? `1px solid ${getThemeStyles().borderColor}` : 'none',
          borderRadius,
          ...getThemeStyles()
        }}
      >
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <p className="text-sm">Poll not found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isBlocked) {
    return (
      <Card 
        style={{ 
          width, 
          height, 
          border: border ? `1px solid ${getThemeStyles().borderColor}` : 'none',
          borderRadius,
          ...getThemeStyles()
        }}
      >
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <p className="text-sm">Access temporarily blocked</p>
            <p className="text-xs text-muted-foreground mt-1">Risk Score: {riskScore}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalVotes = voteResults.reduce((sum, count) => sum + count, 0);

  return (
    <Card 
      style={{ 
        width, 
        height, 
        border: border ? `1px solid ${getThemeStyles().borderColor}` : 'none',
        borderRadius,
        ...getThemeStyles()
      }}
    >
      {showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{title || poll.title}</CardTitle>
          {poll.description && (
            <p className="text-sm opacity-70">{poll.description}</p>
          )}
        </CardHeader>
      )}
      
      <CardContent className="space-y-4">
        {showCaptcha ? (
          <div className="flex justify-center">
            <CaptchaWidget
              pollId={pollId}
              onVerified={verifyCaptcha}
              theme={theme === 'dark' ? 'dark' : 'light'}
              size="compact"
            />
          </div>
        ) : (
          <>
            {!hasVoted && poll.is_active && (
              <div className="space-y-3">
                {poll.options.map((option, index) => (
                  <label
                    key={index}
                    className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-opacity-50"
                    style={{ 
                      backgroundColor: selectedOption === index ? `${primaryColor}20` : 'transparent',
                      borderColor: selectedOption === index ? primaryColor : 'transparent',
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}
                  >
                    <input
                      type="radio"
                      name="poll-option"
                      checked={selectedOption === index}
                      onChange={() => setSelectedOption(index)}
                      style={{ accentColor: primaryColor }}
                    />
                    <span className="flex-1">{option}</span>
                  </label>
                ))}
                
                <Button
                  onClick={handleVote}
                  disabled={selectedOption === -1 || isVoting}
                  className="w-full"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isVoting ? 'Recording vote...' : 'Vote'}
                </Button>
              </div>
            )}

            {(hasVoted || !poll.is_active) && showResults && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Results</span>
                  <Badge variant="outline">
                    {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                {poll.options.map((option, index) => {
                  const votes = voteResults[index] || 0;
                  const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                  
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{option}</span>
                        <span>{votes} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className="h-2"
                        style={{ 
                          '--progress-background': primaryColor + '40',
                          '--progress-foreground': primaryColor 
                        } as React.CSSProperties}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {!poll.is_active && (
              <div className="text-center py-2">
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  Poll Closed
                </Badge>
              </div>
            )}

            <div className="pt-2 border-t border-opacity-20" style={{ borderColor: getThemeStyles().borderColor }}>
              <div className="flex items-center justify-between text-xs opacity-60">
                <span>Powered by CamerPulse</span>
                <div className="flex items-center space-x-2">
                  <Users className="h-3 w-3" />
                  <span>{totalVotes}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Embed code generator component
export const EmbedCodeGenerator: React.FC<{ pollId: string }> = ({ pollId }) => {
  const [embedConfig, setEmbedConfig] = useState({
    showTitle: true,
    showResults: true,
    theme: 'light' as 'light' | 'dark' | 'auto',
    primaryColor: '#3b82f6',
    width: '400px',
    height: 'auto',
    border: true,
    borderRadius: '8px'
  });

  const generateEmbedCode = () => {
    const baseUrl = window.location.origin;
    const config = encodeURIComponent(JSON.stringify(embedConfig));
    
    return `<iframe
  src="${baseUrl}/polls/embed/${pollId}?config=${config}"
  width="${embedConfig.width}"
  height="${embedConfig.height === 'auto' ? '500' : embedConfig.height}"
  frameborder="0"
  scrolling="no"
  style="border-radius: ${embedConfig.borderRadius}; ${embedConfig.border ? 'border: 1px solid #e5e7eb;' : ''}"
  allowtransparency="true">
</iframe>`;
  };

  const generateJavaScriptCode = () => {
    const baseUrl = window.location.origin;
    
    return `<div id="camerpulse-poll-${pollId}"></div>
<script>
(function() {
  var script = document.createElement('script');
  script.src = '${baseUrl}/js/poll-embed.js';
  script.onload = function() {
    CamerPulsePoll.render({
      pollId: '${pollId}',
      containerId: 'camerpulse-poll-${pollId}',
      config: ${JSON.stringify(embedConfig, null, 2)}
    });
  };
  document.head.appendChild(script);
})();
</script>`;
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Embed code copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Embed Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <select
              id="theme"
              value={embedConfig.theme}
              onChange={(e) => setEmbedConfig({...embedConfig, theme: e.target.value})}
              className="w-full p-2 border rounded"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex space-x-2">
              <input
                type="color"
                id="primaryColor"
                value={embedConfig.primaryColor}
                onChange={(e) => setEmbedConfig({...embedConfig, primaryColor: e.target.value})}
                className="w-16 h-10 border rounded"
              />
              <Input
                value={embedConfig.primaryColor}
                onChange={(e) => setEmbedConfig({...embedConfig, primaryColor: e.target.value})}
                placeholder="#3b82f6"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="width">Width</Label>
            <Input
              id="width"
              value={embedConfig.width}
              onChange={(e) => setEmbedConfig({...embedConfig, width: e.target.value})}
              placeholder="400px"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="height">Height</Label>
            <Input
              id="height"
              value={embedConfig.height}
              onChange={(e) => setEmbedConfig({...embedConfig, height: e.target.value})}
              placeholder="auto"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mt-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={embedConfig.showTitle}
              onChange={(e) => setEmbedConfig({...embedConfig, showTitle: e.target.checked})}
            />
            <span>Show Title</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={embedConfig.showResults}
              onChange={(e) => setEmbedConfig({...embedConfig, showResults: e.target.checked})}
            />
            <span>Show Results</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={embedConfig.border}
              onChange={(e) => setEmbedConfig({...embedConfig, border: e.target.checked})}
            />
            <span>Show Border</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Preview</h3>
        <div className="border rounded-lg p-4 bg-gray-50">
          <PollEmbedWidget
            pollId={pollId}
            {...embedConfig}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">IFrame Embed Code</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(generateEmbedCode())}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
          <Textarea
            value={generateEmbedCode()}
            readOnly
            rows={8}
            className="font-mono text-sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">JavaScript Embed Code</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(generateJavaScriptCode())}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
          <Textarea
            value={generateJavaScriptCode()}
            readOnly
            rows={12}
            className="font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
};