/**
 * SEO Optimization Utilities
 * Production-ready SEO tools and helpers
 */

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  twitterImage?: string;
  structuredData?: Record<string, any>;
}

/**
 * Generate optimized page title
 */
export function generatePageTitle(
  title: string, 
  siteName: string = "CamerPulse",
  separator: string = " | "
): string {
  const maxLength = 60;
  const fullTitle = `${title}${separator}${siteName}`;
  
  if (fullTitle.length <= maxLength) {
    return fullTitle;
  }
  
  const truncatedTitle = title.substring(0, maxLength - siteName.length - separator.length - 3) + "...";
  return `${truncatedTitle}${separator}${siteName}`;
}

/**
 * Generate optimized meta description
 */
export function generateMetaDescription(
  description: string,
  maxLength: number = 160
): string {
  if (description.length <= maxLength) {
    return description;
  }
  
  const truncated = description.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return truncated.substring(0, lastSpace) + "...";
}

/**
 * Generate keywords from content
 */
export function generateKeywords(
  primaryKeywords: string[],
  additionalKeywords: string[] = []
): string {
  const allKeywords = [...primaryKeywords, ...additionalKeywords];
  const uniqueKeywords = Array.from(new Set(allKeywords));
  
  // Limit to top 10 most relevant keywords
  return uniqueKeywords.slice(0, 10).join(', ');
}

/**
 * Create canonical URL
 */
export function createCanonicalUrl(
  path: string,
  baseUrl: string = "https://camerpulse.com"
): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Generate Open Graph image URL
 */
export function generateOGImage(
  title: string,
  type: 'default' | 'politician' | 'poll' | 'village' = 'default'
): string {
  const baseUrl = "https://camerpulse.com";
  
  switch (type) {
    case 'politician':
      return `${baseUrl}/og-images/politician.jpg`;
    case 'poll':
      return `${baseUrl}/og-images/poll.jpg`;
    case 'village':
      return `${baseUrl}/og-images/village.jpg`;
    default:
      return `${baseUrl}/og-image-homepage.jpg`;
  }
}

/**
 * Create structured data for articles/pages
 */
export function createArticleStructuredData(data: {
  headline: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  url: string;
}): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": data.headline,
    "description": data.description,
    "author": {
      "@type": "Organization",
      "name": data.author
    },
    "datePublished": data.datePublished,
    "dateModified": data.dateModified || data.datePublished,
    "image": data.image || generateOGImage(data.headline),
    "url": data.url,
    "publisher": {
      "@type": "Organization",
      "name": "CamerPulse",
      "logo": {
        "@type": "ImageObject",
        "url": "https://camerpulse.com/logo.png"
      }
    }
  };
}

/**
 * Create person structured data
 */
export function createPersonStructuredData(data: {
  name: string;
  jobTitle?: string;
  description?: string;
  image?: string;
  url?: string;
  birthPlace?: string;
  nationality?: string;
}): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": data.name,
    "jobTitle": data.jobTitle,
    "description": data.description,
    "image": data.image,
    "url": data.url,
    "birthPlace": data.birthPlace,
    "nationality": data.nationality || "Cameroonian"
  };
}

/**
 * Create organization structured data
 */
export function createOrganizationStructuredData(data: {
  name: string;
  description?: string;
  url?: string;
  logo?: string;
  foundingDate?: string;
  location?: string;
}): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": data.name,
    "description": data.description,
    "url": data.url,
    "logo": data.logo,
    "foundingDate": data.foundingDate,
    "location": data.location
  };
}

/**
 * Create poll/survey structured data
 */
export function createPollStructuredData(data: {
  name: string;
  description: string;
  dateCreated: string;
  author: string;
  url: string;
  participantCount?: number;
}): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "Survey",
    "name": data.name,
    "description": data.description,
    "dateCreated": data.dateCreated,
    "author": {
      "@type": "Organization",
      "name": data.author
    },
    "url": data.url,
    "audience": {
      "@type": "Audience",
      "audienceType": "Citizens of Cameroon"
    },
    "participantCount": data.participantCount
  };
}

/**
 * Validate SEO metadata
 */
export function validateSEOMetadata(metadata: SEOMetadata): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Title validation
  if (!metadata.title) {
    errors.push("Title is required");
  } else if (metadata.title.length > 60) {
    warnings.push("Title exceeds 60 characters, may be truncated in search results");
  } else if (metadata.title.length < 30) {
    warnings.push("Title is under 30 characters, consider making it more descriptive");
  }

  // Description validation
  if (!metadata.description) {
    errors.push("Meta description is required");
  } else if (metadata.description.length > 160) {
    warnings.push("Meta description exceeds 160 characters, may be truncated");
  } else if (metadata.description.length < 120) {
    warnings.push("Meta description is under 120 characters, consider expanding");
  }

  // Keywords validation
  if (metadata.keywords) {
    const keywordCount = metadata.keywords.split(',').length;
    if (keywordCount > 10) {
      warnings.push("Too many keywords, consider focusing on top 10 most relevant");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Extract text content for SEO analysis
 */
export function extractTextContent(html: string): string {
  // Remove HTML tags and extract plain text
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate reading time
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 200): number {
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Generate hreflang tags for multilingual support
 */
export function generateHreflangTags(
  currentPath: string,
  supportedLanguages: string[] = ['en', 'fr']
): Array<{ rel: string; hreflang: string; href: string }> {
  const baseUrl = "https://camerpulse.com";
  
  return supportedLanguages.map(lang => ({
    rel: "alternate",
    hreflang: lang,
    href: `${baseUrl}/${lang}${currentPath}`
  }));
}

/**
 * SEO-friendly URL slug generator
 */
export function createSEOSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}