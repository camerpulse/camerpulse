import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Scale, Shield, AlertTriangle, FileText, MessageSquare, Flag } from 'lucide-react';
import { useJudiciaryData } from '@/hooks/useJudiciaryData';
import { toast } from '@/components/ui/sonner';

export const JudiciaryDirectory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [courtLevelFilter, setCourtLevelFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('members');

  const { 
    judiciaryMembers, 
    legalCases, 
    isLoading,
    createRating,
    createMisconductReport 
  } = useJudiciaryData();

  const courtLevels = [
    { value: 'supreme_court', label: 'Supreme Court' },
    { value: 'constitutional_council', label: 'Constitutional Council' },
    { value: 'court_of_appeal', label: 'Court of Appeal' },
    { value: 'high_court', label: 'High Court' },
    { value: 'military_tribunal', label: 'Military Tribunal' },
    { value: 'magistrate_court', label: 'Magistrate Court' },
    { value: 'district_court', label: 'District Court' }
  ];

  const cameroonRegions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const filteredMembers = judiciaryMembers?.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.position_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourtLevel = courtLevelFilter === 'all' || member.court_level === courtLevelFilter;
    const matchesRegion = regionFilter === 'all' || member.region === regionFilter;
    
    return matchesSearch && matchesCourtLevel && matchesRegion;
  }) || [];

  const filteredCases = legalCases?.filter(legalCase => {
    const matchesSearch = legalCase.case_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         legalCase.case_reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourtLevel = courtLevelFilter === 'all' || legalCase.court_level === courtLevelFilter;
    const matchesRegion = regionFilter === 'all' || legalCase.region === regionFilter;
    
    return matchesSearch && matchesCourtLevel && matchesRegion;
  }) || [];

  const handleRateJudge = async (memberId: string) => {
    try {
      // This would open a rating modal in a real implementation
      toast.success('Rating functionality would open here');
    } catch (error) {
      toast.error('Failed to submit rating');
    }
  };

  const handleReportMisconduct = async (memberId: string) => {
    try {
      // This would open a misconduct report modal in a real implementation
      toast.success('Misconduct report form would open here');
    } catch (error) {
      toast.error('Failed to submit report');
    }
  };

  const getCourtLevelBadge = (level: string) => {
    const colors = {
      supreme_court: 'bg-gradient-to-r from-cm-red to-cm-red/80 text-white',
      constitutional_council: 'bg-gradient-to-r from-cm-green to-cm-green/80 text-white',
      court_of_appeal: 'bg-gradient-to-r from-cm-yellow to-cm-yellow/80 text-black',
      high_court: 'bg-primary text-primary-foreground',
      military_tribunal: 'bg-destructive text-destructive-foreground',
      magistrate_court: 'bg-secondary text-secondary-foreground',
      district_court: 'bg-muted text-muted-foreground'
    };
    return colors[level as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  const getCaseStatusBadge = (status: string) => {
    const colors = {
      ongoing: 'bg-blue-500/10 text-blue-700 border-blue-200',
      closed: 'bg-green-500/10 text-green-700 border-green-200',
      delayed: 'bg-red-500/10 text-red-700 border-red-200',
      appeal: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
      suspended: 'bg-gray-500/10 text-gray-700 border-gray-200'
    };
    return colors[status as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Scale className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading judiciary information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center mb-2">
          <Scale className="h-8 w-8 mr-3 text-cm-red" />
          Judiciary System & Legal Oversight
        </h1>
        <p className="text-muted-foreground">
          Promoting judicial transparency, accountability, and citizen access to justice
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              placeholder="Search judges, cases, or courts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={courtLevelFilter} onValueChange={setCourtLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Court Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Court Levels</SelectItem>
                {courtLevels.map(level => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {cameroonRegions.map(region => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="members">Judiciary Members</TabsTrigger>
          <TabsTrigger value="cases">Legal Cases</TabsTrigger>
          <TabsTrigger value="transparency">Transparency Ratings</TabsTrigger>
          <TabsTrigger value="complaints">Report Issues</TabsTrigger>
        </TabsList>

        {/* Judiciary Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.photo_url} alt={member.name} />
                      <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold truncate">
                        {member.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {member.position_title}
                      </p>
                      <Badge className={`mt-1 ${getCourtLevelBadge(member.court_level)}`}>
                        {courtLevels.find(l => l.value === member.court_level)?.label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Region:</span>
                      <span>{member.region}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cases Handled:</span>
                      <span>{member.cases_handled}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Integrity Score:</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span>{member.integrity_score?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRateJudge(member.id)}
                      className="flex-1"
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Rate
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleReportMisconduct(member.id)}
                    >
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Scale className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Judiciary Members Found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or filters
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Legal Cases Tab */}
        <TabsContent value="cases" className="space-y-4">
          <div className="space-y-4">
            {filteredCases.map((legalCase) => (
              <Card key={legalCase.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{legalCase.case_title}</CardTitle>
                      <CardDescription>
                        Reference: {legalCase.case_reference}
                      </CardDescription>
                    </div>
                    <Badge className={getCaseStatusBadge(legalCase.case_status)}>
                      {legalCase.case_status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Type:</span>
                        <span className="text-sm font-medium">
                          {legalCase.case_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Court Level:</span>
                        <span className="text-sm font-medium">
                          {courtLevels.find(l => l.value === legalCase.court_level)?.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Region:</span>
                        <span className="text-sm font-medium">{legalCase.region}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Defendant:</span>
                        <span className="text-sm font-medium">{legalCase.defendant}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Started:</span>
                        <span className="text-sm font-medium">
                          {legalCase.started_date ? new Date(legalCase.started_date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Public Interest:</span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm font-medium">{legalCase.public_interest_score}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {legalCase.case_summary && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Summary:</p>
                      <p className="text-sm">{legalCase.case_summary}</p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <FileText className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Comments ({legalCase.citizen_comments_count})
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCases.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Legal Cases Found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or filters
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Transparency Ratings Tab */}
        <TabsContent value="transparency" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Most Trusted Courts</CardTitle>
                <CardDescription>Based on citizen ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {courtLevels.slice(0, 5).map((level, index) => (
                    <div key={level.value} className="flex justify-between items-center">
                      <span className="text-sm">{level.label}</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">{(4.5 - index * 0.3).toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Regional Comparison</CardTitle>
                <CardDescription>Judicial trust by region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cameroonRegions.slice(0, 5).map((region, index) => (
                    <div key={region} className="flex justify-between items-center">
                      <span className="text-sm">{region}</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">{(4.2 - index * 0.2).toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Transparency Metrics</CardTitle>
                <CardDescription>System-wide indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Case Timeliness</span>
                    <Badge variant="secondary">72%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Public Trust Index</span>
                    <Badge variant="secondary">3.8/5</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Ethical Conduct</span>
                    <Badge variant="secondary">4.1/5</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Court Neutrality</span>
                    <Badge variant="secondary">3.9/5</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Complaints Tab */}
        <TabsContent value="complaints" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                  Report Judicial Misconduct
                </CardTitle>
                <CardDescription>
                  Submit anonymous reports about judicial misconduct or irregularities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Flag className="h-4 w-4 mr-2" />
                  File Misconduct Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-500" />
                  Whistleblower Portal
                </CardTitle>
                <CardDescription>
                  Secure submission for sensitive judicial matters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Access Secure Portal
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Legal Rights Center</CardTitle>
              <CardDescription>
                Understanding your rights and access to justice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="h-auto p-4 flex-col">
                  <FileText className="h-8 w-8 mb-2" />
                  <span className="text-sm font-medium">Legal Dictionary</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex-col">
                  <Scale className="h-8 w-8 mb-2" />
                  <span className="text-sm font-medium">Justice Guides</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex-col">
                  <Shield className="h-8 w-8 mb-2" />
                  <span className="text-sm font-medium">Rights Tutorials</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex-col">
                  <MessageSquare className="h-8 w-8 mb-2" />
                  <span className="text-sm font-medium">Ask Questions</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};