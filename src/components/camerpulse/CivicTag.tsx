/**
 * CivicTag Component
 * 
 * Standardized tag/badge component for civic categories and statuses
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Globe,
  MapPin,
  Building,
  Users,
  Vote,
  Gavel
} from 'lucide-react';
import { ComponentSize, VerificationStatus } from './types';

type CivicTagType = 
  | 'official' 
  | 'verified' 
  | 'warning' 
  | 'success' 
  | 'pending' 
  | 'diaspora'
  | 'region'
  | 'party'
  | 'ministry'
  | 'election'
  | 'legislation'
  | 'custom';

interface CivicTagProps {
  type: CivicTagType;
  label: string;
  size?: 'sm' | 'default' | 'lg';
  icon?: boolean;
  className?: string;
  onClick?: () => void;
}

const tagConfig = {
  official: {
    icon: Crown,
    className: 'bg-cm-yellow text-cm-yellow-foreground border-cm-yellow/30'
  },
  verified: {
    icon: Shield,
    className: 'bg-cm-green text-white border-cm-green/30'
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-cm-red text-white border-cm-red/30'
  },
  success: {
    icon: CheckCircle,
    className: 'bg-cm-green text-white border-cm-green/30'
  },
  pending: {
    icon: Clock,
    className: 'bg-muted text-muted-foreground border-muted/30'
  },
  diaspora: {
    icon: Globe,
    className: 'bg-primary text-primary-foreground border-primary/30'
  },
  region: {
    icon: MapPin,
    className: 'bg-secondary text-secondary-foreground border-secondary/30'
  },
  party: {
    icon: Users,
    className: 'bg-accent text-accent-foreground border-accent/30'
  },
  ministry: {
    icon: Building,
    className: 'bg-gradient-civic text-white border-transparent'
  },
  election: {
    icon: Vote,
    className: 'bg-cm-yellow text-cm-yellow-foreground border-cm-yellow/30'
  },
  legislation: {
    icon: Gavel,
    className: 'bg-secondary text-secondary-foreground border-secondary/30'
  },
  custom: {
    icon: Shield,
    className: 'bg-muted text-muted-foreground border-muted/30'
  }
};

const sizeClasses = {
  sm: 'text-xs px-2 py-1',
  default: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-2'
};

const iconSizeClasses = {
  sm: 'w-3 h-3',
  default: 'w-4 h-4',
  lg: 'w-5 h-5'
};

export const CivicTag: React.FC<CivicTagProps> = ({
  type,
  label,
  size = 'sm',
  icon = true,
  className = '',
  onClick
}) => {
  const config = tagConfig[type];
  const IconComponent = config.icon;

  return (
    <Badge
      className={`
        ${config.className} 
        ${sizeClasses[size]} 
        ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
        ${className}
        flex items-center gap-1 font-medium border
      `}
      onClick={onClick}
    >
      {icon && (
        <IconComponent className={iconSizeClasses[size]} />
      )}
      {label}
    </Badge>
  );
};

// Preset tag components for common use cases
export const OfficialTag = ({ label, ...props }: Omit<CivicTagProps, 'type'>) => (
  <CivicTag type="official" label={label} {...props} />
);

export const VerifiedTag = ({ label = 'Verified', ...props }: Omit<CivicTagProps, 'type' | 'label'> & { label?: string }) => (
  <CivicTag type="verified" label={label} {...props} />
);

export const DiasporaTag = ({ label = 'Diaspora', ...props }: Omit<CivicTagProps, 'type' | 'label'> & { label?: string }) => (
  <CivicTag type="diaspora" label={label} {...props} />
);

export const RegionTag = ({ region, ...props }: Omit<CivicTagProps, 'type' | 'label'> & { region: string }) => (
  <CivicTag type="region" label={region} {...props} />
);