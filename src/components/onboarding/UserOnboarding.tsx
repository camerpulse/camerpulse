import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Vote, 
  BookOpen, 
  Users, 
  ArrowRight,
  CheckCircle,
  Play,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  action: string;
  link: string;
  completed?: boolean;
}

interface UserOnboardingProps {
  isVisible: boolean;
  onComplete: () => void;
  onDismiss: () => void;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'village',
    title: 'Find Your Village',
    description: 'Connect with your ancestral village to build community bonds',
    icon: MapPin,
    action: 'Connect Now',
    link: '/villages'
  },
  {
    id: 'petition',
    title: 'Explore Petitions',
    description: 'See how you can support important causes in your community',
    icon: Vote,
    action: 'View Petitions',
    link: '/petitions'
  },
  {
    id: 'learn',
    title: 'Start Learning',
    description: 'Begin your civic education journey to understand your rights',
    icon: BookOpen,
    action: 'Start Learning',
    link: '/civic-education'
  },
  {
    id: 'community',
    title: 'Join Discussions',
    description: 'Connect with fellow citizens in the community feed',
    icon: Users,
    action: 'Join Community',
    link: '/feed'
  }
];

export const UserOnboarding: React.FC<UserOnboardingProps> = ({
  isVisible,
  onComplete,
  onDismiss
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem(`onboarding_completed_${user?.id}`);
    if (hasCompletedOnboarding && !isVisible) {
      return;
    }
  }, [user?.id, isVisible]);

  const handleStepComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFinishOnboarding = () => {
    localStorage.setItem(`onboarding_completed_${user?.id}`, 'true');
    onComplete();
  };

  const handleSkipOnboarding = () => {
    localStorage.setItem(`onboarding_skipped_${user?.id}`, 'true');
    onDismiss();
  };

  const progress = ((completedSteps.length) / onboardingSteps.length) * 100;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary">Welcome to CamerPulse</Badge>
            <Button variant="ghost" size="sm" onClick={handleSkipOnboarding}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle className="text-2xl mb-2">Let's get you started!</CardTitle>
          <p className="text-muted-foreground">
            Discover the key features that will help you engage with your community
          </p>
          <div className="mt-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              {completedSteps.length} of {onboardingSteps.length} features explored
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {onboardingSteps.map((step, index) => {
              const isCurrentStep = index === currentStep;
              const isCompleted = completedSteps.includes(step.id);
              const IconComponent = step.icon;

              return (
                <div
                  key={step.id}
                  className={`p-4 border rounded-lg transition-all ${
                    isCurrentStep 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : isCompleted 
                        ? 'border-green-500 bg-green-50'
                        : 'border-muted bg-muted/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-green-500' 
                        : isCurrentStep 
                          ? 'bg-primary' 
                          : 'bg-muted'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : (
                        <IconComponent className={`h-5 w-5 ${isCurrentStep ? 'text-white' : 'text-muted-foreground'}`} />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`font-medium ${isCurrentStep ? 'text-primary' : ''}`}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {step.description}
                      </p>
                      
                      {isCurrentStep && !isCompleted && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            asChild
                            onClick={() => handleStepComplete(step.id)}
                          >
                            <a href={step.link}>
                              <Play className="h-3 w-3 mr-1" />
                              {step.action}
                            </a>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStepComplete(step.id)}
                          >
                            Mark Complete
                          </Button>
                        </div>
                      )}
                      
                      {isCompleted && (
                        <Badge variant="secondary" className="text-green-700 bg-green-100">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={handleSkipOnboarding}>
              Skip for now
            </Button>
            
            {completedSteps.length === onboardingSteps.length ? (
              <Button onClick={handleFinishOnboarding} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Onboarding
              </Button>
            ) : (
              <Button 
                variant="outline"
                onClick={() => setCurrentStep(Math.min(currentStep + 1, onboardingSteps.length - 1))}
                disabled={currentStep >= onboardingSteps.length - 1}
              >
                Next Step
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};