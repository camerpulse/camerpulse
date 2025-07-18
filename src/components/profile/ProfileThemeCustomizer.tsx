import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Palette, Monitor, Sun, Moon, Sparkles, Eye } from 'lucide-react';

interface ProfileTheme {
  id: string;
  profile_id: string;
  theme_name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_style: 'solid' | 'gradient' | 'image';
  background_image?: string;
  font_family: string;
  card_style: 'flat' | 'elevated' | 'outlined';
  animation_level: number;
  dark_mode_override?: boolean;
  custom_css?: string;
  is_active: boolean;
}

interface ProfileThemeCustomizerProps {
  profileId: string;
  onThemeChange?: (theme: ProfileTheme) => void;
}

const PRESET_THEMES = [
  {
    name: 'CamerPulse Classic',
    primary_color: '#2563eb',
    secondary_color: '#64748b',
    accent_color: '#0ea5e9',
    background_style: 'solid' as const,
    font_family: 'Inter',
    card_style: 'elevated' as const
  },
  {
    name: 'Political Power',
    primary_color: '#dc2626',
    secondary_color: '#991b1b',
    accent_color: '#fbbf24',
    background_style: 'gradient' as const,
    font_family: 'Inter',
    card_style: 'outlined' as const
  },
  {
    name: 'Civic Green',
    primary_color: '#16a34a',
    secondary_color: '#15803d',
    accent_color: '#22c55e',
    background_style: 'solid' as const,
    font_family: 'Inter',
    card_style: 'flat' as const
  },
  {
    name: 'Artist Vibes',
    primary_color: '#9333ea',
    secondary_color: '#7c3aed',
    accent_color: '#f59e0b',
    background_style: 'gradient' as const,
    font_family: 'Inter',
    card_style: 'elevated' as const
  }
];

export const ProfileThemeCustomizer: React.FC<ProfileThemeCustomizerProps> = ({
  profileId,
  onThemeChange
}) => {
  const { toast } = useToast();
  const [currentTheme, setCurrentTheme] = useState<ProfileTheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchCurrentTheme();
  }, [profileId]);

  const fetchCurrentTheme = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profile_themes')
        .select('*')
        .eq('profile_id', profileId)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setCurrentTheme(data);
      } else {
        // Create default theme
        await createDefaultTheme();
      }
    } catch (error) {
      console.error('Error fetching theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultTheme = async () => {
    try {
      const defaultTheme = {
        profile_id: profileId,
        theme_name: 'Default',
        primary_color: '#2563eb',
        secondary_color: '#64748b',
        accent_color: '#0ea5e9',
        background_style: 'solid' as const,
        font_family: 'Inter',
        card_style: 'elevated' as const,
        animation_level: 50,
        is_active: true
      };

      const { data, error } = await supabase
        .from('profile_themes')
        .insert(defaultTheme)
        .select()
        .single();

      if (error) throw error;
      setCurrentTheme(data);
    } catch (error) {
      console.error('Error creating default theme:', error);
    }
  };

  const updateTheme = async (updates: Partial<ProfileTheme>) => {
    if (!currentTheme) return;

    try {
      const { data, error } = await supabase
        .from('profile_themes')
        .update(updates)
        .eq('id', currentTheme.id)
        .select()
        .single();

      if (error) throw error;
      
      setCurrentTheme(data);
      onThemeChange?.(data);
      
      toast({
        title: "Theme updated",
        description: "Your profile theme has been saved"
      });
    } catch (error) {
      console.error('Error updating theme:', error);
      toast({
        title: "Error",
        description: "Failed to update theme",
        variant: "destructive"
      });
    }
  };

  const applyPresetTheme = async (preset: typeof PRESET_THEMES[0]) => {
    await updateTheme({
      theme_name: preset.name,
      primary_color: preset.primary_color,
      secondary_color: preset.secondary_color,
      accent_color: preset.accent_color,
      background_style: preset.background_style,
      font_family: preset.font_family,
      card_style: preset.card_style
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Theme Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Theme Presets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRESET_THEMES.map((preset, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
                onClick={() => applyPresetTheme(preset)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: preset.primary_color }}
                  />
                  <span className="font-medium">{preset.name}</span>
                </div>
                <div className="flex gap-2">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: preset.primary_color }}
                  />
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: preset.secondary_color }}
                  />
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: preset.accent_color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Primary Color</Label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="color"
                  value={currentTheme?.primary_color || '#2563eb'}
                  onChange={(e) => updateTheme({ primary_color: e.target.value })}
                  className="w-12 h-8 rounded border"
                />
                <span className="text-sm text-muted-foreground">
                  {currentTheme?.primary_color}
                </span>
              </div>
            </div>
            <div>
              <Label>Secondary Color</Label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="color"
                  value={currentTheme?.secondary_color || '#64748b'}
                  onChange={(e) => updateTheme({ secondary_color: e.target.value })}
                  className="w-12 h-8 rounded border"
                />
                <span className="text-sm text-muted-foreground">
                  {currentTheme?.secondary_color}
                </span>
              </div>
            </div>
            <div>
              <Label>Accent Color</Label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="color"
                  value={currentTheme?.accent_color || '#0ea5e9'}
                  onChange={(e) => updateTheme({ accent_color: e.target.value })}
                  className="w-12 h-8 rounded border"
                />
                <span className="text-sm text-muted-foreground">
                  {currentTheme?.accent_color}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout & Style */}
      <Card>
        <CardHeader>
          <CardTitle>Layout & Style</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Background Style */}
          <div>
            <Label className="text-base font-medium">Background Style</Label>
            <RadioGroup
              value={currentTheme?.background_style || 'solid'}
              onValueChange={(value) => updateTheme({ background_style: value as any })}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="solid" id="solid" />
                <Label htmlFor="solid">Solid Color</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gradient" id="gradient" />
                <Label htmlFor="gradient">Gradient</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="image" id="image" />
                <Label htmlFor="image">Background Image</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Card Style */}
          <div>
            <Label className="text-base font-medium">Card Style</Label>
            <RadioGroup
              value={currentTheme?.card_style || 'elevated'}
              onValueChange={(value) => updateTheme({ card_style: value as any })}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="flat" id="flat" />
                <Label htmlFor="flat">Flat</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="elevated" id="elevated" />
                <Label htmlFor="elevated">Elevated (Shadow)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="outlined" id="outlined" />
                <Label htmlFor="outlined">Outlined</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Animation Level */}
          <div>
            <Label className="text-base font-medium">Animation Level</Label>
            <div className="mt-2 space-y-2">
              <Slider
                value={[currentTheme?.animation_level || 50]}
                onValueChange={([value]) => updateTheme({ animation_level: value })}
                max={100}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Minimal</span>
                <span>Moderate</span>
                <span>High</span>
              </div>
            </div>
          </div>

          {/* Dark Mode Override */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Force Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Override system theme preference
              </p>
            </div>
            <Switch
              checked={currentTheme?.dark_mode_override || false}
              onCheckedChange={(checked) => updateTheme({ dark_mode_override: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setPreviewMode(!previewMode)}
          className="flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          {previewMode ? 'Exit Preview' : 'Preview Changes'}
        </Button>
        
        <Button onClick={() => fetchCurrentTheme()}>
          Reset to Saved
        </Button>
      </div>
    </div>
  );
};