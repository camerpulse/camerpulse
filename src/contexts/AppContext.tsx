/**
 * CamerPulse State Management
 * Centralized state management using React Context and useReducer
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Profile, UserRole, Notification, ThemeMode } from '@/types';
import { getStorageItem, setStorageItem } from '@/utils';
import { STORAGE_KEYS } from '@/constants';

// === STATE TYPES ===
interface AppState {
  // Authentication
  user: User | null;
  profile: Profile | null;
  userRole: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;

  // UI State
  theme: ThemeMode;
  sidebarOpen: boolean;
  notifications: Notification[];
  unreadCount: number;

  // App Data
  recentSearches: string[];
  userPreferences: Record<string, any>;
  
  // Error State
  error: string | null;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User | null; profile: Profile | null } }
  | { type: 'SET_USER_ROLE'; payload: UserRole }
  | { type: 'SET_THEME'; payload: ThemeMode }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'ADD_RECENT_SEARCH'; payload: string }
  | { type: 'SET_PREFERENCES'; payload: Record<string, any> }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

// === INITIAL STATE ===
const initialState: AppState = {
  user: null,
  profile: null,
  userRole: 'user',
  isAuthenticated: false,
  isLoading: true,
  theme: getStorageItem(STORAGE_KEYS.THEME, 'system') as ThemeMode,
  sidebarOpen: false,
  notifications: [],
  unreadCount: 0,
  recentSearches: getStorageItem(STORAGE_KEYS.RECENT_SEARCHES, []),
  userPreferences: getStorageItem(STORAGE_KEYS.USER_PREFERENCES, {}),
  error: null,
};

// === REDUCER ===
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        profile: action.payload.profile,
        isAuthenticated: !!action.payload.user,
        isLoading: false,
      };

    case 'SET_USER_ROLE':
      return {
        ...state,
        userRole: action.payload,
      };

    case 'SET_THEME':
      setStorageItem(STORAGE_KEYS.THEME, action.payload);
      return {
        ...state,
        theme: action.payload,
      };

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      };

    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.read).length,
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };

    case 'ADD_RECENT_SEARCH':
      const newSearches = [
        action.payload,
        ...state.recentSearches.filter(s => s !== action.payload)
      ].slice(0, 10); // Keep only last 10 searches
      
      setStorageItem(STORAGE_KEYS.RECENT_SEARCHES, newSearches);
      return {
        ...state,
        recentSearches: newSearches,
      };

    case 'SET_PREFERENCES':
      setStorageItem(STORAGE_KEYS.USER_PREFERENCES, action.payload);
      return {
        ...state,
        userPreferences: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// === CONTEXT ===
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // Convenience methods
  setUser: (user: User | null, profile: Profile | null) => void;
  setTheme: (theme: ThemeMode) => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  addRecentSearch: (query: string) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// === PROVIDER ===
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          // Fetch user role
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

          dispatch({
            type: 'SET_USER',
            payload: { user: session.user, profile: profile || null }
          });

          if (roleData?.role) {
            dispatch({ type: 'SET_USER_ROLE', payload: roleData.role });
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize authentication' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          dispatch({
            type: 'SET_USER',
            payload: { user: session.user, profile: profile || null }
          });
        } else {
          dispatch({
            type: 'SET_USER',
            payload: { user: null, profile: null }
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    
    if (state.theme === 'dark') {
      root.classList.add('dark');
    } else if (state.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [state.theme]);

  // Convenience methods
  const setUser = (user: User | null, profile: Profile | null) => {
    dispatch({ type: 'SET_USER', payload: { user, profile } });
  };

  const setTheme = (theme: ThemeMode) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const addNotification = (notification: Notification) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  const markNotificationAsRead = (id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  };

  const addRecentSearch = (query: string) => {
    if (query.trim()) {
      dispatch({ type: 'ADD_RECENT_SEARCH', payload: query.trim() });
    }
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    setUser,
    setTheme,
    addNotification,
    markNotificationAsRead,
    addRecentSearch,
    setError,
    clearError,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// === HOOK ===
export const useAppState = () => {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  
  return context;
};

// === SELECTORS ===
export const useAuth = () => {
  const { state } = useAppState();
  return {
    user: state.user,
    profile: state.profile,
    userRole: state.userRole,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
  };
};

export const useTheme = () => {
  const { state, setTheme } = useAppState();
  return {
    theme: state.theme,
    setTheme,
  };
};

export const useNotifications = () => {
  const { state, addNotification, markNotificationAsRead } = useAppState();
  return {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    addNotification,
    markNotificationAsRead,
  };
};

export default AppProvider;