import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Vote, 
  Briefcase, 
  Mic2, 
  MapPin, 
  TrendingUp, 
  Shield,
  Eye,
  Save,
  RotateCcw,
  Info
} from 'lucide-react';
import { useFeedAlgorithm } from '@/hooks/useFeedAlgorithm';
import { toast } from 'sonner';

interface FeedPreferencesProps {
  className?: string;
}

const cameroonRegions = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

const politicalEngagementLevels = [
  { value: 'low', label: 'Low Interest', description: 'Minimal political content' },
  { value: 'moderate', label: 'Moderate Interest', description: 'Balanced political content' },
  { value: 'high', label: 'High Interest', description: 'Frequent political updates' }
];

export const FeedPreferences: React.FC<FeedPreferencesProps> = ({ className = '' }) => {
  const { userPreferences, updatePreferences, loading } = useFeedAlgorithm();
  
  const [localPrefs, setLocalPrefs] = useState({
    civic_content_weight: 0.4,
    entertainment_weight: 0.3,
    job_content_weight: 0.2,
    artist_content_weight: 0.1,
    local_content_preference: 0.7,
    political_engagement_level: 'moderate',
    preferred_regions: [] as string[],
    blocked_topics: [] as string[]
  });
  
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load user preferences when available
  useEffect(() => {
    if (userPreferences) {
      setLocalPrefs({
        civic_content_weight: userPreferences.civic_content_weight || 0.4,
        entertainment_weight: userPreferences.entertainment_weight || 0.3,
        job_content_weight: userPreferences.job_content_weight || 0.2,
        artist_content_weight: userPreferences.artist_content_weight || 0.1,
        local_content_preference: userPreferences.local_content_preference || 0.7,
        political_engagement_level: userPreferences.political_engagement_level || 'moderate',
        preferred_regions: userPreferences.preferred_regions || [],
        blocked_topics: userPreferences.blocked_topics || []
      });
    }
  }, [userPreferences]);

  // Check for changes
  useEffect(() => {
    if (userPreferences) {
      const changed = JSON.stringify(localPrefs) !== JSON.stringify({
        civic_content_weight: userPreferences.civic_content_weight || 0.4,
        entertainment_weight: userPreferences.entertainment_weight || 0.3,
        job_content_weight: userPreferences.job_content_weight || 0.2,
        artist_content_weight: userPreferences.artist_content_weight || 0.1,
        local_content_preference: userPreferences.local_content_preference || 0.7,
        political_engagement_level: userPreferences.political_engagement_level || 'moderate',
        preferred_regions: userPreferences.preferred_regions || [],
        blocked_topics: userPreferences.blocked_topics || []
      });
      setHasChanges(changed);
    }
  }, [localPrefs, userPreferences]);

  const handleWeightChange = (type: string, value: number[]) => {
    const newValue = value[0] / 100;
    setLocalPrefs(prev => {
      const updated = { ...prev };
      
      // Type-safe weight updates
      if (type === 'civic_content_weight') {
        updated.civic_content_weight = newValue;
      } else if (type === 'entertainment_weight') {
        updated.entertainment_weight = newValue;
      } else if (type === 'job_content_weight') {
        updated.job_content_weight = newValue;
      } else if (type === 'artist_content_weight') {
        updated.artist_content_weight = newValue;
      }
      
      // Auto-balance other weights if total exceeds 1.0
      const total = updated.civic_content_weight + updated.entertainment_weight + 
                   updated.job_content_weight + updated.artist_content_weight;
      
      if (total > 1.0) {
        const excess = total - 1.0;
        const otherTypes = [
          { key: 'civic_content_weight', current: updated.civic_content_weight },
          { key: 'entertainment_weight', current: updated.entertainment_weight },
          { key: 'job_content_weight', current: updated.job_content_weight },
          { key: 'artist_content_weight', current: updated.artist_content_weight }
        ].filter(t => t.key !== type);
        
        otherTypes.forEach(otherType => {
          if (otherType.current > excess / otherTypes.length) {
            const reduction = excess / otherTypes.length;
            if (otherType.key === 'civic_content_weight') {
              updated.civic_content_weight = Math.max(0.05, updated.civic_content_weight - reduction);
            } else if (otherType.key === 'entertainment_weight') {
              updated.entertainment_weight = Math.max(0.05, updated.entertainment_weight - reduction);
            } else if (otherType.key === 'job_content_weight') {
              updated.job_content_weight = Math.max(0.05, updated.job_content_weight - reduction);
            } else if (otherType.key === 'artist_content_weight') {
              updated.artist_content_weight = Math.max(0.05, updated.artist_content_weight - reduction);
            }
          }
        });
      }
      
      return updated;
    });
  };

  const handleRegionToggle = (region: string) => {
    setLocalPrefs(prev => ({
      ...prev,
      preferred_regions: prev.preferred_regions.includes(region)
        ? prev.preferred_regions.filter(r => r !== region)
        : [...prev.preferred_regions, region]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePreferences(localPrefs);
      setHasChanges(false);
      toast.success('Feed preferences saved successfully!');
    } catch (error) {
      toast.error('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (userPreferences) {
      setLocalPrefs({
        civic_content_weight: userPreferences.civic_content_weight || 0.4,
        entertainment_weight: userPreferences.entertainment_weight || 0.3,
        job_content_weight: userPreferences.job_content_weight || 0.2,
        artist_content_weight: userPreferences.artist_content_weight || 0.1,
        local_content_preference: userPreferences.local_content_preference || 0.7,
        political_engagement_level: userPreferences.political_engagement_level || 'moderate',
        preferred_regions: userPreferences.preferred_regions || [],
        blocked_topics: userPreferences.blocked_topics || []
      });
    }
  };

  const totalContentWeight = localPrefs.civic_content_weight + localPrefs.entertainment_weight + 
                            localPrefs.job_content_weight + localPrefs.artist_content_weight;

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-sans text-xl font-semibold">
            <Settings className="w-5 h-5" />
            Feed Preferences
          </CardTitle>
          <p className="text-sm text-muted-foreground font-sans">
            Customize your CamerPulse feed to match your interests and civic engagement level
          </p>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Content Type Weights */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4" />
              <h3 className="font-sans font-semibold">Content Preferences</h3>
              <Badge variant={totalContentWeight > 1.1 ? "destructive" : "secondary"} className="font-sans text-xs">
                Total: {Math.round(totalContentWeight * 100)}%
              </Badge>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center gap-2 font-sans">
                    <Vote className="w-4 h-4 text-primary" />
                    Civic & Political Content
                  </Label>
                  <span className="text-sm font-mono">{Math.round(localPrefs.civic_content_weight * 100)}%</span>
                </div>
                <Slider
                  value={[localPrefs.civic_content_weight * 100]}
                  onValueChange={(value) => handleWeightChange('civic_content_weight', value)}
                  max={80}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1 font-sans">
                  Government updates, political discussions, civic engagement
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center gap-2 font-sans">
                    <Briefcase className="w-4 h-4 text-blue-500" />
                    Job Opportunities
                  </Label>
                  <span className="text-sm font-mono">{Math.round(localPrefs.job_content_weight * 100)}%</span>
                </div>
                <Slider
                  value={[localPrefs.job_content_weight * 100]}
                  onValueChange={(value) => handleWeightChange('job_content_weight', value)}
                  max={60}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1 font-sans">
                  Career opportunities, professional development
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center gap-2 font-sans">
                    <Mic2 className="w-4 h-4 text-purple-500" />
                    Artist & Cultural Content
                  </Label>
                  <span className="text-sm font-mono">{Math.round(localPrefs.artist_content_weight * 100)}%</span>
                </div>
                <Slider
                  value={[localPrefs.artist_content_weight * 100]}
                  onValueChange={(value) => handleWeightChange('artist_content_weight', value)}
                  max={40}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1 font-sans">
                  Music, arts, cultural events, entertainment
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center gap-2 font-sans">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    General Entertainment
                  </Label>
                  <span className="text-sm font-mono">{Math.round(localPrefs.entertainment_weight * 100)}%</span>
                </div>
                <Slider
                  value={[localPrefs.entertainment_weight * 100]}
                  onValueChange={(value) => handleWeightChange('entertainment_weight', value)}
                  max={50}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1 font-sans">
                  Sports, lifestyle, general entertainment content
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Geographic Preferences */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4" />
              <h3 className="font-sans font-semibold">Geographic Preferences</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-sans">Local Content Priority</Label>
                  <span className="text-sm font-mono">{Math.round(localPrefs.local_content_preference * 100)}%</span>
                </div>
                <Slider
                  value={[localPrefs.local_content_preference * 100]}
                  onValueChange={(value) => setLocalPrefs(prev => ({ ...prev, local_content_preference: value[0] / 100 }))}
                  max={100}
                  step={10}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1 font-sans">
                  How much to prioritize content from your region
                </p>
              </div>

              <div>
                <Label className="font-sans font-medium mb-3 block">Preferred Regions</Label>
                <div className="grid grid-cols-2 gap-2">
                  {cameroonRegions.map((region) => (
                    <div key={region} className="flex items-center space-x-2">
                      <Switch
                        id={region}
                        checked={localPrefs.preferred_regions.includes(region)}
                        onCheckedChange={() => handleRegionToggle(region)}
                      />
                      <Label htmlFor={region} className="font-sans text-sm cursor-pointer">
                        {region}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Political Engagement Level */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4" />
              <h3 className="font-sans font-semibold">Political Engagement Level</h3>
            </div>
            
            <Select 
              value={localPrefs.political_engagement_level} 
              onValueChange={(value) => setLocalPrefs(prev => ({ ...prev, political_engagement_level: value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select engagement level" />
              </SelectTrigger>
              <SelectContent>
                {politicalEngagementLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div>
                      <div className="font-sans font-medium">{level.label}</div>
                      <div className="font-sans text-xs text-muted-foreground">{level.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="font-sans text-sm">
              These preferences help personalize your feed while ensuring you stay informed about important civic matters. 
              The algorithm learns from your interactions to continuously improve content relevance.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <Button 
              onClick={handleSave}
              disabled={!hasChanges || saving || loading}
              className="font-sans"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleReset}
              disabled={!hasChanges || saving}
              className="font-sans"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          {hasChanges && (
            <Alert>
              <Eye className="h-4 w-4" />
              <AlertDescription className="font-sans text-sm">
                You have unsaved changes. Your feed will update after saving these preferences.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};