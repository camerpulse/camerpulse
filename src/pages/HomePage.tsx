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
  ChevronRight,
  Star,
  CheckCircle,
  Activity,
  Eye
} from 'lucide-react';

export function HomePage() {
  const features = [
    { 
      title: 'Politicians', 
      description: 'Complete profiles, track records, and transparency scores',
      icon: Users, 
      link: '/politicians',
      count: '540+',
      color: 'text-primary'
    },
    { 
      title: 'Political Parties', 
      description: 'Party manifestos, leadership, and policy positions',
      icon: Building2, 
      link: '/political-parties',
      count: '25+',
      color: 'text-accent'
    },
    { 
      title: 'Villages & Communities', 
      description: 'Connect with your roots and local governance',
      icon: MapPin, 
      link: '/villages',
      count: '2.8K+',
      color: 'text-secondary'
    },
    { 
      title: 'Civic Education', 
      description: 'Learn about democracy, rights, and civic duties',
      icon: BookOpen, 
      link: '/civic-education',
      count: 'Free',
      color: 'text-cm-green'
    }
  ];

  const stats = [
    { label: 'Active Citizens', value: '125K+', icon: Users, color: 'text-primary' },
    { label: 'Villages Mapped', value: '2.8K+', icon: MapPin, color: 'text-secondary' },
    { label: 'Politicians Tracked', value: '540+', icon: Building2, color: 'text-accent' },
    { label: 'Transparency Reports', value: '15K+', icon: Eye, color: 'text-cm-green' }
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
      title: 'Civic Empowerment',
      description: 'Tools and education to actively participate in democratic processes',
      icon: Vote
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-patriotic rounded-xl flex items-center justify-center">
                <Globe2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">CamerPulse</h1>
                <p className="text-xs text-muted-foreground">Civic Transparency Platform</p>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/politicians" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Politicians
              </Link>
              <Link to="/political-parties" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Parties
              </Link>
              <Link to="/villages" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Villages
              </Link>
              <Link to="/civic-education" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Learn
              </Link>
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
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5" />
          <div className="relative container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <Badge variant="outline" className="mb-8 px-6 py-2 border-primary/20 text-primary">
                <Heart className="h-4 w-4 mr-2" />
                Empowering Democracy in Cameroon
              </Badge>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
                <span className="text-gradient-patriotic">Transparent</span>
                <br />
                <span className="text-foreground">Governance</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                Your comprehensive platform for political transparency, civic engagement, 
                and democratic participation across Cameroon.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link to="/auth">
                  <Button size="lg" className="px-8 py-4 text-lg bg-gradient-primary hover:shadow-xl transition-all duration-300">
                    <Users className="h-5 w-5 mr-2" />
                    Join the Movement
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-primary/20 hover:bg-primary/5">
                  <Eye className="h-5 w-5 mr-2" />
                  Explore Platform
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-muted/30">
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
                          <span className="text-sm font-medium">Explore</span>
                          <ChevronRight className="h-4 w-4 ml-1" />
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
        <section className="py-24 bg-muted/30">
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

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-patriotic" />
          <div className="relative container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
              Join thousands of Cameroonians building a more transparent and accountable democracy
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="px-8 py-4 text-lg bg-white text-primary hover:bg-white/90 hover:shadow-xl transition-all duration-300">
                  <Users className="h-5 w-5 mr-2" />
                  Create Account
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

      {/* Modern Footer */}
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
                <li><Link to="/politicians" className="text-muted-foreground hover:text-primary transition-colors">Politicians</Link></li>
                <li><Link to="/political-parties" className="text-muted-foreground hover:text-primary transition-colors">Political Parties</Link></li>
                <li><Link to="/villages" className="text-muted-foreground hover:text-primary transition-colors">Villages</Link></li>
                <li><Link to="/civic-education" className="text-muted-foreground hover:text-primary transition-colors">Education</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-foreground">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/auth" className="text-muted-foreground hover:text-primary transition-colors">Join Platform</Link></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
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