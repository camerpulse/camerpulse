import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Bell,
  BellRing,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  Building2,
  Home,
  Settings,
  Mail,
  MessageSquare,
  Smartphone,
  X,
  Check
} from 'lucide-react';

interface ReputationAlert {
  id: string;
  type: 'score_change' | 'threshold_breach' | 'flag_raised' | 'trending';
  severity: 'low' | 'medium' | 'high' | 'critical';
  entityType: string;
  entityId: string;
  entityName: string;
  title: string;
  message: string;
  oldScore?: number;
  newScore?: number;
  threshold?: number;
  createdAt: string;
  isRead: boolean;
  actionUrl?: string;
}

interface NotificationSettings {
  scoreChanges: boolean;
  thresholdBreaches: boolean;
  flaggedEntities: boolean;
  trendingChanges: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  minimumSeverity: 'low' | 'medium' | 'high' | 'critical';
  regions: string[];
}

export function CivicReputationAlerts() {
  const [alerts, setAlerts] = useState<ReputationAlert[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    scoreChanges: true,
    thresholdBreaches: true,
    flaggedEntities: true,
    trendingChanges: false,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    minimumSeverity: 'medium',
    regions: []
  });
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchAlerts();
    setupRealtimeSubscription();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    
    // Mock data - replace with actual API calls
    const mockAlerts: ReputationAlert[] = [
      {
        id: '1',
        type: 'score_change',
        severity: 'high',
        entityType: 'politician',
        entityId: 'pol-1',
        entityName: 'Hon. John Tamfu',
        title: 'Significant Score Increase',
        message: 'Score increased from 75 to 82 due to successful healthcare initiative',
        oldScore: 75,
        newScore: 82,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        isRead: false,
        actionUrl: '/reputation/pol-1'
      },
      {
        id: '2',
        type: 'threshold_breach',
        severity: 'critical',
        entityType: 'village',
        entityId: 'vil-1',
        entityName: 'Kumbo',
        title: 'Score Below Critical Threshold',
        message: 'Reputation score dropped below 30, requiring immediate attention',
        newScore: 28,
        threshold: 30,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        isRead: false,
        actionUrl: '/reputation/vil-1'
      },
      {
        id: '3',
        type: 'flag_raised',
        severity: 'medium',
        entityType: 'ministry',
        entityId: 'min-1',
        entityName: 'Ministry of Health',
        title: 'New Flag Reported',
        message: 'Data quality issue flagged by citizen user',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        isRead: true,
        actionUrl: '/admin/reputation'
      },
      {
        id: '4',
        type: 'trending',
        severity: 'low',
        entityType: 'politician',
        entityId: 'pol-2',
        entityName: 'MP Victoria Besong',
        title: 'Trending Upward',
        message: 'Consistent positive trend over the past week',
        oldScore: 68,
        newScore: 74,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        isRead: true,
        actionUrl: '/reputation/pol-2'
      }
    ];

    setAlerts(mockAlerts);
    setLoading(false);
  };

  const setupRealtimeSubscription = () => {
    // Setup real-time subscription for new alerts
    const channel = supabase
      .channel('reputation-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'civic_reputation_history'
        },
        (payload) => {
          handleNewScoreChange(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleNewScoreChange = (change: any) => {
    const scoreDifference = change.new_score - change.old_score;
    
    // Only create alert if significant change or breach
    if (Math.abs(scoreDifference) >= 10 || change.new_score <= 30) {
      const newAlert: ReputationAlert = {
        id: Date.now().toString(),
        type: change.new_score <= 30 ? 'threshold_breach' : 'score_change',
        severity: change.new_score <= 30 ? 'critical' : Math.abs(scoreDifference) >= 15 ? 'high' : 'medium',
        entityType: change.entity_type,
        entityId: change.entity_id,
        entityName: change.entity_name,
        title: change.new_score <= 30 ? 'Critical Score Alert' : 'Significant Score Change',
        message: change.new_score <= 30 
          ? `Score dropped to ${change.new_score}, below critical threshold`
          : `Score ${scoreDifference > 0 ? 'increased' : 'decreased'} by ${Math.abs(scoreDifference)} points`,
        oldScore: change.old_score,
        newScore: change.new_score,
        threshold: change.new_score <= 30 ? 30 : undefined,
        createdAt: new Date().toISOString(),
        isRead: false,
        actionUrl: `/reputation/${change.entity_id}`
      };

      setAlerts(prev => [newAlert, ...prev]);
      
      // Show toast notification
      toast({
        title: newAlert.title,
        description: `${newAlert.entityName}: ${newAlert.message}`,
        duration: 5000
      });
    }
  };

  const markAsRead = async (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    );
  };

  const markAllAsRead = async () => {
    setAlerts(prev => 
      prev.map(alert => ({ ...alert, isRead: true }))
    );
  };

  const dismissAlert = async (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    toast({
      title: "Settings Updated",
      description: "Notification preferences have been saved",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-destructive border-destructive bg-destructive/10';
      case 'high': return 'text-orange-600 border-orange-600 bg-orange-50';
      case 'medium': return 'text-warning border-warning bg-warning/10';
      case 'low': return 'text-muted-foreground border-muted-foreground bg-muted/10';
      default: return 'text-muted-foreground border-muted-foreground bg-muted/10';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'score_change': return TrendingUp;
      case 'threshold_breach': return AlertTriangle;
      case 'flag_raised': return AlertTriangle;
      case 'trending': return TrendingUp;
      default: return Bell;
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'politician': return Users;
      case 'ministry': return Building2;
      case 'village': return Home;
      default: return Users;
    }
  };

  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5" />
              Reputation Alerts
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} new
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  <Check className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Alert Types</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Score Changes</span>
                    <p className="text-sm text-muted-foreground">Significant score increases/decreases</p>
                  </div>
                  <Switch 
                    checked={settings.scoreChanges}
                    onCheckedChange={(checked) => updateSettings({ scoreChanges: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Threshold Breaches</span>
                    <p className="text-sm text-muted-foreground">When scores cross critical thresholds</p>
                  </div>
                  <Switch 
                    checked={settings.thresholdBreaches}
                    onCheckedChange={(checked) => updateSettings({ thresholdBreaches: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Flagged Entities</span>
                    <p className="text-sm text-muted-foreground">When new flags are reported</p>
                  </div>
                  <Switch 
                    checked={settings.flaggedEntities}
                    onCheckedChange={(checked) => updateSettings({ flaggedEntities: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Trending Changes</span>
                    <p className="text-sm text-muted-foreground">Weekly trend notifications</p>
                  </div>
                  <Switch 
                    checked={settings.trendingChanges}
                    onCheckedChange={(checked) => updateSettings({ trendingChanges: checked })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Delivery Preferences</h4>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="font-medium">Email Notifications</span>
                  </div>
                  <Switch 
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSettings({ emailNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <span className="font-medium">SMS Notifications</span>
                  </div>
                  <Switch 
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => updateSettings({ smsNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span className="font-medium">Push Notifications</span>
                  </div>
                  <Switch 
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => updateSettings({ pushNotifications: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-medium">Minimum Severity</label>
                  <Select 
                    value={settings.minimumSeverity} 
                    onValueChange={(value: any) => updateSettings({ minimumSeverity: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No alerts at this time</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          alerts.map((alert) => {
            const AlertIcon = getAlertIcon(alert.type);
            const EntityIcon = getEntityIcon(alert.entityType);
            
            return (
              <Card key={alert.id} className={`transition-all ${!alert.isRead ? 'ring-1 ring-primary/20' : ''}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                        <AlertIcon className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-semibold ${!alert.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {alert.title}
                          </h4>
                          <Badge variant="outline">{alert.entityType}</Badge>
                          <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          {!alert.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <EntityIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{alert.entityName}</span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                        
                        {(alert.oldScore && alert.newScore) && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Score:</span>
                            <span>{alert.oldScore}</span>
                            <span>→</span>
                            <span className="font-medium">{alert.newScore}</span>
                            <span className={`text-sm ${alert.newScore > alert.oldScore ? 'text-success' : 'text-destructive'}`}>
                              ({alert.newScore > alert.oldScore ? '+' : ''}{alert.newScore - alert.oldScore})
                            </span>
                          </div>
                        )}
                        
                        <div className="text-xs text-muted-foreground mt-2">
                          {new Date(alert.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {alert.actionUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={alert.actionUrl}>
                            View Details
                          </a>
                        </Button>
                      )}
                      {!alert.isRead && (
                        <Button variant="outline" size="sm" onClick={() => markAsRead(alert.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => dismissAlert(alert.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}