import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OnboardingData {
  id: string;
  user_id: string;
  onboarding_completed: boolean;
  polls_created_count: number;
  first_poll_created_at: string | null;
  onboarding_completed_at: string | null;
  onboarding_steps_completed: string[] | any;
}

export const usePollOnboarding = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showFirstPollSuccess, setShowFirstPollSuccess] = useState(false);

  // Check if user needs onboarding
  const needsOnboarding = onboardingData && !onboardingData.onboarding_completed;
  const isFirstPoll = onboardingData?.polls_created_count === 0;
  const isSecondPoll = onboardingData?.polls_created_count === 1;

  // Fetch onboarding data
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    fetchOnboardingData();
  }, [user]);

  const fetchOnboardingData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_poll_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching onboarding data:', error);
        return;
      }

      if (!data) {
        // Create initial onboarding record
        const { data: newData, error: insertError } = await supabase
          .from('user_poll_onboarding')
          .insert([{
            user_id: user.id,
            polls_created_count: 0,
            onboarding_completed: false,
            onboarding_steps_completed: []
          }])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating onboarding record:', insertError);
          return;
        }

        setOnboardingData({
          ...newData,
          onboarding_steps_completed: Array.isArray(newData.onboarding_steps_completed) 
            ? newData.onboarding_steps_completed 
            : []
        });
        setShowWelcomeModal(true);
      } else {
        const stepsCompleted = Array.isArray(data.onboarding_steps_completed) 
          ? data.onboarding_steps_completed 
          : [];
          
        setOnboardingData({
          ...data,
          onboarding_steps_completed: stepsCompleted
        });
        
        // Show welcome modal for first-time users who haven't seen it
        if (data.polls_created_count === 0 && !stepsCompleted.includes('welcome_shown')) {
          setShowWelcomeModal(true);
        }
      }
    } catch (error) {
      console.error('Error in fetchOnboardingData:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markStepCompleted = async (step: string) => {
    if (!user || !onboardingData) return;

    const currentSteps = Array.isArray(onboardingData.onboarding_steps_completed) 
      ? onboardingData.onboarding_steps_completed 
      : [];
    const updatedSteps = [...currentSteps];
    if (!updatedSteps.includes(step)) {
      updatedSteps.push(step);
    }

    try {
      const { error } = await supabase
        .from('user_poll_onboarding')
        .update({ 
          onboarding_steps_completed: updatedSteps 
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating onboarding step:', error);
        return;
      }

      setOnboardingData(prev => prev ? {
        ...prev,
        onboarding_steps_completed: updatedSteps
      } : null);
    } catch (error) {
      console.error('Error in markStepCompleted:', error);
    }
  };

  const trackPollCreation = async () => {
    if (!user) return;

    try {
      // Call the database function to track poll creation
      const { error } = await supabase.rpc('track_user_poll_creation', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error tracking poll creation:', error);
        return;
      }

      // Refresh onboarding data
      await fetchOnboardingData();

      // Show success message for first poll
      if (isFirstPoll) {
        setShowFirstPollSuccess(true);
        toast({
          title: "🎉 First Poll Created!",
          description: "Amazing! You've successfully created your first poll. Track your results in the Poll Dashboard.",
        });
      }
    } catch (error) {
      console.error('Error in trackPollCreation:', error);
    }
  };

  const dismissWelcomeModal = () => {
    setShowWelcomeModal(false);
    markStepCompleted('welcome_shown');
  };

  const dismissFirstPollSuccess = () => {
    setShowFirstPollSuccess(false);
    markStepCompleted('first_poll_success_shown');
  };

  return {
    // State
    onboardingData,
    isLoading,
    showWelcomeModal,
    showFirstPollSuccess,
    
    // Computed
    needsOnboarding,
    isFirstPoll,
    isSecondPoll,
    
    // Actions
    markStepCompleted,
    trackPollCreation,
    dismissWelcomeModal,
    dismissFirstPollSuccess,
    refreshOnboardingData: fetchOnboardingData
  };
};