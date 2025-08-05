import React from 'react';
import { Navigate, useParams, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface LanguageRouteWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that handles language routing logic
 * Redirects routes without language prefixes to /en/ by default
 */
export const LanguageRouteWrapper: React.FC<LanguageRouteWrapperProps> = ({ children }) => {
  const location = useLocation();
  const { extractLanguageFromPath } = useLanguage();
  
  const { language, cleanPath } = extractLanguageFromPath(location.pathname);
  
  // If we're on a route without language prefix, redirect to /en/
  if (!location.pathname.startsWith('/en/') && !location.pathname.startsWith('/fr/')) {
    // Don't redirect if we're already on the root path
    if (location.pathname === '/') {
      return <Navigate to="/en/" replace />;
    }
    
    // For other paths, add /en/ prefix
    return <Navigate to={`/en${location.pathname}`} replace />;
  }

  return <>{children}</>;
};