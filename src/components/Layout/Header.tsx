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
  Globe,
  LogOut,
  Settings,
  User,
  Search,
  Bell
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleAuthAction = () => {
    if (user) {
      signOut();
    } else {
      navigate('/auth');
    }
  };

  const navItems = [
    { name: 'Pulse Feed', name_fr: 'Flux Pulse', icon: MessageCircle, href: '/pulse' },
    { name: 'Politicians', name_fr: 'Politiciens', icon: Users, href: '/politicians' },
    { name: 'Polls', name_fr: 'Sondages', icon: TrendingUp, href: '/polls' },
    { name: 'Marketplace', name_fr: 'Marché', icon: ShoppingBag, href: '/marketplace' },
    { name: 'Social', name_fr: 'Social', icon: Users, href: '/social' },
    { name: 'News', name_fr: 'Actualités', icon: Globe, href: '/news' }
  ];

  return (
    <header className="bg-gradient-civic border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 shadow-elegant">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
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
                onClick={() => navigate(item.href)}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.name}
              </Button>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10 hidden sm:flex">
              <Search className="h-4 w-4" />
            </Button>
            
            {user && (
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10">
                <Bell className="h-4 w-4" />
              </Button>
            )}

            <Badge variant="secondary" className="bg-cm-yellow text-cm-yellow-foreground hidden sm:flex cursor-pointer" onClick={() => navigate('/donate')}>
              <Heart className="w-3 h-3 mr-1" />
              Donate
            </Badge>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10 relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-cameroon-yellow text-cameroon-primary">
                        {profile?.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {profile?.is_diaspora && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-cameroon-yellow rounded-full border border-white" title="Diaspora" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border-cameroon-yellow/20">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-cameroon-primary">
                      {profile?.display_name || profile?.username}
                    </p>
                    <p className="text-xs text-gray-500">@{profile?.username}</p>
                    {profile?.is_diaspora && (
                      <p className="text-xs text-cameroon-yellow flex items-center gap-1 mt-1">
                        🌍 Diaspora
                      </p>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleAuthAction} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={handleAuthAction} 
                variant="secondary" 
                size="sm"
                className="bg-cm-yellow text-cm-yellow-foreground hover:bg-cm-yellow/90"
                disabled={loading}
              >
                <Shield className="w-4 h-4 mr-2" />
                {loading ? "..." : "Login"}
              </Button>
            )}

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
              {user && (
                <div className="px-3 py-2 bg-white/10 rounded-lg mb-3">
                  <p className="text-sm font-medium text-primary-foreground">
                    {profile?.display_name || profile?.username}
                  </p>
                  <p className="text-xs text-primary-foreground/60">@{profile?.username}</p>
                  {profile?.is_diaspora && (
                    <p className="text-xs text-cm-yellow flex items-center gap-1 mt-1">
                      🌍 Diaspora
                    </p>
                  )}
                </div>
              )}
              
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className="w-full justify-start text-primary-foreground hover:bg-white/10"
                  onClick={() => {
                    navigate(item.href);
                    setIsMenuOpen(false);
                  }}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  <span>{item.name}</span>
                  <span className="text-xs text-primary-foreground/60 ml-2">/ {item.name_fr}</span>
                </Button>
              ))}
              
              {user && (
                <>
                  <DropdownMenuSeparator className="bg-white/20" />
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-primary-foreground hover:bg-white/10"
                    onClick={() => {
                      navigate('/profile');
                      setIsMenuOpen(false);
                    }}
                  >
                    <User className="w-4 h-4 mr-3" />
                    Profil
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:bg-red-500/10"
                    onClick={() => {
                      handleAuthAction();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Déconnexion
                  </Button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};