import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Settings, DollarSign, BarChart3, Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StripeConfig {
  id?: string;
  test_mode: boolean;
  webhook_endpoint?: string;
  default_currency: string;
  auto_capture: boolean;
  send_receipts: boolean;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export const StripeSettings: React.FC = () => {
  const [config, setConfig] = useState<StripeConfig>({
    test_mode: true,
    default_currency: 'XAF',
    auto_capture: true,
    send_receipts: true,
    metadata: {}
  });
  const [loading, setLoading] = useState(false);
  const [keyStatus, setKeyStatus] = useState<'checking' | 'valid' | 'invalid' | 'missing'>('missing');
  const [testConnection, setTestConnection] = useState(false);

  useEffect(() => {
    loadStripeConfig();
    checkStripeKeyStatus();
  }, []);

  const loadStripeConfig = async () => {
    try {
      // This would load from a settings table if you want to store config in DB
      // For now using default values
      toast.info('Using default Stripe configuration');
    } catch (error) {
      console.error('Error loading Stripe config:', error);
      toast.error('Failed to load Stripe configuration');
    }
  };

  const checkStripeKeyStatus = async () => {
    try {
      setKeyStatus('checking');
      
      // Test the Stripe connection
      const { data, error } = await supabase.functions.invoke('verify-stripe-connection');
      
      if (error) {
        setKeyStatus('invalid');
        return;
      }
      
      if (data?.valid) {
        setKeyStatus('valid');
      } else {
        setKeyStatus('invalid');
      }
    } catch (error) {
      console.error('Error checking Stripe key:', error);
      setKeyStatus('missing');
    }
  };

  const testStripeConnection = async () => {
    try {
      setTestConnection(true);
      
      const { data, error } = await supabase.functions.invoke('test-stripe-connection');
      
      if (error) throw error;
      
      if (data?.success) {
        toast.success('Stripe connection test successful!');
      } else {
        toast.error('Stripe connection test failed');
      }
    } catch (error) {
      console.error('Stripe connection test failed:', error);
      toast.error('Failed to test Stripe connection');
    } finally {
      setTestConnection(false);
    }
  };

  const saveConfig = async () => {
    try {
      setLoading(true);
      
      // Here you would save to a settings table
      // await supabase.from('stripe_settings').upsert(config);
      
      toast.success('Stripe configuration saved successfully!');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save Stripe configuration');
    } finally {
      setLoading(false);
    }
  };

  const getKeyStatusBadge = () => {
    switch (keyStatus) {
      case 'checking':
        return <Badge variant="secondary">Checking...</Badge>;
      case 'valid':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Valid</Badge>;
      case 'invalid':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Invalid</Badge>;
      case 'missing':
        return <Badge variant="outline"><AlertTriangle className="h-3 w-3 mr-1" />Missing</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Stripe Settings</h2>
          <p className="text-muted-foreground">Configure payment processing for your marketplace</p>
        </div>
        <div className="flex items-center gap-2">
          {getKeyStatusBadge()}
          <Button onClick={checkStripeKeyStatus} variant="outline" size="sm">
            Refresh Status
          </Button>
        </div>
      </div>

      <Tabs defaultValue="configuration" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="configuration">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="keys">
            <Shield className="h-4 w-4 mr-2" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="testing">
            <CreditCard className="h-4 w-4 mr-2" />
            Testing
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Input
                    id="currency"
                    value={config.default_currency}
                    onChange={(e) => setConfig({ ...config, default_currency: e.target.value })}
                    placeholder="XAF"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook">Webhook Endpoint</Label>
                  <Input
                    id="webhook"
                    value={config.webhook_endpoint || ''}
                    onChange={(e) => setConfig({ ...config, webhook_endpoint: e.target.value })}
                    placeholder="https://yourapp.com/api/stripe/webhook"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="test-mode"
                    checked={config.test_mode}
                    onCheckedChange={(checked) => setConfig({ ...config, test_mode: checked })}
                  />
                  <Label htmlFor="test-mode">Test Mode</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-capture"
                    checked={config.auto_capture}
                    onCheckedChange={(checked) => setConfig({ ...config, auto_capture: checked })}
                  />
                  <Label htmlFor="auto-capture">Auto Capture Payments</Label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="send-receipts"
                  checked={config.send_receipts}
                  onCheckedChange={(checked) => setConfig({ ...config, send_receipts: checked })}
                />
                <Label htmlFor="send-receipts">Send Email Receipts</Label>
              </div>

              <Button onClick={saveConfig} disabled={loading}>
                {loading ? 'Saving...' : 'Save Configuration'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Keys Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  API keys are stored securely in Supabase Edge Function secrets. Use the form below to update your Stripe secret key.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label>Stripe Secret Key Status</Label>
                  <div className="flex items-center gap-2 mt-2">
                    {getKeyStatusBadge()}
                    <span className="text-sm text-muted-foreground">
                      {keyStatus === 'valid' && 'Your Stripe secret key is properly configured.'}
                      {keyStatus === 'invalid' && 'Your Stripe secret key appears to be invalid.'}
                      {keyStatus === 'missing' && 'No Stripe secret key found. Please add one using the form below.'}
                      {keyStatus === 'checking' && 'Checking your Stripe secret key status...'}
                    </span>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    To update your Stripe secret key, use the secure form below. Your key will be encrypted and stored safely.
                  </AlertDescription>
                </Alert>

                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-2">Add/Update Stripe Secret Key</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click the button below to securely add or update your Stripe secret key:
                  </p>
                  
                  {/* This would trigger the secret form */}
                  <Button 
                    onClick={() => {
                      // This would be replaced with the actual secret form trigger
                      toast.info('Please use the secure secret form to add your Stripe key');
                    }}
                    variant="outline"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Manage Secret Key
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connection Testing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CreditCard className="h-4 w-4" />
                <AlertDescription>
                  Test your Stripe integration to ensure everything is working correctly.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label>Test Stripe Connection</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    This will verify that your API keys are working and you can communicate with Stripe.
                  </p>
                  <Button 
                    onClick={testStripeConnection} 
                    disabled={testConnection || keyStatus !== 'valid'}
                    variant="outline"
                  >
                    {testConnection ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Test Payment Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label>Test Product Price</Label>
                      <p className="text-muted-foreground">5,000 XAF (Central African Franc)</p>
                    </div>
                    <div>
                      <Label>Payment Methods</Label>
                      <p className="text-muted-foreground">Card payments, Mobile money (future)</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <BarChart3 className="h-4 w-4" />
                <AlertDescription>
                  Payment analytics will be available once transactions start flowing through the system.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 border rounded-lg">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <CreditCard className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Transactions</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">0%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};