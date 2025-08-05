import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MapPin, 
  Vote,
  Building2,
  Zap,
  Heart,
  Globe2,
  Shield,
  Star,
  TrendingUp,
  BookOpen,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  Eye,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const HeroSection = () => {
  const mainFeatures = [
    { 
      icon: Vote, 
      title: 'Civic Engagement', 
      desc: 'Participate in democracy through petitions, polls, and public discourse',
      color: 'bg-cm-green',
      link: '/civic-engagement'
    },
    { 
      icon: Users, 
      title: 'Political Transparency', 
      desc: 'Track politicians, parties, and government accountability in real-time',
      color: 'bg-cm-red',
      link: '/politicians'
    },
    { 
      icon: MapPin, 
      title: 'Village Heritage', 
      desc: 'Discover your roots and connect with your ancestral communities',
      color: 'bg-cm-yellow',
      link: '/villages'
    },
    { 
      icon: BookOpen, 
      title: 'Civic Education', 
      desc: 'Learn about your rights, constitution, and democratic processes',
      color: 'bg-primary',
      link: '/civic-education'
    }
  ];

  const platformStats = [
    { number: '2.5M+', label: 'Active Citizens', icon: Users },
    { number: '15.8K+', label: 'Villages Mapped', icon: MapPin },
    { number: '540+', label: 'Politicians Tracked', icon: Building2 },
    { number: '98.5%', label: 'Platform Uptime', icon: Activity }
  ];

  const trustIndicators = [
    { icon: Shield, label: 'Bank-Grade Security', desc: 'End-to-end encryption' },
    { icon: CheckCircle, label: 'Community Verified', desc: 'Crowd-sourced accuracy' },
    { icon: Globe2, label: 'Diaspora Ready', desc: 'Global Cameroonian access' }
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_hsl(var(--cm-green)/_0.1)_0%,_transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_hsl(var(--cm-red)/_0.1)_0%,_transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_80%,_hsl(var(--cm-yellow)/_0.1)_0%,_transparent_40%)]" />
      </div>

      <div className="relative z-10">
        {/* Main Hero */}
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-5xl mx-auto">
            {/* Platform Badge */}
            <Badge className="mb-8 bg-gradient-flag text-white border-0 px-6 py-2 text-sm font-medium animate-fade-in">
              <Star className="w-4 h-4 mr-2" />
              CamerPulse — Democratic Transparency Platform 🇨🇲
            </Badge>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="text-cm-green animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Transparent
              </span>
              {' '}
              <span className="text-cm-red animate-fade-in" style={{ animationDelay: '0.4s' }}>
                Democracy
              </span>
              <br />
              <span className="text-foreground animate-fade-in" style={{ animationDelay: '0.6s' }}>
                for All
              </span>
              {' '}
              <span className="text-cm-yellow animate-fade-in" style={{ animationDelay: '0.8s' }}>
                Cameroonians
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '1s' }}>
              Your comprehensive platform for civic engagement, political transparency, 
              and community connection. Track leaders, participate in democracy, and discover your heritage.
            </p>

            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in" style={{ animationDelay: '1.2s' }}>
              <Button asChild size="lg" className="bg-gradient-primary hover:shadow-green transition-all duration-300 px-8 py-4 text-lg">
                <Link to="/auth">
                  <Users className="w-5 h-5 mr-2" />
                  Join the Platform
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary hover:bg-primary/5 px-8 py-4 text-lg">
                <Link to="/villages">
                  <MapPin className="w-5 h-5 mr-2" />
                  Find Your Village
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="text-primary hover:bg-primary/10 px-8 py-4 text-lg">
                <Link to="/civic-education">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Learn Civics
                </Link>
              </Button>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {platformStats.map((stat, index) => (
                <Card key={index} className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                    <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">{stat.number}</div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Core Features Section */}
        <div className="bg-muted/20 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-6 px-4 py-2 border-primary/20 text-primary">
                <TrendingUp className="w-4 h-4 mr-2" />
                Platform Features
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
                Everything for Civic Participation
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Comprehensive tools for transparency, engagement, and community building
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {mainFeatures.map((feature, index) => (
                <Link key={index} to={feature.link} className="group block">
                  <Card className="h-full border-0 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-500 group-hover:-translate-y-2 overflow-hidden">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <CardHeader className="text-center pb-6 relative">
                        <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                          <feature.icon className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-xl mb-3 text-foreground group-hover:text-primary transition-colors">
                          {feature.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center px-6 pb-8">
                        <p className="text-muted-foreground mb-6 leading-relaxed">{feature.desc}</p>
                        <div className="flex items-center justify-center text-primary group-hover:translate-x-2 transition-transform duration-300">
                          <span className="text-sm font-medium">Explore</span>
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Trust & Security Section */}
        <div className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
                Built for Trust & Transparency
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Security, accuracy, and accessibility at the heart of our platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {trustIndicators.map((indicator, index) => (
                <Card key={index} className="text-center border-0 bg-card/30 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <indicator.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-foreground">{indicator.label}</h3>
                    <p className="text-muted-foreground">{indicator.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="bg-gradient-patriotic py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Ready to Shape Cameroon's Future?
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
              Join millions of Cameroonians building a more transparent, accountable, and connected democracy
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button asChild size="lg" variant="secondary" className="px-8 py-4 text-lg bg-white text-primary hover:bg-white/90 hover:shadow-xl transition-all duration-300">
                <Link to="/auth">
                  <Users className="w-5 h-5 mr-2" />
                  Create Free Account
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="px-8 py-4 text-lg text-white hover:bg-white/10 border border-white/20">
                <Link to="/politicians">
                  <Eye className="w-5 h-5 mr-2" />
                  Explore Platform
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};