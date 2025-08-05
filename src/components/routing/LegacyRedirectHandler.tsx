import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getLegacyRedirect } from '@/utils/slugUtils';

/**
 * Handles legacy URL redirects to maintain SEO and user bookmarks
 */
export const LegacyRedirectHandler: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const newPath = getLegacyRedirect(location.pathname);
    
    if (newPath) {
      // Perform 301 redirect
      navigate(newPath, { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
};