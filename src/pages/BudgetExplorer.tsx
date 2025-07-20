import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Search, 
  Filter, 
  Download,
  PieChart,
  BarChart3,
  MapPin,
  Eye,
  Star,
  MessageCircle,
  FileText,
  Shield
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BudgetOverviewCards } from '@/components/budget/BudgetOverviewCards';
import { BudgetVisualization } from '@/components/budget/BudgetVisualization';
import { BudgetTable } from '@/components/budget/BudgetTable';
import { BudgetFilters } from '@/components/budget/BudgetFilters';

const BudgetExplorer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedMinistry, setSelectedMinistry] = useState('all');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('allocated_amount_fcfa');
  const [viewMode, setViewMode] = useState<'overview' | 'visualizations' | 'table' | 'analysis'>('overview');

  const { toast } = useToast();

  // Fetch budget data
  const { data: budgetData, isLoading } = useQuery({
    queryKey: ['budget-allocations', selectedYear, selectedMinistry, selectedSector, selectedRegion, selectedStatus, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('budget_allocations')
        .select('*');

      if (selectedYear !== 'all') {
        query = query.eq('fiscal_year', parseInt(selectedYear));
      }

      if (selectedMinistry !== 'all') {
        query = query.eq('ministry_id', selectedMinistry);
      }

      if (selectedSector !== 'all') {
        query = query.eq('sector', selectedSector);
      }

      if (selectedRegion !== 'all') {
        query = query.eq('region', selectedRegion);
      }

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      if (searchTerm) {
        query = query.or(`project_name.ilike.%${searchTerm}%,ministry_name.ilike.%${searchTerm}%,project_description.ilike.%${searchTerm}%`);
      }

      query = query.order(sortBy, { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!budgetData) return null;

    const totalAllocated = budgetData.reduce((sum, item) => sum + item.allocated_amount_fcfa, 0);
    const totalSpent = budgetData.reduce((sum, item) => sum + item.spent_amount_fcfa, 0);
    const avgExecution = budgetData.reduce((sum, item) => sum + item.execution_percentage, 0) / budgetData.length;
    const highRiskProjects = budgetData.filter(item => item.corruption_risk_level === 'high' || item.corruption_risk_level === 'critical').length;
    const completedProjects = budgetData.filter(item => item.status === 'completed').length;

    return {
      totalAllocated,
      totalSpent,
      avgExecution: Math.round(avgExecution * 100) / 100,
      highRiskProjects,
      completedProjects,
      totalProjects: budgetData.length,
      executionRate: Math.round((totalSpent / totalAllocated) * 100 * 100) / 100
    };
  }, [budgetData]);

  const handleDownloadReport = () => {
    toast({
      title: "Report Generation",
      description: "Your budget report is being prepared for download.",
    });
  };

  const handleRateProject = (projectId: string) => {
    toast({
      title: "Project Rating",
      description: "Rating form would open for this project.",
    });
  };

  const handleRequestClarification = (projectId: string) => {
    toast({
      title: "Clarification Request",
      description: "Your clarification request has been submitted.",
    });
  };

  const handleStartPetition = (projectId: string) => {
    toast({
      title: "Petition Started",
      description: "Budget reallocation petition form would open.",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="h-32 bg-muted/50 animate-pulse rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1,2,3,4].map((i) => (
              <div key={i} className="h-32 bg-muted/50 animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">National Budget Explorer</h1>
            <p className="text-muted-foreground">
              Explore, analyze, and engage with Cameroon's national and local budgets
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            {budgetData?.length || 0} Budget Items
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            {statistics?.avgExecution || 0}% Avg Execution
          </span>
          <span className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            {statistics?.highRiskProjects || 0} High Risk Projects
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Button onClick={handleDownloadReport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
        <Button variant="outline">
          <Shield className="h-4 w-4 mr-2" />
          View Anomalies
        </Button>
        <Button variant="outline">
          <MessageCircle className="h-4 w-4 mr-2" />
          Citizen Comments
        </Button>
      </div>

      {/* Filters */}
      <BudgetFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        selectedMinistry={selectedMinistry}
        onMinistryChange={setSelectedMinistry}
        selectedSector={selectedSector}
        onSectorChange={setSelectedSector}
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Navigation Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="mt-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="visualizations">Charts</TabsTrigger>
          <TabsTrigger value="table">Detailed Table</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-8">
          <BudgetOverviewCards 
            statistics={statistics} 
            budgetData={budgetData} 
          />
        </TabsContent>

        <TabsContent value="visualizations" className="mt-8">
          <BudgetVisualization budgetData={budgetData} />
        </TabsContent>

        <TabsContent value="table" className="mt-8">
          <BudgetTable 
            budgetData={budgetData}
            onRateProject={handleRateProject}
            onRequestClarification={handleRequestClarification}
            onStartPetition={handleStartPetition}
          />
        </TabsContent>

        <TabsContent value="analysis" className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget Execution Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Analysis of budget execution rates across ministries and sectors
                  </div>
                  <div className="h-48 flex items-center justify-center bg-muted/50 rounded">
                    <span className="text-muted-foreground">Execution Rate Chart</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Corruption risk analysis and transparency scores
                  </div>
                  <div className="h-48 flex items-center justify-center bg-muted/50 rounded">
                    <span className="text-muted-foreground">Risk Analysis Chart</span>
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

export default BudgetExplorer;