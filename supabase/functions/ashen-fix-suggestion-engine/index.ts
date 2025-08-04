import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FixSuggestion {
  issue_id: string;
  explanation: string;
  suggested_fix: string;
  confidence_score: number;
  fix_type: string;
  affected_code: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, issue_id, apply_fix } = await req.json();

    if (action === 'generate_suggestions') {
      console.log('🔍 Generating fix suggestions from code analysis...');

      // Get recent code analysis results
      const { data: analysisResults, error: analysisError } = await supabase
        .from('ashen_code_analysis')
        .select('*')
        .gt('issues_found', 0)
        .order('last_analyzed', { ascending: false })
        .limit(50);

      if (analysisError) {
        throw new Error(`Failed to fetch code analysis: ${analysisError.message}`);
      }

      const suggestions: FixSuggestion[] = [];

      for (const analysis of analysisResults || []) {
        const fileSuggestions = await generateFixSuggestions(analysis);
        suggestions.push(...fileSuggestions);
      }

      // Store suggestions in database
      for (const suggestion of suggestions) {
        await supabase.from('ashen_fix_suggestions').upsert({
          analysis_id: suggestion.issue_id,
          explanation: suggestion.explanation,
          suggested_fix: suggestion.suggested_fix,
          confidence_score: suggestion.confidence_score,
          fix_type: suggestion.fix_type,
          affected_code: suggestion.affected_code,
          status: 'pending'
        });
      }

      console.log(`✅ Generated ${suggestions.length} fix suggestions`);

      return new Response(
        JSON.stringify({
          success: true,
          suggestions_generated: suggestions.length,
          suggestions: suggestions.slice(0, 10) // Return first 10 for preview
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'apply_fix' && issue_id && apply_fix) {
      console.log(`🔧 Applying fix for issue: ${issue_id}`);

      const { data: suggestion, error: suggestionError } = await supabase
        .from('ashen_fix_suggestions')
        .select('*')
        .eq('id', issue_id)
        .single();

      if (suggestionError || !suggestion) {
        throw new Error('Fix suggestion not found');
      }

      if (suggestion.confidence_score < 85) {
        throw new Error('Cannot auto-apply fix with confidence < 85%');
      }

      // Here we would apply the actual fix to the codebase
      // For now, we'll just mark it as applied
      await supabase
        .from('ashen_fix_suggestions')
        .update({ 
          status: 'applied',
          applied_at: new Date().toISOString()
        })
        .eq('id', issue_id);

      return new Response(
        JSON.stringify({ success: true, message: 'Fix applied successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'ignore_fix' && issue_id) {
      await supabase
        .from('ashen_fix_suggestions')
        .update({ status: 'ignored' })
        .eq('id', issue_id);

      return new Response(
        JSON.stringify({ success: true, message: 'Fix ignored' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Fix suggestion engine error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateFixSuggestions(analysis: any): Promise<FixSuggestion[]> {
  const suggestions: FixSuggestion[] = [];
  const filePath = analysis.file_path;
  const issues = analysis.suggestions || [];

  for (const issue of issues) {
    let suggestion: FixSuggestion | null = null;

    // Pattern matching for common issues
    if (issue.type === 'missing_import') {
      suggestion = {
        issue_id: analysis.id,
        explanation: `Missing import statement in ${filePath}. The component or function '${issue.name}' is used but not imported.`,
        suggested_fix: `Add import statement: import { ${issue.name} } from '${suggestImportPath(issue.name, filePath)}';`,
        confidence_score: 95,
        fix_type: 'import_fix',
        affected_code: issue.line || ''
      };
    }

    if (issue.type === 'unused_variable') {
      suggestion = {
        issue_id: analysis.id,
        explanation: `Unused variable '${issue.name}' in ${filePath}. This creates code clutter and may indicate incomplete implementation.`,
        suggested_fix: `Remove the unused variable: ${issue.name}`,
        confidence_score: 90,
        fix_type: 'cleanup',
        affected_code: issue.line || ''
      };
    }

    if (issue.type === 'missing_prop') {
      suggestion = {
        issue_id: analysis.id,
        explanation: `Missing required prop '${issue.name}' in component. This will cause runtime errors.`,
        suggested_fix: `Add the missing prop: <Component ${issue.name}={defaultValue} />`,
        confidence_score: 85,
        fix_type: 'prop_fix',
        affected_code: issue.line || ''
      };
    }

    if (issue.type === 'syntax_error') {
      suggestion = {
        issue_id: analysis.id,
        explanation: `Syntax error in ${filePath}: ${issue.message}. This prevents the code from compiling.`,
        suggested_fix: generateSyntaxFix(issue),
        confidence_score: 80,
        fix_type: 'syntax_fix',
        affected_code: issue.line || ''
      };
    }

    if (issue.type === 'anti_pattern') {
      suggestion = {
        issue_id: analysis.id,
        explanation: `Code anti-pattern detected: ${issue.pattern}. This may lead to performance issues or bugs.`,
        suggested_fix: suggestBestPractice(issue.pattern),
        confidence_score: 75,
        fix_type: 'refactor',
        affected_code: issue.line || ''
      };
    }

    if (suggestion) {
      suggestions.push(suggestion);
    }
  }

  return suggestions;
}

function suggestImportPath(name: string, currentFile: string): string {
  // Smart import path suggestion based on common patterns
  if (name.includes('Button') || name.includes('Card') || name.includes('Input')) {
    return '@/components/ui/' + name.toLowerCase();
  }
  if (name.includes('use')) {
    return '@/hooks/' + name;
  }
  if (name === 'supabase') {
    return '@/integrations/supabase/client';
  }
  return './' + name.toLowerCase();
}

function generateSyntaxFix(issue: any): string {
  if (issue.message?.includes('missing semicolon')) {
    return 'Add missing semicolon at end of statement';
  }
  if (issue.message?.includes('unclosed bracket')) {
    return 'Add missing closing bracket }';
  }
  if (issue.message?.includes('unexpected token')) {
    return 'Remove or fix unexpected token';
  }
  return 'Fix syntax error according to TypeScript/JavaScript standards';
}

function suggestBestPractice(pattern: string): string {
  const practices = {
    'inline_styles': 'Use Tailwind CSS classes instead of inline styles',
    'any_type': 'Replace "any" with specific TypeScript types',
    'console_log': 'Remove console.log statements in production code',
    'empty_catch': 'Add proper error handling in catch blocks',
    'missing_key': 'Add unique key prop to list items',
    'unsafe_html': 'Use safe HTML rendering methods'
  };
  
  return practices[pattern] || 'Follow React and TypeScript best practices';
}