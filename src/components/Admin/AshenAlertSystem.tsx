import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CheckCircle, XCircle, Zap, Eye, X, Volume2, VolumeX, Clock, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AlertEvent {
  id: string;
  event_type: 'error_detected' | 'fix_proposed' | 'fix_applied' | 'heal_failed';
  title: string;
  message: string;
  component_path?: string;
  route?: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  metadata?: any;
}

interface AlertConfig {
  enabled: boolean;
  sound_enabled: boolean;
  silence_duration: number; // in minutes
  priority_filter: 'all' | 'high_only';
}

interface AlertNotification extends AlertEvent {
  acknowledged: boolean;
  dismissed: boolean;
  show_time: number;
}

export function AshenAlertSystem() {
  const [config, setConfig] = useState<AlertConfig>({
    enabled: true,
    sound_enabled: true,
    silence_duration: 60,
    priority_filter: 'all'
  });
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [silencedUntil, setSilencedUntil] = useState<number | null>(null);

  useEffect(() => {
    loadConfig();
    setupRealtimeSubscription();
  }, []);

  // Auto-dismiss notifications after 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => 
        prev.map(notification => {
          if (Date.now() - notification.show_time > 15000 && !notification.acknowledged) {
            return { ...notification, dismissed: true };
          }
          return notification;
        }).filter(n => !n.dismissed)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadConfig = async () => {
    try {
      const { data } = await supabase
        .from('ashen_monitoring_config')
        .select('config_key, config_value')
        .in('config_key', [
          'alerts_enabled',
          'alerts_sound_enabled', 
          'alerts_silence_duration',
          'alerts_priority_filter'
        ]);

      if (data) {
        const configMap = data.reduce((acc, item) => {
          // Handle JSONB values - they might be strings or actual values
          let value = item.config_value;
          if (typeof value === 'string') {
            try {
              value = JSON.parse(value);
            } catch {
              // If parsing fails, use the string value
            }
          }
          acc[item.config_key] = value;
          return acc;
        }, {} as Record<string, any>);

        setConfig({
          enabled: configMap.alerts_enabled === 'true' || configMap.alerts_enabled === true,
          sound_enabled: configMap.alerts_sound_enabled === 'true' || configMap.alerts_sound_enabled === true,
          silence_duration: parseInt(configMap.alerts_silence_duration) || 60,
          priority_filter: configMap.alerts_priority_filter || 'all'
        });
      }
    } catch (error) {
      console.error('Error loading alert config:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('ashen_debug_alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ashen_error_logs'
        },
        (payload) => {
          const errorData = payload.new;
          showAlert({
            id: errorData.id,
            event_type: 'error_detected',
            title: 'New Error Detected',
            message: `${errorData.error_type}: ${errorData.error_message}`,
            component_path: errorData.component_path,
            severity: errorData.severity,
            timestamp: errorData.created_at,
            metadata: errorData.metadata
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ashen_auto_healing_history'
        },
        (payload) => {
          const healData = payload.new;
          const eventType = healData.fix_applied ? 'fix_applied' : 'heal_failed';
          const title = healData.fix_applied ? 'Auto-Fix Applied' : 'Auto-Heal Failed';
          
          showAlert({
            id: healData.id,
            event_type: eventType,
            title,
            message: `${healData.fix_method}: ${healData.fix_description || 'Auto-healing operation'}`,
            severity: healData.fix_applied ? 'medium' : 'high',
            timestamp: healData.created_at,
            metadata: { confidence: healData.fix_confidence }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const showAlert = (alert: AlertEvent) => {
    // Check if alerts are enabled
    if (!config.enabled) return;

    // Check if silenced
    if (silencedUntil && Date.now() < silencedUntil) return;

    // Check priority filter
    if (config.priority_filter === 'high_only' && alert.severity !== 'high') return;

    // Play sound if enabled
    if (config.sound_enabled) {
      playNotificationSound();
    }

    // Add to notifications
    const notification: AlertNotification = {
      ...alert,
      acknowledged: false,
      dismissed: false,
      show_time: Date.now()
    };

    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep max 5 notifications
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.wav');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Fallback: system beep
        if (window.navigator && 'vibrate' in window.navigator) {
          window.navigator.vibrate(200);
        }
      });
    } catch (error) {
      console.log('Audio notification not available');
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === alertId ? { ...n, acknowledged: true, dismissed: true } : n)
    );
  };

  const dismissAlert = (alertId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === alertId ? { ...n, dismissed: true } : n)
    );
  };

  const silenceAlerts = () => {
    const silenceUntil = Date.now() + (config.silence_duration * 60 * 1000);
    setSilencedUntil(silenceUntil);
    toast.success(`Alerts silenced for ${config.silence_duration} minutes`);
  };

  const viewDetails = (alert: AlertNotification) => {
    // Navigate to appropriate diagnostics tab
    const tab = alert.event_type === 'error_detected' ? 'error-dashboard' : 'healing-history';
    window.location.hash = `#ashen-debug?tab=${tab}`;
    acknowledgeAlert(alert.id);
  };

  const updateConfig = async (key: keyof AlertConfig, value: any) => {
    const configKey = `alerts_${key}`;
    
    try {
      // Store as JSON string
      const jsonValue = JSON.stringify(value);
      
      await supabase
        .from('ashen_monitoring_config')
        .upsert({
          config_key: configKey,
          config_value: jsonValue,
          updated_at: new Date().toISOString()
        });

      setConfig(prev => ({ ...prev, [key]: value }));
      toast.success('Alert settings updated');
    } catch (error) {
      console.error('Error updating config:', error);
      toast.error('Failed to update settings');
    }
  };

  const getAlertIcon = (eventType: string, severity: string) => {
    switch (eventType) {
      case 'error_detected':
        return severity === 'high' ? 
          <XCircle className="h-5 w-5 text-red-500" /> : 
          <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'fix_proposed':
        return <Eye className="h-5 w-5 text-blue-500" />;
      case 'fix_applied':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'heal_failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Brain className="h-5 w-5 text-primary" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950';
      case 'medium': return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950';
      case 'low': return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950';
      default: return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const activeNotifications = notifications.filter(n => !n.dismissed);

  return (
    <div className="space-y-6">
      {/* Alert Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Debug Alert Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Enable Real-Time Alerts</label>
              <Switch
                checked={config.enabled}
                onCheckedChange={(value) => updateConfig('enabled', value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center space-x-2">
                {config.sound_enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span>Sound Notification</span>
              </label>
              <Switch
                checked={config.sound_enabled}
                onCheckedChange={(value) => updateConfig('sound_enabled', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Silence Duration</label>
              <Select 
                value={config.silence_duration.toString()} 
                onValueChange={(value) => updateConfig('silence_duration', parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 mins</SelectItem>
                  <SelectItem value="15">15 mins</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Alert Priority Filter</label>
              <Select 
                value={config.priority_filter} 
                onValueChange={(value) => updateConfig('priority_filter', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="high_only">High Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-4 pt-4 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={silenceAlerts}
              disabled={!config.enabled}
              className="flex items-center space-x-2"
            >
              <Clock className="h-4 w-4" />
              <span>Silence for {config.silence_duration}m</span>
            </Button>
            
            {silencedUntil && Date.now() < silencedUntil && (
              <Badge variant="secondary">
                Silenced until {new Date(silencedUntil).toLocaleTimeString()}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Floating Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
        {activeNotifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "animate-fade-in rounded-lg border p-4 shadow-lg backdrop-blur-sm",
              getSeverityColor(notification.severity)
            )}
          >
            <div className="flex items-start justify-between space-x-3">
              <div className="flex items-start space-x-3 flex-1">
                {getAlertIcon(notification.event_type, notification.severity)}
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">
                      New System Event – Ashen Debug Core
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissAlert(notification.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-foreground font-medium">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                    {notification.component_path && (
                      <p className="text-xs text-muted-foreground">
                        Component: {notification.component_path}
                      </p>
                    )}
                    {notification.route && (
                      <p className="text-xs text-muted-foreground">
                        Route: {notification.route}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(notification.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => viewDetails(notification)}
                className="flex items-center space-x-1"
              >
                <Eye className="h-3 w-3" />
                <span>View Details</span>
              </Button>
              <Button
                size="sm"
                onClick={() => acknowledgeAlert(notification.id)}
                className="flex items-center space-x-1"
              >
                <CheckCircle className="h-3 w-3" />
                <span>Acknowledge</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}