import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AppLayout } from '@/components/Layout/AppLayout';
import { EnhancedPoliticalProfile } from '@/components/Political/EnhancedPoliticalProfile';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const EnhancedMinisterDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: minister, isLoading, error } = useQuery({
    queryKey: ['minister', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No minister slug provided');
      
      const { data, error } = await supabase
        .from('ministers')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug
  });

  const ministerName = minister?.name || minister?.full_name || 'Minister';
  const ministerPosition = minister?.position || minister?.office || 'Government Minister';

  return (
    <>
      <Helmet>
        <title>{ministerName} - {ministerPosition} | CamerPulse</title>
        <meta 
          name="description" 
          content={`Detailed profile of ${ministerName}, ${ministerPosition}. View transparency ratings, performance metrics, ministerial achievements, and contact information.`}
        />
        <meta 
          name="keywords" 
          content={`${ministerName}, Cameroon minister, government cabinet, ministerial profile, transparency rating, performance metrics`}
        />
        <link rel="canonical" href={`https://camerpulse.com/ministers/${slug}`} />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={`${ministerName} - ${ministerPosition} | CamerPulse`} />
        <meta 
          property="og:description" 
          content={`Detailed profile of ${ministerName} with transparency ratings and performance metrics.`}
        />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`https://camerpulse.com/ministers/${slug}`} />
        {minister?.photo_url && (
          <meta property="og:image" content={minister.photo_url} />
        )}
        
        {/* Structured Data */}
        {minister && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": ministerName,
              "jobTitle": ministerPosition,
              "worksFor": {
                "@type": "Government",
                "name": "Government of Cameroon"
              },
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "CM"
              },
              ...(minister.photo_url && { "image": minister.photo_url }),
              ...(minister.email && { "email": minister.email }),
              ...(minister.phone && { "telephone": minister.phone })
            })}
          </script>
        )}
      </Helmet>

      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <EnhancedPoliticalProfile
            entity={minister}
            type="minister"
            isLoading={isLoading}
          />
        </div>
      </AppLayout>
    </>
  );
};

export default EnhancedMinisterDetail;