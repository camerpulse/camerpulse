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
      activity_annotations: {
        Row: {
          activity_id: string
          admin_id: string
          annotation_tag: string | null
          comment_text: string
          created_at: string
          created_by_name: string
          id: string
          updated_at: string
        }
        Insert: {
          activity_id: string
          admin_id: string
          annotation_tag?: string | null
          comment_text: string
          created_at?: string
          created_by_name: string
          id?: string
          updated_at?: string
        }
        Update: {
          activity_id?: string
          admin_id?: string
          annotation_tag?: string | null
          comment_text?: string
          created_at?: string
          created_by_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_annotations_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "camerpulse_activity_timeline"
            referencedColumns: ["id"]
          },
        ]
      }
      advanced_sentiment_analysis: {
        Row: {
          analysis_metadata: Json | null
          confidence_score: number
          content_id: string | null
          content_source: string
          content_text: string
          content_url: string | null
          created_at: string
          emotions_detected: Json | null
          entities_mentioned: Json | null
          id: string
          language_detected: string | null
          processed_by: string | null
          sentiment_score: number
          sentiment_value: Database["public"]["Enums"]["sentiment_value"]
          topics_mentioned: string[] | null
        }
        Insert: {
          analysis_metadata?: Json | null
          confidence_score: number
          content_id?: string | null
          content_source: string
          content_text: string
          content_url?: string | null
          created_at?: string
          emotions_detected?: Json | null
          entities_mentioned?: Json | null
          id?: string
          language_detected?: string | null
          processed_by?: string | null
          sentiment_score: number
          sentiment_value: Database["public"]["Enums"]["sentiment_value"]
          topics_mentioned?: string[] | null
        }
        Update: {
          analysis_metadata?: Json | null
          confidence_score?: number
          content_id?: string | null
          content_source?: string
          content_text?: string
          content_url?: string | null
          created_at?: string
          emotions_detected?: Json | null
          entities_mentioned?: Json | null
          id?: string
          language_detected?: string | null
          processed_by?: string | null
          sentiment_score?: number
          sentiment_value?: Database["public"]["Enums"]["sentiment_value"]
          topics_mentioned?: string[] | null
        }
        Relationships: []
      }
      agency_action_logs: {
        Row: {
          action_description: string
          action_type: string
          agency_id: string
          created_at: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          target_id: string | null
          target_resource: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_description: string
          action_type: string
          agency_id: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          target_id?: string | null
          target_resource?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_description?: string
          action_type?: string
          agency_id?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          target_id?: string | null
          target_resource?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_action_logs_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "government_agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_alert_routing: {
        Row: {
          agency_id: string
          alert_type: string
          created_at: string
          id: string
          is_active: boolean
          min_severity_level: string
          notification_channels: string[]
          regions: string[] | null
          updated_at: string
        }
        Insert: {
          agency_id: string
          alert_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          min_severity_level?: string
          notification_channels?: string[]
          regions?: string[] | null
          updated_at?: string
        }
        Update: {
          agency_id?: string
          alert_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          min_severity_level?: string
          notification_channels?: string[]
          regions?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_alert_routing_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "government_agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_responses: {
        Row: {
          agency_id: string
          alert_reference_id: string | null
          attachments: string[] | null
          content: string
          created_at: string
          id: string
          metadata: Json | null
          response_type: string
          title: string
          updated_at: string
          user_id: string
          verified_status: string
          visibility: string
        }
        Insert: {
          agency_id: string
          alert_reference_id?: string | null
          attachments?: string[] | null
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          response_type: string
          title: string
          updated_at?: string
          user_id: string
          verified_status?: string
          visibility?: string
        }
        Update: {
          agency_id?: string
          alert_reference_id?: string | null
          attachments?: string[] | null
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          response_type?: string
          title?: string
          updated_at?: string
          user_id?: string
          verified_status?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_responses_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "government_agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_generation_schedule: {
        Row: {
          created_at: string
          frequency: string
          generation_rules: Json | null
          id: string
          is_active: boolean
          last_run_at: string | null
          next_run_at: string | null
          performance_stats: Json | null
          scan_sources: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          frequency?: string
          generation_rules?: Json | null
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          next_run_at?: string | null
          performance_stats?: Json | null
          scan_sources?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          frequency?: string
          generation_rules?: Json | null
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          next_run_at?: string | null
          performance_stats?: Json | null
          scan_sources?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      ai_insights: {
        Row: {
          actionable_recommendations: string[] | null
          affected_entities: Json | null
          confidence_score: number
          created_at: string
          data_sources: Json
          description: string
          expires_at: string | null
          feedback_score: number | null
          id: string
          insight_metadata: Json | null
          insight_type: string
          is_verified: boolean
          priority_level: string
          supporting_data: Json | null
          title: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          actionable_recommendations?: string[] | null
          affected_entities?: Json | null
          confidence_score?: number
          created_at?: string
          data_sources?: Json
          description: string
          expires_at?: string | null
          feedback_score?: number | null
          id?: string
          insight_metadata?: Json | null
          insight_type: string
          is_verified?: boolean
          priority_level?: string
          supporting_data?: Json | null
          title: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          actionable_recommendations?: string[] | null
          affected_entities?: Json | null
          confidence_score?: number
          created_at?: string
          data_sources?: Json
          description?: string
          expires_at?: string | null
          feedback_score?: number | null
          id?: string
          insight_metadata?: Json | null
          insight_type?: string
          is_verified?: boolean
          priority_level?: string
          supporting_data?: Json | null
          title?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      analytics_alert_instances: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          acknowledgment_notes: string | null
          affected_entities: Json | null
          alert_id: string
          alert_message: string
          created_at: string
          id: string
          is_acknowledged: boolean
          severity: Database["public"]["Enums"]["alert_severity"]
          trigger_data: Json
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          acknowledgment_notes?: string | null
          affected_entities?: Json | null
          alert_id: string
          alert_message: string
          created_at?: string
          id?: string
          is_acknowledged?: boolean
          severity: Database["public"]["Enums"]["alert_severity"]
          trigger_data: Json
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          acknowledgment_notes?: string | null
          affected_entities?: Json | null
          alert_id?: string
          alert_message?: string
          created_at?: string
          id?: string
          is_acknowledged?: boolean
          severity?: Database["public"]["Enums"]["alert_severity"]
          trigger_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "analytics_alert_instances_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "analytics_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_alerts: {
        Row: {
          alert_description: string | null
          alert_name: string
          alert_type: string
          created_at: string
          created_by: string
          data_source_config: Json
          id: string
          is_active: boolean
          last_triggered_at: string | null
          notification_channels: string[] | null
          recipients: string[]
          severity: Database["public"]["Enums"]["alert_severity"]
          trigger_conditions: Json
          trigger_count: number
          updated_at: string
        }
        Insert: {
          alert_description?: string | null
          alert_name: string
          alert_type: string
          created_at?: string
          created_by: string
          data_source_config: Json
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          notification_channels?: string[] | null
          recipients: string[]
          severity?: Database["public"]["Enums"]["alert_severity"]
          trigger_conditions: Json
          trigger_count?: number
          updated_at?: string
        }
        Update: {
          alert_description?: string | null
          alert_name?: string
          alert_type?: string
          created_at?: string
          created_by?: string
          data_source_config?: Json
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          notification_channels?: string[] | null
          recipients?: string[]
          severity?: Database["public"]["Enums"]["alert_severity"]
          trigger_conditions?: Json
          trigger_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      analytics_dashboards: {
        Row: {
          access_permissions: Json | null
          created_at: string
          dashboard_name: string
          dashboard_type: string
          data_sources: Json | null
          id: string
          is_active: boolean
          is_default: boolean
          layout_settings: Json | null
          refresh_interval_minutes: number | null
          shared_with: string[] | null
          updated_at: string
          user_id: string
          widget_configuration: Json
        }
        Insert: {
          access_permissions?: Json | null
          created_at?: string
          dashboard_name: string
          dashboard_type?: string
          data_sources?: Json | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          layout_settings?: Json | null
          refresh_interval_minutes?: number | null
          shared_with?: string[] | null
          updated_at?: string
          user_id: string
          widget_configuration?: Json
        }
        Update: {
          access_permissions?: Json | null
          created_at?: string
          dashboard_name?: string
          dashboard_type?: string
          data_sources?: Json | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          layout_settings?: Json | null
          refresh_interval_minutes?: number | null
          shared_with?: string[] | null
          updated_at?: string
          user_id?: string
          widget_configuration?: Json
        }
        Relationships: []
      }
      api_configurations: {
        Row: {
          additional_config: Json | null
          api_key: string | null
          base_url: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          service_name: string
          updated_at: string
        }
        Insert: {
          additional_config?: Json | null
          api_key?: string | null
          base_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          service_name: string
          updated_at?: string
        }
        Update: {
          additional_config?: Json | null
          api_key?: string | null
          base_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          service_name?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      artist_analytics: {
        Row: {
          artist_id: string
          created_at: string
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          period_end: string
          period_start: string
          user_id: string
        }
        Insert: {
          artist_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value?: number
          period_end: string
          period_start: string
          user_id: string
        }
        Update: {
          artist_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          period_end?: string
          period_start?: string
          user_id?: string
        }
        Relationships: []
      }
      artist_applications: {
        Row: {
          admin_notes: string | null
          application_status: string | null
          artist_id_number: string | null
          bio_full: string | null
          bio_short: string | null
          created_at: string
          gender: string | null
          genres: string[] | null
          id: string
          id_card_generated: boolean | null
          id_card_url: string | null
          id_document_url: string | null
          languages_spoken: string[] | null
          membership_fee_paid: number | null
          nationality: string | null
          payment_status: string | null
          phone_number: string | null
          profile_photo_url: string | null
          real_name: string
          region: string | null
          rejection_reason: string | null
          social_media_links: Json | null
          stage_name: string
          stripe_payment_intent_id: string | null
          updated_at: string
          user_id: string | null
          verified_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          application_status?: string | null
          artist_id_number?: string | null
          bio_full?: string | null
          bio_short?: string | null
          created_at?: string
          gender?: string | null
          genres?: string[] | null
          id?: string
          id_card_generated?: boolean | null
          id_card_url?: string | null
          id_document_url?: string | null
          languages_spoken?: string[] | null
          membership_fee_paid?: number | null
          nationality?: string | null
          payment_status?: string | null
          phone_number?: string | null
          profile_photo_url?: string | null
          real_name: string
          region?: string | null
          rejection_reason?: string | null
          social_media_links?: Json | null
          stage_name: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string | null
          verified_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          application_status?: string | null
          artist_id_number?: string | null
          bio_full?: string | null
          bio_short?: string | null
          created_at?: string
          gender?: string | null
          genres?: string[] | null
          id?: string
          id_card_generated?: boolean | null
          id_card_url?: string | null
          id_document_url?: string | null
          languages_spoken?: string[] | null
          membership_fee_paid?: number | null
          nationality?: string | null
          payment_status?: string | null
          phone_number?: string | null
          profile_photo_url?: string | null
          real_name?: string
          region?: string | null
          rejection_reason?: string | null
          social_media_links?: Json | null
          stage_name?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      artist_branding_profiles: {
        Row: {
          artist_id: string
          audience_types: string[]
          average_rating: number | null
          bio_ambassador: string | null
          branding_status: Database["public"]["Enums"]["brand_ambassador_status"]
          created_at: string
          current_brands: Json | null
          exclusivity_available: boolean | null
          expected_deliverables: string[] | null
          id: string
          industry_interests: string[]
          is_active: boolean
          media_kit_url: string | null
          minimum_contract_weeks: number | null
          minimum_fee_fcfa: number | null
          past_partnerships: Json | null
          portfolio_links: Json | null
          preferred_regions: string[]
          total_campaigns: number | null
          total_connections: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          artist_id: string
          audience_types?: string[]
          average_rating?: number | null
          bio_ambassador?: string | null
          branding_status?: Database["public"]["Enums"]["brand_ambassador_status"]
          created_at?: string
          current_brands?: Json | null
          exclusivity_available?: boolean | null
          expected_deliverables?: string[] | null
          id?: string
          industry_interests?: string[]
          is_active?: boolean
          media_kit_url?: string | null
          minimum_contract_weeks?: number | null
          minimum_fee_fcfa?: number | null
          past_partnerships?: Json | null
          portfolio_links?: Json | null
          preferred_regions?: string[]
          total_campaigns?: number | null
          total_connections?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          artist_id?: string
          audience_types?: string[]
          average_rating?: number | null
          bio_ambassador?: string | null
          branding_status?: Database["public"]["Enums"]["brand_ambassador_status"]
          created_at?: string
          current_brands?: Json | null
          exclusivity_available?: boolean | null
          expected_deliverables?: string[] | null
          id?: string
          industry_interests?: string[]
          is_active?: boolean
          media_kit_url?: string | null
          minimum_contract_weeks?: number | null
          minimum_fee_fcfa?: number | null
          past_partnerships?: Json | null
          portfolio_links?: Json | null
          preferred_regions?: string[]
          total_campaigns?: number | null
          total_connections?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      artist_followers: {
        Row: {
          artist_user_id: string
          created_at: string
          fan_user_id: string
          id: string
          notifications_enabled: boolean
        }
        Insert: {
          artist_user_id: string
          created_at?: string
          fan_user_id: string
          id?: string
          notifications_enabled?: boolean
        }
        Update: {
          artist_user_id?: string
          created_at?: string
          fan_user_id?: string
          id?: string
          notifications_enabled?: boolean
        }
        Relationships: []
      }
      artist_memberships: {
        Row: {
          application_id: string | null
          artist_id_number: string
          created_at: string
          features_enabled: Json | null
          id: string
          id_card_url: string | null
          membership_active: boolean | null
          membership_expires_at: string | null
          real_name: string
          stage_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          application_id?: string | null
          artist_id_number: string
          created_at?: string
          features_enabled?: Json | null
          id?: string
          id_card_url?: string | null
          membership_active?: boolean | null
          membership_expires_at?: string | null
          real_name: string
          stage_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          application_id?: string | null
          artist_id_number?: string
          created_at?: string
          features_enabled?: Json | null
          id?: string
          id_card_url?: string | null
          membership_active?: boolean | null
          membership_expires_at?: string | null
          real_name?: string
          stage_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_memberships_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "artist_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_notification_preferences: {
        Row: {
          artist_id: string
          created_at: string
          email_enabled: boolean
          enabled: boolean
          frequency: string
          id: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          push_enabled: boolean
          sms_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          artist_id: string
          created_at?: string
          email_enabled?: boolean
          enabled?: boolean
          frequency?: string
          id?: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          push_enabled?: boolean
          sms_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          artist_id?: string
          created_at?: string
          email_enabled?: boolean
          enabled?: boolean
          frequency?: string
          id?: string
          notification_type?: Database["public"]["Enums"]["notification_type"]
          push_enabled?: boolean
          sms_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_notification_preferences_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artist_memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_notifications: {
        Row: {
          action_url: string | null
          artist_id: string
          created_at: string
          data: Json | null
          expires_at: string | null
          id: string
          is_read: boolean
          message: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          priority: string
          read_at: string | null
          sent_via_email: boolean
          sent_via_sms: boolean
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          artist_id: string
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          priority?: string
          read_at?: string | null
          sent_via_email?: boolean
          sent_via_sms?: boolean
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          artist_id?: string
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          notification_type?: Database["public"]["Enums"]["notification_type"]
          priority?: string
          read_at?: string | null
          sent_via_email?: boolean
          sent_via_sms?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      artist_platform_connections: {
        Row: {
          api_credentials: Json | null
          artist_id: string
          connection_status: string
          created_at: string
          error_message: string | null
          id: string
          is_verified: boolean
          last_synced_at: string | null
          platform_type: Database["public"]["Enums"]["platform_type"]
          platform_url: string
          platform_username: string | null
          sync_enabled: boolean
          sync_frequency_hours: number
          updated_at: string
          user_id: string
        }
        Insert: {
          api_credentials?: Json | null
          artist_id: string
          connection_status?: string
          created_at?: string
          error_message?: string | null
          id?: string
          is_verified?: boolean
          last_synced_at?: string | null
          platform_type: Database["public"]["Enums"]["platform_type"]
          platform_url: string
          platform_username?: string | null
          sync_enabled?: boolean
          sync_frequency_hours?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          api_credentials?: Json | null
          artist_id?: string
          connection_status?: string
          created_at?: string
          error_message?: string | null
          id?: string
          is_verified?: boolean
          last_synced_at?: string | null
          platform_type?: Database["public"]["Enums"]["platform_type"]
          platform_url?: string
          platform_username?: string | null
          sync_enabled?: boolean
          sync_frequency_hours?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_platform_connections_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artist_memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_profile_claims: {
        Row: {
          admin_notes: string | null
          claim_reason: string | null
          claim_type: string
          claimed_artist_id: string | null
          created_at: string
          evidence_files: string[] | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          claim_reason?: string | null
          claim_type?: string
          claimed_artist_id?: string | null
          created_at?: string
          evidence_files?: string[] | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          claim_reason?: string | null
          claim_type?: string
          claimed_artist_id?: string | null
          created_at?: string
          evidence_files?: string[] | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_profile_claims_claimed_artist_id_fkey"
            columns: ["claimed_artist_id"]
            isOneToOne: false
            referencedRelation: "artist_memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_submission_drafts: {
        Row: {
          created_at: string
          draft_data: Json
          id: string
          step_completed: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          draft_data?: Json
          id?: string
          step_completed?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          draft_data?: Json
          id?: string
          step_completed?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ashen_auto_healing_history: {
        Row: {
          admin_feedback: string | null
          admin_feedback_reason: string | null
          admin_id: string | null
          applied_by: string
          backup_created: boolean | null
          code_changes: Json | null
          created_at: string
          error_id: string | null
          error_message: string | null
          files_modified: string[] | null
          fix_applied: boolean
          fix_confidence: number
          fix_description: string | null
          fix_method: string
          id: string
          learning_weight: number | null
          result_status: string
          rollback_info: Json | null
        }
        Insert: {
          admin_feedback?: string | null
          admin_feedback_reason?: string | null
          admin_id?: string | null
          applied_by?: string
          backup_created?: boolean | null
          code_changes?: Json | null
          created_at?: string
          error_id?: string | null
          error_message?: string | null
          files_modified?: string[] | null
          fix_applied?: boolean
          fix_confidence: number
          fix_description?: string | null
          fix_method: string
          id?: string
          learning_weight?: number | null
          result_status?: string
          rollback_info?: Json | null
        }
        Update: {
          admin_feedback?: string | null
          admin_feedback_reason?: string | null
          admin_id?: string | null
          applied_by?: string
          backup_created?: boolean | null
          code_changes?: Json | null
          created_at?: string
          error_id?: string | null
          error_message?: string | null
          files_modified?: string[] | null
          fix_applied?: boolean
          fix_confidence?: number
          fix_description?: string | null
          fix_method?: string
          id?: string
          learning_weight?: number | null
          result_status?: string
          rollback_info?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ashen_auto_healing_history_error_id_fkey"
            columns: ["error_id"]
            isOneToOne: false
            referencedRelation: "ashen_error_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      ashen_autonomous_blacklist: {
        Row: {
          added_by: string
          blacklist_type: string
          blacklist_value: string
          created_at: string
          id: string
          reason: string | null
        }
        Insert: {
          added_by: string
          blacklist_type: string
          blacklist_value: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Update: {
          added_by?: string
          blacklist_type?: string
          blacklist_value?: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      ashen_autonomous_config: {
        Row: {
          auto_approve_safe_fixes: boolean
          config_key: string
          config_value: Json
          created_at: string
          id: string
          is_enabled: boolean
          notify_on_human_approval_needed: boolean
          risk_threshold: number
          scan_frequency_minutes: number
          updated_at: string
        }
        Insert: {
          auto_approve_safe_fixes?: boolean
          config_key: string
          config_value?: Json
          created_at?: string
          id?: string
          is_enabled?: boolean
          notify_on_human_approval_needed?: boolean
          risk_threshold?: number
          scan_frequency_minutes?: number
          updated_at?: string
        }
        Update: {
          auto_approve_safe_fixes?: boolean
          config_key?: string
          config_value?: Json
          created_at?: string
          id?: string
          is_enabled?: boolean
          notify_on_human_approval_needed?: boolean
          risk_threshold?: number
          scan_frequency_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      ashen_autonomous_operations: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          execution_time_ms: number | null
          fix_applied: boolean
          human_approval_required: boolean
          id: string
          operation_details: Json
          operation_type: string
          reverted_at: string | null
          risk_score: number
          snapshot_created_before: string | null
          status: string
          target_module: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          fix_applied?: boolean
          human_approval_required?: boolean
          id?: string
          operation_details?: Json
          operation_type: string
          reverted_at?: string | null
          risk_score?: number
          snapshot_created_before?: string | null
          status?: string
          target_module?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          fix_applied?: boolean
          human_approval_required?: boolean
          id?: string
          operation_details?: Json
          operation_type?: string
          reverted_at?: string | null
          risk_score?: number
          snapshot_created_before?: string | null
          status?: string
          target_module?: string | null
        }
        Relationships: []
      }
      ashen_autonomous_scan_results: {
        Row: {
          can_auto_fix: boolean
          created_at: string
          fix_confidence: number
          id: string
          issue_description: string | null
          issue_detected: boolean
          issue_severity: string
          operation_id: string | null
          scan_metadata: Json
          scan_type: string
          suggested_fix: string | null
          target_path: string | null
        }
        Insert: {
          can_auto_fix?: boolean
          created_at?: string
          fix_confidence?: number
          id?: string
          issue_description?: string | null
          issue_detected?: boolean
          issue_severity?: string
          operation_id?: string | null
          scan_metadata?: Json
          scan_type: string
          suggested_fix?: string | null
          target_path?: string | null
        }
        Update: {
          can_auto_fix?: boolean
          created_at?: string
          fix_confidence?: number
          id?: string
          issue_description?: string | null
          issue_detected?: boolean
          issue_severity?: string
          operation_id?: string | null
          scan_metadata?: Json
          scan_type?: string
          suggested_fix?: string | null
          target_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_autonomous_scan_operation"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "ashen_autonomous_operations"
            referencedColumns: ["id"]
          },
        ]
      }
      ashen_behavior_tests: {
        Row: {
          created_at: string
          device_type: string
          id: string
          issues_found: Json | null
          metadata: Json | null
          performance_metrics: Json | null
          route_tested: string
          screenshot_url: string | null
          test_name: string
          test_result: string
          test_type: string
        }
        Insert: {
          created_at?: string
          device_type?: string
          id?: string
          issues_found?: Json | null
          metadata?: Json | null
          performance_metrics?: Json | null
          route_tested: string
          screenshot_url?: string | null
          test_name: string
          test_result: string
          test_type: string
        }
        Update: {
          created_at?: string
          device_type?: string
          id?: string
          issues_found?: Json | null
          metadata?: Json | null
          performance_metrics?: Json | null
          route_tested?: string
          screenshot_url?: string | null
          test_name?: string
          test_result?: string
          test_type?: string
        }
        Relationships: []
      }
      ashen_build_logs: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_ms: number | null
          error_details: string | null
          id: string
          output_data: Json | null
          request_id: string
          started_at: string | null
          status: string
          step_name: string
          step_order: number
          step_type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error_details?: string | null
          id?: string
          output_data?: Json | null
          request_id: string
          started_at?: string | null
          status?: string
          step_name: string
          step_order: number
          step_type: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error_details?: string | null
          id?: string
          output_data?: Json | null
          request_id?: string
          started_at?: string | null
          status?: string
          step_name?: string
          step_order?: number
          step_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_ashen_logs_request"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "ashen_dev_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      ashen_civic_memory: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          last_used: string | null
          pattern_data: Json
          pattern_description: string | null
          pattern_name: string
          pattern_type: string
          success_rate: number
          tags: string[] | null
          updated_at: string
          usage_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_used?: string | null
          pattern_data: Json
          pattern_description?: string | null
          pattern_name: string
          pattern_type: string
          success_rate?: number
          tags?: string[] | null
          updated_at?: string
          usage_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_used?: string | null
          pattern_data?: Json
          pattern_description?: string | null
          pattern_name?: string
          pattern_type?: string
          success_rate?: number
          tags?: string[] | null
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      ashen_code_analysis: {
        Row: {
          analysis_type: string
          auto_fixable: boolean | null
          file_path: string
          id: string
          issues_found: number | null
          last_analyzed: string
          metadata: Json | null
          quality_score: number | null
          suggestions: Json | null
        }
        Insert: {
          analysis_type: string
          auto_fixable?: boolean | null
          file_path: string
          id?: string
          issues_found?: number | null
          last_analyzed?: string
          metadata?: Json | null
          quality_score?: number | null
          suggestions?: Json | null
        }
        Update: {
          analysis_type?: string
          auto_fixable?: boolean | null
          file_path?: string
          id?: string
          issues_found?: number | null
          last_analyzed?: string
          metadata?: Json | null
          quality_score?: number | null
          suggestions?: Json | null
        }
        Relationships: []
      }
      ashen_conflict_analysis: {
        Row: {
          analysis_details: Json | null
          auto_resolvable: boolean | null
          conflict_severity: string
          conflict_type: string
          created_at: string
          existing_feature_id: string | null
          feature_name: string
          id: string
          resolution_recommendation: string | null
          resolved_at: string | null
          resolved_by: string | null
          similarity_score: number | null
        }
        Insert: {
          analysis_details?: Json | null
          auto_resolvable?: boolean | null
          conflict_severity?: string
          conflict_type: string
          created_at?: string
          existing_feature_id?: string | null
          feature_name: string
          id?: string
          resolution_recommendation?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          similarity_score?: number | null
        }
        Update: {
          analysis_details?: Json | null
          auto_resolvable?: boolean | null
          conflict_severity?: string
          conflict_type?: string
          created_at?: string
          existing_feature_id?: string | null
          feature_name?: string
          id?: string
          resolution_recommendation?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          similarity_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ashen_conflict_analysis_existing_feature_id_fkey"
            columns: ["existing_feature_id"]
            isOneToOne: false
            referencedRelation: "ashen_feature_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      ashen_deduplication_analysis: {
        Row: {
          analysis_type: string
          created_at: string
          duplicate_items: Json | null
          id: string
          item_name: string
          item_path: string | null
          prompt_trace_id: string | null
          recommendation: string | null
          recommendation_reasoning: string | null
          resolved_at: string | null
          resolved_by: string | null
          similarity_percentage: number | null
          status: string | null
        }
        Insert: {
          analysis_type: string
          created_at?: string
          duplicate_items?: Json | null
          id?: string
          item_name: string
          item_path?: string | null
          prompt_trace_id?: string | null
          recommendation?: string | null
          recommendation_reasoning?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          similarity_percentage?: number | null
          status?: string | null
        }
        Update: {
          analysis_type?: string
          created_at?: string
          duplicate_items?: Json | null
          id?: string
          item_name?: string
          item_path?: string | null
          prompt_trace_id?: string | null
          recommendation?: string | null
          recommendation_reasoning?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          similarity_percentage?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ashen_deduplication_analysis_prompt_trace_id_fkey"
            columns: ["prompt_trace_id"]
            isOneToOne: false
            referencedRelation: "ashen_prompt_trace_index"
            referencedColumns: ["id"]
          },
        ]
      }
      ashen_dev_requests: {
        Row: {
          build_duration_seconds: number | null
          build_mode: string
          completed_at: string | null
          created_at: string
          created_by: string
          error_message: string | null
          estimated_complexity: number | null
          id: string
          metadata: Json
          preview_before_build: boolean
          priority_level: number
          request_prompt: string
          request_type: string
          started_at: string | null
          status: string
          target_users: string[]
          use_civic_memory: boolean
        }
        Insert: {
          build_duration_seconds?: number | null
          build_mode?: string
          completed_at?: string | null
          created_at?: string
          created_by: string
          error_message?: string | null
          estimated_complexity?: number | null
          id?: string
          metadata?: Json
          preview_before_build?: boolean
          priority_level?: number
          request_prompt: string
          request_type?: string
          started_at?: string | null
          status?: string
          target_users?: string[]
          use_civic_memory?: boolean
        }
        Update: {
          build_duration_seconds?: number | null
          build_mode?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string
          error_message?: string | null
          estimated_complexity?: number | null
          id?: string
          metadata?: Json
          preview_before_build?: boolean
          priority_level?: number
          request_prompt?: string
          request_type?: string
          started_at?: string | null
          status?: string
          target_users?: string[]
          use_civic_memory?: boolean
        }
        Relationships: []
      }
      ashen_error_logs: {
        Row: {
          component_path: string
          confidence_score: number | null
          created_at: string
          error_message: string
          error_type: string
          id: string
          line_number: number | null
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          screenshot_url: string | null
          severity: string
          status: string
          suggested_fix: string | null
        }
        Insert: {
          component_path: string
          confidence_score?: number | null
          created_at?: string
          error_message: string
          error_type: string
          id?: string
          line_number?: number | null
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          screenshot_url?: string | null
          severity?: string
          status?: string
          suggested_fix?: string | null
        }
        Update: {
          component_path?: string
          confidence_score?: number | null
          created_at?: string
          error_message?: string
          error_type?: string
          id?: string
          line_number?: number | null
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          screenshot_url?: string | null
          severity?: string
          status?: string
          suggested_fix?: string | null
        }
        Relationships: []
      }
      ashen_feature_dependencies: {
        Row: {
          created_at: string
          dependency_type: string
          depends_on_component: string | null
          depends_on_function: string | null
          depends_on_table: string | null
          id: string
          is_critical: boolean
          request_id: string
          validation_status: string | null
        }
        Insert: {
          created_at?: string
          dependency_type: string
          depends_on_component?: string | null
          depends_on_function?: string | null
          depends_on_table?: string | null
          id?: string
          is_critical?: boolean
          request_id: string
          validation_status?: string | null
        }
        Update: {
          created_at?: string
          dependency_type?: string
          depends_on_component?: string | null
          depends_on_function?: string | null
          depends_on_table?: string | null
          id?: string
          is_critical?: boolean
          request_id?: string
          validation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_ashen_dependencies_request"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "ashen_dev_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      ashen_feature_registry: {
        Row: {
          created_at: string
          created_by: string | null
          dependencies: string[] | null
          description: string | null
          feature_name: string
          feature_type: string
          file_paths: string[] | null
          id: string
          last_scanned_at: string | null
          linked_features: string[] | null
          metadata: Json | null
          status: string
          updated_at: string
          version_tag: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          dependencies?: string[] | null
          description?: string | null
          feature_name: string
          feature_type?: string
          file_paths?: string[] | null
          id?: string
          last_scanned_at?: string | null
          linked_features?: string[] | null
          metadata?: Json | null
          status?: string
          updated_at?: string
          version_tag?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          dependencies?: string[] | null
          description?: string | null
          feature_name?: string
          feature_type?: string
          file_paths?: string[] | null
          id?: string
          last_scanned_at?: string | null
          linked_features?: string[] | null
          metadata?: Json | null
          status?: string
          updated_at?: string
          version_tag?: string
        }
        Relationships: []
      }
      ashen_fix_trust_metrics: {
        Row: {
          auto_confirmations: number | null
          created_at: string
          current_trust_score: number | null
          fix_type: string
          id: string
          last_calculated: string | null
          manual_overrides: number | null
          rollbacks: number | null
          successful_fixes: number | null
          total_attempts: number | null
          trend_direction: string | null
          updated_at: string
        }
        Insert: {
          auto_confirmations?: number | null
          created_at?: string
          current_trust_score?: number | null
          fix_type: string
          id?: string
          last_calculated?: string | null
          manual_overrides?: number | null
          rollbacks?: number | null
          successful_fixes?: number | null
          total_attempts?: number | null
          trend_direction?: string | null
          updated_at?: string
        }
        Update: {
          auto_confirmations?: number | null
          created_at?: string
          current_trust_score?: number | null
          fix_type?: string
          id?: string
          last_calculated?: string | null
          manual_overrides?: number | null
          rollbacks?: number | null
          successful_fixes?: number | null
          total_attempts?: number | null
          trend_direction?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ashen_generated_artifacts: {
        Row: {
          applied_at: string | null
          artifact_name: string
          artifact_type: string
          created_at: string
          dependencies: string[] | null
          file_path: string | null
          generated_code: string | null
          id: string
          is_applied: boolean
          linked_modules: string[] | null
          metadata: Json
          request_id: string
          revert_reason: string | null
          reverted_at: string | null
          schema_definition: Json | null
        }
        Insert: {
          applied_at?: string | null
          artifact_name: string
          artifact_type: string
          created_at?: string
          dependencies?: string[] | null
          file_path?: string | null
          generated_code?: string | null
          id?: string
          is_applied?: boolean
          linked_modules?: string[] | null
          metadata?: Json
          request_id: string
          revert_reason?: string | null
          reverted_at?: string | null
          schema_definition?: Json | null
        }
        Update: {
          applied_at?: string | null
          artifact_name?: string
          artifact_type?: string
          created_at?: string
          dependencies?: string[] | null
          file_path?: string | null
          generated_code?: string | null
          id?: string
          is_applied?: boolean
          linked_modules?: string[] | null
          metadata?: Json
          request_id?: string
          revert_reason?: string | null
          reverted_at?: string | null
          schema_definition?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_ashen_artifacts_request"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "ashen_dev_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      ashen_generated_plugins: {
        Row: {
          configuration: Json | null
          created_at: string
          created_by: string | null
          files_created: Json | null
          functions_created: string[] | null
          id: string
          is_rollback_available: boolean | null
          permissions: Json | null
          plugin_description: string | null
          plugin_name: string
          plugin_type: string
          request_id: string | null
          rollback_data: Json | null
          rollback_timestamp: string | null
          routes_created: string[] | null
          status: string
          tables_created: string[] | null
          updated_at: string
          usage_stats: Json | null
          version: string | null
        }
        Insert: {
          configuration?: Json | null
          created_at?: string
          created_by?: string | null
          files_created?: Json | null
          functions_created?: string[] | null
          id?: string
          is_rollback_available?: boolean | null
          permissions?: Json | null
          plugin_description?: string | null
          plugin_name: string
          plugin_type?: string
          request_id?: string | null
          rollback_data?: Json | null
          rollback_timestamp?: string | null
          routes_created?: string[] | null
          status?: string
          tables_created?: string[] | null
          updated_at?: string
          usage_stats?: Json | null
          version?: string | null
        }
        Update: {
          configuration?: Json | null
          created_at?: string
          created_by?: string | null
          files_created?: Json | null
          functions_created?: string[] | null
          id?: string
          is_rollback_available?: boolean | null
          permissions?: Json | null
          plugin_description?: string | null
          plugin_name?: string
          plugin_type?: string
          request_id?: string | null
          rollback_data?: Json | null
          rollback_timestamp?: string | null
          routes_created?: string[] | null
          status?: string
          tables_created?: string[] | null
          updated_at?: string
          usage_stats?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ashen_generated_plugins_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "ashen_plugin_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      ashen_jr_agents: {
        Row: {
          accuracy_rating: number | null
          agent_goal: string
          agent_name: string
          agent_scope: Json
          created_at: string
          created_by: string | null
          feedback_loop_enabled: boolean | null
          id: string
          knowledge_sources: string[]
          last_active: string | null
          memory_size: number | null
          personality: string
          public_interaction_enabled: boolean | null
          status: string
          system_prompt: string | null
          training_prompt: string | null
          updated_at: string
        }
        Insert: {
          accuracy_rating?: number | null
          agent_goal: string
          agent_name: string
          agent_scope?: Json
          created_at?: string
          created_by?: string | null
          feedback_loop_enabled?: boolean | null
          id?: string
          knowledge_sources?: string[]
          last_active?: string | null
          memory_size?: number | null
          personality?: string
          public_interaction_enabled?: boolean | null
          status?: string
          system_prompt?: string | null
          training_prompt?: string | null
          updated_at?: string
        }
        Update: {
          accuracy_rating?: number | null
          agent_goal?: string
          agent_name?: string
          agent_scope?: Json
          created_at?: string
          created_by?: string | null
          feedback_loop_enabled?: boolean | null
          id?: string
          knowledge_sources?: string[]
          last_active?: string | null
          memory_size?: number | null
          personality?: string
          public_interaction_enabled?: boolean | null
          status?: string
          system_prompt?: string | null
          training_prompt?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ashen_jr_interactions: {
        Row: {
          agent_id: string
          agent_response: string
          context_data: Json | null
          created_at: string
          feedback_comment: string | null
          feedback_rating: number | null
          id: string
          interaction_type: string
          response_accuracy: number | null
          source_channel: string | null
          user_id: string | null
          user_message: string
        }
        Insert: {
          agent_id: string
          agent_response: string
          context_data?: Json | null
          created_at?: string
          feedback_comment?: string | null
          feedback_rating?: number | null
          id?: string
          interaction_type?: string
          response_accuracy?: number | null
          source_channel?: string | null
          user_id?: string | null
          user_message: string
        }
        Update: {
          agent_id?: string
          agent_response?: string
          context_data?: Json | null
          created_at?: string
          feedback_comment?: string | null
          feedback_rating?: number | null
          id?: string
          interaction_type?: string
          response_accuracy?: number | null
          source_channel?: string | null
          user_id?: string | null
          user_message?: string
        }
        Relationships: [
          {
            foreignKeyName: "ashen_jr_interactions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ashen_jr_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ashen_jr_knowledge: {
        Row: {
          agent_id: string
          confidence_score: number | null
          created_at: string
          id: string
          is_active: boolean | null
          knowledge_data: Json
          knowledge_type: string
          learned_from_interaction_id: string | null
          source_reference: string | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          knowledge_data: Json
          knowledge_type: string
          learned_from_interaction_id?: string | null
          source_reference?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          knowledge_data?: Json
          knowledge_type?: string
          learned_from_interaction_id?: string | null
          source_reference?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ashen_jr_knowledge_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ashen_jr_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ashen_jr_knowledge_learned_from_interaction_id_fkey"
            columns: ["learned_from_interaction_id"]
            isOneToOne: false
            referencedRelation: "ashen_jr_interactions"
            referencedColumns: ["id"]
          },
        ]
      }
      ashen_jr_performance: {
        Row: {
          accuracy_score: number | null
          agent_id: string
          created_at: string
          feedback_score: number | null
          id: string
          interactions_count: number | null
          knowledge_gaps: Json | null
          metric_date: string
          response_time_avg_ms: number | null
          suggested_improvements: Json | null
        }
        Insert: {
          accuracy_score?: number | null
          agent_id: string
          created_at?: string
          feedback_score?: number | null
          id?: string
          interactions_count?: number | null
          knowledge_gaps?: Json | null
          metric_date?: string
          response_time_avg_ms?: number | null
          suggested_improvements?: Json | null
        }
        Update: {
          accuracy_score?: number | null
          agent_id?: string
          created_at?: string
          feedback_score?: number | null
          id?: string
          interactions_count?: number | null
          knowledge_gaps?: Json | null
          metric_date?: string
          response_time_avg_ms?: number | null
          suggested_improvements?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ashen_jr_performance_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ashen_jr_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ashen_jr_training_sessions: {
        Row: {
          agent_id: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          performance_metrics: Json | null
          started_at: string | null
          status: string
          training_data: Json
          training_duration_minutes: number | null
          training_prompt: string | null
          training_type: string
        }
        Insert: {
          agent_id: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          performance_metrics?: Json | null
          started_at?: string | null
          status?: string
          training_data?: Json
          training_duration_minutes?: number | null
          training_prompt?: string | null
          training_type?: string
        }
        Update: {
          agent_id?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          performance_metrics?: Json | null
          started_at?: string | null
          status?: string
          training_data?: Json
          training_duration_minutes?: number | null
          training_prompt?: string | null
          training_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ashen_jr_training_sessions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ashen_jr_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ashen_learning_insights: {
        Row: {
          applicable_contexts: Json | null
          confidence_score: number | null
          created_at: string
          example_cases: Json | null
          id: string
          insight_type: string
          is_active: boolean | null
          last_applied: string | null
          learned_rules: Json | null
          pattern_description: string | null
          pattern_name: string
          success_rate: number | null
          updated_at: string
          usage_frequency: number | null
        }
        Insert: {
          applicable_contexts?: Json | null
          confidence_score?: number | null
          created_at?: string
          example_cases?: Json | null
          id?: string
          insight_type: string
          is_active?: boolean | null
          last_applied?: string | null
          learned_rules?: Json | null
          pattern_description?: string | null
          pattern_name: string
          success_rate?: number | null
          updated_at?: string
          usage_frequency?: number | null
        }
        Update: {
          applicable_contexts?: Json | null
          confidence_score?: number | null
          created_at?: string
          example_cases?: Json | null
          id?: string
          insight_type?: string
          is_active?: boolean | null
          last_applied?: string | null
          learned_rules?: Json | null
          pattern_description?: string | null
          pattern_name?: string
          success_rate?: number | null
          updated_at?: string
          usage_frequency?: number | null
        }
        Relationships: []
      }
      ashen_learning_patterns: {
        Row: {
          created_at: string
          id: string
          pattern_data: Json
          pattern_type: string
          success_rate: number | null
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          pattern_data: Json
          pattern_type: string
          success_rate?: number | null
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          pattern_data?: Json
          pattern_type?: string
          success_rate?: number | null
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      ashen_monitoring_config: {
        Row: {
          config_key: string
          config_value: Json
          id: string
          is_active: boolean | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          id?: string
          is_active?: boolean | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          id?: string
          is_active?: boolean | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      ashen_patch_history: {
        Row: {
          admin_feedback: string | null
          admin_response_time_seconds: number | null
          applied_by: string | null
          created_at: string
          file_path: string
          fix_trust_score: number | null
          id: string
          original_code: string | null
          outcome: string
          patch_id: string
          patch_reasoning: string | null
          patch_type: string
          patched_code: string | null
          rollback_reason: string | null
          updated_at: string
        }
        Insert: {
          admin_feedback?: string | null
          admin_response_time_seconds?: number | null
          applied_by?: string | null
          created_at?: string
          file_path: string
          fix_trust_score?: number | null
          id?: string
          original_code?: string | null
          outcome?: string
          patch_id: string
          patch_reasoning?: string | null
          patch_type: string
          patched_code?: string | null
          rollback_reason?: string | null
          updated_at?: string
        }
        Update: {
          admin_feedback?: string | null
          admin_response_time_seconds?: number | null
          applied_by?: string | null
          created_at?: string
          file_path?: string
          fix_trust_score?: number | null
          id?: string
          original_code?: string | null
          outcome?: string
          patch_id?: string
          patch_reasoning?: string | null
          patch_type?: string
          patched_code?: string | null
          rollback_reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ashen_personal_patch_index: {
        Row: {
          admin_approved: boolean | null
          avg_response_time_seconds: number | null
          created_at: string
          id: string
          last_used: string | null
          pattern_name: string
          problem_signature: string
          solution_template: string
          stability_score: number | null
          success_rate: number | null
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          admin_approved?: boolean | null
          avg_response_time_seconds?: number | null
          created_at?: string
          id?: string
          last_used?: string | null
          pattern_name: string
          problem_signature: string
          solution_template: string
          stability_score?: number | null
          success_rate?: number | null
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          admin_approved?: boolean | null
          avg_response_time_seconds?: number | null
          created_at?: string
          id?: string
          last_used?: string | null
          pattern_name?: string
          problem_signature?: string
          solution_template?: string
          stability_score?: number | null
          success_rate?: number | null
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      ashen_plugin_generation_steps: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          file_path: string | null
          generated_code: string | null
          id: string
          request_id: string | null
          started_at: string | null
          status: string
          step_name: string
          step_order: number
          step_type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          file_path?: string | null
          generated_code?: string | null
          id?: string
          request_id?: string | null
          started_at?: string | null
          status?: string
          step_name: string
          step_order: number
          step_type: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          file_path?: string | null
          generated_code?: string | null
          id?: string
          request_id?: string | null
          started_at?: string | null
          status?: string
          step_name?: string
          step_order?: number
          step_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ashen_plugin_generation_steps_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "ashen_plugin_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      ashen_plugin_requests: {
        Row: {
          created_at: string
          created_by: string | null
          error_details: string | null
          estimated_complexity: number | null
          files_to_create: string[] | null
          functions_to_create: string[] | null
          generation_logs: Json | null
          id: string
          parsed_requirements: Json
          plugin_name: string | null
          request_text: string
          similarity_check_results: Json | null
          status: string
          tables_to_create: string[] | null
          target_roles: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          error_details?: string | null
          estimated_complexity?: number | null
          files_to_create?: string[] | null
          functions_to_create?: string[] | null
          generation_logs?: Json | null
          id?: string
          parsed_requirements?: Json
          plugin_name?: string | null
          request_text: string
          similarity_check_results?: Json | null
          status?: string
          tables_to_create?: string[] | null
          target_roles?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          error_details?: string | null
          estimated_complexity?: number | null
          files_to_create?: string[] | null
          functions_to_create?: string[] | null
          generation_logs?: Json | null
          id?: string
          parsed_requirements?: Json
          plugin_name?: string | null
          request_text?: string
          similarity_check_results?: Json | null
          status?: string
          tables_to_create?: string[] | null
          target_roles?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      ashen_prompt_chains: {
        Row: {
          chain_depth: number | null
          child_prompt_id: string
          created_at: string
          id: string
          parent_prompt_id: string
          relationship_type: string
        }
        Insert: {
          chain_depth?: number | null
          child_prompt_id: string
          created_at?: string
          id?: string
          parent_prompt_id: string
          relationship_type: string
        }
        Update: {
          chain_depth?: number | null
          child_prompt_id?: string
          created_at?: string
          id?: string
          parent_prompt_id?: string
          relationship_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ashen_prompt_chains_child_prompt_id_fkey"
            columns: ["child_prompt_id"]
            isOneToOne: false
            referencedRelation: "ashen_prompt_trace_index"
            referencedColumns: ["prompt_id"]
          },
          {
            foreignKeyName: "ashen_prompt_chains_parent_prompt_id_fkey"
            columns: ["parent_prompt_id"]
            isOneToOne: false
            referencedRelation: "ashen_prompt_trace_index"
            referencedColumns: ["prompt_id"]
          },
        ]
      }
      ashen_prompt_knowledge_base: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          success_rate: number | null
          tags: string[] | null
          template_category: string
          template_content: string
          template_description: string | null
          template_name: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          success_rate?: number | null
          tags?: string[] | null
          template_category: string
          template_content: string
          template_description?: string | null
          template_name: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          success_rate?: number | null
          tags?: string[] | null
          template_category?: string
          template_content?: string
          template_description?: string | null
          template_name?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      ashen_prompt_similarity: {
        Row: {
          common_keywords: string[] | null
          comparison_result: string | null
          created_at: string
          diff_analysis: Json | null
          id: string
          similarity_score: number
          source_prompt_id: string
          target_prompt_id: string
        }
        Insert: {
          common_keywords?: string[] | null
          comparison_result?: string | null
          created_at?: string
          diff_analysis?: Json | null
          id?: string
          similarity_score: number
          source_prompt_id: string
          target_prompt_id: string
        }
        Update: {
          common_keywords?: string[] | null
          comparison_result?: string | null
          created_at?: string
          diff_analysis?: Json | null
          id?: string
          similarity_score?: number
          source_prompt_id?: string
          target_prompt_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ashen_prompt_similarity_source_prompt_id_fkey"
            columns: ["source_prompt_id"]
            isOneToOne: false
            referencedRelation: "ashen_prompt_trace_index"
            referencedColumns: ["prompt_id"]
          },
          {
            foreignKeyName: "ashen_prompt_similarity_target_prompt_id_fkey"
            columns: ["target_prompt_id"]
            isOneToOne: false
            referencedRelation: "ashen_prompt_trace_index"
            referencedColumns: ["prompt_id"]
          },
        ]
      }
      ashen_prompt_trace_index: {
        Row: {
          created_at: string
          execution_date: string
          files_created: string[] | null
          files_modified: string[] | null
          functions_created: string[] | null
          id: string
          metadata: Json | null
          modules_affected: string[] | null
          outcome: string
          outcome_details: string | null
          prompt_author: string | null
          prompt_content: string
          prompt_id: string
          prompt_phase: string | null
          prompt_title: string
          related_prompts: string[] | null
          routes_created: string[] | null
          similarity_score: number | null
          tables_created: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          execution_date?: string
          files_created?: string[] | null
          files_modified?: string[] | null
          functions_created?: string[] | null
          id?: string
          metadata?: Json | null
          modules_affected?: string[] | null
          outcome?: string
          outcome_details?: string | null
          prompt_author?: string | null
          prompt_content: string
          prompt_id: string
          prompt_phase?: string | null
          prompt_title: string
          related_prompts?: string[] | null
          routes_created?: string[] | null
          similarity_score?: number | null
          tables_created?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          execution_date?: string
          files_created?: string[] | null
          files_modified?: string[] | null
          functions_created?: string[] | null
          id?: string
          metadata?: Json | null
          modules_affected?: string[] | null
          outcome?: string
          outcome_details?: string | null
          prompt_author?: string | null
          prompt_content?: string
          prompt_id?: string
          prompt_phase?: string | null
          prompt_title?: string
          related_prompts?: string[] | null
          routes_created?: string[] | null
          similarity_score?: number | null
          tables_created?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      ashen_restore_operations: {
        Row: {
          completed_at: string | null
          created_at: string
          current_step: string | null
          errors_encountered: Json | null
          files_restored: number | null
          id: string
          initiated_by: string | null
          pre_restore_snapshot_id: string | null
          progress_percentage: number | null
          restore_scope: string[] | null
          restore_type: string
          rollback_available: boolean | null
          safety_checks_passed: boolean | null
          snapshot_id: string
          started_at: string | null
          status: string
          tables_restored: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_step?: string | null
          errors_encountered?: Json | null
          files_restored?: number | null
          id?: string
          initiated_by?: string | null
          pre_restore_snapshot_id?: string | null
          progress_percentage?: number | null
          restore_scope?: string[] | null
          restore_type?: string
          rollback_available?: boolean | null
          safety_checks_passed?: boolean | null
          snapshot_id: string
          started_at?: string | null
          status?: string
          tables_restored?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_step?: string | null
          errors_encountered?: Json | null
          files_restored?: number | null
          id?: string
          initiated_by?: string | null
          pre_restore_snapshot_id?: string | null
          progress_percentage?: number | null
          restore_scope?: string[] | null
          restore_type?: string
          rollback_available?: boolean | null
          safety_checks_passed?: boolean | null
          snapshot_id?: string
          started_at?: string | null
          status?: string
          tables_restored?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ashen_restore_operations_pre_restore_snapshot_id_fkey"
            columns: ["pre_restore_snapshot_id"]
            isOneToOne: false
            referencedRelation: "ashen_system_snapshots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ashen_restore_operations_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "ashen_system_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      ashen_security_breaches: {
        Row: {
          breach_name: string
          breach_type: string
          created_at: string
          current_risk_level: string | null
          exploit_method: string
          fix_suggestions: Json | null
          id: string
          last_replayed_at: string | null
          original_date: string | null
          patch_status: string | null
          replay_details: Json | null
          replay_result: string
          target_module: string
        }
        Insert: {
          breach_name: string
          breach_type: string
          created_at?: string
          current_risk_level?: string | null
          exploit_method: string
          fix_suggestions?: Json | null
          id?: string
          last_replayed_at?: string | null
          original_date?: string | null
          patch_status?: string | null
          replay_details?: Json | null
          replay_result?: string
          target_module: string
        }
        Update: {
          breach_name?: string
          breach_type?: string
          created_at?: string
          current_risk_level?: string | null
          exploit_method?: string
          fix_suggestions?: Json | null
          id?: string
          last_replayed_at?: string | null
          original_date?: string | null
          patch_status?: string | null
          replay_details?: Json | null
          replay_result?: string
          target_module?: string
        }
        Relationships: []
      }
      ashen_security_config: {
        Row: {
          config_key: string
          config_value: Json
          description: string | null
          id: string
          is_active: boolean | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      ashen_security_logs: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          affected_files: string[] | null
          attack_vector: string
          created_at: string
          detection_method: string
          exploit_details: Json | null
          exploit_risk_score: number
          id: string
          module_name: string
          patch_applied: boolean | null
          patch_available: boolean | null
          patch_details: Json | null
          patched_at: string | null
          remediation_steps: string[] | null
          severity: string
          status: string
          vulnerability_type: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          affected_files?: string[] | null
          attack_vector: string
          created_at?: string
          detection_method: string
          exploit_details?: Json | null
          exploit_risk_score?: number
          id?: string
          module_name: string
          patch_applied?: boolean | null
          patch_available?: boolean | null
          patch_details?: Json | null
          patched_at?: string | null
          remediation_steps?: string[] | null
          severity?: string
          status?: string
          vulnerability_type: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          affected_files?: string[] | null
          attack_vector?: string
          created_at?: string
          detection_method?: string
          exploit_details?: Json | null
          exploit_risk_score?: number
          id?: string
          module_name?: string
          patch_applied?: boolean | null
          patch_available?: boolean | null
          patch_details?: Json | null
          patched_at?: string | null
          remediation_steps?: string[] | null
          severity?: string
          status?: string
          vulnerability_type?: string
        }
        Relationships: []
      }
      ashen_security_tests: {
        Row: {
          attack_vector: string
          created_at: string
          executed_at: string | null
          exploit_risk_score: number | null
          id: string
          metadata: Json | null
          patch_applied: boolean | null
          patch_details: Json | null
          patch_suggested: boolean | null
          target_endpoint: string
          test_name: string
          test_payload: string | null
          test_result: string
          test_type: string
          vulnerability_found: boolean | null
        }
        Insert: {
          attack_vector: string
          created_at?: string
          executed_at?: string | null
          exploit_risk_score?: number | null
          id?: string
          metadata?: Json | null
          patch_applied?: boolean | null
          patch_details?: Json | null
          patch_suggested?: boolean | null
          target_endpoint: string
          test_name: string
          test_payload?: string | null
          test_result?: string
          test_type: string
          vulnerability_found?: boolean | null
        }
        Update: {
          attack_vector?: string
          created_at?: string
          executed_at?: string | null
          exploit_risk_score?: number | null
          id?: string
          metadata?: Json | null
          patch_applied?: boolean | null
          patch_details?: Json | null
          patch_suggested?: boolean | null
          target_endpoint?: string
          test_name?: string
          test_payload?: string | null
          test_result?: string
          test_type?: string
          vulnerability_found?: boolean | null
        }
        Relationships: []
      }
      ashen_simulation_device_configs: {
        Row: {
          created_at: string
          device_name: string
          device_type: string
          id: string
          is_active: boolean | null
          network_conditions: Json | null
          touch_enabled: boolean | null
          updated_at: string
          user_agent: string
          viewport_height: number
          viewport_width: number
        }
        Insert: {
          created_at?: string
          device_name: string
          device_type: string
          id?: string
          is_active?: boolean | null
          network_conditions?: Json | null
          touch_enabled?: boolean | null
          updated_at?: string
          user_agent: string
          viewport_height: number
          viewport_width: number
        }
        Update: {
          created_at?: string
          device_name?: string
          device_type?: string
          id?: string
          is_active?: boolean | null
          network_conditions?: Json | null
          touch_enabled?: boolean | null
          updated_at?: string
          user_agent?: string
          viewport_height?: number
          viewport_width?: number
        }
        Relationships: []
      }
      ashen_simulation_replay_logs: {
        Row: {
          action_data: Json | null
          action_type: string
          coordinates: Json | null
          created_at: string
          error_message: string | null
          id: string
          result_id: string
          screenshot_url: string | null
          step_number: number
          target_element: string | null
          timestamp_ms: number
        }
        Insert: {
          action_data?: Json | null
          action_type: string
          coordinates?: Json | null
          created_at?: string
          error_message?: string | null
          id?: string
          result_id: string
          screenshot_url?: string | null
          step_number: number
          target_element?: string | null
          timestamp_ms: number
        }
        Update: {
          action_data?: Json | null
          action_type?: string
          coordinates?: Json | null
          created_at?: string
          error_message?: string | null
          id?: string
          result_id?: string
          screenshot_url?: string | null
          step_number?: number
          target_element?: string | null
          timestamp_ms?: number
        }
        Relationships: [
          {
            foreignKeyName: "ashen_simulation_replay_logs_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "ashen_simulation_results"
            referencedColumns: ["id"]
          },
        ]
      }
      ashen_simulation_results: {
        Row: {
          browser: string | null
          created_at: string
          device_model: string | null
          device_type: string
          errors_found: number | null
          execution_date: string
          id: string
          performance_metrics: Json | null
          results_summary: Json | null
          status: string
          test_duration_ms: number | null
          test_id: string
          ux_score: number | null
          warnings_found: number | null
        }
        Insert: {
          browser?: string | null
          created_at?: string
          device_model?: string | null
          device_type: string
          errors_found?: number | null
          execution_date?: string
          id?: string
          performance_metrics?: Json | null
          results_summary?: Json | null
          status?: string
          test_duration_ms?: number | null
          test_id: string
          ux_score?: number | null
          warnings_found?: number | null
        }
        Update: {
          browser?: string | null
          created_at?: string
          device_model?: string | null
          device_type?: string
          errors_found?: number | null
          execution_date?: string
          id?: string
          performance_metrics?: Json | null
          results_summary?: Json | null
          status?: string
          test_duration_ms?: number | null
          test_id?: string
          ux_score?: number | null
          warnings_found?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ashen_simulation_results_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ashen_simulation_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      ashen_simulation_test_paths: {
        Row: {
          created_at: string
          expected_outcomes: Json | null
          id: string
          is_active: boolean | null
          is_critical: boolean | null
          path_description: string | null
          path_name: string
          steps: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          expected_outcomes?: Json | null
          id?: string
          is_active?: boolean | null
          is_critical?: boolean | null
          path_description?: string | null
          path_name: string
          steps?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          expected_outcomes?: Json | null
          id?: string
          is_active?: boolean | null
          is_critical?: boolean | null
          path_description?: string | null
          path_name?: string
          steps?: Json
          updated_at?: string
        }
        Relationships: []
      }
      ashen_simulation_tests: {
        Row: {
          auto_run: boolean | null
          browser: string | null
          created_at: string
          device_model: string | null
          device_type: string
          id: string
          is_active: boolean | null
          run_frequency: string | null
          simulation_config: Json | null
          test_name: string
          test_paths: Json | null
          test_type: string
          updated_at: string
        }
        Insert: {
          auto_run?: boolean | null
          browser?: string | null
          created_at?: string
          device_model?: string | null
          device_type?: string
          id?: string
          is_active?: boolean | null
          run_frequency?: string | null
          simulation_config?: Json | null
          test_name: string
          test_paths?: Json | null
          test_type?: string
          updated_at?: string
        }
        Update: {
          auto_run?: boolean | null
          browser?: string | null
          created_at?: string
          device_model?: string | null
          device_type?: string
          id?: string
          is_active?: boolean | null
          run_frequency?: string | null
          simulation_config?: Json | null
          test_name?: string
          test_paths?: Json | null
          test_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      ashen_snapshot_comparisons: {
        Row: {
          change_severity: string | null
          comparison_summary: string | null
          config_changes: Json | null
          created_at: string
          files_added: Json | null
          files_deleted: Json | null
          files_modified: Json | null
          id: string
          risk_assessment: Json | null
          snapshot_a_id: string
          snapshot_b_id: string
          tables_added: Json | null
          tables_deleted: Json | null
          tables_modified: Json | null
          total_changes: number | null
        }
        Insert: {
          change_severity?: string | null
          comparison_summary?: string | null
          config_changes?: Json | null
          created_at?: string
          files_added?: Json | null
          files_deleted?: Json | null
          files_modified?: Json | null
          id?: string
          risk_assessment?: Json | null
          snapshot_a_id: string
          snapshot_b_id: string
          tables_added?: Json | null
          tables_deleted?: Json | null
          tables_modified?: Json | null
          total_changes?: number | null
        }
        Update: {
          change_severity?: string | null
          comparison_summary?: string | null
          config_changes?: Json | null
          created_at?: string
          files_added?: Json | null
          files_deleted?: Json | null
          files_modified?: Json | null
          id?: string
          risk_assessment?: Json | null
          snapshot_a_id?: string
          snapshot_b_id?: string
          tables_added?: Json | null
          tables_deleted?: Json | null
          tables_modified?: Json | null
          total_changes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ashen_snapshot_comparisons_snapshot_a_id_fkey"
            columns: ["snapshot_a_id"]
            isOneToOne: false
            referencedRelation: "ashen_system_snapshots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ashen_snapshot_comparisons_snapshot_b_id_fkey"
            columns: ["snapshot_b_id"]
            isOneToOne: false
            referencedRelation: "ashen_system_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      ashen_snapshot_retention_config: {
        Row: {
          auto_cleanup_enabled: boolean | null
          auto_rollback_on_critical_error: boolean | null
          auto_snapshot_enabled: boolean | null
          auto_snapshot_frequency: string | null
          auto_snapshot_time: string | null
          created_at: string
          emergency_restore_enabled: boolean | null
          id: string
          is_active: boolean | null
          max_age_days: number | null
          max_snapshots: number | null
          policy_name: string
          pre_patch_snapshots: boolean | null
          pre_plugin_snapshots: boolean | null
          updated_at: string
        }
        Insert: {
          auto_cleanup_enabled?: boolean | null
          auto_rollback_on_critical_error?: boolean | null
          auto_snapshot_enabled?: boolean | null
          auto_snapshot_frequency?: string | null
          auto_snapshot_time?: string | null
          created_at?: string
          emergency_restore_enabled?: boolean | null
          id?: string
          is_active?: boolean | null
          max_age_days?: number | null
          max_snapshots?: number | null
          policy_name: string
          pre_patch_snapshots?: boolean | null
          pre_plugin_snapshots?: boolean | null
          updated_at?: string
        }
        Update: {
          auto_cleanup_enabled?: boolean | null
          auto_rollback_on_critical_error?: boolean | null
          auto_snapshot_enabled?: boolean | null
          auto_snapshot_frequency?: string | null
          auto_snapshot_time?: string | null
          created_at?: string
          emergency_restore_enabled?: boolean | null
          id?: string
          is_active?: boolean | null
          max_age_days?: number | null
          max_snapshots?: number | null
          policy_name?: string
          pre_patch_snapshots?: boolean | null
          pre_plugin_snapshots?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      ashen_style_patterns: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          is_active: boolean | null
          last_observed: string | null
          pattern_category: string
          pattern_description: string
          pattern_example: Json | null
          updated_at: string
          usage_frequency: number | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_observed?: string | null
          pattern_category: string
          pattern_description: string
          pattern_example?: Json | null
          updated_at?: string
          usage_frequency?: number | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_observed?: string | null
          pattern_category?: string
          pattern_description?: string
          pattern_example?: Json | null
          updated_at?: string
          usage_frequency?: number | null
        }
        Relationships: []
      }
      ashen_sync_config: {
        Row: {
          config_key: string
          config_value: Json
          id: string
          is_active: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          config_key: string
          config_value?: Json
          id?: string
          is_active?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          id?: string
          is_active?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      ashen_sync_logs: {
        Row: {
          admin_override: boolean | null
          conflict_details: Json | null
          conflict_status: string
          created_at: string
          feature_scanned: string
          id: string
          metadata: Json | null
          recommendations: string[] | null
          scan_duration_ms: number | null
          scan_result: string
          scan_type: string
        }
        Insert: {
          admin_override?: boolean | null
          conflict_details?: Json | null
          conflict_status: string
          created_at?: string
          feature_scanned: string
          id?: string
          metadata?: Json | null
          recommendations?: string[] | null
          scan_duration_ms?: number | null
          scan_result: string
          scan_type?: string
        }
        Update: {
          admin_override?: boolean | null
          conflict_details?: Json | null
          conflict_status?: string
          created_at?: string
          feature_scanned?: string
          id?: string
          metadata?: Json | null
          recommendations?: string[] | null
          scan_duration_ms?: number | null
          scan_result?: string
          scan_type?: string
        }
        Relationships: []
      }
      ashen_system_snapshots: {
        Row: {
          compression_ratio: number | null
          configuration_data: Json | null
          created_at: string
          created_by: string | null
          creation_completed_at: string | null
          creation_started_at: string | null
          database_schema: Json | null
          description: string | null
          file_structure: Json | null
          id: string
          metadata: Json | null
          parent_snapshot_id: string | null
          snapshot_name: string
          snapshot_type: string
          status: string
          tags: string[] | null
          total_files: number | null
          total_size_mb: number | null
          triggered_by_patch_id: string | null
          triggered_by_plugin_id: string | null
          updated_at: string
        }
        Insert: {
          compression_ratio?: number | null
          configuration_data?: Json | null
          created_at?: string
          created_by?: string | null
          creation_completed_at?: string | null
          creation_started_at?: string | null
          database_schema?: Json | null
          description?: string | null
          file_structure?: Json | null
          id?: string
          metadata?: Json | null
          parent_snapshot_id?: string | null
          snapshot_name: string
          snapshot_type?: string
          status?: string
          tags?: string[] | null
          total_files?: number | null
          total_size_mb?: number | null
          triggered_by_patch_id?: string | null
          triggered_by_plugin_id?: string | null
          updated_at?: string
        }
        Update: {
          compression_ratio?: number | null
          configuration_data?: Json | null
          created_at?: string
          created_by?: string | null
          creation_completed_at?: string | null
          creation_started_at?: string | null
          database_schema?: Json | null
          description?: string | null
          file_structure?: Json | null
          id?: string
          metadata?: Json | null
          parent_snapshot_id?: string | null
          snapshot_name?: string
          snapshot_type?: string
          status?: string
          tags?: string[] | null
          total_files?: number | null
          total_size_mb?: number | null
          triggered_by_patch_id?: string | null
          triggered_by_plugin_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ashen_unstable_patterns: {
        Row: {
          admin_notes: string | null
          blocked_until: string | null
          created_at: string
          failure_count: number | null
          id: string
          is_permanently_blocked: boolean | null
          last_failure: string | null
          pattern_description: string | null
          pattern_signature: string
          rollback_count: number | null
        }
        Insert: {
          admin_notes?: string | null
          blocked_until?: string | null
          created_at?: string
          failure_count?: number | null
          id?: string
          is_permanently_blocked?: boolean | null
          last_failure?: string | null
          pattern_description?: string | null
          pattern_signature: string
          rollback_count?: number | null
        }
        Update: {
          admin_notes?: string | null
          blocked_until?: string | null
          created_at?: string
          failure_count?: number | null
          id?: string
          is_permanently_blocked?: boolean | null
          last_failure?: string | null
          pattern_description?: string | null
          pattern_signature?: string
          rollback_count?: number | null
        }
        Relationships: []
      }
      ashen_upgrade_history: {
        Row: {
          backward_compatible: boolean | null
          changes_summary: string | null
          created_at: string
          feature_id: string
          id: string
          metadata: Json | null
          new_version: string
          old_version: string
          rollback_available: boolean | null
          rollback_data: Json | null
          upgrade_duration_ms: number | null
          upgrade_reason: string | null
          upgrade_type: string
          upgraded_by: string | null
        }
        Insert: {
          backward_compatible?: boolean | null
          changes_summary?: string | null
          created_at?: string
          feature_id: string
          id?: string
          metadata?: Json | null
          new_version: string
          old_version: string
          rollback_available?: boolean | null
          rollback_data?: Json | null
          upgrade_duration_ms?: number | null
          upgrade_reason?: string | null
          upgrade_type: string
          upgraded_by?: string | null
        }
        Update: {
          backward_compatible?: boolean | null
          changes_summary?: string | null
          created_at?: string
          feature_id?: string
          id?: string
          metadata?: Json | null
          new_version?: string
          old_version?: string
          rollback_available?: boolean | null
          rollback_data?: Json | null
          upgrade_duration_ms?: number | null
          upgrade_reason?: string | null
          upgrade_type?: string
          upgraded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ashen_upgrade_history_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "ashen_feature_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_fingerprints: {
        Row: {
          audio_duration_seconds: number | null
          created_at: string
          fingerprint_data: Json
          fingerprint_hash: string
          id: string
          sample_rate: number | null
          track_id: string
          updated_at: string
        }
        Insert: {
          audio_duration_seconds?: number | null
          created_at?: string
          fingerprint_data: Json
          fingerprint_hash: string
          id?: string
          sample_rate?: number | null
          track_id: string
          updated_at?: string
        }
        Update: {
          audio_duration_seconds?: number | null
          created_at?: string
          fingerprint_data?: Json
          fingerprint_hash?: string
          id?: string
          sample_rate?: number | null
          track_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audio_fingerprints_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: true
            referencedRelation: "music_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      automated_moderation: {
        Row: {
          ai_model_used: string
          appeal_reason: string | null
          appeal_status: string | null
          confidence_score: number
          content_id: string
          content_text: string | null
          content_type: string
          created_at: string
          flagged_keywords: string[] | null
          human_review_required: boolean
          id: string
          moderation_action: Database["public"]["Enums"]["moderation_action"]
          reviewed_at: string | null
          reviewed_by: string | null
          sentiment_score: number | null
          spam_probability: number | null
          toxicity_score: number | null
          updated_at: string
        }
        Insert: {
          ai_model_used?: string
          appeal_reason?: string | null
          appeal_status?: string | null
          confidence_score: number
          content_id: string
          content_text?: string | null
          content_type: string
          created_at?: string
          flagged_keywords?: string[] | null
          human_review_required?: boolean
          id?: string
          moderation_action: Database["public"]["Enums"]["moderation_action"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          sentiment_score?: number | null
          spam_probability?: number | null
          toxicity_score?: number | null
          updated_at?: string
        }
        Update: {
          ai_model_used?: string
          appeal_reason?: string | null
          appeal_status?: string | null
          confidence_score?: number
          content_id?: string
          content_text?: string | null
          content_type?: string
          created_at?: string
          flagged_keywords?: string[] | null
          human_review_required?: boolean
          id?: string
          moderation_action?: Database["public"]["Enums"]["moderation_action"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          sentiment_score?: number | null
          spam_probability?: number | null
          toxicity_score?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      automated_reports: {
        Row: {
          created_at: string
          created_by: string | null
          data_sources: string[]
          error_count: number
          generation_count: number
          id: string
          is_active: boolean
          last_generated_at: string | null
          metadata: Json | null
          next_generation_at: string | null
          output_format: string
          recipients: string[]
          report_name: string
          report_type: string
          report_url: string | null
          schedule_pattern: string
          template_config: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_sources: string[]
          error_count?: number
          generation_count?: number
          id?: string
          is_active?: boolean
          last_generated_at?: string | null
          metadata?: Json | null
          next_generation_at?: string | null
          output_format?: string
          recipients: string[]
          report_name: string
          report_type: string
          report_url?: string | null
          schedule_pattern: string
          template_config: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_sources?: string[]
          error_count?: number
          generation_count?: number
          id?: string
          is_active?: boolean
          last_generated_at?: string | null
          metadata?: Json | null
          next_generation_at?: string | null
          output_format?: string
          recipients?: string[]
          report_name?: string
          report_type?: string
          report_url?: string | null
          schedule_pattern?: string
          template_config?: Json
          updated_at?: string
        }
        Relationships: []
      }
      autonomous_poll_config: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string
          id: string
          is_enabled: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          config_key: string
          config_value?: Json
          created_at?: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      autonomous_polls: {
        Row: {
          admin_approved: boolean | null
          ai_reasoning: Json | null
          approved_at: string | null
          approved_by: string | null
          auto_published: boolean
          confidence_score: number
          created_at: string
          generation_method: string
          generation_prompt: string | null
          id: string
          performance_metrics: Json | null
          poll_id: string | null
          topic_category: string
          trigger_sentiment_id: string | null
          updated_at: string
        }
        Insert: {
          admin_approved?: boolean | null
          ai_reasoning?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          auto_published?: boolean
          confidence_score?: number
          created_at?: string
          generation_method?: string
          generation_prompt?: string | null
          id?: string
          performance_metrics?: Json | null
          poll_id?: string | null
          topic_category: string
          trigger_sentiment_id?: string | null
          updated_at?: string
        }
        Update: {
          admin_approved?: boolean | null
          ai_reasoning?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          auto_published?: boolean
          confidence_score?: number
          created_at?: string
          generation_method?: string
          generation_prompt?: string | null
          id?: string
          performance_metrics?: Json | null
          poll_id?: string | null
          topic_category?: string
          trigger_sentiment_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "autonomous_polls_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autonomous_polls_trigger_sentiment_id_fkey"
            columns: ["trigger_sentiment_id"]
            isOneToOne: false
            referencedRelation: "sentiment_trends"
            referencedColumns: ["id"]
          },
        ]
      }
      award_audit_logs: {
        Row: {
          action_details: Json | null
          action_type: string
          admin_id: string | null
          award_id: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          admin_id?: string | null
          award_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          admin_id?: string | null
          award_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown | null
        }
        Relationships: [
          {
            foreignKeyName: "award_audit_logs_award_id_fkey"
            columns: ["award_id"]
            isOneToOne: false
            referencedRelation: "awards"
            referencedColumns: ["id"]
          },
        ]
      }
      award_categories: {
        Row: {
          award_id: string | null
          category_order: number | null
          created_at: string | null
          description: string | null
          id: string
          is_main_category: boolean | null
          max_nominees: number | null
          min_eligibility_score: number | null
          name: string
          prize_amount: number | null
          updated_at: string | null
        }
        Insert: {
          award_id?: string | null
          category_order?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_main_category?: boolean | null
          max_nominees?: number | null
          min_eligibility_score?: number | null
          name: string
          prize_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          award_id?: string | null
          category_order?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_main_category?: boolean | null
          max_nominees?: number | null
          min_eligibility_score?: number | null
          name?: string
          prize_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "award_categories_award_id_fkey"
            columns: ["award_id"]
            isOneToOne: false
            referencedRelation: "awards"
            referencedColumns: ["id"]
          },
        ]
      }
      award_external_data: {
        Row: {
          created_at: string | null
          data_period_end: string | null
          data_period_start: string | null
          data_source: Json | null
          id: string
          metric_type: string
          metric_value: number | null
          nomination_id: string | null
          platform: string
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          data_period_end?: string | null
          data_period_start?: string | null
          data_source?: Json | null
          id?: string
          metric_type: string
          metric_value?: number | null
          nomination_id?: string | null
          platform: string
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          data_period_end?: string | null
          data_period_start?: string | null
          data_source?: Json | null
          id?: string
          metric_type?: string
          metric_value?: number | null
          nomination_id?: string | null
          platform?: string
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "award_external_data_nomination_id_fkey"
            columns: ["nomination_id"]
            isOneToOne: false
            referencedRelation: "award_nominations"
            referencedColumns: ["id"]
          },
        ]
      }
      award_jury: {
        Row: {
          assigned_categories: string[] | null
          award_id: string | null
          bio: string | null
          conflict_categories: string[] | null
          created_at: string | null
          id: string
          is_active: boolean | null
          jury_name: string
          jury_title: string | null
          updated_at: string | null
          user_id: string | null
          weight_percentage: number | null
        }
        Insert: {
          assigned_categories?: string[] | null
          award_id?: string | null
          bio?: string | null
          conflict_categories?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          jury_name: string
          jury_title?: string | null
          updated_at?: string | null
          user_id?: string | null
          weight_percentage?: number | null
        }
        Update: {
          assigned_categories?: string[] | null
          award_id?: string | null
          bio?: string | null
          conflict_categories?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          jury_name?: string
          jury_title?: string | null
          updated_at?: string | null
          user_id?: string | null
          weight_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "award_jury_award_id_fkey"
            columns: ["award_id"]
            isOneToOne: false
            referencedRelation: "awards"
            referencedColumns: ["id"]
          },
        ]
      }
      award_nominations: {
        Row: {
          admin_notes: string | null
          artist_id: string | null
          award_id: string | null
          category_id: string | null
          created_at: string | null
          eligibility_verified: boolean | null
          id: string
          nominated_work_id: string | null
          nominated_work_title: string | null
          nomination_reason: string | null
          status: Database["public"]["Enums"]["nomination_status"] | null
          submitted_by: string | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          artist_id?: string | null
          award_id?: string | null
          category_id?: string | null
          created_at?: string | null
          eligibility_verified?: boolean | null
          id?: string
          nominated_work_id?: string | null
          nominated_work_title?: string | null
          nomination_reason?: string | null
          status?: Database["public"]["Enums"]["nomination_status"] | null
          submitted_by?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          artist_id?: string | null
          award_id?: string | null
          category_id?: string | null
          created_at?: string | null
          eligibility_verified?: boolean | null
          id?: string
          nominated_work_id?: string | null
          nominated_work_title?: string | null
          nomination_reason?: string | null
          status?: Database["public"]["Enums"]["nomination_status"] | null
          submitted_by?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "award_nominations_award_id_fkey"
            columns: ["award_id"]
            isOneToOne: false
            referencedRelation: "awards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "award_nominations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "award_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      award_results: {
        Row: {
          acceptance_speech: string | null
          award_id: string | null
          category_id: string | null
          created_at: string | null
          id: string
          nomination_id: string | null
          payout_status: string | null
          position: number | null
          prize_amount: number | null
          result_published: boolean | null
          trophy_delivery_status: string | null
          trophy_type: string | null
          updated_at: string | null
        }
        Insert: {
          acceptance_speech?: string | null
          award_id?: string | null
          category_id?: string | null
          created_at?: string | null
          id?: string
          nomination_id?: string | null
          payout_status?: string | null
          position?: number | null
          prize_amount?: number | null
          result_published?: boolean | null
          trophy_delivery_status?: string | null
          trophy_type?: string | null
          updated_at?: string | null
        }
        Update: {
          acceptance_speech?: string | null
          award_id?: string | null
          category_id?: string | null
          created_at?: string | null
          id?: string
          nomination_id?: string | null
          payout_status?: string | null
          position?: number | null
          prize_amount?: number | null
          result_published?: boolean | null
          trophy_delivery_status?: string | null
          trophy_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "award_results_award_id_fkey"
            columns: ["award_id"]
            isOneToOne: false
            referencedRelation: "awards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "award_results_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "award_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "award_results_nomination_id_fkey"
            columns: ["nomination_id"]
            isOneToOne: false
            referencedRelation: "award_nominations"
            referencedColumns: ["id"]
          },
        ]
      }
      award_scores: {
        Row: {
          camerplay_score: number | null
          created_at: string | null
          external_score: number | null
          id: string
          is_winner: boolean | null
          jury_score: number | null
          last_calculated: string | null
          nomination_id: string | null
          prize_amount: number | null
          public_score: number | null
          rank_position: number | null
          score_breakdown: Json | null
          total_score: number | null
          updated_at: string | null
        }
        Insert: {
          camerplay_score?: number | null
          created_at?: string | null
          external_score?: number | null
          id?: string
          is_winner?: boolean | null
          jury_score?: number | null
          last_calculated?: string | null
          nomination_id?: string | null
          prize_amount?: number | null
          public_score?: number | null
          rank_position?: number | null
          score_breakdown?: Json | null
          total_score?: number | null
          updated_at?: string | null
        }
        Update: {
          camerplay_score?: number | null
          created_at?: string | null
          external_score?: number | null
          id?: string
          is_winner?: boolean | null
          jury_score?: number | null
          last_calculated?: string | null
          nomination_id?: string | null
          prize_amount?: number | null
          public_score?: number | null
          rank_position?: number | null
          score_breakdown?: Json | null
          total_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "award_scores_nomination_id_fkey"
            columns: ["nomination_id"]
            isOneToOne: true
            referencedRelation: "award_nominations"
            referencedColumns: ["id"]
          },
        ]
      }
      award_votes: {
        Row: {
          created_at: string | null
          id: string
          ip_address: unknown | null
          nomination_id: string | null
          score: number | null
          user_agent: string | null
          vote_type: Database["public"]["Enums"]["vote_type"]
          vote_weight: number | null
          voter_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          nomination_id?: string | null
          score?: number | null
          user_agent?: string | null
          vote_type: Database["public"]["Enums"]["vote_type"]
          vote_weight?: number | null
          voter_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          nomination_id?: string | null
          score?: number | null
          user_agent?: string | null
          vote_type?: Database["public"]["Enums"]["vote_type"]
          vote_weight?: number | null
          voter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "award_votes_nomination_id_fkey"
            columns: ["nomination_id"]
            isOneToOne: false
            referencedRelation: "award_nominations"
            referencedColumns: ["id"]
          },
        ]
      }
      awards: {
        Row: {
          created_at: string | null
          description: string | null
          eligibility_criteria: Json | null
          id: string
          is_active: boolean | null
          nomination_deadline: string | null
          results_date: string | null
          scoring_weights: Json | null
          status: Database["public"]["Enums"]["award_status"] | null
          title: string
          total_prize_pool: number | null
          updated_at: string | null
          voting_deadline: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          eligibility_criteria?: Json | null
          id?: string
          is_active?: boolean | null
          nomination_deadline?: string | null
          results_date?: string | null
          scoring_weights?: Json | null
          status?: Database["public"]["Enums"]["award_status"] | null
          title: string
          total_prize_pool?: number | null
          updated_at?: string | null
          voting_deadline?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          eligibility_criteria?: Json | null
          id?: string
          is_active?: boolean | null
          nomination_deadline?: string | null
          results_date?: string | null
          scoring_weights?: Json | null
          status?: Database["public"]["Enums"]["award_status"] | null
          title?: string
          total_prize_pool?: number | null
          updated_at?: string | null
          voting_deadline?: string | null
          year?: number
        }
        Relationships: []
      }
      billionaire_applications: {
        Row: {
          admin_notes: string | null
          applicant_email: string
          applicant_name: string
          applicant_phone: string | null
          application_tier: Database["public"]["Enums"]["application_tier"]
          billionaire_id: string | null
          business_background: string
          claimed_net_worth_fcfa: number
          created_at: string | null
          id: string
          paid_at: string | null
          payment_amount: number
          payment_reference: string | null
          payment_status: string | null
          proof_documents: string[] | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          wealth_source: Database["public"]["Enums"]["wealth_source"]
        }
        Insert: {
          admin_notes?: string | null
          applicant_email: string
          applicant_name: string
          applicant_phone?: string | null
          application_tier: Database["public"]["Enums"]["application_tier"]
          billionaire_id?: string | null
          business_background: string
          claimed_net_worth_fcfa: number
          created_at?: string | null
          id?: string
          paid_at?: string | null
          payment_amount: number
          payment_reference?: string | null
          payment_status?: string | null
          proof_documents?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          wealth_source: Database["public"]["Enums"]["wealth_source"]
        }
        Update: {
          admin_notes?: string | null
          applicant_email?: string
          applicant_name?: string
          applicant_phone?: string | null
          application_tier?: Database["public"]["Enums"]["application_tier"]
          billionaire_id?: string | null
          business_background?: string
          claimed_net_worth_fcfa?: number
          created_at?: string | null
          id?: string
          paid_at?: string | null
          payment_amount?: number
          payment_reference?: string | null
          payment_status?: string | null
          proof_documents?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          wealth_source?: Database["public"]["Enums"]["wealth_source"]
        }
        Relationships: [
          {
            foreignKeyName: "billionaire_applications_billionaire_id_fkey"
            columns: ["billionaire_id"]
            isOneToOne: false
            referencedRelation: "billionaires"
            referencedColumns: ["id"]
          },
        ]
      }
      billionaire_payments: {
        Row: {
          amount: number
          application_id: string | null
          created_at: string | null
          currency: string | null
          id: string
          payment_method: string | null
          payment_reference: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          application_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          application_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billionaire_payments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "billionaire_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      billionaires: {
        Row: {
          biography: string | null
          business_investments: string[] | null
          company_affiliation: string | null
          contact_info: string | null
          created_at: string | null
          created_by: string | null
          current_rank: number | null
          display_alias: string | null
          full_name: string
          id: string
          is_anonymous: boolean | null
          is_verified: boolean | null
          media_profiles: Json | null
          net_worth_usd: number | null
          previous_rank: number | null
          profile_picture_url: string | null
          profile_views: number | null
          region: string
          social_media_handles: Json | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
          verified_net_worth_fcfa: number
          wealth_source: Database["public"]["Enums"]["wealth_source"]
          year_on_year_change: number | null
        }
        Insert: {
          biography?: string | null
          business_investments?: string[] | null
          company_affiliation?: string | null
          contact_info?: string | null
          created_at?: string | null
          created_by?: string | null
          current_rank?: number | null
          display_alias?: string | null
          full_name: string
          id?: string
          is_anonymous?: boolean | null
          is_verified?: boolean | null
          media_profiles?: Json | null
          net_worth_usd?: number | null
          previous_rank?: number | null
          profile_picture_url?: string | null
          profile_views?: number | null
          region: string
          social_media_handles?: Json | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
          verified_net_worth_fcfa: number
          wealth_source: Database["public"]["Enums"]["wealth_source"]
          year_on_year_change?: number | null
        }
        Update: {
          biography?: string | null
          business_investments?: string[] | null
          company_affiliation?: string | null
          contact_info?: string | null
          created_at?: string | null
          created_by?: string | null
          current_rank?: number | null
          display_alias?: string | null
          full_name?: string
          id?: string
          is_anonymous?: boolean | null
          is_verified?: boolean | null
          media_profiles?: Json | null
          net_worth_usd?: number | null
          previous_rank?: number | null
          profile_picture_url?: string | null
          profile_views?: number | null
          region?: string
          social_media_handles?: Json | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
          verified_net_worth_fcfa?: number
          wealth_source?: Database["public"]["Enums"]["wealth_source"]
          year_on_year_change?: number | null
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_id: string | null
          blocker_id: string | null
          created_at: string | null
          id: string
        }
        Insert: {
          blocked_id?: string | null
          blocker_id?: string | null
          created_at?: string | null
          id?: string
        }
        Update: {
          blocked_id?: string | null
          blocker_id?: string | null
          created_at?: string | null
          id?: string
        }
        Relationships: []
      }
      brand_ambassador_connections: {
        Row: {
          artist_contact_email: string | null
          artist_contact_phone: string | null
          artist_profile_id: string
          campaign_completed_at: string | null
          campaign_started_at: string | null
          campaign_success: boolean | null
          company_contact_email: string | null
          company_contact_phone: string | null
          contract_signed: boolean | null
          contract_url: string | null
          created_at: string
          final_amount_paid: number | null
          id: string
          request_id: string
          updated_at: string
        }
        Insert: {
          artist_contact_email?: string | null
          artist_contact_phone?: string | null
          artist_profile_id: string
          campaign_completed_at?: string | null
          campaign_started_at?: string | null
          campaign_success?: boolean | null
          company_contact_email?: string | null
          company_contact_phone?: string | null
          contract_signed?: boolean | null
          contract_url?: string | null
          created_at?: string
          final_amount_paid?: number | null
          id?: string
          request_id: string
          updated_at?: string
        }
        Update: {
          artist_contact_email?: string | null
          artist_contact_phone?: string | null
          artist_profile_id?: string
          campaign_completed_at?: string | null
          campaign_started_at?: string | null
          campaign_success?: boolean | null
          company_contact_email?: string | null
          company_contact_phone?: string | null
          contract_signed?: boolean | null
          contract_url?: string | null
          created_at?: string
          final_amount_paid?: number | null
          id?: string
          request_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_ambassador_connections_artist_profile_id_fkey"
            columns: ["artist_profile_id"]
            isOneToOne: false
            referencedRelation: "artist_branding_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_ambassador_connections_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "brand_ambassador_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_ambassador_contracts: {
        Row: {
          contract_type: Database["public"]["Enums"]["contract_type"]
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          template_content: string
          template_name: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          contract_type: Database["public"]["Enums"]["contract_type"]
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          template_content: string
          template_name: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          contract_type?: Database["public"]["Enums"]["contract_type"]
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          template_content?: string
          template_name?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      brand_ambassador_ratings: {
        Row: {
          artist_profile_id: string
          artist_rating: number | null
          artist_review: string | null
          artist_review_public: boolean | null
          company_rating: number | null
          company_review: string | null
          company_review_public: boolean | null
          connection_id: string
          created_at: string
          id: string
        }
        Insert: {
          artist_profile_id: string
          artist_rating?: number | null
          artist_review?: string | null
          artist_review_public?: boolean | null
          company_rating?: number | null
          company_review?: string | null
          company_review_public?: boolean | null
          connection_id: string
          created_at?: string
          id?: string
        }
        Update: {
          artist_profile_id?: string
          artist_rating?: number | null
          artist_review?: string | null
          artist_review_public?: boolean | null
          company_rating?: number | null
          company_review?: string | null
          company_review_public?: boolean | null
          connection_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_ambassador_ratings_artist_profile_id_fkey"
            columns: ["artist_profile_id"]
            isOneToOne: false
            referencedRelation: "artist_branding_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_ambassador_ratings_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "brand_ambassador_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_ambassador_requests: {
        Row: {
          artist_contacted_at: string | null
          artist_profile_id: string
          budget_range_max: number | null
          budget_range_min: number | null
          campaign_description: string
          campaign_duration_weeks: number | null
          campaign_type: Database["public"]["Enums"]["campaign_type"]
          company_description: string | null
          company_email: string
          company_name: string
          company_notified_at: string | null
          company_size: Database["public"]["Enums"]["company_size"]
          company_website: string | null
          connection_fee_fcfa: number
          created_at: string
          expected_deliverables: string[] | null
          id: string
          initial_message: string | null
          payment_intent_id: string | null
          status: Database["public"]["Enums"]["connection_status"]
          target_regions: string[] | null
          updated_at: string
        }
        Insert: {
          artist_contacted_at?: string | null
          artist_profile_id: string
          budget_range_max?: number | null
          budget_range_min?: number | null
          campaign_description: string
          campaign_duration_weeks?: number | null
          campaign_type: Database["public"]["Enums"]["campaign_type"]
          company_description?: string | null
          company_email: string
          company_name: string
          company_notified_at?: string | null
          company_size: Database["public"]["Enums"]["company_size"]
          company_website?: string | null
          connection_fee_fcfa: number
          created_at?: string
          expected_deliverables?: string[] | null
          id?: string
          initial_message?: string | null
          payment_intent_id?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
          target_regions?: string[] | null
          updated_at?: string
        }
        Update: {
          artist_contacted_at?: string | null
          artist_profile_id?: string
          budget_range_max?: number | null
          budget_range_min?: number | null
          campaign_description?: string
          campaign_duration_weeks?: number | null
          campaign_type?: Database["public"]["Enums"]["campaign_type"]
          company_description?: string | null
          company_email?: string
          company_name?: string
          company_notified_at?: string | null
          company_size?: Database["public"]["Enums"]["company_size"]
          company_website?: string | null
          connection_fee_fcfa?: number
          created_at?: string
          expected_deliverables?: string[] | null
          id?: string
          initial_message?: string | null
          payment_intent_id?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
          target_regions?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_ambassador_requests_artist_profile_id_fkey"
            columns: ["artist_profile_id"]
            isOneToOne: false
            referencedRelation: "artist_branding_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          created_by: string
          delivery_completed_at: string | null
          delivery_started_at: string | null
          expires_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          message: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          priority: Database["public"]["Enums"]["notification_priority"] | null
          scheduled_for: string | null
          sent_count: number | null
          target_criteria: Json | null
          target_type: string
          title: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          created_by: string
          delivery_completed_at?: string | null
          delivery_started_at?: string | null
          expires_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          priority?: Database["public"]["Enums"]["notification_priority"] | null
          scheduled_for?: string | null
          sent_count?: number | null
          target_criteria?: Json | null
          target_type: string
          title: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          created_by?: string
          delivery_completed_at?: string | null
          delivery_started_at?: string | null
          expires_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          notification_type?: Database["public"]["Enums"]["notification_type"]
          priority?: Database["public"]["Enums"]["notification_priority"] | null
          scheduled_for?: string | null
          sent_count?: number | null
          target_criteria?: Json | null
          target_type?: string
          title?: string
        }
        Relationships: []
      }
      budget_allocations: {
        Row: {
          allocated_amount: number
          beneficiaries_reached: number | null
          beneficiaries_target: number | null
          budget_year: number
          created_at: string
          execution_percentage: number | null
          id: string
          ministry_department: string
          project_name: string | null
          region: string | null
          sector: string
          spent_amount: number | null
          status: string | null
          transparency_score: number | null
          updated_at: string
        }
        Insert: {
          allocated_amount: number
          beneficiaries_reached?: number | null
          beneficiaries_target?: number | null
          budget_year: number
          created_at?: string
          execution_percentage?: number | null
          id?: string
          ministry_department: string
          project_name?: string | null
          region?: string | null
          sector: string
          spent_amount?: number | null
          status?: string | null
          transparency_score?: number | null
          updated_at?: string
        }
        Update: {
          allocated_amount?: number
          beneficiaries_reached?: number | null
          beneficiaries_target?: number | null
          budget_year?: number
          created_at?: string
          execution_percentage?: number | null
          id?: string
          ministry_department?: string
          project_name?: string | null
          region?: string | null
          sector?: string
          spent_amount?: number | null
          status?: string | null
          transparency_score?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      cache_flush_operations: {
        Row: {
          cache_layers: string[]
          completed_at: string | null
          error_details: Json | null
          id: string
          initiated_by: string | null
          metadata: Json | null
          operation_type: string
          started_at: string | null
          status: string
          success_details: Json | null
        }
        Insert: {
          cache_layers: string[]
          completed_at?: string | null
          error_details?: Json | null
          id?: string
          initiated_by?: string | null
          metadata?: Json | null
          operation_type: string
          started_at?: string | null
          status?: string
          success_details?: Json | null
        }
        Update: {
          cache_layers?: string[]
          completed_at?: string | null
          error_details?: Json | null
          id?: string
          initiated_by?: string | null
          metadata?: Json | null
          operation_type?: string
          started_at?: string | null
          status?: string
          success_details?: Json | null
        }
        Relationships: []
      }
      cache_status_tracking: {
        Row: {
          cache_layer: string
          completed_at: string | null
          error_message: string | null
          id: string
          items_cleared: number | null
          metadata: Json | null
          operation_id: string | null
          size_cleared_mb: number | null
          started_at: string | null
          status: string
        }
        Insert: {
          cache_layer: string
          completed_at?: string | null
          error_message?: string | null
          id?: string
          items_cleared?: number | null
          metadata?: Json | null
          operation_id?: string | null
          size_cleared_mb?: number | null
          started_at?: string | null
          status?: string
        }
        Update: {
          cache_layer?: string
          completed_at?: string | null
          error_message?: string | null
          id?: string
          items_cleared?: number | null
          metadata?: Json | null
          operation_id?: string | null
          size_cleared_mb?: number | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "cache_status_tracking_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "cache_flush_operations"
            referencedColumns: ["id"]
          },
        ]
      }
      cameroon_locations: {
        Row: {
          alternative_names: string[] | null
          city_town: string
          created_at: string | null
          division: string | null
          id: string
          is_major_city: boolean | null
          latitude: number | null
          locality: string | null
          longitude: number | null
          population: number | null
          region: string
          region_code: string | null
          subdivision: string | null
          urban_rural: string | null
        }
        Insert: {
          alternative_names?: string[] | null
          city_town: string
          created_at?: string | null
          division?: string | null
          id?: string
          is_major_city?: boolean | null
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          population?: number | null
          region: string
          region_code?: string | null
          subdivision?: string | null
          urban_rural?: string | null
        }
        Update: {
          alternative_names?: string[] | null
          city_town?: string
          created_at?: string | null
          division?: string | null
          id?: string
          is_major_city?: boolean | null
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          population?: number | null
          region?: string
          region_code?: string | null
          subdivision?: string | null
          urban_rural?: string | null
        }
        Relationships: []
      }
      camerplay_config: {
        Row: {
          config_key: string
          config_value: Json
          id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      camerpulse_activity_timeline: {
        Row: {
          activity_summary: string
          activity_type: string
          confidence_score: number | null
          created_at: string
          details: Json | null
          id: string
          module: string
          performed_by: string | null
          related_component: string | null
          related_entity_id: string | null
          status: string
          timestamp: string
        }
        Insert: {
          activity_summary: string
          activity_type: string
          confidence_score?: number | null
          created_at?: string
          details?: Json | null
          id?: string
          module: string
          performed_by?: string | null
          related_component?: string | null
          related_entity_id?: string | null
          status?: string
          timestamp?: string
        }
        Update: {
          activity_summary?: string
          activity_type?: string
          confidence_score?: number | null
          created_at?: string
          details?: Json | null
          id?: string
          module?: string
          performed_by?: string | null
          related_component?: string | null
          related_entity_id?: string | null
          status?: string
          timestamp?: string
        }
        Relationships: []
      }
      camerpulse_intelligence_alerts: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          affected_regions: string[] | null
          alert_type: string
          auto_generated: boolean | null
          created_at: string
          description: string | null
          id: string
          recommended_actions: string[] | null
          related_content_ids: string[] | null
          sentiment_data: Json | null
          severity: string
          title: string
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          affected_regions?: string[] | null
          alert_type: string
          auto_generated?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          recommended_actions?: string[] | null
          related_content_ids?: string[] | null
          sentiment_data?: Json | null
          severity: string
          title: string
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          affected_regions?: string[] | null
          alert_type?: string
          auto_generated?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          recommended_actions?: string[] | null
          related_content_ids?: string[] | null
          sentiment_data?: Json | null
          severity?: string
          title?: string
        }
        Relationships: []
      }
      camerpulse_intelligence_config: {
        Row: {
          auto_updated: boolean | null
          config_key: string
          config_type: string
          config_value: Json
          created_at: string
          description: string | null
          id: string
          last_evolution_update: string | null
          updated_at: string | null
        }
        Insert: {
          auto_updated?: boolean | null
          config_key: string
          config_type: string
          config_value: Json
          created_at?: string
          description?: string | null
          id?: string
          last_evolution_update?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_updated?: boolean | null
          config_key?: string
          config_type?: string
          config_value?: Json
          created_at?: string
          description?: string | null
          id?: string
          last_evolution_update?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      camerpulse_intelligence_influencers: {
        Row: {
          content_categories: string[] | null
          created_at: string
          credibility_score: number | null
          engagement_rate: number | null
          follower_count: number | null
          handle: string
          id: string
          influence_score: number | null
          last_active_at: string | null
          manipulation_risk: number | null
          platform: string
          political_leaning: string | null
          sentiment_impact: number | null
          updated_at: string | null
        }
        Insert: {
          content_categories?: string[] | null
          created_at?: string
          credibility_score?: number | null
          engagement_rate?: number | null
          follower_count?: number | null
          handle: string
          id?: string
          influence_score?: number | null
          last_active_at?: string | null
          manipulation_risk?: number | null
          platform: string
          political_leaning?: string | null
          sentiment_impact?: number | null
          updated_at?: string | null
        }
        Update: {
          content_categories?: string[] | null
          created_at?: string
          credibility_score?: number | null
          engagement_rate?: number | null
          follower_count?: number | null
          handle?: string
          id?: string
          influence_score?: number | null
          last_active_at?: string | null
          manipulation_risk?: number | null
          platform?: string
          political_leaning?: string | null
          sentiment_impact?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      camerpulse_intelligence_learning_logs: {
        Row: {
          applied_at: string | null
          confidence_improvement: number | null
          created_at: string
          id: string
          input_data: Json
          learning_type: string
          model_adjustment: Json | null
          pattern_identified: string | null
          validation_score: number | null
        }
        Insert: {
          applied_at?: string | null
          confidence_improvement?: number | null
          created_at?: string
          id?: string
          input_data: Json
          learning_type: string
          model_adjustment?: Json | null
          pattern_identified?: string | null
          validation_score?: number | null
        }
        Update: {
          applied_at?: string | null
          confidence_improvement?: number | null
          created_at?: string
          id?: string
          input_data?: Json
          learning_type?: string
          model_adjustment?: Json | null
          pattern_identified?: string | null
          validation_score?: number | null
        }
        Relationships: []
      }
      camerpulse_intelligence_local_sentiment: {
        Row: {
          city_town: string
          content_volume: number | null
          created_at: string | null
          date_recorded: string
          division: string | null
          dominant_emotions: string[] | null
          id: string
          is_major_city: boolean | null
          latitude: number | null
          locality: string | null
          longitude: number | null
          notable_events: string[] | null
          overall_sentiment: number | null
          population_estimate: number | null
          region: string
          sentiment_breakdown: Json | null
          subdivision: string | null
          threat_level: string | null
          top_concerns: string[] | null
          trending_hashtags: string[] | null
          updated_at: string | null
          urban_rural: string | null
        }
        Insert: {
          city_town: string
          content_volume?: number | null
          created_at?: string | null
          date_recorded?: string
          division?: string | null
          dominant_emotions?: string[] | null
          id?: string
          is_major_city?: boolean | null
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          notable_events?: string[] | null
          overall_sentiment?: number | null
          population_estimate?: number | null
          region: string
          sentiment_breakdown?: Json | null
          subdivision?: string | null
          threat_level?: string | null
          top_concerns?: string[] | null
          trending_hashtags?: string[] | null
          updated_at?: string | null
          urban_rural?: string | null
        }
        Update: {
          city_town?: string
          content_volume?: number | null
          created_at?: string | null
          date_recorded?: string
          division?: string | null
          dominant_emotions?: string[] | null
          id?: string
          is_major_city?: boolean | null
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          notable_events?: string[] | null
          overall_sentiment?: number | null
          population_estimate?: number | null
          region?: string
          sentiment_breakdown?: Json | null
          subdivision?: string | null
          threat_level?: string | null
          top_concerns?: string[] | null
          trending_hashtags?: string[] | null
          updated_at?: string | null
          urban_rural?: string | null
        }
        Relationships: []
      }
      camerpulse_intelligence_regional_sentiment: {
        Row: {
          content_volume: number | null
          created_at: string
          date_recorded: string
          dominant_emotions: string[] | null
          id: string
          notable_events: string[] | null
          overall_sentiment: number | null
          region: string
          sentiment_breakdown: Json | null
          threat_level: string | null
          top_concerns: string[] | null
          trending_hashtags: string[] | null
        }
        Insert: {
          content_volume?: number | null
          created_at?: string
          date_recorded?: string
          dominant_emotions?: string[] | null
          id?: string
          notable_events?: string[] | null
          overall_sentiment?: number | null
          region: string
          sentiment_breakdown?: Json | null
          threat_level?: string | null
          top_concerns?: string[] | null
          trending_hashtags?: string[] | null
        }
        Update: {
          content_volume?: number | null
          created_at?: string
          date_recorded?: string
          dominant_emotions?: string[] | null
          id?: string
          notable_events?: string[] | null
          overall_sentiment?: number | null
          region?: string
          sentiment_breakdown?: Json | null
          threat_level?: string | null
          top_concerns?: string[] | null
          trending_hashtags?: string[] | null
        }
        Relationships: []
      }
      camerpulse_intelligence_sentiment_logs: {
        Row: {
          audio_emotion_analysis: Json | null
          audio_transcript: string | null
          author_handle: string | null
          author_influence_score: number | null
          city_detected: string | null
          confidence_score: number | null
          content_category: string[] | null
          content_id: string | null
          content_text: string
          coordinates: Json | null
          created_at: string
          emotional_tone: string[] | null
          engagement_metrics: Json | null
          facial_emotion_scores: Json | null
          flagged_for_review: boolean | null
          hashtags: string[] | null
          id: string
          keywords_detected: string[] | null
          language_detected: string | null
          locality_detected: string | null
          media_metadata: Json | null
          media_type: string | null
          media_url: string | null
          mentions: string[] | null
          multimodal_confidence: number | null
          platform: string
          processed_at: string | null
          region_detected: string | null
          sentiment_polarity: string
          sentiment_score: number | null
          subdivision_detected: string | null
          threat_level: string | null
          visual_emotions: Json | null
        }
        Insert: {
          audio_emotion_analysis?: Json | null
          audio_transcript?: string | null
          author_handle?: string | null
          author_influence_score?: number | null
          city_detected?: string | null
          confidence_score?: number | null
          content_category?: string[] | null
          content_id?: string | null
          content_text: string
          coordinates?: Json | null
          created_at?: string
          emotional_tone?: string[] | null
          engagement_metrics?: Json | null
          facial_emotion_scores?: Json | null
          flagged_for_review?: boolean | null
          hashtags?: string[] | null
          id?: string
          keywords_detected?: string[] | null
          language_detected?: string | null
          locality_detected?: string | null
          media_metadata?: Json | null
          media_type?: string | null
          media_url?: string | null
          mentions?: string[] | null
          multimodal_confidence?: number | null
          platform: string
          processed_at?: string | null
          region_detected?: string | null
          sentiment_polarity: string
          sentiment_score?: number | null
          subdivision_detected?: string | null
          threat_level?: string | null
          visual_emotions?: Json | null
        }
        Update: {
          audio_emotion_analysis?: Json | null
          audio_transcript?: string | null
          author_handle?: string | null
          author_influence_score?: number | null
          city_detected?: string | null
          confidence_score?: number | null
          content_category?: string[] | null
          content_id?: string | null
          content_text?: string
          coordinates?: Json | null
          created_at?: string
          emotional_tone?: string[] | null
          engagement_metrics?: Json | null
          facial_emotion_scores?: Json | null
          flagged_for_review?: boolean | null
          hashtags?: string[] | null
          id?: string
          keywords_detected?: string[] | null
          language_detected?: string | null
          locality_detected?: string | null
          media_metadata?: Json | null
          media_type?: string | null
          media_url?: string | null
          mentions?: string[] | null
          multimodal_confidence?: number | null
          platform?: string
          processed_at?: string | null
          region_detected?: string | null
          sentiment_polarity?: string
          sentiment_score?: number | null
          subdivision_detected?: string | null
          threat_level?: string | null
          visual_emotions?: Json | null
        }
        Relationships: []
      }
      camerpulse_intelligence_trending_topics: {
        Row: {
          category: string | null
          emotional_breakdown: Json | null
          first_detected_at: string
          growth_rate: number | null
          id: string
          influencer_mentions: string[] | null
          last_updated_at: string | null
          platform_breakdown: Json | null
          regional_breakdown: Json | null
          related_hashtags: string[] | null
          sentiment_score: number | null
          threat_indicators: boolean | null
          topic_text: string
          trend_status: string | null
          volume_score: number | null
        }
        Insert: {
          category?: string | null
          emotional_breakdown?: Json | null
          first_detected_at?: string
          growth_rate?: number | null
          id?: string
          influencer_mentions?: string[] | null
          last_updated_at?: string | null
          platform_breakdown?: Json | null
          regional_breakdown?: Json | null
          related_hashtags?: string[] | null
          sentiment_score?: number | null
          threat_indicators?: boolean | null
          topic_text: string
          trend_status?: string | null
          volume_score?: number | null
        }
        Update: {
          category?: string | null
          emotional_breakdown?: Json | null
          first_detected_at?: string
          growth_rate?: number | null
          id?: string
          influencer_mentions?: string[] | null
          last_updated_at?: string | null
          platform_breakdown?: Json | null
          regional_breakdown?: Json | null
          related_hashtags?: string[] | null
          sentiment_score?: number | null
          threat_indicators?: boolean | null
          topic_text?: string
          trend_status?: string | null
          volume_score?: number | null
        }
        Relationships: []
      }
      camerpulse_module_registry: {
        Row: {
          component_type: string
          created_at: string
          error_count: number | null
          file_path: string
          health_status: string
          id: string
          last_error_at: string | null
          last_health_check: string | null
          metadata: Json | null
          module_id: string
          module_name: string
          monitoring_enabled: boolean | null
          route_path: string | null
          updated_at: string
        }
        Insert: {
          component_type?: string
          created_at?: string
          error_count?: number | null
          file_path: string
          health_status?: string
          id?: string
          last_error_at?: string | null
          last_health_check?: string | null
          metadata?: Json | null
          module_id: string
          module_name: string
          monitoring_enabled?: boolean | null
          route_path?: string | null
          updated_at?: string
        }
        Update: {
          component_type?: string
          created_at?: string
          error_count?: number | null
          file_path?: string
          health_status?: string
          id?: string
          last_error_at?: string | null
          last_health_check?: string | null
          metadata?: Json | null
          module_id?: string
          module_name?: string
          monitoring_enabled?: boolean | null
          route_path?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      camerpulse_simulation_tests: {
        Row: {
          created_at: string
          error_details: Json | null
          executed_at: string | null
          execution_time_ms: number | null
          id: string
          scheduled: boolean | null
          screenshot_url: string | null
          success_metrics: Json | null
          target_module: string
          test_name: string
          test_result: string
          test_scenario: Json
          test_type: string
        }
        Insert: {
          created_at?: string
          error_details?: Json | null
          executed_at?: string | null
          execution_time_ms?: number | null
          id?: string
          scheduled?: boolean | null
          screenshot_url?: string | null
          success_metrics?: Json | null
          target_module: string
          test_name: string
          test_result?: string
          test_scenario: Json
          test_type: string
        }
        Update: {
          created_at?: string
          error_details?: Json | null
          executed_at?: string | null
          execution_time_ms?: number | null
          id?: string
          scheduled?: boolean | null
          screenshot_url?: string | null
          success_metrics?: Json | null
          target_module?: string
          test_name?: string
          test_result?: string
          test_scenario?: Json
          test_type?: string
        }
        Relationships: []
      }
      camerpulse_watchdog_logs: {
        Row: {
          admin_notified: boolean | null
          auto_repaired: boolean | null
          created_at: string
          error_details: Json | null
          event_message: string
          event_type: string
          fix_attempted: boolean | null
          fix_confidence_score: number | null
          fix_success: boolean | null
          id: string
          metadata: Json | null
          module_id: string
          severity: string
        }
        Insert: {
          admin_notified?: boolean | null
          auto_repaired?: boolean | null
          created_at?: string
          error_details?: Json | null
          event_message: string
          event_type: string
          fix_attempted?: boolean | null
          fix_confidence_score?: number | null
          fix_success?: boolean | null
          id?: string
          metadata?: Json | null
          module_id: string
          severity?: string
        }
        Update: {
          admin_notified?: boolean | null
          auto_repaired?: boolean | null
          created_at?: string
          error_details?: Json | null
          event_message?: string
          event_type?: string
          fix_attempted?: boolean | null
          fix_confidence_score?: number | null
          fix_success?: boolean | null
          id?: string
          metadata?: Json | null
          module_id?: string
          severity?: string
        }
        Relationships: []
      }
      certificate_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          preview_url: string | null
          template_config: Json
          template_name: string
          template_type: Database["public"]["Enums"]["certificate_template"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          preview_url?: string | null
          template_config?: Json
          template_name: string
          template_type: Database["public"]["Enums"]["certificate_template"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          preview_url?: string | null
          template_config?: Json
          template_name?: string
          template_type?: Database["public"]["Enums"]["certificate_template"]
          updated_at?: string | null
        }
        Relationships: []
      }
      certificate_verification_logs: {
        Row: {
          certificate_id: string | null
          id: string
          is_valid: boolean | null
          verification_code: string
          verified_at: string | null
          verifier_ip: unknown | null
          verifier_user_agent: string | null
        }
        Insert: {
          certificate_id?: string | null
          id?: string
          is_valid?: boolean | null
          verification_code: string
          verified_at?: string | null
          verifier_ip?: unknown | null
          verifier_user_agent?: string | null
        }
        Update: {
          certificate_id?: string | null
          id?: string
          is_valid?: boolean | null
          verification_code?: string
          verified_at?: string | null
          verifier_ip?: unknown | null
          verifier_user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificate_verification_logs_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "event_certificates"
            referencedColumns: ["id"]
          },
        ]
      }
      civic_achievements: {
        Row: {
          achievement_description: string | null
          achievement_title: string
          achievement_type: string
          awarded_at: string
          badge_icon_url: string | null
          certification_code: string | null
          created_at: string
          criteria_met: Json | null
          expires_at: string | null
          id: string
          is_certification: boolean
          points_awarded: number
          user_id: string
        }
        Insert: {
          achievement_description?: string | null
          achievement_title: string
          achievement_type: string
          awarded_at?: string
          badge_icon_url?: string | null
          certification_code?: string | null
          created_at?: string
          criteria_met?: Json | null
          expires_at?: string | null
          id?: string
          is_certification?: boolean
          points_awarded?: number
          user_id: string
        }
        Update: {
          achievement_description?: string | null
          achievement_title?: string
          achievement_type?: string
          awarded_at?: string
          badge_icon_url?: string | null
          certification_code?: string | null
          created_at?: string
          criteria_met?: Json | null
          expires_at?: string | null
          id?: string
          is_certification?: boolean
          points_awarded?: number
          user_id?: string
        }
        Relationships: []
      }
      civic_alerts: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          priority: string
          regions: string[] | null
          sender_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          priority: string
          regions?: string[] | null
          sender_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          priority?: string
          regions?: string[] | null
          sender_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      civic_campaign_templates: {
        Row: {
          content_template: Json
          created_at: string
          created_by: string | null
          customization_options: Json | null
          engagement_metrics: Json | null
          id: string
          is_approved: boolean
          platform: string | null
          success_stories: Json | null
          target_audience: string
          template_name: string
          template_type: string
          updated_at: string
        }
        Insert: {
          content_template: Json
          created_at?: string
          created_by?: string | null
          customization_options?: Json | null
          engagement_metrics?: Json | null
          id?: string
          is_approved?: boolean
          platform?: string | null
          success_stories?: Json | null
          target_audience: string
          template_name: string
          template_type: string
          updated_at?: string
        }
        Update: {
          content_template?: Json
          created_at?: string
          created_by?: string | null
          customization_options?: Json | null
          engagement_metrics?: Json | null
          id?: string
          is_approved?: boolean
          platform?: string | null
          success_stories?: Json | null
          target_audience?: string
          template_name?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      civic_complaints: {
        Row: {
          complaint_type: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          region: string
          related_polls: string[] | null
          reported_by: string | null
          sentiment_score: number | null
          severity_level: string
          title: string
          trending_score: number | null
          updated_at: string
          verified_status: string
        }
        Insert: {
          complaint_type: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          region: string
          related_polls?: string[] | null
          reported_by?: string | null
          sentiment_score?: number | null
          severity_level?: string
          title: string
          trending_score?: number | null
          updated_at?: string
          verified_status?: string
        }
        Update: {
          complaint_type?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          region?: string
          related_polls?: string[] | null
          reported_by?: string | null
          sentiment_score?: number | null
          severity_level?: string
          title?: string
          trending_score?: number | null
          updated_at?: string
          verified_status?: string
        }
        Relationships: []
      }
      civic_content_interactions: {
        Row: {
          comment_text: string | null
          content_id: string
          created_at: string
          id: string
          interaction_data: Json | null
          interaction_type: string
          rating: number | null
          user_id: string
        }
        Insert: {
          comment_text?: string | null
          content_id: string
          created_at?: string
          id?: string
          interaction_data?: Json | null
          interaction_type: string
          rating?: number | null
          user_id: string
        }
        Update: {
          comment_text?: string | null
          content_id?: string
          created_at?: string
          id?: string
          interaction_data?: Json | null
          interaction_type?: string
          rating?: number | null
          user_id?: string
        }
        Relationships: []
      }
      civic_content_monitoring: {
        Row: {
          ai_analysis: Json | null
          author: string | null
          content_preview: string | null
          created_at: string
          credibility_score: number | null
          id: string
          importance_score: number | null
          mentions_entities: string[] | null
          metadata: Json | null
          processed: boolean | null
          publication: string | null
          published_at: string | null
          sentiment_score: number | null
          source_type: Database["public"]["Enums"]["source_type"] | null
          source_url: string
          title: string
          topic_categories: string[] | null
        }
        Insert: {
          ai_analysis?: Json | null
          author?: string | null
          content_preview?: string | null
          created_at?: string
          credibility_score?: number | null
          id?: string
          importance_score?: number | null
          mentions_entities?: string[] | null
          metadata?: Json | null
          processed?: boolean | null
          publication?: string | null
          published_at?: string | null
          sentiment_score?: number | null
          source_type?: Database["public"]["Enums"]["source_type"] | null
          source_url: string
          title: string
          topic_categories?: string[] | null
        }
        Update: {
          ai_analysis?: Json | null
          author?: string | null
          content_preview?: string | null
          created_at?: string
          credibility_score?: number | null
          id?: string
          importance_score?: number | null
          mentions_entities?: string[] | null
          metadata?: Json | null
          processed?: boolean | null
          publication?: string | null
          published_at?: string | null
          sentiment_score?: number | null
          source_type?: Database["public"]["Enums"]["source_type"] | null
          source_url?: string
          title?: string
          topic_categories?: string[] | null
        }
        Relationships: []
      }
      civic_crawl_data: {
        Row: {
          content_hash: string | null
          created_at: string
          entities_extracted: string[] | null
          extracted_data: Json | null
          id: string
          page_title: string | null
          processed: boolean | null
          processing_errors: string[] | null
          raw_content: string | null
          session_id: string
          source_url: string
        }
        Insert: {
          content_hash?: string | null
          created_at?: string
          entities_extracted?: string[] | null
          extracted_data?: Json | null
          id?: string
          page_title?: string | null
          processed?: boolean | null
          processing_errors?: string[] | null
          raw_content?: string | null
          session_id: string
          source_url: string
        }
        Update: {
          content_hash?: string | null
          created_at?: string
          entities_extracted?: string[] | null
          extracted_data?: Json | null
          id?: string
          page_title?: string | null
          processed?: boolean | null
          processing_errors?: string[] | null
          raw_content?: string | null
          session_id?: string
          source_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "civic_crawl_data_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "civic_crawl_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      civic_crawl_sessions: {
        Row: {
          completed_at: string | null
          crawler_version: string | null
          created_at: string
          duration_seconds: number | null
          entities_created: number | null
          entities_found: number | null
          entities_updated: number | null
          error_message: string | null
          id: string
          metadata: Json | null
          pages_crawled: number | null
          source_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["crawl_status"]
          warnings: string[] | null
        }
        Insert: {
          completed_at?: string | null
          crawler_version?: string | null
          created_at?: string
          duration_seconds?: number | null
          entities_created?: number | null
          entities_found?: number | null
          entities_updated?: number | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          pages_crawled?: number | null
          source_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["crawl_status"]
          warnings?: string[] | null
        }
        Update: {
          completed_at?: string | null
          crawler_version?: string | null
          created_at?: string
          duration_seconds?: number | null
          entities_created?: number | null
          entities_found?: number | null
          entities_updated?: number | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          pages_crawled?: number | null
          source_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["crawl_status"]
          warnings?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "civic_crawl_sessions_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "civic_crawl_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      civic_crawl_sources: {
        Row: {
          auth_config: Json | null
          avg_crawl_duration_seconds: number | null
          base_url: string
          content_filters: Json | null
          crawl_frequency_hours: number | null
          crawl_selectors: Json | null
          created_at: string
          entity_extraction_rules: Json | null
          id: string
          is_active: boolean | null
          last_crawl_at: string | null
          last_successful_crawl_at: string | null
          max_pages_per_crawl: number | null
          rate_limit_seconds: number | null
          requires_auth: boolean | null
          source_name: string
          source_type: Database["public"]["Enums"]["source_type"]
          total_crawls: number | null
          total_entities_found: number | null
          updated_at: string
        }
        Insert: {
          auth_config?: Json | null
          avg_crawl_duration_seconds?: number | null
          base_url: string
          content_filters?: Json | null
          crawl_frequency_hours?: number | null
          crawl_selectors?: Json | null
          created_at?: string
          entity_extraction_rules?: Json | null
          id?: string
          is_active?: boolean | null
          last_crawl_at?: string | null
          last_successful_crawl_at?: string | null
          max_pages_per_crawl?: number | null
          rate_limit_seconds?: number | null
          requires_auth?: boolean | null
          source_name: string
          source_type: Database["public"]["Enums"]["source_type"]
          total_crawls?: number | null
          total_entities_found?: number | null
          updated_at?: string
        }
        Update: {
          auth_config?: Json | null
          avg_crawl_duration_seconds?: number | null
          base_url?: string
          content_filters?: Json | null
          crawl_frequency_hours?: number | null
          crawl_selectors?: Json | null
          created_at?: string
          entity_extraction_rules?: Json | null
          id?: string
          is_active?: boolean | null
          last_crawl_at?: string | null
          last_successful_crawl_at?: string | null
          max_pages_per_crawl?: number | null
          rate_limit_seconds?: number | null
          requires_auth?: boolean | null
          source_name?: string
          source_type?: Database["public"]["Enums"]["source_type"]
          total_crawls?: number | null
          total_entities_found?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      civic_education_content: {
        Row: {
          author_id: string | null
          author_name: string | null
          average_rating: number | null
          categories: string[] | null
          completion_rate: number | null
          content_body: string | null
          content_type: Database["public"]["Enums"]["education_content_type"]
          content_url: string | null
          created_at: string
          difficulty_level: Database["public"]["Enums"]["education_difficulty"]
          duration_minutes: number | null
          id: string
          is_active: boolean
          is_featured: boolean
          is_verified: boolean
          learning_objectives: string[] | null
          like_count: number
          metadata: Json | null
          prerequisites: string[] | null
          published_at: string | null
          share_count: number
          source_organization: string | null
          summary: string | null
          tags: string[] | null
          target_audience: string[] | null
          thumbnail_url: string | null
          title: string
          total_ratings: number
          updated_at: string
          view_count: number
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          average_rating?: number | null
          categories?: string[] | null
          completion_rate?: number | null
          content_body?: string | null
          content_type: Database["public"]["Enums"]["education_content_type"]
          content_url?: string | null
          created_at?: string
          difficulty_level?: Database["public"]["Enums"]["education_difficulty"]
          duration_minutes?: number | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          is_verified?: boolean
          learning_objectives?: string[] | null
          like_count?: number
          metadata?: Json | null
          prerequisites?: string[] | null
          published_at?: string | null
          share_count?: number
          source_organization?: string | null
          summary?: string | null
          tags?: string[] | null
          target_audience?: string[] | null
          thumbnail_url?: string | null
          title: string
          total_ratings?: number
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          average_rating?: number | null
          categories?: string[] | null
          completion_rate?: number | null
          content_body?: string | null
          content_type?: Database["public"]["Enums"]["education_content_type"]
          content_url?: string | null
          created_at?: string
          difficulty_level?: Database["public"]["Enums"]["education_difficulty"]
          duration_minutes?: number | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          is_verified?: boolean
          learning_objectives?: string[] | null
          like_count?: number
          metadata?: Json | null
          prerequisites?: string[] | null
          published_at?: string | null
          share_count?: number
          source_organization?: string | null
          summary?: string | null
          tags?: string[] | null
          target_audience?: string[] | null
          thumbnail_url?: string | null
          title?: string
          total_ratings?: number
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      civic_education_quizzes: {
        Row: {
          attempt_count: number
          average_score: number | null
          content_id: string | null
          correct_answers: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          max_attempts: number | null
          passing_score: number
          questions: Json
          randomize_questions: boolean
          show_correct_answers: boolean
          time_limit_minutes: number | null
          title: string
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          average_score?: number | null
          content_id?: string | null
          correct_answers?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_attempts?: number | null
          passing_score?: number
          questions?: Json
          randomize_questions?: boolean
          show_correct_answers?: boolean
          time_limit_minutes?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          average_score?: number | null
          content_id?: string | null
          correct_answers?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_attempts?: number | null
          passing_score?: number
          questions?: Json
          randomize_questions?: boolean
          show_correct_answers?: boolean
          time_limit_minutes?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      civic_entity_ratings: {
        Row: {
          comment: string | null
          created_at: string
          engagement_rating: number | null
          entity_id: string
          entity_name: string
          entity_type: Database["public"]["Enums"]["civic_entity_type"]
          id: string
          ip_address: unknown | null
          is_verified: boolean
          overall_rating: number
          performance_rating: number | null
          region: string | null
          transparency_rating: number | null
          updated_at: string
          user_id: string
          verified_by: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          engagement_rating?: number | null
          entity_id: string
          entity_name: string
          entity_type: Database["public"]["Enums"]["civic_entity_type"]
          id?: string
          ip_address?: unknown | null
          is_verified?: boolean
          overall_rating: number
          performance_rating?: number | null
          region?: string | null
          transparency_rating?: number | null
          updated_at?: string
          user_id: string
          verified_by?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          engagement_rating?: number | null
          entity_id?: string
          entity_name?: string
          entity_type?: Database["public"]["Enums"]["civic_entity_type"]
          id?: string
          ip_address?: unknown | null
          is_verified?: boolean
          overall_rating?: number
          performance_rating?: number | null
          region?: string | null
          transparency_rating?: number | null
          updated_at?: string
          user_id?: string
          verified_by?: string | null
        }
        Relationships: []
      }
      civic_entity_relationships: {
        Row: {
          confidence_score: number | null
          created_at: string
          end_date: string | null
          from_entity_id: string
          id: string
          is_current: boolean | null
          metadata: Json | null
          relationship_type: string
          source_url: string | null
          start_date: string | null
          to_entity_id: string
          updated_at: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          end_date?: string | null
          from_entity_id: string
          id?: string
          is_current?: boolean | null
          metadata?: Json | null
          relationship_type: string
          source_url?: string | null
          start_date?: string | null
          to_entity_id: string
          updated_at?: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          end_date?: string | null
          from_entity_id?: string
          id?: string
          is_current?: boolean | null
          metadata?: Json | null
          relationship_type?: string
          source_url?: string | null
          start_date?: string | null
          to_entity_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "civic_entity_relationships_from_entity_id_fkey"
            columns: ["from_entity_id"]
            isOneToOne: false
            referencedRelation: "civic_knowledge_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "civic_entity_relationships_to_entity_id_fkey"
            columns: ["to_entity_id"]
            isOneToOne: false
            referencedRelation: "civic_knowledge_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      civic_entity_verifications: {
        Row: {
          confidence_score: number
          created_at: string
          entity_id: string
          field_name: string
          id: string
          metadata: Json | null
          previous_value: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          verification_method: string | null
          verification_source: string
          verified_at: string
          verified_by: string | null
          verified_value: string | null
        }
        Insert: {
          confidence_score: number
          created_at?: string
          entity_id: string
          field_name: string
          id?: string
          metadata?: Json | null
          previous_value?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          verification_method?: string | null
          verification_source: string
          verified_at?: string
          verified_by?: string | null
          verified_value?: string | null
        }
        Update: {
          confidence_score?: number
          created_at?: string
          entity_id?: string
          field_name?: string
          id?: string
          metadata?: Json | null
          previous_value?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          verification_method?: string | null
          verification_source?: string
          verified_at?: string
          verified_by?: string | null
          verified_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "civic_entity_verifications_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "civic_knowledge_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      civic_event_analytics: {
        Row: {
          age_breakdown: Json | null
          civic_reach_score: number | null
          created_at: string
          date_recorded: string
          engagement_score: number | null
          event_id: string
          gender_breakdown: Json | null
          id: string
          region_breakdown: Json | null
          rsvp_breakdown: Json | null
          total_rsvps: number | null
          total_shares: number | null
          total_views: number | null
        }
        Insert: {
          age_breakdown?: Json | null
          civic_reach_score?: number | null
          created_at?: string
          date_recorded?: string
          engagement_score?: number | null
          event_id: string
          gender_breakdown?: Json | null
          id?: string
          region_breakdown?: Json | null
          rsvp_breakdown?: Json | null
          total_rsvps?: number | null
          total_shares?: number | null
          total_views?: number | null
        }
        Update: {
          age_breakdown?: Json | null
          civic_reach_score?: number | null
          created_at?: string
          date_recorded?: string
          engagement_score?: number | null
          event_id?: string
          gender_breakdown?: Json | null
          id?: string
          region_breakdown?: Json | null
          rsvp_breakdown?: Json | null
          total_rsvps?: number | null
          total_shares?: number | null
          total_views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "civic_event_analytics_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "civic_events"
            referencedColumns: ["id"]
          },
        ]
      }
      civic_event_checkins: {
        Row: {
          check_in_method: string | null
          check_in_time: string
          event_id: string
          id: string
          location_lat: number | null
          location_lng: number | null
          notes: string | null
          rsvp_id: string | null
          user_id: string
          verified_by: string | null
        }
        Insert: {
          check_in_method?: string | null
          check_in_time?: string
          event_id: string
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          notes?: string | null
          rsvp_id?: string | null
          user_id: string
          verified_by?: string | null
        }
        Update: {
          check_in_method?: string | null
          check_in_time?: string
          event_id?: string
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          notes?: string | null
          rsvp_id?: string | null
          user_id?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "civic_event_checkins_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "civic_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "civic_event_checkins_rsvp_id_fkey"
            columns: ["rsvp_id"]
            isOneToOne: false
            referencedRelation: "event_rsvps"
            referencedColumns: ["id"]
          },
        ]
      }
      civic_event_templates: {
        Row: {
          created_at: string
          created_by: string | null
          default_duration_hours: number | null
          default_severity: string
          event_category: string
          event_type: string
          expected_emotions: string[] | null
          id: string
          is_active: boolean | null
          template_description: string | null
          template_metadata: Json | null
          template_name: string
          typical_regions: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          default_duration_hours?: number | null
          default_severity?: string
          event_category: string
          event_type: string
          expected_emotions?: string[] | null
          id?: string
          is_active?: boolean | null
          template_description?: string | null
          template_metadata?: Json | null
          template_name: string
          typical_regions?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          default_duration_hours?: number | null
          default_severity?: string
          event_category?: string
          event_type?: string
          expected_emotions?: string[] | null
          id?: string
          is_active?: boolean | null
          template_description?: string | null
          template_metadata?: Json | null
          template_name?: string
          typical_regions?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      civic_events: {
        Row: {
          allow_rsvp: boolean | null
          civic_impact_score: number | null
          civic_tags: string[] | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          custom_fields: Json | null
          description: string | null
          end_date: string | null
          event_type: Database["public"]["Enums"]["civic_event_type"]
          expected_officials: string[] | null
          expected_parties: string[] | null
          external_links: Json | null
          flagged_count: number | null
          gallery_images: string[] | null
          google_maps_link: string | null
          id: string
          is_civic_official: boolean | null
          is_featured: boolean | null
          last_modified_by: string | null
          latitude: number | null
          livestream_url: string | null
          longitude: number | null
          max_attendees: number | null
          moderation_status: string | null
          name: string
          organizer_id: string
          organizer_type: Database["public"]["Enums"]["organizer_type"]
          organizer_verified: boolean | null
          region: string
          requires_approval: boolean | null
          share_count: number | null
          short_description: string | null
          start_date: string
          status: Database["public"]["Enums"]["event_status"] | null
          subregion: string | null
          tags: string[] | null
          timezone: string | null
          updated_at: string
          venue_address: string | null
          venue_name: string | null
          view_count: number | null
        }
        Insert: {
          allow_rsvp?: boolean | null
          civic_impact_score?: number | null
          civic_tags?: string[] | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          custom_fields?: Json | null
          description?: string | null
          end_date?: string | null
          event_type: Database["public"]["Enums"]["civic_event_type"]
          expected_officials?: string[] | null
          expected_parties?: string[] | null
          external_links?: Json | null
          flagged_count?: number | null
          gallery_images?: string[] | null
          google_maps_link?: string | null
          id?: string
          is_civic_official?: boolean | null
          is_featured?: boolean | null
          last_modified_by?: string | null
          latitude?: number | null
          livestream_url?: string | null
          longitude?: number | null
          max_attendees?: number | null
          moderation_status?: string | null
          name: string
          organizer_id: string
          organizer_type: Database["public"]["Enums"]["organizer_type"]
          organizer_verified?: boolean | null
          region: string
          requires_approval?: boolean | null
          share_count?: number | null
          short_description?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["event_status"] | null
          subregion?: string | null
          tags?: string[] | null
          timezone?: string | null
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
          view_count?: number | null
        }
        Update: {
          allow_rsvp?: boolean | null
          civic_impact_score?: number | null
          civic_tags?: string[] | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          custom_fields?: Json | null
          description?: string | null
          end_date?: string | null
          event_type?: Database["public"]["Enums"]["civic_event_type"]
          expected_officials?: string[] | null
          expected_parties?: string[] | null
          external_links?: Json | null
          flagged_count?: number | null
          gallery_images?: string[] | null
          google_maps_link?: string | null
          id?: string
          is_civic_official?: boolean | null
          is_featured?: boolean | null
          last_modified_by?: string | null
          latitude?: number | null
          livestream_url?: string | null
          longitude?: number | null
          max_attendees?: number | null
          moderation_status?: string | null
          name?: string
          organizer_id?: string
          organizer_type?: Database["public"]["Enums"]["organizer_type"]
          organizer_verified?: boolean | null
          region?: string
          requires_approval?: boolean | null
          share_count?: number | null
          short_description?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["event_status"] | null
          subregion?: string | null
          tags?: string[] | null
          timezone?: string | null
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      civic_fusion_alerts: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          affected_regions: string[] | null
          alert_message: string
          alert_severity: string
          alert_title: string
          alert_type: string
          auto_generated: boolean | null
          baseline_comparison: number | null
          civic_event_id: string
          correlation_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          recommended_actions: string[] | null
          resolved: boolean | null
          resolved_at: string | null
          threshold_exceeded: number | null
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          affected_regions?: string[] | null
          alert_message: string
          alert_severity: string
          alert_title: string
          alert_type: string
          auto_generated?: boolean | null
          baseline_comparison?: number | null
          civic_event_id: string
          correlation_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          recommended_actions?: string[] | null
          resolved?: boolean | null
          resolved_at?: string | null
          threshold_exceeded?: number | null
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          affected_regions?: string[] | null
          alert_message?: string
          alert_severity?: string
          alert_title?: string
          alert_type?: string
          auto_generated?: boolean | null
          baseline_comparison?: number | null
          civic_event_id?: string
          correlation_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          recommended_actions?: string[] | null
          resolved?: boolean | null
          resolved_at?: string | null
          threshold_exceeded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "civic_fusion_alerts_civic_event_id_fkey"
            columns: ["civic_event_id"]
            isOneToOne: false
            referencedRelation: "civic_fusion_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "civic_fusion_alerts_correlation_id_fkey"
            columns: ["correlation_id"]
            isOneToOne: false
            referencedRelation: "civic_fusion_correlations"
            referencedColumns: ["id"]
          },
        ]
      }
      civic_fusion_correlations: {
        Row: {
          analysis_date: string
          analysis_insights: Json | null
          anomaly_detected: boolean | null
          anomaly_severity: string | null
          baseline_emotion_score: number | null
          civic_event_id: string
          compared_to_historical: boolean | null
          confidence_score: number
          correlation_strength: number
          correlation_timeframe: string
          created_at: string
          dominant_emotion: string
          emotion_shift_intensity: number
          emotion_timeline: Json | null
          historical_baseline: number | null
          id: string
          key_phrases: string[] | null
          peak_emotion_score: number | null
          platforms_analyzed: string[] | null
          regions_analyzed: string[] | null
          sentiment_volume: number | null
          trending_hashtags: string[] | null
        }
        Insert: {
          analysis_date?: string
          analysis_insights?: Json | null
          anomaly_detected?: boolean | null
          anomaly_severity?: string | null
          baseline_emotion_score?: number | null
          civic_event_id: string
          compared_to_historical?: boolean | null
          confidence_score?: number
          correlation_strength?: number
          correlation_timeframe?: string
          created_at?: string
          dominant_emotion: string
          emotion_shift_intensity?: number
          emotion_timeline?: Json | null
          historical_baseline?: number | null
          id?: string
          key_phrases?: string[] | null
          peak_emotion_score?: number | null
          platforms_analyzed?: string[] | null
          regions_analyzed?: string[] | null
          sentiment_volume?: number | null
          trending_hashtags?: string[] | null
        }
        Update: {
          analysis_date?: string
          analysis_insights?: Json | null
          anomaly_detected?: boolean | null
          anomaly_severity?: string | null
          baseline_emotion_score?: number | null
          civic_event_id?: string
          compared_to_historical?: boolean | null
          confidence_score?: number
          correlation_strength?: number
          correlation_timeframe?: string
          created_at?: string
          dominant_emotion?: string
          emotion_shift_intensity?: number
          emotion_timeline?: Json | null
          historical_baseline?: number | null
          id?: string
          key_phrases?: string[] | null
          peak_emotion_score?: number | null
          platforms_analyzed?: string[] | null
          regions_analyzed?: string[] | null
          sentiment_volume?: number | null
          trending_hashtags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "civic_fusion_correlations_civic_event_id_fkey"
            columns: ["civic_event_id"]
            isOneToOne: false
            referencedRelation: "civic_fusion_events"
            referencedColumns: ["id"]
          },
        ]
      }
      civic_fusion_events: {
        Row: {
          created_at: string
          created_by: string | null
          event_category: string
          event_date: string
          event_description: string | null
          event_duration_hours: number | null
          event_title: string
          event_type: string
          government_level: string
          id: string
          metadata: Json | null
          participants: string[] | null
          regions_affected: string[] | null
          severity_level: string
          source_type: string
          source_url: string | null
          tags: string[] | null
          updated_at: string
          verification_status: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          event_category: string
          event_date: string
          event_description?: string | null
          event_duration_hours?: number | null
          event_title: string
          event_type: string
          government_level?: string
          id?: string
          metadata?: Json | null
          participants?: string[] | null
          regions_affected?: string[] | null
          severity_level?: string
          source_type?: string
          source_url?: string | null
          tags?: string[] | null
          updated_at?: string
          verification_status?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          event_category?: string
          event_date?: string
          event_description?: string | null
          event_duration_hours?: number | null
          event_title?: string
          event_type?: string
          government_level?: string
          id?: string
          metadata?: Json | null
          participants?: string[] | null
          regions_affected?: string[] | null
          severity_level?: string
          source_type?: string
          source_url?: string | null
          tags?: string[] | null
          updated_at?: string
          verification_status?: string
        }
        Relationships: []
      }
      civic_intelligence_missions: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string
          data_sources: string[] | null
          execution_duration_seconds: number | null
          id: string
          is_autonomous: boolean
          is_public: boolean
          metadata: Json
          mission_objective: string
          mission_prompt: string
          mission_title: string
          mission_type: string
          output_type: string
          priority_level: string
          regions: string[] | null
          started_at: string | null
          status: string
          target_entities: string[] | null
          timeframe_end: string | null
          timeframe_start: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by: string
          data_sources?: string[] | null
          execution_duration_seconds?: number | null
          id?: string
          is_autonomous?: boolean
          is_public?: boolean
          metadata?: Json
          mission_objective: string
          mission_prompt: string
          mission_title: string
          mission_type?: string
          output_type?: string
          priority_level?: string
          regions?: string[] | null
          started_at?: string | null
          status?: string
          target_entities?: string[] | null
          timeframe_end?: string | null
          timeframe_start?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string
          data_sources?: string[] | null
          execution_duration_seconds?: number | null
          id?: string
          is_autonomous?: boolean
          is_public?: boolean
          metadata?: Json
          mission_objective?: string
          mission_prompt?: string
          mission_title?: string
          mission_type?: string
          output_type?: string
          priority_level?: string
          regions?: string[] | null
          started_at?: string | null
          status?: string
          target_entities?: string[] | null
          timeframe_end?: string | null
          timeframe_start?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      civic_knowledge_entities: {
        Row: {
          aliases: string[] | null
          auto_imported: boolean | null
          canonical_name: string
          confidence_score: number | null
          created_at: string
          description: string | null
          dissolution_date: string | null
          entity_type: Database["public"]["Enums"]["civic_entity_type"]
          establishment_date: string | null
          facebook_page: string | null
          headquarters_address: string | null
          id: string
          instagram_handle: string | null
          last_verified_at: string | null
          linkedin_profile: string | null
          metadata: Json | null
          name: string
          official_email: string | null
          official_phone: string | null
          official_website: string | null
          primary_source_url: string | null
          region: string | null
          registration_number: string | null
          source_type: Database["public"]["Enums"]["source_type"] | null
          status: string | null
          twitter_handle: string | null
          updated_at: string
          verification_status: string | null
          youtube_channel: string | null
        }
        Insert: {
          aliases?: string[] | null
          auto_imported?: boolean | null
          canonical_name: string
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          dissolution_date?: string | null
          entity_type: Database["public"]["Enums"]["civic_entity_type"]
          establishment_date?: string | null
          facebook_page?: string | null
          headquarters_address?: string | null
          id?: string
          instagram_handle?: string | null
          last_verified_at?: string | null
          linkedin_profile?: string | null
          metadata?: Json | null
          name: string
          official_email?: string | null
          official_phone?: string | null
          official_website?: string | null
          primary_source_url?: string | null
          region?: string | null
          registration_number?: string | null
          source_type?: Database["public"]["Enums"]["source_type"] | null
          status?: string | null
          twitter_handle?: string | null
          updated_at?: string
          verification_status?: string | null
          youtube_channel?: string | null
        }
        Update: {
          aliases?: string[] | null
          auto_imported?: boolean | null
          canonical_name?: string
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          dissolution_date?: string | null
          entity_type?: Database["public"]["Enums"]["civic_entity_type"]
          establishment_date?: string | null
          facebook_page?: string | null
          headquarters_address?: string | null
          id?: string
          instagram_handle?: string | null
          last_verified_at?: string | null
          linkedin_profile?: string | null
          metadata?: Json | null
          name?: string
          official_email?: string | null
          official_phone?: string | null
          official_website?: string | null
          primary_source_url?: string | null
          region?: string | null
          registration_number?: string | null
          source_type?: Database["public"]["Enums"]["source_type"] | null
          status?: string | null
          twitter_handle?: string | null
          updated_at?: string
          verification_status?: string | null
          youtube_channel?: string | null
        }
        Relationships: []
      }
      civic_law_explanations: {
        Row: {
          auto_generated: boolean | null
          citizen_impact: string | null
          created_at: string | null
          created_by: string | null
          downvotes: number | null
          examples: string[] | null
          expert_reviewed: boolean | null
          french_explanation: string | null
          id: string
          key_points: string[] | null
          legal_document_id: string | null
          metadata: Json | null
          pidgin_explanation: string | null
          question_asked: string
          related_laws: string[] | null
          simple_explanation: string
          updated_at: string | null
          upvotes: number | null
        }
        Insert: {
          auto_generated?: boolean | null
          citizen_impact?: string | null
          created_at?: string | null
          created_by?: string | null
          downvotes?: number | null
          examples?: string[] | null
          expert_reviewed?: boolean | null
          french_explanation?: string | null
          id?: string
          key_points?: string[] | null
          legal_document_id?: string | null
          metadata?: Json | null
          pidgin_explanation?: string | null
          question_asked: string
          related_laws?: string[] | null
          simple_explanation: string
          updated_at?: string | null
          upvotes?: number | null
        }
        Update: {
          auto_generated?: boolean | null
          citizen_impact?: string | null
          created_at?: string | null
          created_by?: string | null
          downvotes?: number | null
          examples?: string[] | null
          expert_reviewed?: boolean | null
          french_explanation?: string | null
          id?: string
          key_points?: string[] | null
          legal_document_id?: string | null
          metadata?: Json | null
          pidgin_explanation?: string | null
          question_asked?: string
          related_laws?: string[] | null
          simple_explanation?: string
          updated_at?: string | null
          upvotes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "civic_law_explanations_legal_document_id_fkey"
            columns: ["legal_document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      civic_leaderboards: {
        Row: {
          category: string
          created_at: string
          entity_id: string
          entity_name: string
          entity_type: Database["public"]["Enums"]["civic_entity_type"]
          id: string
          period_end: string
          period_start: string
          period_type: string
          rank_position: number
          region: string | null
          score: number
        }
        Insert: {
          category: string
          created_at?: string
          entity_id: string
          entity_name: string
          entity_type: Database["public"]["Enums"]["civic_entity_type"]
          id?: string
          period_end: string
          period_start: string
          period_type?: string
          rank_position: number
          region?: string | null
          score: number
        }
        Update: {
          category?: string
          created_at?: string
          entity_id?: string
          entity_name?: string
          entity_type?: Database["public"]["Enums"]["civic_entity_type"]
          id?: string
          period_end?: string
          period_start?: string
          period_type?: string
          rank_position?: number
          region?: string | null
          score?: number
        }
        Relationships: []
      }
      civic_learning_paths: {
        Row: {
          average_rating: number | null
          certification_requirements: Json | null
          completion_count: number
          content_sequence: Json
          created_at: string
          created_by: string | null
          description: string | null
          difficulty_level: Database["public"]["Enums"]["education_difficulty"]
          enrollment_count: number
          estimated_duration_hours: number | null
          id: string
          is_active: boolean
          is_certification_path: boolean
          learning_outcomes: string[] | null
          prerequisites: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          average_rating?: number | null
          certification_requirements?: Json | null
          completion_count?: number
          content_sequence?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?: Database["public"]["Enums"]["education_difficulty"]
          enrollment_count?: number
          estimated_duration_hours?: number | null
          id?: string
          is_active?: boolean
          is_certification_path?: boolean
          learning_outcomes?: string[] | null
          prerequisites?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          average_rating?: number | null
          certification_requirements?: Json | null
          completion_count?: number
          content_sequence?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?: Database["public"]["Enums"]["education_difficulty"]
          enrollment_count?: number
          estimated_duration_hours?: number | null
          id?: string
          is_active?: boolean
          is_certification_path?: boolean
          learning_outcomes?: string[] | null
          prerequisites?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      civic_learning_progress: {
        Row: {
          bookmarked: boolean
          completed_at: string | null
          completion_percentage: number
          content_id: string | null
          created_at: string
          current_position: number | null
          id: string
          last_accessed_at: string | null
          learning_path_id: string | null
          notes: string | null
          progress_type: string
          quiz_scores: Json | null
          time_spent_minutes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bookmarked?: boolean
          completed_at?: string | null
          completion_percentage?: number
          content_id?: string | null
          created_at?: string
          current_position?: number | null
          id?: string
          last_accessed_at?: string | null
          learning_path_id?: string | null
          notes?: string | null
          progress_type: string
          quiz_scores?: Json | null
          time_spent_minutes?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bookmarked?: boolean
          completed_at?: string | null
          completion_percentage?: number
          content_id?: string | null
          created_at?: string
          current_position?: number | null
          id?: string
          last_accessed_at?: string | null
          learning_path_id?: string | null
          notes?: string | null
          progress_type?: string
          quiz_scores?: Json | null
          time_spent_minutes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      civic_mission_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_description: string
          alert_title: string
          alert_type: string
          auto_actions_taken: string[] | null
          confidence_level: number | null
          created_at: string
          entities_involved: Json | null
          id: string
          is_acknowledged: boolean | null
          metadata: Json | null
          mission_id: string | null
          regions_affected: string[] | null
          requires_human_review: boolean | null
          resolution_status: string | null
          severity: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_description: string
          alert_title: string
          alert_type: string
          auto_actions_taken?: string[] | null
          confidence_level?: number | null
          created_at?: string
          entities_involved?: Json | null
          id?: string
          is_acknowledged?: boolean | null
          metadata?: Json | null
          mission_id?: string | null
          regions_affected?: string[] | null
          requires_human_review?: boolean | null
          resolution_status?: string | null
          severity?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_description?: string
          alert_title?: string
          alert_type?: string
          auto_actions_taken?: string[] | null
          confidence_level?: number | null
          created_at?: string
          entities_involved?: Json | null
          id?: string
          is_acknowledged?: boolean | null
          metadata?: Json | null
          mission_id?: string | null
          regions_affected?: string[] | null
          requires_human_review?: boolean | null
          resolution_status?: string | null
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_mission_alerts_mission"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "civic_intelligence_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      civic_mission_execution_logs: {
        Row: {
          completed_at: string | null
          created_at: string
          data_processed: Json | null
          duration_ms: number | null
          error_details: string | null
          id: string
          mission_id: string
          results_found: number | null
          started_at: string | null
          status: string
          step_name: string
          step_order: number
          step_type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          data_processed?: Json | null
          duration_ms?: number | null
          error_details?: string | null
          id?: string
          mission_id: string
          results_found?: number | null
          started_at?: string | null
          status?: string
          step_name: string
          step_order: number
          step_type: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          data_processed?: Json | null
          duration_ms?: number | null
          error_details?: string | null
          id?: string
          mission_id?: string
          results_found?: number | null
          started_at?: string | null
          status?: string
          step_name?: string
          step_order?: number
          step_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_mission_logs_mission"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "civic_intelligence_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      civic_mission_findings: {
        Row: {
          affected_entities: Json | null
          confidence_score: number
          correlation_strength: number | null
          created_at: string
          evidence_data: Json | null
          finding_description: string
          finding_title: string
          finding_type: string
          id: string
          is_verified: boolean | null
          metadata: Json | null
          mission_id: string
          recommended_actions: string[] | null
          regional_impact: string[] | null
          severity_level: string
          source_tables: string[] | null
          time_period: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          affected_entities?: Json | null
          confidence_score?: number
          correlation_strength?: number | null
          created_at?: string
          evidence_data?: Json | null
          finding_description: string
          finding_title: string
          finding_type: string
          id?: string
          is_verified?: boolean | null
          metadata?: Json | null
          mission_id: string
          recommended_actions?: string[] | null
          regional_impact?: string[] | null
          severity_level?: string
          source_tables?: string[] | null
          time_period?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          affected_entities?: Json | null
          confidence_score?: number
          correlation_strength?: number | null
          created_at?: string
          evidence_data?: Json | null
          finding_description?: string
          finding_title?: string
          finding_type?: string
          id?: string
          is_verified?: boolean | null
          metadata?: Json | null
          mission_id?: string
          recommended_actions?: string[] | null
          regional_impact?: string[] | null
          severity_level?: string
          source_tables?: string[] | null
          time_period?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_mission_findings_mission"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "civic_intelligence_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      civic_mission_reports: {
        Row: {
          action_items: string[] | null
          created_at: string
          data_visualizations: Json | null
          detailed_findings: string | null
          download_links: Json | null
          executive_summary: string
          id: string
          is_published: boolean | null
          mission_id: string
          public_summary: string | null
          published_at: string | null
          recommendations: string[] | null
          report_title: string
          report_type: string
          report_url: string | null
          updated_at: string
          visual_charts: Json | null
        }
        Insert: {
          action_items?: string[] | null
          created_at?: string
          data_visualizations?: Json | null
          detailed_findings?: string | null
          download_links?: Json | null
          executive_summary: string
          id?: string
          is_published?: boolean | null
          mission_id: string
          public_summary?: string | null
          published_at?: string | null
          recommendations?: string[] | null
          report_title: string
          report_type?: string
          report_url?: string | null
          updated_at?: string
          visual_charts?: Json | null
        }
        Update: {
          action_items?: string[] | null
          created_at?: string
          data_visualizations?: Json | null
          detailed_findings?: string | null
          download_links?: Json | null
          executive_summary?: string
          id?: string
          is_published?: boolean | null
          mission_id?: string
          public_summary?: string | null
          published_at?: string | null
          recommendations?: string[] | null
          report_title?: string
          report_type?: string
          report_url?: string | null
          updated_at?: string
          visual_charts?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_mission_reports_mission"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "civic_intelligence_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      civic_moderators: {
        Row: {
          application_id: string
          assigned_villages: string[]
          coverage_regions: string[]
          created_at: string
          id: string
          last_active_at: string | null
          moderator_role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["moderator_status"]
          suspended_until: string | null
          suspension_reason: string | null
          total_approvals: number
          total_edits: number
          total_rejections: number
          updated_at: string
          user_id: string
        }
        Insert: {
          application_id: string
          assigned_villages?: string[]
          coverage_regions?: string[]
          created_at?: string
          id?: string
          last_active_at?: string | null
          moderator_role: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["moderator_status"]
          suspended_until?: string | null
          suspension_reason?: string | null
          total_approvals?: number
          total_edits?: number
          total_rejections?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          application_id?: string
          assigned_villages?: string[]
          coverage_regions?: string[]
          created_at?: string
          id?: string
          last_active_at?: string | null
          moderator_role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["moderator_status"]
          suspended_until?: string | null
          suspension_reason?: string | null
          total_approvals?: number
          total_edits?: number
          total_rejections?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "civic_moderators_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "moderator_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      civic_module_visibility: {
        Row: {
          created_at: string
          created_by: string | null
          custom_settings: Json | null
          enabled_for_roles: string[] | null
          id: string
          is_public_visible: boolean
          module_description: string | null
          module_name: string
          region_restrictions: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          custom_settings?: Json | null
          enabled_for_roles?: string[] | null
          id?: string
          is_public_visible?: boolean
          module_description?: string | null
          module_name: string
          region_restrictions?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          custom_settings?: Json | null
          enabled_for_roles?: string[] | null
          id?: string
          is_public_visible?: boolean
          module_description?: string | null
          module_name?: string
          region_restrictions?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      civic_notifications: {
        Row: {
          action_url: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean
          metadata: Json | null
          priority: string
          region: string | null
          sender_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          metadata?: Json | null
          priority?: string
          region?: string | null
          sender_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          metadata?: Json | null
          priority?: string
          region?: string | null
          sender_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      civic_quiz_attempts: {
        Row: {
          answers: Json
          attempt_number: number
          completed_at: string | null
          created_at: string
          id: string
          passed: boolean
          quiz_id: string
          score: number
          started_at: string
          time_taken_minutes: number | null
          user_id: string
        }
        Insert: {
          answers?: Json
          attempt_number?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          passed?: boolean
          quiz_id: string
          score: number
          started_at?: string
          time_taken_minutes?: number | null
          user_id: string
        }
        Update: {
          answers?: Json
          attempt_number?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          passed?: boolean
          quiz_id?: string
          score?: number
          started_at?: string
          time_taken_minutes?: number | null
          user_id?: string
        }
        Relationships: []
      }
      civic_rating_abuse_reports: {
        Row: {
          abuse_type: string
          action_taken: string | null
          created_at: string
          id: string
          reason: string | null
          reported_rating_id: string
          reporter_user_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          abuse_type: string
          action_taken?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          reported_rating_id: string
          reporter_user_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          abuse_type?: string
          action_taken?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          reported_rating_id?: string
          reporter_user_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "civic_rating_abuse_reports_reported_rating_id_fkey"
            columns: ["reported_rating_id"]
            isOneToOne: false
            referencedRelation: "civic_entity_ratings"
            referencedColumns: ["id"]
          },
        ]
      }
      civic_reputation_scores: {
        Row: {
          average_rating: number
          citizen_rating_score: number
          created_at: string
          engagement_score: number
          entity_id: string
          entity_name: string
          entity_type: Database["public"]["Enums"]["civic_entity_type"]
          five_star_count: number
          four_star_count: number
          id: string
          last_calculated_at: string
          negative_flags_penalty: number
          one_star_count: number
          performance_score: number
          region: string | null
          reputation_badge: Database["public"]["Enums"]["reputation_badge"]
          response_speed_score: number
          three_star_count: number
          total_ratings: number
          total_score: number
          transparency_score: number
          two_star_count: number
          updated_at: string
        }
        Insert: {
          average_rating?: number
          citizen_rating_score?: number
          created_at?: string
          engagement_score?: number
          entity_id: string
          entity_name: string
          entity_type: Database["public"]["Enums"]["civic_entity_type"]
          five_star_count?: number
          four_star_count?: number
          id?: string
          last_calculated_at?: string
          negative_flags_penalty?: number
          one_star_count?: number
          performance_score?: number
          region?: string | null
          reputation_badge?: Database["public"]["Enums"]["reputation_badge"]
          response_speed_score?: number
          three_star_count?: number
          total_ratings?: number
          total_score?: number
          transparency_score?: number
          two_star_count?: number
          updated_at?: string
        }
        Update: {
          average_rating?: number
          citizen_rating_score?: number
          created_at?: string
          engagement_score?: number
          entity_id?: string
          entity_name?: string
          entity_type?: Database["public"]["Enums"]["civic_entity_type"]
          five_star_count?: number
          four_star_count?: number
          id?: string
          last_calculated_at?: string
          negative_flags_penalty?: number
          one_star_count?: number
          performance_score?: number
          region?: string | null
          reputation_badge?: Database["public"]["Enums"]["reputation_badge"]
          response_speed_score?: number
          three_star_count?: number
          total_ratings?: number
          total_score?: number
          transparency_score?: number
          two_star_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      civic_sentiment_timeline: {
        Row: {
          age_group: string | null
          approval_rating: number
          created_at: string
          data_sources: Json
          date_recorded: string
          emotions: Json
          id: string
          language: string | null
          metadata: Json
          region: string | null
          sentiment_score: number
          subject_id: string | null
          subject_name: string
          subject_type: string
          trust_ratio: number
          updated_at: string
        }
        Insert: {
          age_group?: string | null
          approval_rating?: number
          created_at?: string
          data_sources?: Json
          date_recorded: string
          emotions?: Json
          id?: string
          language?: string | null
          metadata?: Json
          region?: string | null
          sentiment_score?: number
          subject_id?: string | null
          subject_name: string
          subject_type: string
          trust_ratio?: number
          updated_at?: string
        }
        Update: {
          age_group?: string | null
          approval_rating?: number
          created_at?: string
          data_sources?: Json
          date_recorded?: string
          emotions?: Json
          id?: string
          language?: string | null
          metadata?: Json
          region?: string | null
          sentiment_score?: number
          subject_id?: string | null
          subject_name?: string
          subject_type?: string
          trust_ratio?: number
          updated_at?: string
        }
        Relationships: []
      }
      civic_service_events: {
        Row: {
          affected_population: number | null
          city_town: string | null
          coordinates: Json | null
          country_code: string
          created_at: string
          data_source: string
          end_date: string | null
          event_category: string
          event_description: string | null
          event_title: string
          event_type: string
          id: string
          impact_areas: string[] | null
          is_active: boolean
          metadata: Json | null
          region: string
          severity: string
          source_url: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          affected_population?: number | null
          city_town?: string | null
          coordinates?: Json | null
          country_code?: string
          created_at?: string
          data_source?: string
          end_date?: string | null
          event_category: string
          event_description?: string | null
          event_title: string
          event_type: string
          id?: string
          impact_areas?: string[] | null
          is_active?: boolean
          metadata?: Json | null
          region: string
          severity?: string
          source_url?: string | null
          start_date?: string
          updated_at?: string
        }
        Update: {
          affected_population?: number | null
          city_town?: string | null
          coordinates?: Json | null
          country_code?: string
          created_at?: string
          data_source?: string
          end_date?: string | null
          event_category?: string
          event_description?: string | null
          event_title?: string
          event_type?: string
          id?: string
          impact_areas?: string[] | null
          is_active?: boolean
          metadata?: Json | null
          region?: string
          severity?: string
          source_url?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      civic_simulation_results: {
        Row: {
          affected_regions: string[] | null
          confidence_score: number | null
          created_at: string
          created_by: string | null
          id: string
          input_parameters: Json
          mitigation_strategies: Json | null
          predicted_outcomes: Json | null
          risk_factors: Json | null
          simulation_scenario: string
          simulation_type: string
          timeframe_years: number | null
        }
        Insert: {
          affected_regions?: string[] | null
          confidence_score?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          input_parameters: Json
          mitigation_strategies?: Json | null
          predicted_outcomes?: Json | null
          risk_factors?: Json | null
          simulation_scenario: string
          simulation_type?: string
          timeframe_years?: number | null
        }
        Update: {
          affected_regions?: string[] | null
          confidence_score?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          input_parameters?: Json
          mitigation_strategies?: Json | null
          predicted_outcomes?: Json | null
          risk_factors?: Json | null
          simulation_scenario?: string
          simulation_type?: string
          timeframe_years?: number | null
        }
        Relationships: []
      }
      civic_strategies: {
        Row: {
          created_at: string
          created_by: string | null
          digital_tools: Json | null
          id: string
          implementation_timeline: Json | null
          is_public: boolean
          leadership_recommendations: Json | null
          long_term_reforms: Json | null
          policy_suggestions: Json | null
          problem_id: string | null
          short_term_actions: Json | null
          strategy_title: string
          success_metrics: Json | null
          updated_at: string
          visibility_level: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          digital_tools?: Json | null
          id?: string
          implementation_timeline?: Json | null
          is_public?: boolean
          leadership_recommendations?: Json | null
          long_term_reforms?: Json | null
          policy_suggestions?: Json | null
          problem_id?: string | null
          short_term_actions?: Json | null
          strategy_title: string
          success_metrics?: Json | null
          updated_at?: string
          visibility_level?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          digital_tools?: Json | null
          id?: string
          implementation_timeline?: Json | null
          is_public?: boolean
          leadership_recommendations?: Json | null
          long_term_reforms?: Json | null
          policy_suggestions?: Json | null
          problem_id?: string | null
          short_term_actions?: Json | null
          strategy_title?: string
          success_metrics?: Json | null
          updated_at?: string
          visibility_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "civic_strategies_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "civic_strategy_problems"
            referencedColumns: ["id"]
          },
        ]
      }
      civic_strategy_problems: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          impact_groups: Json | null
          problem_category: string
          problem_description: string
          problem_title: string
          root_causes: Json | null
          target_demographics: Json | null
          target_region: string | null
          updated_at: string
          urgency_level: string
          volatility_score: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          impact_groups?: Json | null
          problem_category?: string
          problem_description: string
          problem_title: string
          root_causes?: Json | null
          target_demographics?: Json | null
          target_region?: string | null
          updated_at?: string
          urgency_level?: string
          volatility_score?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          impact_groups?: Json | null
          problem_category?: string
          problem_description?: string
          problem_title?: string
          root_causes?: Json | null
          target_demographics?: Json | null
          target_region?: string | null
          updated_at?: string
          urgency_level?: string
          volatility_score?: number | null
        }
        Relationships: []
      }
      civic_visibility_audit: {
        Row: {
          action_type: string
          affected_regions: string[] | null
          change_reason: string | null
          changed_by: string | null
          created_at: string
          id: string
          module_name: string
          new_state: Json | null
          previous_state: Json | null
        }
        Insert: {
          action_type: string
          affected_regions?: string[] | null
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          module_name: string
          new_state?: Json | null
          previous_state?: Json | null
        }
        Update: {
          action_type?: string
          affected_regions?: string[] | null
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          module_name?: string
          new_state?: Json | null
          previous_state?: Json | null
        }
        Relationships: []
      }
      claim_documents: {
        Row: {
          claim_id: string
          document_type: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          uploaded_at: string | null
        }
        Insert: {
          claim_id: string
          document_type: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          uploaded_at?: string | null
        }
        Update: {
          claim_id?: string
          document_type?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claim_documents_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "institution_claims"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_notifications: {
        Row: {
          claim_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          recipient_id: string
          title: string
        }
        Insert: {
          claim_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          recipient_id: string
          title: string
        }
        Update: {
          claim_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          recipient_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_notifications_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "institution_claims"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_requests: {
        Row: {
          claim_reason: string | null
          claimant_user_id: string
          created_at: string
          evidence_documents: string[] | null
          id: string
          institution_id: string
          institution_type: Database["public"]["Enums"]["institution_type"]
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: Database["public"]["Enums"]["verification_status"]
          updated_at: string
        }
        Insert: {
          claim_reason?: string | null
          claimant_user_id: string
          created_at?: string
          evidence_documents?: string[] | null
          id?: string
          institution_id: string
          institution_type: Database["public"]["Enums"]["institution_type"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          updated_at?: string
        }
        Update: {
          claim_reason?: string | null
          claimant_user_id?: string
          created_at?: string
          evidence_documents?: string[] | null
          id?: string
          institution_id?: string
          institution_type?: Database["public"]["Enums"]["institution_type"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          updated_at?: string
        }
        Relationships: []
      }
      community_events: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          current_attendees: number
          description: string
          end_time: string
          event_type: string
          id: string
          latitude: number | null
          location: string
          longitude: number | null
          max_attendees: number | null
          organizer_id: string
          registration_required: boolean
          start_time: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          current_attendees?: number
          description: string
          end_time: string
          event_type: string
          id?: string
          latitude?: number | null
          location: string
          longitude?: number | null
          max_attendees?: number | null
          organizer_id: string
          registration_required?: boolean
          start_time: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          current_attendees?: number
          description?: string
          end_time?: string
          event_type?: string
          id?: string
          latitude?: number | null
          location?: string
          longitude?: number | null
          max_attendees?: number | null
          organizer_id?: string
          registration_required?: boolean
          start_time?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          average_rating: number | null
          company_name: string
          company_type: Database["public"]["Enums"]["company_type"]
          cover_photo_url: string | null
          created_at: string
          description: string | null
          division: string
          email: string
          employee_count_range: string
          estimated_net_worth: number | null
          id: string
          is_featured: boolean | null
          logo_url: string | null
          past_management: string | null
          payment_amount: number | null
          payment_date: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          phone_number: string
          physical_address: string
          profile_views: number | null
          region: string
          sector: string
          social_media_links: Json | null
          status: Database["public"]["Enums"]["company_status"] | null
          tax_identification_number: string
          total_ratings: number | null
          updated_at: string
          user_id: string | null
          website_url: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          average_rating?: number | null
          company_name: string
          company_type: Database["public"]["Enums"]["company_type"]
          cover_photo_url?: string | null
          created_at?: string
          description?: string | null
          division: string
          email: string
          employee_count_range: string
          estimated_net_worth?: number | null
          id?: string
          is_featured?: boolean | null
          logo_url?: string | null
          past_management?: string | null
          payment_amount?: number | null
          payment_date?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          phone_number: string
          physical_address: string
          profile_views?: number | null
          region: string
          sector: string
          social_media_links?: Json | null
          status?: Database["public"]["Enums"]["company_status"] | null
          tax_identification_number: string
          total_ratings?: number | null
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          average_rating?: number | null
          company_name?: string
          company_type?: Database["public"]["Enums"]["company_type"]
          cover_photo_url?: string | null
          created_at?: string
          description?: string | null
          division?: string
          email?: string
          employee_count_range?: string
          estimated_net_worth?: number | null
          id?: string
          is_featured?: boolean | null
          logo_url?: string | null
          past_management?: string | null
          payment_amount?: number | null
          payment_date?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          phone_number?: string
          physical_address?: string
          profile_views?: number | null
          region?: string
          sector?: string
          social_media_links?: Json | null
          status?: Database["public"]["Enums"]["company_status"] | null
          tax_identification_number?: string
          total_ratings?: number | null
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      company_creation_requests: {
        Row: {
          additional_documents: Json | null
          admin_notes: string | null
          business_plan_url: string | null
          company_type: Database["public"]["Enums"]["company_type"]
          created_at: string
          founder_email: string
          founder_name: string
          founder_phone: string
          id: string
          id_card_url: string | null
          legal_terms_accepted: boolean
          preferred_location: string
          processed_at: string | null
          processed_by: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          additional_documents?: Json | null
          admin_notes?: string | null
          business_plan_url?: string | null
          company_type: Database["public"]["Enums"]["company_type"]
          created_at?: string
          founder_email: string
          founder_name: string
          founder_phone: string
          id?: string
          id_card_url?: string | null
          legal_terms_accepted?: boolean
          preferred_location: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          additional_documents?: Json | null
          admin_notes?: string | null
          business_plan_url?: string | null
          company_type?: Database["public"]["Enums"]["company_type"]
          created_at?: string
          founder_email?: string
          founder_name?: string
          founder_phone?: string
          id?: string
          id_card_url?: string | null
          legal_terms_accepted?: boolean
          preferred_location?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      company_jobs: {
        Row: {
          application_email: string | null
          application_link: string | null
          applications_count: number | null
          company_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          job_description: string
          job_title: string
          location: string
          requirements: string | null
          salary_range: string | null
          updated_at: string
          views_count: number | null
        }
        Insert: {
          application_email?: string | null
          application_link?: string | null
          applications_count?: number | null
          company_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          job_description: string
          job_title: string
          location: string
          requirements?: string | null
          salary_range?: string | null
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          application_email?: string | null
          application_link?: string | null
          applications_count?: number | null
          company_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          job_description?: string
          job_title?: string
          location?: string
          requirements?: string | null
          salary_range?: string | null
          updated_at?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "company_jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_payments: {
        Row: {
          amount: number
          company_id: string | null
          company_type: Database["public"]["Enums"]["company_type"]
          created_at: string
          currency: string | null
          id: string
          payment_date: string | null
          payment_method: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          company_id?: string | null
          company_type: Database["public"]["Enums"]["company_type"]
          created_at?: string
          currency?: string | null
          id?: string
          payment_date?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          company_id?: string | null
          company_type?: Database["public"]["Enums"]["company_type"]
          created_at?: string
          currency?: string | null
          id?: string
          payment_date?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_ratings: {
        Row: {
          comment: string | null
          company_id: string | null
          created_at: string
          id: string
          is_moderated: boolean | null
          moderated_at: string | null
          moderated_by: string | null
          rating: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          is_moderated?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          rating: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          is_moderated?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          rating?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_ratings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_updates: {
        Row: {
          company_id: string | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_published: boolean | null
          title: string
          update_type: string | null
          updated_at: string
          views_count: number | null
        }
        Insert: {
          company_id?: string | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          title: string
          update_type?: string | null
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          company_id?: string | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          title?: string
          update_type?: string | null
          updated_at?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "company_updates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      constitutional_articles: {
        Row: {
          article_number: string
          article_summary: string | null
          article_text: string
          article_title: string | null
          category: string
          chapter_title: string | null
          created_at: string | null
          id: string
          is_fundamental_right: boolean | null
          updated_at: string | null
        }
        Insert: {
          article_number: string
          article_summary?: string | null
          article_text: string
          article_title?: string | null
          category: string
          chapter_title?: string | null
          created_at?: string | null
          id?: string
          is_fundamental_right?: boolean | null
          updated_at?: string | null
        }
        Update: {
          article_number?: string
          article_summary?: string | null
          article_text?: string
          article_title?: string | null
          category?: string
          chapter_title?: string | null
          created_at?: string | null
          id?: string
          is_fundamental_right?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      constitutional_violations: {
        Row: {
          auto_detected: boolean | null
          confidence_score: number | null
          constitutional_article_id: string | null
          created_at: string | null
          expert_opinion: string | null
          flagged_by: string | null
          id: string
          legal_analysis: string | null
          legal_document_id: string | null
          metadata: Json | null
          policy_id: string | null
          public_alert_issued: boolean | null
          resolution_status: string | null
          reviewed_by_legal_expert: boolean | null
          severity_level: string
          updated_at: string | null
          violation_description: string
          violation_type: string
        }
        Insert: {
          auto_detected?: boolean | null
          confidence_score?: number | null
          constitutional_article_id?: string | null
          created_at?: string | null
          expert_opinion?: string | null
          flagged_by?: string | null
          id?: string
          legal_analysis?: string | null
          legal_document_id?: string | null
          metadata?: Json | null
          policy_id?: string | null
          public_alert_issued?: boolean | null
          resolution_status?: string | null
          reviewed_by_legal_expert?: boolean | null
          severity_level?: string
          updated_at?: string | null
          violation_description: string
          violation_type: string
        }
        Update: {
          auto_detected?: boolean | null
          confidence_score?: number | null
          constitutional_article_id?: string | null
          created_at?: string | null
          expert_opinion?: string | null
          flagged_by?: string | null
          id?: string
          legal_analysis?: string | null
          legal_document_id?: string | null
          metadata?: Json | null
          policy_id?: string | null
          public_alert_issued?: boolean | null
          resolution_status?: string | null
          reviewed_by_legal_expert?: boolean | null
          severity_level?: string
          updated_at?: string | null
          violation_description?: string
          violation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "constitutional_violations_constitutional_article_id_fkey"
            columns: ["constitutional_article_id"]
            isOneToOne: false
            referencedRelation: "constitutional_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "constitutional_violations_legal_document_id_fkey"
            columns: ["legal_document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "constitutional_violations_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policy_tracker"
            referencedColumns: ["id"]
          },
        ]
      }
      content_tags: {
        Row: {
          created_at: string
          id: string
          tag_category: string
          tag_name: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          tag_category?: string
          tag_name: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          tag_category?: string
          tag_name?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string | null
          id: string
          is_admin: boolean | null
          is_muted: boolean | null
          joined_at: string | null
          user_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          id?: string
          is_admin?: boolean | null
          is_muted?: boolean | null
          joined_at?: string | null
          user_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          id?: string
          is_admin?: boolean | null
          is_muted?: boolean | null
          joined_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          icon_url: string | null
          id: string
          is_group: boolean | null
          last_message_at: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_group?: boolean | null
          last_message_at?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_group?: boolean | null
          last_message_at?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      copyright_violations: {
        Row: {
          admin_notes: string | null
          artist_id: string
          created_at: string
          detection_confidence: number
          dmca_claim_sent: boolean
          fingerprint_id: string
          id: string
          metadata: Json | null
          platform_response: string | null
          platform_type: Database["public"]["Enums"]["platform_type"]
          reported_at: string | null
          resolved_at: string | null
          screenshot_url: string | null
          status: Database["public"]["Enums"]["violation_status"]
          track_id: string
          updated_at: string
          video_evidence_url: string | null
          violation_description: string | null
          violation_type: string
          violation_url: string
          violator_channel_url: string | null
          violator_username: string | null
        }
        Insert: {
          admin_notes?: string | null
          artist_id: string
          created_at?: string
          detection_confidence?: number
          dmca_claim_sent?: boolean
          fingerprint_id: string
          id?: string
          metadata?: Json | null
          platform_response?: string | null
          platform_type: Database["public"]["Enums"]["platform_type"]
          reported_at?: string | null
          resolved_at?: string | null
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["violation_status"]
          track_id: string
          updated_at?: string
          video_evidence_url?: string | null
          violation_description?: string | null
          violation_type: string
          violation_url: string
          violator_channel_url?: string | null
          violator_username?: string | null
        }
        Update: {
          admin_notes?: string | null
          artist_id?: string
          created_at?: string
          detection_confidence?: number
          dmca_claim_sent?: boolean
          fingerprint_id?: string
          id?: string
          metadata?: Json | null
          platform_response?: string | null
          platform_type?: Database["public"]["Enums"]["platform_type"]
          reported_at?: string | null
          resolved_at?: string | null
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["violation_status"]
          track_id?: string
          updated_at?: string
          video_evidence_url?: string | null
          violation_description?: string | null
          violation_type?: string
          violation_url?: string
          violator_channel_url?: string | null
          violator_username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "copyright_violations_fingerprint_id_fkey"
            columns: ["fingerprint_id"]
            isOneToOne: false
            referencedRelation: "audio_fingerprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "copyright_violations_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "music_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      corruption_case_sources: {
        Row: {
          case_id: string
          created_at: string
          credibility_score: number | null
          document_type: string | null
          id: string
          is_primary_source: boolean | null
          publication_date: string | null
          source_name: string
          source_type: string
          source_url: string | null
        }
        Insert: {
          case_id: string
          created_at?: string
          credibility_score?: number | null
          document_type?: string | null
          id?: string
          is_primary_source?: boolean | null
          publication_date?: string | null
          source_name: string
          source_type: string
          source_url?: string | null
        }
        Update: {
          case_id?: string
          created_at?: string
          credibility_score?: number | null
          document_type?: string | null
          id?: string
          is_primary_source?: boolean | null
          publication_date?: string | null
          source_name?: string
          source_type?: string
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "corruption_case_sources_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "corruption_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      corruption_case_updates: {
        Row: {
          added_by: string | null
          case_id: string
          created_at: string
          id: string
          new_status: string | null
          previous_status: string | null
          source_reference: string | null
          update_date: string
          update_description: string
          update_type: string
        }
        Insert: {
          added_by?: string | null
          case_id: string
          created_at?: string
          id?: string
          new_status?: string | null
          previous_status?: string | null
          source_reference?: string | null
          update_date: string
          update_description: string
          update_type: string
        }
        Update: {
          added_by?: string | null
          case_id?: string
          created_at?: string
          id?: string
          new_status?: string | null
          previous_status?: string | null
          source_reference?: string | null
          update_date?: string
          update_description?: string
          update_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "corruption_case_updates_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "corruption_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      corruption_cases: {
        Row: {
          amount_involved: number | null
          case_description: string
          case_reference_id: string | null
          case_status: string
          case_title: string
          case_type: string
          created_at: string
          created_by: string | null
          currency: string | null
          date_court_ruling: string | null
          date_investigation_started: string | null
          date_reported: string | null
          id: string
          investigating_body: string | null
          is_verified: boolean | null
          last_updated_by: string | null
          politician_id: string | null
          politician_name: string
          politician_party: string | null
          politician_position: string | null
          regions_affected: string[] | null
          sentence_details: string | null
          updated_at: string
          verification_notes: string | null
        }
        Insert: {
          amount_involved?: number | null
          case_description: string
          case_reference_id?: string | null
          case_status?: string
          case_title: string
          case_type: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          date_court_ruling?: string | null
          date_investigation_started?: string | null
          date_reported?: string | null
          id?: string
          investigating_body?: string | null
          is_verified?: boolean | null
          last_updated_by?: string | null
          politician_id?: string | null
          politician_name: string
          politician_party?: string | null
          politician_position?: string | null
          regions_affected?: string[] | null
          sentence_details?: string | null
          updated_at?: string
          verification_notes?: string | null
        }
        Update: {
          amount_involved?: number | null
          case_description?: string
          case_reference_id?: string | null
          case_status?: string
          case_title?: string
          case_type?: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          date_court_ruling?: string | null
          date_investigation_started?: string | null
          date_reported?: string | null
          id?: string
          investigating_body?: string | null
          is_verified?: boolean | null
          last_updated_by?: string | null
          politician_id?: string | null
          politician_name?: string
          politician_party?: string | null
          politician_position?: string | null
          regions_affected?: string[] | null
          sentence_details?: string | null
          updated_at?: string
          verification_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "corruption_cases_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
        ]
      }
      country_administrative_divisions: {
        Row: {
          country_code: string
          created_at: string
          division_code: string | null
          division_level: number
          division_name: string
          division_name_local: string | null
          division_type: string
          id: string
          is_major_city: boolean | null
          latitude: number | null
          longitude: number | null
          parent_division_id: string | null
          population: number | null
          updated_at: string
        }
        Insert: {
          country_code: string
          created_at?: string
          division_code?: string | null
          division_level?: number
          division_name: string
          division_name_local?: string | null
          division_type: string
          id?: string
          is_major_city?: boolean | null
          latitude?: number | null
          longitude?: number | null
          parent_division_id?: string | null
          population?: number | null
          updated_at?: string
        }
        Update: {
          country_code?: string
          created_at?: string
          division_code?: string | null
          division_level?: number
          division_name?: string
          division_name_local?: string | null
          division_type?: string
          id?: string
          is_major_city?: boolean | null
          latitude?: number | null
          longitude?: number | null
          parent_division_id?: string | null
          population?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "country_administrative_divisions_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "pan_africa_countries"
            referencedColumns: ["country_code"]
          },
          {
            foreignKeyName: "country_administrative_divisions_parent_division_id_fkey"
            columns: ["parent_division_id"]
            isOneToOne: false
            referencedRelation: "country_administrative_divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      country_civic_config: {
        Row: {
          config_key: string
          config_type: string
          config_value: Json
          country_code: string
          created_at: string
          id: string
          is_active: boolean | null
          updated_at: string
        }
        Insert: {
          config_key: string
          config_type: string
          config_value: Json
          country_code: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
        }
        Update: {
          config_key?: string
          config_type?: string
          config_value?: Json
          country_code?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "country_civic_config_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "pan_africa_countries"
            referencedColumns: ["country_code"]
          },
        ]
      }
      custom_integrations: {
        Row: {
          auth_config: Json | null
          auth_type: string
          created_at: string
          created_by: string
          endpoint_url: string | null
          error_count: number
          execution_count: number
          id: string
          integration_name: string
          integration_type: string
          is_active: boolean
          is_public: boolean
          last_executed_at: string | null
          metadata: Json | null
          output_target: string | null
          pull_interval: string | null
          pull_schedule: string | null
          purpose: string | null
          request_body: Json | null
          request_headers: Json | null
          request_method: string
          success_count: number
          updated_at: string
        }
        Insert: {
          auth_config?: Json | null
          auth_type?: string
          created_at?: string
          created_by: string
          endpoint_url?: string | null
          error_count?: number
          execution_count?: number
          id?: string
          integration_name: string
          integration_type?: string
          is_active?: boolean
          is_public?: boolean
          last_executed_at?: string | null
          metadata?: Json | null
          output_target?: string | null
          pull_interval?: string | null
          pull_schedule?: string | null
          purpose?: string | null
          request_body?: Json | null
          request_headers?: Json | null
          request_method?: string
          success_count?: number
          updated_at?: string
        }
        Update: {
          auth_config?: Json | null
          auth_type?: string
          created_at?: string
          created_by?: string
          endpoint_url?: string | null
          error_count?: number
          execution_count?: number
          id?: string
          integration_name?: string
          integration_type?: string
          is_active?: boolean
          is_public?: boolean
          last_executed_at?: string | null
          metadata?: Json | null
          output_target?: string | null
          pull_interval?: string | null
          pull_schedule?: string | null
          purpose?: string | null
          request_body?: Json | null
          request_headers?: Json | null
          request_method?: string
          success_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      custom_reports: {
        Row: {
          created_at: string
          data_sources: Json
          export_format: string[] | null
          filter_criteria: Json | null
          generated_count: number
          id: string
          is_active: boolean
          is_scheduled: boolean
          last_generated_at: string | null
          next_generation_at: string | null
          recipients: string[] | null
          report_description: string | null
          report_name: string
          report_type: Database["public"]["Enums"]["report_type"]
          schedule_settings: Json | null
          updated_at: string
          user_id: string
          visualization_settings: Json | null
        }
        Insert: {
          created_at?: string
          data_sources?: Json
          export_format?: string[] | null
          filter_criteria?: Json | null
          generated_count?: number
          id?: string
          is_active?: boolean
          is_scheduled?: boolean
          last_generated_at?: string | null
          next_generation_at?: string | null
          recipients?: string[] | null
          report_description?: string | null
          report_name: string
          report_type: Database["public"]["Enums"]["report_type"]
          schedule_settings?: Json | null
          updated_at?: string
          user_id: string
          visualization_settings?: Json | null
        }
        Update: {
          created_at?: string
          data_sources?: Json
          export_format?: string[] | null
          filter_criteria?: Json | null
          generated_count?: number
          id?: string
          is_active?: boolean
          is_scheduled?: boolean
          last_generated_at?: string | null
          next_generation_at?: string | null
          recipients?: string[] | null
          report_description?: string | null
          report_name?: string
          report_type?: Database["public"]["Enums"]["report_type"]
          schedule_settings?: Json | null
          updated_at?: string
          user_id?: string
          visualization_settings?: Json | null
        }
        Relationships: []
      }
      data_quality_metrics: {
        Row: {
          created_at: string
          data_source: string
          id: string
          is_passing: boolean
          measured_at: string
          measurement_details: Json | null
          metric_type: string
          metric_value: number
          sample_size: number | null
          table_name: string
          threshold_value: number | null
        }
        Insert: {
          created_at?: string
          data_source: string
          id?: string
          is_passing?: boolean
          measured_at?: string
          measurement_details?: Json | null
          metric_type: string
          metric_value: number
          sample_size?: number | null
          table_name: string
          threshold_value?: number | null
        }
        Update: {
          created_at?: string
          data_source?: string
          id?: string
          is_passing?: boolean
          measured_at?: string
          measurement_details?: Json | null
          metric_type?: string
          metric_value?: number
          sample_size?: number | null
          table_name?: string
          threshold_value?: number | null
        }
        Relationships: []
      }
      data_visualizations: {
        Row: {
          chart_configuration: Json
          chart_type: string
          created_at: string
          data_source_config: Json
          embed_settings: Json | null
          filter_settings: Json | null
          id: string
          is_public: boolean
          is_real_time: boolean
          refresh_settings: Json | null
          shared_with: string[] | null
          updated_at: string
          user_id: string | null
          visualization_name: string
        }
        Insert: {
          chart_configuration?: Json
          chart_type: string
          created_at?: string
          data_source_config: Json
          embed_settings?: Json | null
          filter_settings?: Json | null
          id?: string
          is_public?: boolean
          is_real_time?: boolean
          refresh_settings?: Json | null
          shared_with?: string[] | null
          updated_at?: string
          user_id?: string | null
          visualization_name: string
        }
        Update: {
          chart_configuration?: Json
          chart_type?: string
          created_at?: string
          data_source_config?: Json
          embed_settings?: Json | null
          filter_settings?: Json | null
          id?: string
          is_public?: boolean
          is_real_time?: boolean
          refresh_settings?: Json | null
          shared_with?: string[] | null
          updated_at?: string
          user_id?: string | null
          visualization_name?: string
        }
        Relationships: []
      }
      debt_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_description: string | null
          alert_severity: string
          alert_title: string
          alert_type: string
          created_at: string
          current_value: number | null
          debt_record_id: string | null
          id: string
          is_acknowledged: boolean | null
          threshold_id: string | null
          threshold_value: number | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_description?: string | null
          alert_severity: string
          alert_title: string
          alert_type: string
          created_at?: string
          current_value?: number | null
          debt_record_id?: string | null
          id?: string
          is_acknowledged?: boolean | null
          threshold_id?: string | null
          threshold_value?: number | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_description?: string | null
          alert_severity?: string
          alert_title?: string
          alert_type?: string
          created_at?: string
          current_value?: number | null
          debt_record_id?: string | null
          id?: string
          is_acknowledged?: boolean | null
          threshold_id?: string | null
          threshold_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "debt_alerts_debt_record_id_fkey"
            columns: ["debt_record_id"]
            isOneToOne: false
            referencedRelation: "debt_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debt_alerts_threshold_id_fkey"
            columns: ["threshold_id"]
            isOneToOne: false
            referencedRelation: "debt_thresholds"
            referencedColumns: ["id"]
          },
        ]
      }
      debt_api_logs: {
        Row: {
          api_source: string
          created_at: string
          endpoint_url: string | null
          error_message: string | null
          execution_time_ms: number | null
          id: string
          records_updated: number | null
          request_status: string
          response_data: Json | null
        }
        Insert: {
          api_source: string
          created_at?: string
          endpoint_url?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          records_updated?: number | null
          request_status: string
          response_data?: Json | null
        }
        Update: {
          api_source?: string
          created_at?: string
          endpoint_url?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          records_updated?: number | null
          request_status?: string
          response_data?: Json | null
        }
        Relationships: []
      }
      debt_country_comparisons: {
        Row: {
          country_code: string
          country_name: string
          created_at: string
          data_source: string | null
          debt_per_capita_usd: number | null
          debt_to_gdp_ratio: number | null
          gdp_usd: number | null
          id: string
          population: number | null
          total_debt_usd: number | null
          updated_at: string
          year: number
        }
        Insert: {
          country_code: string
          country_name: string
          created_at?: string
          data_source?: string | null
          debt_per_capita_usd?: number | null
          debt_to_gdp_ratio?: number | null
          gdp_usd?: number | null
          id?: string
          population?: number | null
          total_debt_usd?: number | null
          updated_at?: string
          year: number
        }
        Update: {
          country_code?: string
          country_name?: string
          created_at?: string
          data_source?: string | null
          debt_per_capita_usd?: number | null
          debt_to_gdp_ratio?: number | null
          gdp_usd?: number | null
          id?: string
          population?: number | null
          total_debt_usd?: number | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      debt_creditors: {
        Row: {
          amount_borrowed_fcfa: number
          amount_borrowed_usd: number
          country_code: string | null
          created_at: string | null
          creditor_name: string
          creditor_type: string
          date_borrowed: string
          id: string
          interest_rate: number | null
          loan_purpose: string | null
          loan_purpose_ai_suggested: boolean | null
          loan_status: string
          logo_url: string | null
          maturity_date: string | null
          notes: string | null
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          amount_borrowed_fcfa: number
          amount_borrowed_usd: number
          country_code?: string | null
          created_at?: string | null
          creditor_name: string
          creditor_type: string
          date_borrowed: string
          id?: string
          interest_rate?: number | null
          loan_purpose?: string | null
          loan_purpose_ai_suggested?: boolean | null
          loan_status?: string
          logo_url?: string | null
          maturity_date?: string | null
          notes?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          amount_borrowed_fcfa?: number
          amount_borrowed_usd?: number
          country_code?: string | null
          created_at?: string | null
          creditor_name?: string
          creditor_type?: string
          date_borrowed?: string
          id?: string
          interest_rate?: number | null
          loan_purpose?: string | null
          loan_purpose_ai_suggested?: boolean | null
          loan_status?: string
          logo_url?: string | null
          maturity_date?: string | null
          notes?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      debt_data_comparisons: {
        Row: {
          alert_sent_at: string | null
          alert_triggered: boolean | null
          changes_summary: Json | null
          comparison_date: string
          comparison_metadata: Json | null
          created_at: string
          current_record_id: string | null
          id: string
          previous_record_id: string | null
          significant_changes: boolean | null
          source_id: string
          threshold_violations: string[] | null
        }
        Insert: {
          alert_sent_at?: string | null
          alert_triggered?: boolean | null
          changes_summary?: Json | null
          comparison_date?: string
          comparison_metadata?: Json | null
          created_at?: string
          current_record_id?: string | null
          id?: string
          previous_record_id?: string | null
          significant_changes?: boolean | null
          source_id: string
          threshold_violations?: string[] | null
        }
        Update: {
          alert_sent_at?: string | null
          alert_triggered?: boolean | null
          changes_summary?: Json | null
          comparison_date?: string
          comparison_metadata?: Json | null
          created_at?: string
          current_record_id?: string | null
          id?: string
          previous_record_id?: string | null
          significant_changes?: boolean | null
          source_id?: string
          threshold_violations?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "debt_data_comparisons_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "debt_data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      debt_data_sources: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          last_scraped_at: string | null
          metadata: Json | null
          scraping_frequency: string
          source_name: string
          source_type: string
          source_url: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_scraped_at?: string | null
          metadata?: Json | null
          scraping_frequency?: string
          source_name: string
          source_type?: string
          source_url: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_scraped_at?: string | null
          metadata?: Json | null
          scraping_frequency?: string
          source_name?: string
          source_type?: string
          source_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      debt_documents: {
        Row: {
          created_at: string
          debt_record_id: string | null
          description: string | null
          document_type: string
          file_format: string | null
          file_size: number | null
          file_url: string | null
          id: string
          published_date: string | null
          source_id: string | null
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          debt_record_id?: string | null
          description?: string | null
          document_type: string
          file_format?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          published_date?: string | null
          source_id?: string | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          debt_record_id?: string | null
          description?: string | null
          document_type?: string
          file_format?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          published_date?: string | null
          source_id?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "debt_documents_debt_record_id_fkey"
            columns: ["debt_record_id"]
            isOneToOne: false
            referencedRelation: "debt_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debt_documents_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "debt_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      debt_knowledge_articles: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string | null
          difficulty_level: string | null
          featured_image_url: string | null
          id: string
          is_published: boolean | null
          language: string | null
          reading_time_minutes: number | null
          slug: string
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          created_by?: string | null
          difficulty_level?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean | null
          language?: string | null
          reading_time_minutes?: number | null
          slug: string
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          difficulty_level?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean | null
          language?: string | null
          reading_time_minutes?: number | null
          slug?: string
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      debt_lenders: {
        Row: {
          amount_fcfa: number
          amount_usd: number
          created_at: string
          debt_record_id: string | null
          id: string
          lender_name: string
          lender_type: string
          percentage_of_total: number | null
          updated_at: string
        }
        Insert: {
          amount_fcfa: number
          amount_usd: number
          created_at?: string
          debt_record_id?: string | null
          id?: string
          lender_name: string
          lender_type: string
          percentage_of_total?: number | null
          updated_at?: string
        }
        Update: {
          amount_fcfa?: number
          amount_usd?: number
          created_at?: string
          debt_record_id?: string | null
          id?: string
          lender_name?: string
          lender_type?: string
          percentage_of_total?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "debt_lenders_debt_record_id_fkey"
            columns: ["debt_record_id"]
            isOneToOne: false
            referencedRelation: "debt_records"
            referencedColumns: ["id"]
          },
        ]
      }
      debt_milestones: {
        Row: {
          created_at: string
          created_by: string | null
          debt_record_id: string | null
          description: string | null
          id: string
          impact_level: string | null
          metadata: Json | null
          milestone_date: string
          milestone_type: string
          source_document_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          debt_record_id?: string | null
          description?: string | null
          id?: string
          impact_level?: string | null
          metadata?: Json | null
          milestone_date: string
          milestone_type: string
          source_document_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          debt_record_id?: string | null
          description?: string | null
          id?: string
          impact_level?: string | null
          metadata?: Json | null
          milestone_date?: string
          milestone_type?: string
          source_document_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "debt_milestones_debt_record_id_fkey"
            columns: ["debt_record_id"]
            isOneToOne: false
            referencedRelation: "debt_records"
            referencedColumns: ["id"]
          },
        ]
      }
      debt_news: {
        Row: {
          author: string | null
          content: string
          created_at: string
          created_by: string | null
          debt_record_id: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          published_at: string | null
          source_url: string | null
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          debt_record_id?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          published_at?: string | null
          source_url?: string | null
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          debt_record_id?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          published_at?: string | null
          source_url?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "debt_news_debt_record_id_fkey"
            columns: ["debt_record_id"]
            isOneToOne: false
            referencedRelation: "debt_records"
            referencedColumns: ["id"]
          },
        ]
      }
      debt_predictions: {
        Row: {
          confidence_level: number | null
          created_at: string
          created_by_ai: boolean | null
          factors_considered: Json | null
          id: string
          predicted_debt_to_gdp: number | null
          predicted_total_debt_fcfa: number | null
          predicted_total_debt_usd: number | null
          prediction_date: string
          prediction_model: string | null
        }
        Insert: {
          confidence_level?: number | null
          created_at?: string
          created_by_ai?: boolean | null
          factors_considered?: Json | null
          id?: string
          predicted_debt_to_gdp?: number | null
          predicted_total_debt_fcfa?: number | null
          predicted_total_debt_usd?: number | null
          prediction_date: string
          prediction_model?: string | null
        }
        Update: {
          confidence_level?: number | null
          created_at?: string
          created_by_ai?: boolean | null
          factors_considered?: Json | null
          id?: string
          predicted_debt_to_gdp?: number | null
          predicted_total_debt_fcfa?: number | null
          predicted_total_debt_usd?: number | null
          prediction_date?: string
          prediction_model?: string | null
        }
        Relationships: []
      }
      debt_records: {
        Row: {
          ai_analysis_summary: string | null
          created_at: string
          created_by: string | null
          debt_to_gdp_ratio: number | null
          external_debt_fcfa: number
          gdp_fcfa: number | null
          gdp_value_fcfa: number | null
          id: string
          internal_debt_fcfa: number
          milestone_events: Json | null
          monthly_change_percentage: number | null
          notes: string | null
          population: number | null
          population_count: number | null
          prediction_data: Json | null
          risk_level: string | null
          total_debt_fcfa: number
          total_debt_usd: number
          updated_at: string
          verified: boolean | null
          year: number
        }
        Insert: {
          ai_analysis_summary?: string | null
          created_at?: string
          created_by?: string | null
          debt_to_gdp_ratio?: number | null
          external_debt_fcfa?: number
          gdp_fcfa?: number | null
          gdp_value_fcfa?: number | null
          id?: string
          internal_debt_fcfa?: number
          milestone_events?: Json | null
          monthly_change_percentage?: number | null
          notes?: string | null
          population?: number | null
          population_count?: number | null
          prediction_data?: Json | null
          risk_level?: string | null
          total_debt_fcfa: number
          total_debt_usd: number
          updated_at?: string
          verified?: boolean | null
          year: number
        }
        Update: {
          ai_analysis_summary?: string | null
          created_at?: string
          created_by?: string | null
          debt_to_gdp_ratio?: number | null
          external_debt_fcfa?: number
          gdp_fcfa?: number | null
          gdp_value_fcfa?: number | null
          id?: string
          internal_debt_fcfa?: number
          milestone_events?: Json | null
          monthly_change_percentage?: number | null
          notes?: string | null
          population?: number | null
          population_count?: number | null
          prediction_data?: Json | null
          risk_level?: string | null
          total_debt_fcfa?: number
          total_debt_usd?: number
          updated_at?: string
          verified?: boolean | null
          year?: number
        }
        Relationships: []
      }
      debt_refresh_logs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          records_updated: number | null
          refresh_type: string
          sources_scraped: string[] | null
          started_at: string | null
          status: string
          triggered_by: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          records_updated?: number | null
          refresh_type: string
          sources_scraped?: string[] | null
          started_at?: string | null
          status?: string
          triggered_by?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          records_updated?: number | null
          refresh_type?: string
          sources_scraped?: string[] | null
          started_at?: string | null
          status?: string
          triggered_by?: string | null
        }
        Relationships: []
      }
      debt_scraping_results: {
        Row: {
          borrowing_purposes: string[] | null
          changes_detected: boolean | null
          comparison_with_previous: Json | null
          created_at: string
          creditors_found: string[] | null
          data_quality_score: number | null
          error_message: string | null
          id: string
          metadata: Json | null
          parsed_data: Json | null
          raw_data: Json | null
          scraping_date: string
          source_id: string
          status: string
          total_debt_detected: number | null
        }
        Insert: {
          borrowing_purposes?: string[] | null
          changes_detected?: boolean | null
          comparison_with_previous?: Json | null
          created_at?: string
          creditors_found?: string[] | null
          data_quality_score?: number | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          parsed_data?: Json | null
          raw_data?: Json | null
          scraping_date?: string
          source_id: string
          status?: string
          total_debt_detected?: number | null
        }
        Update: {
          borrowing_purposes?: string[] | null
          changes_detected?: boolean | null
          comparison_with_previous?: Json | null
          created_at?: string
          creditors_found?: string[] | null
          data_quality_score?: number | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          parsed_data?: Json | null
          raw_data?: Json | null
          scraping_date?: string
          source_id?: string
          status?: string
          total_debt_detected?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "debt_scraping_results_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "debt_data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      debt_sentiment_data: {
        Row: {
          confidence_level: number | null
          created_at: string
          date_recorded: string
          id: string
          keyword_topic: string
          mention_count: number | null
          metadata: Json | null
          platform: string
          sample_text: string | null
          sentiment_label: string | null
          sentiment_score: number | null
        }
        Insert: {
          confidence_level?: number | null
          created_at?: string
          date_recorded?: string
          id?: string
          keyword_topic: string
          mention_count?: number | null
          metadata?: Json | null
          platform: string
          sample_text?: string | null
          sentiment_label?: string | null
          sentiment_score?: number | null
        }
        Update: {
          confidence_level?: number | null
          created_at?: string
          date_recorded?: string
          id?: string
          keyword_topic?: string
          mention_count?: number | null
          metadata?: Json | null
          platform?: string
          sample_text?: string | null
          sentiment_label?: string | null
          sentiment_score?: number | null
        }
        Relationships: []
      }
      debt_sources: {
        Row: {
          acronym: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          last_refreshed: string | null
          logo_url: string | null
          name: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          acronym?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_refreshed?: string | null
          logo_url?: string | null
          name: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          acronym?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_refreshed?: string | null
          logo_url?: string | null
          name?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      debt_thresholds: {
        Row: {
          alert_severity: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          notification_channels: string[] | null
          threshold_name: string
          threshold_type: string
          threshold_value: number
          updated_at: string
        }
        Insert: {
          alert_severity?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          notification_channels?: string[] | null
          threshold_name: string
          threshold_type: string
          threshold_value: number
          updated_at?: string
        }
        Update: {
          alert_severity?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          notification_channels?: string[] | null
          threshold_name?: string
          threshold_type?: string
          threshold_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      development_projects: {
        Row: {
          actual_completion_date: string | null
          citizen_feedback_score: number | null
          communities_affected: string[] | null
          created_at: string
          current_status: string | null
          description: string | null
          disbursed_amount: number | null
          expected_completion_date: string | null
          funding_source: string
          id: string
          impact_metrics: Json | null
          implementing_agency: string
          progress_percentage: number | null
          project_name: string
          project_type: string
          region: string
          start_date: string | null
          total_budget: number
          total_feedback_count: number | null
          transparency_rating: number | null
          updated_at: string
        }
        Insert: {
          actual_completion_date?: string | null
          citizen_feedback_score?: number | null
          communities_affected?: string[] | null
          created_at?: string
          current_status?: string | null
          description?: string | null
          disbursed_amount?: number | null
          expected_completion_date?: string | null
          funding_source: string
          id?: string
          impact_metrics?: Json | null
          implementing_agency: string
          progress_percentage?: number | null
          project_name: string
          project_type: string
          region: string
          start_date?: string | null
          total_budget: number
          total_feedback_count?: number | null
          transparency_rating?: number | null
          updated_at?: string
        }
        Update: {
          actual_completion_date?: string | null
          citizen_feedback_score?: number | null
          communities_affected?: string[] | null
          created_at?: string
          current_status?: string | null
          description?: string | null
          disbursed_amount?: number | null
          expected_completion_date?: string | null
          funding_source?: string
          id?: string
          impact_metrics?: Json | null
          implementing_agency?: string
          progress_percentage?: number | null
          project_name?: string
          project_type?: string
          region?: string
          start_date?: string | null
          total_budget?: number
          total_feedback_count?: number | null
          transparency_rating?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      digital_badges: {
        Row: {
          badge_type: string
          created_at: string | null
          description: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          name: string
          points_cost: number | null
          rarity: string | null
          unlock_criteria: Json | null
        }
        Insert: {
          badge_type?: string
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points_cost?: number | null
          rarity?: string | null
          unlock_criteria?: Json | null
        }
        Update: {
          badge_type?: string
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points_cost?: number | null
          rarity?: string | null
          unlock_criteria?: Json | null
        }
        Relationships: []
      }
      discussion_replies: {
        Row: {
          content: string
          created_at: string
          discussion_id: string
          id: string
          is_solution: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          discussion_id: string
          id?: string
          is_solution?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          discussion_id?: string
          id?: string
          is_solution?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_replies_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "village_discussions"
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
      early_warning_system: {
        Row: {
          affected_demographics: string[] | null
          affected_regions: string[] | null
          created_at: string
          created_by: string | null
          current_indicators: Json
          description: string
          escalation_level: number
          id: string
          resolution_timeline: string | null
          resolved_at: string | null
          response_actions: Json | null
          severity: Database["public"]["Enums"]["alert_severity"]
          stakeholders_notified: string[] | null
          status: string
          threshold_reached: boolean
          title: string
          trigger_conditions: Json
          updated_at: string
          warning_type: string
        }
        Insert: {
          affected_demographics?: string[] | null
          affected_regions?: string[] | null
          created_at?: string
          created_by?: string | null
          current_indicators: Json
          description: string
          escalation_level?: number
          id?: string
          resolution_timeline?: string | null
          resolved_at?: string | null
          response_actions?: Json | null
          severity: Database["public"]["Enums"]["alert_severity"]
          stakeholders_notified?: string[] | null
          status?: string
          threshold_reached?: boolean
          title: string
          trigger_conditions: Json
          updated_at?: string
          warning_type: string
        }
        Update: {
          affected_demographics?: string[] | null
          affected_regions?: string[] | null
          created_at?: string
          created_by?: string | null
          current_indicators?: Json
          description?: string
          escalation_level?: number
          id?: string
          resolution_timeline?: string | null
          resolved_at?: string | null
          response_actions?: Json | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          stakeholders_notified?: string[] | null
          status?: string
          threshold_reached?: boolean
          title?: string
          trigger_conditions?: Json
          updated_at?: string
          warning_type?: string
        }
        Relationships: []
      }
      economic_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          action_required: string | null
          affected_region: string | null
          alert_type: string
          auto_generated: boolean | null
          created_at: string
          current_value: number | null
          description: string
          id: string
          is_acknowledged: boolean | null
          related_indicator: string | null
          responsible_agency: string | null
          severity: string
          threshold_value: number | null
          title: string
          trend_direction: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          action_required?: string | null
          affected_region?: string | null
          alert_type: string
          auto_generated?: boolean | null
          created_at?: string
          current_value?: number | null
          description: string
          id?: string
          is_acknowledged?: boolean | null
          related_indicator?: string | null
          responsible_agency?: string | null
          severity?: string
          threshold_value?: number | null
          title: string
          trend_direction?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          action_required?: string | null
          affected_region?: string | null
          alert_type?: string
          auto_generated?: boolean | null
          created_at?: string
          current_value?: number | null
          description?: string
          id?: string
          is_acknowledged?: boolean | null
          related_indicator?: string | null
          responsible_agency?: string | null
          severity?: string
          threshold_value?: number | null
          title?: string
          trend_direction?: string | null
        }
        Relationships: []
      }
      economic_indicators: {
        Row: {
          created_at: string
          data_source: string
          id: string
          indicator_name: string
          indicator_type: string
          measurement_date: string
          notes: string | null
          region: string
          reliability_score: number | null
          unit: string
          updated_at: string
          value: number
        }
        Insert: {
          created_at?: string
          data_source: string
          id?: string
          indicator_name: string
          indicator_type: string
          measurement_date: string
          notes?: string | null
          region: string
          reliability_score?: number | null
          unit: string
          updated_at?: string
          value: number
        }
        Update: {
          created_at?: string
          data_source?: string
          id?: string
          indicator_name?: string
          indicator_type?: string
          measurement_date?: string
          notes?: string | null
          region?: string
          reliability_score?: number | null
          unit?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      economic_insights: {
        Row: {
          analysis_period_end: string | null
          analysis_period_start: string | null
          confidence_level: number | null
          created_at: string
          created_by: string | null
          data_sources: string[] | null
          economic_impact_rating: number | null
          id: string
          insight_title: string
          insight_type: string
          is_published: boolean | null
          key_findings: string
          methodology: string | null
          policy_recommendations: string | null
          region_focus: string | null
          sector_focus: string | null
          updated_at: string
          views_count: number | null
        }
        Insert: {
          analysis_period_end?: string | null
          analysis_period_start?: string | null
          confidence_level?: number | null
          created_at?: string
          created_by?: string | null
          data_sources?: string[] | null
          economic_impact_rating?: number | null
          id?: string
          insight_title: string
          insight_type: string
          is_published?: boolean | null
          key_findings: string
          methodology?: string | null
          policy_recommendations?: string | null
          region_focus?: string | null
          sector_focus?: string | null
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          analysis_period_end?: string | null
          analysis_period_start?: string | null
          confidence_level?: number | null
          created_at?: string
          created_by?: string | null
          data_sources?: string[] | null
          economic_impact_rating?: number | null
          id?: string
          insight_title?: string
          insight_type?: string
          is_published?: boolean | null
          key_findings?: string
          methodology?: string | null
          policy_recommendations?: string | null
          region_focus?: string | null
          sector_focus?: string | null
          updated_at?: string
          views_count?: number | null
        }
        Relationships: []
      }
      election_calendars: {
        Row: {
          affected_regions: string[] | null
          campaign_end_date: string | null
          campaign_start_date: string | null
          created_at: string | null
          description: string | null
          election_date: string
          election_type: string
          id: string
          official_source_url: string | null
          registration_deadline: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          affected_regions?: string[] | null
          campaign_end_date?: string | null
          campaign_start_date?: string | null
          created_at?: string | null
          description?: string | null
          election_date: string
          election_type: string
          id?: string
          official_source_url?: string | null
          registration_deadline?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          affected_regions?: string[] | null
          campaign_end_date?: string | null
          campaign_start_date?: string | null
          created_at?: string | null
          description?: string | null
          election_date?: string
          election_type?: string
          id?: string
          official_source_url?: string | null
          registration_deadline?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      election_disinformation_alerts: {
        Row: {
          amplification_indicators: Json | null
          author_handle: string | null
          content_id: string | null
          content_text: string
          content_type: string | null
          counter_narrative_deployed: boolean | null
          created_at: string | null
          credibility_score: number | null
          disinformation_category: string
          election_calendar_id: string | null
          emotional_manipulation_detected: boolean | null
          engagement_metrics: Json | null
          estimated_reach: number | null
          fact_check_sources: string[] | null
          fact_check_status: string | null
          id: string
          platform: string
          regions_affected: string[] | null
          takedown_requested: boolean | null
          takedown_status: string | null
          target_candidate: string | null
          target_party: string | null
          updated_at: string | null
          virality_score: number | null
        }
        Insert: {
          amplification_indicators?: Json | null
          author_handle?: string | null
          content_id?: string | null
          content_text: string
          content_type?: string | null
          counter_narrative_deployed?: boolean | null
          created_at?: string | null
          credibility_score?: number | null
          disinformation_category: string
          election_calendar_id?: string | null
          emotional_manipulation_detected?: boolean | null
          engagement_metrics?: Json | null
          estimated_reach?: number | null
          fact_check_sources?: string[] | null
          fact_check_status?: string | null
          id?: string
          platform: string
          regions_affected?: string[] | null
          takedown_requested?: boolean | null
          takedown_status?: string | null
          target_candidate?: string | null
          target_party?: string | null
          updated_at?: string | null
          virality_score?: number | null
        }
        Update: {
          amplification_indicators?: Json | null
          author_handle?: string | null
          content_id?: string | null
          content_text?: string
          content_type?: string | null
          counter_narrative_deployed?: boolean | null
          created_at?: string | null
          credibility_score?: number | null
          disinformation_category?: string
          election_calendar_id?: string | null
          emotional_manipulation_detected?: boolean | null
          engagement_metrics?: Json | null
          estimated_reach?: number | null
          fact_check_sources?: string[] | null
          fact_check_status?: string | null
          id?: string
          platform?: string
          regions_affected?: string[] | null
          takedown_requested?: boolean | null
          takedown_status?: string | null
          target_candidate?: string | null
          target_party?: string | null
          updated_at?: string | null
          virality_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "election_disinformation_alerts_election_calendar_id_fkey"
            columns: ["election_calendar_id"]
            isOneToOne: false
            referencedRelation: "election_calendars"
            referencedColumns: ["id"]
          },
        ]
      }
      election_forecasts: {
        Row: {
          confidence_interval_lower: number | null
          confidence_interval_upper: number | null
          created_at: string | null
          demographic_group: string | null
          election_type: string
          forecast_date: string
          id: string
          methodology: string | null
          party_name: string | null
          predicted_vote_percentage: number
          region: string | null
          sample_size: number | null
          updated_at: string | null
        }
        Insert: {
          confidence_interval_lower?: number | null
          confidence_interval_upper?: number | null
          created_at?: string | null
          demographic_group?: string | null
          election_type?: string
          forecast_date?: string
          id?: string
          methodology?: string | null
          party_name?: string | null
          predicted_vote_percentage: number
          region?: string | null
          sample_size?: number | null
          updated_at?: string | null
        }
        Update: {
          confidence_interval_lower?: number | null
          confidence_interval_upper?: number | null
          created_at?: string | null
          demographic_group?: string | null
          election_type?: string
          forecast_date?: string
          id?: string
          methodology?: string | null
          party_name?: string | null
          predicted_vote_percentage?: number
          region?: string | null
          sample_size?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      election_interference_alerts: {
        Row: {
          action_taken: string | null
          affected_regions: string[] | null
          alert_type: string
          confidence_score: number | null
          created_at: string | null
          description: string
          election_calendar_id: string | null
          escalation_status: string | null
          evidence_urls: string[] | null
          id: string
          phase: string
          related_content_ids: string[] | null
          resolved_at: string | null
          responsible_agency: string | null
          sentiment_impact_data: Json | null
          severity: string | null
          source_type: string | null
          threat_indicators: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          action_taken?: string | null
          affected_regions?: string[] | null
          alert_type: string
          confidence_score?: number | null
          created_at?: string | null
          description: string
          election_calendar_id?: string | null
          escalation_status?: string | null
          evidence_urls?: string[] | null
          id?: string
          phase: string
          related_content_ids?: string[] | null
          resolved_at?: string | null
          responsible_agency?: string | null
          sentiment_impact_data?: Json | null
          severity?: string | null
          source_type?: string | null
          threat_indicators?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          action_taken?: string | null
          affected_regions?: string[] | null
          alert_type?: string
          confidence_score?: number | null
          created_at?: string | null
          description?: string
          election_calendar_id?: string | null
          escalation_status?: string | null
          evidence_urls?: string[] | null
          id?: string
          phase?: string
          related_content_ids?: string[] | null
          resolved_at?: string | null
          responsible_agency?: string | null
          sentiment_impact_data?: Json | null
          severity?: string | null
          source_type?: string | null
          threat_indicators?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "election_interference_alerts_election_calendar_id_fkey"
            columns: ["election_calendar_id"]
            isOneToOne: false
            referencedRelation: "election_calendars"
            referencedColumns: ["id"]
          },
        ]
      }
      election_phase_configs: {
        Row: {
          alert_thresholds: Json | null
          automated_responses: Json | null
          created_at: string | null
          election_calendar_id: string | null
          escalation_rules: Json | null
          id: string
          is_active: boolean | null
          monitoring_intensity: string | null
          monitoring_keywords: string[] | null
          phase: string
          sensitive_regions: string[] | null
          special_instructions: string | null
          updated_at: string | null
        }
        Insert: {
          alert_thresholds?: Json | null
          automated_responses?: Json | null
          created_at?: string | null
          election_calendar_id?: string | null
          escalation_rules?: Json | null
          id?: string
          is_active?: boolean | null
          monitoring_intensity?: string | null
          monitoring_keywords?: string[] | null
          phase: string
          sensitive_regions?: string[] | null
          special_instructions?: string | null
          updated_at?: string | null
        }
        Update: {
          alert_thresholds?: Json | null
          automated_responses?: Json | null
          created_at?: string | null
          election_calendar_id?: string | null
          escalation_rules?: Json | null
          id?: string
          is_active?: boolean | null
          monitoring_intensity?: string | null
          monitoring_keywords?: string[] | null
          phase?: string
          sensitive_regions?: string[] | null
          special_instructions?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "election_phase_configs_election_calendar_id_fkey"
            columns: ["election_calendar_id"]
            isOneToOne: false
            referencedRelation: "election_calendars"
            referencedColumns: ["id"]
          },
        ]
      }
      election_threat_index: {
        Row: {
          contributing_factors: Json | null
          created_at: string | null
          date_recorded: string | null
          disinformation_score: number | null
          division: string | null
          election_calendar_id: string | null
          escalation_triggers: string[] | null
          id: string
          last_incident_date: string | null
          network_interference_score: number | null
          overall_threat_score: number | null
          recommended_actions: string[] | null
          region: string
          sentiment_volatility_score: number | null
          suppression_risk_score: number | null
          threat_level: string | null
          updated_at: string | null
          violence_risk_score: number | null
        }
        Insert: {
          contributing_factors?: Json | null
          created_at?: string | null
          date_recorded?: string | null
          disinformation_score?: number | null
          division?: string | null
          election_calendar_id?: string | null
          escalation_triggers?: string[] | null
          id?: string
          last_incident_date?: string | null
          network_interference_score?: number | null
          overall_threat_score?: number | null
          recommended_actions?: string[] | null
          region: string
          sentiment_volatility_score?: number | null
          suppression_risk_score?: number | null
          threat_level?: string | null
          updated_at?: string | null
          violence_risk_score?: number | null
        }
        Update: {
          contributing_factors?: Json | null
          created_at?: string | null
          date_recorded?: string | null
          disinformation_score?: number | null
          division?: string | null
          election_calendar_id?: string | null
          escalation_triggers?: string[] | null
          id?: string
          last_incident_date?: string | null
          network_interference_score?: number | null
          overall_threat_score?: number | null
          recommended_actions?: string[] | null
          region?: string
          sentiment_volatility_score?: number | null
          suppression_risk_score?: number | null
          threat_level?: string | null
          updated_at?: string | null
          violence_risk_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "election_threat_index_election_calendar_id_fkey"
            columns: ["election_calendar_id"]
            isOneToOne: false
            referencedRelation: "election_calendars"
            referencedColumns: ["id"]
          },
        ]
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
      engagement_activities: {
        Row: {
          activity_date: string
          activity_type: Database["public"]["Enums"]["engagement_activity_type"]
          category: Database["public"]["Enums"]["engagement_category"]
          created_at: string
          created_by: string | null
          description: string | null
          evidence_attachments: string[] | null
          id: string
          impact_score: number
          location: string | null
          metadata: Json | null
          politician_id: string
          source_type: string
          source_url: string | null
          title: string
          updated_at: string
          verified: boolean
        }
        Insert: {
          activity_date?: string
          activity_type: Database["public"]["Enums"]["engagement_activity_type"]
          category: Database["public"]["Enums"]["engagement_category"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          evidence_attachments?: string[] | null
          id?: string
          impact_score?: number
          location?: string | null
          metadata?: Json | null
          politician_id: string
          source_type?: string
          source_url?: string | null
          title: string
          updated_at?: string
          verified?: boolean
        }
        Update: {
          activity_date?: string
          activity_type?: Database["public"]["Enums"]["engagement_activity_type"]
          category?: Database["public"]["Enums"]["engagement_category"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          evidence_attachments?: string[] | null
          id?: string
          impact_score?: number
          location?: string | null
          metadata?: Json | null
          politician_id?: string
          source_type?: string
          source_url?: string | null
          title?: string
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
      }
      engagement_monitoring_sources: {
        Row: {
          check_frequency_hours: number
          created_at: string
          id: string
          is_active: boolean
          last_checked_at: string | null
          metadata: Json | null
          platform: string
          politician_id: string
          source_type: string
          source_url: string
          updated_at: string
        }
        Insert: {
          check_frequency_hours?: number
          created_at?: string
          id?: string
          is_active?: boolean
          last_checked_at?: string | null
          metadata?: Json | null
          platform: string
          politician_id: string
          source_type: string
          source_url: string
          updated_at?: string
        }
        Update: {
          check_frequency_hours?: number
          created_at?: string
          id?: string
          is_active?: boolean
          last_checked_at?: string | null
          metadata?: Json | null
          platform?: string
          politician_id?: string
          source_type?: string
          source_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      engagement_score_history: {
        Row: {
          activities_count: number
          communication_score: number
          constituency_outreach_score: number
          created_at: string
          id: string
          overall_score: number
          participation_score: number
          policy_advocacy_score: number
          politician_id: string
          public_visibility_score: number
          score_date: string
        }
        Insert: {
          activities_count?: number
          communication_score: number
          constituency_outreach_score: number
          created_at?: string
          id?: string
          overall_score: number
          participation_score: number
          policy_advocacy_score: number
          politician_id: string
          public_visibility_score: number
          score_date?: string
        }
        Update: {
          activities_count?: number
          communication_score?: number
          constituency_outreach_score?: number
          created_at?: string
          id?: string
          overall_score?: number
          participation_score?: number
          policy_advocacy_score?: number
          politician_id?: string
          public_visibility_score?: number
          score_date?: string
        }
        Relationships: []
      }
      enhanced_poll_config: {
        Row: {
          advanced_analytics: boolean
          ai_moderation: boolean
          anonymous_voting: boolean
          created_at: string
          custom_fields: Json | null
          demographic_targeting: Json | null
          geographic_restrictions: string[] | null
          id: string
          max_participants: number | null
          poll_id: string
          real_time_results: boolean
          requires_verification: boolean
          security_level: Database["public"]["Enums"]["poll_security_level"]
          updated_at: string
          weighted_voting: boolean
        }
        Insert: {
          advanced_analytics?: boolean
          ai_moderation?: boolean
          anonymous_voting?: boolean
          created_at?: string
          custom_fields?: Json | null
          demographic_targeting?: Json | null
          geographic_restrictions?: string[] | null
          id?: string
          max_participants?: number | null
          poll_id: string
          real_time_results?: boolean
          requires_verification?: boolean
          security_level?: Database["public"]["Enums"]["poll_security_level"]
          updated_at?: string
          weighted_voting?: boolean
        }
        Update: {
          advanced_analytics?: boolean
          ai_moderation?: boolean
          anonymous_voting?: boolean
          created_at?: string
          custom_fields?: Json | null
          demographic_targeting?: Json | null
          geographic_restrictions?: string[] | null
          id?: string
          max_participants?: number | null
          poll_id?: string
          real_time_results?: boolean
          requires_verification?: boolean
          security_level?: Database["public"]["Enums"]["poll_security_level"]
          updated_at?: string
          weighted_voting?: boolean
        }
        Relationships: []
      }
      event_agenda: {
        Row: {
          agenda_description: string | null
          agenda_order: number | null
          agenda_time: string
          agenda_title: string
          created_at: string | null
          duration_minutes: number | null
          event_id: string
          id: string
          speaker_id: string | null
          updated_at: string | null
        }
        Insert: {
          agenda_description?: string | null
          agenda_order?: number | null
          agenda_time: string
          agenda_title: string
          created_at?: string | null
          duration_minutes?: number | null
          event_id: string
          id?: string
          speaker_id?: string | null
          updated_at?: string | null
        }
        Update: {
          agenda_description?: string | null
          agenda_order?: number | null
          agenda_time?: string
          agenda_title?: string
          created_at?: string | null
          duration_minutes?: number | null
          event_id?: string
          id?: string
          speaker_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_agenda_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_agenda_speaker_id_fkey"
            columns: ["speaker_id"]
            isOneToOne: false
            referencedRelation: "event_speakers"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendees: {
        Row: {
          attendance_status: string
          event_id: string
          id: string
          registered_at: string
          user_id: string
        }
        Insert: {
          attendance_status?: string
          event_id: string
          id?: string
          registered_at?: string
          user_id: string
        }
        Update: {
          attendance_status?: string
          event_id?: string
          id?: string
          registered_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "village_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_certificate_settings: {
        Row: {
          auto_issue: boolean | null
          certificate_message: string | null
          certificates_enabled: boolean | null
          claim_deadline: string | null
          created_at: string | null
          custom_template_config: Json | null
          event_id: string | null
          id: string
          manual_approval_required: boolean | null
          organizer_signature_url: string | null
          require_checkin: boolean | null
          template_design:
            | Database["public"]["Enums"]["certificate_template"]
            | null
          updated_at: string | null
        }
        Insert: {
          auto_issue?: boolean | null
          certificate_message?: string | null
          certificates_enabled?: boolean | null
          claim_deadline?: string | null
          created_at?: string | null
          custom_template_config?: Json | null
          event_id?: string | null
          id?: string
          manual_approval_required?: boolean | null
          organizer_signature_url?: string | null
          require_checkin?: boolean | null
          template_design?:
            | Database["public"]["Enums"]["certificate_template"]
            | null
          updated_at?: string | null
        }
        Update: {
          auto_issue?: boolean | null
          certificate_message?: string | null
          certificates_enabled?: boolean | null
          claim_deadline?: string | null
          created_at?: string | null
          custom_template_config?: Json | null
          event_id?: string | null
          id?: string
          manual_approval_required?: boolean | null
          organizer_signature_url?: string | null
          require_checkin?: boolean | null
          template_design?:
            | Database["public"]["Enums"]["certificate_template"]
            | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_certificate_settings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "civic_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_certificates: {
        Row: {
          certificate_hash: string | null
          certificate_status: Database["public"]["Enums"]["certificate_status"]
          certificate_title: string | null
          certificate_type: Database["public"]["Enums"]["certificate_type"]
          certificate_url: string | null
          created_at: string | null
          custom_text: string | null
          download_count: number | null
          downloaded_at: string | null
          event_id: string
          expiry_date: string | null
          id: string
          is_verified: boolean | null
          issued_at: string | null
          issued_by: string | null
          organizer_name: string | null
          organizer_signature_url: string | null
          qr_code_url: string | null
          recipient_name: string
          recipient_role: string | null
          template_design: Database["public"]["Enums"]["certificate_template"]
          updated_at: string | null
          user_id: string
          verification_code: string | null
        }
        Insert: {
          certificate_hash?: string | null
          certificate_status?: Database["public"]["Enums"]["certificate_status"]
          certificate_title?: string | null
          certificate_type?: Database["public"]["Enums"]["certificate_type"]
          certificate_url?: string | null
          created_at?: string | null
          custom_text?: string | null
          download_count?: number | null
          downloaded_at?: string | null
          event_id: string
          expiry_date?: string | null
          id?: string
          is_verified?: boolean | null
          issued_at?: string | null
          issued_by?: string | null
          organizer_name?: string | null
          organizer_signature_url?: string | null
          qr_code_url?: string | null
          recipient_name?: string
          recipient_role?: string | null
          template_design?: Database["public"]["Enums"]["certificate_template"]
          updated_at?: string | null
          user_id: string
          verification_code?: string | null
        }
        Update: {
          certificate_hash?: string | null
          certificate_status?: Database["public"]["Enums"]["certificate_status"]
          certificate_title?: string | null
          certificate_type?: Database["public"]["Enums"]["certificate_type"]
          certificate_url?: string | null
          created_at?: string | null
          custom_text?: string | null
          download_count?: number | null
          downloaded_at?: string | null
          event_id?: string
          expiry_date?: string | null
          id?: string
          is_verified?: boolean | null
          issued_at?: string | null
          issued_by?: string | null
          organizer_name?: string | null
          organizer_signature_url?: string | null
          qr_code_url?: string | null
          recipient_name?: string
          recipient_role?: string | null
          template_design?: Database["public"]["Enums"]["certificate_template"]
          updated_at?: string | null
          user_id?: string
          verification_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_certificates_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_chat_messages: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          is_deleted: boolean | null
          message_content: string
          reply_to_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          is_deleted?: boolean | null
          message_content: string
          reply_to_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          is_deleted?: boolean | null
          message_content?: string
          reply_to_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_chat_messages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_chat_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "event_chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      event_check_ins: {
        Row: {
          check_in_device: string | null
          check_in_location: string | null
          check_in_time: string | null
          checked_in_by: string | null
          created_at: string | null
          event_id: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["check_in_status"] | null
          ticket_purchase_id: string
        }
        Insert: {
          check_in_device?: string | null
          check_in_location?: string | null
          check_in_time?: string | null
          checked_in_by?: string | null
          created_at?: string | null
          event_id: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["check_in_status"] | null
          ticket_purchase_id: string
        }
        Update: {
          check_in_device?: string | null
          check_in_location?: string | null
          check_in_time?: string | null
          checked_in_by?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["check_in_status"] | null
          ticket_purchase_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_check_ins_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_check_ins_ticket_purchase_id_fkey"
            columns: ["ticket_purchase_id"]
            isOneToOne: false
            referencedRelation: "ticket_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      event_earnings: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          organizer_earnings: number
          organizer_id: string
          payout_date: string | null
          payout_reference: string | null
          payout_status: string | null
          platform_commission: number
          tickets_sold: number | null
          total_sales: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          organizer_earnings?: number
          organizer_id: string
          payout_date?: string | null
          payout_reference?: string | null
          payout_status?: string | null
          platform_commission?: number
          tickets_sold?: number | null
          total_sales?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          organizer_earnings?: number
          organizer_id?: string
          payout_date?: string | null
          payout_reference?: string | null
          payout_status?: string | null
          platform_commission?: number
          tickets_sold?: number | null
          total_sales?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_earnings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_feedback: {
        Row: {
          civic_impact_felt: boolean | null
          content_rating: number | null
          created_at: string
          event_id: string
          feedback_text: string | null
          id: string
          learned_something_new: boolean | null
          organization_rating: number | null
          overall_rating: number | null
          user_id: string
          venue_rating: number | null
          will_take_action: boolean | null
          would_recommend: boolean | null
        }
        Insert: {
          civic_impact_felt?: boolean | null
          content_rating?: number | null
          created_at?: string
          event_id: string
          feedback_text?: string | null
          id?: string
          learned_something_new?: boolean | null
          organization_rating?: number | null
          overall_rating?: number | null
          user_id: string
          venue_rating?: number | null
          will_take_action?: boolean | null
          would_recommend?: boolean | null
        }
        Update: {
          civic_impact_felt?: boolean | null
          content_rating?: number | null
          created_at?: string
          event_id?: string
          feedback_text?: string | null
          id?: string
          learned_something_new?: boolean | null
          organization_rating?: number | null
          overall_rating?: number | null
          user_id?: string
          venue_rating?: number | null
          will_take_action?: boolean | null
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "event_feedback_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "civic_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_linked_content: {
        Row: {
          content_description: string | null
          content_id: string | null
          content_title: string | null
          content_type: string
          content_url: string | null
          created_at: string
          created_by: string | null
          event_id: string
          id: string
        }
        Insert: {
          content_description?: string | null
          content_id?: string | null
          content_title?: string | null
          content_type: string
          content_url?: string | null
          created_at?: string
          created_by?: string | null
          event_id: string
          id?: string
        }
        Update: {
          content_description?: string | null
          content_id?: string | null
          content_title?: string | null
          content_type?: string
          content_url?: string | null
          created_at?: string
          created_by?: string | null
          event_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_linked_content_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "civic_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_live_updates: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          is_featured: boolean | null
          posted_by: string
          update_content: string
          update_title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          is_featured?: boolean | null
          posted_by: string
          update_content: string
          update_title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          is_featured?: boolean | null
          posted_by?: string
          update_content?: string
          update_title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_live_updates_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_organizers: {
        Row: {
          created_at: string
          event_id: string
          id: string
          organizer_id: string
          organizer_type: Database["public"]["Enums"]["organizer_type"]
          permissions: Json | null
          role: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          organizer_id: string
          organizer_type: Database["public"]["Enums"]["organizer_type"]
          permissions?: Json | null
          role?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          organizer_id?: string
          organizer_type?: Database["public"]["Enums"]["organizer_type"]
          permissions?: Json | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_organizers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "civic_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          event_id: string
          id: string
          report_category: string
          report_details: string | null
          report_reason: string
          reported_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          event_id: string
          id?: string
          report_category: string
          report_details?: string | null
          report_reason: string
          reported_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          event_id?: string
          id?: string
          report_category?: string
          report_details?: string | null
          report_reason?: string
          reported_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_reports_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "civic_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          contact_phone: string | null
          created_at: string
          dietary_requirements: string | null
          event_id: string
          id: string
          notes: string | null
          plus_ones: number | null
          rsvp_status: Database["public"]["Enums"]["rsvp_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          contact_phone?: string | null
          created_at?: string
          dietary_requirements?: string | null
          event_id: string
          id?: string
          notes?: string | null
          plus_ones?: number | null
          rsvp_status: Database["public"]["Enums"]["rsvp_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          contact_phone?: string | null
          created_at?: string
          dietary_requirements?: string | null
          event_id?: string
          id?: string
          notes?: string | null
          plus_ones?: number | null
          rsvp_status?: Database["public"]["Enums"]["rsvp_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "civic_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_speakers: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          is_keynote: boolean | null
          profile_id: string | null
          speaker_bio: string | null
          speaker_image_url: string | null
          speaker_name: string
          speaker_order: number | null
          speaker_title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          is_keynote?: boolean | null
          profile_id?: string | null
          speaker_bio?: string | null
          speaker_image_url?: string | null
          speaker_name: string
          speaker_order?: number | null
          speaker_title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          is_keynote?: boolean | null
          profile_id?: string | null
          speaker_bio?: string | null
          speaker_image_url?: string | null
          speaker_name?: string
          speaker_order?: number | null
          speaker_title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_speakers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_ticket_types: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          event_id: string
          id: string
          includes_livestream: boolean | null
          includes_meet_greet: boolean | null
          includes_vip_area: boolean | null
          max_quantity: number
          name: string
          perks: Json | null
          price: number
          sold_quantity: number | null
          type: Database["public"]["Enums"]["ticket_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          event_id: string
          id?: string
          includes_livestream?: boolean | null
          includes_meet_greet?: boolean | null
          includes_vip_area?: boolean | null
          max_quantity: number
          name: string
          perks?: Json | null
          price: number
          sold_quantity?: number | null
          type?: Database["public"]["Enums"]["ticket_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          event_id?: string
          id?: string
          includes_livestream?: boolean | null
          includes_meet_greet?: boolean | null
          includes_vip_area?: boolean | null
          max_quantity?: number
          name?: string
          perks?: Json | null
          price?: number
          sold_quantity?: number | null
          type?: Database["public"]["Enums"]["ticket_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_ticket_types_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          admin_notes: string | null
          age_restriction: number | null
          approved_at: string | null
          approved_by: string | null
          category: string
          created_at: string | null
          description: string | null
          end_date: string | null
          event_date: string
          flyer_url: string | null
          genre: string | null
          has_livestream: boolean | null
          id: string
          is_featured: boolean | null
          language: string | null
          livestream_password: string | null
          livestream_type: string | null
          livestream_url: string | null
          max_attendees: number | null
          organizer_id: string
          organizer_type: string
          performing_artists: string[] | null
          platform_commission_percentage: number | null
          status: Database["public"]["Enums"]["event_status"] | null
          ticket_sale_deadline: string | null
          title: string
          updated_at: string | null
          venue_address: string
          venue_coordinates: Json | null
          venue_name: string
        }
        Insert: {
          admin_notes?: string | null
          age_restriction?: number | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_date: string
          flyer_url?: string | null
          genre?: string | null
          has_livestream?: boolean | null
          id?: string
          is_featured?: boolean | null
          language?: string | null
          livestream_password?: string | null
          livestream_type?: string | null
          livestream_url?: string | null
          max_attendees?: number | null
          organizer_id: string
          organizer_type?: string
          performing_artists?: string[] | null
          platform_commission_percentage?: number | null
          status?: Database["public"]["Enums"]["event_status"] | null
          ticket_sale_deadline?: string | null
          title: string
          updated_at?: string | null
          venue_address: string
          venue_coordinates?: Json | null
          venue_name: string
        }
        Update: {
          admin_notes?: string | null
          age_restriction?: number | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_date?: string
          flyer_url?: string | null
          genre?: string | null
          has_livestream?: boolean | null
          id?: string
          is_featured?: boolean | null
          language?: string | null
          livestream_password?: string | null
          livestream_type?: string | null
          livestream_url?: string | null
          max_attendees?: number | null
          organizer_id?: string
          organizer_type?: string
          performing_artists?: string[] | null
          platform_commission_percentage?: number | null
          status?: Database["public"]["Enums"]["event_status"] | null
          ticket_sale_deadline?: string | null
          title?: string
          updated_at?: string | null
          venue_address?: string
          venue_coordinates?: Json | null
          venue_name?: string
        }
        Relationships: []
      }
      exclusive_content: {
        Row: {
          artist_id: string
          content_type: string
          content_url: string
          created_at: string
          description: string | null
          fan_club_id: string | null
          id: string
          is_active: boolean
          required_tier: string | null
          thumbnail_url: string | null
          title: string
          view_count: number
        }
        Insert: {
          artist_id: string
          content_type: string
          content_url: string
          created_at?: string
          description?: string | null
          fan_club_id?: string | null
          id?: string
          is_active?: boolean
          required_tier?: string | null
          thumbnail_url?: string | null
          title: string
          view_count?: number
        }
        Update: {
          artist_id?: string
          content_type?: string
          content_url?: string
          created_at?: string
          description?: string | null
          fan_club_id?: string | null
          id?: string
          is_active?: boolean
          required_tier?: string | null
          thumbnail_url?: string | null
          title?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "exclusive_content_fan_club_id_fkey"
            columns: ["fan_club_id"]
            isOneToOne: false
            referencedRelation: "fan_clubs"
            referencedColumns: ["id"]
          },
        ]
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
      fan_activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["fan_activity_type"]
          created_at: string
          fan_id: string
          id: string
          metadata: Json | null
          points_earned: number | null
          reference_id: string | null
          reference_name: string | null
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["fan_activity_type"]
          created_at?: string
          fan_id: string
          id?: string
          metadata?: Json | null
          points_earned?: number | null
          reference_id?: string | null
          reference_name?: string | null
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["fan_activity_type"]
          created_at?: string
          fan_id?: string
          id?: string
          metadata?: Json | null
          points_earned?: number | null
          reference_id?: string | null
          reference_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fan_activities_fan_id_fkey"
            columns: ["fan_id"]
            isOneToOne: false
            referencedRelation: "fan_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fan_badges: {
        Row: {
          artist_id: string | null
          badge_description: string | null
          badge_icon_url: string | null
          badge_name: string
          badge_type: Database["public"]["Enums"]["badge_type"]
          earned_at: string
          earned_for_month: string | null
          fan_id: string
          id: string
          is_active: boolean | null
        }
        Insert: {
          artist_id?: string | null
          badge_description?: string | null
          badge_icon_url?: string | null
          badge_name: string
          badge_type: Database["public"]["Enums"]["badge_type"]
          earned_at?: string
          earned_for_month?: string | null
          fan_id: string
          id?: string
          is_active?: boolean | null
        }
        Update: {
          artist_id?: string | null
          badge_description?: string | null
          badge_icon_url?: string | null
          badge_name?: string
          badge_type?: Database["public"]["Enums"]["badge_type"]
          earned_at?: string
          earned_for_month?: string | null
          fan_id?: string
          id?: string
          is_active?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fan_badges_fan_id_fkey"
            columns: ["fan_id"]
            isOneToOne: false
            referencedRelation: "fan_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fan_club_memberships: {
        Row: {
          expires_at: string | null
          fan_club_id: string
          id: string
          is_active: boolean
          joined_at: string
          membership_tier: string
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          fan_club_id: string
          id?: string
          is_active?: boolean
          joined_at?: string
          membership_tier?: string
          user_id: string
        }
        Update: {
          expires_at?: string | null
          fan_club_id?: string
          id?: string
          is_active?: boolean
          joined_at?: string
          membership_tier?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fan_club_memberships_fan_club_id_fkey"
            columns: ["fan_club_id"]
            isOneToOne: false
            referencedRelation: "fan_clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      fan_clubs: {
        Row: {
          artist_id: string
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          member_count: number
          membership_fee_fcfa: number | null
          name: string
          updated_at: string
        }
        Insert: {
          artist_id: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          member_count?: number
          membership_fee_fcfa?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          artist_id?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          member_count?: number
          membership_fee_fcfa?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      fan_leaderboards: {
        Row: {
          created_at: string
          current_rank: number
          fan_id: string
          id: string
          last_activity_at: string | null
          leaderboard_type: string
          monthly_points: number | null
          reference_id: string | null
          total_points: number
          updated_at: string
          weekly_points: number | null
        }
        Insert: {
          created_at?: string
          current_rank: number
          fan_id: string
          id?: string
          last_activity_at?: string | null
          leaderboard_type: string
          monthly_points?: number | null
          reference_id?: string | null
          total_points?: number
          updated_at?: string
          weekly_points?: number | null
        }
        Update: {
          created_at?: string
          current_rank?: number
          fan_id?: string
          id?: string
          last_activity_at?: string | null
          leaderboard_type?: string
          monthly_points?: number | null
          reference_id?: string | null
          total_points?: number
          updated_at?: string
          weekly_points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fan_leaderboards_fan_id_fkey"
            columns: ["fan_id"]
            isOneToOne: false
            referencedRelation: "fan_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fan_notifications: {
        Row: {
          action_url: string | null
          created_at: string
          expires_at: string | null
          fan_id: string
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          priority: string | null
          read_at: string | null
          title: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          fan_id: string
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          priority?: string | null
          read_at?: string | null
          title: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          fan_id?: string
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          priority?: string | null
          read_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "fan_notifications_fan_id_fkey"
            columns: ["fan_id"]
            isOneToOne: false
            referencedRelation: "fan_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fan_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          current_rank: number | null
          display_name: string | null
          favorite_genres: string[] | null
          id: string
          is_verified: boolean | null
          preferred_region: string | null
          total_activity_points: number | null
          total_events_attended: number | null
          total_spent_fcfa: number | null
          total_votes_cast: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          current_rank?: number | null
          display_name?: string | null
          favorite_genres?: string[] | null
          id?: string
          is_verified?: boolean | null
          preferred_region?: string | null
          total_activity_points?: number | null
          total_events_attended?: number | null
          total_spent_fcfa?: number | null
          total_votes_cast?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          current_rank?: number | null
          display_name?: string | null
          favorite_genres?: string[] | null
          id?: string
          is_verified?: boolean | null
          preferred_region?: string | null
          total_activity_points?: number | null
          total_events_attended?: number | null
          total_spent_fcfa?: number | null
          total_votes_cast?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fan_purchases: {
        Row: {
          access_expires_at: string | null
          download_count: number | null
          fan_id: string
          id: string
          max_downloads: number | null
          product_id: string
          purchased_at: string
          quantity: number | null
          total_price_fcfa: number
          transaction_id: string | null
          unit_price_fcfa: number
        }
        Insert: {
          access_expires_at?: string | null
          download_count?: number | null
          fan_id: string
          id?: string
          max_downloads?: number | null
          product_id: string
          purchased_at?: string
          quantity?: number | null
          total_price_fcfa: number
          transaction_id?: string | null
          unit_price_fcfa: number
        }
        Update: {
          access_expires_at?: string | null
          download_count?: number | null
          fan_id?: string
          id?: string
          max_downloads?: number | null
          product_id?: string
          purchased_at?: string
          quantity?: number | null
          total_price_fcfa?: number
          transaction_id?: string | null
          unit_price_fcfa?: number
        }
        Relationships: [
          {
            foreignKeyName: "fan_purchases_fan_id_fkey"
            columns: ["fan_id"]
            isOneToOne: false
            referencedRelation: "fan_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fan_purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "storefront_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fan_purchases_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "fan_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      fan_saved_content: {
        Row: {
          artist_name: string | null
          content_id: string
          content_title: string
          content_type: string
          fan_id: string
          id: string
          saved_at: string
        }
        Insert: {
          artist_name?: string | null
          content_id: string
          content_title: string
          content_type: string
          fan_id: string
          id?: string
          saved_at?: string
        }
        Update: {
          artist_name?: string | null
          content_id?: string
          content_title?: string
          content_type?: string
          fan_id?: string
          id?: string
          saved_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fan_saved_content_fan_id_fkey"
            columns: ["fan_id"]
            isOneToOne: false
            referencedRelation: "fan_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fan_subscriptions: {
        Row: {
          artist_id: string
          auto_renew: boolean | null
          benefits: Json | null
          created_at: string
          expires_at: string | null
          fan_id: string
          id: string
          is_active: boolean | null
          monthly_price_fcfa: number
          started_at: string
          subscription_tier: string
        }
        Insert: {
          artist_id: string
          auto_renew?: boolean | null
          benefits?: Json | null
          created_at?: string
          expires_at?: string | null
          fan_id: string
          id?: string
          is_active?: boolean | null
          monthly_price_fcfa: number
          started_at?: string
          subscription_tier: string
        }
        Update: {
          artist_id?: string
          auto_renew?: boolean | null
          benefits?: Json | null
          created_at?: string
          expires_at?: string | null
          fan_id?: string
          id?: string
          is_active?: boolean | null
          monthly_price_fcfa?: number
          started_at?: string
          subscription_tier?: string
        }
        Relationships: [
          {
            foreignKeyName: "fan_subscriptions_fan_id_fkey"
            columns: ["fan_id"]
            isOneToOne: false
            referencedRelation: "fan_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fan_transactions: {
        Row: {
          amount_fcfa: number
          completed_at: string | null
          created_at: string
          description: string
          external_reference: string | null
          fan_id: string
          id: string
          metadata: Json | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          reference_id: string | null
          status: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          amount_fcfa: number
          completed_at?: string | null
          created_at?: string
          description: string
          external_reference?: string | null
          fan_id: string
          id?: string
          metadata?: Json | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          reference_id?: string | null
          status?: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          amount_fcfa?: number
          completed_at?: string | null
          created_at?: string
          description?: string
          external_reference?: string | null
          fan_id?: string
          id?: string
          metadata?: Json | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          reference_id?: string | null
          status?: string | null
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "fan_transactions_fan_id_fkey"
            columns: ["fan_id"]
            isOneToOne: false
            referencedRelation: "fan_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fan_voting: {
        Row: {
          award_category: string | null
          created_at: string
          device_fingerprint: string | null
          fan_id: string
          id: string
          ip_address: unknown | null
          poll_id: string | null
          vote_weight: number | null
          voted_for_id: string
          voted_for_name: string
          voting_round: string | null
        }
        Insert: {
          award_category?: string | null
          created_at?: string
          device_fingerprint?: string | null
          fan_id: string
          id?: string
          ip_address?: unknown | null
          poll_id?: string | null
          vote_weight?: number | null
          voted_for_id: string
          voted_for_name: string
          voting_round?: string | null
        }
        Update: {
          award_category?: string | null
          created_at?: string
          device_fingerprint?: string | null
          fan_id?: string
          id?: string
          ip_address?: unknown | null
          poll_id?: string | null
          vote_weight?: number | null
          voted_for_id?: string
          voted_for_name?: string
          voting_round?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fan_voting_fan_id_fkey"
            columns: ["fan_id"]
            isOneToOne: false
            referencedRelation: "fan_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fan_wallets: {
        Row: {
          balance_fcfa: number | null
          created_at: string
          fan_id: string
          id: string
          is_active: boolean | null
          pending_balance_fcfa: number | null
          pin_hash: string | null
          spending_limit_fcfa: number | null
          total_spent_fcfa: number | null
          total_topup_fcfa: number | null
          updated_at: string
        }
        Insert: {
          balance_fcfa?: number | null
          created_at?: string
          fan_id: string
          id?: string
          is_active?: boolean | null
          pending_balance_fcfa?: number | null
          pin_hash?: string | null
          spending_limit_fcfa?: number | null
          total_spent_fcfa?: number | null
          total_topup_fcfa?: number | null
          updated_at?: string
        }
        Update: {
          balance_fcfa?: number | null
          created_at?: string
          fan_id?: string
          id?: string
          is_active?: boolean | null
          pending_balance_fcfa?: number | null
          pin_hash?: string | null
          spending_limit_fcfa?: number | null
          total_spent_fcfa?: number | null
          total_topup_fcfa?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fan_wallets_fan_id_fkey"
            columns: ["fan_id"]
            isOneToOne: false
            referencedRelation: "fan_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      forum_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          display_order: number
          icon: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      forum_replies: {
        Row: {
          content: string
          created_at: string
          creator_id: string
          id: string
          is_solution: boolean
          parent_reply_id: string | null
          topic_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          creator_id: string
          id?: string
          is_solution?: boolean
          parent_reply_id?: string | null
          topic_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          creator_id?: string
          id?: string
          is_solution?: boolean
          parent_reply_id?: string | null
          topic_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_parent_reply_id_fkey"
            columns: ["parent_reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_replies_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topics: {
        Row: {
          category_id: string
          content: string
          created_at: string
          creator_id: string
          id: string
          is_locked: boolean
          is_pinned: boolean
          last_activity_at: string
          reply_count: number
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          category_id: string
          content: string
          created_at?: string
          creator_id: string
          id?: string
          is_locked?: boolean
          is_pinned?: boolean
          last_activity_at?: string
          reply_count?: number
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          category_id?: string
          content?: string
          created_at?: string
          creator_id?: string
          id?: string
          is_locked?: boolean
          is_pinned?: boolean
          last_activity_at?: string
          reply_count?: number
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "forum_topics_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      gov_change_monitoring_config: {
        Row: {
          base_url: string
          check_frequency_hours: number | null
          created_at: string
          id: string
          is_active: boolean | null
          last_check_at: string | null
          last_successful_check_at: string | null
          monitoring_rules: Json | null
          source_name: string
          source_type: string
          successful_checks: number | null
          total_checks: number | null
          updated_at: string
        }
        Insert: {
          base_url: string
          check_frequency_hours?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_check_at?: string | null
          last_successful_check_at?: string | null
          monitoring_rules?: Json | null
          source_name: string
          source_type: string
          successful_checks?: number | null
          total_checks?: number | null
          updated_at?: string
        }
        Update: {
          base_url?: string
          check_frequency_hours?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_check_at?: string | null
          last_successful_check_at?: string | null
          monitoring_rules?: Json | null
          source_name?: string
          source_type?: string
          successful_checks?: number | null
          total_checks?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      government_agencies: {
        Row: {
          agency_code: string
          agency_name: string
          api_key_hash: string | null
          approved_at: string | null
          approved_by: string | null
          category: string
          contact_email: string
          contact_person_name: string
          created_at: string
          id: string
          is_active: boolean
          is_verified: boolean
          phone_number: string | null
          regions_access: string[] | null
          role_type: string
          security_clearance: string
          two_fa_enabled: boolean
          updated_at: string
        }
        Insert: {
          agency_code: string
          agency_name: string
          api_key_hash?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category: string
          contact_email: string
          contact_person_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_verified?: boolean
          phone_number?: string | null
          regions_access?: string[] | null
          role_type?: string
          security_clearance?: string
          two_fa_enabled?: boolean
          updated_at?: string
        }
        Update: {
          agency_code?: string
          agency_name?: string
          api_key_hash?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          contact_email?: string
          contact_person_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_verified?: boolean
          phone_number?: string | null
          regions_access?: string[] | null
          role_type?: string
          security_clearance?: string
          two_fa_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      government_agency_users: {
        Row: {
          access_level: string
          agency_id: string
          created_at: string
          id: string
          is_primary_contact: boolean
          role_in_agency: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_level?: string
          agency_id: string
          created_at?: string
          id?: string
          is_primary_contact?: boolean
          role_in_agency?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_level?: string
          agency_id?: string
          created_at?: string
          id?: string
          is_primary_contact?: boolean
          role_in_agency?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "government_agency_users_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "government_agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      government_projects: {
        Row: {
          actual_completion_date: string | null
          alert_timeline_slippage: boolean | null
          budget_allocated_fcfa: number
          budget_allocated_usd: number | null
          budget_utilization_percentage: number | null
          community_satisfaction_score: number | null
          completion_percentage: number | null
          contractor_id: string | null
          contractor_name: string | null
          coordinates: Json | null
          corruption_index: number | null
          corruption_tag: Database["public"]["Enums"]["corruption_tag"] | null
          created_at: string | null
          description: string | null
          expected_completion_date: string | null
          funding_partner: string | null
          funding_source: Database["public"]["Enums"]["funding_source_type"]
          funds_disbursed_fcfa: number | null
          id: string
          implementing_body: string
          is_verified: boolean | null
          last_progress_update: string | null
          locations: Json | null
          metadata: Json | null
          ministry_responsible: string | null
          procurement_entity: string | null
          project_code: string | null
          project_documents: Json | null
          sector: Database["public"]["Enums"]["project_sector"]
          source_type: string | null
          source_url: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          submitted_by: string | null
          supervising_agency: string | null
          supervising_official: string | null
          timeline_slippage_days: number | null
          title: string
          total_community_reports: number | null
          transparency_score: number | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          actual_completion_date?: string | null
          alert_timeline_slippage?: boolean | null
          budget_allocated_fcfa: number
          budget_allocated_usd?: number | null
          budget_utilization_percentage?: number | null
          community_satisfaction_score?: number | null
          completion_percentage?: number | null
          contractor_id?: string | null
          contractor_name?: string | null
          coordinates?: Json | null
          corruption_index?: number | null
          corruption_tag?: Database["public"]["Enums"]["corruption_tag"] | null
          created_at?: string | null
          description?: string | null
          expected_completion_date?: string | null
          funding_partner?: string | null
          funding_source: Database["public"]["Enums"]["funding_source_type"]
          funds_disbursed_fcfa?: number | null
          id?: string
          implementing_body: string
          is_verified?: boolean | null
          last_progress_update?: string | null
          locations?: Json | null
          metadata?: Json | null
          ministry_responsible?: string | null
          procurement_entity?: string | null
          project_code?: string | null
          project_documents?: Json | null
          sector: Database["public"]["Enums"]["project_sector"]
          source_type?: string | null
          source_url?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          submitted_by?: string | null
          supervising_agency?: string | null
          supervising_official?: string | null
          timeline_slippage_days?: number | null
          title: string
          total_community_reports?: number | null
          transparency_score?: number | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          actual_completion_date?: string | null
          alert_timeline_slippage?: boolean | null
          budget_allocated_fcfa?: number
          budget_allocated_usd?: number | null
          budget_utilization_percentage?: number | null
          community_satisfaction_score?: number | null
          completion_percentage?: number | null
          contractor_id?: string | null
          contractor_name?: string | null
          coordinates?: Json | null
          corruption_index?: number | null
          corruption_tag?: Database["public"]["Enums"]["corruption_tag"] | null
          created_at?: string | null
          description?: string | null
          expected_completion_date?: string | null
          funding_partner?: string | null
          funding_source?: Database["public"]["Enums"]["funding_source_type"]
          funds_disbursed_fcfa?: number | null
          id?: string
          implementing_body?: string
          is_verified?: boolean | null
          last_progress_update?: string | null
          locations?: Json | null
          metadata?: Json | null
          ministry_responsible?: string | null
          procurement_entity?: string | null
          project_code?: string | null
          project_documents?: Json | null
          sector?: Database["public"]["Enums"]["project_sector"]
          source_type?: string | null
          source_url?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          submitted_by?: string | null
          supervising_agency?: string | null
          supervising_official?: string | null
          timeline_slippage_days?: number | null
          title?: string
          total_community_reports?: number | null
          transparency_score?: number | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      hospital_claims: {
        Row: {
          admin_notes: string | null
          claim_type: string
          created_at: string
          evidence_documents: string[] | null
          hospital_id: string
          id: string
          justification: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["claim_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          claim_type?: string
          created_at?: string
          evidence_documents?: string[] | null
          hospital_id: string
          id?: string
          justification: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["claim_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          claim_type?: string
          created_at?: string
          evidence_documents?: string[] | null
          hospital_id?: string
          id?: string
          justification?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["claim_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hospital_claims_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_monetization: {
        Row: {
          active_until: string | null
          amount_fcfa: number
          created_at: string
          feature_type: string
          hospital_id: string
          id: string
          payment_status: string
          stripe_payment_intent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active_until?: string | null
          amount_fcfa: number
          created_at?: string
          feature_type: string
          hospital_id: string
          id?: string
          payment_status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active_until?: string | null
          amount_fcfa?: number
          created_at?: string
          feature_type?: string
          hospital_id?: string
          id?: string
          payment_status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hospital_monetization_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_ratings: {
        Row: {
          anonymous: boolean
          cleanliness: number
          created_at: string
          emergency_readiness: number
          equipment_availability: number
          hospital_id: string
          id: string
          patient_experience: number
          review_text: string | null
          service_quality: number
          staff_response_time: number
          updated_at: string
          user_id: string
        }
        Insert: {
          anonymous?: boolean
          cleanliness: number
          created_at?: string
          emergency_readiness: number
          equipment_availability: number
          hospital_id: string
          id?: string
          patient_experience: number
          review_text?: string | null
          service_quality: number
          staff_response_time: number
          updated_at?: string
          user_id: string
        }
        Update: {
          anonymous?: boolean
          cleanliness?: number
          created_at?: string
          emergency_readiness?: number
          equipment_availability?: number
          hospital_id?: string
          id?: string
          patient_experience?: number
          review_text?: string | null
          service_quality?: number
          staff_response_time?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hospital_ratings_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_updates: {
        Row: {
          content: string
          created_at: string
          hospital_id: string
          id: string
          is_verified: boolean
          photos: string[] | null
          title: string
          update_type: string
          updated_at: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          content: string
          created_at?: string
          hospital_id: string
          id?: string
          is_verified?: boolean
          photos?: string[] | null
          title: string
          update_type: string
          updated_at?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          hospital_id?: string
          id?: string
          is_verified?: boolean
          photos?: string[] | null
          title?: string
          update_type?: string
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hospital_updates_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitals: {
        Row: {
          aggregate_ratings: Json | null
          claimed_at: string | null
          claimed_by: string | null
          created_at: string
          division: string
          email: string | null
          emergency_services: boolean
          id: string
          is_claimable: boolean
          latitude: number | null
          longitude: number | null
          name: string
          overall_rating: number | null
          ownership: Database["public"]["Enums"]["hospital_ownership"]
          phone: string | null
          photo_gallery: string[] | null
          region: string
          services_offered: string[] | null
          submitted_by: string | null
          total_ratings: number | null
          type: Database["public"]["Enums"]["hospital_type"]
          updated_at: string
          verification_status: string
          verified_at: string | null
          verified_by: string | null
          village_or_city: string
          website: string | null
          whatsapp: string | null
          working_hours: string | null
        }
        Insert: {
          aggregate_ratings?: Json | null
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          division: string
          email?: string | null
          emergency_services?: boolean
          id?: string
          is_claimable?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          overall_rating?: number | null
          ownership: Database["public"]["Enums"]["hospital_ownership"]
          phone?: string | null
          photo_gallery?: string[] | null
          region: string
          services_offered?: string[] | null
          submitted_by?: string | null
          total_ratings?: number | null
          type: Database["public"]["Enums"]["hospital_type"]
          updated_at?: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          village_or_city: string
          website?: string | null
          whatsapp?: string | null
          working_hours?: string | null
        }
        Update: {
          aggregate_ratings?: Json | null
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          division?: string
          email?: string | null
          emergency_services?: boolean
          id?: string
          is_claimable?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          overall_rating?: number | null
          ownership?: Database["public"]["Enums"]["hospital_ownership"]
          phone?: string | null
          photo_gallery?: string[] | null
          region?: string
          services_offered?: string[] | null
          submitted_by?: string | null
          total_ratings?: number | null
          type?: Database["public"]["Enums"]["hospital_type"]
          updated_at?: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          village_or_city?: string
          website?: string | null
          whatsapp?: string | null
          working_hours?: string | null
        }
        Relationships: []
      }
      image_verification_logs: {
        Row: {
          action_type: string
          admin_notes: string | null
          confidence_change: number | null
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          new_status: string | null
          old_status: string | null
          performed_by: string | null
        }
        Insert: {
          action_type: string
          admin_notes?: string | null
          confidence_change?: number | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          old_status?: string | null
          performed_by?: string | null
        }
        Update: {
          action_type?: string
          admin_notes?: string | null
          confidence_change?: number | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          old_status?: string | null
          performed_by?: string | null
        }
        Relationships: []
      }
      institution_access_logs: {
        Row: {
          access_type: string
          action_performed: string
          created_at: string | null
          id: string
          institution_id: string
          ip_address: unknown | null
          session_data: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          access_type: string
          action_performed: string
          created_at?: string | null
          id?: string
          institution_id: string
          ip_address?: unknown | null
          session_data?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          access_type?: string
          action_performed?: string
          created_at?: string | null
          id?: string
          institution_id?: string
          ip_address?: unknown | null
          session_data?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_access_logs_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_analytics: {
        Row: {
          created_at: string
          id: string
          institution_id: string
          institution_type: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          recorded_at: string
          session_id: string | null
          source_page: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          institution_id: string
          institution_type: string
          metadata?: Json | null
          metric_type: string
          metric_value?: number
          recorded_at?: string
          session_id?: string | null
          source_page?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          institution_id?: string
          institution_type?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          recorded_at?: string
          session_id?: string | null
          source_page?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      institution_analytics_reports: {
        Row: {
          created_at: string
          download_url: string | null
          email_sent: boolean | null
          generated_at: string
          generated_by: string | null
          id: string
          institution_id: string
          report_data: Json
          report_period_end: string
          report_period_start: string
          report_type: string
        }
        Insert: {
          created_at?: string
          download_url?: string | null
          email_sent?: boolean | null
          generated_at?: string
          generated_by?: string | null
          id?: string
          institution_id: string
          report_data?: Json
          report_period_end: string
          report_period_start: string
          report_type: string
        }
        Update: {
          created_at?: string
          download_url?: string | null
          email_sent?: boolean | null
          generated_at?: string
          generated_by?: string | null
          id?: string
          institution_id?: string
          report_data?: Json
          report_period_end?: string
          report_period_start?: string
          report_type?: string
        }
        Relationships: []
      }
      institution_analytics_summary: {
        Row: {
          average_rating: number | null
          created_at: string
          engagement_score: number | null
          id: string
          institution_id: string
          institution_type: string
          ranking_position: number | null
          search_appearances: number
          sentiment_score: number | null
          summary_date: string
          total_clicks: number
          total_messages: number
          total_ratings: number
          total_views: number
          unique_visitors: number
          updated_at: string
        }
        Insert: {
          average_rating?: number | null
          created_at?: string
          engagement_score?: number | null
          id?: string
          institution_id: string
          institution_type: string
          ranking_position?: number | null
          search_appearances?: number
          sentiment_score?: number | null
          summary_date?: string
          total_clicks?: number
          total_messages?: number
          total_ratings?: number
          total_views?: number
          unique_visitors?: number
          updated_at?: string
        }
        Update: {
          average_rating?: number | null
          created_at?: string
          engagement_score?: number | null
          id?: string
          institution_id?: string
          institution_type?: string
          ranking_position?: number | null
          search_appearances?: number
          sentiment_score?: number | null
          summary_date?: string
          total_clicks?: number
          total_messages?: number
          total_ratings?: number
          total_views?: number
          unique_visitors?: number
          updated_at?: string
        }
        Relationships: []
      }
      institution_claim_renewals: {
        Row: {
          auto_renewed: boolean | null
          created_at: string | null
          grace_period_expires: string | null
          id: string
          original_claim_id: string
          reminder_sent_1_day: boolean | null
          reminder_sent_30_days: boolean | null
          reminder_sent_7_days: boolean | null
          renewal_claim_id: string | null
          renewal_due_date: string
          renewal_status: string | null
          updated_at: string | null
        }
        Insert: {
          auto_renewed?: boolean | null
          created_at?: string | null
          grace_period_expires?: string | null
          id?: string
          original_claim_id: string
          reminder_sent_1_day?: boolean | null
          reminder_sent_30_days?: boolean | null
          reminder_sent_7_days?: boolean | null
          renewal_claim_id?: string | null
          renewal_due_date: string
          renewal_status?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_renewed?: boolean | null
          created_at?: string | null
          grace_period_expires?: string | null
          id?: string
          original_claim_id?: string
          reminder_sent_1_day?: boolean | null
          reminder_sent_30_days?: boolean | null
          reminder_sent_7_days?: boolean | null
          renewal_claim_id?: string | null
          renewal_due_date?: string
          renewal_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_claim_renewals_original_claim_id_fkey"
            columns: ["original_claim_id"]
            isOneToOne: false
            referencedRelation: "institution_claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_claim_renewals_renewal_claim_id_fkey"
            columns: ["renewal_claim_id"]
            isOneToOne: false
            referencedRelation: "institution_claims"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_claims: {
        Row: {
          admin_notes: string | null
          claim_reason: string | null
          claim_type: string
          created_at: string | null
          evidence_files: string[] | null
          id: string
          institution_id: string
          institution_name: string
          institution_type: Database["public"]["Enums"]["institution_claim_type"]
          payment_amount: number | null
          payment_currency: string | null
          payment_reference: string | null
          payment_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          claim_reason?: string | null
          claim_type?: string
          created_at?: string | null
          evidence_files?: string[] | null
          id?: string
          institution_id: string
          institution_name: string
          institution_type: Database["public"]["Enums"]["institution_claim_type"]
          payment_amount?: number | null
          payment_currency?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          claim_reason?: string | null
          claim_type?: string
          created_at?: string | null
          evidence_files?: string[] | null
          id?: string
          institution_id?: string
          institution_name?: string
          institution_type?: Database["public"]["Enums"]["institution_claim_type"]
          payment_amount?: number | null
          payment_currency?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      institution_dashboards: {
        Row: {
          access_permissions: Json | null
          analytics_enabled: boolean | null
          created_at: string | null
          custom_branding: Json | null
          dashboard_config: Json | null
          id: string
          institution_id: string
          messaging_enabled: boolean | null
          owner_user_id: string
          payment_processing_enabled: boolean | null
          review_management_enabled: boolean | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          access_permissions?: Json | null
          analytics_enabled?: boolean | null
          created_at?: string | null
          custom_branding?: Json | null
          dashboard_config?: Json | null
          id?: string
          institution_id: string
          messaging_enabled?: boolean | null
          owner_user_id: string
          payment_processing_enabled?: boolean | null
          review_management_enabled?: boolean | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          access_permissions?: Json | null
          analytics_enabled?: boolean | null
          created_at?: string | null
          custom_branding?: Json | null
          dashboard_config?: Json | null
          id?: string
          institution_id?: string
          messaging_enabled?: boolean | null
          owner_user_id?: string
          payment_processing_enabled?: boolean | null
          review_management_enabled?: boolean | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_dashboards_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_messages: {
        Row: {
          created_at: string
          id: string
          institution_id: string
          is_read: boolean
          message_content: string
          message_type: string
          replied_at: string | null
          reply_content: string | null
          sender_id: string
          sender_name: string
          sender_type: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          institution_id: string
          is_read?: boolean
          message_content: string
          message_type?: string
          replied_at?: string | null
          reply_content?: string | null
          sender_id: string
          sender_name: string
          sender_type: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          institution_id?: string
          is_read?: boolean
          message_content?: string
          message_type?: string
          replied_at?: string | null
          reply_content?: string | null
          sender_id?: string
          sender_name?: string
          sender_type?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      institution_payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          flutterwave_transaction_id: string | null
          id: string
          institution_id: string
          institution_name: string
          institution_type: string
          payment_method: string | null
          payment_status: string
          payment_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          flutterwave_transaction_id?: string | null
          id?: string
          institution_id: string
          institution_name: string
          institution_type: string
          payment_method?: string | null
          payment_status?: string
          payment_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          flutterwave_transaction_id?: string | null
          id?: string
          institution_id?: string
          institution_name?: string
          institution_type?: string
          payment_method?: string | null
          payment_status?: string
          payment_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      institution_reviews: {
        Row: {
          created_at: string
          criteria_ratings: Json
          flag_reason: string | null
          flagged_at: string | null
          flagged_by: string | null
          helpful_votes: number
          id: string
          institution_id: string
          institution_type: Database["public"]["Enums"]["institution_type"]
          is_anonymous: boolean
          is_flagged: boolean
          is_verified_reviewer: boolean
          media_attachments: string[] | null
          moderation_status: string
          overall_rating: number
          review_text: string | null
          review_title: string | null
          reviewer_id: string
          unhelpful_votes: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          criteria_ratings?: Json
          flag_reason?: string | null
          flagged_at?: string | null
          flagged_by?: string | null
          helpful_votes?: number
          id?: string
          institution_id: string
          institution_type: Database["public"]["Enums"]["institution_type"]
          is_anonymous?: boolean
          is_flagged?: boolean
          is_verified_reviewer?: boolean
          media_attachments?: string[] | null
          moderation_status?: string
          overall_rating: number
          review_text?: string | null
          review_title?: string | null
          reviewer_id: string
          unhelpful_votes?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          criteria_ratings?: Json
          flag_reason?: string | null
          flagged_at?: string | null
          flagged_by?: string | null
          helpful_votes?: number
          id?: string
          institution_id?: string
          institution_type?: Database["public"]["Enums"]["institution_type"]
          is_anonymous?: boolean
          is_flagged?: boolean
          is_verified_reviewer?: boolean
          media_attachments?: string[] | null
          moderation_status?: string
          overall_rating?: number
          review_text?: string | null
          review_title?: string | null
          reviewer_id?: string
          unhelpful_votes?: number
          updated_at?: string
        }
        Relationships: []
      }
      institution_submissions: {
        Row: {
          assigned_moderator: string | null
          contact_info: Json | null
          created_at: string
          description: string | null
          flagged_reasons: string[] | null
          id: string
          institution_type: Database["public"]["Enums"]["institution_type"]
          location: Json | null
          metadata: Json | null
          moderator_notes: string | null
          name: string
          reviewed_at: string | null
          submitted_by: string | null
          updated_at: string
          verification_checklist: Json | null
          verification_status: Database["public"]["Enums"]["verification_status"]
          verified_at: string | null
        }
        Insert: {
          assigned_moderator?: string | null
          contact_info?: Json | null
          created_at?: string
          description?: string | null
          flagged_reasons?: string[] | null
          id?: string
          institution_type: Database["public"]["Enums"]["institution_type"]
          location?: Json | null
          metadata?: Json | null
          moderator_notes?: string | null
          name: string
          reviewed_at?: string | null
          submitted_by?: string | null
          updated_at?: string
          verification_checklist?: Json | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
        }
        Update: {
          assigned_moderator?: string | null
          contact_info?: Json | null
          created_at?: string
          description?: string | null
          flagged_reasons?: string[] | null
          id?: string
          institution_type?: Database["public"]["Enums"]["institution_type"]
          location?: Json | null
          metadata?: Json | null
          moderator_notes?: string | null
          name?: string
          reviewed_at?: string | null
          submitted_by?: string | null
          updated_at?: string
          verification_checklist?: Json | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
        }
        Relationships: []
      }
      institutional_trust_scores: {
        Row: {
          content_volume: number | null
          created_at: string
          date_recorded: string
          id: string
          institution_id: string
          keyword_score: number | null
          metadata: Json | null
          overall_trust_score: number
          region: string | null
          sentiment_based_score: number | null
          updated_at: string
          user_feedback_score: number | null
        }
        Insert: {
          content_volume?: number | null
          created_at?: string
          date_recorded?: string
          id?: string
          institution_id: string
          keyword_score?: number | null
          metadata?: Json | null
          overall_trust_score?: number
          region?: string | null
          sentiment_based_score?: number | null
          updated_at?: string
          user_feedback_score?: number | null
        }
        Update: {
          content_volume?: number | null
          created_at?: string
          date_recorded?: string
          id?: string
          institution_id?: string
          keyword_score?: number | null
          metadata?: Json | null
          overall_trust_score?: number
          region?: string | null
          sentiment_based_score?: number | null
          updated_at?: string
          user_feedback_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "institutional_trust_scores_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          address: string | null
          average_rating: number | null
          city: string | null
          claim_status: string | null
          claimed_by: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          institution_type: Database["public"]["Enums"]["institution_type"]
          is_active: boolean
          is_featured: boolean | null
          is_sponsored: boolean | null
          is_verified: boolean | null
          latitude: number | null
          longitude: number | null
          metadata: Json | null
          name: string
          phone: string | null
          region: string | null
          sponsored_until: string | null
          total_reviews: number | null
          updated_at: string
          views_count: number | null
          website: string | null
        }
        Insert: {
          address?: string | null
          average_rating?: number | null
          city?: string | null
          claim_status?: string | null
          claimed_by?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          institution_type: Database["public"]["Enums"]["institution_type"]
          is_active?: boolean
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          name: string
          phone?: string | null
          region?: string | null
          sponsored_until?: string | null
          total_reviews?: number | null
          updated_at?: string
          views_count?: number | null
          website?: string | null
        }
        Update: {
          address?: string | null
          average_rating?: number | null
          city?: string | null
          claim_status?: string | null
          claimed_by?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          institution_type?: Database["public"]["Enums"]["institution_type"]
          is_active?: boolean
          is_featured?: boolean | null
          is_sponsored?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          name?: string
          phone?: string | null
          region?: string | null
          sponsored_until?: string | null
          total_reviews?: number | null
          updated_at?: string
          views_count?: number | null
          website?: string | null
        }
        Relationships: []
      }
      integration_auth_secrets: {
        Row: {
          created_at: string
          id: string
          integration_id: string
          secret_key: string
          secret_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          integration_id: string
          secret_key: string
          secret_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          integration_id?: string
          secret_key?: string
          secret_value?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_auth_secrets_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "custom_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_execution_logs: {
        Row: {
          created_by: string | null
          error_message: string | null
          executed_at: string
          execution_status: string
          execution_time_ms: number | null
          id: string
          integration_id: string
          request_data: Json | null
          response_data: Json | null
          response_status_code: number | null
        }
        Insert: {
          created_by?: string | null
          error_message?: string | null
          executed_at?: string
          execution_status: string
          execution_time_ms?: number | null
          id?: string
          integration_id: string
          request_data?: Json | null
          response_data?: Json | null
          response_status_code?: number | null
        }
        Update: {
          created_by?: string | null
          error_message?: string | null
          executed_at?: string
          execution_status?: string
          execution_time_ms?: number | null
          id?: string
          integration_id?: string
          request_data?: Json | null
          response_data?: Json | null
          response_status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_execution_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "custom_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_usage_stats: {
        Row: {
          average_response_time_ms: number
          created_at: string
          failed_requests: number
          id: string
          integration_id: string
          stat_date: string
          successful_requests: number
          total_data_transferred_bytes: number
          total_requests: number
          updated_at: string
        }
        Insert: {
          average_response_time_ms?: number
          created_at?: string
          failed_requests?: number
          id?: string
          integration_id: string
          stat_date?: string
          successful_requests?: number
          total_data_transferred_bytes?: number
          total_requests?: number
          updated_at?: string
        }
        Update: {
          average_response_time_ms?: number
          created_at?: string
          failed_requests?: number
          id?: string
          integration_id?: string
          stat_date?: string
          successful_requests?: number
          total_data_transferred_bytes?: number
          total_requests?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_usage_stats_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "custom_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integrity_alert_log: {
        Row: {
          alert_description: string
          alert_title: string
          alert_type: string
          civil_implications: string | null
          created_at: string
          evidence_links: string[] | null
          id: string
          is_public_visible: boolean
          requires_review: boolean
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_score: number
          severity_level: string
          source_data: Json
          status: string
          suggested_cause: string | null
          target_entity_id: string | null
          target_entity_name: string
          target_entity_type: string
          updated_at: string
        }
        Insert: {
          alert_description: string
          alert_title: string
          alert_type: string
          civil_implications?: string | null
          created_at?: string
          evidence_links?: string[] | null
          id?: string
          is_public_visible?: boolean
          requires_review?: boolean
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_score?: number
          severity_level?: string
          source_data?: Json
          status?: string
          suggested_cause?: string | null
          target_entity_id?: string | null
          target_entity_name: string
          target_entity_type: string
          updated_at?: string
        }
        Update: {
          alert_description?: string
          alert_title?: string
          alert_type?: string
          civil_implications?: string | null
          created_at?: string
          evidence_links?: string[] | null
          id?: string
          is_public_visible?: boolean
          requires_review?: boolean
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_score?: number
          severity_level?: string
          source_data?: Json
          status?: string
          suggested_cause?: string | null
          target_entity_id?: string | null
          target_entity_name?: string
          target_entity_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      integrity_review_actions: {
        Row: {
          action_reason: string | null
          action_type: string
          admin_id: string
          admin_notes: string | null
          alert_id: string
          created_at: string
          external_sharing_approved: boolean
          id: string
          public_release_approved: boolean
        }
        Insert: {
          action_reason?: string | null
          action_type: string
          admin_id: string
          admin_notes?: string | null
          alert_id: string
          created_at?: string
          external_sharing_approved?: boolean
          id?: string
          public_release_approved?: boolean
        }
        Update: {
          action_reason?: string | null
          action_type?: string
          admin_id?: string
          admin_notes?: string | null
          alert_id?: string
          created_at?: string
          external_sharing_approved?: boolean
          id?: string
          public_release_approved?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "integrity_review_actions_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "integrity_alert_log"
            referencedColumns: ["id"]
          },
        ]
      }
      integrity_risk_assessments: {
        Row: {
          assessment_name: string
          auto_alert_enabled: boolean
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          risk_category: string
          risk_indicators: Json
          severity_mapping: Json
          threshold_values: Json
          updated_at: string
        }
        Insert: {
          assessment_name: string
          auto_alert_enabled?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          risk_category: string
          risk_indicators: Json
          severity_mapping?: Json
          threshold_values: Json
          updated_at?: string
        }
        Update: {
          assessment_name?: string
          auto_alert_enabled?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          risk_category?: string
          risk_indicators?: Json
          severity_mapping?: Json
          threshold_values?: Json
          updated_at?: string
        }
        Relationships: []
      }
      integrity_scan_sources: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          last_scanned_at: string | null
          scan_frequency_hours: number
          scan_parameters: Json
          source_name: string
          source_type: string
          source_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_scanned_at?: string | null
          scan_frequency_hours?: number
          scan_parameters?: Json
          source_name: string
          source_type: string
          source_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_scanned_at?: string | null
          scan_frequency_hours?: number
          scan_parameters?: Json
          source_name?: string
          source_type?: string
          source_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      intelligence_alerts: {
        Row: {
          alert_type: string
          confidence_score: number | null
          created_at: string
          description: string
          id: string
          is_resolved: boolean
          metadata: Json | null
          region: string | null
          resolved_at: string | null
          severity: string
          source_system: string
          title: string
        }
        Insert: {
          alert_type: string
          confidence_score?: number | null
          created_at?: string
          description: string
          id?: string
          is_resolved?: boolean
          metadata?: Json | null
          region?: string | null
          resolved_at?: string | null
          severity?: string
          source_system: string
          title: string
        }
        Update: {
          alert_type?: string
          confidence_score?: number | null
          created_at?: string
          description?: string
          id?: string
          is_resolved?: boolean
          metadata?: Json | null
          region?: string | null
          resolved_at?: string | null
          severity?: string
          source_system?: string
          title?: string
        }
        Relationships: []
      }
      legal_document_processing: {
        Row: {
          completed_at: string | null
          confidence_score: number | null
          created_at: string | null
          error_message: string | null
          id: string
          input_format: string | null
          legal_document_id: string | null
          output_format: string | null
          processed_by: string | null
          processing_duration_ms: number | null
          processing_notes: string | null
          processing_status: string
          processing_type: string
        }
        Insert: {
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_format?: string | null
          legal_document_id?: string | null
          output_format?: string | null
          processed_by?: string | null
          processing_duration_ms?: number | null
          processing_notes?: string | null
          processing_status?: string
          processing_type: string
        }
        Update: {
          completed_at?: string | null
          confidence_score?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          input_format?: string | null
          legal_document_id?: string | null
          output_format?: string | null
          processed_by?: string | null
          processing_duration_ms?: number | null
          processing_notes?: string | null
          processing_status?: string
          processing_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_document_processing_legal_document_id_fkey"
            columns: ["legal_document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          affected_regions: string[] | null
          affected_sectors: string[] | null
          created_at: string | null
          created_by: string | null
          document_number: string | null
          document_title: string
          document_type: string
          document_url: string | null
          enforcement_date: string | null
          english_summary: string | null
          expiry_date: string | null
          id: string
          introduction_date: string | null
          jurisdiction: string
          key_provisions: string[] | null
          metadata: Json | null
          ministry_department: string | null
          original_language: string
          original_text: string | null
          passed_date: string | null
          penalties_summary: string | null
          pidgin_summary: string | null
          simplified_summary: string | null
          source_official: boolean | null
          status: string
          updated_at: string | null
        }
        Insert: {
          affected_regions?: string[] | null
          affected_sectors?: string[] | null
          created_at?: string | null
          created_by?: string | null
          document_number?: string | null
          document_title: string
          document_type: string
          document_url?: string | null
          enforcement_date?: string | null
          english_summary?: string | null
          expiry_date?: string | null
          id?: string
          introduction_date?: string | null
          jurisdiction?: string
          key_provisions?: string[] | null
          metadata?: Json | null
          ministry_department?: string | null
          original_language?: string
          original_text?: string | null
          passed_date?: string | null
          penalties_summary?: string | null
          pidgin_summary?: string | null
          simplified_summary?: string | null
          source_official?: boolean | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          affected_regions?: string[] | null
          affected_sectors?: string[] | null
          created_at?: string | null
          created_by?: string | null
          document_number?: string | null
          document_title?: string
          document_type?: string
          document_url?: string | null
          enforcement_date?: string | null
          english_summary?: string | null
          expiry_date?: string | null
          id?: string
          introduction_date?: string | null
          jurisdiction?: string
          key_provisions?: string[] | null
          metadata?: Json | null
          ministry_department?: string | null
          original_language?: string
          original_text?: string | null
          passed_date?: string | null
          penalties_summary?: string | null
          pidgin_summary?: string | null
          simplified_summary?: string | null
          source_official?: boolean | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      live_polling_sessions: {
        Row: {
          comment_stream_enabled: boolean
          created_at: string
          created_by: string | null
          current_active_users: number
          ended_at: string | null
          engagement_metrics: Json | null
          id: string
          is_live: boolean
          live_results_enabled: boolean
          max_concurrent_users: number
          moderation_enabled: boolean
          poll_id: string | null
          session_name: string
          started_at: string | null
          streamer_ids: string[] | null
          total_participants: number
          updated_at: string
          viewer_analytics: Json | null
        }
        Insert: {
          comment_stream_enabled?: boolean
          created_at?: string
          created_by?: string | null
          current_active_users?: number
          ended_at?: string | null
          engagement_metrics?: Json | null
          id?: string
          is_live?: boolean
          live_results_enabled?: boolean
          max_concurrent_users?: number
          moderation_enabled?: boolean
          poll_id?: string | null
          session_name: string
          started_at?: string | null
          streamer_ids?: string[] | null
          total_participants?: number
          updated_at?: string
          viewer_analytics?: Json | null
        }
        Update: {
          comment_stream_enabled?: boolean
          created_at?: string
          created_by?: string | null
          current_active_users?: number
          ended_at?: string | null
          engagement_metrics?: Json | null
          id?: string
          is_live?: boolean
          live_results_enabled?: boolean
          max_concurrent_users?: number
          moderation_enabled?: boolean
          poll_id?: string | null
          session_name?: string
          started_at?: string | null
          streamer_ids?: string[] | null
          total_participants?: number
          updated_at?: string
          viewer_analytics?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "live_polling_sessions_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      local_businesses: {
        Row: {
          address: string | null
          annual_revenue_range: string | null
          business_name: string
          business_type: string
          city: string
          created_at: string
          created_by: string | null
          description: string | null
          economic_impact_score: number | null
          email: string | null
          employees_count: number | null
          founding_year: number | null
          id: string
          is_active: boolean | null
          owner_name: string | null
          phone_number: string | null
          region: string
          registration_number: string | null
          sector: string
          sustainability_rating: number | null
          updated_at: string
          verification_status: string | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          annual_revenue_range?: string | null
          business_name: string
          business_type: string
          city: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          economic_impact_score?: number | null
          email?: string | null
          employees_count?: number | null
          founding_year?: number | null
          id?: string
          is_active?: boolean | null
          owner_name?: string | null
          phone_number?: string | null
          region: string
          registration_number?: string | null
          sector: string
          sustainability_rating?: number | null
          updated_at?: string
          verification_status?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          annual_revenue_range?: string | null
          business_name?: string
          business_type?: string
          city?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          economic_impact_score?: number | null
          email?: string | null
          employees_count?: number | null
          founding_year?: number | null
          id?: string
          is_active?: boolean | null
          owner_name?: string | null
          phone_number?: string | null
          region?: string
          registration_number?: string | null
          sector?: string
          sustainability_rating?: number | null
          updated_at?: string
          verification_status?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      manual_fix_history: {
        Row: {
          action_type: string
          admin_id: string
          admin_name: string
          change_details: Json | null
          id: string
          manual_fix_id: string
          new_status: string | null
          previous_status: string | null
          timestamp: string
        }
        Insert: {
          action_type: string
          admin_id: string
          admin_name: string
          change_details?: Json | null
          id?: string
          manual_fix_id: string
          new_status?: string | null
          previous_status?: string | null
          timestamp?: string
        }
        Update: {
          action_type?: string
          admin_id?: string
          admin_name?: string
          change_details?: Json | null
          id?: string
          manual_fix_id?: string
          new_status?: string | null
          previous_status?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "manual_fix_history_manual_fix_id_fkey"
            columns: ["manual_fix_id"]
            isOneToOne: false
            referencedRelation: "manual_fixes"
            referencedColumns: ["id"]
          },
        ]
      }
      manual_fixes: {
        Row: {
          activity_id: string
          admin_id: string
          admin_name: string
          ai_suggestions: Json | null
          applied_at: string | null
          created_at: string
          error_prediction: Json | null
          fix_code: string
          fix_mode: string
          fix_reason: string | null
          fix_status: string
          id: string
          metadata: Json | null
          original_code_snapshot: string | null
          original_file_path: string | null
          rollback_reason: string | null
          rolled_back_at: string | null
          syntax_validation: Json | null
          updated_at: string
        }
        Insert: {
          activity_id: string
          admin_id: string
          admin_name: string
          ai_suggestions?: Json | null
          applied_at?: string | null
          created_at?: string
          error_prediction?: Json | null
          fix_code: string
          fix_mode: string
          fix_reason?: string | null
          fix_status?: string
          id?: string
          metadata?: Json | null
          original_code_snapshot?: string | null
          original_file_path?: string | null
          rollback_reason?: string | null
          rolled_back_at?: string | null
          syntax_validation?: Json | null
          updated_at?: string
        }
        Update: {
          activity_id?: string
          admin_id?: string
          admin_name?: string
          ai_suggestions?: Json | null
          applied_at?: string | null
          created_at?: string
          error_prediction?: Json | null
          fix_code?: string
          fix_mode?: string
          fix_reason?: string | null
          fix_status?: string
          id?: string
          metadata?: Json | null
          original_code_snapshot?: string | null
          original_file_path?: string | null
          rollback_reason?: string | null
          rolled_back_at?: string | null
          syntax_validation?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "manual_fixes_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "camerpulse_activity_timeline"
            referencedColumns: ["id"]
          },
        ]
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
      media_alerts: {
        Row: {
          actual_value: number | null
          alert_description: string | null
          alert_severity: Database["public"]["Enums"]["threat_level"] | null
          alert_title: string
          alert_type: string
          analysis_id: string | null
          created_at: string | null
          entities_affected: string[] | null
          id: string
          metadata: Json | null
          public_display: boolean | null
          published_to_disinfo_map: boolean | null
          regions_affected: string[] | null
          resolution_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          source_id: string | null
          status: string | null
          threshold_breached: string | null
          threshold_value: number | null
          updated_at: string | null
        }
        Insert: {
          actual_value?: number | null
          alert_description?: string | null
          alert_severity?: Database["public"]["Enums"]["threat_level"] | null
          alert_title: string
          alert_type: string
          analysis_id?: string | null
          created_at?: string | null
          entities_affected?: string[] | null
          id?: string
          metadata?: Json | null
          public_display?: boolean | null
          published_to_disinfo_map?: boolean | null
          regions_affected?: string[] | null
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_id?: string | null
          status?: string | null
          threshold_breached?: string | null
          threshold_value?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_value?: number | null
          alert_description?: string | null
          alert_severity?: Database["public"]["Enums"]["threat_level"] | null
          alert_title?: string
          alert_type?: string
          analysis_id?: string | null
          created_at?: string | null
          entities_affected?: string[] | null
          id?: string
          metadata?: Json | null
          public_display?: boolean | null
          published_to_disinfo_map?: boolean | null
          regions_affected?: string[] | null
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_id?: string | null
          status?: string | null
          threshold_breached?: string | null
          threshold_value?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_alerts_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "media_content_analysis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_alerts_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "media_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      media_content_analysis: {
        Row: {
          agenda_detected: string | null
          ai_confidence: number | null
          ai_model_used: string | null
          analysis_timestamp: string | null
          bias_level: Database["public"]["Enums"]["bias_level"] | null
          bias_score: number | null
          content_date: string | null
          content_summary: string | null
          content_text: string | null
          content_url: string | null
          created_at: string | null
          disinformation_indicators: string[] | null
          id: string
          language: string | null
          metadata: Json | null
          ministers_mentioned: string[] | null
          parties_mentioned: string[] | null
          politicians_mentioned: string[] | null
          processing_time_ms: number | null
          propaganda_markers: string[] | null
          regions_mentioned: string[] | null
          source_credibility_score: number | null
          source_id: string | null
          threat_level: Database["public"]["Enums"]["threat_level"] | null
          title: string | null
          tone: string | null
          trust_score: number | null
        }
        Insert: {
          agenda_detected?: string | null
          ai_confidence?: number | null
          ai_model_used?: string | null
          analysis_timestamp?: string | null
          bias_level?: Database["public"]["Enums"]["bias_level"] | null
          bias_score?: number | null
          content_date?: string | null
          content_summary?: string | null
          content_text?: string | null
          content_url?: string | null
          created_at?: string | null
          disinformation_indicators?: string[] | null
          id?: string
          language?: string | null
          metadata?: Json | null
          ministers_mentioned?: string[] | null
          parties_mentioned?: string[] | null
          politicians_mentioned?: string[] | null
          processing_time_ms?: number | null
          propaganda_markers?: string[] | null
          regions_mentioned?: string[] | null
          source_credibility_score?: number | null
          source_id?: string | null
          threat_level?: Database["public"]["Enums"]["threat_level"] | null
          title?: string | null
          tone?: string | null
          trust_score?: number | null
        }
        Update: {
          agenda_detected?: string | null
          ai_confidence?: number | null
          ai_model_used?: string | null
          analysis_timestamp?: string | null
          bias_level?: Database["public"]["Enums"]["bias_level"] | null
          bias_score?: number | null
          content_date?: string | null
          content_summary?: string | null
          content_text?: string | null
          content_url?: string | null
          created_at?: string | null
          disinformation_indicators?: string[] | null
          id?: string
          language?: string | null
          metadata?: Json | null
          ministers_mentioned?: string[] | null
          parties_mentioned?: string[] | null
          politicians_mentioned?: string[] | null
          processing_time_ms?: number | null
          propaganda_markers?: string[] | null
          regions_mentioned?: string[] | null
          source_credibility_score?: number | null
          source_id?: string | null
          threat_level?: Database["public"]["Enums"]["threat_level"] | null
          title?: string | null
          tone?: string | null
          trust_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_content_analysis_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "media_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      media_monitoring_schedules: {
        Row: {
          created_at: string | null
          cron_expression: string
          failure_count: number | null
          id: string
          is_active: boolean | null
          last_error: string | null
          last_run_at: string | null
          next_run_at: string | null
          run_count: number | null
          schedule_name: string
          source_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          cron_expression: string
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_error?: string | null
          last_run_at?: string | null
          next_run_at?: string | null
          run_count?: number | null
          schedule_name: string
          source_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          cron_expression?: string
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_error?: string | null
          last_run_at?: string | null
          next_run_at?: string | null
          run_count?: number | null
          schedule_name?: string
          source_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_monitoring_schedules_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "media_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      media_sources: {
        Row: {
          bias_threshold: number | null
          created_at: string | null
          created_by: string | null
          focus_keywords: string[] | null
          id: string
          is_active: boolean
          last_monitored_at: string | null
          metadata: Json | null
          monitor_frequency: string
          monitor_times: string[] | null
          public_display: boolean | null
          source_name: string
          source_type: Database["public"]["Enums"]["media_source_type"]
          source_url: string
          threat_threshold: Database["public"]["Enums"]["threat_level"] | null
          trust_threshold: number | null
          updated_at: string | null
        }
        Insert: {
          bias_threshold?: number | null
          created_at?: string | null
          created_by?: string | null
          focus_keywords?: string[] | null
          id?: string
          is_active?: boolean
          last_monitored_at?: string | null
          metadata?: Json | null
          monitor_frequency?: string
          monitor_times?: string[] | null
          public_display?: boolean | null
          source_name: string
          source_type: Database["public"]["Enums"]["media_source_type"]
          source_url: string
          threat_threshold?: Database["public"]["Enums"]["threat_level"] | null
          trust_threshold?: number | null
          updated_at?: string | null
        }
        Update: {
          bias_threshold?: number | null
          created_at?: string | null
          created_by?: string | null
          focus_keywords?: string[] | null
          id?: string
          is_active?: boolean
          last_monitored_at?: string | null
          metadata?: Json | null
          monitor_frequency?: string
          monitor_times?: string[] | null
          public_display?: boolean | null
          source_name?: string
          source_type?: Database["public"]["Enums"]["media_source_type"]
          source_url?: string
          threat_threshold?: Database["public"]["Enums"]["threat_level"] | null
          trust_threshold?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      membership_config: {
        Row: {
          created_at: string
          currency: string | null
          features_description: Json | null
          id: string
          membership_fee: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          features_description?: Json | null
          id?: string
          membership_fee?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          features_description?: Json | null
          id?: string
          membership_fee?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      merchandise: {
        Row: {
          artist_id: string
          care_instructions: string | null
          colors_available: string[] | null
          created_at: string
          id: string
          material: string | null
          merch_type: string
          product_id: string | null
          shipping_info: Json | null
          sizes_available: string[] | null
          updated_at: string
        }
        Insert: {
          artist_id: string
          care_instructions?: string | null
          colors_available?: string[] | null
          created_at?: string
          id?: string
          material?: string | null
          merch_type: string
          product_id?: string | null
          shipping_info?: Json | null
          sizes_available?: string[] | null
          updated_at?: string
        }
        Update: {
          artist_id?: string
          care_instructions?: string | null
          colors_available?: string[] | null
          created_at?: string
          id?: string
          material?: string | null
          merch_type?: string
          product_id?: string | null
          shipping_info?: Json | null
          sizes_available?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchandise_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "storefront_products"
            referencedColumns: ["id"]
          },
        ]
      }
      message_read_status: {
        Row: {
          id: string
          message_id: string | null
          read_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          message_id?: string | null
          read_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          message_id?: string | null
          read_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_read_status_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string
          id: string
          is_deleted: boolean | null
          is_read: boolean | null
          media_url: string | null
          message_type: string | null
          receiver_id: string
          reply_to_id: string | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          is_deleted?: boolean | null
          is_read?: boolean | null
          media_url?: string | null
          message_type?: string | null
          receiver_id: string
          reply_to_id?: string | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          is_deleted?: boolean | null
          is_read?: boolean | null
          media_url?: string | null
          message_type?: string | null
          receiver_id?: string
          reply_to_id?: string | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messenger_media_files: {
        Row: {
          compression_ratio: number | null
          created_at: string | null
          download_count: number | null
          expires_at: string | null
          file_path: string
          file_size_bytes: number
          file_type: string
          id: string
          is_compressed: boolean | null
          message_id: string | null
          mime_type: string
          original_filename: string
          updated_at: string | null
          uploaded_by: string
        }
        Insert: {
          compression_ratio?: number | null
          created_at?: string | null
          download_count?: number | null
          expires_at?: string | null
          file_path: string
          file_size_bytes: number
          file_type: string
          id?: string
          is_compressed?: boolean | null
          message_id?: string | null
          mime_type: string
          original_filename: string
          updated_at?: string | null
          uploaded_by: string
        }
        Update: {
          compression_ratio?: number | null
          created_at?: string | null
          download_count?: number | null
          expires_at?: string | null
          file_path?: string
          file_size_bytes?: number
          file_type?: string
          id?: string
          is_compressed?: boolean | null
          message_id?: string | null
          mime_type?: string
          original_filename?: string
          updated_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "messenger_media_files_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messenger_media_settings: {
        Row: {
          auto_delete_days: number | null
          created_at: string | null
          enable_all_attachments: boolean | null
          enable_compression: boolean | null
          enable_images_only: boolean | null
          enable_videos: boolean | null
          enable_voice_only: boolean | null
          id: string
          max_file_size_mb: number | null
          updated_at: string | null
        }
        Insert: {
          auto_delete_days?: number | null
          created_at?: string | null
          enable_all_attachments?: boolean | null
          enable_compression?: boolean | null
          enable_images_only?: boolean | null
          enable_videos?: boolean | null
          enable_voice_only?: boolean | null
          id?: string
          max_file_size_mb?: number | null
          updated_at?: string | null
        }
        Update: {
          auto_delete_days?: number | null
          created_at?: string | null
          enable_all_attachments?: boolean | null
          enable_compression?: boolean | null
          enable_images_only?: boolean | null
          enable_videos?: boolean | null
          enable_voice_only?: boolean | null
          id?: string
          max_file_size_mb?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      moderation_actions: {
        Row: {
          action_type: string
          created_at: string
          details: Json | null
          id: string
          moderator_id: string
          reason: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          action_type: string
          created_at?: string
          details?: Json | null
          id?: string
          moderator_id: string
          reason?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          action_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          moderator_id?: string
          reason?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      moderation_analytics: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          moderator_id: string | null
          period_end: string
          period_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          moderator_id?: string | null
          period_end: string
          period_start: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          moderator_id?: string | null
          period_end?: string
          period_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_analytics_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "civic_moderators"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_appeals: {
        Row: {
          appeal_details: string | null
          appeal_reason: string
          appeal_status: string
          appellant_id: string
          created_at: string
          evidence_urls: string[] | null
          id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          submission_id: string
          updated_at: string
        }
        Insert: {
          appeal_details?: string | null
          appeal_reason: string
          appeal_status?: string
          appellant_id: string
          created_at?: string
          evidence_urls?: string[] | null
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          submission_id: string
          updated_at?: string
        }
        Update: {
          appeal_details?: string | null
          appeal_reason?: string
          appeal_status?: string
          appellant_id?: string
          created_at?: string
          evidence_urls?: string[] | null
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          submission_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_appeals_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "civic_moderators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_appeals_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "moderation_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          moderator_id: string
          notification_type: string
          priority: string
          read_at: string | null
          related_id: string | null
          related_type: string | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          moderator_id: string
          notification_type: string
          priority?: string
          read_at?: string | null
          related_id?: string | null
          related_type?: string | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          moderator_id?: string
          notification_type?: string
          priority?: string
          read_at?: string | null
          related_id?: string | null
          related_type?: string | null
          title?: string
        }
        Relationships: []
      }
      moderation_queue: {
        Row: {
          assigned_to: string | null
          created_at: string
          decision_reason: string | null
          id: string
          moderator_notes: string | null
          priority_level: number
          proof_documents: string[] | null
          region: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["submission_status"]
          submission_data: Json
          submission_type: string
          submitted_by: string
          updated_at: string
          village_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          decision_reason?: string | null
          id?: string
          moderator_notes?: string | null
          priority_level?: number
          proof_documents?: string[] | null
          region?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submission_data?: Json
          submission_type: string
          submitted_by: string
          updated_at?: string
          village_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          decision_reason?: string | null
          id?: string
          moderator_notes?: string | null
          priority_level?: number
          proof_documents?: string[] | null
          region?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submission_data?: Json
          submission_type?: string
          submitted_by?: string
          updated_at?: string
          village_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_queue_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "civic_moderators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_queue_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "civic_moderators"
            referencedColumns: ["id"]
          },
        ]
      }
      moderator_activities: {
        Row: {
          activity_type: string
          changes_made: Json | null
          created_at: string
          description: string
          id: string
          moderator_id: string
          proof_documents: string[] | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          activity_type: string
          changes_made?: Json | null
          created_at?: string
          description: string
          id?: string
          moderator_id: string
          proof_documents?: string[] | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          activity_type?: string
          changes_made?: Json | null
          created_at?: string
          description?: string
          id?: string
          moderator_id?: string
          proof_documents?: string[] | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderator_activities_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "civic_moderators"
            referencedColumns: ["id"]
          },
        ]
      }
      moderator_applications: {
        Row: {
          admin_notes: string | null
          application_status: Database["public"]["Enums"]["application_status"]
          civic_experience: string | null
          civic_oath_accepted: boolean
          created_at: string
          full_name: string
          id: string
          id_document_url: string | null
          interview_scheduled_at: string | null
          preferred_coverage_area: string
          preferred_role: Database["public"]["Enums"]["app_role"]
          region_of_residence: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          updated_at: string
          user_id: string
          village_of_origin: string
        }
        Insert: {
          admin_notes?: string | null
          application_status?: Database["public"]["Enums"]["application_status"]
          civic_experience?: string | null
          civic_oath_accepted?: boolean
          created_at?: string
          full_name: string
          id?: string
          id_document_url?: string | null
          interview_scheduled_at?: string | null
          preferred_coverage_area: string
          preferred_role: Database["public"]["Enums"]["app_role"]
          region_of_residence: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          updated_at?: string
          user_id: string
          village_of_origin: string
        }
        Update: {
          admin_notes?: string | null
          application_status?: Database["public"]["Enums"]["application_status"]
          civic_experience?: string | null
          civic_oath_accepted?: boolean
          created_at?: string
          full_name?: string
          id?: string
          id_document_url?: string | null
          interview_scheduled_at?: string | null
          preferred_coverage_area?: string
          preferred_role?: Database["public"]["Enums"]["app_role"]
          region_of_residence?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          updated_at?: string
          user_id?: string
          village_of_origin?: string
        }
        Relationships: []
      }
      moderator_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          assignment_type: string
          assignment_value: string
          created_at: string
          id: string
          is_primary: boolean
          revoked_at: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          assignment_type: string
          assignment_value: string
          created_at?: string
          id?: string
          is_primary?: boolean
          revoked_at?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          assignment_type?: string
          assignment_value?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          revoked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      moderator_badges: {
        Row: {
          badge_type: Database["public"]["Enums"]["badge_type"]
          description: string | null
          earned_at: string
          evidence_data: Json | null
          id: string
          moderator_id: string
        }
        Insert: {
          badge_type: Database["public"]["Enums"]["badge_type"]
          description?: string | null
          earned_at?: string
          evidence_data?: Json | null
          id?: string
          moderator_id: string
        }
        Update: {
          badge_type?: Database["public"]["Enums"]["badge_type"]
          description?: string | null
          earned_at?: string
          evidence_data?: Json | null
          id?: string
          moderator_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderator_badges_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "civic_moderators"
            referencedColumns: ["id"]
          },
        ]
      }
      moderator_guidelines: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          required_reading: boolean
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          required_reading?: boolean
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          required_reading?: boolean
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      moderator_notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string
          metadata: Json | null
          moderator_id: string
          notification_type: string
          priority: string
          read_at: string | null
          title: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          moderator_id: string
          notification_type: string
          priority?: string
          read_at?: string | null
          title: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          moderator_id?: string
          notification_type?: string
          priority?: string
          read_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderator_notifications_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "civic_moderators"
            referencedColumns: ["id"]
          },
        ]
      }
      moderator_onboarding_progress: {
        Row: {
          assigned_region: string | null
          completed_at: string | null
          created_at: string
          current_step: string
          id: string
          mentor_id: string | null
          notes: string | null
          oath_accepted_at: string | null
          quiz_attempts: number
          quiz_passed: boolean
          quiz_score: number | null
          slides_completed: number
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_region?: string | null
          completed_at?: string | null
          created_at?: string
          current_step?: string
          id?: string
          mentor_id?: string | null
          notes?: string | null
          oath_accepted_at?: string | null
          quiz_attempts?: number
          quiz_passed?: boolean
          quiz_score?: number | null
          slides_completed?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_region?: string | null
          completed_at?: string | null
          created_at?: string
          current_step?: string
          id?: string
          mentor_id?: string | null
          notes?: string | null
          oath_accepted_at?: string | null
          quiz_attempts?: number
          quiz_passed?: boolean
          quiz_score?: number | null
          slides_completed?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      moderator_performance: {
        Row: {
          badges_earned: Json
          conflicts_resolved: number
          created_at: string
          id: string
          metric_date: string
          quality_score: number
          submissions_approved: number
          submissions_rejected: number
          updated_at: string
          user_id: string
          user_reports_handled: number
          villages_moderated: number
        }
        Insert: {
          badges_earned?: Json
          conflicts_resolved?: number
          created_at?: string
          id?: string
          metric_date?: string
          quality_score?: number
          submissions_approved?: number
          submissions_rejected?: number
          updated_at?: string
          user_id: string
          user_reports_handled?: number
          villages_moderated?: number
        }
        Update: {
          badges_earned?: Json
          conflicts_resolved?: number
          created_at?: string
          id?: string
          metric_date?: string
          quality_score?: number
          submissions_approved?: number
          submissions_rejected?: number
          updated_at?: string
          user_id?: string
          user_reports_handled?: number
          villages_moderated?: number
        }
        Relationships: []
      }
      moderator_quiz_attempts: {
        Row: {
          answers: Json
          attempt_number: number
          completed_at: string
          id: string
          onboarding_progress_id: string
          passed: boolean
          score: number
          time_taken_minutes: number | null
          user_id: string
        }
        Insert: {
          answers: Json
          attempt_number: number
          completed_at?: string
          id?: string
          onboarding_progress_id: string
          passed?: boolean
          score: number
          time_taken_minutes?: number | null
          user_id: string
        }
        Update: {
          answers?: Json
          attempt_number?: number
          completed_at?: string
          id?: string
          onboarding_progress_id?: string
          passed?: boolean
          score?: number
          time_taken_minutes?: number | null
          user_id?: string
        }
        Relationships: []
      }
      moderator_quiz_questions: {
        Row: {
          correct_answer: string | null
          created_at: string
          explanation: string | null
          id: string
          is_active: boolean
          options: Json | null
          points: number
          question_number: number
          question_text: string
          question_type: string
          updated_at: string
        }
        Insert: {
          correct_answer?: string | null
          created_at?: string
          explanation?: string | null
          id?: string
          is_active?: boolean
          options?: Json | null
          points?: number
          question_number: number
          question_text: string
          question_type: string
          updated_at?: string
        }
        Update: {
          correct_answer?: string | null
          created_at?: string
          explanation?: string | null
          id?: string
          is_active?: boolean
          options?: Json | null
          points?: number
          question_number?: number
          question_text?: string
          question_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      moderator_training_progress: {
        Row: {
          attempts: number | null
          completed_at: string | null
          created_at: string
          guideline_id: string
          id: string
          moderator_id: string
          quiz_score: number | null
        }
        Insert: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string
          guideline_id: string
          id?: string
          moderator_id: string
          quiz_score?: number | null
        }
        Update: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string
          guideline_id?: string
          id?: string
          moderator_id?: string
          quiz_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "moderator_training_progress_guideline_id_fkey"
            columns: ["guideline_id"]
            isOneToOne: false
            referencedRelation: "moderator_guidelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderator_training_progress_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "civic_moderators"
            referencedColumns: ["id"]
          },
        ]
      }
      moderator_training_slides: {
        Row: {
          content: string
          created_at: string
          id: string
          is_active: boolean
          media_url: string | null
          slide_number: number
          slide_type: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          media_url?: string | null
          slide_number: number
          slide_type?: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          media_url?: string | null
          slide_number?: number
          slide_type?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      monitoring_dashboards: {
        Row: {
          access_roles: string[]
          alert_thresholds: Json | null
          auto_refresh_enabled: boolean
          created_at: string
          created_by: string | null
          dashboard_name: string
          dashboard_type: string
          id: string
          is_public: boolean
          metadata: Json | null
          refresh_interval_seconds: number
          shared_with: string[] | null
          updated_at: string
          widget_configuration: Json
        }
        Insert: {
          access_roles?: string[]
          alert_thresholds?: Json | null
          auto_refresh_enabled?: boolean
          created_at?: string
          created_by?: string | null
          dashboard_name: string
          dashboard_type: string
          id?: string
          is_public?: boolean
          metadata?: Json | null
          refresh_interval_seconds?: number
          shared_with?: string[] | null
          updated_at?: string
          widget_configuration: Json
        }
        Update: {
          access_roles?: string[]
          alert_thresholds?: Json | null
          auto_refresh_enabled?: boolean
          created_at?: string
          created_by?: string | null
          dashboard_name?: string
          dashboard_type?: string
          id?: string
          is_public?: boolean
          metadata?: Json | null
          refresh_interval_seconds?: number
          shared_with?: string[] | null
          updated_at?: string
          widget_configuration?: Json
        }
        Relationships: []
      }
      music_releases: {
        Row: {
          album_price: number | null
          artist_id: string | null
          cover_art_url: string | null
          created_at: string | null
          external_links: Json | null
          featured_by_admin: boolean | null
          genre: string
          id: string
          language: string | null
          mood_tags: string[] | null
          price_per_track: number | null
          pricing_type: Database["public"]["Enums"]["pricing_type"] | null
          release_date: string | null
          release_type: Database["public"]["Enums"]["track_type"]
          status: Database["public"]["Enums"]["release_status"] | null
          streaming_enabled: boolean | null
          title: string
          total_downloads: number | null
          total_earnings: number | null
          total_plays: number | null
          total_tracks: number | null
          updated_at: string | null
        }
        Insert: {
          album_price?: number | null
          artist_id?: string | null
          cover_art_url?: string | null
          created_at?: string | null
          external_links?: Json | null
          featured_by_admin?: boolean | null
          genre: string
          id?: string
          language?: string | null
          mood_tags?: string[] | null
          price_per_track?: number | null
          pricing_type?: Database["public"]["Enums"]["pricing_type"] | null
          release_date?: string | null
          release_type: Database["public"]["Enums"]["track_type"]
          status?: Database["public"]["Enums"]["release_status"] | null
          streaming_enabled?: boolean | null
          title: string
          total_downloads?: number | null
          total_earnings?: number | null
          total_plays?: number | null
          total_tracks?: number | null
          updated_at?: string | null
        }
        Update: {
          album_price?: number | null
          artist_id?: string | null
          cover_art_url?: string | null
          created_at?: string | null
          external_links?: Json | null
          featured_by_admin?: boolean | null
          genre?: string
          id?: string
          language?: string | null
          mood_tags?: string[] | null
          price_per_track?: number | null
          pricing_type?: Database["public"]["Enums"]["pricing_type"] | null
          release_date?: string | null
          release_type?: Database["public"]["Enums"]["track_type"]
          status?: Database["public"]["Enums"]["release_status"] | null
          streaming_enabled?: boolean | null
          title?: string
          total_downloads?: number | null
          total_earnings?: number | null
          total_plays?: number | null
          total_tracks?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "music_releases_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artist_memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      music_tracks: {
        Row: {
          audio_file_url: string
          audio_format: Database["public"]["Enums"]["audio_format"]
          created_at: string | null
          download_count: number | null
          duration_seconds: number | null
          featured_artists: string[] | null
          file_hash: string | null
          file_size_bytes: number | null
          id: string
          lyrics: string | null
          play_count: number | null
          producers: string[] | null
          release_id: string | null
          status: string
          title: string
          track_id: string
          track_number: number | null
          updated_at: string | null
        }
        Insert: {
          audio_file_url: string
          audio_format: Database["public"]["Enums"]["audio_format"]
          created_at?: string | null
          download_count?: number | null
          duration_seconds?: number | null
          featured_artists?: string[] | null
          file_hash?: string | null
          file_size_bytes?: number | null
          id?: string
          lyrics?: string | null
          play_count?: number | null
          producers?: string[] | null
          release_id?: string | null
          status?: string
          title: string
          track_id: string
          track_number?: number | null
          updated_at?: string | null
        }
        Update: {
          audio_file_url?: string
          audio_format?: Database["public"]["Enums"]["audio_format"]
          created_at?: string | null
          download_count?: number | null
          duration_seconds?: number | null
          featured_artists?: string[] | null
          file_hash?: string | null
          file_size_bytes?: number | null
          id?: string
          lyrics?: string | null
          play_count?: number | null
          producers?: string[] | null
          release_id?: string | null
          status?: string
          title?: string
          track_id?: string
          track_number?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "music_tracks_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "music_releases"
            referencedColumns: ["id"]
          },
        ]
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
      notification_flows: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          condition_logic: Json | null
          created_at: string
          created_by: string | null
          delay_minutes: number | null
          event_type: Database["public"]["Enums"]["notification_event_type"]
          flow_name: string
          id: string
          is_active: boolean
          priority: number
          recipient_type: Database["public"]["Enums"]["user_type"]
          template_id: string | null
          updated_at: string
        }
        Insert: {
          channel: Database["public"]["Enums"]["notification_channel"]
          condition_logic?: Json | null
          created_at?: string
          created_by?: string | null
          delay_minutes?: number | null
          event_type: Database["public"]["Enums"]["notification_event_type"]
          flow_name: string
          id?: string
          is_active?: boolean
          priority?: number
          recipient_type: Database["public"]["Enums"]["user_type"]
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          condition_logic?: Json | null
          created_at?: string
          created_by?: string | null
          delay_minutes?: number | null
          event_type?: Database["public"]["Enums"]["notification_event_type"]
          flow_name?: string
          id?: string
          is_active?: boolean
          priority?: number
          recipient_type?: Database["public"]["Enums"]["user_type"]
          template_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          delivered_at: string | null
          error_message: string | null
          event_type: Database["public"]["Enums"]["notification_event_type"]
          external_id: string | null
          failed_at: string | null
          flow_id: string
          id: string
          recipient_id: string
          retry_count: number | null
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          template_data: Json | null
        }
        Insert: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          event_type: Database["public"]["Enums"]["notification_event_type"]
          external_id?: string | null
          failed_at?: string | null
          flow_id: string
          id?: string
          recipient_id: string
          retry_count?: number | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          template_data?: Json | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          event_type?: Database["public"]["Enums"]["notification_event_type"]
          external_id?: string | null
          failed_at?: string | null
          flow_id?: string
          id?: string
          recipient_id?: string
          retry_count?: number | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          template_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "notification_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_metrics: {
        Row: {
          created_at: string
          event_timestamp: string
          event_type: string
          id: string
          log_id: string
          metadata: Json | null
        }
        Insert: {
          created_at?: string
          event_timestamp?: string
          event_type: string
          id?: string
          log_id: string
          metadata?: Json | null
        }
        Update: {
          created_at?: string
          event_timestamp?: string
          event_type?: string
          id?: string
          log_id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_metrics_log_id_fkey"
            columns: ["log_id"]
            isOneToOne: false
            referencedRelation: "notification_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_queue: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          error_message: string | null
          event_type: Database["public"]["Enums"]["notification_event_type"]
          flow_id: string
          id: string
          max_retries: number | null
          processed_at: string | null
          recipient_id: string
          retry_count: number | null
          scheduled_at: string
          status: string
          template_data: Json | null
        }
        Insert: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          error_message?: string | null
          event_type: Database["public"]["Enums"]["notification_event_type"]
          flow_id: string
          id?: string
          max_retries?: number | null
          processed_at?: string | null
          recipient_id: string
          retry_count?: number | null
          scheduled_at: string
          status?: string
          template_data?: Json | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          error_message?: string | null
          event_type?: Database["public"]["Enums"]["notification_event_type"]
          flow_id?: string
          id?: string
          max_retries?: number | null
          processed_at?: string | null
          recipient_id?: string
          retry_count?: number | null
          scheduled_at?: string
          status?: string
          template_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_queue_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "notification_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          content: string
          created_at: string
          id: string
          is_active: boolean
          subject: string | null
          template_name: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          channel: Database["public"]["Enums"]["notification_channel"]
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          subject?: string | null
          template_name: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          subject?: string | null
          template_name?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      official_change_log: {
        Row: {
          admin_notes: string | null
          admin_reviewed: boolean | null
          change_description: string | null
          change_type: string
          created_at: string
          detected_at: string
          id: string
          new_data: Json | null
          official_id: string | null
          official_name: string
          previous_data: Json | null
          processed: boolean | null
          source_type: string
          source_url: string | null
        }
        Insert: {
          admin_notes?: string | null
          admin_reviewed?: boolean | null
          change_description?: string | null
          change_type: string
          created_at?: string
          detected_at?: string
          id?: string
          new_data?: Json | null
          official_id?: string | null
          official_name: string
          previous_data?: Json | null
          processed?: boolean | null
          source_type: string
          source_url?: string | null
        }
        Update: {
          admin_notes?: string | null
          admin_reviewed?: boolean | null
          change_description?: string | null
          change_type?: string
          created_at?: string
          detected_at?: string
          id?: string
          new_data?: Json | null
          official_id?: string | null
          official_name?: string
          previous_data?: Json | null
          processed?: boolean | null
          source_type?: string
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "official_change_log_official_id_fkey"
            columns: ["official_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          notes: string | null
          product_id: string | null
          quantity: number | null
          shipping_address: Json | null
          status: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          tracking_number: string | null
          updated_at: string
          user_id: string | null
          vendor_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          notes?: string | null
          product_id?: string | null
          quantity?: number | null
          shipping_address?: Json | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          notes?: string | null
          product_id?: string | null
          quantity?: number | null
          shipping_address?: Json | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "marketplace_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      pan_africa_civic_mesh_nodes: {
        Row: {
          api_endpoints: Json | null
          capital_city: string
          civic_issues_count: number | null
          country_code: string
          country_name: string
          created_at: string | null
          cross_border_enabled: boolean | null
          currency_code: string
          data_quality_score: number | null
          data_sources: Json | null
          flag_emoji: string
          id: string
          intelligence_sharing_enabled: boolean | null
          is_active: boolean | null
          last_sync_at: string | null
          legislators_count: number | null
          mesh_status: string | null
          ministers_count: number | null
          parties_count: number | null
          primary_language: string
          region: string
          scraper_config: Json | null
          supported_languages: string[] | null
          sync_frequency_hours: number | null
          updated_at: string | null
        }
        Insert: {
          api_endpoints?: Json | null
          capital_city: string
          civic_issues_count?: number | null
          country_code: string
          country_name: string
          created_at?: string | null
          cross_border_enabled?: boolean | null
          currency_code: string
          data_quality_score?: number | null
          data_sources?: Json | null
          flag_emoji: string
          id?: string
          intelligence_sharing_enabled?: boolean | null
          is_active?: boolean | null
          last_sync_at?: string | null
          legislators_count?: number | null
          mesh_status?: string | null
          ministers_count?: number | null
          parties_count?: number | null
          primary_language?: string
          region: string
          scraper_config?: Json | null
          supported_languages?: string[] | null
          sync_frequency_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          api_endpoints?: Json | null
          capital_city?: string
          civic_issues_count?: number | null
          country_code?: string
          country_name?: string
          created_at?: string | null
          cross_border_enabled?: boolean | null
          currency_code?: string
          data_quality_score?: number | null
          data_sources?: Json | null
          flag_emoji?: string
          id?: string
          intelligence_sharing_enabled?: boolean | null
          is_active?: boolean | null
          last_sync_at?: string | null
          legislators_count?: number | null
          mesh_status?: string | null
          ministers_count?: number | null
          parties_count?: number | null
          primary_language?: string
          region?: string
          scraper_config?: Json | null
          supported_languages?: string[] | null
          sync_frequency_hours?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pan_africa_config: {
        Row: {
          config_key: string
          config_type: string
          config_value: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          config_key: string
          config_type?: string
          config_value?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          config_key?: string
          config_type?: string
          config_value?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      pan_africa_countries: {
        Row: {
          capital_city: string | null
          continent: string | null
          country_code: string
          country_name: string
          country_name_local: string | null
          created_at: string
          currency_code: string
          flag_emoji: string
          flag_url: string | null
          id: string
          is_active: boolean | null
          population: number | null
          primary_language: string
          region: string | null
          supported_languages: string[] | null
          time_zone: string | null
          updated_at: string
        }
        Insert: {
          capital_city?: string | null
          continent?: string | null
          country_code: string
          country_name: string
          country_name_local?: string | null
          created_at?: string
          currency_code?: string
          flag_emoji: string
          flag_url?: string | null
          id?: string
          is_active?: boolean | null
          population?: number | null
          primary_language?: string
          region?: string | null
          supported_languages?: string[] | null
          time_zone?: string | null
          updated_at?: string
        }
        Update: {
          capital_city?: string | null
          continent?: string | null
          country_code?: string
          country_name?: string
          country_name_local?: string | null
          created_at?: string
          currency_code?: string
          flag_emoji?: string
          flag_url?: string | null
          id?: string
          is_active?: boolean | null
          population?: number | null
          primary_language?: string
          region?: string | null
          supported_languages?: string[] | null
          time_zone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pan_africa_cross_border_analytics: {
        Row: {
          analysis_date: string | null
          analysis_results: Json
          analysis_type: string
          anomalies_detected: Json | null
          confidence_score: number | null
          countries_analyzed: string[]
          created_at: string | null
          generated_by: string | null
          id: string
          insights: Json | null
          region_scope: string | null
          risk_indicators: Json | null
          urgency_level: string | null
        }
        Insert: {
          analysis_date?: string | null
          analysis_results?: Json
          analysis_type: string
          anomalies_detected?: Json | null
          confidence_score?: number | null
          countries_analyzed: string[]
          created_at?: string | null
          generated_by?: string | null
          id?: string
          insights?: Json | null
          region_scope?: string | null
          risk_indicators?: Json | null
          urgency_level?: string | null
        }
        Update: {
          analysis_date?: string | null
          analysis_results?: Json
          analysis_type?: string
          anomalies_detected?: Json | null
          confidence_score?: number | null
          countries_analyzed?: string[]
          created_at?: string | null
          generated_by?: string | null
          id?: string
          insights?: Json | null
          region_scope?: string | null
          risk_indicators?: Json | null
          urgency_level?: string | null
        }
        Relationships: []
      }
      pan_africa_cross_country_analytics: {
        Row: {
          analysis_data: Json
          analysis_date: string
          analysis_type: string
          countries_compared: string[]
          created_at: string
          id: string
          insights: Json | null
        }
        Insert: {
          analysis_data: Json
          analysis_date?: string
          analysis_type: string
          countries_compared: string[]
          created_at?: string
          id?: string
          insights?: Json | null
        }
        Update: {
          analysis_data?: Json
          analysis_date?: string
          analysis_type?: string
          countries_compared?: string[]
          created_at?: string
          id?: string
          insights?: Json | null
        }
        Relationships: []
      }
      pan_africa_mesh_alerts: {
        Row: {
          acknowledged_by: string[] | null
          affected_countries: string[]
          alert_description: string
          alert_title: string
          alert_type: string
          auto_resolve_at: string | null
          created_at: string | null
          evidence_data: Json | null
          id: string
          recommended_actions: Json | null
          region: string | null
          related_events: Json | null
          resolved_at: string | null
          severity_level: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          acknowledged_by?: string[] | null
          affected_countries: string[]
          alert_description: string
          alert_title: string
          alert_type: string
          auto_resolve_at?: string | null
          created_at?: string | null
          evidence_data?: Json | null
          id?: string
          recommended_actions?: Json | null
          region?: string | null
          related_events?: Json | null
          resolved_at?: string | null
          severity_level?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          acknowledged_by?: string[] | null
          affected_countries?: string[]
          alert_description?: string
          alert_title?: string
          alert_type?: string
          auto_resolve_at?: string | null
          created_at?: string | null
          evidence_data?: Json | null
          id?: string
          recommended_actions?: Json | null
          region?: string | null
          related_events?: Json | null
          resolved_at?: string | null
          severity_level?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pan_africa_mesh_config: {
        Row: {
          applies_to_countries: string[] | null
          applies_to_regions: string[] | null
          config_category: string
          config_key: string
          config_value: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          applies_to_countries?: string[] | null
          applies_to_regions?: string[] | null
          config_category: string
          config_key: string
          config_value: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          applies_to_countries?: string[] | null
          applies_to_regions?: string[] | null
          config_category?: string
          config_key?: string
          config_value?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      pan_africa_mesh_sync_logs: {
        Row: {
          completed_at: string | null
          country_code: string
          created_at: string | null
          duration_seconds: number | null
          error_details: Json | null
          error_message: string | null
          id: string
          records_added: number | null
          records_failed: number | null
          records_processed: number | null
          records_updated: number | null
          started_at: string | null
          status: string | null
          sync_config: Json | null
          sync_operation: string
          sync_type: string
          triggered_by: string | null
        }
        Insert: {
          completed_at?: string | null
          country_code: string
          created_at?: string | null
          duration_seconds?: number | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          records_added?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          started_at?: string | null
          status?: string | null
          sync_config?: Json | null
          sync_operation: string
          sync_type: string
          triggered_by?: string | null
        }
        Update: {
          completed_at?: string | null
          country_code?: string
          created_at?: string | null
          duration_seconds?: number | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          records_added?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          started_at?: string | null
          status?: string | null
          sync_config?: Json | null
          sync_operation?: string
          sync_type?: string
          triggered_by?: string | null
        }
        Relationships: []
      }
      pan_africa_sentiment_logs: {
        Row: {
          administrative_division_id: string | null
          audio_emotion_analysis: Json | null
          audio_transcript: string | null
          author_handle: string | null
          author_influence_score: number | null
          confidence_score: number | null
          content_category: string[] | null
          content_id: string | null
          content_text: string
          coordinates: Json | null
          country_code: string
          created_at: string
          emotional_tone: string[] | null
          engagement_metrics: Json | null
          facial_emotion_scores: Json | null
          flagged_for_review: boolean | null
          hashtags: string[] | null
          id: string
          keywords_detected: string[] | null
          language_detected: string | null
          media_metadata: Json | null
          media_type: string | null
          media_url: string | null
          mentions: string[] | null
          multimodal_confidence: number | null
          platform: string
          processed_at: string | null
          sentiment_polarity: string
          sentiment_score: number | null
          threat_level: string | null
          visual_emotions: Json | null
        }
        Insert: {
          administrative_division_id?: string | null
          audio_emotion_analysis?: Json | null
          audio_transcript?: string | null
          author_handle?: string | null
          author_influence_score?: number | null
          confidence_score?: number | null
          content_category?: string[] | null
          content_id?: string | null
          content_text: string
          coordinates?: Json | null
          country_code: string
          created_at?: string
          emotional_tone?: string[] | null
          engagement_metrics?: Json | null
          facial_emotion_scores?: Json | null
          flagged_for_review?: boolean | null
          hashtags?: string[] | null
          id?: string
          keywords_detected?: string[] | null
          language_detected?: string | null
          media_metadata?: Json | null
          media_type?: string | null
          media_url?: string | null
          mentions?: string[] | null
          multimodal_confidence?: number | null
          platform: string
          processed_at?: string | null
          sentiment_polarity: string
          sentiment_score?: number | null
          threat_level?: string | null
          visual_emotions?: Json | null
        }
        Update: {
          administrative_division_id?: string | null
          audio_emotion_analysis?: Json | null
          audio_transcript?: string | null
          author_handle?: string | null
          author_influence_score?: number | null
          confidence_score?: number | null
          content_category?: string[] | null
          content_id?: string | null
          content_text?: string
          coordinates?: Json | null
          country_code?: string
          created_at?: string
          emotional_tone?: string[] | null
          engagement_metrics?: Json | null
          facial_emotion_scores?: Json | null
          flagged_for_review?: boolean | null
          hashtags?: string[] | null
          id?: string
          keywords_detected?: string[] | null
          language_detected?: string | null
          media_metadata?: Json | null
          media_type?: string | null
          media_url?: string | null
          mentions?: string[] | null
          multimodal_confidence?: number | null
          platform?: string
          processed_at?: string | null
          sentiment_polarity?: string
          sentiment_score?: number | null
          threat_level?: string | null
          visual_emotions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "pan_africa_sentiment_logs_administrative_division_id_fkey"
            columns: ["administrative_division_id"]
            isOneToOne: false
            referencedRelation: "country_administrative_divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pan_africa_sentiment_logs_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "pan_africa_countries"
            referencedColumns: ["country_code"]
          },
        ]
      }
      pan_africa_trending_topics: {
        Row: {
          category: string | null
          country_code: string
          emotional_breakdown: Json | null
          first_detected_at: string
          growth_rate: number | null
          id: string
          influencer_mentions: string[] | null
          last_updated_at: string | null
          platform_breakdown: Json | null
          regional_breakdown: Json | null
          related_hashtags: string[] | null
          sentiment_score: number | null
          threat_indicators: boolean | null
          topic_text: string
          trend_status: string | null
          volume_score: number | null
        }
        Insert: {
          category?: string | null
          country_code: string
          emotional_breakdown?: Json | null
          first_detected_at?: string
          growth_rate?: number | null
          id?: string
          influencer_mentions?: string[] | null
          last_updated_at?: string | null
          platform_breakdown?: Json | null
          regional_breakdown?: Json | null
          related_hashtags?: string[] | null
          sentiment_score?: number | null
          threat_indicators?: boolean | null
          topic_text: string
          trend_status?: string | null
          volume_score?: number | null
        }
        Update: {
          category?: string | null
          country_code?: string
          emotional_breakdown?: Json | null
          first_detected_at?: string
          growth_rate?: number | null
          id?: string
          influencer_mentions?: string[] | null
          last_updated_at?: string | null
          platform_breakdown?: Json | null
          regional_breakdown?: Json | null
          related_hashtags?: string[] | null
          sentiment_score?: number | null
          threat_indicators?: boolean | null
          topic_text?: string
          trend_status?: string | null
          volume_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pan_africa_trending_topics_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "pan_africa_countries"
            referencedColumns: ["country_code"]
          },
        ]
      }
      party_ai_verification: {
        Row: {
          created_at: string
          disputed_fields: string[] | null
          id: string
          last_sources_checked: Json | null
          last_verified_at: string | null
          outdated_fields: string[] | null
          party_id: string
          sources_count: number | null
          updated_at: string
          verification_score: number | null
          verification_status: string
        }
        Insert: {
          created_at?: string
          disputed_fields?: string[] | null
          id?: string
          last_sources_checked?: Json | null
          last_verified_at?: string | null
          outdated_fields?: string[] | null
          party_id: string
          sources_count?: number | null
          updated_at?: string
          verification_score?: number | null
          verification_status?: string
        }
        Update: {
          created_at?: string
          disputed_fields?: string[] | null
          id?: string
          last_sources_checked?: Json | null
          last_verified_at?: string | null
          outdated_fields?: string[] | null
          party_id?: string
          sources_count?: number | null
          updated_at?: string
          verification_score?: number | null
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "party_ai_verification_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: true
            referencedRelation: "political_parties"
            referencedColumns: ["id"]
          },
        ]
      }
      party_claims: {
        Row: {
          admin_notes: string | null
          claim_fee_amount: number
          created_at: string
          documents_uploaded: string[] | null
          id: string
          party_id: string
          payment_method: string | null
          payment_reference: string | null
          payment_status: string | null
          processed_at: string | null
          processed_by: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          claim_fee_amount?: number
          created_at?: string
          documents_uploaded?: string[] | null
          id?: string
          party_id: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          claim_fee_amount?: number
          created_at?: string
          documents_uploaded?: string[] | null
          id?: string
          party_id?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "party_claims_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "political_parties"
            referencedColumns: ["id"]
          },
        ]
      }
      party_logo_verifications: {
        Row: {
          admin_notes: string | null
          admin_reviewed: boolean | null
          confidence_score: number | null
          created_at: string | null
          id: string
          logo_url: string | null
          party_id: string
          source_type: string | null
          source_url: string | null
          updated_at: string | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          admin_notes?: string | null
          admin_reviewed?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          party_id: string
          source_type?: string | null
          source_url?: string | null
          updated_at?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          admin_notes?: string | null
          admin_reviewed?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          party_id?: string
          source_type?: string | null
          source_url?: string | null
          updated_at?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "party_logo_verifications_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "political_parties"
            referencedColumns: ["id"]
          },
        ]
      }
      party_promises: {
        Row: {
          broken_promise_alert_sent: boolean | null
          created_at: string | null
          date_made: string | null
          date_updated: string | null
          description: string | null
          evidence_url: string | null
          expected_delivery_date: string | null
          id: string
          party_id: string
          priority_level: string | null
          promise_text: string
          public_interest_score: number | null
          regions_targeted: string[] | null
          source_type: string | null
          status: string | null
          topic_category: string | null
          updated_at: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          broken_promise_alert_sent?: boolean | null
          created_at?: string | null
          date_made?: string | null
          date_updated?: string | null
          description?: string | null
          evidence_url?: string | null
          expected_delivery_date?: string | null
          id?: string
          party_id: string
          priority_level?: string | null
          promise_text: string
          public_interest_score?: number | null
          regions_targeted?: string[] | null
          source_type?: string | null
          status?: string | null
          topic_category?: string | null
          updated_at?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          broken_promise_alert_sent?: boolean | null
          created_at?: string | null
          date_made?: string | null
          date_updated?: string | null
          description?: string | null
          evidence_url?: string | null
          expected_delivery_date?: string | null
          id?: string
          party_id?: string
          priority_level?: string | null
          promise_text?: string
          public_interest_score?: number | null
          regions_targeted?: string[] | null
          source_type?: string | null
          status?: string | null
          topic_category?: string | null
          updated_at?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "party_promises_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "political_parties"
            referencedColumns: ["id"]
          },
        ]
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
      payment_config: {
        Row: {
          commission_percentage: number | null
          config_data: Json | null
          created_at: string | null
          currency: string | null
          id: string
          is_enabled: boolean | null
          provider: string
          test_mode: boolean | null
          updated_at: string | null
        }
        Insert: {
          commission_percentage?: number | null
          config_data?: Json | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_enabled?: boolean | null
          provider: string
          test_mode?: boolean | null
          updated_at?: string | null
        }
        Update: {
          commission_percentage?: number | null
          config_data?: Json | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_enabled?: boolean | null
          provider?: string
          test_mode?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      performance_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          actual_value: number | null
          alert_data: Json | null
          alert_description: string | null
          alert_title: string
          alert_type: string
          created_at: string
          expires_at: string | null
          id: string
          is_acknowledged: boolean
          metric_type:
            | Database["public"]["Enums"]["performance_metric_type"]
            | null
          politician_id: string
          severity_level: string
          threshold_value: number | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          actual_value?: number | null
          alert_data?: Json | null
          alert_description?: string | null
          alert_title: string
          alert_type: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_acknowledged?: boolean
          metric_type?:
            | Database["public"]["Enums"]["performance_metric_type"]
            | null
          politician_id: string
          severity_level?: string
          threshold_value?: number | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          actual_value?: number | null
          alert_data?: Json | null
          alert_description?: string | null
          alert_title?: string
          alert_type?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_acknowledged?: boolean
          metric_type?:
            | Database["public"]["Enums"]["performance_metric_type"]
            | null
          politician_id?: string
          severity_level?: string
          threshold_value?: number | null
        }
        Relationships: []
      }
      performance_forecasts: {
        Row: {
          actual_value: number | null
          confidence_interval_lower: number | null
          confidence_interval_upper: number | null
          confidence_score: number
          contributing_factors: Json | null
          created_at: string
          forecast_accuracy: number | null
          forecast_period_end: string
          forecast_period_start: string
          forecast_type: string
          id: string
          input_data: Json | null
          is_resolved: boolean
          model_used: string | null
          politician_id: string
          predicted_value: number
          scenario_assumptions: Json | null
          updated_at: string
        }
        Insert: {
          actual_value?: number | null
          confidence_interval_lower?: number | null
          confidence_interval_upper?: number | null
          confidence_score: number
          contributing_factors?: Json | null
          created_at?: string
          forecast_accuracy?: number | null
          forecast_period_end: string
          forecast_period_start: string
          forecast_type: string
          id?: string
          input_data?: Json | null
          is_resolved?: boolean
          model_used?: string | null
          politician_id: string
          predicted_value: number
          scenario_assumptions?: Json | null
          updated_at?: string
        }
        Update: {
          actual_value?: number | null
          confidence_interval_lower?: number | null
          confidence_interval_upper?: number | null
          confidence_score?: number
          contributing_factors?: Json | null
          created_at?: string
          forecast_accuracy?: number | null
          forecast_period_end?: string
          forecast_period_start?: string
          forecast_type?: string
          id?: string
          input_data?: Json | null
          is_resolved?: boolean
          model_used?: string | null
          politician_id?: string
          predicted_value?: number
          scenario_assumptions?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      performance_milestones: {
        Row: {
          achieved_at: string
          artist_id: string
          created_at: string
          id: string
          milestone_type: string
          milestone_value: number
          notified: boolean
          platform_type: Database["public"]["Enums"]["platform_type"] | null
          track_id: string | null
        }
        Insert: {
          achieved_at?: string
          artist_id: string
          created_at?: string
          id?: string
          milestone_type: string
          milestone_value: number
          notified?: boolean
          platform_type?: Database["public"]["Enums"]["platform_type"] | null
          track_id?: string | null
        }
        Update: {
          achieved_at?: string
          artist_id?: string
          created_at?: string
          id?: string
          milestone_type?: string
          milestone_value?: number
          notified?: boolean
          platform_type?: Database["public"]["Enums"]["platform_type"] | null
          track_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_milestones_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "music_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      petition_signatures: {
        Row: {
          comment: string | null
          email: string | null
          full_name: string
          id: string
          is_anonymous: boolean
          petition_id: string
          signed_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          email?: string | null
          full_name: string
          id?: string
          is_anonymous?: boolean
          petition_id: string
          signed_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_anonymous?: boolean
          petition_id?: string
          signed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "petition_signatures_petition_id_fkey"
            columns: ["petition_id"]
            isOneToOne: false
            referencedRelation: "petitions"
            referencedColumns: ["id"]
          },
        ]
      }
      petitions: {
        Row: {
          category: string
          created_at: string
          creator_id: string
          current_signatures: number
          deadline: string | null
          description: string
          goal_signatures: number
          id: string
          location: string | null
          status: string
          target_institution: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          creator_id: string
          current_signatures?: number
          deadline?: string | null
          description: string
          goal_signatures?: number
          id?: string
          location?: string | null
          status?: string
          target_institution: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          creator_id?: string
          current_signatures?: number
          deadline?: string | null
          description?: string
          goal_signatures?: number
          id?: string
          location?: string | null
          status?: string
          target_institution?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pharmacies: {
        Row: {
          claimable: boolean | null
          claimed_at: string | null
          claimed_by: string | null
          contact_info: Json | null
          created_at: string
          created_by: string | null
          delivery_available: boolean | null
          division: string
          id: string
          license_number: string | null
          license_status_rating: number | null
          medicine_availability_rating: number | null
          name: string
          overall_rating: number | null
          pharmacist_in_charge: string | null
          photo_gallery: string[] | null
          price_fairness_rating: number | null
          region: string
          service_quality_rating: number | null
          staff_knowledge_rating: number | null
          status: string | null
          total_ratings: number | null
          type: Database["public"]["Enums"]["pharmacy_type"]
          updated_at: string
          village_or_city: string
          working_hours: string | null
        }
        Insert: {
          claimable?: boolean | null
          claimed_at?: string | null
          claimed_by?: string | null
          contact_info?: Json | null
          created_at?: string
          created_by?: string | null
          delivery_available?: boolean | null
          division: string
          id?: string
          license_number?: string | null
          license_status_rating?: number | null
          medicine_availability_rating?: number | null
          name: string
          overall_rating?: number | null
          pharmacist_in_charge?: string | null
          photo_gallery?: string[] | null
          price_fairness_rating?: number | null
          region: string
          service_quality_rating?: number | null
          staff_knowledge_rating?: number | null
          status?: string | null
          total_ratings?: number | null
          type: Database["public"]["Enums"]["pharmacy_type"]
          updated_at?: string
          village_or_city: string
          working_hours?: string | null
        }
        Update: {
          claimable?: boolean | null
          claimed_at?: string | null
          claimed_by?: string | null
          contact_info?: Json | null
          created_at?: string
          created_by?: string | null
          delivery_available?: boolean | null
          division?: string
          id?: string
          license_number?: string | null
          license_status_rating?: number | null
          medicine_availability_rating?: number | null
          name?: string
          overall_rating?: number | null
          pharmacist_in_charge?: string | null
          photo_gallery?: string[] | null
          price_fairness_rating?: number | null
          region?: string
          service_quality_rating?: number | null
          staff_knowledge_rating?: number | null
          status?: string | null
          total_ratings?: number | null
          type?: Database["public"]["Enums"]["pharmacy_type"]
          updated_at?: string
          village_or_city?: string
          working_hours?: string | null
        }
        Relationships: []
      }
      pharmacy_claims: {
        Row: {
          admin_notes: string | null
          claim_message: string | null
          claim_status: string | null
          created_at: string
          evidence_files: string[] | null
          id: string
          pharmacy_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          claim_message?: string | null
          claim_status?: string | null
          created_at?: string
          evidence_files?: string[] | null
          id?: string
          pharmacy_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          claim_message?: string | null
          claim_status?: string | null
          created_at?: string
          evidence_files?: string[] | null
          id?: string
          pharmacy_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_claims_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_monetization: {
        Row: {
          amount_fcfa: number
          created_at: string
          expires_at: string | null
          feature_type: string
          id: string
          payment_reference: string | null
          payment_status: string | null
          pharmacy_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_fcfa: number
          created_at?: string
          expires_at?: string | null
          feature_type: string
          id?: string
          payment_reference?: string | null
          payment_status?: string | null
          pharmacy_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_fcfa?: number
          created_at?: string
          expires_at?: string | null
          feature_type?: string
          id?: string
          payment_reference?: string | null
          payment_status?: string | null
          pharmacy_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_monetization_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_ratings: {
        Row: {
          created_at: string
          id: string
          license_status_rating: number | null
          medicine_availability_rating: number | null
          pharmacy_id: string
          price_fairness_rating: number | null
          review_text: string | null
          service_quality_rating: number | null
          staff_knowledge_rating: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          license_status_rating?: number | null
          medicine_availability_rating?: number | null
          pharmacy_id: string
          price_fairness_rating?: number | null
          review_text?: string | null
          service_quality_rating?: number | null
          staff_knowledge_rating?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          license_status_rating?: number | null
          medicine_availability_rating?: number | null
          pharmacy_id?: string
          price_fairness_rating?: number | null
          review_text?: string | null
          service_quality_rating?: number | null
          staff_knowledge_rating?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_ratings_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_updates: {
        Row: {
          content: string
          created_at: string
          id: string
          is_featured: boolean | null
          pharmacy_id: string
          title: string
          update_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_featured?: boolean | null
          pharmacy_id: string
          title: string
          update_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_featured?: boolean | null
          pharmacy_id?: string
          title?: string
          update_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_updates_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_performance_data: {
        Row: {
          chart_positions: Json | null
          connection_id: string
          created_at: string
          date_recorded: string
          engagement_metrics: Json | null
          followers_count: number | null
          id: string
          monthly_listeners: number | null
          raw_data: Json | null
          revenue_data: Json | null
          stream_count: number | null
          top_regions: Json | null
          top_songs: Json | null
        }
        Insert: {
          chart_positions?: Json | null
          connection_id: string
          created_at?: string
          date_recorded?: string
          engagement_metrics?: Json | null
          followers_count?: number | null
          id?: string
          monthly_listeners?: number | null
          raw_data?: Json | null
          revenue_data?: Json | null
          stream_count?: number | null
          top_regions?: Json | null
          top_songs?: Json | null
        }
        Update: {
          chart_positions?: Json | null
          connection_id?: string
          created_at?: string
          date_recorded?: string
          engagement_metrics?: Json | null
          followers_count?: number | null
          id?: string
          monthly_listeners?: number | null
          raw_data?: Json | null
          revenue_data?: Json | null
          stream_count?: number | null
          top_regions?: Json | null
          top_songs?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_performance_data_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "artist_platform_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_sync_logs: {
        Row: {
          completed_at: string | null
          connection_id: string
          error_message: string | null
          id: string
          metadata: Json | null
          records_processed: number | null
          started_at: string
          status: string
          sync_duration_ms: number | null
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          connection_id: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          records_processed?: number | null
          started_at?: string
          status: string
          sync_duration_ms?: number | null
          sync_type: string
        }
        Update: {
          completed_at?: string | null
          connection_id?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          records_processed?: number | null
          started_at?: string
          status?: string
          sync_duration_ms?: number | null
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_sync_logs_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "artist_platform_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_tracks: {
        Row: {
          added_by_user_id: string
          created_at: string
          id: string
          playlist_id: string
          position: number
          track_id: string
        }
        Insert: {
          added_by_user_id: string
          created_at?: string
          id?: string
          playlist_id: string
          position: number
          track_id: string
        }
        Update: {
          added_by_user_id?: string
          created_at?: string
          id?: string
          playlist_id?: string
          position?: number
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_tracks_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_collaborative: boolean
          is_public: boolean
          name: string
          total_duration_seconds: number
          total_tracks: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_collaborative?: boolean
          is_public?: boolean
          name: string
          total_duration_seconds?: number
          total_tracks?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_collaborative?: boolean
          is_public?: boolean
          name?: string
          total_duration_seconds?: number
          total_tracks?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plugin_conflicts: {
        Row: {
          affected_resources: string[] | null
          auto_resolvable: boolean | null
          conflict_description: string
          conflict_severity: string
          conflict_type: string
          created_at: string
          detected_at: string
          id: string
          plugin_a_id: string
          plugin_b_id: string
          resolution_notes: string | null
          resolution_suggestion: string | null
          resolved_at: string | null
        }
        Insert: {
          affected_resources?: string[] | null
          auto_resolvable?: boolean | null
          conflict_description: string
          conflict_severity?: string
          conflict_type: string
          created_at?: string
          detected_at?: string
          id?: string
          plugin_a_id: string
          plugin_b_id: string
          resolution_notes?: string | null
          resolution_suggestion?: string | null
          resolved_at?: string | null
        }
        Update: {
          affected_resources?: string[] | null
          auto_resolvable?: boolean | null
          conflict_description?: string
          conflict_severity?: string
          conflict_type?: string
          created_at?: string
          detected_at?: string
          id?: string
          plugin_a_id?: string
          plugin_b_id?: string
          resolution_notes?: string | null
          resolution_suggestion?: string | null
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plugin_conflicts_plugin_a_id_fkey"
            columns: ["plugin_a_id"]
            isOneToOne: false
            referencedRelation: "plugin_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plugin_conflicts_plugin_b_id_fkey"
            columns: ["plugin_b_id"]
            isOneToOne: false
            referencedRelation: "plugin_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      plugin_installation_guards: {
        Row: {
          admin_override_by: string | null
          admin_override_reason: string | null
          admin_override_required: boolean | null
          block_reason: string | null
          created_at: string
          id: string
          installation_blocked: boolean | null
          plugin_id: string
          post_install_verification: Json | null
          pre_install_checks: Json | null
          rollback_plan: Json | null
          updated_at: string
        }
        Insert: {
          admin_override_by?: string | null
          admin_override_reason?: string | null
          admin_override_required?: boolean | null
          block_reason?: string | null
          created_at?: string
          id?: string
          installation_blocked?: boolean | null
          plugin_id: string
          post_install_verification?: Json | null
          pre_install_checks?: Json | null
          rollback_plan?: Json | null
          updated_at?: string
        }
        Update: {
          admin_override_by?: string | null
          admin_override_reason?: string | null
          admin_override_required?: boolean | null
          block_reason?: string | null
          created_at?: string
          id?: string
          installation_blocked?: boolean | null
          plugin_id?: string
          post_install_verification?: Json | null
          pre_install_checks?: Json | null
          rollback_plan?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plugin_installation_guards_plugin_id_fkey"
            columns: ["plugin_id"]
            isOneToOne: false
            referencedRelation: "plugin_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      plugin_registry: {
        Row: {
          api_endpoints: string[] | null
          component_overrides: string[] | null
          created_at: string
          css_overrides: string[] | null
          database_migrations: string[] | null
          dependencies_used: Json | null
          file_paths: string[]
          global_variables: string[] | null
          id: string
          install_date: string
          last_updated: string
          metadata: Json | null
          plugin_author: string | null
          plugin_name: string
          plugin_risk_score: number | null
          plugin_status: string
          plugin_type: string
          plugin_version: string
          routes_introduced: string[] | null
        }
        Insert: {
          api_endpoints?: string[] | null
          component_overrides?: string[] | null
          created_at?: string
          css_overrides?: string[] | null
          database_migrations?: string[] | null
          dependencies_used?: Json | null
          file_paths?: string[]
          global_variables?: string[] | null
          id?: string
          install_date?: string
          last_updated?: string
          metadata?: Json | null
          plugin_author?: string | null
          plugin_name: string
          plugin_risk_score?: number | null
          plugin_status?: string
          plugin_type?: string
          plugin_version: string
          routes_introduced?: string[] | null
        }
        Update: {
          api_endpoints?: string[] | null
          component_overrides?: string[] | null
          created_at?: string
          css_overrides?: string[] | null
          database_migrations?: string[] | null
          dependencies_used?: Json | null
          file_paths?: string[]
          global_variables?: string[] | null
          id?: string
          install_date?: string
          last_updated?: string
          metadata?: Json | null
          plugin_author?: string | null
          plugin_name?: string
          plugin_risk_score?: number | null
          plugin_status?: string
          plugin_type?: string
          plugin_version?: string
          routes_introduced?: string[] | null
        }
        Relationships: []
      }
      plugin_risk_assessments: {
        Row: {
          assessed_by: string | null
          assessment_notes: string | null
          assessment_version: number
          compatibility_score: number | null
          created_at: string
          id: string
          overall_risk_score: number | null
          performance_score: number | null
          plugin_id: string
          recommendations: Json | null
          risk_factors: Json | null
          security_score: number | null
          stability_score: number | null
        }
        Insert: {
          assessed_by?: string | null
          assessment_notes?: string | null
          assessment_version?: number
          compatibility_score?: number | null
          created_at?: string
          id?: string
          overall_risk_score?: number | null
          performance_score?: number | null
          plugin_id: string
          recommendations?: Json | null
          risk_factors?: Json | null
          security_score?: number | null
          stability_score?: number | null
        }
        Update: {
          assessed_by?: string | null
          assessment_notes?: string | null
          assessment_version?: number
          compatibility_score?: number | null
          created_at?: string
          id?: string
          overall_risk_score?: number | null
          performance_score?: number | null
          plugin_id?: string
          recommendations?: Json | null
          risk_factors?: Json | null
          security_score?: number | null
          stability_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "plugin_risk_assessments_plugin_id_fkey"
            columns: ["plugin_id"]
            isOneToOne: false
            referencedRelation: "plugin_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      plugin_stress_tests: {
        Row: {
          cpu_usage_percent: number | null
          crash_detected: boolean | null
          created_at: string
          device_type: string
          error_count: number | null
          error_logs: Json | null
          executed_at: string
          id: string
          memory_leak_detected: boolean | null
          memory_usage_mb: number | null
          network_condition: string
          performance_score: number | null
          plugin_id: string
          render_time_ms: number | null
          screen_resolution: string
          screenshot_url: string | null
          test_details: Json | null
          test_duration_ms: number | null
          test_result: string
          test_scenario: string
          test_type: string
        }
        Insert: {
          cpu_usage_percent?: number | null
          crash_detected?: boolean | null
          created_at?: string
          device_type?: string
          error_count?: number | null
          error_logs?: Json | null
          executed_at?: string
          id?: string
          memory_leak_detected?: boolean | null
          memory_usage_mb?: number | null
          network_condition?: string
          performance_score?: number | null
          plugin_id: string
          render_time_ms?: number | null
          screen_resolution?: string
          screenshot_url?: string | null
          test_details?: Json | null
          test_duration_ms?: number | null
          test_result?: string
          test_scenario: string
          test_type: string
        }
        Update: {
          cpu_usage_percent?: number | null
          crash_detected?: boolean | null
          created_at?: string
          device_type?: string
          error_count?: number | null
          error_logs?: Json | null
          executed_at?: string
          id?: string
          memory_leak_detected?: boolean | null
          memory_usage_mb?: number | null
          network_condition?: string
          performance_score?: number | null
          plugin_id?: string
          render_time_ms?: number | null
          screen_resolution?: string
          screenshot_url?: string | null
          test_details?: Json | null
          test_duration_ms?: number | null
          test_result?: string
          test_scenario?: string
          test_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "plugin_stress_tests_plugin_id_fkey"
            columns: ["plugin_id"]
            isOneToOne: false
            referencedRelation: "plugin_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      points_transactions: {
        Row: {
          activity_reference_id: string | null
          activity_type: string
          created_at: string | null
          description: string | null
          id: string
          points_amount: number
          transaction_type: string
          user_id: string
        }
        Insert: {
          activity_reference_id?: string | null
          activity_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          points_amount: number
          transaction_type: string
          user_id: string
        }
        Update: {
          activity_reference_id?: string | null
          activity_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          points_amount?: number
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      policy_tracker: {
        Row: {
          abstaining_parties: string[] | null
          affected_regions: string[] | null
          affected_sectors: string[] | null
          created_at: string | null
          id: string
          initiator_name: string | null
          initiator_party: string | null
          initiator_type: string | null
          legal_document_id: string | null
          metadata: Json | null
          opposing_parties: string[] | null
          policy_summary: string | null
          policy_title: string
          policy_type: string
          proposed_date: string | null
          status: string
          supporting_parties: string[] | null
          updated_at: string | null
          vote_results: Json | null
        }
        Insert: {
          abstaining_parties?: string[] | null
          affected_regions?: string[] | null
          affected_sectors?: string[] | null
          created_at?: string | null
          id?: string
          initiator_name?: string | null
          initiator_party?: string | null
          initiator_type?: string | null
          legal_document_id?: string | null
          metadata?: Json | null
          opposing_parties?: string[] | null
          policy_summary?: string | null
          policy_title: string
          policy_type: string
          proposed_date?: string | null
          status?: string
          supporting_parties?: string[] | null
          updated_at?: string | null
          vote_results?: Json | null
        }
        Update: {
          abstaining_parties?: string[] | null
          affected_regions?: string[] | null
          affected_sectors?: string[] | null
          created_at?: string | null
          id?: string
          initiator_name?: string | null
          initiator_party?: string | null
          initiator_type?: string | null
          legal_document_id?: string | null
          metadata?: Json | null
          opposing_parties?: string[] | null
          policy_summary?: string | null
          policy_title?: string
          policy_type?: string
          proposed_date?: string | null
          status?: string
          supporting_parties?: string[] | null
          updated_at?: string | null
          vote_results?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "policy_tracker_legal_document_id_fkey"
            columns: ["legal_document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      politica_ai_config: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          updated_at: string
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      politica_ai_logs: {
        Row: {
          action_type: string
          ai_confidence_score: number | null
          changes_made: Json | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          proof_urls: string[] | null
          reviewed_at: string | null
          reviewed_by: string | null
          sources_verified: Json | null
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          action_type: string
          ai_confidence_score?: number | null
          changes_made?: Json | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          proof_urls?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sources_verified?: Json | null
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          action_type?: string
          ai_confidence_score?: number | null
          changes_made?: Json | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          proof_urls?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sources_verified?: Json | null
          status?: string
          target_id?: string
          target_type?: string
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
          logo_confidence_score: number | null
          logo_last_verified: string | null
          logo_url: string | null
          logo_verified: boolean | null
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
          logo_confidence_score?: number | null
          logo_last_verified?: string | null
          logo_url?: string | null
          logo_verified?: boolean | null
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
          logo_confidence_score?: number | null
          logo_last_verified?: string | null
          logo_url?: string | null
          logo_verified?: boolean | null
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
      politician_ai_verification: {
        Row: {
          created_at: string
          disputed_fields: string[] | null
          id: string
          last_sources_checked: Json | null
          last_verified_at: string | null
          outdated_fields: string[] | null
          politician_id: string
          sources_count: number | null
          updated_at: string
          verification_score: number | null
          verification_status: string
        }
        Insert: {
          created_at?: string
          disputed_fields?: string[] | null
          id?: string
          last_sources_checked?: Json | null
          last_verified_at?: string | null
          outdated_fields?: string[] | null
          politician_id: string
          sources_count?: number | null
          updated_at?: string
          verification_score?: number | null
          verification_status?: string
        }
        Update: {
          created_at?: string
          disputed_fields?: string[] | null
          id?: string
          last_sources_checked?: Json | null
          last_verified_at?: string | null
          outdated_fields?: string[] | null
          politician_id?: string
          sources_count?: number | null
          updated_at?: string
          verification_score?: number | null
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "politician_ai_verification_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: true
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
        ]
      }
      politician_claims: {
        Row: {
          admin_notes: string | null
          claim_fee_amount: number
          created_at: string
          documents_uploaded: string[] | null
          id: string
          payment_method: string | null
          payment_reference: string | null
          payment_status: string | null
          politician_id: string
          processed_at: string | null
          processed_by: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          claim_fee_amount?: number
          created_at?: string
          documents_uploaded?: string[] | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          politician_id: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          claim_fee_amount?: number
          created_at?: string
          documents_uploaded?: string[] | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          politician_id?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "politician_claims_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
        ]
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
      politician_engagement_scores: {
        Row: {
          communication_score: number
          constituency_outreach_score: number
          created_at: string
          engagement_level: string
          id: string
          last_activity_date: string | null
          last_activity_description: string | null
          overall_score: number
          participation_score: number
          policy_advocacy_score: number
          politician_id: string
          public_visibility_score: number
          total_activities: number
          updated_at: string
        }
        Insert: {
          communication_score?: number
          constituency_outreach_score?: number
          created_at?: string
          engagement_level?: string
          id?: string
          last_activity_date?: string | null
          last_activity_description?: string | null
          overall_score?: number
          participation_score?: number
          policy_advocacy_score?: number
          politician_id: string
          public_visibility_score?: number
          total_activities?: number
          updated_at?: string
        }
        Update: {
          communication_score?: number
          constituency_outreach_score?: number
          created_at?: string
          engagement_level?: string
          id?: string
          last_activity_date?: string | null
          last_activity_description?: string | null
          overall_score?: number
          participation_score?: number
          policy_advocacy_score?: number
          politician_id?: string
          public_visibility_score?: number
          total_activities?: number
          updated_at?: string
        }
        Relationships: []
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
      politician_image_verifications: {
        Row: {
          admin_notes: string | null
          admin_reviewed: boolean | null
          confidence_score: number | null
          created_at: string | null
          flagged_by_users: string[] | null
          id: string
          image_url: string | null
          politician_id: string
          source_type: string | null
          source_url: string | null
          updated_at: string | null
          verification_method: string | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          admin_notes?: string | null
          admin_reviewed?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          flagged_by_users?: string[] | null
          id?: string
          image_url?: string | null
          politician_id: string
          source_type?: string | null
          source_url?: string | null
          updated_at?: string | null
          verification_method?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          admin_notes?: string | null
          admin_reviewed?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          flagged_by_users?: string[] | null
          id?: string
          image_url?: string | null
          politician_id?: string
          source_type?: string | null
          source_url?: string | null
          updated_at?: string | null
          verification_method?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "politician_image_verifications_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
        ]
      }
      politician_performance_comparisons: {
        Row: {
          comparison_group: string
          comparison_metrics: Json | null
          comparison_period_end: string
          comparison_period_start: string
          created_at: string
          id: string
          percentile: number | null
          politician_id: string
          ranking: number | null
        }
        Insert: {
          comparison_group: string
          comparison_metrics?: Json | null
          comparison_period_end: string
          comparison_period_start: string
          created_at?: string
          id?: string
          percentile?: number | null
          politician_id: string
          ranking?: number | null
        }
        Update: {
          comparison_group?: string
          comparison_metrics?: Json | null
          comparison_period_end?: string
          comparison_period_start?: string
          created_at?: string
          id?: string
          percentile?: number | null
          politician_id?: string
          ranking?: number | null
        }
        Relationships: []
      }
      politician_performance_metrics: {
        Row: {
          created_at: string
          data_source: string | null
          id: string
          measurement_period_end: string
          measurement_period_start: string
          metric_details: Json | null
          metric_type: Database["public"]["Enums"]["performance_metric_type"]
          metric_value: number
          notes: string | null
          politician_id: string
          updated_at: string
          verified: boolean
        }
        Insert: {
          created_at?: string
          data_source?: string | null
          id?: string
          measurement_period_end: string
          measurement_period_start: string
          metric_details?: Json | null
          metric_type: Database["public"]["Enums"]["performance_metric_type"]
          metric_value: number
          notes?: string | null
          politician_id: string
          updated_at?: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          data_source?: string | null
          id?: string
          measurement_period_end?: string
          measurement_period_start?: string
          metric_details?: Json | null
          metric_type?: Database["public"]["Enums"]["performance_metric_type"]
          metric_value?: number
          notes?: string | null
          politician_id?: string
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
      }
      politician_poll_responses: {
        Row: {
          created_at: string | null
          engagement_metrics: Json | null
          id: string
          is_official_position: boolean | null
          is_verified: boolean | null
          politician_id: string
          poll_id: string
          response_text: string
          response_type: string | null
          sentiment_score: number | null
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          created_at?: string | null
          engagement_metrics?: Json | null
          id?: string
          is_official_position?: boolean | null
          is_verified?: boolean | null
          politician_id: string
          poll_id: string
          response_text: string
          response_type?: string | null
          sentiment_score?: number | null
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          created_at?: string | null
          engagement_metrics?: Json | null
          id?: string
          is_official_position?: boolean | null
          is_verified?: boolean | null
          politician_id?: string
          poll_id?: string
          response_text?: string
          response_type?: string | null
          sentiment_score?: number | null
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "politician_poll_responses_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "politician_poll_responses_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      politician_promises: {
        Row: {
          broken_promise_alert_sent: boolean | null
          created_at: string | null
          date_made: string | null
          date_updated: string | null
          description: string | null
          evidence_url: string | null
          expected_delivery_date: string | null
          id: string
          politician_id: string
          priority_level: string | null
          promise_text: string
          public_interest_score: number | null
          regions_targeted: string[] | null
          source_type: string | null
          status: string | null
          topic_category: string | null
          updated_at: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          broken_promise_alert_sent?: boolean | null
          created_at?: string | null
          date_made?: string | null
          date_updated?: string | null
          description?: string | null
          evidence_url?: string | null
          expected_delivery_date?: string | null
          id?: string
          politician_id: string
          priority_level?: string | null
          promise_text: string
          public_interest_score?: number | null
          regions_targeted?: string[] | null
          source_type?: string | null
          status?: string | null
          topic_category?: string | null
          updated_at?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          broken_promise_alert_sent?: boolean | null
          created_at?: string | null
          date_made?: string | null
          date_updated?: string | null
          description?: string | null
          evidence_url?: string | null
          expected_delivery_date?: string | null
          id?: string
          politician_id?: string
          priority_level?: string | null
          promise_text?: string
          public_interest_score?: number | null
          regions_targeted?: string[] | null
          source_type?: string | null
          status?: string | null
          topic_category?: string | null
          updated_at?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
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
      politician_scorecards: {
        Row: {
          attendance_score: number | null
          bill_effectiveness_score: number | null
          committee_participation_score: number | null
          created_at: string
          id: string
          methodology_version: string | null
          overall_score: number
          politician_id: string
          public_engagement_score: number | null
          scorecard_period_end: string
          scorecard_period_start: string
          transparency_score: number | null
          updated_at: string
          voting_alignment_score: number | null
        }
        Insert: {
          attendance_score?: number | null
          bill_effectiveness_score?: number | null
          committee_participation_score?: number | null
          created_at?: string
          id?: string
          methodology_version?: string | null
          overall_score?: number
          politician_id: string
          public_engagement_score?: number | null
          scorecard_period_end: string
          scorecard_period_start: string
          transparency_score?: number | null
          updated_at?: string
          voting_alignment_score?: number | null
        }
        Update: {
          attendance_score?: number | null
          bill_effectiveness_score?: number | null
          committee_participation_score?: number | null
          created_at?: string
          id?: string
          methodology_version?: string | null
          overall_score?: number
          politician_id?: string
          public_engagement_score?: number | null
          scorecard_period_end?: string
          scorecard_period_start?: string
          transparency_score?: number | null
          updated_at?: string
          voting_alignment_score?: number | null
        }
        Relationships: []
      }
      politician_transparency_scores: {
        Row: {
          conviction_count: number | null
          corruption_cases_count: number | null
          created_at: string
          id: string
          investigation_count: number | null
          last_case_date: string | null
          notes: string | null
          politician_id: string
          sanction_count: number | null
          score_updated_at: string
          transparency_rating: string
          updated_at: string
        }
        Insert: {
          conviction_count?: number | null
          corruption_cases_count?: number | null
          created_at?: string
          id?: string
          investigation_count?: number | null
          last_case_date?: string | null
          notes?: string | null
          politician_id: string
          sanction_count?: number | null
          score_updated_at?: string
          transparency_rating?: string
          updated_at?: string
        }
        Update: {
          conviction_count?: number | null
          corruption_cases_count?: number | null
          created_at?: string
          id?: string
          investigation_count?: number | null
          last_case_date?: string | null
          notes?: string | null
          politician_id?: string
          sanction_count?: number | null
          score_updated_at?: string
          transparency_rating?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "politician_transparency_scores_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
        ]
      }
      politicians: {
        Row: {
          auto_imported: boolean | null
          bio: string | null
          biography: string | null
          birth_date: string | null
          campaign_promises: Json | null
          can_create_polls: boolean | null
          career_background: string | null
          civic_score: number | null
          claim_documents_url: string[] | null
          claim_fee_paid: boolean | null
          claim_payment_reference: string | null
          claim_status: string | null
          claimed_at: string | null
          claimed_by: string | null
          constituency: string | null
          contact_details: Json | null
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
          image_confidence_score: number | null
          image_last_verified: string | null
          image_verification_id: string | null
          image_verified: boolean | null
          integrity_rating: number | null
          is_archived: boolean | null
          is_claimable: boolean | null
          is_claimed: boolean | null
          is_currently_in_office: boolean | null
          last_poll_created_at: string | null
          last_term_validation: string | null
          level_of_office: string | null
          name: string
          office_history: Json | null
          party: string | null
          performance_score: number | null
          political_party_id: string | null
          poll_creation_count: number | null
          position_end_date: string | null
          position_start_date: string | null
          profile_image_url: string | null
          promise_tracker: Json | null
          region: string | null
          role_title: string | null
          term_end_date: string | null
          term_start_date: string | null
          term_status: string | null
          timeline_events: Json | null
          timeline_roles: Json | null
          transparency_rating: number | null
          updated_at: string | null
          user_id: string | null
          verification_notes: string | null
          verified: boolean | null
        }
        Insert: {
          auto_imported?: boolean | null
          bio?: string | null
          biography?: string | null
          birth_date?: string | null
          campaign_promises?: Json | null
          can_create_polls?: boolean | null
          career_background?: string | null
          civic_score?: number | null
          claim_documents_url?: string[] | null
          claim_fee_paid?: boolean | null
          claim_payment_reference?: string | null
          claim_status?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          constituency?: string | null
          contact_details?: Json | null
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
          image_confidence_score?: number | null
          image_last_verified?: string | null
          image_verification_id?: string | null
          image_verified?: boolean | null
          integrity_rating?: number | null
          is_archived?: boolean | null
          is_claimable?: boolean | null
          is_claimed?: boolean | null
          is_currently_in_office?: boolean | null
          last_poll_created_at?: string | null
          last_term_validation?: string | null
          level_of_office?: string | null
          name: string
          office_history?: Json | null
          party?: string | null
          performance_score?: number | null
          political_party_id?: string | null
          poll_creation_count?: number | null
          position_end_date?: string | null
          position_start_date?: string | null
          profile_image_url?: string | null
          promise_tracker?: Json | null
          region?: string | null
          role_title?: string | null
          term_end_date?: string | null
          term_start_date?: string | null
          term_status?: string | null
          timeline_events?: Json | null
          timeline_roles?: Json | null
          transparency_rating?: number | null
          updated_at?: string | null
          user_id?: string | null
          verification_notes?: string | null
          verified?: boolean | null
        }
        Update: {
          auto_imported?: boolean | null
          bio?: string | null
          biography?: string | null
          birth_date?: string | null
          campaign_promises?: Json | null
          can_create_polls?: boolean | null
          career_background?: string | null
          civic_score?: number | null
          claim_documents_url?: string[] | null
          claim_fee_paid?: boolean | null
          claim_payment_reference?: string | null
          claim_status?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          constituency?: string | null
          contact_details?: Json | null
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
          image_confidence_score?: number | null
          image_last_verified?: string | null
          image_verification_id?: string | null
          image_verified?: boolean | null
          integrity_rating?: number | null
          is_archived?: boolean | null
          is_claimable?: boolean | null
          is_claimed?: boolean | null
          is_currently_in_office?: boolean | null
          last_poll_created_at?: string | null
          last_term_validation?: string | null
          level_of_office?: string | null
          name?: string
          office_history?: Json | null
          party?: string | null
          performance_score?: number | null
          political_party_id?: string | null
          poll_creation_count?: number | null
          position_end_date?: string | null
          position_start_date?: string | null
          profile_image_url?: string | null
          promise_tracker?: Json | null
          region?: string | null
          role_title?: string | null
          term_end_date?: string | null
          term_start_date?: string | null
          term_status?: string | null
          timeline_events?: Json | null
          timeline_roles?: Json | null
          transparency_rating?: number | null
          updated_at?: string | null
          user_id?: string | null
          verification_notes?: string | null
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
          {
            foreignKeyName: "politicians_image_verification_id_fkey"
            columns: ["image_verification_id"]
            isOneToOne: false
            referencedRelation: "politician_image_verifications"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_analytics: {
        Row: {
          bias_analysis: Json | null
          confidence_score: number | null
          created_at: string
          demographic_breakdown: Json | null
          engagement_metrics: Json | null
          geographic_breakdown: Json | null
          id: string
          poll_id: string
          response_patterns: Json | null
          sample_quality: number | null
          statistical_significance: boolean | null
          updated_at: string
        }
        Insert: {
          bias_analysis?: Json | null
          confidence_score?: number | null
          created_at?: string
          demographic_breakdown?: Json | null
          engagement_metrics?: Json | null
          geographic_breakdown?: Json | null
          id?: string
          poll_id: string
          response_patterns?: Json | null
          sample_quality?: number | null
          statistical_significance?: boolean | null
          updated_at?: string
        }
        Update: {
          bias_analysis?: Json | null
          confidence_score?: number | null
          created_at?: string
          demographic_breakdown?: Json | null
          engagement_metrics?: Json | null
          geographic_breakdown?: Json | null
          id?: string
          poll_id?: string
          response_patterns?: Json | null
          sample_quality?: number | null
          statistical_significance?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      poll_comment_likes: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "poll_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_edited: boolean | null
          is_moderated: boolean | null
          likes_count: number | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_reason: string | null
          poll_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_edited?: boolean | null
          is_moderated?: boolean | null
          likes_count?: number | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_reason?: string | null
          poll_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_edited?: boolean | null
          is_moderated?: boolean | null
          likes_count?: number | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_reason?: string | null
          poll_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_comments_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_fraud_alerts: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_message: string
          alert_severity: string
          alert_type: string
          detected_at: string | null
          id: string
          poll_id: string
          time_window: string | null
          vote_count: number | null
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_message: string
          alert_severity?: string
          alert_type: string
          detected_at?: string | null
          id?: string
          poll_id: string
          time_window?: string | null
          vote_count?: number | null
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_message?: string
          alert_severity?: string
          alert_type?: string
          detected_at?: string | null
          id?: string
          poll_id?: string
          time_window?: string | null
          vote_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_fraud_alerts_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_fraud_settings: {
        Row: {
          alert_threshold: number | null
          created_at: string | null
          enable_captcha: boolean | null
          enable_fingerprinting: boolean | null
          enable_rate_limiting: boolean | null
          id: string
          max_votes_per_ip: number | null
          max_votes_per_session: number | null
          poll_id: string
          updated_at: string | null
        }
        Insert: {
          alert_threshold?: number | null
          created_at?: string | null
          enable_captcha?: boolean | null
          enable_fingerprinting?: boolean | null
          enable_rate_limiting?: boolean | null
          id?: string
          max_votes_per_ip?: number | null
          max_votes_per_session?: number | null
          poll_id: string
          updated_at?: string | null
        }
        Update: {
          alert_threshold?: number | null
          created_at?: string | null
          enable_captcha?: boolean | null
          enable_fingerprinting?: boolean | null
          enable_rate_limiting?: boolean | null
          id?: string
          max_votes_per_ip?: number | null
          max_votes_per_session?: number | null
          poll_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_fraud_settings_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: true
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_impact_tracking: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          demographic_affected: string | null
          id: string
          impact_details: Json | null
          impact_direction: string | null
          impact_type: string
          impact_value: number | null
          measured_at: string | null
          party_id: string | null
          politician_id: string | null
          poll_id: string
          region_affected: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          demographic_affected?: string | null
          id?: string
          impact_details?: Json | null
          impact_direction?: string | null
          impact_type: string
          impact_value?: number | null
          measured_at?: string | null
          party_id?: string | null
          politician_id?: string | null
          poll_id: string
          region_affected?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          demographic_affected?: string | null
          id?: string
          impact_details?: Json | null
          impact_direction?: string | null
          impact_type?: string
          impact_value?: number | null
          measured_at?: string | null
          party_id?: string | null
          politician_id?: string | null
          poll_id?: string
          region_affected?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_impact_tracking_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "political_parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_impact_tracking_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_impact_tracking_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_moderation_log: {
        Row: {
          action_reason: string | null
          action_type: string
          admin_id: string
          created_at: string
          creator_notified: boolean | null
          id: string
          metadata: Json | null
          poll_id: string
          report_id: string | null
        }
        Insert: {
          action_reason?: string | null
          action_type: string
          admin_id: string
          created_at?: string
          creator_notified?: boolean | null
          id?: string
          metadata?: Json | null
          poll_id: string
          report_id?: string | null
        }
        Update: {
          action_reason?: string | null
          action_type?: string
          admin_id?: string
          created_at?: string
          creator_notified?: boolean | null
          id?: string
          metadata?: Json | null
          poll_id?: string
          report_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_moderation_log_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_moderation_log_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "poll_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_moderation_settings: {
        Row: {
          auto_hide_after_reports: number | null
          ban_duration_days: number | null
          created_at: string
          id: string
          notify_creator_on_action: boolean | null
          require_admin_review: boolean | null
          updated_at: string
        }
        Insert: {
          auto_hide_after_reports?: number | null
          ban_duration_days?: number | null
          created_at?: string
          id?: string
          notify_creator_on_action?: boolean | null
          require_admin_review?: boolean | null
          updated_at?: string
        }
        Update: {
          auto_hide_after_reports?: number | null
          ban_duration_days?: number | null
          created_at?: string
          id?: string
          notify_creator_on_action?: boolean | null
          require_admin_review?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      poll_options: {
        Row: {
          created_at: string
          id: string
          option_order: number
          option_text: string
          poll_id: string
          vote_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          option_order?: number
          option_text: string
          poll_id: string
          vote_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          option_order?: number
          option_text?: string
          poll_id?: string
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_participant_verification: {
        Row: {
          created_at: string
          id: string
          poll_id: string
          user_id: string | null
          verification_data: Json | null
          verification_method: string
          verification_status: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          poll_id: string
          user_id?: string | null
          verification_data?: Json | null
          verification_method: string
          verification_status?: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          poll_id?: string
          user_id?: string | null
          verification_data?: Json | null
          verification_method?: string
          verification_status?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      poll_reports: {
        Row: {
          created_at: string
          id: string
          poll_id: string
          report_message: string | null
          report_reason: string
          reported_by_user_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          poll_id: string
          report_message?: string | null
          report_reason: string
          reported_by_user_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          poll_id?: string
          report_message?: string | null
          report_reason?: string
          reported_by_user_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_reports_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_suggestions: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          options: string[]
          priority_level: string | null
          published_at: string | null
          published_poll_id: string | null
          question: string
          reviewed_at: string | null
          reviewed_by: string | null
          source_event: string | null
          status: string | null
          suggested_by: string | null
          title: string
          trending_topics: string[] | null
          updated_at: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          options: string[]
          priority_level?: string | null
          published_at?: string | null
          published_poll_id?: string | null
          question: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_event?: string | null
          status?: string | null
          suggested_by?: string | null
          title: string
          trending_topics?: string[] | null
          updated_at?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          options?: string[]
          priority_level?: string | null
          published_at?: string | null
          published_poll_id?: string | null
          question?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_event?: string | null
          status?: string | null
          suggested_by?: string | null
          title?: string
          trending_topics?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_suggestions_published_poll_id_fkey"
            columns: ["published_poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_template_usage: {
        Row: {
          created_at: string
          id: string
          poll_id: string
          template_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          poll_id: string
          template_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          poll_id?: string
          template_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_template_usage_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "poll_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_templates: {
        Row: {
          color_theme: Json
          created_at: string
          description: string
          features: Json
          icon_set: string
          id: string
          is_active: boolean
          is_premium: boolean
          layout_type: string
          preview_image_url: string | null
          style_class: string
          style_name: string
          supported_poll_types: string[]
          template_name: string
          updated_at: string
        }
        Insert: {
          color_theme?: Json
          created_at?: string
          description: string
          features?: Json
          icon_set: string
          id?: string
          is_active?: boolean
          is_premium?: boolean
          layout_type: string
          preview_image_url?: string | null
          style_class: string
          style_name: string
          supported_poll_types?: string[]
          template_name: string
          updated_at?: string
        }
        Update: {
          color_theme?: Json
          created_at?: string
          description?: string
          features?: Json
          icon_set?: string
          id?: string
          is_active?: boolean
          is_premium?: boolean
          layout_type?: string
          preview_image_url?: string | null
          style_class?: string
          style_name?: string
          supported_poll_types?: string[]
          template_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      poll_vote_log: {
        Row: {
          created_at: string | null
          device_fingerprint: string | null
          hashed_ip: string
          id: string
          poll_id: string
          region: string | null
          session_id: string | null
          suspicious_flag: boolean | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
          vote_option: number
        }
        Insert: {
          created_at?: string | null
          device_fingerprint?: string | null
          hashed_ip: string
          id?: string
          poll_id: string
          region?: string | null
          session_id?: string | null
          suspicious_flag?: boolean | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
          vote_option: number
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string | null
          hashed_ip?: string
          id?: string
          poll_id?: string
          region?: string | null
          session_id?: string | null
          suspicious_flag?: boolean | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
          vote_option?: number
        }
        Relationships: [
          {
            foreignKeyName: "poll_vote_log_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
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
          region: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_index: number
          poll_id: string
          region?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          option_index?: number
          poll_id?: string
          region?: string | null
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
          anonymous_mode: boolean | null
          auto_delete_at: string | null
          banner_image_url: string | null
          created_at: string | null
          creator_id: string
          description: string | null
          duration_days: number | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          moderation_enabled: boolean | null
          options: Json
          party_logos: Json | null
          privacy_mode: string
          requires_verification: boolean | null
          show_results_after_expiry: boolean
          theme_color: string | null
          title: string
          votes_count: number | null
        }
        Insert: {
          anonymous_mode?: boolean | null
          auto_delete_at?: string | null
          banner_image_url?: string | null
          created_at?: string | null
          creator_id: string
          description?: string | null
          duration_days?: number | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          moderation_enabled?: boolean | null
          options: Json
          party_logos?: Json | null
          privacy_mode?: string
          requires_verification?: boolean | null
          show_results_after_expiry?: boolean
          theme_color?: string | null
          title: string
          votes_count?: number | null
        }
        Update: {
          anonymous_mode?: boolean | null
          auto_delete_at?: string | null
          banner_image_url?: string | null
          created_at?: string | null
          creator_id?: string
          description?: string | null
          duration_days?: number | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          moderation_enabled?: boolean | null
          options?: Json
          party_logos?: Json | null
          privacy_mode?: string
          requires_verification?: boolean | null
          show_results_after_expiry?: boolean
          theme_color?: string | null
          title?: string
          votes_count?: number | null
        }
        Relationships: []
      }
      polls_ai_generated: {
        Row: {
          admin_edited: boolean
          ai_confidence_score: number
          ai_reasoning: Json | null
          created_at: string
          duplicate_check_passed: boolean
          edit_history: Json | null
          generation_prompt: string | null
          generation_trigger: string
          id: string
          original_options: string[] | null
          original_question: string | null
          performance_metrics: Json | null
          poll_id: string | null
          regional_data: Json | null
          security_clearance: boolean
          sentiment_analysis: Json | null
          social_metrics: Json | null
          source_platform: string | null
          topic_category: string
          trending_keywords: string[] | null
          updated_at: string
          urgency_level: string
        }
        Insert: {
          admin_edited?: boolean
          ai_confidence_score?: number
          ai_reasoning?: Json | null
          created_at?: string
          duplicate_check_passed?: boolean
          edit_history?: Json | null
          generation_prompt?: string | null
          generation_trigger: string
          id?: string
          original_options?: string[] | null
          original_question?: string | null
          performance_metrics?: Json | null
          poll_id?: string | null
          regional_data?: Json | null
          security_clearance?: boolean
          sentiment_analysis?: Json | null
          social_metrics?: Json | null
          source_platform?: string | null
          topic_category: string
          trending_keywords?: string[] | null
          updated_at?: string
          urgency_level?: string
        }
        Update: {
          admin_edited?: boolean
          ai_confidence_score?: number
          ai_reasoning?: Json | null
          created_at?: string
          duplicate_check_passed?: boolean
          edit_history?: Json | null
          generation_prompt?: string | null
          generation_trigger?: string
          id?: string
          original_options?: string[] | null
          original_question?: string | null
          performance_metrics?: Json | null
          poll_id?: string | null
          regional_data?: Json | null
          security_clearance?: boolean
          sentiment_analysis?: Json | null
          social_metrics?: Json | null
          source_platform?: string | null
          topic_category?: string
          trending_keywords?: string[] | null
          updated_at?: string
          urgency_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "polls_ai_generated_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      prediction_results: {
        Row: {
          accuracy_when_resolved: number | null
          actual_value: number | null
          created_at: string
          id: string
          input_data: Json
          is_resolved: boolean
          model_id: string
          prediction_confidence: number
          prediction_details: Json | null
          prediction_period_end: string | null
          prediction_period_start: string | null
          prediction_type: Database["public"]["Enums"]["prediction_type"]
          prediction_value: number
          resolved_at: string | null
          target_entity_id: string | null
          target_entity_type: string
        }
        Insert: {
          accuracy_when_resolved?: number | null
          actual_value?: number | null
          created_at?: string
          id?: string
          input_data?: Json
          is_resolved?: boolean
          model_id: string
          prediction_confidence: number
          prediction_details?: Json | null
          prediction_period_end?: string | null
          prediction_period_start?: string | null
          prediction_type: Database["public"]["Enums"]["prediction_type"]
          prediction_value: number
          resolved_at?: string | null
          target_entity_id?: string | null
          target_entity_type: string
        }
        Update: {
          accuracy_when_resolved?: number | null
          actual_value?: number | null
          created_at?: string
          id?: string
          input_data?: Json
          is_resolved?: boolean
          model_id?: string
          prediction_confidence?: number
          prediction_details?: Json | null
          prediction_period_end?: string | null
          prediction_period_start?: string | null
          prediction_type?: Database["public"]["Enums"]["prediction_type"]
          prediction_value?: number
          resolved_at?: string | null
          target_entity_id?: string | null
          target_entity_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "prediction_results_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "predictive_models"
            referencedColumns: ["id"]
          },
        ]
      }
      predictive_models: {
        Row: {
          accuracy_score: number | null
          created_at: string
          created_by: string | null
          f1_score: number | null
          id: string
          input_features: Json
          is_active: boolean
          last_trained_at: string | null
          model_description: string | null
          model_name: string
          model_parameters: Json | null
          model_type: Database["public"]["Enums"]["prediction_type"]
          model_version: string
          next_training_scheduled: string | null
          precision_score: number | null
          recall_score: number | null
          training_data_period_end: string | null
          training_data_period_start: string | null
          updated_at: string
        }
        Insert: {
          accuracy_score?: number | null
          created_at?: string
          created_by?: string | null
          f1_score?: number | null
          id?: string
          input_features?: Json
          is_active?: boolean
          last_trained_at?: string | null
          model_description?: string | null
          model_name: string
          model_parameters?: Json | null
          model_type: Database["public"]["Enums"]["prediction_type"]
          model_version?: string
          next_training_scheduled?: string | null
          precision_score?: number | null
          recall_score?: number | null
          training_data_period_end?: string | null
          training_data_period_start?: string | null
          updated_at?: string
        }
        Update: {
          accuracy_score?: number | null
          created_at?: string
          created_by?: string | null
          f1_score?: number | null
          id?: string
          input_features?: Json
          is_active?: boolean
          last_trained_at?: string | null
          model_description?: string | null
          model_name?: string
          model_parameters?: Json | null
          model_type?: Database["public"]["Enums"]["prediction_type"]
          model_version?: string
          next_training_scheduled?: string | null
          precision_score?: number | null
          recall_score?: number | null
          training_data_period_end?: string | null
          training_data_period_start?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      professional_profiles: {
        Row: {
          availability_status: string | null
          certifications: Json | null
          created_at: string
          department: string | null
          education: Json | null
          id: string
          organization_name: string | null
          portfolio_links: Json | null
          position_title: string | null
          profile_id: string
          salary_range: string | null
          skills: string[] | null
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          availability_status?: string | null
          certifications?: Json | null
          created_at?: string
          department?: string | null
          education?: Json | null
          id?: string
          organization_name?: string | null
          portfolio_links?: Json | null
          position_title?: string | null
          profile_id: string
          salary_range?: string | null
          skills?: string[] | null
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          availability_status?: string | null
          certifications?: Json | null
          created_at?: string
          department?: string | null
          education?: Json | null
          id?: string
          organization_name?: string | null
          portfolio_links?: Json | null
          position_title?: string | null
          profile_id?: string
          salary_range?: string | null
          skills?: string[] | null
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_achievement_types: {
        Row: {
          category: string
          created_at: string | null
          criteria: Json | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          points_value: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points_value?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points_value?: number | null
        }
        Relationships: []
      }
      profile_activity_feed: {
        Row: {
          activity_data: Json | null
          activity_description: string | null
          activity_icon: string | null
          activity_title: string
          activity_type: string
          activity_url: string | null
          created_at: string | null
          id: string
          importance_score: number | null
          profile_id: string | null
          visibility: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_description?: string | null
          activity_icon?: string | null
          activity_title: string
          activity_type: string
          activity_url?: string | null
          created_at?: string | null
          id?: string
          importance_score?: number | null
          profile_id?: string | null
          visibility?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_description?: string | null
          activity_icon?: string | null
          activity_title?: string
          activity_type?: string
          activity_url?: string | null
          created_at?: string | null
          id?: string
          importance_score?: number | null
          profile_id?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_activity_feed_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_activity_log: {
        Row: {
          activity_description: string | null
          activity_title: string
          activity_type: string
          created_at: string | null
          id: string
          is_public: boolean | null
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          activity_description?: string | null
          activity_title: string
          activity_type: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          activity_description?: string | null
          activity_title?: string
          activity_type?: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      profile_activity_timeline: {
        Row: {
          activity_data: Json | null
          activity_description: string | null
          activity_title: string
          activity_type: string
          created_at: string
          id: string
          is_public: boolean | null
          profile_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_description?: string | null
          activity_title: string
          activity_type: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          profile_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_description?: string | null
          activity_title?: string
          activity_type?: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_activity_timeline_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_analytics: {
        Row: {
          calculated_at: string
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          profile_id: string
        }
        Insert: {
          calculated_at?: string
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value?: number
          profile_id: string
        }
        Update: {
          calculated_at?: string
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_analytics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_badges: {
        Row: {
          awarded_at: string
          awarded_by: string | null
          badge_description: string | null
          badge_icon: string | null
          badge_name: string
          badge_type: string
          id: string
          is_active: boolean | null
          metadata: Json | null
          profile_id: string
        }
        Insert: {
          awarded_at?: string
          awarded_by?: string | null
          badge_description?: string | null
          badge_icon?: string | null
          badge_name: string
          badge_type: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          profile_id: string
        }
        Update: {
          awarded_at?: string
          awarded_by?: string | null
          badge_description?: string | null
          badge_icon?: string | null
          badge_name?: string
          badge_type?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_badges_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_comparisons: {
        Row: {
          comparer_id: string | null
          comparison_data: Json | null
          created_at: string | null
          id: string
          profile_a_id: string | null
          profile_b_id: string | null
        }
        Insert: {
          comparer_id?: string | null
          comparison_data?: Json | null
          created_at?: string | null
          id?: string
          profile_a_id?: string | null
          profile_b_id?: string | null
        }
        Update: {
          comparer_id?: string | null
          comparison_data?: Json | null
          created_at?: string | null
          id?: string
          profile_a_id?: string | null
          profile_b_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_comparisons_profile_a_id_fkey"
            columns: ["profile_a_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_comparisons_profile_b_id_fkey"
            columns: ["profile_b_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          is_anonymous: boolean | null
          rated_profile_id: string
          rater_user_id: string
          rating_type: string
          rating_value: number
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          rated_profile_id: string
          rater_user_id: string
          rating_type: string
          rating_value: number
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          rated_profile_id?: string
          rater_user_id?: string
          rating_type?: string
          rating_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_ratings_rated_profile_id_fkey"
            columns: ["rated_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          evidence_urls: string[] | null
          id: string
          report_reason: string
          report_type: string
          reported_profile_id: string
          reporter_user_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          evidence_urls?: string[] | null
          id?: string
          report_reason: string
          report_type: string
          reported_profile_id: string
          reporter_user_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          evidence_urls?: string[] | null
          id?: string
          report_reason?: string
          report_type?: string
          reported_profile_id?: string
          reporter_user_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_reports_reported_profile_id_fkey"
            columns: ["reported_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_settings: {
        Row: {
          created_at: string | null
          hide_activity: boolean | null
          hide_followers: boolean | null
          hide_location: boolean | null
          hide_polls: boolean | null
          id: string
          profile_id: string | null
          show_civic_score: boolean | null
          show_contact_info: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          hide_activity?: boolean | null
          hide_followers?: boolean | null
          hide_location?: boolean | null
          hide_polls?: boolean | null
          id?: string
          profile_id?: string | null
          show_civic_score?: boolean | null
          show_contact_info?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          hide_activity?: boolean | null
          hide_followers?: boolean | null
          hide_location?: boolean | null
          hide_polls?: boolean | null
          id?: string
          profile_id?: string | null
          show_civic_score?: boolean | null
          show_contact_info?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_settings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_social_links: {
        Row: {
          click_count: number | null
          created_at: string | null
          id: string
          is_verified: boolean | null
          platform: string
          profile_id: string | null
          url: string
          verification_date: string | null
        }
        Insert: {
          click_count?: number | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          platform: string
          profile_id?: string | null
          url: string
          verification_date?: string | null
        }
        Update: {
          click_count?: number | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          platform?: string
          profile_id?: string | null
          url?: string
          verification_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_social_links_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_themes: {
        Row: {
          background_style: string | null
          created_at: string | null
          custom_css: string | null
          id: string
          is_active: boolean | null
          primary_color: string | null
          profile_id: string | null
          secondary_color: string | null
          theme_name: string | null
          updated_at: string | null
        }
        Insert: {
          background_style?: string | null
          created_at?: string | null
          custom_css?: string | null
          id?: string
          is_active?: boolean | null
          primary_color?: string | null
          profile_id?: string | null
          secondary_color?: string | null
          theme_name?: string | null
          updated_at?: string | null
        }
        Update: {
          background_style?: string | null
          created_at?: string | null
          custom_css?: string | null
          id?: string
          is_active?: boolean | null
          primary_color?: string | null
          profile_id?: string | null
          secondary_color?: string | null
          theme_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_themes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_verification_queue: {
        Row: {
          admin_notes: string | null
          documents_submitted: Json | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          submitted_at: string | null
          user_id: string | null
          verification_type: string
        }
        Insert: {
          admin_notes?: string | null
          documents_submitted?: Json | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          user_id?: string | null
          verification_type: string
        }
        Update: {
          admin_notes?: string | null
          documents_submitted?: Json | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          user_id?: string | null
          verification_type?: string
        }
        Relationships: []
      }
      profile_verification_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          profile_id: string
          requested_type: Database["public"]["Enums"]["profile_type"]
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["verification_status"] | null
          supporting_documents: Json | null
          updated_at: string
          verification_notes: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          profile_id: string
          requested_type: Database["public"]["Enums"]["profile_type"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          supporting_documents?: Json | null
          updated_at?: string
          verification_notes?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          profile_id?: string
          requested_type?: Database["public"]["Enums"]["profile_type"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          supporting_documents?: Json | null
          updated_at?: string
          verification_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_verification_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          achievements: Json | null
          allow_messages: boolean | null
          avatar_url: string | null
          ban_reason: string | null
          bio: string | null
          civic_influence_score: number | null
          civic_interests: string[] | null
          civic_tagline: string | null
          contact_info: Json | null
          contribution_level: string | null
          cover_photo_url: string | null
          created_at: string | null
          display_name: string | null
          enable_notifications: boolean | null
          events_attended: number | null
          id: string
          is_banned: boolean | null
          is_diaspora: boolean | null
          language_preference: string | null
          last_active_at: string | null
          location: string | null
          polls_created: number | null
          post_count: number | null
          privacy_settings: Json | null
          profession: string | null
          profile_slug: string | null
          profile_tags: string[] | null
          profile_type: Database["public"]["Enums"]["profile_type"] | null
          profile_views: number | null
          region: string | null
          rich_bio: Json | null
          social_links: Json | null
          subdivision: string | null
          updated_at: string | null
          user_id: string
          username: string
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified: boolean | null
        }
        Insert: {
          achievements?: Json | null
          allow_messages?: boolean | null
          avatar_url?: string | null
          ban_reason?: string | null
          bio?: string | null
          civic_influence_score?: number | null
          civic_interests?: string[] | null
          civic_tagline?: string | null
          contact_info?: Json | null
          contribution_level?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          display_name?: string | null
          enable_notifications?: boolean | null
          events_attended?: number | null
          id?: string
          is_banned?: boolean | null
          is_diaspora?: boolean | null
          language_preference?: string | null
          last_active_at?: string | null
          location?: string | null
          polls_created?: number | null
          post_count?: number | null
          privacy_settings?: Json | null
          profession?: string | null
          profile_slug?: string | null
          profile_tags?: string[] | null
          profile_type?: Database["public"]["Enums"]["profile_type"] | null
          profile_views?: number | null
          region?: string | null
          rich_bio?: Json | null
          social_links?: Json | null
          subdivision?: string | null
          updated_at?: string | null
          user_id: string
          username: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified?: boolean | null
        }
        Update: {
          achievements?: Json | null
          allow_messages?: boolean | null
          avatar_url?: string | null
          ban_reason?: string | null
          bio?: string | null
          civic_influence_score?: number | null
          civic_interests?: string[] | null
          civic_tagline?: string | null
          contact_info?: Json | null
          contribution_level?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          display_name?: string | null
          enable_notifications?: boolean | null
          events_attended?: number | null
          id?: string
          is_banned?: boolean | null
          is_diaspora?: boolean | null
          language_preference?: string | null
          last_active_at?: string | null
          location?: string | null
          polls_created?: number | null
          post_count?: number | null
          privacy_settings?: Json | null
          profession?: string | null
          profile_slug?: string | null
          profile_tags?: string[] | null
          profile_type?: Database["public"]["Enums"]["profile_type"] | null
          profile_views?: number | null
          region?: string | null
          rich_bio?: Json | null
          social_links?: Json | null
          subdivision?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified?: boolean | null
        }
        Relationships: []
      }
      project_budget_disbursements: {
        Row: {
          amount_fcfa: number
          amount_usd: number | null
          created_at: string | null
          created_by: string | null
          cumulative_disbursed: number | null
          disbursement_date: string
          disbursement_method: string | null
          disbursement_purpose: string | null
          id: string
          project_id: string
          recipient_entity: string | null
          remaining_budget: number | null
          supporting_documents: Json | null
          verification_documents: Json | null
          verified_by_treasury: boolean | null
        }
        Insert: {
          amount_fcfa: number
          amount_usd?: number | null
          created_at?: string | null
          created_by?: string | null
          cumulative_disbursed?: number | null
          disbursement_date: string
          disbursement_method?: string | null
          disbursement_purpose?: string | null
          id?: string
          project_id: string
          recipient_entity?: string | null
          remaining_budget?: number | null
          supporting_documents?: Json | null
          verification_documents?: Json | null
          verified_by_treasury?: boolean | null
        }
        Update: {
          amount_fcfa?: number
          amount_usd?: number | null
          created_at?: string | null
          created_by?: string | null
          cumulative_disbursed?: number | null
          disbursement_date?: string
          disbursement_method?: string | null
          disbursement_purpose?: string | null
          id?: string
          project_id?: string
          recipient_entity?: string | null
          remaining_budget?: number | null
          supporting_documents?: Json | null
          verification_documents?: Json | null
          verified_by_treasury?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "project_budget_disbursements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "government_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_community_reports: {
        Row: {
          community_impact_score: number | null
          created_at: string | null
          evidence_photos: Json | null
          id: string
          location_coordinates: Json | null
          moderator_id: string | null
          moderator_notes: string | null
          project_id: string
          public_visibility: boolean | null
          report_description: string
          report_severity: string | null
          report_title: string
          report_type: string
          reporter_user_id: string | null
          satisfaction_rating: number | null
          status: string | null
          updated_at: string | null
          verified_by_moderator: boolean | null
        }
        Insert: {
          community_impact_score?: number | null
          created_at?: string | null
          evidence_photos?: Json | null
          id?: string
          location_coordinates?: Json | null
          moderator_id?: string | null
          moderator_notes?: string | null
          project_id: string
          public_visibility?: boolean | null
          report_description: string
          report_severity?: string | null
          report_title: string
          report_type: string
          reporter_user_id?: string | null
          satisfaction_rating?: number | null
          status?: string | null
          updated_at?: string | null
          verified_by_moderator?: boolean | null
        }
        Update: {
          community_impact_score?: number | null
          created_at?: string | null
          evidence_photos?: Json | null
          id?: string
          location_coordinates?: Json | null
          moderator_id?: string | null
          moderator_notes?: string | null
          project_id?: string
          public_visibility?: boolean | null
          report_description?: string
          report_severity?: string | null
          report_title?: string
          report_type?: string
          reporter_user_id?: string | null
          satisfaction_rating?: number | null
          status?: string | null
          updated_at?: string | null
          verified_by_moderator?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "project_community_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "government_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_contractor_assignments: {
        Row: {
          contract_end_date: string | null
          contract_start_date: string | null
          contract_status: string | null
          contract_value: number
          contractor_id: string
          created_at: string | null
          id: string
          payment_schedule: Json | null
          payments_made: number | null
          performance_score: number | null
          project_id: string
        }
        Insert: {
          contract_end_date?: string | null
          contract_start_date?: string | null
          contract_status?: string | null
          contract_value: number
          contractor_id: string
          created_at?: string | null
          id?: string
          payment_schedule?: Json | null
          payments_made?: number | null
          performance_score?: number | null
          project_id: string
        }
        Update: {
          contract_end_date?: string | null
          contract_start_date?: string | null
          contract_status?: string | null
          contract_value?: number
          contractor_id?: string
          created_at?: string | null
          id?: string
          payment_schedule?: Json | null
          payments_made?: number | null
          performance_score?: number | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_contractor_assignments_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "project_contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_contractor_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "government_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_contractors: {
        Row: {
          average_quality_score: number | null
          blacklist_reason: string | null
          blacklisted: boolean | null
          company_type: string | null
          contact_information: Json | null
          contractor_id: string | null
          contractor_name: string
          corruption_flags_count: number | null
          created_at: string | null
          id: string
          performance_rating: number | null
          projects_abandoned: number | null
          projects_completed: number | null
          projects_delayed: number | null
          registration_number: string | null
          specialization: Json | null
          total_contracts_value: number | null
          updated_at: string | null
          verified_contractor: boolean | null
        }
        Insert: {
          average_quality_score?: number | null
          blacklist_reason?: string | null
          blacklisted?: boolean | null
          company_type?: string | null
          contact_information?: Json | null
          contractor_id?: string | null
          contractor_name: string
          corruption_flags_count?: number | null
          created_at?: string | null
          id?: string
          performance_rating?: number | null
          projects_abandoned?: number | null
          projects_completed?: number | null
          projects_delayed?: number | null
          registration_number?: string | null
          specialization?: Json | null
          total_contracts_value?: number | null
          updated_at?: string | null
          verified_contractor?: boolean | null
        }
        Update: {
          average_quality_score?: number | null
          blacklist_reason?: string | null
          blacklisted?: boolean | null
          company_type?: string | null
          contact_information?: Json | null
          contractor_id?: string | null
          contractor_name?: string
          corruption_flags_count?: number | null
          created_at?: string | null
          id?: string
          performance_rating?: number | null
          projects_abandoned?: number | null
          projects_completed?: number | null
          projects_delayed?: number | null
          registration_number?: string | null
          specialization?: Json | null
          total_contracts_value?: number | null
          updated_at?: string | null
          verified_contractor?: boolean | null
        }
        Relationships: []
      }
      project_corruption_flags: {
        Row: {
          corruption_amount_estimated: number | null
          created_at: string | null
          evidence_files: Json | null
          flag_description: string
          flag_severity: string | null
          flag_type: string
          id: string
          investigated_by: string | null
          investigation_notes: string | null
          investigation_status: string | null
          project_id: string
          public_visibility: boolean | null
          reported_by: string | null
          reporter_type: string | null
          resolution_date: string | null
          resolution_status: string | null
          updated_at: string | null
          whistleblower_protected: boolean | null
        }
        Insert: {
          corruption_amount_estimated?: number | null
          created_at?: string | null
          evidence_files?: Json | null
          flag_description: string
          flag_severity?: string | null
          flag_type: string
          id?: string
          investigated_by?: string | null
          investigation_notes?: string | null
          investigation_status?: string | null
          project_id: string
          public_visibility?: boolean | null
          reported_by?: string | null
          reporter_type?: string | null
          resolution_date?: string | null
          resolution_status?: string | null
          updated_at?: string | null
          whistleblower_protected?: boolean | null
        }
        Update: {
          corruption_amount_estimated?: number | null
          created_at?: string | null
          evidence_files?: Json | null
          flag_description?: string
          flag_severity?: string | null
          flag_type?: string
          id?: string
          investigated_by?: string | null
          investigation_notes?: string | null
          investigation_status?: string | null
          project_id?: string
          public_visibility?: boolean | null
          reported_by?: string | null
          reporter_type?: string | null
          resolution_date?: string | null
          resolution_status?: string | null
          updated_at?: string | null
          whistleblower_protected?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "project_corruption_flags_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "government_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_documents: {
        Row: {
          access_level: string | null
          created_at: string | null
          document_date: string | null
          document_description: string | null
          document_hash: string | null
          document_title: string
          document_type: string
          file_size_bytes: number | null
          file_url: string | null
          id: string
          language: string | null
          project_id: string
          updated_at: string | null
          uploaded_by: string | null
          verification_status: string | null
          verified_by: string | null
        }
        Insert: {
          access_level?: string | null
          created_at?: string | null
          document_date?: string | null
          document_description?: string | null
          document_hash?: string | null
          document_title: string
          document_type: string
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          language?: string | null
          project_id: string
          updated_at?: string | null
          uploaded_by?: string | null
          verification_status?: string | null
          verified_by?: string | null
        }
        Update: {
          access_level?: string | null
          created_at?: string | null
          document_date?: string | null
          document_description?: string | null
          document_hash?: string | null
          document_title?: string
          document_type?: string
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          language?: string | null
          project_id?: string
          updated_at?: string | null
          uploaded_by?: string | null
          verification_status?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "government_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_milestones: {
        Row: {
          actual_date: string | null
          budget_allocated: number | null
          budget_used: number | null
          completion_percentage: number | null
          created_at: string | null
          evidence_required: boolean | null
          evidence_submitted: Json | null
          id: string
          is_critical: boolean | null
          milestone_description: string | null
          milestone_name: string
          milestone_order: number | null
          planned_date: string | null
          project_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          actual_date?: string | null
          budget_allocated?: number | null
          budget_used?: number | null
          completion_percentage?: number | null
          created_at?: string | null
          evidence_required?: boolean | null
          evidence_submitted?: Json | null
          id?: string
          is_critical?: boolean | null
          milestone_description?: string | null
          milestone_name: string
          milestone_order?: number | null
          planned_date?: string | null
          project_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_date?: string | null
          budget_allocated?: number | null
          budget_used?: number | null
          completion_percentage?: number | null
          created_at?: string | null
          evidence_required?: boolean | null
          evidence_submitted?: Json | null
          id?: string
          is_critical?: boolean | null
          milestone_description?: string | null
          milestone_name?: string
          milestone_order?: number | null
          planned_date?: string | null
          project_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "government_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_status_updates: {
        Row: {
          budget_update: Json | null
          completion_percentage: number
          created_at: string | null
          evidence_photos: Json | null
          id: string
          location_verified: boolean | null
          new_status: Database["public"]["Enums"]["project_status"]
          previous_status: Database["public"]["Enums"]["project_status"] | null
          progress_notes: string | null
          project_id: string
          update_description: string | null
          updated_by: string | null
          updater_type: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          budget_update?: Json | null
          completion_percentage: number
          created_at?: string | null
          evidence_photos?: Json | null
          id?: string
          location_verified?: boolean | null
          new_status: Database["public"]["Enums"]["project_status"]
          previous_status?: Database["public"]["Enums"]["project_status"] | null
          progress_notes?: string | null
          project_id: string
          update_description?: string | null
          updated_by?: string | null
          updater_type?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          budget_update?: Json | null
          completion_percentage?: number
          created_at?: string | null
          evidence_photos?: Json | null
          id?: string
          location_verified?: boolean | null
          new_status?: Database["public"]["Enums"]["project_status"]
          previous_status?: Database["public"]["Enums"]["project_status"] | null
          progress_notes?: string | null
          project_id?: string
          update_description?: string | null
          updated_by?: string | null
          updater_type?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_status_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "government_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_timeline_alerts: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_message: string
          alert_severity: string | null
          alert_type: string
          automated: boolean | null
          created_at: string | null
          days_overdue: number | null
          id: string
          project_id: string
          resolution_notes: string | null
          resolved: boolean | null
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_message: string
          alert_severity?: string | null
          alert_type: string
          automated?: boolean | null
          created_at?: string | null
          days_overdue?: number | null
          id?: string
          project_id: string
          resolution_notes?: string | null
          resolved?: boolean | null
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_message?: string
          alert_severity?: string | null
          alert_type?: string
          automated?: boolean | null
          created_at?: string | null
          days_overdue?: number | null
          id?: string
          project_id?: string
          resolution_notes?: string | null
          resolved?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "project_timeline_alerts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "government_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      promise_alerts: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          affected_regions: string[] | null
          alert_message: string
          alert_severity: string | null
          alert_type: string
          auto_generated: boolean | null
          created_at: string | null
          id: string
          promise_id: string
          promise_type: string
          sentiment_data: Json | null
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          affected_regions?: string[] | null
          alert_message: string
          alert_severity?: string | null
          alert_type: string
          auto_generated?: boolean | null
          created_at?: string | null
          id?: string
          promise_id: string
          promise_type: string
          sentiment_data?: Json | null
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          affected_regions?: string[] | null
          alert_message?: string
          alert_severity?: string | null
          alert_type?: string
          auto_generated?: boolean | null
          created_at?: string | null
          id?: string
          promise_id?: string
          promise_type?: string
          sentiment_data?: Json | null
        }
        Relationships: []
      }
      promise_public_votes: {
        Row: {
          confidence_level: number | null
          created_at: string | null
          evidence_provided: string | null
          id: string
          promise_id: string
          promise_type: string
          updated_at: string | null
          user_id: string
          vote_comment: string | null
          vote_status: string
        }
        Insert: {
          confidence_level?: number | null
          created_at?: string | null
          evidence_provided?: string | null
          id?: string
          promise_id: string
          promise_type: string
          updated_at?: string | null
          user_id: string
          vote_comment?: string | null
          vote_status: string
        }
        Update: {
          confidence_level?: number | null
          created_at?: string | null
          evidence_provided?: string | null
          id?: string
          promise_id?: string
          promise_type?: string
          updated_at?: string | null
          user_id?: string
          vote_comment?: string | null
          vote_status?: string
        }
        Relationships: []
      }
      promise_sentiment_correlations: {
        Row: {
          affected_regions: string[] | null
          analysis_metadata: Json | null
          baseline_sentiment: number | null
          confidence_score: number | null
          correlation_date: string | null
          correlation_strength: number | null
          created_at: string | null
          dominant_emotion: string | null
          id: string
          post_event_sentiment: number | null
          promise_id: string | null
          promise_type: string
          related_sentiment_log_ids: string[] | null
          sentiment_shift_intensity: number | null
        }
        Insert: {
          affected_regions?: string[] | null
          analysis_metadata?: Json | null
          baseline_sentiment?: number | null
          confidence_score?: number | null
          correlation_date?: string | null
          correlation_strength?: number | null
          created_at?: string | null
          dominant_emotion?: string | null
          id?: string
          post_event_sentiment?: number | null
          promise_id?: string | null
          promise_type: string
          related_sentiment_log_ids?: string[] | null
          sentiment_shift_intensity?: number | null
        }
        Update: {
          affected_regions?: string[] | null
          analysis_metadata?: Json | null
          baseline_sentiment?: number | null
          confidence_score?: number | null
          correlation_date?: string | null
          correlation_strength?: number | null
          created_at?: string | null
          dominant_emotion?: string | null
          id?: string
          post_event_sentiment?: number | null
          promise_id?: string | null
          promise_type?: string
          related_sentiment_log_ids?: string[] | null
          sentiment_shift_intensity?: number | null
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
      rating_criteria: {
        Row: {
          created_at: string
          criteria_description: string | null
          criteria_name: string
          display_order: number | null
          id: string
          institution_type: Database["public"]["Enums"]["institution_type"]
          is_active: boolean
          weight: number | null
        }
        Insert: {
          created_at?: string
          criteria_description?: string | null
          criteria_name: string
          display_order?: number | null
          id?: string
          institution_type: Database["public"]["Enums"]["institution_type"]
          is_active?: boolean
          weight?: number | null
        }
        Update: {
          created_at?: string
          criteria_description?: string | null
          criteria_name?: string
          display_order?: number | null
          id?: string
          institution_type?: Database["public"]["Enums"]["institution_type"]
          is_active?: boolean
          weight?: number | null
        }
        Relationships: []
      }
      real_time_data_streams: {
        Row: {
          created_at: string
          data_schema: Json
          data_source: string
          data_type: Database["public"]["Enums"]["analytics_data_type"]
          error_count: number
          id: string
          is_active: boolean
          last_data_point: string | null
          last_error_message: string | null
          stream_configuration: Json | null
          stream_name: string
          subscribers: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_schema: Json
          data_source: string
          data_type: Database["public"]["Enums"]["analytics_data_type"]
          error_count?: number
          id?: string
          is_active?: boolean
          last_data_point?: string | null
          last_error_message?: string | null
          stream_configuration?: Json | null
          stream_name: string
          subscribers?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_schema?: Json
          data_source?: string
          data_type?: Database["public"]["Enums"]["analytics_data_type"]
          error_count?: number
          id?: string
          is_active?: boolean
          last_data_point?: string | null
          last_error_message?: string | null
          stream_configuration?: Json | null
          stream_name?: string
          subscribers?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      realtime_activity_feed: {
        Row: {
          action_description: string
          activity_data: Json | null
          activity_type: string
          actor_id: string | null
          actor_name: string | null
          created_at: string
          engagement_count: number
          geographic_context: string | null
          id: string
          impact_score: number | null
          reaction_summary: Json | null
          target_id: string | null
          target_type: string | null
          visibility: string
        }
        Insert: {
          action_description: string
          activity_data?: Json | null
          activity_type: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          engagement_count?: number
          geographic_context?: string | null
          id?: string
          impact_score?: number | null
          reaction_summary?: Json | null
          target_id?: string | null
          target_type?: string | null
          visibility?: string
        }
        Update: {
          action_description?: string
          activity_data?: Json | null
          activity_type?: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          engagement_count?: number
          geographic_context?: string | null
          id?: string
          impact_score?: number | null
          reaction_summary?: Json | null
          target_id?: string | null
          target_type?: string | null
          visibility?: string
        }
        Relationships: []
      }
      realtime_notifications: {
        Row: {
          acknowledged_by: string[] | null
          action_url: string | null
          created_at: string
          created_by: string | null
          delivery_channels: string[]
          delivery_status: Json | null
          expires_at: string | null
          id: string
          message: string
          metadata: Json | null
          notification_type: string
          priority: Database["public"]["Enums"]["alert_severity"]
          read_by: string[] | null
          sent_at: string | null
          target_audience: string
          target_users: string[] | null
          title: string
        }
        Insert: {
          acknowledged_by?: string[] | null
          action_url?: string | null
          created_at?: string
          created_by?: string | null
          delivery_channels?: string[]
          delivery_status?: Json | null
          expires_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          notification_type: string
          priority?: Database["public"]["Enums"]["alert_severity"]
          read_by?: string[] | null
          sent_at?: string | null
          target_audience?: string
          target_users?: string[] | null
          title: string
        }
        Update: {
          acknowledged_by?: string[] | null
          action_url?: string | null
          created_at?: string
          created_by?: string | null
          delivery_channels?: string[]
          delivery_status?: Json | null
          expires_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: string
          priority?: Database["public"]["Enums"]["alert_severity"]
          read_by?: string[] | null
          sent_at?: string | null
          target_audience?: string
          target_users?: string[] | null
          title?: string
        }
        Relationships: []
      }
      realtime_streams: {
        Row: {
          created_at: string
          created_by: string | null
          data_retention_days: number
          description: string | null
          endpoint_url: string | null
          error_count: number
          id: string
          is_active: boolean
          last_update: string | null
          max_errors: number
          metadata: Json | null
          refresh_interval_seconds: number
          stream_name: string
          stream_type: Database["public"]["Enums"]["stream_type"]
          subscribers_count: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_retention_days?: number
          description?: string | null
          endpoint_url?: string | null
          error_count?: number
          id?: string
          is_active?: boolean
          last_update?: string | null
          max_errors?: number
          metadata?: Json | null
          refresh_interval_seconds?: number
          stream_name: string
          stream_type: Database["public"]["Enums"]["stream_type"]
          subscribers_count?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_retention_days?: number
          description?: string | null
          endpoint_url?: string | null
          error_count?: number
          id?: string
          is_active?: boolean
          last_update?: string | null
          max_errors?: number
          metadata?: Json | null
          refresh_interval_seconds?: number
          stream_name?: string
          stream_type?: Database["public"]["Enums"]["stream_type"]
          subscribers_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      report_instances: {
        Row: {
          created_at: string
          custom_report_id: string
          download_count: number
          error_message: string | null
          expires_at: string | null
          file_size_kb: number | null
          file_url: string | null
          generated_by: string | null
          generation_duration_ms: number | null
          generation_status: string
          id: string
          report_data: Json
        }
        Insert: {
          created_at?: string
          custom_report_id: string
          download_count?: number
          error_message?: string | null
          expires_at?: string | null
          file_size_kb?: number | null
          file_url?: string | null
          generated_by?: string | null
          generation_duration_ms?: number | null
          generation_status?: string
          id?: string
          report_data: Json
        }
        Update: {
          created_at?: string
          custom_report_id?: string
          download_count?: number
          error_message?: string | null
          expires_at?: string | null
          file_size_kb?: number | null
          file_url?: string | null
          generated_by?: string | null
          generation_duration_ms?: number | null
          generation_status?: string
          id?: string
          report_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "report_instances_custom_report_id_fkey"
            columns: ["custom_report_id"]
            isOneToOne: false
            referencedRelation: "custom_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_analytics: {
        Row: {
          claim_fees: number
          created_at: string
          date: string
          feature_fees: number
          hospital_revenue: number
          id: string
          inbox_fees: number
          pharmacy_revenue: number
          promotional_fees: number
          school_revenue: number
          total_revenue: number
          transactions_count: number
          updated_at: string
        }
        Insert: {
          claim_fees?: number
          created_at?: string
          date?: string
          feature_fees?: number
          hospital_revenue?: number
          id?: string
          inbox_fees?: number
          pharmacy_revenue?: number
          promotional_fees?: number
          school_revenue?: number
          total_revenue?: number
          transactions_count?: number
          updated_at?: string
        }
        Update: {
          claim_fees?: number
          created_at?: string
          date?: string
          feature_fees?: number
          hospital_revenue?: number
          id?: string
          inbox_fees?: number
          pharmacy_revenue?: number
          promotional_fees?: number
          school_revenue?: number
          total_revenue?: number
          transactions_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      review_comments: {
        Row: {
          comment_text: string
          commenter_id: string
          created_at: string
          id: string
          is_anonymous: boolean
          is_owner_response: boolean
          review_id: string
          updated_at: string
        }
        Insert: {
          comment_text: string
          commenter_id: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          is_owner_response?: boolean
          review_id: string
          updated_at?: string
        }
        Update: {
          comment_text?: string
          commenter_id?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          is_owner_response?: boolean
          review_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_comments_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "institution_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_flags: {
        Row: {
          created_at: string
          flag_details: string | null
          flag_reason: string
          flagger_id: string
          id: string
          review_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          flag_details?: string | null
          flag_reason: string
          flagger_id: string
          id?: string
          review_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          flag_details?: string | null
          flag_reason?: string
          flagger_id?: string
          id?: string
          review_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_flags_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "institution_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_votes: {
        Row: {
          created_at: string
          id: string
          review_id: string
          vote_type: string
          voter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          review_id: string
          vote_type: string
          voter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          review_id?: string
          vote_type?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "institution_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      role_change_audit: {
        Row: {
          changed_at: string
          changed_by: string
          id: string
          new_role: string
          old_role: string | null
          reason: string | null
          target_user: string
        }
        Insert: {
          changed_at?: string
          changed_by: string
          id?: string
          new_role: string
          old_role?: string | null
          reason?: string | null
          target_user: string
        }
        Update: {
          changed_at?: string
          changed_by?: string
          id?: string
          new_role?: string
          old_role?: string | null
          reason?: string | null
          target_user?: string
        }
        Relationships: []
      }
      royalty_payments: {
        Row: {
          amount: number
          artist_id: string | null
          created_at: string | null
          id: string
          payment_period_end: string
          payment_period_start: string
          processed_at: string | null
          status: Database["public"]["Enums"]["royalty_status"] | null
          track_id: string | null
        }
        Insert: {
          amount: number
          artist_id?: string | null
          created_at?: string | null
          id?: string
          payment_period_end: string
          payment_period_start: string
          processed_at?: string | null
          status?: Database["public"]["Enums"]["royalty_status"] | null
          track_id?: string | null
        }
        Update: {
          amount?: number
          artist_id?: string | null
          created_at?: string | null
          id?: string
          payment_period_end?: string
          payment_period_start?: string
          processed_at?: string | null
          status?: Database["public"]["Enums"]["royalty_status"] | null
          track_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "royalty_payments_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artist_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "royalty_payments_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "music_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      royalty_splits: {
        Row: {
          created_at: string | null
          id: string
          percentage: number
          recipient_name: string
          recipient_type: string
          track_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          percentage: number
          recipient_name: string
          recipient_type: string
          track_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          percentage?: number
          recipient_name?: string
          recipient_type?: string
          track_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "royalty_splits_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "music_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          created_at: string
          id: string
          last_result_count: number | null
          notification_enabled: boolean | null
          search_filters: Json | null
          search_name: string
          search_query: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_result_count?: number | null
          notification_enabled?: boolean | null
          search_filters?: Json | null
          search_name: string
          search_query: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_result_count?: number | null
          notification_enabled?: boolean | null
          search_filters?: Json | null
          search_name?: string
          search_query?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      school_claims: {
        Row: {
          admin_notes: string | null
          claim_reason: string
          created_at: string
          evidence_documents: string[] | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          school_id: string
          status: Database["public"]["Enums"]["claim_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          claim_reason: string
          created_at?: string
          evidence_documents?: string[] | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_id: string
          status?: Database["public"]["Enums"]["claim_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          claim_reason?: string
          created_at?: string
          evidence_documents?: string[] | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_id?: string
          status?: Database["public"]["Enums"]["claim_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_claims_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_monetization: {
        Row: {
          created_at: string
          expires_at: string | null
          feature_type: string
          id: string
          is_active: boolean | null
          payment_amount: number | null
          payment_reference: string | null
          school_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          feature_type: string
          id?: string
          is_active?: boolean | null
          payment_amount?: number | null
          payment_reference?: string | null
          school_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          feature_type?: string
          id?: string
          is_active?: boolean | null
          payment_amount?: number | null
          payment_reference?: string | null
          school_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_monetization_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_ratings: {
        Row: {
          academic_performance: number | null
          community_trust: number | null
          created_at: string
          discipline_safety: number | null
          id: string
          inclusiveness: number | null
          infrastructure: number | null
          overall_rating: number | null
          review_text: string | null
          school_id: string
          teaching_quality: number | null
          tech_access: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          academic_performance?: number | null
          community_trust?: number | null
          created_at?: string
          discipline_safety?: number | null
          id?: string
          inclusiveness?: number | null
          infrastructure?: number | null
          overall_rating?: number | null
          review_text?: string | null
          school_id: string
          teaching_quality?: number | null
          tech_access?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          academic_performance?: number | null
          community_trust?: number | null
          created_at?: string
          discipline_safety?: number | null
          id?: string
          inclusiveness?: number | null
          infrastructure?: number | null
          overall_rating?: number | null
          review_text?: string | null
          school_id?: string
          teaching_quality?: number | null
          tech_access?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_ratings_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_updates: {
        Row: {
          content: string
          created_at: string
          id: string
          is_featured: boolean | null
          photos: string[] | null
          school_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_featured?: boolean | null
          photos?: string[] | null
          school_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_featured?: boolean | null
          photos?: string[] | null
          school_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_updates_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          average_rating: number | null
          claim_status: Database["public"]["Enums"]["claim_status"] | null
          claimed_at: string | null
          claimed_by: string | null
          contact_email: string | null
          contact_phone: string | null
          contact_website: string | null
          created_at: string
          created_by: string | null
          current_enrollment: number | null
          description: string | null
          division: string
          established_year: number | null
          fees_range_max: number | null
          fees_range_min: number | null
          founder_or_don: string | null
          id: string
          languages_taught: string[] | null
          latitude: number | null
          longitude: number | null
          name: string
          ownership: Database["public"]["Enums"]["school_ownership"]
          photo_gallery: string[] | null
          programs_offered: string | null
          region: string
          school_type: Database["public"]["Enums"]["school_type"]
          student_capacity: number | null
          total_ratings: number | null
          updated_at: string
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at: string | null
          verified_by: string | null
          village_or_city: string
        }
        Insert: {
          address?: string | null
          average_rating?: number | null
          claim_status?: Database["public"]["Enums"]["claim_status"] | null
          claimed_at?: string | null
          claimed_by?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_website?: string | null
          created_at?: string
          created_by?: string | null
          current_enrollment?: number | null
          description?: string | null
          division: string
          established_year?: number | null
          fees_range_max?: number | null
          fees_range_min?: number | null
          founder_or_don?: string | null
          id?: string
          languages_taught?: string[] | null
          latitude?: number | null
          longitude?: number | null
          name: string
          ownership: Database["public"]["Enums"]["school_ownership"]
          photo_gallery?: string[] | null
          programs_offered?: string | null
          region: string
          school_type: Database["public"]["Enums"]["school_type"]
          student_capacity?: number | null
          total_ratings?: number | null
          updated_at?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
          verified_by?: string | null
          village_or_city: string
        }
        Update: {
          address?: string | null
          average_rating?: number | null
          claim_status?: Database["public"]["Enums"]["claim_status"] | null
          claimed_at?: string | null
          claimed_by?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_website?: string | null
          created_at?: string
          created_by?: string | null
          current_enrollment?: number | null
          description?: string | null
          division?: string
          established_year?: number | null
          fees_range_max?: number | null
          fees_range_min?: number | null
          founder_or_don?: string | null
          id?: string
          languages_taught?: string[] | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          ownership?: Database["public"]["Enums"]["school_ownership"]
          photo_gallery?: string[] | null
          programs_offered?: string | null
          region?: string
          school_type?: Database["public"]["Enums"]["school_type"]
          student_capacity?: number | null
          total_ratings?: number | null
          updated_at?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
          verified_by?: string | null
          village_or_city?: string
        }
        Relationships: []
      }
      search_analytics: {
        Row: {
          clicked_result_id: string | null
          clicked_result_type: string | null
          created_at: string
          filters_applied: Json | null
          id: string
          results_count: number | null
          search_duration_ms: number | null
          search_query: string
          search_type: string
          user_id: string | null
        }
        Insert: {
          clicked_result_id?: string | null
          clicked_result_type?: string | null
          created_at?: string
          filters_applied?: Json | null
          id?: string
          results_count?: number | null
          search_duration_ms?: number | null
          search_query: string
          search_type?: string
          user_id?: string | null
        }
        Update: {
          clicked_result_id?: string | null
          clicked_result_type?: string | null
          created_at?: string
          filters_applied?: Json | null
          id?: string
          results_count?: number | null
          search_duration_ms?: number | null
          search_query?: string
          search_type?: string
          user_id?: string | null
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
      sentiment_annotations: {
        Row: {
          annotated_by: string
          annotated_by_name: string
          annotation_date: string
          annotation_text: string
          annotation_type: string
          created_at: string
          id: string
          is_public: boolean
          metadata: Json
          timeline_id: string
          updated_at: string
        }
        Insert: {
          annotated_by: string
          annotated_by_name: string
          annotation_date: string
          annotation_text: string
          annotation_type?: string
          created_at?: string
          id?: string
          is_public?: boolean
          metadata?: Json
          timeline_id: string
          updated_at?: string
        }
        Update: {
          annotated_by?: string
          annotated_by_name?: string
          annotation_date?: string
          annotation_text?: string
          annotation_type?: string
          created_at?: string
          id?: string
          is_public?: boolean
          metadata?: Json
          timeline_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sentiment_annotations_timeline_id_fkey"
            columns: ["timeline_id"]
            isOneToOne: false
            referencedRelation: "civic_sentiment_timeline"
            referencedColumns: ["id"]
          },
        ]
      }
      sentiment_export_requests: {
        Row: {
          created_at: string
          date_range: Json
          download_url: string | null
          expires_at: string | null
          export_data: Json | null
          export_type: string
          id: string
          requested_by: string
          status: string
          subject_filter: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_range?: Json
          download_url?: string | null
          expires_at?: string | null
          export_data?: Json | null
          export_type: string
          id?: string
          requested_by: string
          status?: string
          subject_filter?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_range?: Json
          download_url?: string | null
          expires_at?: string | null
          export_data?: Json | null
          export_type?: string
          id?: string
          requested_by?: string
          status?: string
          subject_filter?: Json
          updated_at?: string
        }
        Relationships: []
      }
      sentiment_spikes: {
        Row: {
          confidence_score: number
          created_at: string
          detected_cause: string | null
          event_source: string | null
          event_title: string | null
          id: string
          manual_annotation: string | null
          spike_intensity: number
          spike_type: string
          timeline_id: string
          updated_at: string
          verified_by: string | null
        }
        Insert: {
          confidence_score?: number
          created_at?: string
          detected_cause?: string | null
          event_source?: string | null
          event_title?: string | null
          id?: string
          manual_annotation?: string | null
          spike_intensity?: number
          spike_type: string
          timeline_id: string
          updated_at?: string
          verified_by?: string | null
        }
        Update: {
          confidence_score?: number
          created_at?: string
          detected_cause?: string | null
          event_source?: string | null
          event_title?: string | null
          id?: string
          manual_annotation?: string | null
          spike_intensity?: number
          spike_type?: string
          timeline_id?: string
          updated_at?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sentiment_spikes_timeline_id_fkey"
            columns: ["timeline_id"]
            isOneToOne: false
            referencedRelation: "civic_sentiment_timeline"
            referencedColumns: ["id"]
          },
        ]
      }
      sentiment_trends: {
        Row: {
          created_at: string
          detected_at: string
          expires_at: string
          id: string
          keywords: string[]
          metadata: Json | null
          platform: string
          region: string | null
          sentiment_score: number
          topic: string
          trend_strength: number
        }
        Insert: {
          created_at?: string
          detected_at?: string
          expires_at?: string
          id?: string
          keywords?: string[]
          metadata?: Json | null
          platform: string
          region?: string | null
          sentiment_score?: number
          topic: string
          trend_strength?: number
        }
        Update: {
          created_at?: string
          detected_at?: string
          expires_at?: string
          id?: string
          keywords?: string[]
          metadata?: Json | null
          platform?: string
          region?: string | null
          sentiment_score?: number
          topic?: string
          trend_strength?: number
        }
        Relationships: []
      }
      service_emotion_correlations: {
        Row: {
          analysis_confidence: number
          correlation_strength: number
          created_at: string
          date_analyzed: string
          emotion_intensity: number
          emotion_type: string
          id: string
          insights: Json | null
          region: string
          sentiment_volume: number
          service_event_id: string
        }
        Insert: {
          analysis_confidence?: number
          correlation_strength?: number
          created_at?: string
          date_analyzed?: string
          emotion_intensity?: number
          emotion_type: string
          id?: string
          insights?: Json | null
          region: string
          sentiment_volume?: number
          service_event_id: string
        }
        Update: {
          analysis_confidence?: number
          correlation_strength?: number
          created_at?: string
          date_analyzed?: string
          emotion_intensity?: number
          emotion_type?: string
          id?: string
          insights?: Json | null
          region?: string
          sentiment_volume?: number
          service_event_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_emotion_correlations_service_event_id_fkey"
            columns: ["service_event_id"]
            isOneToOne: false
            referencedRelation: "civic_service_events"
            referencedColumns: ["id"]
          },
        ]
      }
      social_media_trends: {
        Row: {
          age_demographics: Json | null
          created_at: string
          detected_at: string
          engagement_rate: number | null
          expires_at: string
          geographic_data: Json | null
          hashtag: string | null
          id: string
          keywords: string[] | null
          mention_count: number
          platform: string
          poll_generated: boolean
          raw_data: Json | null
          sentiment_score: number
          trend_strength: number
        }
        Insert: {
          age_demographics?: Json | null
          created_at?: string
          detected_at?: string
          engagement_rate?: number | null
          expires_at?: string
          geographic_data?: Json | null
          hashtag?: string | null
          id?: string
          keywords?: string[] | null
          mention_count?: number
          platform: string
          poll_generated?: boolean
          raw_data?: Json | null
          sentiment_score?: number
          trend_strength?: number
        }
        Update: {
          age_demographics?: Json | null
          created_at?: string
          detected_at?: string
          engagement_rate?: number | null
          expires_at?: string
          geographic_data?: Json | null
          hashtag?: string | null
          id?: string
          keywords?: string[] | null
          mention_count?: number
          platform?: string
          poll_generated?: boolean
          raw_data?: Json | null
          sentiment_score?: number
          trend_strength?: number
        }
        Relationships: []
      }
      sponsored_listings: {
        Row: {
          amount_paid: number | null
          analytics_data: Json | null
          created_at: string
          duration_days: number
          expires_at: string
          id: string
          institution_id: string
          is_active: boolean
          listing_type: string
          payment_status: string
          sponsor_user_id: string
          starts_at: string
          stripe_payment_intent_id: string | null
          updated_at: string
        }
        Insert: {
          amount_paid?: number | null
          analytics_data?: Json | null
          created_at?: string
          duration_days: number
          expires_at: string
          id?: string
          institution_id: string
          is_active?: boolean
          listing_type: string
          payment_status?: string
          sponsor_user_id: string
          starts_at: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_paid?: number | null
          analytics_data?: Json | null
          created_at?: string
          duration_days?: number
          expires_at?: string
          id?: string
          institution_id?: string
          is_active?: boolean
          listing_type?: string
          payment_status?: string
          sponsor_user_id?: string
          starts_at?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsored_listings_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      storefront_products: {
        Row: {
          artist_id: string
          created_at: string
          description: string | null
          discount_percentage: number | null
          download_url: string | null
          genres: string[] | null
          id: string
          is_digital: boolean | null
          is_featured: boolean | null
          metadata: Json | null
          preview_url: string | null
          price_fcfa: number
          product_name: string
          product_type: Database["public"]["Enums"]["product_type"]
          stock_quantity: number | null
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          artist_id: string
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          download_url?: string | null
          genres?: string[] | null
          id?: string
          is_digital?: boolean | null
          is_featured?: boolean | null
          metadata?: Json | null
          preview_url?: string | null
          price_fcfa: number
          product_name: string
          product_type: Database["public"]["Enums"]["product_type"]
          stock_quantity?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          artist_id?: string
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          download_url?: string | null
          genres?: string[] | null
          id?: string
          is_digital?: boolean | null
          is_featured?: boolean | null
          metadata?: Json | null
          preview_url?: string | null
          price_fcfa?: number
          product_name?: string
          product_type?: Database["public"]["Enums"]["product_type"]
          stock_quantity?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      strategy_execution_logs: {
        Row: {
          challenges_encountered: Json | null
          completed_at: string | null
          created_at: string
          executed_by: string | null
          execution_phase: string
          id: string
          impact_measurements: Json | null
          milestones_completed: Json | null
          phase_status: string
          progress_percentage: number | null
          public_feedback: Json | null
          started_at: string | null
          strategy_id: string | null
        }
        Insert: {
          challenges_encountered?: Json | null
          completed_at?: string | null
          created_at?: string
          executed_by?: string | null
          execution_phase: string
          id?: string
          impact_measurements?: Json | null
          milestones_completed?: Json | null
          phase_status?: string
          progress_percentage?: number | null
          public_feedback?: Json | null
          started_at?: string | null
          strategy_id?: string | null
        }
        Update: {
          challenges_encountered?: Json | null
          completed_at?: string | null
          created_at?: string
          executed_by?: string | null
          execution_phase?: string
          id?: string
          impact_measurements?: Json | null
          milestones_completed?: Json | null
          phase_status?: string
          progress_percentage?: number | null
          public_feedback?: Json | null
          started_at?: string | null
          strategy_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "strategy_execution_logs_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "civic_strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_implementations: {
        Row: {
          created_at: string
          deployed_at: string | null
          id: string
          implementation_status: string
          implemented_features: string[] | null
          lessons_learned: string | null
          progress_percentage: number | null
          public_feedback: Json | null
          solution_id: string
          success_metrics: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deployed_at?: string | null
          id?: string
          implementation_status?: string
          implemented_features?: string[] | null
          lessons_learned?: string | null
          progress_percentage?: number | null
          public_feedback?: Json | null
          solution_id: string
          success_metrics?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deployed_at?: string | null
          id?: string
          implementation_status?: string
          implemented_features?: string[] | null
          lessons_learned?: string | null
          progress_percentage?: number | null
          public_feedback?: Json | null
          solution_id?: string
          success_metrics?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_implementations_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "strategy_solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_patterns: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          pattern_category: string
          pattern_name: string
          problem_types: string[] | null
          solution_template: Json
          success_rate: number | null
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          pattern_category: string
          pattern_name: string
          problem_types?: string[] | null
          solution_template?: Json
          success_rate?: number | null
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          pattern_category?: string
          pattern_name?: string
          problem_types?: string[] | null
          solution_template?: Json
          success_rate?: number | null
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      strategy_problems: {
        Row: {
          created_at: string
          id: string
          priority_level: number | null
          problem_category: string
          problem_description: string
          problem_title: string
          status: string
          submitted_by: string
          target_audience: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          priority_level?: number | null
          problem_category?: string
          problem_description: string
          problem_title: string
          status?: string
          submitted_by: string
          target_audience?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          priority_level?: number | null
          problem_category?: string
          problem_description?: string
          problem_title?: string
          status?: string
          submitted_by?: string
          target_audience?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      strategy_solutions: {
        Row: {
          build_ready_prompt: string | null
          complexity_score: number | null
          confidence_score: number | null
          created_at: string
          dashboard_specs: Json | null
          data_requirements: Json | null
          engagement_strategy: Json | null
          export_formats: Json | null
          id: string
          integration_suggestions: Json | null
          problem_id: string
          recommended_features: Json | null
          solution_overview: string
          solution_title: string
          timeline_estimate: string | null
          updated_at: string
          user_flows: Json | null
        }
        Insert: {
          build_ready_prompt?: string | null
          complexity_score?: number | null
          confidence_score?: number | null
          created_at?: string
          dashboard_specs?: Json | null
          data_requirements?: Json | null
          engagement_strategy?: Json | null
          export_formats?: Json | null
          id?: string
          integration_suggestions?: Json | null
          problem_id: string
          recommended_features?: Json | null
          solution_overview: string
          solution_title: string
          timeline_estimate?: string | null
          updated_at?: string
          user_flows?: Json | null
        }
        Update: {
          build_ready_prompt?: string | null
          complexity_score?: number | null
          confidence_score?: number | null
          created_at?: string
          dashboard_specs?: Json | null
          data_requirements?: Json | null
          engagement_strategy?: Json | null
          export_formats?: Json | null
          id?: string
          integration_suggestions?: Json | null
          problem_id?: string
          recommended_features?: Json | null
          solution_overview?: string
          solution_title?: string
          timeline_estimate?: string | null
          updated_at?: string
          user_flows?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "strategy_solutions_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "strategy_problems"
            referencedColumns: ["id"]
          },
        ]
      }
      stream_data: {
        Row: {
          data_point: Json
          id: string
          metadata: Json | null
          processing_status: string | null
          source_identifier: string | null
          stream_id: string
          timestamp: string
        }
        Insert: {
          data_point: Json
          id?: string
          metadata?: Json | null
          processing_status?: string | null
          source_identifier?: string | null
          stream_id: string
          timestamp?: string
        }
        Update: {
          data_point?: Json
          id?: string
          metadata?: Json | null
          processing_status?: string | null
          source_identifier?: string | null
          stream_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_data_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "realtime_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      system_cache_config: {
        Row: {
          auto_flush_enabled: boolean | null
          auto_flush_interval_hours: number | null
          cache_layer: string
          config_metadata: Json | null
          created_at: string | null
          flush_priority: number | null
          id: string
          is_active: boolean | null
          max_size_mb: number | null
          retention_hours: number | null
          updated_at: string | null
        }
        Insert: {
          auto_flush_enabled?: boolean | null
          auto_flush_interval_hours?: number | null
          cache_layer: string
          config_metadata?: Json | null
          created_at?: string | null
          flush_priority?: number | null
          id?: string
          is_active?: boolean | null
          max_size_mb?: number | null
          retention_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          auto_flush_enabled?: boolean | null
          auto_flush_interval_hours?: number | null
          cache_layer?: string
          config_metadata?: Json | null
          created_at?: string | null
          flush_priority?: number | null
          id?: string
          is_active?: boolean | null
          max_size_mb?: number | null
          retention_hours?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      system_refresh_logs: {
        Row: {
          component_name: string
          created_at: string
          error_message: string | null
          id: string
          interval_ms: number | null
          refresh_time: string
          success: boolean
        }
        Insert: {
          component_name: string
          created_at?: string
          error_message?: string | null
          id?: string
          interval_ms?: number | null
          refresh_time?: string
          success?: boolean
        }
        Update: {
          component_name?: string
          created_at?: string
          error_message?: string | null
          id?: string
          interval_ms?: number | null
          refresh_time?: string
          success?: boolean
        }
        Relationships: []
      }
      ticket_purchases: {
        Row: {
          buyer_email: string
          buyer_id: string | null
          buyer_name: string
          buyer_phone: string | null
          created_at: string | null
          event_id: string
          expires_at: string | null
          id: string
          is_refundable: boolean | null
          is_transferable: boolean | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_reference: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          platform_fee: number
          qr_code_data: string
          qr_code_url: string | null
          quantity: number
          ticket_number: string
          ticket_type_id: string
          total_amount: number
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          buyer_email: string
          buyer_id?: string | null
          buyer_name: string
          buyer_phone?: string | null
          created_at?: string | null
          event_id: string
          expires_at?: string | null
          id?: string
          is_refundable?: boolean | null
          is_transferable?: boolean | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          platform_fee?: number
          qr_code_data: string
          qr_code_url?: string | null
          quantity?: number
          ticket_number: string
          ticket_type_id: string
          total_amount: number
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          buyer_email?: string
          buyer_id?: string | null
          buyer_name?: string
          buyer_phone?: string | null
          created_at?: string | null
          event_id?: string
          expires_at?: string | null
          id?: string
          is_refundable?: boolean | null
          is_transferable?: boolean | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          platform_fee?: number
          qr_code_data?: string
          qr_code_url?: string | null
          quantity?: number
          ticket_number?: string
          ticket_type_id?: string
          total_amount?: number
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_purchases_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_purchases_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "event_ticket_types"
            referencedColumns: ["id"]
          },
        ]
      }
      track_analytics: {
        Row: {
          comments_count: number
          completion_rate: number | null
          created_at: string
          date: string
          id: string
          likes_count: number
          plays_count: number
          shares_count: number
          skip_rate: number | null
          track_id: string
          unique_listeners: number
        }
        Insert: {
          comments_count?: number
          completion_rate?: number | null
          created_at?: string
          date: string
          id?: string
          likes_count?: number
          plays_count?: number
          shares_count?: number
          skip_rate?: number | null
          track_id: string
          unique_listeners?: number
        }
        Update: {
          comments_count?: number
          completion_rate?: number | null
          created_at?: string
          date?: string
          id?: string
          likes_count?: number
          plays_count?: number
          shares_count?: number
          skip_rate?: number | null
          track_id?: string
          unique_listeners?: number
        }
        Relationships: []
      }
      track_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_comment_id: string | null
          timestamp_seconds: number | null
          track_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          timestamp_seconds?: number | null
          track_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          timestamp_seconds?: number | null
          track_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "track_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "track_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      track_likes: {
        Row: {
          created_at: string
          id: string
          track_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          track_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          track_id?: string
          user_id?: string
        }
        Relationships: []
      }
      track_plays: {
        Row: {
          country: string | null
          device_type: string | null
          duration_played_seconds: number | null
          id: string
          ip_address: unknown | null
          played_at: string | null
          region: string | null
          track_id: string | null
          user_id: string | null
        }
        Insert: {
          country?: string | null
          device_type?: string | null
          duration_played_seconds?: number | null
          id?: string
          ip_address?: unknown | null
          played_at?: string | null
          region?: string | null
          track_id?: string | null
          user_id?: string | null
        }
        Update: {
          country?: string | null
          device_type?: string | null
          duration_played_seconds?: number | null
          id?: string
          ip_address?: unknown | null
          played_at?: string | null
          region?: string | null
          track_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "track_plays_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "music_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      track_purchases: {
        Row: {
          amount_paid: number
          id: string
          purchase_type: string
          purchased_at: string | null
          stripe_payment_intent_id: string | null
          track_id: string | null
          user_id: string | null
        }
        Insert: {
          amount_paid: number
          id?: string
          purchase_type: string
          purchased_at?: string | null
          stripe_payment_intent_id?: string | null
          track_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount_paid?: number
          id?: string
          purchase_type?: string
          purchased_at?: string | null
          stripe_payment_intent_id?: string | null
          track_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "track_purchases_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "music_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      track_shares: {
        Row: {
          created_at: string
          id: string
          platform: string
          track_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          track_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          track_id?: string
          user_id?: string
        }
        Relationships: []
      }
      trend_detection: {
        Row: {
          affected_demographics: Json | null
          alert_generated: boolean
          category: string
          confidence_level: number
          data_sources: string[]
          description: string | null
          first_detected_at: string
          geographic_scope: string[] | null
          growth_rate: number | null
          id: string
          keywords: string[]
          last_updated_at: string
          momentum_score: number
          peak_timestamp: string | null
          related_entities: Json | null
          status: string
          trend_name: string
          trend_type: Database["public"]["Enums"]["trend_type"]
        }
        Insert: {
          affected_demographics?: Json | null
          alert_generated?: boolean
          category: string
          confidence_level: number
          data_sources: string[]
          description?: string | null
          first_detected_at?: string
          geographic_scope?: string[] | null
          growth_rate?: number | null
          id?: string
          keywords: string[]
          last_updated_at?: string
          momentum_score?: number
          peak_timestamp?: string | null
          related_entities?: Json | null
          status?: string
          trend_name: string
          trend_type: Database["public"]["Enums"]["trend_type"]
        }
        Update: {
          affected_demographics?: Json | null
          alert_generated?: boolean
          category?: string
          confidence_level?: number
          data_sources?: string[]
          description?: string | null
          first_detected_at?: string
          geographic_scope?: string[] | null
          growth_rate?: number | null
          id?: string
          keywords?: string[]
          last_updated_at?: string
          momentum_score?: number
          peak_timestamp?: string | null
          related_entities?: Json | null
          status?: string
          trend_name?: string
          trend_type?: Database["public"]["Enums"]["trend_type"]
        }
        Relationships: []
      }
      trending_searches: {
        Row: {
          created_at: string
          id: string
          last_searched: string
          search_count: number | null
          search_query: string
          trend_score: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_searched?: string
          search_count?: number | null
          search_query: string
          trend_score?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          last_searched?: string
          search_count?: number | null
          search_query?: string
          trend_score?: number | null
        }
        Relationships: []
      }
      trust_events: {
        Row: {
          created_at: string
          event_date: string
          event_description: string | null
          event_title: string
          event_type: string
          id: string
          institution_id: string
          metadata: Json | null
          regions_affected: string[] | null
          source_url: string | null
          trust_impact_score: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_date: string
          event_description?: string | null
          event_title: string
          event_type: string
          id?: string
          institution_id: string
          metadata?: Json | null
          regions_affected?: string[] | null
          source_url?: string | null
          trust_impact_score?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_date?: string
          event_description?: string | null
          event_title?: string
          event_type?: string
          id?: string
          institution_id?: string
          metadata?: Json | null
          regions_affected?: string[] | null
          source_url?: string | null
          trust_impact_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trust_events_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      ui_bug_logs: {
        Row: {
          component_path: string
          created_at: string
          element_selector: string | null
          id: string
          issue_description: string
          issue_type: string
          metadata: Json | null
          page_name: string
          resolved_at: string | null
          resolved_by: string | null
          screen_size: string
          screenshot_url: string | null
          severity: string
          status: string
          suggested_fix: string | null
          updated_at: string
        }
        Insert: {
          component_path: string
          created_at?: string
          element_selector?: string | null
          id?: string
          issue_description: string
          issue_type: string
          metadata?: Json | null
          page_name: string
          resolved_at?: string | null
          resolved_by?: string | null
          screen_size: string
          screenshot_url?: string | null
          severity?: string
          status?: string
          suggested_fix?: string | null
          updated_at?: string
        }
        Update: {
          component_path?: string
          created_at?: string
          element_selector?: string | null
          id?: string
          issue_description?: string
          issue_type?: string
          metadata?: Json | null
          page_name?: string
          resolved_at?: string | null
          resolved_by?: string | null
          screen_size?: string
          screenshot_url?: string | null
          severity?: string
          status?: string
          suggested_fix?: string | null
          updated_at?: string
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
      user_achievements: {
        Row: {
          achievement_type_id: string | null
          awarded_at: string | null
          id: string
          progress_data: Json | null
          user_id: string | null
        }
        Insert: {
          achievement_type_id?: string | null
          awarded_at?: string | null
          id?: string
          progress_data?: Json | null
          user_id?: string | null
        }
        Update: {
          achievement_type_id?: string | null
          awarded_at?: string | null
          id?: string
          progress_data?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_type_id_fkey"
            columns: ["achievement_type_id"]
            isOneToOne: false
            referencedRelation: "profile_achievement_types"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          is_equipped: boolean | null
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          is_equipped?: boolean | null
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          is_equipped?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "digital_badges"
            referencedColumns: ["id"]
          },
        ]
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
      user_notification_preferences: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          event_type: Database["public"]["Enums"]["notification_event_type"]
          id: string
          is_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          event_type: Database["public"]["Enums"]["notification_event_type"]
          id?: string
          is_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          event_type?: Database["public"]["Enums"]["notification_event_type"]
          id?: string
          is_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notification_settings: {
        Row: {
          created_at: string
          enable_all_notifications: boolean
          enable_civic_alerts: boolean
          enable_election_updates: boolean
          enable_intelligence_alerts: boolean
          enable_message_popups: boolean
          enable_poll_notifications: boolean
          enable_push_notifications: boolean
          id: string
          muted_conversations: string[] | null
          muted_regions: string[] | null
          priority_filter: string
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enable_all_notifications?: boolean
          enable_civic_alerts?: boolean
          enable_election_updates?: boolean
          enable_intelligence_alerts?: boolean
          enable_message_popups?: boolean
          enable_poll_notifications?: boolean
          enable_push_notifications?: boolean
          id?: string
          muted_conversations?: string[] | null
          muted_regions?: string[] | null
          priority_filter?: string
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enable_all_notifications?: boolean
          enable_civic_alerts?: boolean
          enable_election_updates?: boolean
          enable_intelligence_alerts?: boolean
          enable_message_popups?: boolean
          enable_poll_notifications?: boolean
          enable_push_notifications?: boolean
          id?: string
          muted_conversations?: string[] | null
          muted_regions?: string[] | null
          priority_filter?: string
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          data: Json | null
          dismissed_at: string | null
          expires_at: string | null
          geo_targeted: boolean | null
          icon: string | null
          id: string
          is_dismissed: boolean | null
          is_read: boolean | null
          message: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          priority: Database["public"]["Enums"]["notification_priority"] | null
          read_at: string | null
          target_regions: string[] | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          data?: Json | null
          dismissed_at?: string | null
          expires_at?: string | null
          geo_targeted?: boolean | null
          icon?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          priority?: Database["public"]["Enums"]["notification_priority"] | null
          read_at?: string | null
          target_regions?: string[] | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          data?: Json | null
          dismissed_at?: string | null
          expires_at?: string | null
          geo_targeted?: boolean | null
          icon?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message?: string
          notification_type?: Database["public"]["Enums"]["notification_type"]
          priority?: Database["public"]["Enums"]["notification_priority"] | null
          read_at?: string | null
          target_regions?: string[] | null
          title?: string
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
      user_points: {
        Row: {
          created_at: string | null
          id: string
          points_balance: number
          total_earned: number
          total_spent: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          points_balance?: number
          total_earned?: number
          total_spent?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          points_balance?: number
          total_earned?: number
          total_spent?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_poll_onboarding: {
        Row: {
          created_at: string
          first_poll_created_at: string | null
          id: string
          onboarding_completed: boolean
          onboarding_completed_at: string | null
          onboarding_steps_completed: Json | null
          polls_created_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_poll_created_at?: string | null
          id?: string
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          onboarding_steps_completed?: Json | null
          polls_created_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_poll_created_at?: string | null
          id?: string
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          onboarding_steps_completed?: Json | null
          polls_created_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          activity_level: string | null
          id: string
          interests: string[] | null
          last_updated: string
          preferred_regions: string[] | null
          user_id: string
        }
        Insert: {
          activity_level?: string | null
          id?: string
          interests?: string[] | null
          last_updated?: string
          preferred_regions?: string[] | null
          user_id: string
        }
        Update: {
          activity_level?: string | null
          id?: string
          interests?: string[] | null
          last_updated?: string
          preferred_regions?: string[] | null
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
      user_saved_content: {
        Row: {
          content_id: string
          content_type: string
          id: string
          saved_at: string | null
          user_id: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          id?: string
          saved_at?: string | null
          user_id?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          id?: string
          saved_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_trust_feedback: {
        Row: {
          comment: string | null
          created_at: string
          feedback_type: string | null
          id: string
          institution_id: string
          region: string | null
          trust_rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          feedback_type?: string | null
          id?: string
          institution_id: string
          region?: string | null
          trust_rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          feedback_type?: string | null
          id?: string
          institution_id?: string
          region?: string | null
          trust_rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_trust_feedback_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_whatsapp_preferences: {
        Row: {
          country_code: string | null
          created_at: string
          id: string
          opt_in_date: string | null
          phone_number: string | null
          updated_at: string
          user_id: string
          verified_at: string | null
          whatsapp_enabled: boolean
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          id?: string
          opt_in_date?: string | null
          phone_number?: string | null
          updated_at?: string
          user_id: string
          verified_at?: string | null
          whatsapp_enabled?: boolean
        }
        Update: {
          country_code?: string | null
          created_at?: string
          id?: string
          opt_in_date?: string | null
          phone_number?: string | null
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          whatsapp_enabled?: boolean
        }
        Relationships: []
      }
      village_analytics: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
          village_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          village_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          village_id?: string
        }
        Relationships: []
      }
      village_billionaires: {
        Row: {
          billionaire_name: string
          business_profile_link: string | null
          country_residence: string | null
          created_at: string
          created_by: string | null
          estimated_net_worth_fcfa: number | null
          estimated_net_worth_usd: number | null
          id: string
          is_verified: boolean | null
          known_donations: string | null
          main_sector: string | null
          photo_url: string | null
          social_media_links: Json | null
          updated_at: string
          village_contributions: string | null
          village_id: string
        }
        Insert: {
          billionaire_name: string
          business_profile_link?: string | null
          country_residence?: string | null
          created_at?: string
          created_by?: string | null
          estimated_net_worth_fcfa?: number | null
          estimated_net_worth_usd?: number | null
          id?: string
          is_verified?: boolean | null
          known_donations?: string | null
          main_sector?: string | null
          photo_url?: string | null
          social_media_links?: Json | null
          updated_at?: string
          village_contributions?: string | null
          village_id: string
        }
        Update: {
          billionaire_name?: string
          business_profile_link?: string | null
          country_residence?: string | null
          created_at?: string
          created_by?: string | null
          estimated_net_worth_fcfa?: number | null
          estimated_net_worth_usd?: number | null
          id?: string
          is_verified?: boolean | null
          known_donations?: string | null
          main_sector?: string | null
          photo_url?: string | null
          social_media_links?: Json | null
          updated_at?: string
          village_contributions?: string | null
          village_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "village_billionaires_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      village_celebrities: {
        Row: {
          awards: string[] | null
          celebrity_name: string
          created_at: string
          created_by: string | null
          highlights: string | null
          id: string
          is_verified: boolean | null
          photo_url: string | null
          profession: string | null
          social_media_links: Json | null
          updated_at: string
          village_id: string
          village_support_activities: string | null
        }
        Insert: {
          awards?: string[] | null
          celebrity_name: string
          created_at?: string
          created_by?: string | null
          highlights?: string | null
          id?: string
          is_verified?: boolean | null
          photo_url?: string | null
          profession?: string | null
          social_media_links?: Json | null
          updated_at?: string
          village_id: string
          village_support_activities?: string | null
        }
        Update: {
          awards?: string[] | null
          celebrity_name?: string
          created_at?: string
          created_by?: string | null
          highlights?: string | null
          id?: string
          is_verified?: boolean | null
          photo_url?: string | null
          profession?: string | null
          social_media_links?: Json | null
          updated_at?: string
          village_id?: string
          village_support_activities?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "village_celebrities_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      village_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_approved: boolean
          parent_comment_id: string | null
          updated_at: string
          user_id: string
          village_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean
          parent_comment_id?: string | null
          updated_at?: string
          user_id: string
          village_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          parent_comment_id?: string | null
          updated_at?: string
          user_id?: string
          village_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "village_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "village_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "village_comments_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      village_conflicts: {
        Row: {
          conflict_name: string
          conflict_type: string
          created_at: string
          created_by: string
          current_status: string | null
          description: string
          evidence_documents: string[] | null
          id: string
          is_moderated: boolean | null
          moderation_notes: string | null
          resolution_details: string | null
          stakeholders: string[] | null
          timeline_end: string | null
          timeline_start: string | null
          updated_at: string
          village_id: string
        }
        Insert: {
          conflict_name: string
          conflict_type: string
          created_at?: string
          created_by: string
          current_status?: string | null
          description: string
          evidence_documents?: string[] | null
          id?: string
          is_moderated?: boolean | null
          moderation_notes?: string | null
          resolution_details?: string | null
          stakeholders?: string[] | null
          timeline_end?: string | null
          timeline_start?: string | null
          updated_at?: string
          village_id: string
        }
        Update: {
          conflict_name?: string
          conflict_type?: string
          created_at?: string
          created_by?: string
          current_status?: string | null
          description?: string
          evidence_documents?: string[] | null
          id?: string
          is_moderated?: boolean | null
          moderation_notes?: string | null
          resolution_details?: string | null
          stakeholders?: string[] | null
          timeline_end?: string | null
          timeline_start?: string | null
          updated_at?: string
          village_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "village_conflicts_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      village_contributions: {
        Row: {
          contribution_date: string | null
          contribution_description: string | null
          contribution_type: string | null
          contribution_value: number | null
          contributor_name: string
          contributor_type: string | null
          created_at: string
          created_by: string | null
          id: string
          is_verified: boolean | null
          project_sponsored: string | null
          recognition_level: string | null
          updated_at: string
          village_id: string
        }
        Insert: {
          contribution_date?: string | null
          contribution_description?: string | null
          contribution_type?: string | null
          contribution_value?: number | null
          contributor_name: string
          contributor_type?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_verified?: boolean | null
          project_sponsored?: string | null
          recognition_level?: string | null
          updated_at?: string
          village_id: string
        }
        Update: {
          contribution_date?: string | null
          contribution_description?: string | null
          contribution_type?: string | null
          contribution_value?: number | null
          contributor_name?: string
          contributor_type?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_verified?: boolean | null
          project_sponsored?: string | null
          recognition_level?: string | null
          updated_at?: string
          village_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "village_contributions_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      village_data: {
        Row: {
          chief_contact: string | null
          chief_name: string | null
          conflict_resolution_score: number | null
          created_at: string
          culture_score: number | null
          development_score: number | null
          education_score: number | null
          fundraising_campaigns: Json | null
          heritage_info: string | null
          id: string
          institution_id: string
          major_projects: string[] | null
          petitions: Json | null
          population: number | null
          updated_at: string
        }
        Insert: {
          chief_contact?: string | null
          chief_name?: string | null
          conflict_resolution_score?: number | null
          created_at?: string
          culture_score?: number | null
          development_score?: number | null
          education_score?: number | null
          fundraising_campaigns?: Json | null
          heritage_info?: string | null
          id?: string
          institution_id: string
          major_projects?: string[] | null
          petitions?: Json | null
          population?: number | null
          updated_at?: string
        }
        Update: {
          chief_contact?: string | null
          chief_name?: string | null
          conflict_resolution_score?: number | null
          created_at?: string
          culture_score?: number | null
          development_score?: number | null
          education_score?: number | null
          fundraising_campaigns?: Json | null
          heritage_info?: string | null
          id?: string
          institution_id?: string
          major_projects?: string[] | null
          petitions?: Json | null
          population?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "village_data_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      village_development_associations: {
        Row: {
          achievements: string | null
          activities: string | null
          association_name: string
          bank_details: Json | null
          chairperson_name: string | null
          contact_info: Json | null
          created_at: string
          created_by: string | null
          diaspora_wings: string[] | null
          id: string
          momo_details: Json | null
          registration_status: string | null
          secretary_name: string | null
          treasurer_name: string | null
          updated_at: string
          village_id: string
          website_url: string | null
        }
        Insert: {
          achievements?: string | null
          activities?: string | null
          association_name: string
          bank_details?: Json | null
          chairperson_name?: string | null
          contact_info?: Json | null
          created_at?: string
          created_by?: string | null
          diaspora_wings?: string[] | null
          id?: string
          momo_details?: Json | null
          registration_status?: string | null
          secretary_name?: string | null
          treasurer_name?: string | null
          updated_at?: string
          village_id: string
          website_url?: string | null
        }
        Update: {
          achievements?: string | null
          activities?: string | null
          association_name?: string
          bank_details?: Json | null
          chairperson_name?: string | null
          contact_info?: Json | null
          created_at?: string
          created_by?: string | null
          diaspora_wings?: string[] | null
          id?: string
          momo_details?: Json | null
          registration_status?: string | null
          secretary_name?: string | null
          treasurer_name?: string | null
          updated_at?: string
          village_id?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "village_development_associations_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      village_discussions: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_locked: boolean
          is_pinned: boolean
          last_activity_at: string
          replies_count: number
          title: string
          updated_at: string
          user_id: string
          views_count: number
          village_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_locked?: boolean
          is_pinned?: boolean
          last_activity_at?: string
          replies_count?: number
          title: string
          updated_at?: string
          user_id: string
          views_count?: number
          village_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_locked?: boolean
          is_pinned?: boolean
          last_activity_at?: string
          replies_count?: number
          title?: string
          updated_at?: string
          user_id?: string
          views_count?: number
          village_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "village_discussions_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      village_events: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          event_date: string
          event_type: string
          id: string
          is_public: boolean
          location: string | null
          max_attendees: number | null
          organizer_id: string
          status: string
          title: string
          updated_at: string
          village_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_date: string
          event_type?: string
          id?: string
          is_public?: boolean
          location?: string | null
          max_attendees?: number | null
          organizer_id: string
          status?: string
          title: string
          updated_at?: string
          village_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_date?: string
          event_type?: string
          id?: string
          is_public?: boolean
          location?: string | null
          max_attendees?: number | null
          organizer_id?: string
          status?: string
          title?: string
          updated_at?: string
          village_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "village_events_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      village_leaders: {
        Row: {
          accessibility_rating: number | null
          achievements: string[] | null
          bio: string | null
          created_at: string
          development_rating: number | null
          end_year: number | null
          id: string
          integrity_rating: number | null
          is_current: boolean | null
          leader_name: string
          leader_type: string
          photo_url: string | null
          start_year: number | null
          total_ratings: number | null
          updated_at: string
          village_id: string
          years_in_power: number | null
        }
        Insert: {
          accessibility_rating?: number | null
          achievements?: string[] | null
          bio?: string | null
          created_at?: string
          development_rating?: number | null
          end_year?: number | null
          id?: string
          integrity_rating?: number | null
          is_current?: boolean | null
          leader_name: string
          leader_type: string
          photo_url?: string | null
          start_year?: number | null
          total_ratings?: number | null
          updated_at?: string
          village_id: string
          years_in_power?: number | null
        }
        Update: {
          accessibility_rating?: number | null
          achievements?: string[] | null
          bio?: string | null
          created_at?: string
          development_rating?: number | null
          end_year?: number | null
          id?: string
          integrity_rating?: number | null
          is_current?: boolean | null
          leader_name?: string
          leader_type?: string
          photo_url?: string | null
          start_year?: number | null
          total_ratings?: number | null
          updated_at?: string
          village_id?: string
          years_in_power?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "village_leaders_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      village_memberships: {
        Row: {
          created_at: string
          id: string
          is_verified: boolean | null
          membership_type: string | null
          user_id: string
          verification_method: string | null
          village_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_verified?: boolean | null
          membership_type?: string | null
          user_id: string
          verification_method?: string | null
          village_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_verified?: boolean | null
          membership_type?: string | null
          user_id?: string
          verification_method?: string | null
          village_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "village_memberships_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      village_petitions: {
        Row: {
          created_at: string
          created_by: string
          documents_urls: string[] | null
          end_date: string | null
          id: string
          is_moderated: boolean | null
          moderation_notes: string | null
          petition_body: string
          petition_status: string
          petition_title: string
          resolution_details: string | null
          signatures_count: number | null
          start_date: string
          target_audience: string
          updated_at: string
          village_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          documents_urls?: string[] | null
          end_date?: string | null
          id?: string
          is_moderated?: boolean | null
          moderation_notes?: string | null
          petition_body: string
          petition_status?: string
          petition_title: string
          resolution_details?: string | null
          signatures_count?: number | null
          start_date?: string
          target_audience: string
          updated_at?: string
          village_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          documents_urls?: string[] | null
          end_date?: string | null
          id?: string
          is_moderated?: boolean | null
          moderation_notes?: string | null
          petition_body?: string
          petition_status?: string
          petition_title?: string
          resolution_details?: string | null
          signatures_count?: number | null
          start_date?: string
          target_audience?: string
          updated_at?: string
          village_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "village_petitions_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      village_photos: {
        Row: {
          caption: string | null
          created_at: string
          created_by: string | null
          date_taken: string | null
          id: string
          is_verified: boolean | null
          photo_type: string | null
          photo_url: string
          photographer_name: string | null
          village_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          created_by?: string | null
          date_taken?: string | null
          id?: string
          is_verified?: boolean | null
          photo_type?: string | null
          photo_url: string
          photographer_name?: string | null
          village_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          created_by?: string | null
          date_taken?: string | null
          id?: string
          is_verified?: boolean | null
          photo_type?: string | null
          photo_url?: string
          photographer_name?: string | null
          village_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "village_photos_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      village_projects: {
        Row: {
          community_feedback: string | null
          created_at: string
          created_by: string | null
          description: string | null
          funding_amount: number | null
          funding_source: string | null
          id: string
          photos: string[] | null
          project_name: string
          project_status: string
          project_type: string
          reports_urls: string[] | null
          updated_at: string
          village_id: string
          year_completed: number | null
          year_started: number | null
        }
        Insert: {
          community_feedback?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          funding_amount?: number | null
          funding_source?: string | null
          id?: string
          photos?: string[] | null
          project_name: string
          project_status: string
          project_type: string
          reports_urls?: string[] | null
          updated_at?: string
          village_id: string
          year_completed?: number | null
          year_started?: number | null
        }
        Update: {
          community_feedback?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          funding_amount?: number | null
          funding_source?: string | null
          id?: string
          photos?: string[] | null
          project_name?: string
          project_status?: string
          project_type?: string
          reports_urls?: string[] | null
          updated_at?: string
          village_id?: string
          year_completed?: number | null
          year_started?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "village_projects_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      village_ratings: {
        Row: {
          achievements_score: number | null
          civic_participation_score: number | null
          comment: string | null
          created_at: string
          diaspora_engagement_score: number | null
          economic_activity_score: number | null
          education_score: number | null
          governance_score: number | null
          health_score: number | null
          id: string
          infrastructure_score: number | null
          overall_rating: number | null
          peace_security_score: number | null
          social_spirit_score: number | null
          updated_at: string
          user_id: string
          village_id: string
        }
        Insert: {
          achievements_score?: number | null
          civic_participation_score?: number | null
          comment?: string | null
          created_at?: string
          diaspora_engagement_score?: number | null
          economic_activity_score?: number | null
          education_score?: number | null
          governance_score?: number | null
          health_score?: number | null
          id?: string
          infrastructure_score?: number | null
          overall_rating?: number | null
          peace_security_score?: number | null
          social_spirit_score?: number | null
          updated_at?: string
          user_id: string
          village_id: string
        }
        Update: {
          achievements_score?: number | null
          civic_participation_score?: number | null
          comment?: string | null
          created_at?: string
          diaspora_engagement_score?: number | null
          economic_activity_score?: number | null
          education_score?: number | null
          governance_score?: number | null
          health_score?: number | null
          id?: string
          infrastructure_score?: number | null
          overall_rating?: number | null
          peace_security_score?: number | null
          social_spirit_score?: number | null
          updated_at?: string
          user_id?: string
          village_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "village_ratings_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      village_recommendations: {
        Row: {
          confidence_score: number | null
          created_at: string
          expires_at: string | null
          id: string
          is_clicked: boolean | null
          is_dismissed: boolean | null
          metadata: Json | null
          reason: string | null
          recommendation_type: string
          user_id: string
          village_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_clicked?: boolean | null
          is_dismissed?: boolean | null
          metadata?: Json | null
          reason?: string | null
          recommendation_type: string
          user_id: string
          village_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_clicked?: boolean | null
          is_dismissed?: boolean | null
          metadata?: Json | null
          reason?: string | null
          recommendation_type?: string
          user_id?: string
          village_id?: string
        }
        Relationships: []
      }
      village_tags: {
        Row: {
          created_at: string
          id: string
          relevance_score: number | null
          tag_id: string
          village_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          relevance_score?: number | null
          tag_id: string
          village_id: string
        }
        Update: {
          created_at?: string
          id?: string
          relevance_score?: number | null
          tag_id?: string
          village_id?: string
        }
        Relationships: []
      }
      villages: {
        Row: {
          achievements_score: number | null
          civic_participation_score: number | null
          community_chat_link: string | null
          created_at: string
          created_by: string | null
          diaspora_engagement_score: number | null
          division: string
          economic_activity_score: number | null
          education_score: number | null
          ethnic_groups: string[] | null
          facebook_link: string | null
          founding_story: string | null
          governance_score: number | null
          gps_latitude: number | null
          gps_longitude: number | null
          health_score: number | null
          id: string
          infrastructure_score: number | null
          is_verified: boolean | null
          migration_legend: string | null
          notable_events: string | null
          oral_traditions: string | null
          overall_rating: number | null
          peace_security_score: number | null
          population_estimate: number | null
          region: string
          social_spirit_score: number | null
          sons_daughters_count: number | null
          subdivision: string
          total_ratings_count: number | null
          totem_symbol: string | null
          traditional_languages: string[] | null
          updated_at: string
          verification_notes: string | null
          view_count: number | null
          village_motto: string | null
          village_name: string
          whatsapp_link: string | null
          year_founded: number | null
        }
        Insert: {
          achievements_score?: number | null
          civic_participation_score?: number | null
          community_chat_link?: string | null
          created_at?: string
          created_by?: string | null
          diaspora_engagement_score?: number | null
          division: string
          economic_activity_score?: number | null
          education_score?: number | null
          ethnic_groups?: string[] | null
          facebook_link?: string | null
          founding_story?: string | null
          governance_score?: number | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          health_score?: number | null
          id?: string
          infrastructure_score?: number | null
          is_verified?: boolean | null
          migration_legend?: string | null
          notable_events?: string | null
          oral_traditions?: string | null
          overall_rating?: number | null
          peace_security_score?: number | null
          population_estimate?: number | null
          region: string
          social_spirit_score?: number | null
          sons_daughters_count?: number | null
          subdivision: string
          total_ratings_count?: number | null
          totem_symbol?: string | null
          traditional_languages?: string[] | null
          updated_at?: string
          verification_notes?: string | null
          view_count?: number | null
          village_motto?: string | null
          village_name: string
          whatsapp_link?: string | null
          year_founded?: number | null
        }
        Update: {
          achievements_score?: number | null
          civic_participation_score?: number | null
          community_chat_link?: string | null
          created_at?: string
          created_by?: string | null
          diaspora_engagement_score?: number | null
          division?: string
          economic_activity_score?: number | null
          education_score?: number | null
          ethnic_groups?: string[] | null
          facebook_link?: string | null
          founding_story?: string | null
          governance_score?: number | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          health_score?: number | null
          id?: string
          infrastructure_score?: number | null
          is_verified?: boolean | null
          migration_legend?: string | null
          notable_events?: string | null
          oral_traditions?: string | null
          overall_rating?: number | null
          peace_security_score?: number | null
          population_estimate?: number | null
          region?: string
          social_spirit_score?: number | null
          sons_daughters_count?: number | null
          subdivision?: string
          total_ratings_count?: number | null
          totem_symbol?: string | null
          traditional_languages?: string[] | null
          updated_at?: string
          verification_notes?: string | null
          view_count?: number | null
          village_motto?: string | null
          village_name?: string
          whatsapp_link?: string | null
          year_founded?: number | null
        }
        Relationships: []
      }
      volunteer_applications: {
        Row: {
          application_status: string
          applied_at: string
          id: string
          message: string | null
          opportunity_id: string
          reviewed_at: string | null
          user_id: string
        }
        Insert: {
          application_status?: string
          applied_at?: string
          id?: string
          message?: string | null
          opportunity_id: string
          reviewed_at?: string | null
          user_id: string
        }
        Update: {
          application_status?: string
          applied_at?: string
          id?: string
          message?: string | null
          opportunity_id?: string
          reviewed_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "volunteer_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_opportunities: {
        Row: {
          category: string
          contact_email: string
          contact_phone: string | null
          created_at: string
          description: string
          end_date: string | null
          id: string
          is_recurring: boolean
          location: string
          organization: string
          skills_required: string[] | null
          spots_available: number | null
          spots_filled: number
          start_date: string | null
          status: string
          time_commitment: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          contact_email: string
          contact_phone?: string | null
          created_at?: string
          description: string
          end_date?: string | null
          id?: string
          is_recurring?: boolean
          location: string
          organization: string
          skills_required?: string[] | null
          spots_available?: number | null
          spots_filled?: number
          start_date?: string | null
          status?: string
          time_commitment: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          contact_email?: string
          contact_phone?: string | null
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          is_recurring?: boolean
          location?: string
          organization?: string
          skills_required?: string[] | null
          spots_available?: number | null
          spots_filled?: number
          start_date?: string | null
          status?: string
          time_commitment?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      voter_suppression_reports: {
        Row: {
          coordinates: Json | null
          created_at: string | null
          description: string
          election_calendar_id: string | null
          estimated_affected_voters: number | null
          evidence_urls: string[] | null
          id: string
          incident_datetime: string
          location_city: string | null
          location_region: string
          report_type: string
          reported_at: string | null
          reporter_contact: string | null
          reporter_type: string | null
          resolution_status: string | null
          response_actions: string[] | null
          severity_level: string | null
          title: string
          updated_at: string | null
          verification_status: string | null
          witness_reports: string[] | null
        }
        Insert: {
          coordinates?: Json | null
          created_at?: string | null
          description: string
          election_calendar_id?: string | null
          estimated_affected_voters?: number | null
          evidence_urls?: string[] | null
          id?: string
          incident_datetime: string
          location_city?: string | null
          location_region: string
          report_type: string
          reported_at?: string | null
          reporter_contact?: string | null
          reporter_type?: string | null
          resolution_status?: string | null
          response_actions?: string[] | null
          severity_level?: string | null
          title: string
          updated_at?: string | null
          verification_status?: string | null
          witness_reports?: string[] | null
        }
        Update: {
          coordinates?: Json | null
          created_at?: string | null
          description?: string
          election_calendar_id?: string | null
          estimated_affected_voters?: number | null
          evidence_urls?: string[] | null
          id?: string
          incident_datetime?: string
          location_city?: string | null
          location_region?: string
          report_type?: string
          reported_at?: string | null
          reporter_contact?: string | null
          reporter_type?: string | null
          resolution_status?: string | null
          response_actions?: string[] | null
          severity_level?: string | null
          title?: string
          updated_at?: string | null
          verification_status?: string | null
          witness_reports?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "voter_suppression_reports_election_calendar_id_fkey"
            columns: ["election_calendar_id"]
            isOneToOne: false
            referencedRelation: "election_calendars"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_credits: {
        Row: {
          created_at: string | null
          credit_balance: number
          id: string
          total_earned: number
          total_spent: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credit_balance?: number
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credit_balance?: number
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_message_logs: {
        Row: {
          delivered_at: string | null
          delivery_status: string | null
          error_message: string | null
          id: string
          message_content: string | null
          metadata: Json | null
          phone_number: string
          sendchamp_message_id: string | null
          sent_at: string | null
          status: string | null
          template_name: string | null
          user_id: string
        }
        Insert: {
          delivered_at?: string | null
          delivery_status?: string | null
          error_message?: string | null
          id?: string
          message_content?: string | null
          metadata?: Json | null
          phone_number: string
          sendchamp_message_id?: string | null
          sent_at?: string | null
          status?: string | null
          template_name?: string | null
          user_id: string
        }
        Update: {
          delivered_at?: string | null
          delivery_status?: string | null
          error_message?: string | null
          id?: string
          message_content?: string | null
          metadata?: Json | null
          phone_number?: string
          sendchamp_message_id?: string | null
          sent_at?: string | null
          status?: string | null
          template_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_templates: {
        Row: {
          approval_status: string | null
          content: string
          created_at: string
          event_type:
            | Database["public"]["Enums"]["notification_event_type"]
            | null
          id: string
          is_active: boolean
          template_id: string | null
          template_name: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          approval_status?: string | null
          content: string
          created_at?: string
          event_type?:
            | Database["public"]["Enums"]["notification_event_type"]
            | null
          id?: string
          is_active?: boolean
          template_id?: string | null
          template_name: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          approval_status?: string | null
          content?: string
          created_at?: string
          event_type?:
            | Database["public"]["Enums"]["notification_event_type"]
            | null
          id?: string
          is_active?: boolean
          template_id?: string | null
          template_name?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      election_forecast_summary: {
        Row: {
          last_updated: string | null
          national_average: number | null
          party_name: string | null
          regions_leading: number | null
          weighted_average: number | null
        }
        Relationships: []
      }
      poll_regional_results: {
        Row: {
          option_index: number | null
          percentage: number | null
          poll_id: string | null
          region: string | null
          vote_count: number | null
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
    }
    Functions: {
      add_profile_activity: {
        Args: {
          p_profile_id: string
          p_activity_type: string
          p_activity_title: string
          p_activity_description?: string
          p_activity_data?: Json
          p_is_public?: boolean
        }
        Returns: string
      }
      analyze_dev_request: {
        Args: {
          p_request_id: string
          p_prompt: string
          p_request_type?: string
        }
        Returns: Json
      }
      analyze_media_content: {
        Args: {
          p_source_id: string
          p_content_url: string
          p_title?: string
          p_content_text?: string
        }
        Returns: Json
      }
      analyze_plugin_similarity: {
        Args: { p_request_text: string; p_plugin_name?: string }
        Returns: Json
      }
      analyze_prompt_before_execution: {
        Args: { p_prompt_content: string; p_prompt_title?: string }
        Returns: Json
      }
      analyze_strategy_problem: {
        Args: {
          p_problem_id: string
          p_problem_description: string
          p_category?: string
        }
        Returns: Json
      }
      approve_and_publish_poll_suggestion: {
        Args: {
          p_suggestion_id: string
          p_admin_id: string
          p_publish_immediately?: boolean
        }
        Returns: string
      }
      approve_artist_application: {
        Args: { application_id: string }
        Returns: Json
      }
      auto_assign_moderator: {
        Args: { p_submission_id: string; p_region: string }
        Returns: string
      }
      auto_issue_certificates_for_event: {
        Args: { event_id_param: string }
        Returns: number
      }
      award_fan_points: {
        Args: {
          p_fan_id: string
          p_activity_type: Database["public"]["Enums"]["fan_activity_type"]
          p_reference_id?: string
          p_reference_name?: string
        }
        Returns: number
      }
      award_moderator_badge: {
        Args: {
          p_moderator_id: string
          p_badge_type: Database["public"]["Enums"]["badge_type"]
          p_description?: string
        }
        Returns: string
      }
      award_points: {
        Args: {
          p_user_id: string
          p_activity_type: string
          p_activity_reference_id?: string
          p_description?: string
        }
        Returns: number
      }
      calculate_agent_performance: {
        Args: { p_agent_id: string; p_date?: string }
        Returns: Json
      }
      calculate_award_scores: {
        Args: { p_nomination_id: string }
        Returns: undefined
      }
      calculate_civic_influence_score: {
        Args: { p_profile_id: string }
        Returns: number
      }
      calculate_connection_fee: {
        Args: {
          p_company_size: Database["public"]["Enums"]["company_size"]
          p_campaign_type: Database["public"]["Enums"]["campaign_type"]
        }
        Returns: number
      }
      calculate_contribution_level: {
        Args: { p_user_id: string }
        Returns: string
      }
      calculate_engagement_metrics: {
        Args: { p_start_date?: string; p_end_date?: string }
        Returns: Json
      }
      calculate_engagement_score: {
        Args: { p_institution_id: string; p_period_days?: number }
        Returns: number
      }
      calculate_fix_trust_score: {
        Args: { p_fix_type: string }
        Returns: number
      }
      calculate_plugin_risk_score: {
        Args: { p_plugin_id: string }
        Returns: number
      }
      calculate_politician_engagement_score: {
        Args: { p_politician_id: string }
        Returns: Json
      }
      calculate_project_corruption_index: {
        Args: { p_project_id: string }
        Returns: number
      }
      calculate_prompt_similarity: {
        Args: { p_source_content: string; p_target_content: string }
        Returns: number
      }
      check_claim_renewals: {
        Args: Record<PropertyKey, never>
        Returns: {
          renewals_processed: number
          reminders_sent: number
        }[]
      }
      check_constitutional_compliance: {
        Args: { p_document_id: string; p_document_text: string }
        Returns: Json
      }
      check_debt_thresholds: {
        Args: { p_debt_record_id: string }
        Returns: {
          alerts_created: number
        }[]
      }
      check_performance_milestones: {
        Args: {
          p_artist_id: string
          p_track_id: string
          p_platform_type: Database["public"]["Enums"]["platform_type"]
          p_stream_count: number
        }
        Returns: number
      }
      cleanup_expired_media: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_expired_polls: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_profile_activities: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      compare_debt_data_changes: {
        Args: { p_source_id: string; p_current_result_id: string }
        Returns: Json
      }
      compare_snapshots: {
        Args: { p_snapshot_a_id: string; p_snapshot_b_id: string }
        Returns: string
      }
      convert_points_to_credit: {
        Args: { p_user_id: string; p_points_amount: number }
        Returns: Json
      }
      create_artist_notification: {
        Args: {
          p_artist_id: string
          p_user_id: string
          p_notification_type: Database["public"]["Enums"]["notification_type"]
          p_title: string
          p_message: string
          p_data?: Json
          p_priority?: string
        }
        Returns: string
      }
      create_claim_notification: {
        Args: {
          p_claim_id: string
          p_recipient_id: string
          p_notification_type: string
          p_title: string
          p_message: string
        }
        Returns: string
      }
      create_fan_notification: {
        Args: {
          p_fan_id: string
          p_type: string
          p_title: string
          p_message: string
          p_action_url?: string
        }
        Returns: string
      }
      create_media_alert: {
        Args: {
          p_analysis_id: string
          p_alert_type: string
          p_alert_title: string
          p_alert_description?: string
          p_severity?: Database["public"]["Enums"]["threat_level"]
        }
        Returns: string
      }
      create_moderator_notification: {
        Args: {
          p_moderator_id: string
          p_type: string
          p_title: string
          p_message: string
          p_action_url?: string
          p_priority?: string
        }
        Returns: string
      }
      create_system_snapshot: {
        Args: {
          p_snapshot_name: string
          p_snapshot_type?: string
          p_description?: string
          p_tags?: string[]
        }
        Returns: string
      }
      detect_data_trends: {
        Args: { p_category: string; p_time_window?: unknown }
        Returns: {
          trend_name: string
          momentum_score: number
          confidence_level: number
        }[]
      }
      detect_fraud_patterns: {
        Args: { p_poll_id: string }
        Returns: undefined
      }
      detect_official_changes: {
        Args: Record<PropertyKey, never>
        Returns: {
          change_detected: boolean
          changes_count: number
        }[]
      }
      detect_sentiment_spikes: {
        Args: { p_timeline_id: string; p_threshold?: number }
        Returns: Json
      }
      detect_timeline_slippage: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      enable_politician_poll_creation: {
        Args: { p_politician_id: string; p_admin_id: string }
        Returns: boolean
      }
      execute_civic_mission: {
        Args: { p_mission_id: string }
        Returns: Json
      }
      execute_integration: {
        Args: { p_integration_id: string }
        Returns: Json
      }
      flag_behavioral_inconsistency: {
        Args: {
          p_entity_type: string
          p_entity_id: string
          p_entity_name: string
          p_inconsistency_details: string
          p_evidence_data?: Json
          p_severity?: string
        }
        Returns: string
      }
      generate_artist_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_audio_fingerprint: {
        Args: { p_track_id: string; p_audio_url: string }
        Returns: string
      }
      generate_automated_alert: {
        Args: {
          p_alert_type: string
          p_title: string
          p_message: string
          p_severity?: Database["public"]["Enums"]["alert_severity"]
        }
        Returns: string
      }
      generate_civic_predictions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      generate_debt_predictions: {
        Args: { p_years_ahead?: number }
        Returns: {
          predictions_created: number
        }[]
      }
      generate_election_forecast: {
        Args: Record<PropertyKey, never>
        Returns: {
          forecasts_created: number
          regions_processed: number
          parties_processed: number
        }[]
      }
      generate_qr_data: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_ticket_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_track_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_vendor_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_verification_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_agent_suggestions: {
        Args: Record<PropertyKey, never>
        Returns: {
          agent_id: string
          agent_name: string
          suggestion_type: string
          suggestion_message: string
          priority: number
        }[]
      }
      get_autonomous_config: {
        Args: { p_config_key?: string }
        Returns: Json
      }
      get_billionaire_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_civic_strategy_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_corruption_statistics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_economic_summary: {
        Args: { p_region?: string }
        Returns: Json
      }
      get_engagement_statistics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_integrity_monitor_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_legal_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_mesh_status_overview: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_moderation_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_moderator_stats: {
        Args: { p_moderator_id: string }
        Returns: Json
      }
      get_module_visibility: {
        Args: { p_user_role?: string; p_region?: string }
        Returns: {
          module_name: string
          is_visible: boolean
          custom_settings: Json
        }[]
      }
      get_pan_africa_config: {
        Args: { p_config_key?: string }
        Returns: Json
      }
      get_revenue_dashboard: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_sentiment_timeline: {
        Args: {
          p_subject_type?: string
          p_subject_name?: string
          p_start_date?: string
          p_end_date?: string
          p_region?: string
          p_age_group?: string
        }
        Returns: Json
      }
      get_sync_guard_status: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_village_analytics_summary: {
        Args: { p_village_id: string; p_days?: number }
        Returns: Json
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      learn_from_manual_fix: {
        Args: {
          p_file_path: string
          p_original_code: string
          p_fixed_code: string
          p_problem_description: string
        }
        Returns: string
      }
      log_autonomous_operation: {
        Args: {
          p_operation_type: string
          p_target_module?: string
          p_risk_score?: number
          p_operation_details?: Json
          p_human_approval_required?: boolean
        }
        Returns: string
      }
      log_prompt_execution: {
        Args: {
          p_prompt_content: string
          p_prompt_title: string
          p_prompt_phase?: string
          p_modules_affected?: string[]
          p_outcome?: string
        }
        Returns: string
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
      mark_notification_read: {
        Args: { p_notification_id: string }
        Returns: boolean
      }
      notify_artist_fans: {
        Args: {
          p_artist_user_id: string
          p_update_type?: string
          p_new_song_title?: string
          p_event_name?: string
          p_award_name?: string
        }
        Returns: number
      }
      process_legal_document: {
        Args: {
          p_document_id: string
          p_processing_type: string
          p_result_data?: Json
        }
        Returns: string
      }
      process_wallet_transaction: {
        Args: {
          p_fan_id: string
          p_transaction_type: Database["public"]["Enums"]["transaction_type"]
          p_amount_fcfa: number
          p_description: string
          p_reference_id?: string
        }
        Returns: string
      }
      purchase_badge: {
        Args: { p_user_id: string; p_badge_id: string }
        Returns: Json
      }
      register_new_feature: {
        Args: {
          p_feature_name: string
          p_feature_type: string
          p_version_tag?: string
          p_file_paths?: string[]
          p_dependencies?: string[]
          p_description?: string
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
      reject_poll_suggestion: {
        Args: { p_suggestion_id: string; p_admin_id: string; p_reason?: string }
        Returns: boolean
      }
      run_ashen_simulation: {
        Args: {
          p_test_id?: string
          p_device_type?: string
          p_device_model?: string
        }
        Returns: string
      }
      scan_for_feature_conflicts: {
        Args: {
          p_feature_name: string
          p_feature_type?: string
          p_description?: string
        }
        Returns: Json
      }
      schedule_background_healing: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      schedule_debt_refresh: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      search_artists: {
        Args: {
          p_stage_name?: string
          p_social_url?: string
          p_region?: string
        }
        Returns: {
          id: string
          stage_name: string
          real_name: string
          bio_short: string
          profile_photo_url: string
          region: string
          application_status: string
          similarity_score: number
        }[]
      }
      search_villages: {
        Args: {
          p_query: string
          p_region?: string
          p_tags?: string[]
          p_min_rating?: number
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          id: string
          village_name: string
          region: string
          division: string
          subdivision: string
          overall_rating: number
          sons_daughters_count: number
          view_count: number
          is_verified: boolean
          total_ratings_count: number
          infrastructure_score: number
          education_score: number
          health_score: number
          diaspora_engagement_score: number
          relevance_score: number
        }[]
      }
      send_notification: {
        Args: {
          p_user_id: string
          p_type: Database["public"]["Enums"]["notification_type"]
          p_title: string
          p_message: string
          p_priority?: Database["public"]["Enums"]["notification_priority"]
          p_data?: Json
          p_action_url?: string
          p_icon?: string
          p_expires_at?: string
        }
        Returns: string
      }
      setup_renewal_cron_job: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      sync_platform_data: {
        Args: { p_connection_id: string }
        Returns: Json
      }
      track_user_poll_creation: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      update_billionaire_rankings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_claim_status: {
        Args: {
          p_claim_id: string
          p_new_status: string
          p_admin_notes?: string
          p_reviewed_by?: string
        }
        Returns: undefined
      }
      update_live_polling_metrics: {
        Args: {
          p_session_id: string
          p_active_users?: number
          p_new_participant?: boolean
        }
        Returns: undefined
      }
      update_plugin_request_status: {
        Args: {
          p_request_id: string
          p_status: string
          p_error_details?: string
        }
        Returns: boolean
      }
      update_politician_ratings_from_poll: {
        Args: {
          p_poll_id: string
          p_politician_id: string
          p_rating_impact?: number
        }
        Returns: Json
      }
      update_politician_term_status: {
        Args: {
          p_politician_id: string
          p_new_status: string
          p_reason?: string
        }
        Returns: boolean
      }
      update_profile_analytics: {
        Args: { p_profile_id: string }
        Returns: undefined
      }
      update_trending_search: {
        Args: { p_query: string }
        Returns: undefined
      }
      validate_password_strength: {
        Args: { password: string }
        Returns: Json
      }
      validate_politician_terms: {
        Args: Record<PropertyKey, never>
        Returns: {
          politician_id: string
          name: string
          current_status: string
          needs_update: boolean
          days_since_term_end: number
        }[]
      }
    }
    Enums: {
      alert_severity: "low" | "medium" | "high" | "critical"
      analytics_data_type:
        | "poll_data"
        | "sentiment_data"
        | "engagement_data"
        | "performance_data"
        | "civic_education_data"
        | "user_behavior_data"
      app_role:
        | "admin"
        | "moderator"
        | "verified_politician"
        | "verified_vendor"
        | "user"
        | "village_moderator"
        | "subdivision_moderator"
        | "regional_moderator"
        | "national_civic_lead"
      application_status:
        | "submitted"
        | "under_review"
        | "interview_scheduled"
        | "approved"
        | "rejected"
      application_tier: "bronze" | "silver" | "gold"
      audio_format: "mp3" | "wav" | "flac"
      award_status:
        | "draft"
        | "nomination_open"
        | "voting_open"
        | "voting_closed"
        | "results_published"
      badge_type:
        | "fan_of_month"
        | "top_supporter"
        | "early_adopter"
        | "voting_champion"
        | "event_attendee"
      bias_level: "none" | "mild" | "moderate" | "high"
      brand_ambassador_status: "available" | "not_available" | "negotiable"
      campaign_type:
        | "event"
        | "product_launch"
        | "awareness"
        | "sponsorship"
        | "content_creation"
      certificate_status: "pending" | "issued" | "claimed" | "revoked"
      certificate_template: "modern" | "classic" | "official"
      certificate_type:
        | "participation"
        | "speaker"
        | "organizer"
        | "education_completion"
      check_in_status: "pending" | "checked_in" | "no_show"
      civic_entity_type:
        | "politician"
        | "ministry"
        | "government_agency"
        | "political_party"
        | "civil_society_org"
        | "media_outlet"
        | "election_event"
        | "policy_document"
        | "government_statement"
      civic_event_type:
        | "civic"
        | "campaign"
        | "education"
        | "protest"
        | "music"
        | "business"
        | "youth"
        | "community"
        | "government"
        | "religious"
      claim_status: "unclaimed" | "pending" | "approved" | "rejected"
      company_size: "startup" | "sme" | "large_corp"
      company_status: "pending" | "approved" | "suspended" | "rejected"
      company_type: "sole_proprietor" | "limited_company" | "public_company"
      connection_status:
        | "pending"
        | "paid"
        | "connected"
        | "completed"
        | "cancelled"
      contract_type: "branding" | "exclusivity" | "nda" | "general"
      corruption_tag: "verified" | "alleged" | "cleared" | "under_investigation"
      crawl_status: "scheduled" | "running" | "completed" | "failed" | "paused"
      education_content_type:
        | "article"
        | "video"
        | "infographic"
        | "quiz"
        | "interactive"
        | "webinar"
      education_difficulty: "beginner" | "intermediate" | "advanced"
      engagement_activity_type:
        | "public_appearance"
        | "social_media_post"
        | "parliament_attendance"
        | "community_visit"
        | "media_interview"
        | "town_hall"
        | "project_launch"
        | "policy_statement"
        | "citizen_interaction"
        | "volunteer_work"
      engagement_category:
        | "communication"
        | "participation"
        | "constituency_outreach"
        | "public_visibility"
        | "policy_advocacy"
      event_status:
        | "draft"
        | "pending"
        | "approved"
        | "rejected"
        | "cancelled"
        | "completed"
        | "published"
        | "postponed"
        | "ongoing"
      fan_activity_type:
        | "stream"
        | "vote"
        | "donation"
        | "purchase"
        | "event_attendance"
        | "review"
        | "share"
      funding_source_type:
        | "national_budget"
        | "world_bank"
        | "afdb"
        | "eu"
        | "china"
        | "private"
        | "ngo"
        | "other"
      hospital_ownership:
        | "government"
        | "private"
        | "community"
        | "mission"
        | "ngo"
      hospital_type:
        | "general"
        | "private_clinic"
        | "district"
        | "diagnostic_center"
        | "emergency"
        | "traditional"
      institution_claim_type: "school" | "hospital" | "pharmacy"
      institution_type:
        | "presidency"
        | "parliament"
        | "judiciary"
        | "police"
        | "electoral_commission"
        | "state_media"
        | "public_health"
        | "education_ministry"
        | "local_councils"
        | "school"
        | "hospital"
        | "pharmacy"
        | "village"
      media_source_type:
        | "news_website"
        | "youtube_channel"
        | "podcast"
        | "radio_stream"
        | "blog"
        | "social_feed"
      moderation_action:
        | "approved"
        | "flagged"
        | "removed"
        | "quarantine"
        | "escalated"
      moderator_role:
        | "admin"
        | "senior_moderator"
        | "regional_moderator"
        | "village_moderator"
      moderator_status:
        | "pending"
        | "approved"
        | "rejected"
        | "suspended"
        | "inactive"
      monitoring_status: "active" | "paused" | "error" | "maintenance"
      nomination_status: "pending" | "approved" | "rejected"
      notification_channel: "email" | "in_app" | "push" | "sms" | "whatsapp"
      notification_event_type:
        | "artist_profile_submitted"
        | "artist_verified"
        | "artist_denied"
        | "artist_new_follower"
        | "artist_award_nomination"
        | "artist_award_win"
        | "new_song_uploaded"
        | "song_milestone_reached"
        | "new_event_published"
        | "ticket_purchased"
        | "event_reminder_24h"
        | "event_cancelled"
        | "voting_opens"
        | "voting_closes"
      notification_priority: "low" | "moderate" | "critical"
      notification_status:
        | "pending"
        | "sent"
        | "delivered"
        | "failed"
        | "retrying"
      notification_type:
        | "copyright_violation"
        | "stream_milestone"
        | "viral_spike"
        | "award_nomination"
        | "tip_received"
        | "fan_comment"
        | "chart_appearance"
        | "platform_sync_error"
      organizer_type:
        | "verified_user"
        | "government_institution"
        | "political_party"
        | "company"
        | "school"
        | "ngo"
        | "artist"
        | "event_organizer"
      payment_method: "mobile_money" | "card" | "paypal" | "crypto"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      performance_metric_type:
        | "attendance"
        | "voting_record"
        | "bill_sponsorship"
        | "committee_activity"
        | "public_engagement"
        | "transparency"
      pharmacy_type:
        | "registered_pharmacy"
        | "otc_store"
        | "herbal_shop"
        | "hospital_linked"
      platform_type:
        | "spotify"
        | "youtube"
        | "apple_music"
        | "boomplay"
        | "audiomack"
        | "deezer"
        | "soundcloud"
        | "tiktok"
        | "facebook"
        | "instagram"
      poll_security_level:
        | "open"
        | "verified_only"
        | "invite_only"
        | "region_limited"
      prediction_type:
        | "sentiment_trend"
        | "engagement_forecast"
        | "performance_prediction"
        | "policy_outcome"
        | "voter_turnout"
        | "civic_participation"
      pricing_type: "free" | "paid" | "streaming_only"
      product_type:
        | "song"
        | "album"
        | "ticket"
        | "merchandise"
        | "livestream"
        | "exclusive_content"
      profile_type:
        | "normal_user"
        | "politician"
        | "political_party"
        | "artist"
        | "company"
        | "government_institution"
        | "school"
        | "ngo"
        | "journalist"
        | "activist"
        | "camerpulse_official"
        | "moderator"
      project_sector:
        | "education"
        | "health"
        | "infrastructure"
        | "agriculture"
        | "energy"
        | "water_sanitation"
        | "transport"
        | "telecommunications"
        | "environment"
        | "social_protection"
        | "governance"
        | "other"
      project_status:
        | "planned"
        | "in_progress"
        | "completed"
        | "paused"
        | "failed"
        | "abandoned"
      release_status:
        | "draft"
        | "pending_review"
        | "approved"
        | "rejected"
        | "published"
      report_type:
        | "daily_summary"
        | "weekly_analysis"
        | "monthly_report"
        | "quarterly_review"
        | "annual_overview"
        | "custom_analysis"
      reputation_badge: "excellent" | "trusted" | "under_watch" | "flagged"
      royalty_status: "pending" | "processed" | "paid"
      rsvp_status: "interested" | "going" | "not_going"
      school_ownership:
        | "government"
        | "private"
        | "community"
        | "religious"
        | "ngo"
      school_type:
        | "nursery"
        | "primary"
        | "secondary"
        | "vocational"
        | "university"
        | "special"
      sentiment_value:
        | "very_negative"
        | "negative"
        | "neutral"
        | "positive"
        | "very_positive"
      source_type:
        | "government_official"
        | "parliamentary"
        | "electoral_commission"
        | "state_media"
        | "independent_media"
        | "social_media_verified"
        | "civil_society"
        | "international_org"
        | "academic"
        | "unknown"
      stream_type:
        | "civic_activity"
        | "poll_results"
        | "sentiment_analysis"
        | "news_feed"
        | "government_updates"
        | "user_activity"
        | "system_metrics"
      submission_status:
        | "pending"
        | "approved"
        | "rejected"
        | "needs_clarification"
      threat_level: "low" | "medium" | "high" | "critical"
      ticket_type:
        | "regular"
        | "vip"
        | "vvip"
        | "livestream"
        | "student"
        | "early_bird"
      track_type: "single" | "ep" | "album"
      transaction_type:
        | "topup"
        | "purchase"
        | "tip"
        | "donation"
        | "subscription"
        | "refund"
      trend_type: "rising" | "declining" | "viral" | "anomaly" | "normal"
      user_type: "artist" | "fan" | "admin" | "event_attendee"
      verification_status: "pending" | "verified" | "rejected" | "under_review"
      verification_status_enum:
        | "pending"
        | "verified"
        | "rejected"
        | "flagged"
        | "missing"
      violation_status:
        | "detected"
        | "reported"
        | "whitelisted"
        | "resolved"
        | "dismissed"
      vote_type: "public" | "jury"
      wealth_source:
        | "technology"
        | "oil_gas"
        | "real_estate"
        | "banking_finance"
        | "agriculture"
        | "mining"
        | "telecommunications"
        | "manufacturing"
        | "retail_trade"
        | "construction"
        | "entertainment"
        | "healthcare"
        | "logistics"
        | "other"
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
      alert_severity: ["low", "medium", "high", "critical"],
      analytics_data_type: [
        "poll_data",
        "sentiment_data",
        "engagement_data",
        "performance_data",
        "civic_education_data",
        "user_behavior_data",
      ],
      app_role: [
        "admin",
        "moderator",
        "verified_politician",
        "verified_vendor",
        "user",
        "village_moderator",
        "subdivision_moderator",
        "regional_moderator",
        "national_civic_lead",
      ],
      application_status: [
        "submitted",
        "under_review",
        "interview_scheduled",
        "approved",
        "rejected",
      ],
      application_tier: ["bronze", "silver", "gold"],
      audio_format: ["mp3", "wav", "flac"],
      award_status: [
        "draft",
        "nomination_open",
        "voting_open",
        "voting_closed",
        "results_published",
      ],
      badge_type: [
        "fan_of_month",
        "top_supporter",
        "early_adopter",
        "voting_champion",
        "event_attendee",
      ],
      bias_level: ["none", "mild", "moderate", "high"],
      brand_ambassador_status: ["available", "not_available", "negotiable"],
      campaign_type: [
        "event",
        "product_launch",
        "awareness",
        "sponsorship",
        "content_creation",
      ],
      certificate_status: ["pending", "issued", "claimed", "revoked"],
      certificate_template: ["modern", "classic", "official"],
      certificate_type: [
        "participation",
        "speaker",
        "organizer",
        "education_completion",
      ],
      check_in_status: ["pending", "checked_in", "no_show"],
      civic_entity_type: [
        "politician",
        "ministry",
        "government_agency",
        "political_party",
        "civil_society_org",
        "media_outlet",
        "election_event",
        "policy_document",
        "government_statement",
      ],
      civic_event_type: [
        "civic",
        "campaign",
        "education",
        "protest",
        "music",
        "business",
        "youth",
        "community",
        "government",
        "religious",
      ],
      claim_status: ["unclaimed", "pending", "approved", "rejected"],
      company_size: ["startup", "sme", "large_corp"],
      company_status: ["pending", "approved", "suspended", "rejected"],
      company_type: ["sole_proprietor", "limited_company", "public_company"],
      connection_status: [
        "pending",
        "paid",
        "connected",
        "completed",
        "cancelled",
      ],
      contract_type: ["branding", "exclusivity", "nda", "general"],
      corruption_tag: ["verified", "alleged", "cleared", "under_investigation"],
      crawl_status: ["scheduled", "running", "completed", "failed", "paused"],
      education_content_type: [
        "article",
        "video",
        "infographic",
        "quiz",
        "interactive",
        "webinar",
      ],
      education_difficulty: ["beginner", "intermediate", "advanced"],
      engagement_activity_type: [
        "public_appearance",
        "social_media_post",
        "parliament_attendance",
        "community_visit",
        "media_interview",
        "town_hall",
        "project_launch",
        "policy_statement",
        "citizen_interaction",
        "volunteer_work",
      ],
      engagement_category: [
        "communication",
        "participation",
        "constituency_outreach",
        "public_visibility",
        "policy_advocacy",
      ],
      event_status: [
        "draft",
        "pending",
        "approved",
        "rejected",
        "cancelled",
        "completed",
        "published",
        "postponed",
        "ongoing",
      ],
      fan_activity_type: [
        "stream",
        "vote",
        "donation",
        "purchase",
        "event_attendance",
        "review",
        "share",
      ],
      funding_source_type: [
        "national_budget",
        "world_bank",
        "afdb",
        "eu",
        "china",
        "private",
        "ngo",
        "other",
      ],
      hospital_ownership: [
        "government",
        "private",
        "community",
        "mission",
        "ngo",
      ],
      hospital_type: [
        "general",
        "private_clinic",
        "district",
        "diagnostic_center",
        "emergency",
        "traditional",
      ],
      institution_claim_type: ["school", "hospital", "pharmacy"],
      institution_type: [
        "presidency",
        "parliament",
        "judiciary",
        "police",
        "electoral_commission",
        "state_media",
        "public_health",
        "education_ministry",
        "local_councils",
        "school",
        "hospital",
        "pharmacy",
        "village",
      ],
      media_source_type: [
        "news_website",
        "youtube_channel",
        "podcast",
        "radio_stream",
        "blog",
        "social_feed",
      ],
      moderation_action: [
        "approved",
        "flagged",
        "removed",
        "quarantine",
        "escalated",
      ],
      moderator_role: [
        "admin",
        "senior_moderator",
        "regional_moderator",
        "village_moderator",
      ],
      moderator_status: [
        "pending",
        "approved",
        "rejected",
        "suspended",
        "inactive",
      ],
      monitoring_status: ["active", "paused", "error", "maintenance"],
      nomination_status: ["pending", "approved", "rejected"],
      notification_channel: ["email", "in_app", "push", "sms", "whatsapp"],
      notification_event_type: [
        "artist_profile_submitted",
        "artist_verified",
        "artist_denied",
        "artist_new_follower",
        "artist_award_nomination",
        "artist_award_win",
        "new_song_uploaded",
        "song_milestone_reached",
        "new_event_published",
        "ticket_purchased",
        "event_reminder_24h",
        "event_cancelled",
        "voting_opens",
        "voting_closes",
      ],
      notification_priority: ["low", "moderate", "critical"],
      notification_status: [
        "pending",
        "sent",
        "delivered",
        "failed",
        "retrying",
      ],
      notification_type: [
        "copyright_violation",
        "stream_milestone",
        "viral_spike",
        "award_nomination",
        "tip_received",
        "fan_comment",
        "chart_appearance",
        "platform_sync_error",
      ],
      organizer_type: [
        "verified_user",
        "government_institution",
        "political_party",
        "company",
        "school",
        "ngo",
        "artist",
        "event_organizer",
      ],
      payment_method: ["mobile_money", "card", "paypal", "crypto"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      performance_metric_type: [
        "attendance",
        "voting_record",
        "bill_sponsorship",
        "committee_activity",
        "public_engagement",
        "transparency",
      ],
      pharmacy_type: [
        "registered_pharmacy",
        "otc_store",
        "herbal_shop",
        "hospital_linked",
      ],
      platform_type: [
        "spotify",
        "youtube",
        "apple_music",
        "boomplay",
        "audiomack",
        "deezer",
        "soundcloud",
        "tiktok",
        "facebook",
        "instagram",
      ],
      poll_security_level: [
        "open",
        "verified_only",
        "invite_only",
        "region_limited",
      ],
      prediction_type: [
        "sentiment_trend",
        "engagement_forecast",
        "performance_prediction",
        "policy_outcome",
        "voter_turnout",
        "civic_participation",
      ],
      pricing_type: ["free", "paid", "streaming_only"],
      product_type: [
        "song",
        "album",
        "ticket",
        "merchandise",
        "livestream",
        "exclusive_content",
      ],
      profile_type: [
        "normal_user",
        "politician",
        "political_party",
        "artist",
        "company",
        "government_institution",
        "school",
        "ngo",
        "journalist",
        "activist",
        "camerpulse_official",
        "moderator",
      ],
      project_sector: [
        "education",
        "health",
        "infrastructure",
        "agriculture",
        "energy",
        "water_sanitation",
        "transport",
        "telecommunications",
        "environment",
        "social_protection",
        "governance",
        "other",
      ],
      project_status: [
        "planned",
        "in_progress",
        "completed",
        "paused",
        "failed",
        "abandoned",
      ],
      release_status: [
        "draft",
        "pending_review",
        "approved",
        "rejected",
        "published",
      ],
      report_type: [
        "daily_summary",
        "weekly_analysis",
        "monthly_report",
        "quarterly_review",
        "annual_overview",
        "custom_analysis",
      ],
      reputation_badge: ["excellent", "trusted", "under_watch", "flagged"],
      royalty_status: ["pending", "processed", "paid"],
      rsvp_status: ["interested", "going", "not_going"],
      school_ownership: [
        "government",
        "private",
        "community",
        "religious",
        "ngo",
      ],
      school_type: [
        "nursery",
        "primary",
        "secondary",
        "vocational",
        "university",
        "special",
      ],
      sentiment_value: [
        "very_negative",
        "negative",
        "neutral",
        "positive",
        "very_positive",
      ],
      source_type: [
        "government_official",
        "parliamentary",
        "electoral_commission",
        "state_media",
        "independent_media",
        "social_media_verified",
        "civil_society",
        "international_org",
        "academic",
        "unknown",
      ],
      stream_type: [
        "civic_activity",
        "poll_results",
        "sentiment_analysis",
        "news_feed",
        "government_updates",
        "user_activity",
        "system_metrics",
      ],
      submission_status: [
        "pending",
        "approved",
        "rejected",
        "needs_clarification",
      ],
      threat_level: ["low", "medium", "high", "critical"],
      ticket_type: [
        "regular",
        "vip",
        "vvip",
        "livestream",
        "student",
        "early_bird",
      ],
      track_type: ["single", "ep", "album"],
      transaction_type: [
        "topup",
        "purchase",
        "tip",
        "donation",
        "subscription",
        "refund",
      ],
      trend_type: ["rising", "declining", "viral", "anomaly", "normal"],
      user_type: ["artist", "fan", "admin", "event_attendee"],
      verification_status: ["pending", "verified", "rejected", "under_review"],
      verification_status_enum: [
        "pending",
        "verified",
        "rejected",
        "flagged",
        "missing",
      ],
      violation_status: [
        "detected",
        "reported",
        "whitelisted",
        "resolved",
        "dismissed",
      ],
      vote_type: ["public", "jury"],
      wealth_source: [
        "technology",
        "oil_gas",
        "real_estate",
        "banking_finance",
        "agriculture",
        "mining",
        "telecommunications",
        "manufacturing",
        "retail_trade",
        "construction",
        "entertainment",
        "healthcare",
        "logistics",
        "other",
      ],
    },
  },
} as const
