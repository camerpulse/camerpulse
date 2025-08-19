import React from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { EnhancedPoliticalProfile } from '@/components/Political/EnhancedPoliticalProfile';
import { useSenatorSlug } from '@/hooks/useSlugResolver';
import { EntitySEO } from '@/components/SEO/EntitySEO';

const SenatorDetailPage: React.FC = () => {
  const { entity: senator, loading: isLoading, error } = useSenatorSlug();

  return (
    <AppLayout>
      <EntitySEO 
        entity={senator}
        entityType="senator"
        isLoading={isLoading}
      />
      <EnhancedPoliticalProfile 
        politician={senator} 
        type="senator" 
        isLoading={isLoading}
        error={error}
      />
    </AppLayout>
  );
};

export default SenatorDetailPage;