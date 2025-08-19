import React from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { EnhancedPoliticalProfile } from '@/components/Political/EnhancedPoliticalProfile';
import { useMinisterSlug } from '@/hooks/useSlugResolver';
import { EntitySEO } from '@/components/SEO/EntitySEO';

const EnhancedMinisterDetail: React.FC = () => {
  const { entity: minister, loading: isLoading, error } = useMinisterSlug();

  return (
    <AppLayout>
      <EntitySEO 
        entity={minister}
        entityType="minister"
        isLoading={isLoading}
      />
      <div className="container mx-auto px-4 py-8">
        <EnhancedPoliticalProfile
          entity={minister}
          type="minister"
          isLoading={isLoading}
        />
      </div>
    </AppLayout>
  );
};

export default EnhancedMinisterDetail;