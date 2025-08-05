import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Globe2,
  Users,
  MapPin,
  BookOpen,
  Building2,
  Vote,
  Shield,
  Heart,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  Activity,
  Eye,
  Star,
  Zap
} from 'lucide-react';

export function HomePage() {
  const features = [
    { 
      title: 'Civic Engagement', 
      description: 'Participate in democracy through petitions, polls, and public discourse',
      icon: Vote, 
      link: '/auth',
      count: 'Join Now',
      color: 'text-cm-green'
    },
    { 
      title: 'Political Transparency', 
      description: 'Track politicians, parties, and government accountability in real-time',
      icon: Users, 
      link: '/auth',
      count: '540+ Tracked',
      color: 'text-cm-red'
    },
    { 
      title: 'Village Heritage', 
      description: 'Discover your roots and connect with your ancestral communities',
      icon: MapPin, 
      link: '/auth',
      count: '15K+ Villages',
      color: 'text-cm-yellow'
    },
    { 
      title: 'Civic Education', 
      description: 'Learn about your rights, constitution, and democratic processes',
      icon: BookOpen, 
      link: '/auth',
      count: 'Free Access',
      color: 'text-primary'
    }
  ];

  const stats = [
    { label: 'Active Citizens', value: '2.5M+', icon: Users, color: 'text-cm-green' },
    { label: 'Villages Mapped', value: '15.8K+', icon: MapPin, color: 'text-cm-yellow' },
    { label: 'Politicians Tracked', value: '540+', icon: Building2, color: 'text-cm-red' },
    { label: 'Platform Uptime', value: '99.9%', icon: Activity, color: 'text-primary' }
  ];

  const benefits = [
    {
      title: 'Real-time Transparency',
      description: 'Live tracking of political activities, voting records, and policy changes',
      icon: Activity
    },
    {
      title: 'Community Verified',
      description: 'Information verified by citizens and backed by reliable sources',
      icon: CheckCircle
    },
    {
      title: 'Heritage Connection',
      description: 'Discover your village heritage and connect with your roots',
      icon: Heart
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-patriotic rounded-xl flex items-center justify-center">
                <Globe2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">CamerPulse</h1>
                <p className="text-xs text-muted-foreground">Democratic Transparency Platform</p>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <span className="text-sm text-muted-foreground">Transparency</span>
              <span className="text-sm text-muted-foreground">Heritage</span>
              <span className="text-sm text-muted-foreground">Education</span>
              <span className="text-sm text-muted-foreground">Democracy</span>
            </nav>
            
            <Link to="/auth">
              <Button className="bg-gradient-primary hover:shadow-lg transition-all duration-300">
                <Shield className="h-4 w-4 mr-2" />
                Join Platform
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_hsl(var(--cm-green)/_0.1)_0%,_transparent_40%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_hsl(var(--cm-red)/_0.1)_0%,_transparent_40%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_80%,_hsl(var(--cm-yellow)/_0.1)_0%,_transparent_40%)]" />
          </div>
          
          <div className="relative container mx-auto px-4">
            <div className="text-center max-w-5xl mx-auto">
              <Badge className="mb-8 bg-gradient-flag text-white border-0 px-6 py-3 text-sm font-medium">
                <Star className="w-4 h-4 mr-2" />
                CamerPulse — Democratic Transparency Platform 🇨🇲
              </Badge>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
                <span className="text-cm-green">Transparent</span>{' '}
                <span className="text-cm-red">Democracy</span>
                <br />
                <span className="text-foreground">for All</span>{' '}
                <span className="text-cm-yellow">Cameroonians</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
                Your comprehensive platform for civic engagement, political transparency, 
                and community connection. Track leaders, participate in democracy, and discover your heritage.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link to="/auth">
                  <Button size="lg" className="px-8 py-4 text-lg bg-gradient-primary hover:shadow-xl transition-all duration-300">
                    <Users className="h-5 w-5 mr-2" />
                    Join the Movement
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-primary/20 hover:bg-primary/5">
                    <Eye className="h-5 w-5 mr-2" />
                    Explore Platform
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <stat.icon className={`h-10 w-10 mx-auto mb-4 ${stat.color}`} />
                    <div className="text-3xl font-bold mb-2 text-foreground">{stat.value}</div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Main Features */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <Badge variant="outline" className="mb-6 px-4 py-2 border-primary/20 text-primary">
                <TrendingUp className="h-4 w-4 mr-2" />
                Platform Features
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                Everything for Civic Engagement
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Comprehensive tools for political transparency, community building, and democratic participation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Link key={index} to={feature.link} className="group">
                  <Card className="h-full hover:shadow-xl transition-all duration-500 group-hover:-translate-y-2 border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <CardHeader className="text-center pb-6 relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                          <feature.icon className={`h-10 w-10 ${feature.color}`} />
                        </div>
                        <CardTitle className="text-xl mb-3 text-foreground">{feature.title}</CardTitle>
                        <Badge variant="secondary" className="w-fit mx-auto">{feature.count}</Badge>
                      </CardHeader>
                      <CardContent className="text-center px-6 pb-8">
                        <p className="text-muted-foreground mb-6 leading-relaxed">{feature.description}</p>
                        <div className="flex items-center justify-center text-primary group-hover:translate-x-2 transition-transform duration-300">
                          <span className="text-sm font-medium">Get Started</span>
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                Why Choose CamerPulse?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Built by Cameroonians, for Cameroonians. Ensuring transparency and accountability in governance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <benefit.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-foreground">{benefit.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-patriotic" />
          <div className="relative container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
              Join millions of Cameroonians building a more transparent, accountable, and connected democracy
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="px-8 py-4 text-lg bg-white text-primary hover:bg-white/90 hover:shadow-xl transition-all duration-300">
                  <Users className="h-5 w-5 mr-2" />
                  Create Free Account
                </Button>
              </Link>
              <Button size="lg" variant="ghost" className="px-8 py-4 text-lg text-white hover:bg-white/10 border border-white/20">
                <BookOpen className="h-5 w-5 mr-2" />
                Learn More
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-patriotic rounded-xl flex items-center justify-center">
                  <Globe2 className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-xl text-foreground">CamerPulse</span>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
                Empowering civic engagement and building transparent governance across Cameroon 
                through comprehensive political data and community connection.
              </p>
              <div className="flex gap-3">
                <Badge variant="outline" className="border-primary/20">🇨🇲 Made in Cameroon</Badge>
                <Badge variant="outline" className="border-primary/20">Open Democracy</Badge>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-foreground">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/auth" className="text-muted-foreground hover:text-primary transition-colors">Join Platform</Link></li>
                <li><span className="text-muted-foreground">Political Transparency</span></li>
                <li><span className="text-muted-foreground">Village Heritage</span></li>
                <li><span className="text-muted-foreground">Civic Education</span></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-foreground">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/auth" className="text-muted-foreground hover:text-primary transition-colors">Login</Link></li>
                <li><span className="text-muted-foreground">Help Center</span></li>
                <li><span className="text-muted-foreground">Contact Us</span></li>
                <li><span className="text-muted-foreground">Privacy Policy</span></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-12 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              &copy; 2024 CamerPulse. Building transparent democracy for Cameroon.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}