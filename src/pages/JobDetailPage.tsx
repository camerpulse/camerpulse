import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  Building, 
  Users, 
  GraduationCap,
  Bookmark,
  Share2,
  ExternalLink
} from 'lucide-react';
import { useSlugResolver } from '@/hooks/useSlugResolver';

/**
 * Individual job detail page with full job information and application options
 */
const JobDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { entity: job, loading, error } = useSlugResolver({ table: 'jobs' });

  // Mock data for demonstration
  const mockJob = {
    id: '1',
    title: 'Senior Software Engineer',
    company: {
      name: 'TechCorp Cameroon',
      logo: '',
      location: 'Douala, Cameroon',
      size: '50-200 employees',
      type: 'Technology'
    },
    location: 'Douala, Cameroon',
    type: 'Full-time',
    remote: 'Hybrid',
    salary: {
      min: 800000,
      max: 1200000,
      currency: 'FCFA',
      period: 'month'
    },
    postedDate: '2024-01-15',
    deadline: '2024-02-15',
    description: 'We are looking for a Senior Software Engineer to join our growing team in Douala. You will be responsible for developing and maintaining web applications using modern technologies.',
    requirements: [
      '5+ years of experience in software development',
      'Proficiency in React, Node.js, and TypeScript',
      'Experience with cloud platforms (AWS/Azure)',
      'Strong problem-solving skills',
      'Bachelor\'s degree in Computer Science or related field',
      'Fluency in English and French'
    ],
    responsibilities: [
      'Design and develop scalable web applications',
      'Collaborate with cross-functional teams',
      'Code review and mentoring junior developers',
      'Participate in technical architecture decisions',
      'Ensure code quality and best practices'
    ],
    benefits: [
      'Competitive salary and bonuses',
      'Health insurance coverage',
      'Professional development opportunities',
      'Flexible working hours',
      'Remote work options',
      'Annual leave and sick days'
    ],
    skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL', 'Git'],
    applicants: 23,
    views: 156
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-lg font-medium">Job not found</p>
            <p className="text-muted-foreground">The job you're looking for doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = job || mockJob;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Jobs</span>
          <span>/</span>
          <Badge variant="outline">{data.company.type}</Badge>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{data.title}</h1>
            <div className="flex items-center gap-4 text-lg mb-2">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                <span className="font-medium">{data.company.name}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {data.location}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {data.type}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Posted {new Date(data.postedDate).toLocaleDateString()}
              </div>
              <Badge variant="secondary">{data.remote}</Badge>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Bookmark className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{data.description}</p>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">{requirement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle>Responsibilities</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.responsibilities.map((responsibility, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">{responsibility}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Benefits & Perks</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Required Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, index) => (
                  <Badge key={index} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Section */}
          <Card>
            <CardHeader>
              <CardTitle>Apply for this job</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {data.salary.min.toLocaleString()} - {data.salary.max.toLocaleString()} {data.salary.currency}
                </div>
                <div className="text-sm text-muted-foreground">per {data.salary.period}</div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Application deadline:</span>
                  <span className="font-medium">{new Date(data.deadline).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Applicants:</span>
                  <span className="font-medium">{data.applicants}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Views:</span>
                  <span className="font-medium">{data.views}</span>
                </div>
              </div>

              <Button className="w-full" size="lg">
                <ExternalLink className="w-4 h-4 mr-2" />
                Apply Now
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                You will be redirected to the company's application page
              </p>
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle>About {data.company.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Industry:</span>
                  <span className="font-medium">{data.company.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Company size:</span>
                  <span className="font-medium">{data.company.size}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Location:</span>
                  <span className="font-medium">{data.company.location}</span>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                View Company Profile
              </Button>
            </CardContent>
          </Card>

          {/* Similar Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Similar Jobs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="font-medium text-sm">Frontend Developer</p>
                <p className="text-xs text-muted-foreground">DevCorp • Yaoundé</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="font-medium text-sm">Full Stack Engineer</p>
                <p className="text-xs text-muted-foreground">StartupXYZ • Remote</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="font-medium text-sm">Software Architect</p>
                <p className="text-xs text-muted-foreground">BigTech • Douala</p>
              </div>
              <Button variant="link" size="sm" className="w-full">
                View more similar jobs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;