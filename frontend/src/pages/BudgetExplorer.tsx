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
import { BudgetAnalysis } from '@/components/budget/BudgetAnalysis';
import { CitizenEngagement } from '@/components/budget/CitizenEngagement';
import { AnomalyDetection } from '@/components/budget/AnomalyDetection';
import { BudgetExplorerSkeleton } from '@/components/budget/BudgetExplorerSkeleton';

const BudgetExplorer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedMinistry, setSelectedMinistry] = useState('all');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('allocated_amount');
  const [viewMode, setViewMode] = useState<'overview' | 'visualizations' | 'table' | 'analysis'>('overview');
  const [engagementModal, setEngagementModal] = useState<{
    isOpen: boolean;
    type: 'rate' | 'clarify' | 'petition';
    projectId: string;
    projectName: string;
  }>({
    isOpen: false,
    type: 'rate',
    projectId: '',
    projectName: ''
  });
  const [showAnomalies, setShowAnomalies] = useState(false);

  const { toast } = useToast();

  // Fetch budget data
  const { data: budgetData, isLoading } = useQuery({
    queryKey: ['budget-allocations', selectedYear, selectedMinistry, selectedSector, selectedRegion, selectedStatus, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('budget_allocations')
        .select('*');

      if (selectedYear !== 'all') {
        query = query.eq('budget_year', parseInt(selectedYear));
      }

      if (selectedMinistry !== 'all') {
        query = query.eq('ministry_department', selectedMinistry);
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

      query = query.order('allocated_amount', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!budgetData) return null;

    const totalAllocated = budgetData.reduce((sum, item) => sum + (item.allocated_amount || 0), 0);
    const totalSpent = budgetData.reduce((sum, item) => sum + (item.spent_amount || 0), 0);
    const avgExecution = budgetData.reduce((sum, item) => sum + (item.execution_percentage || 0), 0) / budgetData.length;
    const highRiskProjects = budgetData.filter(item => (item.transparency_score || 0) < 3).length;
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
    const project = budgetData?.find(p => p.id === projectId);
    if (project) {
      setEngagementModal({
        isOpen: true,
        type: 'rate',
        projectId,
        projectName: project.project_name
      });
    }
  };

  const handleRequestClarification = (projectId: string) => {
    const project = budgetData?.find(p => p.id === projectId);
    if (project) {
      setEngagementModal({
        isOpen: true,
        type: 'clarify',
        projectId,
        projectName: project.project_name
      });
    }
  };

  const handleStartPetition = (projectId: string) => {
    const project = budgetData?.find(p => p.id === projectId);
    if (project) {
      setEngagementModal({
        isOpen: true,
        type: 'petition',
        projectId,
        projectName: project.project_name
      });
    }
  };

  if (isLoading) {
    return <BudgetExplorerSkeleton />;
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
        <Button 
          variant="outline"
          onClick={() => setShowAnomalies(!showAnomalies)}
        >
          <Shield className="h-4 w-4 mr-2" />
          {showAnomalies ? 'Hide' : 'View'} Anomalies
        </Button>
        <Button variant="outline">
          <MessageCircle className="h-4 w-4 mr-2" />
          Citizen Comments
        </Button>
      </div>

        {/* Anomaly Detection */}
        {showAnomalies && (
          <AnomalyDetection 
            budgetData={budgetData}
            onViewProject={(projectId) => {
              // In a real app, this would navigate to project details
              toast({
                title: "Project Details",
                description: `Would navigate to details for project ${projectId}`
              });
            }}
          />
        )}

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
          <BudgetAnalysis budgetData={budgetData} />
        </TabsContent>
      </Tabs>

      {/* Citizen Engagement Modal */}
      <CitizenEngagement
        projectId={engagementModal.projectId}
        projectName={engagementModal.projectName}
        isOpen={engagementModal.isOpen}
        onClose={() => setEngagementModal(prev => ({ ...prev, isOpen: false }))}
        type={engagementModal.type}
      />
    </div>
  );
};

export default BudgetExplorer;