import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Menu,
  Home, 
  FileText, 
  Users, 
  BarChart3, 
  Settings,
  Plus,
  Search,
  Building,
  Award,
  Shield,
  Bell,
  User,
  LogOut
} from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';

interface MobileNavigationProps {
  userRole?: 'citizen' | 'bidder' | 'issuer' | 'admin' | 'government';
  user?: any;
}

export default function MobileNavigation({ userRole = 'citizen', user }: MobileNavigationProps) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;
  const isActivePath = (path: string) => location.pathname.startsWith(path);

  // Role-based navigation items
  const getNavigationItems = () => {
    const baseItems = [
      { path: '/', label: 'Home', icon: Home, roles: ['citizen', 'bidder', 'issuer', 'admin', 'government'] },
      
      { path: '/search', label: 'Advanced Search', icon: Search, roles: ['citizen', 'bidder', 'issuer', 'admin', 'government'] }
    ];

    const authenticatedItems = [
      { path: '/my-bids', label: 'My Bids', icon: Users, roles: ['bidder'] },
      
      { path: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['issuer', 'admin'] },
      { path: '/verification', label: 'Business Verification', icon: Shield, roles: ['bidder', 'issuer'] },
      { path: '/admin', label: 'Admin Panel', icon: Settings, roles: ['admin'] },
      { path: '/government', label: 'Gov Dashboard', icon: Building, roles: ['government'] }
    ];

    if (!user) return baseItems;

    return [...baseItems, ...authenticatedItems].filter(item => 
      item.roles.includes(userRole)
    );
  };

  const navigationItems = getNavigationItems();

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        
        <SheetContent side="left" className="w-80">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center space-x-2 pb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold">CamerPulse</span>
                  {userRole !== 'citizen' && (
                    <Badge variant="secondary" className="text-xs">
                      {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                    </Badge>
                  )}
                </div>
                {user && (
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                )}
              </div>
            </div>

            <Separator className="mb-4" />

            {/* Navigation Items */}
            <div className="flex-1 space-y-2">
              {navigationItems.map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  onClick={handleLinkClick}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-md text-sm transition-colors w-full ${
                    isActive(item.path) || isActivePath(item.path) 
                      ? 'bg-muted text-primary font-medium' 
                      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}

            </div>

            {/* Footer Actions */}
            <div className="pt-4 space-y-2">
              <Separator className="mb-4" />
              
              {user ? (
                <>
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Account
                      </p>
                    </div>
                  </div>
                  
                  <Link 
                    to="/auth"
                    onClick={handleLinkClick}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </Link>
                </>
              ) : (
                <Link 
                  to="/auth"
                  onClick={handleLinkClick}
                  className="flex items-center space-x-3 px-3 py-3 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors w-full"
                >
                  <User className="w-5 h-5" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}