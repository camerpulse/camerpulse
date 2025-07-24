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
  title: string;
  slug: string;
  company_id?: string;
  company_name: string;
  company_logo?: string;
  category_id?: string;
  location: string;
  region: string;
  job_type: string;
  experience_level: string;
  education_level?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  salary_period?: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  how_to_apply?: string;
  external_url?: string;
  external_apply_url?: string;
  application_email?: string;
  deadline?: string;
  application_deadline?: string;
  is_featured: boolean;
  featured: boolean;
  is_urgent: boolean;
  is_remote: boolean;
  status: string;
  views_count?: number;
  applications_count?: number;
  created_by?: string;
  tags?: string[];
  meta_data?: any;
  created_at: string;
  updated_at: string;
  published_at?: string;
  expires_at?: string;
  
  // Relations (populated when joined)
  company?: Company;
  companies?: Company;
  category?: JobCategory;
  job_categories?: JobCategory;
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