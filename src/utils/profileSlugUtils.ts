import { generateSlug, parseSlugForId, URLBuilder } from '@/utils/slugUtils';

/**
 * Profile-specific slug utilities for CamerPulse modules
 */
export class ProfileSlugHelper {
  
  /**
   * Generate music artist profile slug
   */
  static createMusicSlug(artistName: string, id: string): string {
    const slug = generateSlug(artistName, id);
    return URLBuilder.profiles.music(slug.replace(`-${id}`, ''), id);
  }

  /**
   * Generate job profile slug
   */
  static createJobSlug(username: string, id: string): string {
    const slug = generateSlug(username);
    return URLBuilder.profiles.job(slug, id);
  }

  /**
   * Generate village member profile slug
   */
  static createVillageSlug(username: string): string {
    const slug = generateSlug(username);
    return URLBuilder.profiles.village(slug);
  }

  /**
   * Generate marketplace vendor profile slug
   */
  static createMarketplaceSlug(username: string, id: string): string {
    const slug = generateSlug(username);
    return URLBuilder.profiles.marketplace(slug, id);
  }

  /**
   * Generate product listing slug
   */
  static createProductSlug(productName: string, id: string): string {
    const slug = generateSlug(productName, id);
    return URLBuilder.marketplace.product(slug.replace(`-${id}`, ''), id);
  }

  /**
   * Generate job posting slug
   */
  static createJobPostingSlug(jobTitle: string, id: string): string {
    const slug = generateSlug(jobTitle, id);
    return URLBuilder.jobs.detail(slug.replace(`-${id}`, ''), id);
  }

  /**
   * Generate petition slug
   */
  static createPetitionSlug(title: string, id: string): string {
    const slug = generateSlug(title, id);
    return URLBuilder.petitions.detail({ title, id, slug: slug.replace(`-${id}`, '') });
  }

  /**
   * Parse any profile URL and extract relevant info
   */
  static parseProfileUrl(url: string): {
    type: 'user' | 'music' | 'job' | 'village' | 'marketplace' | null;
    username?: string;
    id?: string;
    slug?: string;
  } {
    const path = url.replace(window.location.origin, '');
    
    // Match different profile patterns
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
 * SEO-optimized slug generator for different content types
 */
export class ContentSlugGenerator {
  
  /**
   * Generate politician slug with SEO keywords
   */
  static politician(name: string, position?: string, region?: string): string {
    let slugText = name;
    if (position) slugText += ` ${position}`;
    if (region) slugText += ` ${region}`;
    return generateSlug(slugText);
  }

  /**
   * Generate village slug with geographic context
   */
  static village(name: string, region: string, division?: string): string {
    let slugText = `${name} ${region}`;
    if (division) slugText += ` ${division}`;
    return generateSlug(slugText);
  }

  /**
   * Generate content slug with category context
   */
  static content(title: string, category?: string): string {
    let slugText = title;
    if (category) slugText += ` ${category}`;
    return generateSlug(slugText);
  }

  /**
   * Generate username-based slug
   */
  static username(username: string, suffix?: string): string {
    let slugText = username;
    if (suffix) slugText += ` ${suffix}`;
    return generateSlug(slugText);
  }
}

export default {
  ProfileSlugHelper,
  ContentSlugGenerator,
  generateSlug,
  parseSlugForId,
  URLBuilder
};