import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon, FileText, Target, Users, Megaphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PetitionFormData {
  title: string;
  description: string;
  target_institution: string;
  goal_signatures: number;
  category: string;
  location: string;
  deadline?: Date;
}

const PETITION_CATEGORIES = [
  { value: 'governance', label: 'Governance', icon: '🏛️' },
  { value: 'justice', label: 'Justice', icon: '⚖️' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'health', label: 'Health', icon: '🏥' },
  { value: 'agriculture', label: 'Agriculture', icon: '🌾' },
  { value: 'digital_rights', label: 'Digital Rights', icon: '💻' },
  { value: 'local_issues', label: 'Local Issues', icon: '🏘️' },
  { value: 'corruption', label: 'Anti-Corruption', icon: '🛡️' },
  { value: 'security', label: 'Security', icon: '🔒' },
  { value: 'environment', label: 'Environment', icon: '🌍' },
  { value: 'traditional_authority', label: 'Traditional Authority', icon: '👑' },
  { value: 'others', label: 'Others', icon: '📝' }
];

interface CreatePetitionFormProps {
  onSubmit?: (petitionId: string) => void;
  onCancel?: () => void;
}

export const CreatePetitionForm: React.FC<CreatePetitionFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<PetitionFormData>({
    title: '',
    description: '',
    target_institution: '',
    goal_signatures: 500,
    category: '',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to create a petition');
        return;
      }

      const petitionData = {
        title: formData.title,
        description: formData.description,
        target_institution: formData.target_institution,
        goal_signatures: formData.goal_signatures,
        category: formData.category,
        location: formData.location,
        creator_id: user.id,
        status: isDraft ? 'draft' : 'pending_review',
        current_signatures: 0,
        ...(formData.deadline && { deadline: formData.deadline.toISOString() })
      };

      const { data, error } = await supabase
        .from('petitions')
        .insert(petitionData)
        .select()
        .single();

      if (error) throw error;

      toast.success(isDraft ? 'Petition saved as draft!' : 'Petition submitted for review!');
      onSubmit?.(data.id);
    } catch (error) {
      console.error('Error creating petition:', error);
      toast.error('Failed to create petition');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof PetitionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="petition-form-card max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Megaphone className="h-6 w-6 text-primary" />
          Create New Petition
        </CardTitle>
        <p className="text-muted-foreground">
          Start a movement for positive change in your community
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-medium">
              Petition Title *
            </Label>
            <Input
              id="title"
              placeholder="Write a clear, compelling title for your petition..."
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
              required
              className="petition-input"
            />
            <p className="text-sm text-muted-foreground">
              Make it specific and action-oriented
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Category *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => updateFormData('category', value)}
              required
            >
              <SelectTrigger className="petition-select">
                <SelectValue placeholder="Select petition category" />
              </SelectTrigger>
              <SelectContent>
                {PETITION_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      {category.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Institution */}
          <div className="space-y-2">
            <Label htmlFor="target" className="text-base font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Target Institution/Authority *
            </Label>
            <Input
              id="target"
              placeholder="e.g., Ministry of Education, Douala City Council, Prime Minister..."
              value={formData.target_institution}
              onChange={(e) => updateFormData('target_institution', e.target.value)}
              required
              className="petition-input"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Petition Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the issue, why it matters, and what action you want taken..."
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              required
              rows={6}
              className="petition-textarea"
            />
            <p className="text-sm text-muted-foreground">
              Explain the problem, its impact, and your proposed solution
            </p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-base font-medium">
              Location/Region
            </Label>
            <Input
              id="location"
              placeholder="e.g., Yaoundé, Southwest Region, Nationwide..."
              value={formData.location}
              onChange={(e) => updateFormData('location', e.target.value)}
              className="petition-input"
            />
          </div>

          {/* Goal Signatures */}
          <div className="space-y-2">
            <Label htmlFor="goal" className="text-base font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Signature Goal
            </Label>
            <Input
              id="goal"
              type="number"
              min="10"
              max="1000000"
              value={formData.goal_signatures}
              onChange={(e) => updateFormData('goal_signatures', parseInt(e.target.value))}
              className="petition-input"
            />
            <p className="text-sm text-muted-foreground">
              Set a realistic but ambitious goal
            </p>
          </div>

          {/* Draft Toggle */}
          <div className="flex items-center space-x-2 p-4 bg-muted/30 rounded-lg">
            <Switch
              id="draft-mode"
              checked={isDraft}
              onCheckedChange={setIsDraft}
            />
            <Label htmlFor="draft-mode" className="text-sm">
              Save as draft (you can publish later)
            </Label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="petition-btn-primary flex-1"
            >
              {isSubmitting ? 'Creating...' : isDraft ? 'Save Draft' : 'Submit for Review'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="petition-btn-secondary"
              >
                Cancel
              </Button>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <h4 className="font-medium text-blue-900 mb-2">📋 Review Process</h4>
            <ul className="text-blue-800 space-y-1">
              <li>• Your petition will be reviewed within 24-48 hours</li>
              <li>• We check for clarity, appropriateness, and community guidelines</li>
              <li>• Once approved, your petition will be live and ready to collect signatures</li>
              <li>• You'll receive email notifications about the status</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};