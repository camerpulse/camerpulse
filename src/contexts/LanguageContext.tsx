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
  const [language, setLanguageState] = useState<Language>('en');

  // Simplified language handling without path extraction
  const extractLanguageFromPath = (path: string): { language: Language; cleanPath: string } => {
    // Always return current language and the clean path
    return {
      language,
      cleanPath: path
    };
  };

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    // Store in localStorage for persistence
    localStorage.setItem('camerpulse_language', newLanguage);
  };

  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('camerpulse_language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  const getLocalizedPath = (path: string): string => {
    // Return the path as-is since we're not using language prefixes in URLs
    return path;
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