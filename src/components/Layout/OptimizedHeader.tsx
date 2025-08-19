import React, { useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from '@/components/Language/LanguageSwitcher';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useAppState } from "@/contexts/AppContext";
import { 
  Bell, 
  ChevronDown, 
  LogOut, 
  Menu, 
  MessageSquare,
  Settings, 
  User,
  X
} from "lucide-react";

// Memoized navigation items for performance
const NAVIGATION_ITEMS = [
  { path: "/civic-dashboard", label: "Dashboard", emoji: "📊" },
  { path: "/petitions", label: "Petitions", emoji: "📝" },
  { path: "/polls", label: "Polls", emoji: "🗳️" },
  { path: "/politicians", label: "Politicians", emoji: "👥" },
  { path: "/senators", label: "Senators", emoji: "🏛️" },
  { path: "/villages", label: "Villages", emoji: "🏘️" },
  { path: "/marketplace", label: "Marketplace", emoji: "🛒" },
  { path: "/jobs", label: "Jobs", emoji: "💼" },
  { path: "/messages", label: "Messenger", emoji: "💬" },
  { path: "/civic-contributions", label: "Contributions", emoji: "🤝" },
] as const;

/**
 * Optimized Header Component
 * 
 * Performance improvements:
 * - Memoized components and callbacks
 * - Reduced re-renders with React.memo
 * - Optimized dropdown structure
 */
export const OptimizedHeader: React.FC = React.memo(() => {
  const { user, signOut } = useAuth();
  const { state: { isLoading } } = useAppState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Memoized handlers
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [signOut, navigate]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // Memoized user display data
  const userDisplayData = useMemo(() => {
    if (!user) return null;
    
    return {
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      email: user.email || '',
      avatar: user.user_metadata?.avatar_url,
      initials: user.email?.charAt(0).toUpperCase() || 'U'
    };
  }, [user]);

  // Memoized navigation items
  const mobileNavItems = useMemo(() => 
    NAVIGATION_ITEMS.map(item => ({
      ...item,
      onClick: closeMobileMenu
    })), [closeMobileMenu]
  );

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Section */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <span className="text-white font-bold text-lg">CP</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full border-2 border-white"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-foreground">CamerPulse</h1>
              <p className="text-muted-foreground text-xs">Civic Engagement Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation - Memoized */}
          <nav className="hidden lg:flex items-center space-x-1">
            {NAVIGATION_ITEMS.map(({ path, label }) => (
              <Button 
                key={path}
                asChild 
                variant="ghost" 
                className="text-foreground hover:bg-primary/10 hover:text-primary"
              >
                <Link to={path}>{label}</Link>
              </Button>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            <LanguageSwitcher />
            
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-foreground hover:bg-primary/10 relative"
              disabled={isLoading}
            >
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 text-[10px] bg-accent text-accent-foreground border-0 flex items-center justify-center">
                3
              </Badge>
            </Button>

            {/* User Menu or Auth Buttons */}
            {user && userDisplayData ? (
              <UserDropdown 
                user={userDisplayData}
                onSignOut={handleSignOut}
              />
            ) : (
              <AuthButtons />
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-foreground hover:bg-primary/10"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <MobileMenu items={mobileNavItems} />
        )}
      </div>
    </header>
  );
});

OptimizedHeader.displayName = 'OptimizedHeader';

// Memoized sub-components for better performance
const UserDropdown: React.FC<{
  user: { name: string; email: string; avatar?: string; initials: string };
  onSignOut: () => void;
}> = React.memo(({ user, onSignOut }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="text-foreground hover:bg-primary/10 gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="text-white text-xs bg-primary">
            {user.initials}
          </AvatarFallback>
        </Avatar>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium">{user.name}</div>
          <div className="text-xs text-muted-foreground">{user.email}</div>
        </div>
        <ChevronDown className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link to="/profile" className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          Profile
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/messages" className="cursor-pointer">
          <MessageSquare className="mr-2 h-4 w-4" />
          Messenger
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onSignOut} className="cursor-pointer">
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
));

UserDropdown.displayName = 'UserDropdown';

const AuthButtons: React.FC = React.memo(() => (
  <div className="flex items-center gap-2">
    <Button asChild variant="ghost" size="sm" className="text-foreground hover:bg-primary/10">
      <Link to="/auth">Sign In</Link>
    </Button>
    <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
      <Link to="/auth">Sign Up</Link>
    </Button>
  </div>
));

AuthButtons.displayName = 'AuthButtons';

const MobileMenu: React.FC<{
  items: Array<{ path: string; label: string; emoji: string; onClick: () => void }>;
}> = React.memo(({ items }) => (
  <nav className="lg:hidden mt-4 pb-4 border-t border-border/20">
    <div className="grid grid-cols-1 gap-2 mt-4">
      {items.map(({ path, label, emoji, onClick }) => (
        <Button 
          key={path}
          asChild 
          variant="ghost" 
          className="text-foreground hover:bg-primary/10 justify-start"
        >
          <Link to={path} onClick={onClick}>
            {emoji} {label}
          </Link>
        </Button>
      ))}
    </div>
  </nav>
));

MobileMenu.displayName = 'MobileMenu';