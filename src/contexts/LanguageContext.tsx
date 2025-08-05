import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  getLocalizedPath: (path: string) => string;
  extractLanguageFromPath: (path: string) => { language: Language; cleanPath: string };
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Basic translations - expand as needed
const translations = {
  en: {
    'nav.politicians': 'Politicians',
    'nav.senators': 'Senators',
    'nav.villages': 'Villages',
    'nav.hospitals': 'Hospitals',
    'nav.schools': 'Schools',
    'nav.events': 'Events',
    'nav.petitions': 'Petitions',
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.contact': 'Contact'
  },
  fr: {
    'nav.politicians': 'Politiciens',
    'nav.senators': 'Sénateurs', 
    'nav.villages': 'Villages',
    'nav.hospitals': 'Hôpitaux',
    'nav.schools': 'Écoles',
    'nav.events': 'Événements',
    'nav.petitions': 'Pétitions',
    'nav.home': 'Accueil',
    'nav.about': 'À Propos',
    'nav.contact': 'Contact'
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract language from current path
  const extractLanguageFromPath = (path: string): { language: Language; cleanPath: string } => {
    const segments = path.split('/').filter(Boolean);
    
    if (segments[0] === 'en' || segments[0] === 'fr') {
      return {
        language: segments[0] as Language,
        cleanPath: '/' + segments.slice(1).join('/')
      };
    }
    
    // Default to English if no language prefix
    return {
      language: 'en',
      cleanPath: path
    };
  };

  const { language: currentLanguage } = extractLanguageFromPath(location.pathname);
  const [language, setLanguageState] = useState<Language>(currentLanguage);

  // Update language when path changes
  useEffect(() => {
    const { language: pathLanguage } = extractLanguageFromPath(location.pathname);
    setLanguageState(pathLanguage);
  }, [location.pathname]);

  const setLanguage = (newLanguage: Language) => {
    const { cleanPath } = extractLanguageFromPath(location.pathname);
    const newPath = `/${newLanguage}${cleanPath === '/' ? '' : cleanPath}`;
    navigate(newPath, { replace: true });
    setLanguageState(newLanguage);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  const getLocalizedPath = (path: string): string => {
    // If path already has language prefix, return as is
    if (path.startsWith('/en/') || path.startsWith('/fr/')) {
      return path;
    }
    
    // Add current language prefix
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `/${language}${cleanPath === '/' ? '' : cleanPath}`;
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      getLocalizedPath,
      extractLanguageFromPath
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};