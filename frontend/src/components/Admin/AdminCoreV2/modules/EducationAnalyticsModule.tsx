import React, { useState } from 'react';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { BarChart, TrendingUp, Users, GraduationCap, BookOpen, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface EducationAnalyticsModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const EducationAnalyticsModule: React.FC<EducationAnalyticsModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for education analytics
  const educationMetrics = {
    totalEnrollment: 2400000,
    literacyRate: 78.5,
    completionRate: 72.3,
    teacherStudentRatio: 42,
    schoolAttendance: 86.7,
    graduationRate: 68.9
  };

  const enrollmentByLevel = [
    { level: 'Primary', enrolled: 1680000, capacity: 1800000, target: 95 },
    { level: 'Secondary', enrolled: 540000, capacity: 600000, target: 85 },
    { level: 'Higher Education', enrolled: 180000, capacity: 220000, target: 40 },
    { level: 'Vocational', enrolled: 85000, capacity: 120000, target: 30 }
  ];

  const regionalPerformance = [
    {
      region: 'Centre',
      enrollment: 92.3,
      completion: 78.5,
      literacy: 85.2,
      schools: 1245,
      teachers: 12450
    },
    {
      region: 'Littoral',
      enrollment: 89.7,
      completion: 74.2,
      literacy: 82.1,
      schools: 998,
      teachers: 9980
    },
    {
      region: 'West',
      enrollment: 85.4,
      completion: 69.8,
      literacy: 76.4,
      schools: 887,
      teachers: 8870
    },
    {
      region: 'Northwest',
      enrollment: 82.1,
      completion: 65.3,
      literacy: 72.8,
      schools: 756,
      teachers: 7560
    },
    {
      region: 'Far North',
      enrollment: 68.5,
      completion: 52.1,
      literacy: 58.9,
      schools: 645,
      teachers: 6450
    }
  ];

  const scholarshipAnalytics = [
    {
      program: 'Excellence Scholarship',
      applications: 1250,
      awarded: 125,
      budget: 50000000,
      utilized: 35000000,
      successRate: 89.6
    },
    {
      program: 'Rural Education Support',
      applications: 2340,
      awarded: 468,
      budget: 75000000,
      utilized: 62000000,
      successRate: 92.3
    },
    {
      program: 'Technical Training Grants',
      applications: 890,
      awarded: 267,
      budget: 30000000,
      utilized: 24000000,
      successRate: 85.4
    }
  ];

  const performanceIndicators = [
    {
      indicator: 'Primary School Completion',
      current: 78.5,
      target: 85.0,
      trend: 'improving'
    },
    {
      indicator: 'Teacher Training Coverage',
      current: 65.2,
      target: 80.0,
      trend: 'stable'
    },
    {
      indicator: 'Digital Literacy',
      current: 42.1,
      target: 60.0,
      trend: 'improving'
    },
    {
      indicator: 'Gender Parity Index',
      current: 0.89,
      target: 1.0,
      trend: 'improving'
    }
  ];

  const getTrendColor = (trend: string) => {
    const colors = {
      improving: 'text-green-600',
      declining: 'text-red-600',
      stable: 'text-yellow-600'
    };
    return colors[trend as keyof typeof colors] || 'text-gray-600';
  };

  const getPerformanceBadge = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 90) return <Badge variant="default">Excellent</Badge>;
    if (percentage >= 75) return <Badge variant="secondary">Good</Badge>;
    if (percentage >= 60) return <Badge variant="outline">Fair</Badge>;
    return <Badge variant="destructive">Poor</Badge>;
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Education Analytics"
        description="Monitor educational performance, enrollment, and outcomes"
        icon={BarChart}
        iconColor="text-indigo-600"
        searchPlaceholder="Search education metrics..."
        onSearch={(query) => {
          console.log('Searching education analytics:', query);
        }}
        onRefresh={() => {
          logActivity('education_analytics_refresh', { timestamp: new Date() });
        }}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Enrollment</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(educationMetrics.totalEnrollment / 1000000).toFixed(1)}M</div>
                <p className="text-xs text-muted-foreground">Students enrolled</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Literacy Rate</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{educationMetrics.literacyRate}%</div>
                <Progress value={educationMetrics.literacyRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{educationMetrics.completionRate}%</div>
                <Progress value={educationMetrics.completionRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Teacher-Student Ratio</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1:{educationMetrics.teacherStudentRatio}</div>
                <p className="text-xs text-muted-foreground">National average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">School Attendance</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{educationMetrics.schoolAttendance}%</div>
                <Progress value={educationMetrics.schoolAttendance} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Graduation Rate</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{educationMetrics.graduationRate}%</div>
                <Progress value={educationMetrics.graduationRate} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
              <CardDescription>Progress towards national education goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceIndicators.map((indicator, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{indicator.indicator}</h3>
                        {getPerformanceBadge(indicator.current, indicator.target)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Current: {indicator.current}{indicator.indicator === 'Gender Parity Index' ? '' : '%'}</span>
                        <span>Target: {indicator.target}{indicator.indicator === 'Gender Parity Index' ? '' : '%'}</span>
                        <span className={getTrendColor(indicator.trend)}>
                          {indicator.trend}
                        </span>
                      </div>
                    </div>
                    <div className="w-32">
                      <Progress value={indicator.indicator === 'Gender Parity Index' ? indicator.current * 100 : (indicator.current / indicator.target) * 100} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrollment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment by Education Level</CardTitle>
              <CardDescription>Student enrollment across different education levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enrollmentByLevel.map((level) => (
                  <div key={level.level} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{level.level}</h3>
                        <Badge variant="outline">{((level.enrolled / level.capacity) * 100).toFixed(1)}% capacity</Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Enrolled: {level.enrolled.toLocaleString()}</span>
                        <span>Capacity: {level.capacity.toLocaleString()}</span>
                        <span>Target: {level.target}%</span>
                      </div>
                    </div>
                    <div className="space-y-2 w-48">
                      <div className="flex justify-between text-sm">
                        <span>Enrollment Rate</span>
                        <span>{((level.enrolled / level.capacity) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(level.enrolled / level.capacity) * 100} />
                      <div className="flex justify-between text-sm">
                        <span>Target Progress</span>
                        <span>{(((level.enrolled / level.capacity) * 100) / level.target * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={((level.enrolled / level.capacity) * 100) / level.target * 100} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regional Education Performance</CardTitle>
              <CardDescription>Education metrics by region showing enrollment, completion, and literacy rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regionalPerformance.map((region) => (
                  <div key={region.region} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{region.region} Region</h3>
                        {getPerformanceBadge(region.enrollment, 90)}
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <span>{region.schools} schools</span>
                        <span>{region.teachers.toLocaleString()} teachers</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 w-96">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Enrollment</div>
                        <div className="text-sm text-muted-foreground">{region.enrollment}%</div>
                        <Progress value={region.enrollment} className="h-2" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Completion</div>
                        <div className="text-sm text-muted-foreground">{region.completion}%</div>
                        <Progress value={region.completion} className="h-2" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Literacy</div>
                        <div className="text-sm text-muted-foreground">{region.literacy}%</div>
                        <Progress value={region.literacy} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">Scholarship & grant programs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">155B</div>
                <p className="text-xs text-muted-foreground">FCFA allocated</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89.1%</div>
                <p className="text-xs text-muted-foreground">Program completion rate</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Scholarship & Grant Program Analytics</CardTitle>
              <CardDescription>Performance metrics for educational support programs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scholarshipAnalytics.map((program, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{program.program}</h3>
                        <Badge variant="outline">Success: {program.successRate}%</Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{program.applications} applications</span>
                        <span>{program.awarded} awarded</span>
                        <span>Budget: {(program.budget / 1000000).toFixed(0)}M FCFA</span>
                      </div>
                    </div>
                    <div className="space-y-2 w-48">
                      <div className="flex justify-between text-sm">
                        <span>Award Rate</span>
                        <span>{((program.awarded / program.applications) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(program.awarded / program.applications) * 100} />
                      <div className="flex justify-between text-sm">
                        <span>Budget Utilization</span>
                        <span>{((program.utilized / program.budget) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(program.utilized / program.budget) * 100} />
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