import React from 'react';
import { AppLayout } from "@/components/Layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Truck, 
  Package, 
  MapPin, 
  Clock, 
  Shield, 
  Star, 
  ArrowRight,
  Building2,
  Search,
  Plus,
  BarChart3,
  Users,
  Award,
  Globe
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const ShippingHome = () => {
  const { user } = useAuth();

  const shippingStats = [
    { label: "Registered Companies", value: "45+", icon: Building2, color: "text-primary" },
    { label: "Regions Covered", value: "10/10", icon: MapPin, color: "text-secondary" },
    { label: "Average Rating", value: "4.7/5", icon: Star, color: "text-accent" },
    { label: "Delivery Success", value: "98.5%", icon: Shield, color: "text-primary" }
  ];

  const deliveryServices = [
    {
      title: "Track Your Shipment",
      description: "Real-time tracking of your packages with detailed status updates",
      icon: Package,
      href: "/shipping/track",
      features: ["Real-time GPS tracking", "SMS notifications", "Delivery photos"]
    },
    {
      title: "Find Delivery Companies",
      description: "Browse verified delivery companies in your region",
      icon: Search,
      href: "/delivery-companies",
      features: ["Verified profiles", "Customer reviews", "Service areas"]
    },
    {
      title: "Register as Delivery Partner",
      description: "Join our network of trusted delivery companies",
      icon: Plus,
      href: "/delivery/register",
      features: ["Quick registration", "Profile management", "Partnership opportunities"]
    },
    {
      title: "Shipping Analytics",
      description: "Monitor shipping performance and trends",
      icon: BarChart3,
      href: "/shipping/analytics",
      features: ["Performance metrics", "Cost analysis", "Route optimization"]
    }
  ];

  const featuredCompanies = [
    {
      name: "Express Cameroon Logistics",
      rating: 4.8,
      reviews: 234,
      regions: ["Douala", "Yaoundé", "Bafoussam"],
      specialties: ["Same-day delivery", "Express shipping"]
    },
    {
      name: "Savane Transport",
      rating: 4.6,
      reviews: 187,
      regions: ["North", "Adamawa", "Far North"],
      specialties: ["Regional coverage", "Bulk shipping"]
    },
    {
      name: "Coastal Delivery Services",
      rating: 4.9,
      reviews: 156,
      regions: ["Littoral", "Southwest", "South"],
      specialties: ["Coastal routes", "Fresh products"]
    }
  ];

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 text-base font-medium px-6 py-2">
              <Truck className="h-4 w-4 mr-2" />
              Shipping & Delivery Hub
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold font-playfair mb-6">
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Shipping Made Simple
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Connect with reliable delivery companies across Cameroon. Track shipments, 
              manage deliveries, and grow your logistics network.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary-glow">
                <Link to="/shipping/track">
                  <Package className="h-5 w-5 mr-2" />
                  Track Shipment
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/delivery-companies">
                  <Search className="h-5 w-5 mr-2" />
                  Find Delivery Partner
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {shippingStats.map((stat, index) => (
              <Card key={index} className="text-center border-0 shadow-md">
                <CardContent className="p-6">
                  <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-playfair mb-4">
              Shipping <span className="text-primary">Services</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your shipping and delivery needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {deliveryServices.map((service, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <service.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {service.title}
                      </CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mr-3" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Button asChild className="w-full">
                    <Link to={service.href}>
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Delivery Companies */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-playfair mb-4">
              Featured <span className="text-accent">Delivery Partners</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Top-rated delivery companies across Cameroon
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {featuredCompanies.map((company, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{company.rating}</span>
                        <span className="text-sm text-muted-foreground">
                          ({company.reviews} reviews)
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      <Award className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        Service Areas
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {company.regions.map((region, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {region}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium mb-2">Specialties</div>
                      <div className="space-y-1">
                        {company.specialties.map((specialty, idx) => (
                          <div key={idx} className="text-sm text-muted-foreground flex items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent mr-2" />
                            {specialty}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button variant="outline" className="w-full">
                      View Profile
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link to="/delivery-companies">
                <Globe className="h-5 w-5 mr-2" />
                View All Partners
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Actions for Authenticated Users */}
      {user && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Quick Actions</CardTitle>
                <CardDescription>
                  Manage your shipping activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button asChild variant="outline" className="h-20 flex-col gap-2">
                    <Link to="/shipping/create">
                      <Plus className="h-6 w-6" />
                      Create Shipment
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-20 flex-col gap-2">
                    <Link to="/shipping/manage">
                      <Package className="h-6 w-6" />
                      Manage Shipments
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-20 flex-col gap-2">
                    <Link to="/delivery/register">
                      <Building2 className="h-6 w-6" />
                      Register Company
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-primary to-accent text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Join Our Delivery Network?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Whether you're a delivery company or need shipping services, 
            we're here to connect you with the right partners.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link to="/delivery/register">
                <Building2 className="h-5 w-5 mr-2" />
                Register as Partner
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 border-white/30">
              <Link to="/contact">
                <Users className="h-5 w-5 mr-2" />
                Contact Support
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </AppLayout>
  );
};

export default ShippingHome;