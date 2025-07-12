export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      approval_ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          politician_id: string
          rating: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          politician_id: string
          rating?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          politician_id?: string
          rating?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_ratings_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          is_anonymous: boolean | null
          message: string | null
          payment_method: string | null
          payment_status: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          is_anonymous?: boolean | null
          message?: string | null
          payment_method?: string | null
          payment_status?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          is_anonymous?: boolean | null
          message?: string | null
          payment_method?: string | null
          payment_status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      encrypted_messages: {
        Row: {
          created_at: string | null
          encrypted_content: string
          encryption_method: string | null
          expires_at: string | null
          id: string
          is_anonymous: boolean | null
          recipient_id: string
          sender_id: string
          signature_verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          encrypted_content: string
          encryption_method?: string | null
          expires_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          recipient_id: string
          sender_id: string
          signature_verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          encrypted_content?: string
          encryption_method?: string | null
          expires_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          recipient_id?: string
          sender_id?: string
          signature_verified?: boolean | null
        }
        Relationships: []
      }
      failed_login_attempts: {
        Row: {
          attempt_time: string | null
          email: string
          id: string
          ip_address: unknown
          reason: string | null
          user_agent: string | null
        }
        Insert: {
          attempt_time?: string | null
          email: string
          id?: string
          ip_address: unknown
          reason?: string | null
          user_agent?: string | null
        }
        Update: {
          attempt_time?: string | null
          email?: string
          id?: string
          ip_address?: unknown
          reason?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      marketplace_products: {
        Row: {
          category: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          images: string[] | null
          in_stock: boolean | null
          name: string
          price: number
          stock_quantity: number | null
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          in_stock?: boolean | null
          name: string
          price: number
          stock_quantity?: number | null
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          in_stock?: boolean | null
          name?: string
          price?: number
          stock_quantity?: number | null
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "marketplace_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_vendors: {
        Row: {
          business_name: string
          created_at: string | null
          description: string | null
          id: string
          kyc_document_url: string | null
          rating: number | null
          total_sales: number | null
          updated_at: string | null
          user_id: string
          vendor_id: string
          verification_status: string | null
        }
        Insert: {
          business_name: string
          created_at?: string | null
          description?: string | null
          id?: string
          kyc_document_url?: string | null
          rating?: number | null
          total_sales?: number | null
          updated_at?: string | null
          user_id: string
          vendor_id: string
          verification_status?: string | null
        }
        Update: {
          business_name?: string
          created_at?: string | null
          description?: string | null
          id?: string
          kyc_document_url?: string | null
          rating?: number | null
          total_sales?: number | null
          updated_at?: string | null
          user_id?: string
          vendor_id?: string
          verification_status?: string | null
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          content: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          image_url: string | null
          is_pinned: boolean | null
          published_at: string | null
          sentiment_label: string | null
          sentiment_score: number | null
          source_name: string | null
          source_url: string | null
          title: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          published_at?: string | null
          sentiment_label?: string | null
          sentiment_score?: number | null
          source_name?: string | null
          source_url?: string | null
          title: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          published_at?: string | null
          sentiment_label?: string | null
          sentiment_score?: number | null
          source_name?: string | null
          source_url?: string | null
          title?: string
        }
        Relationships: []
      }
      party_ratings: {
        Row: {
          approval_rating: number | null
          comment: string | null
          created_at: string
          development_rating: number | null
          id: string
          party_id: string
          transparency_rating: number | null
          trust_rating: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_rating?: number | null
          comment?: string | null
          created_at?: string
          development_rating?: number | null
          id?: string
          party_id: string
          transparency_rating?: number | null
          trust_rating?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_rating?: number | null
          comment?: string | null
          created_at?: string
          development_rating?: number | null
          id?: string
          party_id?: string
          transparency_rating?: number | null
          trust_rating?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "party_ratings_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "political_parties"
            referencedColumns: ["id"]
          },
        ]
      }
      password_policies: {
        Row: {
          id: string
          lockout_duration_minutes: number | null
          max_age_days: number | null
          max_failed_attempts: number | null
          min_length: number | null
          prevent_reuse_count: number | null
          require_lowercase: boolean | null
          require_numbers: boolean | null
          require_symbols: boolean | null
          require_uppercase: boolean | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          lockout_duration_minutes?: number | null
          max_age_days?: number | null
          max_failed_attempts?: number | null
          min_length?: number | null
          prevent_reuse_count?: number | null
          require_lowercase?: boolean | null
          require_numbers?: boolean | null
          require_symbols?: boolean | null
          require_uppercase?: boolean | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          lockout_duration_minutes?: number | null
          max_age_days?: number | null
          max_failed_attempts?: number | null
          min_length?: number | null
          prevent_reuse_count?: number | null
          require_lowercase?: boolean | null
          require_numbers?: boolean | null
          require_symbols?: boolean | null
          require_uppercase?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      political_parties: {
        Row: {
          acronym: string | null
          approval_rating: number | null
          auto_imported: boolean | null
          claim_documents_url: string[] | null
          claim_fee_paid: boolean | null
          claim_payment_reference: string | null
          claim_status: string | null
          claimed_at: string | null
          claimed_by: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          development_rating: number | null
          founded_by: string[] | null
          founding_date: string | null
          headquarters_address: string | null
          headquarters_city: string | null
          headquarters_region: string | null
          historical_promises: string[] | null
          id: string
          ideology: string | null
          is_active: boolean | null
          is_claimable: boolean | null
          is_claimed: boolean | null
          key_milestones: Json | null
          logo_url: string | null
          mayors_count: number | null
          media_gallery: string[] | null
          mission: string | null
          mission_statement: string | null
          mps_count: number | null
          name: string
          official_website: string | null
          party_history: Json | null
          party_president: string | null
          political_leaning: string | null
          promises_failed: number | null
          promises_fulfilled: number | null
          promises_ongoing: number | null
          public_promises: Json | null
          secretary_general: string | null
          senators_count: number | null
          total_ratings: number | null
          transparency_rating: number | null
          treasurer: string | null
          trust_rating: number | null
          updated_at: string
          verification_notes: string | null
          vice_president: string | null
          vision: string | null
          vision_statement: string | null
        }
        Insert: {
          acronym?: string | null
          approval_rating?: number | null
          auto_imported?: boolean | null
          claim_documents_url?: string[] | null
          claim_fee_paid?: boolean | null
          claim_payment_reference?: string | null
          claim_status?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          development_rating?: number | null
          founded_by?: string[] | null
          founding_date?: string | null
          headquarters_address?: string | null
          headquarters_city?: string | null
          headquarters_region?: string | null
          historical_promises?: string[] | null
          id?: string
          ideology?: string | null
          is_active?: boolean | null
          is_claimable?: boolean | null
          is_claimed?: boolean | null
          key_milestones?: Json | null
          logo_url?: string | null
          mayors_count?: number | null
          media_gallery?: string[] | null
          mission?: string | null
          mission_statement?: string | null
          mps_count?: number | null
          name: string
          official_website?: string | null
          party_history?: Json | null
          party_president?: string | null
          political_leaning?: string | null
          promises_failed?: number | null
          promises_fulfilled?: number | null
          promises_ongoing?: number | null
          public_promises?: Json | null
          secretary_general?: string | null
          senators_count?: number | null
          total_ratings?: number | null
          transparency_rating?: number | null
          treasurer?: string | null
          trust_rating?: number | null
          updated_at?: string
          verification_notes?: string | null
          vice_president?: string | null
          vision?: string | null
          vision_statement?: string | null
        }
        Update: {
          acronym?: string | null
          approval_rating?: number | null
          auto_imported?: boolean | null
          claim_documents_url?: string[] | null
          claim_fee_paid?: boolean | null
          claim_payment_reference?: string | null
          claim_status?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          development_rating?: number | null
          founded_by?: string[] | null
          founding_date?: string | null
          headquarters_address?: string | null
          headquarters_city?: string | null
          headquarters_region?: string | null
          historical_promises?: string[] | null
          id?: string
          ideology?: string | null
          is_active?: boolean | null
          is_claimable?: boolean | null
          is_claimed?: boolean | null
          key_milestones?: Json | null
          logo_url?: string | null
          mayors_count?: number | null
          media_gallery?: string[] | null
          mission?: string | null
          mission_statement?: string | null
          mps_count?: number | null
          name?: string
          official_website?: string | null
          party_history?: Json | null
          party_president?: string | null
          political_leaning?: string | null
          promises_failed?: number | null
          promises_fulfilled?: number | null
          promises_ongoing?: number | null
          public_promises?: Json | null
          secretary_general?: string | null
          senators_count?: number | null
          total_ratings?: number | null
          transparency_rating?: number | null
          treasurer?: string | null
          trust_rating?: number | null
          updated_at?: string
          verification_notes?: string | null
          vice_president?: string | null
          vision?: string | null
          vision_statement?: string | null
        }
        Relationships: []
      }
      politician_detailed_ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          development_impact_rating: number | null
          id: string
          integrity_rating: number | null
          politician_id: string
          transparency_rating: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          development_impact_rating?: number | null
          id?: string
          integrity_rating?: number | null
          politician_id: string
          transparency_rating?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          development_impact_rating?: number | null
          id?: string
          integrity_rating?: number | null
          politician_id?: string
          transparency_rating?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "politician_detailed_ratings_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
        ]
      }
      politician_follows: {
        Row: {
          created_at: string | null
          id: string
          politician_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          politician_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          politician_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "politician_follows_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
        ]
      }
      politician_promises: {
        Row: {
          created_at: string | null
          date_made: string | null
          date_updated: string | null
          description: string | null
          evidence_url: string | null
          id: string
          politician_id: string
          promise_text: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_made?: string | null
          date_updated?: string | null
          description?: string | null
          evidence_url?: string | null
          id?: string
          politician_id: string
          promise_text: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_made?: string | null
          date_updated?: string | null
          description?: string | null
          evidence_url?: string | null
          id?: string
          politician_id?: string
          promise_text?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "politician_promises_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
        ]
      }
      politicians: {
        Row: {
          bio: string | null
          birth_date: string | null
          career_background: string | null
          civic_score: number | null
          constituency: string | null
          contact_office: string | null
          contact_phone: string | null
          contact_website: string | null
          created_at: string | null
          development_impact_rating: number | null
          education: string | null
          follower_count: number | null
          former_roles: string[] | null
          gender: string | null
          id: string
          integrity_rating: number | null
          is_archived: boolean | null
          level_of_office: string | null
          name: string
          party: string | null
          political_party_id: string | null
          position_end_date: string | null
          position_start_date: string | null
          profile_image_url: string | null
          promise_tracker: Json | null
          region: string | null
          role_title: string | null
          timeline_roles: Json | null
          transparency_rating: number | null
          updated_at: string | null
          user_id: string | null
          verified: boolean | null
        }
        Insert: {
          bio?: string | null
          birth_date?: string | null
          career_background?: string | null
          civic_score?: number | null
          constituency?: string | null
          contact_office?: string | null
          contact_phone?: string | null
          contact_website?: string | null
          created_at?: string | null
          development_impact_rating?: number | null
          education?: string | null
          follower_count?: number | null
          former_roles?: string[] | null
          gender?: string | null
          id?: string
          integrity_rating?: number | null
          is_archived?: boolean | null
          level_of_office?: string | null
          name: string
          party?: string | null
          political_party_id?: string | null
          position_end_date?: string | null
          position_start_date?: string | null
          profile_image_url?: string | null
          promise_tracker?: Json | null
          region?: string | null
          role_title?: string | null
          timeline_roles?: Json | null
          transparency_rating?: number | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
        }
        Update: {
          bio?: string | null
          birth_date?: string | null
          career_background?: string | null
          civic_score?: number | null
          constituency?: string | null
          contact_office?: string | null
          contact_phone?: string | null
          contact_website?: string | null
          created_at?: string | null
          development_impact_rating?: number | null
          education?: string | null
          follower_count?: number | null
          former_roles?: string[] | null
          gender?: string | null
          id?: string
          integrity_rating?: number | null
          is_archived?: boolean | null
          level_of_office?: string | null
          name?: string
          party?: string | null
          political_party_id?: string | null
          position_end_date?: string | null
          position_start_date?: string | null
          profile_image_url?: string | null
          promise_tracker?: Json | null
          region?: string | null
          role_title?: string | null
          timeline_roles?: Json | null
          transparency_rating?: number | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_politician_party"
            columns: ["political_party_id"]
            isOneToOne: false
            referencedRelation: "political_parties"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string | null
          id: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          option_index?: number
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          created_at: string | null
          creator_id: string
          description: string | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          options: Json
          title: string
          votes_count: number | null
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          options: Json
          title: string
          votes_count?: number | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          options?: Json
          title?: string
          votes_count?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string
          is_diaspora: boolean | null
          location: string | null
          updated_at: string | null
          user_id: string
          username: string
          verified: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_diaspora?: boolean | null
          location?: string | null
          updated_at?: string | null
          user_id: string
          username: string
          verified?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_diaspora?: boolean | null
          location?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      pulse_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pulse_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "pulse_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      pulse_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pulse_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "pulse_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      pulse_posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string | null
          hashtags: string[] | null
          id: string
          image_url: string | null
          likes_count: number | null
          mentions: string[] | null
          sentiment_label: string | null
          sentiment_score: number | null
          shares_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string | null
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          likes_count?: number | null
          mentions?: string[] | null
          sentiment_label?: string | null
          sentiment_score?: number | null
          shares_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string | null
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          likes_count?: number | null
          mentions?: string[] | null
          sentiment_label?: string | null
          sentiment_score?: number | null
          shares_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          created_at: string | null
          device_fingerprint: string | null
          event_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_fingerprint?: string | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_2fa: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          id: string
          is_sms_enabled: boolean | null
          is_totp_enabled: boolean | null
          last_used_at: string | null
          phone_number: string | null
          totp_secret: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_sms_enabled?: boolean | null
          is_totp_enabled?: boolean | null
          last_used_at?: string | null
          phone_number?: string | null
          totp_secret?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          is_sms_enabled?: boolean | null
          is_totp_enabled?: boolean | null
          last_used_at?: string | null
          phone_number?: string | null
          totp_secret?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_devices: {
        Row: {
          created_at: string | null
          device_fingerprint: string
          device_name: string
          id: string
          ip_address: unknown | null
          is_trusted: boolean | null
          last_seen_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_fingerprint: string
          device_name: string
          id?: string
          ip_address?: unknown | null
          is_trusted?: boolean | null
          last_seen_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string
          device_name?: string
          id?: string
          ip_address?: unknown | null
          is_trusted?: boolean | null
          last_seen_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_pgp_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_primary: boolean | null
          key_fingerprint: string
          key_name: string
          private_key_encrypted: string
          public_key: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_primary?: boolean | null
          key_fingerprint: string
          key_name: string
          private_key_encrypted: string
          public_key: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_primary?: boolean | null
          key_fingerprint?: string
          key_name?: string
          private_key_encrypted?: string
          public_key?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_vendor_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      log_security_event: {
        Args: {
          p_user_id: string
          p_event_type: string
          p_ip_address?: unknown
          p_user_agent?: string
          p_metadata?: Json
          p_severity?: string
        }
        Returns: string
      }
      register_user_device: {
        Args: {
          p_device_name: string
          p_device_fingerprint: string
          p_ip_address?: unknown
          p_user_agent?: string
        }
        Returns: string
      }
      validate_password_strength: {
        Args: { password: string }
        Returns: Json
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "verified_politician"
        | "verified_vendor"
        | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "moderator",
        "verified_politician",
        "verified_vendor",
        "user",
      ],
    },
  },
} as const
