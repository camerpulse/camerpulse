import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, X, Flag, MessageSquare, Edit } from 'lucide-react';

interface ModerationActionsProps {
  submission: {
    id: string;
    institution_type: string;
    name: string;
    verification_status: string;
    moderator_notes?: string;
  };
  onUpdate: () => void;
}

export const ModerationActions = ({ submission, onUpdate }: ModerationActionsProps) => {
  const [notes, setNotes] = useState(submission.moderator_notes || '');
  const [flagReason, setFlagReason] = useState('');
  const [updating, setUpdating] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleStatusUpdate = async (status: string, reason?: string) => {
    try {
      setUpdating(true);
      
      const updateData: any = {
        verification_status: status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'verified') {
        updateData.verified_at = new Date().toISOString();
      } else if (status === 'reviewed') {
        updateData.reviewed_at = new Date().toISOString();
      }

      if (reason) {
        updateData.flagged_reasons = [reason];
      }

      if (notes) {
        updateData.moderator_notes = notes;
      }

      const { error } = await supabase
        .from('institution_submissions')
        .update(updateData)
        .eq('id', submission.id);

      if (error) throw error;

      // Log the moderation action
      await supabase.from('moderation_actions').insert({
        moderator_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: `status_update_${status}`,
        target_type: 'institution_submission',
        target_id: submission.id,
        reason: reason,
        details: {
          previous_status: submission.verification_status,
          new_status: status,
          moderator_notes: notes,
        },
      });

      toast({
        title: "Status Updated",
        description: `Institution status changed to ${status}`,
      });
      
      setActionDialogOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update institution status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNotes = async () => {
    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('institution_submissions')
        .update({
          moderator_notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', submission.id);

      if (error) throw error;

      // Log the action
      await supabase.from('moderation_actions').insert({
        moderator_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'add_notes',
        target_type: 'institution_submission',
        target_id: submission.id,
        details: {
          notes_added: notes,
        },
      });

      toast({
        title: "Notes Added",
        description: "Moderator notes have been updated",
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error adding notes:', error);
      toast({
        title: "Error",
        description: "Failed to add notes",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {submission.verification_status === 'pending' && (
          <>
            <Button 
              onClick={() => handleStatusUpdate('verified')}
              disabled={updating}
              size="sm"
              className="bg-success hover:bg-success/90"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
            
            <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Flag className="h-4 w-4 mr-1" />
                  Flag
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Flag Institution</DialogTitle>
                  <DialogDescription>
                    Provide a reason for flagging this institution submission.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Select onValueChange={setFlagReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select flag reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="incomplete_info">Incomplete Information</SelectItem>
                      <SelectItem value="invalid_documents">Invalid Documents</SelectItem>
                      <SelectItem value="duplicate_submission">Duplicate Submission</SelectItem>
                      <SelectItem value="false_information">False Information</SelectItem>
                      <SelectItem value="inappropriate_content">Inappropriate Content</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Textarea
                    placeholder="Additional notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleStatusUpdate('flagged', flagReason)}
                      disabled={!flagReason || updating}
                      variant="destructive"
                    >
                      Flag Institution
                    </Button>
                    <Button 
                      onClick={() => handleStatusUpdate('rejected', flagReason)}
                      disabled={!flagReason || updating}
                      variant="outline"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-1" />
              Add Notes
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Moderator Notes</DialogTitle>
              <DialogDescription>
                Add internal notes about this institution submission.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter your notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
              <Button onClick={handleAddNotes} disabled={updating}>
                <Edit className="h-4 w-4 mr-1" />
                Save Notes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {submission.verification_status === 'flagged' && (
          <Button 
            onClick={() => handleStatusUpdate('pending')}
            disabled={updating}
            variant="outline"
            size="sm"
          >
            Unflag
          </Button>
        )}

        {submission.verification_status === 'rejected' && (
          <Button 
            onClick={() => handleStatusUpdate('pending')}
            disabled={updating}
            variant="outline"
            size="sm"
          >
            Restore
          </Button>
        )}
      </div>

      {submission.moderator_notes && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium text-muted-foreground mb-1">Moderator Notes:</p>
          <p className="text-sm">{submission.moderator_notes}</p>
        </div>
      )}
    </div>
  );
};