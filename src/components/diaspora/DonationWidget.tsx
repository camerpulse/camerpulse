import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { QrCode, Heart, DollarSign, CreditCard, Smartphone, Building } from 'lucide-react';
import { useCreateDonation, useInvestmentProjects } from '@/hooks/useDiaspora';

const { useState } = React;

interface Profile {
  id: string;
  full_name: string;
  country_of_residence: string;
  home_village_town_city: string;
}

interface DonationWidgetProps {
  profile?: Profile;
}

const DONATION_TYPES = [
  { value: 'project', label: 'Specific Project', icon: Building },
  { value: 'village_development', label: 'Village Development', icon: Heart },
  { value: 'emergency', label: 'Emergency Relief', icon: Heart },
  { value: 'general', label: 'General Fund', icon: DollarSign },
];

const PAYMENT_METHODS = [
  { value: 'mobile_money', label: 'Mobile Money', icon: Smartphone },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: Building },
  { value: 'crypto', label: 'Cryptocurrency', icon: CreditCard },
  { value: 'card', label: 'Credit/Debit Card', icon: CreditCard },
];

const PRESET_AMOUNTS = [10000, 25000, 50000, 100000, 250000, 500000];

export const DonationWidget: React.FC<DonationWidgetProps> = ({ profile }) => {
  const [donationData, setDonationData] = useState({
    amount_fcfa: '',
    donation_type: '',
    project_id: '',
    payment_method: '',
    donation_message: '',
    is_anonymous: false,
  });

  const { data: projects } = useInvestmentProjects({ status: 'fundraising' });
  const createDonation = useCreateDonation();

  const handleAmountPreset = (amount: number) => {
    setDonationData(prev => ({ ...prev, amount_fcfa: amount.toString() }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    createDonation.mutate({
      diaspora_profile_id: profile.id,
      project_id: donationData.project_id || undefined,
      amount_fcfa: parseInt(donationData.amount_fcfa),
      amount_usd: Math.round(parseInt(donationData.amount_fcfa) / 600 * 100) / 100, // Rough conversion
      donation_type: donationData.donation_type,
      payment_method: donationData.payment_method,
      donation_message: donationData.donation_message || undefined,
      is_anonymous: donationData.is_anonymous,
    });
  };

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Login Required</CardTitle>
          <CardDescription>
            Please log in and create your diaspora profile to make donations
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            Make a Donation
          </CardTitle>
          <CardDescription>
            Support development projects in Cameroon through secure donations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Donation Type */}
            <div className="space-y-2">
              <Label>Donation Type</Label>
              <div className="grid grid-cols-2 gap-3">
                {DONATION_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div
                      key={type.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        donationData.donation_type === type.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setDonationData(prev => ({ ...prev, donation_type: type.value }))}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{type.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Specific Project Selection */}
            {donationData.donation_type === 'project' && (
              <div className="space-y-2">
                <Label>Select Project</Label>
                <Select 
                  value={donationData.project_id} 
                  onValueChange={(value) => setDonationData(prev => ({ ...prev, project_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a project to support" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{project.title}</span>
                          <Badge variant="outline" className="ml-2">
                            {project.category}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Amount */}
            <div className="space-y-3">
              <Label>Donation Amount (FCFA)</Label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_AMOUNTS.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant={donationData.amount_fcfa === amount.toString() ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleAmountPreset(amount)}
                  >
                    {amount.toLocaleString()}
                  </Button>
                ))}
              </div>
              <Input
                placeholder="Enter custom amount"
                value={donationData.amount_fcfa}
                onChange={(e) => setDonationData(prev => ({ ...prev, amount_fcfa: e.target.value }))}
                required
              />
              {donationData.amount_fcfa && (
                <p className="text-sm text-muted-foreground">
                  ≈ ${Math.round(parseInt(donationData.amount_fcfa) / 600 * 100) / 100} USD
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  return (
                    <div
                      key={method.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        donationData.payment_method === method.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setDonationData(prev => ({ ...prev, payment_method: method.value }))}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{method.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a message with your donation..."
                value={donationData.donation_message}
                onChange={(e) => setDonationData(prev => ({ ...prev, donation_message: e.target.value }))}
              />
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={donationData.is_anonymous}
                onCheckedChange={(checked) => 
                  setDonationData(prev => ({ ...prev, is_anonymous: checked as boolean }))
                }
              />
              <Label htmlFor="anonymous" className="text-sm">
                Make this donation anonymous
              </Label>
            </div>

            {/* Submit */}
            <div className="space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={createDonation.isPending || !donationData.amount_fcfa || !donationData.donation_type || !donationData.payment_method}
              >
                {createDonation.isPending ? 'Processing...' : 'Donate Now'}
              </Button>
              
              <div className="text-center">
                <Button type="button" variant="outline" size="sm">
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate QR Receipt
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p className="font-medium">🔒 Secure Donation Platform</p>
            <p>All donations are processed securely with full audit trails and QR receipt verification.</p>
            <p>Your contribution directly supports verified development projects in Cameroon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};