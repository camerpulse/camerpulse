import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { MapPin, Calendar, DollarSign, AlertTriangle, TrendingUp, Eye, Flag, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Project {
  id: string;
  title: string;
  description: string;
  sector: string;
  budget_allocated_fcfa: number;
  funding_source: string;
  implementing_body: string;
  locations: any;
  start_date: string;
  expected_completion_date: string;
  status: string;
  completion_percentage: number;
  corruption_index: number;
  transparency_score: number;
  community_satisfaction_score: number;
  total_community_reports: number;
  timeline_slippage_days: number;
  created_at: string;
}

export const GovProjectTracker = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const sectors = [
    'education', 'health', 'infrastructure', 'agriculture', 'energy', 
    'water_sanitation', 'transport', 'telecommunications', 'environment', 
    'social_protection', 'governance', 'other'
  ];

  const statuses = ['planned', 'in_progress', 'completed', 'paused', 'failed', 'abandoned'];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('government_projects')
        .select('*')
        .eq('is_verified', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to fetch projects",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'planned': return 'bg-yellow-500';
      case 'paused': return 'bg-orange-500';
      case 'failed': return 'bg-red-500';
      case 'abandoned': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getCorruptionColor = (index: number) => {
    if (index >= 7) return 'text-red-500';
    if (index >= 4) return 'text-orange-500';
    return 'text-green-500';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.implementing_body.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = !sectorFilter || project.sector === sectorFilter;
    const matchesStatus = !statusFilter || project.status === statusFilter;
    
    return matchesSearch && matchesSector && matchesStatus;
  });

  const ProjectCard = ({ project }: { project: Project }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedProject(project)}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{project.title}</CardTitle>
            <CardDescription className="line-clamp-2">{project.description}</CardDescription>
          </div>
          <Badge className={getStatusColor(project.status)}>
            {project.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{formatCurrency(project.budget_allocated_fcfa)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{project.implementing_body}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {new Date(project.expected_completion_date).toLocaleDateString('en-US')}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{project.completion_percentage}%</span>
            </div>
            <Progress value={project.completion_percentage} className="h-2" />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <AlertTriangle className={`h-4 w-4 ${getCorruptionColor(project.corruption_index)}`} />
              <span className={`text-sm font-medium ${getCorruptionColor(project.corruption_index)}`}>
                Corruption Index: {project.corruption_index.toFixed(1)}
              </span>
            </div>
            
            {project.timeline_slippage_days > 0 && (
              <Badge variant="destructive" className="text-xs">
                {project.timeline_slippage_days} days late
              </Badge>
            )}
          </div>

          <div className="flex gap-2 text-xs text-muted-foreground">
            <span>👥 {project.total_community_reports} reports</span>
            <span>⭐ {project.community_satisfaction_score.toFixed(1)}/5</span>
            <span>🔍 {project.transparency_score.toFixed(1)}/10</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ProjectDetails = ({ project }: { project: Project }) => (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
          <p className="text-muted-foreground mb-4">{project.description}</p>
        </div>
        <Button variant="outline" onClick={() => setSelectedProject(null)}>
          Close
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Budget Allocated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{formatCurrency(project.budget_allocated_fcfa)}</p>
            <p className="text-xs text-muted-foreground">Funding: {project.funding_source}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{project.completion_percentage}%</p>
            <Progress value={project.completion_percentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Corruption Index</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${getCorruptionColor(project.corruption_index)}`}>
              {project.corruption_index.toFixed(1)}/10
            </p>
            <p className="text-xs text-muted-foreground">
              {project.corruption_index < 3 ? 'Low Risk' : 
               project.corruption_index < 7 ? 'Medium Risk' : 'High Risk'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Sector:</span>
              <span className="ml-2 capitalize">{project.sector.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="font-medium">Implementing Body:</span>
              <span className="ml-2">{project.implementing_body}</span>
            </div>
            <div>
              <span className="font-medium">Start Date:</span>
              <span className="ml-2">{new Date(project.start_date).toLocaleDateString('en-US')}</span>
            </div>
            <div>
              <span className="font-medium">Expected Completion:</span>
              <span className="ml-2">{new Date(project.expected_completion_date).toLocaleDateString('en-US')}</span>
            </div>
            <div>
              <span className="font-medium">Status:</span>
              <Badge className={`ml-2 ${getStatusColor(project.status)}`}>
                {project.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Community Engagement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Community Reports:</span>
              <span className="font-medium">{project.total_community_reports}</span>
            </div>
            <div className="flex justify-between">
              <span>Satisfaction Score:</span>
              <span className="font-medium">{project.community_satisfaction_score.toFixed(1)}/5</span>
            </div>
            <div className="flex justify-between">
              <span>Transparency Score:</span>
              <span className="font-medium">{project.transparency_score.toFixed(1)}/10</span>
            </div>
            {project.timeline_slippage_days > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Timeline Slippage:</span>
                <span className="font-medium">{project.timeline_slippage_days} days</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button className="flex items-center gap-2">
          <Flag className="h-4 w-4" />
          Report Issue
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          View Documents
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Field Report
        </Button>
      </div>
    </div>
  );

  const DashboardStats = () => {
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const inProgressProjects = projects.filter(p => p.status === 'in_progress').length;
    const delayedProjects = projects.filter(p => p.timeline_slippage_days > 0).length;
    const totalBudget = projects.reduce((sum, p) => sum + p.budget_allocated_fcfa, 0);
    const avgCorruption = projects.reduce((sum, p) => sum + p.corruption_index, 0) / totalProjects || 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalProjects}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{completedProjects}</p>
            <p className="text-xs text-muted-foreground">
              {totalProjects > 0 ? ((completedProjects / totalProjects) * 100).toFixed(1) : 0}% completion rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Delayed Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{delayedProjects}</p>
            <p className="text-xs text-muted-foreground">Behind schedule</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Avg Corruption Index</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${getCorruptionColor(avgCorruption)}`}>
              {avgCorruption.toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">Out of 10</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Government Project Tracker</h1>
        <p className="text-muted-foreground">
          Track transparency, progress, and accountability of government projects across Cameroon
        </p>
      </div>

      {selectedProject ? (
        <ProjectDetails project={selectedProject} />
      ) : (
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="projects">All Projects</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            <DashboardStats />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projects.slice(0, 5).map(project => (
                      <div key={project.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-sm">{project.title}</p>
                          <p className="text-xs text-muted-foreground">{project.implementing_body}</p>
                        </div>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>High-Risk Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projects
                      .filter(p => p.corruption_index >= 5)
                      .slice(0, 5)
                      .map(project => (
                        <div key={project.id} className="flex justify-between items-center p-3 rounded-lg bg-red-50">
                          <div>
                            <p className="font-medium text-sm">{project.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Corruption Index: {project.corruption_index.toFixed(1)}
                            </p>
                          </div>
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="projects" className="space-y-6">
            <div className="flex gap-4 flex-wrap">
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
              
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Filter by sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Sectors</SelectItem>
                  {sectors.map(sector => (
                    <SelectItem key={sector} value={sector}>
                      {sector.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No projects found matching your criteria.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Projects by Sector</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sectors.map(sector => {
                      const count = projects.filter(p => p.sector === sector).length;
                      const percentage = projects.length > 0 ? (count / projects.length) * 100 : 0;
                      return (
                        <div key={sector} className="flex justify-between items-center">
                          <span className="text-sm capitalize">{sector.replace('_', ' ')}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={percentage} className="w-20 h-2" />
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Budget Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Budget Allocated:</span>
                      <span className="font-bold">{formatCurrency(projects.reduce((sum, p) => sum + p.budget_allocated_fcfa, 0))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Project Budget:</span>
                      <span className="font-medium">
                        {formatCurrency(projects.length > 0 ? projects.reduce((sum, p) => sum + p.budget_allocated_fcfa, 0) / projects.length : 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};