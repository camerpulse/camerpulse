import React from 'react';
import { AppLayout } from "@/components/Layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Users, 
  Heart, 
  Building, 
  TrendingUp, 
  Vote,
  Globe,
  Shield,
  FileText,
  Target,
  CheckCircle,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Crown,
  Scale,
  Pill,
  MapPin
} from "lucide-react";

const Index = () => {
  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-6">
            <Sparkles className="h-4 w-4 mr-2" />
            Powered by AI & Transparency
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground">
            CamerPulse
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4">
            The Future of Civic Engagement
          </p>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            Your comprehensive platform for democratic participation, transparency tracking, 
            and civic engagement in Cameroon.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="px-8 py-4">
              <Link to="/polls">
                <Vote className="h-5 w-5 mr-2" />
                Explore Polls
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 py-4">
              <Link to="/politicians">
                <Users className="h-5 w-5 mr-2" />
                Track Politicians
              </Link>
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="p-4">
                <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">127K+</div>
                <div className="text-sm text-muted-foreground">Active Citizens</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <Target className="h-8 w-8 mx-auto mb-2 text-accent" />
                <div className="text-2xl font-bold">340+</div>
                <div className="text-sm text-muted-foreground">Projects Funded</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-secondary" />
                <div className="text-2xl font-bold">94%</div>
                <div className="text-sm text-muted-foreground">Transparency Score</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">$2.4M</div>
                <div className="text-sm text-muted-foreground">Total Impact</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Core Platform Features</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Advanced tools for democratic participation, transparency, and civic engagement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Civic Polls & Voting",
                description: "Participate in democratic decision-making with secure polling",
                icon: Vote,
                href: "/polls",
                gradient: "from-primary to-primary-glow"
              },
              {
                title: "Politician Tracker", 
                description: "Track performance and accountability of elected officials",
                icon: Users,
                href: "/politicians",
                gradient: "from-secondary to-accent"
              },
              {
                title: "Legislative Tracker",
                description: "Monitor bills, laws, and parliamentary activities in real-time",
                icon: FileText,
                href: "/legislation",
                gradient: "from-accent to-accent"
              },
              {
                title: "Judiciary System",
                description: "Transparent judicial oversight and court tracking",
                icon: Scale,
                href: "/judiciary", 
                gradient: "from-red-500 to-red-600"
              },
              {
                title: "Tenders & Bidding",
                description: "National tender platform for public and private opportunities",
                icon: Building,
                href: "/tenders",
                gradient: "from-blue-500 to-blue-600"
              },
              {
                title: "DiasporaConnect",
                description: "Empower diaspora engagement in national development",
                icon: Globe,
                href: "/diaspora-connect",
                gradient: "from-green-500 to-green-600"
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Link to={feature.href}>
                      Explore
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Directory Services */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Service Directories</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover institutions, services, and organizations across Cameroon
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Schools", icon: GraduationCap, href: "/schools", count: "12,000+", color: "text-blue-600" },
              { title: "Hospitals", icon: Heart, href: "/hospitals", count: "3,500+", color: "text-red-600" },
              { title: "Companies", icon: Building, href: "/companies", count: "28,000+", color: "text-primary" },
              { title: "Government", icon: Shield, href: "/ministries", count: "450+", color: "text-accent" },
              { title: "Officials", icon: Users, href: "/officials", count: "1,200+", color: "text-primary" },
              { title: "Judiciary", icon: Scale, href: "/judiciary", count: "320+", color: "text-red-500" },
              { title: "Villages", icon: Crown, href: "/villages", count: "2,800+", color: "text-orange-600" },
              { title: "Pharmacies", icon: Pill, href: "/pharmacies", count: "1,200+", color: "text-green-600" }
            ].map((directory, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <directory.icon className={`h-12 w-12 mx-auto mb-4 ${directory.color}`} />
                  <h3 className="font-semibold mb-2">{directory.title}</h3>
                  <Badge variant="secondary" className="mb-4">{directory.count}</Badge>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to={directory.href}>
                      Explore
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Join the Democratic Revolution
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Be part of the movement transforming civic engagement in Cameroon. 
                Your voice matters, your participation shapes the future.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary" className="px-8 py-4 text-lg">
                  <Link to="/auth">
                    Get Started Today
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-primary">
                  <Link to="/polls">
                    Explore Platform
                    <Vote className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </AppLayout>
  );
};

export default Index;