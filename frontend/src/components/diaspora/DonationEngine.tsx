import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  DollarSign, 
  Building2, 
  MapPin, 
  Calendar,
  Users,
  TrendingUp,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type InvestmentProject = Database['public']['Tables']['diaspora_investment_projects']['Row'];
type DiasporaProfile = Database['public']['Tables']['diaspora_profiles']['Row'];

export const DonationEngine = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<InvestmentProject[]>([]);
  const [diasporaProfile, setDiasporaProfile] = useState<DiasporaProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [donationForm, setDonationForm] = useState({
    amount_fcfa: '',
    donation_message: '',
    is_anonymous: false,
    payment_method: 'card'
  });
  const [selectedProject, setSelectedProject] = useState<InvestmentProject | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    region: '',
    status: 'active'
  });

  useEffect(() => {
    fetchData();
  }, [user, filters]);

  const fetchData = async () => {
    try {
      // Fetch diaspora profile
      if (user) {
        const { data: profileData } = await supabase
          .from('diaspora_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (profileData) {
          setDiasporaProfile(profileData);
        }
      }

      // Fetch projects with filters
      let query = supabase
        .from('diaspora_investment_projects')
        .select('*')
        .eq('project_status', filters.status || 'active')
        .order('created_at', { ascending: false });

      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.region) {
        query = query.ilike('location', `%${filters.region}%`);
      }

      const { data: projectsData } = await query;
      
      if (projectsData) {
        setProjects(projectsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async (project: InvestmentProject) => {
    if (!diasporaProfile) {
      toast({
        title: "Profile Required",
        description: "Please create your diaspora profile first.",
        variant: "destructive"
      });
      return;
    }

    try {
      const amount = parseFloat(donationForm.amount_fcfa);
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid donation amount.",
          variant: "destructive"
        });
        return;
      }

      // Insert donation record
      const { error } = await supabase
        .from('diaspora_donations')
        .insert({
          diaspora_profile_id: diasporaProfile.id,
          project_id: project.id,
          amount_fcfa: amount,
          amount_usd: amount / 600, // Approximate conversion
          donation_message: donationForm.donation_message,
          donation_status: 'pending',
          payment_method: donationForm.payment_method,
          is_anonymous: donationForm.is_anonymous
        });

      if (error) throw error;

      toast({
        title: "Donation Submitted",
        description: "Your donation has been submitted successfully!",
      });

      // Reset form
      setDonationForm({
        amount_fcfa: '',
        donation_message: '',
        is_anonymous: false,
        payment_method: 'card'
      });
      setSelectedProject(null);

    } catch (error) {
      console.error('Error making donation:', error);
      toast({
        title: "Error",
        description: "Failed to submit donation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const categories = [
    'Education', 'Healthcare', 'Infrastructure', 'Agriculture', 
    'Technology', 'Environment', 'Social Services', 'Emergency Relief'
  ];

  const regions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Support Development Projects
          </h1>
          <p className="text-muted-foreground">
            Make a direct impact by supporting verified development projects across Cameroon
          </p>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="projects">Browse Projects</TabsTrigger>
            <TabsTrigger value="emergency">Emergency Relief</TabsTrigger>
            <TabsTrigger value="impact">Impact Tracker</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Region</Label>
                    <Select value={filters.region} onValueChange={(value) => setFilters(prev => ({ ...prev, region: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All regions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All regions</SelectItem>
                        {regions.map(region => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary">{project.category}</Badge>
                      <Badge variant={project.project_status === 'active' ? 'default' : 'outline'}>
                        {project.project_status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {project.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {project.location}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{project.completion_percentage}%</span>
                      </div>
                      <Progress value={project.completion_percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Raised: {project.raised_amount_fcfa.toLocaleString()} FCFA</span>
                        <span>Target: {project.target_amount_fcfa.toLocaleString()} FCFA</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Expected completion: {new Date(project.expected_completion_date).toLocaleDateString()}
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => setSelectedProject(project)}
                      disabled={project.project_status !== 'active'}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Support Project
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="emergency">
            <Card>
              <CardHeader>
                <CardTitle>Emergency Relief Fund</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Emergency relief projects will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="impact">
            <Card>
              <CardHeader>
                <CardTitle>Your Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Impact tracking dashboard will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Donation Modal */}
        {selectedProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle>Support: {selectedProject.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="amount">Donation Amount (FCFA)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={donationForm.amount_fcfa}
                    onChange={(e) => setDonationForm(prev => ({ ...prev, amount_fcfa: e.target.value }))}
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    value={donationForm.donation_message}
                    onChange={(e) => setDonationForm(prev => ({ ...prev, donation_message: e.target.value }))}
                    placeholder="Add a message of support"
                  />
                </div>

                <div>
                  <Label>Payment Method</Label>
                  <Select value={donationForm.payment_method} onValueChange={(value) => setDonationForm(prev => ({ ...prev, payment_method: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={donationForm.is_anonymous}
                    onChange={(e) => setDonationForm(prev => ({ ...prev, is_anonymous: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="anonymous">Make this donation anonymous</Label>
                </div>

                <div className="flex gap-3">
                  <Button 
                    className="flex-1" 
                    onClick={() => handleDonate(selectedProject)}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Donate Now
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedProject(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};