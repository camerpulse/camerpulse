import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartPollStyle } from './PollStyles/ChartPollStyle';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createYouthPoll, shareOnWhatsApp, shareOnFacebook } from '@/utils/createYouthPoll';
import { 
  BarChart3, 
  Eye, 
  CheckCircle, 
  Users, 
  Share2,
  MessageCircle,
  Facebook,
  Clock,
  Shield,
  TrendingUp
} from 'lucide-react';

export const YouthPollCreator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pollCreated, setPollCreated] = useState(false);
  const [createdPollId, setCreatedPollId] = useState<string>('');
  const [showResults, setShowResults] = useState(false);

  // Sample poll data for preview
  const previewPoll = {
    title: "Which of these challenges do young Cameroonians face most today?",
    description: "A survey to understand the most pressing issues affecting Cameroonian youth in our current socio-economic climate.",
    options: [
      "Unemployment",
      "Police harassment", 
      "Poor education system",
      "Mental health struggles",
      "Corruption and lack of role models"
    ],
    vote_results: [45, 23, 67, 34, 56], // Sample results for preview
    votes_count: 225,
    user_vote: showResults ? 0 : undefined,
    ends_at: new Date(Date.now() + (5 * 24 * 60 * 60 * 1000)).toISOString(),
    privacy_mode: 'anonymous',
    tags: ['youth', 'challenges', 'unemployment', 'education', 'mental-health']
  };

  const handleCreatePoll = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a poll",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const createdPoll = await createYouthPoll(user.id);
      
      toast({
        title: "Youth poll created successfully!",
        description: "Your poll is now live with chart visualization and social sharing enabled! +50 points earned!"
      });
      
      setPollCreated(true);
      setCreatedPollId(createdPoll.id);
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: "Failed to create poll",
        description: "There was an error creating the youth poll. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShareWhatsApp = () => {
    shareOnWhatsApp(previewPoll.title, createdPollId);
    toast({
      title: "Shared on WhatsApp",
      description: "Poll link copied and WhatsApp opened!"
    });
  };

  const handleShareFacebook = () => {
    shareOnFacebook(previewPoll.title, createdPollId);
    toast({
      title: "Shared on Facebook", 
      description: "Poll shared on Facebook!"
    });
  };

  if (pollCreated) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="pt-6 space-y-6">
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-primary mx-auto" />
            <h3 className="text-xl font-semibold text-primary">Youth Poll Created Successfully!</h3>
            <p className="text-muted-foreground">
              Your poll is now live with animated chart visualization and social sharing enabled.
            </p>
          </div>

          {/* Show results preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Live Chart Results
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResults(!showResults)}
              >
                {showResults ? 'Hide' : 'Show'} Results
              </Button>
            </div>
            
            <ChartPollStyle 
              poll={{...previewPoll, user_vote: showResults ? 0 : undefined}}
              showResults={showResults}
              isActive={false}
              hasVoted={showResults}
              className="bg-gradient-to-br from-primary/5 to-accent/5 p-4 rounded-lg border border-primary/20"
            />
          </div>

          {/* Social Sharing */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Share Your Poll
            </h4>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleShareWhatsApp}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Share on WhatsApp
              </Button>
              <Button
                onClick={handleShareFacebook}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Facebook className="w-4 h-4 mr-2" />
                Share on Facebook
              </Button>
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-sm">Poll Features Enabled:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Animated chart visualization with hover effects</li>
              <li>• Anonymous voting for honest responses</li>
              <li>• Social sharing on WhatsApp and Facebook</li>
              <li>• Discoverable on youth issues page</li>
              <li>• 5-day voting period with live results</li>
              <li>• Geo-analytics and demographic insights</li>
            </ul>
          </div>

          <div className="flex justify-center">
            <Button 
              onClick={() => window.location.href = '/polls'} 
              className="bg-primary hover:bg-primary/90"
            >
              View All Polls
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Create Youth Challenges Poll - Chart Style
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Poll Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Chart Style Features
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Animated pie chart results</li>
                <li>• Real-time vote percentages</li>
                <li>• Interactive hover effects</li>
                <li>• Blue-green civic gradient theme</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Privacy & Settings
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Anonymous voting enabled</li>
                <li>• 5-day voting period</li>
                <li>• Social media sharing</li>
                <li>• Youth issues discovery</li>
              </ul>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Target Tags</h4>
            <div className="flex flex-wrap gap-2">
              {previewPoll.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                <h4 className="font-medium">Live Chart Preview</h4>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">5 days remaining</span>
              </div>
            </div>
            
            <div className="border border-dashed border-primary/30 rounded-lg p-4 bg-primary/5">
              <ChartPollStyle 
                poll={previewPoll}
                showResults={showResults}
                isActive={!showResults}
                hasVoted={showResults}
                className="max-w-2xl mx-auto"
              />
              
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResults(!showResults)}
                >
                  {showResults ? 'Show Voting View' : 'Preview Chart Results'}
                </Button>
              </div>
            </div>
          </div>

          {/* Social Sharing Preview */}
          <div className="space-y-3 bg-muted/20 p-4 rounded-lg">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Social Sharing Enabled
            </h4>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="w-4 h-4 text-green-600" />
                WhatsApp sharing
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Facebook className="w-4 h-4 text-blue-600" />
                Facebook sharing
              </div>
            </div>
          </div>

          {/* Create Poll Button */}
          <div className="flex justify-center pt-4">
            <Button 
              onClick={handleCreatePoll}
              disabled={loading || !user}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-8"
            >
              {loading ? 'Creating Chart Poll...' : 'Create & Publish Youth Poll'}
            </Button>
          </div>

          {!user && (
            <p className="text-center text-sm text-muted-foreground">
              Please log in to create this youth challenges poll
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};