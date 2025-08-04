import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Wallet, 
  CreditCard, 
  Smartphone, 
  Bitcoin, 
  ArrowUpRight, 
  ArrowDownLeft,
  History,
  Plus,
  Minus,
  Eye,
  EyeOff
} from 'lucide-react';

interface WalletBalance {
  total_balance_fcfa: number;
  available_balance_fcfa: number;
  pending_balance_fcfa: number;
  last_updated: string;
}

interface Transaction {
  id: string;
  transaction_type: string;
  amount_fcfa: number;
  payment_method: string;
  status: string;
  description: string;
  created_at: string;
  related_entity_type?: string;
  related_entity_id?: string;
}

interface TopUpMethod {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  min_amount: number;
  max_amount: number;
  fee_percentage: number;
  enabled: boolean;
}

export const UnifiedWallet: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showBalance, setShowBalance] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  // Wallet balance query
  const { data: walletBalance, isLoading: balanceLoading } = useQuery({
    queryKey: ['wallet-balance', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('fan_wallets')
        .select('*')
        .eq('fan_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Create wallet if it doesn't exist
        const { data: newWallet } = await supabase
          .from('fan_wallets')
          .insert({
            fan_id: user.id,
            balance_fcfa: 0,
            pending_balance_fcfa: 0
          })
          .select()
          .single();
        
        return newWallet;
      }

      return data;
    },
    enabled: !!user?.id,
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Transaction history query
  const { data: transactions = [] } = useQuery({
    queryKey: ['wallet-transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data } = await supabase
        .from('fan_transactions')
        .select('*')
        .eq('fan_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      return data || [];
    },
    enabled: !!user?.id
  });

  // Top-up methods configuration
  const topUpMethods: TopUpMethod[] = [
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      icon: Smartphone,
      description: 'MTN, Orange, Camtel Mobile Money',
      min_amount: 500,
      max_amount: 500000,
      fee_percentage: 1.5,
      enabled: true
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, Local cards',
      min_amount: 1000,
      max_amount: 1000000,
      fee_percentage: 2.5,
      enabled: true
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      icon: Bitcoin,
      description: 'Bitcoin, USDT, others',
      min_amount: 2000,
      max_amount: 2000000,
      fee_percentage: 1.0,
      enabled: false // Coming soon
    }
  ];

  // Top-up mutation
  const topUpMutation = useMutation({
    mutationFn: async ({ amount, method }: { amount: number; method: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('fan_transactions')
        .insert({
          fan_id: user.id,
          transaction_type: 'topup' as any,
          amount_fcfa: amount,
          payment_method: method as any,
          status: 'pending',
          description: `Wallet top-up via ${method}`
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Top-up initiated",
        description: "Your wallet top-up request has been submitted for processing.",
      });
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      setTopUpAmount('');
      setSelectedMethod('');
    },
    onError: (error) => {
      toast({
        title: "Top-up failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleTopUp = () => {
    const amount = parseFloat(topUpAmount);
    const method = topUpMethods.find(m => m.id === selectedMethod);

    if (!amount || !method) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid amount and select a payment method.",
        variant: "destructive"
      });
      return;
    }

    if (amount < method.min_amount || amount > method.max_amount) {
      toast({
        title: "Amount out of range",
        description: `Amount must be between ₣${method.min_amount.toLocaleString()} and ₣${method.max_amount.toLocaleString()}`,
        variant: "destructive"
      });
      return;
    }

    topUpMutation.mutate({ amount, method: selectedMethod });
  };

  const formatCurrency = (amount: number) => {
    return `₣${amount.toLocaleString()}`;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'topup':
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case 'purchase':
      case 'tip':
      case 'vote':
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      default:
        return <History className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'outline' as const },
      completed: { label: 'Completed', variant: 'default' as const },
      failed: { label: 'Failed', variant: 'destructive' as const },
      cancelled: { label: 'Cancelled', variant: 'secondary' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Please sign in to access your wallet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              CamerPulse Wallet
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
            >
              {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {balanceLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-3xl font-bold">
                  {showBalance 
                    ? formatCurrency(walletBalance?.balance_fcfa || 0)
                    : '₣••••••'
                  }
                </p>
              </div>
              
              {walletBalance?.pending_balance_fcfa && walletBalance.pending_balance_fcfa > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-lg font-semibold text-yellow-600">
                    {showBalance 
                      ? formatCurrency(walletBalance.pending_balance_fcfa)
                      : '₣••••'
                    }
                  </p>
                </div>
              )}
              
              <div className="text-xs text-muted-foreground">
                Last updated: {walletBalance?.updated_at 
                  ? new Date(walletBalance.updated_at).toLocaleString()
                  : 'Never'
                }
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wallet Actions */}
      <Tabs defaultValue="topup" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="topup">Top Up</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="topup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Money to Wallet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Amount Input */}
              <div>
                <label className="text-sm font-medium">Amount (FCFA)</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  min="500"
                  max="2000000"
                />
              </div>

              {/* Payment Methods */}
              <div>
                <label className="text-sm font-medium mb-3 block">Payment Method</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {topUpMethods.map((method) => (
                    <Card
                      key={method.id}
                      className={`cursor-pointer transition-all ${
                        selectedMethod === method.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:border-primary/50'
                      } ${!method.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => method.enabled && setSelectedMethod(method.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <method.icon className="w-6 h-6" />
                          <span className="font-medium">{method.name}</span>
                          {!method.enabled && (
                            <Badge variant="secondary" className="text-xs">Soon</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {method.description}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          <p>Fee: {method.fee_percentage}%</p>
                          <p>Range: ₣{method.min_amount.toLocaleString()} - ₣{method.max_amount.toLocaleString()}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Top-up Button */}
              <Button
                onClick={handleTopUp}
                disabled={!topUpAmount || !selectedMethod || topUpMutation.isPending}
                className="w-full"
              >
                {topUpMutation.isPending ? 'Processing...' : 'Add Money'}
              </Button>

              {/* Fee Preview */}
              {topUpAmount && selectedMethod && (
                <div className="p-3 bg-muted/50 rounded-lg text-sm">
                  <div className="flex justify-between mb-1">
                    <span>Amount:</span>
                    <span>₣{parseFloat(topUpAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Fee ({topUpMethods.find(m => m.id === selectedMethod)?.fee_percentage}%):</span>
                    <span>₣{(parseFloat(topUpAmount) * (topUpMethods.find(m => m.id === selectedMethod)?.fee_percentage || 0) / 100).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-1">
                    <span>Total to pay:</span>
                    <span>₣{(parseFloat(topUpAmount) * (1 + (topUpMethods.find(m => m.id === selectedMethod)?.fee_percentage || 0) / 100)).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-4" />
                  <p>No transactions yet</p>
                  <p className="text-sm">Your transaction history will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction.transaction_type)}
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString()} • {transaction.payment_method}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.transaction_type === 'topup' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {transaction.transaction_type === 'topup' ? '+' : '-'}
                          {formatCurrency(transaction.amount_fcfa)}
                        </p>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedWallet;