import React, { useState, useEffect } from 'react';
import { Globe, DollarSign, Users, Building, Target, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface DiasporaProject {
  id: string;
  title: string;
  description: string;
  village_id: string;
  village_name: string;
  village_region: string;
  target_amount: number;
  raised_amount: number;
  supporters_count: number;
  status: string;
  category: string;
  created_at: string;
  end_date: string;
  lead_organization: string;
  country_sponsors: string[];
}

const VillagesDiasporaBacked = () => {
  const [projects, setProjects] = useState<DiasporaProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    fetchDiasporaProjects();
  }, []);

  const fetchDiasporaProjects = async () => {
    try {
      // Mock data for demonstration - replace with actual Supabase query
      const mockProjects: DiasporaProject[] = [
        {
          id: '1',
          title: 'Bafut Community Hospital Expansion',
          description: 'Expanding the existing health center to a full hospital with modern equipment and specialists.',
          village_id: '1',
          village_name: 'Bafut',
          village_region: 'Northwest',
          target_amount: 250000000, // 250M FCFA
          raised_amount: 180000000, // 180M FCFA
          supporters_count: 342,
          status: 'active',
          category: 'Healthcare',
          created_at: '2023-11-15T00:00:00Z',
          end_date: '2024-06-30T00:00:00Z',
          lead_organization: 'Bafut Development Association (USA)',
          country_sponsors: ['USA', 'Germany', 'Canada', 'UK']
        },
        {
          id: '2',
          title: 'Kumbo Technical Institute',
          description: 'Building a technical and vocational training institute to equip youth with modern skills.',
          village_id: '2',
          village_name: 'Kumbo',
          village_region: 'Northwest',
          target_amount: 400000000, // 400M FCFA
          raised_amount: 285000000, // 285M FCFA
          supporters_count: 156,
          status: 'active',
          category: 'Education',
          created_at: '2023-10-01T00:00:00Z',
          end_date: '2024-12-31T00:00:00Z',
          lead_organization: 'Nso Cultural Association (Europe)',
          country_sponsors: ['France', 'Belgium', 'Switzerland', 'Netherlands']
        },
        {
          id: '3',
          title: 'Mamfe Water Treatment Plant',
          description: 'Constructing a modern water treatment facility to provide clean water to 50,000 residents.',
          village_id: '3',
          village_name: 'Mamfe',
          village_region: 'Southwest',
          target_amount: 180000000, // 180M FCFA
          raised_amount: 180000000, // Fully funded
          supporters_count: 278,
          status: 'completed',
          category: 'Infrastructure',
          created_at: '2023-08-20T00:00:00Z',
          end_date: '2024-03-31T00:00:00Z',
          lead_organization: 'Manyu Youth Development (USA)',
          country_sponsors: ['USA', 'Canada']
        },
        {
          id: '4',
          title: 'Foumban Cultural Heritage Center',
          description: 'Preserving and showcasing Bamoun cultural heritage through a modern museum and cultural center.',
          village_id: '4',
          village_name: 'Foumban',
          village_region: 'West',
          target_amount: 320000000, // 320M FCFA
          raised_amount: 95000000, // 95M FCFA
          supporters_count: 89,
          status: 'active',
          category: 'Culture',
          created_at: '2024-01-10T00:00:00Z',
          end_date: '2024-10-31T00:00:00Z',
          lead_organization: 'Bamoun Cultural Association (France)',
          country_sponsors: ['France', 'USA']
        },
        {
          id: '5',
          title: 'Bandjoun Agriculture Cooperative',
          description: 'Supporting local farmers with modern equipment, storage facilities, and market access.',
          village_id: '5',
          village_name: 'Bandjoun',
          village_region: 'West',
          target_amount: 150000000, // 150M FCFA
          raised_amount: 112000000, // 112M FCFA
          supporters_count: 203,
          status: 'active',
          category: 'Agriculture',
          created_at: '2023-12-05T00:00:00Z',
          end_date: '2024-08-15T00:00:00Z',
          lead_organization: 'Bamileke Diaspora Network',
          country_sponsors: ['Germany', 'USA', 'UK']
        }
      ];

      setProjects(mockProjects);
    } catch (error) {
      console.error('Error fetching diaspora projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active': return 'default';
      case 'paused': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Healthcare': return 'bg-red-100 text-red-800';
      case 'Education': return 'bg-blue-100 text-blue-800';
      case 'Infrastructure': return 'bg-gray-100 text-gray-800';
      case 'Agriculture': return 'bg-green-100 text-green-800';
      case 'Culture': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ProjectCard = ({ project }: { project: DiasporaProject }) => {
    const progressPercentage = (project.raised_amount / project.target_amount) * 100;
    const isCompleted = project.status === 'completed';
    
    return (
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={getStatusColor(project.status)}>
                  {isCompleted && <CheckCircle className="h-3 w-3 mr-1" />}
                  {project.status.toUpperCase()}
                </Badge>
                <Badge variant="outline" className={getCategoryColor(project.category)}>
                  {project.category}
                </Badge>
              </div>
              <CardTitle className="text-xl font-bold text-foreground">
                {project.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {project.village_name}, {project.village_region} • Led by {project.lead_organization}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4 line-clamp-2">
            {project.description}
          </p>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Funding Progress</span>
              <span className="text-muted-foreground">
                {formatCurrency(project.raised_amount)} / {formatCurrency(project.target_amount)}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-xs text-muted-foreground text-center">
              {progressPercentage.toFixed(1)}% funded
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{project.supporters_count} supporters</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Ends {formatDistanceToNow(new Date(project.end_date))}</span>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Supporting Countries:</div>
            <div className="flex flex-wrap gap-1">
              {project.country_sponsors.map((country) => (
                <Badge key={country} variant="outline" className="text-xs">
                  {country}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Started {formatDistanceToNow(new Date(project.created_at))} ago
            </div>
            <div className="flex gap-2">
              <Link to={`/village/${project.village_id}`}>
                <Button size="sm" variant="outline">
                  View Village
                </Button>
              </Link>
              {!isCompleted && (
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Support Project
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const activeProjects = projects.filter(p => p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const totalRaised = projects.reduce((sum, p) => sum + p.raised_amount, 0);
  const totalSupporters = projects.reduce((sum, p) => sum + p.supporters_count, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-8 w-8" />
            <h1 className="text-4xl font-bold">Diaspora-Backed Projects</h1>
          </div>
          <p className="text-primary-foreground/80 text-lg">
            Cameroonian diaspora investing in village development and growth
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary mb-2">
                {projects.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Projects</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-lg font-bold text-secondary mb-2">
                {formatCurrency(totalRaised)}
              </div>
              <div className="text-sm text-muted-foreground">Total Raised</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-accent mb-2">
                {totalSupporters}
              </div>
              <div className="text-sm text-muted-foreground">Total Supporters</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-success mb-2">
                {completedProjects.length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Projects */}
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Active Projects</h2>
            <p className="text-muted-foreground">
              Current fundraising campaigns supported by the Cameroonian diaspora
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded mb-4"></div>
                    <div className="h-4 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>

        {/* Completed Projects */}
        {completedProjects.length > 0 && (
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Completed Projects</h2>
              <p className="text-muted-foreground">
                Successfully funded projects making a real impact in villages
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Want to start a diaspora-backed project for your village?
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Propose Project
              </Button>
              <Link to="/villages">
                <Button variant="outline" size="lg">
                  Back to Villages
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VillagesDiasporaBacked;