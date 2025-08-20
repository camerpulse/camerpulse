import React, { useEffect, Suspense, memo } from 'react';
import { AppLayout } from "@/components/Layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Helmet } from 'react-helmet-async';
import { performanceMonitor } from "@/utils/performance";
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
  CheckCircle2,
  Rocket,
  Lightbulb,
  Coffee
} from "lucide-react";

/**
 * Lazy load heavy components for better performance
 */
const EnhancedHeroSection = React.lazy(() => 
  import("@/components/Homepage/EnhancedHeroSection").then(module => ({
    default: module.EnhancedHeroSection
  }))
);

const LiveActivityFeed = React.lazy(() => 
  import("@/components/Homepage/LiveActivityFeed").then(module => ({
    default: module.LiveActivityFeed
  }))
);

const TrendingTopics = React.lazy(() => 
  import("@/components/Homepage/TrendingTopics").then(module => ({
    default: module.TrendingTopics
  }))
);

/**
 * Loading component for lazy-loaded sections
 */
const SectionLoader = memo(() => (
  <div className="flex items-center justify-center py-20 bg-gradient-to-br from-background to-muted/30">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading content...</p>
    </div>
  </div>
));

/**
 * Memoized User Welcome Bar Component
 */
const UserWelcomeBar = memo(({ user, profile, onSignOut }: {
  user: any;
  profile: any;
  onSignOut: () => void;
}) => (
  <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-primary/10">
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground">
                Welcome back, {profile?.display_name || profile?.username || 'Citizen'}! 🇨🇲
              </span>
              <p className="text-xs text-muted-foreground">
                Ready to make your voice heard today?
              </p>
            </div>
          </div>
          <Link 
            to={profile?.username ? `/profile/${profile.username}` : `/u/${user.id}`}
            className="inline-block"
          >
            <Button variant="outline" size="sm" className="border-primary/30 hover:border-primary">
              <Eye className="h-4 w-4 mr-2" />
              View Profile
            </Button>
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/notifications" className="inline-block">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full text-xs"></span>
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onSignOut} 
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  </div>
));

/**
 * Memoized Quick Action Cards Component
 */
const QuickActionCards = memo(() => {
  const quickActions = [
    {
      title: "Start a Petition",
      description: "Launch a campaign for change in your community",
      icon: Megaphone,
      href: "/petitions",
      gradient: "from-accent via-red-500 to-red-600",
      stats: "2,340 active petitions",
      highlight: "Most Impact",
      features: ["Free to start", "Legal support", "Media coverage"]
    },
    {
      title: "Create a Poll",
      description: "Get instant feedback on important issues",
      icon: Vote,
      href: "/polls",
      gradient: "from-primary via-green-500 to-primary-glow",
      stats: "15,670 polls created",
      highlight: "Quick Results",
      features: ["Real-time results", "Anonymous voting", "Data insights"]
    },
    {
      title: "Track Politicians",
      description: "Monitor your representatives' performance",
      icon: Users,
      href: "/politicians",
      gradient: "from-secondary via-yellow-500 to-amber-600",
      stats: "1,200+ politicians tracked",
      highlight: "Full Transparency",
      features: ["Promise tracking", "Performance scores", "Contact info"]
    },
    {
      title: "Explore Villages",
      description: "Connect with your heritage and community",
      icon: Crown,
      href: "/villages",
      gradient: "from-fons-royal via-fons-gold to-fons-heritage",
      stats: "2,800+ villages registered",
      highlight: "Cultural Heritage",
      features: ["Family trees", "Cultural events", "Local projects"]
    },
    {
      title: "Find Your MP",
      description: "Connect with your Member of Parliament",
      icon: FileText,
      href: "/mps",
      gradient: "from-primary via-blue-500 to-secondary",
      stats: "180 MPs in directory",
      highlight: "Direct Access",
      features: ["Contact details", "Voting records", "Office hours"]
    },
    {
      title: "Join Discussions",
      description: "Participate in civic conversations",
      icon: MessageCircle,
      href: "/civic-feed",
      gradient: "from-accent via-purple-500 to-secondary",
      stats: "5,230 daily discussions",
      highlight: "Community Voice",
      features: ["Expert moderation", "Fact-checked info", "Regional focus"]
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Take Action Today
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Every action you take strengthens our democracy and builds a better Cameroon
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-0 bg-gradient-to-br from-card to-muted/30 backdrop-blur-sm overflow-hidden relative"
            >
              {/* Highlight Badge */}
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-gradient-to-r from-white to-white/90 text-primary text-xs font-bold shadow-lg">
                  {action.highlight}
                </Badge>
              </div>

              <CardContent className="p-8 relative">
                {/* Gradient Background Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${action.gradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg`}>
                    <action.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4 text-base leading-relaxed">
                    {action.description}
                  </p>

                  {/* Features List */}
                  <div className="space-y-2 mb-6">
                    {action.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <Badge variant="secondary" className="mb-6 text-sm font-semibold">
                    📊 {action.stats}
                  </Badge>
                  
                  <Button 
                    asChild 
                    className={`w-full bg-gradient-to-r ${action.gradient} hover:shadow-lg group-hover:shadow-xl text-white border-0 font-semibold py-3 transition-all duration-300`}
                  >
                    <Link to={action.href}>
                      Get Started
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
});

/**
 * Memoized Core Features Component
 */
const CoreFeatures = memo(() => {
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

  return (
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
      </div>
    </section>
  );
});

/**
 * Enhanced Homepage Index Component
 * Production-ready with performance optimizations, SEO, and security enhancements
 */
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

  const platformStats = [
    { category: "Democracy", items: ["Politicians Tracked", "Polls Created", "Votes Cast"], count: "45K+" },
    { category: "Education", items: ["Schools Listed", "Universities", "Institutions"], count: "12K+" },
    { category: "Healthcare", items: ["Hospitals", "Clinics", "Pharmacies"], count: "8.5K+" },
    { category: "Business", items: ["Companies", "SMEs", "Startups"], count: "28K+" }
  ];

  // Performance optimization: Preload critical resources
  useEffect(() => {
    const startTime = performance.now();
    
    // Preload key routes that users are likely to visit
    const criticalRoutes = ['/civic-feed', '/polls', '/politicians', '/transparency'];
    criticalRoutes.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });

    // Track page load performance
    const endTime = performance.now();
    performanceMonitor.track('homepage_render_time', endTime - startTime);
    
    // Mark page as interactive
    performanceMonitor.track('homepage_interactive', performance.now());
  }, []);

  return (
    <>
      {/* Enhanced SEO Optimization */}
      <Helmet prioritizeSeoTags>
        <title>CamerPulse - The Future of Civic Engagement in Cameroon | Democratic Transparency Platform</title>
        <meta 
          name="description" 
          content="Join 2.5M+ citizens on Africa's most advanced civic engagement platform. Track politicians, participate in polls, monitor transparency, and shape Cameroon's democratic future. Real-time civic intelligence for democratic participation." 
        />
        <meta name="keywords" content="Cameroon democracy, civic engagement, political transparency, voting platform, government accountability, African politics, CamerPulse, democratic participation, political tracking, civic platform" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://camerpulse.com/" />
        <meta property="og:title" content="CamerPulse - Democratic Transparency Platform for Cameroon" />
        <meta property="og:description" content="Real-time civic intelligence, verified commerce, and transparent leadership tracking for Cameroon. Join the democratic revolution transforming civic engagement." />
        <meta property="og:image" content="https://camerpulse.com/og-image-homepage.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_CM" />
        <meta property="og:site_name" content="CamerPulse" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://camerpulse.com/" />
        <meta name="twitter:title" content="CamerPulse - The Future of Civic Engagement in Cameroon" />
        <meta name="twitter:description" content="Join the democratic revolution transforming civic engagement in Cameroon. Track politicians, participate in polls, and shape your future." />
        <meta name="twitter:image" content="https://camerpulse.com/twitter-image-homepage.jpg" />
        <meta name="twitter:creator" content="@camerpulse" />
        <meta name="twitter:site" content="@camerpulse" />
        
        {/* Additional SEO */}
        <link rel="canonical" href="https://camerpulse.com/" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="author" content="CamerPulse Team" />
        <meta name="publisher" content="CamerPulse" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Geo tagging */}
        <meta name="geo.region" content="CM" />
        <meta name="geo.country" content="Cameroon" />
        <meta name="geo.placename" content="Cameroon" />
        
        {/* Enhanced Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "CamerPulse",
            "alternateName": "CamerPulse Civic Platform",
            "description": "Africa's leading civic engagement and transparency platform empowering democratic participation in Cameroon",
            "url": "https://camerpulse.com",
            "logo": {
              "@type": "ImageObject",
              "url": "https://camerpulse.com/logo.png",
              "width": 512,
              "height": 512
            },
            "foundingDate": "2024",
            "foundingLocation": {
              "@type": "Place",
              "name": "Cameroon"
            },
            "areaServed": {
              "@type": "Country",
              "name": "Cameroon"
            },
            "sameAs": [
              "https://twitter.com/camerpulse",
              "https://facebook.com/camerpulse",
              "https://linkedin.com/company/camerpulse"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "availableLanguage": ["English", "French"]
            },
            "offers": {
              "@type": "Offer",
              "category": "Civic Engagement Platform",
              "availability": "https://schema.org/InStock",
              "price": "0",
              "priceCurrency": "XAF"
            }
          })}
        </script>
        
        {/* WebSite structured data for search */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "CamerPulse",
            "url": "https://camerpulse.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://camerpulse.com/search?q={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>

      <AppLayout>
        {/* User Welcome Bar */}
        {user && !loading && (
          <UserWelcomeBar 
            user={user} 
            profile={profile} 
            onSignOut={handleSignOut}
          />
        )}

        {/* Enhanced Hero Section */}
        <Suspense fallback={<SectionLoader />}>
          <EnhancedHeroSection />
        </Suspense>

        {/* Live Activity Feed */}
        <Suspense fallback={<SectionLoader />}>
          <LiveActivityFeed />
        </Suspense>

        {/* Trending Topics */}
        <Suspense fallback={<SectionLoader />}>
          <TrendingTopics />
        </Suspense>

        {/* Interactive Quick Actions */}
        <QuickActionCards />

        {/* Core Features */}
        <CoreFeatures />

        {/* Platform Statistics */}
        <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Platform Impact</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Real numbers from real engagement across Cameroon
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {featuredStats.map((stat, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <stat.icon className={`h-10 w-10 mx-auto mb-3 ${stat.color}`} />
                    <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                    <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {platformStats.map((stat, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="text-4xl font-bold text-primary mb-2">{stat.count}</div>
                    <div className="font-semibold text-foreground mb-2">{stat.category}</div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      {stat.items.map((item, idx) => (
                        <div key={idx}>{item}</div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20 bg-gradient-patriotic text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Ready to Shape Cameroon's Future?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join millions of engaged citizens building a more transparent, accountable, and democratic Cameroon
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90 px-8 py-4 text-lg font-semibold shadow-lg"
                >
                  <Link to={user ? "/civic-dashboard" : "/auth"}>
                    <Rocket className="h-6 w-6 mr-3" />
                    {user ? "Go to Dashboard" : "Join CamerPulse"}
                  </Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg" 
                  className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
                >
                  <Link to="/about">
                    <Lightbulb className="h-6 w-6 mr-3" />
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </AppLayout>
    </>
  );
};

export default Index;