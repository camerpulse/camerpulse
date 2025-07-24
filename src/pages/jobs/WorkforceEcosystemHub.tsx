import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { CivicLayout } from '@/components/camerpulse/CivicLayout';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  MapPin, 
  BarChart3, 
  Target,
  Shield,
  Globe,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default function WorkforceEcosystemHub() {
  const ecosystemComponents = [
    {
      title: "Job Board & Marketplace",
      description: "Central platform for job postings, applications, and talent discovery",
      status: "Active",
      icon: Building2,
      link: "/jobs/board",
      features: ["Real-time job matching", "Skills verification", "Regional targeting"]
    },
    {
      title: "Sponsorship Platform",
      description: "Verified sponsors funding employment campaigns across regions",
      status: "Active", 
      icon: Users,
      link: "/jobs/campaigns",
      features: ["Campaign management", "Impact tracking", "ROI analytics"]
    },
    {
      title: "Analytics Dashboard",
      description: "Comprehensive insights for sponsors and stakeholders",
      status: "Active",
      icon: BarChart3,
      link: "/jobs/analytics",
      features: ["Real-time metrics", "Export capabilities", "Custom reports"]
    },
    {
      title: "Public Transparency",
      description: "Open government workforce intelligence and policy tracking",
      status: "Active",
      icon: Globe,
      link: "/transparency/workforce",
      features: ["Open data access", "Policy impact", "Regional analysis"]
    }
  ];

  const integrationFlow = [
    { step: 1, title: "Job Creation", description: "Employers post verified positions" },
    { step: 2, title: "Sponsor Matching", description: "Campaigns get sponsor funding" },
    { step: 3, title: "Talent Acquisition", description: "Job seekers apply and get hired" },
    { step: 4, title: "Impact Tracking", description: "Real-time analytics and reporting" },
    { step: 5, title: "Public Transparency", description: "Open data for accountability" }
  ];

  return (
    <CivicLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Cameroon Workforce Ecosystem
          </h1>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
            A comprehensive, integrated platform connecting job seekers, employers, sponsors, and government 
            for transparent and effective workforce development across all 10 regions of Cameroon.
          </p>
          <div className="flex gap-2 justify-center">
            <Badge variant="default">Fully Integrated</Badge>
            <Badge variant="secondary">Government Verified</Badge>
            <Badge variant="outline">Open Data</Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">4</div>
              <p className="text-sm text-muted-foreground">Core Components</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">10</div>
              <p className="text-sm text-muted-foreground">Regions Covered</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Shield className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">100%</div>
              <p className="text-sm text-muted-foreground">Verified Data</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">24/7</div>
              <p className="text-sm text-muted-foreground">Real-time Updates</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">System Overview</TabsTrigger>
            <TabsTrigger value="integration">Integration Flow</TabsTrigger>
            <TabsTrigger value="access">Quick Access</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {ecosystemComponents.map((component, index) => {
                const IconComponent = component.icon;
                return (
                  <Card key={index} className="relative">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <IconComponent className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{component.title}</CardTitle>
                            <Badge variant="default" className="mt-1">
                              {component.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <CardDescription>{component.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Key Features:</h4>
                        <ul className="space-y-1">
                          {component.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Button asChild className="w-full">
                        <Link to={component.link}>
                          Access {component.title}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="integration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ecosystem Integration Flow</CardTitle>
                <CardDescription>How all components work together for maximum impact</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {integrationFlow.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      {index < integrationFlow.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Integration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Real-time job posting sync</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Automated sponsor matching</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Cross-platform analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Public transparency feeds</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Experience</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Single sign-on across platforms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Unified notification system</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Seamless role transitions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Mobile-first design</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="access" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Job Seekers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    For Job Seekers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild variant="default" className="w-full">
                    <Link to="/jobs/board">Browse Jobs</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/profile">Create Profile</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/jobs/applications">My Applications</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Employers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    For Employers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild variant="default" className="w-full">
                    <Link to="/jobs/company">Company Portal</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/jobs/post">Post a Job</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/jobs/campaigns">Find Sponsors</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Sponsors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    For Sponsors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild variant="default" className="w-full">
                    <Link to="/jobs/campaigns">View Campaigns</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/jobs/analytics">Analytics Dashboard</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/jobs/create-campaign">Create Campaign</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Government/Public */}
              <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Public Access & Transparency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button asChild variant="default">
                      <Link to="/transparency/workforce">Workforce Intelligence</Link>
                    </Button>
                    <Button asChild variant="default">
                      <Link to="/transparency/policy-impact">Policy Impact Tracker</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/jobs/leaderboard">Regional Leaderboard</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/economics">Economic Data</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* System Status */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-medium text-green-800">System Fully Operational</h3>
                <p className="text-sm text-green-600">All components integrated and functioning normally</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CivicLayout>
  );
}