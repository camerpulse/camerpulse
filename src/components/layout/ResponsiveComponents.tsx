import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  maxWidth = 'xl',
  padding = 'md'
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-7xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-2 py-2',
    md: 'px-4 py-6',
    lg: 'px-6 py-8'
  };

  return (
    <div className={cn(
      'container mx-auto w-full',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { default: 1, md: 2, lg: 3 },
  gap = 'md'
}) => {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2', 
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  const gridClasses = [
    'grid',
    cols.default && colsClasses[cols.default],
    cols.sm && `sm:${colsClasses[cols.sm]}`,
    cols.md && `md:${colsClasses[cols.md]}`,
    cols.lg && `lg:${colsClasses[cols.lg]}`,
    cols.xl && `xl:${colsClasses[cols.xl]}`,
    gapClasses[gap]
  ].filter(Boolean).join(' ');

  return (
    <div className={cn(gridClasses, className)}>
      {children}
    </div>
  );
};

interface MobileMenuProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  children,
  isOpen,
  onClose
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Slide-out menu */}
      <div className={cn(
        'fixed top-0 left-0 h-full w-64 bg-background border-r transform transition-transform duration-300 ease-in-out z-50 lg:hidden',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {children}
      </div>
    </>
  );
};

interface FlexLayoutProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  gap?: 'sm' | 'md' | 'lg';
}

export const FlexLayout: React.FC<FlexLayoutProps> = ({
  children,
  className,
  direction = 'row',
  align = 'start',
  justify = 'start',
  wrap = false,
  gap = 'md'
}) => {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  return (
    <div className={cn(
      'flex',
      directionClasses[direction],
      alignClasses[align],
      justifyClasses[justify],
      wrap && 'flex-wrap',
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};

// Responsive text sizing utility
interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  size?: {
    base?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    sm?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    md?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    lg?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  };
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  className,
  size = { base: 'base' },
  weight = 'normal'
}) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl'
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  const textClasses = [
    size.base && sizeClasses[size.base],
    size.sm && `sm:${sizeClasses[size.sm]}`,
    size.md && `md:${sizeClasses[size.md]}`,
    size.lg && `lg:${sizeClasses[size.lg]}`,
    weightClasses[weight]
  ].filter(Boolean).join(' ');

  return (
    <span className={cn(textClasses, className)}>
      {children}
    </span>
  );
};