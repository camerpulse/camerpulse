import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, DollarSign, Users, TrendingUp } from 'lucide-react';

interface DonationsManagerProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const DonationsManager: React.FC<DonationsManagerProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  // Mock data for donations
  const donations = [
    {
      id: '1',
      donor_name: 'Anonymous',
      amount: 50000,
      currency: 'FCFA',
      cause: 'Education Development',
      status: 'completed',
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      donor_name: 'John Doe',
      amount: 25000,
      currency: 'FCFA',
      cause: 'Healthcare Support',
      status: 'pending',
      created_at: '2024-01-14T15:30:00Z'
    }
  ];

  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
  const completedDonations = donations.filter(d => d.status === 'completed');

  const handleProcessDonation = (donationId: string) => {
    logActivity('donation_processed', { donation_id: donationId });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center">
          <Heart className="h-6 w-6 mr-2 text-red-500" />
          Donations Management
        </h2>
        <p className="text-muted-foreground">Monitor and manage platform donations and contributions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{totalDonations.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total FCFA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{donations.length}</p>
                <p className="text-sm text-muted-foreground">Total Donations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{completedDonations.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {donations.length > 0 ? Math.round(totalDonations / donations.length).toLocaleString() : 0}
                </p>
                <p className="text-sm text-muted-foreground">Avg Amount</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
          <CardDescription>Monitor and process donation transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {donations.map((donation) => (
              <div key={donation.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="font-semibold">{donation.donor_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {donation.amount.toLocaleString()} {donation.currency} • {donation.cause}
                    </p>
                  </div>
                  <Badge variant={donation.status === 'completed' ? 'default' : 'secondary'}>
                    {donation.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  {donation.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => handleProcessDonation(donation.id)}
                    >
                      Process
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {donations.length === 0 && (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Donations Yet</h3>
              <p className="text-muted-foreground">Donations will appear here once received</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Donation Analytics</CardTitle>
          <CardDescription>Track donation trends and impact</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-4">Top Causes</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Education Development</span>
                  <span className="font-medium">50,000 FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span>Healthcare Support</span>
                  <span className="font-medium">25,000 FCFA</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Monthly Trends</h4>
              <div className="text-center py-8 text-muted-foreground">
                Donation trends chart would appear here
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};