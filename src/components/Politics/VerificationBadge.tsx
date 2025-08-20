import { Badge } from '@/components/ui/badge';
import { Shield, Crown, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerificationBadgeProps {
  isClaimed?: boolean;
  isVerified?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const VerificationBadge = ({
  isClaimed = false,
  isVerified = false,
  className,
  size = 'md'
}: VerificationBadgeProps) => {
  if (!isClaimed && !isVerified) return null;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  if (isClaimed && isVerified) {
    return (
      <Badge 
        variant="default" 
        className={cn(
          'bg-gradient-to-r from-cm-yellow to-cm-green text-white gap-1 font-semibold',
          sizeClasses[size],
          className
        )}
      >
        <Crown className={iconSizes[size]} />
        Verified Profile
      </Badge>
    );
  }

  if (isClaimed) {
    return (
      <Badge 
        variant="default" 
        className={cn(
          'bg-cm-yellow text-cm-yellow-foreground gap-1 font-medium',
          sizeClasses[size],
          className
        )}
      >
        <Shield className={iconSizes[size]} />
        Claimed
      </Badge>
    );
  }

  if (isVerified) {
    return (
      <Badge 
        variant="default" 
        className={cn(
          'bg-cm-green text-cm-green-foreground gap-1 font-medium',
          sizeClasses[size],
          className
        )}
      >
        <CheckCircle className={iconSizes[size]} />
        Verified
      </Badge>
    );
  }

  return null;
};