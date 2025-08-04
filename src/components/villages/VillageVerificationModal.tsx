import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VillageVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  villageId: string;
  villageName: string;
}

export const VillageVerificationModal: React.FC<VillageVerificationModalProps> = ({
  isOpen,
  onClose,
  villageId,
  villageName
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verificationData, setVerificationData] = useState({
    relationship: '',
    position: '',
    evidence_description: '',
    contact_references: '',
    additional_info: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Create village verification request
      const { data, error } = await supabase
        .from('village_verification_requests')
        .insert({
          user_id: user.id,
          village_id: villageId,
          requested_role: verificationData.position || 'member',
          relationship_to_village: verificationData.relationship,
          evidence_description: verificationData.evidence_description,
          contact_references: verificationData.contact_references,
          additional_info: verificationData.additional_info,
          status: 'pending',
          verification_method: 'manual'
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting verification request:', error);
        toast.error('Failed to submit verification request');
        return;
      }

      // Send notification to village moderators/admins
      await supabase.functions.invoke('notification-engine', {
        body: {
          user_id: 'admin', // This should be actual village moderator IDs
          type: 'village_verification',
          title: 'New Village Verification Request',
          message: `New verification request for ${villageName} from ${user.email}`,
          data: {
            village_id: villageId,
            request_id: data.id,
            user_id: user.id
          },
          priority: 'medium',
          action_url: `/admin/village-verification/${data.id}`
        }
      });

      toast.success('Verification request submitted successfully!');
      onClose();
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast.error('Failed to submit verification request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Village Verification Request
          </DialogTitle>
          <DialogDescription>
            Request verification for your connection to <strong>{villageName}</strong>. 
            This helps ensure authentic community representation.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Verification helps protect village integrity and prevents false representation. 
            Your request will be reviewed by community moderators.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship to Village</Label>
              <select
                id="relationship"
                value={verificationData.relationship}
                onChange={(e) => setVerificationData(prev => ({ ...prev, relationship: e.target.value }))}
                className="w-full p-2 border rounded-md bg-background"
                required
              >
                <option value="">Select relationship</option>
                <option value="native">Native/Born in village</option>
                <option value="descendant">Descendant of village family</option>
                <option value="resident">Current resident</option>
                <option value="traditional_leader">Traditional leader</option>
                <option value="family_representative">Family representative</option>
                <option value="cultural_ambassador">Cultural ambassador</option>
                <option value="development_committee">Development committee member</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Requested Role/Position</Label>
              <select
                id="position"
                value={verificationData.position}
                onChange={(e) => setVerificationData(prev => ({ ...prev, position: e.target.value }))}
                className="w-full p-2 border rounded-md bg-background"
                required
              >
                <option value="">Select position</option>
                <option value="member">Village Member</option>
                <option value="representative">Village Representative</option>
                <option value="moderator">Village Moderator</option>
                <option value="cultural_keeper">Cultural Keeper</option>
                <option value="development_coordinator">Development Coordinator</option>
                <option value="youth_leader">Youth Leader</option>
                <option value="women_leader">Women's Leader</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidence">Evidence Description</Label>
            <Textarea
              id="evidence"
              placeholder="Describe evidence of your connection (family ties, birth certificates, community knowledge, etc.)"
              value={verificationData.evidence_description}
              onChange={(e) => setVerificationData(prev => ({ ...prev, evidence_description: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="references">Contact References</Label>
            <Textarea
              id="references"
              placeholder="Provide names and contacts of people in the village who can verify your connection"
              value={verificationData.contact_references}
              onChange={(e) => setVerificationData(prev => ({ ...prev, contact_references: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional">Additional Information</Label>
            <Textarea
              id="additional"
              placeholder="Any additional information that supports your verification request"
              value={verificationData.additional_info}
              onChange={(e) => setVerificationData(prev => ({ ...prev, additional_info: e.target.value }))}
              rows={2}
            />
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>What happens next:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Your request will be reviewed by village moderators</li>
                <li>References may be contacted for verification</li>
                <li>You'll receive notification of the decision</li>
                <li>Approved members can represent and moderate village content</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? 'Submitting...' : 'Submit Verification Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};