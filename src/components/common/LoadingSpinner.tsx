/**
 * LoadingSpinner Component
 * Reusable loading spinner with consistent styling
 */

import React from 'react';
import { cn } from '@/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'muted';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const colorClasses = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  muted: 'text-muted-foreground',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
  text,
}) => {
  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-current border-t-transparent',
          sizeClasses[size],
          colorClasses[color]
        )}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <span className={cn('text-sm', colorClasses[color])}>
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;