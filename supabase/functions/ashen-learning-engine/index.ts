import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LearningRequest {
  action: 'train' | 'analyze' | 'predict' | 'feedback';
  data?: any;
  pattern_type?: string;
  context?: any;
}

interface LearningPattern {
  pattern_name: string;
  confidence_score: number;
  learned_rules: any;
  applicable_contexts: any;
  success_rate: number;
  usage_frequency: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, data, pattern_type, context }: LearningRequest = await req.json();

    console.log(`🧠 Ashen Learning Engine: ${action} request received`);

    // Check if learning engine is enabled
    const { data: config } = await supabase
      .from('ashen_monitoring_config')
      .select('config_value')
      .eq('config_key', 'learning_engine_enabled')
      .single();

    if (!config || config.config_value !== 'true') {
      return new Response(JSON.stringify({ 
        error: 'Learning engine is disabled',
        action: action,
        success: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let result;
    switch (action) {
      case 'train':
        result = await trainFromHistory(supabase);
        break;
      case 'analyze':
        result = await analyzePatterns(supabase, pattern_type);
        break;
      case 'predict':
        result = await predictFix(supabase, data, context);
        break;
      case 'feedback':
        result = await processFeedback(supabase, data);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Update last training run timestamp
    if (action === 'train') {
      await updateLastTrainingRun(supabase);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Learning Engine error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function trainFromHistory(supabase: any) {
  console.log('🎓 Training from historical data...');

  // Get healing history with admin feedback
  const { data: healingHistory } = await supabase
    .from('ashen_auto_healing_history')
    .select('*')
    .not('admin_feedback', 'is', null)
    .order('created_at', { ascending: false })
    .limit(500);

  if (!healingHistory || healingHistory.length === 0) {
    return {
      message: 'No training data available',
      patterns_learned: 0,
      success: true
    };
  }

  const patterns = await extractPatterns(healingHistory);
  const savedPatterns = await saveLearnedPatterns(supabase, patterns);

  return {
    message: 'Training completed successfully',
    patterns_learned: savedPatterns.length,
    training_data_points: healingHistory.length,
    success: true
  };
}

async function extractPatterns(healingHistory: any[]) {
  const patterns: LearningPattern[] = [];

  // Group by fix types and analyze success patterns
  const fixTypes = healingHistory.reduce((acc, entry) => {
    const fixMethod = entry.fix_method || 'unknown';
    if (!acc[fixMethod]) acc[fixMethod] = [];
    acc[fixMethod].push(entry);
    return acc;
  }, {});

  // Analyze coding style patterns
  const approvedFixes = healingHistory.filter(h => h.admin_feedback === 'approved');
  if (approvedFixes.length >= 3) {
    const codingStylePattern = analyzeCodingStylePatterns(approvedFixes);
    if (codingStylePattern) {
      patterns.push(codingStylePattern);
    }
  }

  // Analyze UI fix patterns
  const uiFixes = approvedFixes.filter(h => 
    h.fix_description && (
      h.fix_description.includes('responsive') ||
      h.fix_description.includes('mobile') ||
      h.fix_description.includes('overflow') ||
      h.fix_description.includes('grid')
    )
  );

  if (uiFixes.length >= 2) {
    const uiPattern = analyzeUIPatterns(uiFixes);
    if (uiPattern) {
      patterns.push(uiPattern);
    }
  }

  // Analyze component structure patterns
  const componentFixes = approvedFixes.filter(h => 
    h.files_modified && h.files_modified.some((file: string) => 
      file.includes('components/') || file.includes('hooks/')
    )
  );

  if (componentFixes.length >= 2) {
    const componentPattern = analyzeComponentPatterns(componentFixes);
    if (componentPattern) {
      patterns.push(componentPattern);
    }
  }

  return patterns;
}

function analyzeCodingStylePatterns(fixes: any[]): LearningPattern | null {
  const commonImports = [];
  const commonStructures = [];
  
  for (const fix of fixes) {
    if (fix.fix_description) {
      // Extract common import patterns
      if (fix.fix_description.includes('import')) {
        const importMatch = fix.fix_description.match(/import.*from ['"]([^'"]+)['"]/g);
        if (importMatch) {
          commonImports.push(...importMatch);
        }
      }
      
      // Extract common structural patterns
      if (fix.fix_description.includes('component') || fix.fix_description.includes('hook')) {
        commonStructures.push(fix.fix_description);
      }
    }
  }

  if (commonImports.length === 0 && commonStructures.length === 0) {
    return null;
  }

  return {
    pattern_name: 'CamerPulse Coding Style Preference',
    confidence_score: Math.min(0.95, 0.6 + (fixes.length * 0.05)),
    learned_rules: {
      import_patterns: [...new Set(commonImports)],
      structure_patterns: [...new Set(commonStructures)],
      preferred_practices: extractPreferredPractices(fixes)
    },
    applicable_contexts: {
      file_types: ['tsx', 'ts'],
      project_context: 'camerpulse',
      admin_approved: true
    },
    success_rate: fixes.length / (fixes.length + 1), // Avoid division by zero
    usage_frequency: fixes.length
  };
}

function analyzeUIPatterns(fixes: any[]): LearningPattern | null {
  const responsiveClasses = [];
  const layoutFixes = [];
  
  for (const fix of fixes) {
    if (fix.fix_description) {
      // Extract responsive classes
      const classMatches = fix.fix_description.match(/[\w-]+:[\w-]+/g);
      if (classMatches) {
        responsiveClasses.push(...classMatches);
      }
      
      // Extract layout fixes
      if (fix.fix_description.includes('grid') || fix.fix_description.includes('flex')) {
        layoutFixes.push(fix.fix_description);
      }
    }
  }

  return {
    pattern_name: 'CamerPulse Responsive Layout Strategy',
    confidence_score: Math.min(0.92, 0.7 + (fixes.length * 0.04)),
    learned_rules: {
      responsive_classes: [...new Set(responsiveClasses)],
      layout_strategies: [...new Set(layoutFixes)],
      mobile_first: true,
      breakpoint_preferences: ['sm:', 'md:', 'lg:', 'xl:']
    },
    applicable_contexts: {
      issue_types: ['mobile_break', 'overflow', 'responsive'],
      screen_sizes: ['320px', '768px', '1440px']
    },
    success_rate: fixes.length / (fixes.length + 1),
    usage_frequency: fixes.length
  };
}

function analyzeComponentPatterns(fixes: any[]): LearningPattern | null {
  const componentTypes = [];
  const structurePatterns = [];
  
  for (const fix of fixes) {
    if (fix.files_modified) {
      for (const file of fix.files_modified) {
        if (file.includes('components/')) {
          const componentType = file.split('/').pop()?.replace('.tsx', '');
          if (componentType) {
            componentTypes.push(componentType);
          }
        }
      }
    }
    
    if (fix.fix_description && (fix.fix_description.includes('Card') || fix.fix_description.includes('Button'))) {
      structurePatterns.push(fix.fix_description);
    }
  }

  return {
    pattern_name: 'CamerPulse Component Architecture',
    confidence_score: Math.min(0.88, 0.65 + (fixes.length * 0.05)),
    learned_rules: {
      component_types: [...new Set(componentTypes)],
      structure_patterns: [...new Set(structurePatterns)],
      naming_convention: 'PascalCase',
      preferred_ui_library: 'shadcn'
    },
    applicable_contexts: {
      directories: ['src/components/', 'src/hooks/'],
      file_types: ['tsx', 'ts']
    },
    success_rate: fixes.length / (fixes.length + 1),
    usage_frequency: fixes.length
  };
}

function extractPreferredPractices(fixes: any[]) {
  const practices = [];
  
  for (const fix of fixes) {
    if (fix.fix_description) {
      if (fix.fix_description.includes('toast')) {
        practices.push('use_toast_for_notifications');
      }
      if (fix.fix_description.includes('query')) {
        practices.push('use_react_query_for_data_fetching');
      }
      if (fix.fix_description.includes('semantic')) {
        practices.push('use_semantic_color_tokens');
      }
    }
  }
  
  return [...new Set(practices)];
}

async function saveLearnedPatterns(supabase: any, patterns: LearningPattern[]) {
  const savedPatterns = [];
  
  for (const pattern of patterns) {
    try {
      // Check if pattern already exists
      const { data: existing } = await supabase
        .from('ashen_learning_insights')
        .select('id, confidence_score, usage_frequency')
        .eq('pattern_name', pattern.pattern_name)
        .single();

      if (existing) {
        // Update existing pattern
        const newConfidence = Math.min(0.95, (existing.confidence_score + pattern.confidence_score) / 2);
        const newFrequency = existing.usage_frequency + pattern.usage_frequency;
        
        await supabase
          .from('ashen_learning_insights')
          .update({
            confidence_score: newConfidence,
            usage_frequency: newFrequency,
            success_rate: pattern.success_rate,
            learned_rules: pattern.learned_rules,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
          
        savedPatterns.push({ ...pattern, updated: true });
      } else {
        // Insert new pattern
        const { data: newPattern } = await supabase
          .from('ashen_learning_insights')
          .insert([{
            insight_type: determineInsightType(pattern.pattern_name),
            pattern_name: pattern.pattern_name,
            pattern_description: `Learned from ${pattern.usage_frequency} successful fixes`,
            confidence_score: pattern.confidence_score,
            usage_frequency: pattern.usage_frequency,
            success_rate: pattern.success_rate,
            learned_rules: pattern.learned_rules,
            applicable_contexts: pattern.applicable_contexts
          }])
          .select()
          .single();
          
        if (newPattern) {
          savedPatterns.push({ ...pattern, created: true });
        }
      }
    } catch (error) {
      console.error('Error saving pattern:', pattern.pattern_name, error);
    }
  }
  
  return savedPatterns;
}

function determineInsightType(patternName: string): string {
  if (patternName.includes('Coding Style')) return 'coding_style';
  if (patternName.includes('Layout') || patternName.includes('Responsive')) return 'ui_pattern';
  if (patternName.includes('Component') || patternName.includes('Architecture')) return 'component_structure';
  return 'fix_strategy';
}

async function analyzePatterns(supabase: any, patternType?: string) {
  let query = supabase
    .from('ashen_learning_insights')
    .select('*')
    .eq('is_active', true)
    .order('confidence_score', { ascending: false });

  if (patternType) {
    query = query.eq('insight_type', patternType);
  }

  const { data: patterns } = await query;

  return {
    patterns: patterns || [],
    total_patterns: patterns?.length || 0,
    high_confidence_patterns: patterns?.filter(p => p.confidence_score > 0.8).length || 0,
    success: true
  };
}

async function predictFix(supabase: any, issueData: any, context: any) {
  // Get relevant patterns based on context
  const { data: patterns } = await supabase
    .from('ashen_learning_insights')
    .select('*')
    .eq('is_active', true)
    .gte('confidence_score', 0.7)
    .order('confidence_score', { ascending: false });

  const relevantPatterns = patterns?.filter(pattern => {
    return matchesContext(pattern.applicable_contexts, context);
  }) || [];

  const predictions = relevantPatterns.map(pattern => ({
    pattern_name: pattern.pattern_name,
    confidence: pattern.confidence_score,
    suggested_fix: generateFixFromPattern(pattern, issueData),
    reasoning: `Based on ${pattern.usage_frequency} similar cases with ${Math.round(pattern.success_rate * 100)}% success rate`
  }));

  return {
    predictions,
    total_matches: predictions.length,
    highest_confidence: predictions[0]?.confidence || 0,
    success: true
  };
}

function matchesContext(patternContext: any, issueContext: any): boolean {
  if (!patternContext || !issueContext) return false;
  
  // Check file types
  if (patternContext.file_types && issueContext.file_path) {
    const fileExt = issueContext.file_path.split('.').pop();
    if (!patternContext.file_types.includes(fileExt)) return false;
  }
  
  // Check issue types
  if (patternContext.issue_types && issueContext.issue_type) {
    if (!patternContext.issue_types.includes(issueContext.issue_type)) return false;
  }
  
  return true;
}

function generateFixFromPattern(pattern: any, issueData: any): string {
  const rules = pattern.learned_rules;
  
  if (pattern.insight_type === 'ui_pattern' && rules.responsive_classes) {
    return `Apply responsive design: ${rules.responsive_classes.slice(0, 3).join(', ')}`;
  }
  
  if (pattern.insight_type === 'coding_style' && rules.import_patterns) {
    return `Follow CamerPulse import structure: ${rules.import_patterns[0] || 'organized imports'}`;
  }
  
  return `Apply learned pattern: ${pattern.pattern_name}`;
}

async function processFeedback(supabase: any, feedbackData: any) {
  const { healing_id, feedback, reason, admin_id } = feedbackData;
  
  // Update healing history with admin feedback
  const { error } = await supabase
    .from('ashen_auto_healing_history')
    .update({
      admin_feedback: feedback,
      admin_feedback_reason: reason,
      admin_id: admin_id,
      learning_weight: feedback === 'approved' ? 1.5 : feedback === 'rejected' ? 0.5 : 1.0
    })
    .eq('id', healing_id);

  if (error) {
    throw error;
  }

  return {
    message: 'Feedback processed successfully',
    feedback_applied: feedback,
    success: true
  };
}

async function updateLastTrainingRun(supabase: any) {
  await supabase
    .from('ashen_monitoring_config')
    .update({ config_value: `"${new Date().toISOString()}"` })
    .eq('config_key', 'learning_last_training_run');
}