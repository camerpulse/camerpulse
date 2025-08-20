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
    id: 'marketplace', 
    label: 'Marketplace', 
    icon: Store, 
    color: 'text-green-600', 
    permission: 'marketplace',
    category: 'finance',
    description: 'Manage marketplace transactions'
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
  { 
    id: 'political-management', 
    label: 'Political Management', 
    icon: Users, 
    color: 'text-purple-600', 
    permission: 'politics',
    category: 'civic',
    description: 'Advanced political management'
  },
  { 
    id: 'elections', 
    label: 'Elections', 
    icon: Vote, 
    color: 'text-purple-600', 
    permission: 'elections',
    category: 'civic',
    description: 'Manage elections and voting'
  },
  { 
    id: 'legal-documents', 
    label: 'Legal Documents', 
    icon: Scale, 
    color: 'text-blue-600', 
    permission: 'legal',
    category: 'civic',
    description: 'Manage legal documents'
  },
  { 
    id: 'promises', 
    label: 'Promises Tracker', 
    icon: Target, 
    color: 'text-green-600', 
    permission: 'tracking',
    category: 'civic',
    description: 'Track political promises'
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
  { 
    id: 'backup-recovery', 
    label: 'Backup & Recovery', 
    icon: Database, 
    color: 'text-purple-600', 
    permission: 'all',
    category: 'system',
    description: 'Data backup and recovery'
  },
  { 
    id: 'error-monitoring', 
    label: 'Error Monitoring', 
    icon: AlertTriangle, 
    color: 'text-red-600', 
    permission: 'all',
    category: 'system',
    description: 'Monitor system errors'
  },
  { 
    id: 'performance-analytics', 
    label: 'Performance Analytics', 
    icon: BarChart3, 
    color: 'text-blue-600', 
    permission: 'all',
    category: 'system',
    description: 'System performance metrics'
  },
  { 
    id: 'cleanup-review', 
    label: 'Cleanup Review', 
    icon: ListChecks, 
    color: 'text-red-600', 
    permission: 'admin_only',
    category: 'system',
    description: 'Review and cleanup system data'
  },
  { 
    id: 'settings-sync', 
    label: 'Settings & Sync', 
    icon: Settings, 
    color: 'text-gray-500', 
    permission: 'all',
    category: 'system',
    description: 'Global settings and sync'
  },

  // Testing and security
  { 
    id: 'role-access-test', 
    label: 'Role Access Test', 
    icon: Shield, 
    color: 'text-orange-600', 
    permission: 'all',
    category: 'system',
    description: 'Test role access permissions'
  },
  { 
    id: 'security-audit', 
    label: 'Security Audit', 
    icon: Shield, 
    color: 'text-red-600', 
    permission: 'all',
    category: 'system',
    description: 'Comprehensive security audit'
  },
  { 
    id: 'priority-assessment', 
    label: 'Priority Assessment', 
    icon: TrendingUp, 
    color: 'text-amber-600', 
    permission: 'all',
    category: 'system',
    description: 'Priority assessment dashboard'
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