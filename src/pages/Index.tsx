import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from "@/components/Homepage/HeroSection";
import { AppLayout } from "@/components/Layout/AppLayout";
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect logged-in users to pulse feed
    if (user) {
      navigate('/pulse');
    }
  }, [user, navigate]);

  return (
    <AppLayout>
      <HeroSection />
    </AppLayout>
  );
};

export default Index;