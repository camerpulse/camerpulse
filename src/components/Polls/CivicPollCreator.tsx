import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardPollStyle } from './PollStyles/CardPollStyle';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createCivicPoll } from '@/utils/createCivicPoll';
import { Vote, Eye, CheckCircle } from 'lucide-react';

export const CivicPollCreator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pollCreated, setPollCreated] = useState(false);

  // Sample poll data for preview
  const previewPoll = {
    title: "Do you believe the current government has delivered on its 2020–2025 promises?",
    description: "This poll aims to gauge public opinion on the government's performance regarding their electoral promises made during the 2020-2025 mandate period.",
    options: [
      "Yes, they've done well",
      "Partially, but more needs to be done", 
      "No, they have failed",
      "I'm not sure"
    ],
    vote_results: [0, 0, 0, 0],
    votes_count: 0,
    user_vote: undefined,
    ends_at: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString(),
    privacy_mode: 'public',
    tags: ['politics', 'governance', 'transparency', 'CPDM', 'opposition']
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
      const createdPoll = await createCivicPoll(user.id);
      
      toast({
        title: "Civic poll created successfully!",
        description: "Your poll is now live and featured on the civic feed. +50 points earned!"
      });
      
      setPollCreated(true);
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: "Failed to create poll",
        description: "There was an error creating the civic poll. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (pollCreated) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6 text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-cm-green mx-auto" />
          <h3 className="text-xl font-semibold text-cm-green">Poll Created Successfully!</h3>
          <p className="text-muted-foreground">
            Your civic poll is now live and will appear on:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Featured on the home civic feed</li>
            <li>• Available in the polls discovery page</li>
            <li>• Visible on politician and party profiles</li>
            <li>• Enabled with geo-analytics and comment system</li>
          </ul>
          <Button 
            onClick={() => window.location.href = '/polls'} 
            className="bg-cm-green hover:bg-cm-green/90"
          >
            View All Polls
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="w-6 h-6 text-cm-green" />
            Create Civic Poll: Government Performance 2020-2025
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Poll Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Poll Configuration</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Style: Card Format</li>
                <li>• Duration: 7 days</li>
                <li>• Visibility: Public & Featured</li>
                <li>• Comments: Enabled</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Analytics Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Geo-mapping enabled</li>
                <li>• Gender split tracking</li>
                <li>• Regional vote display</li>
                <li>• Civic impact: High</li>
              </ul>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {previewPoll.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="px-2 py-1 bg-cm-green/10 text-cm-green text-xs rounded-full border border-cm-green/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              <h4 className="font-medium">Live Preview</h4>
            </div>
            
            <div className="border border-dashed border-primary/30 rounded-lg p-4 bg-primary/5">
              <CardPollStyle 
                poll={previewPoll}
                showResults={false}
                isActive={true}
                hasVoted={false}
                className="max-w-md"
              />
            </div>
          </div>

          {/* Create Poll Button */}
          <div className="flex justify-center pt-4">
            <Button 
              onClick={handleCreatePoll}
              disabled={loading || !user}
              size="lg"
              className="bg-cm-green hover:bg-cm-green/90 text-white px-8"
            >
              {loading ? 'Creating Poll...' : 'Create & Publish Civic Poll'}
            </Button>
          </div>

          {!user && (
            <p className="text-center text-sm text-muted-foreground">
              Please log in to create this civic poll
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};