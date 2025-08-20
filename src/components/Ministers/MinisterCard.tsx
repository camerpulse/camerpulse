import React from 'react';
import { UnifiedPoliticalCard } from '@/components/Political/UnifiedPoliticalCard';
import { Minister } from '@/hooks/useMinisters';

interface MinisterCardProps {
  minister: Minister;
  className?: string;
}

export function MinisterCard({ minister, className }: MinisterCardProps) {
  return (
    <UnifiedPoliticalCard 
      entity={minister} 
      entityType="minister" 
      className={className}
    />
  );
}