import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardPollStyle } from './PollStyles/CardPollStyle';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createCivicPoll } from '@/utils/createCivicPoll';
import { usePollOnboarding } from '@/hooks/usePollOnboarding';
import { PollOnboardingFlow, OnboardingTooltip, OnboardingProgressBadge } from './PollOnboardingFlow';
import { Vote, Eye, CheckCircle, Shield, Share2, BarChart3 } from 'lucide-react';

export const CivicPollCreator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pollCreated, setPollCreated] = useState(false);
  
  // Onboarding hook
  const {
    showWelcomeModal,
    showFirstPollSuccess,
    isFirstPoll,
    isSecondPoll,
    needsOnboarding,
    dismissWelcomeModal,
    dismissFirstPollSuccess,
    markStepCompleted,
    trackPollCreation
  } = usePollOnboarding();

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
      
      // Track poll creation for onboarding
      await trackPollCreation();

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
            onClick={() => navigate('/polls')} 
            className="bg-cm-green hover:bg-cm-green/90"
          >
            View All Polls
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Onboarding Flow */}
      <PollOnboardingFlow
        showWelcomeModal={showWelcomeModal}
        showFirstPollSuccess={showFirstPollSuccess}
        isFirstPoll={isFirstPoll}
        isSecondPoll={isSecondPoll}
        onDismissWelcome={dismissWelcomeModal}
        onDismissSuccess={dismissFirstPollSuccess}
        onStepCompleted={markStepCompleted}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Vote className="w-6 h-6 text-cm-green" />
                Create Civic Poll: Government Performance 2020-2025
              </CardTitle>
              {needsOnboarding && (
                <OnboardingProgressBadge currentStep={1} totalSteps={2} />
              )}
            </div>
          </CardHeader>
        <CardContent className="space-y-6">
          {/* Poll Configuration with Onboarding Tooltips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-2">
              {needsOnboarding ? (
                <OnboardingTooltip 
                  title="Poll Configuration"
                  content="These settings determine how your poll behaves. Card format is engaging and mobile-friendly, while 7-day duration allows for good participation without dragging on too long."
                >
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    Poll Configuration
                    <Shield className="w-4 h-4 text-cm-green" />
                  </h4>
                </OnboardingTooltip>
              ) : (
                <h4 className="font-medium text-sm">Poll Configuration</h4>
              )}
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Style: Card Format</li>
                <li>• Duration: 7 days</li>
                <li>• Visibility: Public & Featured</li>
                <li>• Comments: Enabled</li>
              </ul>
            </div>
            <div className="space-y-2">
              {needsOnboarding ? (
                <OnboardingTooltip 
                  title="Analytics Features"
                  content="These powerful analytics help you understand voting patterns across Cameroon's regions and demographics. Use this data to better understand public opinion."
                >
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    Analytics Features
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                  </h4>
                </OnboardingTooltip>
              ) : (
                <h4 className="font-medium text-sm">Analytics Features</h4>
              )}
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Geo-mapping enabled</li>
                <li>• Gender split tracking</li>
                <li>• Regional vote display</li>
                <li>• Civic impact: High</li>
              </ul>
            </div>
          </div>

          {/* Tags with Onboarding Tooltip */}
          <div className="space-y-2">
            {needsOnboarding ? (
              <OnboardingTooltip 
                title="Tags for Discovery"
                content="Tags help people find your poll when searching. Use relevant political parties, regions, and topics to maximize reach and engagement."
              >
                <h4 className="font-medium text-sm flex items-center gap-2">
                  Tags
                  <Share2 className="w-4 h-4 text-purple-500" />
                </h4>
              </OnboardingTooltip>
            ) : (
              <h4 className="font-medium text-sm">Tags</h4>
            )}
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

          {/* Preview Section with Onboarding Tooltip */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              {needsOnboarding ? (
                <OnboardingTooltip 
                  title="Live Preview"
                  content="This shows exactly how your poll will appear to voters. Make sure the question is clear and options are balanced before publishing."
                >
                  <h4 className="font-medium">Live Preview</h4>
                </OnboardingTooltip>
              ) : (
                <h4 className="font-medium">Live Preview</h4>
              )}
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

          {/* Create Poll Button with Onboarding Context */}
          <div className="flex flex-col items-center pt-4 space-y-3">
            {needsOnboarding && isFirstPoll && (
              <div className="text-center text-sm text-muted-foreground bg-cm-green/5 p-3 rounded-lg border border-cm-green/20">
                🎯 <strong>First Poll Tip:</strong> Once published, share your poll on social media and WhatsApp groups to maximize participation from across Cameroon!
              </div>
            )}
            
            <Button 
              onClick={handleCreatePoll}
              disabled={loading || !user}
              size="lg"
              className="bg-cm-green hover:bg-cm-green/90 text-white px-8"
            >
              {loading ? 'Creating Poll...' : isFirstPoll ? '🚀 Create My First Civic Poll' : 'Create & Publish Civic Poll'}
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
    </>
  );
};