import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Building2, GraduationCap, Hospital, Pill, User, LogOut, Settings, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

interface ServicesHeaderProps {
  serviceType: 'villages' | 'hospitals' | 'schools' | 'pharmacies';
}

const serviceConfig = {
  villages: {
    icon: Building2,
    name: 'Villages Directory',
    color: 'text-green-600',
    links: [
      { to: '/villages', label: 'Directory' },
      { to: '/villages/add', label: 'Add Village' },
      { to: '/villages/leaderboards', label: 'Leaderboards' }
    ]
  },
  hospitals: {
    icon: Hospital,
    name: 'Hospitals Directory',
    color: 'text-red-600',
    links: [
      { to: '/hospitals', label: 'Directory' },
      { to: '/map', label: 'Map View' },
      { to: '/services-search', label: 'Search' }
    ]
  },
  schools: {
    icon: GraduationCap,
    name: 'Schools Directory',
    color: 'text-blue-600',
    links: [
      { to: '/schools', label: 'Directory' },
      { to: '/map', label: 'Map View' },
      { to: '/services-search', label: 'Search' }
    ]
  },
  pharmacies: {
    icon: Pill,
    name: 'Pharmacies Directory',
    color: 'text-purple-600',
    links: [
      { to: '/pharmacies', label: 'Directory' },
      { to: '/map', label: 'Map View' },
      { to: '/services-search', label: 'Search' }
    ]
  }
};

export const ServicesHeader = ({ serviceType }: ServicesHeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const config = serviceConfig[serviceType];
  const IconComponent = config.icon;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to={config.links[0].to} className="mr-6 flex items-center space-x-2">
            <IconComponent className={`h-6 w-6 ${config.color}`} />
            <span className="hidden font-bold sm:inline-block text-xl">
              {config.name}
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {config.links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
          onClick={toggleMobileMenu}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link to={config.links[0].to} className="flex items-center space-x-2 md:hidden">
              <IconComponent className={`h-6 w-6 ${config.color}`} />
              <span className="font-bold">{config.name}</span>
            </Link>
          </div>
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" className="flex items-center">
                <Home className="mr-2 h-4 w-4" />
                CamerPulse
              </Link>
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/notification-settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/auth">Sign up</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] w-full grid-flow-row auto-rows-max overflow-auto p-6 pb-32 shadow-md animate-in slide-in-from-bottom-80 md:hidden">
          <div className="relative z-20 grid gap-6 rounded-md bg-popover p-4 text-popover-foreground shadow-md">
            {config.links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};