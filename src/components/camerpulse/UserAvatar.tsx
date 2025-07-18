/**
 * UserAvatar Component
 * 
 * Unified avatar component for CamerPulse users with verification indicators
 */

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Shield, Globe, Crown, Star } from 'lucide-react';
import { ComponentSize, BaseUser, CivicUser } from './types';

interface UserAvatarProps {
  user: BaseUser | CivicUser;
  size?: 'sm' | 'default' | 'lg' | 'xl' | '2xl';
  showVerification?: boolean;
  showDiaspora?: boolean;
  showOfficial?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  default: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  '2xl': 'w-20 h-20'
};

const textSizeClasses = {
  sm: 'text-xs',
  default: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
  '2xl': 'text-xl'
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'default',
  showVerification = true,
  showDiaspora = true,
  showOfficial = true,
  className = '',
  onClick
}) => {
  const civicUser = user as CivicUser;
  const isOfficial = civicUser.role && 
    (civicUser.role.toLowerCase().includes('ministre') || 
     civicUser.role.toLowerCase().includes('député') ||
     civicUser.role.toLowerCase().includes('président'));

  const getInitials = () => {
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <Avatar 
        className={`${sizeClasses[size]} border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer`}
        onClick={onClick}
      >
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback className={`bg-primary text-primary-foreground ${textSizeClasses[size]}`}>
          {getInitials()}
        </AvatarFallback>
      </Avatar>

      {/* Verification Badges */}
      <div className="absolute -bottom-1 -right-1 flex flex-col gap-1">
        {/* Official Badge */}
        {showOfficial && isOfficial && (
          <Badge className="bg-cm-yellow text-cm-yellow-foreground p-1 min-w-0 h-5 w-5 rounded-full flex items-center justify-center">
            <Crown className="w-3 h-3" />
          </Badge>
        )}

        {/* Verification Badge */}
        {showVerification && user.verified && (
          <Badge className="bg-cm-green text-white p-1 min-w-0 h-5 w-5 rounded-full flex items-center justify-center">
            <Shield className="w-3 h-3" />
          </Badge>
        )}

        {/* Diaspora Badge */}
        {showDiaspora && civicUser.isDiaspora && (
          <Badge className="bg-primary text-primary-foreground p-1 min-w-0 h-5 w-5 rounded-full flex items-center justify-center">
            <Globe className="w-3 h-3" />
          </Badge>
        )}
      </div>

      {/* Status Indicator */}
      <div className="absolute -top-1 -right-1">
        <div className="w-3 h-3 bg-cm-green rounded-full border-2 border-background"></div>
      </div>
    </div>
  );
};