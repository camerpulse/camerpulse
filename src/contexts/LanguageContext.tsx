import React, { createContext, useContext, useEffect } from 'react';

export type Language = 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void; // no-op, kept for compatibility
  t: (key: string) => string; // identity translator
  getLocalizedPath: (path: string) => string;
  extractLanguageFromPath: (path: string) => { language: Language; cleanPath: string };
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Ensure document language is English globally
  useEffect(() => {
    document.documentElement.lang = 'en';
  }, []);

  const t = (key: string) => key;
  const getLocalizedPath = (path: string) => path;
  const extractLanguageFromPath = (path: string) => ({ language: 'en', cleanPath: path });
  const setLanguage = () => { /* English-only mode: no-op */ };

  return (
    <LanguageContext.Provider value={{
      language: 'en',
      setLanguage,
      t,
      getLocalizedPath,
      extractLanguageFromPath,
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