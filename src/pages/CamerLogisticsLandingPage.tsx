import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CamerLogisticsLayout } from '@/components/Layout/CamerLogisticsLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MobileCard, MobileCardContent, MobileCardHeader, MobileCardTitle } from '@/components/ui/mobile-card';
import { MobileButton, MobileInput } from '@/components/ui/mobile-form';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Truck, 
  Package, 
  MapPin, 
  Clock, 
  Shield, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Search,
  Star,
  Zap,
  Globe,
  Target,
  Phone,
  Mail,
  CheckSquare,
  TrendingUp,
  Award,
  Timer
} from 'lucide-react';

export const CamerLogisticsLandingPage = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const isMobile = useIsMobile();

  const handleTrackPackage = () => {
    if (trackingNumber.trim()) {
      // Navigate to tracking page
      console.log('Tracking:', trackingNumber);
    }
  };

  return (
    <CamerLogisticsLayout>
      {/* Professional Hero Section */}
      <section className="relative bg-gradient-primary text-white py-16 sm:py-20 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-6 bg-primary-glow/20 text-white border-primary-glow/30 text-sm sm:text-base px-4 py-2">
                <Truck className="h-4 w-4 mr-2" />
                Cameroon's Premier Shipping Platform
              </Badge>
              
              <h1 className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
                Professional
                <span className="block text-secondary font-extrabold">Logistics Solutions</span>
              </h1>
              
              <p className="text-lg sm:text-xl lg:text-2xl mb-8 text-primary-foreground/90 max-w-4xl mx-auto leading-relaxed">
                Connect with verified shipping companies nationwide. Fast delivery, real-time tracking, and insurance protection for your valuable packages.
              </p>
            </div>

            {/* Enhanced Quick Track */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 lg:p-8 mb-8 max-w-3xl mx-auto border border-white/20 shadow-glow">
              <div className="flex items-center justify-center mb-6">
                <MapPin className="h-6 w-6 mr-3 text-secondary" />
                <h3 className="text-xl lg:text-2xl font-semibold">Track Your Shipment</h3>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {isMobile ? (
                  <>
                    <MobileInput
                      placeholder="Enter tracking number (e.g., CL123456789)"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="bg-white text-foreground border-0 flex-1"
                    />
                    <MobileButton 
                      onClick={handleTrackPackage}
                      className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                    >
                      <Search className="h-5 w-5 mr-2" />
                      Track Package
                    </MobileButton>
                  </>
                ) : (
                  <>
                    <Input
                      placeholder="Enter tracking number (e.g., CL123456789)"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="bg-white text-foreground border-0 flex-1 h-14 text-lg"
                    />
                    <Button 
                      onClick={handleTrackPackage}
                      size="lg"
                      className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-14 px-8"
                    >
                      <Search className="h-5 w-5 mr-2" />
                      Track Package
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
              {isMobile ? (
                <>
                  <Link to="/logistics/ship">
                    <MobileButton className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                      <Package className="h-5 w-5 mr-2" />
                      Ship a Package
                    </MobileButton>
                  </Link>
                  <Link to="/logistics/join-company">
                    <MobileButton variant="outline" className="w-full border-white text-white hover:bg-white hover:text-primary">
                      <Users className="h-5 w-5 mr-2" />
                      Partner with Us
                    </MobileButton>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/logistics/ship">
                    <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 h-14">
                      <Package className="h-5 w-5 mr-2" />
                      Ship a Package
                    </Button>
                  </Link>
                  <Link to="/logistics/join-company">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary px-8 h-14">
                      <Users className="h-5 w-5 mr-2" />
                      Partner with Us
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Quick Access Links */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto">
              <Link to="/logistics/express" className="group">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-all">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-secondary group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium">Express Delivery</p>
                </div>
              </Link>
              <Link to="/logistics/tracking" className="group">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-all">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-secondary group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium">Track Package</p>
                </div>
              </Link>
              <Link to="/logistics/business" className="group">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-all">
                  <Users className="h-8 w-8 mx-auto mb-2 text-secondary group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium">Business Solutions</p>
                </div>
              </Link>
              <Link to="/logistics/companies" className="group">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-all">
                  <Truck className="h-8 w-8 mx-auto mb-2 text-secondary group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium">Find Companies</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Features Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Star className="h-4 w-4 mr-2" />
              Why Choose CamerLogistics?
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-foreground">
              Professional Shipping Excellence
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Experience Cameroon's most trusted logistics platform with verified partners, advanced tracking, and comprehensive insurance protection.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Verified Partners */}
            <MobileCard className="text-center hover:shadow-elegant transition-all duration-300 group">
              <MobileCardHeader>
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <MobileCardTitle className="text-xl">Verified Partners</MobileCardTitle>
              </MobileCardHeader>
              <MobileCardContent>
                <p className="text-muted-foreground leading-relaxed">
                  All shipping companies undergo rigorous verification including licenses, insurance, and performance standards.
                </p>
              </MobileCardContent>
            </MobileCard>

            {/* Real-time Tracking */}
            <MobileCard className="text-center hover:shadow-elegant transition-all duration-300 group">
              <MobileCardHeader>
                <div className="h-16 w-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/20 transition-colors">
                  <MapPin className="h-8 w-8 text-secondary" />
                </div>
                <MobileCardTitle className="text-xl">Live Tracking</MobileCardTitle>
              </MobileCardHeader>
              <MobileCardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Monitor your packages in real-time with GPS tracking, delivery estimates, and instant notifications.
                </p>
              </MobileCardContent>
            </MobileCard>

            {/* Secure & Insured */}
            <MobileCard className="text-center hover:shadow-elegant transition-all duration-300 group">
              <MobileCardHeader>
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <MobileCardTitle className="text-xl">Fully Insured</MobileCardTitle>
              </MobileCardHeader>
              <MobileCardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Comprehensive insurance coverage and secure handling protocols protect your valuable shipments.
                </p>
              </MobileCardContent>
            </MobileCard>

            {/* Fast Delivery */}
            <MobileCard className="text-center hover:shadow-elegant transition-all duration-300 group">
              <MobileCardHeader>
                <div className="h-16 w-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                  <Zap className="h-8 w-8 text-accent" />
                </div>
                <MobileCardTitle className="text-xl">Express Delivery</MobileCardTitle>
              </MobileCardHeader>
              <MobileCardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Same-day and next-day delivery options available for urgent shipments across major cities.
                </p>
              </MobileCardContent>
            </MobileCard>

            {/* Nationwide Coverage */}
            <MobileCard className="text-center hover:shadow-elegant transition-all duration-300 group">
              <MobileCardHeader>
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <MobileCardTitle className="text-xl">National Coverage</MobileCardTitle>
              </MobileCardHeader>
              <MobileCardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Extensive network covering all 10 regions of Cameroon with reliable delivery services.
                </p>
              </MobileCardContent>
            </MobileCard>

            {/* 24/7 Support */}
            <MobileCard className="text-center hover:shadow-elegant transition-all duration-300 group">
              <MobileCardHeader>
                <div className="h-16 w-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/20 transition-colors">
                  <Timer className="h-8 w-8 text-secondary" />
                </div>
                <MobileCardTitle className="text-xl">24/7 Support</MobileCardTitle>
              </MobileCardHeader>
              <MobileCardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Round-the-clock customer support with multilingual assistance in French and English.
                </p>
              </MobileCardContent>
            </MobileCard>
          </div>
        </div>
      </section>

      {/* Comprehensive Services Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
                <Target className="h-4 w-4 mr-2" />
                Complete Solutions
              </Badge>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-foreground">
                End-to-End Logistics Excellence
              </h2>
              
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed">
                From individual packages to enterprise-level logistics, we deliver comprehensive shipping solutions across all regions of Cameroon with unmatched reliability.
              </p>
              
              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
                    <CheckSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Same-Day Express Delivery</h4>
                    <p className="text-muted-foreground">Urgent packages delivered within hours in Douala, Yaoundé, and major cities.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
                    <CheckSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Nationwide Intercity Network</h4>
                    <p className="text-muted-foreground">Reliable shipping services connecting all 10 regions with scheduled routes.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
                    <CheckSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Enterprise Business Solutions</h4>
                    <p className="text-muted-foreground">Customized logistics partnerships for businesses with volume discounts.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center mt-1">
                    <CheckSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">International Gateway Services</h4>
                    <p className="text-muted-foreground">Connect to global markets through our international shipping partners.</p>
                  </div>
                </div>
              </div>

              {isMobile ? (
                <Link to="/logistics/services">
                  <MobileButton className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Explore All Services
                  </MobileButton>
                </Link>
              ) : (
                <Link to="/logistics/services">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-14">
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Explore All Services
                  </Button>
                </Link>
              )}
            </div>

            <div className="order-1 lg:order-2 grid grid-cols-2 gap-4 lg:gap-6">
              {/* Express Delivery */}
              <MobileCard className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-glow transition-all">
                <MobileCardContent className="p-4 sm:p-6 text-center">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-primary text-sm sm:text-base">Express Delivery</h4>
                  <p className="text-xs sm:text-sm text-primary/80 mt-2">Fast delivery when time matters</p>
                </MobileCardContent>
              </MobileCard>
              
              {/* Bulk Shipping */}
              <MobileCard className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20 hover:shadow-glow transition-all">
                <MobileCardContent className="p-4 sm:p-6 text-center">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Package className="h-6 w-6 sm:h-8 sm:w-8 text-secondary" />
                  </div>
                  <h4 className="font-semibold text-secondary text-sm sm:text-base">Bulk Shipping</h4>
                  <p className="text-xs sm:text-sm text-secondary/80 mt-2">Cost-effective for large orders</p>
                </MobileCardContent>
              </MobileCard>
              
              {/* Secure Handling */}
              <MobileCard className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-glow transition-all">
                <MobileCardContent className="p-4 sm:p-6 text-center">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-primary text-sm sm:text-base">Secure Handling</h4>
                  <p className="text-xs sm:text-sm text-primary/80 mt-2">Premium protection for valuables</p>
                </MobileCardContent>
              </MobileCard>
              
              {/* Business Solutions */}
              <MobileCard className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20 hover:shadow-glow transition-all">
                <MobileCardContent className="p-4 sm:p-6 text-center">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
                  </div>
                  <h4 className="font-semibold text-accent text-sm sm:text-base">Business Solutions</h4>
                  <p className="text-xs sm:text-sm text-accent/80 mt-2">Tailored for enterprises</p>
                </MobileCardContent>
              </MobileCard>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Statistics Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSIjZmZmZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiPjxwYXRoIGQ9Ik0yMCAyMGMwLTUuNS00LjUtMTAtMTAtMTBzLTEwIDQuNS0xMCAxMCA0LjUgMTAgMTAgMTAgMTAtNC41IDEwLTEwem0xMCAwYzAtNS41LTQuNS0xMC0xMC0xMHMtMTAgNC41LTEwIDEwIDQuNSAxMCAxMCAxMCAxMC00LjUgMTAtMTB6Ii8+PC9nPjwvc3ZnPg==')] opacity-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary-glow/20 text-primary-foreground border-primary-glow/30">
              <TrendingUp className="h-4 w-4 mr-2" />
              Our Impact
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Trusted by Thousands Across Cameroon
            </h2>
            <p className="text-lg sm:text-xl text-primary-foreground/90 max-w-3xl mx-auto">
              Real numbers from our commitment to excellence in logistics services
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="text-center">
              <div className="h-20 w-20 bg-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="h-10 w-10 text-secondary" />
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary mb-2">125,000+</div>
              <div className="text-primary-foreground/80 text-sm sm:text-base font-medium">Packages Delivered Successfully</div>
            </div>
            
            <div className="text-center">
              <div className="h-20 w-20 bg-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-secondary" />
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary mb-2">240+</div>
              <div className="text-primary-foreground/80 text-sm sm:text-base font-medium">Verified Partner Companies</div>
            </div>
            
            <div className="text-center">
              <div className="h-20 w-20 bg-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-10 w-10 text-secondary" />
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary mb-2">10</div>
              <div className="text-primary-foreground/80 text-sm sm:text-base font-medium">Regions Covered Nationwide</div>
            </div>
            
            <div className="text-center">
              <div className="h-20 w-20 bg-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="h-10 w-10 text-secondary" />
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary mb-2">99.7%</div>
              <div className="text-primary-foreground/80 text-sm sm:text-base font-medium">On-Time Delivery Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Call-to-Action Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-secondary via-secondary to-secondary/90 text-secondary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSIjMDAwMDAwIiBmaWxsLW9wYWNpdHk9IjAuMDUiPjxwYXRoIGQ9Ik0zMCAzMGMwLTExLTktMjAtMjAtMjBzLTIwIDktMjAgMjAgOSAyMCAyMCAyMCAyMC05IDIwLTIwem0yMCAwYzAtMTEtOS0yMC0yMC0yMHMtMjAgOS0yMCAyMCA5IDIwIDIwIDIwIDIwLTkgMjAtMjB6Ii8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-secondary-foreground/10 text-secondary-foreground border-secondary-foreground/20">
              <Truck className="h-4 w-4 mr-2" />
              Start Shipping Today
            </Badge>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Ready to Experience Professional Logistics?
            </h2>
            
            <p className="text-lg sm:text-xl text-secondary-foreground/90 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join thousands of satisfied customers and businesses who trust CamerLogistics for their shipping needs across Cameroon.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto mb-8">
              {isMobile ? (
                <>
                  <MobileButton className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Package className="h-5 w-5 mr-2" />
                    Get Started Today
                  </MobileButton>
                  <MobileButton variant="outline" className="border-secondary-foreground text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary">
                    <Phone className="h-5 w-5 mr-2" />
                    Contact Sales Team
                  </MobileButton>
                </>
              ) : (
                <>
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-14">
                    <Package className="h-5 w-5 mr-2" />
                    Get Started Today
                  </Button>
                  <Button size="lg" variant="outline" className="border-secondary-foreground text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary px-8 h-14">
                    <Phone className="h-5 w-5 mr-2" />
                    Contact Sales Team
                  </Button>
                </>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-secondary-foreground/80">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@camerlogistics.cm</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+237 6XX XXX XXX</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </CamerLogisticsLayout>
  );
};