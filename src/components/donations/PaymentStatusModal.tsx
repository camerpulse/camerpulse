import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNokashPayment } from '@/hooks/useNokashPayment';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Phone,
  CreditCard,
  Calendar,
  History
} from 'lucide-react';

interface PaymentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
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

export const PaymentStatusModal: React.FC<PaymentStatusModalProps> = ({
  isOpen,
  onClose,
  orderId
}) => {
  const [transaction, setTransaction] = useState<TransactionStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const { 
    checkTransactionStatus, 
    retryPayment, 
    pollTransactionStatus, 
    statusChecking, 
    retrying 
  } = useNokashPayment();

  useEffect(() => {
    if (isOpen && orderId) {
      loadTransactionStatus();
      startPolling();
    }
  }, [isOpen, orderId]);

  const loadTransactionStatus = async () => {
    const status = await checkTransactionStatus(orderId);
    if (status) {
      setTransaction(status);
    }
  };

  const startPolling = () => {
    if (isPolling) return;
    
    setIsPolling(true);
    pollTransactionStatus(orderId, (status) => {
      setTransaction(status);
      
      // Stop polling if transaction is complete
      if (['SUCCESS', 'FAILED', 'CANCELLED', 'EXPIRED'].includes(status.status)) {
        setIsPolling(false);
      }
    });
  };

  const handleRetry = async () => {
    if (!transaction) return;
    
    const result = await retryPayment(transaction.order_id);
    if (result.success && result.order_id) {
      // Update to new order ID for polling
      setTransaction(prev => prev ? { ...prev, order_id: result.order_id! } : null);
      startPolling();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'PENDING':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'FAILED':
      case 'CANCELLED':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'EXPIRED':
        return <AlertTriangle className="h-6 w-6 text-gray-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'FAILED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!transaction) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Loading Payment Status...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const canRetry = ['FAILED', 'EXPIRED'].includes(transaction.status);
  const isComplete = ['SUCCESS', 'FAILED', 'CANCELLED', 'EXPIRED'].includes(transaction.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getStatusIcon(transaction.status)}
            <span>Payment Status</span>
          </DialogTitle>
          <DialogDescription>
            Transaction details for order {transaction.order_id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge 
              variant="outline" 
              className={`px-4 py-2 text-sm font-medium ${getStatusColor(transaction.status)}`}
            >
              {transaction.status}
            </Badge>
          </div>

          {/* Transaction Details */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Amount</p>
                  <p className="text-lg font-bold">{formatAmount(transaction.amount)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Method</p>
                  <p className="text-sm">{transaction.payment_method} Money</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm text-muted-foreground">{formatDate(transaction.created_at)}</p>
              </div>
            </div>

            {transaction.completed_at && (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Completed</p>
                  <p className="text-sm text-muted-foreground">{formatDate(transaction.completed_at)}</p>
                </div>
              </div>
            )}

            {transaction.expires_at && transaction.status === 'PENDING' && (
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Expires</p>
                  <p className="text-sm text-muted-foreground">{formatDate(transaction.expires_at)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Status Messages */}
          <div className="bg-muted rounded-lg p-4">
            {transaction.status === 'PENDING' && (
              <div className="text-center">
                <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="font-medium">Waiting for confirmation</p>
                <p className="text-sm text-muted-foreground">
                  Please check your phone and confirm the mobile money transaction
                </p>
                {isPolling && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Checking for updates automatically...
                  </p>
                )}
              </div>
            )}

            {transaction.status === 'SUCCESS' && (
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="font-medium text-green-700">Payment Successful!</p>
                <p className="text-sm text-muted-foreground">
                  Thank you for your donation. Your payment has been processed successfully.
                </p>
              </div>
            )}

            {['FAILED', 'CANCELLED'].includes(transaction.status) && (
              <div className="text-center">
                <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="font-medium text-red-700">Payment Failed</p>
                <p className="text-sm text-muted-foreground">
                  The payment could not be processed. You can try again or use a different payment method.
                </p>
              </div>
            )}

            {transaction.status === 'EXPIRED' && (
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                <p className="font-medium text-gray-700">Payment Expired</p>
                <p className="text-sm text-muted-foreground">
                  The payment request has expired. Please try again.
                </p>
              </div>
            )}
          </div>

          {/* Transaction History */}
          {transaction.history && transaction.history.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Transaction History</p>
                </div>
                <div className="space-y-2">
                  {transaction.history.map((event, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div>
                        {event.old_status && (
                          <span className="text-muted-foreground">{event.old_status} → </span>
                        )}
                        <span className="font-medium">{event.new_status}</span>
                        {event.reason && (
                          <span className="text-muted-foreground ml-2">({event.reason})</span>
                        )}
                      </div>
                      <span className="text-muted-foreground">
                        {formatDate(event.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            <Button
              onClick={loadTransactionStatus}
              variant="outline"
              disabled={statusChecking}
              className="flex-1"
            >
              {statusChecking ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>

            {canRetry && (
              <Button
                onClick={handleRetry}
                disabled={retrying}
                className="flex-1"
              >
                {retrying ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Retry Payment
              </Button>
            )}

            {isComplete && (
              <Button onClick={onClose} className="flex-1">
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};