import React from 'react';
import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';

interface LanguageRouteWrapperProps {
  children: React.ReactNode;
  defaultLanguage?: string;
  supportedLanguages?: string[];
}

/**
 * Language-aware routing wrapper
 * Handles /{lang}/path routing patterns
 */
export const LanguageRouteWrapper: React.FC<LanguageRouteWrapperProps> = ({
  children,
  defaultLanguage = 'en',
  supportedLanguages = ['en', 'fr'],
}) => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  // Check if the first segment is a supported language
  const isLanguageRoute = supportedLanguages.includes(firstSegment);

  // If no language is specified, redirect to default language
  if (!isLanguageRoute && location.pathname !== '/') {
    const newPath = `/${defaultLanguage}${location.pathname}`;
    return <Navigate to={newPath} replace />;
  }

  // If language is specified but not supported, redirect to default
  if (isLanguageRoute && !supportedLanguages.includes(firstSegment)) {
    const pathWithoutLang = `/${segments.slice(1).join('/')}`;
    const newPath = `/${defaultLanguage}${pathWithoutLang}`;
    return <Navigate to={newPath} replace />;
  }

  return (
    <Routes>
      {/* Root route redirects to default language */}
      <Route path="/" element={<Navigate to={`/${defaultLanguage}`} replace />} />
      
      {/* Language-specific routes */}
      {supportedLanguages.map(lang => (
        <Route 
          key={lang} 
          path={`/${lang}/*`} 
          element={
            <LanguageProvider language={lang}>
              {children}
            </LanguageProvider>
          } 
        />
      ))}
      
      {/* Fallback for any unmatched routes */}
      <Route path="*" element={children} />
    </Routes>
  );
};

interface LanguageProviderProps {
  language: string;
  children: React.ReactNode;
}

const LanguageProvider: React.FC<LanguageProviderProps> = ({ language, children }) => {
  // Set document language attribute
  React.useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Provide language context to children
  return (
    <div data-language={language}>
      {children}
    </div>
  );
};

/**
 * Hook to get current language from URL
 */
export const useCurrentLanguage = (): string => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);
  const supportedLanguages = ['en', 'fr'];
  
  if (supportedLanguages.includes(segments[0])) {
    return segments[0];
  }
  
  return 'en'; // Default language
};