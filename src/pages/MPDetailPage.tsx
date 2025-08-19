import React from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { EnhancedPoliticalProfile } from '@/components/Political/EnhancedPoliticalProfile';
import { useMPSlug } from '@/hooks/useSlugResolver';
import { EntitySEO } from '@/components/SEO/EntitySEO';

const MPDetailPage: React.FC = () => {
  const { entity: mp, loading: isLoading, error } = useMPSlug();

  return (
    <AppLayout>
      <EntitySEO 
        entity={mp}
        entityType="mp"
        isLoading={isLoading}
      />
      <EnhancedPoliticalProfile 
        politician={mp} 
        type="mp" 
        isLoading={isLoading}
        error={error}
      />
    </AppLayout>
  );
};

export default MPDetailPage;