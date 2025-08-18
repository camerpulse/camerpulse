import React from 'react';
import { Helmet } from 'react-helmet-async';
import { AppLayout } from '@/components/Layout/AppLayout';
import { PoliticalDirectoryLayout } from '@/components/Political/PoliticalDirectoryLayout';
import { usePoliticians } from '@/hooks/usePoliticalData';

const EnhancedPoliticians: React.FC = () => {
  const { data: politicians, isLoading, error } = usePoliticians({ limit: 100 });

  return (
    <>
      <Helmet>
        <title>Politicians Directory - Cameroon Political Leaders | CamerPulse</title>
        <meta 
          name="description" 
          content="Comprehensive directory of Cameroon's political leaders with transparency ratings, performance scores, and detailed profiles. Track ministers, MPs, senators and their civic contributions." 
        />
        <meta 
          name="keywords" 
          content="Cameroon politicians, political leaders, transparency ratings, performance scores, ministers, MPs, senators, civic engagement, political directory" 
        />
        <link rel="canonical" href="https://camerpulse.com/politicians" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="Politicians Directory - Cameroon Political Leaders | CamerPulse" />
        <meta 
          property="og:description" 
          content="Discover, evaluate and engage with Cameroon's political leaders. Browse comprehensive profiles with transparency ratings and performance metrics." 
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://camerpulse.com/politicians" />
        <meta property="og:image" content="https://camerpulse.com/og-politicians.jpg" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Politicians Directory - Cameroon Political Leaders" />
        <meta 
          name="twitter:description" 
          content="Comprehensive directory of Cameroon's political leaders with transparency ratings and performance scores." 
        />
        <meta name="twitter:image" content="https://camerpulse.com/og-politicians.jpg" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Politicians Directory",
            "description": "Comprehensive directory of Cameroon's political leaders",
            "url": "https://camerpulse.com/politicians",
            "mainEntity": {
              "@type": "ItemList",
              "name": "Cameroon Politicians",
              "description": "List of political leaders in Cameroon",
              "numberOfItems": politicians?.length || 0
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
          title="Politicians Directory"
          description="Comprehensive profiles of Cameroon's political leaders with transparency ratings, performance metrics, and civic engagement tracking."
          type="politician"
          data={politicians || []}
          isLoading={isLoading}
          error={error}
        />
      </AppLayout>
    </>
  );
};

export default EnhancedPoliticians;