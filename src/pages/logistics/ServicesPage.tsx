import React from 'react';
import { Link } from 'react-router-dom';
import { CamerLogisticsLayout } from '@/components/Layout/CamerLogisticsLayout';
import { MobileCard, MobileCardContent, MobileCardHeader, MobileCardTitle } from '@/components/ui/mobile-card';
import { MobileButton } from '@/components/ui/mobile-form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Truck, 
  Package, 
  Clock, 
  Globe, 
  Shield, 
  Users, 
  Zap, 
  ArrowRight,
  CheckCircle,
  Star,
  Building,
  Plane,
  Timer,
  Calculator,
  Target
} from 'lucide-react';

export const ServicesPage = () => {
  const isMobile = useIsMobile();

  const services = [
    {
      id: 'express',
      title: 'Express Delivery',
      description: 'Same-day and next-day delivery for urgent packages',
      icon: Zap,
      color: 'primary',
      features: ['Same-day delivery', 'Next-day guarantee', 'Priority handling', 'Real-time tracking'],
      pricing: 'From 3,500 FCFA',
      route: '/logistics/express'
    },
    {
      id: 'standard',
      title: 'Standard Shipping',
      description: 'Reliable 2-3 day delivery nationwide',
      icon: Truck,
      color: 'secondary',
      features: ['2-3 day delivery', 'Nationwide coverage', 'Insurance included', 'SMS notifications'],
      pricing: 'From 1,500 FCFA',
      route: '/logistics/standard'
    },
    {
      id: 'bulk',
      title: 'Bulk Shipping',
      description: 'Cost-effective solution for large orders',
      icon: Package,
      color: 'accent',
      features: ['Volume discounts', 'Scheduled pickups', 'Dedicated support', 'Custom packaging'],
      pricing: 'Custom quotes',
      route: '/logistics/bulk'
    },
    {
      id: 'international',
      title: 'International Gateway',
      description: 'Connect to global markets',
      icon: Globe,
      color: 'primary',
      features: ['Customs clearance', 'Door-to-door service', 'Multiple carriers', 'Documentation support'],
      pricing: 'From 15,000 FCFA',
      route: '/logistics/international'
    },
    {
      id: 'business',
      title: 'Business Solutions',
      description: 'Enterprise logistics partnerships',
      icon: Building,
      color: 'secondary',
      features: ['API integration', 'Dedicated account manager', 'Custom rates', 'Monthly invoicing'],
      pricing: 'Enterprise rates',
      route: '/logistics/business'
    },
    {
      id: 'secure',
      title: 'Secure Handling',
      description: 'Premium protection for valuables',
      icon: Shield,
      color: 'accent',
      features: ['Enhanced security', 'Signature required', 'Photo proof', 'Higher insurance'],
      pricing: 'From 5,000 FCFA',
      route: '/logistics/secure'
    }
  ];

  const addOns = [
    {
      title: 'Insurance Plus',
      description: 'Extended coverage up to 10 million FCFA',
      price: 'From 500 FCFA',
      icon: Shield
    },
    {
      title: 'Special Handling',
      description: 'Fragile, hazardous, or temperature-controlled items',
      price: 'From 1,000 FCFA',
      icon: Timer
    },
    {
      title: 'SMS Alerts',
      description: 'Real-time notifications at every step',
      price: '200 FCFA',
      icon: Package
    },
    {
      title: 'Packaging Service',
      description: 'Professional packaging and protective materials',
      price: 'From 800 FCFA',
      icon: Package
    }
  ];

  return (
    <CamerLogisticsLayout>
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary-glow/20 text-white border-primary-glow/30">
              <Target className="h-4 w-4 mr-2" />
              Complete Logistics Solutions
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Professional Shipping Services
            </h1>
            
            <p className="text-lg sm:text-xl text-primary-foreground/90 max-w-3xl mx-auto">
              From express delivery to enterprise solutions, we offer comprehensive logistics services tailored to your needs.
            </p>
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Choose from our range of professional shipping solutions designed for every need
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {services.map((service) => {
              const IconComponent = service.icon;
              return (
                <MobileCard key={service.id} className="hover:shadow-elegant transition-all duration-300 group">
                  <MobileCardHeader>
                    <div className={`h-16 w-16 bg-${service.color}/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-${service.color}/20 transition-colors`}>
                      <IconComponent className={`h-8 w-8 text-${service.color}`} />
                    </div>
                    <MobileCardTitle className="text-xl text-center">{service.title}</MobileCardTitle>
                    <p className="text-muted-foreground text-center">{service.description}</p>
                  </MobileCardHeader>
                  <MobileCardContent className="space-y-4">
                    <div className="space-y-2">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold text-primary">{service.pricing}</span>
                        <Badge variant="outline" className="text-xs">Popular</Badge>
                      </div>
                      
                      {isMobile ? (
                        <Link to={service.route}>
                          <MobileButton className="w-full bg-primary hover:bg-primary/90">
                            Learn More
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </MobileButton>
                        </Link>
                      ) : (
                        <Link to={service.route}>
                          <Button className="w-full bg-primary hover:bg-primary/90">
                            Learn More
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </MobileCardContent>
                </MobileCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Add-On Services */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Additional Services</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Enhance your shipping experience with our premium add-on services
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOns.map((addon, index) => {
              const IconComponent = addon.icon;
              return (
                <MobileCard key={index} className="text-center hover:shadow-lg transition-all">
                  <MobileCardContent className="p-6">
                    <div className="h-14 w-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{addon.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{addon.description}</p>
                    <p className="text-sm font-medium text-primary">{addon.price}</p>
                  </MobileCardContent>
                </MobileCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Ship with Confidence?
            </h2>
            <p className="text-lg mb-8">
              Get started with Cameroon's most trusted logistics platform today
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isMobile ? (
                <>
                  <Link to="/logistics/ship">
                    <MobileButton className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Package className="h-5 w-5 mr-2" />
                      Ship a Package
                    </MobileButton>
                  </Link>
                  <Link to="/logistics/business">
                    <MobileButton variant="outline" className="border-secondary-foreground text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary">
                      <Building className="h-5 w-5 mr-2" />
                      Business Solutions
                    </MobileButton>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/logistics/ship">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
                      <Package className="h-5 w-5 mr-2" />
                      Ship a Package
                    </Button>
                  </Link>
                  <Link to="/logistics/business">
                    <Button size="lg" variant="outline" className="border-secondary-foreground text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary px-8">
                      <Building className="h-5 w-5 mr-2" />
                      Business Solutions
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </CamerLogisticsLayout>
  );
};