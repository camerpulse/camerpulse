import React from 'react';
import { Link } from 'react-router-dom';
import { PluginAwareLink } from '@/components/Plugin/PluginAwareLink';
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
  AlertTriangle,
  Shield,
  Star,
  TrendingUp,
  MessageSquare,
  Award,
  CheckCircle,
  ArrowRight,
  Search
} from 'lucide-react';

export function PublicHomePage() {
  const stats = [
    { label: 'Registered Citizens', value: '2.5M+', icon: Users },
    { label: 'Villages Mapped', value: '15K+', icon: MapPin },
    { label: 'Active Petitions', value: '1.2K+', icon: Vote },
    { label: 'Civic Discussions', value: '25K+', icon: MessageSquare }
  ];

  const features = [
    {
      title: 'Village Registry',
      description: 'Discover and connect with your ancestral village. Map your heritage and build community.',
      icon: MapPin,
      link: '/villages',
      color: 'bg-emerald-500'
    },
    {
      title: 'Civic Education',
      description: 'Learn about your rights, the constitution, and civic duties through interactive content.',
      icon: BookOpen,
      link: '/civic-education',
      color: 'bg-blue-500'
    },
    {
      title: 'Public Petitions',
      description: 'Create and support petitions for positive change in your community and country.',
      icon: Vote,
      link: '/petitions',
      color: 'bg-purple-500'
    },
    {
      title: 'Transparency Portal',
      description: 'Access government data, track public spending, and monitor civic accountability.',
      icon: Shield,
      link: '/transparency',
      color: 'bg-orange-500'
    }
  ];

  const recentNews = [
    {
      title: 'New Constitutional Education Program Launched',
      description: 'Interactive modules now available in English, French, and local languages',
      badge: 'Education',
      time: '2 hours ago'
    },
    {
      title: 'Village Heritage Project Expands',
      description: 'Over 500 new villages added to the cultural heritage database',
      badge: 'Villages',
      time: '5 hours ago'
    },
    {
      title: 'Transparency Initiative Update',
      description: 'New budget tracking tools provide real-time government spending insights',
      badge: 'Transparency',
      time: '1 day ago'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Globe className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">CamerPulse</h1>
                <p className="text-xs text-muted-foreground">Civic Engagement Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/villages">
                <Button variant="ghost">
                  <MapPin className="h-4 w-4 mr-2" />
                  Villages
                </Button>
              </Link>
              <Link to="/petitions">
                <Button variant="ghost">
                  <Vote className="h-4 w-4 mr-2" />
                  Petitions
                </Button>
              </Link>
              <PluginAwareLink pluginName="camer-logistics" to="/logistics">
                <Button variant="outline">
                  <Building2 className="h-4 w-4 mr-2" />
                  Logistics
                </Button>
              </PluginAwareLink>
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
              Empowering Civic Engagement in
              <span className="text-primary"> Cameroon</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with your heritage, participate in democracy, and build a transparent future. 
              Your voice matters in shaping our nation's destiny.
            </p>
          </div>

          {/* Quick Action Search */}
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Quick Access
              </CardTitle>
              <CardDescription>
                Find your village, search petitions, or explore civic content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Link to="/villages">
                  <Button variant="outline" className="w-full">
                    <MapPin className="h-4 w-4 mr-2" />
                    Find Village
                  </Button>
                </Link>
                <Link to="/petitions">
                  <Button variant="outline" className="w-full">
                    <Vote className="h-4 w-4 mr-2" />
                    Browse Petitions
                  </Button>
                </Link>
              </div>
              <Link to="/civic-education">
                <Button className="w-full">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Start Learning
                </Button>
              </Link>
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

        {/* Features Section */}
        <section className="mt-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Explore CamerPulse</h3>
            <p className="text-muted-foreground text-lg">Comprehensive tools for civic engagement and community building</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 group">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                  <Link to={feature.link}>
                    <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Explore
                      <ArrowRight className="h-3 w-3 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Recent Updates */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-3xl font-bold">Latest Updates</h3>
              <p className="text-muted-foreground">Stay informed about platform developments</p>
            </div>
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              View All News
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {recentNews.map((news, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {news.badge}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{news.time}</span>
                  </div>
                  <CardTitle className="text-lg leading-tight">{news.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{news.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Call-to-Action */}
        <section className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Join the Movement</CardTitle>
              <CardDescription className="text-lg">
                Be part of building a more transparent, engaged, and united Cameroon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                  <Heart className="h-8 w-8 text-red-500" />
                  <div className="text-left">
                    <p className="font-medium">Connect</p>
                    <p className="text-sm text-muted-foreground">Find your roots</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                  <Vote className="h-8 w-8 text-blue-500" />
                  <div className="text-left">
                    <p className="font-medium">Participate</p>
                    <p className="text-sm text-muted-foreground">Make your voice heard</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                  <Shield className="h-8 w-8 text-green-500" />
                  <div className="text-left">
                    <p className="font-medium">Protect</p>
                    <p className="text-sm text-muted-foreground">Ensure transparency</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Link to="/auth">
                  <Button size="lg" className="w-full md:w-auto mr-4">
                    <Users className="h-4 w-4 mr-2" />
                    Get Started Today
                  </Button>
                </Link>
                <Link to="/civic-education">
                  <Button variant="outline" size="lg" className="w-full md:w-auto">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Learn More
                  </Button>
                </Link>
              </div>
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
                <Globe className="h-6 w-6 text-primary" />
                <span className="font-bold">CamerPulse</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering civic engagement and building transparent governance across Cameroon.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-3">Civic Tools</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/villages" className="hover:text-foreground">Village Registry</Link></li>
                <li><Link to="/petitions" className="hover:text-foreground">Petitions</Link></li>
                <li><Link to="/civic-education" className="hover:text-foreground">Civic Education</Link></li>
                <li><Link to="/transparency" className="hover:text-foreground">Transparency Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><PluginAwareLink pluginName="camer-logistics" to="/logistics" className="hover:text-foreground">Logistics Platform</PluginAwareLink></li>
                <li><Link to="/jobs" className="hover:text-foreground">Job Portal</Link></li>
                <li><Link to="/directory" className="hover:text-foreground">Services Directory</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/auth" className="hover:text-foreground">Login</Link></li>
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 CamerPulse. Uniting Cameroon through civic engagement.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}