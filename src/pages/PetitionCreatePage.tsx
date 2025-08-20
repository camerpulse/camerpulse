import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, FileText, Target, Users, Clock, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/utils/auth';
import { useCreatePetition } from '@/hooks/useCivicParticipation';
import { URLBuilder } from '@/utils/slug';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'governance', label: 'Governance', icon: '🏛️' },
  { value: 'justice', label: 'Justice', icon: '⚖️' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'health', label: 'Health', icon: '🏥' },
  { value: 'agriculture', label: 'Agriculture', icon: '🌾' },
  { value: 'digital_rights', label: 'Digital Rights', icon: '💻' },
  { value: 'local_issues', label: 'Local Issues', icon: '🏘️' },
  { value: 'corruption', label: 'Corruption', icon: '🛡️' },
  { value: 'security', label: 'Security', icon: '🔒' },
  { value: 'environment', label: 'Environment', icon: '🌍' },
  { value: 'traditional_authority', label: 'Traditional Authority', icon: '👑' },
  { value: 'others', label: 'Others', icon: '📝' }
];

const REGIONS = [
  { value: 'national', label: 'National' },
  { value: 'centre', label: 'Centre' },
  { value: 'north', label: 'North' },
  { value: 'south', label: 'South' },
  { value: 'east', label: 'East' },
  { value: 'west', label: 'West' },
  { value: 'southwest', label: 'Southwest' },
  { value: 'northwest', label: 'Northwest' },
  { value: 'littoral', label: 'Littoral' },
  { value: 'adamawa', label: 'Adamawa' },
  { value: 'far_north', label: 'Far North' }
];

/**
 * Petition creation page with comprehensive form and validation
 */
const PetitionCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const createPetitionMutation = useCreatePetition();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_institution: '',
    category: '',
    region: 'national',
    goal_signatures: 100,
    deadline: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please log in to create a petition');
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    } else if (formData.description.length > 5000) {
      newErrors.description = 'Description must be less than 5000 characters';
    }

    if (!formData.target_institution.trim()) {
      newErrors.target_institution = 'Target institution is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.goal_signatures < 10) {
      newErrors.goal_signatures = 'Goal must be at least 10 signatures';
    } else if (formData.goal_signatures > 1000000) {
      newErrors.goal_signatures = 'Goal cannot exceed 1,000,000 signatures';
    }

    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      const now = new Date();
      const minDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      
      if (deadlineDate <= now) {
        newErrors.deadline = 'Deadline must be in the future';
      } else if (deadlineDate < minDate) {
        newErrors.deadline = 'Deadline must be at least 7 days from now';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      const petition = await createPetitionMutation.mutateAsync({
        ...formData,
        deadline: formData.deadline || null
      });

      toast.success('Petition created successfully!');
      navigate(URLBuilder.petitions.detail({ 
        id: petition.id, 
        title: petition.title 
      }));
    } catch (error) {
      console.error('Error creating petition:', error);
      toast.error('Failed to create petition. Please try again.');
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/petitions')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Petitions
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold">Create a Petition</h1>
          <p className="text-muted-foreground mt-2">
            Start a petition to bring about change in your community and beyond
          </p>
        </div>
      </div>

      {/* Guidelines */}
      <Card className="mb-6 border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Petition Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>• Keep your petition focused on a specific, achievable goal</p>
          <p>• Clearly explain why this issue matters and what you want to change</p>
          <p>• Be respectful and factual in your language</p>
          <p>• Target the right institution or authority that can make the change</p>
          <p>• Set a realistic signature goal and deadline</p>
        </CardContent>
      </Card>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Petition Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="What change do you want to see?"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={errors.title ? 'border-destructive' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive mt-1">{errors.title}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.title.length}/200 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Explain why this petition is important and what specific changes you want to see..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={`min-h-32 ${errors.description ? 'border-destructive' : ''}`}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive mt-1">{errors.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.description.length}/5000 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="target_institution">Target Institution *</Label>
                  <Input
                    id="target_institution"
                    placeholder="Who has the power to make this change? (e.g., Ministry of Health, Parliament, Mayor)"
                    value={formData.target_institution}
                    onChange={(e) => handleInputChange('target_institution', e.target.value)}
                    className={errors.target_institution ? 'border-destructive' : ''}
                  />
                  {errors.target_institution && (
                    <p className="text-sm text-destructive mt-1">{errors.target_institution}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category & Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            <span>{category.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive mt-1">{errors.category}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="regions">Region</Label>
                  <Select value={formData.region} onValueChange={(value) => handleInputChange('region', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((region) => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Goals & Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="goal_signatures">Signature Goal *</Label>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="goal_signatures"
                      type="number"
                      min="10"
                      max="1000000"
                      value={formData.goal_signatures}
                      onChange={(e) => handleInputChange('goal_signatures', parseInt(e.target.value) || 0)}
                      className={errors.goal_signatures ? 'border-destructive' : ''}
                    />
                  </div>
                  {errors.goal_signatures && (
                    <p className="text-sm text-destructive mt-1">{errors.goal_signatures}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Suggested: 100-10,000 signatures
                  </p>
                </div>

                <div>
                  <Label htmlFor="deadline">Deadline (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="deadline"
                      type="date"
                      min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      value={formData.deadline}
                      onChange={(e) => handleInputChange('deadline', e.target.value)}
                      className={errors.deadline ? 'border-destructive' : ''}
                    />
                  </div>
                  {errors.deadline && (
                    <p className="text-sm text-destructive mt-1">{errors.deadline}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty for no deadline
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            {formData.title && formData.category && (
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge variant="secondary">
                      {CATEGORIES.find(c => c.value === formData.category)?.icon} {CATEGORIES.find(c => c.value === formData.category)?.label}
                    </Badge>
                    <h3 className="font-semibold line-clamp-2">{formData.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {formData.description || 'Add a description...'}
                    </p>
                    <div className="text-sm text-muted-foreground">
                      Goal: {formData.goal_signatures.toLocaleString()} signatures
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/petitions')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createPetitionMutation.isPending}
          >
            {createPetitionMutation.isPending ? 'Creating...' : 'Create Petition'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PetitionCreatePage;