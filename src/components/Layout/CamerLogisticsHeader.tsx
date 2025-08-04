import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, X, Truck, Package, MapPin, User, Building, Settings, LogOut, Search, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const CamerLogisticsHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/logistics');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/logistics" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-blue-900">CamerLogistics</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/logistics" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Home
              </Link>
              <Link to="/logistics/tracking" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Track Package
              </Link>
              <Link to="/logistics/companies" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Delivery Companies
              </Link>
              <Link to="/logistics/ship" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Ship Package
              </Link>
              <Link to="/logistics/business" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Business Solutions
              </Link>
            </nav>

            {/* Search Bar */}
            <div className="hidden lg:flex items-center space-x-3 max-w-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Track your package..." 
                  className="pl-10 bg-gray-50 border-gray-200 focus:border-blue-500"
                />
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.email}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          CamerPulse Account
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/logistics/company-portal" className="cursor-pointer">
                        <Building className="mr-2 h-4 w-4" />
                        Company Portal
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/logistics/shipments" className="cursor-pointer">
                        <Package className="mr-2 h-4 w-4" />
                        My Shipments
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/logistics/admin" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Portal
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <Button variant="ghost" asChild>
                    <Link to="/auth">Sign in</Link>
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
                    <Link to="/auth">Get Started</Link>
                  </Button>
                </div>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={toggleMobileMenu}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-white border-t md:hidden">
          <div className="container mx-auto px-4 py-6">
            {/* Mobile Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Track your package..." 
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-4">
              <Link 
                to="/logistics" 
                className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Truck className="h-5 w-5" />
                <span>Home</span>
              </Link>
              <Link 
                to="/logistics/tracking" 
                className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MapPin className="h-5 w-5" />
                <span>Track Package</span>
              </Link>
              <Link 
                to="/logistics/companies" 
                className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Building className="h-5 w-5" />
                <span>Delivery Companies</span>
              </Link>
              <Link 
                to="/logistics/ship" 
                className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Package className="h-5 w-5" />
                <span>Ship Package</span>
              </Link>
            </nav>

            {/* Mobile Auth */}
            {!user && (
              <div className="mt-8 space-y-3">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                    Sign in
                  </Link>
                </Button>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" asChild>
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};