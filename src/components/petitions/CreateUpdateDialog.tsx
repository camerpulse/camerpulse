import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileText, Eye, Send } from 'lucide-react';

interface CreateUpdateDialogProps {
  petitionId: string;
  petitionTitle: string;
  onUpdateCreated?: () => void;
}

export const CreateUpdateDialog: React.FC<CreateUpdateDialogProps> = ({
  petitionId,
  petitionTitle,
  onUpdateCreated
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    attachments: [] as string[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title.trim() || !formData.content.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('petition_updates')
        .insert({
          petition_id: petitionId,
          created_by: user.id,
          title: formData.title.trim(),
          content: formData.content.trim(),
          attachments: formData.attachments,
          is_published: true
        });

      if (error) throw error;

      toast({
        title: "Update posted!",
        description: "Your petition update has been published successfully.",
      });

      // Reset form and close dialog
      setFormData({ title: '', content: '', attachments: [] });
      setIsOpen(false);
      onUpdateCreated?.();

    } catch (error) {
      console.error('Error creating update:', error);
      toast({
        title: "Error",
        description: "Failed to post update. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof typeof formData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Post Update
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Post Update for Petition
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Petition Context */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Petition</Badge>
                <span className="text-sm text-muted-foreground">Update for:</span>
              </div>
              <h4 className="font-medium text-sm line-clamp-2">{petitionTitle}</h4>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Update Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Update Title</label>
              <Input
                placeholder="e.g., Progress Report: Meeting with Officials"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                maxLength={200}
                required
              />
              <p className="text-xs text-muted-foreground">
                {formData.title.length}/200 characters
              </p>
            </div>

            {/* Update Content */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Update Details</label>
              <Textarea
                placeholder="Share the latest developments, progress made, or next steps for your petition..."
                value={formData.content}
                onChange={(e) => updateField('content', e.target.value)}
                rows={6}
                maxLength={2000}
                required
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {formData.content.length}/2000 characters
              </p>
            </div>

            {/* Preview Section */}
            {(formData.title || formData.content) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">Preview</span>
                </div>
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <FileText className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{formData.title || 'Update Title'}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Just now</span>
                            <Badge variant="outline" className="text-xs">Update</Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed pl-10">
                        {formData.content || 'Update content will appear here...'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!formData.title.trim() || !formData.content.trim() || isSubmitting}
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Publishing...' : 'Publish Update'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};