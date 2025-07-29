import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { GitBranch, FileCode, CheckCircle, XCircle, Clock, AlertTriangle, Upload, Download, Diff, Info, ArrowRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PatchProposal {
  id: string;
  file_path: string;
  component_name: string;
  error_id: string;
  fix_type: string;
  fix_description: string;
  confidence_score: number;
  code_before: string;
  code_after: string;
  reasoning: string;
  status: 'pending' | 'approved' | 'rejected' | 'deployed' | 'failed';
  created_at: string;
  approved_at?: string;
  deployed_at?: string;
  approved_by?: string;
  risk_level: 'low' | 'medium' | 'high';
}

interface DeploymentResult {
  patch_id: string;
  success: boolean;
  error_message?: string;
  deployment_time: number;
  files_updated: string[];
}

export default function PatchDeploymentPipeline() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [patchProposals, setPatchProposals] = useState<PatchProposal[]>([]);
  const [deploymentResults, setDeploymentResults] = useState<DeploymentResult[]>([]);
  const [selectedPatch, setSelectedPatch] = useState<PatchProposal | null>(null);

  useEffect(() => {
    loadPatchDeploymentConfig();
    if (isEnabled) {
      loadPatchProposals();
      loadDeploymentResults();
    }
  }, [isEnabled]);

  const loadPatchDeploymentConfig = async () => {
    try {
      const { data } = await supabase
        .from('ashen_monitoring_config')
        .select('config_value')
        .eq('config_key', 'patch_deployment_enabled')
        .single();

      if (data) {
        setIsEnabled(data.config_value === 'true');
      }
    } catch (error) {
      console.log('Patch deployment config not found, using default');
    }
  };

  const togglePatchDeployment = async (enabled: boolean) => {
    try {
      await supabase
        .from('ashen_monitoring_config')
        .upsert({
          config_key: 'patch_deployment_enabled',
          config_value: enabled.toString(),
          is_active: true,
          updated_at: new Date().toISOString()
        });

      setIsEnabled(enabled);
      
      if (enabled) {
        await generatePatchProposals();
        toast.success('Patch deployment pipeline enabled - generating proposals...');
      } else {
        toast.info('Patch deployment pipeline disabled');
      }
    } catch (error) {
      toast.error('Failed to update patch deployment settings');
    }
  };

  const generatePatchProposals = async () => {
    setIsGenerating(true);
    try {
      // Load recent errors that can be auto-fixed
      const { data: errors } = await supabase
        .from('ashen_error_logs')
        .select('*')
        .eq('status', 'open')
        .not('suggested_fix', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!errors) {
        setPatchProposals([]);
        return;
      }

      // Generate patch proposals for fixable errors
      const proposals = errors.map(error => generatePatchProposal(error));
      setPatchProposals(proposals);

      toast.success(`Generated ${proposals.length} patch proposals`);
    } catch (error) {
      toast.error('Failed to generate patch proposals');
      console.error('Patch generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePatchProposal = (error: any): PatchProposal => {
    const fixTypes = {
      'TypeError': 'null_safety',
      'ReferenceError': 'import_fix',
      'SyntaxError': 'syntax_correction',
      'NetworkError': 'error_boundary'
    };

    const fixType = fixTypes[error.error_type as keyof typeof fixTypes] || 'generic_fix';
    
    const codeBefore = generateBeforeCode(error);
    const codeAfter = generateAfterCode(error, fixType);
    
    return {
      id: `patch_${error.id}_${Date.now()}`,
      file_path: error.component_path,
      component_name: error.component_path.split('/').pop()?.replace('.tsx', '') || 'Unknown',
      error_id: error.id,
      fix_type: fixType,
      fix_description: error.suggested_fix || 'Apply automated fix',
      confidence_score: error.confidence_score || 0.7,
      code_before: codeBefore,
      code_after: codeAfter,
      reasoning: generateFixReasoning(error, fixType),
      status: 'pending',
      created_at: new Date().toISOString(),
      risk_level: determineRiskLevel(error.severity, fixType)
    };
  };

  const generateBeforeCode = (error: any): string => {
    const samples = {
      'TypeError': `// Line ${error.line_number || 42}
const user = data.user;
const name = user.profile.name; // Error: Cannot read property 'name' of undefined`,
      'ReferenceError': `// Line ${error.line_number || 15}
import { Button } from "@/components/ui/button";
// Missing import for Card component
<Card>...</Card> // Error: Card is not defined`,
      'SyntaxError': `// Line ${error.line_number || 28}
const handleClick = () => {
  console.log("clicked")
} // Missing semicolon`,
      'NetworkError': `// Line ${error.line_number || 35}
const fetchData = async () => {
  const response = await fetch('/api/data');
  return response.json(); // No error handling
};`
    };

    return samples[error.error_type as keyof typeof samples] || 
           `// Error in ${error.component_path}\n// ${error.error_message}`;
  };

  const generateAfterCode = (error: any, fixType: string): string => {
    const fixes = {
      'null_safety': `// Line ${error.line_number || 42}
const user = data.user;
const name = user?.profile?.name || 'Unknown'; // Fixed: Added optional chaining`,
      'import_fix': `// Line ${error.line_number || 15}
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card"; // Fixed: Added missing import
<Card>...</Card>`,
      'syntax_correction': `// Line ${error.line_number || 28}
const handleClick = () => {
  console.log("clicked");
}; // Fixed: Added semicolon`,
      'error_boundary': `// Line ${error.line_number || 35}
const fetchData = async () => {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('Network error');
    return response.json();
  } catch (error) {
    console.error('Fetch failed:', error);
    throw error;
  }
}; // Fixed: Added error handling`
    };

    return fixes[fixType as keyof typeof fixes] || 
           `// Applied ${fixType} fix for: ${error.error_message}`;
  };

  const generateFixReasoning = (error: any, fixType: string): string => {
    const reasonings = {
      'null_safety': 'Added optional chaining to prevent null/undefined reference errors. This is a safe fix that maintains existing functionality while preventing crashes.',
      'import_fix': 'Added missing import statement. This resolves the reference error without affecting other code.',
      'syntax_correction': 'Fixed syntax error by adding missing punctuation. This is a safe change that resolves the compilation issue.',
      'error_boundary': 'Added proper error handling and network error checks. This improves reliability without changing the core functionality.'
    };

    return reasonings[fixType as keyof typeof reasonings] || 
           `Automated fix applied based on error pattern analysis. Confidence: ${Math.round((error.confidence_score || 0.7) * 100)}%`;
  };

  const determineRiskLevel = (severity: string, fixType: string): 'low' | 'medium' | 'high' => {
    if (fixType === 'syntax_correction' || fixType === 'import_fix') return 'low';
    if (severity === 'critical' || fixType === 'error_boundary') return 'high';
    return 'medium';
  };

  const approvePatch = async (patch: PatchProposal) => {
    try {
      // Update patch status
      const updatedPatch = {
        ...patch,
        status: 'approved' as const,
        approved_at: new Date().toISOString(),
        approved_by: 'Admin User'
      };

      setPatchProposals(prev => 
        prev.map(p => p.id === patch.id ? updatedPatch : p)
      );

      toast.success('Patch approved - deploying to IDE...');
      
      // Simulate deployment
      setTimeout(() => deployPatch(updatedPatch), 1000);
    } catch (error) {
      toast.error('Failed to approve patch');
    }
  };

  const deployPatch = async (patch: PatchProposal) => {
    try {
      // Simulate IDE deployment
      const deploymentResult: DeploymentResult = {
        patch_id: patch.id,
        success: Math.random() > 0.1, // 90% success rate
        deployment_time: Math.floor(Math.random() * 3000) + 1000,
        files_updated: [patch.file_path]
      };

      if (!deploymentResult.success) {
        deploymentResult.error_message = 'Deployment failed: File lock conflict';
      }

      setDeploymentResults(prev => [deploymentResult, ...prev]);

      // Update patch status
      setPatchProposals(prev => 
        prev.map(p => p.id === patch.id ? {
          ...p,
          status: deploymentResult.success ? 'deployed' : 'failed',
          deployed_at: new Date().toISOString()
        } : p)
      );

      if (deploymentResult.success) {
        toast.success(`Patch deployed successfully in ${deploymentResult.deployment_time}ms`);
        
        // Mark original error as resolved
        await supabase
          .from('ashen_error_logs')
          .update({
            status: 'resolved',
            resolved_at: new Date().toISOString(),
            resolved_by: 'ashen_patch_deployment'
          })
          .eq('id', patch.error_id);
      } else {
        toast.error(`Deployment failed: ${deploymentResult.error_message}`);
      }
    } catch (error) {
      toast.error('Deployment failed with unexpected error');
    }
  };

  const rejectPatch = async (patch: PatchProposal) => {
    setPatchProposals(prev => 
      prev.map(p => p.id === patch.id ? { ...p, status: 'rejected' } : p)
    );
    toast.info('Patch rejected');
  };

  const loadPatchProposals = async () => {
    // In a real implementation, this would load from database
    if (patchProposals.length === 0) {
      await generatePatchProposals();
    }
  };

  const loadDeploymentResults = async () => {
    // In a real implementation, this would load from database
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'text-emerald-500';
      case 'approved': return 'text-blue-500';
      case 'rejected': return 'text-destructive';
      case 'failed': return 'text-orange-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed': return <CheckCircle className="h-4 w-4" />;
      case 'approved': return <Upload className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-destructive border-destructive bg-destructive/10';
      case 'medium': return 'text-amber-500 border-amber-500 bg-amber-500/10';
      case 'low': return 'text-emerald-500 border-emerald-500 bg-emerald-500/10';
      default: return 'text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> This interface demonstrates how Ashen could integrate with the Lovable IDE patch manager. 
          Actual IDE integration would require implementation by the Lovable development team.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Patch Deployment Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Enable Patch Deployment Pipeline</h4>
              <p className="text-sm text-muted-foreground">
                Allow Ashen to submit patch proposals directly to the IDE for approval and deployment
              </p>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={togglePatchDeployment}
            />
          </div>

          {isEnabled && (
            <div className="flex items-center gap-4 pt-4 border-t">
              <Button
                onClick={generatePatchProposals}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Generate Patch Proposals'}
              </Button>
              
              <div className="text-sm text-muted-foreground">
                {patchProposals.length} proposals • {patchProposals.filter(p => p.status === 'deployed').length} deployed
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isEnabled && (
        <Tabs defaultValue="proposals" className="space-y-4">
          <TabsList>
            <TabsTrigger value="proposals">Patch Proposals</TabsTrigger>
            <TabsTrigger value="deployed">Deployment History</TabsTrigger>
          </TabsList>

          <TabsContent value="proposals">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCode className="h-5 w-5" />
                  Patch Proposals ({patchProposals.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {patchProposals.map((patch) => (
                      <div key={patch.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(patch.status)}
                            <h4 className="font-medium">{patch.component_name}</h4>
                            <Badge variant="outline" className={getStatusColor(patch.status)}>
                              {patch.status}
                            </Badge>
                            <Badge variant="outline" className={getRiskColor(patch.risk_level)}>
                              {patch.risk_level} risk
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {Math.round(patch.confidence_score * 100)}% confidence
                            </span>
                            <Progress value={patch.confidence_score * 100} className="w-16" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">File:</span> <code className="text-xs bg-muted px-1 rounded">{patch.file_path}</code>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Fix:</span> {patch.fix_description}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {patch.reasoning}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedPatch(patch)}
                            className="flex items-center gap-1"
                          >
                            <Diff className="h-3 w-3" />
                            View Diff
                          </Button>
                          
                          {patch.status === 'pending' && (
                            <>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" className="flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Approve & Deploy
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Approve Patch Deployment</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will deploy the patch to <code>{patch.file_path}</code> with {Math.round(patch.confidence_score * 100)}% confidence.
                                      <br /><strong>Risk Level:</strong> {patch.risk_level}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => approvePatch(patch)}>
                                      Deploy Patch
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectPatch(patch)}
                                className="flex items-center gap-1"
                              >
                                <XCircle className="h-3 w-3" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Created: {new Date(patch.created_at).toLocaleString()}
                          {patch.deployed_at && ` • Deployed: ${new Date(patch.deployed_at).toLocaleString()}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deployed">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Deployment History ({deploymentResults.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {deploymentResults.map((result, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {result.success ? (
                              <CheckCircle className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-destructive" />
                            )}
                            <span className="font-medium">
                              {result.success ? 'Deployment Successful' : 'Deployment Failed'}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {result.deployment_time}ms
                          </span>
                        </div>

                        <div className="text-sm">
                          <span className="font-medium">Files updated:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {result.files_updated.map((file, idx) => (
                              <code key={idx} className="text-xs bg-muted px-1 rounded">{file}</code>
                            ))}
                          </div>
                        </div>

                        {result.error_message && (
                          <div className="text-sm text-destructive">
                            <span className="font-medium">Error:</span> {result.error_message}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Code Diff Modal */}
      {selectedPatch && (
        <AlertDialog open={!!selectedPatch} onOpenChange={() => setSelectedPatch(null)}>
          <AlertDialogContent className="max-w-4xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Code Diff: {selectedPatch.component_name}</AlertDialogTitle>
              <AlertDialogDescription>
                {selectedPatch.file_path} • {selectedPatch.fix_description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="grid grid-cols-2 gap-4 max-h-96">
              <div>
                <h4 className="font-medium text-sm mb-2 text-destructive">Before (Current)</h4>
                <ScrollArea className="h-64 border rounded">
                  <pre className="p-2 text-xs bg-destructive/5">
                    <code>{selectedPatch.code_before}</code>
                  </pre>
                </ScrollArea>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2 text-emerald-600">After (Proposed)</h4>
                <ScrollArea className="h-64 border rounded">
                  <pre className="p-2 text-xs bg-emerald-50">
                    <code>{selectedPatch.code_after}</code>
                  </pre>
                </ScrollArea>
              </div>
            </div>

            <div className="text-sm p-3 bg-muted rounded">
              <strong>Reasoning:</strong> {selectedPatch.reasoning}
            </div>
            
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}