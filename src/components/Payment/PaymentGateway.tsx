import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Smartphone, Shield, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PaymentGatewayProps {
  amount: number;
  currency?: string;
  description: string;
  onSuccess: (paymentData: PaymentResult) => void;
  onCancel?: () => void;
  metadata?: Record<string, any>;
}

interface PaymentResult {
  id: string;
  amount: number;
  currency: string;
  status: 'success' | 'pending' | 'failed';
  payment_method: string;
  transaction_id: string;
  metadata?: Record<string, any>;
}

const PAYMENT_METHODS = [
  {
    id: 'mtn_momo',
    name: 'MTN Mobile Money',
    icon: Smartphone,
    description: 'Pay with MTN MoMo wallet',
    currencies: ['XAF'],
    processing_fee: 0.02
  },
  {
    id: 'orange_money',
    name: 'Orange Money',
    icon: Smartphone,
    description: 'Pay with Orange Money wallet',
    currencies: ['XAF'],
    processing_fee: 0.025
  },
  {
    id: 'stripe_card',
    name: 'Credit/Debit Card',
    icon: CreditCard,
    description: 'International cards via Stripe',
    currencies: ['USD', 'EUR', 'XAF'],
    processing_fee: 0.029
  }
];

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  amount,
  currency = 'XAF',
  description,
  onSuccess,
  onCancel,
  metadata = {}
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<string>('mtn_momo');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'select' | 'details' | 'processing' | 'success'>('select');

  const selectedPaymentMethod = PAYMENT_METHODS.find(m => m.id === selectedMethod);
  const processingFee = selectedPaymentMethod ? amount * selectedPaymentMethod.processing_fee : 0;
  const totalAmount = amount + processingFee;

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to complete payment",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    setStep('processing');

    try {
      // Create payment record
      const { data: paymentRecord, error: recordError } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: user.id,
          amount: totalAmount,
          currency,
          payment_method: selectedMethod,
          description,
          status: 'pending',
          metadata: {
            ...metadata,
            phone_number: phoneNumber,
            processing_fee: processingFee
          }
        })
        .select()
        .single();

      if (recordError) throw recordError;

      // Process payment based on method
      let paymentResult: PaymentResult;

      if (selectedMethod === 'mtn_momo' || selectedMethod === 'orange_money') {
        paymentResult = await processMobileMoneyPayment(paymentRecord.id, phoneNumber, totalAmount);
      } else if (selectedMethod === 'stripe_card') {
        paymentResult = await processStripePayment(paymentRecord.id, totalAmount);
      } else {
        throw new Error('Unsupported payment method');
      }

      // Update payment record
      await supabase
        .from('payment_transactions')
        .update({
          status: paymentResult.status,
          transaction_id: paymentResult.transaction_id,
          processed_at: new Date().toISOString()
        })
        .eq('id', paymentRecord.id);

      if (paymentResult.status === 'success') {
        setStep('success');
        setTimeout(() => {
          onSuccess(paymentResult);
        }, 2000);
      }

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Payment processing failed",
        variant: "destructive"
      });
      setStep('select');
    } finally {
      setProcessing(false);
    }
  };

  const processMobileMoneyPayment = async (paymentId: string, phone: string, amount: number): Promise<PaymentResult> => {
    // Simulate mobile money payment processing
    // In production, this would integrate with MTN MoMo/Orange Money APIs
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return {
      id: paymentId,
      amount,
      currency,
      status: 'success',
      payment_method: selectedMethod,
      transaction_id: `MOMO_${Date.now()}`,
      metadata: { phone_number: phone }
    };
  };

  const processStripePayment = async (paymentId: string, amount: number): Promise<PaymentResult> => {
    // Simulate Stripe payment processing
    // In production, this would integrate with Stripe API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      id: paymentId,
      amount,
      currency,
      status: 'success',
      payment_method: selectedMethod,
      transaction_id: `STRIPE_${Date.now()}`,
    };
  };

  if (step === 'processing') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
          <p className="text-muted-foreground text-center">
            Please wait while we process your {selectedPaymentMethod?.name} payment...
          </p>
          {selectedMethod.includes('momo') && (
            <Alert className="mt-4">
              <AlertDescription>
                You should receive a payment prompt on your phone. Please approve the transaction.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  if (step === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
          <p className="text-muted-foreground text-center">
            Your payment of {totalAmount.toLocaleString()} {currency} has been processed successfully.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Secure Payment
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Summary */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Amount:</span>
            <span className="font-medium">{amount.toLocaleString()} {currency}</span>
          </div>
          {processingFee > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Processing Fee:</span>
              <span>{processingFee.toFixed(2)} {currency}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span>{totalAmount.toLocaleString()} {currency}</span>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Select Payment Method</Label>
          <RadioGroup
            value={selectedMethod}
            onValueChange={setSelectedMethod}
            className="space-y-3"
          >
            {PAYMENT_METHODS.map((method) => (
              <div
                key={method.id}
                className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 ${
                  selectedMethod === method.id ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <RadioGroupItem value={method.id} id={method.id} />
                <method.icon className="h-5 w-5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{method.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {(method.processing_fee * 100).toFixed(1)}% fee
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Payment Details */}
        {(selectedMethod === 'mtn_momo' || selectedMethod === 'orange_money') && (
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Money Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="6XXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Enter your {selectedMethod === 'mtn_momo' ? 'MTN' : 'Orange'} mobile money number
            </p>
          </div>
        )}

        {/* Security Notice */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Your payment is secured with bank-level encryption. We never store your payment details.
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          )}
          <Button
            onClick={handlePayment}
            disabled={processing || (selectedMethod.includes('momo') && !phoneNumber)}
            className="flex-1"
          >
            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Pay {totalAmount.toLocaleString()} {currency}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};