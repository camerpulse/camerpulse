import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Menu, Search, Bell, Activity, X } from 'lucide-react';
import { AdminGlobalSearch } from '../components/AdminGlobalSearch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface AdminHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notifications: any[];
  isMobile: boolean;
  onModuleNavigate?: (moduleId: string) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  sidebarOpen,
  setSidebarOpen,
  searchQuery,
  setSearchQuery,
  notifications,
  isMobile,
  onModuleNavigate
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <header className="bg-card border-b border-border p-4 lg:p-6">
      <div className="flex items-center justify-between">
        {isMobile ? (
          // Mobile Header Content
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold text-foreground">
              CamerPulse Admin
            </h1>
          </div>
        ) : (
          // Desktop Header Content
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
                Admin Core v2.0
              </h1>
              <p className="text-sm text-muted-foreground">
                Fully Synced Intelligence Control Suite
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          {/* Search */}
          {!isMobile && (
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search admin features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Notifications */}
          <Button variant="outline" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && (
              <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs bg-cm-red">
                {notifications.length}
              </Badge>
            )}
          </Button>

          {/* System Status */}
          <Badge variant="default" className="bg-cm-green text-white px-3 py-1">
            <Activity className="h-3 w-3 mr-1" />
            System Online
          </Badge>

          {/* Sidebar Toggle for Desktop */}
          {!isMobile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? 'Collapse' : 'Expand'}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};