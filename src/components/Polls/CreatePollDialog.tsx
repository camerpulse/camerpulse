import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  Plus, 
  X, 
  Calendar as CalendarIcon,
  Vote,
  Clock,
  Users,
  Shield,
  Eye,
  EyeOff
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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    options: ['', ''],
    hasExpiry: false,
    expiryDate: undefined as Date | undefined,
    privacyMode: 'public' as 'public' | 'private' | 'anonymous',
    showResultsAfterExpiry: true,
    autoDelete: false,
    autoDeleteDays: 30
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

      // Calculate auto delete date if enabled
      const autoDeleteAt = formData.autoDelete && formData.expiryDate 
        ? new Date(formData.expiryDate.getTime() + (formData.autoDeleteDays * 24 * 60 * 60 * 1000))
        : null;

      const { error } = await supabase
        .from('polls')
        .insert({
          creator_id: user.id,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          options: validOptions,
          ends_at: formData.hasExpiry && formData.expiryDate 
            ? formData.expiryDate.toISOString() 
            : null,
          privacy_mode: formData.privacyMode,
          show_results_after_expiry: formData.showResultsAfterExpiry,
          auto_delete_at: autoDeleteAt?.toISOString() || null,
          is_active: true
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
        autoDeleteDays: 30
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

          {/* Poll Settings */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <Label>Poll Settings</Label>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="hasExpiry">Set Expiry Date</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically close the poll after a specific date
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

          {/* Preview */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <Label className="text-sm font-medium">Poll Preview</Label>
              <div className="mt-2 space-y-2">
                <h4 className="font-semibold">
                  {formData.title || 'Your poll title will appear here'}
                </h4>
                {formData.description && (
                  <p className="text-sm text-muted-foreground">
                    {formData.description}
                  </p>
                )}
                <div className="space-y-1">
                  {formData.options.map((option, index) => (
                    option.trim() && (
                      <div key={index} className="p-2 bg-background rounded border text-sm">
                        {option}
                      </div>
                    )
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>0 votes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {formData.privacyMode === 'public' && <Users className="w-3 h-3" />}
                    {formData.privacyMode === 'private' && <Shield className="w-3 h-3" />}
                    {formData.privacyMode === 'anonymous' && <EyeOff className="w-3 h-3" />}
                    <span className="capitalize">{formData.privacyMode}</span>
                  </div>
                  {formData.hasExpiry && formData.expiryDate && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Ends {format(formData.expiryDate, "PPP")}</span>
                    </div>
                  )}
                  {formData.autoDelete && formData.hasExpiry && (
                    <div className="flex items-center gap-1">
                      <X className="w-3 h-3" />
                      <span>Auto-delete in {formData.autoDeleteDays}d</span>
                    </div>
                  )}
                </div>
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