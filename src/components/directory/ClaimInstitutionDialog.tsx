import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, File, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Institution {
  id: string;
  name: string;
  institution_type: string;
  description?: string;
  location?: string;
  region?: string;
}

interface ClaimInstitutionDialogProps {
  institution: Institution | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClaimSubmitted: () => void;
}

interface ClaimForm {
  claimant_full_name: string;
  claimant_email: string;
  claimant_phone: string;
  position_or_relationship: string;
  supporting_explanation: string;
  proof_documents: File[];
}

const positionOptions = [
  'Director/Principal',
  'Administrator',
  'Manager',
  'Department Head',
  'Chief/Traditional Leader',
  'Owner',
  'Board Member',
  'Employee',
  'Volunteer',
  'Representative',
  'Other'
];

export function ClaimInstitutionDialog({ 
  institution, 
  open, 
  onOpenChange, 
  onClaimSubmitted 
}: ClaimInstitutionDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ClaimForm>({
    claimant_full_name: '',
    claimant_email: '',
    claimant_phone: '',
    position_or_relationship: '',
    supporting_explanation: '',
    proof_documents: []
  });

  const handleInputChange = (field: keyof ClaimForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files).filter(file => {
      const isValidType = file.type.startsWith('image/') || 
                         file.type === 'application/pdf' ||
                         file.type.startsWith('application/msword') ||
                         file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type. Please upload images, PDFs, or Word documents.`,
          variant: "destructive"
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB. Please choose a smaller file.`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });

    setForm(prev => ({
      ...prev,
      proof_documents: [...prev.proof_documents, ...newFiles]
    }));
  };

  const removeFile = (index: number) => {
    setForm(prev => ({
      ...prev,
      proof_documents: prev.proof_documents.filter((_, i) => i !== index)
    }));
  };

  const uploadDocuments = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `claim-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('institution-claims')
        .upload(fileName, file);

      if (error) throw error;
      return data.path;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to claim an institution",
          variant: "destructive"
        });
        return;
      }

      // Check if user already has a claim for any institution with this name
      const { data: existingClaims, error: claimsError } = await supabase
        .from('institution_claims')
        .select('*')
        .eq('institution_name', institution.name)
        .eq('user_id', user.id)
        .in('status', ['pending', 'approved']);

      if (claimsError) throw claimsError;

      if (existingClaims && existingClaims.length > 0) {
        toast({
          title: "Claim already exists",
          description: "You already have a pending or approved claim for this institution",
          variant: "destructive"
        });
        return;
      }

      // Upload documents
      let documentPaths: string[] = [];
      if (form.proof_documents.length > 0) {
        documentPaths = await uploadDocuments(form.proof_documents);
      }

      // Submit claim - map to existing schema
      const { error: claimError } = await supabase
        .from('institution_claims')
        .insert({
          institution_id: institution.id,
          user_id: user.id,
          institution_name: institution.name,
          institution_type: institution.institution_type as 'school' | 'hospital' | 'pharmacy',
          claim_type: 'ownership',
          claim_reason: form.supporting_explanation,
          evidence_files: documentPaths,
          status: 'pending'
        });

      if (claimError) throw claimError;

      toast({
        title: "Claim submitted successfully",
        description: "Your claim has been submitted for review. You will be notified of the decision.",
      });

      // Reset form
      setForm({
        claimant_full_name: '',
        claimant_email: '',
        claimant_phone: '',
        position_or_relationship: '',
        supporting_explanation: '',
        proof_documents: []
      });

      onClaimSubmitted();
    } catch (error: any) {
      console.error('Error submitting claim:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit claim",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = form.claimant_full_name && 
                     form.claimant_email && 
                     form.position_or_relationship && 
                     form.supporting_explanation;

  if (!institution) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Claim Institution</DialogTitle>
          <DialogDescription>
            Submit a request to claim ownership of <strong>{institution.name}</strong>. 
            This will give you access to the institution's dashboard and messaging features.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={form.claimant_full_name}
                  onChange={(e) => handleInputChange('claimant_full_name', e.target.value)}
                  placeholder="Your full legal name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.claimant_email}
                  onChange={(e) => handleInputChange('claimant_email', e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={form.claimant_phone}
                onChange={(e) => handleInputChange('claimant_phone', e.target.value)}
                placeholder="+237 XXX XXX XXX"
              />
            </div>
          </div>

          {/* Position/Relationship */}
          <div>
            <Label htmlFor="position">Position or Relationship to Institution *</Label>
            <Select 
              value={form.position_or_relationship} 
              onValueChange={(value) => handleInputChange('position_or_relationship', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your position or relationship" />
              </SelectTrigger>
              <SelectContent>
                {positionOptions.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Supporting Explanation */}
          <div>
            <Label htmlFor="explanation">Supporting Explanation *</Label>
            <Textarea
              id="explanation"
              value={form.supporting_explanation}
              onChange={(e) => handleInputChange('supporting_explanation', e.target.value)}
              placeholder="Please explain your authority to represent this institution, your role, and why you should be granted access to manage its profile..."
              rows={4}
              required
            />
          </div>

          {/* Document Upload */}
          <div>
            <Label>Proof of Affiliation (Optional but recommended)</Label>
            <div className="mt-2">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload supporting documents (ID, letter of appointment, etc.)
                </p>
                <Input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <Label 
                  htmlFor="file-upload" 
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  <Upload className="h-4 w-4" />
                  Choose Files
                </Label>
              </div>

              {form.proof_documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Uploaded Files:</p>
                  {form.proof_documents.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <File className="h-4 w-4" />
                      <span className="text-sm flex-1">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!isFormValid || loading}
            >
              {loading ? 'Submitting...' : 'Submit Claim'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}