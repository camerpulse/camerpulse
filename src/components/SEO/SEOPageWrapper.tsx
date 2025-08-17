import React from 'react';
import { PageHead } from '@/components/SEO/PageHead';
import { createOrganizationSchema, createWebsiteSchema } from '@/components/SEO/PageHead';
import { usePageAnalytics } from '@/hooks/usePageAnalytics';

interface SEOPageWrapperProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  structuredData?: object;
}

/**
 * Production-ready SEO wrapper for all pages
 */
export const SEOPageWrapper: React.FC<SEOPageWrapperProps> = ({
  children,
  title,
  description,
  keywords,
  ogImage,
  canonicalUrl,
  structuredData
}) => {
  // Track page analytics
  usePageAnalytics();

  // Default structured data
  const defaultStructuredData = structuredData || createWebsiteSchema();

  return (
    <>
      <PageHead
        title={title}
        description={description}
        keywords={keywords}
        ogImage={ogImage}
        canonicalUrl={canonicalUrl}
        structuredData={defaultStructuredData}
      />
      {children}
    </>
  );
};

// Pre-configured SEO wrappers for common page types
export const PoliticianPageWrapper: React.FC<{ children: React.ReactNode; politician?: any }> = ({ 
  children, 
  politician 
}) => (
  <SEOPageWrapper
    title={politician ? `${politician.name} - ${politician.position} | CamerPulse` : 'Politicians - CamerPulse'}
    description={politician ? 
      `Learn about ${politician.name}, ${politician.position} representing ${politician.region}. Track their promises, performance, and civic engagement.` :
      'Comprehensive directory of politicians, senators, MPs, and ministers in Cameroon. Track their promises and performance.'
    }
    keywords="politicians, government, cameroon, civic engagement, democracy, representatives"
    structuredData={politician ? {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": politician.name,
      "jobTitle": politician.position,
      "worksFor": { "@type": "Organization", "name": "Government of Cameroon" },
      "address": { "@type": "PostalAddress", "addressRegion": politician.region, "addressCountry": "Cameroon" }
    } : undefined}
  >
    {children}
  </SEOPageWrapper>
);

export const VillagePageWrapper: React.FC<{ children: React.ReactNode; village?: any }> = ({ 
  children, 
  village 
}) => (
  <SEOPageWrapper
    title={village ? `${village.name} Village - ${village.region} | CamerPulse` : 'Villages Directory - CamerPulse'}
    description={village ? 
      `Connect with ${village.name} village in ${village.region}. Join the community of ${village.population} residents and discover local initiatives.` :
      'Explore villages across Cameroon. Connect with communities, discover local initiatives, and engage with village development projects.'
    }
    keywords="villages, communities, cameroon, local development, civic engagement"
    structuredData={village ? {
      "@context": "https://schema.org",
      "@type": "Place",
      "name": village.name,
      "address": { "@type": "PostalAddress", "addressRegion": village.region, "addressCountry": "Cameroon" },
      "description": `Village community in ${village.region}, Cameroon`
    } : undefined}
  >
    {children}
  </SEOPageWrapper>
);

export const JobPageWrapper: React.FC<{ children: React.ReactNode; job?: any }> = ({ 
  children, 
  job 
}) => (
  <SEOPageWrapper
    title={job ? `${job.title} at ${job.company} | CamerPulse Jobs` : 'Jobs Board - CamerPulse'}
    description={job ? 
      `${job.title} position at ${job.company} in ${job.location}. ${job.type} role with competitive salary. Apply now on CamerPulse.` :
      'Find job opportunities across Africa. Connect with employers, discover career opportunities, and advance your professional journey.'
    }
    keywords="jobs, careers, employment, opportunities, africa, cameroon"
    structuredData={job ? {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": job.title,
      "description": job.description,
      "hiringOrganization": { "@type": "Organization", "name": job.company },
      "jobLocation": { "@type": "Place", "address": job.location },
      "employmentType": job.type,
      "datePosted": job.posted_date
    } : undefined}
  >
    {children}
  </SEOPageWrapper>
);

export const MarketplacePageWrapper: React.FC<{ children: React.ReactNode; product?: any }> = ({ 
  children, 
  product 
}) => (
  <SEOPageWrapper
    title={product ? `${product.name} - ${product.vendor} | CamerPulse Marketplace` : 'Marketplace - CamerPulse'}
    description={product ? 
      `${product.name} by ${product.vendor}. ${product.description} Available in ${product.location}. Shop local products on CamerPulse.` :
      'Discover local products and services from verified vendors across Cameroon. Support local businesses and find quality goods.'
    }
    keywords="marketplace, local products, vendors, shopping, cameroon, local business"
    structuredData={product ? {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": product.description,
      "offers": { "@type": "Offer", "price": product.price, "priceCurrency": "XAF" },
      "brand": { "@type": "Organization", "name": product.vendor }
    } : undefined}
  >
    {children}
  </SEOPageWrapper>
);