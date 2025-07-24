import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Vote, 
  DollarSign, 
  Users, 
  Shield, 
  Search,
  Filter,
  Download,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertCircle,
  CheckCircle,
  Calendar,
  MapPin,
  TrendingUp,
  Eye,
  BarChart3,
  UserCheck,
  FileCheck
} from 'lucide-react';
import { useElectoralData } from '@/hooks/useElectoralData';

export const ElectoralTransparency = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedElectionType, setSelectedElectionType] = useState<string>('all');
  
  const { 
    elections, 
    campaigns, 
    voterRegistration,
    parties,
    overallStats,
    isLoading 
  } = useElectoralData();

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTransparencyColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-blue-600 bg-blue-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getElectionStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredElections = elections?.filter(election => 
    (selectedRegion === 'all' || election.region === selectedRegion) &&
    (selectedElectionType === 'all' || election.type === selectedElectionType) &&
    (searchTerm === '' || election.title.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <h1 className="text-3xl font-bold">Electoral Transparency Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor elections, campaign finance, voter registration, and electoral integrity
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Live Results
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Electoral Transparency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{overallStats?.transparencyScore || 95}%</span>
              {getTrendIcon('up')}
            </div>
            <Progress value={overallStats?.transparencyScore || 95} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Registered Voters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{(overallStats?.registeredVoters || 0 / 1000000).toFixed(1)}M</span>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {overallStats?.registrationRate || 87}% of eligible population
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Elections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{elections?.filter(e => e.status === 'ongoing').length || 3}</span>
              <Vote className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {elections?.filter(e => e.status === 'upcoming').length || 7} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Campaign Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{((overallStats?.totalCampaignSpending || 0) / 1000000000).toFixed(1)}B</span>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              FCFA declared this cycle
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="elections" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="elections">Election Monitoring</TabsTrigger>
          <TabsTrigger value="campaigns">Campaign Finance</TabsTrigger>
          <TabsTrigger value="registration">Voter Registration</TabsTrigger>
          <TabsTrigger value="parties">Political Parties</TabsTrigger>
        </TabsList>

        {/* Election Monitoring Tab */}
        <TabsContent value="elections" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>Election Monitoring Dashboard</CardTitle>
                  <CardDescription>
                    Real-time monitoring of electoral processes and transparency metrics
                  </CardDescription>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      placeholder="Search elections..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      <SelectItem value="Centre">Centre</SelectItem>
                      <SelectItem value="Littoral">Littoral</SelectItem>
                      <SelectItem value="West">West</SelectItem>
                      <SelectItem value="Northwest">Northwest</SelectItem>
                      <SelectItem value="Southwest">Southwest</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedElectionType} onValueChange={setSelectedElectionType}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="presidential">Presidential</SelectItem>
                      <SelectItem value="parliamentary">Parliamentary</SelectItem>
                      <SelectItem value="municipal">Municipal</SelectItem>
                      <SelectItem value="regional">Regional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredElections.map((election) => (
                  <Card key={election.id} className="border-l-4 border-l-primary/20">
                    <CardContent className="pt-4">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{election.title}</h3>
                            <Badge 
                              className={getElectionStatusColor(election.status)}
                              variant="secondary"
                            >
                              {election.status}
                            </Badge>
                            <Badge variant="outline">{election.type}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {election.region}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(election.electionDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {election.eligibleVoters.toLocaleString()} voters
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Transparency Score</p>
                              <div className="flex items-center gap-2">
                                <Progress value={election.transparencyScore} className="flex-1 h-2" />
                                <span className="text-sm font-medium">{election.transparencyScore}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Voter Turnout</p>
                              <div className="flex items-center gap-2">
                                <Progress value={election.voterTurnout} className="flex-1 h-2" />
                                <span className="text-sm font-medium">{election.voterTurnout}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Process Integrity</p>
                              <div className="flex items-center gap-2">
                                <Progress value={election.processIntegrity} className="flex-1 h-2" />
                                <span className="text-sm font-medium">{election.processIntegrity}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Results Published</p>
                              <div className="flex items-center gap-2">
                                <Progress value={election.resultsPublished} className="flex-1 h-2" />
                                <span className="text-sm font-medium">{election.resultsPublished}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Button variant="outline" size="sm">
                            View Results
                          </Button>
                          <Button variant="outline" size="sm">
                            Observation Reports
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaign Finance Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Campaign Finance Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Declared Spending</p>
                    <p className="text-2xl font-bold">
                      {((overallStats?.totalCampaignSpending || 0) / 1000000000).toFixed(1)}B FCFA
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Transparency Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {overallStats?.financeTransparencyRate || 82}%
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Financial Disclosure</span>
                      <span>89%</span>
                    </div>
                    <Progress value={89} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Expenditure Tracking</span>
                      <span>76%</span>
                    </div>
                    <Progress value={76} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Donation Transparency</span>
                      <span>84%</span>
                    </div>
                    <Progress value={84} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Campaign Spenders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {campaigns?.slice(0, 6).map((campaign, index) => (
                    <div key={campaign.id} className="flex items-center justify-between p-2 rounded border">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                        <div>
                          <p className="font-medium text-sm">{campaign.candidateName}</p>
                          <p className="text-xs text-muted-foreground">{campaign.party}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">
                          {(campaign.totalSpending / 1000000).toFixed(1)}M
                        </p>
                        <Badge 
                          className={getTransparencyColor(campaign.transparencyScore)}
                          variant="secondary"
                        >
                          {campaign.transparencyScore}%
                        </Badge>
                      </div>
                    </div>
                  )) || []}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Finance Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900">Pending Disclosure</p>
                      <p className="text-sm text-yellow-700">
                        3 candidates have not submitted Q4 finance reports
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">Due in 5 days</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">Spending Limit Alert</p>
                      <p className="text-sm text-red-700">
                        2 campaigns approaching spending limits
                      </p>
                      <p className="text-xs text-red-600 mt-1">Requires monitoring</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">Compliant</p>
                      <p className="text-sm text-green-700">
                        87% of campaigns fully compliant with finance rules
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Voter Registration Tab */}
        <TabsContent value="registration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Voter Registration Analytics
              </CardTitle>
              <CardDescription>
                Monitor voter registration transparency and accessibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Registration Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">{(overallStats?.registeredVoters || 0 / 1000000).toFixed(1)}M</p>
                      <p className="text-sm text-muted-foreground">Total Registered</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{overallStats?.registrationRate || 87}%</p>
                      <p className="text-sm text-muted-foreground">Registration Rate</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {voterRegistration?.map((region) => (
                      <div key={region.region} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{region.region}</span>
                          <Badge variant="outline">{region.registrationRate}%</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Registered: {region.registeredVoters.toLocaleString()}</span>
                            <span>Eligible: {region.eligibleVoters.toLocaleString()}</span>
                          </div>
                          <Progress value={region.registrationRate} className="h-2" />
                        </div>
                      </div>
                    )) || []}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Accessibility Metrics</h4>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Registration Center Access</span>
                            <span>92%</span>
                          </div>
                          <Progress value={92} />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Online Registration</span>
                            <span>78%</span>
                          </div>
                          <Progress value={78} />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Document Verification</span>
                            <span>95%</span>
                          </div>
                          <Progress value={95} />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Disability Access</span>
                            <span>67%</span>
                          </div>
                          <Progress value={67} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Registration Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
                          <div>
                            <p className="font-medium text-blue-900">New Registrations</p>
                            <p className="text-sm text-blue-700">+47K this month</p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-blue-500" />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                          <div>
                            <p className="font-medium text-green-900">Youth Registration</p>
                            <p className="text-sm text-green-700">89% of 18-25 age group</p>
                          </div>
                          <Users className="h-8 w-8 text-green-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Political Parties Tab */}
        <TabsContent value="parties" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Political Party Transparency
              </CardTitle>
              <CardDescription>
                Monitor political party compliance and transparency metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {parties?.map((party) => (
                  <Card key={party.id} className="border-l-4 border-l-indigo-200">
                    <CardContent className="pt-4">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{party.name}</h3>
                            <Badge 
                              className={getTransparencyColor(party.transparencyScore)}
                              variant="secondary"
                            >
                              {party.transparencyScore}%
                            </Badge>
                            <Badge variant="outline">{party.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Leader: <span className="font-medium">{party.leader}</span> | 
                            Founded: <span className="font-medium">{party.founded}</span> |
                            Members: <span className="font-medium">{party.memberCount.toLocaleString()}</span>
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Financial Disclosure</p>
                              <div className="flex items-center gap-2">
                                <Progress value={party.financialDisclosure} className="flex-1 h-2" />
                                <span className="text-sm font-medium">{party.financialDisclosure}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Governance</p>
                              <div className="flex items-center gap-2">
                                <Progress value={party.governanceScore} className="flex-1 h-2" />
                                <span className="text-sm font-medium">{party.governanceScore}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Public Reporting</p>
                              <div className="flex items-center gap-2">
                                <Progress value={party.publicReporting} className="flex-1 h-2" />
                                <span className="text-sm font-medium">{party.publicReporting}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Compliance</p>
                              <div className="flex items-center gap-2">
                                <Progress value={party.complianceScore} className="flex-1 h-2" />
                                <span className="text-sm font-medium">{party.complianceScore}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                          <Button variant="outline" size="sm">
                            Finance Reports
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) || []}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};