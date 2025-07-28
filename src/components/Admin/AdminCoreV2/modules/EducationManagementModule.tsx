import React, { useState } from 'react';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { GraduationCap, School, Award, DollarSign, FileText, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface EducationManagementModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const EducationManagementModule: React.FC<EducationManagementModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('schools');

  // Mock data for demonstration
  const schools = [
    {
      id: 1,
      name: 'Government High School Yaoundé',
      type: 'Public',
      level: 'Secondary',
      region: 'Centre',
      students: 1250,
      teachers: 45,
      rating: 4.3,
      claims: 3,
      verified: true
    },
    {
      id: 2,
      name: 'University of Yaoundé I',
      type: 'Public',
      level: 'Higher Education',
      region: 'Centre',
      students: 35000,
      teachers: 850,
      rating: 4.1,
      claims: 7,
      verified: true
    }
  ];

  const scholarshipPrograms = [
    {
      id: 1,
      name: 'Excellence Scholarship Program',
      provider: 'Ministry of Education',
      amount: 500000,
      duration: '4 years',
      applicants: 450,
      awarded: 25,
      deadline: '2024-03-15',
      status: 'active'
    },
    {
      id: 2,
      name: 'Rural Education Support',
      provider: 'World Bank',
      amount: 300000,
      duration: '2 years',
      applicants: 780,
      awarded: 120,
      deadline: '2024-04-30',
      status: 'active'
    }
  ];

  const grantPrograms = [
    {
      id: 1,
      name: 'School Infrastructure Development',
      agency: 'MINEDUB',
      budget: 50000000,
      allocated: 35000000,
      applications: 156,
      approved: 89,
      status: 'ongoing'
    },
    {
      id: 2,
      name: 'Digital Learning Initiative',
      agency: 'UNESCO',
      budget: 25000000,
      allocated: 18000000,
      applications: 89,
      approved: 56,
      status: 'ongoing'
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      ongoing: "default",
      approved: "default",
      pending: "secondary",
      under_review: "outline",
      suspended: "destructive",
      completed: "outline"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'Primary': 'text-green-600',
      'Secondary': 'text-blue-600',
      'Higher Education': 'text-purple-600',
      'Vocational': 'text-orange-600'
    };
    return colors[level] || 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Education Management"
        description="Manage schools, scholarships, and educational grants"
        icon={GraduationCap}
        iconColor="text-purple-600"
        searchPlaceholder="Search educational institutions..."
        onSearch={(query) => {
          console.log('Searching education:', query);
        }}
        onRefresh={() => {
          logActivity('education_admin_refresh', { timestamp: new Date() });
        }}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schools">Schools</TabsTrigger>
          <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
          <TabsTrigger value="grants">Grants</TabsTrigger>
        </TabsList>

        <TabsContent value="schools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
                <School className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15,678</div>
                <p className="text-xs text-muted-foreground">Across all levels</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.4M</div>
                <p className="text-xs text-muted-foreground">Enrolled students</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89,450</div>
                <p className="text-xs text-muted-foreground">Active educators</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Enrollment Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87.3%</div>
                <p className="text-xs text-muted-foreground">Primary education</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Educational Institutions</CardTitle>
              <CardDescription>Manage school registrations and verifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schools.map((school) => (
                  <div key={school.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{school.name}</h3>
                        {school.verified && <Award className="h-4 w-4 text-green-600" />}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className={getLevelColor(school.level)}>{school.level}</span>
                        <span>{school.type}</span>
                        <span>{school.region}</span>
                        <span>{school.students.toLocaleString()} students</span>
                        <span>{school.teachers} teachers</span>
                        <span>★ {school.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Verified</Badge>
                      {school.claims > 0 && (
                        <Badge variant="outline">{school.claims} claims</Badge>
                      )}
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scholarships" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45</div>
                <p className="text-xs text-muted-foreground">Currently accepting applications</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,456</div>
                <p className="text-xs text-muted-foreground">This academic year</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scholarships Awarded</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3,240</div>
                <p className="text-xs text-muted-foreground">26% acceptance rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.5B</div>
                <p className="text-xs text-muted-foreground">FCFA disbursed</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Scholarship Programs</CardTitle>
              <CardDescription>Manage scholarship applications and awards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scholarshipPrograms.map((program) => (
                  <div key={program.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{program.name}</h3>
                        {getStatusBadge(program.status)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{program.provider}</span>
                        <span>{program.amount.toLocaleString()} FCFA</span>
                        <span>{program.duration}</span>
                        <span>Deadline: {program.deadline}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Applications</span>
                            <span>{program.awarded}/{program.applicants}</span>
                          </div>
                          <Progress value={(program.awarded / program.applicants) * 100} className="h-2" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="outline" size="sm">Review Applications</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grants" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Grants</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">Currently open</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">125B</div>
                <p className="text-xs text-muted-foreground">FCFA allocated</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">856</div>
                <p className="text-xs text-muted-foreground">Pending review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68%</div>
                <p className="text-xs text-muted-foreground">Approval rate</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Grant Programs</CardTitle>
              <CardDescription>Manage educational development grants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {grantPrograms.map((grant) => (
                  <div key={grant.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{grant.name}</h3>
                        {getStatusBadge(grant.status)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{grant.agency}</span>
                        <span>Budget: {grant.budget.toLocaleString()} FCFA</span>
                        <span>Applications: {grant.applications}</span>
                        <span>Approved: {grant.approved}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Budget Utilization</span>
                            <span>{((grant.allocated / grant.budget) * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={(grant.allocated / grant.budget) * 100} className="h-2" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="outline" size="sm">Manage Grant</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};