import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DevRequest {
  action: 'analyze' | 'build' | 'preview' | 'revert' | 'clone' | 'status'
  prompt?: string
  requestType?: string
  targetUsers?: string[]
  buildMode?: string
  useCivicMemory?: boolean
  previewBeforeBuild?: boolean
  requestId?: string
  options?: any
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, prompt, requestType, targetUsers, buildMode, useCivicMemory, previewBeforeBuild, requestId, options }: DevRequest = await req.json()

    switch (action) {
      case 'analyze':
        return await analyzeRequest(supabaseClient, prompt!, requestType, targetUsers, buildMode, useCivicMemory, previewBeforeBuild)
      case 'build':
        return await buildFeature(supabaseClient, requestId!, options)
      case 'preview':
        return await generatePreview(supabaseClient, requestId!, options)
      case 'revert':
        return await revertFeature(supabaseClient, requestId!, options)
      case 'clone':
        return await cloneFeature(supabaseClient, requestId!, options)
      case 'status':
        return await getTerminalStatus(supabaseClient, options)
      default:
        throw new Error(`Unknown action: ${action}`)
    }
  } catch (error) {
    console.error('Error in Ashen Dev Terminal:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function analyzeRequest(
  supabaseClient: any,
  prompt: string,
  requestType: string = 'plugin',
  targetUsers: string[] = ['admin'],
  buildMode: string = 'think_first',
  useCivicMemory: boolean = true,
  previewBeforeBuild: boolean = true
) {
  console.log(`Analyzing dev request: ${prompt}`)

  // Create the request record
  const { data: request, error: requestError } = await supabaseClient
    .from('ashen_dev_requests')
    .insert({
      request_prompt: prompt,
      request_type: requestType,
      target_users: targetUsers,
      build_mode: buildMode,
      use_civic_memory: useCivicMemory,
      preview_before_build: previewBeforeBuild,
      status: 'analyzing',
      created_by: 'admin-user', // Would be auth.uid() in real implementation
      started_at: new Date().toISOString()
    })
    .select()
    .single()

  if (requestError) throw requestError

  // Run analysis function
  const { data: analysis, error: analysisError } = await supabaseClient
    .rpc('analyze_dev_request', {
      p_request_id: request.id,
      p_prompt: prompt,
      p_request_type: requestType
    })

  if (analysisError) throw analysisError

  // Create initial build steps
  const buildSteps = generateBuildSteps(prompt, analysis)
  
  for (const [index, step] of buildSteps.entries()) {
    await supabaseClient
      .from('ashen_build_logs')
      .insert({
        request_id: request.id,
        step_name: step.name,
        step_type: step.type,
        step_order: index + 1,
        status: 'pending'
      })
  }

  // Generate predicted artifacts
  const predictedArtifacts = await generatePredictedArtifacts(supabaseClient, request.id, prompt, analysis)

  return new Response(
    JSON.stringify({
      success: true,
      request: request,
      analysis: analysis,
      buildSteps: buildSteps,
      predictedArtifacts: predictedArtifacts,
      message: `Analysis complete. Estimated complexity: ${analysis.complexity_score}/10`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function buildFeature(supabaseClient: any, requestId: string, options: any) {
  console.log(`Building feature for request: ${requestId}`)

  // Get the request
  const { data: request } = await supabaseClient
    .from('ashen_dev_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (!request) throw new Error('Request not found')

  // Update status to building
  await supabaseClient
    .from('ashen_dev_requests')
    .update({ status: 'building', started_at: new Date().toISOString() })
    .eq('id', requestId)

  // Get build steps
  const { data: buildSteps } = await supabaseClient
    .from('ashen_build_logs')
    .select('*')
    .eq('request_id', requestId)
    .order('step_order')

  const generatedArtifacts = []

  // Execute each build step
  for (const step of buildSteps) {
    try {
      await supabaseClient
        .from('ashen_build_logs')
        .update({ 
          status: 'running', 
          started_at: new Date().toISOString() 
        })
        .eq('id', step.id)

      const artifact = await executeBuildStep(supabaseClient, requestId, step, request)
      
      if (artifact) {
        generatedArtifacts.push(artifact)
      }

      await supabaseClient
        .from('ashen_build_logs')
        .update({ 
          status: 'completed', 
          completed_at: new Date().toISOString(),
          output_data: artifact ? { artifact_id: artifact.id } : {}
        })
        .eq('id', step.id)

    } catch (error) {
      await supabaseClient
        .from('ashen_build_logs')
        .update({ 
          status: 'failed', 
          completed_at: new Date().toISOString(),
          error_details: error.message
        })
        .eq('id', step.id)

      throw error
    }
  }

  // Update request status to completed
  await supabaseClient
    .from('ashen_dev_requests')
    .update({ 
      status: 'completed', 
      completed_at: new Date().toISOString(),
      build_duration_seconds: Math.floor((Date.now() - new Date(request.started_at).getTime()) / 1000)
    })
    .eq('id', requestId)

  return new Response(
    JSON.stringify({
      success: true,
      requestId: requestId,
      generatedArtifacts: generatedArtifacts,
      message: `Feature built successfully with ${generatedArtifacts.length} artifacts`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function executeBuildStep(supabaseClient: any, requestId: string, step: any, request: any) {
  const prompt = request.request_prompt
  let artifact = null

  switch (step.step_type) {
    case 'schema_generation':
      artifact = await generateDatabaseSchema(supabaseClient, requestId, prompt, step)
      break
    case 'code_generation':
      artifact = await generateComponent(supabaseClient, requestId, prompt, step)
      break
    case 'policy_generation':
      artifact = await generateRLSPolicies(supabaseClient, requestId, prompt, step)
      break
    case 'integration':
      artifact = await generateIntegration(supabaseClient, requestId, prompt, step)
      break
    default:
      console.log(`Skipping unknown step type: ${step.step_type}`)
  }

  return artifact
}

async function generateDatabaseSchema(supabaseClient: any, requestId: string, prompt: string, step: any) {
  // Generate database schema based on prompt analysis
  const schemaName = extractEntityName(prompt)
  const columns = generateColumnsFromPrompt(prompt)
  
  const schema = {
    table_name: schemaName,
    columns: columns,
    indexes: generateIndexes(columns),
    constraints: generateConstraints(columns)
  }

  const sqlCode = generateCreateTableSQL(schema)

  const { data: artifact } = await supabaseClient
    .from('ashen_generated_artifacts')
    .insert({
      request_id: requestId,
      artifact_type: 'table_schema',
      artifact_name: schemaName,
      schema_definition: schema,
      generated_code: sqlCode,
      linked_modules: extractLinkedModules(prompt)
    })
    .select()
    .single()

  return artifact
}

async function generateComponent(supabaseClient: any, requestId: string, prompt: string, step: any) {
  const componentName = extractComponentName(prompt)
  const componentType = extractComponentType(prompt)
  
  const componentCode = generateReactComponent(componentName, componentType, prompt)

  const { data: artifact } = await supabaseClient
    .from('ashen_generated_artifacts')
    .insert({
      request_id: requestId,
      artifact_type: 'component',
      artifact_name: componentName,
      file_path: `src/components/${componentType}/${componentName}.tsx`,
      generated_code: componentCode,
      linked_modules: extractLinkedModules(prompt)
    })
    .select()
    .single()

  return artifact
}

async function generateRLSPolicies(supabaseClient: any, requestId: string, prompt: string, step: any) {
  const tableName = extractEntityName(prompt)
  const targetUsers = extractTargetUsers(prompt)
  
  const policies = generatePoliciesForUsers(tableName, targetUsers)
  const sqlCode = policies.map(policy => policy.sql).join('\n\n')

  const { data: artifact } = await supabaseClient
    .from('ashen_generated_artifacts')
    .insert({
      request_id: requestId,
      artifact_type: 'rls_policy',
      artifact_name: `${tableName}_policies`,
      generated_code: sqlCode,
      schema_definition: { policies: policies }
    })
    .select()
    .single()

  return artifact
}

async function generateIntegration(supabaseClient: any, requestId: string, prompt: string, step: any) {
  // Generate integration code (edge functions, API connections, etc.)
  const integrationName = extractIntegrationName(prompt)
  const integrationType = extractIntegrationType(prompt)
  
  const integrationCode = generateIntegrationCode(integrationName, integrationType, prompt)

  const { data: artifact } = await supabaseClient
    .from('ashen_generated_artifacts')
    .insert({
      request_id: requestId,
      artifact_type: 'integration',
      artifact_name: integrationName,
      file_path: `src/integrations/${integrationName}.ts`,
      generated_code: integrationCode
    })
    .select()
    .single()

  return artifact
}

function generateBuildSteps(prompt: string, analysis: any): any[] {
  const steps = [
    { name: 'Analyze Requirements', type: 'analysis' },
  ]

  if (analysis.estimated_artifacts?.includes('table_schema')) {
    steps.push({ name: 'Generate Database Schema', type: 'schema_generation' })
    steps.push({ name: 'Generate RLS Policies', type: 'policy_generation' })
  }

  if (analysis.estimated_artifacts?.includes('form_component') || analysis.estimated_artifacts?.includes('dashboard_component')) {
    steps.push({ name: 'Generate React Component', type: 'code_generation' })
  }

  if (analysis.estimated_artifacts?.includes('edge_function')) {
    steps.push({ name: 'Generate Edge Function', type: 'integration' })
  }

  steps.push({ name: 'Test Generated Code', type: 'testing' })

  return steps
}

async function generatePredictedArtifacts(supabaseClient: any, requestId: string, prompt: string, analysis: any) {
  const artifacts = []

  if (analysis.estimated_artifacts?.includes('table_schema')) {
    artifacts.push({
      type: 'table_schema',
      name: extractEntityName(prompt),
      description: `Database table for ${extractEntityName(prompt)}`
    })
  }

  if (analysis.estimated_artifacts?.includes('form_component')) {
    artifacts.push({
      type: 'component',
      name: `${extractEntityName(prompt)}Form`,
      description: `React form component for ${extractEntityName(prompt)}`
    })
  }

  if (analysis.estimated_artifacts?.includes('dashboard_component')) {
    artifacts.push({
      type: 'component', 
      name: `${extractEntityName(prompt)}Dashboard`,
      description: `Dashboard component for ${extractEntityName(prompt)}`
    })
  }

  return artifacts
}

async function getTerminalStatus(supabaseClient: any, options: any) {
  // Get recent requests
  const { data: recentRequests } = await supabaseClient
    .from('ashen_dev_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  // Get active builds
  const { data: activeBuilds } = await supabaseClient
    .from('ashen_dev_requests')
    .select('*')
    .in('status', ['analyzing', 'building'])

  // Get recent artifacts
  const { data: recentArtifacts } = await supabaseClient
    .from('ashen_generated_artifacts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  // Get civic memory patterns
  const { data: civicMemory } = await supabaseClient
    .from('ashen_civic_memory')
    .select('pattern_name, pattern_type, usage_count, success_rate, tags')
    .eq('is_active', true)
    .order('usage_count', { ascending: false })

  return new Response(
    JSON.stringify({
      success: true,
      status: {
        recentRequests: recentRequests,
        activeBuilds: activeBuilds,
        recentArtifacts: recentArtifacts,
        civicMemory: civicMemory,
        terminalHealth: calculateTerminalHealth(recentRequests, activeBuilds)
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

function calculateTerminalHealth(recentRequests: any[], activeBuilds: any[]) {
  const totalRequests = recentRequests.length
  const completedRequests = recentRequests.filter(r => r.status === 'completed').length
  const failedRequests = recentRequests.filter(r => r.status === 'failed').length
  
  const successRate = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 100
  const failureRate = totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0
  
  return {
    successRate: Math.round(successRate),
    failureRate: Math.round(failureRate),
    activeBuilds: activeBuilds.length,
    status: successRate > 80 ? 'healthy' : successRate > 60 ? 'warning' : 'critical'
  }
}

// Helper functions for extracting information from prompts
function extractEntityName(prompt: string): string {
  // Simple extraction - in real implementation would use NLP
  const patterns = [
    /build a (.*?) form/i,
    /create a (.*?) dashboard/i,
    /add a (.*?) system/i,
    /(.*?) complaint/i,
    /(.*?) feedback/i
  ]
  
  for (const pattern of patterns) {
    const match = prompt.match(pattern)
    if (match) {
      return match[1].replace(/\s+/g, '_').toLowerCase()
    }
  }
  
  return 'generated_feature'
}

function extractComponentName(prompt: string): string {
  const entityName = extractEntityName(prompt)
  
  if (prompt.includes('form')) return `${entityName}Form`
  if (prompt.includes('dashboard')) return `${entityName}Dashboard`
  if (prompt.includes('list')) return `${entityName}List`
  
  return `${entityName}Component`
}

function extractComponentType(prompt: string): string {
  if (prompt.includes('admin') || prompt.includes('minister')) return 'Admin'
  if (prompt.includes('public')) return 'Public'
  return 'Shared'
}

function extractTargetUsers(prompt: string): string[] {
  const users = []
  if (prompt.includes('public')) users.push('public')
  if (prompt.includes('admin')) users.push('admin')
  if (prompt.includes('minister')) users.push('minister')
  if (prompt.includes('researcher')) users.push('researcher')
  
  return users.length > 0 ? users : ['admin']
}

function extractLinkedModules(prompt: string): string[] {
  const modules = []
  if (prompt.includes('rating') || prompt.includes('feedback')) modules.push('ratings_core')
  if (prompt.includes('election') || prompt.includes('candidate')) modules.push('election_core')
  if (prompt.includes('sentiment') || prompt.includes('opinion')) modules.push('sentiment_layer')
  if (prompt.includes('party') || prompt.includes('political')) modules.push('party_system')
  
  return modules
}

function generateColumnsFromPrompt(prompt: string): any[] {
  const baseColumns = [
    { name: 'id', type: 'UUID', default: 'gen_random_uuid()', primary_key: true },
    { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', default: 'now()' },
    { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE', default: 'now()' }
  ]

  // Add specific columns based on prompt keywords
  if (prompt.includes('complaint') || prompt.includes('feedback')) {
    baseColumns.splice(-2, 0, 
      { name: 'title', type: 'TEXT', nullable: false },
      { name: 'description', type: 'TEXT', nullable: false },
      { name: 'category', type: 'TEXT', nullable: false },
      { name: 'status', type: 'TEXT', default: "'pending'" },
      { name: 'user_id', type: 'UUID', references: 'auth.users(id)' }
    )
  }

  if (prompt.includes('region') || prompt.includes('location')) {
    baseColumns.splice(-2, 0, { name: 'region', type: 'TEXT' })
  }

  if (prompt.includes('rating') || prompt.includes('score')) {
    baseColumns.splice(-2, 0, { name: 'rating', type: 'INTEGER' })
  }

  return baseColumns
}

function generateCreateTableSQL(schema: any): string {
  const columns = schema.columns.map((col: any) => {
    let columnDef = `  ${col.name} ${col.type}`
    if (col.primary_key) columnDef += ' PRIMARY KEY'
    if (col.nullable === false) columnDef += ' NOT NULL'
    if (col.default) columnDef += ` DEFAULT ${col.default}`
    if (col.references) columnDef += ` REFERENCES ${col.references}`
    return columnDef
  }).join(',\n')

  return `CREATE TABLE public.${schema.table_name} (\n${columns}\n);`
}

function generateReactComponent(name: string, type: string, prompt: string): string {
  const isForm = prompt.includes('form')
  const isDashboard = prompt.includes('dashboard')

  if (isForm) {
    return generateFormComponent(name, prompt)
  } else if (isDashboard) {
    return generateDashboardComponent(name, prompt)
  } else {
    return generateBasicComponent(name, prompt)
  }
}

function generateFormComponent(name: string, prompt: string): string {
  return `import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ${name}: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    region: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('${name.toLowerCase().replace('form', '')}')
        .insert(formData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your submission has been recorded",
      });

      setFormData({ title: '', description: '', category: '', region: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit form",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>${name.replace(/([A-Z])/g, ' $1').trim()}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
          <Textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
          <Input
            placeholder="Category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            required
          />
          <Input
            placeholder="Region"
            value={formData.region}
            onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
          />
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ${name};`
}

function generateDashboardComponent(name: string, prompt: string): string {
  return `import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

const ${name}: React.FC = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: items, error } = await supabase
        .from('${name.toLowerCase().replace('dashboard', '')}')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setData(items || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">${name.replace(/([A-Z])/g, ' $1').trim()}</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((item: any) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="text-lg">{item.title || 'Item'}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                {item.description || 'No description'}
              </p>
              <div className="flex justify-between items-center">
                <Badge variant="outline">{item.category || 'General'}</Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No data available
        </div>
      )}
    </div>
  );
};

export default ${name};`
}

function generateBasicComponent(name: string, prompt: string): string {
  return `import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ${name}Props {
  // Add props as needed
}

const ${name}: React.FC<${name}Props> = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>${name.replace(/([A-Z])/g, ' $1').trim()}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Generated component based on: "${prompt}"</p>
        {/* Add component logic here */}
      </CardContent>
    </Card>
  );
};

export default ${name};`
}

function generateIndexes(columns: any[]): any[] {
  const indexes = []
  
  // Add indexes for commonly queried columns
  const indexableColumns = columns.filter(col => 
    ['user_id', 'status', 'category', 'region', 'created_at'].includes(col.name)
  )
  
  indexableColumns.forEach(col => {
    indexes.push({
      name: `idx_${col.name}`,
      column: col.name,
      type: 'btree'
    })
  })
  
  return indexes
}

function generateConstraints(columns: any[]): any[] {
  const constraints = []
  
  // Add foreign key constraints
  columns.forEach(col => {
    if (col.references) {
      constraints.push({
        type: 'foreign_key',
        column: col.name,
        references: col.references
      })
    }
  })
  
  return constraints
}

function generatePoliciesForUsers(tableName: string, targetUsers: string[]): any[] {
  const policies = []
  
  if (targetUsers.includes('public')) {
    policies.push({
      name: `${tableName}_public_insert`,
      sql: `CREATE POLICY "${tableName}_public_insert" ON public.${tableName}
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);`
    })
    
    policies.push({
      name: `${tableName}_public_select`,
      sql: `CREATE POLICY "${tableName}_public_select" ON public.${tableName}
  FOR SELECT 
  TO authenticated
  USING (true);`
    })
  }
  
  if (targetUsers.includes('admin')) {
    policies.push({
      name: `${tableName}_admin_all`,
      sql: `CREATE POLICY "${tableName}_admin_all" ON public.${tableName}
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );`
    })
  }
  
  return policies
}

function extractIntegrationName(prompt: string): string {
  if (prompt.includes('scraper')) return 'data_scraper'
  if (prompt.includes('api')) return 'api_integration'
  if (prompt.includes('notification')) return 'notification_service'
  return 'custom_integration'
}

function extractIntegrationType(prompt: string): string {
  if (prompt.includes('scraper')) return 'scraper'
  if (prompt.includes('api')) return 'api'
  if (prompt.includes('webhook')) return 'webhook'
  return 'service'
}

function generateIntegrationCode(name: string, type: string, prompt: string): string {
  if (type === 'scraper') {
    return `// Generated data scraper integration
export async function ${name}() {
  console.log('Running ${name} based on: ${prompt}');
  
  try {
    // Add scraping logic here
    const data = await fetchData();
    return { success: true, data };
  } catch (error) {
    console.error('Scraper error:', error);
    return { success: false, error: error.message };
  }
}

async function fetchData() {
  // Implement data fetching logic
  return [];
}`
  }
  
  return `// Generated integration: ${name}
export async function ${name}() {
  console.log('Running ${name} based on: ${prompt}');
  
  try {
    // Add integration logic here
    return { success: true };
  } catch (error) {
    console.error('Integration error:', error);
    return { success: false, error: error.message };
  }
}`
}

async function generatePreview(supabaseClient: any, requestId: string, options: any) {
  // Generate a preview of what will be built without actually building it
  const { data: request } = await supabaseClient
    .from('ashen_dev_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  const { data: artifacts } = await supabaseClient
    .from('ashen_generated_artifacts')
    .select('*')
    .eq('request_id', requestId)

  return new Response(
    JSON.stringify({
      success: true,
      preview: {
        request: request,
        artifacts: artifacts,
        summary: `Preview for: ${request.request_prompt}`
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function revertFeature(supabaseClient: any, requestId: string, options: any) {
  // Mark all artifacts as reverted
  await supabaseClient
    .from('ashen_generated_artifacts')
    .update({ 
      reverted_at: new Date().toISOString(),
      revert_reason: options.reason || 'Manual revert'
    })
    .eq('request_id', requestId)

  // Update request status
  await supabaseClient
    .from('ashen_dev_requests')
    .update({ status: 'reverted' })
    .eq('id', requestId)

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Feature reverted successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function cloneFeature(supabaseClient: any, requestId: string, options: any) {
  // Clone an existing request for modification
  const { data: originalRequest } = await supabaseClient
    .from('ashen_dev_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  const { data: clonedRequest } = await supabaseClient
    .from('ashen_dev_requests')
    .insert({
      ...originalRequest,
      id: undefined,
      request_prompt: options.newPrompt || originalRequest.request_prompt,
      status: 'pending',
      created_at: new Date().toISOString(),
      started_at: null,
      completed_at: null
    })
    .select()
    .single()

  return new Response(
    JSON.stringify({
      success: true,
      clonedRequest: clonedRequest,
      message: 'Feature cloned successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}