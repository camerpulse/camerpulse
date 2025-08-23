import {
  BarChart3, Users, Target, Building2, CreditCard, TrendingUp,
  UserCheck, MessageSquare, Brain, Database, ListChecks, Flag,
  Newspaper, Store, Vote, Scale, Heart, MapPin, Shield, Monitor,
  AlertTriangle, Palette, Bot, Settings
} from 'lucide-react';

export interface AdminModule {
  id: string;
  label: string;
  icon: any;
  color: string;
  permission: string;
  category: 'core' | 'content' | 'finance' | 'civic' | 'system';
  description?: string;
}

export const adminModules: AdminModule[] = [
  // Core modules
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: BarChart3, 
    color: 'text-cm-green', 
    permission: 'all',
    category: 'core',
    description: 'Main admin dashboard with key metrics'
  },
  { 
    id: 'users-roles', 
    label: 'Users & Roles', 
    icon: Users, 
    color: 'text-blue-600', 
    permission: 'users',
    category: 'core',
    description: 'Manage user accounts and permissions'
  },

  // Content management
  { 
    id: 'polls-system', 
    label: 'Polls System', 
    icon: Target, 
    color: 'text-purple-600', 
    permission: 'polls',
    category: 'content',
    description: 'Manage polls and voting'
  },
  { 
    id: 'news-system', 
    label: 'News System', 
    icon: Newspaper, 
    color: 'text-blue-600', 
    permission: 'content',
    category: 'content',
    description: 'Manage news and articles'
  },
  { 
    id: 'poll-templates', 
    label: 'Poll Templates', 
    icon: Palette, 
    color: 'text-purple-600', 
    permission: 'content',
    category: 'content',
    description: 'Manage reusable poll templates'
  },

  // Financial modules
  { 
    id: 'company-directory', 
    label: 'Company Directory', 
    icon: Building2, 
    color: 'text-orange-600', 
    permission: 'companies',
    category: 'finance',
    description: 'Manage company listings'
  },
  { 
    id: 'billionaire-tracker', 
    label: 'Billionaire Tracker', 
    icon: CreditCard, 
    color: 'text-yellow-600', 
    permission: 'companies',
    category: 'finance',
    description: 'Track wealthy individuals'
  },
  { 
    id: 'debt-monitor', 
    label: 'Debt Monitor', 
    icon: TrendingUp, 
    color: 'text-red-600', 
    permission: 'analytics',
    category: 'finance',
    description: 'Monitor national debt'
  },
  { 
    id: 'donations', 
    label: 'Donations', 
    icon: Heart, 
    color: 'text-red-500', 
    permission: 'finance',
    category: 'finance',
    description: 'Manage donation system'
  },
  { 
    id: 'nokash-payments', 
    label: 'Nokash Payments', 
    icon: CreditCard, 
    color: 'text-green-600', 
    permission: 'finance',
    category: 'finance',
    description: 'Payment gateway configuration'
  },

  // Civic modules
  { 
    id: 'civic-officials', 
    label: 'Civic & Officials', 
    icon: UserCheck, 
    color: 'text-cm-red', 
    permission: 'civic-tools',
    category: 'civic',
    description: 'Manage civic officials'
  },
  { 
    id: 'political-parties', 
    label: 'Political Parties', 
    icon: Flag, 
    color: 'text-blue-600', 
    permission: 'politics',
    category: 'civic',
    description: 'Manage political parties'
  },

  // System modules
  { 
    id: 'messenger', 
    label: 'Pulse Messenger', 
    icon: MessageSquare, 
    color: 'text-green-600', 
    permission: 'messenger',
    category: 'system',
    description: 'Manage messaging system'
  },
  { 
    id: 'sentiment-system', 
    label: 'Sentiment System', 
    icon: Brain, 
    color: 'text-indigo-600', 
    permission: 'analytics',
    category: 'system',
    description: 'Sentiment analysis tools'
  },
  { 
    id: 'analytics-logs', 
    label: 'Analytics & Logs', 
    icon: Database, 
    color: 'text-gray-600', 
    permission: 'analytics',
    category: 'system',
    description: 'System analytics and logs'
  },
  { 
    id: 'regional-analytics', 
    label: 'Regional Analytics', 
    icon: MapPin, 
    color: 'text-blue-600', 
    permission: 'analytics',
    category: 'system',
    description: 'Regional data analysis'
  },
  { 
    id: 'intelligence', 
    label: 'Intelligence Panel', 
    icon: Bot, 
    color: 'text-purple-500', 
    permission: 'all',
    category: 'system',
    description: 'AI intelligence dashboard'
  },
  { 
    id: 'system-health', 
    label: 'System Health', 
    icon: Monitor, 
    color: 'text-blue-600', 
    permission: 'all',
    category: 'system',
    description: 'Monitor system health'
  },
  { 
    id: 'security-audit-manager', 
    label: 'Security Manager', 
    icon: Shield, 
    color: 'text-red-600', 
    permission: 'all',
    category: 'system',
    description: 'Security audit and management'
  },
];

export const getModulesByCategory = (category: string, hasPermission: (permission: string) => boolean) => {
  return adminModules.filter(module => 
    module.category === category && 
    hasPermission(module.permission)
  );
};

export const getAllowedModules = (hasPermission: (permission: string) => boolean) => {
  return adminModules.filter(module => hasPermission(module.permission));
};