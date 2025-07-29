import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Zap, RefreshCw } from 'lucide-react';

interface SystemModule {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'broken';
  last_sync: string;
  version: string;
}

interface SettingsSyncManagerProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
  systemModules?: SystemModule[];
  onAutoSync: () => void;
}

export const SettingsSyncManager: React.FC<SettingsSyncManagerProps> = ({
  hasPermission,
  logActivity,
  stats,
  systemModules,
  onAutoSync
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center">
          <Settings className="h-6 w-6 mr-2 text-gray-500" />
          Settings & Auto-Sync
        </h2>
        <p className="text-muted-foreground">System configuration and module synchronization</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-cm-green" />
            Auto-Sync Engine
          </CardTitle>
          <CardDescription>
            Automatically detect and integrate new platform features into Admin Core
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Feature Auto-Detection</h3>
                <p className="text-sm text-muted-foreground">
                  Scans platform for new modules and features
                </p>
              </div>
              <Button onClick={onAutoSync} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Run Sync
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {systemModules?.map((module) => (
                <div key={module.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{module.name}</h4>
                    <div className={`w-2 h-2 rounded-full ${
                      module.status === 'active' ? 'bg-cm-green' :
                      module.status === 'inactive' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Version: {module.version} | Last sync: {new Date(module.last_sync).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>Global admin panel configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Settings Panel</h3>
            <p className="text-muted-foreground">
              Advanced system configuration and settings management
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};