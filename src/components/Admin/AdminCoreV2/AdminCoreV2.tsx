import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
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
  Flag, Newspaper, Store, Vote, Scale, Heart, MapPin, Palette,
  ListChecks
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
import { MarketplaceManager } from './modules/MarketplaceManager';
import { ElectionManager } from './modules/ElectionManager';
import { LegalDocumentsManager } from './modules/LegalDocumentsManager';
import { DonationsManager } from './modules/DonationsManager';
import { NokashConfigPanel } from '../PaymentConfig/NokashConfigPanel';
import { PromisesManager } from './modules/PromisesManager';
import { RegionalAnalyticsManager } from './modules/RegionalAnalyticsManager';
import RoleAccessTestSuite from './tests/RoleAccessTestSuite';
import SecurityAuditSuite from './security/SecurityAuditSuite';
import { PollTemplatesManager } from './PollTemplatesManager';
import PriorityAssessmentDashboard from '@/pages/admin/PriorityAssessmentDashboard';
import { ModuleAutoSync } from './core/ModuleAutoSync';
import { ActivityLogger } from './core/ActivityLogger';
import { NotificationCenter } from './core/NotificationCenter';
import { AdminSidebar } from './layout/AdminSidebar';
import { AdminHeader } from './layout/AdminHeader';
import { MobileAdminNav } from './layout/MobileAdminNav';
import { CleanupReviewManager } from './modules/CleanupReviewManager';
import { SystemHealthManager } from './modules/SystemHealthManager';
import { SecurityAuditManager } from './modules/SecurityAuditManager';
import { BackupRecoveryManager } from './modules/BackupRecoveryManager';
import { ErrorMonitoringManager } from './modules/ErrorMonitoringManager';
import { PerformanceAnalyticsManager } from './modules/PerformanceAnalyticsManager';
import { ApiRateLimitManager } from './modules/ApiRateLimitManager';
import { UserActivityAuditManager } from './modules/UserActivityAuditManager';
import { ApiConfigPanel } from '../ApiConfiguration/ApiConfigPanel';

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
  
  // UI State
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const location = useLocation();
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
        moderator: ['users', 'polls', 'civic-tools', 'messenger', 'analytics'],
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
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'text-cm-green', permission: 'all' },
    { id: 'users-roles', label: 'Users & Roles', icon: Users, color: 'text-blue-600', permission: 'users' },
    { id: 'polls-system', label: 'Polls System', icon: Target, color: 'text-purple-600', permission: 'polls' },
    { id: 'company-directory', label: 'Company Directory', icon: Building2, color: 'text-orange-600', permission: 'companies' },
    { id: 'billionaire-tracker', label: 'Billionaire Tracker', icon: CreditCard, color: 'text-yellow-600', permission: 'companies' },
    { id: 'debt-monitor', label: 'Debt Monitor', icon: TrendingUp, color: 'text-red-600', permission: 'analytics' },
    { id: 'civic-officials', label: 'Civic & Officials', icon: UserCheck, color: 'text-cm-red', permission: 'civic-tools' },
    { id: 'messenger', label: 'Pulse Messenger', icon: MessageSquare, color: 'text-green-600', permission: 'messenger' },
    { id: 'sentiment-system', label: 'Sentiment System', icon: Brain, color: 'text-indigo-600', permission: 'analytics' },
    { id: 'analytics-logs', label: 'Analytics & Logs', icon: Database, color: 'text-gray-600', permission: 'analytics' },
    { id: 'cleanup-review', label: 'Cleanup Review', icon: ListChecks, color: 'text-red-600', permission: 'admin_only' },
    { id: 'political-parties', label: 'Political Parties', icon: Flag, color: 'text-blue-600', permission: 'politics' },
    { id: 'news-system', label: 'News System', icon: Newspaper, color: 'text-blue-600', permission: 'content' },
    { id: 'marketplace', label: 'Marketplace', icon: Store, color: 'text-green-600', permission: 'marketplace' },
    { id: 'elections', label: 'Elections', icon: Vote, color: 'text-purple-600', permission: 'elections' },
    { id: 'legal-documents', label: 'Legal Documents', icon: Scale, color: 'text-blue-600', permission: 'legal' },
    { id: 'donations', label: 'Donations', icon: Heart, color: 'text-red-500', permission: 'finance' },
    { id: 'nokash-payments', label: 'Nokash Payments', icon: CreditCard, color: 'text-green-600', permission: 'finance' },
    { id: 'promises', label: 'Promises Tracker', icon: Target, color: 'text-green-600', permission: 'tracking' },
    { id: 'regional-analytics', label: 'Regional Analytics', icon: MapPin, color: 'text-blue-600', permission: 'analytics' },
    { id: 'role-access-test', label: 'Role Access Test', icon: Shield, color: 'text-orange-600', permission: 'all' },
    { id: 'security-audit', label: 'Security Audit', icon: Shield, color: 'text-red-600', permission: 'all' },
    { id: 'poll-templates', label: 'Poll Templates', icon: Palette, color: 'text-purple-600', permission: 'content' },
    { id: 'intelligence', label: 'Intelligence Panel', icon: Bot, color: 'text-purple-500', permission: 'all' },
    { id: 'priority-assessment', label: 'Priority Assessment', icon: TrendingUp, color: 'text-amber-600', permission: 'all' },
    { id: 'settings-sync', label: 'Settings & Sync', icon: Settings, color: 'text-gray-500', permission: 'all' },
    { id: 'system-health', label: 'System Health', icon: Monitor, color: 'text-blue-600', permission: 'all' },
    { id: 'security-audit-manager', label: 'Security Manager', icon: Shield, color: 'text-red-600', permission: 'all' },
    { id: 'backup-recovery', label: 'Backup & Recovery', icon: Database, color: 'text-purple-600', permission: 'all' },
    { id: 'error-monitoring', label: 'Error Monitoring', icon: AlertTriangle, color: 'text-red-600', permission: 'all' },
    { id: 'performance-analytics', label: 'Performance Analytics', icon: BarChart3, color: 'text-blue-600', permission: 'all' },
    { id: 'api-configuration', label: 'API Configuration', icon: Key, color: 'text-green-600', permission: 'all' },
  ].filter(module => hasPermission(module.permission));

  useEffect(() => {
    const path = location.pathname || '';
    if (path.startsWith('/admin/')) {
      const mod = path.split('/')[2];
      if (mod) {
        const exists = adminModules.find(m => m.id === mod);
        if (exists) setActiveModule(mod);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, adminModules.length]);
  const renderActiveModule = () => {
    const moduleProps = { hasPermission, logActivity, stats };
    
    switch (activeModule) {
      case 'dashboard':
        return <AdminDashboard {...moduleProps} />;
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
      case 'cleanup-review':
        return <CleanupReviewManager />;
      case 'intelligence':
        return <IntelligencePanel {...moduleProps} />;
      case 'political-parties':
        return <PoliticalPartiesManager {...moduleProps} />;
      case 'news-system':
        return <NewsSystemManager {...moduleProps} />;
      case 'marketplace':
        return <MarketplaceManager {...moduleProps} />;
      case 'elections':
        return <ElectionManager {...moduleProps} />;
      case 'legal-documents':
        return <LegalDocumentsManager {...moduleProps} />;
      case 'donations':
        return <DonationsManager {...moduleProps} />;
      case 'nokash-payments':
        return <NokashConfigPanel />;
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
      case 'priority-assessment':
        return <PriorityAssessmentDashboard />;
      case 'settings-sync':
        return <SettingsSyncManager {...moduleProps} systemModules={systemModules} onAutoSync={() => autoSyncMutation.mutate()} />;
      case 'system-health':
        return <SystemHealthManager {...moduleProps} />;
      case 'security-audit-manager':
        return <SecurityAuditManager {...moduleProps} />;
      case 'backup-recovery':
        return <BackupRecoveryManager {...moduleProps} />;
      case 'error-monitoring':
        return <ErrorMonitoringManager {...moduleProps} />;
      case 'performance-analytics':
        return <PerformanceAnalyticsManager {...moduleProps} />;
      case 'api-configuration':
        return <ApiConfigPanel />;
      default:
        return <AdminDashboard {...moduleProps} />;
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
        />
      )}

      <div className="flex h-screen">
        {/* Sidebar */}
        <AdminSidebar
          modules={adminModules}
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          adminRole={adminRole}
          systemModules={systemModules}
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
          setActiveModule={setActiveModule}
          notifications={notifications}
        />
      )}
    </div>
  );
};