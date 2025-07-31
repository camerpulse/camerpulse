import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Enhanced unified feed with all platform features
    const feedItems = [
      {
        id: 'civic-1',
        content_type: 'pulse',
        content_id: 'pulse-1',
        score: 1.0,
        region: 'Centre',
        created_at: new Date().toISOString(),
        content: {
          content: 'New civic initiative for youth empowerment in Yaoundé',
          description: 'Join the discussion on how we can better engage young people in civic activities and democratic processes.',
          tags: ['youth', 'civic', 'democracy'],
          author: 'Civic Leader',
          engagement: { likes: 45, comments: 12, shares: 8 }
        }
      },
      {
        id: 'job-1',
        content_type: 'job',
        content_id: 'job-1',
        score: 0.9,
        region: 'Littoral',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        content: {
          title: 'Software Developer - FinTech Startup',
          company_name: 'Douala Tech Solutions',
          location: 'Douala, Cameroon',
          salary_range: '500,000 - 800,000 XAF/month',
          description: 'We are looking for a passionate full-stack developer to join our growing fintech team.',
          requirements: ['React', 'Node.js', 'PostgreSQL'],
          employment_type: 'Full-time'
        }
      },
      {
        id: 'artist-1',
        content_type: 'artist_content',
        content_id: 'artist-1',
        score: 0.85,
        region: 'West',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        content: {
          stage_name: 'Salatiel',
          real_name: 'Salatiel Livenja',
          genre: 'Afro-Pop',
          region: 'West Region',
          latest_work: 'New single "Cameroon Unite" promoting national unity',
          description: 'Award-winning Cameroonian artist spreading messages of peace and unity through music.',
          social_media: { followers: 125000, engagement_rate: 8.5 }
        }
      },
      {
        id: 'village-1',
        content_type: 'village_update',
        content_id: 'village-1',
        score: 0.8,
        region: 'Northwest',
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        content: {
          village_name: 'Bamenda Central',
          division: 'Mezam',
          region: 'Northwest',
          population: 45000,
          description: 'New water project completed, serving 3,000 households with clean water access.',
          projects: ['Water Infrastructure', 'Road Maintenance', 'School Renovation'],
          leadership: 'Mayor John Nkemba',
          rating: 4.2
        }
      },
      {
        id: 'marketplace-1',
        content_type: 'marketplace',
        content_id: 'marketplace-1',
        score: 0.75,
        region: 'Littoral',
        created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        content: {
          title: 'Fresh Plantains - Direct from Farm',
          business_name: 'Douala Fresh Produce',
          category: 'Agriculture',
          location: 'Douala Central Market',
          price: '1,000 XAF per bunch',
          description: 'Fresh, organic plantains harvested daily from our farms in the Littoral region.',
          seller_rating: 4.8,
          delivery_available: true
        }
      },
      {
        id: 'petition-1',
        content_type: 'petition',
        content_id: 'petition-1',
        score: 0.95,
        region: 'Centre',
        created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        content: {
          title: 'Improve Public Transportation in Yaoundé',
          target: 'Minister of Transport',
          description: 'Petition to expand bus routes and improve public transportation infrastructure in the capital.',
          signatures_count: 2847,
          goal: 5000,
          category: 'Infrastructure',
          urgency: 'high',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      },
      {
        id: 'business-1',
        content_type: 'business_listing',
        content_id: 'business-1',
        score: 0.7,
        region: 'South',
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        content: {
          business_name: 'Ebolowa Digital Services',
          category: 'Technology Services',
          location: 'Ebolowa, South Region',
          description: 'Complete digital solutions for businesses - web design, marketing, and IT support.',
          services: ['Web Design', 'Digital Marketing', 'IT Support'],
          contact: '+237 691 234 567',
          rating: 4.6,
          verified: true
        }
      },
      {
        id: 'political-1',
        content_type: 'political_update',
        content_id: 'political-1',
        score: 0.88,
        region: 'Far North',
        created_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
        content: {
          title: 'New Development Initiative for Far North Region',
          description: 'Government announces major infrastructure development program focusing on education and healthcare facilities.',
          politician: 'Governor Midjiyawa Bakari',
          policy_area: 'Infrastructure Development',
          impact_level: 'Regional',
          funding: '15 billion XAF over 3 years'
        }
      }
    ];

    return new Response(
      JSON.stringify({
        feed: feedItems,
        total_count: feedItems.length,
        user_preferences: {
          civic_content_weight: 0.4,
          entertainment_weight: 0.2,
          job_content_weight: 0.3,
          artist_content_weight: 0.1,
          local_content_preference: 0.8,
          political_engagement_level: 'moderate',
          preferred_regions: ['Centre', 'Littoral'],
          blocked_topics: []
        },
        civic_events_active: true
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error generating personalized feed:', error)
    
    return new Response(
      JSON.stringify({
        feed: [],
        total_count: 0,
        user_preferences: null,
        civic_events_active: false,
        error: error.message
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})