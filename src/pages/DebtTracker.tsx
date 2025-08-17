import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank, 
  CreditCard,
  Building,
  Calendar,
  Globe,
  AlertCircle,
  Info,
  FileText
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface DebtData {
  id: string;
  year: number;
  total_debt: number;
  external_debt: number;
  internal_debt: number;
  debt_to_gdp_ratio: number;
  gdp: number;
  debt_service: number;
  creditors: Creditor[];
  projects: DebtProject[];
}

interface Creditor {
  name: string;
  amount: number;
  type: 'bilateral' | 'multilateral' | 'commercial';
  currency: string;
}

interface DebtProject {
  name: string;
  amount: number;
  sector: string;
  completion_status: number;
  creditor: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const DebtTracker: React.FC = () => {
  const [debtData, setDebtData] = useState<DebtData[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('2024');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    fetchDebtData();
  }, []);

  const fetchDebtData = async () => {
    try {
      // Mock data - replace with actual Supabase query
      const mockData: DebtData[] = [
        {
          id: '2024',
          year: 2024,
          total_debt: 12500000000000, // 12.5 trillion FCFA
          external_debt: 8750000000000, // 8.75 trillion FCFA  
          internal_debt: 3750000000000, // 3.75 trillion FCFA
          debt_to_gdp_ratio: 42.8,
          gdp: 29200000000000, // 29.2 trillion FCFA
          debt_service: 1890000000000, // 1.89 trillion FCFA
          creditors: [
            { name: 'World Bank', amount: 2500000000000, type: 'multilateral', currency: 'USD' },
            { name: 'IMF', amount: 1200000000000, type: 'multilateral', currency: 'USD' },
            { name: 'China (EXIM Bank)', amount: 3800000000000, type: 'bilateral', currency: 'USD' },
            { name: 'France (AFD)', amount: 950000000000, type: 'bilateral', currency: 'EUR' },
            { name: 'Commercial Banks', amount: 300000000000, type: 'commercial', currency: 'USD' }
          ],
          projects: [
            { name: 'Kribi Port Expansion', amount: 1200000000000, sector: 'Infrastructure', completion_status: 85, creditor: 'China (EXIM Bank)' },
            { name: 'Yaoundé-Douala Highway', amount: 800000000000, sector: 'Transport', completion_status: 92, creditor: 'World Bank' },
            { name: 'Memve\'ele Hydroelectric', amount: 400000000000, sector: 'Energy', completion_status: 100, creditor: 'China (EXIM Bank)' }
          ]
        },
        {
          id: '2023',
          year: 2023,
          total_debt: 11800000000000,
          external_debt: 8260000000000,
          internal_debt: 3540000000000,
          debt_to_gdp_ratio: 41.2,
          gdp: 28650000000000,
          debt_service: 1750000000000,
          creditors: [],
          projects: []
        },
        {
          id: '2022',
          year: 2022,
          total_debt: 11200000000000,
          external_debt: 7840000000000,
          internal_debt: 3360000000000,
          debt_to_gdp_ratio: 39.8,
          gdp: 28100000000000,
          debt_service: 1620000000000,
          creditors: [],
          projects: []
        },
        {
          id: '2021',
          year: 2021,
          total_debt: 10650000000000,
          external_debt: 7455000000000,
          internal_debt: 3195000000000,
          debt_to_gdp_ratio: 38.5,
          gdp: 27650000000000,
          debt_service: 1520000000000,
          creditors: [],
          projects: []
        },
        {
          id: '2020',
          year: 2020,
          total_debt: 9980000000000,
          external_debt: 6986000000000,
          internal_debt: 2994000000000,
          debt_to_gdp_ratio: 36.2,
          gdp: 27560000000000,
          debt_service: 1410000000000,
          creditors: [],
          projects: []
        }
      ];
      
      setDebtData(mockData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load debt data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000000) {
      return `${(amount / 1000000000000).toFixed(1)}T FCFA`;
    } else if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B FCFA`;
    } else {
      return `${(amount / 1000000).toFixed(1)}M FCFA`;
    }
  };

  const currentData = debtData.find(d => d.year.toString() === selectedYear) || debtData[0];
  
  const chartData = debtData.map(d => ({
    year: d.year,
    totalDebt: d.total_debt / 1000000000000,
    externalDebt: d.external_debt / 1000000000000,
    internalDebt: d.internal_debt / 1000000000000,
    debtToGDP: d.debt_to_gdp_ratio,
    debtService: d.debt_service / 1000000000000
  }));

  const creditorData = currentData?.creditors.map(c => ({
    name: c.name,
    value: c.amount / 1000000000000,
    type: c.type
  })) || [];

  const sectorData = currentData?.projects.reduce((acc, project) => {
    const existing = acc.find(item => item.sector === project.sector);
    if (existing) {
      existing.amount += project.amount / 1000000000000;
    } else {
      acc.push({ sector: project.sector, amount: project.amount / 1000000000000 });
    }
    return acc;
  }, [] as { sector: string; amount: number }[]) || [];

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">National Debt Transparency Tracker</h1>
              <p className="text-muted-foreground">
                Real-time monitoring of Cameroon's national debt, creditors, and debt-financed projects
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {debtData.map(d => (
                  <SelectItem key={d.year} value={d.year.toString()}>{d.year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Last Updated: January 2025
            </Badge>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Debt</p>
                  <p className="text-2xl font-bold">{formatCurrency(currentData?.total_debt || 0)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-500">+5.9% from 2023</span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Debt-to-GDP Ratio</p>
                  <p className="text-2xl font-bold">{currentData?.debt_to_gdp_ratio.toFixed(1)}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-orange-500" />
                    <span className="text-xs text-orange-500">+1.6pp from 2023</span>
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <Progress value={currentData?.debt_to_gdp_ratio || 0} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">External Debt</p>
                  <p className="text-2xl font-bold">{formatCurrency(currentData?.external_debt || 0)}</p>
                  <p className="text-xs text-muted-foreground">
                    {((currentData?.external_debt || 0) / (currentData?.total_debt || 1) * 100).toFixed(1)}% of total
                  </p>
                </div>
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Debt Service</p>
                  <p className="text-2xl font-bold">{formatCurrency(currentData?.debt_service || 0)}</p>
                  <p className="text-xs text-muted-foreground">Annual payment</p>
                </div>
                <PiggyBank className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="creditors">Creditors</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Debt Composition ({selectedYear})</CardTitle>
                  <CardDescription>Breakdown of external vs internal debt</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'External Debt', value: currentData?.external_debt || 0 },
                          { name: 'Internal Debt', value: currentData?.internal_debt || 0 }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'External Debt', value: currentData?.external_debt || 0 },
                          { name: 'Internal Debt', value: currentData?.internal_debt || 0 }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Debt Sustainability Analysis</CardTitle>
                  <CardDescription>Key indicators and risk assessment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Debt-to-GDP Ratio</span>
                      <span className="text-sm font-medium">{currentData?.debt_to_gdp_ratio.toFixed(1)}%</span>
                    </div>
                    <Progress value={currentData?.debt_to_gdp_ratio || 0} />
                    <p className="text-xs text-muted-foreground">
                      IMF threshold: 55% for emerging markets
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">External Debt Ratio</span>
                      <span className="text-sm font-medium">
                        {((currentData?.external_debt || 0) / (currentData?.total_debt || 1) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={(currentData?.external_debt || 0) / (currentData?.total_debt || 1) * 100} />
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <p className="text-sm text-orange-800">
                      Moderate debt sustainability risk due to external debt concentration
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="creditors" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Major Creditors ({selectedYear})</CardTitle>
                  <CardDescription>Distribution of debt by creditor</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={creditorData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {creditorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value.toFixed(1)}T FCFA`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Creditor Details</CardTitle>
                  <CardDescription>Detailed breakdown by creditor type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentData?.creditors.map((creditor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{creditor.name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">{creditor.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(creditor.amount)}</p>
                          <p className="text-sm text-muted-foreground">{creditor.currency}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Debt-Financed Projects</CardTitle>
                  <CardDescription>Major infrastructure projects funded through debt</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentData?.projects.map((project, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{project.name}</h4>
                            <p className="text-sm text-muted-foreground">{project.sector}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(project.amount)}</p>
                            <p className="text-sm text-muted-foreground">{project.creditor}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Completion Status</span>
                            <span>{project.completion_status}%</span>
                          </div>
                          <Progress value={project.completion_status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Debt Evolution (2020-2024)</CardTitle>
                  <CardDescription>Historical trend of national debt</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `${value.toFixed(1)}T FCFA`, 
                          name.replace(/([A-Z])/g, ' $1').trim()
                        ]} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="totalDebt" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        name="Total Debt"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="externalDebt" 
                        stroke="#82ca9d" 
                        strokeWidth={2}
                        name="External Debt"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="internalDebt" 
                        stroke="#ffc658" 
                        strokeWidth={2}
                        name="Internal Debt"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Debt-to-GDP Ratio Trend</CardTitle>
                  <CardDescription>Sustainability indicator over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Debt-to-GDP']} />
                      <Bar dataKey="debtToGDP" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default DebtTracker;