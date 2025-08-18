import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AppLayout } from '@/components/Layout/AppLayout';
import { EnhancedPoliticalProfile } from '@/components/Political/EnhancedPoliticalProfile';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const MPDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // Extract ID from slug (format: mp-name-id)
  const id = slug?.split('-').pop();
  
  const { data: mp, isLoading, error } = useQuery({
    queryKey: ['mp', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mps')
        .select(`
          *,
          political_parties (
            name,
            acronym,
            logo_url
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  return (
    <>
      <Helmet>
        <title>
          {mp ? `${mp.full_name} - MP | CamerPulse` : 'MP Profile | CamerPulse'}
        </title>
        <meta 
          name="description" 
          content={
            mp 
              ? `Learn about MP ${mp.full_name} representing ${mp.constituency}. View their legislative record, ratings, and civic engagement on CamerPulse.`
              : 'View detailed MP profile including legislative record, civic ratings, and public engagement on CamerPulse.'
          }
        />
        <meta 
          name="keywords" 
          content={`${mp?.full_name || 'MP'}, Cameroon parliament, ${mp?.constituency || 'constituency'} representation, legislative record, civic engagement, CamerPulse`}
        />
        <link rel="canonical" href={`https://camerpulse.com/mps/${slug}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={mp ? `${mp.full_name} - MP | CamerPulse` : 'MP Profile | CamerPulse'} />
        <meta property="og:description" content={mp ? `Learn about MP ${mp.full_name} representing ${mp.constituency}. View their legislative record, ratings, and civic engagement.` : 'View detailed MP profile on CamerPulse.'} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`https://camerpulse.com/mps/${slug}`} />
        {mp?.profile_picture_url && <meta property="og:image" content={mp.profile_picture_url} />}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={mp ? `${mp.full_name} - MP | CamerPulse` : 'MP Profile | CamerPulse'} />
        <meta name="twitter:description" content={mp ? `Learn about MP ${mp.full_name} representing ${mp.constituency}.` : 'View detailed MP profile on CamerPulse.'} />
        {mp?.profile_picture_url && <meta name="twitter:image" content={mp.profile_picture_url} />}
        
        {/* Structured Data */}
        {mp && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": mp.full_name,
              "jobTitle": "Member of Parliament",
              "worksFor": {
                "@type": "GovernmentOrganization",
                "name": "Cameroon National Assembly"
              },
              "address": {
                "@type": "PostalAddress",
                "addressRegion": mp.region,
                "addressLocality": mp.constituency,
                "addressCountry": "Cameroon"
              },
              "image": mp.profile_picture_url,
              "url": `https://camerpulse.com/mps/${slug}`,
              "memberOf": mp.political_parties ? {
                "@type": "PoliticalParty",
                "name": mp.political_parties.name
              } : undefined
            })}
          </script>
        )}
      </Helmet>
      
      <AppLayout>
        <EnhancedPoliticalProfile 
          politician={mp} 
          type="mp" 
          isLoading={isLoading}
          error={error}
        />
      </AppLayout>
    </>
  );
};

export default MPDetailPage;