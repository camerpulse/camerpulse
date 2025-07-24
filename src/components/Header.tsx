import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NotificationBell from '@/components/NotificationBell';
import { useAuth } from '@/contexts/AuthContext';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Home,
  FileText,
  Plus,
  BarChart3,
  Settings,
  User,
  Search,
  Building,
  Award,
  LogOut,
  BookmarkCheck,
  Shield,
  TrendingUp,
  Globe,
  Phone,
  Mail
} from 'lucide-react';

export default function Header() {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground">CamerTenders</span>
                <span className="text-xs text-muted-foreground hidden sm:block">Government Procurement Platform</span>
              </div>
            </Link>
            
            {/* Main Navigation */}
            <div className="hidden md:block">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Link
                      to="/"
                      className={`group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                        isActive('/') ? 'bg-accent text-accent-foreground' : ''
                      }`}
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Home
                    </Link>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>
                      <FileText className="h-4 w-4 mr-2" />
                      Tenders
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-3 p-6 w-[500px] lg:w-[600px] lg:grid-cols-2">
                        <div className="row-span-3">
                          <NavigationMenuLink asChild>
                            <Link
                              className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md hover:bg-muted/60 transition-colors"
                              to="/tenders"
                            >
                              <FileText className="h-6 w-6" />
                              <div className="mb-2 mt-4 text-lg font-medium">
                                Browse All Tenders
                              </div>
                              <p className="text-sm leading-tight text-muted-foreground">
                                Discover government contracts and opportunities across Cameroon
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </div>
                        
                        <div className="space-y-2">
                          <NavigationMenuLink asChild>
                            <Link
                              to="/tenders/create"
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none flex items-center">
                                <Plus className="h-4 w-4 mr-2" />
                                Post Tender
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Create and publish a new tender
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          
                          <NavigationMenuLink asChild>
                            <Link
                              to="/my-bids"
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none flex items-center">
                                <BookmarkCheck className="h-4 w-4 mr-2" />
                                My Bids
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Track your submitted bids
                              </p>
                            </Link>
                          </NavigationMenuLink>
                          
                          <NavigationMenuLink asChild>
                            <Link
                              to="/my-tenders"
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none flex items-center">
                                <FileText className="h-4 w-4 mr-2" />
                                My Tenders
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Manage your published tenders
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Tools
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-3 p-6 w-[400px] grid-cols-1">
                        <NavigationMenuLink asChild>
                          <Link
                            to="/search"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none flex items-center">
                              <Search className="h-4 w-4 mr-2" />
                              Advanced Search
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Find tenders with advanced filters
                            </p>
                          </Link>
                        </NavigationMenuLink>
                        
                        <NavigationMenuLink asChild>
                          <Link
                            to="/analytics"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none flex items-center">
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Analytics
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Market insights and trends
                            </p>
                          </Link>
                        </NavigationMenuLink>
                        
                        <NavigationMenuLink asChild>
                          <Link
                            to="/verification"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none flex items-center">
                              <Shield className="h-4 w-4 mr-2" />
                              Verification Center
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Verify your business credentials
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          
          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Search - Desktop Only */}
            <div className="hidden lg:block">
              <Button variant="outline" size="sm" asChild>
                <Link to="/search">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Link>
              </Button>
            </div>
            
            {user ? (
              <>
                {/* Post Tender Button */}
                <Button size="sm" asChild>
                  <Link to="/tenders/create">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Post Tender</span>
                    <span className="sm:hidden">Post</span>
                  </Link>
                </Button>
                
                {/* Notifications */}
                <NotificationBell />
                
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url || ''} alt={profile?.display_name || ''} />
                        <AvatarFallback>
                          {profile?.display_name?.charAt(0)?.toUpperCase() || 
                           user.email?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {profile?.display_name || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                        {profile?.verified && (
                          <Badge variant="secondary" className="w-fit text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <Link to="/profile">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/company">
                        <Building className="h-4 w-4 mr-2" />
                        Company Dashboard
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/verification">
                        <Shield className="h-4 w-4 mr-2" />
                        Verification
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/certificates">
                        <Award className="h-4 w-4 mr-2" />
                        Certificates
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <Link to="/settings">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* Auth Buttons for Non-logged Users */
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Search Bar - Below header on small screens */}
      <div className="lg:hidden border-t bg-muted/30">
        <div className="container mx-auto px-4 py-2">
          <Button variant="outline" size="sm" className="w-full justify-start" asChild>
            <Link to="/search">
              <Search className="h-4 w-4 mr-2" />
              Search tenders, companies, opportunities...
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}