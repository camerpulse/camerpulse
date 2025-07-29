import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  FileText, 
  MessageCircle, 
  Lock,
  UserX,
  Activity,
  Settings
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WhistleblowerPortal } from '@/components/civic-shield/WhistleblowerPortal';
import { SubmissionTracker } from '@/components/civic-shield/SubmissionTracker';
import { ProtectionCenter } from '@/components/civic-shield/ProtectionCenter';
import { CivicShieldAdmin } from '@/components/civic-shield/CivicShieldAdmin';
import { LegalAidPortal } from '@/components/civic-shield/LegalAidPortal';

const CivicShield: React.FC = () => {
  const [activeTab, setActiveTab] = useState('portal');
  const [userRole, setUserRole] = useState<string>('citizen');
  const { toast } = useToast();

  // Check user role and system status
  const { data: systemConfig, isLoading: configLoading } = useQuery({
    queryKey: ['civic-shield-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('civic_shield_config')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: userRoleData } = useQuery({
    queryKey: ['user-role'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!supabase.auth.getUser(),
  });

  useEffect(() => {
    if (userRoleData?.role) {
      setUserRole(userRoleData.role);
    }
  }, [userRoleData]);

  if (configLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Shield className="h-8 w-8 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading Civic Shield...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!systemConfig?.system_enabled) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Civic Shield Temporarily Unavailable</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            The Civic Shield protection system is currently undergoing maintenance. 
            Please check back later or contact administrators if urgent.
          </p>
          {userRole === 'admin' && (
            <Button 
              onClick={() => setActiveTab('admin')} 
              className="mt-4"
              variant="outline"
            >
              Admin Panel
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">CamerPulse Civic Shield</h1>
            <p className="text-muted-foreground">
              Secure whistleblower protection and civic safety system
            </p>
          </div>
        </div>
        
        {/* Security Status Banner */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <Lock className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="font-medium text-sm">Military-Grade Encryption Active</p>
                <p className="text-xs text-muted-foreground">
                  All communications are encrypted end-to-end with zero-knowledge architecture
                </p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Activity className="h-3 w-3 mr-1" />
                System Secure
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="portal" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Submit Report
          </TabsTrigger>
          <TabsTrigger value="tracker" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Track Submission
          </TabsTrigger>
          <TabsTrigger value="protection" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Protection Center
          </TabsTrigger>
          <TabsTrigger value="legal-aid" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Legal Aid
          </TabsTrigger>
          {(userRole === 'admin' || userRole === 'moderator') && (
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {userRole === 'admin' ? 'Admin Panel' : 'Moderator'}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="portal">
          <WhistleblowerPortal systemConfig={systemConfig} />
        </TabsContent>

        <TabsContent value="tracker">
          <SubmissionTracker />
        </TabsContent>

        <TabsContent value="protection">
          <ProtectionCenter userRole={userRole} />
        </TabsContent>

        <TabsContent value="legal-aid">
          <LegalAidPortal />
        </TabsContent>

        {(userRole === 'admin' || userRole === 'moderator') && (
          <TabsContent value="admin">
            <CivicShieldAdmin userRole={userRole} systemConfig={systemConfig} />
          </TabsContent>
        )}
      </Tabs>

      {/* Emergency Contact */}
      <Card className="mt-8 border-orange-200 bg-orange-50/50">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <div>
              <p className="font-medium text-sm text-orange-800">Emergency Situations</p>
              <p className="text-xs text-orange-700">
                If you are in immediate danger, contact local authorities immediately. 
                Civic Shield is for reporting misconduct, not emergency response.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CivicShield;