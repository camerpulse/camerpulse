import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentRequest {
  order_id: string;
  amount: number;
  phone: string;
  payment_method: 'MTN' | 'ORANGE';
  user_id?: string;
}

interface PaymentResponse {
  success: boolean;
  message: string;
  order_id?: string;
  error?: string;
  nokash_response?: any;
}

export const useNokashPayment = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const initiateMobileMoneyPayment = async (
    paymentData: PaymentRequest
  ): Promise<PaymentResponse> => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('nokash-payment/pay', {
        body: paymentData
      });

      if (error) {
        throw new Error(error.message || 'Payment initiation failed');
      }

      if (data?.success) {
        toast({
          title: "Payment Initiated",
          description: "Please check your phone to confirm the mobile money transaction",
        });
        
        return {
          success: true,
          message: "Payment initiated successfully",
          order_id: paymentData.order_id,
          nokash_response: data.nokash_response
        };
      } else {
        throw new Error(data?.error || 'Payment failed');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return {
        success: false,
        message: errorMessage,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const checkTransactionStatus = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('nokash_transactions')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error) {
        throw new Error('Failed to check transaction status');
      }

      return data;
    } catch (error: any) {
      console.error('Error checking transaction status:', error);
      return null;
    }
  };

  const generateOrderId = () => {
    return `DON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // If it starts with 237, remove it (Cameroon country code)
    if (cleaned.startsWith('237')) {
      return cleaned.substring(3);
    }
    
    // If it starts with +237, remove it
    if (cleaned.startsWith('+237')) {
      return cleaned.substring(4);
    }
    
    return cleaned;
  };

  const validatePhoneNumber = (phoneNumber: string) => {
    const formatted = formatPhoneNumber(phoneNumber);
    // Cameroon mobile numbers are typically 9 digits starting with 6 or 7
    return /^[67]\d{8}$/.test(formatted);
  };

  return {
    initiateMobileMoneyPayment,
    checkTransactionStatus,
    generateOrderId,
    formatPhoneNumber,
    validatePhoneNumber,
    loading
  };
};