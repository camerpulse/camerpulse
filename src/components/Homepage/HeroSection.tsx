import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  MessageCircle, 
  ShoppingBag, 
  Shield, 
  Globe,
  Star,
  Heart,
  Zap
} from 'lucide-react';

export const HeroSection = () => {
  const features = [
    { 
      icon: TrendingUp, 
      title: 'Live Sentiment', 
      title_fr: 'Sentiment en Direct',
      desc: 'Track public opinion in real-time',
      color: 'bg-cm-green'
    },
    { 
      icon: Users, 
      title: 'Politician Ratings', 
      title_fr: 'Notes Politiciens',
      desc: 'Transparent approval tracking',
      color: 'bg-cm-red'
    },
    { 
      icon: MessageCircle, 
      title: 'Pulse Feed', 
      title_fr: 'Flux Pulse',
      desc: 'Civic social media platform',
      color: 'bg-cm-yellow'
    },
    { 
      icon: ShoppingBag, 
      title: 'Verified Marketplace', 
      title_fr: 'Marché Vérifié',
      desc: 'Secure Cameroonian commerce',
      color: 'bg-primary'
    }
  ];

  const stats = [
    { number: '2.5M+', label: 'Active Citizens', label_fr: 'Citoyens Actifs' },
    { number: '180K+', label: 'Daily Pulses', label_fr: 'Pulses Quotidiens' },
    { number: '95%', label: 'Verified Vendors', label_fr: 'Vendeurs Vérifiés' },
    { number: '24/7', label: 'Sentiment Tracking', label_fr: 'Suivi Sentiment' }
  ];

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-[radial-gradient(circle_at_center,_hsl(var(--cm-green))_0%,_transparent_50%)] opacity-10"></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Badge */}
          <Badge className="mb-6 bg-gradient-flag text-white border-0 px-4 py-2 text-sm font-medium">
            <Star className="w-4 h-4 mr-2" />
            CamerPulse — Tracking the Heartbeat of Cameroon 🇨🇲
          </Badge>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            <span className="bg-gradient-civic bg-clip-text text-transparent">
              Your Voice.
            </span>
            <br />
            <span className="bg-gradient-pulse bg-clip-text text-transparent">
              Your Power.
            </span>
            <br />
            <span className="text-accent">
              Your Marketplace.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Real-time civic intelligence, verified commerce, and transparent leadership tracking. 
            <br className="hidden md:block" />
            <span className="text-primary font-medium">Connect with Cameroon&apos;s democratic future.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-gradient-primary hover:shadow-green transition-all duration-300 px-8 py-3">
              <Zap className="w-5 h-5 mr-2" />
              Start Pulsing
            </Button>
            <Button variant="outline" size="lg" className="border-primary hover:bg-primary/5 px-8 py-3">
              <Shield className="w-5 h-5 mr-2" />
              Join as Vendor
            </Button>
            <Button variant="ghost" size="lg" className="text-cm-red hover:bg-cm-red/10 px-8 py-3">
              <Heart className="w-5 h-5 mr-2" />
              Donate Now
            </Button>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{feature.title_fr}</p>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Section */}
          <div className="bg-gradient-civic rounded-2xl p-8 shadow-elegant">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              {stats.map((stat, index) => (
                <div key={index} className="text-primary-foreground">
                  <div className="text-3xl lg:text-4xl font-bold mb-2">{stat.number}</div>
                  <div className="text-sm opacity-90">{stat.label}</div>
                  <div className="text-xs opacity-70">{stat.label_fr}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              PGP Encrypted
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Diaspora Friendly
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-accent" />
              Verified Platform
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};