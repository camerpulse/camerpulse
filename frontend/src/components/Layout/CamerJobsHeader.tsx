import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, Upload, Search, Briefcase } from 'lucide-react';
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

export const CamerJobsHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

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
          <Link to="/jobs" className="mr-6 flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <span className="font-bold text-xl text-primary">Camer</span>
              <span className="font-bold text-xl text-foreground">Jobs</span>
            </div>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link to="/jobs" className="transition-colors hover:text-foreground/80 text-foreground">
              Home
            </Link>
            <Link to="/jobs/board" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Find Jobs
            </Link>
            <Link to="/jobs/company" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Post Jobs
            </Link>
            <Link to="/experts" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Experts
            </Link>
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
            <Link to="/jobs" className="flex items-center space-x-2 md:hidden">
              <div className="flex items-center space-x-1">
                <span className="font-bold text-primary">Camer</span>
                <span className="font-bold text-foreground">Jobs</span>
              </div>
            </Link>
          </div>
          <nav className="flex items-center space-x-2">
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
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/jobs/company" className="flex items-center">
                      <Briefcase className="mr-2 h-4 w-4" />
                      <span>Company Portal</span>
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
            <Link
              to="/jobs"
              className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/jobs/board"
              className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Search className="mr-2 h-4 w-4" />
              Find Jobs
            </Link>
            <Link
              to="/jobs/company"
              className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Post Jobs
            </Link>
            <Link
              to="/experts"
              className="flex w-full items-center rounded-md p-2 text-sm font-medium hover:underline"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User className="mr-2 h-4 w-4" />
              Experts
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};