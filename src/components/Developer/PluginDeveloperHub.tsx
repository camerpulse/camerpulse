import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { 
  Code, 
  Upload, 
  Book, 
  Shield, 
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  Github,
  Package,
  FileText,
  Zap,
  Users,
  Star,
  Download,
  Terminal,
  Globe,
  AlertTriangle
} from 'lucide-react';

export const PluginDeveloperHub: React.FC = () => {
  const [submissionStats] = useState({
    totalSubmissions: 127,
    pendingReview: 8,
    approved: 94,
    rejected: 25
  });

  const quickStartSteps = [
    {
      step: 1,
      title: "Create Your Plugin",
      description: "Build your plugin using our SDK and guidelines",
      icon: Code,
      link: "#docs"
    },
    {
      step: 2,
      title: "Test & Validate",
      description: "Use our testing tools to ensure compatibility",
      icon: CheckCircle,
      link: "/developer/console"
    },
    {
      step: 3,
      title: "Submit for Review",
      description: "Upload your plugin for security review",
      icon: Upload,
      link: "/developer/console"
    },
    {
      step: 4,
      title: "Go Live",
      description: "Once approved, your plugin goes live in the marketplace",
      icon: Star,
      link: "/marketplace/plugins"
    }
  ];

  const featuredDocs = [
    {
      title: "Plugin Architecture",
      description: "Learn how CamerPulse plugins work and integrate",
      icon: Package,
      difficulty: "Beginner"
    },
    {
      title: "API Reference",
      description: "Complete documentation of available APIs",
      icon: Terminal,
      difficulty: "Intermediate"
    },
    {
      title: "Security Guidelines",
      description: "Best practices for secure plugin development",
      icon: Shield,
      difficulty: "Advanced"
    },
    {
      title: "UI Components",
      description: "Using CamerPulse's design system in your plugins",
      icon: FileText,
      difficulty: "Beginner"
    }
  ];

  const recentSubmissions = [
    {
      name: "Advanced Analytics Dashboard",
      author: "DataViz Team",
      status: "approved",
      submittedAt: "2 hours ago",
      category: "Analytics"
    },
    {
      name: "Social Media Integration",
      author: "SocialDev",
      status: "pending",
      submittedAt: "5 hours ago",
      category: "Social"
    },
    {
      name: "Custom Polling Widget",
      author: "PollCraft",
      status: "needs_review",
      submittedAt: "1 day ago",
      category: "Civic"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'needs_review':
        return <Badge className="bg-orange-100 text-orange-800"><AlertTriangle className="h-3 w-3 mr-1" />Needs Review</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-orange-100 text-orange-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Build for <span className="text-primary">CamerPulse</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Create powerful plugins that extend CamerPulse's civic engagement platform. 
              Join a community of developers building the future of digital democracy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="px-8">
                <Link to="/developer/console">
                  <Upload className="h-5 w-5 mr-2" />
                  Submit Plugin
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8">
                <Book className="h-5 w-5 mr-2" />
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12 space-y-12">
        {/* Stats Overview */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">{submissionStats.totalSubmissions}</div>
                <div className="text-sm text-muted-foreground">Total Submissions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">{submissionStats.pendingReview}</div>
                <div className="text-sm text-muted-foreground">Pending Review</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{submissionStats.approved}</div>
                <div className="text-sm text-muted-foreground">Approved</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">{submissionStats.rejected}</div>
                <div className="text-sm text-muted-foreground">Rejected</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quick Start Guide */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Get Started in 4 Steps</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From idea to marketplace in minutes. Follow our streamlined process to get your plugin approved and published.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStartSteps.map((step, index) => (
              <Card key={step.step} className="relative group hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-primary/20">{step.step}</div>
                  </div>
                  
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
                  
                  <Button variant="ghost" size="sm" asChild className="p-0 h-auto">
                    <Link to={step.link} className="flex items-center text-primary">
                      Learn More <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
                
                {index < quickStartSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-6 bg-background border-2 border-muted rounded-full flex items-center justify-center">
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>

        <Tabs defaultValue="documentation" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
            <TabsTrigger value="submissions">My Submissions</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="documentation" className="space-y-6">
            {/* Featured Documentation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Book className="h-5 w-5 mr-2" />
                  Featured Documentation
                </CardTitle>
                <CardDescription>
                  Essential guides to get you started with CamerPulse plugin development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {featuredDocs.map((doc, index) => (
                    <div key={index} className="group border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded">
                            <doc.icon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium group-hover:text-primary transition-colors">{doc.title}</h3>
                          </div>
                        </div>
                        <Badge className={getDifficultyColor(doc.difficulty)}>{doc.difficulty}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{doc.description}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <Button variant="outline" asChild>
                    <Link to="/developer/console">
                      <Terminal className="h-4 w-4 mr-2" />
                      View Full Documentation
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* API Quick Reference */}
            <Card>
              <CardHeader>
                <CardTitle>API Quick Reference</CardTitle>
                <CardDescription>Common APIs you'll use in your plugins</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded p-3">
                    <div className="font-mono text-sm font-medium mb-1">CamerPulse.init(config)</div>
                    <div className="text-sm text-muted-foreground">Initialize your plugin with CamerPulse core</div>
                  </div>
                  <div className="border rounded p-3">
                    <div className="font-mono text-sm font-medium mb-1">CamerPulse.data.get(source)</div>
                    <div className="text-sm text-muted-foreground">Access CamerPulse data sources (polls, users, etc.)</div>
                  </div>
                  <div className="border rounded p-3">
                    <div className="font-mono text-sm font-medium mb-1">CamerPulse.render(component, target)</div>
                    <div className="text-sm text-muted-foreground">Render UI components in the CamerPulse interface</div>
                  </div>
                  <div className="border rounded p-3">
                    <div className="font-mono text-sm font-medium mb-1">CamerPulse.storage.set(key, value)</div>
                    <div className="text-sm text-muted-foreground">Store plugin-specific data securely</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions" className="space-y-6">
            {/* Submission Actions */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Submissions</h2>
              <div className="flex space-x-2">
                <Button variant="outline" asChild>
                  <Link to="/developer/console">
                    <FileText className="h-4 w-4 mr-2" />
                    View Status
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/developer/console">
                    <Upload className="h-4 w-4 mr-2" />
                    New Submission
                  </Link>
                </Button>
              </div>
            </div>

            {/* Recent Submissions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest plugin submissions and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSubmissions.map((submission, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{submission.name}</h3>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>by {submission.author}</span>
                            <span>•</span>
                            <span>{submission.submittedAt}</span>
                            <span>•</span>
                            <Badge variant="outline">{submission.category}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(submission.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            {/* Community Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold mb-1">450+</div>
                  <div className="text-sm text-muted-foreground">Active Developers</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold mb-1">280+</div>
                  <div className="text-sm text-muted-foreground">Published Plugins</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Download className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold mb-1">15K+</div>
                  <div className="text-sm text-muted-foreground">Total Downloads</div>
                </CardContent>
              </Card>
            </div>

            {/* Community Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Community Resources</CardTitle>
                <CardDescription>Connect with other developers and get help</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Github className="h-5 w-5" />
                      <h3 className="font-medium">GitHub Repository</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Access our open-source plugin SDK and contribute to the project
                    </p>
                    <Button variant="outline" size="sm">
                      <Github className="h-4 w-4 mr-2" />
                      View on GitHub
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Users className="h-5 w-5" />
                      <h3 className="font-medium">Developer Forum</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Ask questions, share tips, and connect with the community
                    </p>
                    <Button variant="outline" size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      Join Forum
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};