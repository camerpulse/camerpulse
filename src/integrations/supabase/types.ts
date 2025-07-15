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
      politicians: {
        Row: {
          auto_imported: boolean | null
          bio: string | null
          biography: string | null
          birth_date: string | null
          campaign_promises: Json | null
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
          integrity_rating: number | null
          is_archived: boolean | null
          is_claimable: boolean | null
          is_claimed: boolean | null
          level_of_office: string | null
          name: string
          party: string | null
          performance_score: number | null
          political_party_id: string | null
          position_end_date: string | null
          position_start_date: string | null
          profile_image_url: string | null
          promise_tracker: Json | null
          region: string | null
          role_title: string | null
          term_end_date: string | null
          term_start_date: string | null
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
          integrity_rating?: number | null
          is_archived?: boolean | null
          is_claimable?: boolean | null
          is_claimed?: boolean | null
          level_of_office?: string | null
          name: string
          party?: string | null
          performance_score?: number | null
          political_party_id?: string | null
          position_end_date?: string | null
          position_start_date?: string | null
          profile_image_url?: string | null
          promise_tracker?: Json | null
          region?: string | null
          role_title?: string | null
          term_end_date?: string | null
          term_start_date?: string | null
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
          integrity_rating?: number | null
          is_archived?: boolean | null
          is_claimable?: boolean | null
          is_claimed?: boolean | null
          level_of_office?: string | null
          name?: string
          party?: string | null
          performance_score?: number | null
          political_party_id?: string | null
          position_end_date?: string | null
          position_start_date?: string | null
          profile_image_url?: string | null
          promise_tracker?: Json | null
          region?: string | null
          role_title?: string | null
          term_end_date?: string | null
          term_start_date?: string | null
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
      get_pan_africa_config: {
        Args: { p_config_key?: string }
        Returns: Json
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
