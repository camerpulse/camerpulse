import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuditCheckRequest {
  tender_id: string;
  issuer_name: string;
  category: string;
  budget_amount?: number;
  region?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tender_id, issuer_name, category, budget_amount, region }: AuditCheckRequest = await req.json();

    console.log('Performing audit check:', { tender_id, issuer_name, category });

    // Check for existing audits on this issuer
    const { data: existingAudits, error: auditError } = await supabase
      .from('audit_registry')
      .select('*')
      .or(`entity_name.ilike.%${issuer_name}%,audited_department.ilike.%${issuer_name}%`)
      .order('audit_date', { ascending: false })
      .limit(10);

    if (auditError) {
      console.error('Audit registry query error:', auditError);
    }

    // Check for compliance issues
    const { data: complianceIssues, error: complianceError } = await supabase
      .from('compliance_violations')
      .select('*')
      .ilike('entity_name', `%${issuer_name}%`)
      .order('violation_date', { ascending: false })
      .limit(5);

    if (complianceError) {
      console.error('Compliance query error:', complianceError);
    }

    // Check for tender irregularities
    const { data: tenderFlags, error: flagError } = await supabase
      .from('tender_flags')
      .select('*')
      .eq('issuer_name', issuer_name)
      .order('created_at', { ascending: false })
      .limit(5);

    if (flagError) {
      console.error('Tender flags query error:', flagError);
    }

    // Analyze patterns and generate risk assessment
    const riskAssessment = {
      overall_risk_level: 'low',
      risk_score: 0,
      audit_history: {
        total_audits: existingAudits?.length || 0,
        recent_audits: existingAudits?.filter(audit => 
          new Date(audit.audit_date) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        ).length || 0,
        avg_compliance_score: 0,
        findings_count: 0
      },
      compliance_status: {
        active_violations: complianceIssues?.filter(issue => issue.status === 'open').length || 0,
        resolved_violations: complianceIssues?.filter(issue => issue.status === 'resolved').length || 0,
        severity_distribution: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0
        }
      },
      tender_history: {
        flagged_tenders: tenderFlags?.length || 0,
        recent_flags: tenderFlags?.filter(flag => 
          new Date(flag.created_at) > new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
        ).length || 0
      },
      recommendations: [],
      alerts: []
    };

    // Calculate risk score based on audit history
    if (existingAudits && existingAudits.length > 0) {
      const recentAudits = existingAudits.slice(0, 3);
      const avgScore = recentAudits.reduce((sum, audit) => sum + (audit.overall_score || 0), 0) / recentAudits.length;
      riskAssessment.audit_history.avg_compliance_score = Math.round(avgScore);
      
      const totalFindings = recentAudits.reduce((sum, audit) => sum + (audit.total_findings || 0), 0);
      riskAssessment.audit_history.findings_count = totalFindings;
      
      // Risk score calculation
      if (avgScore < 60) {
        riskAssessment.risk_score += 40;
        riskAssessment.overall_risk_level = 'high';
      } else if (avgScore < 75) {
        riskAssessment.risk_score += 20;
        riskAssessment.overall_risk_level = 'medium';
      }

      if (totalFindings > 10) {
        riskAssessment.risk_score += 20;
      }
    }

    // Analyze compliance violations
    if (complianceIssues && complianceIssues.length > 0) {
      complianceIssues.forEach(issue => {
        const severity = issue.severity || 'low';
        riskAssessment.compliance_status.severity_distribution[severity]++;
        
        if (severity === 'critical') riskAssessment.risk_score += 25;
        else if (severity === 'high') riskAssessment.risk_score += 15;
        else if (severity === 'medium') riskAssessment.risk_score += 10;
        else riskAssessment.risk_score += 5;
      });

      if (riskAssessment.compliance_status.active_violations > 0) {
        riskAssessment.alerts.push('Active compliance violations found');
        riskAssessment.overall_risk_level = 'high';
      }
    }

    // Analyze tender flags
    if (riskAssessment.tender_history.recent_flags > 2) {
      riskAssessment.risk_score += 15;
      riskAssessment.alerts.push('Multiple recent tender flags detected');
    }

    // Final risk level determination
    if (riskAssessment.risk_score > 70) {
      riskAssessment.overall_risk_level = 'high';
    } else if (riskAssessment.risk_score > 40) {
      riskAssessment.overall_risk_level = 'medium';
    } else {
      riskAssessment.overall_risk_level = 'low';
    }

    // Generate recommendations
    if (riskAssessment.overall_risk_level === 'high') {
      riskAssessment.recommendations.push('Enhanced due diligence recommended');
      riskAssessment.recommendations.push('Consider additional oversight measures');
      riskAssessment.recommendations.push('Review past audit findings before proceeding');
    } else if (riskAssessment.overall_risk_level === 'medium') {
      riskAssessment.recommendations.push('Standard due diligence with monitoring');
      riskAssessment.recommendations.push('Review compliance status');
    } else {
      riskAssessment.recommendations.push('Standard procurement procedures apply');
    }

    // Log the audit check
    await supabase
      .from('tender_audit_checks')
      .insert({
        tender_id,
        issuer_name,
        risk_level: riskAssessment.overall_risk_level,
        risk_score: riskAssessment.risk_score,
        audit_details: riskAssessment,
        created_at: new Date().toISOString()
      });

    const response = {
      tender_id,
      issuer_name,
      audit_status: 'completed',
      risk_assessment: riskAssessment,
      data_sources: {
        audit_registry_records: existingAudits?.length || 0,
        compliance_records: complianceIssues?.length || 0,
        tender_flag_records: tenderFlags?.length || 0
      },
      generated_at: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Audit check error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        audit_status: 'error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});