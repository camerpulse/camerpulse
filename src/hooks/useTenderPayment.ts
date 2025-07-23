import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PaymentPlan {
  id: string;
  plan_name: string;
  plan_type: string;
  price_fcfa: number;
  price_usd: number;
  duration_days: number;
  features: any;
  priority_score?: number;
}

interface UseTenderPaymentProps {
  tenderId?: string;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
}

export const useTenderPayment = ({ tenderId, onPaymentSuccess, onPaymentError }: UseTenderPaymentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPaymentPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('tender_payment_plans')
        .select('*')
        .eq('is_active', true)
        .order('priority_score', { ascending: true });

      if (error) throw error;
      setPaymentPlans(data || []);
    } catch (error) {
      console.error('Error fetching payment plans:', error);
      toast({
        title: "Error",
        description: "Failed to load payment plans",
        variant: "destructive",
      });
    }
  };

  const createPaymentRecord = async (planId: string) => {
    if (!tenderId) throw new Error('Tender ID is required');
    if (!user?.id) throw new Error('User not authenticated');

    const plan = paymentPlans.find(p => p.id === planId);
    if (!plan) throw new Error('Plan not found');

    const { data, error } = await supabase
      .from('tender_payments')
      .insert({
        user_id: user.id,
        tender_id: tenderId,
        plan_id: planId,
        amount_fcfa: plan.price_fcfa,
        amount_usd: plan.price_usd,
        currency: 'XAF',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const processStripePayment = async (planId: string) => {
    setIsLoading(true);
    try {
      // First create payment record
      await createPaymentRecord(planId);

      const plan = paymentPlans.find(p => p.id === planId);
      if (!plan) throw new Error('Plan not found');

      // Create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-tender-payment', {
        body: {
          planId,
          tenderId,
          amount: plan.price_fcfa, // Amount in XAF centimes
          currency: 'XAF'
        }
      });

      if (error) throw error;

      // Redirect to Stripe checkout
      if (data?.url) {
        window.open(data.url, '_blank');
        onPaymentSuccess?.();
      }
    } catch (error) {
      console.error('Error processing Stripe payment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      onPaymentError?.(errorMessage);
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processWalletPayment = async (planId: string, walletBalance: number) => {
    setIsLoading(true);
    try {
      const plan = paymentPlans.find(p => p.id === planId);
      if (!plan) throw new Error('Plan not found');

      if (walletBalance < plan.price_fcfa) {
        throw new Error('Insufficient wallet balance');
      }

      // Create payment record
      const payment = await createPaymentRecord(planId);

      // Process through wallet function
      const { data, error } = await supabase.functions.invoke('process-tender-payment', {
        body: {
          paymentId: payment.id,
          action: 'camerWallet',
          walletData: { balance: walletBalance }
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Payment Successful",
          description: `Payment processed via CamerWallet. Transaction ID: ${data.transactionId}`,
        });
        onPaymentSuccess?.();
      } else {
        throw new Error(data?.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Error processing wallet payment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      onPaymentError?.(errorMessage);
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processMobileMoneyPayment = async (planId: string, provider: 'mtnMomo' | 'orangeMoney') => {
    setIsLoading(true);
    try {
      // Create payment record
      const payment = await createPaymentRecord(planId);

      // Process through mobile money function
      const { data, error } = await supabase.functions.invoke('process-tender-payment', {
        body: {
          paymentId: payment.id,
          action: provider
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Payment Successful",
          description: `Payment processed via ${provider}. Transaction ID: ${data.transactionId}`,
        });
        onPaymentSuccess?.();
      } else {
        throw new Error(data?.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Error processing mobile money payment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      onPaymentError?.(errorMessage);
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    paymentPlans,
    selectedPlan,
    setSelectedPlan,
    fetchPaymentPlans,
    processStripePayment,
    processWalletPayment,
    processMobileMoneyPayment
  };
};