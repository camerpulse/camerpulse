import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Smartphone, 
  Palette, 
  Globe, 
  Shield,
  Key,
  Bell,
  DollarSign,
  Banknote,
  CreditCard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentGatewayConfig {
  id: string;
  gateway_name: string;
  is_active: boolean;
  is_primary: boolean;
  supported_currencies: string[];
  configuration: {
    public_key?: string;
    secret_key?: string;
    webhook_url?: string;
    encryption_key?: string;
  };
  test_mode: boolean;
}

export const PaymentGatewayAdmin = () => {
  const { toast } = useToast();
  const [selectedGateway, setSelectedGateway] = useState<string>('flutterwave');
  const [isLoading, setIsLoading] = useState(false);

  // Mock payment gateway configurations
  const [paymentGateways, setPaymentGateways] = useState<PaymentGatewayConfig[]>([
    {
      id: '1',
      gateway_name: 'flutterwave',
      is_active: false,
      is_primary: true,
      supported_currencies: ['FCFA', 'USD', 'EUR', 'GBP', 'CAD'],
      configuration: {
        public_key: '',
        secret_key: '',
        webhook_url: '',
        encryption_key: ''
      },
      test_mode: true
    },
    {
      id: '2',
      gateway_name: 'stripe',
      is_active: false,
      is_primary: false,
      supported_currencies: ['USD', 'EUR', 'GBP', 'CAD'],
      configuration: {
        public_key: '',
        secret_key: '',
        webhook_url: ''
      },
      test_mode: true
    },
    {
      id: '3',
      gateway_name: 'paypal',
      is_active: false,
      is_primary: false,
      supported_currencies: ['USD', 'EUR', 'GBP', 'CAD'],
      configuration: {
        public_key: '',
        secret_key: ''
      },
      test_mode: true
    }
  ]);

  const [formData, setFormData] = useState<any>({});

  const currentGateway = paymentGateways.find(g => g.gateway_name === selectedGateway);

  const handleConfigUpdate = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setPaymentGateways(prev => 
        prev.map(gateway => 
          gateway.gateway_name === selectedGateway
            ? { ...gateway, configuration: { ...gateway.configuration, ...formData } }
            : gateway
        )
      );

      toast({
        title: "Configuration Updated",
        description: `${selectedGateway} payment gateway configuration has been saved.`,
      });
      
      setIsLoading(false);
    }, 1000);
  };

  const handleActivateGateway = (gatewayName: string) => {
    setPaymentGateways(prev =>
      prev.map(gateway => ({
        ...gateway,
        is_active: gateway.gateway_name === gatewayName ? !gateway.is_active : gateway.is_active
      }))
    );

    toast({
      title: "Gateway Status Updated",
      description: `${gatewayName} has been ${currentGateway?.is_active ? 'deactivated' : 'activated'}.`,
    });
  };

  const handleSetPrimary = (gatewayName: string) => {
    setPaymentGateways(prev =>
      prev.map(gateway => ({
        ...gateway,
        is_primary: gateway.gateway_name === gatewayName
      }))
    );

    toast({
      title: "Primary Gateway Set",
      description: `${gatewayName} is now the primary payment gateway.`,
    });
  };

  const handleTestConnection = async (gatewayName: string) => {
    setIsLoading(true);
    
    // Simulate API test
    setTimeout(() => {
      toast({
        title: "Connection Test",
        description: `${gatewayName} connection test ${Math.random() > 0.5 ? 'successful' : 'failed'}.`,
        variant: Math.random() > 0.5 ? "default" : "destructive"
      });
      setIsLoading(false);
    }, 2000);
  };

  const getGatewayIcon = (gatewayName: string) => {
    switch (gatewayName) {
      case 'flutterwave': return Banknote;
      case 'stripe': return CreditCard;
      case 'paypal': return DollarSign;
      default: return CreditCard;
    }
  };

  const getGatewayColor = (gatewayName: string) => {
    switch (gatewayName) {
      case 'flutterwave': return 'bg-orange-100 text-orange-800';
      case 'stripe': return 'bg-purple-100 text-purple-800';
      case 'paypal': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Payment Gateway Administration</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Configure and manage payment gateways for the diaspora platform
        </p>
      </div>

      {/* Gateway Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {paymentGateways.map((gateway) => {
          const Icon = getGatewayIcon(gateway.gateway_name);
          return (
            <Card 
              key={gateway.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedGateway === gateway.gateway_name ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedGateway(gateway.gateway_name)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getGatewayColor(gateway.gateway_name)}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg capitalize">{gateway.gateway_name}</CardTitle>
                      <div className="flex gap-1 mt-1">
                        {gateway.is_active && (
                          <Badge variant="outline" className="text-green-600">Active</Badge>
                        )}
                        {gateway.is_primary && (
                          <Badge variant="outline" className="text-blue-600">Primary</Badge>
                        )}
                        {gateway.test_mode && (
                          <Badge variant="outline" className="text-yellow-600">Test Mode</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Supported Currencies:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {gateway.supported_currencies.map((currency) => (
                        <Badge key={currency} variant="secondary" className="text-xs">
                          {currency}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      variant={gateway.is_active ? "destructive" : "default"}
                      onClick={() => handleActivateGateway(gateway.gateway_name)}
                      className="flex-1"
                    >
                      {gateway.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    {!gateway.is_primary && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleSetPrimary(gateway.gateway_name)}
                      >
                        Set Primary
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Configuration Panel */}
      {currentGateway && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configure {currentGateway.gateway_name.charAt(0).toUpperCase() + currentGateway.gateway_name.slice(1)}
            </CardTitle>
            <CardDescription>
              Set up API keys and configuration for {currentGateway.gateway_name} payment processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Flutterwave Configuration */}
            {selectedGateway === 'flutterwave' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Public Key</label>
                    <Input
                      placeholder="FLWPUBK_TEST-..."
                      value={formData.public_key || currentGateway.configuration.public_key}
                      onChange={(e) => setFormData({...formData, public_key: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your Flutterwave public key (starts with FLWPUBK_)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Secret Key</label>
                    <Input
                      type="password"
                      placeholder="FLWSECK_TEST-..."
                      value={formData.secret_key || currentGateway.configuration.secret_key}
                      onChange={(e) => setFormData({...formData, secret_key: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your Flutterwave secret key (starts with FLWSECK_)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Webhook URL</label>
                    <Input
                      placeholder="https://yoursite.com/webhooks/flutterwave"
                      value={formData.webhook_url || currentGateway.configuration.webhook_url}
                      onChange={(e) => setFormData({...formData, webhook_url: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">
                      URL to receive payment notifications
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Encryption Key</label>
                    <Input
                      type="password"
                      placeholder="FLWSECK_TEST..."
                      value={formData.encryption_key || currentGateway.configuration.encryption_key}
                      onChange={(e) => setFormData({...formData, encryption_key: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Hash key for webhook verification
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Stripe Configuration */}
            {selectedGateway === 'stripe' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Publishable Key</label>
                    <Input
                      placeholder="pk_test_..."
                      value={formData.public_key || currentGateway.configuration.public_key}
                      onChange={(e) => setFormData({...formData, public_key: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your Stripe publishable key (starts with pk_)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Secret Key</label>
                    <Input
                      type="password"
                      placeholder="sk_test_..."
                      value={formData.secret_key || currentGateway.configuration.secret_key}
                      onChange={(e) => setFormData({...formData, secret_key: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your Stripe secret key (starts with sk_)
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Webhook Endpoint Secret</label>
                  <Input
                    type="password"
                    placeholder="whsec_..."
                    value={formData.webhook_url || currentGateway.configuration.webhook_url}
                    onChange={(e) => setFormData({...formData, webhook_url: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Webhook endpoint secret for signature verification
                  </p>
                </div>
              </div>
            )}

            {/* PayPal Configuration */}
            {selectedGateway === 'paypal' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Client ID</label>
                    <Input
                      placeholder="AeA1QIZXiflr-..."
                      value={formData.public_key || currentGateway.configuration.public_key}
                      onChange={(e) => setFormData({...formData, public_key: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your PayPal application client ID
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Client Secret</label>
                    <Input
                      type="password"
                      placeholder="ELrHQeYjp5..."
                      value={formData.secret_key || currentGateway.configuration.secret_key}
                      onChange={(e) => setFormData({...formData, secret_key: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your PayPal application client secret
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Test Mode Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Test Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Use sandbox/test environment for payments
                </p>
              </div>
              <Switch
                checked={currentGateway.test_mode}
                onCheckedChange={(checked) => {
                  setPaymentGateways(prev =>
                    prev.map(gateway =>
                      gateway.gateway_name === selectedGateway
                        ? { ...gateway, test_mode: checked }
                        : gateway
                    )
                  );
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleConfigUpdate}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Key className="h-4 w-4" />
                {isLoading ? 'Saving...' : 'Save Configuration'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => handleTestConnection(selectedGateway)}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                {isLoading ? 'Testing...' : 'Test Connection'}
              </Button>
            </div>

            {/* Help Section */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Configuration Help</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                {selectedGateway === 'flutterwave' && (
                  <>
                    <p>• Get your API keys from the <a href="https://app.flutterwave.com/dashboard/settings/apis" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Flutterwave Dashboard</a></p>
                    <p>• Set up webhooks to receive real-time payment notifications</p>
                    <p>• Use test keys for development and live keys for production</p>
                  </>
                )}
                {selectedGateway === 'stripe' && (
                  <>
                    <p>• Get your API keys from the <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe Dashboard</a></p>
                    <p>• Configure webhooks to handle payment events</p>
                    <p>• Test with Stripe's test card numbers</p>
                  </>
                )}
                {selectedGateway === 'paypal' && (
                  <>
                    <p>• Create an application in <a href="https://developer.paypal.com/developer/applications/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">PayPal Developer</a></p>
                    <p>• Use sandbox credentials for testing</p>
                    <p>• Configure IPN (Instant Payment Notification) for callbacks</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};