import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Smartphone, Wallet, DollarSign, Settings, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentProvider {
  id: string;
  provider: string;
  is_enabled: boolean;
  config_data: any;
  commission_percentage: number;
  currency: string;
  test_mode: boolean;
}

const providerIcons = {
  stripe: CreditCard,
  mtn_momo: Smartphone,
  orange_money: Smartphone,
  paypal: Wallet,
  crypto_bitcoin: DollarSign,
  crypto_usdt: DollarSign,
};

const providerNames = {
  stripe: 'Stripe',
  mtn_momo: 'MTN Mobile Money',
  orange_money: 'Orange Money',
  paypal: 'PayPal',
  crypto_bitcoin: 'Bitcoin',
  crypto_usdt: 'USDT (Tron)',
};

export const PaymentConfigPanel = () => {
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPaymentConfig();
  }, []);

  const loadPaymentConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_config')
        .select('*')
        .order('provider');

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error loading payment config:', error);
      toast({
        title: "Error",
        description: "Failed to load payment configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProvider = async (providerId: string, updates: Partial<PaymentProvider>) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('payment_config')
        .update(updates)
        .eq('id', providerId);

      if (error) throw error;

      setProviders(prev => prev.map(p => 
        p.id === providerId ? { ...p, ...updates } : p
      ));

      toast({
        title: "Success",
        description: "Payment configuration updated",
      });
    } catch (error) {
      console.error('Error updating payment config:', error);
      toast({
        title: "Error",
        description: "Failed to update payment configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleProvider = (providerId: string, enabled: boolean) => {
    updateProvider(providerId, { is_enabled: enabled });
  };

  const updateCommission = (providerId: string, commission: number) => {
    updateProvider(providerId, { commission_percentage: commission });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Payment Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading payment configuration...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Payment Configuration
        </CardTitle>
        <CardDescription>
          Configure payment providers for event ticketing. Integration setup required for each provider.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {providers.map((provider) => {
                const Icon = providerIcons[provider.provider as keyof typeof providerIcons];
                return (
                  <Card key={provider.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">
                            {providerNames[provider.provider as keyof typeof providerNames]}
                          </span>
                        </div>
                        <Badge variant={provider.is_enabled ? "default" : "secondary"}>
                          {provider.is_enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        Commission: {provider.commission_percentage}%
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="providers" className="space-y-4">
            {providers.map((provider) => {
              const Icon = providerIcons[provider.provider as keyof typeof providerIcons];
              return (
                <Card key={provider.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        <CardTitle className="text-lg">
                          {providerNames[provider.provider as keyof typeof providerNames]}
                        </CardTitle>
                      </div>
                      <Switch
                        checked={provider.is_enabled}
                        onCheckedChange={(checked) => toggleProvider(provider.id, checked)}
                        disabled={saving}
                      />
                    </div>
                    <CardDescription>
                      {provider.provider === 'stripe' && 'Credit card payments via Stripe'}
                      {provider.provider === 'mtn_momo' && 'MTN Mobile Money payments'}
                      {provider.provider === 'orange_money' && 'Orange Money payments'}
                      {provider.provider === 'paypal' && 'PayPal payments'}
                      {provider.provider === 'crypto_bitcoin' && 'Bitcoin cryptocurrency payments'}
                      {provider.provider === 'crypto_usdt' && 'USDT (Tron) cryptocurrency payments'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`commission-${provider.id}`}>Commission (%)</Label>
                        <Input
                          id={`commission-${provider.id}`}
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={provider.commission_percentage}
                          onChange={(e) => updateCommission(provider.id, parseFloat(e.target.value) || 0)}
                          disabled={saving}
                        />
                      </div>
                      <div>
                        <Label>Status</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={provider.is_enabled ? "default" : "secondary"}>
                            {provider.is_enabled ? "Enabled" : "Disabled"}
                          </Badge>
                          <Badge variant={provider.test_mode ? "outline" : "default"}>
                            {provider.test_mode ? "Test Mode" : "Live Mode"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Integration Required</h4>
                      <p className="text-sm text-muted-foreground">
                        This payment provider requires API keys and configuration to be set up.
                        Contact the development team to complete the integration.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Global Payment Settings</CardTitle>
                <CardDescription>
                  Configure global settings for all payment providers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <Input value="XAF (Central African CFA franc)" disabled />
                </div>
                
                <div className="space-y-2">
                  <Label>Payment Processing</Label>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">
                      • Automatic refunds: Not configured
                    </p>
                    <p className="text-sm">
                      • Payment verification: Enabled
                    </p>
                    <p className="text-sm">
                      • Fraud detection: Pending setup
                    </p>
                  </div>
                </div>

                <Button disabled className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Global Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};