// CamerPulse Jobs Type Definitions

export interface JobCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color?: string;
  slug: string;
  is_active: boolean;
  job_count: number;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  user_id: string;
  company_name: string;
  company_description?: string;
  website_url?: string;
  company_logo_url?: string;
  industry?: string;
  company_size?: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
  location?: string;
  region?: string;
  contact_email?: string;
  contact_phone?: string;
  is_verified: boolean;
  verification_documents: any[];
  social_links: Record<string, string>;
  founded_year?: number;
  average_rating: number;
  total_reviews: number;
  total_jobs_posted: number;
  total_hires: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  company_id: string;
  category_id?: string;
  title: string;
  slug: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  job_type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'remote';
  experience_level?: 'entry' | 'junior' | 'mid' | 'senior' | 'executive';
  location?: string;
  region?: string;
  is_remote: boolean;
  application_deadline?: string;
  status: 'draft' | 'open' | 'closed' | 'filled';
  featured: boolean;
  views_count: number;
  applications_count: number;
  external_apply_url?: string;
  contact_email?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  
  // Relations (populated when joined)
  company?: Company;
  category?: JobCategory;
}

export interface JobApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  cover_letter?: string;
  cv_url?: string;
  portfolio_url?: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interviewed' | 'hired' | 'rejected';
  notes?: string;
  applied_at: string;
  updated_at: string;
  
  // Relations
  job?: Job;
}

export interface ExpertProfile {
  id: string;
  user_id: string;
  professional_title: string;
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  availability: 'available' | 'busy' | 'not_available';
  work_preference: ('remote' | 'on_site')[];
  expertise_areas: string[];
  certifications: any[];
  portfolio_items: any[];
  years_experience?: number;
  education: any[];
  languages: string[];
  is_verified: boolean;
  is_featured: boolean;
  is_active: boolean;
  payment_status: 'pending' | 'paid' | 'expired';
  featured_until?: string;
  average_rating: number;
  total_reviews: number;
  total_projects: number;
  profile_views: number;
  created_at: string;
  updated_at: string;
}

export interface JobBookmark {
  id: string;
  user_id: string;
  job_id: string;
  created_at: string;
}

export interface JobView {
  id: string;
  job_id: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  viewed_at: string;
}

// Filter types for job search
export interface JobFilters {
  category?: string;
  location?: string;
  region?: string;
  job_type?: string;
  experience_level?: string;
  salary_min?: number;
  salary_max?: number;
  is_remote?: boolean;
  search_query?: string;
}

// Job search results
export interface JobSearchResult {
  jobs: Job[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}