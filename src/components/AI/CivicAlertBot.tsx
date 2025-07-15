import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bot, 
  Send, 
  MessageCircle, 
  Radio, 
  Settings, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Volume2,
  Eye,
  Activity,
  Loader2,
  Zap,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AlertBotConfig {
  enabled: boolean;
  telegram_enabled: boolean;
  whatsapp_enabled: boolean;
  telegram_bot_token: string;
  telegram_admin_chat_id: string;
  telegram_public_chat_id: string;
  whatsapp_admin_groups: string[];
  alert_frequency: 'immediate' | 'hourly' | 'daily';
  danger_threshold: number;
  digest_schedule: string;
  voice_alerts_enabled: boolean;
  message_templates: {
    danger_alert: string;
    mood_shift: string;
    disinformation: string;
    unrest_prediction: string;
  };
}

interface BroadcastLog {
  id: string;
  platform: string;
  message_type: string;
  recipient_count: number;
  success_count: number;
  failure_count: number;
  created_at: string;
  alert_id?: string;
}

interface ActiveAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  affected_regions: string[];
  created_at: string;
  broadcast_status: 'pending' | 'sent' | 'failed';
}

export const CivicAlertBot = () => {
  const { toast } = useToast();
  
  // Configuration state
  const [config, setConfig] = useState<AlertBotConfig>({
    enabled: false,
    telegram_enabled: false,
    whatsapp_enabled: false,
    telegram_bot_token: '',
    telegram_admin_chat_id: '',
    telegram_public_chat_id: '',
    whatsapp_admin_groups: [],
    alert_frequency: 'immediate',
    danger_threshold: 65,
    digest_schedule: '08:00',
    voice_alerts_enabled: false,
    message_templates: {
      danger_alert: `🚨 Civic Alert – {region}
📊 Civic Danger: {danger_score}/100 ({severity})
😡 Emotion: {emotion}
📈 Topic: {topic}
🕒 Time: {timestamp}
🔗 View Dashboard: {dashboard_url}`,
      mood_shift: `📈 Mood Shift Alert – {region}
⚡ Change: {from_emotion} → {to_emotion}
📊 Severity: {severity}
🕒 Detected: {timestamp}
🔗 Details: {dashboard_url}`,
      disinformation: `⚠️ Disinformation Alert
🎯 Target: {topic}
📈 Spread Rate: {spread_rate}
🌐 Platforms: {platforms}
🔗 Monitor: {dashboard_url}`,
      unrest_prediction: `🔮 Unrest Prediction – {region}
📊 Risk Level: {risk_level}/100
⏰ Timeframe: {timeframe}
🎯 Triggers: {triggers}
🔗 Analysis: {dashboard_url}`
    }
  });
  
  const [broadcastHistory, setBroadcastHistory] = useState<BroadcastLog[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [botStatus, setBotStatus] = useState({
    telegram: { connected: false, bot_username: '' },
    whatsapp: { connected: false, phone_number: '' }
  });

  useEffect(() => {
    loadBotConfig();
    loadBroadcastHistory();
    loadActiveAlerts();
    checkBotStatus();
  }, []);

  const loadBotConfig = async () => {
    try {
      const { data } = await supabase
        .from('camerpulse_intelligence_config')
        .select('config_value')
        .eq('config_key', 'alert_bot_config')
        .single();
      
      if (data?.config_value) {
        const savedConfig = data.config_value as Record<string, any>;
        setConfig({ ...config, ...savedConfig });
      }
    } catch (error) {
      console.error('Error loading bot config:', error);
    }
  };

  const saveBotConfig = async () => {
    try {
      const { error } = await supabase
        .from('camerpulse_intelligence_config')
        .upsert({
          config_key: 'alert_bot_config',
          config_type: 'system',
          config_value: config as any,
          description: 'Civic Alert Bot Configuration'
        });

      if (error) throw error;

      toast({
        title: "Configuration Saved",
        description: "Alert bot settings have been updated successfully"
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Save Failed",
        description: "Could not save bot configuration",
        variant: "destructive"
      });
    }
  };

  const loadBroadcastHistory = async () => {
    try {
      const { data } = await supabase
        .from('camerpulse_intelligence_config')
        .select('config_value')
        .eq('config_key', 'alert_bot_broadcast_logs')
        .single();
      
      if (data?.config_value) {
        const broadcastData = data.config_value as any;
        if (broadcastData.broadcasts) {
          setBroadcastHistory(broadcastData.broadcasts);
        }
      }
    } catch (error) {
      console.error('Error loading broadcast history:', error);
    }
  };

  const loadActiveAlerts = async () => {
    try {
      const { data } = await supabase
        .from('camerpulse_intelligence_alerts')
        .select('*')
        .eq('acknowledged', false)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data) {
        const alertsWithStatus = data.map(alert => ({
          id: alert.id,
          alert_type: alert.alert_type,
          severity: alert.severity,
          title: alert.title,
          description: alert.description || '',
          affected_regions: alert.affected_regions || [],
          created_at: alert.created_at,
          broadcast_status: 'pending' as const
        }));
        setActiveAlerts(alertsWithStatus);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkBotStatus = async () => {
    try {
      const response = await supabase.functions.invoke('civic-alert-bot', {
        body: { action: 'status' }
      });

      if (response.data) {
        setBotStatus(response.data);
      }
    } catch (error) {
      console.error('Error checking bot status:', error);
    }
  };

  const testBotConnection = async (platform: 'telegram' | 'whatsapp') => {
    setIsTesting(true);
    try {
      const response = await supabase.functions.invoke('civic-alert-bot', {
        body: { 
          action: 'test_connection',
          platform,
          config: platform === 'telegram' ? {
            bot_token: config.telegram_bot_token,
            chat_id: config.telegram_admin_chat_id
          } : {
            admin_groups: config.whatsapp_admin_groups
          }
        }
      });

      if (response.data?.success) {
        toast({
          title: "Connection Successful",
          description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} bot is working correctly`
        });
      } else {
        throw new Error(response.data?.error || 'Connection failed');
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${platform}: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const broadcastAlert = async (alertId: string) => {
    try {
      const alert = activeAlerts.find(a => a.id === alertId);
      if (!alert) return;

      const response = await supabase.functions.invoke('civic-alert-bot', {
        body: { 
          action: 'broadcast_alert',
          alert_id: alertId,
          config
        }
      });

      if (response.data?.success) {
        // Update alert status
        setActiveAlerts(prev => 
          prev.map(a => 
            a.id === alertId 
              ? { ...a, broadcast_status: 'sent' as const }
              : a
          )
        );

        toast({
          title: "Alert Broadcasted",
          description: `Alert sent to ${response.data.recipient_count} recipients`
        });

        loadBroadcastHistory();
      } else {
        throw new Error(response.data?.error || 'Broadcast failed');
      }
    } catch (error) {
      toast({
        title: "Broadcast Failed",
        description: `Could not send alert: ${error.message}`,
        variant: "destructive"
      });

      setActiveAlerts(prev => 
        prev.map(a => 
          a.id === alertId 
            ? { ...a, broadcast_status: 'failed' as const }
            : a
        )
      );
    }
  };

  const sendDailyDigest = async () => {
    try {
      const response = await supabase.functions.invoke('civic-alert-bot', {
        body: { 
          action: 'send_digest',
          config
        }
      });

      if (response.data?.success) {
        toast({
          title: "Digest Sent",
          description: "Daily civic digest has been broadcasted"
        });
        loadBroadcastHistory();
      } else {
        throw new Error(response.data?.error || 'Digest failed');
      }
    } catch (error) {
      toast({
        title: "Digest Failed",
        description: `Could not send digest: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-red-400';
      case 'medium': return 'bg-yellow-400';
      case 'low': return 'bg-blue-400';
      default: return 'bg-gray-400';
    }
  };

  const getBroadcastStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span>Civic Alert Bot System</span>
            {config.enabled && (
              <Badge variant="default" className="ml-auto">
                <Activity className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Automated civic intelligence alerts via Telegram and WhatsApp for administrators, journalists, and citizen groups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Bot Status</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.enabled}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked }))}
                />
                <span className="text-sm">{config.enabled ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Danger Threshold</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={config.danger_threshold}
                  onChange={(e) => setConfig(prev => ({ ...prev, danger_threshold: parseInt(e.target.value) }))}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Alert Frequency</Label>
              <Select 
                value={config.alert_frequency} 
                onValueChange={(value: 'immediate' | 'hourly' | 'daily') => 
                  setConfig(prev => ({ ...prev, alert_frequency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="hourly">Hourly Summary</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 flex space-x-2">
            <Button onClick={saveBotConfig}>
              <Settings className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
            <Button onClick={sendDailyDigest} variant="outline">
              <Send className="h-4 w-4 mr-2" />
              Send Daily Digest
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="platforms" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="platforms">Platform Setup</TabsTrigger>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="templates">Message Templates</TabsTrigger>
          <TabsTrigger value="history">Broadcast History</TabsTrigger>
        </TabsList>

        {/* Platform Configuration */}
        <TabsContent value="platforms" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Telegram Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="h-5 w-5" />
                  <span>Telegram Bot</span>
                  {botStatus.telegram.connected && (
                    <Badge variant="default">Connected</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Enable Telegram Alerts</Label>
                  <Switch
                    checked={config.telegram_enabled}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, telegram_enabled: checked }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Bot Token</Label>
                  <Input
                    type="password"
                    placeholder="Enter Telegram bot token"
                    value={config.telegram_bot_token}
                    onChange={(e) => setConfig(prev => ({ ...prev, telegram_bot_token: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Admin Chat ID</Label>
                  <Input
                    placeholder="Enter admin chat ID"
                    value={config.telegram_admin_chat_id}
                    onChange={(e) => setConfig(prev => ({ ...prev, telegram_admin_chat_id: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Public Chat ID (Optional)</Label>
                  <Input
                    placeholder="Enter public chat ID"
                    value={config.telegram_public_chat_id}
                    onChange={(e) => setConfig(prev => ({ ...prev, telegram_public_chat_id: e.target.value }))}
                  />
                </div>
                
                {botStatus.telegram.bot_username && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Connected as @{botStatus.telegram.bot_username}
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  onClick={() => testBotConnection('telegram')} 
                  disabled={isTesting || !config.telegram_bot_token}
                  className="w-full"
                >
                  {isTesting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
                  Test Connection
                </Button>
              </CardContent>
            </Card>

            {/* WhatsApp Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>WhatsApp Bot</span>
                  {botStatus.whatsapp.connected && (
                    <Badge variant="default">Connected</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Enable WhatsApp Alerts</Label>
                  <Switch
                    checked={config.whatsapp_enabled}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, whatsapp_enabled: checked }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Admin Group IDs</Label>
                  <Textarea
                    placeholder="Enter WhatsApp group IDs (one per line)"
                    value={config.whatsapp_admin_groups.join('\n')}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      whatsapp_admin_groups: e.target.value.split('\n').filter(id => id.trim()) 
                    }))}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Voice Alerts</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.voice_alerts_enabled}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, voice_alerts_enabled: checked }))}
                    />
                    <Volume2 className="h-4 w-4" />
                    <span className="text-sm">Send voice messages via CivicVoiceAgent</span>
                  </div>
                </div>
                
                {botStatus.whatsapp.phone_number && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Connected to phone: {botStatus.whatsapp.phone_number}
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  onClick={() => testBotConnection('whatsapp')} 
                  disabled={isTesting || config.whatsapp_admin_groups.length === 0}
                  className="w-full"
                >
                  {isTesting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
                  Test Connection
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Active Alerts */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Alerts</CardTitle>
              <CardDescription>
                Recent civic alerts awaiting broadcast or acknowledgment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : activeAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No Active Alerts</p>
                  <p className="text-muted-foreground">All civic systems are stable</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeAlerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{alert.alert_type}</Badge>
                            {getBroadcastStatusIcon(alert.broadcast_status)}
                          </div>
                          
                          <h4 className="font-medium">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {alert.description}
                          </p>
                          
                          <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                            <span>
                              <Clock className="h-3 w-3 inline mr-1" />
                              {new Date(alert.created_at).toLocaleString()}
                            </span>
                            {alert.affected_regions.length > 0 && (
                              <span>
                                <Users className="h-3 w-3 inline mr-1" />
                                {alert.affected_regions.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          {alert.broadcast_status === 'pending' && config.enabled && (
                            <Button
                              size="sm"
                              onClick={() => broadcastAlert(alert.id)}
                            >
                              <Radio className="h-4 w-4 mr-1" />
                              Broadcast
                            </Button>
                          )}
                          
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Message Templates */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(config.message_templates).map(([key, template]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="capitalize">
                    {key.replace('_', ' ')} Template
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={template}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      message_templates: {
                        ...prev.message_templates,
                        [key]: e.target.value
                      }
                    }))}
                    rows={6}
                    placeholder="Enter message template..."
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Available variables: {'{region}'}, {'{severity}'}, {'{timestamp}'}, {'{dashboard_url}'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Broadcast History */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Broadcast History</CardTitle>
              <CardDescription>
                Recent alert broadcasts and delivery statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {broadcastHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Radio className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No Broadcast History</p>
                  <p className="text-muted-foreground">Broadcast logs will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {broadcastHistory.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{log.platform}</Badge>
                          <Badge variant="secondary">{log.message_type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {log.success_count}/{log.recipient_count} delivered
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {log.failure_count} failed
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};