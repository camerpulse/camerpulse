import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, FileText, Users, MapPin, Building } from 'lucide-react';

interface VerificationChecklistProps {
  checklist: {
    official_document: boolean;
    community_validation: boolean;
    field_visit_verified: boolean;
    license_registration: boolean;
  };
  submissionId: string;
  onUpdate: () => void;
}

export const VerificationChecklist = ({ checklist, submissionId, onUpdate }: VerificationChecklistProps) => {
  const [updating, setUpdating] = useState(false);
  const [localChecklist, setLocalChecklist] = useState(checklist);
  const { toast } = useToast();

  const checklistItems = [
    {
      key: 'official_document' as keyof typeof checklist,
      label: 'Official Document Verified',
      description: 'Valid government registration or license document provided',
      icon: FileText,
    },
    {
      key: 'community_validation' as keyof typeof checklist,
      label: 'Community Validation',
      description: 'Community members confirm the institution exists and operates',
      icon: Users,
    },
    {
      key: 'field_visit_verified' as keyof typeof checklist,
      label: 'Field Visit Completed',
      description: 'Physical verification by local moderator or representative',
      icon: MapPin,
    },
    {
      key: 'license_registration' as keyof typeof checklist,
      label: 'License/Ministry Registration',
      description: 'Valid registration with relevant ministry or regulatory body',
      icon: Building,
    },
  ];

  const handleChecklistUpdate = async (key: keyof typeof checklist, checked: boolean) => {
    try {
      setUpdating(true);
      
      const updatedChecklist = {
        ...localChecklist,
        [key]: checked,
      };
      
      const { error } = await supabase
        .from('institution_submissions')
        .update({ 
          verification_checklist: updatedChecklist,
          updated_at: new Date().toISOString(),
        })
        .eq('id', submissionId);

      if (error) throw error;

      setLocalChecklist(updatedChecklist);
      
      // Log the moderation action
      await supabase.from('moderation_actions').insert({
        moderator_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'verification_update',
        target_type: 'institution_submission',
        target_id: submissionId,
        details: {
          field_updated: key,
          new_value: checked,
          verification_checklist: updatedChecklist,
        },
      });

      toast({
        title: "Verification Updated",
        description: `${key.replace('_', ' ')} has been ${checked ? 'verified' : 'unverified'}`,
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error updating verification checklist:', error);
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const allItemsVerified = Object.values(localChecklist).every(Boolean);
  const verifiedCount = Object.values(localChecklist).filter(Boolean).length;

  const handleCompleteVerification = async () => {
    if (!allItemsVerified) {
      toast({
        title: "Incomplete Verification",
        description: "All checklist items must be verified before approving",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('institution_submissions')
        .update({ 
          verification_status: 'verified',
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', submissionId);

      if (error) throw error;

      // Log the approval action
      await supabase.from('moderation_actions').insert({
        moderator_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'approve_submission',
        target_type: 'institution_submission',
        target_id: submissionId,
        details: {
          verification_completed: true,
          all_checks_passed: true,
        },
      });

      toast({
        title: "Institution Verified",
        description: "The institution has been successfully verified and approved",
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error completing verification:', error);
      toast({
        title: "Error",
        description: "Failed to complete verification",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Verification Checklist ({verifiedCount}/{checklistItems.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {checklistItems.map((item) => {
          const Icon = item.icon;
          const isChecked = localChecklist[item.key];
          
          return (
            <div key={item.key} className="flex items-start space-x-3 p-3 border rounded-lg">
              <Checkbox
                id={item.key}
                checked={isChecked}
                onCheckedChange={(checked) => 
                  handleChecklistUpdate(item.key, checked as boolean)
                }
                disabled={updating}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${isChecked ? 'text-success' : 'text-muted-foreground'}`} />
                  <label 
                    htmlFor={item.key} 
                    className={`font-medium cursor-pointer ${isChecked ? 'text-success' : 'text-foreground'}`}
                  >
                    {item.label}
                  </label>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
        
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {allItemsVerified ? (
              <span className="text-success font-medium">All verification requirements met</span>
            ) : (
              <span>{verifiedCount} of {checklistItems.length} requirements completed</span>
            )}
          </div>
          
          <Button 
            onClick={handleCompleteVerification}
            disabled={!allItemsVerified || updating}
            className="bg-success hover:bg-success/90"
          >
            {updating ? 'Processing...' : 'Approve Institution'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};