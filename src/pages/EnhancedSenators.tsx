import React from 'react';
import { Helmet } from 'react-helmet-async';
import { AppLayout } from '@/components/Layout/AppLayout';
import { PoliticalDirectoryLayout } from '@/components/Political/PoliticalDirectoryLayout';
import { useSenators, useImportSenators } from '@/hooks/useSenators';

const EnhancedSenators: React.FC = () => {
  const { data: senators, isLoading, error } = useSenators();
  const importSenators = useImportSenators();

  return (
    <>
      <Helmet>
        <title>Senate Directory - Cameroon Senators | CamerPulse</title>
        <meta 
          name="description" 
          content="Complete directory of all 100 Cameroon senators with detailed profiles, transparency ratings, performance scores, and legislative records. Track senate activities and civic contributions." 
        />
        <meta 
          name="keywords" 
          content="Cameroon senate, senators directory, senate transparency, legislative performance, senate committees, political oversight, civic engagement" 
        />
        <link rel="canonical" href="https://camerpulse.com/senators" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="Senate Directory - Cameroon Senators | CamerPulse" />
        <meta 
          property="og:description" 
          content="Complete directory of all 100 Cameroon senators with transparency ratings and legislative performance tracking." 
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://camerpulse.com/senators" />
        <meta property="og:image" content="https://camerpulse.com/og-senators.jpg" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Senate Directory - Cameroon Senators" />
        <meta 
          name="twitter:description" 
          content="Complete directory of all 100 Cameroon senators with transparency ratings and performance tracking." 
        />
        <meta name="twitter:image" content="https://camerpulse.com/og-senators.jpg" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Senate Directory",
            "description": "Complete directory of Cameroon senators",
            "url": "https://camerpulse.com/senators",
            "mainEntity": {
              "@type": "ItemList",
              "name": "Cameroon Senators",
              "description": "List of all senators in the Cameroon Senate",
              "numberOfItems": senators?.length || 100
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
          title="Senate Directory"
          description="Complete profiles of all 100 Cameroon senators with transparency ratings, legislative performance metrics, and committee participation tracking."
          type="senator"
          data={senators || []}
          isLoading={isLoading}
          error={error}
          onImport={() => importSenators.mutate()}
          importLoading={importSenators.isPending}
        />
      </AppLayout>
    </>
  );
};

export default EnhancedSenators;