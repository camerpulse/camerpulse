import React from 'react';
import { AppLayout } from "@/components/Layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { HeroSection } from "@/components/Homepage/HeroSection";
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
  MessageCircle,
  Eye,
  Activity,
  Flame,
  Database,
  Newspaper,
  Search,
  Bell,
  Award,
  Megaphone,
  ChevronRight,
  PlayCircle,
  Users2,
  TrendingDown,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

const Index = () => {
  const { user, profile, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };
  const featuredStats = [
    { label: "Active Citizens", value: "127K+", icon: Users, color: "text-primary" },
    { label: "Projects Funded", value: "340+", icon: Target, color: "text-accent" },
    { label: "Transparency Score", value: "94%", icon: CheckCircle, color: "text-secondary" },
    { label: "Total Impact", value: "$2.4M", icon: TrendingUp, color: "text-primary" }
  ];

  const coreFeatures = [
    {
      title: "Civic Polls & Voting",
      description: "Participate in democratic decision-making with secure, transparent polling",
      icon: Vote,
      href: "/polls",
      gradient: "from-primary to-primary-glow",
      features: ["Real-time results", "Fraud protection", "Anonymous voting"]
    },
    {
      title: "DiasporaConnect",
      description: "Empower diaspora engagement in national development projects",
      icon: Globe,
      href: "/diaspora-connect",
      gradient: "from-primary to-primary-glow",
      features: ["Investment tracking", "Virtual town halls", "Impact analytics"]
    },
    {
      title: "Legislative Tracker",
      description: "Monitor bills, laws, and parliamentary activities in real-time",
      icon: FileText,
      href: "/legislation",
      gradient: "from-accent to-accent",
      features: ["Bill tracking", "Voting records", "Impact analysis"]
    },
    {
      title: "Judiciary System",
      description: "Transparent judicial oversight, court tracking, and legal case monitoring",
      icon: Scale,
      href: "/judiciary",
      gradient: "from-cm-red to-red-600",
      features: ["Court transparency", "Judge ratings", "Case tracking"]
    },
    {
      title: "Politician Tracker",
      description: "Track performance, promises, and accountability of elected officials",
      icon: Users,
      href: "/politicians",
      gradient: "from-secondary to-accent",
      features: ["Promise tracking", "Performance metrics", "Citizen ratings"]
    },
    {
      title: "CamerPulse Jobs",
      description: "Connect talent with opportunities across Cameroon's job market",
      icon: Briefcase,
      href: "/jobs",
      gradient: "from-primary to-primary-glow",
      features: ["Job board", "Expert directory", "Company profiles"]
    }
  ];

  const platformStats = [
    { category: "Democracy", items: ["Politicians Tracked", "Polls Created", "Votes Cast"], count: "45K+" },
    { category: "Education", items: ["Schools Listed", "Universities", "Institutions"], count: "12K+" },
    { category: "Healthcare", items: ["Hospitals", "Clinics", "Pharmacies"], count: "8.5K+" },
    { category: "Business", items: ["Companies", "SMEs", "Startups"], count: "28K+" }
  ];

  return (
    <AppLayout>
      {/* User Info Bar */}
      {user && (
        <div className="bg-muted/30 border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">
                  Welcome back, {profile?.display_name || profile?.username || 'User'}!
                </span>
                <Link to={profile?.username ? `/profile/${profile.username}` : `/u/${user.id}`}>
                  <Button variant="outline" size="sm">View Profile</Button>
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <Link to="/notifications">
                  <Button variant="ghost" size="sm">
                    <Bell className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Hero Section */}
      <HeroSection />

      {/* Real-time Activity Feed Preview */}
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <Activity className="h-6 w-6 mr-2 text-primary" />
                Live Activity
              </h2>
              <p className="text-muted-foreground">What's happening across Cameroon right now</p>
            </div>
            <Link to="/civic-feed">
              <Button variant="outline">
                View All <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                type: "petition",
                title: "Support Youth Employment Initiative",
                activity: "1,247 signatures",
                icon: Megaphone,
                time: "2 hours ago",
                color: "text-accent"
              },
              {
                type: "poll", 
                title: "Should Cameroon invest more in renewable energy?",
                activity: "3,421 votes",
                icon: Vote,
                time: "4 hours ago",
                color: "text-primary"
              },
              {
                type: "transparency",
                title: "Ministry of Health budget transparency update",
                activity: "92% transparency score",
                icon: Shield,
                time: "6 hours ago",
                color: "text-secondary"
              }
            ].map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full bg-muted ${item.color}`}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm mb-1 line-clamp-2">{item.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{item.activity}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions Dashboard */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Take Action Today</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Make your voice heard and engage with your community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              {
                title: "Start a Petition",
                description: "Launch a campaign for change in your community",
                icon: Megaphone,
                href: "/petitions",
                gradient: "from-accent to-red-600",
                stats: "2,340 active petitions"
              },
              {
                title: "Create a Poll",
                description: "Get instant feedback on important issues",
                icon: Vote,
                href: "/polls",
                gradient: "from-primary to-primary-glow",
                stats: "15,670 polls created"
              },
              {
                title: "Track Politicians",
                description: "Monitor your representatives' performance",
                icon: Users,
                href: "/politicians",
                gradient: "from-secondary to-amber-600",
                stats: "1,200+ politicians tracked"
              },
              {
                title: "Explore Villages",
                description: "Connect with your heritage and community",
                icon: Crown,
                href: "/villages",
                gradient: "from-fons-royal to-fons-gold",
                stats: "2,800+ villages registered"
              },
              {
                title: "Find Your MP",
                description: "Connect with your Member of Parliament",
                icon: FileText,
                href: "/mps",
                gradient: "from-primary to-secondary",
                stats: "180 MPs in directory"
              },
              {
                title: "Join Discussions",
                description: "Participate in civic conversations",
                icon: MessageCircle,
                href: "/civic-feed",
                gradient: "from-accent to-secondary",
                stats: "5,230 daily discussions"
              }
            ].map((action, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{action.title}</h3>
                  <p className="text-muted-foreground mb-4">{action.description}</p>
                  <Badge variant="secondary" className="mb-4 text-xs">{action.stats}</Badge>
                  <Button asChild className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Link to={action.href}>
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Platform Features</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Advanced tools for democratic participation, transparency, and civic engagement
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
            {coreFeatures.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0">
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-6">
                    {feature.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary mr-2" />
                        {feat}
                      </div>
                    ))}
                  </div>
                  <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Link to={feature.href}>
                      Explore
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Platform Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformStats.map((stat, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-primary mb-2">{stat.count}</div>
                  <div className="text-lg font-semibold mb-2">{stat.category}</div>
                  <div className="space-y-1">
                    {stat.items.map((item, idx) => (
                      <div key={idx} className="text-sm text-muted-foreground">{item}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Directory Services */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Comprehensive Directories</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover and connect with institutions, services, and organizations across Cameroon
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Educational Institutions", icon: GraduationCap, href: "/schools", count: "12,000+", color: "text-directory-school" },
              { title: "Healthcare Facilities", icon: Heart, href: "/hospitals", count: "3,500+", color: "text-directory-hospital" },
              { title: "Business Directory", icon: Building, href: "/companies", count: "28,000+", color: "text-primary" },
              { title: "Government Services", icon: Shield, href: "/ministries", count: "450+", color: "text-accent" },
              { title: "Officials Directory", icon: Users, href: "/officials", count: "1,200+", color: "text-primary" },
              { title: "Judiciary System", icon: Scale, href: "/judiciary", count: "320+", color: "text-cm-red" },
              { title: "Traditional Villages", icon: Crown, href: "/villages", count: "2,800+", color: "text-directory-village" },
              { title: "Pharmacies & Health", icon: Pill, href: "/pharmacies", count: "1,200+", color: "text-directory-pharmacy" },
              { title: "Local Councils", icon: MapPin, href: "/councils", count: "360+", color: "text-primary" },
              { title: "Entertainment Hub", icon: Star, href: "/camerplay", count: "5,000+", color: "text-secondary" }
            ].map((directory, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <directory.icon className={`h-12 w-12 mx-auto mb-4 ${directory.color}`} />
                  <h3 className="font-semibold mb-2">{directory.title}</h3>
                  <Badge variant="secondary" className="mb-4">{directory.count}</Badge>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to={directory.href}>
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

      {/* Trending & Hot Topics */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 flex items-center justify-center">
              <Flame className="h-8 w-8 mr-3 text-accent" />
              Trending Now
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Hot topics and trending discussions across Cameroon
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "2024 Budget Allocation",
                engagements: "12.4K discussions",
                trend: "up",
                category: "Economy",
                icon: TrendingUp,
                color: "text-primary"
              },
              {
                title: "Youth Employment Crisis",
                engagements: "8.7K signatures",
                trend: "up",
                category: "Social",
                icon: Users2,
                color: "text-accent"
              },
              {
                title: "Educational Reform Bill",
                engagements: "6.2K votes",
                trend: "up",
                category: "Education",
                icon: GraduationCap,
                color: "text-secondary"
              },
              {
                title: "Infrastructure Development",
                engagements: "4.9K comments",
                trend: "down",
                category: "Development",
                icon: Building,
                color: "text-muted-foreground"
              }
            ].map((topic, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <topic.icon className={`h-6 w-6 ${topic.color}`} />
                    <Badge variant={topic.trend === 'up' ? 'default' : 'secondary'} className="text-xs">
                      {topic.trend === 'up' ? '↗️ Trending' : '↘️ Declining'}
                    </Badge>
                  </div>
                  <h3 className="font-semibold mb-2 line-clamp-2">{topic.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{topic.category}</p>
                  <p className="text-xs text-muted-foreground">{topic.engagements}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics & Intelligence */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Intelligence & Analytics</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Data-driven insights for informed decisions and transparent governance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Transparency Portal",
                description: "Real-time government transparency monitoring and scoring",
                icon: Shield,
                href: "/transparency",
                metrics: ["94% transparency score", "Live monitoring", "Public accountability"],
                highlight: "94%"
              },
              {
                title: "Election Forecasting",
                description: "AI-powered predictions and electoral analysis",
                icon: BarChart3,
                href: "/election-forecast",
                metrics: ["94% accuracy", "Real-time updates", "Regional breakdowns"],
                highlight: "94%"
              },
              {
                title: "Billionaire Tracker",
                description: "Transparency in wealth and economic influence",
                icon: Crown,
                href: "/billionaire-tracker",
                metrics: ["25+ tracked", "$2.4B+ monitored", "Transparency scoring"],
                highlight: "25+"
              },
              {
                title: "National Debt Monitor",
                description: "Real-time economic indicators and debt tracking",
                icon: TrendingDown,
                href: "/debt-tracker",
                metrics: ["Live updates", "Historical trends", "Impact analysis"],
                highlight: "Live"
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <feature.icon className="h-8 w-8 text-primary" />
                    <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                      {feature.highlight}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="text-sm">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-6">
                    {feature.metrics.map((metric, idx) => (
                      <div key={idx} className="flex items-center text-sm">
                        <CheckCircle2 className="h-3 w-3 text-primary mr-2" />
                        {metric}
                      </div>
                    ))}
                  </div>
                  <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Link to={feature.href}>
                      View Analytics
                      <BarChart3 className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories & Impact */}
      <section className="py-16 bg-gradient-patriotic relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/90"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
            Real Impact, Real Change
          </h2>
          <p className="text-xl mb-12 text-white/90 max-w-3xl mx-auto">
            See how CamerPulse is transforming civic engagement across Cameroon
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                metric: "127",
                label: "Petitions Successful",
                description: "Leading to policy changes",
                icon: Award
              },
              {
                metric: "2.4M",
                label: "Citizens Engaged",
                description: "Across all 10 regions",
                icon: Users2
              },
              {
                metric: "94%",
                label: "Transparency Improvement",
                description: "In government reporting",
                icon: TrendingUp
              }
            ].map((impact, index) => (
              <div key={index} className="text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <impact.icon className="h-12 w-12 text-white mx-auto mb-4" />
                  <div className="text-4xl font-bold text-white mb-2">{impact.metric}</div>
                  <div className="text-lg font-semibold text-white mb-2">{impact.label}</div>
                  <div className="text-sm text-white/80">{impact.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground border-0 shadow-2xl">
            <CardContent className="p-12 text-center">
              <PlayCircle className="h-16 w-16 mx-auto mb-6 text-white" />
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Join the Democratic Revolution
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Be part of the movement transforming civic engagement in Cameroon. 
                Your voice matters, your participation shapes the future.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary" className="px-8 py-4 text-lg shadow-lg">
                  <Link to="/auth">
                    Get Started Today
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-primary">
                  <Link to="/civic-feed">
                    Explore Platform
                    <Eye className="h-5 w-5 ml-2" />
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