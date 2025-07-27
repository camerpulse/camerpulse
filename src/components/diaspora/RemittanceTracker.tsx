import React, { useState } from 'react';
import { Send, ArrowDownUp, TrendingUp, Calendar, CheckCircle, Clock, AlertTriangle, Filter, Eye, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface RemittanceTransaction {
  id: string;
  amount: number;
  currency: 'USD' | 'EUR' | 'CAD' | 'GBP';
  amount_fcfa: number;
  exchange_rate: number;
  sender_name: string;
  recipient_name: string;
  recipient_village: string;
  purpose: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  transaction_date: string;
  delivery_date?: string;
  transaction_fee: number;
  tracking_number: string;
  project_allocation?: {
    project_name: string;
    percentage: number;
    amount_fcfa: number;
  }[];
  receipt_confirmed: boolean;
  impact_score?: number;
}

interface RemittanceTrackerProps {
  diasporaProfileId?: string;
}

const SAMPLE_TRANSACTIONS: RemittanceTransaction[] = [
  {
    id: '1',
    amount: 500,
    currency: 'USD',
    amount_fcfa: 295000,
    exchange_rate: 590,
    sender_name: 'Dr. Marie Kamga',
    recipient_name: 'Kamga Family',
    recipient_village: 'Yaoundé',
    purpose: 'Family Support + Health Center',
    status: 'delivered',
    transaction_date: '2024-12-20',
    delivery_date: '2024-12-22',
    transaction_fee: 15,
    tracking_number: 'RMT2024001',
    project_allocation: [
      { project_name: 'Yaoundé Health Center', percentage: 40, amount_fcfa: 118000 },
      { project_name: 'Family Support', percentage: 60, amount_fcfa: 177000 }
    ],
    receipt_confirmed: true,
    impact_score: 95
  },
  {
    id: '2',
    amount: 300,
    currency: 'EUR',
    amount_fcfa: 196800,
    exchange_rate: 656,
    sender_name: 'Emmanuel Nkomo',
    recipient_name: 'Nkomo Community Fund',
    recipient_village: 'Douala',
    purpose: 'Tech Hub Development',
    status: 'in_transit',
    transaction_date: '2024-12-25',
    transaction_fee: 12,
    tracking_number: 'RMT2024002',
    project_allocation: [
      { project_name: 'Douala Tech Hub', percentage: 100, amount_fcfa: 196800 }
    ],
    receipt_confirmed: false
  },
  {
    id: '3',
    amount: 750,
    currency: 'CAD',
    amount_fcfa: 325500,
    exchange_rate: 434,
    sender_name: 'Grace Ngo',
    recipient_name: 'Kribi Health Initiative',
    recipient_village: 'Kribi',
    purpose: 'Maternal Health Program',
    status: 'delivered',
    transaction_date: '2024-12-18',
    delivery_date: '2024-12-20',
    transaction_fee: 18,
    tracking_number: 'RMT2024003',
    project_allocation: [
      { project_name: 'Maternal Health Center', percentage: 80, amount_fcfa: 260400 },
      { project_name: 'Emergency Fund', percentage: 20, amount_fcfa: 65100 }
    ],
    receipt_confirmed: true,
    impact_score: 92
  }
];

export const RemittanceTracker: React.FC<RemittanceTrackerProps> = ({ diasporaProfileId }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('last_6_months');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNewRemittance, setShowNewRemittance] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in_transit': return <ArrowDownUp className="h-4 w-4 text-blue-500" />;
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatFCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totalSent = SAMPLE_TRANSACTIONS.reduce((sum, t) => sum + t.amount_fcfa, 0);
  const totalFees = SAMPLE_TRANSACTIONS.reduce((sum, t) => sum + (t.transaction_fee * 590), 0); // Convert fees to FCFA
  const avgDeliveryTime = 2.3; // days
  const successRate = 95; // percentage

  return (
    <div className="space-y-6">
      {/* Remittance Summary */}
      <Card className="bg-gradient-to-r from-blue-500/20 to-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Send className="h-6 w-6" />
            Remittance Tracker
          </CardTitle>
          <p className="text-muted-foreground">
            Track your money transfers and their impact on village development
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{formatFCFA(totalSent)}</div>
              <div className="text-sm text-muted-foreground">Total Sent (6 months)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{SAMPLE_TRANSACTIONS.length}</div>
              <div className="text-sm text-muted-foreground">Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{avgDeliveryTime} days</div>
              <div className="text-sm text-muted-foreground">Avg Delivery Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{successRate}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="impact">Impact Dashboard</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="new">Send Money</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last_month">Last Month</SelectItem>
                    <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                    <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                    <SelectItem value="last_year">Last Year</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" className="ml-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              {/* Transaction List */}
              <div className="space-y-4">
                {SAMPLE_TRANSACTIONS.map((transaction) => (
                  <Card key={transaction.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(transaction.status)}
                          <div>
                            <div className="font-semibold">{transaction.tracking_number}</div>
                            <div className="text-sm text-muted-foreground">
                              {transaction.sender_name} → {transaction.recipient_name}
                            </div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Amount Sent</div>
                          <div className="font-semibold">
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatFCFA(transaction.amount_fcfa)} (Rate: {transaction.exchange_rate})
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Purpose</div>
                          <div className="font-medium">{transaction.purpose}</div>
                          <div className="text-sm text-muted-foreground">{transaction.recipient_village}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Transaction Date</div>
                          <div className="font-medium">{transaction.transaction_date}</div>
                          {transaction.delivery_date && (
                            <div className="text-sm text-green-600">
                              Delivered: {transaction.delivery_date}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Project Allocation */}
                      {transaction.project_allocation && (
                        <div className="border-t pt-4">
                          <div className="text-sm font-medium mb-2">Fund Allocation</div>
                          <div className="space-y-2">
                            {transaction.project_allocation.map((allocation, index) => (
                              <div key={index} className="flex justify-between items-center text-sm">
                                <span>{allocation.project_name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">{allocation.percentage}%</span>
                                  <span className="font-medium">{formatFCFA(allocation.amount_fcfa)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Impact Score */}
                      {transaction.impact_score && transaction.status === 'delivered' && (
                        <div className="border-t pt-4 mt-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Community Impact Score</span>
                            <div className="flex items-center gap-2">
                              <Progress value={transaction.impact_score} className="w-20 h-2" />
                              <span className="text-sm font-bold text-green-600">
                                {transaction.impact_score}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        {transaction.status === 'delivered' && !transaction.receipt_confirmed && (
                          <Button size="sm" variant="outline">
                            Confirm Receipt
                          </Button>
                        )}
                        {transaction.status === 'pending' && (
                          <Button size="sm" variant="destructive">
                            Cancel
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Development Impact</CardTitle>
              <p className="text-muted-foreground">See how your remittances are transforming communities</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Projects Supported</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">Yaoundé Health Center</div>
                        <div className="text-sm text-muted-foreground">Healthcare Infrastructure</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatFCFA(118000)}</div>
                        <div className="text-sm text-green-600">Lives saved: 2,500</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">Maternal Health Center</div>
                        <div className="text-sm text-muted-foreground">Healthcare Program</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatFCFA(260400)}</div>
                        <div className="text-sm text-green-600">Mothers helped: 450</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Impact Metrics</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Healthcare Access</span>
                        <span>92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Education Quality</span>
                        <span>78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Economic Growth</span>
                        <span>85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Remittance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Sending Patterns</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Average per month</span>
                      <span className="font-medium">{formatFCFA(totalSent / 6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total fees paid</span>
                      <span className="font-medium">{formatFCFA(totalFees)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Fee percentage</span>
                      <span className="font-medium">{((totalFees / totalSent) * 100).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Currency Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>USD Transactions</span>
                      <span>1 (33.3%)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>EUR Transactions</span>
                      <span>1 (33.3%)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>CAD Transactions</span>
                      <span>1 (33.3%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Money to Village</CardTitle>
              <p className="text-muted-foreground">
                Send money to family or contribute to community projects
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Remittance sending feature coming soon!</p>
                <p className="text-sm mt-2">Connect with trusted money transfer partners</p>
                <Button className="mt-4">Get Notified When Available</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};