import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sponsorId, format } = await req.json();

    if (!sponsorId) {
      return new Response(
        JSON.stringify({ error: 'Sponsor ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get sponsor data
    const { data: sponsor, error: sponsorError } = await supabase
      .from('sponsors')
      .select('*')
      .eq('id', sponsorId)
      .single();

    if (sponsorError) {
      console.error('Sponsor fetch error:', sponsorError);
      throw sponsorError;
    }

    // Get campaigns
    const { data: campaigns, error: campaignError } = await supabase
      .from('hiring_campaigns')
      .select('*')
      .eq('sponsor_id', sponsorId);

    if (campaignError) {
      console.error('Campaign fetch error:', campaignError);
      throw campaignError;
    }

    // Get hires
    const campaignIds = campaigns.map(c => c.id);
    const { data: hires, error: hiresError } = await supabase
      .from('campaign_hires')
      .select('*')
      .in('campaign_id', campaignIds)
      .eq('verified', true);

    if (hiresError) {
      console.error('Hires fetch error:', hiresError);
      throw hiresError;
    }

    // Generate export data
    const exportData = {
      sponsor,
      campaigns,
      hires,
      analytics: {
        totalHires: hires.length,
        activeCampaigns: campaigns.filter(c => c.campaign_status === 'active').length,
        completedCampaigns: campaigns.filter(c => c.campaign_status === 'completed').length,
        totalBudget: campaigns.reduce((sum, c) => sum + (c.budget_allocated || 0), 0),
        genderBreakdown: hires.reduce((acc, hire) => {
          const gender = hire.gender || 'unspecified';
          acc[gender] = (acc[gender] || 0) + 1;
          return acc;
        }, {}),
        regionalBreakdown: hires.reduce((acc, hire) => {
          const region = hire.region || 'unspecified';
          acc[region] = (acc[region] || 0) + 1;
          return acc;
        }, {}),
        sectorBreakdown: hires.reduce((acc, hire) => {
          const sector = hire.sector || 'unspecified';
          acc[sector] = (acc[sector] || 0) + 1;
          return acc;
        }, {}),
      }
    };

    if (format === 'pdf') {
      // Generate PDF report
      const pdfContent = generatePDFContent(exportData);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'PDF report generated successfully',
          data: pdfContent 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else if (format === 'xlsx') {
      // Generate Excel data
      const excelData = generateExcelData(exportData);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Excel report generated successfully',
          data: excelData 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid format. Use "pdf" or "xlsx"' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Export error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate export',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generatePDFContent(data: any) {
  // Generate structured data for PDF creation
  return {
    type: 'pdf',
    sponsor: data.sponsor,
    summary: {
      totalHires: data.analytics.totalHires,
      activeCampaigns: data.analytics.activeCampaigns,
      completedCampaigns: data.analytics.completedCampaigns,
      totalBudget: data.analytics.totalBudget,
    },
    demographics: data.analytics.genderBreakdown,
    regions: data.analytics.regionalBreakdown,
    sectors: data.analytics.sectorBreakdown,
    campaigns: data.campaigns.map(c => ({
      name: c.name,
      status: c.campaign_status,
      target: c.target_hires,
      current: c.current_hires,
      progress: Math.round((c.current_hires / c.target_hires) * 100)
    })),
    generatedAt: new Date().toISOString()
  };
}

function generateExcelData(data: any) {
  // Generate structured data for Excel creation
  return {
    type: 'xlsx',
    sheets: {
      summary: {
        name: 'Summary',
        data: [
          ['Metric', 'Value'],
          ['Sponsor Name', data.sponsor.name],
          ['Total Hires', data.analytics.totalHires],
          ['Active Campaigns', data.analytics.activeCampaigns],
          ['Completed Campaigns', data.analytics.completedCampaigns],
          ['Total Budget (FCFA)', data.analytics.totalBudget],
        ]
      },
      campaigns: {
        name: 'Campaigns',
        data: [
          ['Campaign Name', 'Status', 'Target Hires', 'Current Hires', 'Progress %'],
          ...data.campaigns.map(c => [
            c.name,
            c.campaign_status,
            c.target_hires,
            c.current_hires,
            Math.round((c.current_hires / c.target_hires) * 100)
          ])
        ]
      },
      hires: {
        name: 'Hires',
        data: [
          ['Job Title', 'Sector', 'Region', 'Gender', 'Age Group', 'Hire Date'],
          ...data.hires.map(h => [
            h.job_title,
            h.sector || '',
            h.region || '',
            h.gender || '',
            h.age_group || '',
            h.hire_date
          ])
        ]
      }
    },
    generatedAt: new Date().toISOString()
  };
}