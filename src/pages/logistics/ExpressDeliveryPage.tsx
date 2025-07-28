import React from 'react';
import { Link } from 'react-router-dom';
import { CamerLogisticsLayout } from '@/components/Layout/CamerLogisticsLayout';
import { MobileCard, MobileCardContent, MobileCardHeader, MobileCardTitle } from '@/components/ui/mobile-card';
import { MobileButton } from '@/components/ui/mobile-form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Zap, 
  Clock, 
  MapPin, 
  Package, 
  CheckCircle, 
  ArrowRight,
  Star,
  Shield,
  Timer,
  Truck
} from 'lucide-react';

export const ExpressDeliveryPage = () => {
  const isMobile = useIsMobile();

  const features = [
    {
      icon: Clock,
      title: 'Same-Day Delivery',
      description: 'Packages delivered within 6-8 hours in major cities'
    },
    {
      icon: Zap,
      title: 'Priority Processing',
      description: 'Your packages get priority handling at every step'
    },
    {
      icon: Shield,
      title: 'Enhanced Security',
      description: 'Special handling protocols for urgent deliveries'
    },
    {
      icon: Timer,
      title: 'Real-Time Updates',
      description: 'Live tracking with 15-minute update intervals'
    }
  ];

  const cities = [
    { name: 'Douala', time: '4-6 hours', price: '3,500' },
    { name: 'Yaoundé', time: '4-6 hours', price: '3,500' },
    { name: 'Bamenda', time: '6-8 hours', price: '4,500' },
    { name: 'Bafoussam', time: '6-8 hours', price: '4,200' },
    { name: 'Buea', time: '5-7 hours', price: '4,000' },
    { name: 'Limbe', time: '5-7 hours', price: '4,000' }
  ];

  return (
    <CamerLogisticsLayout>
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary-glow/20 text-white border-primary-glow/30">
              <Zap className="h-4 w-4 mr-2" />
              Express Delivery Service
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Lightning-Fast Delivery
              <span className="block text-secondary">When Time Matters</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-primary-foreground/90 max-w-3xl mx-auto mb-8">
              Get your packages delivered the same day with our premium express service. Perfect for urgent documents, time-sensitive deliveries, and critical shipments.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isMobile ? (
                <>
                  <Link to="/logistics/ship">
                    <MobileButton className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                      <Package className="h-5 w-5 mr-2" />
                      Ship Express Now
                    </MobileButton>
                  </Link>
                  <Link to="/logistics/tracking">
                    <MobileButton variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                      <MapPin className="h-5 w-5 mr-2" />
                      Track Package
                    </MobileButton>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/logistics/ship">
                    <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8">
                      <Package className="h-5 w-5 mr-2" />
                      Ship Express Now
                    </Button>
                  </Link>
                  <Link to="/logistics/tracking">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary px-8">
                      <MapPin className="h-5 w-5 mr-2" />
                      Track Package
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Express Service Features</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Premium features designed for time-critical deliveries
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <MobileCard key={index} className="text-center hover:shadow-elegant transition-all">
                  <MobileCardContent className="p-6">
                    <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </MobileCardContent>
                </MobileCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Delivery Times & Pricing */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Delivery Times & Pricing</h2>
              <p className="text-lg text-muted-foreground">
                Same-day express delivery available in major cities across Cameroon
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cities.map((city, index) => (
                <MobileCard key={index} className="hover:shadow-lg transition-all">
                  <MobileCardHeader>
                    <div className="flex items-center justify-between">
                      <MobileCardTitle className="text-lg">{city.name}</MobileCardTitle>
                      <Badge variant="outline" className="text-primary border-primary">
                        <Clock className="h-3 w-3 mr-1" />
                        {city.time}
                      </Badge>
                    </div>
                  </MobileCardHeader>
                  <MobileCardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Starting from</span>
                      <span className="text-xl font-bold text-primary">{city.price} FCFA</span>
                    </div>
                  </MobileCardContent>
                </MobileCard>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                * Prices may vary based on package size, weight, and exact location
              </p>
              {isMobile ? (
                <Link to="/logistics/ship">
                  <MobileButton className="bg-primary hover:bg-primary/90">
                    Get Exact Quote
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </MobileButton>
                </Link>
              ) : (
                <Link to="/logistics/ship">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    Get Exact Quote
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">How Express Delivery Works</h2>
              <p className="text-lg text-muted-foreground">
                Simple, fast, and reliable - get your packages delivered the same day
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  1
                </div>
                <h3 className="font-semibold text-lg mb-3">Book by 12 PM</h3>
                <p className="text-muted-foreground">
                  Place your express delivery order before noon for same-day delivery
                </p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-secondary-foreground font-bold text-xl">
                  2
                </div>
                <h3 className="font-semibold text-lg mb-3">Priority Pickup</h3>
                <p className="text-muted-foreground">
                  Our courier picks up your package within 2 hours of booking
                </p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                  3
                </div>
                <h3 className="font-semibold text-lg mb-3">Same-Day Delivery</h3>
                <p className="text-muted-foreground">
                  Your package is delivered the same day with real-time tracking
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Need Express Delivery?
            </h2>
            <p className="text-lg mb-8">
              Don't wait - get your urgent packages delivered today with our express service
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isMobile ? (
                <>
                  <Link to="/logistics/ship">
                    <MobileButton className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Zap className="h-5 w-5 mr-2" />
                      Ship Express Now
                    </MobileButton>
                  </Link>
                  <Link to="/logistics/services">
                    <MobileButton variant="outline" className="border-secondary-foreground text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary">
                      <Truck className="h-5 w-5 mr-2" />
                      View All Services
                    </MobileButton>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/logistics/ship">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
                      <Zap className="h-5 w-5 mr-2" />
                      Ship Express Now
                    </Button>
                  </Link>
                  <Link to="/logistics/services">
                    <Button size="lg" variant="outline" className="border-secondary-foreground text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary px-8">
                      <Truck className="h-5 w-5 mr-2" />
                      View All Services
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