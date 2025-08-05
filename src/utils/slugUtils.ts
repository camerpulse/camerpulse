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
 * Generates a URL-safe slug from text
 */
export function generateSlug(text: string, id?: string): string {
  if (!text) return id || 'item';
  
  let slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  
  // Append ID if provided
  if (id) {
    slug = slug ? `${slug}-${id}` : id;
  }
  
  return slug || 'item';
}

/**
 * Creates SEO-friendly URLs for different entity types
 */
export class URLBuilder {
  static politicians = {
    list: () => '/politicians',
    detail: (entity: PoliticianEntity) => {
      const slug = entity.slug || generateSlug(entity.name, entity.id);
      return `/politicians/${slug}`;
    }
  };

  static senators = {
    list: () => '/senators',
    detail: (entity: PoliticianEntity) => {
      const slug = entity.slug || generateSlug(entity.name, entity.id);
      return `/senators/${slug}`;
    }
  };

  static mps = {
    list: () => '/mps',
    detail: (entity: PoliticianEntity) => {
      const slug = entity.slug || generateSlug(entity.name, entity.id);
      return `/mps/${slug}`;
    }
  };

  static ministers = {
    list: () => '/ministers',
    detail: (entity: PoliticianEntity) => {
      const slug = entity.slug || generateSlug(entity.name, entity.id);
      return `/ministers/${slug}`;
    }
  };

  static villages = {
    list: () => '/villages',
    detail: (entity: VillageEntity) => {
      const slug = entity.slug || generateSlug(`${entity.name}-${entity.region}`, entity.id);
      return `/villages/${slug}`;
    }
  };

  static institutions = {
    hospitals: {
      list: () => '/hospitals',
      detail: (entity: InstitutionEntity) => {
        const slug = entity.slug || generateSlug(entity.name, entity.id);
        return `/hospitals/${slug}`;
      }
    },
    schools: {
      list: () => '/schools',
      detail: (entity: InstitutionEntity) => {
        const slug = entity.slug || generateSlug(entity.name, entity.id);
        return `/schools/${slug}`;
      }
    },
    pharmacies: {
      list: () => '/pharmacies',
      detail: (entity: InstitutionEntity) => {
        const slug = entity.slug || generateSlug(entity.name, entity.id);
        return `/pharmacies/${slug}`;
      }
    }
  };

  static petitions = {
    list: () => '/petitions',
    detail: (entity: SluggedEntity & { title: string }) => {
      const slug = entity.slug || generateSlug(entity.title, entity.id);
      return `/petitions/${slug}`;
    },
    create: () => '/petitions/create'
  };

  static events = {
    list: () => '/events',
    detail: (entity: SluggedEntity & { title: string }) => {
      const slug = entity.slug || generateSlug(entity.title, entity.id);
      return `/events/${slug}`;
    }
  };

  static profiles = {
    user: (userId: string) => `/profile/${userId}`,
    slug: (username: string) => `/@${username}`
  };

  static admin = {
    dashboard: () => '/admin/dashboard',
    politicians: () => '/admin/politicians',
    villages: () => '/admin/villages',
    moderation: () => '/moderation-center'
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
export const LEGACY_REDIRECTS: Record<string, (id: string) => string> = {
  '/politician/:id': (id: string) => `/politicians/${id}`,
  '/village-info/:id': (id: string) => `/villages/${id}`,
  '/user-profile/:id': (id: string) => `/profile/${id}`,
  '/ministry/:id': (id: string) => `/ministries/${id}`,
  '/council/:id': (id: string) => `/councils/${id}`,
};

/**
 * Checks if a URL is a legacy format and returns the new URL
 */
export function getLegacyRedirect(pathname: string): string | null {
  for (const [pattern, generator] of Object.entries(LEGACY_REDIRECTS)) {
    const regex = new RegExp(pattern.replace(':id', '([^/]+)'));
    const match = pathname.match(regex);
    
    if (match) {
      return generator(match[1]);
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