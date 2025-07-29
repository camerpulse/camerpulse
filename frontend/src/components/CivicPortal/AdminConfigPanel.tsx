import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Palette, 
  Eye, 
  RefreshCw, 
  BarChart3, 
  Users,
  Shield,
  Monitor,
  Accessibility
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConfigState {
  public_visibility: {
    political_parties: boolean;
    politicians: boolean;
    transparency_reports: boolean;
    sentiment_data: boolean;
    regional_data: boolean;
  };
  refresh_intervals: {
    sentiment: number;
    politicians: number;
    reports: number;
  };
  theme_settings: {
    color_scheme: 'default' | 'national' | 'accessibility';
    font_size: 'small' | 'medium' | 'large';
    density: 'compact' | 'comfortable' | 'spacious';
  };
  analytics: {
    track_usage: boolean;
    export_enabled: boolean;
    public_stats: boolean;
  };
}

export const AdminConfigPanel = () => {
  const [config, setConfig] = useState<ConfigState>({
    public_visibility: {
      political_parties: true,
      politicians: true,
      transparency_reports: true,
      sentiment_data: true,
      regional_data: true,
    },
    refresh_intervals: {
      sentiment: 60,
      politicians: 300,
      reports: 3600,
    },
    theme_settings: {
      color_scheme: 'default',
      font_size: 'medium',
      density: 'comfortable',
    },
    analytics: {
      track_usage: true,
      export_enabled: true,
      public_stats: true,
    },
  });

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total_users: 0,
    daily_visits: 0,
    popular_sections: [] as string[],
    avg_session_time: 0,
  });

  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
    loadStats();
  }, []);

  const loadConfig = async () => {
    try {
      const { data } = await supabase
        .from('civic_module_visibility')
        .select('*');

      if (data) {
        // Update config based on database data
        const newConfig = { ...config };
        data.forEach(item => {
          if (item.module_name in newConfig.public_visibility) {
            newConfig.public_visibility[item.module_name as keyof typeof newConfig.public_visibility] = item.is_public_visible;
          }
        });
        setConfig(newConfig);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const loadStats = async () => {
    try {
      // Mock analytics data - in real implementation, this would come from your analytics system
      setStats({
        total_users: 12567,
        daily_visits: 1834,
        popular_sections: ['Politicians', 'Promise Tracker', 'Regional Data'],
        avg_session_time: 248,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    try {
      // Update civic module visibility
      const updates = Object.entries(config.public_visibility).map(([module, visible]) => ({
        module_name: module,
        is_public_visible: visible,
        updated_at: new Date().toISOString(),
      }));

      for (const update of updates) {
        await supabase
          .from('civic_module_visibility')
          .upsert(update, { onConflict: 'module_name' });
      }

      // Apply theme changes to document
      applyThemeSettings();

      toast({
        title: "Configuration Saved",
        description: "All settings have been updated successfully.",
      });

    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyThemeSettings = () => {
    const root = document.documentElement;
    
    // Apply color scheme
    switch (config.theme_settings.color_scheme) {
      case 'national':
        root.style.setProperty('--primary', '142 69% 58%'); // Cameroon Green
        root.style.setProperty('--secondary', '348 83% 47%'); // Cameroon Red  
        root.style.setProperty('--accent', '45 93% 47%'); // Cameroon Yellow
        break;
      case 'accessibility':
        root.style.setProperty('--primary', '240 5% 6%'); // High contrast
        root.style.setProperty('--secondary', '240 5% 96%');
        root.style.setProperty('--accent', '240 5% 26%');
        break;
      default:
        // Reset to default theme
        root.style.removeProperty('--primary');
        root.style.removeProperty('--secondary');
        root.style.removeProperty('--accent');
    }

    // Apply font size
    const fontSizes = {
      small: '14px',
      medium: '16px', 
      large: '18px',
    };
    root.style.setProperty('--base-font-size', fontSizes[config.theme_settings.font_size]);

    // Apply density
    const densities = {
      compact: '0.75',
      comfortable: '1',
      spacious: '1.25',
    };
    root.style.setProperty('--spacing-scale', densities[config.theme_settings.density]);
  };

  const updateVisibility = (module: keyof ConfigState['public_visibility'], value: boolean) => {
    setConfig(prev => ({
      ...prev,
      public_visibility: {
        ...prev.public_visibility,
        [module]: value,
      },
    }));
  };

  const updateRefreshInterval = (type: keyof ConfigState['refresh_intervals'], value: number) => {
    setConfig(prev => ({
      ...prev,
      refresh_intervals: {
        ...prev.refresh_intervals,
        [type]: value,
      },
    }));
  };

  const updateTheme = (setting: keyof ConfigState['theme_settings'], value: string) => {
    setConfig(prev => ({
      ...prev,
      theme_settings: {
        ...prev.theme_settings,
        [setting]: value,
      },
    }));
  };

  const updateAnalytics = (setting: keyof ConfigState['analytics'], value: boolean) => {
    setConfig(prev => ({
      ...prev,
      analytics: {
        ...prev.analytics,
        [setting]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Settings className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Admin Configuration</h2>
            <p className="text-muted-foreground">Manage civic portal settings and visibility</p>
          </div>
        </div>
        <Button onClick={saveConfig} disabled={loading} className="flex items-center space-x-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Save Changes</span>
        </Button>
      </div>

      {/* Analytics Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Usage Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.total_users.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.daily_visits.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Daily Visits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.avg_session_time}s</div>
            <div className="text-sm text-muted-foreground">Avg Session</div>
          </div>
          <div className="text-center">
            <div className="flex flex-wrap gap-1 justify-center">
              {stats.popular_sections.slice(0, 2).map(section => (
                <Badge key={section} variant="secondary" className="text-xs">
                  {section}
                </Badge>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">Popular</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Public Visibility Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Public Visibility</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(config.public_visibility).map(([module, visible]) => (
              <div key={module} className="flex items-center justify-between">
                <Label htmlFor={module} className="capitalize">
                  {module.replace('_', ' ')}
                </Label>
                <Switch
                  id={module}
                  checked={visible}
                  onCheckedChange={(checked) => updateVisibility(module as keyof ConfigState['public_visibility'], checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Refresh Intervals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5" />
              <span>Auto-Refresh Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(config.refresh_intervals).map(([type, interval]) => (
              <div key={type} className="space-y-2">
                <Label className="capitalize">{type} Data (seconds)</Label>
                <Select 
                  value={interval.toString()} 
                  onValueChange={(value) => updateRefreshInterval(type as keyof ConfigState['refresh_intervals'], parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                    <SelectItem value="600">10 minutes</SelectItem>
                    <SelectItem value="3600">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Theme Customization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Theme Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Color Scheme</Label>
              <Select 
                value={config.theme_settings.color_scheme} 
                onValueChange={(value) => updateTheme('color_scheme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="national">National Colors</SelectItem>
                  <SelectItem value="accessibility">High Contrast</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Font Size</Label>
              <Select 
                value={config.theme_settings.font_size} 
                onValueChange={(value) => updateTheme('font_size', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Layout Density</Label>
              <Select 
                value={config.theme_settings.density} 
                onValueChange={(value) => updateTheme('density', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="spacious">Spacious</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Monitor className="h-5 w-5" />
              <span>Analytics & Export</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(config.analytics).map(([setting, enabled]) => (
              <div key={setting} className="flex items-center justify-between">
                <Label htmlFor={setting} className="capitalize">
                  {setting.replace('_', ' ')}
                </Label>
                <Switch
                  id={setting}
                  checked={enabled}
                  onCheckedChange={(checked) => updateAnalytics(setting as keyof ConfigState['analytics'], checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};