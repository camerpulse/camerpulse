import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  CreditCard, 
  AlertCircle, 
  Building2,
  FileText,
  Bell,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AppLayout } from '@/components/Layout/AppLayout';

interface Claim {
  id: string;
  institution_type: string;
  institution_id: string;
  institution_name: string;
  claim_type: string;
  claim_reason: string;
  status: string;
  payment_status: string;
  payment_amount: number;
  payment_currency: string;
  created_at: string;
  updated_at: string;
  admin_notes?: string;
}

interface ClaimNotification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const STATUS_COLORS = {
  pending: 'default',
  payment_pending: 'warning',
  under_review: 'secondary',
  approved: 'success',
  rejected: 'destructive'
};

const STATUS_ICONS = {
  pending: Clock,
  payment_pending: CreditCard,
  under_review: Eye,
  approved: CheckCircle,
  rejected: XCircle
};

const INSTITUTION_ICONS = {
  school: '🏫',
  hospital: '🏥',
  pharmacy: '💊'
};

export default function ClaimsDashboard() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [notifications, setNotifications] = useState<ClaimNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('claims');
  const { toast } = useToast();

  useEffect(() => {
    fetchClaims();
    fetchNotifications();
  }, []);

  const fetchClaims = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('institution_claims')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClaims(data || []);
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast({
        title: "Error",
        description: "Failed to load claims",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('claim_notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('claim_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency || 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const StatusIcon = STATUS_ICONS[status as keyof typeof STATUS_ICONS] || Clock;
    const variant = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'default';
    
    return (
      <Badge variant={variant as any} className="flex items-center gap-1">
        <StatusIcon className="h-3 w-3" />
        <span className="capitalize">{status.replace('_', ' ')}</span>
      </Badge>
    );
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.is_read).length;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Claims Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your institution claims and track their status
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="claims" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              My Claims ({claims.length})
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications ({getUnreadCount()})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="claims" className="space-y-6">
            {claims.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Claims Yet</h3>
                  <p className="text-muted-foreground">
                    You haven't submitted any institution claims. Find an institution and click "Claim" to get started.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {claims.map((claim) => (
                  <Card key={claim.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {INSTITUTION_ICONS[claim.institution_type as keyof typeof INSTITUTION_ICONS]}
                          </span>
                          <div>
                            <CardTitle className="text-lg leading-tight">
                              {claim.institution_name}
                            </CardTitle>
                            <CardDescription className="capitalize">
                              {claim.institution_type} • {claim.claim_type}
                            </CardDescription>
                          </div>
                        </div>
                        {getStatusBadge(claim.status)}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="text-sm">
                        <p className="text-muted-foreground mb-1">Reason:</p>
                        <p className="line-clamp-2">{claim.claim_reason}</p>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Fee:</span>
                          <p className="font-medium">
                            {formatAmount(claim.payment_amount, claim.payment_currency)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Payment:</span>
                          <Badge 
                            variant={claim.payment_status === 'completed' ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {claim.payment_status}
                          </Badge>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        <p>Submitted: {formatDate(claim.created_at)}</p>
                        {claim.updated_at !== claim.created_at && (
                          <p>Updated: {formatDate(claim.updated_at)}</p>
                        )}
                      </div>

                      {claim.admin_notes && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            <strong>Admin Notes:</strong> {claim.admin_notes}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <FileText className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        {claim.status === 'payment_pending' && (
                          <Button size="sm" className="flex-1">
                            Complete Payment
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Notifications
                </CardTitle>
                <CardDescription>
                  Stay updated on your claim status and important updates
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      No notifications yet
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                            !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                          }`}
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm mb-1">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(notification.created_at)}
                              </p>
                            </div>
                            {!notification.is_read && (
                              <div className="h-2 w-2 bg-blue-500 rounded-full mt-1 ml-2"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}