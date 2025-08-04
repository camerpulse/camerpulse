import { AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FeatureDisabledBannerProps {
  featureName: string;
  reason?: string;
  type?: 'warning' | 'info';
  children?: React.ReactNode;
}

export const FeatureDisabledBanner = ({ 
  featureName, 
  reason = 'This feature has been temporarily disabled',
  type = 'warning',
  children 
}: FeatureDisabledBannerProps) => {
  const Icon = type === 'warning' ? AlertTriangle : Info;
  
  return (
    <Alert className={`mb-4 ${type === 'warning' ? 'border-yellow-500' : 'border-blue-500'}`}>
      <Icon className={`h-4 w-4 ${type === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`} />
      <AlertDescription>
        <div className="font-medium mb-1">
          {featureName} is currently disabled
        </div>
        <div className="text-sm text-muted-foreground">
          {reason}
        </div>
        {children}
      </AlertDescription>
    </Alert>
  );
};