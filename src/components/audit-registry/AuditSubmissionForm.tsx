import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Shield, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AuditSubmissionForm: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    document_title: '',
    entity_audited: '',
    audit_summary: ''
  });

  const handleSubmit = () => {
    toast({
      title: "Audit Submitted",
      description: "Your audit has been submitted for review.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-6 w-6" />
          Submit Audit Document
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Document Title</Label>
          <Input 
            value={formData.document_title}
            onChange={(e) => setFormData(prev => ({...prev, document_title: e.target.value}))}
            placeholder="Enter audit title"
          />
        </div>
        <div className="space-y-2">
          <Label>Entity Audited</Label>
          <Input 
            value={formData.entity_audited}
            onChange={(e) => setFormData(prev => ({...prev, entity_audited: e.target.value}))}
            placeholder="Organization or entity"
          />
        </div>
        <div className="space-y-2">
          <Label>Summary</Label>
          <Textarea 
            value={formData.audit_summary}
            onChange={(e) => setFormData(prev => ({...prev, audit_summary: e.target.value}))}
            placeholder="Brief audit summary"
          />
        </div>
        <Button onClick={handleSubmit} className="w-full">
          <CheckCircle className="h-4 w-4 mr-2" />
          Submit Audit
        </Button>
      </CardContent>
    </Card>
  );
};