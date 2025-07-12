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
  
  const claimFee = type === 'politician' ? 500000 : 1000000;
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

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

  return (
    <>
      <Button
        variant="outline"
        className={`gap-2 ${className}`}
        onClick={() => setShowModal(true)}
      >
        <Shield className="h-4 w-4" />
        Claim This {type === 'politician' ? 'Profile' : 'Page'}
        <Badge variant="secondary" className="ml-1">
          {formatAmount(claimFee)}
        </Badge>
      </Button>

      <ClaimProfileModal
        open={showModal}
        onClose={() => setShowModal(false)}
        type={type}
        targetName={targetName}
        targetId={targetId}
        claimFee={claimFee}
      />
    </>
  );
};