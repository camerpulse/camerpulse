import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Flag } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FlagEntityFormProps {
  entityId: string;
  entityType: 'issuer' | 'bidder' | 'tender';
  entityName: string;
  onFlagSubmitted?: () => void;
}

export function FlagEntityForm({ entityId, entityType, entityName, onFlagSubmitted }: FlagEntityFormProps) {
  const [flagType, setFlagType] = useState('');
  const [flagReason, setFlagReason] = useState('');
  const [evidence, setEvidence] = useState('');
  const [severity, setSeverity] = useState('medium');

  const queryClient = useQueryClient();

  const submitFlagMutation = useMutation({
    mutationFn: async (flagData: any) => {
      const { data, error } = await supabase
        .from('flagged_tender_entities')
        .insert({
          entity_id: entityId,
          entity_type: entityType,
          entity_name: entityName,
          flag_type: flagData.flagType,
          flag_reason: flagData.flagReason,
          evidence: flagData.evidence || null,
          severity: flagData.severity,
          flagged_by: (await supabase.auth.getUser()).data.user?.id,
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Flag submitted successfully",
        description: "Thank you for helping maintain transparency. Your flag will be reviewed by administrators.",
      });
      queryClient.invalidateQueries({ queryKey: ['flagged-entities'] });
      onFlagSubmitted?.();
      // Reset form
      setFlagType('');
      setFlagReason('');
      setEvidence('');
      setSeverity('medium');
    },
    onError: (error: any) => {
      toast({
        title: "Error submitting flag",
        description: error.message || "Failed to submit your flag. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!flagType || !flagReason.trim()) {
      toast({
        title: "Incomplete form",
        description: "Please select a flag type and provide a detailed reason.",
        variant: "destructive",
      });
      return;
    }

    submitFlagMutation.mutate({
      flagType,
      flagReason,
      evidence,
      severity,
    });
  };

  const flagTypeOptions = [
    { value: 'fraud', label: 'Fraud', description: 'Suspected fraudulent activity' },
    { value: 'corruption', label: 'Corruption', description: 'Evidence of corrupt practices' },
    { value: 'poor_performance', label: 'Poor Performance', description: 'Consistently poor delivery or service' },
    { value: 'bias', label: 'Bias', description: 'Unfair or biased selection processes' },
    { value: 'other', label: 'Other', description: 'Other credibility concerns' },
  ];

  const severityOptions = [
    { value: 'low', label: 'Low', description: 'Minor concern, needs attention' },
    { value: 'medium', label: 'Medium', description: 'Moderate concern, requires review' },
    { value: 'high', label: 'High', description: 'Serious concern, urgent review needed' },
    { value: 'critical', label: 'Critical', description: 'Severe issue, immediate action required' },
  ];

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="h-5 w-5 text-red-600" />
          Flag Entity for Review
        </CardTitle>
        <CardDescription>
          Report concerns about "{entityName}" to help maintain transparency and accountability.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Flag Type */}
          <div className="space-y-2">
            <Label htmlFor="flag-type">Type of Concern *</Label>
            <Select value={flagType} onValueChange={setFlagType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select the type of concern" />
              </SelectTrigger>
              <SelectContent>
                {flagTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label htmlFor="severity">Severity Level</Label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger>
                <SelectValue placeholder="Select severity level" />
              </SelectTrigger>
              <SelectContent>
                {severityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <p className="font-medium capitalize">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Flag Reason */}
          <div className="space-y-2">
            <Label htmlFor="flag-reason">Detailed Reason *</Label>
            <Textarea
              id="flag-reason"
              placeholder="Please provide a detailed explanation of your concerns. Include specific incidents, dates, or behaviors that led to this flag..."
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              required
              rows={4}
            />
          </div>

          {/* Evidence */}
          <div className="space-y-2">
            <Label htmlFor="evidence">Supporting Evidence (Optional)</Label>
            <Textarea
              id="evidence"
              placeholder="Include any supporting evidence such as document references, witness accounts, links to public records, or other verifiable information..."
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              rows={3}
            />
          </div>

          {/* Warning Notice */}
          <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Important Notice</p>
                <ul className="space-y-1 text-xs">
                  <li>• All flags are reviewed by administrators before taking action</li>
                  <li>• False or malicious flags may result in penalties</li>
                  <li>• Your identity will be kept confidential during the review process</li>
                  <li>• Only provide information you can verify or have reasonable evidence for</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!flagType || !flagReason.trim() || submitFlagMutation.isPending}
          >
            {submitFlagMutation.isPending ? 'Submitting Flag...' : 'Submit Flag for Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}