import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: 'en' | 'fr';
  setLanguage: (lang: 'en' | 'fr') => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Basic French translations for essential UI elements
const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.feed': 'Community Feed',
    'nav.villages': 'Villages',
    'nav.petitions': 'Petitions',
    'nav.politicians': 'Politicians',
    'nav.transparency': 'Transparency Portal',
    'nav.education': 'Civic Education',
    'nav.settings': 'Settings',
    
    // Auth
    'auth.signin': 'Sign In',
    'auth.signup': 'Join CamerPulse',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.fullName': 'Full Name',
    'auth.userType': 'User Type',
    'auth.welcome': 'Welcome to CamerPulse',
    'auth.description': 'Join Cameroon\'s premier civic engagement platform',
    
    // User Types
    'userType.citizen': 'Citizen',
    'userType.diaspora': 'Diaspora Member',
    'userType.government_official': 'Government Official',
    'userType.civil_society': 'Civil Society',
    'userType.student': 'Student',
    
    // Dashboard
    'dashboard.welcome': 'Welcome to CamerPulse',
    'dashboard.description': 'Your civic engagement dashboard',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.notifications': 'Notifications',
    
    // Actions
    'action.findVillage': 'Find My Village',
    'action.startPetition': 'Start Petition',
    'action.learnCivics': 'Learn Civics',
    'action.transparency': 'Transparency',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.submit': 'Submit',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    
    // Onboarding
    'onboarding.welcome': 'Let\'s get you started!',
    'onboarding.description': 'Discover the key features that will help you engage with your community',
    'onboarding.skip': 'Skip for now',
    'onboarding.complete': 'Complete Onboarding',
    'onboarding.nextStep': 'Next Step',
    'onboarding.markComplete': 'Mark Complete',
    
    // Civic engagement
    'civic.participation': 'Civic Participation',
    'civic.democracy': 'Democracy in Your Hands',
    'civic.engagement': 'Civic Engagement',
    'civic.transparency': 'Government Transparency',
    'civic.accountability': 'Public Accountability'
  },
  fr: {
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.feed': 'Fil communautaire',
    'nav.villages': 'Villages',
    'nav.petitions': 'Pétitions',
    'nav.politicians': 'Politiciens',
    'nav.transparency': 'Portail de transparence',
    'nav.education': 'Éducation civique',
    'nav.settings': 'Paramètres',
    
    // Auth
    'auth.signin': 'Se connecter',
    'auth.signup': 'Rejoindre CamerPulse',
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.confirmPassword': 'Confirmer le mot de passe',
    'auth.fullName': 'Nom complet',
    'auth.userType': 'Type d\'utilisateur',
    'auth.welcome': 'Bienvenue sur CamerPulse',
    'auth.description': 'Rejoignez la principale plateforme d\'engagement civique du Cameroun',
    
    // User Types
    'userType.citizen': 'Citoyen',
    'userType.diaspora': 'Membre de la diaspora',
    'userType.government_official': 'Agent gouvernemental',
    'userType.civil_society': 'Société civile',
    'userType.student': 'Étudiant',
    
    // Dashboard
    'dashboard.welcome': 'Bienvenue sur CamerPulse',
    'dashboard.description': 'Votre tableau de bord d\'engagement civique',
    'dashboard.quickActions': 'Actions rapides',
    'dashboard.recentActivity': 'Activité récente',
    'dashboard.notifications': 'Notifications',
    
    // Actions
    'action.findVillage': 'Trouver mon village',
    'action.startPetition': 'Créer une pétition',
    'action.learnCivics': 'Apprendre les civiques',
    'action.transparency': 'Transparence',
    
    // Common
    'common.loading': 'Chargement...',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.view': 'Voir',
    'common.submit': 'Soumettre',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.close': 'Fermer',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.previous': 'Précédent',
    
    // Onboarding
    'onboarding.welcome': 'Commençons!',
    'onboarding.description': 'Découvrez les fonctionnalités clés qui vous aideront à vous engager avec votre communauté',
    'onboarding.skip': 'Ignorer pour maintenant',
    'onboarding.complete': 'Terminer l\'intégration',
    'onboarding.nextStep': 'Étape suivante',
    'onboarding.markComplete': 'Marquer comme terminé',
    
    // Civic engagement
    'civic.participation': 'Participation civique',
    'civic.democracy': 'La démocratie entre vos mains',
    'civic.engagement': 'Engagement civique',
    'civic.transparency': 'Transparence gouvernementale',
    'civic.accountability': 'Responsabilité publique'
  }
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<'en' | 'fr'>('en');

  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('camerpulse_language') as 'en' | 'fr';
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
      setLanguageState(savedLanguage);
    } else {
      // Auto-detect based on browser language or location
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('fr')) {
        setLanguageState('fr');
      }
    }
  }, []);

  const setLanguage = (lang: 'en' | 'fr') => {
    setLanguageState(lang);
    localStorage.setItem('camerpulse_language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};