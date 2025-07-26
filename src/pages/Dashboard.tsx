import React from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Building2, 
  Calendar, 
  FileText, 
  Globe, 
  MapPin, 
  Music, 
  PieChart, 
  Users, 
  Vote,
  Briefcase,
  ShoppingBag,
  MessageCircle,
  Search,
  TrendingUp,
  Shield,
  Eye,
  Heart
} from 'lucide-react';

const Dashboard = () => {
  const quickLinks = [
    {
      category: "Civic Engagement",
      items: [
        { title: "Browse Polls", description: "Participate in community polls", href: "/polls", icon: Vote },
        { title: "Politicians", description: "Explore political figures", href: "/politicians", icon: Users },
        { title: "Senators", description: "Browse senate members", href: "/senators", icon: Users },
        { title: "Ministers", description: "Government ministers", href: "/ministers", icon: Users },
        { title: "MPs", description: "Member of Parliament", href: "/mps", icon: Users },
        { title: "Political Parties", description: "Explore party platforms", href: "/political-parties", icon: Users }
      ]
    },
    {
      category: "Transparency & Analytics",
      items: [
        { title: "Transparency Hub", description: "Government transparency dashboard", href: "/transparency", icon: Eye },
        { title: "National Debt", description: "Track national debt", href: "/national-debt-tracker", icon: TrendingUp },
        { title: "Billionaire Tracker", description: "Monitor wealth concentration", href: "/billionaire-tracker", icon: PieChart },
        { title: "Election Forecast", description: "Election predictions", href: "/election-forecast", icon: BarChart3 },
        { title: "Budget Explorer", description: "Government budget analysis", href: "/budget-explorer", icon: PieChart },
        { title: "Analytics", description: "Platform analytics", href: "/analytics", icon: BarChart3 }
      ]
    },
    {
      category: "Services & Directory",
      items: [
        { title: "Services Map", description: "Find services near you", href: "/services-map", icon: MapPin },
        { title: "Companies", description: "Business directory", href: "/company-directory", icon: Building2 },
        { title: "Schools", description: "Educational institutions", href: "/schools-directory", icon: Building2 },
        { title: "Hospitals", description: "Healthcare facilities", href: "/hospitals-directory", icon: Heart },
        { title: "Villages", description: "Community villages", href: "/villages-directory", icon: MapPin },
        { title: "Job Board", description: "Employment opportunities", href: "/jobs", icon: Briefcase }
      ]
    },
    {
      category: "Entertainment & Social",
      items: [
        { title: "CamerPlay", description: "Music platform", href: "/camerplay", icon: Music },
        { title: "Upload Music", description: "Share your music", href: "/camerplay/upload", icon: Music },
        { title: "Events", description: "Discover events", href: "/camerplay/events", icon: Calendar },
        { title: "Artist Portal", description: "For artists", href: "/artist-landing", icon: Music },
        { title: "Marketplace", description: "Buy and sell", href: "/marketplace", icon: ShoppingBag },
        { title: "Messenger", description: "Chat with others", href: "/messenger", icon: MessageCircle }
      ]
    }
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Platform Dashboard
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your central hub for civic engagement, transparency, and community services
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Vote className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">1,234</div>
                <div className="text-sm text-muted-foreground">Active Polls</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">567</div>
                <div className="text-sm text-muted-foreground">Politicians</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Building2 className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">2,890</div>
                <div className="text-sm text-muted-foreground">Services</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Music className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">45K</div>
                <div className="text-sm text-muted-foreground">Songs</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <div className="space-y-8">
            {quickLinks.map((category) => (
              <Card key={category.category} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    {category.category}
                  </CardTitle>
                  <CardDescription>
                    Explore {category.category.toLowerCase()} features and services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={item.href}
                          asChild
                          variant="ghost"
                          className="h-auto p-4 text-left justify-start hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all"
                        >
                          <Link to={item.href}>
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Icon className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-foreground mb-1">
                                  {item.title}
                                </div>
                                <div className="text-sm text-muted-foreground line-clamp-2">
                                  {item.description}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Featured Section */}
          <Card className="mt-12 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Stay Engaged</CardTitle>
              <CardDescription>
                Participate in your community and stay informed about government activities
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link to="/polls">
                  <Vote className="w-4 h-4 mr-2" />
                  Participate in Polls
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/transparency">
                  <Eye className="w-4 h-4 mr-2" />
                  Explore Transparency
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/camerplay">
                  <Music className="w-4 h-4 mr-2" />
                  Discover Music
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;