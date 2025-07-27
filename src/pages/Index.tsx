import React, { useEffect, useState } from 'react';
import { AppLayout } from "@/components/Layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  Sparkles,
  Scale,
  LogOut,
  User,
  Briefcase,
  Play,
  ExternalLink,
  MessageCircle,
  Eye,
  Laptop,
  Smartphone,
  Lock,
  Award,
  ChevronDown
} from "lucide-react";

const Index = () => {
  const { user, profile, signOut, loading } = useAuth();
  const [currentStatIndex, setCurrentStatIndex] = useState(0);

  // Auto-rotate featured stats
  const featuredStats = [
    { label: "Active Citizens", value: "127K+", icon: Users, color: "text-primary", description: "Engaged users driving change" },
    { label: "Projects Funded", value: "340+", icon: Target, color: "text-accent", description: "Community-backed initiatives" },
    { label: "Transparency Score", value: "94%", icon: CheckCircle, color: "text-secondary", description: "Government accountability" },
    { label: "Total Impact", value: "$2.4M", icon: TrendingUp, color: "text-primary", description: "Economic development tracked" }
  ];

  useEffect(() => {
    // Only redirect if user is authenticated and loading is complete
    // Remove automatic redirect to avoid blank page issues
  }, [user, loading]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatIndex((prev) => (prev + 1) % featuredStats.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const testimonials = [
    {
      quote: "CamerPulse has revolutionized how I track government promises and engage in local politics.",
      author: "Amina Tchamba",
      role: "Civil Society Activist",
      location: "Douala"
    },
    {
      quote: "As a diaspora member, I can now meaningfully contribute to Cameroon's development.",
      author: "Jean-Baptiste Kouam",
      role: "Software Engineer",
      location: "Toronto, Canada"
    },
    {
      quote: "The transparency tools help me hold our representatives accountable.",
      author: "Dr. Marie Fotso",
      role: "University Professor",
      location: "Yaoundé"
    }
  ];

  const platformHighlights = [
    {
      title: "AI-Powered Insights",
      description: "Smart analytics reveal patterns in governance and civic engagement",
      icon: Zap,
      gradient: "from-yellow-400 to-orange-500"
    },
    {
      title: "Real-Time Transparency",
      description: "Live monitoring of government activities and public spending",
      icon: Eye,
      gradient: "from-blue-500 to-purple-600"
    },
    {
      title: "Secure Voting",
      description: "Blockchain-secured polls ensure authenticity and prevent fraud",
      icon: Lock,
      gradient: "from-green-500 to-teal-600"
    },
    {
      title: "Mobile First",
      description: "Optimized for smartphones to reach every Cameroonian",
      icon: Smartphone,
      gradient: "from-pink-500 to-rose-600"
    }
  ];

  return (
    <AppLayout>
      {/* Floating User Info */}
      {user && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <Card className="shadow-elegant backdrop-blur-sm bg-white/95">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {profile?.display_name || profile?.username || 'User'}
                </p>
                <div className="flex items-center gap-2">
                  <Link to={`/user/${user.id}`}>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      Profile
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="h-6 px-2 text-xs">
                    <LogOut className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revolutionary Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 opacity-10 animate-pulse"
            style={{ background: 'var(--gradient-patriotic)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/80" />
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-4 sm:left-20 w-16 sm:w-32 h-16 sm:h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-40 right-4 sm:right-20 w-24 sm:w-48 h-24 sm:h-48 bg-accent/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/4 w-12 sm:w-24 h-12 sm:h-24 bg-secondary/10 rounded-full blur-2xl animate-pulse" />
        </div>

        <div className="relative container mx-auto py-8 sm:py-16 text-center max-w-5xl">
          {/* Badge */}
          <Badge variant="secondary" className="mb-6 sm:mb-8 text-sm sm:text-base font-medium px-4 sm:px-6 py-2 sm:py-3 animate-fade-in shadow-md">
            <Sparkles className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
            Powered by AI & Transparency
          </Badge>
          
          {/* Main Heading */}
          <div className="mb-6 sm:mb-8 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold font-playfair mb-3 sm:mb-4 leading-tight">
              <span className="block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                CamerPulse
              </span>
            </h1>
            <p className="text-lg sm:text-2xl md:text-4xl lg:text-5xl font-grotesk font-light text-muted-foreground px-4">
              Democracy in <span className="text-primary font-medium">Your Hands</span>
            </p>
          </div>
          
          {/* Revolutionary Description */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in px-4">
            Join the digital revolution transforming civic engagement in Cameroon. 
            Track politicians, participate in polls, monitor transparency, and be the change you want to see.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 animate-fade-in px-4">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow transition-all duration-300 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg">
              <Link to="/auth">
                <Play className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
                Start Your Journey
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg hover:bg-muted/50 transition-all">
              <Link to="/transparency">
                <Shield className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
                View Transparency
              </Link>
            </Button>
          </div>

          {/* Rotating Stats Display */}
          <div className="max-w-md mx-auto">
            <Card className="border-0 shadow-elegant bg-gradient-to-r from-card to-muted/30 animate-scale-in">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="transition-all duration-500">
                  {(() => {
                    const stat = featuredStats[currentStatIndex];
                    return (
                      <div key={currentStatIndex} className="animate-fade-in">
                        <stat.icon className={`h-10 sm:h-12 w-10 sm:w-12 mx-auto mb-3 sm:mb-4 ${stat.color}`} />
                        <div className="text-3xl sm:text-4xl font-bold mb-2">{stat.value}</div>
                        <div className="text-base sm:text-lg font-medium mb-1">{stat.label}</div>
                        <div className="text-sm text-muted-foreground">{stat.description}</div>
                      </div>
                    );
                  })()}
                </div>
                
                {/* Dots Indicator */}
                <div className="flex justify-center gap-2 mt-6">
                  {featuredStats.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStatIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentStatIndex ? 'bg-primary scale-125' : 'bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-muted-foreground" />
        </div>
      </section>

      {/* Platform Highlights */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-muted/20 to-muted/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-playfair mb-4 sm:mb-6">
              Platform <span className="text-primary">Highlights</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Cutting-edge technology meets democratic innovation
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {platformHighlights.map((highlight, index) => (
              <Card key={index} className="group hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-0 overflow-hidden">
                <CardContent className="p-8 text-center relative">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${highlight.gradient} flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                    <highlight.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{highlight.title}</h3>
                  <p className="text-muted-foreground">{highlight.description}</p>
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold font-playfair mb-6">
              Empower Your <span className="text-accent">Voice</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive tools for democratic participation and civic engagement
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {[
              {
                title: "Civic Polls & Voting",
                description: "Participate in secure, transparent democratic polls with fraud protection",
                icon: Vote,
                href: "/polls",
                accent: "primary",
                features: ["Blockchain security", "Real-time results", "Anonymous voting"]
              },
              {
                title: "DiasporaConnect",
                description: "Bridge the gap between Cameroon and its global diaspora community",
                icon: Globe,
                href: "/diaspora-connect",
                accent: "secondary",
                features: ["Investment tracking", "Virtual town halls", "Impact analytics"]
              },
              {
                title: "Politician Tracker",
                description: "Hold elected officials accountable through performance monitoring",
                icon: Users,
                href: "/politicians",
                accent: "accent",
                features: ["Promise tracking", "Performance metrics", "Citizen ratings"]
              },
              {
                title: "Legislative Monitor",
                description: "Track bills, laws, and parliamentary activities in real-time",
                icon: FileText,
                href: "/legislation",
                accent: "primary",
                features: ["Bill tracking", "Voting records", "Impact analysis"]
              },
              {
                title: "Transparency Portal",
                description: "Real-time government transparency monitoring and public accountability",
                icon: Shield,
                href: "/transparency",
                accent: "secondary",
                features: ["Live monitoring", "Transparency scoring", "Public accountability"]
              },
              {
                title: "Jobs & Opportunities",
                description: "Connect talent with opportunities across Cameroon's growing economy",
                icon: Briefcase,
                href: "/jobs",
                accent: "accent",
                features: ["Job board", "Expert directory", "Company profiles"]
              },
              {
                title: "Interactive Village Map",
                description: "Explore villages across Cameroon with GPS mapping and community data",
                icon: MapPin,
                href: "/interactive-village-map",
                accent: "primary",
                features: ["GPS mapping", "Village profiles", "Community metrics"]
              },
              {
                title: "Weather & Agriculture",
                description: "Access real-time weather data and agricultural insights for farmers",
                icon: TrendingUp,
                href: "/weather-agriculture",
                accent: "secondary",
                features: ["Weather forecasts", "Crop insights", "Farming tips"]
              },
              {
                title: "Economic Opportunities",
                description: "Discover funding, business opportunities, and economic development",
                icon: Target,
                href: "/opportunity-tracker",
                accent: "accent",
                features: ["Business funding", "Investment opportunities", "Economic data"]
              },
              {
                title: "Educational Scholarships",
                description: "Find and apply for scholarships and educational opportunities",
                icon: GraduationCap,
                href: "/scholarship-portal",
                accent: "primary",
                features: ["Scholarship search", "Application tracking", "Education support"]
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-500 border-0 overflow-hidden">
                <CardContent className="p-8">
                  <div className={`w-14 h-14 rounded-xl bg-${feature.accent}/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-7 w-7 text-${feature.accent}`} />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground mb-6">{feature.description}</p>
                  
                  <div className="space-y-2 mb-8">
                    {feature.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
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

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold font-playfair mb-6">
              Voices of <span className="text-primary">Change</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Stories from citizens driving democratic transformation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <MessageCircle className="h-8 w-8 text-primary mb-4" />
                  <blockquote className="text-lg mb-6 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="border-t pt-4">
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    <div className="text-sm text-primary">{testimonial.location}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-primary via-accent to-secondary text-white border-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-black/20" />
            <CardContent className="relative p-16 text-center">
              <Award className="h-16 w-16 mx-auto mb-6 opacity-80" />
              <h2 className="text-4xl lg:text-5xl font-bold font-playfair mb-6">
                Join the Democratic Revolution
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
                Be part of the movement transforming civic engagement in Cameroon. 
                Your voice matters, your participation shapes the future of our democracy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary" className="px-8 py-4 text-lg bg-white text-primary hover:bg-white/90">
                  <Link to="/auth">
                    Get Started Today
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="px-8 py-4 text-lg border-white text-white hover:bg-white/10">
                  <Link to="/dashboard">
                    Explore Platform
                    <ExternalLink className="h-5 w-5 ml-2" />
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