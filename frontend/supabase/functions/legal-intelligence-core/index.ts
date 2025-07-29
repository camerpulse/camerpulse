import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

interface LegalRequest {
  action: 'process_document' | 'check_compliance' | 'explain_law' | 'analyze_policy' | 'get_dashboard_stats';
  document_id?: string;
  document_text?: string;
  document_title?: string;
  document_type?: string;
  question?: string;
  policy_data?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json() as LegalRequest;
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let result;

    switch (action) {
      case 'process_document':
        result = await processLegalDocument(supabaseClient, params);
        break;
      case 'check_compliance':
        result = await checkConstitutionalCompliance(supabaseClient, params);
        break;
      case 'explain_law':
        result = await explainLawToPublic(supabaseClient, params);
        break;
      case 'analyze_policy':
        result = await analyzePolicy(supabaseClient, params);
        break;
      case 'get_dashboard_stats':
        result = await getDashboardStats(supabaseClient);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in legal-intelligence-core:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Legal Intelligence Core operation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processLegalDocument(supabaseClient: any, params: any) {
  const { document_id, document_text, document_title, document_type } = params;

  console.log(`📜 Processing legal document: ${document_title} (${document_type})`);

  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    // Extract and summarize document using AI
    const summaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a legal expert specializing in Cameroonian law. Analyze legal documents and provide:
1. A simplified summary in plain English
2. Key provisions and articles
3. Who is affected and how
4. Penalties or enforcement mechanisms
5. A Pidgin English summary for local understanding

Keep explanations clear and accessible to ordinary citizens.`
          },
          {
            role: 'user',
            content: `Please analyze this ${document_type}: "${document_title}"\n\nText: ${document_text}`
          }
        ],
        max_tokens: 2000
      }),
    });

    const summaryData = await summaryResponse.json();
    const aiAnalysis = summaryData.choices[0].message.content;

    // Parse AI response to extract structured data
    const lines = aiAnalysis.split('\n');
    let simplified_summary = '';
    let pidgin_summary = '';
    let key_provisions = [];
    let penalties_summary = '';

    // Basic parsing (could be enhanced with better structured prompts)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (line.includes('summary') || line.includes('overview')) {
        simplified_summary = lines.slice(i, i + 3).join(' ').substring(0, 500);
      }
      if (line.includes('pidgin') || line.includes('local language')) {
        pidgin_summary = lines.slice(i, i + 2).join(' ').substring(0, 300);
      }
      if (line.includes('provision') || line.includes('article')) {
        key_provisions.push(lines[i].substring(0, 200));
      }
      if (line.includes('penalt') || line.includes('enforcement')) {
        penalties_summary = lines.slice(i, i + 2).join(' ').substring(0, 300);
      }
    }

    // Update document in database
    const { data, error } = await supabaseClient
      .from('legal_documents')
      .update({
        simplified_summary: simplified_summary || aiAnalysis.substring(0, 500),
        pidgin_summary: pidgin_summary || 'Summary fit Pidgin no ready yet',
        key_provisions: key_provisions.length > 0 ? key_provisions : ['AI analysis complete'],
        penalties_summary: penalties_summary || 'Penalties fit detection no complete',
        updated_at: new Date().toISOString()
      })
      .eq('id', document_id)
      .select();

    if (error) {
      console.error('Error updating document:', error);
      throw new Error(`Failed to update document: ${error.message}`);
    }

    // Log processing
    await supabaseClient.rpc('process_legal_document', {
      p_document_id: document_id,
      p_processing_type: 'summarization'
    });

    console.log('✅ Document processed successfully');

    return {
      document_id,
      processing_complete: true,
      simplified_summary: simplified_summary || aiAnalysis.substring(0, 500),
      key_provisions,
      ai_analysis: aiAnalysis,
      processed_at: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error in AI processing:', error);
    
    // Log failed processing
    await supabaseClient
      .from('legal_document_processing')
      .insert({
        legal_document_id: document_id,
        processing_type: 'summarization',
        processing_status: 'failed',
        error_message: error.message
      });

    throw error;
  }
}

async function checkConstitutionalCompliance(supabaseClient: any, params: any) {
  const { document_id, document_text } = params;

  console.log(`🔍 Checking constitutional compliance for document: ${document_id}`);

  if (!openAIApiKey) {
    console.log('⚠️  No OpenAI API key, using basic compliance check');
    // Use database function for basic check
    const { data, error } = await supabaseClient.rpc('check_constitutional_compliance', {
      p_document_id: document_id,
      p_document_text: document_text
    });

    if (error) {
      throw new Error(`Compliance check failed: ${error.message}`);
    }

    return data;
  }

  try {
    // Get constitutional articles for context
    const { data: articles, error: articlesError } = await supabaseClient
      .from('constitutional_articles')
      .select('*')
      .eq('is_fundamental_right', true);

    if (articlesError) {
      console.error('Error fetching constitutional articles:', articlesError);
    }

    const constitutionalContext = articles?.map(a => 
      `${a.article_number}: ${a.article_text}`
    ).join('\n') || '';

    // AI-powered constitutional analysis
    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a constitutional law expert for Cameroon. Analyze documents for potential constitutional violations against these key articles:

${constitutionalContext}

Look for violations of:
- Human rights and fundamental freedoms
- Separation of powers
- Due process
- Equality and non-discrimination
- Freedom of expression
- Regional autonomy vs national authority

Respond in JSON format with:
{
  "violations_found": number,
  "violations": [
    {
      "type": "violation_type",
      "article_violated": "article_number", 
      "severity": "low|medium|high|critical",
      "description": "explanation",
      "confidence": 0.0-1.0
    }
  ],
  "compliance_score": 0.0-1.0,
  "summary": "overall_assessment"
}`
          },
          {
            role: 'user',
            content: `Analyze this legal text for constitutional violations:\n\n${document_text}`
          }
        ],
        max_tokens: 1500
      }),
    });

    const analysisData = await analysisResponse.json();
    let aiResult;
    
    try {
      aiResult = JSON.parse(analysisData.choices[0].message.content);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback to database function
      const { data, error } = await supabaseClient.rpc('check_constitutional_compliance', {
        p_document_id: document_id,
        p_document_text: document_text
      });
      return data;
    }

    // Store violations in database
    if (aiResult.violations && aiResult.violations.length > 0) {
      for (const violation of aiResult.violations) {
        const article = articles?.find(a => a.article_number === violation.article_violated);
        
        await supabaseClient
          .from('constitutional_violations')
          .insert({
            legal_document_id: document_id,
            violation_type: violation.type,
            constitutional_article_id: article?.id,
            severity_level: violation.severity,
            violation_description: violation.description,
            confidence_score: violation.confidence,
            auto_detected: true,
            public_alert_issued: violation.severity === 'critical'
          });
      }
    }

    console.log(`✅ Constitutional compliance check complete: ${aiResult.violations_found} violations found`);

    return {
      document_id,
      violations_found: aiResult.violations_found,
      violations: aiResult.violations,
      compliance_score: aiResult.compliance_score,
      summary: aiResult.summary,
      checked_at: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error in constitutional analysis:', error);
    throw error;
  }
}

async function explainLawToPublic(supabaseClient: any, params: any) {
  const { question, document_id } = params;

  console.log(`💬 Explaining law to public: ${question}`);

  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    // Get document context if provided
    let documentContext = '';
    if (document_id) {
      const { data: document } = await supabaseClient
        .from('legal_documents')
        .select('*')
        .eq('id', document_id)
        .single();

      if (document) {
        documentContext = `Context: ${document.document_title}\n${document.simplified_summary || document.original_text?.substring(0, 1000)}`;
      }
    }

    // Get constitutional context
    const { data: articles } = await supabaseClient
      .from('constitutional_articles')
      .select('*')
      .limit(10);

    const constitutionalContext = articles?.map(a => 
      `${a.article_number}: ${a.article_summary}`
    ).join('\n') || '';

    const explanationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a civic education expert explaining Cameroonian law to ordinary citizens. 

Your responses should be:
- Clear and simple (5th-grade reading level)
- Practical and relevant to daily life
- Respectful of local culture
- Include examples from Cameroon
- Mention citizens' rights and responsibilities

Available constitutional context:
${constitutionalContext}

${documentContext}

Answer in this format:
SIMPLE EXPLANATION: [clear, simple answer]
PIDGIN VERSION: [same explanation in Cameroonian Pidgin]
YOUR RIGHTS: [what rights citizens have]
WHAT TO DO: [practical advice]
EXAMPLE: [real-world example]`
          },
          {
            role: 'user',
            content: question
          }
        ],
        max_tokens: 1000
      }),
    });

    const explanationData = await explanationResponse.json();
    const fullExplanation = explanationData.choices[0].message.content;

    // Parse response sections
    const sections = fullExplanation.split('\n');
    let simple_explanation = '';
    let pidgin_explanation = '';
    let key_points = [];
    let examples = [];
    let citizen_impact = '';

    for (let i = 0; i < sections.length; i++) {
      const line = sections[i];
      if (line.includes('SIMPLE EXPLANATION:')) {
        simple_explanation = line.replace('SIMPLE EXPLANATION:', '').trim();
      } else if (line.includes('PIDGIN VERSION:')) {
        pidgin_explanation = line.replace('PIDGIN VERSION:', '').trim();
      } else if (line.includes('YOUR RIGHTS:')) {
        citizen_impact = line.replace('YOUR RIGHTS:', '').trim();
        key_points.push(citizen_impact);
      } else if (line.includes('WHAT TO DO:')) {
        key_points.push(line.replace('WHAT TO DO:', '').trim());
      } else if (line.includes('EXAMPLE:')) {
        examples.push(line.replace('EXAMPLE:', '').trim());
      }
    }

    // Store explanation in database
    const { data, error } = await supabaseClient
      .from('civic_law_explanations')
      .insert({
        legal_document_id: document_id,
        question_asked: question,
        simple_explanation: simple_explanation || fullExplanation.substring(0, 500),
        pidgin_explanation: pidgin_explanation || 'Pidgin explanation no ready',
        key_points: key_points.length > 0 ? key_points : ['Explanation provided'],
        examples: examples.length > 0 ? examples : ['Example no fit show'],
        citizen_impact: citizen_impact || 'Impact on citizens explained above',
        auto_generated: true
      })
      .select();

    if (error) {
      console.error('Error storing explanation:', error);
    }

    console.log('✅ Law explanation generated successfully');

    return {
      question,
      simple_explanation: simple_explanation || fullExplanation,
      pidgin_explanation,
      key_points,
      examples,
      citizen_impact,
      full_explanation: fullExplanation,
      generated_at: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error generating explanation:', error);
    throw error;
  }
}

async function analyzePolicy(supabaseClient: any, params: any) {
  const { policy_data } = params;

  console.log(`📊 Analyzing policy: ${policy_data.policy_title}`);

  try {
    // Store policy in database
    const { data, error } = await supabaseClient
      .from('policy_tracker')
      .insert({
        policy_title: policy_data.policy_title,
        policy_type: policy_data.policy_type || 'bill',
        initiator_name: policy_data.initiator_name,
        initiator_type: policy_data.initiator_type,
        initiator_party: policy_data.initiator_party,
        proposed_date: policy_data.proposed_date,
        status: policy_data.status || 'proposed',
        affected_sectors: policy_data.affected_sectors || [],
        affected_regions: policy_data.affected_regions || [],
        policy_summary: policy_data.policy_summary
      })
      .select();

    if (error) {
      throw new Error(`Failed to store policy: ${error.message}`);
    }

    console.log('✅ Policy analysis complete');

    return {
      policy_id: data[0].id,
      status: 'tracked',
      analysis_complete: true,
      stored_at: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error analyzing policy:', error);
    throw error;
  }
}

async function getDashboardStats(supabaseClient: any) {
  console.log('📈 Getting legal dashboard statistics');

  try {
    const { data, error } = await supabaseClient.rpc('get_legal_dashboard_stats');

    if (error) {
      throw new Error(`Failed to get dashboard stats: ${error.message}`);
    }

    // Get additional stats
    const { data: recentViolations } = await supabaseClient
      .from('constitutional_violations')
      .select('*')
      .eq('public_alert_issued', true)
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentExplanations } = await supabaseClient
      .from('civic_law_explanations')
      .select('question_asked, simple_explanation, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    return {
      ...data,
      recent_violations: recentViolations || [],
      recent_explanations: recentExplanations || [],
      status: 'operational'
    };

  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw error;
  }
}