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
  Bell,
  Play
} from 'lucide-react';

export function CamerPulseHomePage() {
  const heroStats = [
    { label: 'Active Citizens', value: '125K+', icon: Users, color: 'text-blue-500' },
    { label: 'Villages Mapped', value: '2.8K+', icon: MapPin, color: 'text-green-500' },
    { label: 'Politicians Tracked', value: '540+', icon: Building2, color: 'text-purple-500' },
    { label: 'Civic Discussions', value: '15K+', icon: MessageSquare, color: 'text-orange-500' }
  ];

  const featuredSections = [
    {
      title: 'Political Directory',
      description: 'Comprehensive database of Cameroonian politicians, their backgrounds, and track records',
      icon: Users,
      link: '/politicians',
      gradient: 'from-blue-500 to-blue-600',
      stats: '540+ Politicians'
    },
    {
      title: 'Political Parties',
      description: 'Explore party platforms, leadership, and ideologies across the political spectrum',
      icon: Building2,
      link: '/political-parties',
      gradient: 'from-purple-500 to-purple-600',
      stats: '25+ Parties'
    },
    {
      title: 'Political Rankings',
      description: 'Data-driven rankings and performance metrics for transparency and accountability',
      icon: TrendingUp,
      link: '/political-rankings',
      gradient: 'from-green-500 to-green-600',
      stats: 'Live Rankings'
    },
    {
      title: 'Village Heritage',
      description: 'Connect with your ancestral village and preserve Cameroonian cultural heritage',
      icon: MapPin,
      link: '/villages',
      gradient: 'from-emerald-500 to-emerald-600',
      stats: '2.8K+ Villages'
    }
  ];

  const quickActions = [
    { title: 'Find Politicians', link: '/politicians', icon: Users },
    { title: 'Browse Parties', link: '/political-parties', icon: Building2 },
    { title: 'View Rankings', link: '/political-rankings', icon: Star },
    { title: 'Explore Villages', link: '/villages', icon: MapPin }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">CamerPulse</h1>
                <p className="text-xs text-muted-foreground">Civic Engagement Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                <Link to="/politicians">
                  <Button variant="ghost" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Politicians
                  </Button>
                </Link>
                <Link to="/political-parties">
                  <Button variant="ghost" size="sm">
                    <Building2 className="h-4 w-4 mr-2" />
                    Parties
                  </Button>
                </Link>
                <Link to="/villages">
                  <Button variant="ghost" size="sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    Villages
                  </Button>
                </Link>
              </div>
              <Link to="/auth">
                <Button>
                  <Shield className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center space-y-8 mb-16">
          <div className="space-y-6">
            <Badge variant="outline" className="px-4 py-2">
              <Heart className="h-3 w-3 mr-2" />
              Empowering Civic Engagement
            </Badge>
            
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
              Transparent Democracy
              <span className="text-primary block">for Cameroon</span>
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Access comprehensive political data, connect with your heritage, and participate 
              in building a more transparent democratic future for Cameroon.
            </p>
          </div>

          {/* Quick Search */}
          <div className="max-w-lg mx-auto">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      placeholder="Search politicians, parties, or villages..."
                      className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
                    />
                  </div>
                  <Button>Search</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {heroStats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured Sections */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Explore CamerPulse</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools for civic engagement, political transparency, and community building
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredSections.map((section, index) => (
              <Link key={index} to={section.link}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 group hover:scale-105 overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${section.gradient}`} />
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${section.gradient} text-white`}>
                        <section.icon className="h-6 w-6" />
                      </div>
                      <Badge variant="secondary">{section.stats}</Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{section.description}</p>
                    <div className="flex items-center text-primary group-hover:translate-x-2 transition-transform">
                      <span className="text-sm font-medium">Explore</span>
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Quick Access</CardTitle>
              <CardDescription className="text-lg">
                Jump directly to the information you need
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <Link key={index} to={action.link}>
                    <Button 
                      variant="outline" 
                      className="w-full h-16 flex flex-col gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <action.icon className="h-5 w-5" />
                      <span className="text-sm">{action.title}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <CardContent className="p-12">
              <div className="space-y-6">
                <h3 className="text-3xl font-bold">Join the Movement</h3>
                <p className="text-xl opacity-90 max-w-2xl mx-auto">
                  Be part of building a more transparent, accountable, and participatory democracy in Cameroon
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link to="/auth">
                    <Button size="lg" variant="secondary">
                      <Users className="h-5 w-5 mr-2" />
                      Create Account
                    </Button>
                  </Link>
                  <Button size="lg" variant="ghost" className="text-primary-foreground hover:bg-white/20">
                    <Play className="h-5 w-5 mr-2" />
                    Watch Demo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">CamerPulse</span>
              </div>
              <p className="text-muted-foreground mb-4">
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
                <li><Link to="/political-rankings" className="hover:text-foreground transition-colors">Rankings</Link></li>
                <li><Link to="/villages" className="hover:text-foreground transition-colors">Villages</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Join Platform</Link></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
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