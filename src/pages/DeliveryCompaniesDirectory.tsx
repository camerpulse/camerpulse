import React, { useState } from 'react';
import { CamerLogisticsLayout } from '@/components/Layout/CamerLogisticsLayout';
import { MobileCard, MobileCardContent, MobileCardHeader, MobileCardTitle } from '@/components/ui/mobile-card';
import { MobileButton, MobileInput } from '@/components/ui/mobile-form';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from "react-router-dom";
import { 
  Search, 
  Star, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Truck,
  Filter,
  Building2,
  Award,
  Users,
  ChevronRight,
  Target,
  Shield,
  Calendar,
  Globe,
  SlidersHorizontal,
  X
} from "lucide-react";

const DeliveryCompaniesDirectory = () => {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [ratingFilter, setRatingFilter] = useState([0]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [preferredOnly, setPreferredOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - in real app, this would come from the database
  const deliveryCompanies = [
    {
      id: '1',
      name: 'Express Cameroon Logistics',
      code: 'DC-001234',
      rating: 4.8,
      totalReviews: 234,
      regions: ['Douala', 'Yaoundé', 'Bafoussam', 'Bamenda'],
      services: ['Same-day delivery', 'Express shipping', 'Bulk transport'],
      vehicleTypes: ['Motorcycles', 'Vans', 'Trucks'],
      contactEmail: 'info@expresscameroon.cm',
      contactPhone: '+237 677 123 456',
      yearsInBusiness: 8,
      logoUrl: null,
      isVerified: true,
      partnershipStatus: 'preferred'
    },
    {
      id: '2',
      name: 'Savane Transport',
      code: 'DC-001235',
      rating: 4.6,
      totalReviews: 187,
      regions: ['North', 'Adamawa', 'Far North', 'Garoua'],
      services: ['Regional coverage', 'Bulk shipping', 'Agricultural products'],
      vehicleTypes: ['Trucks', 'Trailers'],
      contactEmail: 'contact@savanetransport.cm',
      contactPhone: '+237 694 987 654',
      yearsInBusiness: 12,
      logoUrl: null,
      isVerified: true,
      partnershipStatus: 'partner'
    },
    {
      id: '3',
      name: 'Coastal Delivery Services',
      code: 'DC-001236',
      rating: 4.9,
      totalReviews: 156,
      regions: ['Littoral', 'Southwest', 'South'],
      services: ['Coastal routes', 'Fresh products', 'Express delivery'],
      vehicleTypes: ['Motorcycles', 'Refrigerated vans'],
      contactEmail: 'hello@coastaldelivery.cm',
      contactPhone: '+237 655 111 222',
      yearsInBusiness: 5,
      logoUrl: null,
      isVerified: true,
      partnershipStatus: 'partner'
    },
    {
      id: '4',
      name: 'Rapid City Couriers',
      code: 'DC-001237',
      rating: 4.3,
      totalReviews: 89,
      regions: ['Yaoundé', 'Douala'],
      services: ['Same-day delivery', 'Document delivery', 'City coverage'],
      vehicleTypes: ['Motorcycles', 'Bicycles'],
      contactEmail: 'support@rapidcity.cm',
      contactPhone: '+237 678 333 444',
      yearsInBusiness: 3,
      logoUrl: null,
      isVerified: false,
      partnershipStatus: 'registered'
    },
  ];

  const regions = [
    'All Regions', 'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const serviceTypes = [
    'All Services', 'Same-day delivery', 'Express shipping', 'Bulk transport',
    'Regional coverage', 'Fresh products', 'Document delivery'
  ];

  const filteredCompanies = deliveryCompanies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRegion = !selectedRegion || selectedRegion === 'All Regions' || 
                         company.regions.some(region => region.includes(selectedRegion));
    const matchesService = !selectedService || selectedService === 'All Services' || 
                          company.services.includes(selectedService);
    const matchesRating = company.rating >= ratingFilter[0];
    const matchesVerified = !verifiedOnly || company.isVerified;
    const matchesPreferred = !preferredOnly || company.partnershipStatus === 'preferred';
    
    return matchesSearch && matchesRegion && matchesService && matchesRating && matchesVerified && matchesPreferred;
  });

  const getPartnershipBadge = (status: string) => {
    switch (status) {
      case 'preferred':
        return <Badge className="bg-secondary text-secondary-foreground"><Award className="h-3 w-3 mr-1" />Preferred</Badge>;
      case 'partner':
        return <Badge className="bg-primary/10 text-primary border-primary/20"><Users className="h-3 w-3 mr-1" />Partner</Badge>;
      default:
        return <Badge variant="outline">Registered</Badge>;
    }
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Search Companies</Label>
        {isMobile ? (
          <MobileInput
            placeholder="Search companies or services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies or services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
      </div>

      <Separator />

      {/* Region Filter */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Region</Label>
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger>
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Service Type Filter */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Service Type</Label>
        <Select value={selectedService} onValueChange={setSelectedService}>
          <SelectTrigger>
            <SelectValue placeholder="All Services" />
          </SelectTrigger>
          <SelectContent>
            {serviceTypes.map((service) => (
              <SelectItem key={service} value={service}>
                {service}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Rating Filter */}
      <div>
        <Label className="text-sm font-medium mb-3 block">
          Minimum Rating: {ratingFilter[0].toFixed(1)}★
        </Label>
        <Slider
          value={ratingFilter}
          onValueChange={setRatingFilter}
          min={0}
          max={5}
          step={0.1}
          className="w-full"
        />
      </div>

      <Separator />

      {/* Verification Status */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Verification Status</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="verified"
            checked={verifiedOnly}
            onCheckedChange={(checked) => setVerifiedOnly(!!checked)}
          />
          <Label htmlFor="verified" className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Verified Only
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="preferred"
            checked={preferredOnly}
            onCheckedChange={(checked) => setPreferredOnly(!!checked)}
          />
          <Label htmlFor="preferred" className="text-sm flex items-center gap-2">
            <Award className="h-4 w-4 text-secondary" />
            Preferred Partners Only
          </Label>
        </div>
      </div>

      <Separator />

      {/* Clear Filters */}
      <Button 
        variant="outline" 
        onClick={() => {
          setSearchTerm('');
          setSelectedRegion('');
          setSelectedService('');
          setRatingFilter([0]);
          setVerifiedOnly(false);
          setPreferredOnly(false);
        }}
        className="w-full"
      >
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <CamerLogisticsLayout>
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary-glow/20 text-white border-primary-glow/30">
              <Building2 className="h-4 w-4 mr-2" />
              Verified Delivery Partners
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Find Trusted
              <span className="block text-secondary">Delivery Companies</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-primary-foreground/90 max-w-3xl mx-auto">
              Connect with verified logistics partners across all regions of Cameroon for reliable package delivery services.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4">
          {/* Mobile Filter Toggle */}
          {isMobile && (
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                {showFilters && <X className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar - Filters */}
            <div className={`lg:w-80 flex-shrink-0 ${isMobile ? (showFilters ? 'block' : 'hidden') : 'block'}`}>
              <MobileCard className="sticky top-6">
                <MobileCardHeader>
                  <MobileCardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filter Companies
                  </MobileCardTitle>
                </MobileCardHeader>
                <MobileCardContent>
                  <FilterSidebar />
                </MobileCardContent>
              </MobileCard>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold">
                    {filteredCompanies.length} Companies Found
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Verified delivery partners ready to serve you
                  </p>
                </div>
                
                {isMobile ? (
                  <Link to="/logistics/join-company">
                    <MobileButton className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                      <Building2 className="h-4 w-4 mr-2" />
                      Register Company
                    </MobileButton>
                  </Link>
                ) : (
                  <Button asChild className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    <Link to="/logistics/join-company">
                      <Building2 className="h-4 w-4 mr-2" />
                      Register Your Company
                    </Link>
                  </Button>
                )}
              </div>

              {/* Companies Grid - 4 columns desktop, 2 mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCompanies.map((company) => (
                  <MobileCard key={company.id} className="hover:shadow-elegant transition-all duration-300 group">
                    <MobileCardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <MobileCardTitle className="text-lg leading-tight mb-2 group-hover:text-primary transition-colors">
                            {company.name}
                          </MobileCardTitle>
                          <div className="flex items-center gap-2 mb-2">
                            {company.isVerified && (
                              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>#{company.code}</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{company.yearsInBusiness}y</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-secondary text-secondary" />
                            <span className="font-medium text-sm ml-1">{company.rating}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            ({company.totalReviews})
                          </span>
                        </div>
                      </div>
                    </MobileCardHeader>
                    
                    <MobileCardContent className="space-y-4">
                      {/* Partnership Badge */}
                      <div className="flex justify-center">
                        {getPartnershipBadge(company.partnershipStatus)}
                      </div>

                      {/* Service Areas */}
                      <div>
                        <div className="flex items-center text-xs font-medium mb-2 text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          Coverage
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {company.regions.slice(0, 2).map((region, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {region}
                            </Badge>
                          ))}
                          {company.regions.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{company.regions.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Services */}
                      <div>
                        <div className="flex items-center text-xs font-medium mb-2 text-muted-foreground">
                          <Truck className="h-3 w-3 mr-1" />
                          Services
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {company.services.slice(0, 1).map((service, idx) => (
                            <Badge key={idx} className="bg-secondary/10 text-secondary border-secondary/20 text-xs">
                              {service}
                            </Badge>
                          ))}
                          {company.services.length > 1 && (
                            <Badge className="bg-secondary/10 text-secondary border-secondary/20 text-xs">
                              +{company.services.length - 1}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Contact Preview */}
                      <div className="text-xs text-muted-foreground">
                        <div className="flex items-center mb-1">
                          <Phone className="h-3 w-3 mr-1" />
                          <span className="truncate">{company.contactPhone}</span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="space-y-2 pt-2">
                        {isMobile ? (
                          <>
                            <Link to={`/logistics/company/${company.id}`}>
                              <MobileButton variant="outline" className="w-full text-xs">
                                View Profile
                                <ChevronRight className="h-3 w-3 ml-1" />
                              </MobileButton>
                            </Link>
                            <MobileButton className="w-full bg-primary hover:bg-primary/90 text-xs">
                              Request Quote
                            </MobileButton>
                          </>
                        ) : (
                          <>
                            <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                              <Link to={`/logistics/company/${company.id}`}>
                                View Profile
                                <ChevronRight className="h-3 w-3 ml-1" />
                              </Link>
                            </Button>
                            <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-xs">
                              Request Quote
                            </Button>
                          </>
                        )}
                      </div>
                    </MobileCardContent>
                  </MobileCard>
                ))}
              </div>
              
              {/* No Results */}
              {filteredCompanies.length === 0 && (
                <div className="text-center py-16">
                  <div className="h-20 w-20 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Building2 className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No companies found</h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Try adjusting your search criteria or register a new delivery company to expand our network.
                  </p>
                  {isMobile ? (
                    <Link to="/logistics/join-company">
                      <MobileButton className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                        <Building2 className="h-4 w-4 mr-2" />
                        Register Your Company
                      </MobileButton>
                    </Link>
                  ) : (
                    <Button asChild className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                      <Link to="/logistics/join-company">
                        <Building2 className="h-4 w-4 mr-2" />
                        Register Your Company
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Don't See Your Company Listed?
            </h2>
            <p className="text-lg mb-8">
              Join our growing network of delivery partners and connect with customers across Cameroon.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isMobile ? (
                <>
                  <Link to="/logistics/join-company">
                    <MobileButton className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Building2 className="h-5 w-5 mr-2" />
                      Register Your Company
                    </MobileButton>
                  </Link>
                  <Link to="/logistics/contact">
                    <MobileButton variant="outline" className="border-secondary-foreground text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary">
                      <Phone className="h-5 w-5 mr-2" />
                      Contact Support
                    </MobileButton>
                  </Link>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
                    <Link to="/logistics/join-company">
                      <Building2 className="h-5 w-5 mr-2" />
                      Register Your Company
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-secondary-foreground text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary px-8">
                    <Link to="/logistics/contact">
                      <Phone className="h-5 w-5 mr-2" />
                      Contact Support
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </CamerLogisticsLayout>
  );
};

export default DeliveryCompaniesDirectory;