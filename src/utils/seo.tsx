/**
 * SEO and Meta Management Utilities
 * Centralized SEO optimization and meta tag management
 */

import { Helmet } from 'react-helmet-async';
import { APP_CONFIG, CAMEROON_REGIONS } from '@/constants';
import { truncateText } from '@/utils';

// === SEO TYPES ===
interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  locale?: string;
  alternateLocales?: string[];
}

interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

// === SEO UTILITIES ===

/**
 * Generate optimized title with branding
 */
export function generateTitle(pageTitle: string, includeBrand: boolean = true): string {
  const cleanTitle = pageTitle.trim();
  
  if (!includeBrand) {
    return cleanTitle;
  }
  
  // Avoid duplicate brand name
  if (cleanTitle.includes(APP_CONFIG.name)) {
    return cleanTitle;
  }
  
  // Keep under 60 characters for SEO
  const maxLength = 60 - APP_CONFIG.name.length - 3; // Account for " | "
  const truncatedTitle = truncateText(cleanTitle, maxLength);
  
  return `${truncatedTitle} | ${APP_CONFIG.name}`;
}

/**
 * Generate SEO-optimized description
 */
export function generateDescription(content: string, maxLength: number = 160): string {
  const cleaned = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
    
  return truncateText(cleaned, maxLength);
}

/**
 * Generate relevant keywords
 */
export function generateKeywords(
  entity: any, 
  type: 'politician' | 'village' | 'job' | 'event' | 'general'
): string[] {
  const baseKeywords = ['Cameroon', 'CamerPulse', 'civic engagement'];
  
  switch (type) {
    case 'politician':
      return [
        ...baseKeywords,
        'politician',
        'government',
        'political leader',
        entity.name,
        entity.party,
        entity.region,
        'transparency',
        'accountability',
        'political profile',
      ].filter(Boolean);
      
    case 'village':
      return [
        ...baseKeywords,
        'village',
        'community',
        'traditional authority',
        entity.village_name,
        entity.region,
        entity.division,
        'rural development',
        'community profile',
      ].filter(Boolean);
      
    case 'job':
      return [
        ...baseKeywords,
        'jobs',
        'employment',
        'careers',
        entity.title,
        entity.company_name,
        entity.region,
        entity.job_type,
        'job opportunity',
      ].filter(Boolean);
      
    case 'event':
      return [
        ...baseKeywords,
        'event',
        'community event',
        entity.title,
        entity.category,
        entity.region,
        'civic event',
      ].filter(Boolean);
      
    default:
      return baseKeywords;
  }
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${APP_CONFIG.url}${cleanPath}`;
}

/**
 * Generate Open Graph image URL
 */
export function generateOGImage(
  title: string, 
  subtitle?: string, 
  type: string = 'general'
): string {
  const params = new URLSearchParams({
    title: encodeURIComponent(title),
    type,
  });
  
  if (subtitle) {
    params.set('subtitle', encodeURIComponent(subtitle));
  }
  
  return `${APP_CONFIG.url}/api/og?${params.toString()}`;
}

// === STRUCTURED DATA GENERATORS ===

/**
 * Generate organization structured data
 */
export function generateOrganizationSchema(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: APP_CONFIG.name,
    description: APP_CONFIG.description,
    url: APP_CONFIG.url,
    logo: `${APP_CONFIG.url}/logo.png`,
    sameAs: [
      'https://twitter.com/camerpulse',
      'https://facebook.com/camerpulse',
      'https://linkedin.com/company/camerpulse',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: APP_CONFIG.supportEmail,
      contactType: 'Customer Service',
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'CM',
      addressRegion: 'Centre',
      addressLocality: 'Yaoundé',
    },
  };
}

/**
 * Generate person structured data for politicians
 */
export function generatePersonSchema(person: any, type: 'politician' | 'traditional_leader' = 'politician'): StructuredData {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name || person.full_name,
    description: person.biography || person.bio,
    url: generateCanonicalUrl(`/${type}s/${person.slug}`),
  };

  if (person.profile_image_url) {
    baseSchema.image = person.profile_image_url;
  }

  if (type === 'politician') {
    return {
      ...baseSchema,
      jobTitle: person.role_title,
      worksFor: {
        '@type': 'Organization',
        name: person.party || 'Government of Cameroon',
      },
      address: {
        '@type': 'PostalAddress',
        addressRegion: person.region,
        addressCountry: 'CM',
      },
      additionalType: 'http://schema.org/PublicOfficial',
    };
  }

  return baseSchema;
}

/**
 * Generate place structured data for villages
 */
export function generatePlaceSchema(village: any): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: village.village_name,
    description: village.description,
    url: generateCanonicalUrl(`/villages/${village.slug}`),
    address: {
      '@type': 'PostalAddress',
      addressRegion: village.region,
      addressLocality: village.division,
      addressCountry: 'CM',
    },
    additionalType: 'http://schema.org/AdministrativeArea',
  };
}

/**
 * Generate job posting structured data
 */
export function generateJobPostingSchema(job: any): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    url: generateCanonicalUrl(`/jobs/${job.slug}`),
    datePosted: job.created_at,
    validThrough: job.deadline,
    employmentType: job.job_type.toUpperCase(),
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company_name,
      logo: job.company_logo,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location,
        addressRegion: job.region,
        addressCountry: 'CM',
      },
    },
    baseSalary: job.salary_min && job.salary_max ? {
      '@type': 'MonetaryAmount',
      currency: job.salary_currency || 'XAF',
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.salary_min,
        maxValue: job.salary_max,
        unitText: 'MONTH',
      },
    } : undefined,
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// === REACT COMPONENTS ===

/**
 * SEO Head component with all meta tags
 */
interface SEOHeadProps {
  data: SEOData;
  structuredData?: StructuredData[];
  noIndex?: boolean;
  noFollow?: boolean;
}

export const SEOHead: React.FC<SEOHeadProps> = ({ 
  data, 
  structuredData = [], 
  noIndex = false, 
  noFollow = false 
}) => {
  const {
    title,
    description,
    keywords = [],
    image,
    url,
    type = 'website',
    author,
    publishedTime,
    modifiedTime,
    locale = 'en_US',
    // alternateLocales removed - English only
  } = data;

  const canonicalUrl = url || generateCanonicalUrl('');
  const ogImage = image || generateOGImage(title, description);
  
  const robotsContent = [
    noIndex ? 'noindex' : 'index',
    noFollow ? 'nofollow' : 'follow',
  ].join(', ');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{generateTitle(title)}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={APP_CONFIG.name} />
      <meta property="og:locale" content={locale} />
      {alternateLocales.map(altLocale => (
        <meta key={altLocale} property="og:locale:alternate" content={altLocale} />
      ))}
      
      {ogImage && (
        <>
          <meta property="og:image" content={ogImage} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content={title} />
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Article Meta */}
      {type === 'article' && (
        <>
          {author && <meta name="author" content={author} />}
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
        </>
      )}

      {/* Structured Data */}
      {structuredData.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#00A86B" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    </Helmet>
  );
};

export default SEOHead;
