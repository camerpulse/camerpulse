import React from 'react';

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({ children, className }) => (
  <div className={`w-full max-w-md mx-auto px-4 ${className}`}>
    {children}
  </div>
);