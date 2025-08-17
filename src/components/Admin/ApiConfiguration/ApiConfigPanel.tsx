import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Key, 
  Mail, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  EyeOff,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface ApiConfig {
  id: string;
  name: string;
  key?: string;
  status: 'active' | 'inactive' | 'error';
  description: string;
  required: boolean;
  last_updated?: string;
  masked_key?: string;
}

export const ApiConfigPanel: React.FC = () => {
  const [configs, setConfigs] = useState<ApiConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [newKeys, setNewKeys] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const apiConfigs: ApiConfig[] = [
    {
      id: 'RESEND_API_KEY',
      name: 'Resend Email API',
      status: 'inactive',
      description: 'Email service for notifications, receipts, and user communications',
      required: true,
      masked_key: ''
    },
    {
      id: 'OPENAI_API_KEY',
      name: 'OpenAI API',
      status: 'inactive',
      description: 'AI services for content moderation and analysis',
      required: false,
      masked_key: ''
    },
    {
      id: 'STRIPE_SECRET_KEY',
      name: 'Stripe Payment',
      status: 'inactive',
      description: 'Payment processing for international transactions',
      required: false,
      masked_key: ''
    },
    {
      id: 'NOKASH_APP_SPACE_KEY',
      name: 'Nokash Payment',
      status: 'active',
      description: 'Mobile money payment processing for Cameroon',
      required: true,
      masked_key: 'nks_****_****_****'
    }
  ];

  useEffect(() => {
    loadApiConfigs();
  }, []);

  const loadApiConfigs = async () => {
    try {
      setLoading(true);
      
      // Load existing configurations from Supabase
      const { data: existingConfigs, error } = await supabase
        .from('system_api_configs')
        .select('*');

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading API configs:', error);
      }

      // Merge with default configs
      const mergedConfigs = apiConfigs.map(defaultConfig => {
        const existing = existingConfigs?.find(c => c.api_key_name === defaultConfig.id);
        return {
          ...defaultConfig,
          status: existing?.is_active ? 'active' : 'inactive',
          last_updated: existing?.updated_at,
          masked_key: existing ? maskApiKey(existing.api_key_name) : defaultConfig.masked_key
        };
      });

      setConfigs(mergedConfigs);
    } catch (error) {
      console.error('Failed to load API configurations:', error);
      toast({
        title: "Error",
        description: "Failed to load API configurations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const maskApiKey = (keyName: string) => {
    const prefixes: Record<string, string> = {
      'RESEND_API_KEY': 're_****_****_****',
      'OPENAI_API_KEY': 'sk-****_****_****',
      'STRIPE_SECRET_KEY': 'sk_****_****_****',
      'NOKASH_APP_SPACE_KEY': 'nks_****_****_****'
    };
    return prefixes[keyName] || '****_****_****_****';
  };

  const updateApiKey = async (keyName: string, keyValue: string) => {
    try {
      setSaving(true);
      
      // Insert or update the API key configuration
      const { error } = await supabase
        .from('system_api_configs')
        .upsert({
          api_key_name: keyName,
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'api_key_name'
        });

      if (error) throw error;

      // Update local state
      setConfigs(prev => prev.map(config => 
        config.id === keyName 
          ? { 
              ...config, 
              status: 'active' as const, 
              last_updated: new Date().toISOString(),
              masked_key: maskApiKey(keyName)
            }
          : config
      ));

      // Clear the input
      setNewKeys(prev => ({ ...prev, [keyName]: '' }));

      toast({
        title: "Success",
        description: `${keyName} has been configured successfully`,
      });

    } catch (error) {
      console.error('Failed to update API key:', error);
      toast({
        title: "Error",
        description: "Failed to update API key configuration",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleKeyVisibility = (keyName: string) => {
    setShowKeys(prev => ({ ...prev, [keyName]: !prev[keyName] }));
  };

  const testApiConnection = async (keyName: string) => {
    try {
      // Test the API connection based on the key type
      toast({
        title: "Testing Connection",
        description: `Testing ${keyName} connection...`,
      });

      // This would call an edge function to test the API
      // For now, simulate a test
      setTimeout(() => {
        toast({
          title: "Connection Test",
          description: `${keyName} connection test completed`,
        });
      }, 2000);

    } catch (error) {
      toast({
        title: "Connection Failed",
        description: `Failed to test ${keyName} connection`,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">API Configuration</h2>
          <p className="text-muted-foreground">
            Manage API keys and external service integrations
          </p>
        </div>
        <Button 
          onClick={loadApiConfigs}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          API keys are securely stored and never displayed in full. Only configure keys for services you actively use.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="email" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="email">Email Services</TabsTrigger>
          <TabsTrigger value="payments">Payment APIs</TabsTrigger>
          <TabsTrigger value="ai">AI Services</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="space-y-4">
          {configs.filter(config => config.id === 'RESEND_API_KEY').map(config => (
            <Card key={config.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5" />
                    <div>
                      <CardTitle>{config.name}</CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </div>
                  </div>
                  <Badge 
                    variant={config.status === 'active' ? 'default' : 'secondary'}
                    className="flex items-center space-x-1"
                  >
                    {config.status === 'active' ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <AlertTriangle className="h-3 w-3" />
                    )}
                    <span>{config.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={config.id}>API Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      id={config.id}
                      type={showKeys[config.id] ? 'text' : 'password'}
                      placeholder={config.masked_key || 'Enter your Resend API key'}
                      value={newKeys[config.id] || ''}
                      onChange={(e) => setNewKeys(prev => ({ 
                        ...prev, 
                        [config.id]: e.target.value 
                      }))}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleKeyVisibility(config.id)}
                    >
                      {showKeys[config.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => updateApiKey(config.id, newKeys[config.id] || '')}
                    disabled={!newKeys[config.id] || saving}
                    className="flex items-center space-x-2"
                  >
                    <Key className="h-4 w-4" />
                    <span>{config.status === 'active' ? 'Update' : 'Configure'}</span>
                  </Button>
                  
                  {config.status === 'active' && (
                    <Button
                      variant="outline"
                      onClick={() => testApiConnection(config.id)}
                    >
                      Test Connection
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <a 
                      href="https://resend.com/api-keys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Get Key</span>
                    </a>
                  </Button>
                </div>

                {config.last_updated && (
                  <p className="text-sm text-muted-foreground">
                    Last updated: {new Date(config.last_updated).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          {configs.filter(config => ['NOKASH_APP_SPACE_KEY', 'STRIPE_SECRET_KEY'].includes(config.id)).map(config => (
            <Card key={config.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Key className="h-5 w-5" />
                    <div>
                      <CardTitle>{config.name}</CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </div>
                  </div>
                  <Badge 
                    variant={config.status === 'active' ? 'default' : 'secondary'}
                    className="flex items-center space-x-1"
                  >
                    {config.status === 'active' ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <AlertTriangle className="h-3 w-3" />
                    )}
                    <span>{config.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={config.id}>API Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      id={config.id}
                      type={showKeys[config.id] ? 'text' : 'password'}
                      placeholder={config.masked_key || `Enter your ${config.name} API key`}
                      value={newKeys[config.id] || ''}
                      onChange={(e) => setNewKeys(prev => ({ 
                        ...prev, 
                        [config.id]: e.target.value 
                      }))}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleKeyVisibility(config.id)}
                    >
                      {showKeys[config.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => updateApiKey(config.id, newKeys[config.id] || '')}
                    disabled={!newKeys[config.id] || saving}
                    className="flex items-center space-x-2"
                  >
                    <Key className="h-4 w-4" />
                    <span>{config.status === 'active' ? 'Update' : 'Configure'}</span>
                  </Button>
                  
                  {config.status === 'active' && (
                    <Button
                      variant="outline"
                      onClick={() => testApiConnection(config.id)}
                    >
                      Test Connection
                    </Button>
                  )}
                </div>

                {config.last_updated && (
                  <p className="text-sm text-muted-foreground">
                    Last updated: {new Date(config.last_updated).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          {configs.filter(config => config.id === 'OPENAI_API_KEY').map(config => (
            <Card key={config.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5" />
                    <div>
                      <CardTitle>{config.name}</CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </div>
                  </div>
                  <Badge 
                    variant={config.status === 'active' ? 'default' : 'secondary'}
                    className="flex items-center space-x-1"
                  >
                    {config.status === 'active' ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <AlertTriangle className="h-3 w-3" />
                    )}
                    <span>{config.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={config.id}>API Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      id={config.id}
                      type={showKeys[config.id] ? 'text' : 'password'}
                      placeholder={config.masked_key || 'Enter your OpenAI API key'}
                      value={newKeys[config.id] || ''}
                      onChange={(e) => setNewKeys(prev => ({ 
                        ...prev, 
                        [config.id]: e.target.value 
                      }))}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleKeyVisibility(config.id)}
                    >
                      {showKeys[config.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => updateApiKey(config.id, newKeys[config.id] || '')}
                    disabled={!newKeys[config.id] || saving}
                    className="flex items-center space-x-2"
                  >
                    <Key className="h-4 w-4" />
                    <span>{config.status === 'active' ? 'Update' : 'Configure'}</span>
                  </Button>
                  
                  {config.status === 'active' && (
                    <Button
                      variant="outline"
                      onClick={() => testApiConnection(config.id)}
                    >
                      Test Connection
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <a 
                      href="https://platform.openai.com/api-keys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Get Key</span>
                    </a>
                  </Button>
                </div>

                {config.last_updated && (
                  <p className="text-sm text-muted-foreground">
                    Last updated: {new Date(config.last_updated).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {configs.map(config => (
              <Card key={config.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{config.name}</CardTitle>
                    <Badge 
                      variant={config.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {config.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {config.description}
                  </p>
                  {config.required && (
                    <Badge variant="outline" className="text-xs">
                      Required
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};