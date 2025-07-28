import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CamerLogisticsLayout } from '@/components/Layout/CamerLogisticsLayout';
import { MobileCard, MobileCardContent, MobileCardHeader, MobileCardTitle } from '@/components/ui/mobile-card';
import { MobileButton } from '@/components/ui/mobile-form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Users,
  Award,
  Shield,
  Truck,
  Package,
  Clock,
  Target,
  ArrowRight,
  Share2,
  MessageCircle,
  CheckCircle,
  TrendingUp,
  Route,
  Warehouse,
  PackageCheck,
  Timer,
  ShieldCheck,
  FileText,
  Eye,
  Heart,
  ExternalLink
} from 'lucide-react';

interface CompanyData {
  id: string;
  name: string;
  code: string;
  rating: number;
  totalReviews: number;
  description: string;
  regions: string[];
  services: string[];
  vehicleTypes: string[];
  contactEmail: string;
  contactPhone: string;
  website?: string;
  yearsInBusiness: number;
  logoUrl?: string;
  isVerified: boolean;
  partnershipStatus: 'preferred' | 'partner' | 'registered';
  headquarters: string;
  employeeCount: string;
  established: string;
  operatingHours: string;
  specializations: string[];
  certifications: string[];
  profileViews: number;
  completedDeliveries: number;
  onTimeRate: number;
  customerSatisfaction: number;
  responseTime: string;
  gallery: string[];
}

export const CompanyProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  // Mock data - in real app, this would come from the database
  const mockCompanyData: CompanyData = {
    id: '1',
    name: 'Express Cameroon Logistics',
    code: 'DC-001234',
    rating: 4.8,
    totalReviews: 234,
    description: 'Leading logistics provider in Cameroon with over 8 years of reliable service. We specialize in express delivery, bulk shipping, and nationwide coverage across all 10 regions. Our modern fleet and experienced team ensure your packages reach their destination safely and on time.',
    regions: ['Douala', 'Yaoundé', 'Bafoussam', 'Bamenda', 'Garoua', 'Maroua', 'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Kribi'],
    services: ['Same-day delivery', 'Express shipping', 'Bulk transport', 'International shipping', 'Warehousing', 'Last-mile delivery'],
    vehicleTypes: ['Motorcycles', 'Vans', 'Trucks', 'Refrigerated vehicles', 'Cargo planes'],
    contactEmail: 'info@expresscameroon.cm',
    contactPhone: '+237 677 123 456',
    website: 'https://expresscameroon.cm',
    yearsInBusiness: 8,
    logoUrl: null,
    isVerified: true,
    partnershipStatus: 'preferred',
    headquarters: 'Douala, Littoral Region',
    employeeCount: '150+',
    established: '2016',
    operatingHours: '24/7',
    specializations: ['Express Delivery', 'E-commerce Logistics', 'B2B Solutions', 'Cold Chain'],
    certifications: ['ISO 9001:2015', 'IATA Certified', 'Customs Bonded'],
    profileViews: 2847,
    completedDeliveries: 125000,
    onTimeRate: 98.5,
    customerSatisfaction: 4.8,
    responseTime: '< 2 hours',
    gallery: []
  };

  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCompanyData(mockCompanyData);
      } catch (error) {
        console.error('Error fetching company data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCompanyData();
    }
  }, [id]);

  const setCompanyData = (data: CompanyData) => {
    setCompany(data);
    // Increment profile views
    setCompany(prev => prev ? { ...prev, profileViews: prev.profileViews + 1 } : null);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: company?.name,
        text: `Check out ${company?.name} - Professional logistics services in Cameroon`,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Company profile link copied to clipboard",
      });
    }
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? "Removed from favorites" : "Added to favorites",
      description: isFavorited ? "Company removed from your favorites" : "Company added to your favorites",
    });
  };

  const getPartnershipBadge = (status: string) => {
    switch (status) {
      case 'preferred':
        return <Badge className="bg-secondary text-secondary-foreground"><Award className="h-4 w-4 mr-2" />Preferred Partner</Badge>;
      case 'partner':
        return <Badge className="bg-primary/10 text-primary border-primary/20"><Users className="h-4 w-4 mr-2" />Certified Partner</Badge>;
      default:
        return <Badge variant="outline">Registered Company</Badge>;
    }
  };

  if (loading) {
    return (
      <CamerLogisticsLayout>
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
              <div className="h-40 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </CamerLogisticsLayout>
    );
  }

  if (!company) {
    return (
      <CamerLogisticsLayout>
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Company Not Found</h2>
            <p className="text-muted-foreground mb-6">The company profile you're looking for doesn't exist.</p>
            <Link to="/logistics/companies">
              <Button>
                <ArrowRight className="h-4 w-4 mr-2" />
                Browse All Companies
              </Button>
            </Link>
          </div>
        </div>
      </CamerLogisticsLayout>
    );
  }

  return (
    <CamerLogisticsLayout>
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              {/* Company Info */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-secondary" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold">{company.name}</h1>
                    <p className="text-primary-foreground/80 text-lg">Company ID: {company.code}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-6">
                  {getPartnershipBadge(company.partnershipStatus)}
                  {company.isVerified && (
                    <Badge className="bg-primary-glow/20 text-white border-primary-glow/30">
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Verified
                    </Badge>
                  )}
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-secondary text-secondary" />
                    <span className="font-semibold text-lg">{company.rating}</span>
                    <span className="text-primary-foreground/80">({company.totalReviews} reviews)</span>
                  </div>
                </div>

                <p className="text-lg text-primary-foreground/90 mb-6 leading-relaxed">
                  {company.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  {isMobile ? (
                    <>
                      <MobileButton className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Request Quote
                      </MobileButton>
                      <MobileButton variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                        <Phone className="h-5 w-5 mr-2" />
                        Contact Now
                      </MobileButton>
                    </>
                  ) : (
                    <>
                      <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Request Quote
                      </Button>
                      <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary px-8">
                        <Phone className="h-5 w-5 mr-2" />
                        Contact Now
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="w-full lg:w-80">
                <MobileCard className="bg-white/10 backdrop-blur-md border-white/20">
                  <MobileCardContent className="p-6">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-secondary">{company.completedDeliveries.toLocaleString()}+</div>
                        <div className="text-sm text-primary-foreground/80">Deliveries</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-secondary">{company.onTimeRate}%</div>
                        <div className="text-sm text-primary-foreground/80">On-Time Rate</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-secondary">{company.yearsInBusiness}</div>
                        <div className="text-sm text-primary-foreground/80">Years Active</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-secondary">{company.regions.length}</div>
                        <div className="text-sm text-primary-foreground/80">Regions</div>
                      </div>
                    </div>
                  </MobileCardContent>
                </MobileCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Content */}
              <div className="flex-1 space-y-8">
                {/* Services & Coverage */}
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Services */}
                  <MobileCard>
                    <MobileCardHeader>
                      <MobileCardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        Services Offered
                      </MobileCardTitle>
                    </MobileCardHeader>
                    <MobileCardContent>
                      <div className="space-y-2">
                        {company.services.map((service, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-sm">{service}</span>
                          </div>
                        ))}
                      </div>
                    </MobileCardContent>
                  </MobileCard>

                  {/* Coverage Areas */}
                  <MobileCard>
                    <MobileCardHeader>
                      <MobileCardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-secondary" />
                        Coverage Areas
                      </MobileCardTitle>
                    </MobileCardHeader>
                    <MobileCardContent>
                      <div className="flex flex-wrap gap-2">
                        {company.regions.map((region, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {region}
                          </Badge>
                        ))}
                      </div>
                    </MobileCardContent>
                  </MobileCard>
                </div>

                {/* Fleet & Capabilities */}
                <MobileCard>
                  <MobileCardHeader>
                    <MobileCardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-primary" />
                      Fleet & Transportation
                    </MobileCardTitle>
                  </MobileCardHeader>
                  <MobileCardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {company.vehicleTypes.map((vehicle, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <Warehouse className="h-5 w-5 text-secondary" />
                          <span className="font-medium">{vehicle}</span>
                        </div>
                      ))}
                    </div>
                  </MobileCardContent>
                </MobileCard>

                {/* Specializations */}
                <MobileCard>
                  <MobileCardHeader>
                    <MobileCardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-accent" />
                      Specializations
                    </MobileCardTitle>
                  </MobileCardHeader>
                  <MobileCardContent>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {company.specializations.map((spec, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="h-2 w-2 bg-accent rounded-full"></div>
                          <span>{spec}</span>
                        </div>
                      ))}
                    </div>
                  </MobileCardContent>
                </MobileCard>

                {/* Performance Metrics */}
                <MobileCard>
                  <MobileCardHeader>
                    <MobileCardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Performance Metrics
                    </MobileCardTitle>
                  </MobileCardHeader>
                  <MobileCardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">On-Time Delivery Rate</span>
                        <span className="text-sm font-semibold">{company.onTimeRate}%</span>
                      </div>
                      <Progress value={company.onTimeRate} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Customer Satisfaction</span>
                        <span className="text-sm font-semibold">{company.customerSatisfaction}/5.0</span>
                      </div>
                      <Progress value={(company.customerSatisfaction / 5) * 100} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center p-3 bg-primary/5 rounded-lg">
                        <Timer className="h-6 w-6 text-primary mx-auto mb-2" />
                        <div className="font-semibold">{company.responseTime}</div>
                        <div className="text-xs text-muted-foreground">Response Time</div>
                      </div>
                      <div className="text-center p-3 bg-secondary/5 rounded-lg">
                        <PackageCheck className="h-6 w-6 text-secondary mx-auto mb-2" />
                        <div className="font-semibold">{company.completedDeliveries.toLocaleString()}+</div>
                        <div className="text-xs text-muted-foreground">Completed Orders</div>
                      </div>
                    </div>
                  </MobileCardContent>
                </MobileCard>
              </div>

              {/* Sidebar */}
              <div className="w-full lg:w-80 space-y-6">
                {/* Contact Information */}
                <MobileCard>
                  <MobileCardHeader>
                    <MobileCardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-primary" />
                      Contact Information
                    </MobileCardTitle>
                  </MobileCardHeader>
                  <MobileCardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{company.contactPhone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{company.contactEmail}</span>
                      </div>
                      {company.website && (
                        <div className="flex items-center gap-3">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <a href={company.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline flex items-center gap-1">
                            Visit Website
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{company.headquarters}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      {isMobile ? (
                        <>
                          <MobileButton onClick={handleShare} variant="outline" className="w-full">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share Profile
                          </MobileButton>
                          <MobileButton onClick={handleFavorite} variant="outline" className="w-full">
                            <Heart className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
                            {isFavorited ? 'Favorited' : 'Add to Favorites'}
                          </MobileButton>
                        </>
                      ) : (
                        <>
                          <Button onClick={handleShare} variant="outline" className="w-full">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share Profile
                          </Button>
                          <Button onClick={handleFavorite} variant="outline" className="w-full">
                            <Heart className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
                            {isFavorited ? 'Favorited' : 'Add to Favorites'}
                          </Button>
                        </>
                      )}
                    </div>
                  </MobileCardContent>
                </MobileCard>

                {/* Company Details */}
                <MobileCard>
                  <MobileCardHeader>
                    <MobileCardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-secondary" />
                      Company Details
                    </MobileCardTitle>
                  </MobileCardHeader>
                  <MobileCardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Established</span>
                      <span className="font-medium">{company.established}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Team Size</span>
                      <span className="font-medium">{company.employeeCount} employees</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Operating Hours</span>
                      <span className="font-medium">{company.operatingHours}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profile Views</span>
                      <span className="font-medium flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {company.profileViews.toLocaleString()}
                      </span>
                    </div>
                  </MobileCardContent>
                </MobileCard>

                {/* Certifications */}
                <MobileCard>
                  <MobileCardHeader>
                    <MobileCardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-accent" />
                      Certifications
                    </MobileCardTitle>
                  </MobileCardHeader>
                  <MobileCardContent>
                    <div className="space-y-2">
                      {company.certifications.map((cert, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-accent" />
                          <span className="text-sm font-medium">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </MobileCardContent>
                </MobileCard>
              </div>
            </div>
          </div>
        </div>
      </section>
    </CamerLogisticsLayout>
  );
};