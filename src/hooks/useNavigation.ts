import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook to replace window.location.href with proper React Router navigation
 */
export const useNavigation = () => {
  const navigate = useNavigate();

  const navigateTo = (url: string, options?: { replace?: boolean; external?: boolean }) => {
    if (options?.external || url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:')) {
      // External URLs - use window.location
      window.location.href = url;
      return;
    }

    // Internal navigation - use React Router
    navigate(url, { replace: options?.replace });
  };

  const navigateToAuth = (returnUrl?: string) => {
    const authUrl = returnUrl ? `/auth?redirect=${encodeURIComponent(returnUrl)}` : '/auth';
    navigate(authUrl);
  };

  const navigateToMessage = (userId?: string) => {
    const messageUrl = userId ? `/messages?startConversation=${userId}` : '/messages';
    navigate(messageUrl);
  };

  const navigateToSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return {
    navigateTo,
    navigateToAuth,
    navigateToMessage,
    navigateToSearch,
    goBack: () => navigate(-1),
    goHome: () => navigate('/'),
  };
};