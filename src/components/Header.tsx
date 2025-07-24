import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import camerPulseLogo from '@/assets/camerpulse-logo.png';
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
  X,
  Building
} from "lucide-react";


const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;
  
  // CamerPulse branding
  const brandingConfig = {
    title: "CamerPulse",
    subtitle: "Civic Engagement Platform",
    href: "/"
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center gap-6">
            <Link to={brandingConfig.href} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img src={camerPulseLogo} alt={brandingConfig.title} className="w-8 h-8 rounded-lg" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground">{brandingConfig.title}</span>
                <span className="text-xs text-muted-foreground hidden sm:block">{brandingConfig.subtitle}</span>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                to="/polls" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/polls') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Polls
              </Link>
              <Link 
                to="/politicians" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/politicians') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Politicians
              </Link>
              <Link 
                to="/legislation" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/legislation') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Legislation
              </Link>
              <Link 
                to="/judiciary" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/judiciary') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Judiciary
              </Link>
              <Link 
                to="/analytics" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/analytics') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Analytics
              </Link>
              <Link 
                to="/schools" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/schools') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Services
              </Link>
              <Link 
                to="/diaspora-connect" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/diaspora-connect') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Diaspora
              </Link>
            </nav>
          </div>
        </div>

        {/* Right side - Auth & Menu */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm">
                      {profile?.display_name || user.email}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/auth">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="flex flex-col p-4 space-y-2">
            <Link to="/polls" className="py-2 text-sm hover:text-primary">Polls</Link>
            <Link to="/politicians" className="py-2 text-sm hover:text-primary">Politicians</Link>
            <Link to="/legislation" className="py-2 text-sm hover:text-primary">Legislation</Link>
            <Link to="/judiciary" className="py-2 text-sm hover:text-primary">Judiciary</Link>
            
            <Link to="/analytics" className="py-2 text-sm hover:text-primary">Analytics</Link>
            <Link to="/schools" className="py-2 text-sm hover:text-primary">Services</Link>
            <Link to="/diaspora-connect" className="py-2 text-sm hover:text-primary">Diaspora</Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
