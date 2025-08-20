import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { PenTool, CheckCircle } from 'lucide-react';

interface PetitionSignFormProps {
  petitionId: string;
  hasSigned: boolean;
  onSignatureAdded: () => void;
}

export function PetitionSignForm({ petitionId, hasSigned, onSignatureAdded }: PetitionSignFormProps) {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    signerName: '',
    signerEmail: '',
    comment: '',
    isPublic: true,
    phoneNumber: '',
    organization: '',
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to sign this petition",
          variant: "destructive",
        });
        return;
      }

      const signatureData = {
        petition_id: petitionId,
        user_id: user.id,
        full_name: formData.signerName || user.email?.split('@')[0] || 'Anonymous',
        email: formData.signerEmail || user.email || '',
        comment: formData.comment || null,
        is_anonymous: !formData.isPublic,
      };

      const { error } = await supabase
        .from('petition_signatures')
        .insert([signatureData]);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already signed",
            description: "You have already signed this petition",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Signature added!",
        description: "Thank you for signing this petition",
      });

      onSignatureAdded();
      setShowForm(false);
      
      // Reset form
      setFormData({
        signerName: '',
        signerEmail: '',
        comment: '',
        isPublic: true,
        phoneNumber: '',
        organization: '',
      });

    } catch (error) {
      console.error('Error signing petition:', error);
      toast({
        title: "Error",
        description: "Failed to sign petition. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (hasSigned) {
    return (
      <div className="text-center py-4">
        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
        <p className="text-sm font-medium">Thank you!</p>
        <p className="text-xs text-muted-foreground">You've signed this petition</p>
      </div>
    );
  }

  if (!showForm) {
    return (
      <Button 
        className="w-full" 
        size="lg" 
        onClick={() => setShowForm(true)}
      >
        <PenTool className="h-4 w-4 mr-2" />
        Sign This Petition
      </Button>
    );
  }

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Sign this petition</h4>
        <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>✕</Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Input
            name="signerName"
            value={formData.signerName}
            onChange={handleInputChange}
            placeholder="Your full name"
            required
            className="text-sm"
          />
        </div>

        <div>
          <Input
            name="signerEmail"
            type="email"
            value={formData.signerEmail}
            onChange={handleInputChange}
            placeholder="Your email"
            required
            className="text-sm"
          />
        </div>

        <div>
          <Textarea
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            placeholder="Why are you signing? (optional)"
            rows={2}
            className="text-sm"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isPublic"
            checked={formData.isPublic}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, isPublic: checked as boolean }))
            }
          />
          <Label htmlFor="isPublic" className="text-xs">
            Display my name publicly
          </Label>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
          size="sm"
        >
          {loading ? 'Signing...' : 'Sign Petition'}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          By signing, you accept our terms and privacy policy.
        </p>
      </form>
    </div>
  );
}