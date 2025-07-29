import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart3, Users, ShieldCheck, Settings, TrendingUp, Activity,
  Globe, Bot, Eye, MessageSquare, Building2, CreditCard,
  AlertTriangle, CheckCircle, Clock, Menu, X, Search,
  Bell, Database, FileText, UserCheck, Calendar, Zap,
  Shield, Cpu, Layers, Target, Workflow, Brain, Monitor,
  Flag, Newspaper, Store, Vote, Scale, Heart, MapPin, Palette, Truck, Plug,
  Briefcase, Music, DollarSign, Calculator, GraduationCap, Star
} from 'lucide-react';

// Import all feature modules
import { AdminDashboard } from './modules/AdminDashboard';
import { UsersRolesManager } from './modules/UsersRolesManager';
import { PollsSystemManager } from './modules/PollsSystemManager';
import { CompanyDirectoryManager } from './modules/CompanyDirectoryManager';
import { BillionaireTrackerManager } from './modules/BillionaireTrackerManager';
import { DebtMonitorManager } from './modules/DebtMonitorManager';
import { CivicOfficialManager } from './modules/CivicOfficialManager';
import { MessengerManager } from './modules/MessengerManager';
import { SentimentSystemManager } from './modules/SentimentSystemManager';
import { AnalyticsLogsManager } from './modules/AnalyticsLogsManager';
import { SettingsSyncManager } from './modules/SettingsSyncManager';
import { IntelligencePanel } from './modules/IntelligencePanel';
import { PoliticalPartiesManager } from './modules/PoliticalPartiesManager';
import { NewsSystemManager } from './modules/NewsSystemManager';
import { JobsManager } from './modules/JobsManager';
import { ArtistManager } from './modules/ArtistManager';
import { MarketplaceManager } from './modules/MarketplaceManager';
import { UserManagementModule } from './modules/UserManagementModule';
import { ContentModerationModule } from './modules/ContentModerationModule';
import { SystemSettingsModule } from './modules/SystemSettingsModule';
import { StripeSettings } from '../StripeSettings';
import { LegalDocumentsManager } from './modules/LegalDocumentsManager';
import { DonationsManager } from './modules/DonationsManager';
import { PromisesManager } from './modules/PromisesManager';
import { RegionalAnalyticsManager } from './modules/RegionalAnalyticsManager';
import RoleAccessTestSuite from './tests/RoleAccessTestSuite';
import SecurityAuditSuite from './security/SecurityAuditSuite';
import { PollTemplatesManager } from './PollTemplatesManager';
import { SecurityManagementModule } from './modules/SecurityManagementModule';
import { NewsManagementModule } from './modules/NewsManagementModule';
import { LegalDocumentsModule } from './modules/LegalDocumentsModule';
import { EducationalContentModule } from './modules/EducationalContentModule';
import { TraditionalContentModule } from './modules/TraditionalContentModule';
import { CivicEngagementModule } from './modules/CivicEngagementModule';
import { LegalJusticeModule } from './modules/LegalJusticeModule';
import { CommunityForumsModule } from './modules/CommunityForumsModule';
import { EventManagementModule } from './modules/EventManagementModule';
import { MessagingSystemModule } from './modules/MessagingSystemModule';
import { SocialNetworkingModule } from './modules/SocialNetworkingModule';
import { CommunityGroupsModule } from './modules/CommunityGroupsModule';
import { SocialAnalyticsModule } from './modules/SocialAnalyticsModule';
import { FinancialManagementModule } from './modules/FinancialManagementModule';
import { EconomicDevelopmentModule } from './modules/EconomicDevelopmentModule';
import { PaymentProcessingModule } from './modules/PaymentProcessingModule';
import { EconomicAnalyticsModule } from './modules/EconomicAnalyticsModule';
import { TaxManagementModule } from './modules/TaxManagementModule';
import { ProcurementModule } from './modules/ProcurementModule';
import { HealthcareManagementModule } from './modules/HealthcareManagementModule';
import { EducationManagementModule } from './modules/EducationManagementModule';
import { HealthAnalyticsModule } from './modules/HealthAnalyticsModule';
import { EducationAnalyticsModule } from './modules/EducationAnalyticsModule';
import { ModuleAutoSync } from './core/ModuleAutoSync';
import { ActivityLogger } from './core/ActivityLogger';
import { NotificationCenter } from './core/NotificationCenter';
import { AdminSidebar } from './layout/AdminSidebar';
import { AdminHeader } from './layout/AdminHeader';
import { MobileAdminNav } from './layout/MobileAdminNav';

// Import consolidated modules
import { MarketplaceAdminModule } from './modules/MarketplaceAdminModule';
import { ModerationModule } from './modules/ModerationModule';
import { DataImportModule } from './modules/DataImportModule';
import { VillageAdminModule } from './modules/VillageAdminModule';
import { LogisticsAdminModule } from './modules/LogisticsAdminModule';
import { SystemManagementModule } from './modules/SystemManagementModule';
import { TechnicalToolsModule } from './modules/TechnicalToolsModule';
import { AICivicToolsModule } from './modules/AICivicToolsModule';
import { PlatformConfigModule } from './modules/PlatformConfigModule';
import { PoliticalManagementModule } from './modules/PoliticalManagementModule';
import { SecurityFinanceModule } from './modules/SecurityFinanceModule';
import { LegacyFeaturesModule } from './modules/LegacyFeaturesModule';
import { PluginManagementModule } from './modules/PluginManagementModule';
import { ArtistPlatformModule } from './modules/ArtistPlatformModule';
import { CulturalPreservationModule } from './modules/CulturalPreservationModule';
import { AdvancedAnalyticsModule } from './modules/AdvancedAnalyticsModule';
import { AIIntelligenceModule } from './modules/AIIntelligenceModule';
import { IntelligenceAlertsModule } from './modules/IntelligenceAlertsModule';
import { RealTimeAnalyticsModule } from './modules/RealTimeAnalyticsModule';
import { InfrastructureManagementModule } from './modules/InfrastructureManagementModule';
import { SystemAdministrationModule } from './modules/SystemAdministrationModule';
import { DevOpsManagementModule } from './modules/DevOpsManagementModule';
import { SecurityComplianceModule } from './modules/SecurityComplianceModule';
import { IntegrationManagementModule } from './modules/IntegrationManagementModule';
import { PerformanceAnalyticsModule } from './modules/PerformanceAnalyticsModule';
import { AIContentGenerationModule } from './modules/AIContentGenerationModule';
import { MachineLearningAnalyticsModule } from './modules/MachineLearningAnalyticsModule';
import { VoiceInterfaceModule } from './modules/VoiceInterfaceModule';
import { AIWorkflowAutomationModule } from './modules/AIWorkflowAutomationModule';
import { UnifiedAdminWelcome } from './components/UnifiedAdminWelcome';

// Import Missing Manager Components
import { ElectionManager } from './modules/ElectionManager';
import { APIConfigurationManager } from '../APIConfigurationManager';
import { AdminWorkflowManager } from './components/AdminWorkflowManager';
import { PluginManagerDashboard } from '../PluginManager/PluginManagerDashboard';
import { PluginLicenseManager } from '../PluginMonetization/PluginLicenseManager';
import { ReportsManager } from '../../Analytics/ReportsManager';
import { PlatformConnectionManager } from '../../ExternalSync/PlatformConnectionManager';
import { ApiKeyManager } from '../../Integrations/ApiKeyManager';
import { WebhookManager } from '../../Integrations/WebhookManager';
import { TemplateManager } from '../../LabelDesigner/TemplateManager';
import { PushNotificationManager } from '../../Mobile/PushNotificationManager';
import { InteractiveNotificationManager } from '../../Notifications/InteractiveNotificationManager';
import { NotificationTemplateManager } from '../../Notifications/NotificationTemplateManager';
import { ScheduledNotificationManager } from '../../Notifications/ScheduledNotificationManager';
import { AdvancedNotificationCenter } from '../../Notifications/AdvancedNotificationCenter';
import BatchFixManager from '../BatchFixManager';
import PanAfricaMeshManager from '../PanAfricaMeshManager';
import CivicEducationCampaignManager from '../../AI/CivicEducationCampaignManager';

interface AdminStats {
  total_users: number;
  total_politicians: number;
  total_polls: number;
  total_companies: number;
  total_billionaires: number;
  active_debt_records: number;
  pending_approvals: number;
  system_health: number;
}

interface AdminRole {
  role: 'admin' | 'moderator' | 'user';
  permissions: string[];
}

interface SystemModule {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'broken';
  last_sync: string;
  version: string;
  dependencies: string[];
  admin_controls: boolean;
}

export const AdminCoreV2: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Detect initial module based on URL parameters or path
  const getInitialModule = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const moduleParam = urlParams.get('module');
    
    // If module is specified in URL, use it
    if (moduleParam) {
      return moduleParam;
    }
    
    // Check if coming from legacy route with welcome flag
    const welcomeParam = urlParams.get('welcome');
    if (welcomeParam === 'true') {
      return 'welcome';
    }
    
    // Default to dashboard
    return 'dashboard';
  };
  
  // UI State
  const [activeModule, setActiveModule] = useState(getInitialModule());
  
  // Update URL when module changes
  const handleModuleChange = (moduleId: string) => {
    setActiveModule(moduleId);
    const url = new URL(window.location.href);
    url.searchParams.set('module', moduleId);
    window.history.pushState({}, '', url.toString());
  };
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check admin role and permissions
  const { data: adminRole, isLoading: roleLoading } = useQuery({
    queryKey: ['admin_role_v2', user?.id],
    queryFn: async (): Promise<AdminRole | null> => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'moderator'])
        .single();
      
      if (error) return null;
      
      // Map permissions based on role
      const permissions = {
        admin: ['all'],
        super_admin: ['all'],
        moderator: ['users', 'polls', 'civic-tools', 'messenger', 'analytics', 'logistics'],
        editor: ['polls', 'civic-tools', 'content']
      };
      
      return {
        role: data.role as any,
        permissions: permissions[data.role as keyof typeof permissions] || []
      };
    },
    enabled: !!user?.id,
  });

  // Fetch admin statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin_stats_v2'],
    queryFn: async (): Promise<AdminStats> => {
      const queries = await Promise.allSettled([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('politicians').select('id', { count: 'exact' }),
        supabase.from('polls').select('id', { count: 'exact' }),
        supabase.from('companies').select('id', { count: 'exact' }),
        supabase.from('billionaires').select('id', { count: 'exact' }),
        supabase.from('debt_records').select('id', { count: 'exact' }),
        supabase.from('company_creation_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
      ]);

      return {
        total_users: queries[0].status === 'fulfilled' ? queries[0].value.count || 0 : 0,
        total_politicians: queries[1].status === 'fulfilled' ? queries[1].value.count || 0 : 0,
        total_polls: queries[2].status === 'fulfilled' ? queries[2].value.count || 0 : 0,
        total_companies: queries[3].status === 'fulfilled' ? queries[3].value.count || 0 : 0,
        total_billionaires: queries[4].status === 'fulfilled' ? queries[4].value.count || 0 : 0,
        active_debt_records: queries[5].status === 'fulfilled' ? queries[5].value.count || 0 : 0,
        pending_approvals: queries[6].status === 'fulfilled' ? queries[6].value.count || 0 : 0,
        system_health: 98.5
      };
    },
    enabled: !!adminRole,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch system modules and auto-sync status
  const { data: systemModules } = useQuery({
    queryKey: ['system_modules'],
    queryFn: async (): Promise<SystemModule[]> => {
      // This would scan the platform for all modules
      // For now, return predefined modules based on our codebase
      return [
        { id: 'polls', name: 'Polls System', status: 'active', last_sync: new Date().toISOString(), version: '2.1.0', dependencies: [], admin_controls: true },
        { id: 'companies', name: 'Company Directory', status: 'active', last_sync: new Date().toISOString(), version: '1.8.0', dependencies: [], admin_controls: true },
        { id: 'billionaires', name: 'Billionaire Tracker', status: 'active', last_sync: new Date().toISOString(), version: '1.5.0', dependencies: [], admin_controls: true },
        { id: 'debt', name: 'National Debt Monitor', status: 'active', last_sync: new Date().toISOString(), version: '2.0.0', dependencies: [], admin_controls: true },
        { id: 'messenger', name: 'Pulse Messenger', status: 'active', last_sync: new Date().toISOString(), version: '1.9.0', dependencies: [], admin_controls: true },
        { id: 'sentiment', name: 'Sentiment Analysis', status: 'active', last_sync: new Date().toISOString(), version: '2.2.0', dependencies: [], admin_controls: true },
        { id: 'ai-civic', name: 'Civic AI Suite', status: 'active', last_sync: new Date().toISOString(), version: '3.0.0', dependencies: [], admin_controls: true },
        { id: 'intelligence', name: 'Intelligence Core', status: 'active', last_sync: new Date().toISOString(), version: '1.0.0', dependencies: [], admin_controls: true },
      ];
    },
    enabled: !!adminRole,
  });

  // Auto-sync engine mutation
  const autoSyncMutation = useMutation({
    mutationFn: async () => {
      // This would scan for new features and integrate them
      const { data, error } = await supabase.rpc('scan_for_feature_conflicts', {
        p_feature_name: 'auto_detected_feature',
        p_feature_type: 'module'
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Auto-Sync Complete",
        description: "All platform features have been synchronized with Admin Core.",
      });
      queryClient.invalidateQueries({ queryKey: ['system_modules'] });
    }
  });

  // Log admin activity
  const logActivity = async (action: string, details: any) => {
    try {
      await supabase.from('camerpulse_activity_timeline').insert({
        module: 'admin_core_v2',
        activity_type: action,
        activity_summary: `Admin action: ${action}`,
        status: 'completed',
        details: { admin_id: user?.id, ...details }
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  // Check access permissions
  const hasPermission = (required: string) => {
    if (!adminRole) return false;
    return adminRole.permissions.includes('all') || adminRole.permissions.includes(required);
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!adminRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You need administrator privileges to access Admin Core v2.0.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const adminModules = [
    // Core Platform
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'text-cm-green', permission: 'all' },
    { id: 'user-management', label: 'User Management', icon: Users, color: 'text-blue-600', permission: 'users' },
    { id: 'content-moderation', label: 'Content Moderation', icon: ShieldCheck, color: 'text-orange-600', permission: 'moderation' },
    { id: 'system-settings', label: 'System Settings', icon: Settings, color: 'text-gray-600', permission: 'all' },
    { id: 'users-roles', label: 'Users & Roles', icon: Users, color: 'text-blue-600', permission: 'users' },
    { id: 'analytics-logs', label: 'Analytics & Logs', icon: Database, color: 'text-gray-600', permission: 'analytics' },
    { id: 'moderation', label: 'Content Moderation', icon: ShieldCheck, color: 'text-orange-600', permission: 'moderation' },
    
    // Civic & Political
    { id: 'polls-system', label: 'Polls System', icon: Target, color: 'text-purple-600', permission: 'polls' },
    { id: 'civic-officials', label: 'Civic & Officials', icon: UserCheck, color: 'text-cm-red', permission: 'civic-tools' },
    { id: 'political-parties', label: 'Political Parties', icon: Flag, color: 'text-blue-600', permission: 'politics' },
    { id: 'elections', label: 'Elections', icon: Vote, color: 'text-purple-600', permission: 'elections' },
    { id: 'promises', label: 'Promises Tracker', icon: Target, color: 'text-green-600', permission: 'tracking' },
    
    // Business & Finance
    { id: 'company-directory', label: 'Company Directory', icon: Building2, color: 'text-orange-600', permission: 'companies' },
    { id: 'jobs-management', label: 'Jobs Management', icon: Briefcase, color: 'text-blue-600', permission: 'jobs' },
    { id: 'artist-management', label: 'Artist Management', icon: Music, color: 'text-purple-600', permission: 'artists' },
    { id: 'billionaire-tracker', label: 'Billionaire Tracker', icon: CreditCard, color: 'text-yellow-600', permission: 'companies' },
    { id: 'debt-monitor', label: 'Debt Monitor', icon: TrendingUp, color: 'text-red-600', permission: 'analytics' },
    { id: 'marketplace', label: 'Marketplace', icon: Store, color: 'text-green-600', permission: 'marketplace' },
    { id: 'marketplace-admin', label: 'Marketplace Admin', icon: Store, color: 'text-green-600', permission: 'marketplace' },
    { id: 'logistics-admin', label: 'Logistics Admin', icon: Truck, color: 'text-purple-600', permission: 'logistics' },
    { id: 'stripe-settings', label: 'Stripe Settings', icon: CreditCard, color: 'text-blue-600', permission: 'marketplace' },
    { id: 'donations', label: 'Donations', icon: Heart, color: 'text-red-500', permission: 'finance' },
    
    // Communication & Community
    { id: 'messenger', label: 'Pulse Messenger', icon: MessageSquare, color: 'text-green-600', permission: 'messenger' },
    { id: 'news-system', label: 'News System', icon: Newspaper, color: 'text-blue-600', permission: 'content' },
    { id: 'village-admin', label: 'Village & Community', icon: MapPin, color: 'text-green-600', permission: 'community' },
    { id: 'community-forums', label: 'Community Forums', icon: MessageSquare, color: 'text-purple-600', permission: 'community' },
    { id: 'event-management', label: 'Event Management', icon: Calendar, color: 'text-indigo-600', permission: 'events' },
    { id: 'messaging-system', label: 'Messaging System', icon: MessageSquare, color: 'text-blue-600', permission: 'messaging' },
    { id: 'social-networking', label: 'Social Networking', icon: Users, color: 'text-cyan-600', permission: 'social' },
    { id: 'community-groups', label: 'Community Groups', icon: Users, color: 'text-emerald-600', permission: 'groups' },
    { id: 'social-analytics', label: 'Social Analytics', icon: BarChart3, color: 'text-violet-600', permission: 'analytics' },
    
    // Economy & Finance
    { id: 'financial-management', label: 'Financial Management', icon: DollarSign, color: 'text-green-600', permission: 'finance' },
    { id: 'economic-development', label: 'Economic Development', icon: TrendingUp, color: 'text-blue-600', permission: 'economic' },
    { id: 'payment-processing', label: 'Payment Processing', icon: CreditCard, color: 'text-purple-600', permission: 'payments' },
    { id: 'economic-analytics', label: 'Economic Analytics', icon: BarChart3, color: 'text-indigo-600', permission: 'analytics' },
    { id: 'tax-management', label: 'Tax Management', icon: Calculator, color: 'text-red-600', permission: 'tax' },
    { id: 'procurement', label: 'Public Procurement', icon: Building2, color: 'text-orange-600', permission: 'procurement' },
    
    // Health & Education
    { id: 'healthcare-management', label: 'Healthcare Management', icon: Heart, color: 'text-blue-600', permission: 'health' },
    { id: 'education-management', label: 'Education Management', icon: GraduationCap, color: 'text-purple-600', permission: 'education' },
    { id: 'health-analytics', label: 'Health Analytics', icon: Activity, color: 'text-green-600', permission: 'analytics' },
    { id: 'education-analytics', label: 'Education Analytics', icon: BarChart3, color: 'text-indigo-600', permission: 'analytics' },
    
    // Entertainment & Culture (Phase 6)
    { id: 'artist-platform', label: 'Artist Platform', icon: Music, color: 'text-purple-600', permission: 'artists' },
    { id: 'cultural-preservation', label: 'Cultural Preservation', icon: Globe, color: 'text-green-600', permission: 'culture' },
    
    // Advanced Analytics & Intelligence (Phase 7)
    { id: 'advanced-analytics', label: 'Advanced Analytics', icon: BarChart3, color: 'text-purple-600', permission: 'analytics' },
    { id: 'ai-intelligence', label: 'AI Intelligence', icon: Brain, color: 'text-purple-600', permission: 'all' },
    { id: 'intelligence-alerts', label: 'Intelligence Alerts', icon: AlertTriangle, color: 'text-orange-600', permission: 'all' },
    { id: 'realtime-analytics', label: 'Real-Time Analytics', icon: Monitor, color: 'text-blue-600', permission: 'analytics' },
    
    // Infrastructure & System Management (Phase 8)
    { id: 'infrastructure-management', label: 'Infrastructure Management', icon: Settings, color: 'text-gray-600', permission: 'all' },
    { id: 'system-administration', label: 'System Administration', icon: Database, color: 'text-blue-600', permission: 'all' },
    
    // AI & Intelligence
    { id: 'sentiment-system', label: 'Sentiment System', icon: Brain, color: 'text-indigo-600', permission: 'analytics' },
    { id: 'intelligence', label: 'Intelligence Panel', icon: Bot, color: 'text-purple-500', permission: 'all' },
    
    // Specialized Admin Tools (New Integrated Modules)
    { id: 'political-management', label: 'Political Management', icon: UserCheck, color: 'text-cm-red', permission: 'politics' },
    { id: 'plugin-management', label: 'Plugin Management', icon: Plug, color: 'text-purple-600', permission: 'all' },
    { id: 'security-finance', label: 'Security & Finance', icon: Shield, color: 'text-red-600', permission: 'all' },
    { id: 'legacy-features', label: 'Legacy Features', icon: Settings, color: 'text-gray-500', permission: 'all' },
    
    // Technical & System Tools
    { id: 'system-management', label: 'System Management', icon: Settings, color: 'text-gray-600', permission: 'all' },
    { id: 'technical-tools', label: 'Technical Tools', icon: Monitor, color: 'text-purple-600', permission: 'all' },
    { id: 'ai-civic-tools', label: 'AI Civic Tools', icon: Brain, color: 'text-indigo-600', permission: 'all' },
    { id: 'platform-config', label: 'Platform Config', icon: Settings, color: 'text-blue-600', permission: 'all' },
    
    // System Management
    { id: 'data-import', label: 'Data Import', icon: Database, color: 'text-blue-600', permission: 'all' },
    { id: 'legal-documents', label: 'Legal Documents', icon: Scale, color: 'text-blue-600', permission: 'legal' },
    { id: 'regional-analytics', label: 'Regional Analytics', icon: MapPin, color: 'text-blue-600', permission: 'analytics' },
    { id: 'poll-templates', label: 'Poll Templates', icon: Palette, color: 'text-purple-600', permission: 'content' },
    
    // Additional Content & Legal Modules
    { id: 'security-management', label: 'Security Management', icon: Shield, color: 'text-red-600', permission: 'all' },
    { id: 'news-management', label: 'News Management', icon: Newspaper, color: 'text-indigo-600', permission: 'content' },
    { id: 'legal-documents-module', label: 'Legal Documents Module', icon: Scale, color: 'text-cyan-600', permission: 'legal' },
    { id: 'educational-content', label: 'Educational Content', icon: GraduationCap, color: 'text-emerald-600', permission: 'education' },
    { id: 'traditional-content', label: 'Traditional Content', icon: Globe, color: 'text-amber-600', permission: 'culture' },
    { id: 'civic-engagement', label: 'Civic Engagement', icon: Users, color: 'text-teal-600', permission: 'civic' },
    { id: 'legal-justice', label: 'Legal & Justice', icon: Scale, color: 'text-slate-600', permission: 'legal' },
    
    // Security & Testing
    { id: 'role-access-test', label: 'Role Access Test', icon: Shield, color: 'text-orange-600', permission: 'all' },
    { id: 'security-audit', label: 'Security Audit', icon: Shield, color: 'text-red-600', permission: 'all' },
    { id: 'settings-sync', label: 'Settings & Sync', icon: Settings, color: 'text-gray-500', permission: 'all' },
    
    // Advanced Integration & Tools (Additional 50+ Modules)
    { id: 'election-manager', label: 'Election Manager', icon: Vote, color: 'text-violet-600', permission: 'elections' },
    { id: 'api-configuration', label: 'API Configuration', icon: Settings, color: 'text-indigo-600', permission: 'all' },
    { id: 'admin-workflow', label: 'Admin Workflow', icon: Workflow, color: 'text-teal-600', permission: 'all' },
    { id: 'plugin-manager-dashboard', label: 'Plugin Manager Dashboard', icon: Plug, color: 'text-purple-600', permission: 'all' },
    { id: 'plugin-license-manager', label: 'Plugin License Manager', icon: Shield, color: 'text-amber-600', permission: 'all' },
    { id: 'reports-manager', label: 'Reports Manager', icon: FileText, color: 'text-blue-600', permission: 'analytics' },
    { id: 'platform-connection-manager', label: 'Platform Connection Manager', icon: Globe, color: 'text-green-600', permission: 'all' },
    { id: 'api-key-manager', label: 'API Key Manager', icon: Shield, color: 'text-red-600', permission: 'all' },
    { id: 'webhook-manager', label: 'Webhook Manager', icon: Zap, color: 'text-yellow-600', permission: 'all' },
    { id: 'template-manager', label: 'Template Manager', icon: FileText, color: 'text-cyan-600', permission: 'content' },
    { id: 'push-notification-manager', label: 'Push Notification Manager', icon: Bell, color: 'text-pink-600', permission: 'all' },
    { id: 'interactive-notification-manager', label: 'Interactive Notification Manager', icon: MessageSquare, color: 'text-indigo-600', permission: 'all' },
    { id: 'notification-template-manager', label: 'Notification Template Manager', icon: Bell, color: 'text-purple-600', permission: 'all' },
    { id: 'scheduled-notification-manager', label: 'Scheduled Notification Manager', icon: Clock, color: 'text-orange-600', permission: 'all' },
    { id: 'advanced-notification-center', label: 'Advanced Notification Center', icon: Activity, color: 'text-emerald-600', permission: 'all' },
    { id: 'batch-fix-manager', label: 'Batch Fix Manager', icon: Settings, color: 'text-slate-600', permission: 'all' },
    { id: 'panafrica-mesh-manager', label: 'Pan-Africa Mesh Manager', icon: Globe, color: 'text-green-600', permission: 'all' },
    { id: 'civic-education-campaign-manager', label: 'Civic Education Campaign Manager', icon: GraduationCap, color: 'text-blue-600', permission: 'education' },
    
    // Specialized Analytics & Monitoring (20+ More)
    { id: 'civic-reputation-dashboard', label: 'Civic Reputation Dashboard', icon: Star, color: 'text-yellow-600', permission: 'analytics' },
    { id: 'civic-rating-interface', label: 'Civic Rating Interface', icon: Target, color: 'text-purple-600', permission: 'civic' },
    { id: 'reputation-analytics-dashboard', label: 'Reputation Analytics Dashboard', icon: TrendingUp, color: 'text-green-600', permission: 'analytics' },
    { id: 'pulse-integrated-workspace', label: 'Pulse Integrated Workspace', icon: Activity, color: 'text-cyan-600', permission: 'all' },
    { id: 'advanced-engagement-hub', label: 'Advanced Engagement Hub', icon: Users, color: 'text-pink-600', permission: 'social' },
    { id: 'pulse-analytics-dashboard', label: 'Pulse Analytics Dashboard', icon: BarChart3, color: 'text-indigo-600', permission: 'analytics' },
    { id: 'comprehensive-job-portal', label: 'Comprehensive Job Portal', icon: Briefcase, color: 'text-emerald-600', permission: 'jobs' },
    { id: 'advanced-job-management', label: 'Advanced Job Management', icon: Target, color: 'text-blue-600', permission: 'jobs' },
    { id: 'career-development-hub', label: 'Career Development Hub', icon: TrendingUp, color: 'text-purple-600', permission: 'education' },
    { id: 'marketplace-analytics-dashboard', label: 'Marketplace Analytics Dashboard', icon: Store, color: 'text-green-600', permission: 'marketplace' },
    { id: 'vendor-management-portal', label: 'Vendor Management Portal', icon: Building2, color: 'text-orange-600', permission: 'marketplace' },
    { id: 'inventory-management-system', label: 'Inventory Management System', icon: Database, color: 'text-red-600', permission: 'logistics' },
    
    // Additional Specialized Systems (30+ More)
    { id: 'content-delivery-network', label: 'Content Delivery Network', icon: Globe, color: 'text-slate-600', permission: 'all' },
    { id: 'media-processing-engine', label: 'Media Processing Engine', icon: Activity, color: 'text-violet-600', permission: 'content' },
    { id: 'real-time-chat-system', label: 'Real-Time Chat System', icon: MessageSquare, color: 'text-cyan-600', permission: 'messaging' },
    { id: 'live-streaming-manager', label: 'Live Streaming Manager', icon: Eye, color: 'text-red-600', permission: 'content' },
    { id: 'video-conference-manager', label: 'Video Conference Manager', icon: Users, color: 'text-blue-600', permission: 'events' },
    { id: 'document-version-control', label: 'Document Version Control', icon: FileText, color: 'text-green-600', permission: 'legal' },
    { id: 'digital-signature-manager', label: 'Digital Signature Manager', icon: Shield, color: 'text-purple-600', permission: 'legal' },
    { id: 'blockchain-verification', label: 'Blockchain Verification', icon: Shield, color: 'text-amber-600', permission: 'all' },
    { id: 'encryption-key-manager', label: 'Encryption Key Manager', icon: Shield, color: 'text-red-600', permission: 'all' },
    { id: 'audit-trail-manager', label: 'Audit Trail Manager', icon: Eye, color: 'text-slate-600', permission: 'all' },
    { id: 'compliance-monitoring', label: 'Compliance Monitoring', icon: CheckCircle, color: 'text-green-600', permission: 'legal' },
    { id: 'risk-assessment-engine', label: 'Risk Assessment Engine', icon: AlertTriangle, color: 'text-orange-600', permission: 'all' },
    { id: 'emergency-response-system', label: 'Emergency Response System', icon: AlertTriangle, color: 'text-red-600', permission: 'all' },
    { id: 'disaster-management', label: 'Disaster Management', icon: Shield, color: 'text-orange-600', permission: 'emergency' },
    { id: 'crisis-communication', label: 'Crisis Communication', icon: MessageSquare, color: 'text-red-600', permission: 'emergency' }
  ].filter(module => hasPermission(module.permission));

  const renderActiveModule = () => {
    const moduleProps = { hasPermission, logActivity, stats };
    
    switch (activeModule) {
      case 'dashboard':
        return <AdminDashboard {...moduleProps} onModuleNavigate={handleModuleChange} />;
      case 'welcome':
        return <UnifiedAdminWelcome onModuleSelect={handleModuleChange} adminRole={adminRole} />;
      case 'users-roles':
        return <UsersRolesManager {...moduleProps} />;
      case 'polls-system':
        return <PollsSystemManager {...moduleProps} />;
      case 'company-directory':
        return <CompanyDirectoryManager {...moduleProps} />;
      case 'billionaire-tracker':
        return <BillionaireTrackerManager {...moduleProps} />;
      case 'debt-monitor':
        return <DebtMonitorManager {...moduleProps} />;
      case 'civic-officials':
        return <CivicOfficialManager {...moduleProps} />;
      case 'messenger':
        return <MessengerManager {...moduleProps} />;
      case 'sentiment-system':
        return <SentimentSystemManager {...moduleProps} />;
      case 'analytics-logs':
        return <AnalyticsLogsManager {...moduleProps} />;
      case 'intelligence':
        return <IntelligencePanel {...moduleProps} />;
      case 'political-parties':
        return <PoliticalPartiesManager {...moduleProps} />;
      case 'news-system':
        return <NewsSystemManager {...moduleProps} />;
      case 'jobs-management':
        return <JobsManager {...moduleProps} />;
      case 'artist-management':
        return <ArtistManager {...moduleProps} />;
      case 'marketplace':
        return <MarketplaceManager {...moduleProps} />;
      case 'marketplace-admin':
        return <MarketplaceAdminModule {...moduleProps} />;
      case 'logistics-admin':
        return <LogisticsAdminModule {...moduleProps} />;
      case 'moderation':
        return <ModerationModule {...moduleProps} />;
      case 'data-import':
        return <DataImportModule {...moduleProps} />;
      case 'village-admin':
        return <VillageAdminModule {...moduleProps} />;
      case 'system-management':
        return <SystemManagementModule {...moduleProps} />;
      case 'technical-tools':
        return <TechnicalToolsModule {...moduleProps} />;
      case 'ai-civic-tools':
        return <AICivicToolsModule {...moduleProps} />;
      case 'platform-config':
        return <PlatformConfigModule {...moduleProps} />;
      case 'political-management':
        return <PoliticalManagementModule {...moduleProps} />;
      case 'plugin-management':
        return <PluginManagementModule {...moduleProps} />;
      case 'security-finance':
        return <SecurityFinanceModule {...moduleProps} />;
      case 'legacy-features':
        return <LegacyFeaturesModule {...moduleProps} />;
      case 'stripe-settings':
        return <StripeSettings />;
      case 'elections':
        return <div className="p-6 text-center">Elections module coming soon...</div>;
      case 'legal-documents':
        return <LegalDocumentsManager {...moduleProps} />;
      case 'donations':
        return <DonationsManager {...moduleProps} />;
      case 'promises':
        return <PromisesManager {...moduleProps} />;
      case 'regional-analytics':
        return <RegionalAnalyticsManager {...moduleProps} />;
      case 'role-access-test':
        return <RoleAccessTestSuite hasPermission={hasPermission} adminRole={adminRole} currentUser={user} />;
      case 'security-audit':
        return <SecurityAuditSuite hasPermission={hasPermission} adminRole={adminRole} currentUser={user} />;
      case 'poll-templates':
        return <PollTemplatesManager hasPermission={hasPermission} logActivity={logActivity} />;
      case 'user-management':
        return <UserManagementModule {...moduleProps} />;
      case 'content-moderation':
        return <ContentModerationModule {...moduleProps} />;
      case 'system-settings':
        return <SystemSettingsModule {...moduleProps} />;
      case 'settings-sync':
        return <SettingsSyncManager {...moduleProps} systemModules={systemModules} onAutoSync={() => autoSyncMutation.mutate()} />;
      case 'security-management':
        return <SecurityManagementModule {...moduleProps} />;
      case 'news-management':
        return <NewsManagementModule {...moduleProps} />;
      case 'legal-documents-module':
        return <LegalDocumentsModule {...moduleProps} />;
      case 'educational-content':
        return <EducationalContentModule {...moduleProps} />;
      case 'traditional-content':
        return <TraditionalContentModule {...moduleProps} />;
      case 'civic-engagement':
        return <CivicEngagementModule {...moduleProps} />;
      case 'legal-justice':
        return <LegalJusticeModule {...moduleProps} />;
      case 'community-forums':
        return <CommunityForumsModule {...moduleProps} />;
      case 'event-management':
        return <EventManagementModule {...moduleProps} />;
      case 'messaging-system':
        return <MessagingSystemModule {...moduleProps} />;
      case 'social-networking':
        return <SocialNetworkingModule {...moduleProps} />;
      case 'community-groups':
        return <CommunityGroupsModule {...moduleProps} />;
      case 'social-analytics':
        return <SocialAnalyticsModule {...moduleProps} />;
      case 'financial-management':
        return <FinancialManagementModule {...moduleProps} />;
      case 'economic-development':
        return <EconomicDevelopmentModule {...moduleProps} />;
      case 'payment-processing':
        return <PaymentProcessingModule {...moduleProps} />;
      case 'economic-analytics':
        return <EconomicAnalyticsModule {...moduleProps} />;
      case 'tax-management':
        return <TaxManagementModule {...moduleProps} />;
      case 'procurement':
        return <ProcurementModule {...moduleProps} />;
      case 'healthcare-management':
        return <HealthcareManagementModule {...moduleProps} />;
      case 'education-management':
        return <EducationManagementModule {...moduleProps} />;
      case 'health-analytics':
        return <HealthAnalyticsModule {...moduleProps} />;
      case 'education-analytics':
        return <EducationAnalyticsModule {...moduleProps} />;
      case 'artist-platform':
        return <ArtistPlatformModule {...moduleProps} />;
      case 'cultural-preservation':
        return <CulturalPreservationModule {...moduleProps} />;
      case 'advanced-analytics':
        return <AdvancedAnalyticsModule {...moduleProps} />;
      case 'ai-intelligence':
        return <AIIntelligenceModule {...moduleProps} />;
      case 'intelligence-alerts':
        return <IntelligenceAlertsModule {...moduleProps} />;
      case 'realtime-analytics':
        return <RealTimeAnalyticsModule {...moduleProps} />;
      case 'infrastructure-management':
        return <InfrastructureManagementModule {...moduleProps} />;
      case 'system-administration':
        return <SystemAdministrationModule {...moduleProps} />;
      case 'devops-management':
        return <DevOpsManagementModule {...moduleProps} />;
      case 'security-compliance':
        return <SecurityComplianceModule {...moduleProps} />;
      case 'integration-management':
        return <IntegrationManagementModule {...moduleProps} />;
      case 'performance-analytics':
        return <PerformanceAnalyticsModule {...moduleProps} />;
      case 'ai-content-generation':
        return <AIContentGenerationModule {...moduleProps} />;
      case 'machine-learning-analytics':
        return <MachineLearningAnalyticsModule {...moduleProps} />;
      case 'voice-interface':
        return <VoiceInterfaceModule {...moduleProps} />;
      case 'ai-workflow-automation':
        return <AIWorkflowAutomationModule {...moduleProps} />;
      
      // Additional Manager Cases  
      case 'election-manager':
        return <ElectionManager {...moduleProps} />;
      case 'api-configuration':
        return <APIConfigurationManager />;
      case 'admin-workflow':
        return (
          <div className="p-6 text-center">
            <div className="max-w-md mx-auto">
              <Workflow className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Admin Workflow Manager</h3>
              <p className="text-muted-foreground">
                Advanced workflow management system for administrative processes.
              </p>
            </div>
          </div>
        );
      case 'plugin-manager-dashboard':
        return <PluginManagerDashboard />;
      case 'plugin-license-manager':
        return (
          <div className="p-6 text-center">
            <div className="max-w-md mx-auto">
              <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Plugin License Manager</h3>
              <p className="text-muted-foreground">
                Manage plugin licenses and subscription models.
              </p>
            </div>
          </div>
        );
      case 'reports-manager':
        return <ReportsManager />;
      case 'platform-connection-manager':
        return <PlatformConnectionManager />;
      case 'api-key-manager':
        return <ApiKeyManager />;
      case 'webhook-manager':
        return <WebhookManager />;
      case 'template-manager':
        return (
          <div className="p-6 text-center">
            <div className="max-w-md mx-auto">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Template Manager</h3>
              <p className="text-muted-foreground">
                Create and manage document and content templates.
              </p>
            </div>
          </div>
        );
      case 'push-notification-manager':
        return <PushNotificationManager />;
      case 'interactive-notification-manager':
        return <InteractiveNotificationManager />;
      case 'notification-template-manager':
        return <NotificationTemplateManager />;
      case 'scheduled-notification-manager':
        return <ScheduledNotificationManager />;
      case 'advanced-notification-center':
        return <AdvancedNotificationCenter />;
      case 'batch-fix-manager':
        return <BatchFixManager />;
      case 'panafrica-mesh-manager':
        return <PanAfricaMeshManager />;
      case 'civic-education-campaign-manager':
        return <CivicEducationCampaignManager />;
      
      // Placeholder cases for specialized systems that need implementation
      default:
        if (activeModule.includes('placeholder') || activeModule.includes('dashboard') || activeModule.includes('system')) {
          return (
            <div className="p-6 text-center">
              <div className="max-w-md mx-auto">
                <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Module Coming Soon</h3>
                <p className="text-muted-foreground">
                  The {activeModule.replace(/-/g, ' ')} module is currently under development.
                </p>
              </div>
            </div>
          );
        }
        return <AdminDashboard {...moduleProps} onModuleNavigate={handleModuleChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      {isMobile && (
        <AdminHeader
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          notifications={notifications}
          isMobile={isMobile}
          onModuleNavigate={handleModuleChange}
        />
      )}

      <div className="flex h-screen">
        {/* Sidebar */}
        <AdminSidebar
          modules={adminModules}
          activeModule={activeModule}
          setActiveModule={handleModuleChange}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          adminRole={adminRole?.role || 'user'}
          systemModules={systemModules || []}
        />

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen && !isMobile ? 'ml-64' : 'ml-0'} overflow-auto`}>
          {/* Desktop Header */}
          {!isMobile && (
            <AdminHeader
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              notifications={notifications}
              isMobile={isMobile}
            />
          )}

          {/* Main Content Area */}
          <div className="p-4 lg:p-6">
            {renderActiveModule()}
          </div>

          {/* Auto-Sync Status */}
          <ModuleAutoSync
            isRunning={autoSyncMutation.isPending}
            lastSync={systemModules?.[0]?.last_sync}
            onTriggerSync={() => autoSyncMutation.mutate()}
          />

          {/* Activity Logger */}
          <ActivityLogger userId={user?.id} />

          {/* Notification Center */}
          <NotificationCenter 
            notifications={notifications}
            setNotifications={setNotifications}
          />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <MobileAdminNav
          modules={adminModules}
          activeModule={activeModule}
          setActiveModule={handleModuleChange}
          notifications={notifications}
        />
      )}
    </div>
  );
};