import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Globe, Users, Star, Building, Briefcase, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Company {
  id: string;
  name: string;
  region: string;
  division: string;
  village_or_city: string;
  industry: string;
  company_type: 'startup' | 'sme' | 'large' | 'multinational' | 'ngo';
  ownership: 'private' | 'public' | 'mixed';
  founded_year?: number;
  employee_count?: number;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  description?: string;
  services_offered?: string[];
  certifications?: string[];
  is_hiring: boolean;
  is_verified: boolean;
  overall_rating: number;
  total_ratings: number;
  ceo_name?: string;
  created_at: string;
}

interface JobOpening {
  id: string;
  company_name: string;
  position: string;
  type: string;
  posted_date: string;
  applications_count: number;
}

export default function CompaniesDirectory() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [featuredCompanies, setFeaturedCompanies] = useState<Company[]>([]);
  const [topRatedCompanies, setTopRatedCompanies] = useState<Company[]>([]);
  const [hiringCompanies, setHiringCompanies] = useState<Company[]>([]);
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const { toast } = useToast();

  const regions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const industries = [
    'Technology', 'Healthcare', 'Education', 'Finance', 'Agriculture',
    'Manufacturing', 'Tourism', 'Energy', 'Construction', 'Telecommunications',
    'Transportation', 'Media', 'Fashion', 'Food & Beverage', 'Real Estate'
  ];

  const companyTypes = [
    { value: 'startup', label: 'Startup' },
    { value: 'sme', label: 'Small & Medium Enterprise' },
    { value: 'large', label: 'Large Corporation' },
    { value: 'multinational', label: 'Multinational' },
    { value: 'ngo', label: 'NGO/Non-Profit' }
  ];

  useEffect(() => {
    fetchCompanies();
    loadSampleData();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('overall_rating', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setCompanies(data);
        setFeaturedCompanies(data.slice(0, 6));
        setTopRatedCompanies(data.filter(c => c.overall_rating >= 4.0).slice(0, 8));
        setHiringCompanies(data.filter(c => c.is_hiring).slice(0, 8));
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Error",
        description: "Failed to load companies data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = () => {
    // Sample job openings for demonstration
    setJobOpenings([
      {
        id: '1',
        company_name: 'CamerTech Solutions',
        position: 'Full Stack Developer',
        type: 'Full Time',
        posted_date: '2024-01-15',
        applications_count: 23
      },
      {
        id: '2',
        company_name: 'Douala Health Services',
        position: 'Registered Nurse',
        type: 'Full Time',
        posted_date: '2024-01-14',
        applications_count: 45
      },
      {
        id: '3',
        company_name: 'Agribusiness Cameroon',
        position: 'Agricultural Engineer',
        type: 'Contract',
        posted_date: '2024-01-13',
        applications_count: 18
      },
      {
        id: '4',
        company_name: 'EduTech Africa',
        position: 'Learning Specialist',
        type: 'Part Time',
        posted_date: '2024-01-12',
        applications_count: 31
      }
    ]);
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = searchQuery === '' || 
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.village_or_city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRegion = selectedRegion === '' || company.region === selectedRegion;
    const matchesIndustry = selectedIndustry === '' || company.industry === selectedIndustry;
    const matchesType = selectedType === '' || company.company_type === selectedType;
    
    return matchesSearch && matchesRegion && matchesIndustry && matchesType;
  });

  const renderCompanyCard = (company: Company) => (
    <Card key={company.id} className="group hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {company.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-4 w-4" />
              {company.village_or_city}, {company.region}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{company.overall_rating.toFixed(1)}</span>
            </div>
            <p className="text-sm text-muted-foreground">({company.total_ratings} reviews)</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="capitalize">
            {company.industry}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {company.company_type.replace('_', ' ')}
          </Badge>
          {company.is_hiring && (
            <Badge variant="default">Hiring Now</Badge>
          )}
          {company.is_verified && (
            <Badge variant="outline">
              <Award className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>

        {company.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {company.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            {company.employee_count && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{company.employee_count}+ employees</span>
              </div>
            )}
            {company.founded_year && (
              <div className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                <span>Since {company.founded_year}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {company.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span>{company.phone}</span>
              </div>
            )}
            {company.website && (
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <span>Website</span>
              </div>
            )}
          </div>
          <Button size="sm" variant="outline">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Companies Directory
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover businesses, find job opportunities, and connect with companies across Cameroon
            </p>
            
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search companies or services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Regions</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Industries</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Company type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {companyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="directory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="directory">All Companies</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="hiring">Hiring Now</TabsTrigger>
            <TabsTrigger value="jobs">Latest Jobs</TabsTrigger>
          </TabsList>

          <TabsContent value="directory" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">All Companies ({filteredCompanies.length})</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building className="h-4 w-4" />
                <span>Verified companies included</span>
              </div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCompanies.map(renderCompanyCard)}
            </div>
          </TabsContent>

          <TabsContent value="featured" className="space-y-8">
            {/* Top Rated Companies */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Star className="h-6 w-6 text-yellow-500" />
                <h2 className="text-2xl font-bold">Top Rated Companies</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {topRatedCompanies.map(renderCompanyCard)}
              </div>
            </section>

            {/* Featured Companies */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Award className="h-6 w-6 text-blue-500" />
                <h2 className="text-2xl font-bold">Featured Companies</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featuredCompanies.map(renderCompanyCard)}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="hiring" className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Briefcase className="h-6 w-6 text-green-500" />
              <h2 className="text-2xl font-bold">Companies Hiring Now</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {hiringCompanies.map(renderCompanyCard)}
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <h2 className="text-2xl font-bold">Latest Job Openings</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {jobOpenings.map((job) => (
                <Card key={job.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{job.position}</CardTitle>
                        <CardDescription className="mt-1">{job.company_name}</CardDescription>
                      </div>
                      <Badge variant="outline">{job.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>{job.applications_count} applications</span>
                        </div>
                        <span>Posted {job.posted_date}</span>
                      </div>
                      <Button size="sm">
                        Apply Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}