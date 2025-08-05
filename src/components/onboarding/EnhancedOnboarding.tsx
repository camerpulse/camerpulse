import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  MapPin,
  Users,
  BookOpen,
  Globe,
  Camera,
  Calendar as CalendarIcon,
  User,
  Mail,
  Phone,
  Briefcase,
  Settings,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Star,
  Trophy,
  Target,
  Heart,
  Shield,
  Zap,
  Lightbulb,
  MessageCircle,
  Bell,
  Lock
} from 'lucide-react';

interface EnhancedOnboardingProps {
  isVisible: boolean;
  onComplete: () => void;
  onDismiss: () => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: 'setup' | 'discovery' | 'engagement';
  required: boolean;
  completed: boolean;
}

interface ProfileData {
  display_name?: string;
  bio?: string;
  location?: string;
  region?: string;
  profession?: string;
  civic_tagline?: string;
  profile_type?: string;
  date_of_birth?: Date;
  phone_number?: string;
  interests?: string[];
  civic_interests?: string[];
  language_preference?: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'basic_info',
    title: 'Complete Your Profile',
    description: 'Add your basic information to personalize your experience',
    icon: User,
    category: 'setup',
    required: true,
    completed: false
  },
  {
    id: 'location',
    title: 'Set Your Location',
    description: 'Connect with your local community and representatives',
    icon: MapPin,
    category: 'setup',
    required: true,
    completed: false
  },
  {
    id: 'interests',
    title: 'Choose Your Interests',
    description: 'Select topics you care about for personalized content',
    icon: Heart,
    category: 'setup',
    required: false,
    completed: false
  },
  {
    id: 'find_village',
    title: 'Find Your Village',
    description: 'Discover information about your ancestral village',
    icon: Globe,
    category: 'discovery',
    required: false,
    completed: false
  },
  {
    id: 'follow_leaders',
    title: 'Follow Political Leaders',
    description: 'Stay updated with your representatives and government',
    icon: Users,
    category: 'discovery',
    required: false,
    completed: false
  },
  {
    id: 'civic_education',
    title: 'Learn About Civic Rights',
    description: 'Understand your rights and responsibilities as a citizen',
    icon: BookOpen,
    category: 'engagement',
    required: false,
    completed: false
  },
  {
    id: 'first_poll',
    title: 'Participate in a Poll',
    description: 'Make your voice heard on important civic issues',
    icon: Target,
    category: 'engagement',
    required: false,
    completed: false
  },
  {
    id: 'notifications',
    title: 'Set Up Notifications',
    description: 'Stay informed about important civic updates',
    icon: Bell,
    category: 'setup',
    required: false,
    completed: false
  }
];

const regions = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

const civicInterests = [
  'Education', 'Healthcare', 'Infrastructure', 'Environment',
  'Security', 'Economy', 'Agriculture', 'Technology',
  'Social Services', 'Human Rights', 'Youth Development',
  'Women Empowerment', 'Transparency', 'Governance'
];

const profileTypes = [
  { value: 'normal_user', label: 'Citizen' },
  { value: 'student', label: 'Student' },
  { value: 'professional', label: 'Professional' },
  { value: 'activist', label: 'Activist' },
  { value: 'journalist', label: 'Journalist' },
  { value: 'artist', label: 'Artist' },
  { value: 'entrepreneur', label: 'Entrepreneur' }
];

export const EnhancedOnboarding: React.FC<EnhancedOnboardingProps> = ({
  isVisible,
  onComplete,
  onDismiss
}) => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState(onboardingSteps);
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showTooltips, setShowTooltips] = useState(true);

  useEffect(() => {
    if (user) {
      loadExistingProfile();
      updateStepCompletion();
    }
  }, [user]);

  useEffect(() => {
    calculateCompletion();
  }, [steps]);

  const loadExistingProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (data) {
        setProfileData({
          display_name: data.display_name,
          bio: data.bio,
          location: data.location,
          region: data.region,
          profession: data.occupation,
          civic_tagline: data.civic_tagline,
          profile_type: data.profile_type,
          phone_number: data.phone_number,
          language_preference: data.preferred_language
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const updateStepCompletion = () => {
    setSteps(prev => prev.map(step => ({
      ...step,
      completed: checkStepCompletion(step.id)
    })));
  };

  const checkStepCompletion = (stepId: string): boolean => {
    switch (stepId) {
      case 'basic_info':
        return !!(profileData.display_name && profileData.profile_type);
      case 'location':
        return !!(profileData.location && profileData.region);
      case 'interests':
        return !!(profileData.civic_interests && profileData.civic_interests.length > 0);
      default:
        return false;
    }
  };

  const calculateCompletion = () => {
    const completed = steps.filter(step => step.completed).length;
    const total = steps.length;
    setCompletionPercentage((completed / total) * 100);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipStep = () => {
    handleNext();
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Save profile data
      if (Object.keys(profileData).length > 0) {
        const { error } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: user?.id,
            ...profileData,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      // Mark onboarding as completed
      localStorage.setItem(`onboarding_completed_${user?.id}`, 'true');
      
      toast({
        title: "Welcome to CamerPulse!",
        description: "Your profile has been set up successfully. Start exploring the platform!"
      });

      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfileData = (key: keyof ProfileData, value: any) => {
    setProfileData(prev => ({ ...prev, [key]: value }));
  };

  const renderStepContent = (step: OnboardingStep) => {
    switch (step.id) {
      case 'basic_info':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Full Name *</Label>
              <Input
                id="display_name"
                value={profileData.display_name || ''}
                onChange={(e) => updateProfileData('display_name', e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile_type">I am a *</Label>
              <Select 
                value={profileData.profile_type} 
                onValueChange={(value) => updateProfileData('profile_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {profileTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">About Me</Label>
              <Textarea
                id="bio"
                value={profileData.bio || ''}
                onChange={(e) => updateProfileData('bio', e.target.value)}
                placeholder="Tell us about yourself and your civic interests..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="civic_tagline">Civic Motto (Optional)</Label>
              <Input
                id="civic_tagline"
                value={profileData.civic_tagline || ''}
                onChange={(e) => updateProfileData('civic_tagline', e.target.value)}
                placeholder="A short phrase that represents your civic values"
              />
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="region">Region *</Label>
              <Select 
                value={profileData.region} 
                onValueChange={(value) => updateProfileData('region', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">City/Town *</Label>
              <Input
                id="location"
                value={profileData.location || ''}
                onChange={(e) => updateProfileData('location', e.target.value)}
                placeholder="Enter your city or town"
              />
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Why location matters</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Your location helps us show you relevant local representatives, 
                    village information, and regional civic activities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'interests':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Select Your Civic Interests</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Choose topics you care about to get personalized content
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {civicInterests.map(interest => (
                <Button
                  key={interest}
                  variant={profileData.civic_interests?.includes(interest) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const current = profileData.civic_interests || [];
                    const updated = current.includes(interest)
                      ? current.filter(i => i !== interest)
                      : [...current, interest];
                    updateProfileData('civic_interests', updated);
                  }}
                  className="justify-start"
                >
                  {interest}
                </Button>
              ))}
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Selected: {profileData.civic_interests?.length || 0} interests
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Your feed will be customized based on your interests
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'find_village':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Globe className="h-16 w-16 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold">Discover Your Village</h3>
              <p className="text-muted-foreground">
                Learn about your ancestral village and connect with your heritage
              </p>
            </div>
            
            <Button 
              onClick={() => navigate('/villages')} 
              className="w-full"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Explore Villages
            </Button>
          </div>
        );

      case 'follow_leaders':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Users className="h-16 w-16 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold">Follow Your Representatives</h3>
              <p className="text-muted-foreground">
                Stay updated with your local and national political representatives
              </p>
            </div>
            
            <Button 
              onClick={() => navigate('/politicians')} 
              className="w-full"
            >
              <Users className="h-4 w-4 mr-2" />
              Browse Politicians
            </Button>
          </div>
        );

      case 'civic_education':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <BookOpen className="h-16 w-16 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold">Learn Your Civic Rights</h3>
              <p className="text-muted-foreground">
                Understand your rights and responsibilities as a Cameroonian citizen
              </p>
            </div>
            
            <Button 
              onClick={() => navigate('/civic-education')} 
              className="w-full"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Start Learning
            </Button>
          </div>
        );

      case 'first_poll':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Target className="h-16 w-16 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold">Make Your Voice Heard</h3>
              <p className="text-muted-foreground">
                Participate in polls and surveys on important civic issues
              </p>
            </div>
            
            <Button 
              onClick={() => navigate('/polls')} 
              className="w-full"
            >
              <Target className="h-4 w-4 mr-2" />
              View Polls
            </Button>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Bell className="h-16 w-16 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold">Stay Informed</h3>
              <p className="text-muted-foreground">
                Get notified about important civic updates and activities
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Political Updates</p>
                  <p className="text-sm text-muted-foreground">News from your representatives</p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Village News</p>
                  <p className="text-sm text-muted-foreground">Updates from your village</p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Civic Education</p>
                  <p className="text-sm text-muted-foreground">New learning content</p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Step content not found</div>;
    }
  };

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];

  return (
    <TooltipProvider>
      <Dialog open={isVisible} onOpenChange={() => {}}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Welcome to CamerPulse
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Progress Overview */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Setup Progress</h3>
                    <p className="text-sm text-muted-foreground">
                      {Math.round(completionPercentage)}% Complete
                    </p>
                  </div>
                  <Badge variant="outline">
                    Step {currentStep + 1} of {steps.length}
                  </Badge>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </CardHeader>
            </Card>

            {/* Step Navigation */}
            <div className="grid grid-cols-4 gap-2">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Tooltip key={step.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={index === currentStep ? "default" : step.completed ? "secondary" : "outline"}
                        size="sm"
                        className="flex flex-col gap-1 h-auto py-2"
                        onClick={() => setCurrentStep(index)}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs text-center leading-tight">
                          {step.title.split(' ').slice(0, 2).join(' ')}
                        </span>
                        {step.completed && (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{step.title}</p>
                      <p className="text-sm">{step.description}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>

            {/* Current Step Content */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {React.createElement(currentStepData.icon, { 
                    className: "h-6 w-6 text-primary" 
                  })}
                  <div>
                    <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {currentStepData.description}
                    </p>
                  </div>
                  {currentStepData.required && (
                    <Badge variant="destructive" className="ml-auto">Required</Badge>
                  )}
                  {currentStepData.completed && (
                    <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {renderStepContent(currentStepData)}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                {!currentStepData.required && (
                  <Button
                    variant="ghost"
                    onClick={handleSkipStep}
                  >
                    Skip This Step
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={onDismiss}
                >
                  Finish Later
                </Button>
                
                <Button
                  onClick={currentStep === steps.length - 1 ? handleComplete : handleNext}
                  disabled={loading || (currentStepData.required && !currentStepData.completed)}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  ) : currentStep === steps.length - 1 ? (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};