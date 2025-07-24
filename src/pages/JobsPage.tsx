import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Search,
  Filter,
  Building2,
  Users,
  GraduationCap,
  Zap,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  postedDate: string;
  description: string;
  requirements: string[];
  category: string;
  experience: string;
}

const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [loading, setLoading] = useState(true);

  const mockJobs: Job[] = [
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'MTN Cameroon',
      location: 'Douala',
      type: 'Full-time',
      salary: '800,000 - 1,200,000 FCFA',
      postedDate: '2024-01-20',
      description: 'Lead development of mobile applications and backend services.',
      requirements: ['5+ years experience', 'React/Node.js', 'French/English'],
      category: 'Technology',
      experience: 'Senior'
    },
    {
      id: '2',
      title: 'Marketing Manager',
      company: 'Orange Cameroon',
      location: 'Yaoundé',
      type: 'Full-time',
      salary: '600,000 - 900,000 FCFA',
      postedDate: '2024-01-19',
      description: 'Develop and execute marketing strategies for telecom services.',
      requirements: ['3+ years marketing', 'Digital marketing', 'Bilingual'],
      category: 'Marketing',
      experience: 'Mid-level'
    },
    {
      id: '3',
      title: 'Civil Engineer',
      company: 'CRTV',
      location: 'Bamenda',
      type: 'Full-time',
      salary: '450,000 - 650,000 FCFA',
      postedDate: '2024-01-18',
      description: 'Oversee infrastructure development projects.',
      requirements: ['Engineering degree', '2+ years experience', 'AutoCAD'],
      category: 'Engineering',
      experience: 'Mid-level'
    },
    {
      id: '4',
      title: 'Financial Analyst',
      company: 'Ecobank Cameroon',
      location: 'Douala',
      type: 'Full-time',
      salary: '500,000 - 700,000 FCFA',
      postedDate: '2024-01-17',
      description: 'Analyze financial data and provide investment recommendations.',
      requirements: ['Finance degree', 'Excel expertise', 'CFA preferred'],
      category: 'Finance',
      experience: 'Mid-level'
    },
    {
      id: '5',
      title: 'Nurse Practitioner',
      company: 'Hôpital Général de Douala',
      location: 'Douala',
      type: 'Full-time',
      salary: '350,000 - 500,000 FCFA',
      postedDate: '2024-01-16',
      description: 'Provide patient care and support medical procedures.',
      requirements: ['Nursing degree', 'License required', 'French fluency'],
      category: 'Healthcare',
      experience: 'Entry-level'
    },
    {
      id: '6',
      title: 'Teacher - Mathematics',
      company: 'Collège Libermann',
      location: 'Yaoundé',
      type: 'Full-time',
      salary: '250,000 - 400,000 FCFA',
      postedDate: '2024-01-15',
      description: 'Teach mathematics to secondary school students.',
      requirements: ['Education degree', 'Math specialization', 'Teaching certificate'],
      category: 'Education',
      experience: 'Entry-level'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'technology', label: 'Technology' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'finance', label: 'Finance' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' }
  ];

  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'douala', label: 'Douala' },
    { value: 'yaounde', label: 'Yaoundé' },
    { value: 'bamenda', label: 'Bamenda' },
    { value: 'bafoussam', label: 'Bafoussam' },
    { value: 'garoua', label: 'Garoua' }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setJobs(mockJobs);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           job.category.toLowerCase() === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || 
                           job.location.toLowerCase() === selectedLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const getExperienceColor = (experience: string) => {
    switch (experience) {
      case 'Entry-level': return 'bg-green-100 text-green-800';
      case 'Mid-level': return 'bg-blue-100 text-blue-800';
      case 'Senior': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = [
    { label: 'Active Jobs', value: '8,200+', icon: Briefcase },
    { label: 'Companies', value: '1,500+', icon: Building2 },
    { label: 'Job Seekers', value: '45K+', icon: Users },
    { label: 'Success Rate', value: '85%', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Your Dream Job in Cameroon
          </h1>
          <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
            Discover professional opportunities across all sectors. From startups to multinational corporations, 
            find your perfect career match in Cameroon.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Job title or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white text-gray-900"
              />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="bg-white text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(location => (
                    <SelectItem key={location.value} value={location.value}>
                      {location.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Search className="w-4 h-4 mr-2" />
                Search Jobs
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Job Opportunities</h2>
            <p className="text-muted-foreground">
              {loading ? 'Loading...' : `${filteredJobs.length} jobs found`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Link to="/jobs/post">
              <Button size="sm">
                Post a Job
              </Button>
            </Link>
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-1/3 mb-4" />
                    <div className="h-6 bg-muted rounded w-2/3 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                      <CardDescription className="text-base text-foreground font-medium">
                        {job.company}
                      </CardDescription>
                    </div>
                    <Badge className={getExperienceColor(job.experience)}>
                      {job.experience}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{job.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="text-sm">{job.salary}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm">{job.type}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {job.requirements.slice(0, 3).map((req, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <span className="text-xs text-muted-foreground">
                      Posted {new Date(job.postedDate).toLocaleDateString()}
                    </span>
                    <Link to={`/jobs/${job.id}`}>
                      <Button>
                        Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Load More */}
        {!loading && filteredJobs.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Jobs
            </Button>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredJobs.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or browse all available positions.
              </p>
              <Button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedLocation('all');
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default JobsPage;