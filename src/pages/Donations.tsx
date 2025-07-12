import { useState, useEffect } from 'react';
import { Header } from '@/components/Layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, 
  DollarSign, 
  Users, 
  TrendingUp,
  CreditCard,
  Shield,
  Target,
  Globe,
  Flag,
  Banknote
} from 'lucide-react';

interface Donation {
  id: string;
  amount: number;
  currency: string;
  message?: string;
  is_anonymous: boolean;
  payment_status: string;
  created_at: string;
  user_id?: string;
}

const Donations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);
  const [donationForm, setDonationForm] = useState({
    amount: '',
    currency: 'XAF',
    message: '',
    isAnonymous: false
  });

  // Mock fundraising goal for demonstration
  const fundraisingGoal = 10000000; // 10 million XAF
  const currentAmount = donations.reduce((sum, d) => 
    d.currency === 'XAF' ? sum + d.amount : sum + (d.amount * 656), 0
  ); // Convert other currencies to XAF roughly

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('payment_status', 'completed')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setDonations(data || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast({
        title: "Error",
        description: "Failed to load donations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDonation = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to make a donation",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(donationForm.amount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid donation amount",
        variant: "destructive"
      });
      return;
    }

    try {
      setDonating(true);

      const { error } = await supabase
        .from('donations')
        .insert({
          user_id: donationForm.isAnonymous ? null : user.id,
          amount: amount,
          currency: donationForm.currency,
          message: donationForm.message || null,
          is_anonymous: donationForm.isAnonymous,
          payment_status: 'pending', // In real app, this would be handled by payment processor
          payment_method: 'card'
        });

      if (error) throw error;

      toast({
        title: "Donation initiated!",
        description: "Thank you for supporting CamerPulse. You will be redirected to payment.",
      });

      // Reset form
      setDonationForm({
        amount: '',
        currency: 'XAF',
        message: '',
        isAnonymous: false
      });

      // In a real app, redirect to payment processor here
      // For demo, we'll just refresh donations
      setTimeout(() => {
        fetchDonations();
      }, 2000);

    } catch (error) {
      console.error('Error creating donation:', error);
      toast({
        title: "Donation failed",
        description: "There was an error processing your donation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDonating(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: currency === 'XAF' ? 'XAF' : currency
    }).format(amount);
  };

  const progressPercentage = Math.min((currentAmount / fundraisingGoal) * 100, 100);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Support Democratic Progress in Cameroon
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Your contribution helps build a transparent, accountable platform for civic engagement. 
              Together, we can strengthen democracy and empower every Cameroonian voice.
            </p>
            
            {/* Fundraising Progress */}
            <Card className="bg-gradient-civic text-primary-foreground">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold mb-2">
                    {formatAmount(currentAmount, 'XAF')}
                  </div>
                  <div className="text-primary-foreground/80">
                    raised of {formatAmount(fundraisingGoal, 'XAF')} goal
                  </div>
                </div>
                
                <Progress value={progressPercentage} className="h-3 mb-4" />
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{donations.length}</div>
                    <div className="text-sm text-primary-foreground/80">Donors</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{progressPercentage.toFixed(1)}%</div>
                    <div className="text-sm text-primary-foreground/80">Complete</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">∞</div>
                    <div className="text-sm text-primary-foreground/80">Days Left</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Donation Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Make a Donation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={donationForm.currency} 
                      onValueChange={(value) => setDonationForm(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XAF">XAF</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="amount"
                      type="number"
                      value={donationForm.amount}
                      onChange={(e) => setDonationForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      className="flex-1"
                      min="1"
                    />
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {[1000, 5000, 10000].map(amount => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setDonationForm(prev => ({ ...prev, amount: amount.toString() }))}
                    >
                      {donationForm.currency === 'XAF' ? `${amount}` : `${amount/656}`}
                    </Button>
                  ))}
                </div>

                <div>
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    value={donationForm.message}
                    onChange={(e) => setDonationForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Share why you're supporting CamerPulse..."
                    rows={3}
                    maxLength={200}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={donationForm.isAnonymous}
                    onChange={(e) => setDonationForm(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="anonymous" className="text-sm">
                    Make this donation anonymous
                  </Label>
                </div>

                <Button 
                  onClick={handleDonation}
                  disabled={donating || !donationForm.amount}
                  className="w-full"
                  size="lg"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {donating ? 'Processing...' : 'Donate Now'}
                </Button>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Secure payment processing</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Impact & Recent Donations */}
          <div className="lg:col-span-2 space-y-8">
            {/* Impact Statement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Your Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Platform Development</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Secure infrastructure & hosting</li>
                      <li>• Advanced security features</li>
                      <li>• Real-time data processing</li>
                      <li>• Mobile app development</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Community Building</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Educational outreach programs</li>
                      <li>• Civic engagement workshops</li>
                      <li>• Digital literacy training</li>
                      <li>• Grassroots organizing support</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Donations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recent Supporters
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-full"></div>
                          <div className="space-y-1">
                            <div className="w-24 h-4 bg-muted rounded"></div>
                            <div className="w-32 h-3 bg-muted rounded"></div>
                          </div>
                        </div>
                        <div className="w-16 h-6 bg-muted rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : donations.length === 0 ? (
                  <div className="text-center py-8">
                    <Banknote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No donations yet. Be the first to support the cause!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {donations.slice(0, 10).map((donation) => (
                      <div key={donation.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <Heart className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {donation.is_anonymous ? 'Anonymous Supporter' : 'Supporter'}
                            </div>
                            {donation.message && (
                              <p className="text-sm text-muted-foreground italic">
                                "{donation.message}"
                              </p>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {new Date(donation.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {formatAmount(donation.amount, donation.currency)}
                          </div>
                          <Badge variant={donation.payment_status === 'completed' ? 'default' : 'secondary'}>
                            {donation.payment_status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transparency */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5" />
                  Financial Transparency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">85%</div>
                    <div className="text-sm text-muted-foreground">Platform Development</div>
                  </div>
                  
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Globe className="w-8 h-8 text-cm-green mx-auto mb-2" />
                    <div className="text-2xl font-bold">10%</div>
                    <div className="text-sm text-muted-foreground">Community Outreach</div>
                  </div>
                  
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-cm-yellow mx-auto mb-2" />
                    <div className="text-2xl font-bold">5%</div>
                    <div className="text-sm text-muted-foreground">Operations</div>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>
                    All donations are publicly tracked and allocated transparently. 
                    We publish quarterly reports on fund usage and platform development progress.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Donations;