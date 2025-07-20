import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building, 
  MapPin, 
  Target, 
  TrendingUp,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Users,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface InvestmentProject {
  id: string;
  project_name: string;
  project_description: string;
  target_region: string;
  target_community?: string;
  project_category: string;
  funding_goal_fcfa: number;
  funding_raised_fcfa: number;
  project_status: string;
  project_manager?: string;
  expected_completion_date?: string;
  actual_completion_date?: string;
  progress_percentage: number;
  verification_status: string;
  verified_at?: string;
  project_images?: string[];
  created_at: string;
}

interface ProjectsDirectoryProps {
  homeRegion: string;
}

const PROJECT_CATEGORIES = [
  'All Categories',
  'Education',
  'Health',
  'Infrastructure',
  'Agriculture',
  'Technology',
  'Water & Sanitation',
  'Economic Development',
  'Environmental',
  'Social Services'
];

const PROJECT_STATUS = [
  'All Status',
  'Active',
  'Funded',
  'Completed',
  'On Hold'
];

export const ProjectsDirectory: React.FC<ProjectsDirectoryProps> = ({ homeRegion }) => {
  const [projects, setProjects] = useState<InvestmentProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<InvestmentProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, selectedCategory, selectedStatus, selectedRegion]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('diaspora_investment_projects')
        .select('*')
        .eq('verification_status', 'verified')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.project_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.target_community?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(project => project.project_category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'All Status') {
      filtered = filtered.filter(project => project.project_status.toLowerCase() === selectedStatus.toLowerCase());
    }

    // Region filter
    if (selectedRegion !== 'All Regions') {
      filtered = filtered.filter(project => project.target_region === selectedRegion);
    }

    setFilteredProjects(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'funded': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'on hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Education': 'bg-purple-100 text-purple-800',
      'Health': 'bg-red-100 text-red-800',
      'Infrastructure': 'bg-gray-100 text-gray-800',
      'Agriculture': 'bg-green-100 text-green-800',
      'Technology': 'bg-blue-100 text-blue-800',
      'Water & Sanitation': 'bg-cyan-100 text-cyan-800',
      'Economic Development': 'bg-orange-100 text-orange-800',
      'Environmental': 'bg-emerald-100 text-emerald-800',
      'Social Services': 'bg-pink-100 text-pink-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getUniqueRegions = () => {
    const regions = [...new Set(projects.map(p => p.target_region))];
    return ['All Regions', ...regions.sort()];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading verified projects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Verified Projects Directory</h2>
        <p className="text-muted-foreground">
          Discover and support community development projects across Cameroon
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Projects</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUS.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Region</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getUniqueRegions().map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {filteredProjects.length} of {projects.length} projects
              {homeRegion && selectedRegion === 'All Regions' && (
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={() => setSelectedRegion(homeRegion)}
                  className="ml-2 h-auto p-0"
                >
                  Show projects from your home region ({homeRegion})
                </Button>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All Categories');
                setSelectedStatus('All Status');
                setSelectedRegion('All Regions');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No projects found matching your criteria.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredProjects.map(project => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-xl">{project.project_name}</h3>
                      <Badge className={getCategoryColor(project.project_category)}>
                        {project.project_category}
                      </Badge>
                      <Badge className={getStatusColor(project.project_status)}>
                        {project.project_status}
                      </Badge>
                      {project.verified_at && (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {project.project_description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{project.target_region}</p>
                          {project.target_community && (
                            <p className="text-muted-foreground">{project.target_community}</p>
                          )}
                        </div>
                      </div>

                      {project.project_manager && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground">Project Manager</p>
                            <p className="font-medium">{project.project_manager}</p>
                          </div>
                        </div>
                      )}

                      {project.expected_completion_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground">Expected Completion</p>
                            <p className="font-medium">
                              {new Date(project.expected_completion_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Progress</p>
                          <p className="font-medium">{project.progress_percentage}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button className="ml-4">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Support Project
                  </Button>
                </div>
                
                {/* Funding Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Funding Progress</span>
                    <span>{((project.funding_raised_fcfa / project.funding_goal_fcfa) * 100).toFixed(1)}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor((project.funding_raised_fcfa / project.funding_goal_fcfa) * 100)}`}
                      style={{ width: `${Math.min((project.funding_raised_fcfa / project.funding_goal_fcfa) * 100, 100)}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatCurrency(project.funding_raised_fcfa)} FCFA raised</span>
                    <span>Goal: {formatCurrency(project.funding_goal_fcfa)} FCFA</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};