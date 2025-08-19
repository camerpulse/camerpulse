import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Shield, 
  Vote, 
  Users, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Target,
  CheckCircle,
  Globe,
  Star,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress >= 1) {
        clearInterval(timer);
        setCount(end);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

const FloatingCard: React.FC<{ 
  children: React.ReactNode; 
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`transform transition-all duration-1000 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const EnhancedHeroSection: React.FC = () => {
  const { user } = useAuth();
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    { 
      icon: TrendingUp, 
      title: 'Live Sentiment Tracking', 
      desc: 'Real-time public opinion analysis across all 10 regions',
      color: 'from-primary to-primary-glow',
      stats: '2.5M+ tracked daily'
    },
    { 
      icon: Users, 
      title: 'Politician Accountability', 
      desc: 'Transparent performance tracking for all elected officials',
      color: 'from-accent to-red-600',
      stats: '1,200+ politicians monitored'
    },
    { 
      icon: Vote, 
      title: 'Democratic Participation', 
      desc: 'Secure polling and petition platform for civic engagement',
      color: 'from-secondary to-amber-600',
      stats: '180K+ votes cast weekly'
    },
    { 
      icon: Shield, 
      title: 'Transparency Intelligence', 
      desc: 'AI-powered government transparency monitoring and scoring',
      color: 'from-primary to-secondary',
      stats: '94% transparency improvement'
    }
  ];

  const stats = [
    { number: 2500000, label: 'Active Citizens', suffix: '+', icon: Users },
    { number: 180000, label: 'Daily Engagements', suffix: '+', icon: TrendingUp },
    { number: 95, label: 'Verified Accuracy', suffix: '%', icon: CheckCircle },
    { number: 24, label: 'Hour Monitoring', suffix: '/7', icon: Target }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 flex items-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="w-full h-full bg-[radial-gradient(circle_at_center,_hsl(var(--primary))_0%,_transparent_50%)]"></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center max-w-6xl mx-auto">
          {/* Enhanced Hero Badge */}
          <FloatingCard delay={200}>
            <Badge className="mb-8 bg-gradient-patriotic text-white border-0 px-6 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 cursor-default">
              <Star className="w-5 h-5 mr-2 animate-pulse" />
              CamerPulse — Powering Democratic Transparency 🇨🇲
            </Badge>
          </FloatingCard>

          {/* Main Headlines with Staggered Animation */}
          <div className="mb-8 space-y-4">
            <FloatingCard delay={400}>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-pulse">
                  Your Voice.
                </span>
              </h1>
            </FloatingCard>
            
            <FloatingCard delay={600}>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent animate-pulse" style={{ animationDelay: '1s' }}>
                  Your Power.
                </span>
              </h1>
            </FloatingCard>
            
            <FloatingCard delay={800}>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent animate-pulse" style={{ animationDelay: '2s' }}>
                  Your Future.
                </span>
              </h1>
            </FloatingCard>
          </div>

          {/* Enhanced Subtitle */}
          <FloatingCard delay={1000}>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
              The most advanced civic engagement platform in Africa. Real-time transparency tracking, 
              AI-powered insights, and democratic participation tools built for the digital age.
              <br className="hidden md:block" />
              <span className="text-primary font-semibold bg-primary/10 px-3 py-1 rounded-full mt-2 inline-block">
                🚀 Join 2.5M+ engaged citizens
              </span>
            </p>
          </FloatingCard>

          {/* Enhanced CTA Buttons */}
          <FloatingCard delay={1200}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-white px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <Link to={user ? "/civic-dashboard" : "/auth"}>
                  <Zap className="w-6 h-6 mr-3" />
                  {user ? "Open Dashboard" : "Start Your Journey"}
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="border-2 border-primary/30 hover:border-primary hover:bg-primary/5 backdrop-blur-sm px-10 py-4 text-lg font-semibold transition-all duration-300 hover:-translate-y-1"
              >
                <Link to="/transparency">
                  <Shield className="w-6 h-6 mr-3" />
                  Explore Transparency
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="ghost" 
                size="lg" 
                className="text-accent hover:bg-accent/10 px-10 py-4 text-lg font-semibold transition-all duration-300 hover:-translate-y-1"
              >
                <Link to="/polls">
                  <Vote className="w-6 h-6 mr-3" />
                  Join Polls
                </Link>
              </Button>
            </div>
          </FloatingCard>

          {/* Rotating Feature Showcase */}
          <FloatingCard delay={1400}>
            <div className="mb-16">
              <Card className="max-w-2xl mx-auto border-0 shadow-2xl bg-gradient-to-r from-card to-muted/50 backdrop-blur-lg">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${features[currentFeature].color} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <features[currentFeature].icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    {features[currentFeature].title}
                  </h3>
                  <p className="text-muted-foreground mb-4 text-lg">
                    {features[currentFeature].desc}
                  </p>
                  <Badge variant="secondary" className="text-sm font-semibold">
                    {features[currentFeature].stats}
                  </Badge>
                </CardContent>
              </Card>
              
              {/* Feature Indicators */}
              <div className="flex justify-center space-x-2 mt-6">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFeature(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentFeature 
                        ? 'bg-primary scale-125' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                    aria-label={`View feature ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </FloatingCard>

          {/* Enhanced Stats Grid */}
          <FloatingCard delay={1600}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-card to-muted/30 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <stat.icon className="h-10 w-10 mx-auto mb-3 text-primary" />
                    <div className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                      <AnimatedCounter end={stat.number} suffix={stat.suffix} />
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </FloatingCard>

          {/* Trust Indicators */}
          <FloatingCard delay={1800}>
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full backdrop-blur-sm">
                <Shield className="w-4 h-4 text-primary" />
                <span className="font-medium">End-to-End Encrypted</span>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full backdrop-blur-sm">
                <Globe className="w-4 h-4 text-secondary" />
                <span className="font-medium">Pan-African Network</span>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full backdrop-blur-sm">
                <Star className="w-4 h-4 text-accent" />
                <span className="font-medium">ISO 27001 Certified</span>
              </div>
            </div>
          </FloatingCard>
        </div>
      </div>
    </section>
  );
};