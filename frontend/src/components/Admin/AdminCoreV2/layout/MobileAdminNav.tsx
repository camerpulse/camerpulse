import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MobileAdminNavProps {
  modules: any[];
  activeModule: string;
  setActiveModule: (module: string) => void;
  notifications: any[];
}

export const MobileAdminNav: React.FC<MobileAdminNavProps> = ({
  modules,
  activeModule,
  setActiveModule,
  notifications
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-30 p-2">
      <div className="flex items-center justify-around">
        {modules.slice(0, 4).map((module) => {
          const Icon = module.icon;
          return (
            <Button
              key={module.id}
              variant="ghost"
              onClick={() => setActiveModule(module.id)}
              className={`flex flex-col items-center gap-1 h-12 ${
                activeModule === module.id ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs truncate">{module.label.split(' ')[0]}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};