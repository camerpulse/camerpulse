import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  Settings, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield
} from 'lucide-react';

interface LocalizationConfig {
  systemLanguage: 'en';
  translationModeEnabled: false;
  allowUserLanguageSwitch: false;
  localeDetectionEnabled: false;
  frenchFallbackEnabled: false;
}

export const LocalizationSettings: React.FC = () => {
  const config = {
    systemLanguage: 'en' as const,
    translationModeEnabled: false,
    allowUserLanguageSwitch: false,
    localeDetectionEnabled: false,
    frenchFallbackEnabled: false
  };

  const saveConfiguration = () => {
    // This would save to Supabase in a real implementation
    console.log('Saving localization configuration:', config);
  };

  return (
    <div className="space-y-6">
      {/* System Status */}
      <Card className="border-l-4 border-green-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              System Language Status
            </CardTitle>
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              English Only
            </Badge>
          </div>
          <CardDescription>
            Current system configuration - English only platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Primary Language:</span>
                <Badge variant="default">English (en)</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Translation Mode:</span>
                <Badge variant="secondary">Disabled</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">User Language Switch:</span>
                <Badge variant="secondary">Disabled</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Browser Detection:</span>
                <Badge variant="secondary">Disabled</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">French Fallback:</span>
                <Badge variant="secondary">Disabled</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Date Format:</span>
                <Badge variant="default">en-US</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Configuration
          </CardTitle>
          <CardDescription>
            Platform is configured for English-only operation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              CamerPulse operates exclusively in English to ensure clear civic communication.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={saveConfiguration}>
              Confirm Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Audit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Content Audit
          </CardTitle>
          <CardDescription>
            Review and manage content across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">1,247</div>
              <div className="text-sm text-muted-foreground">English Content</div>
              <Badge variant="secondary" className="mt-2">Active</Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">15</div>
              <div className="text-sm text-muted-foreground">Components</div>
              <Badge variant="secondary" className="mt-2">Optimized</Badge>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm">
              Scan Content
            </Button>
            <Button variant="outline" size="sm">
              Export Audit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};