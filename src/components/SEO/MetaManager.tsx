import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { getCanonicalURL } from '@/utils/slugUtils';

interface MetaManagerProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article' | 'profile';
  canonical?: string;
  noIndex?: boolean;
  structuredData?: object;
}

/**
 * Comprehensive SEO Meta Manager
 */
export const MetaManager: React.FC<MetaManagerProps> = ({
  title,
  description,
  keywords = [],
  image,
  type = 'website',
  canonical,
  noIndex = false,
  structuredData,
}) => {
  const location = useLocation();
  
  const defaultTitle = 'CamerPulse - Civic Engagement Platform';
  const defaultDescription = 'Connect with your community, track government performance, and make your voice heard on CamerPulse - Cameroon\'s leading civic engagement platform.';
  const defaultImage = '/placeholder.svg';
  
  const finalTitle = title ? `${title} | CamerPulse` : defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalCanonical = canonical || getCanonicalURL(location.pathname);
  const finalImage = image || defaultImage;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <link rel="canonical" href={finalCanonical} />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:site_name" content="CamerPulse" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      <meta name="twitter:site" content="@camerpulse" />
      
      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#0066CC" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

/**
 * Page-specific meta tag generators
 */
export const createPoliticianMeta = (politician: { name: string; position?: string; region?: string }) => ({
  title: `${politician.name} - ${politician.position || 'Politician'}`,
  description: `View profile, performance metrics, and civic activities of ${politician.name}${politician.position ? `, ${politician.position}` : ''} on CamerPulse.`,
  keywords: ['politician', 'government', 'civic', politician.name, politician.region].filter(Boolean),
  type: 'profile' as const,
  structuredData: {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": politician.name,
    "jobTitle": politician.position,
    "worksFor": {
      "@type": "GovernmentOrganization",
      "name": "Government of Cameroon"
    }
  }
});

export const createVillageMeta = (village: { name: string; region: string; description?: string }) => ({
  title: `${village.name}, ${village.region}`,
  description: village.description || `Discover ${village.name} in ${village.region}. View community information, development projects, and local activities on CamerPulse.`,
  keywords: ['village', 'community', 'cameroon', village.name, village.region],
  structuredData: {
    "@context": "https://schema.org",
    "@type": "Place",
    "name": village.name,
    "address": {
      "@type": "PostalAddress",
      "addressRegion": village.region,
      "addressCountry": "CM"
    }
  }
});

export const createPetitionMeta = (petition: { title: string; description?: string; signatures?: number }) => ({
  title: petition.title,
  description: petition.description || `Support this petition on CamerPulse. Join ${petition.signatures || 0} others in making a difference.`,
  keywords: ['petition', 'civic engagement', 'change', 'democracy'],
  type: 'article' as const,
  structuredData: {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": petition.title,
    "description": petition.description,
    "publisher": {
      "@type": "Organization",
      "name": "CamerPulse"
    }
  }
});