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
  MessageSquare,
  Settings, 
  User,
  X,
  BarChart3
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
    <header className="bg-white/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Branding */}
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

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Button asChild variant="ghost" className="text-foreground hover:bg-primary/10 hover:text-primary">
              <Link to="/advanced-feed">Feed</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-foreground hover:bg-primary/10 hover:text-primary">
                  Civic <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-background border border-border shadow-lg">
                <DropdownMenuItem asChild>
                  <Link to="/polls">Polls & Voting</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/politicians">Politicians</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/senators">Senators</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/ministers">Ministers</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/mps">MPs</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/judiciary">Judiciary</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/political-parties">Political Parties</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-foreground hover:bg-primary/10 hover:text-primary">
                  Services <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-background border border-border shadow-lg">
                <DropdownMenuItem asChild>
                  <Link to="/company-directory">Companies</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/schools-directory">Schools</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/hospitals-directory">Hospitals</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/villages-directory">Villages</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/jobs">Job Board</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/marketplace">Marketplace</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/services-map">Services Map</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-foreground hover:bg-primary/10 hover:text-primary">
                  Transparency <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-background border border-border shadow-lg">
                <DropdownMenuItem asChild>
                  <Link to="/transparency">Transparency Hub</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/national-debt-tracker">National Debt</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/billionaire-tracker">Billionaire Tracker</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/election-forecast">Election Forecast</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/government-project-tracker">Gov Projects</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/budget-explorer">Budget Explorer</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/analytics">Analytics</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-foreground hover:bg-primary/10 hover:text-primary">
                  CamerPlay <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-background border border-border shadow-lg">
                <DropdownMenuItem asChild>
                  <Link to="/camerplay">CamerPlay Home</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/camerplay/upload">Upload Music</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/camerplay/search">Search</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/camerplay/events">Events</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/camerplay/rankings">Rankings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/artist-landing">Artist Portal</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button asChild variant="ghost" className="text-foreground hover:bg-primary/10 hover:text-primary">
              <Link to="/messenger">Messenger</Link>
            </Button>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="text-foreground hover:bg-primary/10 relative">
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 text-[10px] bg-accent text-accent-foreground border-0 flex items-center justify-center">
                3
              </Badge>
            </Button>

            {/* User Menu or Auth Buttons */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-foreground hover:bg-primary/10 gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="text-white text-xs bg-primary">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/user/${user.id}`} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/polls" className="cursor-pointer">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      My Polls Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/messenger" className="cursor-pointer">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Messenger
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
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
                <Button asChild variant="ghost" size="sm" className="text-foreground hover:bg-primary/10">
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link to="/auth">Sign Up</Link>
                </Button>
              </div>
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
          <nav className="lg:hidden mt-4 pb-4 border-t border-border/20">
            <div className="grid grid-cols-1 gap-2 mt-4">
              <Button asChild variant="ghost" className="text-foreground hover:bg-primary/10 justify-start">
                <Link to="/diaspora-connect" onClick={() => setMobileMenuOpen(false)}>🌍 DiasporaConnect</Link>
              </Button>
              <Button asChild variant="ghost" className="text-foreground hover:bg-primary/10 justify-start">
                <Link to="/polls" onClick={() => setMobileMenuOpen(false)}>🗳️ Browse Polls</Link>
              </Button>
              <Button asChild variant="ghost" className="text-foreground hover:bg-primary/10 justify-start">
                <Link to="/poll-templates" onClick={() => setMobileMenuOpen(false)}>📋 Poll Templates</Link>
              </Button>
              {user && (
                <Button asChild variant="ghost" className="text-foreground hover:bg-primary/10 justify-start">
                  <Link to="/dashboard/polls" onClick={() => setMobileMenuOpen(false)}>📊 My Polls Dashboard</Link>
                </Button>
              )}
              <Button asChild variant="ghost" className="text-foreground hover:bg-primary/10 justify-start">
                <Link to="/politicians" onClick={() => setMobileMenuOpen(false)}>👥 Politicians</Link>
              </Button>
              <Button asChild variant="ghost" className="text-foreground hover:bg-primary/10 justify-start">
                <Link to="/senators" onClick={() => setMobileMenuOpen(false)}>🏛️ Senators</Link>
              </Button>
              <Button asChild variant="ghost" className="text-foreground hover:bg-primary/10 justify-start">
                <Link to="/legislation" onClick={() => setMobileMenuOpen(false)}>📜 Legislation</Link>
              </Button>
              <Button asChild variant="ghost" className="text-foreground hover:bg-primary/10 justify-start">
                <Link to="/judiciary" onClick={() => setMobileMenuOpen(false)}>⚖️ Judiciary</Link>
              </Button>
              <Button asChild variant="ghost" className="text-foreground hover:bg-primary/10 justify-start">
                <Link to="/messenger" onClick={() => setMobileMenuOpen(false)}>💬 Messenger</Link>
              </Button>
              <Button asChild variant="ghost" className="text-foreground hover:bg-primary/10 justify-start">
                <Link to="/analytics" onClick={() => setMobileMenuOpen(false)}>📊 Analytics</Link>
              </Button>
              <Button asChild variant="ghost" className="text-foreground hover:bg-primary/10 justify-start">
                <Link to="/schools" onClick={() => setMobileMenuOpen(false)}>🏫 Services</Link>
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};