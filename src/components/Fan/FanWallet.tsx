import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, 
  Plus, 
  Minus, 
  CreditCard, 
  Smartphone, 
  DollarSign, 
  History, 
  TrendingUp,
  Shield,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { toast } from 'sonner';

interface WalletData {
  id: string;
  balance_fcfa: number;
  pending_balance_fcfa: number;
  total_topup_fcfa: number;
  total_spent_fcfa: number;
  spending_limit_fcfa: number;
  is_active: boolean;
}

interface Transaction {
  id: string;
  transaction_type: string;
  amount_fcfa: number;
  payment_method: string;
  description: string;
  status: string;
  created_at: string;
  completed_at: string;
}

export const FanWallet: React.FC = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fanProfile, setFanProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [topupAmount, setTopupAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'mobile_money' | 'card'>('mobile_money');
  const [processingTopup, setProcessingTopup] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFanProfile();
    }
  }, [user]);

  useEffect(() => {
    if (fanProfile?.id) {
      fetchWallet();
      fetchTransactions();
    }
  }, [fanProfile]);

  const fetchFanProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('fan_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching fan profile:', error);
        return;
      }

      if (data) {
        setFanProfile(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchWallet = async () => {
    try {
      const { data, error } = await supabase
        .from('fan_wallets')
        .select('*')
        .eq('fan_id', fanProfile.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching wallet:', error);
        // Create wallet if it doesn't exist
        await createWallet();
        return;
      }

      if (data) {
        setWallet(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWallet = async () => {
    try {
      const { data, error } = await supabase
        .from('fan_wallets')
        .insert({
          fan_id: fanProfile.id,
          balance_fcfa: 0,
          spending_limit_fcfa: 100000 // Default 100k FCFA limit
        })
        .select()
        .single();

      if (error) throw error;
      setWallet(data);
    } catch (error) {
      console.error('Error creating wallet:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('fan_transactions')
        .select('*')
        .eq('fan_id', fanProfile.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const processTopup = async () => {
    if (!topupAmount || !fanProfile?.id || !wallet) {
      toast.error('Please enter a valid amount');
      return;
    }

    const amount = parseInt(topupAmount);
    if (amount < 500) {
      toast.error('Minimum topup amount is 500 FCFA');
      return;
    }

    setProcessingTopup(true);

    try {
      // In a real implementation, this would integrate with a payment gateway
      // For now, we'll simulate a successful transaction
      
      const { data, error } = await supabase.rpc('process_wallet_transaction', {
        p_fan_id: fanProfile.id,
        p_transaction_type: 'topup',
        p_amount_fcfa: amount,
        p_description: `Wallet top-up via ${selectedMethod.replace('_', ' ')}`
      });

      if (error) throw error;

      toast.success(`Successfully topped up ${amount.toLocaleString()} FCFA!`);
      setTopupAmount('');
      
      // Refresh wallet and transactions
      await fetchWallet();
      await fetchTransactions();

    } catch (error: any) {
      console.error('Error processing topup:', error);
      toast.error(error.message || 'Failed to process topup');
    } finally {
      setProcessingTopup(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'topup':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'purchase':
      case 'tip':
      case 'donation':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'mobile_money':
        return <Smartphone className="h-4 w-4" />;
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p>Setting up your wallet...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Wallet className="h-8 w-8 text-primary" />
              My Wallet
            </h1>
            <p className="text-muted-foreground">Manage your CamerPulse wallet and transactions</p>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-600 font-medium">Secure Wallet</span>
          </div>
        </div>

        {/* Wallet Balance */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-lg font-medium text-muted-foreground mb-2">Available Balance</h3>
                <p className="text-4xl font-bold text-primary">
                  {wallet.balance_fcfa.toLocaleString()} <span className="text-lg">FCFA</span>
                </p>
                {wallet.pending_balance_fcfa > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {wallet.pending_balance_fcfa.toLocaleString()} FCFA pending
                  </p>
                )}
              </div>
              
              <div className="text-center">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Total Topped Up</h4>
                <p className="text-xl font-semibold">{wallet.total_topup_fcfa.toLocaleString()} FCFA</p>
              </div>
              
              <div className="text-center">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Total Spent</h4>
                <p className="text-xl font-semibold">{wallet.total_spent_fcfa.toLocaleString()} FCFA</p>
              </div>
            </div>

            {wallet.spending_limit_fcfa && (
              <div className="mt-6 pt-6 border-t border-primary/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Spending Limit</span>
                  <span className="text-sm font-medium">{wallet.spending_limit_fcfa.toLocaleString()} FCFA</span>
                </div>
                <div className="w-full bg-background/50 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((wallet.total_spent_fcfa / wallet.spending_limit_fcfa) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="topup" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="topup">Top Up</TabsTrigger>
            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          </TabsList>

          <TabsContent value="topup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Money to Wallet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Amount (FCFA)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount (minimum 500)"
                      value={topupAmount}
                      onChange={(e) => setTopupAmount(e.target.value)}
                      min="500"
                    />
                  </div>

                  <div>
                    <Label>Payment Method</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <Card 
                        className={`cursor-pointer transition-colors ${
                          selectedMethod === 'mobile_money' 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedMethod('mobile_money')}
                      >
                        <CardContent className="p-4 text-center">
                          <Smartphone className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <p className="font-medium">Mobile Money</p>
                          <p className="text-xs text-muted-foreground">MTN, Orange</p>
                        </CardContent>
                      </Card>

                      <Card 
                        className={`cursor-pointer transition-colors ${
                          selectedMethod === 'card' 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedMethod('card')}
                      >
                        <CardContent className="p-4 text-center">
                          <CreditCard className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <p className="font-medium">Card Payment</p>
                          <p className="text-xs text-muted-foreground">Visa, Mastercard</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {[1000, 5000, 10000, 25000].map(amount => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setTopupAmount(amount.toString())}
                      >
                        {amount.toLocaleString()}
                      </Button>
                    ))}
                  </div>

                  <Button 
                    onClick={processTopup}
                    disabled={processingTopup || !topupAmount}
                    className="w-full"
                    size="lg"
                  >
                    {processingTopup ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Plus className="h-5 w-5 mr-2" />
                    )}
                    {processingTopup ? 'Processing...' : `Top Up ${topupAmount ? parseInt(topupAmount).toLocaleString() : '0'} FCFA`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          {getTransactionIcon(transaction.transaction_type)}
                          {transaction.payment_method && getPaymentMethodIcon(transaction.payment_method)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium capitalize">
                              {transaction.transaction_type.replace('_', ' ')}
                            </h4>
                            <Badge variant={getStatusColor(transaction.status) as any} className="text-xs">
                              {transaction.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleString()}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className={`text-lg font-semibold ${
                            transaction.transaction_type === 'topup' 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {transaction.transaction_type === 'topup' ? '+' : '-'}
                            {transaction.amount_fcfa.toLocaleString()} FCFA
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Transactions Yet</h3>
                    <p className="text-muted-foreground">Your transaction history will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Wallet Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold text-green-600">
                  {transactions.filter(t => t.transaction_type === 'topup').length}
                </div>
                <div className="text-sm text-muted-foreground">Top-ups</div>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold text-blue-600">
                  {transactions.filter(t => ['purchase', 'tip', 'donation'].includes(t.transaction_type)).length}
                </div>
                <div className="text-sm text-muted-foreground">Purchases</div>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold text-primary">
                  {((wallet.total_spent_fcfa / (wallet.total_topup_fcfa || 1)) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Spending Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};