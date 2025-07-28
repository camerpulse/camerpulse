import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Search, 
  Truck, 
  Building2, 
  MapPin, 
  Clock, 
  Shield, 
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PublicHomePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleTrackPackage = () => {
    if (!trackingNumber.trim()) {
      toast({
        title: "Tracking Number Required",
        description: "Please enter a tracking number to track your package",
        variant: "destructive",
      });
      return;
    }
    navigate(`/public/tracking/${trackingNumber.trim()}`);
  };

  const featuredCompanies = [
    {
      id: '1',
      name: 'Express Cameroon Logistics',
      rating: 4.8,
      reviews: 234,
      regions: ['Douala', 'Yaoundé', 'Bafoussam'],
      services: ['Same-day', 'Express', 'Bulk'],
      verified: true
    },
    {
      id: '2',
      name: 'Savane Transport',
      rating: 4.6,
      reviews: 189,
      regions: ['Bamenda', 'Garoua', 'Maroua'],
      services: ['Express', 'Standard', 'Freight'],
      verified: true
    },
    {
      id: '3',
      name: 'Coastal Delivery Pro',
      rating: 4.7,
      reviews: 156,
      regions: ['Douala', 'Kribi', 'Limbe'],
      services: ['Marine', 'Express', 'Special'],
      verified: true
    }
  ];

  const stats = [
    { label: 'Delivery Companies', value: '50+', icon: Building2 },
    { label: 'Cities Covered', value: '180+', icon: MapPin },
    { label: 'Packages Delivered', value: '100K+', icon: Package },
    { label: 'Happy Customers', value: '25K+', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">CamerPulse</h1>
                <p className="text-xs text-muted-foreground">Logistics & Delivery Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/public/directory">
                <Button variant="ghost">
                  <Building2 className="h-4 w-4 mr-2" />
                  Companies
                </Button>
              </Link>
              <Link to="/public/register-company">
                <Button variant="outline">
                  <Truck className="h-4 w-4 mr-2" />
                  Register Company
                </Button>
              </Link>
              <Link to="/auth">
                <Button>
                  <Shield className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold tracking-tight">
              Track Your Package &
              <span className="text-primary"> Find Delivery Partners</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with trusted delivery companies across Cameroon. Track packages in real-time and discover reliable logistics partners for your business.
            </p>
          </div>

          {/* Package Tracking */}
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Track Your Package
              </CardTitle>
              <CardDescription>
                Enter your tracking number to get real-time updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter tracking number (e.g., TRK-20240101-12345678)"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTrackPackage()}
                  className="flex-1"
                />
                <Button onClick={handleTrackPackage}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Track packages from all partner delivery companies
              </p>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Featured Companies */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-3xl font-bold">Featured Delivery Partners</h3>
              <p className="text-muted-foreground">Trusted companies across Cameroon</p>
            </div>
            <Link to="/public/directory">
              <Button variant="outline">
                View All Companies
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredCompanies.map((company) => (
              <Card key={company.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    {company.verified && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{company.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({company.reviews} reviews)
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Service Areas:</p>
                    <div className="flex flex-wrap gap-1">
                      {company.regions.slice(0, 3).map((region) => (
                        <Badge key={region} variant="outline" className="text-xs">
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
                  <div>
                    <p className="text-sm font-medium mb-1">Services:</p>
                    <div className="flex flex-wrap gap-1">
                      {company.services.map((service) => (
                        <Badge key={service} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <MapPin className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Call-to-Action */}
        <section className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Join Our Network?</CardTitle>
              <CardDescription className="text-lg">
                Register your delivery company and connect with customers across Cameroon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Globe className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Expand Your Reach</p>
                    <p className="text-sm text-muted-foreground">Access customers nationwide</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Clock className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">Real-time Tracking</p>
                    <p className="text-sm text-muted-foreground">Integrated tracking system</p>
                  </div>
                </div>
              </div>
              <Link to="/public/register-company">
                <Button size="lg" className="w-full md:w-auto">
                  <Building2 className="h-4 w-4 mr-2" />
                  Register Your Company
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Package className="h-6 w-6 text-primary" />
                <span className="font-bold">CamerPulse</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Connecting businesses with reliable delivery partners across Cameroon.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-3">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/public/tracking" className="hover:text-foreground">Package Tracking</Link></li>
                <li><Link to="/public/directory" className="hover:text-foreground">Company Directory</Link></li>
                <li><Link to="/public/register-company" className="hover:text-foreground">Company Registration</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/auth" className="hover:text-foreground">Login</Link></li>
                <li><a href="#" className="hover:text-foreground">About Us</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 CamerPulse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}