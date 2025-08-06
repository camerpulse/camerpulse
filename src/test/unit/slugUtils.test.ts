import { describe, it, expect } from 'vitest';
import { 
  generateSlug, 
  parseSlugForId, 
  isValidSlug, 
  getCanonicalURL,
  URLBuilder 
} from '@/utils/slugUtils';
import { ProfileSlugHelper, ContentSlugGenerator } from '@/utils/profileSlugUtils';

describe('Slug Generation Utilities', () => {
  describe('generateSlug', () => {
    it('should create basic slug from text', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
    });

    it('should handle special characters', () => {
      expect(generateSlug('Jean-Claude Van Damme')).toBe('jean-claude-van-damme');
      expect(generateSlug('Test & Development')).toBe('test-development');
    });

    it('should append ID when provided', () => {
      expect(generateSlug('Test Title', '123')).toBe('test-title-123');
    });

    it('should handle empty strings', () => {
      expect(generateSlug('')).toBe('');
      expect(generateSlug('', '123')).toBe('123');
    });
  });

  describe('parseSlugForId', () => {
    it('should extract UUID from slug', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      expect(parseSlugForId(`test-slug-${uuid}`)).toBe(uuid);
    });

    it('should extract numeric ID from slug', () => {
      expect(parseSlugForId('test-slug-123')).toBe('123');
    });

    it('should return null for slug without ID', () => {
      expect(parseSlugForId('test-slug')).toBeNull();
    });
  });

  describe('isValidSlug', () => {
    it('should validate correct slugs', () => {
      expect(isValidSlug('valid-slug')).toBe(true);
      expect(isValidSlug('valid-slug-123')).toBe(true);
    });

    it('should reject invalid slugs', () => {
      expect(isValidSlug('Invalid Slug')).toBe(false);
      expect(isValidSlug('invalid_slug')).toBe(false);
      expect(isValidSlug('invalid@slug')).toBe(false);
    });
  });

  describe('URLBuilder', () => {
    const builder = new URLBuilder();

    it('should build politician URLs', () => {
      const politician = { id: '123', name: 'John Doe', position: 'Mayor' };
      expect(builder.politician(politician)).toBe('/politicians/john-doe-mayor-123');
    });

    it('should build village URLs', () => {
      const village = { id: '456', name: 'Test Village', region: 'Test Region' };
      expect(builder.village(village)).toBe('/villages/test-village-test-region-456');
    });

    it('should build profile URLs', () => {
      expect(builder.profile('testuser')).toBe('/profile/testuser');
    });
  });
});

describe('Profile Slug Helper', () => {
  describe('createMusicSlug', () => {
    it('should create music artist slug', () => {
      expect(ProfileSlugHelper.createMusicSlug('John Artist', '123'))
        .toBe('john-artist-123');
    });
  });

  describe('createJobSlug', () => {
    it('should create job profile slug', () => {
      expect(ProfileSlugHelper.createJobSlug('developer123', '456'))
        .toBe('developer123-456');
    });
  });

  describe('parseProfileUrl', () => {
    it('should parse user profile URL', () => {
      const result = ProfileSlugHelper.parseProfileUrl('/profile/testuser');
      expect(result).toEqual({
        type: 'user',
        username: 'testuser'
      });
    });

    it('should parse music profile URL', () => {
      const result = ProfileSlugHelper.parseProfileUrl('/music/artist-name-123');
      expect(result).toEqual({
        type: 'music',
        slug: 'artist-name-123'
      });
    });
  });
});

describe('Content Slug Generator', () => {
  describe('politician', () => {
    it('should generate politician slug with position and region', () => {
      expect(ContentSlugGenerator.politician('John Doe', 'Mayor', 'City Center'))
        .toBe('john-doe-mayor-city-center');
    });

    it('should generate politician slug with only name', () => {
      expect(ContentSlugGenerator.politician('Jane Smith'))
        .toBe('jane-smith');
    });
  });

  describe('village', () => {
    it('should generate village slug', () => {
      expect(ContentSlugGenerator.village('Test Village', 'Test Region', 'Test Division'))
        .toBe('test-village-test-region-test-division');
    });
  });

  describe('content', () => {
    it('should generate content slug with category', () => {
      expect(ContentSlugGenerator.content('Test Article', 'News'))
        .toBe('test-article-news');
    });
  });
});