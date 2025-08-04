import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserOnboarding } from './UserOnboarding';

export const OnboardingManager: React.FC = () => {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      // Check if user has completed onboarding
      const hasCompletedOnboarding = localStorage.getItem(`onboarding_completed_${user.id}`);
      const hasSkippedOnboarding = localStorage.getItem(`onboarding_skipped_${user.id}`);
      
      if (!hasCompletedOnboarding && !hasSkippedOnboarding) {
        // Show onboarding after a short delay for better UX
        const timer = setTimeout(() => {
          setShowOnboarding(true);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleOnboardingDismiss = () => {
    setShowOnboarding(false);
  };

  if (!user || !showOnboarding) {
    return null;
  }

  return (
    <UserOnboarding
      isVisible={showOnboarding}
      onComplete={handleOnboardingComplete}
      onDismiss={handleOnboardingDismiss}
    />
  );
};