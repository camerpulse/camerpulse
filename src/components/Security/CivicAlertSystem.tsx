import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertTriangle, 
  Shield, 
  Eye, 
  Bell, 
  X,
  CheckCircle,
  Clock,
  Users,
  MapPin,
  TrendingUp
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CivicAlert {
  id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affected_regions: string[];
  sentiment_data: any;
  acknowledged: boolean;
  acknowledged_at?: string;
  acknowledged_by?: string;
  created_at: string;
  auto_generated: boolean;
}

interface AlertPopupProps {
  alert: CivicAlert;
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge: (alertId: string) => void;
}

const AlertPopup: React.FC<AlertPopupProps> = ({ alert, isOpen, onClose, onAcknowledge }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-6 w-6" />;
      case 'high': return <Shield className="h-6 w-6" />;
      case 'medium': return <Eye className="h-6 w-6" />;
      default: return <Bell className="h-6 w-6" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getSeverityIcon(alert.severity)}
            <span className="text-lg font-bold">CIVIC ALERT</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge className={getSeverityColor(alert.severity)}>
              {alert.severity.toUpperCase()}
            </Badge>
            <Badge variant="outline">
              {alert.alert_type}
            </Badge>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">{alert.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>
          </div>

          {alert.affected_regions && alert.affected_regions.length > 0 && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Affected Regions:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {alert.affected_regions.map((region, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {region}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {alert.sentiment_data && (
            <div className="border rounded-lg p-3 bg-muted/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">Sentiment Analysis</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Score:</span>
                  <span className="ml-1 font-mono">
                    {alert.sentiment_data.sentiment_score?.toFixed(2) || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Emotions:</span>
                  <span className="ml-1">
                    {alert.sentiment_data.emotions?.slice(0, 2).join(', ') || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {new Date(alert.created_at).toLocaleString()}
            </span>
            {alert.auto_generated && (
              <Badge variant="outline" className="text-xs">
                Auto-generated
              </Badge>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => onAcknowledge(alert.id)}
              className="flex-1"
              variant="default"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Acknowledge Alert
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const CivicAlertSystem: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<CivicAlert[]>([]);
  const [activeAlert, setActiveAlert] = useState<CivicAlert | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserRole();
      fetchAlerts();
      setupRealTimeAlerts();
    }
  }, [user]);

  const fetchUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .single();
      
      if (data) {
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('camerpulse_intelligence_alerts')
        .select('*')
        .eq('acknowledged', false)
        .in('severity', ['high', 'critical'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const mappedAlerts: CivicAlert[] = (data || []).map(alert => ({
        id: alert.id,
        alert_type: alert.alert_type,
        severity: alert.severity as 'low' | 'medium' | 'high' | 'critical',
        title: alert.title,
        description: alert.description || '',
        affected_regions: alert.affected_regions || [],
        sentiment_data: alert.sentiment_data,
        acknowledged: alert.acknowledged || false,
        acknowledged_at: alert.acknowledged_at,
        acknowledged_by: alert.acknowledged_by,
        created_at: alert.created_at,
        auto_generated: alert.auto_generated || false
      }));

      setAlerts(mappedAlerts);

      // Show popup for the most critical unacknowledged alert
      const criticalAlert = mappedAlerts.find(alert => 
        alert.severity === 'critical' && !alert.acknowledged
      );
      
      if (criticalAlert && (userRole === 'admin' || userRole === 'moderator')) {
        setActiveAlert(criticalAlert);
        setShowPopup(true);
      }

    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const setupRealTimeAlerts = () => {
    const channel = supabase
      .channel('civic-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'camerpulse_intelligence_alerts',
          filter: `severity=in.(high,critical)`
        },
        (payload) => {
          console.log('New critical alert received:', payload);
          
          const newAlert: CivicAlert = {
            id: payload.new.id,
            alert_type: payload.new.alert_type,
            severity: payload.new.severity,
            title: payload.new.title,
            description: payload.new.description || '',
            affected_regions: payload.new.affected_regions || [],
            sentiment_data: payload.new.sentiment_data,
            acknowledged: false,
            created_at: payload.new.created_at,
            auto_generated: payload.new.auto_generated || false
          };

          setAlerts(prev => [newAlert, ...prev]);

          // Show popup for admins/moderators
          if ((userRole === 'admin' || userRole === 'moderator') && newAlert.severity === 'critical') {
            setActiveAlert(newAlert);
            setShowPopup(true);
            
            // Also show toast notification
            toast({
              title: "🚨 CRITICAL CIVIC ALERT",
              description: newAlert.title,
              variant: "destructive"
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('camerpulse_intelligence_alerts')
        .update({
          acknowledged: true,
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: user?.id
        })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      setShowPopup(false);
      setActiveAlert(null);

      toast({
        title: "Alert Acknowledged",
        description: "The alert has been marked as reviewed."
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

  // Auto-trigger alerts when sentiment score > 70 (negative)
  useEffect(() => {
    const checkSentimentThreshold = async () => {
      try {
        const { data, error } = await supabase
          .from('camerpulse_intelligence_sentiment_logs')
          .select('*')
          .lt('sentiment_score', -0.7) // Highly negative sentiment
          .eq('threat_level', 'high')
          .is('processed_at', null)
          .limit(5);

        if (error) throw error;

        for (const log of data || []) {
          // Create civic danger alert
          const alertData = {
            alert_type: 'civic_danger',
            severity: 'high',
            title: `High Threat Detected: ${log.region_detected || 'Unknown Region'}`,
            description: `Dangerous sentiment detected in ${log.platform} content. Score: ${log.sentiment_score?.toFixed(2)}`,
            affected_regions: log.region_detected ? [log.region_detected] : [],
            sentiment_data: {
              sentiment_score: log.sentiment_score,
              emotions: log.emotional_tone,
              categories: log.content_category
            },
            auto_generated: true
          };

          await supabase
            .from('camerpulse_intelligence_alerts')
            .insert(alertData);

          // Mark as processed
          await supabase
            .from('camerpulse_intelligence_sentiment_logs')
            .update({ processed_at: new Date().toISOString() })
            .eq('id', log.id);
        }
      } catch (error) {
        console.error('Error checking sentiment threshold:', error);
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkSentimentThreshold, 30000);
    
    // Initial check
    checkSentimentThreshold();

    return () => clearInterval(interval);
  }, []);

  if (!user || (userRole !== 'admin' && userRole !== 'moderator')) {
    return null;
  }

  return (
    <>
      {/* Alert Badge in Header */}
      {alerts.length > 0 && (
        <div className="fixed top-4 right-4 z-50">
          <Card className="bg-red-500 text-white shadow-lg">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-semibold">
                  {alerts.length} Active Alert{alerts.length !== 1 ? 's' : ''}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alert Popup */}
      {activeAlert && (
        <AlertPopup
          alert={activeAlert}
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
          onAcknowledge={acknowledgeAlert}
        />
      )}

      {/* Alert Management Panel */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Civic Alert System
            {alerts.length > 0 && (
              <Badge variant="destructive">
                {alerts.length} Active
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            {alerts.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No active civic alerts</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <Card key={alert.id} className="border-l-4 border-red-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              className={
                                alert.severity === 'critical' ? 'bg-red-500 text-white' :
                                alert.severity === 'high' ? 'bg-orange-500 text-white' :
                                'bg-yellow-500 text-black'
                              }
                            >
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {alert.alert_type}
                            </span>
                          </div>
                          <h4 className="font-semibold mb-1">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {alert.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(alert.created_at).toLocaleString()}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="ml-4"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Acknowledge
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  );
};