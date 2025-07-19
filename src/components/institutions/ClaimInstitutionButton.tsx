import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Crown, Lock, Building2 } from 'lucide-react';
import { ClaimInstitutionModal } from './ClaimInstitutionModal';

interface ClaimInstitutionButtonProps {
  institutionType: 'school' | 'hospital' | 'pharmacy';
  institutionId: string;
  institutionName: string;
  isClaimed?: boolean;
  isClaimable?: boolean;
  className?: string;
}

const CLAIM_FEES = {
  school: 25000, // NGN
  hospital: 50000, // NGN  
  pharmacy: 15000 // NGN
};

const INSTITUTION_ICONS = {
  school: '🏫',
  hospital: '🏥',
  pharmacy: '💊'
};

export const ClaimInstitutionButton = ({
  institutionType,
  institutionId,
  institutionName,
  isClaimed = false,
  isClaimable = true,
  className = ''
}: ClaimInstitutionButtonProps) => {
  const [showModal, setShowModal] = useState(false);
  
  const claimFee = CLAIM_FEES[institutionType];
  const icon = INSTITUTION_ICONS[institutionType];
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isClaimed) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        disabled
        className={`flex items-center gap-2 ${className}`}
      >
        <Shield className="h-4 w-4 text-green-600" />
        <span>Claimed</span>
        <Badge variant="secondary" className="ml-1">
          <Crown className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      </Button>
    );
  }

  if (!isClaimable) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        disabled
        className={`flex items-center gap-2 opacity-50 ${className}`}
      >
        <Lock className="h-4 w-4" />
        <span>Not Claimable</span>
      </Button>
    );
  }

  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-2 border-dashed hover:border-solid transition-all ${className}`}
      >
        <Building2 className="h-4 w-4" />
        <span>Claim {icon}</span>
        <Badge variant="outline" className="ml-1 text-xs">
          {formatAmount(claimFee)}
        </Badge>
      </Button>

      <ClaimInstitutionModal
        open={showModal}
        onClose={() => setShowModal(false)}
        institutionType={institutionType}
        institutionId={institutionId}
        institutionName={institutionName}
        claimFee={claimFee}
      />
    </>
  );
};