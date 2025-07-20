import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, MessageCircle, DollarSign, TrendingUp, Users, GraduationCap, Vote, BarChart3, AlertTriangle } from 'lucide-react';

const CivicTools = () => {
  const phase1Tools = [
    {
      id: 'petitions',
      title: 'Petition Engine',
      description: 'Create, sign, and track civic petitions',
      icon: FileText,
      path: '/petitions',
      status: 'active',
      users: '12.3k'
    },
    {
      id: 'complaints',
      title: 'Civic Complaint Portal',
      description: 'Report issues and track government responses',
      icon: MessageCircle,
      path: '/civic-complaints',
      status: 'active',
      users: '8.7k'
    },
    {
      id: 'budget',
      title: 'Budget Transparency',
      description: 'Monitor government spending and budget allocation',
      icon: DollarSign,
      path: '/budget-transparency',
      status: 'active',
      users: '5.2k'
    }
  ];

  const phase2Tools = [
    {
      id: 'enhanced-polls',
      title: 'Enhanced Polling System',
      description: 'Advanced polls with analytics and verification',
      icon: Vote,
      path: '/enhanced-polls',
      status: 'new',
      users: '2.1k'
    },
    {
      id: 'performance',
      title: 'Politician Performance Tracker',
      description: 'Track and analyze political performance metrics',
      icon: BarChart3,
      path: '/politician-performance',
      status: 'new',
      users: '3.4k'
    },
    {
      id: 'education',
      title: 'Civic Education Hub',
      description: 'Learn about civic engagement and democracy',
      icon: GraduationCap,
      path: '/civic-education',
      status: 'new',
      users: '1.8k'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'new': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'new': return 'New';
      default: return 'Unknown';
    }
  };

  const ToolCard = ({ tool }: { tool: any }) => {
    const Icon = tool.icon;
    
    return (
      <Card className="hover:shadow-lg transition-shadow duration-200 group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{tool.title}</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className={`${getStatusColor(tool.status)} text-white text-xs`}>
                    {getStatusText(tool.status)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{tool.users} users</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="mb-4 text-base">
            {tool.description}
          </CardDescription>
          <Button asChild className="w-full">
            <Link to={tool.path}>
              Access Tool
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Users className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Civic Engagement Tools</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive tools for citizen participation, government transparency, and democratic engagement
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">32.1k</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">1,247</div>
              <div className="text-sm text-muted-foreground">Active Petitions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">892</div>
              <div className="text-sm text-muted-foreground">Resolved Issues</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">156</div>
              <div className="text-sm text-muted-foreground">Urgent Alerts</div>
            </CardContent>
          </Card>
        </div>

        {/* Phase 1: Core Civic Tools */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <Badge variant="outline" className="mr-3">Phase 1</Badge>
            <h2 className="text-2xl font-bold">Core Civic Tools</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {phase1Tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>

        {/* Phase 2: Enhanced Engagement Tools */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <Badge variant="outline" className="mr-3 bg-blue-50 border-blue-200">Phase 2</Badge>
            <h2 className="text-2xl font-bold">Enhanced Engagement Tools</h2>
            <Badge className="ml-3 bg-blue-500">New</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {phase2Tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/20 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Get Started with Civic Engagement</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of citizens making a difference in their communities. Start with any tool that interests you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/petitions">Create a Petition</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/civic-education">Learn More</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CivicTools;