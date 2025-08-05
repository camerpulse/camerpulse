import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Eye, 
  FileText, 
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Download,
  Search,
  BarChart3,
  Users,
  Building2
} from 'lucide-react';

export function TransparencyPage() {
  const transparencyMetrics = [
    {
      title: "Budget Transparency",
      score: 78,
      status: "Good",
      trend: "+5%",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Policy Disclosure", 
      score: 65,
      status: "Fair",
      trend: "+2%",
      icon: FileText,
      color: "text-yellow-600"
    },
    {
      title: "Electoral Transparency",
      score: 82,
      status: "Excellent", 
      trend: "+8%",
      icon: Shield,
      color: "text-green-600"
    },
    {
      title: "Public Participation",
      score: 58,
      status: "Needs Improvement",
      trend: "-1%", 
      icon: Users,
      color: "text-red-600"
    }
  ];

  const recentReports = [
    {
      title: "2024 National Budget Analysis",
      type: "Budget Report",
      date: "March 15, 2024",
      status: "Published",
      downloads: "2.3K",
      icon: DollarSign
    },
    {
      title: "Municipal Spending Transparency Review",
      type: "Audit Report", 
      date: "March 10, 2024",
      status: "Published",
      downloads: "1.8K",
      icon: Building2
    },
    {
      title: "Electoral Commission Performance",
      type: "Assessment",
      date: "March 5, 2024", 
      status: "Published",
      downloads: "3.1K",
      icon: Shield
    },
    {
      title: "Public Procurement Monitoring",
      type: "Quarterly Report",
      date: "February 28, 2024",
      status: "Published", 
      downloads: "1.5K",
      icon: Eye
    }
  ];

  const watchlist = [
    {
      title: "Infrastructure Projects Delayed",
      severity: "High",
      category: "Public Works",
      lastUpdate: "2 days ago",
      icon: AlertTriangle,
      color: "text-red-600"
    },
    {
      title: "Budget Allocation Discrepancies", 
      severity: "Medium",
      category: "Finance",
      lastUpdate: "1 week ago",
      icon: DollarSign,
      color: "text-yellow-600"
    },
    {
      title: "Procurement Process Improvements",
      severity: "Low",
      category: "Governance",
      lastUpdate: "2 weeks ago", 
      icon: CheckCircle,
      color: "text-green-600"
    }
  ];

  const departments = [
    { name: "Ministry of Finance", transparency: 85, trend: "up" },
    { name: "Ministry of Education", transparency: 78, trend: "up" },
    { name: "Ministry of Health", transparency: 72, trend: "stable" },
    { name: "Ministry of Public Works", transparency: 68, trend: "down" },
    { name: "Ministry of Justice", transparency: 74, trend: "up" }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Transparency Portal</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Monitor government accountability, track public spending, and access transparency reports. 
          Promoting open governance through data and citizen oversight.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Button size="lg" className="h-14 justify-start">
          <Search className="h-5 w-5 mr-3" />
          Search Reports
        </Button>
        <Button size="lg" variant="outline" className="h-14 justify-start">
          <BarChart3 className="h-5 w-5 mr-3" />
          View Analytics
        </Button>
        <Button size="lg" variant="outline" className="h-14 justify-start">
          <AlertTriangle className="h-5 w-5 mr-3" />
          Report Issues
        </Button>
        <Button size="lg" variant="outline" className="h-14 justify-start">
          <Download className="h-5 w-5 mr-3" />
          Download Data
        </Button>
      </div>

      {/* Transparency Metrics */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Transparency Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {transparencyMetrics.map((metric, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <metric.icon className="h-6 w-6 text-primary" />
                  <Badge variant={metric.status === 'Excellent' ? 'default' : metric.status === 'Good' ? 'secondary' : 'destructive'}>
                    {metric.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <h3 className="font-semibold text-sm">{metric.title}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Score</span>
                    <span className="font-bold">{metric.score}/100</span>
                  </div>
                  <Progress value={metric.score} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Trend</span>
                  <span className={metric.color}>{metric.trend}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Reports */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-foreground">Latest Reports</h2>
            <div className="space-y-4">
              {recentReports.map((report, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <report.icon className="h-8 w-8 text-primary mt-1" />
                        <div>
                          <h3 className="font-semibold mb-1">{report.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span>{report.type}</span>
                            <span>•</span>
                            <span>{report.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{report.status}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {report.downloads} downloads
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Department Rankings */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-foreground">Department Transparency Rankings</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {departments.map((dept, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                        <div>
                          <h4 className="font-medium">{dept.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={dept.transparency} className="w-20" />
                            <span className="text-sm text-muted-foreground">{dept.transparency}%</span>
                          </div>
                        </div>
                      </div>
                      <TrendingUp className={`h-4 w-4 ${
                        dept.trend === 'up' ? 'text-green-600' : 
                        dept.trend === 'down' ? 'text-red-600 rotate-180' : 
                        'text-gray-400'
                      }`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Watchlist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Watchlist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {watchlist.map((item, index) => (
                <div key={index} className="border-b border-border pb-3 last:border-0">
                  <div className="flex items-start gap-3">
                    <item.icon className={`h-5 w-5 mt-0.5 ${item.color}`} />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={item.severity === 'High' ? 'destructive' : item.severity === 'Medium' ? 'secondary' : 'default'}
                          className="text-xs"
                        >
                          {item.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{item.category}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{item.lastUpdate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">94</div>
                <p className="text-sm text-muted-foreground">Reports Published</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">15.7K</div>
                <p className="text-sm text-muted-foreground">Citizens Engaged</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">$2.8M</div>
                <p className="text-sm text-muted-foreground">Funds Tracked</p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Report */}
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-6 text-center">
              <h3 className="font-bold mb-2">Report Concerns</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Help improve transparency by reporting issues
              </p>
              <Button className="w-full">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Submit Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}