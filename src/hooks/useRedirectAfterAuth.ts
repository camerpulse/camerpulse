import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const useRedirectAfterAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user) {
      // Get the intended destination from location state or URL params
      const urlParams = new URLSearchParams(location.search);
      const redirectParam = urlParams.get('redirect');
      const from = redirectParam || (location.state as any)?.from?.pathname || '/';
      
      // Smart redirect logic
      if (from === '/auth' || from === '/login' || from === '/register' || from === '/diaspora-auth' || from === '/') {
        // If coming from auth pages or home, redirect to feed
        navigate('/feed', { replace: true });
      } else {
        // Redirect to the originally intended page
        navigate(from, { replace: true });
      }
    }
  }, [user, navigate, location]);
};