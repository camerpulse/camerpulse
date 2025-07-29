import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  DollarSign,
  CreditCard,
  Key,
  BarChart3,
  Settings,
  Users,
  Calendar,
  Shield,
  Zap,
  TrendingUp
} from 'lucide-react';
import {
  usePluginLicenses,
  useUserPurchases,
  useUserLicenseKeys,
  useDeveloperEarnings,
  useDeveloperPayouts,
  usePurchasePlugin,
  useManagePluginLicense,
  usePaymentGatewayConfigs,
  type PluginLicense
} from '@/hooks/usePluginMonetization';
import { formatDistanceToNow } from 'date-fns';

interface PluginMonetizationDashboardProps {
  userRole?: 'developer' | 'admin' | 'user';
}

export const PluginMonetizationDashboard = ({ userRole = 'user' }: PluginMonetizationDashboardProps) => {
  const { toast } = useToast();
  const [selectedLicense, setSelectedLicense] = useState<PluginLicense | null>(null);
  const [showLicenseDialog, setShowLicenseDialog] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  const { data: userPurchases } = useUserPurchases();
  const { data: userLicenseKeys } = useUserLicenseKeys();
  const { data: developerEarnings } = useDeveloperEarnings();
  const { data: developerPayouts } = useDeveloperPayouts();
  const { data: gatewayConfigs } = usePaymentGatewayConfigs();
  
  const purchasePlugin = usePurchasePlugin();
  const manageLicense = useManagePluginLicense();

  const handlePurchase = async (licenseId: string, gateway: string) => {
    await purchasePlugin.mutateAsync({
      licenseId,
      paymentGateway: gateway as any
    });
    setShowPurchaseDialog(false);
  };

  const formatCurrency = (amount: number, currency: string = 'XAF') => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (userRole === 'developer') {
    return <DeveloperDashboard />;
  }

  if (userRole === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Plugin Store</h2>
          <p className="text-muted-foreground">
            Purchase and manage your plugin licenses
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Key className="h-4 w-4 mr-2" />
          {userLicenseKeys?.length || 0} Active Licenses
        </Badge>
      </div>

      <Tabs defaultValue="marketplace" className="space-y-6">
        <TabsList>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="purchases">My Purchases</TabsTrigger>
          <TabsTrigger value="licenses">My Licenses</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace">
          <PluginMarketplace onPurchase={(license) => {
            setSelectedLicense(license);
            setShowPurchaseDialog(true);
          }} />
        </TabsContent>

        <TabsContent value="purchases">
          <div className="grid gap-4">
            {userPurchases?.map((purchase) => (
              <Card key={purchase.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Plugin Purchase</CardTitle>
                    <Badge variant={
                      purchase.status === 'completed' ? 'default' :
                      purchase.status === 'failed' ? 'destructive' : 'secondary'
                    }>
                      {purchase.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Amount:</span>
                      <div className="font-medium">{formatCurrency(purchase.amount, purchase.currency)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gateway:</span>
                      <div className="font-medium capitalize">{purchase.payment_gateway}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date:</span>
                      <div className="font-medium">
                        {formatDistanceToNow(new Date(purchase.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Transaction:</span>
                      <div className="font-medium">{purchase.transaction_id || 'Pending'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="licenses">
          <div className="grid gap-4">
            {userLicenseKeys?.map((licenseKey) => (
              <Card key={licenseKey.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      License Key
                    </CardTitle>
                    <Badge variant={
                      licenseKey.status === 'active' ? 'default' :
                      licenseKey.status === 'expired' ? 'destructive' : 'secondary'
                    }>
                      {licenseKey.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="font-mono text-sm bg-muted p-2 rounded">
                      {licenseKey.license_key}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <div className="font-medium capitalize">
                          {(licenseKey as any).plugin_licenses?.license_type}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Usage:</span>
                        <div className="font-medium">
                          {licenseKey.usage_count}
                          {licenseKey.usage_limit && ` / ${licenseKey.usage_limit}`}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expires:</span>
                        <div className="font-medium">
                          {licenseKey.expires_at 
                            ? formatDistanceToNow(new Date(licenseKey.expires_at), { addSuffix: true })
                            : 'Never'
                          }
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <div className="font-medium">
                          {formatDistanceToNow(new Date(licenseKey.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Purchase Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Plugin License</DialogTitle>
          </DialogHeader>
          {selectedLicense && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">License Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <Badge variant="outline">{selectedLicense.license_type}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-medium">
                      {formatCurrency(selectedLicense.price_amount, selectedLicense.currency)}
                    </span>
                  </div>
                  {selectedLicense.trial_period_days > 0 && (
                    <div className="flex justify-between">
                      <span>Trial Period:</span>
                      <span>{selectedLicense.trial_period_days} days</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="gateway">Payment Method</Label>
                <Select defaultValue="stripe">
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment gateway" />
                  </SelectTrigger>
                  <SelectContent>
                    {gatewayConfigs?.filter(g => g.is_active).map((gateway) => (
                      <SelectItem key={gateway.id} value={gateway.gateway_name}>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          {gateway.gateway_name === 'stripe' ? 'Stripe' :
                           gateway.gateway_name === 'flutterwave' ? 'Flutterwave' :
                           'Mobile Money'}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPurchaseDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => handlePurchase(selectedLicense.id, 'stripe')}
                  disabled={purchasePlugin.isPending}
                >
                  {purchasePlugin.isPending ? 'Processing...' : 'Purchase Now'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const PluginMarketplace = ({ onPurchase }: { onPurchase: (license: PluginLicense) => void }) => {
  const { data: licenses } = usePluginLicenses();

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {licenses?.map((license) => (
        <Card key={license.id} className="relative">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Premium Plugin</CardTitle>
              <Badge variant="outline">{license.license_type}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-CM', {
                style: 'currency',
                currency: license.currency
              }).format(license.price_amount)}
              {license.billing_interval && license.billing_interval !== 'one_time' && (
                <span className="text-sm font-normal text-muted-foreground">
                  /{license.billing_interval}
                </span>
              )}
            </div>

            {license.trial_period_days > 0 && (
              <Badge variant="secondary">
                {license.trial_period_days} day trial
              </Badge>
            )}

            <Button 
              className="w-full" 
              onClick={() => onPurchase(license)}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Purchase License
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const DeveloperDashboard = () => {
  const { data: earnings } = useDeveloperEarnings();
  const { data: payouts } = useDeveloperPayouts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Developer Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your plugin monetization and earnings
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-CM', {
                style: 'currency',
                currency: 'XAF'
              }).format(earnings?.totalRevenue || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earnings?.totalSales || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Commission Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-CM', {
                style: 'currency',
                currency: 'XAF'
              }).format(earnings?.totalCommission || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Pending Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payouts?.filter(p => p.status === 'pending').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {earnings?.sales.slice(0, 10).map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Plugin Sale</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(sale.created_at), { addSuffix: true })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {new Intl.NumberFormat('fr-CM', {
                      style: 'currency',
                      currency: sale.currency
                    }).format(sale.developer_payout)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    via {sale.payment_gateway}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AdminDashboard = () => {
  const { data: gatewayConfigs } = usePaymentGatewayConfigs();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monetization Admin</h2>
          <p className="text-muted-foreground">
            Manage payment gateways and commission settings
          </p>
        </div>
      </div>

      {/* Payment Gateway Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Payment Gateway Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gatewayConfigs?.map((gateway) => (
              <div key={gateway.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${gateway.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div>
                    <div className="font-medium capitalize">{gateway.gateway_name}</div>
                    <div className="text-sm text-muted-foreground">
                      Commission: {gateway.commission_percentage}%
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={gateway.is_active ? 'default' : 'secondary'}>
                    {gateway.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};