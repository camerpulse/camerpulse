export interface Institution {
  id: string;
  name: string;
  institution_type: 'school' | 'hospital' | 'pharmacy' | 'village';
  description?: string;
  region?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VillageData {
  id: string;
  institution_id: string;
  chief_name?: string;
  chief_contact?: string;
  population?: number;
  development_score: number;
  culture_score: number;
  education_score: number;
  conflict_resolution_score: number;
  heritage_info?: string;
  major_projects: string[];
  fundraising_campaigns: any[];
  petitions: any[];
  created_at: string;
  updated_at: string;
}

export interface InstitutionClaim {
  id: string;
  institution_id: string;
  claimant_id: string;
  claim_evidence: string[];
  claim_reason?: string;
  admin_notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SponsoredListing {
  id: string;
  institution_id: string;
  sponsor_user_id: string;
  listing_type: 'homepage_banner' | 'top_of_search' | 'map_pin_priority';
  duration_days: number;
  amount_paid?: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  payment_status: 'pending' | 'paid' | 'failed';
  stripe_payment_intent_id?: string;
  analytics_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}