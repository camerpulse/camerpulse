import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AppLayout } from '@/components/Layout/AppLayout';
import { EnhancedPoliticalProfile } from '@/components/Political/EnhancedPoliticalProfile';
import { useSenator } from '@/hooks/useSenators';

const SenatorDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // Extract ID from slug (format: senator-name-id)
  const id = slug?.split('-').pop();
  
  const { data: senator, isLoading, error } = useSenator(id || '');

  return (
    <>
      <Helmet>
        <title>
          {senator ? `${senator.full_name} - Senator | CamerPulse` : 'Senator Profile | CamerPulse'}
        </title>
        <meta 
          name="description" 
          content={
            senator 
              ? `Learn about Senator ${senator.full_name} representing ${senator.region}. View their legislative record, ratings, and civic engagement on CamerPulse.`
              : 'View detailed senator profile including legislative record, civic ratings, and public engagement on CamerPulse.'
          }
        />
        <meta 
          name="keywords" 
          content={`${senator?.full_name || 'senator'}, Cameroon senate, ${senator?.region || 'political'} representation, legislative record, civic engagement, CamerPulse`}
        />
        <link rel="canonical" href={`https://camerpulse.com/senators/${slug}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={senator ? `${senator.full_name} - Senator | CamerPulse` : 'Senator Profile | CamerPulse'} />
        <meta property="og:description" content={senator ? `Learn about Senator ${senator.full_name} representing ${senator.region}. View their legislative record, ratings, and civic engagement.` : 'View detailed senator profile on CamerPulse.'} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`https://camerpulse.com/senators/${slug}`} />
        {senator?.profile_picture_url && <meta property="og:image" content={senator.profile_picture_url} />}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={senator ? `${senator.full_name} - Senator | CamerPulse` : 'Senator Profile | CamerPulse'} />
        <meta name="twitter:description" content={senator ? `Learn about Senator ${senator.full_name} representing ${senator.region}.` : 'View detailed senator profile on CamerPulse.'} />
        {senator?.profile_picture_url && <meta name="twitter:image" content={senator.profile_picture_url} />}
        
        {/* Structured Data */}
        {senator && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": senator.full_name,
              "jobTitle": "Senator",
              "worksFor": {
                "@type": "GovernmentOrganization",
                "name": "Cameroon Senate"
              },
              "address": {
                "@type": "PostalAddress",
                "addressRegion": senator.region,
                "addressCountry": "Cameroon"
              },
              "image": senator.profile_picture_url,
              "url": `https://camerpulse.com/senators/${slug}`
            })}
          </script>
        )}
      </Helmet>
      
      <AppLayout>
        <EnhancedPoliticalProfile 
          politician={senator} 
          type="senator" 
          isLoading={isLoading}
          error={error}
        />
      </AppLayout>
    </>
  );
};

export default SenatorDetailPage;