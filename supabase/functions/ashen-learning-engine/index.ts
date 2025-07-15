import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PatchFeedback {
  patchId: string;
  outcome: 'accepted' | 'edited' | 'rolled_back';
  adminFeedback?: string;
  responseTimeSeconds?: number;
  rollbackReason?: string;
}

interface ManualFixTraining {
  filePath: string;
  originalCode: string;
  fixedCode: string;
  problemDescription: string;
}

interface StylePattern {
  category: 'naming' | 'indentation' | 'commenting' | 'data_flow' | 'structure';
  description: string;
  example: any;
  confidenceScore: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
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
      case 'record_patch_feedback':
        return await recordPatchFeedback(supabase, data);
      case 'learn_from_manual_fix':
        return await learnFromManualFix(supabase, data);
      case 'analyze_code_style':
        return await analyzeCodeStyle(supabase, data);
      case 'get_learning_insights':
        return await getLearningInsights(supabase);
      case 'calculate_trust_scores':
        return await calculateTrustScores(supabase);
      case 'get_recommended_patterns':
        return await getRecommendedPatterns(supabase, data);
      case 'block_unstable_pattern':
        return await blockUnstablePattern(supabase, data);
      case 'reset_learning_memory':
        return await resetLearningMemory(supabase);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: corsHeaders }
        );
    }
  } catch (error) {
    console.error('Error in ashen-learning-engine:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});

async function recordPatchFeedback(supabase: any, data: PatchFeedback) {
  const { patchId, outcome, adminFeedback, responseTimeSeconds, rollbackReason } = data;

  // Update patch history
  const { error: updateError } = await supabase
    .from('ashen_patch_history')
    .update({
      outcome,
      admin_feedback: adminFeedback,
      admin_response_time_seconds: responseTimeSeconds,
      rollback_reason: rollbackReason,
      updated_at: new Date().toISOString()
    })
    .eq('patch_id', patchId);

  if (updateError) {
    throw new Error(`Failed to update patch feedback: ${updateError.message}`);
  }

  // Get patch details for further analysis
  const { data: patchData, error: fetchError } = await supabase
    .from('ashen_patch_history')
    .select('*')
    .eq('patch_id', patchId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch patch data: ${fetchError.message}`);
  }

  // Check if this pattern has failed multiple times
  if (outcome === 'rolled_back') {
    await checkForUnstablePattern(supabase, patchData);
  }

  // Update trust scores
  await updateTrustScore(supabase, patchData.patch_type);

  return new Response(
    JSON.stringify({ success: true, message: 'Patch feedback recorded' }),
    { headers: corsHeaders }
  );
}

async function checkForUnstablePattern(supabase: any, patchData: any) {
  const patternSignature = generatePatternSignature(patchData);
  
  // Check existing unstable patterns
  const { data: existingPattern } = await supabase
    .from('ashen_unstable_patterns')
    .select('*')
    .eq('pattern_signature', patternSignature)
    .single();

  if (existingPattern) {
    // Increment failure count
    await supabase
      .from('ashen_unstable_patterns')
      .update({
        failure_count: existingPattern.failure_count + 1,
        rollback_count: existingPattern.rollback_count + 1,
        last_failure: new Date().toISOString()
      })
      .eq('id', existingPattern.id);

    // Block pattern if it has failed too many times
    if (existingPattern.rollback_count >= 2) {
      await supabase
        .from('ashen_unstable_patterns')
        .update({
          blocked_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Block for 1 week
          admin_notes: 'Auto-blocked due to repeated rollbacks'
        })
        .eq('id', existingPattern.id);
    }
  } else {
    // Create new unstable pattern entry
    await supabase
      .from('ashen_unstable_patterns')
      .insert({
        pattern_signature: patternSignature,
        pattern_description: `${patchData.patch_type} fix in ${patchData.file_path}`,
        failure_count: 1,
        rollback_count: 1
      });
  }
}

function generatePatternSignature(patchData: any): string {
  return `${patchData.patch_type}_${patchData.file_path}_${patchData.patch_reasoning?.substring(0, 50) || ''}`;
}

async function updateTrustScore(supabase: any, fixType: string) {
  const { data, error } = await supabase.rpc('calculate_fix_trust_score', {
    p_fix_type: fixType
  });

  if (error) {
    console.error('Error calculating trust score:', error);
  }

  return data;
}

async function learnFromManualFix(supabase: any, data: ManualFixTraining) {
  const { filePath, originalCode, fixedCode, problemDescription } = data;

  // Call the database function to learn from manual fix
  const { data: patternId, error } = await supabase.rpc('learn_from_manual_fix', {
    p_file_path: filePath,
    p_original_code: originalCode,
    p_fixed_code: fixedCode,
    p_problem_description: problemDescription
  });

  if (error) {
    throw new Error(`Failed to learn from manual fix: ${error.message}`);
  }

  // Analyze code style from the manual fix
  await analyzeCodeStyleFromFix(supabase, fixedCode, filePath);

  return new Response(
    JSON.stringify({ success: true, patternId, message: 'Manual fix learned successfully' }),
    { headers: corsHeaders }
  );
}

async function analyzeCodeStyleFromFix(supabase: any, code: string, filePath: string) {
  const stylePatterns = extractStylePatterns(code, filePath);
  
  for (const pattern of stylePatterns) {
    // Check if pattern already exists
    const { data: existing } = await supabase
      .from('ashen_style_patterns')
      .select('*')
      .eq('pattern_category', pattern.category)
      .eq('pattern_description', pattern.description)
      .single();

    if (existing) {
      // Update frequency and confidence
      await supabase
        .from('ashen_style_patterns')
        .update({
          usage_frequency: existing.usage_frequency + 1,
          confidence_score: Math.min(100, existing.confidence_score + 2),
          last_observed: new Date().toISOString()
        })
        .eq('id', existing.id);
    } else {
      // Insert new pattern
      await supabase
        .from('ashen_style_patterns')
        .insert({
          pattern_category: pattern.category,
          pattern_description: pattern.description,
          pattern_example: pattern.example,
          confidence_score: pattern.confidenceScore,
          usage_frequency: 1
        });
    }
  }
}

function extractStylePatterns(code: string, filePath: string): StylePattern[] {
  const patterns: StylePattern[] = [];
  
  // Analyze naming conventions
  const functionNames = code.match(/(?:function|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
  if (functionNames) {
    const namingStyle = detectNamingStyle(functionNames);
    patterns.push({
      category: 'naming',
      description: `Prefers ${namingStyle} naming convention`,
      example: { sample: functionNames[0], style: namingStyle },
      confidenceScore: 10
    });
  }

  // Analyze indentation
  const indentationMatch = code.match(/^(\s+)/m);
  if (indentationMatch) {
    const indentType = indentationMatch[1].includes('\t') ? 'tabs' : 'spaces';
    const indentSize = indentType === 'spaces' ? indentationMatch[1].length : 1;
    patterns.push({
      category: 'indentation',
      description: `Uses ${indentType}${indentType === 'spaces' ? ` (${indentSize})` : ''} for indentation`,
      example: { type: indentType, size: indentSize },
      confidenceScore: 15
    });
  }

  // Analyze commenting style
  const comments = code.match(/\/\/.*|\/\*[\s\S]*?\*\//g);
  if (comments) {
    const commentStyle = detectCommentStyle(comments);
    patterns.push({
      category: 'commenting',
      description: `Prefers ${commentStyle} comment style`,
      example: { samples: comments.slice(0, 3), style: commentStyle },
      confidenceScore: 8
    });
  }

  return patterns;
}

function detectNamingStyle(names: string[]): string {
  const camelCaseCount = names.filter(name => /[a-z][A-Z]/.test(name)).length;
  const snakeCaseCount = names.filter(name => /_/.test(name)).length;
  
  if (camelCaseCount > snakeCaseCount) return 'camelCase';
  if (snakeCaseCount > camelCaseCount) return 'snake_case';
  return 'mixed';
}

function detectCommentStyle(comments: string[]): string {
  const singleLineCount = comments.filter(c => c.startsWith('//')).length;
  const blockCommentCount = comments.filter(c => c.startsWith('/*')).length;
  
  if (singleLineCount > blockCommentCount) return 'single-line';
  if (blockCommentCount > singleLineCount) return 'block';
  return 'mixed';
}

async function analyzeCodeStyle(supabase: any, data: any) {
  const { code, filePath } = data;
  await analyzeCodeStyleFromFix(supabase, code, filePath);
  
  return new Response(
    JSON.stringify({ success: true, message: 'Code style analyzed' }),
    { headers: corsHeaders }
  );
}

async function getLearningInsights(supabase: any) {
  // Get various learning metrics
  const [
    patchHistoryResult,
    stylePatternResult,
    trustMetricsResult,
    personalPatchResult,
    unstablePatternsResult
  ] = await Promise.all([
    supabase.from('ashen_patch_history').select('*').order('created_at', { ascending: false }).limit(50),
    supabase.from('ashen_style_patterns').select('*').order('confidence_score', { ascending: false }),
    supabase.from('ashen_fix_trust_metrics').select('*').order('current_trust_score', { ascending: false }),
    supabase.from('ashen_personal_patch_index').select('*').order('success_rate', { ascending: false }),
    supabase.from('ashen_unstable_patterns').select('*').order('rollback_count', { ascending: false })
  ]);

  return new Response(
    JSON.stringify({
      patchHistory: patchHistoryResult.data || [],
      stylePatterns: stylePatternResult.data || [],
      trustMetrics: trustMetricsResult.data || [],
      personalPatches: personalPatchResult.data || [],
      unstablePatterns: unstablePatternsResult.data || []
    }),
    { headers: corsHeaders }
  );
}

async function calculateTrustScores(supabase: any) {
  // Get all distinct patch types
  const { data: patchTypes } = await supabase
    .from('ashen_patch_history')
    .select('patch_type')
    .distinct();

  if (!patchTypes) {
    return new Response(
      JSON.stringify({ error: 'No patch types found' }),
      { status: 404, headers: corsHeaders }
    );
  }

  const results = [];
  for (const { patch_type } of patchTypes) {
    const score = await updateTrustScore(supabase, patch_type);
    results.push({ patch_type, trust_score: score });
  }

  return new Response(
    JSON.stringify({ success: true, trust_scores: results }),
    { headers: corsHeaders }
  );
}

async function getRecommendedPatterns(supabase: any, data: any) {
  const { problemType, filePath } = data;
  
  // Get high-success patterns for this problem type
  const { data: patterns } = await supabase
    .from('ashen_personal_patch_index')
    .select('*')
    .eq('problem_signature', problemType)
    .gte('success_rate', 0.7)
    .order('success_rate', { ascending: false })
    .limit(5);

  return new Response(
    JSON.stringify({ patterns: patterns || [] }),
    { headers: corsHeaders }
  );
}

async function blockUnstablePattern(supabase: any, data: any) {
  const { patternSignature, reason, permanently = false } = data;
  
  const updateData: any = {
    blocked_until: permanently ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    is_permanently_blocked: permanently,
    admin_notes: reason
  };

  const { error } = await supabase
    .from('ashen_unstable_patterns')
    .upsert({
      pattern_signature: patternSignature,
      pattern_description: reason,
      ...updateData
    });

  if (error) {
    throw new Error(`Failed to block pattern: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ success: true, message: 'Pattern blocked successfully' }),
    { headers: corsHeaders }
  );
}

async function resetLearningMemory(supabase: any) {
  // Clear all learning data (use with caution)
  const tables = [
    'ashen_patch_history',
    'ashen_style_patterns', 
    'ashen_personal_patch_index',
    'ashen_unstable_patterns',
    'ashen_fix_trust_metrics'
  ];

  for (const table of tables) {
    await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
  }

  return new Response(
    JSON.stringify({ success: true, message: 'Learning memory reset successfully' }),
    { headers: corsHeaders }
  );
}