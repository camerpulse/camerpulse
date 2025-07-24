import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit3, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SuggestEditModalProps {
  open: boolean;
  onClose: () => void;
  profileId: string;
  profileName: string;
  profileType: 'politician' | 'senator' | 'mp' | 'minister';
}

export const SuggestEditModal: React.FC<SuggestEditModalProps> = ({
  open,
  onClose,
  profileId,
  profileName,
  profileType
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    editType: '',
    fieldToEdit: '',
    currentValue: '',
    suggestedValue: '',
    reason: '',
    source: '',
    evidenceFiles: [] as File[]
  });
  const [loading, setLoading] = useState(false);

  const editTypes = [
    { value: 'correction', label: 'Factual Correction' },
    { value: 'update', label: 'Information Update' },
    { value: 'addition', label: 'Add Missing Information' },
    { value: 'removal', label: 'Remove Incorrect Information' }
  ];

  const fieldsToEdit = [
    { value: 'personal_info', label: 'Personal Information' },
    { value: 'contact_details', label: 'Contact Details' },
    { value: 'position_title', label: 'Position/Title' },
    { value: 'party_affiliation', label: 'Party Affiliation' },
    { value: 'region_constituency', label: 'Region/Constituency' },
    { value: 'biography', label: 'Biography' },
    { value: 'achievements', label: 'Achievements' },
    { value: 'social_media', label: 'Social Media Links' },
    { value: 'other', label: 'Other' }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      evidenceFiles: [...prev.evidenceFiles, ...files]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.editType || !formData.fieldToEdit || !formData.suggestedValue || !formData.reason) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // TODO: Submit edit suggestion to database
      toast({
        title: "Edit Suggestion Submitted",
        description: "Your edit suggestion has been submitted for review by administrators.",
      });
      onClose();
      setFormData({
        editType: '',
        fieldToEdit: '',
        currentValue: '',
        suggestedValue: '',
        reason: '',
        source: '',
        evidenceFiles: []
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit edit suggestion",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Suggest Edit: {profileName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              Help us maintain accurate information by suggesting edits to this profile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Type of Edit *
              </label>
              <Select 
                value={formData.editType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, editType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select edit type" />
                </SelectTrigger>
                <SelectContent>
                  {editTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Field to Edit *
              </label>
              <Select 
                value={formData.fieldToEdit} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, fieldToEdit: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {fieldsToEdit.map(field => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Current Value
            </label>
            <Input
              value={formData.currentValue}
              onChange={(e) => setFormData(prev => ({ ...prev, currentValue: e.target.value }))}
              placeholder="What is currently shown (if any)"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Suggested Value *
            </label>
            <Textarea
              value={formData.suggestedValue}
              onChange={(e) => setFormData(prev => ({ ...prev, suggestedValue: e.target.value }))}
              placeholder="What should it be changed to?"
              className="min-h-[80px]"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Reason for Change *
            </label>
            <Textarea
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Why is this change necessary? Please provide detailed reasoning..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Source/Reference
            </label>
            <Input
              value={formData.source}
              onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
              placeholder="Link to official source or reference (optional)"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Supporting Evidence
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Upload supporting documents or screenshots
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="evidence-upload"
              />
              <label htmlFor="evidence-upload" className="cursor-pointer">
                <Button type="button" variant="outline" size="sm">
                  Choose Files
                </Button>
              </label>
            </div>
            {formData.evidenceFiles.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium">Uploaded files:</p>
                <ul className="text-sm text-gray-600">
                  {formData.evidenceFiles.map((file, index) => (
                    <li key={index} className="truncate">• {file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-700">
              <strong>Review Process:</strong> All edit suggestions are reviewed by our moderation team. 
              Changes will be applied if verified accurate and properly sourced.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Submitting...' : 'Submit Suggestion'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};