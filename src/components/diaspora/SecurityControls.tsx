import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  QrCode, 
  Calendar, 
  DollarSign, 
  Shield, 
  FileText,
  ExternalLink,
  Eye,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TransactionRecord {
  id: string;
  transaction_type: 'donation' | 'investment' | 'remittance';
  amount_fcfa: number;
  amount_original_currency?: number;
  original_currency: string;
  project_name?: string;
  payment_method: string;
  payment_reference: string;
  payment_status: 'completed' | 'pending' | 'failed';
  qr_receipt_data?: any;
  created_at: string;
  audit_trail: any;
}

interface SecurityControlsProps {
  profile?: any;
}

export const SecurityControls = ({ profile }: SecurityControlsProps) => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<'transactions' | 'receipts' | 'audit'>('transactions');

  // Mock transaction data - replace with actual API calls
  const mockTransactions: TransactionRecord[] = [
    {
      id: '1',
      transaction_type: 'donation',
      amount_fcfa: 50000,
      amount_original_currency: 85,
      original_currency: 'USD',
      project_name: 'Digital Education Hub - Maroua',
      payment_method: 'flutterwave',
      payment_reference: 'FLW-TXN-2024-001',
      payment_status: 'completed',
      qr_receipt_data: {
        verification_code: 'QR-2024-001',
        issued_at: '2024-01-15T10:30:00Z'
      },
      created_at: '2024-01-15T10:30:00Z',
      audit_trail: {
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0...',
        verification_level: 'verified'
      }
    },
    {
      id: '2',
      transaction_type: 'investment',
      amount_fcfa: 150000,
      amount_original_currency: 200,
      original_currency: 'EUR',
      project_name: 'Solar Power Initiative - Northwest Region',
      payment_method: 'flutterwave',
      payment_reference: 'FLW-TXN-2024-002',
      payment_status: 'completed',
      qr_receipt_data: {
        verification_code: 'QR-2024-002',
        issued_at: '2024-01-20T14:15:00Z'
      },
      created_at: '2024-01-20T14:15:00Z',
      audit_trail: {
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0...',
        verification_level: 'verified'
      }
    }
  ];

  const handleDownloadReceipt = (transactionId: string) => {
    // Generate and download receipt
    toast({
      title: "Receipt Downloaded",
      description: "Your transaction receipt has been downloaded successfully.",
    });
  };

  const handleViewQRCode = (transactionId: string) => {
    toast({
      title: "QR Code Displayed",
      description: "Scan this QR code to verify your transaction on any CamerPulse portal.",
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'donation': return 'bg-blue-100 text-blue-800';
      case 'investment': return 'bg-purple-100 text-purple-800';
      case 'remittance': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Security & Audit Center</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Track all your transactions, download verified receipts, and access audit trails for complete transparency
        </p>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{mockTransactions.length}</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified Receipts</p>
                <p className="text-2xl font-bold">{mockTransactions.filter(t => t.qr_receipt_data).length}</p>
              </div>
              <QrCode className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Security Level</p>
                <p className="text-2xl font-bold text-green-600">Verified</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant={selectedTab === 'transactions' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('transactions')}
          className="flex items-center gap-2"
        >
          <DollarSign className="h-4 w-4" />
          Transaction History
        </Button>
        <Button
          variant={selectedTab === 'receipts' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('receipts')}
          className="flex items-center gap-2"
        >
          <QrCode className="h-4 w-4" />
          QR Receipts
        </Button>
        <Button
          variant={selectedTab === 'audit' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('audit')}
          className="flex items-center gap-2"
        >
          <Shield className="h-4 w-4" />
          Audit Trail
        </Button>
      </div>

      {/* Transaction History */}
      {selectedTab === 'transactions' && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              Complete history of all your diaspora platform transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTransactions.map((transaction) => (
                <div key={transaction.id} className="border rounded-lg p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getTypeColor(transaction.transaction_type)}>
                          {transaction.transaction_type}
                        </Badge>
                        <Badge className={getStatusColor(transaction.payment_status)}>
                          {transaction.payment_status}
                        </Badge>
                      </div>
                      
                      <div>
                        <h3 className="font-medium">{transaction.project_name || 'General Contribution'}</h3>
                        <p className="text-sm text-muted-foreground">
                          Ref: {transaction.payment_reference}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Amount: </span>
                          <span className="font-medium">
                            {formatAmount(transaction.amount_fcfa, 'XAF')}
                            {transaction.amount_original_currency && (
                              <span className="text-muted-foreground ml-2">
                                ({formatAmount(transaction.amount_original_currency, transaction.original_currency)})
                              </span>
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date: </span>
                          <span>{formatDate(transaction.created_at)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Method: </span>
                          <span className="capitalize">{transaction.payment_method}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status: </span>
                          <span className="capitalize">{transaction.payment_status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadReceipt(transaction.id)}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Receipt
                      </Button>
                      {transaction.qr_receipt_data && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewQRCode(transaction.id)}
                          className="flex items-center gap-2"
                        >
                          <QrCode className="h-4 w-4" />
                          QR Code
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Receipts */}
      {selectedTab === 'receipts' && (
        <Card>
          <CardHeader>
            <CardTitle>QR Code Receipts</CardTitle>
            <CardDescription>
              Verified digital receipts with QR codes for instant verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTransactions
                .filter(t => t.qr_receipt_data)
                .map((transaction) => (
                  <Card key={transaction.id} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge className={getTypeColor(transaction.transaction_type)}>
                          {transaction.transaction_type}
                        </Badge>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                          <QrCode className="h-12 w-12 text-gray-400" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {transaction.qr_receipt_data.verification_code}
                        </p>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Amount:</span>
                          <span className="ml-2">{formatAmount(transaction.amount_fcfa, 'XAF')}</span>
                        </div>
                        <div>
                          <span className="font-medium">Date:</span>
                          <span className="ml-2">{formatDate(transaction.created_at)}</span>
                        </div>
                        <div>
                          <span className="font-medium">Project:</span>
                          <span className="ml-2 text-xs">{transaction.project_name || 'General'}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleViewQRCode(transaction.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleDownloadReceipt(transaction.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Trail */}
      {selectedTab === 'audit' && (
        <Card>
          <CardHeader>
            <CardTitle>Security Audit Trail</CardTitle>
            <CardDescription>
              Detailed security logs and verification information for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Account Security Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    Account Verification
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Identity Verified:</span>
                      <Badge variant="outline" className="text-green-600">Verified</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Diaspora Profile:</span>
                      <Badge variant="outline" className="text-green-600">Complete</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Methods:</span>
                      <Badge variant="outline" className="text-green-600">Verified</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    Transaction Security
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Transactions:</span>
                      <span>{mockTransactions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verified Receipts:</span>
                      <span>{mockTransactions.filter(t => t.qr_receipt_data).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Audit Compliance:</span>
                      <Badge variant="outline" className="text-green-600">100%</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Security Events */}
              <div>
                <h3 className="font-medium mb-4">Recent Security Events</h3>
                <div className="space-y-3">
                  {mockTransactions.slice(0, 3).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Transaction Completed</p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.payment_reference} • {formatDate(transaction.created_at)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600">Verified</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};