import React, { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Lightbulb, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Target,
  MousePointer,
  Keyboard,
  Eye
} from 'lucide-react';

interface TooltipStep {
  id: string;
  selector: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'hover' | 'focus';
  nextButton?: string;
  skipButton?: string;
}

interface TooltipGuideProps {
  steps: TooltipStep[];
  isActive: boolean;
  onComplete: () => void;
  onDismiss: () => void;
  tourName: string;
}

export const TooltipGuide: React.FC<TooltipGuideProps> = ({
  steps,
  isActive,
  onComplete,
  onDismiss,
  tourName
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isActive && steps.length > 0) {
      highlightStep(currentStep);
    }

    return () => {
      removeHighlight();
    };
  }, [isActive, currentStep, steps]);

  useEffect(() => {
    // Check if user has completed this tour
    const hasCompletedTour = localStorage.getItem(`tour_completed_${tourName}_${user?.id}`);
    if (hasCompletedTour && isActive) {
      onDismiss();
    }
  }, [user?.id, tourName, isActive]);

  const highlightStep = (stepIndex: number) => {
    if (stepIndex >= steps.length) return;

    const step = steps[stepIndex];
    const element = document.querySelector(step.selector);
    
    if (element) {
      setHighlightedElement(element);
      
      // Scroll element into view
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      });

      // Add highlight effect
      element.classList.add('tooltip-guide-highlight');
      
      // Calculate tooltip position
      const rect = element.getBoundingClientRect();
      const tooltipX = rect.left + rect.width / 2;
      const tooltipY = rect.top + rect.height + 10;
      
      setTooltipPosition({ x: tooltipX, y: tooltipY });

      // Add click listener if action is click
      if (step.action === 'click') {
        element.addEventListener('click', handleStepAction);
      }
    }
  };

  const removeHighlight = () => {
    if (highlightedElement) {
      highlightedElement.classList.remove('tooltip-guide-highlight');
      highlightedElement.removeEventListener('click', handleStepAction);
      setHighlightedElement(null);
    }
  };

  const handleStepAction = () => {
    if (currentStep < steps.length - 1) {
      nextStep();
    } else {
      completeTour();
    }
  };

  const nextStep = () => {
    removeHighlight();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const previousStep = () => {
    removeHighlight();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    removeHighlight();
    localStorage.setItem(`tour_skipped_${tourName}_${user?.id}`, 'true');
    onDismiss();
  };

  const completeTour = () => {
    removeHighlight();
    localStorage.setItem(`tour_completed_${tourName}_${user?.id}`, 'true');
    onComplete();
  };

  if (!isActive || steps.length === 0) return null;

  const currentStepData = steps[currentStep];

  return (
    <TooltipProvider>
      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Tooltip */}
        <div 
          className="absolute pointer-events-auto"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <Card className="w-80 shadow-lg border-2 border-primary">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <Badge variant="outline">
                    {currentStep + 1} of {steps.length}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipTour}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">{currentStepData.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {currentStepData.content}
                </p>

                {/* Action hint */}
                {currentStepData.action && (
                  <div className="flex items-center gap-2 text-xs text-primary">
                    {currentStepData.action === 'click' && (
                      <>
                        <MousePointer className="h-3 w-3" />
                        <span>Click the highlighted element</span>
                      </>
                    )}
                    {currentStepData.action === 'hover' && (
                      <>
                        <Eye className="h-3 w-3" />
                        <span>Hover over the highlighted element</span>
                      </>
                    )}
                    {currentStepData.action === 'focus' && (
                      <>
                        <Keyboard className="h-3 w-3" />
                        <span>Focus on the highlighted element</span>
                      </>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={previousStep}
                    disabled={currentStep === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={skipTour}
                    >
                      Skip Tour
                    </Button>
                    
                    <Button
                      variant="default"
                      size="sm"
                      onClick={currentStep === steps.length - 1 ? completeTour : nextStep}
                    >
                      {currentStep === steps.length - 1 ? (
                        'Finish'
                      ) : (
                        <>
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx global>{`
        .tooltip-guide-highlight {
          position: relative;
          z-index: 51;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
        }
        
        .tooltip-guide-highlight::before {
          content: '';
          position: absolute;
          inset: -4px;
          border: 2px solid rgb(59, 130, 246);
          border-radius: 8px;
          animation: pulse-border 2s ease-in-out infinite;
        }
        
        @keyframes pulse-border {
          0%, 100% { 
            border-color: rgb(59, 130, 246);
            opacity: 1;
          }
          50% { 
            border-color: rgb(147, 197, 253);
            opacity: 0.7;
          }
        }
      `}</style>
    </TooltipProvider>
  );
};

// Predefined tour guides for different parts of the application
export const dashboardTour: TooltipStep[] = [
  {
    id: 'welcome',
    selector: '[data-tour="dashboard-header"]',
    title: 'Welcome to Your Dashboard',
    content: 'This is your personal civic dashboard where you can track your engagement and stay updated.',
    position: 'bottom'
  },
  {
    id: 'navigation',
    selector: '[data-tour="main-nav"]',
    title: 'Main Navigation',
    content: 'Use this navigation to explore different sections like Politicians, Villages, and Civic Education.',
    position: 'right'
  },
  {
    id: 'civic-score',
    selector: '[data-tour="civic-score"]',
    title: 'Your Civic Score',
    content: 'This shows your civic engagement level based on your participation in polls, discussions, and community activities.',
    position: 'bottom'
  },
  {
    id: 'quick-actions',
    selector: '[data-tour="quick-actions"]',
    title: 'Quick Actions',
    content: 'Access frequently used features like creating polls, finding your village, or viewing notifications.',
    position: 'top'
  }
];

export const feedTour: TooltipStep[] = [
  {
    id: 'feed-tabs',
    selector: '[data-tour="feed-tabs"]',
    title: 'Content Categories',
    content: 'Switch between different types of content: Civic updates, Jobs, Artists, Villages, and Marketplace.',
    position: 'bottom'
  },
  {
    id: 'filters',
    selector: '[data-tour="feed-filters"]',
    title: 'Customize Your Feed',
    content: 'Use filters to personalize your content based on region, type, and time range.',
    position: 'bottom'
  },
  {
    id: 'post-actions',
    selector: '[data-tour="post-actions"]',
    title: 'Engage with Content',
    content: 'Like, comment, share, and bookmark content that interests you.',
    position: 'top',
    action: 'hover'
  }
];

export const pollsTour: TooltipStep[] = [
  {
    id: 'active-polls',
    selector: '[data-tour="active-polls"]',
    title: 'Active Polls',
    content: 'Participate in ongoing polls to make your voice heard on important civic issues.',
    position: 'bottom'
  },
  {
    id: 'create-poll',
    selector: '[data-tour="create-poll"]',
    title: 'Create Your Own Poll',
    content: 'Start a discussion by creating your own poll on topics that matter to you.',
    position: 'bottom',
    action: 'click'
  },
  {
    id: 'poll-results',
    selector: '[data-tour="poll-results"]',
    title: 'View Results',
    content: 'See real-time results and analytics for polls you\'ve participated in.',
    position: 'top'
  }
];