
import React from 'react';
import { HeroSection } from '@/components/Homepage/HeroSection';
import { VillagesHeroSection } from '@/components/villages/VillagesHeroSection';
import { VillageStatsCounter } from '@/components/villages/VillageStatsCounter';
import { VillageSpotlight } from '@/components/villages/VillageSpotlight';
import { VillageFeed } from '@/components/villages/VillageFeed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  MessageCircle,
  Vote,
  Building,
  GraduationCap,
  MapPin,
  Heart,
  Scale,
  FileText,
  BarChart3,
  Globe,
  Calendar,
  Shield
} from 'lucide-react';

const CamerPulseHome = () => {
  const platformFeatures = [
    {
      icon: Vote,
      title: "Polls & Voting",
      description: "Participate in democratic processes and civic polls",
      href: "/polls",
      color: "bg-blue-500"
    },
    {
      icon: Users,
      title: "Politicians",
      description: "Track and rate your political representatives",
      href: "/politicians",
      color: "bg-green-500"
    },
    {
      icon: Building,
      title: "Government Tenders",
      description: "Transparent government procurement platform",
      href: "/tenders",
      color: "bg-purple-500"
    },
    {
      icon: Scale,
      title: "Judiciary",
      description: "Judicial transparency and court proceedings",
      href: "/judiciary",
      color: "bg-amber-500"
    },
    {
      icon: FileText,
      title: "Legislation",
      description: "Track bills and legislative processes",
      href: "/legislation",
      color: "bg-red-500"
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Data insights and civic analytics",
      href: "/analytics",
      color: "bg-indigo-500"
    },
    {
      icon: GraduationCap,
      title: "Schools",
      description: "Educational institutions directory",
      href: "/schools",
      color: "bg-orange-500"
    },
    {
      icon: Heart,
      title: "Healthcare",
      description: "Hospitals and medical services",
      href: "/hospitals",
      color: "bg-pink-500"
    },
    {
      icon: Globe,
      title: "Diaspora Connect",
      description: "Connect with Cameroonians worldwide",
      href: "/diaspora-connect",
      color: "bg-cyan-500"
    }
  ];

  const quickStats = [
    { label: "Active Citizens", value: "50K+", icon: Users },
    { label: "Civic Discussions", value: "15K+", icon: MessageCircle },
    { label: "Government Transparency", value: "95%", icon: Shield },
    { label: "Democratic Participation", value: "78%", icon: Vote }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Platform Features Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">CamerPulse Platform Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your comprehensive civic engagement platform for democratic participation and transparency
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${feature.color}`}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <Button asChild className="w-full">
                    <Link to={feature.href}>
                      Access {feature.title}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {quickStats.map((stat, index) => (
              <div key={index} className="text-center text-white">
                <div className="flex justify-center mb-2">
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Villages Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">🏘️ Village Intelligence</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every Cameroonian is born from a village. Explore the roots of our democracy.
            </p>
          </div>
          
          <div className="space-y-8">
            <VillageStatsCounter />
            <VillageSpotlight />
            <VillageFeed />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join the Democratic Revolution
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Be part of building a transparent, accountable, and participatory democracy in Cameroon.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link to="/auth">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CamerPulseHome;
