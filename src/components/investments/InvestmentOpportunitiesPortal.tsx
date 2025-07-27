import React, { useState } from 'react';
import { TrendingUp, DollarSign, BarChart3, PieChart, Target, Award, AlertTriangle, CheckCircle, Clock, Users, MapPin, Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';

interface InvestmentOpportunity {
  id: string;
  title: string;
  description: string;
  category: 'infrastructure' | 'agriculture' | 'healthcare' | 'education' | 'technology' | 'tourism';
  location: string;
  village: string;
  targetAmount: number;
  currentAmount: number;
  minInvestment: number;
  expectedReturn: {
    min: number;
    max: number;
    timeframe: string;
  };
  riskLevel: 'low' | 'medium' | 'high';
  duration: string;
  investorCount: number;
  projectManager: string;
  status: 'fundraising' | 'funded' | 'in_progress' | 'completed';
  startDate: string;
  projectedCompletion: string;
  businessPlan: string;
  financials: {
    revenue: number;
    expenses: number;
    profit: number;
  };
  milestones: Array<{
    title: string;
    date: string;
    completed: boolean;
  }>;
  risks: string[];
  benefits: string[];
  imageUrl: string;
}

interface Portfolio {
  totalInvested: number;
  totalReturns: number;
  activeInvestments: number;
  completedInvestments: number;
  averageReturn: number;
  investments: Array<{
    id: string;
    title: string;
    amount: number;
    currentValue: number;
    returnPercentage: number;
    status: string;
  }>;
}

const SAMPLE_OPPORTUNITIES: InvestmentOpportunity[] = [
  {
    id: '1',
    title: 'Yaoundé Eco-Tourism Lodge',
    description: 'Sustainable tourism lodge showcasing traditional Cameroon culture while providing economic opportunities for the local community',
    category: 'tourism',
    location: 'Yaoundé Region',
    village: 'Yaoundé Central',
    targetAmount: 85000000,
    currentAmount: 52000000,
    minInvestment: 500000,
    expectedReturn: { min: 12, max: 18, timeframe: '2-3 years' },
    riskLevel: 'medium',
    duration: '3 years',
    investorCount: 23,
    projectManager: 'Samuel Mbong',
    status: 'fundraising',
    startDate: '2025-03-01',
    projectedCompletion: '2027-12-31',
    businessPlan: 'Detailed 45-page business plan with market analysis',
    financials: { revenue: 45000000, expenses: 32000000, profit: 13000000 },
    milestones: [
      { title: 'Land acquisition', date: '2025-03-15', completed: false },
      { title: 'Construction permits', date: '2025-04-30', completed: false },
      { title: 'Foundation laying', date: '2025-06-01', completed: false }
    ],
    risks: ['Weather-dependent tourism', 'Currency fluctuation', 'Regulatory changes'],
    benefits: ['Creates 25 jobs', 'Preserves cultural heritage', 'Sustainable development'],
    imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800'
  },
  {
    id: '2',
    title: 'Mbalmayo Organic Farm Co-op',
    description: 'Large-scale organic farming cooperative producing cocoa, coffee, and vegetables for export markets',
    category: 'agriculture',
    location: 'Central Region',
    village: 'Mbalmayo',
    targetAmount: 45000000,
    currentAmount: 38000000,
    minInvestment: 250000,
    expectedReturn: { min: 15, max: 22, timeframe: '18 months' },
    riskLevel: 'low',
    duration: '2 years',
    investorCount: 34,
    projectManager: 'Marie Kouame',
    status: 'funded',
    startDate: '2025-01-15',
    projectedCompletion: '2026-12-31',
    businessPlan: 'Comprehensive agricultural development plan',
    financials: { revenue: 65000000, expenses: 42000000, profit: 23000000 },
    milestones: [
      { title: 'Equipment procurement', date: '2025-02-01', completed: true },
      { title: 'Farmer training', date: '2025-03-01', completed: false },
      { title: 'First harvest', date: '2025-08-01', completed: false }
    ],
    risks: ['Climate change effects', 'Market price volatility', 'Pest management'],
    benefits: ['100% organic certification', 'Supports 50 families', 'Export revenue'],
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800'
  },
  {
    id: '3',
    title: 'Douala Tech Innovation Hub',
    description: 'Technology incubator and training center fostering digital entrepreneurship in rural communities',
    category: 'technology',
    location: 'Littoral Region',
    village: 'Douala',
    targetAmount: 120000000,
    currentAmount: 24000000,
    minInvestment: 1000000,
    expectedReturn: { min: 20, max: 35, timeframe: '3-5 years' },
    riskLevel: 'high',
    duration: '5 years',
    investorCount: 12,
    projectManager: 'Dr. Paul Nkomo',
    status: 'fundraising',
    startDate: '2025-06-01',
    projectedCompletion: '2030-05-31',
    businessPlan: 'Tech ecosystem development strategy',
    financials: { revenue: 95000000, expenses: 68000000, profit: 27000000 },
    milestones: [
      { title: 'Building lease agreement', date: '2025-04-01', completed: false },
      { title: 'Equipment installation', date: '2025-07-01', completed: false },
      { title: 'First cohort launch', date: '2025-09-01', completed: false }
    ],
    risks: ['Technology obsolescence', 'Skills gap', 'Market competition'],
    benefits: ['Trains 200+ youth annually', 'Creates digital jobs', 'Innovation catalyst'],
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800'
  }
];

const SAMPLE_PORTFOLIO: Portfolio = {
  totalInvested: 5500000,
  totalReturns: 785000,
  activeInvestments: 4,
  completedInvestments: 2,
  averageReturn: 14.3,
  investments: [
    { id: '1', title: 'Village Solar Grid', amount: 2000000, currentValue: 2280000, returnPercentage: 14, status: 'active' },
    { id: '2', title: 'Women\'s Market Center', amount: 1500000, currentValue: 1725000, returnPercentage: 15, status: 'completed' },
    { id: '3', title: 'Youth Training Center', amount: 1000000, currentValue: 1100000, returnPercentage: 10, status: 'active' },
    { id: '4', title: 'Health Clinic Equipment', amount: 1000000, currentValue: 1180000, returnPercentage: 18, status: 'active' }
  ]
};

export const InvestmentOpportunitiesPortal: React.FC = () => {
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<number[]>([500000]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [sortBy, setSortBy] = useState('return');

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
      case 'fundraising': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'funded': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'completed': return <Award className="h-4 w-4 text-purple-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const calculateProjectedReturn = (opportunity: InvestmentOpportunity, amount: number) => {
    const averageReturn = (opportunity.expectedReturn.min + opportunity.expectedReturn.max) / 2;
    return (amount * averageReturn) / 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <TrendingUp className="h-6 w-6" />
            Investment Opportunities Portal
          </CardTitle>
          <p className="text-muted-foreground">
            Discover high-impact investment opportunities that drive sustainable development in Cameroon villages
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">₣245M</div>
              <div className="text-sm text-muted-foreground">Total Investment Pool</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">156</div>
              <div className="text-sm text-muted-foreground">Active Investors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">23</div>
              <div className="text-sm text-muted-foreground">Live Opportunities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">16.8%</div>
              <div className="text-sm text-muted-foreground">Avg Annual Return</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="opportunities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
          <TabsTrigger value="calculator">ROI Calculator</TabsTrigger>
          <TabsTrigger value="analytics">Market Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="agriculture">Agriculture</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="tourism">Tourism</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="risk">Risk Level</Label>
                  <Select value={filterRisk} onValueChange={setFilterRisk}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Risk Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk Levels</SelectItem>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sort">Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="return">Expected Return</SelectItem>
                      <SelectItem value="funding">Funding Progress</SelectItem>
                      <SelectItem value="deadline">Deadline</SelectItem>
                      <SelectItem value="min-investment">Min Investment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button className="w-full">Apply Filters</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opportunities Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {SAMPLE_OPPORTUNITIES.map((opportunity) => (
              <Card key={opportunity.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={opportunity.imageUrl}
                    alt={opportunity.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className={getRiskColor(opportunity.riskLevel)}>
                      {opportunity.riskLevel.toUpperCase()} RISK
                    </Badge>
                    <Badge variant="secondary" className="bg-white/90 text-gray-800 capitalize">
                      {opportunity.category}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    {getStatusIcon(opportunity.status)}
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-lg mb-2">{opportunity.title}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {opportunity.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {opportunity.village}, {opportunity.location}
                    </div>

                    {/* Funding Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Funding Progress</span>
                        <span className="font-medium">
                          {formatCurrency(opportunity.currentAmount)} / {formatCurrency(opportunity.targetAmount)}
                        </span>
                      </div>
                      <Progress 
                        value={(opportunity.currentAmount / opportunity.targetAmount) * 100} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{Math.round((opportunity.currentAmount / opportunity.targetAmount) * 100)}% funded</span>
                        <span>{opportunity.investorCount} investors</span>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Min Investment:</span>
                        <div className="font-medium">{formatCurrency(opportunity.minInvestment)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expected Return:</span>
                        <div className="font-medium text-green-600">
                          {opportunity.expectedReturn.min}%-{opportunity.expectedReturn.max}%
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <div className="font-medium">{opportunity.duration}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Project Manager:</span>
                        <div className="font-medium">{opportunity.projectManager}</div>
                      </div>
                    </div>

                    {/* Benefits Preview */}
                    <div>
                      <div className="text-sm font-medium mb-2">Key Benefits</div>
                      <div className="flex flex-wrap gap-1">
                        {opportunity.benefits.slice(0, 2).map((benefit, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {benefit}
                          </Badge>
                        ))}
                        {opportunity.benefits.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{opportunity.benefits.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedOpportunity(opportunity.id)}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        disabled={opportunity.status === 'completed'}
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
          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{formatCurrency(SAMPLE_PORTFOLIO.totalInvested)}</div>
                <p className="text-sm text-muted-foreground">Total Invested</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(SAMPLE_PORTFOLIO.totalReturns)}</div>
                <p className="text-sm text-muted-foreground">Total Returns</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{SAMPLE_PORTFOLIO.activeInvestments}</div>
                <p className="text-sm text-muted-foreground">Active Investments</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{SAMPLE_PORTFOLIO.averageReturn}%</div>
                <p className="text-sm text-muted-foreground">Average Return</p>
              </CardContent>
            </Card>
          </div>

          {/* Portfolio Details */}
          <Card>
            <CardHeader>
              <CardTitle>Investment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {SAMPLE_PORTFOLIO.investments.map((investment) => (
                  <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{investment.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Invested: {formatCurrency(investment.amount)} • 
                        Current: {formatCurrency(investment.currentValue)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${investment.returnPercentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {investment.returnPercentage > 0 ? '+' : ''}{investment.returnPercentage}%
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {investment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Investment Return Calculator
              </CardTitle>
              <p className="text-muted-foreground">
                Calculate potential returns for different investment scenarios
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="investment-amount">Investment Amount (FCFA)</Label>
                    <div className="mt-2">
                      <Slider
                        value={investmentAmount}
                        onValueChange={setInvestmentAmount}
                        max={10000000}
                        min={100000}
                        step={100000}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>₣100K</span>
                        <span className="font-medium">{formatCurrency(investmentAmount[0])}</span>
                        <span>₣10M</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="opportunity-select">Select Opportunity</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an investment opportunity" />
                      </SelectTrigger>
                      <SelectContent>
                        {SAMPLE_OPPORTUNITIES.map((opportunity) => (
                          <SelectItem key={opportunity.id} value={opportunity.id}>
                            {opportunity.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-4">Projected Returns</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Conservative (12%):</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(investmentAmount[0] * 0.12)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Optimistic (18%):</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(investmentAmount[0] * 0.18)}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg font-semibold">
                          <span>Total Value:</span>
                          <span className="text-green-600">
                            {formatCurrency(investmentAmount[0] + (investmentAmount[0] * 0.15))}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Sector Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Agriculture</span>
                    <div className="flex items-center gap-2">
                      <Progress value={85} className="w-20 h-2" />
                      <span className="text-sm font-medium">18.5%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Technology</span>
                    <div className="flex items-center gap-2">
                      <Progress value={75} className="w-20 h-2" />
                      <span className="text-sm font-medium">22.3%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Healthcare</span>
                    <div className="flex items-center gap-2">
                      <Progress value={65} className="w-20 h-2" />
                      <span className="text-sm font-medium">15.7%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tourism</span>
                    <div className="flex items-center gap-2">
                      <Progress value={60} className="w-20 h-2" />
                      <span className="text-sm font-medium">14.2%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Risk Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span>Low Risk</span>
                    </div>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <span>Medium Risk</span>
                    </div>
                    <span className="font-medium">35%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <span>High Risk</span>
                    </div>
                    <span className="font-medium">20%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};