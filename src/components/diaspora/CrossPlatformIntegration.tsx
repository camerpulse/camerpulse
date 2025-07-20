import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowUpRight, 
  BarChart3, 
  TrendingUp, 
  Users, 
  MapPin,
  Calendar,
  ExternalLink,
  Target
} from 'lucide-react';

interface CrossPlatformAction {
  id: string;
  source_platform: string;
  target_platform: string;
  action_type: string;
  reference_id: string;
  metadata: any;
  created_at: string;
}

interface IntegrationStats {
  total_actions: number;
  village_investments: number;
  petition_signatures: number;
  project_contributions: number;
  civic_engagements: number;
}

interface CrossPlatformIntegrationProps {
  profile?: any;
}

export const CrossPlatformIntegration = ({ profile }: CrossPlatformIntegrationProps) => {
  const [selectedView, setSelectedView] = useState<'overview' | 'actions' | 'impact'>('overview');

  // Mock integration data
  const mockActions: CrossPlatformAction[] = [
    {
      id: '1',
      source_platform: 'diaspora_connect',
      target_platform: 'village_directory',
      action_type: 'village_donation',
      reference_id: 'village_001',
      metadata: {
        village_name: 'Bamenda',
        amount_fcfa: 25000,
        project_type: 'Education'
      },
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      source_platform: 'diaspora_connect',
      target_platform: 'petition_system',
      action_type: 'petition_signature',
      reference_id: 'petition_education_001',
      metadata: {
        petition_title: 'Improve Rural Education Infrastructure',
        region: 'Northwest'
      },
      created_at: '2024-01-18T14:20:00Z'
    },
    {
      id: '3',
      source_platform: 'diaspora_connect',
      target_platform: 'gov_project_tracker',
      action_type: 'project_investment',
      reference_id: 'project_solar_001',
      metadata: {
        project_name: 'Solar Power Initiative',
        amount_fcfa: 100000,
        region: 'Far North'
      },
      created_at: '2024-01-20T09:15:00Z'
    }
  ];

  const mockStats: IntegrationStats = {
    total_actions: 12,
    village_investments: 4,
    petition_signatures: 3,
    project_contributions: 3,
    civic_engagements: 2
  };

  const integrationModules = [
    {
      name: 'Village Directory',
      description: 'Track and invest in your home village development projects',
      actions: mockStats.village_investments,
      status: 'active',
      icon: MapPin,
      color: 'bg-green-100 text-green-800'
    },
    {
      name: 'Petition System',
      description: 'Sign petitions and advocate for civic issues',
      actions: mockStats.petition_signatures,
      status: 'active',
      icon: Users,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      name: 'Government Projects',
      description: 'Invest in verified government development projects',
      actions: mockStats.project_contributions,
      status: 'active',
      icon: Target,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      name: 'Civic Participation',
      description: 'Engage in polls, ratings, and civic activities',
      actions: mockStats.civic_engagements,
      status: 'active',
      icon: BarChart3,
      color: 'bg-orange-100 text-orange-800'
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionTypeColor = (actionType: string) => {
    switch (actionType) {
      case 'village_donation': return 'bg-green-100 text-green-800';
      case 'petition_signature': return 'bg-blue-100 text-blue-800';
      case 'project_investment': return 'bg-purple-100 text-purple-800';
      case 'civic_engagement': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformName = (platform: string) => {
    return platform
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Cross-Platform Integration</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Your diaspora engagement across all CamerPulse platforms - unified tracking and impact measurement
        </p>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant={selectedView === 'overview' ? 'default' : 'outline'}
          onClick={() => setSelectedView('overview')}
          className="flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Overview
        </Button>
        <Button
          variant={selectedView === 'actions' ? 'default' : 'outline'}
          onClick={() => setSelectedView('actions')}
          className="flex items-center gap-2"
        >
          <ArrowUpRight className="h-4 w-4" />
          Recent Actions
        </Button>
        <Button
          variant={selectedView === 'impact' ? 'default' : 'outline'}
          onClick={() => setSelectedView('impact')}
          className="flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Impact Metrics
        </Button>
      </div>

      {/* Overview */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Integration Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{mockStats.total_actions}</p>
                  <p className="text-sm text-muted-foreground">Total Actions</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{mockStats.village_investments}</p>
                  <p className="text-sm text-muted-foreground">Village Investments</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{mockStats.petition_signatures}</p>
                  <p className="text-sm text-muted-foreground">Petitions Signed</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{mockStats.project_contributions}</p>
                  <p className="text-sm text-muted-foreground">Project Contributions</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Integration Modules */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {integrationModules.map((module, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${module.color}`}>
                        <module.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{module.name}</CardTitle>
                        <Badge variant="outline" className="text-green-600 mt-1">
                          {module.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{module.actions}</p>
                      <p className="text-xs text-muted-foreground">actions</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{module.description}</p>
                  <Button variant="outline" size="sm" className="w-full flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    View Module
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Actions */}
      {selectedView === 'actions' && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Cross-Platform Actions</CardTitle>
            <CardDescription>
              Your latest activities across all CamerPulse platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockActions.map((action) => (
                <div key={action.id} className="border rounded-lg p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getActionTypeColor(action.action_type)}>
                          {action.action_type.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(action.created_at)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{getPlatformName(action.source_platform)}</span>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{getPlatformName(action.target_platform)}</span>
                      </div>

                      <div className="space-y-1">
                        {action.metadata.village_name && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">Village:</span> {action.metadata.village_name}
                          </p>
                        )}
                        {action.metadata.petition_title && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">Petition:</span> {action.metadata.petition_title}
                          </p>
                        )}
                        {action.metadata.project_name && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">Project:</span> {action.metadata.project_name}
                          </p>
                        )}
                        {action.metadata.amount_fcfa && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">Amount:</span> {action.metadata.amount_fcfa.toLocaleString()} FCFA
                          </p>
                        )}
                        {action.metadata.region && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">Region:</span> {action.metadata.region}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Impact Metrics */}
      {selectedView === 'impact' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Impact Across Platforms</CardTitle>
              <CardDescription>
                Measuring your contribution to national and community development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Financial Contributions</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Village Development</span>
                      <span className="font-medium">125,000 FCFA</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Government Projects</span>
                      <span className="font-medium">200,000 FCFA</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Emergency Relief</span>
                      <span className="font-medium">50,000 FCFA</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center font-medium">
                        <span>Total Contributed</span>
                        <span className="text-primary">375,000 FCFA</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Civic Engagement</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Petitions Signed</span>
                      <span className="font-medium">3</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Polls Participated</span>
                      <span className="font-medium">8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Town Halls Attended</span>
                      <span className="font-medium">2</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center font-medium">
                        <span>Civic Score</span>
                        <span className="text-primary">87/100</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Regional Impact</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Your contributions have directly impacted 3 regions across Cameroon:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Northwest</Badge>
                  <Badge variant="secondary">Far North</Badge>
                  <Badge variant="secondary">Littoral</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};