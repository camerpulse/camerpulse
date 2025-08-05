import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import {
  Globe,
  MapPin,
  Vote,
  BookOpen,
  Users,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const onboardingSteps = [
  {
    title: 'Welcome to CamerPulse',
    description: 'Your gateway to civic engagement in Cameroon',
    icon: Globe,
    content: 'CamerPulse connects you with your heritage, helps you participate in democracy, and builds transparent governance.'
  },
  {
    title: 'Find Your Village',
    description: 'Connect with your ancestral roots',
    icon: MapPin,
    content: 'Discover your village heritage, connect with community members, and contribute to local development.'
  },
  {
    title: 'Participate in Democracy',
    description: 'Make your voice heard',
    icon: Vote,
    content: 'Create and sign petitions, track political activities, and engage in meaningful civic discussions.'
  },
  {
    title: 'Learn and Grow',
    description: 'Understand your rights and duties',
    icon: BookOpen,
    content: 'Access civic education content, take quizzes, and earn civic knowledge points.'
  }
];

export function OnboardingManager() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem(`onboarding_completed_${user?.id}`);
    
    if (user && !hasCompletedOnboarding) {
      // Delay showing onboarding to allow page to load
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
    }
    setIsOpen(false);
  };

  const currentStepData = onboardingSteps[currentStep];
  const Icon = currentStepData?.icon;

  if (!isOpen || !user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md z-50 bg-background border shadow-lg">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              {Icon && <Icon className="h-8 w-8 text-primary" />}
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            {currentStepData.title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-center text-sm text-muted-foreground">
                {currentStepData.content}
              </p>
            </CardContent>
          </Card>

          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button variant="ghost" onClick={handleSkip}>
              Skip
            </Button>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {currentStep + 1} of {onboardingSteps.length}
              </Badge>
              <Button onClick={handleNext}>
                {currentStep === onboardingSteps.length - 1 ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Get Started
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}