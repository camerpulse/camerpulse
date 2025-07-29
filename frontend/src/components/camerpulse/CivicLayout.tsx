import React from 'react';

interface CivicLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const CivicLayout: React.FC<CivicLayoutProps> = ({ children, className }) => (
  <div className={`min-h-screen bg-background ${className}`}>
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {children}
    </div>
  </div>
);