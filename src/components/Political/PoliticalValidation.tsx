import { z } from 'zod';

// Validation schemas for political entities
export const politicianSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
    
  role_title: z.string()
    .min(2, 'Role title is required')
    .max(100, 'Role title cannot exceed 100 characters'),
    
  region: z.string()
    .min(2, 'Region is required')
    .max(50, 'Region cannot exceed 50 characters'),
    
  gender: z.enum(['male', 'female', 'other']).optional(),
  
  level_of_office: z.enum([
    'federal', 'regional', 'local', 'traditional', 'party'
  ]).optional(),
  
  profile_image_url: z.string().url('Invalid image URL').optional().or(z.literal('')),
  
  contact_email: z.string().email('Invalid email address').optional().or(z.literal('')),
  
  contact_phone: z.string()
    .regex(/^[\+]?[0-9\-\s\(\)]+$/, 'Invalid phone number format')
    .optional().or(z.literal('')),
    
  social_media: z.record(z.string().url('Invalid social media URL')).optional(),
  
  biography: z.string().max(2000, 'Biography cannot exceed 2000 characters').optional(),
});

export const politicalPartySchema = z.object({
  name: z.string()
    .min(3, 'Party name must be at least 3 characters')
    .max(100, 'Party name cannot exceed 100 characters')
    .regex(/^[a-zA-Z0-9\s'-]+$/, 'Party name contains invalid characters'),
    
  acronym: z.string()
    .min(2, 'Acronym must be at least 2 characters')
    .max(10, 'Acronym cannot exceed 10 characters')
    .regex(/^[A-Z0-9]+$/, 'Acronym must be uppercase letters and numbers only'),
    
  description: z.string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional(),
    
  founded_year: z.number()
    .int('Founded year must be a whole number')
    .min(1800, 'Founded year cannot be before 1800')
    .max(new Date().getFullYear(), 'Founded year cannot be in the future')
    .optional(),
    
  ideology: z.string()
    .max(50, 'Ideology cannot exceed 50 characters')
    .optional(),
    
  president_name: z.string()
    .max(100, 'President name cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s'-]*$/, 'President name contains invalid characters')
    .optional(),
    
  headquarters: z.string()
    .max(200, 'Headquarters cannot exceed 200 characters')
    .optional(),
    
  website_url: z.string().url('Invalid website URL').optional().or(z.literal('')),
  
  logo_url: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  
  social_media: z.record(z.string().url('Invalid social media URL')).optional(),
});

export const partyAffiliationSchema = z.object({
  politician_id: z.string().uuid('Invalid politician ID'),
  party_id: z.string().uuid('Invalid party ID'),
  
  start_date: z.string()
    .refine(date => !isNaN(Date.parse(date)), 'Invalid start date'),
    
  end_date: z.string()
    .refine(date => !isNaN(Date.parse(date)), 'Invalid end date')
    .optional(),
    
  position_in_party: z.string()
    .max(100, 'Position cannot exceed 100 characters')
    .optional(),
    
  is_current: z.boolean().default(true),
});

export const politicalRatingSchema = z.object({
  entity_id: z.string().uuid('Invalid entity ID'),
  entity_type: z.enum(['politician', 'party']),
  
  overall_rating: z.number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
    
  transparency_rating: z.number()
    .min(1, 'Transparency rating must be at least 1')
    .max(5, 'Transparency rating cannot exceed 5')
    .optional(),
    
  performance_rating: z.number()
    .min(1, 'Performance rating must be at least 1')
    .max(5, 'Performance rating cannot exceed 5')
    .optional(),
    
  engagement_rating: z.number()
    .min(1, 'Engagement rating must be at least 1')
    .max(5, 'Engagement rating cannot exceed 5')
    .optional(),
    
  review_content: z.string()
    .max(1000, 'Review cannot exceed 1000 characters')
    .optional(),
    
  review_title: z.string()
    .max(100, 'Review title cannot exceed 100 characters')
    .optional(),
});

// Search and filter validation
export const searchFiltersSchema = z.object({
  query: z.string()
    .max(100, 'Search query too long')
    .regex(/^[a-zA-Z0-9\s'-]*$/, 'Search contains invalid characters')
    .optional(),
    
  region: z.string()
    .max(50, 'Region filter too long')
    .optional(),
    
  role: z.string()
    .max(50, 'Role filter too long')
    .optional(),
    
  party: z.string()
    .max(100, 'Party filter too long')
    .optional(),
    
  sort_by: z.enum(['name', 'rating', 'region', 'role', 'created_at']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

// Utility functions for validation
export function validatePolitician(data: unknown) {
  return politicianSchema.safeParse(data);
}

export function validatePoliticalParty(data: unknown) {
  return politicalPartySchema.safeParse(data);
}

export function validatePartyAffiliation(data: unknown) {
  return partyAffiliationSchema.safeParse(data);
}

export function validatePoliticalRating(data: unknown) {
  return politicalRatingSchema.safeParse(data);
}

export function validateSearchFilters(data: unknown) {
  return searchFiltersSchema.safeParse(data);
}

// Input sanitization functions
export function sanitizeHtml(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/[<>]/g, '')
    .replace(/['"]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
}

export function validateImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
    const pathname = parsedUrl.pathname.toLowerCase();
    
    return validExtensions.some(ext => pathname.endsWith(ext)) ||
           url.includes('placeholder') ||
           url.includes('avatar') ||
           url.includes('profile');
  } catch {
    return false;
  }
}

// Type exports
export type PoliticianInput = z.infer<typeof politicianSchema>;
export type PoliticalPartyInput = z.infer<typeof politicalPartySchema>;
export type PartyAffiliationInput = z.infer<typeof partyAffiliationSchema>;
export type PoliticalRatingInput = z.infer<typeof politicalRatingSchema>;
export type SearchFiltersInput = z.infer<typeof searchFiltersSchema>;