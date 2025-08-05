import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  Vote,
  Users,
  MapPin,
  Building2,
  Heart,
  BookOpen,
  Shield,
  Star,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  Search,
  Play,
  ChevronRight
} from 'lucide-react';

export function HomePage() {
  const heroFeatures = [
    { 
      title: 'Politicians', 
      description: 'Comprehensive database of political figures',
      icon: Users, 
      link: '/politicians',
      count: '540+'
    },
    { 
      title: 'Political Parties', 
      description: 'Track party platforms and leadership',
      icon: Building2, 
      link: '/political-parties',
      count: '25+'
    },
    { 
      title: 'Villages', 
      description: 'Connect with your ancestral heritage',
      icon: MapPin, 
      link: '/villages',
      count: '2.8K+'
    },
    { 
      title: 'Civic Education', 
      description: 'Learn about democratic processes',
      icon: BookOpen, 
      link: '/civic-education',
      count: 'Free'
    }
  ];

  const platformStats = [
    { label: 'Active Citizens', value: '125K+', icon: Users },
    { label: 'Villages Mapped', value: '2.8K+', icon: MapPin },
    { label: 'Politicians Tracked', value: '540+', icon: Building2 },
    { label: 'Civic Discussions', value: '15K+', icon: MessageSquare }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">CamerPulse</h1>
                <p className="text-xs text-muted-foreground">Civic Engagement Platform</p>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/politicians" className="text-sm font-medium hover:text-primary transition-colors">
                Politicians
              </Link>
              <Link to="/political-parties" className="text-sm font-medium hover:text-primary transition-colors">
                Parties
              </Link>
              <Link to="/villages" className="text-sm font-medium hover:text-primary transition-colors">
                Villages
              </Link>
              <Link to="/civic-education" className="text-sm font-medium hover:text-primary transition-colors">
                Learn
              </Link>
            </nav>
            
            <Link to="/auth">
              <Button>
                <Shield className="h-4 w-4 mr-2" />
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-background to-primary/5">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="outline" className="mb-6 px-4 py-2">
              <Heart className="h-3 w-3 mr-2" />
              Empowering Democracy in Cameroon
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Transparent Politics.
              <span className="text-primary block">Engaged Citizens.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Your comprehensive platform for political transparency, civic engagement, 
              and community building across Cameroon.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/auth">
                <Button size="lg" className="px-8">
                  <Users className="h-5 w-5 mr-2" />
                  Join Platform
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8">
                <Play className="h-5 w-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Quick Search */}
            <Card className="max-w-2xl mx-auto shadow-lg">
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      placeholder="Search politicians, parties, or villages..."
                      className="w-full pl-10 pr-4 py-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <Button>Search</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Platform Stats */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {platformStats.map((stat, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <div className="text-2xl font-bold mb-1">{stat.value}</div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Main Features */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need for Civic Engagement
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Comprehensive tools for political transparency, community building, and democratic participation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {heroFeatures.map((feature, index) => (
                <Link key={index} to={feature.link}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                        <feature.icon className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                      <Badge variant="secondary">{feature.count}</Badge>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-muted-foreground mb-4">{feature.description}</p>
                      <div className="flex items-center justify-center text-primary group-hover:translate-x-2 transition-transform">
                        <span className="text-sm font-medium">Explore</span>
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of Cameroonians building a more transparent and accountable democracy
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="px-8">
                  <Users className="h-5 w-5 mr-2" />
                  Create Account
                </Button>
              </Link>
              <Button size="lg" variant="ghost" className="text-primary-foreground hover:bg-white/10 px-8">
                <BookOpen className="h-5 w-5 mr-2" />
                Learn More
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">CamerPulse</span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Empowering civic engagement and building transparent governance across Cameroon 
                through comprehensive political data and community connection.
              </p>
              <div className="flex gap-2">
                <Badge variant="outline">🇨🇲 Made in Cameroon</Badge>
                <Badge variant="outline">Open Democracy</Badge>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/politicians" className="hover:text-foreground transition-colors">Politicians</Link></li>
                <li><Link to="/political-parties" className="hover:text-foreground transition-colors">Political Parties</Link></li>
                <li><Link to="/villages" className="hover:text-foreground transition-colors">Villages</Link></li>
                <li><Link to="/civic-education" className="hover:text-foreground transition-colors">Education</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Join Platform</Link></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 CamerPulse. Building transparent democracy for Cameroon.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}