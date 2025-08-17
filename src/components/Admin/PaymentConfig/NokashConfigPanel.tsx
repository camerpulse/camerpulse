import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PaymentDashboard } from '../PaymentDashboard/PaymentDashboard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Settings, CreditCard, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';

interface NokashConfig {
  id: string;
  app_space_key: string;
  is_active: boolean;
  supported_networks: string[];
  default_network: string;
  created_at: string;
  updated_at: string;
}

interface NokashTransaction {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  phone_number: string;
  payment_method: string;
  status: string;
  created_at: string;
  completed_at?: string;
}

export const NokashConfigPanel: React.FC = () => {
  const [config, setConfig] = useState<NokashConfig | null>(null);
  const [transactions, setTransactions] = useState<NokashTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load config
      const { data: configData, error: configError } = await supabase
        .from('nokash_payment_config')
        .select('*')
        .single();

      if (configError && configError.code !== 'PGRST116') {
        console.error('Error loading config:', configError);
      } else if (configData) {
        setConfig(configData);
      }

      // Load recent transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from('nokash_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (transactionError) {
        console.error('Error loading transactions:', transactionError);
      } else {
        setTransactions(transactionData || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load Nokash configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (updates: Partial<NokashConfig>) => {
    if (!config) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('nokash_payment_config')
        .update(updates)
        .eq('id', config.id);

      if (error) throw error;

      setConfig({ ...config, ...updates });
      toast({
        title: "Success",
        description: "Configuration updated successfully",
      });
    } catch (error) {
      console.error('Error updating config:', error);
      toast({
        title: "Error",
        description: "Failed to update configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'SUCCESS' ? 'default' : status === 'FAILED' ? 'destructive' : 'secondary';
    return <Badge variant={variant}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <CreditCard className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Nokash Payment Configuration</h2>
      </div>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <Eye className="h-4 w-4 mr-2" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="dashboard">
            <CreditCard className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateway Settings</CardTitle>
              <CardDescription>
                Configure Nokash mobile money payment settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {config && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Active Status</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable or disable Nokash payments
                      </p>
                    </div>
                    <Switch
                      checked={config.is_active}
                      onCheckedChange={(checked) => updateConfig({ is_active: checked })}
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="app_space_key">App Space Key</Label>
                    <Input
                      id="app_space_key"
                      value={config.app_space_key}
                      onChange={(e) => setConfig({ ...config, app_space_key: e.target.value })}
                      placeholder="Enter Nokash App Space Key"
                    />
                    <Button
                      onClick={() => updateConfig({ app_space_key: config.app_space_key })}
                      disabled={saving}
                      size="sm"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Update Key
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Supported Networks</Label>
                    <div className="flex space-x-2">
                      {config.supported_networks.map((network) => (
                        <Badge key={network} variant="outline">
                          {network}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Default Network</Label>
                    <Badge>{config.default_network}</Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                View and monitor Nokash payment transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Network</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-mono text-sm">
                            {transaction.order_id}
                          </TableCell>
                          <TableCell>
                            {transaction.amount.toLocaleString()} {transaction.currency}
                          </TableCell>
                          <TableCell>{transaction.phone_number}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{transaction.payment_method}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(transaction.status)}
                              {getStatusBadge(transaction.status)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(transaction.created_at).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard">
          <PaymentDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};