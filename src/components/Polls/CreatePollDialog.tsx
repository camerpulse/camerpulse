import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CardPollStyle } from './PollStyles/CardPollStyle';
import { ChartPollStyle } from './PollStyles/ChartPollStyle';
import { BallotPollStyle } from './PollStyles/BallotPollStyle';
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
  CreditCard,
  BarChart3,
  FileText,
  Upload,
  Palette,
  Image as ImageIcon,
  UserMinus
} from 'lucide-react';

interface CreatePollDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePollDialog = ({ isOpen, onClose, onSuccess }: CreatePollDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    options: ['', ''],
    hasExpiry: false,
    expiryDate: undefined as Date | undefined,
    privacyMode: 'public' as 'public' | 'private' | 'anonymous',
    showResultsAfterExpiry: true,
    autoDelete: false,
    autoDeleteDays: 30,
    pollStyle: 'card' as 'card' | 'chart' | 'ballot',
    // New customization fields
    themeColor: 'cm-green' as 'cm-green' | 'cm-yellow' | 'cm-red' | 'primary' | 'accent',
    bannerImageUrl: '',
    anonymousMode: false,
    durationDays: 7
  });

  // Civic theme colors
  const themeColors = [
    { value: 'cm-green', name: 'Civic Green', class: 'bg-cm-green' },
    { value: 'cm-yellow', name: 'Unity Yellow', class: 'bg-cm-yellow' },
    { value: 'cm-red', name: 'National Red', class: 'bg-cm-red' },
    { value: 'primary', name: 'Classic Blue', class: 'bg-primary' },
    { value: 'accent', name: 'Elegant Purple', class: 'bg-accent' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploadingImage(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('poll-banners')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('poll-banners')
        .getPublicUrl(fileName);

      handleInputChange('bannerImageUrl', urlData.publicUrl);
      
      toast({
        title: "Image uploaded!",
        description: "Your banner image has been uploaded successfully"
      });
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
    if (formData.options.length < 6) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option)
    }));
  };

  const createPoll = async () => {
    if (!user) return;

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

    if (formData.hasExpiry && !formData.expiryDate) {
      toast({
        title: "Expiry date required",
        description: "Please select an expiry date",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Calculate expiry date based on duration if no custom expiry is set
      const expiryDate = formData.hasExpiry && formData.expiryDate 
        ? formData.expiryDate 
        : new Date(Date.now() + (formData.durationDays * 24 * 60 * 60 * 1000));

      // Calculate auto delete date if enabled
      const autoDeleteAt = formData.autoDelete 
        ? new Date(expiryDate.getTime() + (formData.autoDeleteDays * 24 * 60 * 60 * 1000))
        : null;

      const { error } = await supabase
        .from('polls')
        .insert({
          creator_id: user.id,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          options: validOptions,
          ends_at: expiryDate.toISOString(),
          privacy_mode: formData.privacyMode,
          show_results_after_expiry: formData.showResultsAfterExpiry,
          auto_delete_at: autoDeleteAt?.toISOString() || null,
          is_active: true,
          // New customization fields
          theme_color: formData.themeColor,
          banner_image_url: formData.bannerImageUrl || null,
          anonymous_mode: formData.anonymousMode,
          duration_days: formData.durationDays
        });

      if (error) throw error;

      toast({
        title: "Poll created!",
        description: "Your poll has been published and is now live! +50 points earned"
      });
      
      // Award points for creating poll
      if (user) {
        try {
          // We need to get the poll ID from the insert result
          const { data: pollData } = await supabase
            .from('polls')
            .select('id')
            .eq('creator_id', user.id)
            .eq('title', formData.title.trim())
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
            
          if (pollData) {
            await supabase.rpc('award_points', {
              p_user_id: user.id,
              p_activity_type: 'poll_created',
              p_activity_reference_id: pollData.id,
              p_description: `Created poll: ${formData.title.trim()}`
            });
          }
        } catch (error) {
          console.error('Error awarding points:', error);
        }
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        options: ['', ''],
        hasExpiry: false,
        expiryDate: undefined,
        privacyMode: 'public',
        showResultsAfterExpiry: true,
        autoDelete: false,
        autoDeleteDays: 30,
        pollStyle: 'card',
        themeColor: 'cm-green',
        bannerImageUrl: '',
        anonymousMode: false,
        durationDays: 7
      });

      onSuccess();
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

  const isFormValid = () => {
    const validOptions = formData.options.filter(option => option.trim());
    return formData.title.trim() && 
           validOptions.length >= 2 && 
           (!formData.hasExpiry || formData.expiryDate);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5" />
            Create New Poll
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="title">Poll Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="What question would you like to ask?"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.title.length}/200 characters
                </p>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Provide additional context for your poll"
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.description.length}/500 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Poll Options */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <Label>Poll Options *</Label>
              
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      maxLength={100}
                    />
                  </div>
                  
                  {formData.options.length > 2 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              {formData.options.length < 6 && (
                <Button
                  variant="outline"
                  onClick={addOption}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option ({formData.options.length}/6)
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Poll Style Selection */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <Label>Poll Style</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant={formData.pollStyle === 'card' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleInputChange('pollStyle', 'card')}
                  className="flex-col h-auto p-4 gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs font-medium">Card</span>
                  <span className="text-xs text-muted-foreground text-center">Classic button layout</span>
                </Button>
                <Button
                  type="button"
                  variant={formData.pollStyle === 'chart' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleInputChange('pollStyle', 'chart')}
                  className="flex-col h-auto p-4 gap-2"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-xs font-medium">Chart</span>
                  <span className="text-xs text-muted-foreground text-center">Visual chart display</span>
                </Button>
                <Button
                  type="button"
                  variant={formData.pollStyle === 'ballot' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleInputChange('pollStyle', 'ballot')}
                  className="flex-col h-auto p-4 gap-2"
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-xs font-medium">Ballot</span>
                  <span className="text-xs text-muted-foreground text-center">Official ballot style</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Customization Panel */}
          <Card className="bg-gradient-to-br from-cm-green/5 to-cm-yellow/5 border-cm-green/20">
            <CardContent className="pt-6 space-y-6">
              <Label className="flex items-center gap-2 text-cm-green font-semibold">
                <Palette className="w-5 h-5" />
                Poll Customization
              </Label>
              
              {/* Theme Color Selection */}
              <div className="space-y-3">
                <Label>Civic Theme Color</Label>
                <div className="grid grid-cols-5 gap-2">
                  {themeColors.map((color) => (
                    <Button
                      key={color.value}
                      type="button"
                      variant={formData.themeColor === color.value ? 'default' : 'outline'}
                      className={cn(
                        "h-12 flex-col gap-1 p-2 border-2",
                        formData.themeColor === color.value ? 'border-ring shadow-md' : 'border-border'
                      )}
                      onClick={() => handleInputChange('themeColor', color.value)}
                    >
                      <div className={cn("w-4 h-4 rounded-full", color.class)} />
                      <span className="text-xs font-medium">{color.name.split(' ')[0]}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Banner Image Upload */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Civic Banner Image (Optional)
                </Label>
                {formData.bannerImageUrl && (
                  <div className="relative">
                    <img 
                      src={formData.bannerImageUrl} 
                      alt="Poll banner" 
                      className="w-full h-32 object-cover rounded-lg border border-border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => handleInputChange('bannerImageUrl', '')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                    id="banner-upload"
                  />
                  <Label 
                    htmlFor="banner-upload"
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md border border-dashed cursor-pointer transition-colors",
                      "hover:bg-muted/50 hover:border-primary",
                      uploadingImage && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Upload className="w-4 h-4" />
                    {uploadingImage ? 'Uploading...' : 'Upload Banner'}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG up to 5MB
                  </p>
                </div>
              </div>

              {/* Anonymous Mode */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                <div className="space-y-1">
                  <Label htmlFor="anonymousMode" className="flex items-center gap-2">
                    <UserMinus className="w-4 h-4" />
                    Anonymous Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Hide voter identities from results
                  </p>
                </div>
                <Switch
                  id="anonymousMode"
                  checked={formData.anonymousMode}
                  onCheckedChange={(checked) => handleInputChange('anonymousMode', checked)}
                />
              </div>

              {/* Poll Duration */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Poll Duration
                </Label>
                <Select 
                  value={formData.durationDays.toString()} 
                  onValueChange={(value) => handleInputChange('durationDays', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Day</SelectItem>
                    <SelectItem value="3">3 Days</SelectItem>
                    <SelectItem value="7">7 Days (Recommended)</SelectItem>
                    <SelectItem value="14">14 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="90">90 Days</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Poll will automatically close after this duration
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Poll Settings */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <Label>Advanced Settings</Label>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="hasExpiry">Custom Expiry Date</Label>
                  <p className="text-sm text-muted-foreground">
                    Override duration with specific date
                  </p>
                </div>
                <Switch
                  id="hasExpiry"
                  checked={formData.hasExpiry}
                  onCheckedChange={(checked) => handleInputChange('hasExpiry', checked)}
                />
              </div>

              {formData.hasExpiry && (
                <div>
                  <Label>Expiry Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.expiryDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.expiryDate ? (
                          format(formData.expiryDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.expiryDate}
                        onSelect={(date) => handleInputChange('expiryDate', date)}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Privacy Controls */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <Label className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Privacy Controls
              </Label>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="privacyMode">Privacy Mode</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <Button
                      type="button"
                      variant={formData.privacyMode === 'public' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleInputChange('privacyMode', 'public')}
                      className="flex-col h-auto p-3 gap-1"
                    >
                      <Users className="w-4 h-4" />
                      <span className="text-xs">Public</span>
                    </Button>
                    <Button
                      type="button"
                      variant={formData.privacyMode === 'private' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleInputChange('privacyMode', 'private')}
                      className="flex-col h-auto p-3 gap-1"
                    >
                      <Shield className="w-4 h-4" />
                      <span className="text-xs">Private</span>
                    </Button>
                    <Button
                      type="button"
                      variant={formData.privacyMode === 'anonymous' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleInputChange('privacyMode', 'anonymous')}
                      className="flex-col h-auto p-3 gap-1"
                    >
                      <EyeOff className="w-4 h-4" />
                      <span className="text-xs">Anonymous</span>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formData.privacyMode === 'public' && "Visible to everyone"}
                    {formData.privacyMode === 'private' && "Only visible to you and voters"}
                    {formData.privacyMode === 'anonymous' && "Visible to everyone but creator is hidden"}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="showResults">Show Results After Expiry</Label>
                    <p className="text-sm text-muted-foreground">
                      Display vote results even after poll expires
                    </p>
                  </div>
                  <Switch
                    id="showResults"
                    checked={formData.showResultsAfterExpiry}
                    onCheckedChange={(checked) => handleInputChange('showResultsAfterExpiry', checked)}
                  />
                </div>

                {formData.hasExpiry && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="autoDelete">Auto-Delete Poll</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically delete poll after expiry
                      </p>
                    </div>
                    <Switch
                      id="autoDelete"
                      checked={formData.autoDelete}
                      onCheckedChange={(checked) => handleInputChange('autoDelete', checked)}
                    />
                  </div>
                )}

                {formData.autoDelete && formData.hasExpiry && (
                  <div>
                    <Label htmlFor="autoDeleteDays">Delete After (Days)</Label>
                    <Input
                      id="autoDeleteDays"
                      type="number"
                      min="1"
                      max="365"
                      value={formData.autoDeleteDays}
                      onChange={(e) => handleInputChange('autoDeleteDays', parseInt(e.target.value) || 30)}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Poll will be deleted {formData.autoDeleteDays} days after expiry
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <Label className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Live Preview
              </Label>
              
              {formData.bannerImageUrl && (
                <div className="relative">
                  <img 
                    src={formData.bannerImageUrl} 
                    alt="Poll banner" 
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg" />
                  <div className="absolute bottom-2 left-3 text-white">
                    <h3 className="font-semibold text-sm">{formData.title || 'Your Poll Title'}</h3>
                  </div>
                </div>
              )}
              
              <div className={`p-4 rounded-lg border-2 ${formData.themeColor === 'cm-green' ? 'border-cm-green/30 bg-cm-green/5' : formData.themeColor === 'cm-yellow' ? 'border-cm-yellow/30 bg-cm-yellow/5' : formData.themeColor === 'cm-red' ? 'border-cm-red/30 bg-cm-red/5' : formData.themeColor === 'primary' ? 'border-primary/30 bg-primary/5' : 'border-accent/30 bg-accent/5'}`}>
                {(() => {
                  const validOptions = formData.options.filter(option => option.trim());
                  
                  if (validOptions.length < 2) {
                    return (
                      <div className="text-center py-8 text-muted-foreground">
                        <Vote className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Add at least 2 options to see the preview</p>
                      </div>
                    );
                  }

                  const previewPoll = {
                    title: formData.title || 'Sample Poll Title',
                    description: formData.description || 'This is how your poll will look',
                    options: validOptions,
                    votes_count: 0,
                    privacy_mode: formData.privacyMode,
                    ends_at: formData.hasExpiry && formData.expiryDate ? formData.expiryDate.toISOString() : null
                  };

                  return (
                    <>
                      {formData.pollStyle === 'card' && (
                        <CardPollStyle
                          poll={previewPoll}
                          isActive={false}
                          hasVoted={false}
                          className="pointer-events-none"
                        />
                      )}
                      {formData.pollStyle === 'chart' && (
                        <ChartPollStyle
                          poll={previewPoll}
                          isActive={false}
                          hasVoted={false}
                          className="pointer-events-none"
                        />
                      )}
                      {formData.pollStyle === 'ballot' && (
                        <BallotPollStyle
                          poll={previewPoll}
                          isActive={false}
                          hasVoted={false}
                          className="pointer-events-none"
                        />
                      )}
                    </>
                  );
                })()}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                <span>Theme: {themeColors.find(c => c.value === formData.themeColor)?.name}</span>
                <span>Duration: {formData.durationDays} days</span>
                <span>{formData.anonymousMode ? 'Anonymous' : 'Public votes'}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          
          <Button 
            onClick={createPoll} 
            disabled={!isFormValid() || loading}
          >
            {loading ? 'Creating...' : 'Create Poll'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};