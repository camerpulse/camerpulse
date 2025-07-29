import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Building, MapPin, User, Phone, Mail, Globe, TrendingUp, FileText, Users, Star, ArrowLeft, Calendar, DollarSign } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const MinistryProfile: React.FC = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);

  // Mock ministry data - would come from API in real implementation
  const ministry = {
    id: 'min-1',
    name: 'Ministry of Public Health',
    acronym: 'MINSANTE',
    mission: 'To ensure universal access to quality healthcare services for all Cameroonians through effective policies, strategic planning, and efficient resource management.',
    minister: {
      name: 'Dr. Manaouda Malachie',
      bio: 'Medical doctor with over 20 years of experience in public health administration.',
      photo: '/placeholder-minister.jpg'
    },
    permanentSecretary: 'Dr. Marie Solange Doualla',
    headquarters: {
      address: 'Yaoundé, Centre Region',
      phone: '+237 222 23 40 18',
      email: 'info@minsante.cm',
      website: 'www.minsante.cm'
    },
    departments: [
      'Department of Hospitals',
      'Department of Health Promotion',
      'Department of Pharmaceutical Affairs',
      'Department of Traditional Medicine',
      'Department of Human Resources'
    ],
    currentProjects: [
      {
        name: 'Universal Health Coverage Initiative',
        progress: 75,
        budget: '250B FCFA',
        status: 'ongoing'
      },
      {
        name: 'COVID-19 Vaccination Campaign',
        progress: 90,
        budget: '120B FCFA',
        status: 'ongoing'
      },
      {
        name: 'Rural Health Centers Construction',
        progress: 60,
        budget: '180B FCFA',
        status: 'ongoing'
      }
    ],
    budget: {
      total: '850B FCFA',
      allocated: '650B FCFA',
      spent: '420B FCFA',
      remaining: '230B FCFA'
    },
    performanceStats: {
      projectsCompleted: 23,
      ongoingProjects: 18,
      citizenRating: 4.2,
      totalRatings: 1247,
      responseTime: '3.2 days',
      transparency: 85
    },
    recentNews: [
      {
        title: 'New Health Insurance Policy Launched',
        date: '2024-01-15',
        summary: 'Comprehensive health insurance coverage expanded to rural areas.'
      },
      {
        title: 'Partnership with WHO Announced',
        date: '2024-01-10',
        summary: 'Collaboration to strengthen epidemic preparedness and response.'
      }
    ],
    petitions: {
      supporting: 12,
      opposing: 3
    }
  };

  const handleRateMinistry = (newRating: number) => {
    setRating(newRating);
    toast({
      title: "Rating Submitted",
      description: `You rated ${ministry.name} ${newRating} stars.`,
    });
  };

  const handleSendFeedback = () => {
    toast({
      title: "Feedback Sent",
      description: "Your feedback has been submitted to the ministry.",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/directory">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Directory
            </Button>
          </Link>
        </div>

        <div className="flex items-start gap-6">
          <div className="bg-primary/10 p-4 rounded-lg">
            <Building className="h-12 w-12 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">{ministry.name}</h1>
            <p className="text-xl text-muted-foreground font-medium mb-2">{ministry.acronym}</p>
            <p className="text-muted-foreground max-w-3xl">{ministry.mission}</p>
            
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="font-medium">{ministry.performanceStats.citizenRating}</span>
                <span className="text-sm text-muted-foreground">
                  ({ministry.performanceStats.totalRatings} ratings)
                </span>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Active Ministry
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leadership">Leadership</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="engage">Engage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{ministry.headquarters.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{ministry.headquarters.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{ministry.headquarters.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>{ministry.headquarters.website}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Key Departments */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Departments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ministry.departments.map((dept, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <span className="font-medium">{dept}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Projects Completed</span>
                    <span className="font-medium">{ministry.performanceStats.projectsCompleted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ongoing Projects</span>
                    <span className="font-medium">{ministry.performanceStats.ongoingProjects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Response Time</span>
                    <span className="font-medium">{ministry.performanceStats.responseTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transparency Score</span>
                    <span className="font-medium">{ministry.performanceStats.transparency}%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent News */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent News</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ministry.recentNews.map((news, index) => (
                    <div key={index} className="border-l-2 border-primary pl-4">
                      <h4 className="font-medium text-sm">{news.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{news.summary}</p>
                      <span className="text-xs text-muted-foreground">{news.date}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="leadership" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Minister
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{ministry.minister.name}</h3>
                    <p className="text-muted-foreground text-sm mt-2">{ministry.minister.bio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Permanent Secretary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{ministry.permanentSecretary}</h3>
                    <p className="text-muted-foreground text-sm mt-2">Administrative head overseeing daily operations and policy implementation.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Current Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ministry.currentProjects.map((project, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge className={project.status === 'ongoing' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                      {project.status}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Budget</span>
                      <span className="font-medium">{project.budget}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="budget" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Budget Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{ministry.budget.total}</div>
                  <div className="text-sm text-muted-foreground">Total Budget</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{ministry.budget.allocated}</div>
                  <div className="text-sm text-muted-foreground">Allocated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{ministry.budget.spent}</div>
                  <div className="text-sm text-muted-foreground">Spent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{ministry.budget.remaining}</div>
                  <div className="text-sm text-muted-foreground">Remaining</div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <h4 className="font-semibold">Budget Utilization</h4>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Budget Spent</span>
                    <span>65%</span>
                  </div>
                  <Progress value={65} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Citizen Satisfaction</span>
                    <span>{ministry.performanceStats.citizenRating}/5.0</span>
                  </div>
                  <Progress value={ministry.performanceStats.citizenRating * 20} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Transparency Score</span>
                    <span>{ministry.performanceStats.transparency}%</span>
                  </div>
                  <Progress value={ministry.performanceStats.transparency} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Project Success Rate</span>
                    <span>78%</span>
                  </div>
                  <Progress value={78} className="h-3" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Citizen Engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Petitions Supporting</span>
                  <Badge className="bg-green-100 text-green-800">{ministry.petitions.supporting}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Petitions Opposing</span>
                  <Badge className="bg-red-100 text-red-800">{ministry.petitions.opposing}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Ratings</span>
                  <span className="font-medium">{ministry.performanceStats.totalRatings}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Average Response Time</span>
                  <span className="font-medium">{ministry.performanceStats.responseTime}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engage" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rate This Ministry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRateMinistry(star)}
                      className="transition-colors"
                    >
                      <Star 
                        className={`h-6 w-6 ${star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                      />
                    </button>
                  ))}
                </div>
                <Button onClick={handleSendFeedback} className="w-full">
                  Submit Rating
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Get Involved</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Send Feedback
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Start a Petition
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Request Meeting
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Follow Updates
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MinistryProfile;