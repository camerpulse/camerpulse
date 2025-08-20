import { z } from 'zod';

/**
 * Centralized validation schemas for CamerPulse
 * Consolidates validation logic across the application
 */

// Common validation patterns
export const emailSchema = z.string().email('Invalid email address');
export const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number');
export const urlSchema = z.string().url('Invalid URL');
export const slugSchema = z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens');

// Rating validation
export const ratingSchema = z.object({
  overall_rating: z.number().min(1).max(5),
  transparency_rating: z.number().min(1).max(5).optional(),
  civic_engagement_rating: z.number().min(1).max(5).optional(),
  crisis_response_rating: z.number().min(1).max(5).optional(),
  promise_delivery_rating: z.number().min(1).max(5).optional(),
  performance_rating: z.number().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
  is_anonymous: z.boolean().optional()
});

// Profile validation schemas
export const politicianProfileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  position_title: z.string().min(2, 'Position title is required'),
  region: z.string().optional(),
  political_party: z.string().optional(),
  date_of_birth: z.string().optional(),
  education: z.string().optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  village_hometown: z.string().optional(),
  official_profile_url: urlSchema.optional()
});

export const petitionSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  category: z.string().min(1, 'Category is required'),
  target_signatures: z.number().min(10, 'Target signatures must be at least 10'),
  deadline: z.string().optional(),
  tags: z.array(z.string()).optional()
});

export const villageSchema = z.object({
  name: z.string().min(2, 'Village name must be at least 2 characters'),
  region: z.string().min(1, 'Region is required'),
  subdivision: z.string().optional(),
  district: z.string().optional(),
  population: z.number().positive().optional(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number()
  }).optional(),
  chief_name: z.string().optional(),
  contact_info: z.object({
    phone: phoneSchema.optional(),
    email: emailSchema.optional()
  }).optional()
});

export const companySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  industry: z.string().min(1, 'Industry is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  location: z.string().optional(),
  website: urlSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  registration_number: z.string().optional(),
  founded_year: z.number().min(1800).max(new Date().getFullYear()).optional()
});

// Message validation
export const messageSchema = z.object({
  recipient_id: z.string().uuid('Invalid recipient ID'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  content: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message too long'),
  is_anonymous: z.boolean().optional()
});

// Comment validation
export const commentSchema = z.object({
  content: z.string().min(5, 'Comment must be at least 5 characters').max(500, 'Comment too long'),
  parent_id: z.string().uuid().optional()
});

/**
 * Validation utility functions
 */
export class ValidationService {
  /**
   * Validate data against a schema and return formatted errors
   */
  static validate<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    errors?: Record<string, string>;
  } {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return { success: true, data: result.data };
    }

    const errors: Record<string, string> = {};
    result.error.errors.forEach((error) => {
      const path = error.path.join('.');
      errors[path] = error.message;
    });

    return { success: false, errors };
  }

  /**
   * Sanitize HTML content
   */
  static sanitizeHtml(html: string): string {
    // Basic HTML sanitization - in production, use a proper library like DOMPurify
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  /**
   * Validate and clean user input
   */
  static cleanInput(input: string): string {
    return input.trim().replace(/\s+/g, ' ');
  }

  /**
   * Check if file is valid image
   */
  static isValidImage(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    return validTypes.includes(file.type) && file.size <= maxSize;
  }

  /**
   * Generate secure filename
   */
  static generateSecureFilename(originalName: string): string {
    const extension = originalName.split('.').pop() || '';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `${timestamp}_${random}.${extension}`;
  }
}