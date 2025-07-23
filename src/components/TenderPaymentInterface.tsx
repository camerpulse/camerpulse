import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Wallet, Smartphone, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useTenderPayment } from '@/hooks/useTenderPayment';
import { useToast } from '@/hooks/use-toast';

interface TenderPaymentInterfaceProps {
  tenderId: string;
  tenderTitle: string;
  onPaymentSuccess?: () => void;
  onClose?: () => void;
}

export const TenderPaymentInterface: React.FC<TenderPaymentInterfaceProps> = ({
  tenderId,
  tenderTitle,
  onPaymentSuccess,
  onClose
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('stripe');
  const [mockWalletBalance] = useState(50000); // Mock wallet balance: 50,000 XAF
  const { toast } = useToast();

  const {
    isLoading,
    paymentPlans,
    selectedPlan,
    setSelectedPlan,
    fetchPaymentPlans,
    processStripePayment,
    processWalletPayment,
    processMobileMoneyPayment
  } = useTenderPayment({
    tenderId,
    onPaymentSuccess: () => {
      onPaymentSuccess?.();
      onClose?.();
    }
  });

  useEffect(() => {
    fetchPaymentPlans();
  }, []);

  const formatCurrency = (amount: number, currency: 'XAF' | 'USD' = 'XAF') => {
    if (currency === 'XAF') {
      return `${amount.toLocaleString()} XAF`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const handlePayment = async () => {
    if (!selectedPlan) {
      toast({
        title: "Error",
        description: "Please select a payment plan",
        variant: "destructive",
      });
      return;
    }

    switch (selectedPaymentMethod) {
      case 'stripe':
        await processStripePayment(selectedPlan.id);
        break;
      case 'camerWallet':
        await processWalletPayment(selectedPlan.id, mockWalletBalance);
        break;
      case 'mtnMomo':
        await processMobileMoneyPayment(selectedPlan.id, 'mtnMomo');
        break;
      case 'orangeMoney':
        await processMobileMoneyPayment(selectedPlan.id, 'orangeMoney');
        break;
      default:
        toast({
          title: "Error",
          description: "Please select a payment method",
          variant: "destructive",
        });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Tender Payment
          </CardTitle>
          <CardDescription>
            Complete payment to publish your tender: "{tenderTitle}"
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Payment Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Select Payment Plan</CardTitle>
          <CardDescription>Choose the visibility plan for your tender</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={selectedPlan?.id} 
            onValueChange={(value) => {
              const plan = paymentPlans.find(p => p.id === value);
              setSelectedPlan(plan || null);
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {paymentPlans.map((plan) => (
              <div key={plan.id} className="relative">
                <RadioGroupItem value={plan.id} id={plan.id} className="sr-only" />
                <Label htmlFor={plan.id} className="cursor-pointer">
                  <Card className={`transition-all duration-200 hover:shadow-md ${
                    selectedPlan?.id === plan.id ? 'ring-2 ring-primary' : ''
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{plan.plan_name}</CardTitle>
                        {plan.plan_type === 'featured' && (
                          <Badge variant="secondary">Popular</Badge>
                        )}
                        {plan.plan_type === 'government' && (
                          <Badge variant="outline">Free</Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(plan.price_fcfa)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(plan.price_usd, 'USD')}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          {plan.duration_days} days visibility
                        </div>
                        {plan.features && Object.keys(plan.features).map((feature) => (
                          plan.features[feature] && (
                            <div key={feature} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              {feature.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}
                            </div>
                          )
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      {selectedPlan && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Choose how you want to pay</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
              <div className="space-y-3">
                {/* Stripe */}
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="stripe" id="stripe" />
                  <Label htmlFor="stripe" className="flex items-center gap-3 cursor-pointer flex-1">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Credit/Debit Card</div>
                      <div className="text-sm text-muted-foreground">Secure payment via Stripe</div>
                    </div>
                  </Label>
                </div>

                {/* CamerWallet */}
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="camerWallet" id="camerWallet" />
                  <Label htmlFor="camerWallet" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Wallet className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="font-medium">CamerWallet</div>
                      <div className="text-sm text-muted-foreground">
                        Balance: {formatCurrency(mockWalletBalance)}
                        {mockWalletBalance < (selectedPlan?.price_fcfa || 0) && (
                          <span className="text-red-500 ml-2">Insufficient balance</span>
                        )}
                      </div>
                    </div>
                  </Label>
                </div>

                {/* MTN Mobile Money */}
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="mtnMomo" id="mtnMomo" />
                  <Label htmlFor="mtnMomo" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Smartphone className="h-5 w-5" />
                    <div>
                      <div className="font-medium">MTN Mobile Money</div>
                      <div className="text-sm text-muted-foreground">Pay with MTN MoMo</div>
                    </div>
                  </Label>
                </div>

                {/* Orange Money */}
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="orangeMoney" id="orangeMoney" />
                  <Label htmlFor="orangeMoney" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Smartphone className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Orange Money</div>
                      <div className="text-sm text-muted-foreground">Pay with Orange Money</div>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Payment Summary & Action */}
      {selectedPlan && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Plan:</span>
                <span className="font-medium">{selectedPlan.plan_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{selectedPlan.duration_days} days</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(Math.round(selectedPlan.price_fcfa / 1.1925))}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (19.25%):</span>
                <span>{formatCurrency(selectedPlan.price_fcfa - Math.round(selectedPlan.price_fcfa / 1.1925))}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(selectedPlan.price_fcfa)}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button 
                onClick={handlePayment}
                disabled={isLoading || (selectedPaymentMethod === 'camerWallet' && mockWalletBalance < selectedPlan.price_fcfa)}
                className="flex-1"
              >
                {isLoading ? 'Processing...' : `Pay ${formatCurrency(selectedPlan.price_fcfa)}`}
              </Button>
              {onClose && (
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              )}
            </div>

            {selectedPaymentMethod === 'camerWallet' && mockWalletBalance < selectedPlan.price_fcfa && (
              <div className="flex items-center gap-2 mt-3 p-3 bg-red-50 text-red-700 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">
                  Insufficient wallet balance. Please top up your CamerWallet or choose another payment method.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};