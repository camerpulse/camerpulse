import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Crown, Lock } from 'lucide-react';
import { ClaimProfileModal } from './ClaimProfileModal';

interface ClaimProfileButtonProps {
  type: 'politician' | 'party';
  targetName: string;
  targetId: string;
  isClaimed?: boolean;
  isClaimable?: boolean;
  className?: string;
}

export const ClaimProfileButton = ({
  type,
  targetName,
  targetId,
  isClaimed = false,
  isClaimable = true,
  className
}: ClaimProfileButtonProps) => {
  const [showModal, setShowModal] = useState(false);

  if (isClaimed) {
    return (
      <Badge variant="default" className={`gap-2 ${className}`}>
        <Crown className="h-3 w-3" />
        Claimed Profile
      </Badge>
    );
  }

  if (!isClaimable) {
    return (
      <Badge variant="secondary" className={`gap-2 ${className}`}>
        <Lock className="h-3 w-3" />
        Not Claimable
      </Badge>
    );
  }

  // Convert type to match the modal interface
  const profileType = type === 'politician' ? 'politician' : 'politician'; // For now, map party to politician

  return (
    <>
      <Button
        variant="outline"
        className={`gap-2 ${className}`}
        onClick={() => setShowModal(true)}
      >
        <Shield className="h-4 w-4" />
        Claim This {type === 'politician' ? 'Profile' : 'Page'}
      </Button>

      <ClaimProfileModal
        open={showModal}
        onClose={() => setShowModal(false)}
        profileId={targetId}
        profileName={targetName}
        profileType={profileType}
      />
    </>
  );
};