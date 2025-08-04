import React from 'react';
import { Link } from 'react-router-dom';
import { CamerLogisticsLayout } from '@/components/Layout/CamerLogisticsLayout';
import { MobileCard, MobileCardContent, MobileCardHeader, MobileCardTitle } from '@/components/ui/mobile-card';
import { MobileButton } from '@/components/ui/mobile-form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Building, 
  Users, 
  TrendingUp, 
  Globe, 
  Shield, 
  Clock, 
  Package, 
  ArrowRight,
  CheckCircle,
  Star,
  Calculator,
  Phone,
  Mail,
  Target
} from 'lucide-react';

export const BusinessSolutionsPage = () => {
  const isMobile = useIsMobile();

  const solutions = [
    {
      title: 'Enterprise Logistics',
      description: 'Comprehensive shipping solutions for large businesses',
      icon: Building,
      features: [
        'Dedicated account manager',
        'Custom rate negotiations',
        'Monthly invoicing',
        'Volume discounts up to 40%',
        'Priority customer support',
        'Performance analytics'
      ],
      pricing: 'Custom enterprise rates'
    },
    {
      title: 'E-commerce Integration',
      description: 'Seamless shipping for online stores',
      icon: Globe,
      features: [
        'API integration',
        'Real-time shipping rates',
        'Automated label generation',
        'Order management system',
        'Customer notifications',
        'Return management'
      ],
      pricing: 'Starting from 50,000 FCFA/month'
    },
    {
      title: 'Supply Chain Management',
      description: 'End-to-end supply chain optimization',
      icon: TrendingUp,
      features: [
        'Inventory management',
        'Demand forecasting',
        'Multi-warehouse support',
        'Route optimization',
        'Supplier coordination',
        'Cost analysis'
      ],
      pricing: 'Contact for quote'
    }
  ];

  const benefits = [
    {
      icon: Calculator,
      title: 'Cost Savings',
      description: 'Save up to 40% on shipping costs with volume discounts and negotiated rates'
    },
    {
      icon: Clock,
      title: 'Time Efficiency',
      description: 'Streamlined processes and automation reduce manual work by 80%'
    },
    {
      icon: Shield,
      title: 'Risk Mitigation',
      description: 'Comprehensive insurance and reliable partners minimize business risks'
    },
    {
      icon: TrendingUp,
      title: 'Scalability',
      description: 'Flexible solutions that grow with your business needs'
    }
  ];

  const testimonials = [
    {
      company: 'TechCorp Cameroon',
      industry: 'Technology',
      quote: 'CamerLogistics transformed our delivery operations. We reduced shipping costs by 35% while improving delivery times.',
      rating: 5
    },
    {
      company: 'Fashion Plus',
      industry: 'E-commerce',
      quote: 'The API integration was seamless. Our customers now get real-time tracking and we have complete visibility.',
      rating: 5
    },
    {
      company: 'AfricaMart',
      industry: 'Retail',
      quote: 'Their supply chain management helped us optimize our inventory and reduce waste by 25%.',
      rating: 5
    }
  ];

  return (
    <CamerLogisticsLayout>
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary-glow/20 text-white border-primary-glow/30">
              <Building className="h-4 w-4 mr-2" />
              Enterprise Solutions
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Business Logistics
              <span className="block text-secondary">Solutions</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-primary-foreground/90 max-w-3xl mx-auto mb-8">
              Scale your business with enterprise-grade logistics solutions. Custom rates, dedicated support, and seamless integration for businesses of all sizes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isMobile ? (
                <>
                  <Link to="/logistics/contact">
                    <MobileButton className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                      <Phone className="h-5 w-5 mr-2" />
                      Contact Sales
                    </MobileButton>
                  </Link>
                  <Link to="/logistics/demo">
                    <MobileButton variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                      <Target className="h-5 w-5 mr-2" />
                      Request Demo
                    </MobileButton>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/logistics/contact">
                    <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8">
                      <Phone className="h-5 w-5 mr-2" />
                      Contact Sales
                    </Button>
                  </Link>
                  <Link to="/logistics/demo">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary px-8">
                      <Target className="h-5 w-5 mr-2" />
                      Request Demo
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Overview */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Enterprise Solutions</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Comprehensive business logistics solutions designed to optimize your operations
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {solutions.map((solution, index) => {
              const IconComponent = solution.icon;
              return (
                <MobileCard key={index} className="hover:shadow-elegant transition-all duration-300">
                  <MobileCardHeader>
                    <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <MobileCardTitle className="text-xl text-center">{solution.title}</MobileCardTitle>
                    <p className="text-muted-foreground text-center">{solution.description}</p>
                  </MobileCardHeader>
                  <MobileCardContent className="space-y-4">
                    <div className="space-y-2">
                      {solution.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="text-center mb-4">
                        <span className="font-semibold text-primary">{solution.pricing}</span>
                      </div>
                      
                      {isMobile ? (
                        <Link to="/logistics/contact">
                          <MobileButton className="w-full bg-primary hover:bg-primary/90">
                            Learn More
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </MobileButton>
                        </Link>
                      ) : (
                        <Link to="/logistics/contact">
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

      {/* Benefits Section */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Choose Our Business Solutions?</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Proven benefits that drive real business results
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <MobileCard key={index} className="text-center hover:shadow-lg transition-all">
                  <MobileCardContent className="p-6">
                    <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-3">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </MobileCardContent>
                </MobileCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">What Our Business Clients Say</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Real results from businesses across Cameroon
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <MobileCard key={index} className="hover:shadow-lg transition-all">
                <MobileCardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current text-secondary" />
                    ))}
                  </div>
                  
                  <blockquote className="text-muted-foreground mb-4 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  <div>
                    <p className="font-semibold">{testimonial.company}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.industry}</p>
                  </div>
                </MobileCardContent>
              </MobileCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Transform Your Logistics?
            </h2>
            <p className="text-lg mb-8">
              Let's discuss how our enterprise solutions can optimize your business operations
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              {isMobile ? (
                <>
                  <Link to="/logistics/contact">
                    <MobileButton className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Phone className="h-5 w-5 mr-2" />
                      Schedule Consultation
                    </MobileButton>
                  </Link>
                  <Link to="/logistics/demo">
                    <MobileButton variant="outline" className="border-secondary-foreground text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary">
                      <Target className="h-5 w-5 mr-2" />
                      Request Demo
                    </MobileButton>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/logistics/contact">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
                      <Phone className="h-5 w-5 mr-2" />
                      Schedule Consultation
                    </Button>
                  </Link>
                  <Link to="/logistics/demo">
                    <Button size="lg" variant="outline" className="border-secondary-foreground text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary px-8">
                      <Target className="h-5 w-5 mr-2" />
                      Request Demo
                    </Button>
                  </Link>
                </>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>business@camerlogistics.cm</span>
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