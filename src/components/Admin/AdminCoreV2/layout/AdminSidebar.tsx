import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { X, ChevronLeft, ChevronRight, Activity, Zap } from 'lucide-react';

interface AdminModule {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  permission: string;
}

interface SystemModule {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'broken';
  last_sync: string;
  version: string;
}

interface AdminSidebarProps {
  modules: AdminModule[];
  activeModule: string;
  setActiveModule: (module: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
  adminRole: any;
  systemModules?: SystemModule[];
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  modules,
  activeModule,
  setActiveModule,
  sidebarOpen,
  setSidebarOpen,
  isMobile,
  adminRole,
  systemModules
}) => {
  if (!sidebarOpen && isMobile) return null;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full bg-card border-r border-border z-50 transition-all duration-300",
        sidebarOpen ? "w-64" : "w-16",
        isMobile ? "shadow-lg" : ""
      )}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-civic flex items-center justify-center mr-2">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-sm">Admin Core</h2>
                  <p className="text-xs text-muted-foreground">v2.0</p>
                </div>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5"
            >
              {isMobile ? (
                <X className="h-4 w-4" />
              ) : sidebarOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Admin Role Badge */}
        {sidebarOpen && (
          <div className="p-4">
            <Badge 
              variant="default" 
              className="w-full justify-center bg-gradient-civic text-white"
            >
              {adminRole?.role?.toUpperCase() || 'ADMIN'}
            </Badge>
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-2 py-2">
            {modules.map((module) => {
              const Icon = module.icon;
              const isActive = activeModule === module.id;
              
              return (
                <Button
                  key={module.id}
                  variant="ghost"
                  onClick={() => setActiveModule(module.id)}
                  className={cn(
                    "w-full justify-start transition-all duration-200",
                    sidebarOpen ? "px-3" : "px-2",
                    isActive ? "bg-primary/10 text-primary border-r-2 border-primary" : "hover:bg-muted/50",
                    !sidebarOpen && "justify-center"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-primary" : module.color,
                    sidebarOpen && "mr-3"
                  )} />
                  {sidebarOpen && (
                    <span className="truncate">{module.label}</span>
                  )}
                </Button>
              );
            })}
          </div>

          {sidebarOpen && (
            <>
              <Separator className="my-4" />
              
              {/* System Status */}
              <div className="pb-4">
                <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-3">
                  SYSTEM STATUS
                </h3>
                <div className="space-y-1">
                  {systemModules?.slice(0, 5).map((module) => (
                    <div key={module.id} className="flex items-center justify-between px-3 py-1 text-xs">
                      <span className="truncate">{module.name}</span>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        module.status === 'active' ? "bg-cm-green" :
                        module.status === 'inactive' ? "bg-yellow-500" :
                        "bg-red-500"
                      )} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </ScrollArea>

        {/* Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Auto-Sync</span>
              <div className="flex items-center">
                <Zap className="h-3 w-3 mr-1 text-cm-green" />
                <span className="text-cm-green">Active</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};