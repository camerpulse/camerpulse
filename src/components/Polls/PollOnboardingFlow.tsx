import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Vote, 
  CheckCircle, 
  Lightbulb, 
  Shield, 
  Share2, 
  BarChart3,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

interface PollOnboardingFlowProps {
  showWelcomeModal: boolean;
  showFirstPollSuccess: boolean;
  isFirstPoll: boolean;
  isSecondPoll: boolean;
  onDismissWelcome: () => void;
  onDismissSuccess: () => void;
  onStepCompleted: (step: string) => void;
}

export const PollOnboardingFlow = ({
  showWelcomeModal,
  showFirstPollSuccess,
  isFirstPoll,
  isSecondPoll,
  onDismissWelcome,
  onDismissSuccess,
  onStepCompleted
}: PollOnboardingFlowProps) => {
  const [currentWelcomeStep, setCurrentWelcomeStep] = useState(0);

  const welcomeSteps = [
    {
      title: "Welcome to CamerPulse Polls",
      subtitle: "Let's give your voice the power to move Cameroon.",
      content: (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-cm-green/10 rounded-full flex items-center justify-center mx-auto">
            <Vote className="w-8 h-8 text-cm-green" />
          </div>
          <p className="text-muted-foreground">
            Join thousands of Cameroonians sharing their voices on important civic matters. 
            Create polls that spark meaningful conversations and drive democratic engagement.
          </p>
        </div>
      )
    },
    {
      title: "Best Practices for Effective Polls",
      subtitle: "Create polls that resonate with your community",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <Lightbulb className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Clear & Compelling Titles</h4>
                <p className="text-xs text-muted-foreground">Use action words and be specific about the issue</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Balanced Options</h4>
                <p className="text-xs text-muted-foreground">Provide fair representation of different viewpoints</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <Shield className="w-5 h-5 text-cm-green mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Enable Fraud Protection</h4>
                <p className="text-xs text-muted-foreground">Keep your polls secure and trustworthy</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Maximize Your Impact",
      subtitle: "Share and engage for better results",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <Share2 className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Share Widely</h4>
                <p className="text-xs text-muted-foreground">Post on social media, WhatsApp groups, and community forums</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Monitor Analytics</h4>
                <p className="text-xs text-muted-foreground">Track regional voting patterns and engagement metrics</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <Sparkles className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Engage Thoughtfully</h4>
                <p className="text-xs text-muted-foreground">Respond to comments and foster constructive dialogue</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextWelcomeStep = () => {
    if (currentWelcomeStep < welcomeSteps.length - 1) {
      setCurrentWelcomeStep(currentWelcomeStep + 1);
    } else {
      onDismissWelcome();
      onStepCompleted('welcome_completed');
    }
  };

  const prevWelcomeStep = () => {
    if (currentWelcomeStep > 0) {
      setCurrentWelcomeStep(currentWelcomeStep - 1);
    }
  };

  return (
    <>
      {/* Welcome Modal */}
      <Dialog open={showWelcomeModal} onOpenChange={onDismissWelcome}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {welcomeSteps[currentWelcomeStep].title}
            </DialogTitle>
            <p className="text-center text-sm text-muted-foreground">
              {welcomeSteps[currentWelcomeStep].subtitle}
            </p>
          </DialogHeader>
          
          <div className="py-4">
            {welcomeSteps[currentWelcomeStep].content}
          </div>

          {/* Progress indicators */}
          <div className="flex justify-center space-x-2 py-2">
            {welcomeSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentWelcomeStep 
                    ? 'bg-cm-green' 
                    : index < currentWelcomeStep 
                      ? 'bg-cm-green/50' 
                      : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={prevWelcomeStep}
              disabled={currentWelcomeStep === 0}
              size="sm"
            >
              Previous
            </Button>
            
            <Button
              onClick={nextWelcomeStep}
              className="bg-cm-green hover:bg-cm-green/90"
              size="sm"
            >
              {currentWelcomeStep === welcomeSteps.length - 1 ? 'Get Started' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* First Poll Success Modal */}
      <Dialog open={showFirstPollSuccess} onOpenChange={onDismissSuccess}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center space-y-6 py-4">
            <div className="w-20 h-20 bg-cm-green/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-cm-green" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-cm-green">
                🎉 First Poll Created!
              </h3>
              <p className="text-muted-foreground">
                Amazing! You've successfully created your first poll. Your voice is now part of Cameroon's democratic dialogue.
              </p>
            </div>

            <Card className="bg-gradient-to-r from-cm-green/5 to-blue-500/5 border-cm-green/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="font-medium text-sm">Next Steps</p>
                    <p className="text-xs text-muted-foreground">Track your results in the Poll Dashboard</p>
                  </div>
                  <BarChart3 className="w-6 h-6 text-cm-green" />
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={onDismissSuccess}
              className="bg-cm-green hover:bg-cm-green/90 w-full"
            >
              View Poll Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Tooltip components for form fields
export const OnboardingTooltip = ({ 
  children, 
  content, 
  title 
}: { 
  children: React.ReactNode;
  content: string;
  title?: string;
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            {children}
            <Info className="w-4 h-4 text-muted-foreground absolute -top-1 -right-1 bg-background rounded-full p-0.5" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {title && <p className="font-medium">{title}</p>}
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Progress badge for onboarding users
export const OnboardingProgressBadge = ({ 
  currentStep, 
  totalSteps 
}: { 
  currentStep: number;
  totalSteps: number;
}) => {
  const progress = Math.round((currentStep / totalSteps) * 100);
  
  return (
    <Badge variant="outline" className="border-cm-green/30 bg-cm-green/5">
      <Sparkles className="w-3 h-3 mr-1" />
      Onboarding: {progress}% complete
    </Badge>
  );
};