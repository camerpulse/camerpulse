import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentRequest {
  order_id: string;
  amount: number;
  phone: string;
  payment_method: 'MTN' | 'ORANGE';
  user_id?: string;
  idempotency_key?: string;
}

interface PaymentResponse {
  success: boolean;
  message: string;
  order_id?: string;
  error?: string;
  nokash_response?: any;
  duplicate?: boolean;
  remainingRequests?: number;
  retryCount?: number;
}

interface TransactionStatus {
  order_id: string;
  status: string;
  amount: number;
  payment_method: string;
  created_at: string;
  completed_at?: string;
  expires_at?: string;
  history: Array<{
    old_status?: string;
    new_status: string;
    created_at: string;
    reason?: string;
  }>;
}

export const useNokashPayment = () => {
  const [loading, setLoading] = useState(false);
  const [statusChecking, setStatusChecking] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const { toast } = useToast();

  const initiateMobileMoneyPayment = async (
    paymentData: PaymentRequest
  ): Promise<PaymentResponse> => {
    setLoading(true);
    
    try {
      // Generate idempotency key if not provided
      const idempotencyKey = paymentData.idempotency_key || generateIdempotencyKey();
      
      const { data, error } = await supabase.functions.invoke('nokash-payment/pay', {
        body: {
          ...paymentData,
          idempotency_key: idempotencyKey
        }
      });

      if (error) {
        throw new Error(error.message || 'Payment initiation failed');
      }

      if (data?.success) {
        if (data.duplicate) {
          toast({
            title: "Payment Already Processed",
            description: "This payment has already been initiated",
            variant: "default",
          });
        } else {
          toast({
            title: "Payment Initiated",
            description: `Please check your phone to confirm the mobile money transaction. ${data.remainingRequests ? `${data.remainingRequests} requests remaining.` : ''}`,
          });
        }
        
        return {
          success: true,
          message: data.duplicate ? "Payment already processed" : "Payment initiated successfully",
          order_id: data.order_id,
          nokash_response: data.nokash_response,
          duplicate: data.duplicate,
          remainingRequests: data.remainingRequests
        };
      } else {
        throw new Error(data?.error || 'Payment failed');
      }
    } catch (error: any) {
      let errorMessage = error.message || 'An unexpected error occurred';
      
      // Handle specific error types
      if (error.message?.includes('Rate limit exceeded')) {
        errorMessage = 'Too many payment attempts. Please try again later.';
      } else if (error.message?.includes('Amount must be between')) {
        errorMessage = 'Invalid amount. Please enter an amount between 100 and 1,000,000 XAF.';
      }
      
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

  const checkTransactionStatus = async (orderId: string): Promise<TransactionStatus | null> => {
    setStatusChecking(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('nokash-payment/status', {
        method: 'GET',
        body: {},
        headers: {
          'Content-Type': 'application/json'
        }
      }, {
        query: { order_id: orderId }
      });

      if (error) {
        throw new Error('Failed to check transaction status');
      }

      if (data?.success && data.transaction) {
        return data.transaction;
      }

      return null;
    } catch (error: any) {
      console.error('Error checking transaction status:', error);
      toast({
        title: "Status Check Failed",
        description: "Unable to check payment status. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setStatusChecking(false);
    }
  };

  const retryPayment = async (orderId: string): Promise<PaymentResponse> => {
    setRetrying(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('nokash-payment/retry', {
        body: { order_id: orderId }
      });

      if (error) {
        throw new Error(error.message || 'Payment retry failed');
      }

      if (data?.success) {
        toast({
          title: "Payment Retry Initiated",
          description: "A new payment request has been sent to your phone",
        });
        
        return {
          success: true,
          message: "Payment retry initiated successfully",
          order_id: data.order_id,
          nokash_response: data.nokash_response
        };
      } else {
        throw new Error(data?.error || 'Retry failed');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Payment retry failed';
      
      toast({
        title: "Retry Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return {
        success: false,
        message: errorMessage,
        error: errorMessage
      };
    } finally {
      setRetrying(false);
    }
  };

  const getUserTransactions = async (limit: number = 20, offset: number = 0) => {
    try {
      const { data, error } = await supabase
        .from('nokash_transactions')
        .select(`
          *,
          transaction_status_history (
            old_status,
            new_status,
            created_at,
            reason
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error('Failed to fetch transactions');
      }

      return data;
    } catch (error: any) {
      console.error('Error fetching user transactions:', error);
      return [];
    }
  };

  const pollTransactionStatus = useCallback(async (
    orderId: string, 
    onStatusChange: (status: TransactionStatus) => void,
    maxAttempts: number = 20,
    intervalMs: number = 3000
  ) => {
    let attempts = 0;
    
    const poll = async () => {
      if (attempts >= maxAttempts) {
        console.log('Max polling attempts reached for', orderId);
        return;
      }
      
      const status = await checkTransactionStatus(orderId);
      if (status) {
        onStatusChange(status);
        
        // Stop polling if transaction is complete
        if (['SUCCESS', 'FAILED', 'CANCELLED', 'EXPIRED'].includes(status.status)) {
          return;
        }
      }
      
      attempts++;
      setTimeout(poll, intervalMs);
    };
    
    poll();
  }, []);

  const generateOrderId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `DON-${timestamp}-${random}`;
  };

  const generateIdempotencyKey = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 16)}`;
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

  const validateAmount = (amount: number) => {
    return amount >= 100 && amount <= 1000000;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'text-green-600';
      case 'PENDING':
        return 'text-yellow-600';
      case 'FAILED':
      case 'CANCELLED':
        return 'text-red-600';
      case 'EXPIRED':
        return 'text-gray-600';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return '✅';
      case 'PENDING':
        return '⏳';
      case 'FAILED':
      case 'CANCELLED':
        return '❌';
      case 'EXPIRED':
        return '⏰';
      default:
        return '❓';
    }
  };

  return {
    // Payment operations
    initiateMobileMoneyPayment,
    retryPayment,
    
    // Status operations
    checkTransactionStatus,
    pollTransactionStatus,
    getUserTransactions,
    
    // Utilities
    generateOrderId,
    generateIdempotencyKey,
    formatPhoneNumber,
    validatePhoneNumber,
    validateAmount,
    getStatusColor,
    getStatusIcon,
    
    // Loading states
    loading,
    statusChecking,
    retrying
  };
};