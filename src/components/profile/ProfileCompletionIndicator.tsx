import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronUp,
  User,
  MapPin,
  Heart,
  Camera,
  Briefcase,
  Globe,
  Shield,
  Bell,
  Star,
  Target,
  TrendingUp,
  Award
} from 'lucide-react';

interface ProfileSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
  required: boolean;
  points: number;
  action: string;
  route?: string;
  checkFunction: (profile: any) => boolean;
}

interface ProfileCompletionProps {
  variant?: 'compact' | 'full';
  showRewards?: boolean;
}

const profileSections: ProfileSection[] = [
  {
    id: 'basic_info',
    title: 'Basic Information',
    description: 'Complete your name, bio, and profile type',
    icon: User,
    completed: false,
    required: true,
    points: 20,
    action: 'Complete Profile',
    route: '/settings',
    checkFunction: (profile) => !!(profile?.display_name && profile?.bio && profile?.profile_type)
  },
  {
    id: 'location',
    title: 'Location Details',
    description: 'Set your region and city for local content',
    icon: MapPin,
    completed: false,
    required: true,
    points: 15,
    action: 'Add Location',
    route: '/settings',
    checkFunction: (profile) => !!(profile?.location && profile?.region)
  },
  {
    id: 'profile_photo',
    title: 'Profile Photo',
    description: 'Upload a profile picture to personalize your account',
    icon: Camera,
    completed: false,
    required: false,
    points: 10,
    action: 'Upload Photo',
    route: '/settings',
    checkFunction: (profile) => !!(profile?.avatar_url)
  },
  {
    id: 'interests',
    title: 'Civic Interests',
    description: 'Select topics you care about for personalized content',
    icon: Heart,
    completed: false,
    required: false,
    points: 15,
    action: 'Choose Interests',
    route: '/settings',
    checkFunction: (profile) => !!(profile?.interests && profile.interests.length > 0)
  },
  {
    id: 'profession',
    title: 'Professional Info',
    description: 'Add your occupation and professional details',
    icon: Briefcase,
    completed: false,
    required: false,
    points: 10,
    action: 'Add Profession',
    route: '/settings',
    checkFunction: (profile) => !!(profile?.occupation)
  },
  {
    id: 'village_connection',
    title: 'Village Connection',
    description: 'Find and connect with your ancestral village',
    icon: Globe,
    completed: false,
    required: false,
    points: 25,
    action: 'Find Village',
    route: '/villages',
    checkFunction: (profile) => !!(profile?.village_id || profile?.ancestral_village)
  },
  {
    id: 'verification',
    title: 'Identity Verification',
    description: 'Verify your identity for enhanced trust and features',
    icon: Shield,
    completed: false,
    required: false,
    points: 30,
    action: 'Verify Identity',
    route: '/settings?tab=verification',
    checkFunction: (profile) => !!(profile?.verified || profile?.verification_status === 'verified')
  },
  {
    id: 'notifications',
    title: 'Notification Preferences',
    description: 'Set up notifications to stay informed about civic activities',
    icon: Bell,
    completed: false,
    required: false,
    points: 5,
    action: 'Setup Notifications',
    route: '/settings?tab=notifications',
    checkFunction: (profile) => !!(profile?.notification_preferences)
  }
];

export const ProfileCompletionIndicator: React.FC<ProfileCompletionProps> = ({
  variant = 'full',
  showRewards = true
}) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState(profileSections);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [civicLevel, setCivicLevel] = useState({ level: 1, name: 'New Citizen', nextLevel: 'Active Citizen' });

  useEffect(() => {
    if (profile) {
      updateCompletionStatus();
    }
  }, [profile]);

  const updateCompletionStatus = () => {
    const updatedSections = sections.map(section => ({
      ...section,
      completed: section.checkFunction(profile)
    }));

    setSections(updatedSections);

    // Calculate completion percentage
    const completedSections = updatedSections.filter(section => section.completed);
    const percentage = (completedSections.length / updatedSections.length) * 100;
    setCompletionPercentage(percentage);

    // Calculate points
    const total = updatedSections.reduce((sum, section) => sum + section.points, 0);
    const earned = completedSections.reduce((sum, section) => sum + section.points, 0);
    setTotalPoints(total);
    setEarnedPoints(earned);

    // Determine civic level
    setCivicLevel(calculateCivicLevel(earned));
  };

  const calculateCivicLevel = (points: number) => {
    if (points >= 100) return { level: 5, name: 'Civic Champion', nextLevel: 'Max Level' };
    if (points >= 75) return { level: 4, name: 'Civic Leader', nextLevel: 'Civic Champion' };
    if (points >= 50) return { level: 3, name: 'Engaged Citizen', nextLevel: 'Civic Leader' };
    if (points >= 25) return { level: 2, name: 'Active Citizen', nextLevel: 'Engaged Citizen' };
    return { level: 1, name: 'New Citizen', nextLevel: 'Active Citizen' };
  };

  const handleSectionAction = (section: ProfileSection) => {
    if (section.route) {
      navigate(section.route);
    }
  };

  const getRequiredSections = () => sections.filter(s => s.required && !s.completed);
  const getOptionalSections = () => sections.filter(s => !s.required && !s.completed);
  const getCompletedSections = () => sections.filter(s => s.completed);

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-1 -right-1 text-xs px-1 py-0"
                  >
                    {civicLevel.level}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium">Profile Completion</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round(completionPercentage)}% Complete • {earnedPoints}/{totalPoints} Points
                  </p>
                </div>
              </div>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isExpanded ? 'Hide details' : 'Show details'}
                </TooltipContent>
              </Tooltip>
            </div>
            
            <Progress value={completionPercentage} className="mt-3 h-2" />
            
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleContent className="mt-4 space-y-2">
                {getRequiredSections().length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-destructive mb-2">Required Actions:</p>
                    {getRequiredSections().map(section => (
                      <div key={section.id} className="flex items-center justify-between p-2 bg-destructive/5 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Circle className="h-4 w-4 text-destructive" />
                          <span className="text-sm">{section.title}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSectionAction(section)}
                        >
                          {section.action}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Profile Completion
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Complete your profile to unlock all platform features
              </p>
            </div>
            
            {showRewards && (
              <div className="text-center">
                <div className="flex items-center gap-1 mb-1">
                  <Award className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">{civicLevel.name}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  Level {civicLevel.level}
                </Badge>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{Math.round(completionPercentage)}% Complete</span>
              <span className="text-muted-foreground">
                {earnedPoints}/{totalPoints} Points
              </span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Required Sections */}
          {getRequiredSections().length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-destructive" />
                <h4 className="font-medium text-destructive">Required Actions</h4>
                <Badge variant="destructive" className="text-xs">
                  {getRequiredSections().length}
                </Badge>
              </div>
              
              <div className="space-y-2">
                {getRequiredSections().map(section => {
                  const Icon = section.icon;
                  return (
                    <div
                      key={section.id}
                      className="flex items-center justify-between p-3 bg-destructive/5 border border-destructive/20 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-destructive" />
                        <div>
                          <p className="font-medium text-sm">{section.title}</p>
                          <p className="text-xs text-muted-foreground">{section.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          +{section.points} pts
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => handleSectionAction(section)}
                        >
                          {section.action}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Optional Sections */}
          {getOptionalSections().length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-primary" />
                <h4 className="font-medium">Boost Your Profile</h4>
                <Badge variant="outline" className="text-xs">
                  Optional
                </Badge>
              </div>
              
              <div className="grid gap-2">
                {getOptionalSections().slice(0, 3).map(section => {
                  const Icon = section.icon;
                  return (
                    <div
                      key={section.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{section.title}</p>
                          <p className="text-xs text-muted-foreground">{section.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          +{section.points} pts
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSectionAction(section)}
                        >
                          {section.action}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {getOptionalSections().length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => navigate('/settings')}
                >
                  View All Options ({getOptionalSections().length - 3} more)
                </Button>
              )}
            </div>
          )}

          {/* Completed Sections */}
          {getCompletedSections().length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <h4 className="font-medium text-green-700">Completed</h4>
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                  {getCompletedSections().length}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {getCompletedSections().map(section => {
                  const Icon = section.icon;
                  return (
                    <div
                      key={section.id}
                      className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">{section.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completion Reward */}
          {completionPercentage === 100 && showRewards && (
            <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg">
              <div className="text-center">
                <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-bold text-primary">Profile Complete!</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  You've unlocked all platform features and earned {totalPoints} civic points!
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};