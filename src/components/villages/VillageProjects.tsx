import React, { useState, useEffect } from 'react';
import { Building, Plus, DollarSign, Calendar, Users, CheckCircle, Clock, XCircle, AlertCircle, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface Project {
  id: string;
  project_name: string;
  project_type: string;
  description: string;
  project_status: string;
  funding_amount?: number;
  funding_source?: string;
  year_started?: number;
  year_completed?: number;
  completion_percentage: number;
  beneficiaries_count?: number;
  project_manager?: string;
  project_manager_contact?: string;
  impact_description?: string;
  challenges?: string;
  created_by: string;
  created_at: string;
}

interface VillageProjectsProps {
  villageId: string;
  villageName: string;
}

export const VillageProjects: React.FC<VillageProjectsProps> = ({ villageId, villageName }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [addProjectDialogOpen, setAddProjectDialogOpen] = useState(false);

  const projectTypes = [
    { value: 'all', label: 'All Projects' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'education', label: 'Education' },
    { value: 'health', label: 'Healthcare' },
    { value: 'water_sanitation', label: 'Water & Sanitation' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'technology', label: 'Technology' },
    { value: 'social', label: 'Social Development' },
    { value: 'economic', label: 'Economic Development' },
    { value: 'environment', label: 'Environment' }
  ];

  const projectStatuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'planned', label: 'Planned', icon: AlertCircle, color: 'outline' },
    { value: 'ongoing', label: 'Ongoing', icon: Clock, color: 'secondary' },
    { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'success' },
    { value: 'suspended', label: 'Suspended', icon: XCircle, color: 'warning' },
    { value: 'abandoned', label: 'Abandoned', icon: XCircle, color: 'destructive' }
  ];

  // Sample projects for demo
  const sampleProjects: Project[] = [
    {
      id: '1',
      project_name: 'Community Water Borehole',
      project_type: 'water_sanitation',
      description: 'Drilling of a modern water borehole to provide clean drinking water for the entire village community',
      project_status: 'completed',
      funding_amount: 15000000,
      funding_source: 'Village Development Fund & Diaspora Contributions',
      year_started: 2022,
      year_completed: 2023,
      completion_percentage: 100,
      beneficiaries_count: 1200,
      project_manager: 'Engineer Marie Fotso',
      project_manager_contact: '+237 6XX XXX XXX',
      impact_description: 'Reduced water-borne diseases by 80%, improved school attendance as children no longer need to fetch water during school hours',
      created_by: 'user1',
      created_at: '2022-03-15T10:00:00Z'
    },
    {
      id: '2',
      project_name: 'Primary School Renovation',
      project_type: 'education',
      description: 'Complete renovation of the village primary school including new classrooms, library, and computer lab',
      project_status: 'ongoing',
      funding_amount: 25000000,
      funding_source: 'Government Grant & International NGO',
      year_started: 2023,
      completion_percentage: 75,
      beneficiaries_count: 300,
      project_manager: 'Dr. Paul Kenne',
      project_manager_contact: 'paul.kenne@email.com',
      impact_description: 'Expected to improve literacy rates and provide digital skills training for students',
      challenges: 'Delay in material delivery due to road conditions during rainy season',
      created_by: 'user2',
      created_at: '2023-01-20T14:30:00Z'
    },
    {
      id: '3',
      project_name: 'Solar Street Lighting',
      project_type: 'infrastructure',
      description: 'Installation of solar-powered LED street lights along main village roads and around community centers',
      project_status: 'ongoing',
      funding_amount: 8000000,
      funding_source: 'Private Sponsor - Village Son in Europe',
      year_started: 2024,
      completion_percentage: 45,
      beneficiaries_count: 800,
      project_manager: 'Local Technical Team',
      impact_description: 'Improved security during evening hours, extended business hours for local shops',
      created_by: 'user3',
      created_at: '2024-01-10T09:15:00Z'
    },
    {
      id: '4',
      project_name: 'Community Health Center',
      project_type: 'health',
      description: 'Construction of a modern health center with maternity ward, pharmacy, and emergency care facility',
      project_status: 'planned',
      funding_amount: 45000000,
      funding_source: 'Pending - Multiple Sources',
      completion_percentage: 5,
      beneficiaries_count: 2000,
      project_manager: 'TBD',
      impact_description: 'Will provide 24/7 healthcare services, reduce maternal mortality, emergency medical care',
      challenges: 'Funding gap of 30M FCFA, need for qualified medical staff',
      created_by: 'user4',
      created_at: '2024-02-01T16:00:00Z'
    },
    {
      id: '5',
      project_name: 'Youth Skills Training Center',
      project_type: 'social',
      description: 'Establishment of a vocational training center for tailoring, carpentry, and computer skills',
      project_status: 'completed',
      funding_amount: 12000000,
      funding_source: 'Village Cooperative & Youth Association',
      year_started: 2021,
      year_completed: 2022,
      completion_percentage: 100,
      beneficiaries_count: 150,
      project_manager: 'Grace Mbenda',
      impact_description: 'Trained 150+ youth in marketable skills, 85% employment rate among graduates',
      created_by: 'user5',
      created_at: '2021-06-15T11:30:00Z'
    }
  ];

  useEffect(() => {
    // Demo mode - using sample data
    setProjects(sampleProjects);
    setLoading(false);
  }, [villageId]);

  const filteredProjects = projects.filter(project => {
    const matchesType = selectedType === 'all' || project.project_type === selectedType;
    const matchesStatus = selectedStatus === 'all' || project.project_status === selectedStatus;
    const matchesSearch = !searchTerm || 
      project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const getStatusInfo = (status: string) => {
    return projectStatuses.find(s => s.value === status) || projectStatuses[1];
  };

  const getTypeInfo = (type: string) => {
    return projectTypes.find(t => t.value === type) || projectTypes[0];
  };

  const getTotalFunding = () => {
    return filteredProjects.reduce((total, project) => total + (project.funding_amount || 0), 0);
  };

  const getTotalBeneficiaries = () => {
    return filteredProjects.reduce((total, project) => total + (project.beneficiaries_count || 0), 0);
  };

  const ProjectCard = ({ project }: { project: Project }) => {
    const statusInfo = getStatusInfo(project.project_status);
    const typeInfo = getTypeInfo(project.project_type);
    const StatusIcon = statusInfo.icon || Building;

    return (
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-bold mb-2 flex items-center gap-2">
                {project.project_name}
                <StatusIcon className="h-5 w-5 text-muted-foreground" />
              </CardTitle>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={statusInfo.color as any}>
                  {statusInfo.label}
                </Badge>
                <Badge variant="outline">
                  {typeInfo.label}
                </Badge>
              </div>
            </div>
            {project.funding_amount && (
              <div className="text-right">
                <div className="text-lg font-bold text-primary">
                  {(project.funding_amount / 1000000).toFixed(1)}M
                </div>
                <div className="text-xs text-muted-foreground">FCFA</div>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {project.description}
          </p>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{project.completion_percentage}%</span>
            </div>
            <Progress value={project.completion_percentage} className="h-2" />
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            {project.year_started && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Started {project.year_started}</span>
              </div>
            )}
            {project.beneficiaries_count && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{project.beneficiaries_count.toLocaleString()} people</span>
              </div>
            )}
            {project.year_completed && (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Completed {project.year_completed}</span>
              </div>
            )}
            {project.funding_source && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="truncate" title={project.funding_source}>
                  {project.funding_source.split(' ')[0]}...
                </span>
              </div>
            )}
          </div>

          {/* Project Manager */}
          {project.project_manager && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {project.project_manager.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span>Managed by {project.project_manager}</span>
            </div>
          )}

          {/* Impact */}
          {project.impact_description && (
            <div className="border-t pt-3">
              <h5 className="font-medium text-sm mb-1">Impact</h5>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {project.impact_description}
              </p>
            </div>
          )}

          {/* Challenges */}
          {project.challenges && (
            <div className="border-t pt-3 mt-2">
              <h5 className="font-medium text-sm mb-1 text-warning">Challenges</h5>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {project.challenges}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold">Development Projects</h3>
          <p className="text-muted-foreground">
            {filteredProjects.length} projects • {getTotalFunding().toLocaleString()} FCFA total funding
          </p>
        </div>
        
        <Dialog open={addProjectDialogOpen} onOpenChange={setAddProjectDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Development Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Project management functionality will be available when the database is fully connected.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {projectTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {projectStatuses.map(status => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-primary">{filteredProjects.length}</div>
          <div className="text-sm text-muted-foreground">Total Projects</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-success">
            {filteredProjects.filter(p => p.project_status === 'completed').length}
          </div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-warning">
            {filteredProjects.filter(p => p.project_status === 'ongoing').length}
          </div>
          <div className="text-sm text-muted-foreground">Ongoing</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-info">{getTotalBeneficiaries().toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Beneficiaries</div>
        </Card>
      </div>

      {/* Projects Grid */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="flex gap-2">
                    <div className="h-5 bg-muted rounded w-16"></div>
                    <div className="h-5 bg-muted rounded w-20"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                    <div className="h-2 bg-muted rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
                  ? 'No projects match your search criteria.'
                  : 'Be the first to add a development project for this village!'
                }
              </p>
              <Button onClick={() => setAddProjectDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};