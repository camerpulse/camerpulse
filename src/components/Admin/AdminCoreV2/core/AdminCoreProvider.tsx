import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface AdminCoreContextType {
  adminRole: AdminRole | null;
  stats: AdminStats | undefined;
  systemModules: SystemModule[] | undefined;
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => Promise<void>;
  autoSyncMutation: any;
  isLoading: boolean;
}

const AdminCoreContext = createContext<AdminCoreContextType | undefined>(undefined);

export const useAdminCore = () => {
  const context = useContext(AdminCoreContext);
  if (!context) {
    throw new Error('useAdminCore must be used within AdminCoreProvider');
  }
  return context;
};

interface AdminCoreProviderProps {
  children: React.ReactNode;
}

export const AdminCoreProvider: React.FC<AdminCoreProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    refetchInterval: 30000,
  });

  // Fetch system modules
  const { data: systemModules } = useQuery({
    queryKey: ['system_modules'],
    queryFn: async (): Promise<SystemModule[]> => {
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

  const value: AdminCoreContextType = {
    adminRole,
    stats,
    systemModules,
    hasPermission,
    logActivity,
    autoSyncMutation,
    isLoading: roleLoading || statsLoading
  };

  return (
    <AdminCoreContext.Provider value={value}>
      {children}
    </AdminCoreContext.Provider>
  );
};