import React from 'react';
import { Helmet } from 'react-helmet-async';

interface PageHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterSite?: string;
  canonicalUrl?: string;
  structuredData?: object;
}

export const PageHead: React.FC<PageHeadProps> = ({
  title = 'CamerPulse - Pan-African Civic Engagement Platform',
  description = 'Connect, engage, and make your voice heard across Africa. Track political promises, participate in polls, and build stronger communities.',
  keywords = 'civic engagement, politics, voting, democracy, africa, cameroon, community',
  ogTitle,
  ogDescription,
  ogImage = '/og-image.jpg',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  twitterSite = '@camerpulse',
  canonicalUrl,
  structuredData,
}) => {
  const fullTitle = title.includes('CamerPulse') ? title : `${title} - CamerPulse`;
  const currentUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : '');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="CamerPulse" />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="CamerPulse" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content={twitterSite} />
      <meta name="twitter:title" content={ogTitle || fullTitle} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

// Predefined structured data schemas
export const createOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "CamerPulse",
  "description": "Pan-African civic engagement platform connecting communities and fostering democratic participation",
  "url": "https://camerpulse.com",
  "logo": "https://camerpulse.com/logo.png",
  "sameAs": [
    "https://twitter.com/camerpulse",
    "https://facebook.com/camerpulse"
  ]
});

export const createWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "CamerPulse",
  "description": "Civic engagement platform for democratic participation",
  "url": "https://camerpulse.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://camerpulse.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
});

export const createPoliticianSchema = (politician: any) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  "name": politician.name,
  "jobTitle": politician.position,
  "worksFor": {
    "@type": "Organization",
    "name": "Government of Cameroon"
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": politician.region,
    "addressCountry": "Cameroon"
  }
});