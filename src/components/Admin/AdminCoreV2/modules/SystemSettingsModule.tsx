import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Globe, Shield, Bell, Database, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemSettingsModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const SystemSettingsModule: React.FC<SystemSettingsModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock system settings for now
  const { data: settings, isLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      // Return mock settings with all required properties
      return {
        platform_name: { data: 'CamerPulse' },
        platform_version: { data: '1.0.0' },
        platform_description: { data: 'Civic engagement platform for Cameroon' },
        maintenance_mode: { data: false },
        default_language: { data: 'French' },
        default_currency: { data: 'FCFA' },
        require_email_verification: { data: true },
        enable_2fa: { data: false },
        session_timeout: { data: 60 },
        auto_moderation_enabled: { data: true },
        content_filtering_enabled: { data: true },
        email_notifications_enabled: { data: true },
        push_notifications_enabled: { data: true },
        sms_notifications_enabled: { data: false },
        auto_backup_enabled: { data: true },
        backup_frequency_hours: { data: 24 },
        data_retention_days: { data: 365 },
        primary_color: { data: '#10b981' },
        secondary_color: { data: '#3b82f6' },
        dark_mode_default: { data: false },
        api_rate_limit: { data: 1000 },
        api_logging_enabled: { data: true },
        api_analytics_enabled: { data: true }
      };
    }
  });

  // Mock update setting mutation
  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      // Mock implementation - will be replaced with actual database operations
      await new Promise(resolve => setTimeout(resolve, 300));
      return { key, value };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast({ title: `Setting "${variables.key}" updated successfully` });
      logActivity('system_setting_updated', { key: variables.key });
    },
    onError: () => {
      toast({ title: "Failed to update setting", variant: "destructive" });
    }
  });

  const handleSettingChange = (key: string, value: any) => {
    updateSetting.mutate({ key, value });
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="System Settings"
        description="Configure platform settings, security, and preferences"
        icon={Settings}
        iconColor="text-gray-600"
        onRefresh={() => {
          queryClient.invalidateQueries({ queryKey: ['system-settings'] });
          logActivity('system_settings_refresh', { timestamp: new Date() });
        }}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            API
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform-name">Platform Name</Label>
                    <Input
                      id="platform-name"
                      defaultValue={settings?.platform_name?.data || 'CamerPulse'}
                      onBlur={(e) => handleSettingChange('platform_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="platform-version">Version</Label>
                    <Input
                      id="platform-version"
                      defaultValue={settings?.platform_version?.data || '1.0.0'}
                      onBlur={(e) => handleSettingChange('platform_version', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform-description">Platform Description</Label>
                  <Textarea
                    id="platform-description"
                    defaultValue={settings?.platform_description?.data || 'Civic engagement platform for Cameroon'}
                    onBlur={(e) => handleSettingChange('platform_description', e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="maintenance-mode"
                    checked={settings?.maintenance_mode?.data || false}
                    onCheckedChange={(checked) => handleSettingChange('maintenance_mode', checked)}
                  />
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="default-language">Default Language</Label>
                    <Input
                      id="default-language"
                      defaultValue={settings?.default_language?.data || 'French'}
                      onBlur={(e) => handleSettingChange('default_language', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default-currency">Default Currency</Label>
                    <Input
                      id="default-currency"
                      defaultValue={settings?.default_currency?.data || 'FCFA'}
                      onBlur={(e) => handleSettingChange('default_currency', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="require-email-verification"
                    checked={settings?.require_email_verification?.data || true}
                    onCheckedChange={(checked) => handleSettingChange('require_email_verification', checked)}
                  />
                  <Label htmlFor="require-email-verification">Require Email Verification</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable-2fa"
                    checked={settings?.enable_2fa?.data || false}
                    onCheckedChange={(checked) => handleSettingChange('enable_2fa', checked)}
                  />
                  <Label htmlFor="enable-2fa">Enable Two-Factor Authentication</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    defaultValue={settings?.session_timeout?.data || 60}
                    onBlur={(e) => handleSettingChange('session_timeout', parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-moderation"
                    checked={settings?.auto_moderation_enabled?.data || true}
                    onCheckedChange={(checked) => handleSettingChange('auto_moderation_enabled', checked)}
                  />
                  <Label htmlFor="auto-moderation">Enable Auto-Moderation</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="content-filtering"
                    checked={settings?.content_filtering_enabled?.data || true}
                    onCheckedChange={(checked) => handleSettingChange('content_filtering_enabled', checked)}
                  />
                  <Label htmlFor="content-filtering">Enable Content Filtering</Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="email-notifications"
                  checked={settings?.email_notifications_enabled?.data || true}
                  onCheckedChange={(checked) => handleSettingChange('email_notifications_enabled', checked)}
                />
                <Label htmlFor="email-notifications">Enable Email Notifications</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="push-notifications"
                  checked={settings?.push_notifications_enabled?.data || true}
                  onCheckedChange={(checked) => handleSettingChange('push_notifications_enabled', checked)}
                />
                <Label htmlFor="push-notifications">Enable Push Notifications</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="sms-notifications"
                  checked={settings?.sms_notifications_enabled?.data || false}
                  onCheckedChange={(checked) => handleSettingChange('sms_notifications_enabled', checked)}
                />
                <Label htmlFor="sms-notifications">Enable SMS Notifications</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-backup"
                  checked={settings?.auto_backup_enabled?.data || true}
                  onCheckedChange={(checked) => handleSettingChange('auto_backup_enabled', checked)}
                />
                <Label htmlFor="auto-backup">Enable Auto Backup</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup-frequency">Backup Frequency (hours)</Label>
                <Input
                  id="backup-frequency"
                  type="number"
                  defaultValue={settings?.backup_frequency_hours?.data || 24}
                  onBlur={(e) => handleSettingChange('backup_frequency_hours', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data-retention">Data Retention (days)</Label>
                <Input
                  id="data-retention"
                  type="number"
                  defaultValue={settings?.data_retention_days?.data || 365}
                  onBlur={(e) => handleSettingChange('data_retention_days', parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>UI Customization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <Input
                  id="primary-color"
                  type="color"
                  defaultValue={settings?.primary_color?.data || '#10b981'}
                  onBlur={(e) => handleSettingChange('primary_color', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary-color">Secondary Color</Label>
                <Input
                  id="secondary-color"
                  type="color"
                  defaultValue={settings?.secondary_color?.data || '#3b82f6'}
                  onBlur={(e) => handleSettingChange('secondary_color', e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="dark-mode-default"
                  checked={settings?.dark_mode_default?.data || false}
                  onCheckedChange={(checked) => handleSettingChange('dark_mode_default', checked)}
                />
                <Label htmlFor="dark-mode-default">Dark Mode by Default</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-rate-limit">API Rate Limit (requests/minute)</Label>
                <Input
                  id="api-rate-limit"
                  type="number"
                  defaultValue={settings?.api_rate_limit?.data || 1000}
                  onBlur={(e) => handleSettingChange('api_rate_limit', parseInt(e.target.value))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="api-logging"
                  checked={settings?.api_logging_enabled?.data || true}
                  onCheckedChange={(checked) => handleSettingChange('api_logging_enabled', checked)}
                />
                <Label htmlFor="api-logging">Enable API Logging</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="api-analytics"
                  checked={settings?.api_analytics_enabled?.data || true}
                  onCheckedChange={(checked) => handleSettingChange('api_analytics_enabled', checked)}
                />
                <Label htmlFor="api-analytics">Enable API Analytics</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};