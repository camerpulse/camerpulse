import React from 'react';
import { AppLayout } from "@/components/Layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Users, 
  Calendar, 
  GraduationCap, 
  Heart, 
  Pill, 
  Crown, 
  Building, 
  TrendingUp, 
  MapPin,
  Vote,
  Globe,
  Shield,
  FileText,
  BarChart3,
  Target,
  Zap,
  Star,
  ArrowRight,
  CheckCircle,
  Sparkles
} from "lucide-react";

const Index = () => {
  const featuredStats = [
    { label: "Active Citizens", value: "127K+", icon: Users, color: "text-primary" },
    { label: "Projects Funded", value: "340+", icon: Target, color: "text-accent" },
    { label: "Transparency Score", value: "94%", icon: CheckCircle, color: "text-secondary" },
    { label: "Total Impact", value: "$2.4M", icon: TrendingUp, color: "text-primary" }
  ];

  const coreFeatures = [
    {
      title: "Civic Polls & Voting",
      description: "Participate in democratic decision-making with secure, transparent polling",
      icon: Vote,
      href: "/polls",
      gradient: "from-blue-500 to-blue-600",
      features: ["Real-time results", "Fraud protection", "Anonymous voting"]
    },
    {
      title: "DiasporaConnect",
      description: "Empower diaspora engagement in national development projects",
      icon: Globe,
      href: "/diaspora-connect",
      gradient: "from-primary to-primary-glow",
      features: ["Investment tracking", "Virtual town halls", "Impact analytics"]
    },
    {
      title: "Legislative Tracker",
      description: "Monitor bills, laws, and parliamentary activities in real-time",
      icon: FileText,
      href: "/legislation",
      gradient: "from-purple-500 to-purple-600",
      features: ["Bill tracking", "Voting records", "Impact analysis"]
    },
    {
      title: "Politician Tracker",
      description: "Track performance, promises, and accountability of elected officials",
      icon: Users,
      href: "/politicians",
      gradient: "from-secondary to-accent",
      features: ["Promise tracking", "Performance metrics", "Citizen ratings"]
    }
  ];

  const platformStats = [
    { category: "Democracy", items: ["Politicians Tracked", "Polls Created", "Votes Cast"], count: "45K+" },
    { category: "Education", items: ["Schools Listed", "Universities", "Institutions"], count: "12K+" },
    { category: "Healthcare", items: ["Hospitals", "Clinics", "Pharmacies"], count: "8.5K+" },
    { category: "Business", items: ["Companies", "SMEs", "Startups"], count: "28K+" }
  ];

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: 'var(--gradient-hero)',
          }}
        />
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center max-w-5xl mx-auto">
            <Badge variant="secondary" className="mb-6 text-sm font-medium px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              Powered by AI & Transparency
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="block">CamerPulse</span>
              <span className="block text-3xl md:text-5xl lg:text-6xl text-muted-foreground font-normal">
                The Future of Civic Engagement
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Your comprehensive platform for democratic participation, transparency tracking, 
              and civic engagement in Cameroon. Join the digital revolution transforming governance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg">
                <Link to="/diaspora-connect">
                  <Globe className="h-5 w-5 mr-2" />
                  DiasporaConnect
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-4 text-lg">
                <Link to="/polls">
                  <Vote className="h-5 w-5 mr-2" />
                  Explore Polls
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="px-8 py-4 text-lg">
                <Link to="/politicians">
                  <Users className="h-5 w-5 mr-2" />
                  Track Politicians
                </Link>
              </Button>
            </div>

            {/* Featured Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {featuredStats.map((stat, index) => (
                <Card key={index} className="text-center border-0 shadow-md">
                  <CardContent className="p-4">
                    <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Core Platform Features</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Advanced tools for democratic participation, transparency, and civic engagement
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {coreFeatures.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0">
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-6">
                    {feature.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary mr-2" />
                        {feat}
                      </div>
                    ))}
                  </div>
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

          {/* Platform Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformStats.map((stat, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-primary mb-2">{stat.count}</div>
                  <div className="text-lg font-semibold mb-2">{stat.category}</div>
                  <div className="space-y-1">
                    {stat.items.map((item, idx) => (
                      <div key={idx} className="text-sm text-muted-foreground">{item}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Directory Services */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Comprehensive Directories</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover and connect with institutions, services, and organizations across Cameroon
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Educational Institutions", icon: GraduationCap, href: "/schools", count: "12,000+", color: "text-blue-600" },
              { title: "Healthcare Facilities", icon: Heart, href: "/hospitals", count: "3,500+", color: "text-red-500" },
              { title: "Business Directory", icon: Building, href: "/companies", count: "28,000+", color: "text-green-600" },
              { title: "Government Services", icon: Shield, href: "/ministries", count: "450+", color: "text-purple-600" },
              { title: "Traditional Villages", icon: Crown, href: "/villages", count: "2,800+", color: "text-amber-600" },
              { title: "Pharmacies & Health", icon: Pill, href: "/pharmacies", count: "1,200+", color: "text-emerald-600" },
              { title: "Local Councils", icon: MapPin, href: "/councils", count: "360+", color: "text-blue-500" },
              { title: "Entertainment Hub", icon: Star, href: "/camerplay", count: "5,000+", color: "text-pink-600" }
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

      {/* Analytics & Intelligence */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Intelligence & Analytics</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Data-driven insights for informed decisions and transparent governance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Election Forecasting",
                description: "AI-powered predictions and electoral analysis",
                icon: BarChart3,
                href: "/election-forecast",
                metrics: ["94% accuracy", "Real-time updates", "Regional breakdowns"]
              },
              {
                title: "Billionaire Tracker",
                description: "Transparency in wealth and economic influence",
                icon: Crown,
                href: "/billionaires",
                metrics: ["25+ tracked", "$2.4B+ monitored", "Transparency scoring"]
              },
              {
                title: "National Debt Monitor",
                description: "Real-time economic indicators and debt tracking",
                icon: TrendingUp,
                href: "/national-debt",
                metrics: ["Live updates", "Historical trends", "Impact analysis"]
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <feature.icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-6">
                    {feature.metrics.map((metric, idx) => (
                      <div key={idx} className="flex items-center text-sm">
                        <Zap className="h-3 w-3 text-primary mr-2" />
                        {metric}
                      </div>
                    ))}
                  </div>
                  <Button asChild className="w-full">
                    <Link to={feature.href}>
                      View Analytics
                      <BarChart3 className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground border-0">
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