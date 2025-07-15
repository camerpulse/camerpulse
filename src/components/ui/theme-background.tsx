import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeBackgroundProps {
  className?: string;
  children: React.ReactNode;
}

export const ThemeBackground: React.FC<ThemeBackgroundProps> = ({ className = "", children }) => {
  const { currentTheme } = useTheme();

  const getBackgroundElements = () => {
    switch (currentTheme.id) {
      case 'lux-aeterna':
        return (
          <>
            {/* Patriotic light rays */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-primary/20 to-transparent animate-eternal-glow" style={{transform: 'rotate(15deg)'}}></div>
              <div className="absolute top-0 left-1/2 w-1 h-full bg-gradient-to-b from-secondary/20 to-transparent animate-eternal-glow animation-delay-300" style={{transform: 'rotate(-10deg)'}}></div>
              <div className="absolute top-0 right-1/4 w-1 h-full bg-gradient-to-b from-accent/20 to-transparent animate-eternal-glow animation-delay-500" style={{transform: 'rotate(8deg)'}}></div>
            </div>
            
            {/* Patriotic stars */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-secondary rounded-full animate-patriotic-pulse"></div>
              <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-primary rounded-full animate-patriotic-pulse animation-delay-300"></div>
              <div className="absolute top-1/2 left-1/4 w-1.5 h-1.5 bg-accent rounded-full animate-patriotic-pulse animation-delay-500"></div>
              <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-secondary rounded-full animate-patriotic-pulse animation-delay-300"></div>
            </div>

            {/* Golden aura */}
            <div className="absolute inset-0 bg-gradient-radial from-secondary/5 via-transparent to-transparent animate-eternal-glow"></div>
          </>
        );

      case 'emergence-2035':
        return (
          <>
            {/* Flag-inspired geometric patterns */}
            <div className="absolute inset-0 overflow-hidden opacity-10">
              <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-r from-cm-green/30 to-transparent"></div>
              <div className="absolute top-1/3 left-0 w-full h-1/3 bg-gradient-to-r from-cm-red/30 to-transparent"></div>
              <div className="absolute top-2/3 left-0 w-full h-1/3 bg-gradient-to-r from-cm-yellow/30 to-transparent"></div>
            </div>

            {/* Heartbeat lines */}
            <div className="absolute inset-0">
              <svg className="absolute top-1/4 left-1/4 w-32 h-8 opacity-20" viewBox="0 0 120 30">
                <path 
                  d="M5,15 L20,15 L25,5 L30,25 L35,15 L50,15 L55,10 L60,20 L65,15 L115,15" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth="2" 
                  fill="none"
                  className="animate-heartbeat-line"
                />
              </svg>
              <svg className="absolute top-3/4 right-1/4 w-24 h-6 opacity-20" viewBox="0 0 80 20">
                <path 
                  d="M5,10 L15,10 L20,5 L25,15 L30,10 L70,10" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth="1.5" 
                  fill="none"
                  className="animate-heartbeat-line animation-delay-500"
                />
              </svg>
            </div>

            {/* Progress indicators */}
            <div className="absolute inset-0">
              <div className="absolute top-1/3 right-1/3 text-6xl font-bold text-primary/5 animate-pulse">2035</div>
            </div>
          </>
        );

      default:
        return (
          <>
            {/* Simple radial gradient */}
            <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent"></div>
            
            {/* Subtle pulse circles */}
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/5 rounded-full animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-accent/5 rounded-full animate-pulse animation-delay-300"></div>
          </>
        );
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Theme-specific background elements */}
      {getBackgroundElements()}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};