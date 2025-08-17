import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNokashPayment } from '@/hooks/useNokashPayment';
import { PaymentStatusModal } from './PaymentStatusModal';
import { TransactionHistory } from './TransactionHistory';
import { Loader2, Smartphone, CreditCard, CheckCircle, Eye, History } from 'lucide-react';

interface NokashConfig {
  supported_networks: string[];
  default_network: string;
  is_active: boolean;
}

const PRESET_AMOUNTS = [1000, 2500, 5000, 10000, 25000, 50000];

export const NokashDonationForm: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'MTN' | 'ORANGE'>('MTN');
  const [config, setConfig] = useState<NokashConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    initiateMobileMoneyPayment, 
    generateOrderId,
    validatePhoneNumber,
    validateAmount,
    formatPhoneNumber,
    loading,
    pollTransactionStatus
  } = useNokashPayment();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('nokash_payment_config')
        .select('supported_networks, default_network, is_active')
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Config error:', error);
        toast({
          title: "Service Unavailable",
          description: "Mobile money payments are currently not available",
          variant: "destructive",
        });
      } else if (data) {
        setConfig(data);
        setPaymentMethod(data.default_network as 'MTN' | 'ORANGE');
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setConfigLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!config?.is_active) {
      toast({
        title: "Service Unavailable",
        description: "Mobile money payments are currently disabled",
        variant: "destructive",
      });
      return;
    }

    const finalAmount = customAmount || amount;
    
    if (!phone || !finalAmount || !paymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!validatePhoneNumber(phone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Cameroon mobile number",
        variant: "destructive",
      });
      return;
    }

    const amountNum = parseFloat(finalAmount);
    if (!validateAmount(amountNum)) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be between 100 and 1,000,000 XAF",
        variant: "destructive",
      });
      return;
    }

    setMessage('');
    setSuccess(false);

    try {
      const orderId = generateOrderId();
      const formattedPhone = formatPhoneNumber(phone);

      const result = await initiateMobileMoneyPayment({
        order_id: orderId,
        amount: amountNum,
        phone: formattedPhone,
        payment_method: paymentMethod,
        user_id: user?.id
      });

      if (result.success) {
        setCurrentOrderId(result.order_id!);
        setSuccess(true);
        setMessage(result.message);
        
        // Reset form
        setPhone('');
        setAmount('');
        setCustomAmount('');
        
        // Start polling for status updates
        pollTransactionStatus(result.order_id!, (status) => {
          if (status.status === 'SUCCESS') {
            toast({
              title: "Payment Successful!",
              description: "Thank you for your donation",
              variant: "default",
            });
          }
        });
      }
    } catch (error) {
      console.error('Payment submission error:', error);
    }
  };

  if (configLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!config?.is_active) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Mobile Money Donations</span>
          </CardTitle>
          <CardDescription>
            Mobile money donations are currently unavailable
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Smartphone className="h-5 w-5" />
          <span>Donate via Mobile Money</span>
        </CardTitle>
        <CardDescription>
          Support our cause with MTN or Orange Money
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <div className="space-y-2">
              <h3 className="font-semibold text-green-700">Payment Initiated!</h3>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
            <Button 
              onClick={() => {
                setSuccess(false);
                setMessage('');
              }}
              variant="outline"
              className="w-full"
            >
              Make Another Donation
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="6XXXXXXXX or 7XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter your mobile money number (without country code)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select 
                value={paymentMethod} 
                onValueChange={(value: 'MTN' | 'ORANGE') => setPaymentMethod(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {config.supported_networks.map((network) => (
                    <SelectItem key={network} value={network}>
                      <div className="flex items-center space-x-2">
                        <span>{network} Money</span>
                        {network === config.default_network && (
                          <Badge variant="secondary" className="text-xs">Default</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Donation Amount (XAF)</Label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {PRESET_AMOUNTS.map((presetAmount) => (
                  <Button
                    key={presetAmount}
                    type="button"
                    variant={amount === presetAmount.toString() ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setAmount(presetAmount.toString());
                      setCustomAmount('');
                    }}
                  >
                    {presetAmount.toLocaleString()}
                  </Button>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Or</span>
                <Input
                  type="number"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setAmount('');
                  }}
                  min="100"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Donate {(customAmount || amount) && `${parseFloat(customAmount || amount).toLocaleString()} XAF`}
                </>
              )}
            </Button>

            {message && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <p className="text-sm text-green-700">{message}</p>
              </div>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
};