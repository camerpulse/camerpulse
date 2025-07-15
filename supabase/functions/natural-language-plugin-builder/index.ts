import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PluginRequest {
  action: 'analyze' | 'generate' | 'status' | 'rollback';
  requestText?: string;
  pluginName?: string;
  requestId?: string;
  options?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { action, requestText, pluginName, requestId, options }: PluginRequest = await req.json();

    let result;
    switch (action) {
      case 'analyze':
        result = await analyzePluginRequest(supabaseClient, requestText!, pluginName);
        break;
      case 'generate':
        result = await generatePlugin(supabaseClient, requestId!, options);
        break;
      case 'status':
        result = await getPluginStatus(supabaseClient, requestId!);
        break;
      case 'rollback':
        result = await rollbackPlugin(supabaseClient, requestId!);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in natural-language-plugin-builder:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzePluginRequest(supabaseClient: any, requestText: string, pluginName?: string) {
  console.log('Analyzing plugin request:', requestText);

  // Parse the request using simple pattern matching
  const parsedRequirements = parseNaturalLanguageRequest(requestText);
  
  // Check for similar existing plugins
  const { data: similarityResult } = await supabaseClient.rpc('analyze_plugin_similarity', {
    p_request_text: requestText,
    p_plugin_name: pluginName
  });

  // Create the plugin request record
  const { data: requestRecord, error } = await supabaseClient
    .from('ashen_plugin_requests')
    .insert({
      request_text: requestText,
      plugin_name: pluginName || parsedRequirements.suggestedName,
      parsed_requirements: parsedRequirements,
      target_roles: parsedRequirements.targetRoles,
      similarity_check_results: similarityResult,
      estimated_complexity: parsedRequirements.complexity,
      files_to_create: parsedRequirements.filesToCreate,
      tables_to_create: parsedRequirements.tablesToCreate,
      functions_to_create: parsedRequirements.functionsToCreate
    })
    .select()
    .single();

  if (error) throw error;

  return {
    requestId: requestRecord.id,
    parsedRequirements,
    similarityCheck: similarityResult,
    recommendation: similarityResult?.recommendation || 'proceed',
    estimatedSteps: parsedRequirements.estimatedSteps
  };
}

async function generatePlugin(supabaseClient: any, requestId: string, options: any = {}) {
  console.log('Generating plugin for request:', requestId);

  // Get the request details
  const { data: request } = await supabaseClient
    .from('ashen_plugin_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (!request) throw new Error('Plugin request not found');

  // Update status to generating
  await supabaseClient.rpc('update_plugin_request_status', {
    p_request_id: requestId,
    p_status: 'generating'
  });

  const requirements = request.parsed_requirements;
  const steps = generatePluginSteps(requirements);

  // Insert generation steps
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    await supabaseClient
      .from('ashen_plugin_generation_steps')
      .insert({
        request_id: requestId,
        step_name: step.name,
        step_type: step.type,
        step_order: i + 1,
        status: 'pending'
      });
  }

  // Simulate plugin generation process
  let generatedFiles = [];
  let tablesCreated = [];
  let functionsCreated = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    
    // Update step status to in_progress
    await supabaseClient
      .from('ashen_plugin_generation_steps')
      .update({ 
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .eq('request_id', requestId)
      .eq('step_order', i + 1);

    // Simulate generation work
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    let generatedCode = '';
    let filePath = '';

    switch (step.type) {
      case 'schema':
        generatedCode = generateTableSchema(requirements);
        tablesCreated.push(step.tableName || `${requirements.suggestedName.toLowerCase()}_data`);
        break;
      case 'component':
        generatedCode = generateReactComponent(requirements);
        filePath = `src/components/${requirements.suggestedName}/${step.componentName}.tsx`;
        generatedFiles.push(filePath);
        break;
      case 'function':
        generatedCode = generateEdgeFunction(requirements);
        filePath = `supabase/functions/${requirements.suggestedName.toLowerCase()}/index.ts`;
        functionsCreated.push(requirements.suggestedName.toLowerCase());
        generatedFiles.push(filePath);
        break;
      case 'route':
        generatedCode = generateRouteConfig(requirements);
        filePath = step.routePath || `/plugins/${requirements.suggestedName.toLowerCase()}`;
        break;
    }

    // Update step as completed
    await supabaseClient
      .from('ashen_plugin_generation_steps')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        generated_code: generatedCode,
        file_path: filePath
      })
      .eq('request_id', requestId)
      .eq('step_order', i + 1);
  }

  // Create the generated plugin record
  const { data: plugin } = await supabaseClient
    .from('ashen_generated_plugins')
    .insert({
      request_id: requestId,
      plugin_name: request.plugin_name,
      plugin_description: requirements.description,
      plugin_type: requirements.pluginType,
      files_created: generatedFiles,
      tables_created: tablesCreated,
      functions_created: functionsCreated,
      configuration: requirements,
      permissions: { roles: requirements.targetRoles },
      rollback_data: {
        originalFiles: [],
        createdAt: new Date().toISOString()
      }
    })
    .select()
    .single();

  // Update request status to completed
  await supabaseClient.rpc('update_plugin_request_status', {
    p_request_id: requestId,
    p_status: 'completed'
  });

  return {
    pluginId: plugin.id,
    status: 'completed',
    filesCreated: generatedFiles,
    tablesCreated,
    functionsCreated,
    message: `Plugin "${request.plugin_name}" generated successfully!`
  };
}

async function getPluginStatus(supabaseClient: any, requestId: string) {
  const { data: request } = await supabaseClient
    .from('ashen_plugin_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  const { data: steps } = await supabaseClient
    .from('ashen_plugin_generation_steps')
    .select('*')
    .eq('request_id', requestId)
    .order('step_order');

  return {
    status: request?.status,
    steps: steps || [],
    progress: steps ? Math.round((steps.filter(s => s.status === 'completed').length / steps.length) * 100) : 0
  };
}

async function rollbackPlugin(supabaseClient: any, requestId: string) {
  // This would implement plugin rollback logic
  // For demo purposes, we'll just update the status
  
  await supabaseClient
    .from('ashen_generated_plugins')
    .update({ 
      status: 'rolled_back',
      rollback_timestamp: new Date().toISOString()
    })
    .eq('request_id', requestId);

  return { success: true, message: 'Plugin rolled back successfully' };
}

function parseNaturalLanguageRequest(requestText: string) {
  const text = requestText.toLowerCase();
  
  // Extract plugin type
  let pluginType = 'component';
  if (text.includes('tracker') || text.includes('monitor')) pluginType = 'tracker';
  if (text.includes('form') || text.includes('submit')) pluginType = 'form';
  if (text.includes('dashboard') || text.includes('analytics')) pluginType = 'dashboard';
  if (text.includes('rating') || text.includes('review')) pluginType = 'rating';

  // Extract target roles
  const targetRoles = [];
  if (text.includes('admin')) targetRoles.push('admin');
  if (text.includes('governor') || text.includes('official')) targetRoles.push('government_official');
  if (text.includes('citizen') || text.includes('public')) targetRoles.push('citizen');
  if (targetRoles.length === 0) targetRoles.push('citizen'); // default

  // Generate suggested name
  const words = requestText.split(' ').slice(0, 3);
  const suggestedName = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');

  // Estimate complexity based on keywords
  let complexity = 1;
  if (text.includes('upload') || text.includes('image')) complexity += 1;
  if (text.includes('anonymous') || text.includes('secure')) complexity += 1;
  if (text.includes('track') || text.includes('analytics')) complexity += 1;
  if (text.includes('region') || text.includes('location')) complexity += 1;

  return {
    suggestedName,
    pluginType,
    targetRoles,
    complexity,
    description: requestText,
    filesToCreate: [
      `src/components/${suggestedName}/${suggestedName}.tsx`,
      `src/components/${suggestedName}/index.ts`
    ],
    tablesToCreate: [`${suggestedName.toLowerCase()}_data`],
    functionsToCreate: [`${suggestedName.toLowerCase()}-api`],
    estimatedSteps: complexity + 2
  };
}

function generatePluginSteps(requirements: any) {
  const steps = [];

  // Always start with schema
  if (requirements.tablesToCreate?.length > 0) {
    steps.push({
      name: 'Create Database Schema',
      type: 'schema',
      tableName: requirements.tablesToCreate[0]
    });
  }

  // Add component generation
  steps.push({
    name: 'Generate React Component',
    type: 'component',
    componentName: requirements.suggestedName
  });

  // Add API function if needed
  if (requirements.complexity > 1) {
    steps.push({
      name: 'Create Edge Function',
      type: 'function'
    });
  }

  // Add route configuration
  steps.push({
    name: 'Configure Route',
    type: 'route',
    routePath: `/plugins/${requirements.suggestedName.toLowerCase()}`
  });

  return steps;
}

function generateTableSchema(requirements: any): string {
  const tableName = requirements.tablesToCreate?.[0] || `${requirements.suggestedName.toLowerCase()}_data`;
  
  return `-- Generated table for ${requirements.suggestedName}
CREATE TABLE public.${tableName} (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own ${tableName}"
ON public.${tableName}
FOR ALL
USING (auth.uid() = user_id);`;
}

function generateReactComponent(requirements: any): string {
  return `import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ${requirements.suggestedName}Props {
  // Add props as needed
}

export function ${requirements.suggestedName}({ }: ${requirements.suggestedName}Props) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from('${requirements.tablesToCreate?.[0] || 'plugin_data'}')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setData(result || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>${requirements.suggestedName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            ${requirements.description}
          </p>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ${requirements.suggestedName};`;
}

function generateEdgeFunction(requirements: any): string {
  return `import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { action, data } = await req.json();

    let result;
    switch (action) {
      case 'create':
        result = await createRecord(supabaseClient, data);
        break;
      case 'update':
        result = await updateRecord(supabaseClient, data);
        break;
      default:
        throw new Error('Unknown action');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createRecord(supabaseClient: any, data: any) {
  const { data: result, error } = await supabaseClient
    .from('${requirements.tablesToCreate?.[0] || 'plugin_data'}')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return result;
}

async function updateRecord(supabaseClient: any, data: any) {
  const { data: result, error } = await supabaseClient
    .from('${requirements.tablesToCreate?.[0] || 'plugin_data'}')
    .update(data)
    .eq('id', data.id)
    .select()
    .single();

  if (error) throw error;
  return result;
}`;
}

function generateRouteConfig(requirements: any): string {
  return `// Route configuration for ${requirements.suggestedName}
{
  path: "/plugins/${requirements.suggestedName.toLowerCase()}",
  component: lazy(() => import("@/components/${requirements.suggestedName}/${requirements.suggestedName}")),
  meta: {
    title: "${requirements.suggestedName}",
    description: "${requirements.description}",
    roles: ${JSON.stringify(requirements.targetRoles)}
  }
}`;
}