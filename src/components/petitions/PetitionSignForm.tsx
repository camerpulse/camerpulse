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
      <Card>
        <CardContent className="py-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Thank you!</h3>
          <p className="text-muted-foreground">You have already signed this petition.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="h-5 w-5" />
          Sign this petition
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signerName">Your name</Label>
            <Input
              id="signerName"
              name="signerName"
              value={formData.signerName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signerEmail">Email address</Label>
            <Input
              id="signerEmail"
              name="signerEmail"
              type="email"
              value={formData.signerEmail}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone number (optional)</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization">Organization (optional)</Label>
            <Input
              id="organization"
              name="organization"
              value={formData.organization}
              onChange={handleInputChange}
              placeholder="Your organization or affiliation"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment (optional)</Label>
            <Textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              placeholder="Why are you signing this petition?"
              rows={3}
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
            <Label htmlFor="isPublic" className="text-sm">
              Display my name publicly on this petition
            </Label>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
            size="lg"
          >
            {loading ? 'Signing...' : 'Sign this petition'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By signing, you accept our terms and conditions and privacy policy.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}