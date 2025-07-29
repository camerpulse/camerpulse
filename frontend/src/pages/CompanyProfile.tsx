import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building, MapPin, Phone, Mail, Globe, Users, Star, 
  Briefcase, Calendar, Eye, Share2, ExternalLink 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import CompanyRating from '@/components/companies/CompanyRating';
import CompanyJobs from '@/components/companies/CompanyJobs';
import CompanyUpdates from '@/components/companies/CompanyUpdates';

interface Company {
  id: string;
  company_name: string;
  company_type: string;
  sector: string;
  description: string;
  physical_address: string;
  region: string;
  division: string;
  phone_number: string;
  email: string;
  website_url?: string;
  logo_url?: string;
  cover_photo_url?: string;
  employee_count_range: string;
  estimated_net_worth?: number;
  average_rating: number;
  total_ratings: number;
  profile_views: number;
  is_featured: boolean;
  created_at: string;
}

export default function CompanyProfile() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasRated, setHasRated] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchCompany();
      incrementViews();
      if (user) {
        checkUserRating();
      }
    }
  }, [id, user]);

  const fetchCompany = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .eq('status', 'approved')
        .single();

      if (error) throw error;
      setCompany(data);
    } catch (error) {
      console.error('Error fetching company:', error);
      toast({
        title: "Error",
        description: "Company not found or not approved",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      await supabase
        .from('companies')
        .update({ profile_views: (company?.profile_views || 0) + 1 })
        .eq('id', id);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const checkUserRating = async () => {
    if (!user || !id) return;

    try {
      const { data } = await supabase
        .from('company_ratings')
        .select('id')
        .eq('company_id', id)
        .eq('user_id', user.id)
        .single();

      setHasRated(!!data);
    } catch (error) {
      // User hasn't rated yet
      setHasRated(false);
    }
  };

  const shareCompany = () => {
    const url = window.location.href;
    const text = `Check out ${company?.company_name} on CamerPulse Company Directory`;
    
    if (navigator.share) {
      navigator.share({
        title: company?.company_name,
        text: text,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(`${text} - ${url}`);
      toast({
        title: "Link Copied",
        description: "Company profile link copied to clipboard",
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatCompanyType = (type: string) => {
    switch (type) {
      case 'sole_proprietor':
        return 'Sole Proprietor';
      case 'limited_company':
        return 'Limited Company';
      case 'public_company':
        return 'Public Company';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="animate-pulse">
          <div className="h-64 bg-muted rounded-lg mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-32 bg-muted rounded-lg"></div>
              <div className="h-40 bg-muted rounded-lg"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto p-6 max-w-6xl text-center">
        <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Company Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The company you're looking for doesn't exist or isn't approved yet.
        </p>
        <Link to="/companies">
          <Button>
            Browse Companies
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/5">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Cover Photo */}
        <div className="relative h-64 mb-8 rounded-lg overflow-hidden">
          {company.cover_photo_url ? (
            <img
              src={company.cover_photo_url}
              alt={`${company.company_name} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
              <Building className="w-24 h-24 text-primary/40" />
            </div>
          )}
          
          {company.is_featured && (
            <Badge className="absolute top-4 right-4 bg-gradient-to-r from-primary to-accent text-white text-lg px-4 py-2">
              Featured Company
            </Badge>
          )}
        </div>

        {/* Company Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-shrink-0">
            {company.logo_url ? (
              <img
                src={company.logo_url}
                alt={`${company.company_name} logo`}
                className="w-32 h-32 rounded-lg object-cover border-4 border-background shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-lg bg-primary/10 flex items-center justify-center border-4 border-background shadow-lg">
                <Building className="w-16 h-16 text-primary" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-primary mb-2">
                  {company.company_name}
                </h1>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">{company.sector}</Badge>
                  <Badge variant="outline">{formatCompanyType(company.company_type)}</Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={shareCompany}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                {company.website_url && (
                  <Button asChild>
                    <a href={company.website_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex">{renderStars(company.average_rating)}</div>
                <span className="font-semibold">{company.average_rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({company.total_ratings} reviews)</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Eye className="w-4 h-4" />
                <span>{company.profile_views} views</span>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {company.description}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="jobs">Jobs</TabsTrigger>
                <TabsTrigger value="updates">Updates</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Company Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-muted-foreground" />
                            <span>{formatCompanyType(company.company_type)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{company.employee_count_range} employees</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>Founded {new Date(company.created_at).getFullYear()}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Location & Contact</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{company.division}, {company.region}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{company.phone_number}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span>{company.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Address</h4>
                      <p className="text-sm text-muted-foreground">
                        {company.physical_address}
                      </p>
                    </div>

                    {company.estimated_net_worth && (
                      <div>
                        <h4 className="font-semibold mb-2">Estimated Net Worth</h4>
                        <p className="text-lg font-semibold text-primary">
                          {company.estimated_net_worth.toLocaleString()} FCFA
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="jobs">
                <CompanyJobs companyId={company.id} />
              </TabsContent>

              <TabsContent value="updates">
                <CompanyUpdates companyId={company.id} />
              </TabsContent>

              <TabsContent value="reviews">
                <CompanyRating 
                  companyId={company.id} 
                  hasRated={hasRated}
                  onRatingSubmitted={() => {
                    setHasRated(true);
                    fetchCompany();
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <a href={`tel:${company.phone_number}`}>
                    <Phone className="w-4 h-4 mr-2" />
                    Call Company
                  </a>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <a href={`mailto:${company.email}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </a>
                </Button>
                {company.website_url && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={company.website_url} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Similar Companies */}
            <Card>
              <CardHeader>
                <CardTitle>Similar Companies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Discover other companies in the {company.sector} sector.
                </p>
                <Link to={`/companies?sector=${company.sector}`} className="mt-3 block">
                  <Button variant="outline" size="sm" className="w-full">
                    View Similar Companies
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}