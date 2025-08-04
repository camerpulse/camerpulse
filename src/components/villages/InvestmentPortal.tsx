import React, { useState } from 'react';
import { TrendingUp, DollarSign, Target, Users, Calendar, Award, AlertCircle, CheckCircle, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useCreateDonation } from '@/hooks/useDiaspora';
import { toast } from 'sonner';

interface InvestmentProject {
  id: string;
  title: string;
  description: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  minimumInvestment: number;
  expectedReturn: string;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'active' | 'funded' | 'completed';
  location: string;
  investorCount: number;
  updates: number;
  imageUrl: string;
  impactMetrics: {
    people_affected: number;
    jobs_created: number;
    sustainability_score: number;
  };
}

interface InvestmentPortalProps {
  villageId: string;
  villageName: string;
}

const SAMPLE_PROJECTS: InvestmentProject[] = [
  {
    id: '1',
    title: 'Solar Power Microgrid for Village',
    description: 'Install solar panels and battery storage to provide 24/7 electricity to all 500 households in the village.',
    category: 'Energy & Infrastructure',
    targetAmount: 75000000, // 75M FCFA
    currentAmount: 45000000, // 45M FCFA
    deadline: '2025-03-15',
    minimumInvestment: 100000, // 100K FCFA
    expectedReturn: '8-12% annual + tax benefits',
    riskLevel: 'low',
    status: 'active',
    location: 'Yaoundé Central',
    investorCount: 28,
    updates: 5,
    imageUrl: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800',
    impactMetrics: {
      people_affected: 2500,
      jobs_created: 15,
      sustainability_score: 95
    }
  },
  {
    id: '2',
    title: 'Women\'s Agricultural Processing Hub',
    description: 'Modern food processing facility to help women farmers add value to their produce and increase income by 300%.',
    category: 'Agriculture & Food',
    targetAmount: 35000000,
    currentAmount: 28000000,
    deadline: '2025-02-28',
    minimumInvestment: 50000,
    expectedReturn: '15-20% annual returns',
    riskLevel: 'medium',
    status: 'active',
    location: 'Obala Market',
    investorCount: 42,
    updates: 8,
    imageUrl: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800',
    impactMetrics: {
      people_affected: 850,
      jobs_created: 35,
      sustainability_score: 88
    }
  },
  {
    id: '3',
    title: 'Digital Health Telemedicine Center',
    description: 'Telemedicine equipment and training to connect village health workers with specialists in major cities.',
    category: 'Healthcare & Technology',
    targetAmount: 45000000,
    currentAmount: 45000000,
    deadline: '2024-12-31',
    minimumInvestment: 75000,
    expectedReturn: 'Social impact + 5% annual',
    riskLevel: 'low',
    status: 'funded',
    location: 'Kribi Health Center',
    investorCount: 35,
    updates: 12,
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
    impactMetrics: {
      people_affected: 15000,
      jobs_created: 8,
      sustainability_score: 92
    }
  }
];

export const InvestmentPortal: React.FC<InvestmentPortalProps> = ({ villageId, villageName }) => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [investmentType, setInvestmentType] = useState('');
  const [showInvestmentForm, setShowInvestmentForm] = useState(false);
  const createDonation = useCreateDonation();

  const handleInvestment = async (projectId: string) => {
    if (!investmentAmount || !investmentType) {
      toast.error('Please fill in all investment details');
      return;
    }

    const project = SAMPLE_PROJECTS.find(p => p.id === projectId);
    if (!project) return;

    try {
      await createDonation.mutateAsync({
        amount_fcfa: parseInt(investmentAmount),
        project_name: project.title,
        donation_type: investmentType,
        payment_method: 'bank_transfer',
        donor_name: 'Current User',
        donor_email: 'user@example.com',
        message: `Investment in ${project.title}`,
        is_anonymous: false
      });

      setShowInvestmentForm(false);
      setInvestmentAmount('');
      setInvestmentType('');
      toast.success('Investment submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit investment');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'funded': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'completed': return <Award className="h-4 w-4 text-purple-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Investment Portal Header */}
      <Card className="bg-gradient-to-r from-green-500/20 to-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <TrendingUp className="h-6 w-6" />
            Village Investment Portal
          </CardTitle>
          <p className="text-muted-foreground">
            Invest in high-impact projects that transform {villageName} while earning returns and creating lasting change
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">₣155M</div>
              <div className="text-sm text-muted-foreground">Total Invested</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">105</div>
              <div className="text-sm text-muted-foreground">Active Investors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">18</div>
              <div className="text-sm text-muted-foreground">Projects Funded</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">12.5%</div>
              <div className="text-sm text-muted-foreground">Avg Return</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="projects">Investment Projects</TabsTrigger>
          <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
          <TabsTrigger value="impact">Impact Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6">
          {/* Project Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Find Investment Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="agriculture">Agriculture</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Investment Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Amount</SelectItem>
                    <SelectItem value="small">₣50K - ₣500K</SelectItem>
                    <SelectItem value="medium">₣500K - ₣2M</SelectItem>
                    <SelectItem value="large">₣2M+</SelectItem>
                  </SelectContent>
                </Select>

                <Button className="w-full">
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Investment Projects */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {SAMPLE_PROJECTS.map((project) => (
              <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={project.imageUrl} 
                    alt={project.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className={getRiskColor(project.riskLevel)}>
                      {project.riskLevel.toUpperCase()} RISK
                    </Badge>
                    <Badge variant="secondary" className="bg-white/90 text-gray-800">
                      {project.category}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    {getStatusIcon(project.status)}
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-lg mb-2">{project.title}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {project.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {project.location}
                    </div>

                    {/* Funding Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Funding Progress</span>
                        <span className="font-medium">
                          {formatCurrency(project.currentAmount)} / {formatCurrency(project.targetAmount)}
                        </span>
                      </div>
                      <Progress 
                        value={(project.currentAmount / project.targetAmount) * 100} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{Math.round((project.currentAmount / project.targetAmount) * 100)}% funded</span>
                        <span>{project.investorCount} investors</span>
                      </div>
                    </div>

                    {/* Investment Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Min. Investment:</span>
                        <div className="font-medium">{formatCurrency(project.minimumInvestment)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expected Return:</span>
                        <div className="font-medium text-green-600">{project.expectedReturn}</div>
                      </div>
                    </div>

                    {/* Impact Metrics */}
                    <div className="border-t pt-4">
                      <div className="text-sm font-medium mb-2">Expected Impact</div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-bold text-blue-600">{project.impactMetrics.people_affected.toLocaleString()}</div>
                          <div className="text-muted-foreground">People Affected</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-green-600">{project.impactMetrics.jobs_created}</div>
                          <div className="text-muted-foreground">Jobs Created</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-purple-600">{project.impactMetrics.sustainability_score}%</div>
                          <div className="text-muted-foreground">Sustainability</div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedProject(project.id);
                          setShowInvestmentForm(true);
                        }}
                        disabled={project.status !== 'active'}
                      >
                        <DollarSign className="h-4 w-4 mr-1" />
                        Invest Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Investment Portfolio</CardTitle>
              <p className="text-muted-foreground">Track your investments and returns</p>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Connect your diaspora profile to view your investment portfolio</p>
                <Button className="mt-4">Connect Profile</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Community Impact Dashboard</CardTitle>
              <p className="text-muted-foreground">See the real-world impact of all investments</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">18,500</div>
                  <div className="text-sm text-muted-foreground">Lives Improved</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">127</div>
                  <div className="text-sm text-muted-foreground">Jobs Created</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">89%</div>
                  <div className="text-sm text-muted-foreground">Project Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Investment Form Modal-like overlay */}
      {showInvestmentForm && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Make Investment</CardTitle>
              <p className="text-muted-foreground">
                {SAMPLE_PROJECTS.find(p => p.id === selectedProject)?.title}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="amount">Investment Amount (FCFA)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="type">Investment Type</Label>
                <Select onValueChange={setInvestmentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select investment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equity">Equity Investment</SelectItem>
                    <SelectItem value="loan">Development Loan</SelectItem>
                    <SelectItem value="grant">Grant/Donation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowInvestmentForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleInvestment(selectedProject)}
                  className="flex-1"
                  disabled={createDonation.isPending}
                >
                  {createDonation.isPending ? 'Processing...' : 'Invest'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};