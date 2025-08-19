/**
 * CamerPulse Core Types
 * Central type definitions for the entire application
 */

// === AUTHENTICATION & USER TYPES ===
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website_url: string | null;
  is_diaspora: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'moderator' | 'user';

// === POLITICAL ENTITY TYPES ===
export interface PoliticalEntity {
  id: string;
  name: string;
  slug: string;
  role_title: string | null;
  party: string | null;
  region: string | null;
  constituency: string | null;
  profile_image_url: string | null;
  biography: string | null;
  education: string | null;
  career_background: string | null;
  contact_phone: string | null;
  contact_website: string | null;
  contact_office: string | null;
  is_currently_in_office: boolean;
  verified: boolean;
  performance_score: number | null;
  transparency_rating: number | null;
  integrity_rating: number | null;
  development_impact_rating: number | null;
  follower_count: number;
  term_start_date: string | null;
  created_at: string;
  updated_at: string;
}

export type PoliticalEntityType = 'politician' | 'senator' | 'mp' | 'minister';

// === CIVIC ENTITY TYPES ===
export type CivicEntityType = 'school' | 'hospital' | 'pharmacy' | 'village' | 'company';

export interface CivicEntity {
  id: string;
  name: string;
  type: CivicEntityType;
  region: string;
  division?: string;
  village_or_city: string;
  phone?: string;
  email?: string;
  website?: string;
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  overall_rating: number;
  total_ratings: number;
  created_at: string;
  updated_at: string;
}

// === VILLAGE TYPES ===
export interface Village {
  id: string;
  village_name: string;
  region: string;
  division: string;
  subdivision: string;
  population: number | null;
  village_chief_name: string | null;
  fon_name: string | null;
  primary_language: string | null;
  description: string | null;
  slug: string;
  overall_rating: number;
  created_at: string;
  updated_at: string;
}

// === JOB TYPES ===
export interface Job {
  id: string;
  title: string;
  slug: string;
  company_name: string;
  company_logo: string | null;
  location: string;
  region: string;
  job_type: 'full_time' | 'part_time' | 'contract' | 'internship';
  experience_level: 'entry' | 'junior' | 'mid' | 'senior' | 'executive';
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  description: string;
  requirements: string | null;
  benefits: string | null;
  deadline: string | null;
  status: 'open' | 'closed' | 'draft';
  is_featured: boolean;
  is_urgent: boolean;
  is_remote: boolean;
  views_count: number;
  applications_count: number;
  created_at: string;
  updated_at: string;
}

// === MESSAGING TYPES ===
export interface Conversation {
  id: string;
  title: string | null;
  is_group: boolean;
  created_by: string | null;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'forwarded';
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

// === EVENT TYPES ===
export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  venue_name: string;
  venue_address: string;
  organizer_id: string;
  category: string;
  status: 'draft' | 'pending' | 'approved' | 'cancelled';
  max_attendees: number | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

// === POLL TYPES ===
export interface Poll {
  id: string;
  title: string;
  description: string | null;
  region: string | null;
  poll_type: 'public_opinion' | 'election_prediction' | 'policy_preference';
  status: 'active' | 'closed' | 'draft';
  votes_count: number;
  created_by: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

// === API RESPONSE TYPES ===
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// === FORM TYPES ===
export interface FormField {
  name: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'file';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

// === NOTIFICATION TYPES ===
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  action_url: string | null;
  created_at: string;
}

// === SEARCH TYPES ===
export interface SearchFilters {
  query?: string;
  region?: string;
  type?: string;
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface SearchResult<T> {
  item: T;
  score: number;
  highlights: string[];
}

// === ANALYTICS TYPES ===
export interface AnalyticsData {
  views: number;
  interactions: number;
  engagement_rate: number;
  period: string;
}

// === ROUTING TYPES ===
export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  title: string;
  description?: string;
  requiresAuth?: boolean;
  requiredRole?: UserRole;
}

// === COMPONENT PROP TYPES ===
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface CardProps extends BaseComponentProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export interface ListItemProps extends BaseComponentProps {
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
}

// === UTILITY TYPES ===
export type OptionalExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;
export type RequiredExcept<T, K extends keyof T> = Required<T> & Partial<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// === STATUS TYPES ===
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type ContentStatus = 'draft' | 'published' | 'archived' | 'deleted';

// === PERMISSION TYPES ===
export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  conditions?: Record<string, any>;
}

// === ERROR TYPES ===
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// === THEME TYPES ===
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
}