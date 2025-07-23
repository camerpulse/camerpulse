import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Wallet, CreditCard, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WalletTopupProps {
  onSuccess?: () => void;
}

export const WalletTopup: React.FC<WalletTopupProps> = ({ onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('mtnMomo');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const paymentMethods = [
    { id: 'mtnMomo', name: 'MTN Mobile Money', icon: Smartphone },
    { id: 'orangeMoney', name: 'Orange Money', icon: Smartphone },
    { id: 'stripe', name: 'Credit Card', icon: CreditCard },
  ];

  const quickAmounts = [5000, 10000, 25000, 50000, 100000];

  const handleTopup = async () => {
    const topupAmount = parseInt(amount);
    
    if (!topupAmount || topupAmount < 500) {
      toast({
        title: "Invalid Amount",
        description: "Minimum top-up amount is 500 FCFA",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('wallet-topup', {
        body: {
          amount: topupAmount,
          method: method,
          description: "Wallet top-up"
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Top-up Successful",
          description: `Added ${topupAmount.toLocaleString()} FCFA to your wallet`,
        });
        setAmount('');
        onSuccess?.();
      } else {
        throw new Error(data?.error || 'Top-up failed');
      }
    } catch (error) {
      console.error('Error during top-up:', error);
      toast({
        title: "Top-up Failed",
        description: error instanceof Error ? error.message : 'Failed to process top-up',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Add Money to Wallet
        </CardTitle>
        <CardDescription>
          Top up your CamerPulse wallet to participate in tenders and make payments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (FCFA)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="500"
          />
          <p className="text-xs text-muted-foreground">Minimum: 500 FCFA</p>
        </div>

        {/* Quick Amount Buttons */}
        <div className="space-y-2">
          <Label>Quick Select</Label>
          <div className="grid grid-cols-3 gap-2">
            {quickAmounts.map((quickAmount) => (
              <Button
                key={quickAmount}
                variant="outline"
                size="sm"
                onClick={() => setAmount(quickAmount.toString())}
                className="text-xs"
              >
                {quickAmount.toLocaleString()} FCFA
              </Button>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-3">
          <Label>Payment Method</Label>
          <RadioGroup value={method} onValueChange={setMethod}>
            {paymentMethods.map((paymentMethod) => {
              const Icon = paymentMethod.icon;
              return (
                <div key={paymentMethod.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={paymentMethod.id} id={paymentMethod.id} />
                  <Label 
                    htmlFor={paymentMethod.id} 
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Icon className="h-4 w-4" />
                    {paymentMethod.name}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        {/* Top-up Button */}
        <Button 
          onClick={handleTopup} 
          disabled={isLoading || !amount}
          className="w-full"
        >
          {isLoading ? "Processing..." : `Top up ${amount ? parseInt(amount).toLocaleString() : ''} FCFA`}
        </Button>
      </CardContent>
    </Card>
  );
};