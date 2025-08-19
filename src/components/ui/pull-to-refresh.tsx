import React from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
  pullProgress: number;
  canTrigger: boolean;
}

export const PullToRefreshIndicator: React.FC<PullToRefreshProps> = ({
  isPulling,
  pullDistance,
  isRefreshing,
  pullProgress,
  canTrigger,
}) => {
  if (!isPulling && !isRefreshing) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex justify-center transition-transform duration-200 ease-out"
      style={{
        transform: `translateY(${isPulling ? Math.min(pullDistance - 40, 40) : 0}px)`,
      }}
    >
      <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-b-lg px-4 py-2 shadow-lg">
        <div className="flex items-center gap-2 text-sm">
          <RefreshCw
            className={cn(
              "w-4 h-4 transition-all duration-200",
              isRefreshing ? "animate-spin" : "",
              canTrigger ? "text-primary" : "text-muted-foreground"
            )}
            style={{
              transform: `rotate(${pullProgress * 180}deg)`,
            }}
          />
          <span className={cn(
            "font-medium transition-colors duration-200",
            canTrigger ? "text-primary" : "text-muted-foreground"
          )}>
            {isRefreshing 
              ? "Actualisation..." 
              : canTrigger 
                ? "Release to refresh" 
                : "Pull to refresh"
            }
          </span>
        </div>
      </div>
    </div>
  );
};