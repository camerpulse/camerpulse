/**
 * URL Slug Utilities for CamerPulse
 * Handles SEO-friendly URL generation, slug management, and URL redirection
 */

export interface SluggedEntity {
  id: string;
  slug?: string;
  name?: string;
  title?: string;
}

export interface PoliticianEntity extends SluggedEntity {
  name: string;
  position?: string;
  region?: string;
}

export interface VillageEntity extends SluggedEntity {
  name: string;
  region: string;
  division?: string;
}

export interface InstitutionEntity extends SluggedEntity {
  name: string;
  type: 'hospital' | 'school' | 'pharmacy';
  region: string;
}

/**
 * Generates a URL-safe slug from text - Enhanced version
 */
export function generateSlug(text: string, id?: string): string {
  if (!text) return id || 'item';
  
  let slug = text
    .toString()                        // Cast to string
    .toLowerCase()                    // Lowercase  
    .trim()                          // Remove whitespace at start/end
    .replace(/[\s\W-]+/g, '-')       // Replace spaces/non-word chars with hyphen
    .replace(/^-+|-+$/g, '');        // Remove leading/trailing hyphens
  
  // Handle special characters more gracefully
  slug = slug
    .replace(/[àáâäãåą]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôöõø]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñń]/g, 'n')
    .replace(/[çć]/g, 'c')
    .replace(/[ß]/g, 'ss')
    .replace(/[ýÿ]/g, 'y');
  
  // Append ID if provided for uniqueness
  if (id) {
    slug = slug ? `${slug}-${id}` : id;
  }
  
  return slug || 'item';
}

/**
 * Creates SEO-friendly URLs for different entity types with language support
 */
export class URLBuilder {
  private static getLanguagePrefix(): string {
    // For now, return empty string to match current router configuration
    // TODO: Add language prefix support when multi-language routing is implemented
    return '';
  }

  static politicians = {
    list: () => `${URLBuilder.getLanguagePrefix()}/politicians`,
    detail: (entity: PoliticianEntity) => {
      const slug = entity.slug || generateSlug(entity.name, entity.id);
      return `${URLBuilder.getLanguagePrefix()}/politicians/${slug}`;
    }
  };

  static senators = {
    list: () => `${URLBuilder.getLanguagePrefix()}/senators`,
    detail: (entity: PoliticianEntity) => {
      const slug = entity.slug || generateSlug(entity.name, entity.id);
      return `${URLBuilder.getLanguagePrefix()}/senators/${slug}`;
    }
  };

  static mps = {
    list: () => `${URLBuilder.getLanguagePrefix()}/mps`,
    detail: (entity: PoliticianEntity) => {
      const slug = entity.slug || generateSlug(entity.name, entity.id);
      return `${URLBuilder.getLanguagePrefix()}/mps/${slug}`;
    }
  };

  static ministers = {
    list: () => `${URLBuilder.getLanguagePrefix()}/ministers`,
    detail: (entity: PoliticianEntity) => {
      const slug = entity.slug || generateSlug(entity.name, entity.id);
      return `${URLBuilder.getLanguagePrefix()}/ministers/${slug}`;
    }
  };

  static villages = {
    list: () => `${URLBuilder.getLanguagePrefix()}/villages`,
    detail: (entity: VillageEntity) => {
      const slug = entity.slug || generateSlug(`${entity.name}-${entity.region}`, entity.id);
      return `${URLBuilder.getLanguagePrefix()}/villages/${slug}`;
    }
  };

  static institutions = {
    hospitals: {
      list: () => `${URLBuilder.getLanguagePrefix()}/hospitals`,
      detail: (entity: InstitutionEntity) => {
        const slug = entity.slug || generateSlug(entity.name, entity.id);
        return `${URLBuilder.getLanguagePrefix()}/hospitals/${slug}`;
      }
    },
    schools: {
      list: () => `${URLBuilder.getLanguagePrefix()}/schools`,
      detail: (entity: InstitutionEntity) => {
        const slug = entity.slug || generateSlug(entity.name, entity.id);
        return `${URLBuilder.getLanguagePrefix()}/schools/${slug}`;
      }
    },
    pharmacies: {
      list: () => `${URLBuilder.getLanguagePrefix()}/pharmacies`,
      detail: (entity: InstitutionEntity) => {
        const slug = entity.slug || generateSlug(entity.name, entity.id);
        return `${URLBuilder.getLanguagePrefix()}/pharmacies/${slug}`;
      }
    }
  };

  static petitions = {
    list: () => `${URLBuilder.getLanguagePrefix()}/petitions`,
    detail: (entity: SluggedEntity & { title: string }) => {
      const slug = entity.slug || generateSlug(entity.title, entity.id);
      return `${URLBuilder.getLanguagePrefix()}/petitions/${slug}`;
    },
    create: () => `${URLBuilder.getLanguagePrefix()}/petitions/create`
  };

  static events = {
    list: () => `${URLBuilder.getLanguagePrefix()}/events`,
    detail: (entity: SluggedEntity & { title: string }) => {
      const slug = entity.slug || generateSlug(entity.title, entity.id);
      return `${URLBuilder.getLanguagePrefix()}/events/${slug}`;
    }
  };

  static profiles = {
    user: (userId: string) => `/profile/${userId}`,
    username: (username: string) => `/profile/${username}`,
    userSlug: (username: string) => `/@${username}`,
    
    // Module-specific profile routes
    music: (artistSlug: string, id: string) => `/music/artists/${artistSlug}-${id}`,
    job: (username: string, id: string) => `/jobs/profile/${username}-${id}`,
    village: (username: string) => `/villages/members/${username}`,
    marketplace: (username: string, id: string) => `/marketplace/vendors/${username}-${id}`
  };

  static marketplace = {
    list: () => `/marketplace`,
    vendors: () => `/marketplace/vendors`,
    product: (productSlug: string, id: string) => `/marketplace/products/${productSlug}-${id}`
  };

  static jobs = {
    list: () => `/jobs`,
    detail: (jobSlug: string, id: string) => `/jobs/${jobSlug}-${id}`
  };

  static admin = {
    dashboard: () => `${URLBuilder.getLanguagePrefix()}/admin/dashboard`,
    politicians: () => `${URLBuilder.getLanguagePrefix()}/admin/politicians`,
    villages: () => `${URLBuilder.getLanguagePrefix()}/admin/villages`,
    moderation: () => `${URLBuilder.getLanguagePrefix()}/moderation-center`
  };
}

/**
 * Parses slug to extract entity ID
 */
export function parseSlugForId(slug: string): string | null {
  if (!slug) return null;
  
  // Extract ID from the end of the slug (after the last hyphen)
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  
  // Check if it's a UUID or numeric ID
  if (lastPart.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) || 
      lastPart.match(/^\d+$/)) {
    return lastPart;
  }
  
  return null;
}

/**
 * Legacy URL redirect mappings
 */
export const LEGACY_REDIRECTS: Record<string, (id: string, lang?: string) => string> = {
  '/politician/:id': (id: string, lang = 'en') => `/${lang}/politicians/${id}`,
  '/village-info/:id': (id: string, lang = 'en') => `/${lang}/villages/${id}`,
  '/user-profile/:id': (id: string, lang = 'en') => `/${lang}/profile/${id}`,
  '/ministry/:id': (id: string, lang = 'en') => `/${lang}/ministries/${id}`,
  '/council/:id': (id: string, lang = 'en') => `/${lang}/councils/${id}`,
  // Legacy patterns without language prefixes
  '/:lang/politician/:id': (id: string, lang = 'en') => `/${lang}/politicians/${id}`,
  '/:lang/village-info/:id': (id: string, lang = 'en') => `/${lang}/villages/${id}`,
  '/:lang/user-profile/:id': (id: string, lang = 'en') => `/${lang}/profile/${id}`,
};

/**
 * Checks if a URL is a legacy format and returns the new URL
 */
export function getLegacyRedirect(pathname: string): string | null {
  // Extract language from path if present
  const segments = pathname.split('/').filter(Boolean);
  let detectedLang = 'en';
  
  if (segments[0] === 'en' || segments[0] === 'fr') {
    detectedLang = segments[0];
  }

  for (const [pattern, generator] of Object.entries(LEGACY_REDIRECTS)) {
    let regexPattern = pattern
      .replace(':lang', '(en|fr)')
      .replace(':id', '([^/]+)');
    
    const regex = new RegExp(`^${regexPattern}$`);
    const match = pathname.match(regex);
    
    if (match) {
      const id = match[match.length - 1]; // Last captured group is always the ID
      const lang = match[1] || detectedLang; // First group might be language
      return generator(id, lang);
    }
  }
  
  return null;
}

/**
 * Validates slug format
 */
export function isValidSlug(slug: string): boolean {
  if (!slug) return false;
  
  // Must be lowercase, contain only letters, numbers, and hyphens
  return /^[a-z0-9-]+$/.test(slug) && 
         !slug.startsWith('-') && 
         !slug.endsWith('-') &&
         !slug.includes('--');
}

/**
 * Creates canonical URLs for SEO
 */
export function getCanonicalURL(path: string): string {
  const baseURL = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://camerpulse.com';
  
  return `${baseURL}${path}`;
}

/**
 * SEO metadata helpers
 */
export class SEOHelper {
  static createMetaTags(options: {
    title: string;
    description: string;
    canonical: string;
    image?: string;
    type?: string;
  }) {
    return {
      title: options.title,
      description: options.description,
      canonical: options.canonical,
      openGraph: {
        title: options.title,
        description: options.description,
        url: options.canonical,
        type: options.type || 'website',
        image: options.image,
        siteName: 'CamerPulse'
      },
      twitter: {
        card: 'summary_large_image',
        title: options.title,
        description: options.description,
        image: options.image
      }
    };
  }

  static politicianMeta(politician: PoliticianEntity) {
    const url = URLBuilder.politicians.detail(politician);
    return this.createMetaTags({
      title: `${politician.name} - CamerPulse`,
      description: `View profile, ratings, and civic performance of ${politician.name}${politician.position ? `, ${politician.position}` : ''} on CamerPulse.`,
      canonical: getCanonicalURL(url),
      type: 'profile'
    });
  }

  static villageMeta(village: VillageEntity) {
    const url = URLBuilder.villages.detail(village);
    return this.createMetaTags({
      title: `${village.name}, ${village.region} - CamerPulse`,
      description: `Discover ${village.name} in ${village.region}. View development projects, community information, and civic activities.`,
      canonical: getCanonicalURL(url)
    });
  }
}

/**
 * Navigation helpers
 */
export function createBreadcrumbs(path: string): Array<{ label: string; href: string }> {
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs = [{ label: 'Home', href: '/' }];
  
  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    
    // Convert slug back to readable format
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    breadcrumbs.push({ label, href: currentPath });
  }
  
  return breadcrumbs;
}

export default {
  generateSlug,
  URLBuilder,
  parseSlugForId,
  getLegacyRedirect,
  isValidSlug,
  getCanonicalURL,
  SEOHelper,
  createBreadcrumbs
};