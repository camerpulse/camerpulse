import type { Database } from "@/integrations/supabase/types";

export type Institution = Database['public']['Tables']['institutions']['Row'];

export type VillageData = Database['public']['Tables']['village_data']['Row'];

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

export interface InstitutionMessage {
  id: string;
  institution_id: string;
  sender_id: string;
  sender_name: string;
  sender_type: 'user' | 'moderator' | 'admin';
  subject: string;
  message_content: string;
  message_type: 'general' | 'urgent' | 'support';
  is_read: boolean;
  replied_at?: string;
  reply_content?: string;
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