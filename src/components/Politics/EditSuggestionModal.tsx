import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSubmitEditSuggestion } from '@/hooks/useEditSuggestions';
import { useAuth } from '@/contexts/AuthContext';

interface EditSuggestionModalProps {
  open: boolean;
  onClose: () => void;
  entityType: 'politician' | 'senator' | 'mp' | 'minister' | 'party';
  entityId: string;
  entityName: string;
  currentData?: Record<string, any>;
}

const EDITABLE_FIELDS = {
  politician: [
    { key: 'name', label: 'Full Name' },
    { key: 'bio', label: 'Biography' },
    { key: 'region', label: 'Region' },
    { key: 'role', label: 'Position/Role' },
    { key: 'contact_email', label: 'Contact Email' },
    { key: 'website_url', label: 'Website URL' },
    { key: 'phone', label: 'Phone Number' }
  ],
  senator: [
    { key: 'name', label: 'Full Name' },
    { key: 'bio', label: 'Biography' },
    { key: 'region', label: 'Region' },
    { key: 'constituency', label: 'Constituency' },
    { key: 'contact_email', label: 'Contact Email' },
    { key: 'website_url', label: 'Website URL' }
  ],
  mp: [
    { key: 'name', label: 'Full Name' },
    { key: 'bio', label: 'Biography' },
    { key: 'region', label: 'Region' },
    { key: 'constituency', label: 'Constituency' },
    { key: 'contact_email', label: 'Contact Email' },
    { key: 'website_url', label: 'Website URL' }
  ],
  minister: [
    { key: 'name', label: 'Full Name' },
    { key: 'bio', label: 'Biography' },
    { key: 'ministry', label: 'Ministry' },
    { key: 'portfolio', label: 'Portfolio' },
    { key: 'contact_email', label: 'Contact Email' },
    { key: 'website_url', label: 'Website URL' }
  ],
  party: [
    { key: 'name', label: 'Party Name' },
    { key: 'mission_statement', label: 'Mission Statement' },
    { key: 'vision_statement', label: 'Vision Statement' },
    { key: 'ideology', label: 'Ideology' },
    { key: 'headquarters_city', label: 'Headquarters City' },
    { key: 'headquarters_region', label: 'Headquarters Region' },
    { key: 'contact_email', label: 'Contact Email' },
    { key: 'official_website', label: 'Official Website' }
  ]
};

export const EditSuggestionModal = ({
  open,
  onClose,
  entityType,
  entityId,
  entityName,
  currentData = {}
}: EditSuggestionModalProps) => {
  const [selectedField, setSelectedField] = useState('');
  const [suggestedValue, setSuggestedValue] = useState('');
  const [justification, setJustification] = useState('');

  const submitSuggestion = useSubmitEditSuggestion();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedField || !suggestedValue.trim() || !justification.trim()) {
      return;
    }

    const currentValue = currentData[selectedField] || null;

    await submitSuggestion.mutateAsync({
      entity_type: entityType,
      entity_id: entityId,
      entity_name: entityName,
      field_name: selectedField,
      current_value: currentValue,
      suggested_value: suggestedValue.trim(),
      justification: justification.trim()
    });

    // Reset form
    setSelectedField('');
    setSuggestedValue('');
    setJustification('');
    onClose();
  };

  const availableFields = EDITABLE_FIELDS[entityType] || [];
  const selectedFieldInfo = availableFields.find(f => f.key === selectedField);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Suggest Edit</DialogTitle>
          <DialogDescription>
            Suggest an improvement to {entityName}'s profile. All suggestions will be reviewed by moderators.
          </DialogDescription>
        </DialogHeader>

        {!user ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Please sign in to suggest profile edits
            </p>
            <Button onClick={() => (window.location.href = '/auth')} className="w-full">
              Go to Sign In / Sign Up
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="field">Field to Edit</Label>
              <Select value={selectedField} onValueChange={setSelectedField}>
                <SelectTrigger>
                  <SelectValue placeholder="Select field to edit" />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.map((field) => (
                    <SelectItem key={field.key} value={field.key}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedField && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <Label className="text-sm font-medium text-muted-foreground">
                  Current Value:
                </Label>
                <p className="text-sm mt-1">
                  {currentData[selectedField] || <em className="text-muted-foreground">Not set</em>}
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="suggested-value">
                Suggested Value for {selectedFieldInfo?.label}
              </Label>
              {selectedField === 'bio' || selectedField === 'mission_statement' || selectedField === 'vision_statement' ? (
                <Textarea
                  id="suggested-value"
                  value={suggestedValue}
                  onChange={(e) => setSuggestedValue(e.target.value)}
                  placeholder={`Enter the corrected ${selectedFieldInfo?.label.toLowerCase()}`}
                  rows={4}
                  required
                />
              ) : (
                <Input
                  id="suggested-value"
                  value={suggestedValue}
                  onChange={(e) => setSuggestedValue(e.target.value)}
                  placeholder={`Enter the corrected ${selectedFieldInfo?.label.toLowerCase()}`}
                  required
                />
              )}
            </div>

            <div>
              <Label htmlFor="justification">Justification</Label>
              <Textarea
                id="justification"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Explain why this change is needed and provide sources if applicable"
                rows={3}
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!selectedField || !suggestedValue.trim() || !justification.trim() || submitSuggestion.isPending}
              >
                {submitSuggestion.isPending ? 'Submitting...' : 'Submit Suggestion'}
              </Button>
            </div>
          </form>
        )}

      </DialogContent>
    </Dialog>
  );
};