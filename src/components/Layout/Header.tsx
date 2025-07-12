import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Users, 
  TrendingUp, 
  ShoppingBag, 
  Shield,
  Menu,
  X,
  Star,
  Globe
} from 'lucide-react';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Pulse Feed', name_fr: 'Flux Pulse', icon: MessageCircle, href: '/pulse' },
    { name: 'Politicians', name_fr: 'Politiciens', icon: Users, href: '/politicians' },
    { name: 'Polls', name_fr: 'Sondages', icon: TrendingUp, href: '/polls' },
    { name: 'Marketplace', name_fr: 'Marché', icon: ShoppingBag, href: '/marketplace' },
    { name: 'News', name_fr: 'Actualités', icon: Globe, href: '/news' }
  ];

  return (
    <header className="bg-gradient-civic border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 shadow-elegant">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-flag rounded-full flex items-center justify-center shadow-lg">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-cm-yellow rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-foreground">CamerPulse</h1>
              <p className="text-xs text-primary-foreground/80">Tracking the Heartbeat of Cameroon 🇨🇲</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-white/10 hover:text-white transition-smooth"
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.name}
              </Button>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-cm-yellow text-cm-yellow-foreground hidden sm:flex">
              <Heart className="w-3 h-3 mr-1" />
              Donate
            </Badge>
            
            <Button variant="secondary" size="sm">
              <Shield className="w-4 h-4 mr-2" />
              Login
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-primary-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-white/20">
            <div className="space-y-2 pt-4">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className="w-full justify-start text-primary-foreground hover:bg-white/10"
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  <span>{item.name}</span>
                  <span className="text-xs text-primary-foreground/60 ml-2">/ {item.name_fr}</span>
                </Button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};