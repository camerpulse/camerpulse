import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  Lock, 
  Settings, 
  CheckCircle,
  XCircle,
  Languages,
  AlertTriangle,
  Shield
} from 'lucide-react';

interface LocalizationConfig {
  systemLanguage: 'en' | 'fr';
  translationModeEnabled: boolean;
  allowUserLanguageSwitch: boolean;
  localeDetectionEnabled: boolean;
  frenchFallbackEnabled: boolean;
}

export const LocalizationSettings: React.FC = () => {
  const [config, setConfig] = useState<LocalizationConfig>({
    systemLanguage: 'en',
    translationModeEnabled: false,
    allowUserLanguageSwitch: false,
    localeDetectionEnabled: false,
    frenchFallbackEnabled: false
  });

  const [isLocked, setIsLocked] = useState(true);

  const handleConfigChange = (key: keyof LocalizationConfig, value: boolean | string) => {
    if (isLocked) return;
    
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleLock = () => {
    setIsLocked(!isLocked);
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
              English (Locked)
            </Badge>
          </div>
          <CardDescription>
            Current system configuration and language settings
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
                <Badge variant={config.translationModeEnabled ? "destructive" : "secondary"}>
                  {config.translationModeEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">User Language Switch:</span>
                <Badge variant={config.allowUserLanguageSwitch ? "destructive" : "secondary"}>
                  {config.allowUserLanguageSwitch ? "Allowed" : "Blocked"}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Browser Detection:</span>
                <Badge variant={config.localeDetectionEnabled ? "destructive" : "secondary"}>
                  {config.localeDetectionEnabled ? "Active" : "Disabled"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">French Fallback:</span>
                <Badge variant={config.frenchFallbackEnabled ? "destructive" : "secondary"}>
                  {config.frenchFallbackEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Date Format:</span>
                <Badge variant="default">en-US</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Localization Configuration
            </CardTitle>
            <Button 
              variant={isLocked ? "destructive" : "default"}
              size="sm"
              onClick={toggleLock}
              className="flex items-center gap-2"
            >
              {isLocked ? <Lock className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
              {isLocked ? "Locked" : "Unlocked"}
            </Button>
          </div>
          <CardDescription>
            Advanced language and localization settings (Admin only)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLocked && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                System language is locked to English for production. Unlock to modify settings.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Enable Translation Mode</div>
                <div className="text-xs text-muted-foreground">
                  Allow access to French translations and language switching
                </div>
              </div>
              <Switch 
                checked={config.translationModeEnabled}
                onCheckedChange={(checked) => handleConfigChange('translationModeEnabled', checked)}
                disabled={isLocked}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">User Language Switching</div>
                <div className="text-xs text-muted-foreground">
                  Allow users to change interface language
                </div>
              </div>
              <Switch 
                checked={config.allowUserLanguageSwitch}
                onCheckedChange={(checked) => handleConfigChange('allowUserLanguageSwitch', checked)}
                disabled={isLocked || !config.translationModeEnabled}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Browser Locale Detection</div>
                <div className="text-xs text-muted-foreground">
                  Automatically detect user's browser language preference
                </div>
              </div>
              <Switch 
                checked={config.localeDetectionEnabled}
                onCheckedChange={(checked) => handleConfigChange('localeDetectionEnabled', checked)}
                disabled={isLocked || !config.translationModeEnabled}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">French Language Fallback</div>
                <div className="text-xs text-muted-foreground">
                  Use French content when available, fall back to English
                </div>
              </div>
              <Switch 
                checked={config.frenchFallbackEnabled}
                onCheckedChange={(checked) => handleConfigChange('frenchFallbackEnabled', checked)}
                disabled={isLocked || !config.translationModeEnabled}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" disabled={isLocked}>
              Reset to Defaults
            </Button>
            <Button onClick={saveConfiguration} disabled={isLocked}>
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Audit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Content Language Audit
          </CardTitle>
          <CardDescription>
            Review and manage multilingual content across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">1,247</div>
              <div className="text-sm text-muted-foreground">English Strings</div>
              <Badge variant="secondary" className="mt-2">Active</Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">89</div>
              <div className="text-sm text-muted-foreground">French Strings</div>
              <Badge variant="outline" className="mt-2">Inactive</Badge>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">15</div>
              <div className="text-sm text-muted-foreground">Mixed Content</div>
              <Badge variant="destructive" className="mt-2">Needs Review</Badge>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm">
              Scan for French Content
            </Button>
            <Button variant="outline" size="sm">
              Export Language Audit
            </Button>
            <Button variant="outline" size="sm">
              Clean Mixed Content
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};