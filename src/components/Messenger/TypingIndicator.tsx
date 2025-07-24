import React from 'react';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  message: string;
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  message, 
  className 
}) => {
  if (!message) return null;

  return (
    <div className={cn('flex items-center space-x-2 px-4 py-2', className)}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-sm text-muted-foreground italic">{message}</span>
    </div>
  );
};