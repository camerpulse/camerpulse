import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  DollarSign, 
  Settings, 
  Save, 
  Plus, 
  Edit, 
  Trash2,
  Package,
  CreditCard,
  Users,
  Percent
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PricingConfig {
  id: string;
  config_type: string;
  config_key: string;
  amount: number;
  currency: string;
  billing_cycle: string;
  description: string;
  is_active: boolean;
}

const configTypeIcons = {
  subscription: Users,
  vendor_fee: Package,
  commission: Percent,
  transaction_fee: CreditCard,
  product: DollarSign,
};

const configTypeNames = {
  subscription: 'Subscription Plans',
  vendor_fee: 'Vendor Fees',
  commission: 'Commission Rates',
  transaction_fee: 'Transaction Fees',
  product: 'Product Pricing',
};

export const PricingConfigPanel: React.FC = () => {
  const [configs, setConfigs] = useState<PricingConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingConfig, setEditingConfig] = useState<PricingConfig | null>(null);
  const [newConfig, setNewConfig] = useState({
    config_type: 'subscription',
    config_key: '',
    amount: 500000, // 5000 XAF in cents
    currency: 'XAF',
    billing_cycle: 'monthly',
    description: '',
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPricingConfigs();
  }, []);

  const loadPricingConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_config')
        .select('*')
        .order('config_type', { ascending: true })
        .order('config_key', { ascending: true });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Error loading pricing configs:', error);
      toast({
        title: "Error",
        description: "Failed to load pricing configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (config: Partial<PricingConfig> & { config_key: string; config_type: string }) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('pricing_config')
        .upsert(config);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Pricing configuration saved successfully",
      });

      loadPricingConfigs();
      setEditingConfig(null);
      setNewConfig({
        config_type: 'subscription',
        config_key: '',
        amount: 500000,
        currency: 'XAF',
        billing_cycle: 'monthly',
        description: '',
        is_active: true
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Error",
        description: "Failed to save pricing configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteConfig = async (configId: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('pricing_config')
        .delete()
        .eq('id', configId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Pricing configuration deleted successfully",
      });

      loadPricingConfigs();
    } catch (error) {
      console.error('Error deleting config:', error);
      toast({
        title: "Error",
        description: "Failed to delete pricing configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'XAF') {
      return `${(amount / 100).toLocaleString()} XAF`;
    }
    return `${amount / 100} ${currency}`;
  };

  const groupedConfigs = configs.reduce((acc, config) => {
    if (!acc[config.config_type]) {
      acc[config.config_type] = [];
    }
    acc[config.config_type].push(config);
    return acc;
  }, {} as Record<string, PricingConfig[]>);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">Loading pricing configuration...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pricing Configuration</h2>
          <p className="text-muted-foreground">Configure pricing for all payment scenarios</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="manage">Manage</TabsTrigger>
          <TabsTrigger value="add">Add New</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {Object.entries(groupedConfigs).map(([configType, typeConfigs]) => {
            const Icon = configTypeIcons[configType as keyof typeof configTypeIcons];
            const typeName = configTypeNames[configType as keyof typeof configTypeNames];
            
            return (
              <Card key={configType}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {typeName}
                  </CardTitle>
                  <CardDescription>
                    {typeConfigs.length} configuration{typeConfigs.length !== 1 ? 's' : ''} in this category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {typeConfigs.map((config) => (
                      <div key={config.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{config.config_key.replace(/_/g, ' ').toUpperCase()}</h4>
                          <Badge variant={config.is_active ? "default" : "secondary"}>
                            {config.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-lg font-bold">{formatAmount(config.amount, config.currency)}</p>
                        <p className="text-sm text-muted-foreground">{config.billing_cycle}</p>
                        <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {configs.map((config) => (
              <Card key={config.id}>
                <CardContent className="p-6">
                  {editingConfig?.id === config.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label>Type</Label>
                          <Select
                            value={editingConfig.config_type}
                            onValueChange={(value) => setEditingConfig({...editingConfig, config_type: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="subscription">Subscription</SelectItem>
                              <SelectItem value="vendor_fee">Vendor Fee</SelectItem>
                              <SelectItem value="commission">Commission</SelectItem>
                              <SelectItem value="transaction_fee">Transaction Fee</SelectItem>
                              <SelectItem value="product">Product</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Key</Label>
                          <Input
                            value={editingConfig.config_key}
                            onChange={(e) => setEditingConfig({...editingConfig, config_key: e.target.value})}
                            placeholder="e.g., basic_monthly"
                          />
                        </div>
                        
                        <div>
                          <Label>Amount (XAF)</Label>
                          <Input
                            type="number"
                            value={editingConfig.amount / 100}
                            onChange={(e) => setEditingConfig({...editingConfig, amount: parseFloat(e.target.value) * 100 || 0})}
                            placeholder="5000"
                          />
                        </div>
                        
                        <div>
                          <Label>Billing Cycle</Label>
                          <Select
                            value={editingConfig.billing_cycle}
                            onValueChange={(value) => setEditingConfig({...editingConfig, billing_cycle: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="yearly">Yearly</SelectItem>
                              <SelectItem value="one_time">One Time</SelectItem>
                              <SelectItem value="percentage">Percentage</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Description</Label>
                        <Input
                          value={editingConfig.description}
                          onChange={(e) => setEditingConfig({...editingConfig, description: e.target.value})}
                          placeholder="Description of this pricing configuration"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editingConfig.is_active}
                          onCheckedChange={(checked) => setEditingConfig({...editingConfig, is_active: checked})}
                        />
                        <Label>Active</Label>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => saveConfig(editingConfig)}
                          disabled={saving}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setEditingConfig(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{config.config_key.replace(/_/g, ' ').toUpperCase()}</h4>
                          <Badge variant={config.is_active ? "default" : "secondary"}>
                            {config.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-lg font-bold">{formatAmount(config.amount, config.currency)}</p>
                        <p className="text-sm text-muted-foreground">{config.description}</p>
                        <p className="text-xs text-muted-foreground">{config.config_type} • {config.billing_cycle}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingConfig(config)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteConfig(config.id)}
                          disabled={saving}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Pricing Configuration
              </CardTitle>
              <CardDescription>
                Create a new pricing configuration for your marketplace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Configuration Type</Label>
                  <Select
                    value={newConfig.config_type}
                    onValueChange={(value) => setNewConfig({...newConfig, config_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subscription">Subscription</SelectItem>
                      <SelectItem value="vendor_fee">Vendor Fee</SelectItem>
                      <SelectItem value="commission">Commission</SelectItem>
                      <SelectItem value="transaction_fee">Transaction Fee</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Configuration Key</Label>
                  <Input
                    value={newConfig.config_key}
                    onChange={(e) => setNewConfig({...newConfig, config_key: e.target.value})}
                    placeholder="e.g., premium_yearly"
                  />
                </div>
                
                <div>
                  <Label>Amount (XAF)</Label>
                  <Input
                    type="number"
                    value={newConfig.amount / 100}
                    onChange={(e) => setNewConfig({...newConfig, amount: parseFloat(e.target.value) * 100 || 0})}
                    placeholder="5000"
                  />
                </div>
                
                <div>
                  <Label>Billing Cycle</Label>
                  <Select
                    value={newConfig.billing_cycle}
                    onValueChange={(value) => setNewConfig({...newConfig, billing_cycle: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="one_time">One Time</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                <Input
                  value={newConfig.description}
                  onChange={(e) => setNewConfig({...newConfig, description: e.target.value})}
                  placeholder="Description of this pricing configuration"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newConfig.is_active}
                  onCheckedChange={(checked) => setNewConfig({...newConfig, is_active: checked})}
                />
                <Label>Active</Label>
              </div>
              
              <Button 
                onClick={() => saveConfig(newConfig)}
                disabled={saving || !newConfig.config_key}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};