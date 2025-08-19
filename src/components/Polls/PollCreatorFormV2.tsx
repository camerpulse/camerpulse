import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePollOnboarding } from '@/hooks/usePollOnboarding';
import { OnboardingTooltip } from './PollOnboardingFlow';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import { 
  Plus, 
  X, 
  Calendar as CalendarIcon,
  Vote,
  Clock,
  Users,
  Shield,
  Eye,
  EyeOff,
  Share2,
  QrCode,
  Globe,
  Lock,
  MapPin,
  Languages,
  Image as ImageIcon,
  Palette,
  Save,
  Play,
  HelpCircle,
  Settings,
  Target,
  Repeat,
  Link as LinkIcon,
  Code,
  TrendingUp,
  Zap,
  Heart,
  ThumbsUp,
  Flag,
  Star,
  Smile
} from 'lucide-react';

// Poll Template definitions
const POLL_TEMPLATES = [
  {
    id: 'civic-question',
    name: 'Civic Question',
    description: 'Standard civic engagement poll',
    icon: Vote,
    preview: 'Do you support the new policy?',
    tags: ['civic', 'public']
  },
  {
    id: 'yes-no',
    name: 'Yes/No',
    description: 'Simple binary choice',
    icon: ThumbsUp,
    preview: 'Should this be implemented?',
    tags: ['simple', 'binary']
  },
  {
    id: 'multiple-choice',
    name: 'Multiple Choice',
    description: 'Choose from several options',
    icon: Target,
    preview: 'Which option do you prefer?',
    tags: ['options', 'choice']
  },
  {
    id: 'rating-scale',
    name: 'Rating Scale',
    description: 'Rate from 1 to 5 stars',
    icon: Star,
    preview: 'Rate the government performance',
    tags: ['rating', 'scale']
  },
  {
    id: 'emoji-burst',
    name: 'Emoji Burst',
    description: 'Express feelings with emojis',
    icon: Smile,
    preview: 'How do you feel about this?',
    tags: ['emoji', 'fun']
  },
  {
    id: 'regional-sentiment',
    name: 'Regional Sentiment',
    description: 'Track opinions across regions',
    icon: MapPin,
    preview: 'What\'s your regional opinion?',
    tags: ['regional', 'geographic']
  },
  {
    id: 'youth-voice',
    name: 'Youth Voice',
    description: 'Polls targeting young citizens',
    icon: Zap,
    preview: 'Youth opinion matters',
    tags: ['youth', 'engagement']
  },
  {
    id: 'urgent-poll',
    name: 'Urgent Poll',
    description: 'Quick response needed',
    icon: Clock,
    preview: 'Urgent: Your immediate opinion',
    tags: ['urgent', 'immediate']
  },
  {
    id: 'anonymous-voice',
    name: 'Anonymous Voice',
    description: 'Completely anonymous voting',
    icon: Shield,
    preview: 'Anonymous opinion poll',
    tags: ['anonymous', 'private']
  },
  {
    id: 'trending-topic',
    name: 'Trending Topic',
    description: 'Based on current trends',
    icon: TrendingUp,
    preview: 'What\'s trending in politics?',
    tags: ['trending', 'current']
  }
];

// Cameroon regions
const CAMEROON_REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

export const PollCreatorFormV2 = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { needsOnboarding } = usePollOnboarding();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showHelper, setShowHelper] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step 1: Poll Basics
    title: '',
    description: '',
    
    // Step 2: Template Selection
    selectedTemplate: null as typeof POLL_TEMPLATES[0] | null,
    
    // Step 3: Voting Options
    options: ['', ''],
    allowMultipleSelections: false,
    randomizeOptions: false,
    
    // Step 4: Security & Behavior
    isAnonymous: false,
    showResultsAfterVote: true,
    ipBasedLimit: true,
    captchaEnabled: false,
    loginRequired: false,
    targetRegions: [] as string[],
    language: 'english' as 'english' | 'french' | 'pidgin',
    
    // Step 5: Duration
    startTime: new Date(),
    endTime: addDays(new Date(), 7),
    isRecurring: false,
    recurringPeriod: 'weekly' as 'weekly' | 'monthly',
    
    // Step 6: Visibility
    visibility: 'public' as 'public' | 'private' | 'scheduled',
    scheduledDate: undefined as Date | undefined,
    
    // Step 7: Sharing & Engagement
    generateQRCode: false,
    addToTrending: false,
    enableEmbed: true,
    
    // Customization
    themeColor: 'cm-green' as string,
    bannerImage: null as string | null,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploadingImage(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { error, data } = await supabase.storage
        .from('poll-banners')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('poll-banners')
        .getPublicUrl(fileName);

      handleInputChange('bannerImage', urlData.publicUrl);
      toast({ title: "Image uploaded successfully!" });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const addOption = () => {
    if (formData.options.length < 10) {
      handleInputChange('options', [...formData.options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      handleInputChange('options', formData.options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    handleInputChange('options', newOptions);
  };

  const generatePollLink = () => {
    return `camerpulse.com/poll/${Math.random().toString(36).substr(2, 8)}`;
  };

  const handleCreatePoll = async (isDraft = false) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a poll",
        variant: "destructive"
      });
      return;
    }

    // Validation
    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a poll title",
        variant: "destructive"
      });
      return;
    }

    const validOptions = formData.options.filter(option => option.trim());
    if (validOptions.length < 2) {
      toast({
        title: "Options required", 
        description: "Please provide at least 2 options",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const pollData = {
        creator_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        options: validOptions,
        ends_at: formData.endTime.toISOString(),
        privacy_mode: formData.isAnonymous ? 'anonymous' : 'public',
        show_results_after_expiry: !formData.showResultsAfterVote,
        is_active: !isDraft,
        theme_color: formData.themeColor,
        banner_image_url: formData.bannerImage,
        anonymous_mode: formData.isAnonymous,
        poll_style: formData.selectedTemplate?.id || 'civic-question',
        target_regions: formData.targetRegions,
        language: formData.language,
        allow_multiple_selections: formData.allowMultipleSelections,
        randomize_options: formData.randomizeOptions,
        enable_captcha: formData.captchaEnabled,
        login_required: formData.loginRequired,
        generate_qr_code: formData.generateQRCode,
        enable_embed: formData.enableEmbed,
        metadata: {
          template: formData.selectedTemplate,
          isRecurring: formData.isRecurring,
          recurringPeriod: formData.recurringPeriod,
          visibility: formData.visibility,
          scheduledDate: formData.scheduledDate?.toISOString()
        }
      };

      const { error } = await supabase
        .from('polls')
        .insert(pollData);

      if (error) throw error;

      toast({
        title: isDraft ? "Draft saved!" : "Poll created!",
        description: isDraft 
          ? "Your poll has been saved as a draft" 
          : "Your poll is now live! +50 points earned",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        selectedTemplate: null,
        options: ['', ''],
        allowMultipleSelections: false,
        randomizeOptions: false,
        isAnonymous: false,
        showResultsAfterVote: true,
        ipBasedLimit: true,
        captchaEnabled: false,
        loginRequired: false,
        targetRegions: [],
        language: 'english',
        startTime: new Date(),
        endTime: addDays(new Date(), 7),
        isRecurring: false,
        recurringPeriod: 'weekly',
        visibility: 'public',
        scheduledDate: undefined,
        generateQRCode: false,
        addToTrending: false,
        enableEmbed: true,
        themeColor: 'cm-green',
        bannerImage: null,
      });
      setCurrentStep(1);

    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: "Failed to create poll",
        description: "There was an error creating your poll. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.title.trim().length > 0;
      case 2:
        return formData.selectedTemplate !== null;
      case 3:
        return formData.options.filter(opt => opt.trim()).length >= 2;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep < 8 && isStepValid(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Header with Progress */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cm-green/10 via-cm-yellow/10 to-cm-red/10" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Vote className="w-6 h-6 text-cm-green" />
              Create New Poll
            </CardTitle>
            
            {/* Helper Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHelper(!showHelper)}
              className="flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              Need Help?
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-2 mt-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 h-2 rounded-full transition-colors",
                  i + 1 <= currentStep ? "bg-cm-green" : "bg-muted"
                )}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Step {currentStep} of 8: {
              ['Poll Basics', 'Choose Template', 'Voting Options', 'Security Settings', 
               'Duration', 'Visibility', 'Sharing & Engagement', 'Review & Publish'][currentStep - 1]
            }
          </p>
        </CardHeader>
      </Card>

      {/* Helper Assistant */}
      {showHelper && (
        <Card className="border-cm-green/20 bg-cm-green/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-cm-green/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-cm-green" />
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-cm-green">Smart Assistant</h4>
                <p className="text-sm text-muted-foreground">
                  {currentStep === 1 && "Start with a clear, engaging question. Keep it under 100 characters for better mobile display."}
                  {currentStep === 2 && "Choose a template that fits your poll type. Each template has different features and styling."}
                  {currentStep === 3 && "Add 2-10 options. Use emojis and keep options balanced and clear."}
                  {currentStep === 4 && "Configure security based on your needs. Anonymous polls get more honest responses."}
                  {currentStep === 5 && "7 days is optimal for civic polls. Longer periods may reduce engagement."}
                  {currentStep === 6 && "Public polls get more visibility. Private polls are great for targeted audiences."}
                  {currentStep === 7 && "QR codes are perfect for sharing at events. Embed codes work great on websites."}
                  {currentStep === 8 && "Review everything carefully. You can save as draft to edit later."}
                </p>
                <Button size="sm" variant="outline" onClick={() => setShowHelper(false)}>
                  Got it!
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {/* Step 1: Poll Basics */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">📝 Poll Basics</h3>
                <p className="text-muted-foreground">Create a compelling question that matters to Cameroonians</p>
              </div>

              <div className="space-y-4">
                <div>
                  {needsOnboarding ? (
                    <OnboardingTooltip 
                      title="Poll Title"
                      content="Keep it short, impactful. Ask a clear civic question that engages citizens and drives meaningful discussion."
                    >
                      <Label htmlFor="title" className="text-base font-medium">
                        Poll Title *
                      </Label>
                    </OnboardingTooltip>
                  ) : (
                    <Label htmlFor="title" className="text-base font-medium">
                      Poll Title *
                    </Label>
                  )}
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="What question would you like to ask Cameroonians?"
                    maxLength={100}
                    className="text-lg h-12 mt-2"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-muted-foreground">
                      Keep it short, impactful. Ask a clear civic question.
                    </p>
                    <span className={cn(
                      "text-xs",
                      formData.title.length > 80 ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {formData.title.length}/100
                    </span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-base font-medium">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Provide context, background, or additional details about your poll..."
                    rows={4}
                    maxLength={500}
                    className="mt-2"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-muted-foreground">
                      Optional: Add context to help voters understand the issue
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formData.description.length}/500
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Template Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">🧩 Choose a Poll Template</h3>
                <p className="text-muted-foreground">Select the style that best fits your question</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {POLL_TEMPLATES.map((template) => {
                  const Icon = template.icon;
                  const isSelected = formData.selectedTemplate?.id === template.id;
                  
                  return (
                    <Card
                      key={template.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md border-2",
                        isSelected 
                          ? "border-cm-green bg-cm-green/5 shadow-lg" 
                          : "border-border hover:border-cm-green/30"
                      )}
                      onClick={() => handleInputChange('selectedTemplate', template)}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            isSelected ? "bg-cm-green text-white" : "bg-muted"
                          )}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{template.name}</h4>
                            <p className="text-xs text-muted-foreground">{template.description}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm italic text-muted-foreground">
                            "{template.preview}"
                          </p>
                          
                          <div className="flex flex-wrap gap-1">
                            {template.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Voting Options */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">✅ Voting Options</h3>
                <p className="text-muted-foreground">Add choices for voters to select from</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-1">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Option ${index + 1} (add emoji 🎯 for engagement)`}
                          maxLength={100}
                          className="h-12"
                        />
                      </div>
                      
                      {formData.options.length > 2 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeOption(index)}
                          className="h-12 w-12"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  {formData.options.length < 10 && (
                    <Button
                      variant="outline"
                      onClick={addOption}
                      className="w-full h-12 border-dashed"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option ({formData.options.length}/10)
                    </Button>
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between space-x-3 p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="font-medium">Multiple Selections</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow voters to choose multiple options
                      </p>
                    </div>
                    <Switch
                      checked={formData.allowMultipleSelections}
                      onCheckedChange={(checked) => handleInputChange('allowMultipleSelections', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-3 p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="font-medium">Randomize Options</Label>
                      <p className="text-sm text-muted-foreground">
                        Show options in random order to each voter
                      </p>
                    </div>
                    <Switch
                      checked={formData.randomizeOptions}
                      onCheckedChange={(checked) => handleInputChange('randomizeOptions', checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Security & Behavior Settings */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">🛡️ Poll Security & Behavior</h3>
                <p className="text-muted-foreground">Configure how your poll behaves and who can vote</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between space-x-3 p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="font-medium flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Anonymous Voting
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Hide voter identities completely
                      </p>
                    </div>
                    <Switch
                      checked={formData.isAnonymous}
                      onCheckedChange={(checked) => handleInputChange('isAnonymous', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-3 p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="font-medium flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Show Results After Vote
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Display results immediately after voting
                      </p>
                    </div>
                    <Switch
                      checked={formData.showResultsAfterVote}
                      onCheckedChange={(checked) => handleInputChange('showResultsAfterVote', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-3 p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="font-medium">IP-based Vote Limit</Label>
                      <p className="text-sm text-muted-foreground">
                        Prevent multiple votes from same device
                      </p>
                    </div>
                    <Switch
                      checked={formData.ipBasedLimit}
                      onCheckedChange={(checked) => handleInputChange('ipBasedLimit', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between space-x-3 p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="font-medium">CAPTCHA Verification</Label>
                      <p className="text-sm text-muted-foreground">
                        Add CAPTCHA to prevent bots
                      </p>
                    </div>
                    <Switch
                      checked={formData.captchaEnabled}
                      onCheckedChange={(checked) => handleInputChange('captchaEnabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-3 p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="font-medium">Login Required</Label>
                      <p className="text-sm text-muted-foreground">
                        Only registered users can vote
                      </p>
                    </div>
                    <Switch
                      checked={formData.loginRequired}
                      onCheckedChange={(checked) => handleInputChange('loginRequired', checked)}
                    />
                  </div>

                  <div className="space-y-3 p-4 border rounded-lg">
                    <Label className="font-medium flex items-center gap-2">
                      <Languages className="w-4 h-4" />
                      Poll Language
                    </Label>
                    <Select
                      value={formData.language}
                      onValueChange={(value: 'english' | 'french' | 'pidgin') => 
                        handleInputChange('language', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-4 border rounded-lg">
                <Label className="font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Regional Targeting (Optional)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Select specific regions to target. Leave empty for all regions.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {CAMEROON_REGIONS.map((region) => (
                    <div key={region} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={region}
                        checked={formData.targetRegions.includes(region)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleInputChange('targetRegions', [...formData.targetRegions, region]);
                          } else {
                            handleInputChange('targetRegions', 
                              formData.targetRegions.filter(r => r !== region)
                            );
                          }
                        }}
                        className="rounded"
                      />
                      <label htmlFor={region} className="text-sm">{region}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Duration */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">⏱️ Poll Duration</h3>
                <p className="text-muted-foreground">Set when your poll starts and ends</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="font-medium">Start Time</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.startTime, "PPP 'at' p")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startTime}
                        onSelect={(date) => date && handleInputChange('startTime', date)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-3">
                  <Label className="font-medium">End Time</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.endTime, "PPP 'at' p")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endTime}
                        onSelect={(date) => date && handleInputChange('endTime', date)}
                        disabled={(date) => date < formData.startTime}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-3 p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="font-medium flex items-center gap-2">
                      <Repeat className="w-4 h-4" />
                      Recurring Poll
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically recreate this poll periodically
                    </p>
                  </div>
                  <Switch
                    checked={formData.isRecurring}
                    onCheckedChange={(checked) => handleInputChange('isRecurring', checked)}
                  />
                </div>

                {formData.isRecurring && (
                  <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
                    <Label className="font-medium">Recurring Period</Label>
                    <Select
                      value={formData.recurringPeriod}
                      onValueChange={(value: 'weekly' | 'monthly') => 
                        handleInputChange('recurringPeriod', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 6: Visibility */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">🎯 Poll Visibility</h3>
                <p className="text-muted-foreground">Choose who can see and access your poll</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card
                  className={cn(
                    "cursor-pointer transition-all border-2",
                    formData.visibility === 'public' 
                      ? "border-cm-green bg-cm-green/5" 
                      : "border-border hover:border-cm-green/30"
                  )}
                  onClick={() => handleInputChange('visibility', 'public')}
                >
                  <CardContent className="p-4 text-center space-y-3">
                    <Globe className="w-8 h-8 mx-auto text-cm-green" />
                    <div>
                      <h4 className="font-semibold">Public</h4>
                      <p className="text-sm text-muted-foreground">
                        Visible to everyone on CamerPulse
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={cn(
                    "cursor-pointer transition-all border-2",
                    formData.visibility === 'private' 
                      ? "border-cm-green bg-cm-green/5" 
                      : "border-border hover:border-cm-green/30"
                  )}
                  onClick={() => handleInputChange('visibility', 'private')}
                >
                  <CardContent className="p-4 text-center space-y-3">
                    <Lock className="w-8 h-8 mx-auto text-orange-500" />
                    <div>
                      <h4 className="font-semibold">Private</h4>
                      <p className="text-sm text-muted-foreground">
                        Only accessible via direct link
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={cn(
                    "cursor-pointer transition-all border-2",
                    formData.visibility === 'scheduled' 
                      ? "border-cm-green bg-cm-green/5" 
                      : "border-border hover:border-cm-green/30"
                  )}
                  onClick={() => handleInputChange('visibility', 'scheduled')}
                >
                  <CardContent className="p-4 text-center space-y-3">
                    <Clock className="w-8 h-8 mx-auto text-blue-500" />
                    <div>
                      <h4 className="font-semibold">Scheduled</h4>
                      <p className="text-sm text-muted-foreground">
                        Publish at a specific time
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {formData.visibility === 'scheduled' && (
                <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
                  <Label className="font-medium">Scheduled Publication Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.scheduledDate 
                          ? format(formData.scheduledDate, "PPP 'at' p")
                          : "Pick a date and time"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.scheduledDate}
                        onSelect={(date) => handleInputChange('scheduledDate', date)}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          )}

          {/* Step 7: Sharing & Engagement */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">📢 Sharing & Engagement</h3>
                <p className="text-muted-foreground">Maximize your poll's reach and engagement</p>
              </div>

              <div className="space-y-6">
                {/* Auto-generated link */}
                <div className="p-4 border rounded-lg bg-muted/20">
                  <Label className="font-medium flex items-center gap-2 mb-3">
                    <LinkIcon className="w-4 h-4" />
                    Auto-generated Poll Link
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={generatePollLink()}
                      readOnly
                      className="bg-background"
                    />
                    <Button size="sm" variant="outline">
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between space-x-3 p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="font-medium flex items-center gap-2">
                        <QrCode className="w-4 h-4" />
                        Generate QR Code
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Perfect for sharing at events
                      </p>
                    </div>
                    <Switch
                      checked={formData.generateQRCode}
                      onCheckedChange={(checked) => handleInputChange('generateQRCode', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-3 p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="font-medium flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Add to Trending
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Request homepage feature (admin approval)
                      </p>
                    </div>
                    <Switch
                      checked={formData.addToTrending}
                      onCheckedChange={(checked) => handleInputChange('addToTrending', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-3 p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="font-medium flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        Enable Embed Code
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow embedding on other websites
                      </p>
                    </div>
                    <Switch
                      checked={formData.enableEmbed}
                      onCheckedChange={(checked) => handleInputChange('enableEmbed', checked)}
                    />
                  </div>

                  <div className="space-y-3 p-4 border rounded-lg">
                    <Label className="font-medium flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Theme Color
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {['cm-green', 'cm-yellow', 'cm-red', 'primary', 'accent', 'purple'].map((color) => (
                        <Button
                          key={color}
                          variant={formData.themeColor === color ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleInputChange('themeColor', color)}
                          className="h-8"
                        >
                          <div className={cn("w-3 h-3 rounded-full mr-2", `bg-${color}`)} />
                          {color.split('-')[1] || color}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Banner Image Upload */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <Label className="font-medium flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Civic Banner Image (Optional)
                  </Label>
                  
                  {formData.bannerImage && (
                    <div className="relative">
                      <img 
                        src={formData.bannerImage} 
                        alt="Poll banner" 
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => handleInputChange('bannerImage', null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                      ref={fileInputRef}
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="flex items-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4" />
                      {uploadingImage ? 'Uploading...' : 'Upload Banner'}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Max 5MB, JPG/PNG only
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 8: Review & Publish */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">💾 Review & Publish</h3>
                <p className="text-muted-foreground">Final review before publishing your poll</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Poll Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Poll Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                      <p className="font-medium">{formData.title || "No title set"}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Template</Label>
                      <p>{formData.selectedTemplate?.name || "No template selected"}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Options</Label>
                      <ul className="list-disc list-inside space-y-1">
                        {formData.options.filter(opt => opt.trim()).map((option, index) => (
                          <li key={index} className="text-sm">{option}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                      <p className="text-sm">
                        {format(formData.startTime, "MMM dd")} - {format(formData.endTime, "MMM dd, yyyy")}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Settings Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Settings Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Anonymous Voting</span>
                      <Badge variant={formData.isAnonymous ? "default" : "secondary"}>
                        {formData.isAnonymous ? "Yes" : "No"}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Multiple Selections</span>
                      <Badge variant={formData.allowMultipleSelections ? "default" : "secondary"}>
                        {formData.allowMultipleSelections ? "Yes" : "No"}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Visibility</span>
                      <Badge variant="outline">{formData.visibility}</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Language</span>
                      <Badge variant="outline">{formData.language}</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">QR Code</span>
                      <Badge variant={formData.generateQRCode ? "default" : "secondary"}>
                        {formData.generateQRCode ? "Yes" : "No"}
                      </Badge>
                    </div>
                    
                    {formData.targetRegions.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Target Regions</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.targetRegions.map((region) => (
                            <Badge key={region} variant="outline" className="text-xs">
                              {region}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Live Preview Toggle */}
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  {showPreview ? "Hide Preview" : "Show Live Preview"}
                </Button>
              </div>

              {showPreview && (
                <Card className="border-dashed border-primary/30 bg-primary/5">
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <h4 className="font-semibold">Live Preview</h4>
                      <div className="max-w-md mx-auto p-4 border rounded-lg bg-background">
                        <h5 className="font-medium mb-3">{formData.title}</h5>
                        {formData.description && (
                          <p className="text-sm text-muted-foreground mb-4">{formData.description}</p>
                        )}
                        <div className="space-y-2">
                          {formData.options.filter(opt => opt.trim()).map((option, index) => (
                            <Button key={index} variant="outline" className="w-full justify-start">
                              {option}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              ← Previous
            </Button>

            <div className="flex items-center gap-3">
              {currentStep === 8 && (
                <Button
                  variant="outline"
                  onClick={() => handleCreatePoll(true)}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Draft
                </Button>
              )}
              
              {currentStep === 8 ? (
                <Button
                  onClick={() => handleCreatePoll(false)}
                  disabled={loading || !isStepValid(currentStep)}
                  className="bg-cm-green hover:bg-cm-green/90 flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {loading ? "Publishing..." : "Publish Poll"}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep)}
                  className="flex items-center gap-2"
                >
                  Next →
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};