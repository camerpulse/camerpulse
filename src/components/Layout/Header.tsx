import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { 
  Bell, 
  ChevronDown, 
  LogOut, 
  Menu, 
  Settings, 
  User,
  X
} from "lucide-react";

export const Header = () => {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-gradient-civic border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 shadow-elegant pt-safe-top">
      <div className="container mx-auto px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[64px]">
          {/* Logo & Branding */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-primary font-bold text-lg">CP</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-cm-yellow rounded-full border-2 border-white"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-white font-inter">CamerPlay</h1>
              <p className="text-white/80 text-xs">Music & Entertainment</p>
            </div>
          </Link>

          {/* Desktop Navigation - CamerPlay specific */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Button asChild variant="ghost" className="text-white hover:bg-white/10">
              <Link to="/events">Events</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:bg-white/10">
              <Link to="/artists">Artists</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:bg-white/10">
              <Link to="/awards">Awards</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:bg-white/10">
              <Link to="/tickets">My Tickets</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:bg-white/10">
              <Link to="/music">Music</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:bg-white/10">
              <Link to="/discover">Discover</Link>
            </Button>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 relative">
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 text-[10px] bg-destructive text-white border-0 flex items-center justify-center">
                3
              </Badge>
            </Button>

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
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
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
                <Button asChild size="sm" className="bg-white text-primary hover:bg-white/90">
                  <Link to="/auth">Sign Up</Link>
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

        {/* Mobile Menu - CamerPlay specific */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-white/20">
            <div className="grid grid-cols-1 gap-2 mt-4">
              <Button asChild variant="ghost" className="text-white hover:bg-white/10 justify-start">
                <Link to="/events" onClick={() => setMobileMenuOpen(false)}>🎪 Events</Link>
              </Button>
              <Button asChild variant="ghost" className="text-white hover:bg-white/10 justify-start">
                <Link to="/artists" onClick={() => setMobileMenuOpen(false)}>🎤 Artists</Link>
              </Button>
              <Button asChild variant="ghost" className="text-white hover:bg-white/10 justify-start">
                <Link to="/awards" onClick={() => setMobileMenuOpen(false)}>🏆 Awards</Link>
              </Button>
              <Button asChild variant="ghost" className="text-white hover:bg-white/10 justify-start">
                <Link to="/tickets" onClick={() => setMobileMenuOpen(false)}>🎟️ My Tickets</Link>
              </Button>
              <Button asChild variant="ghost" className="text-white hover:bg-white/10 justify-start">
                <Link to="/music" onClick={() => setMobileMenuOpen(false)}>🎵 Music</Link>
              </Button>
              <Button asChild variant="ghost" className="text-white hover:bg-white/10 justify-start">
                <Link to="/discover" onClick={() => setMobileMenuOpen(false)}>🔍 Discover</Link>
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};