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
  Zap,
  Brain,
  Crown,
  Lightbulb,
  Flag,
  Trophy
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeAwareHero = () => {
  const { currentTheme } = useTheme();

  // Theme-specific content
  const getThemeContent = () => {
    switch (currentTheme.id) {
      case 'lux-aeterna':
        return {
          badge: {
            icon: Crown,
            text: "Lux Aeterna — Eternal Light of the Fatherland 🌟",
            className: "bg-gradient-patriotic text-white border-0 px-4 py-2 text-sm font-medium animate-eternal-glow"
          },
          headline: {
            line1: "Light of Hope.",
            line2: "Voice of Unity.",
            line3: "Heart of the Fatherland.",
            className: "text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight animate-hope-rise"
          },
          subtitle: "Where patriotic hearts unite for Cameroon's eternal glory. Real-time civic intelligence illuminating the path to national prosperity and democratic excellence.",
          features: [
            { 
              icon: Lightbulb, 
              title: 'Enlightened Governance', 
              desc: 'Illuminating the path to progress',
              color: 'bg-primary shadow-patriotic'
            },
            { 
              icon: Flag, 
              title: 'Patriotic Unity', 
              desc: 'Strengthening national bonds',
              color: 'bg-secondary shadow-patriotic'
            },
            { 
              icon: Trophy, 
              title: 'Excellence in Service', 
              desc: 'Upholding the highest standards',
              color: 'bg-accent shadow-patriotic'
            },
            { 
              icon: Crown, 
              title: 'Noble Leadership', 
              desc: 'Dignified representation for all',
              color: 'bg-primary shadow-patriotic'
            }
          ],
          stats: [
            { number: '4.2M+', label: 'Patriotic Citizens' },
            { number: '250K+', label: 'Daily Illuminations' },
            { number: '99%', label: 'Hope Verified' },
            { number: '∞', label: 'Eternal Light' }
          ],
          backgroundClass: "relative min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/10 flex items-center",
          containerClass: "container mx-auto px-4 py-16 relative z-10 animate-hope-rise"
        };

      case 'emergence-2035':
        return {
          badge: {
            icon: Star,
            text: "Emergence 2035 — Vision of a Stronger Cameroon 🇨🇲",
            className: "mb-6 bg-gradient-flag text-white border-0 px-4 py-2 text-sm font-medium animate-heartbeat"
          },
          headline: {
            line1: "Your Voice.",
            line2: "Your Power.",
            line3: "Your Future.",
            className: "text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight animate-fade-in-up"
          },
          subtitle: "Building the future with transparency, accountability, and civic engagement. Together we rise toward Emergence 2035.",
          features: [
            { 
              icon: TrendingUp, 
              title: 'Economic Growth', 
              desc: 'Tracking progress toward emergence',
              color: 'bg-cm-green'
            },
            { 
              icon: Users, 
              title: 'Democratic Progress', 
              desc: 'Strengthening civic participation',
              color: 'bg-cm-red'
            },
            { 
              icon: Globe, 
              title: 'Global Integration', 
              desc: 'Connecting with the world',
              color: 'bg-cm-yellow'
            },
            { 
              icon: Shield, 
              title: 'National Security', 
              desc: 'Protecting our sovereignty',
              color: 'bg-primary'
            }
          ],
          stats: [
            { number: '2035', label: 'Vision Year' },
            { number: '180K+', label: 'Daily Pulses' },
            { number: '95%', label: 'Verified Data' },
            { number: '24/7', label: 'Monitoring' }
          ],
          backgroundClass: "relative min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 flex items-center",
          containerClass: "container mx-auto px-4 py-16 relative z-10 animate-fade-in-up"
        };

      default:
        return {
          badge: {
            icon: Star,
            text: "CamerPulse — Tracking the Heartbeat of Cameroon 🇨🇲",
            className: "mb-6 bg-gradient-flag text-white border-0 px-4 py-2 text-sm font-medium"
          },
          headline: {
            line1: "Your Voice.",
            line2: "Your Power.",
            line3: "Your Marketplace.",
            className: "text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight"
          },
          subtitle: "Real-time civic intelligence, verified commerce, and transparent leadership tracking. Connect with Cameroon's democratic future.",
          features: [
            { 
              icon: TrendingUp, 
              title: 'Live Sentiment', 
              desc: 'Track public opinion in real-time',
              color: 'bg-cm-green'
            },
            { 
              icon: Users, 
              title: 'Politician Ratings', 
              desc: 'Transparent approval tracking',
              color: 'bg-cm-red'
            },
            { 
              icon: MessageCircle, 
              title: 'Pulse Feed', 
              desc: 'Civic social media platform',
              color: 'bg-cm-yellow'
            },
            { 
              icon: ShoppingBag, 
              title: 'Verified Marketplace', 
              desc: 'Secure Cameroonian commerce',
              color: 'bg-primary'
            }
          ],
          stats: [
            { number: '2.5M+', label: 'Active Citizens' },
            { number: '180K+', label: 'Daily Pulses' },
            { number: '95%', label: 'Verified Vendors' },
            { number: '24/7', label: 'Sentiment Tracking' }
          ],
          backgroundClass: "relative min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 flex items-center",
          containerClass: "container mx-auto px-4 py-16 relative z-10"
        };
    }
  };

  const themeContent = getThemeContent();

  return (
    <section className={themeContent.backgroundClass}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        {currentTheme.id === 'lux-aeterna' ? (
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,_hsl(220,90%,15%)_0%,_transparent_50%)] opacity-10 animate-eternal-glow"></div>
        ) : (
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,_hsl(var(--cm-green))_0%,_transparent_50%)] opacity-10"></div>
        )}
      </div>
      
      <div className={themeContent.containerClass}>
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Badge */}
          <Badge className={themeContent.badge.className}>
            <themeContent.badge.icon className="w-4 h-4 mr-2" />
            {themeContent.badge.text}
          </Badge>

          {/* Main Headline */}
          <h1 className={themeContent.headline.className}>
            {currentTheme.id === 'lux-aeterna' ? (
              <>
                <span className="text-cm-green bg-transparent animate-fade-in opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                  {themeContent.headline.line1}
                </span>
                <br />
                <span className="text-cm-red bg-transparent animate-fade-in opacity-0" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
                  {themeContent.headline.line2}
                </span>
                <br />
                <span className="text-cm-yellow bg-transparent animate-fade-in opacity-0 animate-patriotic-pulse" style={{ animationDelay: '1.0s', animationFillMode: 'forwards' }}>
                  {themeContent.headline.line3}
                </span>
              </>
            ) : (
              <>
                <span className="text-cm-green bg-transparent animate-fade-in opacity-0 hover-scale" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                  {themeContent.headline.line1}
                </span>
                <br />
                <span className="text-cm-red bg-transparent animate-fade-in opacity-0 hover-scale" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
                  {themeContent.headline.line2}
                </span>
                <br />
                <span className="text-cm-yellow bg-transparent animate-fade-in opacity-0 hover-scale" style={{ animationDelay: '1.0s', animationFillMode: 'forwards' }}>
                  {themeContent.headline.line3}
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            {themeContent.subtitle}
            <br className="hidden md:block" />
            <span className="text-primary font-medium">
              {currentTheme.id === 'lux-aeterna' 
                ? "Illuminating the path to eternal prosperity." 
                : "Connect with Cameroon's democratic future."
              }
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className={`${currentTheme.id === 'lux-aeterna' ? 'bg-gradient-patriotic hover:shadow-patriotic animate-eternal-glow' : 'bg-gradient-primary hover:shadow-green'} transition-all duration-300 px-8 py-3`}>
              <Link to="/pulse">
                <Zap className="w-5 h-5 mr-2" />
                {currentTheme.id === 'lux-aeterna' ? 'Ignite Hope' : 'Start Pulsing'}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary hover:bg-primary/5 px-8 py-3">
              <Link to="/camerpulse-intelligence">
                <Brain className="w-5 h-5 mr-2" />
                Intelligence Dashboard
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className={`text-accent hover:bg-accent/10 px-8 py-3 ${currentTheme.id === 'lux-aeterna' ? 'animate-patriotic-pulse' : ''}`}>
              <Link to="/donate">
                <Heart className="w-5 h-5 mr-2" />
                {currentTheme.id === 'lux-aeterna' ? 'Support the Light' : 'Donate Now'}
              </Link>
            </Button>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {themeContent.features.map((feature, index) => (
              <Card key={index} className={`border-0 shadow-elegant hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${currentTheme.id === 'lux-aeterna' ? 'animate-hope-rise' : ''}`} style={{animationDelay: `${index * 0.1}s`}}>
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ${currentTheme.id === 'lux-aeterna' ? 'animate-eternal-glow' : ''}`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Section */}
          <div className={`${currentTheme.id === 'lux-aeterna' ? 'bg-gradient-patriotic' : 'bg-gradient-civic'} rounded-2xl p-8 shadow-elegant ${currentTheme.id === 'lux-aeterna' ? 'animate-eternal-glow' : ''}`}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              {themeContent.stats.map((stat, index) => (
                <div key={index} className="text-primary-foreground">
                  <div className={`text-3xl lg:text-4xl font-bold mb-2 ${currentTheme.id === 'lux-aeterna' ? 'animate-patriotic-pulse' : ''}`}>{stat.number}</div>
                  <div className="text-sm opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              {currentTheme.id === 'lux-aeterna' ? 'Eternal Security' : 'PGP Encrypted'}
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Diaspora Friendly
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-accent" />
              {currentTheme.id === 'lux-aeterna' ? 'Light Verified' : 'Verified Platform'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};