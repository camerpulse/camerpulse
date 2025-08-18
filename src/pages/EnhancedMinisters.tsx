import React from 'react';
import { Helmet } from 'react-helmet-async';
import { AppLayout } from '@/components/Layout/AppLayout';
import { PoliticalDirectoryLayout } from '@/components/Political/PoliticalDirectoryLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const EnhancedMinisters: React.FC = () => {
  const { data: ministers, isLoading, error } = useQuery({
    queryKey: ['ministers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ministers')
        .select('*')
        .order('position_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <>
      <Helmet>
        <title>Ministers Directory - Government Cabinet | CamerPulse</title>
        <meta 
          name="description" 
          content="Complete directory of Cameroon government ministers with portfolio details, transparency ratings, performance metrics, and ministerial achievements tracking." 
        />
        <meta 
          name="keywords" 
          content="Cameroon ministers, government cabinet, ministerial portfolios, transparency ratings, ministerial performance, government accountability" 
        />
        <link rel="canonical" href="https://camerpulse.com/ministers" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="Ministers Directory - Government Cabinet | CamerPulse" />
        <meta 
          property="og:description" 
          content="Complete directory of Cameroon government ministers with transparency ratings and performance tracking." 
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://camerpulse.com/ministers" />
        <meta property="og:image" content="https://camerpulse.com/og-ministers.jpg" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ministers Directory - Government Cabinet" />
        <meta 
          name="twitter:description" 
          content="Complete directory of Cameroon government ministers with transparency and performance tracking." 
        />
        <meta name="twitter:image" content="https://camerpulse.com/og-ministers.jpg" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Ministers Directory",
            "description": "Complete directory of Cameroon government ministers",
            "url": "https://camerpulse.com/ministers",
            "mainEntity": {
              "@type": "ItemList",
              "name": "Cameroon Government Ministers",
              "description": "List of all ministers in the Cameroon government cabinet",
              "numberOfItems": ministers?.length || 0
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
          title="Ministers Directory"
          description="Complete directory of Cameroon government ministers with portfolio details, transparency ratings, performance metrics, and ministerial achievement tracking."
          type="minister"
          data={ministers || []}
          isLoading={isLoading}
          error={error}
        />
      </AppLayout>
    </>
  );
};

export default EnhancedMinisters;