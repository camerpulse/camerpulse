import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { MapPin, User, Phone, Mail, Globe, Users, Star, ArrowLeft, Calendar, DollarSign, Building, TrendingUp } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const CouncilProfile: React.FC = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);

  // Mock council data - would come from API in real implementation
  const council = {
    id: 'council-1',
    name: 'Yaoundé City Council',
    region: 'Centre',
    division: 'Mfoundi',
    subdivision: 'Yaoundé I-VII',
    mayor: {
      name: 'Luc Messi Atangana',
      bio: 'Experienced municipal leader with a background in urban planning and development.',
      photo: '/placeholder-mayor.jpg',
      tenure: '2020-2025'
    },
    executiveMembers: [
      { name: 'Marie Claire Ongolo', position: 'Deputy Mayor', department: 'Urban Planning' },
      { name: 'Jean Paul Owona', position: 'Secretary General', department: 'Administration' },
      { name: 'Grace Mballa', position: 'Treasurer', department: 'Finance' },
      { name: 'Pierre Nkomo', position: 'Councilor', department: 'Infrastructure' }
    ],
    contact: {
      address: 'Avenue Kennedy, Yaoundé',
      phone: '+237 222 23 40 58',
      email: 'info@yaounde-city.cm',
      website: 'www.yaounde-city.cm'
    },
    demographics: {
      population: 3200000,
      area: '923 km²',
      density: '3,468/km²',
      villages: 128,
      wards: 7
    },
    developmentProjects: [
      {
        name: 'Urban Road Rehabilitation Project',
        progress: 68,
        budget: '25B FCFA',
        status: 'ongoing',
        completion: '2024-12-31'
      },
      {
        name: 'Public Market Modernization',
        progress: 45,
        budget: '12B FCFA',
        status: 'ongoing',
        completion: '2025-06-30'
      },
      {
        name: 'Drainage System Improvement',
        progress: 82,
        budget: '8B FCFA',
        status: 'ongoing',
        completion: '2024-08-15'
      }
    ],
    budget: {
      total: '45B FCFA',
      allocated: '38B FCFA',
      spent: '25B FCFA',
      remaining: '13B FCFA'
    },
    performance: {
      citizenRating: 4.1,
      totalRatings: 892,
      projectsCompleted: 15,
      ongoingProjects: 8,
      responseTime: '2.8 days',
      transparency: 78,
      serviceDelivery: 82
    },
    services: [
      'Waste Management',
      'Water Supply',
      'Road Maintenance',
      'Public Markets',
      'Building Permits',
      'Business Licenses',
      'Tax Collection',
      'Public Transport'
    ],
    linkedVillages: [
      'Nlongkak', 'Mvog-Ada', 'Bastos', 'Melen', 'Ngousso',
      'Efoulan', 'Mokolo', 'Madagascar', 'Mvan', 'Emana'
    ],
    auditReports: [
      {
        year: '2023',
        status: 'Published',
        findings: 'Generally compliant with financial regulations',
        score: 85
      },
      {
        year: '2022',
        status: 'Published',
        findings: 'Minor issues in procurement processes',
        score: 78
      }
    ]
  };

  const handleRateCouncil = (newRating: number) => {
    setRating(newRating);
    toast({
      title: "Rating Submitted",
      description: `You rated ${council.name} ${newRating} stars.`,
    });
  };

  const handleSendFeedback = () => {
    toast({
      title: "Feedback Sent",
      description: "Your feedback has been submitted to the council.",
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
            <h1 className="text-3xl font-bold text-foreground mb-2">{council.name}</h1>
            <p className="text-xl text-muted-foreground font-medium mb-2">
              {council.region} Region • {council.division} Division
            </p>
            <p className="text-muted-foreground">
              Municipal government serving {council.demographics.population.toLocaleString()} residents
            </p>
            
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="font-medium">{council.performance.citizenRating}</span>
                <span className="text-sm text-muted-foreground">
                  ({council.performance.totalRatings} ratings)
                </span>
              </div>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                Active Council
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
                    <span>{council.contact.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{council.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{council.contact.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>{council.contact.website}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Demographics */}
              <Card>
                <CardHeader>
                  <CardTitle>Area Demographics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{council.demographics.population.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Population</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{council.demographics.area}</div>
                      <div className="text-sm text-muted-foreground">Area</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{council.demographics.villages}</div>
                      <div className="text-sm text-muted-foreground">Villages</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{council.demographics.wards}</div>
                      <div className="text-sm text-muted-foreground">Wards</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Services */}
              <Card>
                <CardHeader>
                  <CardTitle>Municipal Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {council.services.map((service, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg text-center">
                        <span className="font-medium text-sm">{service}</span>
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
                    <span className="font-medium">{council.performance.projectsCompleted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ongoing Projects</span>
                    <span className="font-medium">{council.performance.ongoingProjects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Response Time</span>
                    <span className="font-medium">{council.performance.responseTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Delivery</span>
                    <span className="font-medium">{council.performance.serviceDelivery}%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Linked Villages */}
              <Card>
                <CardHeader>
                  <CardTitle>Linked Villages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {council.linkedVillages.map((village, index) => (
                      <div key={index} className="text-sm p-2 bg-muted rounded">
                        {village}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="leadership" className="mt-6">
          <div className="space-y-6">
            {/* Mayor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Mayor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                    <User className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl">{council.mayor.name}</h3>
                    <p className="text-muted-foreground">Mayor • {council.mayor.tenure}</p>
                    <p className="text-muted-foreground text-sm mt-2">{council.mayor.bio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Executive Members */}
            <Card>
              <CardHeader>
                <CardTitle>Executive Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {council.executiveMembers.map((member, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-sm text-muted-foreground">{member.position}</p>
                          <p className="text-xs text-muted-foreground">{member.department}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Development Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {council.developmentProjects.map((project, index) => (
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
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Completion</span>
                      <span className="font-medium">{project.completion}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="budget" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Council Budget Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{council.budget.total}</div>
                    <div className="text-sm text-muted-foreground">Total Budget</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{council.budget.allocated}</div>
                    <div className="text-sm text-muted-foreground">Allocated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{council.budget.spent}</div>
                    <div className="text-sm text-muted-foreground">Spent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{council.budget.remaining}</div>
                    <div className="text-sm text-muted-foreground">Remaining</div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Budget Utilization</h4>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Budget Spent</span>
                      <span>66%</span>
                    </div>
                    <Progress value={66} className="h-3" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audit Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Audit Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {council.auditReports.map((audit, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">Audit Report {audit.year}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{audit.findings}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={audit.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {audit.status}
                          </Badge>
                          <div className="text-sm font-medium mt-1">Score: {audit.score}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
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
                    <span>{council.performance.citizenRating}/5.0</span>
                  </div>
                  <Progress value={council.performance.citizenRating * 20} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Service Delivery</span>
                    <span>{council.performance.serviceDelivery}%</span>
                  </div>
                  <Progress value={council.performance.serviceDelivery} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Transparency Score</span>
                    <span>{council.performance.transparency}%</span>
                  </div>
                  <Progress value={council.performance.transparency} className="h-3" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Ratings</span>
                  <span className="font-medium">{council.performance.totalRatings}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Projects Completed</span>
                  <span className="font-medium">{council.performance.projectsCompleted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Ongoing Projects</span>
                  <span className="font-medium">{council.performance.ongoingProjects}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Response Time</span>
                  <span className="font-medium">{council.performance.responseTime}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engage" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rate This Council</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRateCouncil(star)}
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
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Council
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Attend Meeting
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
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

export default CouncilProfile;