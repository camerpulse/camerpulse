import React from 'react';
import { UnifiedPoliticalCard } from '@/components/Political/UnifiedPoliticalCard';
import { MP } from '@/hooks/useMPs';

interface MPCardProps {
  mp: MP;
  className?: string;
}

export function MPCard({ mp, className }: MPCardProps) {
  return (
    <UnifiedPoliticalCard 
      entity={mp} 
      entityType="mp" 
      className={className}
    />
  );
}