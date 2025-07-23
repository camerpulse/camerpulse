import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import {
  Search,
  TrendingUp,
  Clock,
  DollarSign,
  FileText,
  Building,
  MapPin,
  Calendar,
  ArrowRight,
  Filter,
  Star,
  Users,
  Award,
  BarChart3,
  Globe,
  Zap,
  Shield
} from 'lucide-react';

const TenderHomePage: React.FC = () => {
  // Mock data for demo
  const featuredTenders = [
    {
      id: '1',
      title: 'Construction of New Hospital Wing',
      department: 'Ministry of Health',
      budget: '2,500,000,000',
      deadline: '2024-02-15',
      location: 'Yaoundé',
      status: 'open',
      bidCount: 12,
      category: 'Construction'
    },
    {
      id: '2',
      title: 'IT Infrastructure Modernization',
      department: 'Ministry of Digital Economy',
      budget: '850,000,000',
      deadline: '2024-01-28',
      location: 'Douala',
      status: 'closing_soon',
      bidCount: 8,
      category: 'Technology'
    },
    {
      id: '3',
      title: 'Road Maintenance Services',
      department: 'Ministry of Public Works',
      budget: '1,200,000,000',
      deadline: '2024-03-01',
      location: 'Multiple Regions',
      status: 'open',
      bidCount: 15,
      category: 'Infrastructure'
    }
  ];

  const stats = [
    { label: 'Active Tenders', value: '2,547', icon: FileText, trend: '+12%' },
    { label: 'Total Value', value: '125B FCFA', icon: DollarSign, trend: '+8%' },
    { label: 'Participating Companies', value: '15,240', icon: Building, trend: '+15%' },
    { label: 'Success Rate', value: '89%', icon: Award, trend: '+3%' }
  ];

  const categories = [
    { name: 'Construction & Infrastructure', count: 524, color: 'bg-blue-500' },
    { name: 'IT & Technology', count: 287, color: 'bg-purple-500' },
    { name: 'Healthcare & Medical', count: 195, color: 'bg-green-500' },
    { name: 'Education & Training', count: 156, color: 'bg-yellow-500' },
    { name: 'Transportation', count: 134, color: 'bg-red-500' },
    { name: 'Energy & Utilities', count: 98, color: 'bg-orange-500' }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-primary/5 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="space-y-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <Globe className="h-3 w-3 mr-1" />
                Government Procurement Platform
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                Cameroon's Premier
                <span className="text-primary block">Tender Platform</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Connect with government opportunities, streamline your bidding process, 
                and grow your business with transparent procurement.
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-2 p-2 bg-background border rounded-lg shadow-lg">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search tenders, departments, or keywords..." 
                    className="pl-10 border-0 bg-transparent focus-visible:ring-0"
                  />
                </div>
                <Button size="lg" asChild>
                  <Link to="/search">
                    Search Tenders
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" asChild>
                <Link to="/tenders/create">
                  <FileText className="h-4 w-4 mr-2" />
                  Post Tender
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Market Analytics
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/verification">
                  <Award className="h-4 w-4 mr-2" />
                  Get Verified
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 space-y-12">
        {/* Stats Overview */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <div className="flex items-center text-xs text-green-600">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stat.trend}
                      </div>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured Tenders */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Featured Tenders</h2>
              <p className="text-muted-foreground">High-value opportunities closing soon</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/tenders">
                View All <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {featuredTenders.map((tender) => (
              <Card key={tender.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge 
                      variant={tender.status === 'closing_soon' ? 'destructive' : 'secondary'}
                      className="mb-2"
                    >
                      {tender.status === 'closing_soon' ? (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          Closing Soon
                        </>
                      ) : (
                        <>
                          <Zap className="h-3 w-3 mr-1" />
                          Open
                        </>
                      )}
                    </Badge>
                    <Badge variant="outline">{tender.category}</Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">{tender.title}</CardTitle>
                  <CardDescription>
                    <Building className="h-4 w-4 inline mr-1" />
                    {tender.department}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>{parseInt(tender.budget).toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{tender.bidCount} bids</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{tender.location}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(tender.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button className="w-full" asChild>
                    <Link to={`/tenders/${tender.id}`}>
                      View Details
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Categories & Quick Access */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Browse by Category</h2>
          
          <Tabs defaultValue="categories" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="regions">Regions</TabsTrigger>
              <TabsTrigger value="departments">Departments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="categories" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className={`w-4 h-12 rounded ${category.color}`}></div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">{category.count} active tenders</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="regions" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {['Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 'North', 'Northwest', 'South', 'Southwest', 'West'].map((region) => (
                  <Card key={region} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <MapPin className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <h3 className="font-medium">{region}</h3>
                      <p className="text-xs text-muted-foreground">
                        {Math.floor(Math.random() * 200) + 50} tenders
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="departments" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Ministry of Public Works',
                  'Ministry of Health',
                  'Ministry of Education',
                  'Ministry of Digital Economy',
                  'Ministry of Transport',
                  'Ministry of Energy and Water'
                ].map((department) => (
                  <Card key={department} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{department}</h3>
                          <p className="text-sm text-muted-foreground">
                            {Math.floor(Math.random() * 100) + 20} active tenders
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8 lg:p-12 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-bold">Ready to Grow Your Business?</h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of successful businesses competing for government contracts in Cameroon.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/auth">
                  <Users className="h-4 w-4 mr-2" />
                  Create Account
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/verification">
                  <Shield className="h-4 w-4 mr-2" />
                  Get Verified
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TenderHomePage;