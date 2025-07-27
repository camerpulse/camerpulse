import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Settings,
  Zap,
  Star,
  Crown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionData {
  id: string;
  plan_type: string;
  status: string;
  amount: number;
  currency: string;
  interval: string;
  features: string[];
  stripe_subscription_id: string;
  stripe_data?: {
    current_period_start: Date;
    current_period_end: Date;
    status: string;
    cancel_at_period_end: boolean;
  };
}

interface PlanOption {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  popular?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const planOptions: PlanOption[] = [
  {
    id: 'vendor_basic',
    name: 'Basic',
    price: 20,
    interval: 'month',
    description: 'Perfect for small vendors getting started',
    icon: Zap,
    features: [
      'Up to 50 products',
      'Basic analytics',
      'Standard support',
      'Basic marketing tools'
    ]
  },
  {
    id: 'vendor_premium',
    name: 'Premium',
    price: 50,
    interval: 'month',
    description: 'Great for growing businesses',
    icon: Star,
    popular: true,
    features: [
      'Unlimited products',
      'Advanced analytics',
      'Priority support',
      'Advanced marketing tools',
      'Custom branding',
      'API access'
    ]
  },
  {
    id: 'vendor_enterprise',
    name: 'Enterprise',
    price: 100,
    interval: 'month',
    description: 'For large-scale operations',
    icon: Crown,
    features: [
      'Everything in Premium',
      'Custom integrations',
      'Dedicated account manager',
      'White-label options',
      'Advanced reporting',
      'Custom features'
    ]
  }
];

export const SubscriptionManager: React.FC = () => {
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCurrentSubscription();
  }, []);

  const loadCurrentSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: { action: 'get_subscription' }
      });

      if (error) throw error;
      
      setCurrentSubscription(data.subscription);
    } catch (error) {
      console.error('Error loading subscription:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscription = async (planType: string) => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { planType }
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to create subscription",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription?.stripe_subscription_id) return;

    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: { 
          action: 'cancel_subscription',
          subscriptionId: currentSubscription.stripe_subscription_id
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: data.message,
      });

      loadCurrentSubscription();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!currentSubscription?.stripe_subscription_id) return;

    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: { 
          action: 'reactivate_subscription',
          subscriptionId: currentSubscription.stripe_subscription_id
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: data.message,
      });

      loadCurrentSubscription();
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to reactivate subscription",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCustomerPortal = async () => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: { action: 'customer_portal' }
      });

      if (error) throw error;

      if (data.portal_url) {
        window.open(data.portal_url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open customer portal",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">Loading subscription information...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Subscription Management</h2>
          <p className="text-muted-foreground">Manage your vendor subscription plan</p>
        </div>
        {currentSubscription && (
          <Button 
            onClick={handleCustomerPortal}
            disabled={actionLoading}
            variant="outline"
          >
            <Settings className="h-4 w-4 mr-2" />
            Manage Billing
          </Button>
        )}
      </div>

      <Tabs defaultValue={currentSubscription ? "current" : "plans"} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">Current Plan</TabsTrigger>
          <TabsTrigger value="plans">Available Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {currentSubscription ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      {currentSubscription.plan_type.replace('vendor_', '').toUpperCase()} Plan
                    </CardTitle>
                    <CardDescription>
                      Your current subscription details
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={currentSubscription.status === 'active' ? 'default' : 'secondary'}
                  >
                    {currentSubscription.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-medium">
                        ${currentSubscription.amount / 100}/{currentSubscription.interval}
                      </p>
                    </div>
                  </div>
                  
                  {currentSubscription.stripe_data && (
                    <>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Current Period</p>
                          <p className="font-medium">
                            {new Date(currentSubscription.stripe_data.current_period_end).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {currentSubscription.stripe_data.cancel_at_period_end ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <p className="font-medium">
                            {currentSubscription.stripe_data.cancel_at_period_end 
                              ? 'Cancelling' 
                              : 'Active'
                            }
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Plan Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {currentSubscription.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  {currentSubscription.stripe_data?.cancel_at_period_end ? (
                    <Button 
                      onClick={handleReactivateSubscription}
                      disabled={actionLoading}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reactivate Subscription
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleCancelSubscription}
                      disabled={actionLoading}
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
                <p className="text-muted-foreground mb-4">
                  Subscribe to a plan to start selling on our marketplace
                </p>
                <Button onClick={() => document.querySelector('[value="plans"]')?.click()}>
                  View Plans
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {planOptions.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = currentSubscription?.plan_type === plan.id;
              
              return (
                <Card key={plan.id} className={`relative ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="text-3xl font-bold">
                      ${plan.price}
                      <span className="text-sm font-normal text-muted-foreground">/{plan.interval}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      className="w-full"
                      onClick={() => handleCreateSubscription(plan.id)}
                      disabled={actionLoading || isCurrentPlan}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {isCurrentPlan ? 'Current Plan' : `Choose ${plan.name}`}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};