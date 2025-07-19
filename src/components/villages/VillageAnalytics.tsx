import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface AnalyticsMetric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

interface ProjectMetric {
  name: string;
  budget: number;
  spent: number;
  progress: number;
  status: 'on-track' | 'delayed' | 'completed' | 'at-risk';
  deadline: string;
}

export const VillageAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Demo analytics data
  const metrics: AnalyticsMetric[] = [
    {
      title: 'Population',
      value: '2,847',
      change: '+2.3%',
      trend: 'up',
      icon: <Users className="h-4 w-4" />
    },
    {
      title: 'Development Budget',
      value: '₣ 45.2M',
      change: '+15.7%',
      trend: 'up',
      icon: <DollarSign className="h-4 w-4" />
    },
    {
      title: 'Active Projects',
      value: '12',
      change: '+3',
      trend: 'up',
      icon: <Activity className="h-4 w-4" />
    },
    {
      title: 'Completion Rate',
      value: '87%',
      change: '+5.2%',
      trend: 'up',
      icon: <Target className="h-4 w-4" />
    }
  ];

  const projectMetrics: ProjectMetric[] = [
    {
      name: 'Water Treatment Plant',
      budget: 12000000,
      spent: 8500000,
      progress: 75,
      status: 'on-track',
      deadline: 'Dec 2024'
    },
    {
      name: 'Solar Panel Installation',
      budget: 8000000,
      spent: 4800000,
      progress: 60,
      status: 'on-track',
      deadline: 'Nov 2024'
    },
    {
      name: 'School Renovation',
      budget: 5500000,
      spent: 5500000,
      progress: 100,
      status: 'completed',
      deadline: 'Oct 2024'
    },
    {
      name: 'Road Improvement',
      budget: 15000000,
      spent: 6000000,
      progress: 35,
      status: 'delayed',
      deadline: 'Jan 2025'
    },
    {
      name: 'Health Clinic Expansion',
      budget: 10000000,
      spent: 11200000,
      progress: 80,
      status: 'at-risk',
      deadline: 'Dec 2024'
    }
  ];

  const demographicData = [
    { category: 'Children (0-17)', count: 892, percentage: 31.3 },
    { category: 'Young Adults (18-35)', count: 1023, percentage: 35.9 },
    { category: 'Adults (36-55)', count: 681, percentage: 23.9 },
    { category: 'Seniors (55+)', count: 251, percentage: 8.9 }
  ];

  const economicData = [
    { sector: 'Agriculture', contribution: 45.2, jobs: 1280 },
    { sector: 'Trade & Commerce', contribution: 23.8, jobs: 340 },
    { sector: 'Education', contribution: 12.5, jobs: 89 },
    { sector: 'Healthcare', contribution: 8.9, jobs: 67 },
    { sector: 'Tourism', contribution: 5.2, jobs: 45 },
    { sector: 'Other Services', contribution: 4.4, jobs: 120 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'on-track': return 'bg-blue-500';
      case 'delayed': return 'bg-orange-500';
      case 'at-risk': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'on-track': return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'delayed': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'at-risk': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center mb-2">
          <BarChart3 className="h-6 w-6 mr-2 text-primary" />
          Village Analytics
        </h2>
        <p className="text-muted-foreground">Data-driven insights about village development and progress</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className={`text-xs flex items-center ${
                    metric.trend === 'up' ? 'text-green-600' : 
                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {metric.trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                    {metric.change} from last {selectedPeriod}
                  </p>
                </div>
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  {metric.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Project Tracking</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="economy">Economic Data</TabsTrigger>
          <TabsTrigger value="trends">Development Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Project Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectMetrics.map((project, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(project.status)}
                        <h3 className="font-medium">{project.name}</h3>
                        <Badge variant="outline" className={`capitalize`}>
                          {project.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Due: {project.deadline}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Budget</p>
                        <p className="font-medium">{formatCurrency(project.budget)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Spent</p>
                        <p className={`font-medium ${project.spent > project.budget ? 'text-red-600' : ''}`}>
                          {formatCurrency(project.spent)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Remaining</p>
                        <p className="font-medium">{formatCurrency(project.budget - project.spent)}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Progress</span>
                        <span className="text-sm font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Age Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demographicData.map((demo, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{demo.category}</span>
                        <span className="text-sm text-muted-foreground">
                          {demo.count} ({demo.percentage}%)
                        </span>
                      </div>
                      <Progress value={demo.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Population Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Current Population</span>
                    <span className="text-2xl font-bold">2,847</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Growth Rate (Annual)</span>
                    <span className="text-lg font-medium text-green-600">+2.3%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Projected 2025</span>
                    <span className="text-lg font-medium">2,910</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Birth Rate</span>
                    <span className="text-sm">28 per 1000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Migration Rate</span>
                    <span className="text-sm text-green-600">+1.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="economy">
          <Card>
            <CardHeader>
              <CardTitle>Economic Sectors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {economicData.map((sector, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">{sector.sector}</h3>
                      <Badge variant="secondary">{sector.jobs} jobs</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Economic Contribution</span>
                        <span className="text-sm font-medium">{sector.contribution}%</span>
                      </div>
                      <Progress value={sector.contribution} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Development Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Infrastructure Score</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={72} className="h-2 w-20" />
                      <span className="text-sm font-medium">72/100</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Education Access</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={85} className="h-2 w-20" />
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Healthcare Coverage</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={68} className="h-2 w-20" />
                      <span className="text-sm font-medium">68%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Clean Water Access</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={45} className="h-2 w-20" />
                      <span className="text-sm font-medium">45%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Electricity Coverage</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={78} className="h-2 w-20" />
                      <span className="text-sm font-medium">78%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality of Life Index</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">7.2</div>
                    <p className="text-sm text-muted-foreground">Out of 10</p>
                    <Badge variant="secondary" className="mt-2">+0.8 from last year</Badge>
                  </div>
                  
                  <div className="space-y-3 mt-6">
                    <div className="flex justify-between">
                      <span className="text-sm">Safety & Security</span>
                      <span className="text-sm font-medium">8.1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Economic Opportunities</span>
                      <span className="text-sm font-medium">6.8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Environment Quality</span>
                      <span className="text-sm font-medium">7.5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Community Cohesion</span>
                      <span className="text-sm font-medium">8.9</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Public Services</span>
                      <span className="text-sm font-medium">6.2</span>
                    </div>
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