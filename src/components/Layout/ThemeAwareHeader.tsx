import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LanguageToggle } from "@/components/ui/language-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { 
  Bell, 
  ChevronDown, 
  LogOut, 
  Menu, 
  Settings, 
  User,
  Globe,
  X,
  Crown,
  Star,
  Lightbulb,
  MessageCircle
} from "lucide-react";
import { NotificationCenter } from '@/components/Notifications/NotificationCenter';

export const ThemeAwareHeader = () => {
  const { user, signOut } = useAuth();
  const { currentTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState('EN');
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'EN' ? 'FR' : 'EN');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Theme-specific styling
  const getThemeStyles = () => {
    switch (currentTheme.id) {
      case 'lux-aeterna':
        return {
          headerClass: "bg-gradient-patriotic border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 shadow-patriotic pt-safe-top",
          logoContainer: "w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg animate-eternal-glow",
          logoText: "text-primary font-bold text-lg",
          logoIcon: Crown,
          brandTitle: "Lux Aeterna",
          brandSubtitle: "Eternal Light",
          notificationBadge: "absolute -top-1 -right-1 w-4 h-4 p-0 text-[10px] bg-accent text-white border-0 flex items-center justify-center animate-patriotic-pulse"
        };
      case 'emergence-2035':
        return {
          headerClass: "bg-gradient-civic border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 shadow-elegant pt-safe-top",
          logoContainer: "w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg animate-heartbeat",
          logoText: "text-primary font-bold text-lg",
          logoIcon: Star,
          brandTitle: "CamerPulse 2035",
          brandSubtitle: "Vision Platform",
          notificationBadge: "absolute -top-1 -right-1 w-4 h-4 p-0 text-[10px] bg-destructive text-white border-0 flex items-center justify-center"
        };
      default:
        return {
          headerClass: "bg-gradient-civic border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 shadow-elegant pt-safe-top",
          logoContainer: "w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg",
          logoText: "text-primary font-bold text-lg",
          logoIcon: Lightbulb,
          brandTitle: "CamerPulse",
          brandSubtitle: "Civic SuperApp",
          notificationBadge: "absolute -top-1 -right-1 w-4 h-4 p-0 text-[10px] bg-destructive text-white border-0 flex items-center justify-center"
        };
    }
  };

  const themeStyles = getThemeStyles();

  return (
    <header className={themeStyles.headerClass}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="relative">
              <div className={themeStyles.logoContainer}>
                {currentTheme.id === 'lux-aeterna' ? (
                  <Crown className={themeStyles.logoText} />
                ) : (
                  <span className={themeStyles.logoText}>CP</span>
                )}
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-cm-yellow rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className={`text-xl font-bold text-white ${currentTheme.id === 'lux-aeterna' ? 'font-playfair' : 'font-poppins'}`}>
                {themeStyles.brandTitle}
              </h1>
              <p className="text-white/80 text-xs">{themeStyles.brandSubtitle}</p>
            </div>
          </Link>

          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Button asChild variant="ghost" className={`text-white hover:bg-white/10 ${currentTheme.id === 'lux-aeterna' ? 'hover:animate-eternal-glow' : ''}`}>
              <Link to="/pulse">
                {currentTheme.id === 'lux-aeterna' ? 'Illuminate' : 'Pulse Feed'}
              </Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:bg-white/10">
              <Link to="/politicians">
                {currentTheme.id === 'lux-aeterna' ? 'Leaders' : 'Politicians'}
              </Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:bg-white/10">
              <Link to="/marketplace">
                {currentTheme.id === 'lux-aeterna' ? 'Noble Commerce' : 'Marketplace'}
              </Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:bg-white/10">
              <Link to="/polls">
                {currentTheme.id === 'lux-aeterna' ? 'Sacred Polls' : 'Polls'}
              </Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:bg-white/10">
              <Link to="/civic-portal">
                {currentTheme.id === 'lux-aeterna' ? '🌟 Sacred Portal' : '🌍 Civic Portal'}
              </Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:bg-white/10">
              <Link to="/regional-analytics">
                {currentTheme.id === 'lux-aeterna' ? '📊 Unity Analytics' : '📊 Regional Analytics'}
              </Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:bg-white/10">
              <Link to="/news">📰 News</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:bg-white/10">
              <Link to="/camerpulse-intelligence">
                {currentTheme.id === 'lux-aeterna' ? '✨ Eternal Intel' : '🧠 Pan-African Intel'}
              </Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:bg-white/10">
              <Link to="/camerplay">🎵 Music</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:bg-white/10">
              <Link to="/events">🎪 Events</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:bg-white/10">
              <Link to="/tickets">🎫 Tickets</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:bg-white/10">
              <Link to="/admin/core">
                {currentTheme.id === 'lux-aeterna' ? '👑 Admin Core' : '⚙️ Admin Core'}
              </Link>
            </Button>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Language Toggle */}
            <div className="hidden sm:flex items-center gap-1">
              <LanguageToggle disabled={true} />
            </div>

            {/* Notifications */}
            <NotificationCenter />

            {/* User Menu or Auth Buttons */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:bg-white/10 gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="text-primary text-xs bg-white">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </div>
                      <div className="text-xs text-white/70">
                        {user.email}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border-border/20">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/social" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/messenger" className="cursor-pointer">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Messenger
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/notification-settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Notification Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild size="sm" className={`bg-white text-primary hover:bg-white/90 ${currentTheme.id === 'lux-aeterna' ? 'animate-patriotic-pulse' : ''}`}>
                  <Link to="/auth">
                    {currentTheme.id === 'lux-aeterna' ? 'Join the Light' : 'Sign Up'}
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-white hover:bg-white/10"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu - Only visible when toggled */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-white/20">
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button asChild variant="ghost" className="text-white hover:bg-white/10 justify-start">
                <Link to="/pulse" onClick={() => setMobileMenuOpen(false)}>
                  {currentTheme.id === 'lux-aeterna' ? 'Illuminate' : 'Pulse Feed'}
                </Link>
              </Button>
              <Button asChild variant="ghost" className="text-white hover:bg-white/10 justify-start">
                <Link to="/politicians" onClick={() => setMobileMenuOpen(false)}>
                  {currentTheme.id === 'lux-aeterna' ? 'Leaders' : 'Politicians'}
                </Link>
              </Button>
              <Button asChild variant="ghost" className="text-white hover:bg-white/10 justify-start">
                <Link to="/marketplace" onClick={() => setMobileMenuOpen(false)}>
                  {currentTheme.id === 'lux-aeterna' ? 'Noble Commerce' : 'Marketplace'}
                </Link>
              </Button>
              <Button asChild variant="ghost" className="text-white hover:bg-white/10 justify-start">
                <Link to="/polls" onClick={() => setMobileMenuOpen(false)}>
                  {currentTheme.id === 'lux-aeterna' ? 'Sacred Polls' : 'Polls'}
                </Link>
              </Button>
              <Button asChild variant="ghost" className="text-white hover:bg-white/10 justify-start">
                <Link to="/news" onClick={() => setMobileMenuOpen(false)}>News</Link>
              </Button>
              <Button asChild variant="ghost" className="text-white hover:bg-white/10 justify-start">
                <Link to="/civic-portal" onClick={() => setMobileMenuOpen(false)}>
                  {currentTheme.id === 'lux-aeterna' ? 'Sacred Portal' : 'Civic Portal'}
                </Link>
              </Button>
              <Button asChild variant="ghost" className="text-white hover:bg-white/10 justify-start">
                <Link to="/regional-analytics" onClick={() => setMobileMenuOpen(false)}>
                  {currentTheme.id === 'lux-aeterna' ? 'Unity Analytics' : 'Regional Analytics'}
                </Link>
              </Button>
              <Button asChild variant="ghost" className="text-white hover:bg-white/10 justify-start">
                <Link to="/camerplay" onClick={() => setMobileMenuOpen(false)}>Music</Link>
              </Button>
              <Button asChild variant="ghost" className="text-white hover:bg-white/10 justify-start">
                <Link to="/events" onClick={() => setMobileMenuOpen(false)}>Events</Link>
              </Button>
              <Button asChild variant="ghost" className="text-white hover:bg-white/10 justify-start">
                <Link to="/tickets" onClick={() => setMobileMenuOpen(false)}>Tickets</Link>
              </Button>
              <Button asChild variant="ghost" className="text-white hover:bg-white/10 justify-start col-span-2">
                <Link to="/camerpulse-intelligence" onClick={() => setMobileMenuOpen(false)}>
                  {currentTheme.id === 'lux-aeterna' ? 'Eternal Intelligence' : 'Intelligence Dashboard'}
                </Link>
              </Button>
            </div>

            {/* Mobile Language Toggle */}
            <div className="mt-4 pt-4 border-t border-white/20 flex justify-center">
              <LanguageToggle disabled={true} />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};