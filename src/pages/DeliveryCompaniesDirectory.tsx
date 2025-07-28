import React, { useState } from 'react';
import { AppLayout } from "@/components/Layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  ChevronRight
} from "lucide-react";

const DeliveryCompaniesDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedService, setSelectedService] = useState('');

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
    
    return matchesSearch && matchesRegion && matchesService;
  });

  const getPartnershipBadge = (status: string) => {
    switch (status) {
      case 'preferred':
        return <Badge className="bg-gold text-white"><Award className="h-3 w-3 mr-1" />Preferred</Badge>;
      case 'partner':
        return <Badge variant="secondary"><Users className="h-3 w-3 mr-1" />Partner</Badge>;
      default:
        return <Badge variant="outline">Registered</Badge>;
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <section className="py-12 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold font-playfair mb-4">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Delivery Companies
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Find reliable delivery partners across Cameroon
            </p>
            
            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search companies or services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Service Type" />
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
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold">
                {filteredCompanies.length} Companies Found
              </h2>
              <p className="text-muted-foreground">
                Verified delivery partners ready to serve you
              </p>
            </div>
            
            <Button asChild>
              <Link to="/delivery/register">
                <Building2 className="h-4 w-4 mr-2" />
                Register Your Company
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCompanies.map((company) => (
              <Card key={company.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{company.name}</CardTitle>
                        {company.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            <Award className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span>Code: {company.code}</span>
                        <span>•</span>
                        <span>{company.yearsInBusiness} years</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium ml-1">{company.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({company.totalReviews} reviews)
                        </span>
                      </div>
                    </div>
                    
                    {getPartnershipBadge(company.partnershipStatus)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Service Areas */}
                  <div>
                    <div className="flex items-center text-sm font-medium mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      Service Areas
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {company.regions.slice(0, 3).map((region, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {region}
                        </Badge>
                      ))}
                      {company.regions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{company.regions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Services */}
                  <div>
                    <div className="flex items-center text-sm font-medium mb-2">
                      <Truck className="h-4 w-4 mr-1" />
                      Services
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {company.services.slice(0, 2).map((service, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                      {company.services.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{company.services.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="flex flex-col sm:flex-row gap-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Phone className="h-3 w-3 mr-1" />
                      {company.contactPhone}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Mail className="h-3 w-3 mr-1" />
                      {company.contactEmail}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="flex-1">
                      <Link to={`/delivery-company/${company.id}`} className="flex items-center">
                        View Profile
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                    <Button className="flex-1">
                      Request Quote
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredCompanies.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No companies found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search criteria or register a new company.
              </p>
              <Button asChild>
                <Link to="/delivery/register">
                  Register Your Company
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Don't see your company listed?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our growing network of delivery partners and connect with customers across Cameroon.
          </p>
          <Button asChild size="lg">
            <Link to="/delivery/register">
              <Building2 className="h-5 w-5 mr-2" />
              Register Your Delivery Company
            </Link>
          </Button>
        </div>
      </section>
    </AppLayout>
  );
};

export default DeliveryCompaniesDirectory;