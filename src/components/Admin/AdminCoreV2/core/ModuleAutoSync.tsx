import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock } from 'lucide-react';

interface ModuleAutoSyncProps {
  isRunning: boolean;
  lastSync?: string;
  onTriggerSync: () => void;
}

export const ModuleAutoSync: React.FC<ModuleAutoSyncProps> = ({
  isRunning,
  lastSync,
  onTriggerSync
}) => {
  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Badge variant="outline" className="bg-background border-border shadow-lg p-2">
        <Zap className={`h-3 w-3 mr-1 ${isRunning ? 'animate-pulse text-cm-green' : 'text-muted-foreground'}`} />
        Auto-Sync {isRunning ? 'Running' : 'Ready'}
        {lastSync && (
          <span className="ml-2 text-xs text-muted-foreground">
            <Clock className="h-2 w-2 mr-1 inline" />
            {new Date(lastSync).toLocaleTimeString()}
          </span>
        )}
      </Badge>
    </div>
  );
};