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
    <Card className="petition-form-card max-w-4xl mx-auto shadow-heritage border-0 overflow-hidden">
      <div className="bg-gradient-heritage p-8 text-white">
        <CardTitle className="flex items-center justify-center gap-3 text-3xl font-bold mb-4">
          <Megaphone className="h-8 w-8" />
          Create New Petition
        </CardTitle>
        <p className="text-center text-white/90 text-lg">
          Start a movement for positive change in your community
        </p>
      </div>
      
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div className="space-y-3 p-6 bg-gradient-card rounded-xl border border-border/50">
            <Label htmlFor="title" className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Petition Title *
            </Label>
            <Input
              id="title"
              placeholder="Write a clear, compelling title for your petition..."
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
              required
              className="h-12 text-base border-border/50 focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <p className="text-sm text-muted-foreground font-medium">
              Make it specific and action-oriented
            </p>
          </div>

          {/* Category */}
          <div className="space-y-3 p-6 bg-gradient-card rounded-xl border border-border/50">
            <Label className="text-lg font-semibold text-foreground">Category *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => updateFormData('category', value)}
              required
            >
              <SelectTrigger className="h-12 text-base border-border/50 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <SelectValue placeholder="Select petition category" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {PETITION_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value} className="h-12">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium">{category.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Institution */}
          <div className="space-y-3 p-6 bg-gradient-card rounded-xl border border-border/50">
            <Label htmlFor="target" className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              Target Institution/Authority *
            </Label>
            <Input
              id="target"
              placeholder="e.g., Ministry of Education, Douala City Council, Prime Minister..."
              value={formData.target_institution}
              onChange={(e) => updateFormData('target_institution', e.target.value)}
              required
              className="h-12 text-base border-border/50 focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>

          {/* Description */}
          <div className="space-y-3 p-6 bg-gradient-card rounded-xl border border-border/50">
            <Label htmlFor="description" className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-secondary" />
              Petition Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the issue, why it matters, and what action you want taken..."
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              required
              rows={6}
              className="text-base border-border/50 focus:ring-2 focus:ring-secondary/20 focus:border-secondary resize-none"
            />
            <p className="text-sm text-muted-foreground font-medium">
              Explain the problem, its impact, and your proposed solution
            </p>
          </div>

          {/* Location & Goal Row */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3 p-6 bg-gradient-card rounded-xl border border-border/50">
              <Label htmlFor="location" className="text-lg font-semibold text-foreground">
                Location/Region
              </Label>
              <Input
                id="location"
                placeholder="e.g., Yaounde, Southwest Region, Nationwide..."
                value={formData.location}
                onChange={(e) => updateFormData('location', e.target.value)}
                className="h-12 text-base border-border/50 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-3 p-6 bg-gradient-card rounded-xl border border-border/50">
              <Label htmlFor="goal" className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-cm-green" />
                Signature Goal
              </Label>
              <Input
                id="goal"
                type="number"
                min="10"
                max="1000000"
                value={formData.goal_signatures}
                onChange={(e) => updateFormData('goal_signatures', parseInt(e.target.value))}
                className="h-12 text-base border-border/50 focus:ring-2 focus:ring-cm-green/20 focus:border-cm-green"
              />
              <p className="text-sm text-muted-foreground font-medium">
                Set a realistic but ambitious goal
              </p>
            </div>
          </div>

          {/* Draft Toggle */}
          <div className="flex items-center justify-between p-6 bg-gradient-cowrie rounded-xl border border-secondary/20">
            <div className="flex items-center space-x-3">
              <Switch
                id="draft-mode"
                checked={isDraft}
                onCheckedChange={setIsDraft}
                className="data-[state=checked]:bg-secondary"
              />
              <Label htmlFor="draft-mode" className="text-base font-semibold text-foreground">
                Save as draft (you can publish later)
              </Label>
            </div>
            <Badge variant={isDraft ? "secondary" : "outline"} className="ml-4">
              {isDraft ? "Draft Mode" : "Review Mode"}
            </Badge>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="petition-btn-primary flex-1 h-14 text-lg font-semibold bg-gradient-heritage hover:shadow-heritage transition-all duration-300 border-0"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </div>
              ) : isDraft ? 'Save Draft' : 'Submit for Review'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="petition-btn-secondary h-14 text-lg font-semibold border-2 border-border hover:bg-muted/50 transition-all duration-300"
              >
                Cancel
              </Button>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-gradient-card border border-primary/20 rounded-xl p-6 shadow-elegant">
            <h4 className="font-bold text-primary mb-4 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              📋 Review Process
            </h4>
            <ul className="text-foreground space-y-2 text-base">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                Your petition will be reviewed within 24-48 hours
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                We check for clarity, appropriateness, and community guidelines
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                Once approved, your petition will be live and ready to collect signatures
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                You'll receive email notifications about the status
              </li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};