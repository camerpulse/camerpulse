import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Shield, Eye, Settings, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FraudSettings {
  id: string;
  poll_id: string;
  enable_rate_limiting: boolean;
  max_votes_per_ip: number;
  max_votes_per_session: number;
  enable_captcha: boolean;
  enable_fingerprinting: boolean;
  alert_threshold: number;
}

interface FraudAlert {
  id: string;
  alert_type: string;
  alert_severity: string;
  alert_message: string;
  vote_count: number | null;
  time_window: string | null;
  detected_at: string;
  acknowledged: boolean;
}

interface PollFraudProtectionEngineProps {
  pollId: string;
  isCreator: boolean;
}

export const PollFraudProtectionEngine = ({ pollId, isCreator }: PollFraudProtectionEngineProps) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<FraudSettings | null>(null);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFraudData();
  }, [pollId]);

  const fetchFraudData = async () => {
    try {
      setLoading(true);

      // Fetch fraud settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('poll_fraud_settings')
        .select('*')
        .eq('poll_id', pollId)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      if (settingsData) {
        setSettings(settingsData);
      }

      // Fetch fraud alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('poll_fraud_alerts')
        .select('*')
        .eq('poll_id', pollId)
        .order('detected_at', { ascending: false });

      if (alertsError) throw alertsError;
      setAlerts(alertsData || []);

    } catch (error) {
      console.error('Error fetching fraud data:', error);
      toast({
        title: "Error",
        description: "Failed to load fraud protection data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<FraudSettings>) => {
    if (!settings) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('poll_fraud_settings')
        .update(newSettings)
        .eq('id', settings.id);

      if (error) throw error;

      setSettings({ ...settings, ...newSettings });
      toast({
        title: "Settings updated",
        description: "Fraud protection settings have been saved"
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('poll_fraud_alerts')
        .update({ 
          acknowledged: true,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(alerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      ));

      toast({
        title: "Alert acknowledged",
        description: "Fraud alert has been marked as reviewed"
      });
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast({
        title: "Error",
        description: "Failed to acknowledge alert",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isCreator) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardContent className="p-6 text-center">
          <Shield className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-emerald-800 mb-2">Fraud Protection Active</h3>
          <p className="text-emerald-700">
            This poll is protected by CamerPulse's anti-fraud system to ensure voting integrity.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fraud Protection Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Fraud Protection Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {settings && (
            <>
              {/* Rate Limiting */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Rate Limiting</Label>
                    <p className="text-sm text-muted-foreground">
                      Prevent vote spamming by limiting votes per IP and session
                    </p>
                  </div>
                  <Switch
                    checked={settings.enable_rate_limiting}
                    onCheckedChange={(checked) => updateSettings({ enable_rate_limiting: checked })}
                    disabled={saving}
                  />
                </div>

                {settings.enable_rate_limiting && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-primary/20">
                    <div className="space-y-2">
                      <Label htmlFor="max-votes-ip">Max votes per IP</Label>
                      <Input
                        id="max-votes-ip"
                        type="number"
                        min="1"
                        max="10"
                        value={settings.max_votes_per_ip}
                        onChange={(e) => updateSettings({ max_votes_per_ip: parseInt(e.target.value) || 1 })}
                        disabled={saving}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-votes-session">Max votes per session</Label>
                      <Input
                        id="max-votes-session"
                        type="number"
                        min="1"
                        max="10"
                        value={settings.max_votes_per_session}
                        onChange={(e) => updateSettings({ max_votes_per_session: parseInt(e.target.value) || 1 })}
                        disabled={saving}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Device Fingerprinting */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Device Fingerprinting</Label>
                  <p className="text-sm text-muted-foreground">
                    Track unique device characteristics to detect duplicate voting
                  </p>
                </div>
                <Switch
                  checked={settings.enable_fingerprinting}
                  onCheckedChange={(checked) => updateSettings({ enable_fingerprinting: checked })}
                  disabled={saving}
                />
              </div>

              {/* CAPTCHA Protection */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">CAPTCHA Challenge</Label>
                  <p className="text-sm text-muted-foreground">
                    Require human verification before voting
                  </p>
                </div>
                <Switch
                  checked={settings.enable_captcha}
                  onCheckedChange={(checked) => updateSettings({ enable_captcha: checked })}
                  disabled={saving}
                />
              </div>

              {/* Alert Threshold */}
              <div className="space-y-2">
                <Label htmlFor="alert-threshold">Spike Alert Threshold</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="alert-threshold"
                    type="number"
                    min="10"
                    max="1000"
                    value={settings.alert_threshold}
                    onChange={(e) => updateSettings({ alert_threshold: parseInt(e.target.value) || 50 })}
                    disabled={saving}
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">votes per 2 minutes</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get alerted when voting activity exceeds this threshold
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Fraud Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Fraud Alerts
            {alerts.filter(a => !a.acknowledged).length > 0 && (
              <Badge variant="destructive">
                {alerts.filter(a => !a.acknowledged).length} new
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No fraud alerts detected</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${
                    alert.acknowledged 
                      ? 'bg-muted/50 border-muted' 
                      : alert.alert_severity === 'high'
                      ? 'bg-destructive/10 border-destructive/20'
                      : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          variant={
                            alert.alert_severity === 'high' 
                              ? 'destructive' 
                              : alert.alert_severity === 'medium'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {alert.alert_type.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(alert.detected_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-1">{alert.alert_message}</p>
                      {alert.vote_count && alert.time_window && (
                        <p className="text-xs text-muted-foreground">
                          {alert.vote_count} votes in {alert.time_window}
                        </p>
                      )}
                    </div>
                    {!alert.acknowledged && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Voting Activity Monitor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Voting Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Detailed voting logs and patterns analysis coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
};