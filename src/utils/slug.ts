/**
 * Unified Slug Generation System for CamerPulse
 * Consolidates all slug utilities into a single, maintainable module
 */

export interface SlugEntity {
  id: string;
  slug?: string;
  name?: string;
  title?: string;
}

export interface PoliticianEntity extends SlugEntity {
  name: string;
  position?: string;
  region?: string;
}

export interface VillageEntity extends SlugEntity {
  name: string;
  region: string;
  division?: string;
}

export interface InstitutionEntity extends SlugEntity {
  name: string;
  type: 'hospital' | 'school' | 'pharmacy';
  region: string;
}

/**
 * Core slug generation function with enhanced character handling
 */
export function generateSlug(text: string, id?: string): string {
  if (!text) return id || 'item';
  
  let slug = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  // Enhanced character normalization
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
  
  if (id) {
    slug = slug ? `${slug}-${id}` : id;
  }
  
  return slug || 'item';
}

/**
 * Extract ID from slug
 */
export function parseSlugForId(slug: string): string | null {
  if (!slug) return null;
  
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
 * Validate slug format
 */
export function isValidSlug(slug: string): boolean {
  if (!slug) return false;
  return /^[a-z0-9-]+$/.test(slug) && 
         !slug.startsWith('-') && 
         !slug.endsWith('-') &&
         !slug.includes('--');
}

/**
 * Unified URL builder with type safety
 */
export class URLBuilder {
  private static getLanguagePrefix(): string {
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

  static parties = {
    list: () => `${URLBuilder.getLanguagePrefix()}/parties`,
    detail: (entity: SlugEntity & { name: string }) => {
      const slug = entity.slug || generateSlug(entity.name, entity.id);
      return `${URLBuilder.getLanguagePrefix()}/parties/${slug}`;
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
    detail: (entity: SlugEntity & { title: string }) => {
      const slug = entity.slug || generateSlug(entity.title, entity.id);
      return `${URLBuilder.getLanguagePrefix()}/petitions/${slug}`;
    },
    create: () => `${URLBuilder.getLanguagePrefix()}/petitions/create`
  };

  static events = {
    list: () => `${URLBuilder.getLanguagePrefix()}/events`,
    detail: (entity: SlugEntity & { title: string }) => {
      const slug = entity.slug || generateSlug(entity.title, entity.id);
      return `${URLBuilder.getLanguagePrefix()}/events/${slug}`;
    }
  };

  static profiles = {
    user: (userId: string) => `/profile/${userId}`,
    username: (username: string) => `/profile/${username}`,
    userSlug: (username: string) => `/@${username}`,
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
 * Content-specific slug generators
 */
export class ContentSlugGenerator {
  static politician(name: string, position?: string, region?: string): string {
    let slugText = name;
    if (position) slugText += ` ${position}`;
    if (region) slugText += ` ${region}`;
    return generateSlug(slugText);
  }

  static village(name: string, region: string, division?: string): string {
    let slugText = `${name} ${region}`;
    if (division) slugText += ` ${division}`;
    return generateSlug(slugText);
  }

  static content(title: string, category?: string): string {
    let slugText = title;
    if (category) slugText += ` ${category}`;
    return generateSlug(slugText);
  }

  static username(username: string, suffix?: string): string {
    let slugText = username;
    if (suffix) slugText += ` ${suffix}`;
    return generateSlug(slugText);
  }
}

/**
 * Profile-specific utilities
 */
export class ProfileSlugHelper {
  static createMusicSlug(artistName: string, id: string): string {
    const slug = generateSlug(artistName, id);
    return URLBuilder.profiles.music(slug.replace(`-${id}`, ''), id);
  }

  static createJobSlug(username: string, id: string): string {
    const slug = generateSlug(username);
    return URLBuilder.profiles.job(slug, id);
  }

  static createVillageSlug(username: string): string {
    const slug = generateSlug(username);
    return URLBuilder.profiles.village(slug);
  }

  static createMarketplaceSlug(username: string, id: string): string {
    const slug = generateSlug(username);
    return URLBuilder.profiles.marketplace(slug, id);
  }

  static parseProfileUrl(url: string): {
    type: 'user' | 'music' | 'job' | 'village' | 'marketplace' | null;
    username?: string;
    id?: string;
    slug?: string;
  } {
    const path = url.replace(window.location.origin, '');
    
    const patterns = {
      music: /^\/music\/artists\/(.+)-([^-]+)$/,
      job: /^\/jobs\/profile\/(.+)-([^-]+)$/,
      village: /^\/villages\/members\/(.+)$/,
      marketplace: /^\/marketplace\/vendors\/(.+)-([^-]+)$/,
      user: /^\/profile\/(.+)$/,
      userSlug: /^\/@(.+)$/
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      const match = path.match(pattern);
      if (match) {
        if (type === 'village' || type === 'user' || type === 'userSlug') {
          return {
            type: type === 'userSlug' ? 'user' : type as any,
            username: match[1],
            slug: match[1]
          };
        } else {
          return {
            type: type as any,
            username: match[1],
            id: match[2],
            slug: match[1]
          };
        }
      }
    }

    return { type: null };
  }
}

/**
 * Canonical URL generation for SEO
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
 * Breadcrumb navigation helpers
 */
export function createBreadcrumbs(path: string): Array<{ label: string; href: string }> {
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs = [{ label: 'Home', href: '/' }];
  
  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    breadcrumbs.push({ label, href: currentPath });
  }
  
  return breadcrumbs;
}

/**
 * Legacy redirect handling
 */
export const LEGACY_REDIRECTS: Record<string, (id: string, lang?: string) => string> = {
  '/politician/:id': (id: string, lang = 'en') => `/${lang}/politicians/${id}`,
  '/village-info/:id': (id: string, lang = 'en') => `/${lang}/villages/${id}`,
  '/user-profile/:id': (id: string, lang = 'en') => `/${lang}/profile/${id}`,
  '/ministry/:id': (id: string, lang = 'en') => `/${lang}/ministries/${id}`,
  '/council/:id': (id: string, lang = 'en') => `/${lang}/councils/${id}`,
  '/:lang/politician/:id': (id: string, lang = 'en') => `/${lang}/politicians/${id}`,
  '/:lang/village-info/:id': (id: string, lang = 'en') => `/${lang}/villages/${id}`,
  '/:lang/user-profile/:id': (id: string, lang = 'en') => `/${lang}/profile/${id}`,
};

export function getLegacyRedirect(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  let detectedLang = 'en';
  
  if (segments[0] === 'en') {
    detectedLang = segments[0];
  }

  for (const [pattern, generator] of Object.entries(LEGACY_REDIRECTS)) {
    let regexPattern = pattern
      .replace(':lang', '(en)')
      .replace(':id', '([^/]+)');
    
    const regex = new RegExp(`^${regexPattern}$`);
    const match = pathname.match(regex);
    
    if (match) {
      const id = match[match.length - 1];
      const lang = match[1] || detectedLang;
      return generator(id, lang);
    }
  }
  
  return null;
}

/**
 * Async slug resolution with redirect handling
 */
export async function resolveSlug(entityType: string, inputSlug: string) {
  const { supabase } = await import('@/integrations/supabase/client');
  
  const { data, error } = await supabase.rpc('get_entity_by_slug', {
    entity_type: entityType,
    input_slug: inputSlug
  });
  
  if (error || !data || data.length === 0) {
    return null;
  }
  
  return data[0];
}

// Default export for backward compatibility
export default {
  generateSlug,
  URLBuilder,
  parseSlugForId,
  getLegacyRedirect,
  isValidSlug,
  getCanonicalURL,
  SEOHelper,
  createBreadcrumbs,
  ContentSlugGenerator,
  ProfileSlugHelper
};