import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Crown, Star, Lightbulb, Loader2 } from 'lucide-react';

interface ThemeLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const ThemeLoading: React.FC<ThemeLoadingProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}) => {
  const { currentTheme } = useTheme();

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'lg': return 'w-12 h-12';
      default: return 'w-8 h-8';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'text-sm';
      case 'lg': return 'text-lg';
      default: return 'text-base';
    }
  };

  const getThemeSpecificLoader = () => {
    switch (currentTheme.id) {
      case 'lux-aeterna':
        return (
          <div className="flex flex-col items-center space-y-4">
            {/* Patriotic crown spinning */}
            <div className="relative">
              <Crown className={`${getSizeClasses()} text-primary animate-spin`} />
              <div className="absolute inset-0 animate-eternal-glow">
                <Crown className={`${getSizeClasses()} text-secondary opacity-50`} />
              </div>
            </div>
            
            {/* Golden light pulses */}
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-secondary rounded-full animate-patriotic-pulse"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-patriotic-pulse animation-delay-300"></div>
              <div className="w-2 h-2 bg-accent rounded-full animate-patriotic-pulse animation-delay-500"></div>
            </div>
            
            {text && (
              <p className={`${getTextSize()} text-gradient-patriotic font-medium animate-hope-rise`}>
                {currentTheme.id === 'lux-aeterna' ? 'Illuminating the path...' : text}
              </p>
            )}
          </div>
        );

      case 'emergence-2035':
        return (
          <div className="flex flex-col items-center space-y-4">
            {/* Heartbeat star */}
            <div className="relative">
              <Star className={`${getSizeClasses()} text-primary animate-heartbeat`} />
              <div className="absolute inset-0 animate-pulse">
                <Star className={`${getSizeClasses()} text-cm-yellow opacity-30`} />
              </div>
            </div>
            
            {/* Progress bars inspired by flag colors */}
            <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cm-green via-cm-red to-cm-yellow animate-slide-shine"></div>
            </div>
            
            {text && (
              <p className={`${getTextSize()} text-gradient-flag font-medium animate-fade-in-up`}>
                Building the future...
              </p>
            )}
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center space-y-4">
            {/* Standard rotating loader */}
            <Loader2 className={`${getSizeClasses()} text-primary animate-spin`} />
            
            {text && (
              <p className={`${getTextSize()} text-muted-foreground`}>
                {text}
              </p>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      {getThemeSpecificLoader()}
    </div>
  );
};

// Skeleton loader with theme awareness
export const ThemeSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  const { currentTheme } = useTheme();
  
  const getSkeletonClass = () => {
    switch (currentTheme.id) {
      case 'lux-aeterna':
        return 'bg-gradient-to-r from-primary/10 via-secondary/20 to-primary/10 animate-golden-shimmer';
      case 'emergence-2035':
        return 'bg-gradient-to-r from-cm-green/10 via-cm-yellow/20 to-cm-red/10 animate-slide-shine';
      default:
        return 'bg-muted animate-pulse';
    }
  };

  return (
    <div className={`rounded-md ${getSkeletonClass()} ${className}`} />
  );
};