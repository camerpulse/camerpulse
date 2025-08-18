import React from 'react';
import { Helmet } from 'react-helmet-async';
import { AppLayout } from '@/components/Layout/AppLayout';
import { PoliticalDirectoryLayout } from '@/components/Political/PoliticalDirectoryLayout';
import { useMPs } from '@/hooks/useMPs';

const EnhancedMPs: React.FC = () => {
  const { data: mps, isLoading, error } = useMPs();

  return (
    <>
      <Helmet>
        <title>MPs Directory - Members of Parliament | CamerPulse</title>
        <meta 
          name="description" 
          content="Complete directory of all 180 Cameroon Members of Parliament with constituency details, transparency ratings, legislative performance, and civic engagement tracking." 
        />
        <meta 
          name="keywords" 
          content="Cameroon MPs, members of parliament, constituency representatives, legislative assembly, transparency ratings, parliamentary performance" 
        />
        <link rel="canonical" href="https://camerpulse.com/mps" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="MPs Directory - Members of Parliament | CamerPulse" />
        <meta 
          property="og:description" 
          content="Complete directory of all 180 Cameroon Members of Parliament with transparency ratings and legislative performance." 
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://camerpulse.com/mps" />
        <meta property="og:image" content="https://camerpulse.com/og-mps.jpg" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MPs Directory - Members of Parliament" />
        <meta 
          name="twitter:description" 
          content="Complete directory of all 180 Cameroon Members of Parliament with transparency and performance tracking." 
        />
        <meta name="twitter:image" content="https://camerpulse.com/og-mps.jpg" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "MPs Directory",
            "description": "Complete directory of Cameroon Members of Parliament",
            "url": "https://camerpulse.com/mps",
            "mainEntity": {
              "@type": "ItemList",
              "name": "Cameroon Members of Parliament",
              "description": "List of all MPs in the Cameroon National Assembly",
              "numberOfItems": mps?.length || 180
            },
            "publisher": {
              "@type": "Organization",
              "name": "CamerPulse",
              "url": "https://camerpulse.com"
            }
          })}
        </script>
      </Helmet>

      <AppLayout>
        <PoliticalDirectoryLayout
          title="Members of Parliament"
          description="Complete directory of all 180 Cameroon MPs with constituency details, transparency ratings, legislative performance, and civic engagement metrics."
          type="mp"
          data={mps || []}
          isLoading={isLoading}
          error={error}
        />
      </AppLayout>
    </>
  );
};

export default EnhancedMPs;