import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  Users,
  MapPin,
  Building2,
  TrendingUp,
  Heart,
  Star,
  Award,
  Shield,
  Vote,
  FileText,
  Search,
  ArrowRight,
  Globe,
  Zap,
  Eye,
  BarChart3,
  MessageSquare,
  Calendar,
  BookOpen,
  Briefcase
} from 'lucide-react';

const CamerPulseHome: React.FC = () => {
  const platformFeatures = [
    {
      title: "Villages Directory",
      description: "Connect with your roots. Every Cameroonian comes from a village.",
      icon: Users,
      href: "/villages",
      color: "bg-gradient-to-br from-primary to-primary-glow",
      stats: "15,000+ Villages"
    },
    {
      title: "Government Tenders",
      description: "Transparent public procurement for economic empowerment.",
      icon: FileText,
      href: "/tenders",
      color: "bg-gradient-to-br from-secondary to-secondary/80",
      stats: "2,500+ Active"
    },
    {
      title: "Job Opportunities",
      description: "Professional growth and career advancement in Cameroon.",
      icon: Briefcase,
      href: "/jobs",
      color: "bg-gradient-to-br from-accent to-accent/80",
      stats: "8,200+ Positions"
    },
    {
      title: "Civic Engagement",
      description: "Rate leaders, track promises, and shape governance.",
      icon: Vote,
      href: "/civic-reputation",
      color: "bg-gradient-to-br from-primary to-accent",
      stats: "Active Democracy"
    }
  ];

  const stats = [
    { label: "Active Citizens", value: "250K+", icon: Users },
    { label: "Villages Connected", value: "15K+", icon: MapPin },
    { label: "Institutions Rated", value: "5.2K+", icon: Building2 },
    { label: "Civic Actions", value: "1.8M+", icon: TrendingUp }
  ];

  const recentActivities = [
    { type: "tender", title: "Road Construction Project - Douala", time: "2 hours ago", icon: FileText },
    { type: "civic", title: "New Mayor Rating - Yaoundé 3rd", time: "4 hours ago", icon: Vote },
    { type: "job", title: "Software Engineer Position - Kribi", time: "1 day ago", icon: Briefcase },
    { type: "village", title: "Bamenda Village Profile Updated", time: "2 days ago", icon: Users }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center bg-gradient-patriotic overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 container mx-auto max-w-6xl">
          <Badge className="mb-6 bg-white/20 text-white border-white/30" variant="outline">
            🇨🇲 Powering Cameroon's Digital Democracy
          </Badge>
          
          <h1 className="text-4xl md:text-7xl font-bold mb-8 text-white leading-tight">
            Where Every Voice
            <span className="block text-gradient-patriotic bg-white text-transparent bg-clip-text">
              Shapes Our Future
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-4xl mx-auto leading-relaxed">
            CamerPulse connects citizens, empowers communities, and transforms governance through 
            transparency, participation, and collective action. From village roots to national impact.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
            <Link to="/villages" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <Heart className="w-5 h-5 mr-2" />
                Find Your Village
              </Button>
            </Link>
            <Link to="/civic-reputation" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full">
                <Vote className="w-5 h-5 mr-2" />
                Rate Leaders
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-secondary/20 rounded-full blur-2xl animate-pulse delay-1000" />
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Your Civic Engagement Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Four interconnected pillars supporting democracy, transparency, 
              and community development across Cameroon.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {platformFeatures.map((feature, index) => (
              <Link key={index} to={feature.href} className="group">
                <Card className="h-full hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 border-2 hover:border-primary/20">
                  <CardHeader className="pb-4">
                    <div className={`w-16 h-16 rounded-xl ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl">{feature.title}</CardTitle>
                      <Badge variant="secondary">{feature.stats}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed mb-4">
                      {feature.description}
                    </CardDescription>
                    <Button variant="ghost" className="p-0 h-auto group-hover:text-primary">
                      Explore <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-foreground">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                To strengthen Cameroon's democracy through digital innovation, connecting citizens 
                to their roots while empowering them to shape their future. We believe every voice 
                matters, every village has value, and every citizen deserves transparency.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-primary flex-shrink-0" />
                  <span className="text-foreground">Transparency in governance and public spending</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-primary flex-shrink-0" />
                  <span className="text-foreground">Community empowerment and civic participation</span>
                </div>
                <div className="flex items-center gap-3">
                  <Heart className="h-6 w-6 text-primary flex-shrink-0" />
                  <span className="text-foreground">Preserving cultural heritage and village identity</span>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-primary flex-shrink-0" />
                  <span className="text-foreground">Economic opportunities for all Cameroonians</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="text-center bg-primary text-primary-foreground">
                <CardContent className="p-6">
                  <Eye className="h-8 w-8 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Transparency</h3>
                  <p className="text-sm opacity-90">Open data and accountable governance</p>
                </CardContent>
              </Card>
              <Card className="text-center bg-secondary text-secondary-foreground">
                <CardContent className="p-6">
                  <Vote className="h-8 w-8 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Participation</h3>
                  <p className="text-sm opacity-90">Every citizen has a voice and a vote</p>
                </CardContent>
              </Card>
              <Card className="text-center bg-accent text-accent-foreground">
                <CardContent className="p-6">
                  <Users className="h-8 w-8 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Community</h3>
                  <p className="text-sm opacity-90">Strength through unity and collaboration</p>
                </CardContent>
              </Card>
              <Card className="text-center bg-muted text-muted-foreground">
                <CardContent className="p-6">
                  <Zap className="h-8 w-8 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Innovation</h3>
                  <p className="text-sm">Technology serving the people</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity Feed */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Platform Activity</h2>
            <p className="text-muted-foreground">Real-time updates from across the CamerPulse ecosystem</p>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <activity.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">{activity.type}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link to="/activity">
              <Button variant="outline">
                View All Activity <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Make Your Voice Heard?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of Cameroonians already building a more transparent and participatory democracy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="min-w-[200px]">
                <Users className="w-5 h-5 mr-2" />
                Join CamerPulse
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="min-w-[200px] text-white border-white/30 hover:bg-white/10">
                <BookOpen className="w-5 h-5 mr-2" />
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CamerPulseHome;