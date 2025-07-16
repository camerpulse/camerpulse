import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  badge?: string;
}

interface CollapsibleSidebarProps {
  items: SidebarItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

export const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({
  items,
  activeTab,
  onTabChange,
  isOpen,
  onToggle,
  isMobile,
}) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-card border-r border-border transition-transform duration-300 ease-in-out",
          isMobile
            ? "w-64"
            : isOpen
            ? "w-64"
            : "w-16",
          isMobile
            ? isOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0",
          "lg:relative lg:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {(isOpen || !isMobile) && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-flag rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CP</span>
              </div>
              {isOpen && (
                <div>
                  <h2 className="font-bold text-foreground">CamerPulse</h2>
                  <p className="text-xs text-muted-foreground">Admin Core</p>
                </div>
              )}
            </div>
          )}
          
          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="p-2"
            >
              {isOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Navigation Items */}
        <ScrollArea className="flex-1 p-2">
          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-12 text-left transition-all duration-200",
                    isActive && "bg-primary/10 text-primary border border-primary/20",
                    !isOpen && !isMobile && "px-2"
                  )}
                  onClick={() => onTabChange(item.id)}
                >
                  <Icon className={cn("h-5 w-5", item.color, isActive && "text-primary")} />
                  {(isOpen || isMobile) && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border">
          <div className={cn(
            "flex items-center gap-3",
            !isOpen && !isMobile && "justify-center"
          )}>
            <div className="w-8 h-8 bg-cm-green rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">AD</span>
            </div>
            {(isOpen || isMobile) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Admin User</p>
                <p className="text-xs text-muted-foreground truncate">
                  System Administrator
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};