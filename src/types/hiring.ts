export interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  sponsor_type: 'ngo' | 'government' | 'private' | 'international';
  contact_email: string | null;
  website_url: string | null;
  regions_focus: string[];
  sectors_focus: string[];
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HiringCampaign {
  id: string;
  sponsor_id: string;
  name: string;
  description: string | null;
  target_hires: number;
  current_hires: number;
  target_demographics: Record<string, any>;
  target_sectors: string[];
  target_regions: string[];
  budget_allocated: number | null;
  start_date: string;
  end_date: string;
  is_public: boolean;
  campaign_status: 'active' | 'completed' | 'paused' | 'cancelled';
  success_metrics: Record<string, any>;
  created_at: string;
  updated_at: string;
  sponsor?: Sponsor;
}

export interface CampaignHire {
  id: string;
  campaign_id: string;
  job_id: string | null;
  user_id: string | null;
  employer_name: string | null;
  job_title: string;
  sector: string | null;
  region: string | null;
  gender: string | null;
  age_group: string | null;
  hire_date: string;
  verified: boolean;
  verified_by: string | null;
  verification_notes: string | null;
  created_at: string;
}

export interface RegionalHiringStats {
  id: string;
  region: string;
  period_type: 'daily' | 'weekly' | 'monthly';
  period_start: string;
  period_end: string;
  total_hires: number;
  total_job_posts: number;
  top_sectors: Array<{ sector: string; count: number }>;
  active_employers: number;
  population_normalized_rate: number | null;
  created_at: string;
}

export interface SponsorImpactMetrics {
  id: string;
  sponsor_id: string;
  metric_type: string;
  metric_value: number;
  period_start: string;
  period_end: string;
  additional_data: Record<string, any>;
  created_at: string;
}

export interface JobSeekerBadge {
  id: string;
  user_id: string;
  badge_type: string;
  badge_name: string;
  badge_description: string | null;
  campaign_id: string | null;
  sponsor_id: string | null;
  verification_url: string | null;
  badge_image_url: string | null;
  earned_date: string;
  is_public: boolean;
  is_shareable: boolean;
  created_at: string;
  campaign?: HiringCampaign;
  sponsor?: Sponsor;
}