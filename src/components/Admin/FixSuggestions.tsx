import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, XCircle, Zap, RefreshCw, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FixSuggestion {
  id: string;
  analysis_id: string;
  explanation: string;
  suggested_fix: string;
  confidence_score: number;
  fix_type: string;
  affected_code: string;
  status: 'pending' | 'applied' | 'ignored' | 'reviewed';
  created_at: string;
  applied_at?: string;
}

export default function FixSuggestions() {
  const [suggestions, setSuggestions] = useState<FixSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ashen_fix_suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      toast.error('Failed to load fix suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSuggestions = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ashen-fix-suggestion-engine', {
        body: { action: 'generate_suggestions' }
      });

      if (error) throw error;
      
      toast.success(`Generated ${data.suggestions_generated} fix suggestions`);
      await loadSuggestions();
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate fix suggestions');
    } finally {
      setIsGenerating(false);
    }
  };

  const applyFix = async (suggestionId: string) => {
    try {
      const { error } = await supabase.functions.invoke('ashen-fix-suggestion-engine', {
        body: { 
          action: 'apply_fix', 
          issue_id: suggestionId,
          apply_fix: true 
        }
      });

      if (error) throw error;
      
      toast.success('Fix applied successfully');
      await loadSuggestions();
    } catch (error) {
      console.error('Error applying fix:', error);
      toast.error('Failed to apply fix');
    }
  };

  const ignoreFix = async (suggestionId: string) => {
    try {
      const { error } = await supabase.functions.invoke('ashen-fix-suggestion-engine', {
        body: { 
          action: 'ignore_fix', 
          issue_id: suggestionId 
        }
      });

      if (error) throw error;
      
      toast.success('Fix ignored');
      await loadSuggestions();
    } catch (error) {
      console.error('Error ignoring fix:', error);
      toast.error('Failed to ignore fix');
    }
  };

  const markAsReviewed = async (suggestionId: string) => {
    try {
      const { error } = await supabase
        .from('ashen_fix_suggestions')
        .update({ status: 'reviewed' })
        .eq('id', suggestionId);

      if (error) throw error;
      
      toast.success('Fix marked as reviewed');
      await loadSuggestions();
    } catch (error) {
      console.error('Error marking as reviewed:', error);
      toast.error('Failed to mark as reviewed');
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'bg-success text-success-foreground';
    if (score >= 75) return 'bg-warning text-warning-foreground';
    return 'bg-destructive text-destructive-foreground';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'ignored': return <XCircle className="h-4 w-4 text-muted-foreground" />;
      case 'reviewed': return <Eye className="h-4 w-4 text-primary" />;
      default: return <AlertCircle className="h-4 w-4 text-warning" />;
    }
  };

  const filteredSuggestions = suggestions.filter(s => s.status === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fix Suggestions</h2>
          <p className="text-muted-foreground">
            AI-powered code fix recommendations with confidence scoring
          </p>
        </div>
        <Button 
          onClick={generateSuggestions} 
          disabled={isGenerating}
          className="gap-2"
        >
          {isGenerating ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
          Generate Suggestions
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{suggestions.filter(s => s.status === 'pending').length}</div>
            <p className="text-sm text-muted-foreground">Pending Fixes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">{suggestions.filter(s => s.status === 'applied').length}</div>
            <p className="text-sm text-muted-foreground">Applied Fixes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{suggestions.filter(s => s.confidence_score >= 85).length}</div>
            <p className="text-sm text-muted-foreground">High Confidence</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-muted-foreground">{suggestions.filter(s => s.status === 'ignored').length}</div>
            <p className="text-sm text-muted-foreground">Ignored</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="applied">Applied</TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
          <TabsTrigger value="ignored">Ignored</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredSuggestions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No {activeTab} suggestions</h3>
                <p className="text-muted-foreground">
                  {activeTab === 'pending' 
                    ? 'Generate suggestions to see code fixes here.' 
                    : `No ${activeTab} fix suggestions found.`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredSuggestions.map((suggestion) => (
              <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(suggestion.status)}
                        <Badge variant="outline" className="capitalize">
                          {suggestion.fix_type.replace('_', ' ')}
                        </Badge>
                        <Badge className={getConfidenceColor(suggestion.confidence_score)}>
                          {suggestion.confidence_score}% confidence
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{suggestion.explanation}</CardTitle>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Suggested Fix:</h4>
                    <div className="bg-muted p-3 rounded-md font-mono text-sm">
                      {suggestion.suggested_fix}
                    </div>
                  </div>

                  {suggestion.affected_code && (
                    <div>
                      <h4 className="font-semibold mb-2">Affected Code:</h4>
                      <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-md font-mono text-sm">
                        {suggestion.affected_code}
                      </div>
                    </div>
                  )}

                  {suggestion.status === 'pending' && (
                    <div className="flex gap-2">
                      {suggestion.confidence_score >= 85 && (
                        <Button 
                          onClick={() => applyFix(suggestion.id)}
                          className="gap-2"
                          variant="default"
                        >
                          <Zap className="h-4 w-4" />
                          Auto-Apply Fix
                        </Button>
                      )}
                      <Button 
                        onClick={() => markAsReviewed(suggestion.id)}
                        variant="secondary"
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Mark Reviewed
                      </Button>
                      <Button 
                        onClick={() => ignoreFix(suggestion.id)}
                        variant="outline"
                        className="gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Ignore
                      </Button>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(suggestion.created_at).toLocaleString()}
                    {suggestion.applied_at && (
                      <> • Applied: {new Date(suggestion.applied_at).toLocaleString()}</>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}