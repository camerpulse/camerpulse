import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Trash2, Edit } from 'lucide-react';
import { useManagePluginLicense, type PluginLicense } from '@/hooks/usePluginMonetization';
import { useState } from 'react';

interface PluginLicenseManagerProps {
  pluginId: string;
  licenses?: PluginLicense[];
  onLicenseChange?: () => void;
}

export const PluginLicenseManager = ({ 
  pluginId, 
  licenses = [], 
  onLicenseChange 
}: PluginLicenseManagerProps) => {
  const { toast } = useToast();
  const [editingLicense, setEditingLicense] = useState<Partial<PluginLicense> | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const manageLicense = useManagePluginLicense();

  const handleSaveLicense = async (licenseData: Partial<PluginLicense>) => {
    try {
      await manageLicense.mutateAsync({
        ...licenseData,
        plugin_id: pluginId
      });
      setShowForm(false);
      setEditingLicense(null);
      onLicenseChange?.();
    } catch (error) {
      console.error('Failed to save license:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'XAF') => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Plugin Licensing</h3>
        <Button onClick={() => {
          setEditingLicense({
            license_type: 'one_time',
            price_amount: 0,
            currency: 'XAF',
            trial_period_days: 0,
            is_active: true
          });
          setShowForm(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add License
        </Button>
      </div>

      {/* Existing Licenses */}
      <div className="grid gap-4">
        {licenses.map((license) => (
          <Card key={license.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Badge variant="outline">{license.license_type}</Badge>
                  {formatCurrency(license.price_amount, license.currency)}
                  {license.billing_interval && license.billing_interval !== 'one_time' && (
                    <span className="text-sm text-muted-foreground">
                      /{license.billing_interval}
                    </span>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={license.is_active} 
                    onCheckedChange={(checked) => {
                      handleSaveLicense({
                        ...license,
                        is_active: checked
                      });
                    }}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditingLicense(license);
                      setShowForm(true);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <div className="font-medium capitalize">{license.license_type}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Billing:</span>
                  <div className="font-medium">{license.billing_interval || 'one-time'}</div>
                </div>
                {license.trial_period_days > 0 && (
                  <div>
                    <span className="text-muted-foreground">Trial:</span>
                    <div className="font-medium">{license.trial_period_days} days</div>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div className="font-medium">
                    <Badge variant={license.is_active ? 'default' : 'secondary'}>
                      {license.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* License Form */}
      {showForm && editingLicense && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingLicense.id ? 'Edit License' : 'Add New License'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LicenseForm
              license={editingLicense}
              onSave={handleSaveLicense}
              onCancel={() => {
                setShowForm(false);
                setEditingLicense(null);
              }}
              isLoading={manageLicense.isPending}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface LicenseFormProps {
  license: Partial<PluginLicense>;
  onSave: (license: Partial<PluginLicense>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const LicenseForm = ({ license, onSave, onCancel, isLoading }: LicenseFormProps) => {
  const [formData, setFormData] = useState(license);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="license_type">License Type</Label>
          <Select 
            value={formData.license_type} 
            onValueChange={(value) => setFormData(prev => ({ 
              ...prev, 
              license_type: value as any,
              billing_interval: value === 'one_time' ? 'one_time' : 'month'
            }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="one_time">One-time Purchase</SelectItem>
              <SelectItem value="subscription">Subscription</SelectItem>
              <SelectItem value="pay_per_call">Pay Per Call</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="price_amount">Price</Label>
          <Input
            id="price_amount"
            type="number"
            step="0.01"
            value={formData.price_amount || 0}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              price_amount: parseFloat(e.target.value) || 0 
            }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select 
            value={formData.currency} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="XAF">XAF (CFA Franc)</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.license_type === 'subscription' && (
          <div>
            <Label htmlFor="billing_interval">Billing Interval</Label>
            <Select 
              value={formData.billing_interval} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, billing_interval: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="year">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="trial_period_days">Trial Period (Days)</Label>
          <Input
            id="trial_period_days"
            type="number"
            value={formData.trial_period_days || 0}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              trial_period_days: parseInt(e.target.value) || 0 
            }))}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="usage_limits">Usage Limits (JSON)</Label>
        <Textarea
          id="usage_limits"
          placeholder='{"max_calls": 1000, "max_users": 50}'
          value={JSON.stringify(formData.usage_limits || {}, null, 2)}
          onChange={(e) => {
            try {
              const limits = JSON.parse(e.target.value);
              setFormData(prev => ({ ...prev, usage_limits: limits }));
            } catch (error) {
              // Invalid JSON, ignore
            }
          }}
        />
      </div>

      <div>
        <Label htmlFor="features_included">Features Included (JSON)</Label>
        <Textarea
          id="features_included"
          placeholder='{"premium_support": true, "analytics": true}'
          value={JSON.stringify(formData.features_included || {}, null, 2)}
          onChange={(e) => {
            try {
              const features = JSON.parse(e.target.value);
              setFormData(prev => ({ ...prev, features_included: features }));
            } catch (error) {
              // Invalid JSON, ignore
            }
          }}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save License'}
        </Button>
      </div>
    </form>
  );
};
