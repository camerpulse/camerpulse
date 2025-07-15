import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, ...data } = await req.json();

    switch (action) {
      case 'analyze_prompt':
        return await analyzePrompt(supabase, data);
      case 'log_prompt_execution':
        return await logPromptExecution(supabase, data);
      case 'scan_for_duplicates':
        return await scanForDuplicates(supabase);
      case 'get_prompt_summary':
        return await getPromptSummary(supabase, data);
      case 'create_prompt_chain':
        return await createPromptChain(supabase, data);
      case 'resolve_deduplication':
        return await resolveDeduplication(supabase, data);
      case 'get_knowledge_base':
        return await getKnowledgeBase(supabase);
      case 'add_template':
        return await addTemplate(supabase, data);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: corsHeaders }
        );
    }
  } catch (error) {
    console.error('Error in prompt-intelligence-engine:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});

async function analyzePrompt(supabase: any, data: any) {
  const { promptContent, promptTitle } = data;

  // Call the database function to analyze prompt similarity
  const { data: analysis, error } = await supabase.rpc('analyze_prompt_before_execution', {
    p_prompt_content: promptContent,
    p_prompt_title: promptTitle
  });

  if (error) {
    throw new Error(`Failed to analyze prompt: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      analysis,
      message: getRecommendationMessage(analysis.recommendation, analysis.max_similarity)
    }),
    { headers: corsHeaders }
  );
}

function getRecommendationMessage(recommendation: string, similarity: number): string {
  switch (recommendation) {
    case 'duplicate':
      return `⚠️ This appears to duplicate an existing module (${similarity.toFixed(0)}% similar). Consider extending instead?`;
    case 'extend':
      return `💡 Similar functionality exists (${similarity.toFixed(0)}% match). Shall I extend the existing module?`;
    case 'review':
      return `🔍 Related modules found (${similarity.toFixed(0)}% similarity). Review before proceeding.`;
    default:
      return '✅ No significant duplicates found. Safe to proceed.';
  }
}

async function logPromptExecution(supabase: any, data: any) {
  const { 
    promptContent, 
    promptTitle, 
    promptPhase = 'feature',
    modulesAffected = [],
    routesCreated = [],
    filesCreated = [],
    filesModified = [],
    tablesCreated = [],
    functionsCreated = [],
    outcome = 'success',
    outcomeDetails
  } = data;

  // Log the prompt execution
  const { data: promptId, error } = await supabase.rpc('log_prompt_execution', {
    p_prompt_content: promptContent,
    p_prompt_title: promptTitle,
    p_prompt_phase: promptPhase,
    p_modules_affected: modulesAffected,
    p_outcome: outcome
  });

  if (error) {
    throw new Error(`Failed to log prompt execution: ${error.message}`);
  }

  // Update additional details
  const { error: updateError } = await supabase
    .from('ashen_prompt_trace_index')
    .update({
      routes_created: routesCreated,
      files_created: filesCreated,
      files_modified: filesModified,
      tables_created: tablesCreated,
      functions_created: functionsCreated,
      outcome_details: outcomeDetails
    })
    .eq('id', promptId);

  if (updateError) {
    console.error('Failed to update prompt details:', updateError);
  }

  return new Response(
    JSON.stringify({ success: true, promptId }),
    { headers: corsHeaders }
  );
}

async function scanForDuplicates(supabase: any) {
  const duplicates = [];

  // Scan for duplicate routes
  const routeDuplicates = await findDuplicateRoutes(supabase);
  duplicates.push(...routeDuplicates);

  // Scan for duplicate components
  const componentDuplicates = await findDuplicateComponents(supabase);
  duplicates.push(...componentDuplicates);

  // Scan for duplicate tables
  const tableDuplicates = await findDuplicateTables(supabase);
  duplicates.push(...tableDuplicates);

  // Store deduplication analysis
  for (const duplicate of duplicates) {
    await supabase
      .from('ashen_deduplication_analysis')
      .insert({
        analysis_type: duplicate.type,
        item_name: duplicate.name,
        item_path: duplicate.path,
        duplicate_items: duplicate.duplicates,
        similarity_percentage: duplicate.similarity,
        recommendation: duplicate.recommendation,
        recommendation_reasoning: duplicate.reasoning
      });
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      duplicatesFound: duplicates.length,
      duplicates: duplicates.slice(0, 10) // Return first 10 for preview
    }),
    { headers: corsHeaders }
  );
}

async function findDuplicateRoutes(supabase: any): Promise<any[]> {
  // This would analyze route patterns from prompt history
  const { data: prompts } = await supabase
    .from('ashen_prompt_trace_index')
    .select('routes_created, prompt_title, prompt_id')
    .not('routes_created', 'is', null);

  const routeMap = new Map();
  const duplicates = [];

  prompts?.forEach((prompt: any) => {
    prompt.routes_created?.forEach((route: string) => {
      if (routeMap.has(route)) {
        duplicates.push({
          type: 'route',
          name: route,
          path: route,
          duplicates: [routeMap.get(route), { prompt_id: prompt.prompt_id, title: prompt.prompt_title }],
          similarity: 100,
          recommendation: 'merge',
          reasoning: 'Identical route paths found in multiple prompts'
        });
      } else {
        routeMap.set(route, { prompt_id: prompt.prompt_id, title: prompt.prompt_title });
      }
    });
  });

  return duplicates;
}

async function findDuplicateComponents(supabase: any): Promise<any[]> {
  // Analyze component names from files_created
  const { data: prompts } = await supabase
    .from('ashen_prompt_trace_index')
    .select('files_created, prompt_title, prompt_id')
    .not('files_created', 'is', null);

  const componentMap = new Map();
  const duplicates = [];

  prompts?.forEach((prompt: any) => {
    prompt.files_created?.forEach((file: string) => {
      if (file.includes('components/')) {
        const componentName = file.split('/').pop()?.replace('.tsx', '').replace('.jsx', '');
        if (componentName && componentMap.has(componentName)) {
          duplicates.push({
            type: 'component',
            name: componentName,
            path: file,
            duplicates: [componentMap.get(componentName), { prompt_id: prompt.prompt_id, title: prompt.prompt_title }],
            similarity: 85,
            recommendation: 'review',
            reasoning: 'Similar component names found, may have overlapping functionality'
          });
        } else if (componentName) {
          componentMap.set(componentName, { prompt_id: prompt.prompt_id, title: prompt.prompt_title, path: file });
        }
      }
    });
  });

  return duplicates;
}

async function findDuplicateTables(supabase: any): Promise<any[]> {
  const { data: prompts } = await supabase
    .from('ashen_prompt_trace_index')
    .select('tables_created, prompt_title, prompt_id')
    .not('tables_created', 'is', null);

  const tableMap = new Map();
  const duplicates = [];

  prompts?.forEach((prompt: any) => {
    prompt.tables_created?.forEach((table: string) => {
      if (tableMap.has(table)) {
        duplicates.push({
          type: 'table',
          name: table,
          path: `database.${table}`,
          duplicates: [tableMap.get(table), { prompt_id: prompt.prompt_id, title: prompt.prompt_title }],
          similarity: 100,
          recommendation: 'merge',
          reasoning: 'Identical table names found'
        });
      } else {
        tableMap.set(table, { prompt_id: prompt.prompt_id, title: prompt.prompt_title });
      }
    });
  });

  return duplicates;
}

async function getPromptSummary(supabase: any, data: any) {
  const { phase, groupBy = 'phase' } = data;

  let query = supabase
    .from('ashen_prompt_trace_index')
    .select('*')
    .order('execution_date', { ascending: false });

  if (phase && phase !== 'all') {
    query = query.eq('prompt_phase', phase);
  }

  const { data: prompts, error } = await query.limit(100);

  if (error) {
    throw new Error(`Failed to get prompt summary: ${error.message}`);
  }

  // Group the data based on the groupBy parameter
  const summary = groupPrompts(prompts || [], groupBy);

  return new Response(
    JSON.stringify({ success: true, summary, total: prompts?.length || 0 }),
    { headers: corsHeaders }
  );
}

function groupPrompts(prompts: any[], groupBy: string) {
  const grouped: any = {};

  prompts.forEach(prompt => {
    let key;
    switch (groupBy) {
      case 'phase':
        key = prompt.prompt_phase || 'unknown';
        break;
      case 'outcome':
        key = prompt.outcome;
        break;
      case 'date':
        key = new Date(prompt.execution_date).toDateString();
        break;
      default:
        key = 'all';
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(prompt);
  });

  return grouped;
}

async function createPromptChain(supabase: any, data: any) {
  const { parentPromptId, childPromptId, relationshipType = 'extension' } = data;

  const { error } = await supabase
    .from('ashen_prompt_chains')
    .insert({
      parent_prompt_id: parentPromptId,
      child_prompt_id: childPromptId,
      relationship_type: relationshipType
    });

  if (error) {
    throw new Error(`Failed to create prompt chain: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ success: true, message: 'Prompt chain created successfully' }),
    { headers: corsHeaders }
  );
}

async function resolveDeduplication(supabase: any, data: any) {
  const { analysisId, resolution, resolvedBy } = data;

  const { error } = await supabase
    .from('ashen_deduplication_analysis')
    .update({
      status: 'resolved',
      resolved_by: resolvedBy,
      resolved_at: new Date().toISOString(),
      recommendation: resolution
    })
    .eq('id', analysisId);

  if (error) {
    throw new Error(`Failed to resolve deduplication: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ success: true, message: 'Deduplication resolved successfully' }),
    { headers: corsHeaders }
  );
}

async function getKnowledgeBase(supabase: any) {
  const { data: templates, error } = await supabase
    .from('ashen_prompt_knowledge_base')
    .select('*')
    .eq('is_active', true)
    .order('usage_count', { ascending: false });

  if (error) {
    throw new Error(`Failed to get knowledge base: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ success: true, templates: templates || [] }),
    { headers: corsHeaders }
  );
}

async function addTemplate(supabase: any, data: any) {
  const { templateName, templateCategory, templateDescription, templateContent, tags = [] } = data;

  const { error } = await supabase
    .from('ashen_prompt_knowledge_base')
    .insert({
      template_name: templateName,
      template_category: templateCategory,
      template_description: templateDescription,
      template_content: templateContent,
      tags,
      created_by: 'admin'
    });

  if (error) {
    throw new Error(`Failed to add template: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ success: true, message: 'Template added to knowledge base' }),
    { headers: corsHeaders }
  );
}