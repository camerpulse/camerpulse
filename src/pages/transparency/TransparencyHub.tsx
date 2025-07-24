import React, { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  TrendingUp, 
  Eye, 
  BarChart3, 
  Users, 
  Building2, 
  Scale, 
  Vote, 
  DollarSign, 
  FileText,
  CheckCircle,
  AlertTriangle,
  Calendar,
  MapPin,
  Target,
  Award,
  Activity,
  PieChart,
  ArrowRight,
  Globe
} from 'lucide-react';

const TransparencyHub = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');

  const overviewStats = [
    { 
      label: "Overall Transparency Score", 
      value: "94%", 
      change: "+2.3%", 
      icon: Shield, 
      color: "text-green-600",
      description: "Based on 847 evaluated metrics"
    },
    { 
      label: "Government Projects Tracked", 
      value: "1,247", 
      change: "+89", 
      icon: Building2, 
      color: "text-primary",
      description: "Active monitoring across all ministries"
    },
    { 
      label: "Public Officials Monitored", 
      value: "3,456", 
      change: "+12", 
      icon: Users, 
      color: "text-blue-600",
      description: "MPs, Ministers, Senators, Judges"
    },
    { 
      label: "Budget Transparency", 
      value: "87%", 
      change: "+4.1%", 
      icon: DollarSign, 
      color: "text-green-600",
      description: "Public financial data accessibility"
    }
  ];

  const transparencyCategories = [
    {
      title: "Government Operations",
      description: "Track government efficiency, spending, and service delivery",
      icon: Building2,
      score: 91,
      features: ["Budget tracking", "Ministry performance", "Public contracts"],
      href: "/transparency/government",
      color: "from-blue-500 to-blue-600",
      metrics: { total: 847, verified: 771, pending: 76 }
    },
    {
      title: "Judicial System",
      description: "Monitor court proceedings, case resolutions, and judicial accountability",
      icon: Scale,
      score: 78,
      features: ["Court case tracking", "Judge ratings", "Legal transparency"],
      href: "/judiciary",
      color: "from-purple-500 to-purple-600",
      metrics: { total: 234, verified: 183, pending: 51 }
    },
    {
      title: "Electoral Process",
      description: "Ensure transparent elections, campaign finance, and voting integrity",
      icon: Vote,
      score: 95,
      features: ["Campaign finance", "Election results", "Voting security"],
      href: "/transparency/elections",
      color: "from-green-500 to-green-600",
      metrics: { total: 156, verified: 148, pending: 8 }
    },
    {
      title: "Public Workforce",
      description: "Monitor hiring practices, workforce analytics, and employment policies",
      icon: Users,
      score: 89,
      features: ["Hiring transparency", "Workforce data", "Policy impact"],
      href: "/transparency/workforce",
      color: "from-orange-500 to-orange-600",
      metrics: { total: 423, verified: 376, pending: 47 }
    }
  ];

  const recentUpdates = [
    {
      title: "Ministry of Health Budget Report",
      description: "Q3 2024 financial transparency report published",
      timestamp: "2 hours ago",
      type: "budget",
      impact: "high",
      verified: true
    },
    {
      title: "Supreme Court Case Database Updated",
      description: "847 new case records added with full documentation",
      timestamp: "5 hours ago",
      type: "judicial",
      impact: "medium",
      verified: true
    },
    {
      title: "Regional Election Results Verified",
      description: "Complete transparency audit for recent regional elections",
      timestamp: "1 day ago",
      type: "electoral",
      impact: "high",
      verified: true
    },
    {
      title: "Public Procurement Alert",
      description: "New contracts worth 2.4B FCFA require transparency review",
      timestamp: "2 days ago",
      type: "procurement",
      impact: "critical",
      verified: false
    }
  ];

  const transparencyMethodology = [
    {
      step: "1",
      title: "Data Collection",
      description: "Automated scraping of government websites, official documents, and public records"
    },
    {
      step: "2", 
      title: "Verification",
      description: "Cross-referencing with multiple sources and citizen reports for accuracy"
    },
    {
      step: "3",
      title: "Analysis",
      description: "AI-powered analysis to identify patterns, anomalies, and transparency gaps"
    },
    {
      step: "4",
      title: "Scoring",
      description: "Weighted scoring based on accessibility, completeness, and timeliness of information"
    },
    {
      step: "5",
      title: "Public Display",
      description: "Real-time dashboards and alerts to keep citizens informed"
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <Eye className="h-4 w-4 mr-2" />
              Live Transparency Monitoring
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Transparency Portal
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Real-time monitoring of government operations, judicial processes, and electoral integrity. 
              Empowering citizens with unprecedented access to public information.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-4 text-lg">
                <BarChart3 className="h-5 w-5 mr-2" />
                View Live Dashboard
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                <Shield className="h-5 w-5 mr-2" />
                Methodology Guide
              </Button>
            </div>
          </div>

          {/* Overview Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {overviewStats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    <Badge variant="secondary" className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm font-medium mb-1">{stat.label}</div>
                  <div className="text-xs text-muted-foreground">{stat.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="methodology">Methodology</TabsTrigger>
            <TabsTrigger value="updates">Live Updates</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Transparency Score Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Transparency Score Breakdown
                  </CardTitle>
                  <CardDescription>
                    Detailed analysis of transparency metrics across government sectors
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { category: "Budget & Finance", score: 96, total: 245 },
                    { category: "Judicial Proceedings", score: 78, total: 156 },
                    { category: "Electoral Process", score: 95, total: 89 },
                    { category: "Public Procurement", score: 84, total: 198 },
                    { category: "Ministry Operations", score: 91, total: 159 }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.category}</span>
                        <span className="text-muted-foreground">{item.score}% ({item.total} metrics)</span>
                      </div>
                      <Progress value={item.score} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Regional Transparency Map */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Regional Transparency Index
                  </CardTitle>
                  <CardDescription>
                    Transparency scores across Cameroon's 10 regions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { region: "Centre", score: 94, trend: "up" },
                    { region: "Littoral", score: 91, trend: "up" },
                    { region: "South", score: 87, trend: "stable" },
                    { region: "West", score: 85, trend: "up" },
                    { region: "East", score: 82, trend: "down" },
                    { region: "Northwest", score: 79, trend: "up" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">{item.region}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.score}%
                        </Badge>
                      </div>
                      <div className="flex items-center">
                        {item.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                        {item.trend === 'down' && <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />}
                        {item.trend === 'stable' && <Activity className="h-4 w-4 text-yellow-600" />}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {transparencyCategories.map((category, index) => (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center mb-4`}>
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{category.title}</CardTitle>
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {category.score}%
                      </Badge>
                    </div>
                    <CardDescription className="text-base">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 mb-6">
                      <Progress value={category.score} className="h-3" />
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-primary">{category.metrics.total}</div>
                          <div className="text-xs text-muted-foreground">Total</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-green-600">{category.metrics.verified}</div>
                          <div className="text-xs text-muted-foreground">Verified</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-orange-600">{category.metrics.pending}</div>
                          <div className="text-xs text-muted-foreground">Pending</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {category.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-primary mr-2" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button asChild className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Link to={category.href}>
                        Explore Details
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Methodology Tab */}
          <TabsContent value="methodology" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Transparency Scoring Methodology
                </CardTitle>
                <CardDescription>
                  Our comprehensive approach to measuring and scoring government transparency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  {transparencyMethodology.map((step, index) => (
                    <div key={index} className="text-center">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto mb-4">
                        {step.step}
                      </div>
                      <h3 className="font-semibold mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Scoring Criteria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Scoring Criteria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { criterion: "Data Accessibility", weight: "25%", description: "How easily public can access information" },
                    { criterion: "Information Completeness", weight: "25%", description: "Depth and detail of available data" },
                    { criterion: "Update Frequency", weight: "20%", description: "How current the information is" },
                    { criterion: "Verification Status", weight: "20%", description: "Accuracy and reliability of data" },
                    { criterion: "Citizen Engagement", weight: "10%", description: "Public participation and feedback" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <div>
                        <div className="font-medium">{item.criterion}</div>
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                      </div>
                      <Badge variant="outline">{item.weight}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Sources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { source: "Government Websites", status: "Active", count: "247 sites" },
                    { source: "Official Documents", status: "Verified", count: "12,847 docs" },
                    { source: "Budget Reports", status: "Real-time", count: "156 reports" },
                    { source: "Court Records", status: "Updated", count: "8,934 cases" },
                    { source: "Citizen Reports", status: "Moderated", count: "2,156 reports" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <div>
                        <div className="font-medium">{item.source}</div>
                        <div className="text-sm text-muted-foreground">{item.count}</div>
                      </div>
                      <Badge variant="secondary">{item.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Live Updates Tab */}
          <TabsContent value="updates" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      Recent Transparency Updates
                    </CardTitle>
                    <CardDescription>
                      Live feed of transparency-related activities and reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentUpdates.map((update, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 rounded-lg border">
                        <div className="flex-shrink-0">
                          {update.verified ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{update.title}</h4>
                            <Badge className={getImpactColor(update.impact)}>
                              {update.impact}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{update.description}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {update.timestamp}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 rounded-lg bg-primary/10">
                      <div className="text-2xl font-bold text-primary">24/7</div>
                      <div className="text-sm text-muted-foreground">Monitoring Active</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-green-50">
                      <div className="text-2xl font-bold text-green-600">847</div>
                      <div className="text-sm text-muted-foreground">Updates This Week</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-blue-50">
                      <div className="text-2xl font-bold text-blue-600">2.4M</div>
                      <div className="text-sm text-muted-foreground">Citizens Reached</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Get Involved</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Submit Report
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Globe className="h-4 w-4 mr-2" />
                      Join Community
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Award className="h-4 w-4 mr-2" />
                      Become Verifier
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default TransparencyHub;