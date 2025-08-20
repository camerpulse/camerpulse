import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const useRedirectAfterAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user && profile) {
      // Get the intended destination from location state
      const from = (location.state as any)?.from?.pathname || '/';
      
      // Smart redirect logic
      if (from === '/auth' || from === '/login' || from === '/register') {
        // If coming from auth pages, redirect to feed
        navigate('/feed', { replace: true });
      } else {
        // Redirect to the originally intended page
        navigate(from, { replace: true });
      }
    }
  }, [user, profile, navigate, location]);
};