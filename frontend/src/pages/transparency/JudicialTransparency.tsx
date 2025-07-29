import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Gavel, 
  Scale, 
  Clock, 
  FileText, 
  Users, 
  Search,
  Filter,
  Download,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertCircle,
  CheckCircle,
  Calendar,
  Building,
  Award,
  TrendingUp,
  Eye
} from 'lucide-react';
import { useJudicialData } from '@/hooks/useJudicialData';

export const JudicialTransparency = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourt, setSelectedCourt] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('6months');
  
  const { 
    courts, 
    cases, 
    judges,
    procedures,
    overallStats,
    isLoading 
  } = useJudicialData();

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-blue-600 bg-blue-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getCaseStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'appealed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCourts = courts?.filter(court => 
    (selectedCourt === 'all' || court.id === selectedCourt) &&
    (searchTerm === '' || court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     court.location.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Judicial Transparency Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor court proceedings, case resolutions, and judicial accountability
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Public Records
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Judicial Transparency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{overallStats?.transparencyScore || 78}%</span>
              {getTrendIcon('stable')}
            </div>
            <Progress value={overallStats?.transparencyScore || 78} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Courts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{courts?.length || 156}</span>
              <Building className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Across 10 regions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cases Resolved (6M)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{overallStats?.casesResolved || 8934}</span>
              {getTrendIcon('up')}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {overallStats?.resolutionRate || 73}% resolution rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Case Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{overallStats?.avgDuration || 127} days</span>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              15% faster than last year
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="courts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="courts">Court Performance</TabsTrigger>
          <TabsTrigger value="cases">Case Tracking</TabsTrigger>
          <TabsTrigger value="judges">Judge Ratings</TabsTrigger>
          <TabsTrigger value="procedures">Legal Procedures</TabsTrigger>
        </TabsList>

        {/* Court Performance Tab */}
        <TabsContent value="courts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>Court Performance Monitor</CardTitle>
                  <CardDescription>
                    Track performance metrics across all courts in Cameroon
                  </CardDescription>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      placeholder="Search courts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCourt} onValueChange={setSelectedCourt}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by court" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courts</SelectItem>
                      <SelectItem value="supreme">Supreme Court</SelectItem>
                      <SelectItem value="appeal">Courts of Appeal</SelectItem>
                      <SelectItem value="high">High Courts</SelectItem>
                      <SelectItem value="magistrate">Magistrate Courts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCourts.map((court) => (
                  <Card key={court.id} className="border-l-4 border-l-primary/20">
                    <CardContent className="pt-4">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{court.name}</h3>
                            <Badge 
                              className={getPerformanceColor(court.performanceScore)}
                              variant="secondary"
                            >
                              {court.performanceScore}%
                            </Badge>
                            <Badge variant="outline">{court.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Location: <span className="font-medium">{court.location}</span> | 
                            Chief Judge: <span className="font-medium">{court.chiefJudge}</span>
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Case Resolution</p>
                              <div className="flex items-center gap-2">
                                <Progress value={court.caseResolutionRate} className="flex-1 h-2" />
                                <span className="text-sm font-medium">{court.caseResolutionRate}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Transparency</p>
                              <div className="flex items-center gap-2">
                                <Progress value={court.transparencyScore} className="flex-1 h-2" />
                                <span className="text-sm font-medium">{court.transparencyScore}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Public Access</p>
                              <div className="flex items-center gap-2">
                                <Progress value={court.publicAccessScore} className="flex-1 h-2" />
                                <span className="text-sm font-medium">{court.publicAccessScore}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Avg. Duration</p>
                              <span className="text-sm font-medium">{court.avgCaseDuration} days</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Button variant="outline" size="sm">
                            View Cases
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Active cases: {court.activeCases}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Case Tracking Tab */}
        <TabsContent value="cases" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Case Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Cases</p>
                    <p className="text-2xl font-bold">{overallStats?.totalCases || 12247}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Resolved</p>
                    <p className="text-2xl font-bold text-green-600">{overallStats?.casesResolved || 8934}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Criminal Cases</span>
                    <span>45%</span>
                  </div>
                  <Progress value={45} />
                  <div className="flex justify-between text-sm">
                    <span>Civil Cases</span>
                    <span>35%</span>
                  </div>
                  <Progress value={35} />
                  <div className="flex justify-between text-sm">
                    <span>Commercial Cases</span>
                    <span>20%</span>
                  </div>
                  <Progress value={20} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Case Resolution Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                    <div>
                      <p className="font-medium text-green-900">This Month</p>
                      <p className="text-sm text-green-700">847 cases resolved</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div>
                      <p className="font-medium text-blue-900">Avg. Duration</p>
                      <p className="text-sm text-blue-700">127 days (↓15%)</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div>
                      <p className="font-medium text-yellow-900">Pending</p>
                      <p className="text-sm text-yellow-700">3,313 cases</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Case Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cases?.slice(0, 5).map((case_item) => (
                    <div key={case_item.id} className="border-l-2 border-l-blue-200 pl-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">{case_item.title}</p>
                        <Badge className={getCaseStatusColor(case_item.status)} variant="secondary">
                          {case_item.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Court: {case_item.court} | Updated: {new Date(case_item.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                  )) || []}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Judge Ratings Tab */}
        <TabsContent value="judges" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Judge Performance & Accountability
              </CardTitle>
              <CardDescription>
                Transparency ratings and performance metrics for judicial officers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {judges?.map((judge) => (
                  <Card key={judge.id} className="border-l-4 border-l-purple-200">
                    <CardContent className="pt-4">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{judge.name}</h3>
                            <Badge 
                              className={getPerformanceColor(judge.overallRating)}
                              variant="secondary"
                            >
                              {judge.overallRating}%
                            </Badge>
                            <Badge variant="outline">{judge.rank}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Court: <span className="font-medium">{judge.court}</span> | 
                            Appointed: <span className="font-medium">{judge.appointmentDate}</span>
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Case Resolution</p>
                              <div className="flex items-center gap-2">
                                <Progress value={judge.caseResolutionScore} className="flex-1 h-2" />
                                <span className="text-sm font-medium">{judge.caseResolutionScore}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Punctuality</p>
                              <div className="flex items-center gap-2">
                                <Progress value={judge.punctualityScore} className="flex-1 h-2" />
                                <span className="text-sm font-medium">{judge.punctualityScore}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Impartiality</p>
                              <div className="flex items-center gap-2">
                                <Progress value={judge.impartialityScore} className="flex-1 h-2" />
                                <span className="text-sm font-medium">{judge.impartialityScore}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Cases Handled</p>
                              <span className="text-sm font-medium">{judge.casesHandled}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Last reviewed: {new Date(judge.lastReviewed).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) || []}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Legal Procedures Tab */}
        <TabsContent value="procedures" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Legal Procedure Transparency
              </CardTitle>
              <CardDescription>
                Public access to legal procedures and process documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Procedure Categories</h4>
                  {procedures?.map((procedure) => (
                    <Card key={procedure.id} className="border">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-medium">{procedure.title}</h5>
                            <p className="text-sm text-muted-foreground">{procedure.category}</p>
                          </div>
                          <Badge 
                            className={getPerformanceColor(procedure.accessibilityScore)}
                            variant="secondary"
                          >
                            {procedure.accessibilityScore}%
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Documentation</span>
                            <span>{procedure.documentationScore}%</span>
                          </div>
                          <Progress value={procedure.documentationScore} className="h-2" />
                          <div className="flex justify-between text-sm">
                            <span>Public Access</span>
                            <span>{procedure.publicAccessScore}%</span>
                          </div>
                          <Progress value={procedure.publicAccessScore} className="h-2" />
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button variant="outline" size="sm">View Guide</Button>
                          <Button variant="outline" size="sm">Download Forms</Button>
                        </div>
                      </CardContent>
                    </Card>
                  )) || []}
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Public Access Metrics</h4>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Court Records Access</span>
                            <span>87%</span>
                          </div>
                          <Progress value={87} />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Procedure Documentation</span>
                            <span>92%</span>
                          </div>
                          <Progress value={92} />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Legal Form Availability</span>
                            <span>78%</span>
                          </div>
                          <Progress value={78} />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Hearing Schedules</span>
                            <span>85%</span>
                          </div>
                          <Progress value={85} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Quick Access Links</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Court Case Search
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        Hearing Schedules
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="h-4 w-4 mr-2" />
                        Legal Aid Directory
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Legal Forms & Documents
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};