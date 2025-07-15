import React, { ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, ImageOff } from 'lucide-react';

interface SafeRenderProps {
  children: ReactNode;
  fallback?: ReactNode;
  condition?: boolean;
  errorMessage?: string;
}

export const SafeRender: React.FC<SafeRenderProps> = ({ 
  children, 
  fallback, 
  condition = true, 
  errorMessage = "Content unavailable" 
}) => {
  if (!condition) {
    return fallback || (
      <div className="p-4 text-center text-muted-foreground">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">{errorMessage}</p>
      </div>
    );
  }

  try {
    return <>{children}</>;
  } catch (error) {
    console.error('SafeRender caught error:', error);
    return fallback || (
      <Alert className="border-destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Component failed to load. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }
};

interface SafeImageProps {
  src?: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  onError?: () => void;
}

export const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  alt, 
  fallbackSrc = '/placeholder.svg', 
  className = '',
  onError 
}) => {
  const [imgSrc, setImgSrc] = React.useState(src || fallbackSrc);
  const [hasError, setHasError] = React.useState(false);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(true);
      onError?.();
    } else {
      // Even fallback failed
      setHasError(true);
    }
  };

  React.useEffect(() => {
    setImgSrc(src || fallbackSrc);
    setHasError(false);
  }, [src, fallbackSrc]);

  if (hasError && imgSrc === fallbackSrc) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <ImageOff className="w-8 h-8 text-muted-foreground opacity-50" />
      </div>
    );
  }

  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
};

interface SafeDataProps<T> {
  data: T;
  children: (data: NonNullable<T>) => ReactNode;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
}

export function SafeData<T>({ 
  data, 
  children, 
  fallback,
  loadingComponent 
}: SafeDataProps<T>) {
  // Handle loading state
  if (data === undefined) {
    return loadingComponent || (
      <div className="animate-pulse bg-muted rounded h-8 w-full" />
    );
  }

  // Handle null/empty data
  if (data === null || (Array.isArray(data) && data.length === 0)) {
    return fallback || (
      <div className="p-4 text-center text-muted-foreground">
        <p className="text-sm">No data available</p>
      </div>
    );
  }

  try {
    return <>{children(data as NonNullable<T>)}</>;
  } catch (error) {
    console.error('SafeData render error:', error);
    return fallback || (
      <div className="p-4 text-center text-destructive">
        <p className="text-sm">Error rendering data</p>
      </div>
    );
  }
}