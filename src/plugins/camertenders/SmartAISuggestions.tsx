import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Brain, AlertTriangle, TrendingDown, Copy, CheckCircle, XCircle, Eye } from 'lucide-react';

interface AISuggestion {
  id: string;
  tender_id: string;
  suggestion_type: string;
  confidence_score: number;
  suggestion_data: any;
  status: string;
  priority_level: string;
  created_at: string;
}

export const SmartAISuggestions: React.FC = () => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('tender_ai_suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch AI suggestions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (suggestionId: string, status: 'reviewed' | 'implemented' | 'dismissed') => {
    try {
      const { error } = await supabase
        .from('tender_ai_suggestions')
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq('id', suggestionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Suggestion ${status} successfully`,
      });

      fetchSuggestions();
    } catch (error) {
      console.error('Error updating suggestion:', error);
      toast({
        title: "Error",
        description: "Failed to update suggestion",
        variant: "destructive",
      });
    }
  };

  const generateSuggestions = async () => {
    try {
      setLoading(true);
      
      // Get recent tenders and generate suggestions for them
      const { data: tenders } = await supabase
        .from('tenders')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(10);

      if (tenders) {
        for (const tender of tenders) {
          await supabase.rpc('generate_tender_ai_suggestions', {
            p_tender_id: tender.id
          });
        }
      }

      toast({
        title: "Success",
        description: "AI suggestions generated successfully",
      });

      fetchSuggestions();
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to generate suggestions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'duplicate_detection': return <Copy className="h-4 w-4" />;
      case 'price_deviation': return <TrendingDown className="h-4 w-4" />;
      case 'fraud_risk': return <AlertTriangle className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'secondary',
      medium: 'outline',
      high: 'destructive',
      urgent: 'destructive'
    } as const;

    return (
      <Badge variant={variants[priority as keyof typeof variants] || 'secondary'}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Brain className="h-6 w-6 mr-2 text-purple-600" />
            Smart AI Suggestions
          </h2>
          <p className="text-muted-foreground">AI-powered insights and recommendations for tender management</p>
        </div>
        <Button onClick={generateSuggestions}>
          Generate New Suggestions
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{suggestions.length}</div>
            <div className="text-sm text-muted-foreground">Total Suggestions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {suggestions.filter(s => s.status === 'pending').length}
            </div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {suggestions.filter(s => s.status === 'implemented').length}
            </div>
            <div className="text-sm text-muted-foreground">Implemented</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    {getTypeIcon(suggestion.suggestion_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold">
                        {suggestion.suggestion_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h3>
                      {getPriorityBadge(suggestion.priority_level)}
                      <Badge variant="outline">
                        {Math.round(suggestion.confidence_score * 100)}% confidence
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-3">
                      Tender ID: {suggestion.tender_id}
                    </div>

                    {suggestion.suggestion_data?.recommendation && (
                      <p className="text-sm mb-3">{suggestion.suggestion_data.recommendation}</p>
                    )}

                    {suggestion.suggestion_type === 'price_deviation' && suggestion.suggestion_data && (
                      <div className="bg-yellow-50 p-3 rounded-lg text-sm">
                        <div>Market Average: {Math.round(suggestion.suggestion_data.market_average).toLocaleString()} FCFA</div>
                        <div>Tender Budget: {Math.round(suggestion.suggestion_data.tender_budget).toLocaleString()} FCFA</div>
                        <div>Deviation: {Math.round(suggestion.suggestion_data.deviation_percentage)}%</div>
                      </div>
                    )}

                    {suggestion.suggestion_type === 'duplicate_detection' && suggestion.suggestion_data && (
                      <div className="bg-orange-50 p-3 rounded-lg text-sm">
                        <div>Similar tenders found: {suggestion.suggestion_data.similar_count}</div>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground mt-2">
                      Created: {new Date(suggestion.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    View Tender
                  </Button>
                  {suggestion.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReview(suggestion.id, 'implemented')}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Implement
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReview(suggestion.id, 'dismissed')}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Dismiss
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {suggestions.length === 0 && (
        <div className="text-center py-12">
          <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No AI Suggestions</h3>
          <p className="text-muted-foreground">
            Generate AI suggestions to get intelligent insights about your tenders.
          </p>
        </div>
      )}
    </div>
  );
};