import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  Heart, 
  Building, 
  Users, 
  MapPin,
  Receipt,
  QrCode,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DiasporaProfile {
  id: string;
  full_name: string;
  home_region: string;
}

interface DonationEngineProps {
  diasporaProfile: DiasporaProfile;
  onDonationSuccess: () => void;
}

interface InvestmentProject {
  id: string;
  project_name: string;
  project_description: string;
  target_region: string;
  project_category: string;
  funding_goal_fcfa: number;
  funding_raised_fcfa: number;
  progress_percentage: number;
  project_status: string;
}

const DONATION_TYPES = {
  project: 'Specific Project',
  emergency: 'Emergency Relief',
  community: 'Community Development',
  general: 'General Support'
};

const PAYMENT_METHODS = [
  'Mobile Money',
  'Bank Transfer',
  'International Wire',
  'PayPal',
  'Western Union',
  'MoneyGram'
];

export const DonationEngine: React.FC<DonationEngineProps> = ({
  diasporaProfile,
  onDonationSuccess
}) => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<InvestmentProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');
  
  const [donationData, setDonationData] = useState({
    donation_type: '',
    target_type: '',
    target_id: '',
    amount_fcfa: '',
    currency: 'FCFA',
    payment_method: '',
    purpose: '',
    message: '',
    is_anonymous: false
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('diaspora_investment_projects')
        .select('*')
        .eq('verification_status', 'verified')
        .eq('project_status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const amount = parseInt(donationData.amount_fcfa);
      if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      const donation = {
        donor_id: diasporaProfile.id,
        donation_type: donationData.donation_type,
        target_type: donationData.target_type,
        target_id: donationData.target_id || null,
        amount_fcfa: amount,
        amount_usd: amount / 600, // Simplified conversion
        currency: donationData.currency,
        payment_method: donationData.payment_method,
        purpose: donationData.purpose,
        message: donationData.message || null,
        is_anonymous: donationData.is_anonymous,
        transaction_reference: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        qr_code_data: `DONATION-${Date.now()}`,
        status: 'pending'
      };

      const { error } = await supabase
        .from('diaspora_donations')
        .insert([donation]);

      if (error) throw error;

      toast({
        title: "Donation Initiated",
        description: "Your donation has been submitted. You will receive payment instructions shortly.",
      });

      // Reset form
      setDonationData({
        donation_type: '',
        target_type: '',
        target_id: '',
        amount_fcfa: '',
        currency: 'FCFA',
        payment_method: '',
        purpose: '',
        message: '',
        is_anonymous: false
      });

      onDonationSuccess();
    } catch (error: any) {
      console.error('Error creating donation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process donation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Make a Difference Today</h2>
        <p className="text-muted-foreground">
          Support projects and communities in Cameroon from anywhere in the world
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="donate">Donate</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4">
            {projects.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No verified projects available at the moment.</p>
                </CardContent>
              </Card>
            ) : (
              projects.map(project => (
                <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{project.project_name}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {project.project_description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {project.target_region}
                          </div>
                          <Badge variant="outline">{project.project_category}</Badge>
                        </div>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => {
                          setDonationData(prev => ({
                            ...prev,
                            donation_type: 'project',
                            target_type: 'project',
                            target_id: project.id,
                            purpose: `Support for ${project.project_name}`
                          }));
                          setActiveTab('donate');
                        }}
                      >
                        Support
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{project.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(project.progress_percentage)}`}
                          style={{ width: `${Math.min(project.progress_percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{formatCurrency(project.funding_raised_fcfa)} FCFA raised</span>
                        <span>Goal: {formatCurrency(project.funding_goal_fcfa)} FCFA</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="donate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Make a Donation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Donation Type</Label>
                    <Select 
                      value={donationData.donation_type} 
                      onValueChange={(value) => setDonationData(prev => ({ ...prev, donation_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select donation type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(DONATION_TYPES).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Amount (FCFA)</Label>
                    <Input
                      type="number"
                      value={donationData.amount_fcfa}
                      onChange={(e) => setDonationData(prev => ({ ...prev, amount_fcfa: e.target.value }))}
                      placeholder="Enter amount"
                      min="1000"
                      required
                    />
                    {donationData.amount_fcfa && (
                      <p className="text-sm text-muted-foreground">
                        ≈ ${(parseInt(donationData.amount_fcfa) / 600).toFixed(2)} USD
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Purpose</Label>
                  <Input
                    value={donationData.purpose}
                    onChange={(e) => setDonationData(prev => ({ ...prev, purpose: e.target.value }))}
                    placeholder="Brief description of donation purpose"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select 
                    value={donationData.payment_method} 
                    onValueChange={(value) => setDonationData(prev => ({ ...prev, payment_method: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map(method => (
                        <SelectItem key={method} value={method}>{method}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Message (Optional)</Label>
                  <Textarea
                    value={donationData.message}
                    onChange={(e) => setDonationData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Add a personal message or dedication"
                    rows={3}
                  />
                </div>

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

                <Button 
                  type="submit" 
                  disabled={loading || !donationData.donation_type || !donationData.amount_fcfa || !donationData.payment_method}
                  className="w-full"
                >
                  {loading ? 'Processing...' : 'Proceed with Donation'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="py-8 text-center">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Your donation history will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};