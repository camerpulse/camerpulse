import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Sliders, Users, AlertTriangle, CheckCircle, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReputationSettings {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string;
  category: string;
  is_active: boolean;
}

interface ScoringWeight {
  source_type: string;
  weight: number;
  enabled: boolean;
  description: string;
}

export default function AdminSettingsPanel() {
  const [settings, setSettings] = useState<ReputationSettings[]>([]);
  const [scoringWeights, setScoringWeights] = useState<ScoringWeight[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
    initializeScoringWeights();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Mock settings data
      const mockSettings: ReputationSettings[] = [
        {
          id: '1',
          setting_key: 'enable_politician_reputation',
          setting_value: true,
          description: 'Enable reputation scoring for politicians',
          category: 'entity_types',
          is_active: true
        },
        {
          id: '2',
          setting_key: 'enable_ministry_reputation',
          setting_value: true,
          description: 'Enable reputation scoring for ministries',
          category: 'entity_types',
          is_active: true
        },
        {
          id: '3',
          setting_key: 'enable_village_reputation',
          setting_value: false,
          description: 'Enable reputation scoring for villages',
          category: 'entity_types',
          is_active: true
        },
        {
          id: '4',
          setting_key: 'auto_recalculation_interval',
          setting_value: 24,
          description: 'Hours between automatic score recalculations',
          category: 'automation',
          is_active: true
        },
        {
          id: '5',
          setting_key: 'minimum_sources_required',
          setting_value: 3,
          description: 'Minimum verified sources required for score calculation',
          category: 'validation',
          is_active: true
        },
        {
          id: '6',
          setting_key: 'enable_ai_adjustments',
          setting_value: true,
          description: 'Allow AI to make automatic score adjustments',
          category: 'automation',
          is_active: true
        },
        {
          id: '7',
          setting_key: 'public_score_visibility',
          setting_value: true,
          description: 'Make reputation scores publicly visible',
          category: 'privacy',
          is_active: true
        }
      ];

      setSettings(mockSettings);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeScoringWeights = () => {
    const defaultWeights: ScoringWeight[] = [
      {
        source_type: 'bill_passed',
        weight: 1.0,
        enabled: true,
        description: 'Successfully passed legislation'
      },
      {
        source_type: 'project_completed',
        weight: 1.2,
        enabled: true,
        description: 'Completed public projects'
      },
      {
        source_type: 'citizen_rating',
        weight: 0.8,
        enabled: true,
        description: 'Citizen satisfaction ratings'
      },
      {
        source_type: 'transparency_audit',
        weight: 1.5,
        enabled: true,
        description: 'Transparency audit results'
      },
      {
        source_type: 'attendance',
        weight: 0.6,
        enabled: true,
        description: 'Parliamentary/meeting attendance'
      },
      {
        source_type: 'corruption_flag',
        weight: -2.0,
        enabled: true,
        description: 'Corruption allegations or flags'
      },
      {
        source_type: 'promise_fulfilled',
        weight: 1.1,
        enabled: true,
        description: 'Campaign promises kept'
      }
    ];

    setScoringWeights(defaultWeights);
  };

  const updateSetting = async (settingId: string, newValue: any) => {
    try {
      setSaving(true);
      
      setSettings(prev => prev.map(setting => 
        setting.id === settingId 
          ? { ...setting, setting_value: newValue }
          : setting
      ));

      toast({
        title: "Success",
        description: "Setting updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateScoringWeight = (sourceType: string, field: 'weight' | 'enabled', value: any) => {
    setScoringWeights(prev => prev.map(weight => 
      weight.source_type === sourceType 
        ? { ...weight, [field]: value }
        : weight
    ));
  };

  const saveScoringWeights = async () => {
    try {
      setSaving(true);
      
      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Success",
        description: "Scoring weights updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update scoring weights",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    try {
      setSaving(true);
      
      initializeScoringWeights();
      
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: "Success",
        description: "Settings reset to defaults",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const recalculateAllScores = async () => {
    try {
      setSaving(true);
      
      // Mock recalculation
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Success",
        description: "All reputation scores recalculated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to recalculate scores",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getSettingsByCategory = (category: string) => {
    return settings.filter(setting => setting.category === category);
  };

  const renderSettingControl = (setting: ReputationSettings) => {
    switch (typeof setting.setting_value) {
      case 'boolean':
        return (
          <Switch
            checked={setting.setting_value}
            onCheckedChange={(value) => updateSetting(setting.id, value)}
            disabled={saving}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={setting.setting_value}
            onChange={(e) => updateSetting(setting.id, parseInt(e.target.value))}
            disabled={saving}
            className="w-24"
          />
        );
      default:
        return (
          <Input
            value={setting.setting_value}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
            disabled={saving}
            className="w-48"
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Settings className="h-8 w-8" />
            <h1 className="text-4xl font-bold">Reputation System Settings</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Configure how the civic reputation system calculates and displays scores
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-4 w-4" />
                Active Entities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247</div>
              <p className="text-sm text-muted-foreground">Being scored</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sliders className="h-4 w-4" />
                Score Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scoringWeights.filter(w => w.enabled).length}</div>
              <p className="text-sm text-muted-foreground">Active types</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Last Update
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2h ago</div>
              <p className="text-sm text-muted-foreground">Auto recalc</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-sm text-muted-foreground">Settings changes</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Settings Interface */}
        <Card>
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
            <CardDescription>
              Manage reputation system settings and scoring parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="entity-types" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="entity-types">Entity Types</TabsTrigger>
                <TabsTrigger value="scoring-weights">Scoring Weights</TabsTrigger>
                <TabsTrigger value="automation">Automation</TabsTrigger>
                <TabsTrigger value="privacy">Privacy & Access</TabsTrigger>
              </TabsList>

              <TabsContent value="entity-types" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Enable Reputation Scoring</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose which entity types should have reputation scores calculated and displayed.
                  </p>
                  
                  {getSettingsByCategory('entity_types').map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label className="font-medium">
                          {setting.setting_key.replace(/enable_|_reputation/g, '').replace(/_/g, ' ')}
                        </Label>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                      {renderSettingControl(setting)}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="scoring-weights" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Score Source Weights</h3>
                      <p className="text-sm text-muted-foreground">
                        Adjust how much each source type contributes to the overall reputation score.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={resetToDefaults} disabled={saving}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset to Defaults
                      </Button>
                      <Button onClick={saveScoringWeights} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {scoringWeights.map((weight) => (
                      <div key={weight.source_type} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Label className="font-medium capitalize">
                                {weight.source_type.replace(/_/g, ' ')}
                              </Label>
                              <Badge variant={weight.enabled ? 'default' : 'secondary'}>
                                {weight.enabled ? 'Enabled' : 'Disabled'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{weight.description}</p>
                          </div>
                          <Switch
                            checked={weight.enabled}
                            onCheckedChange={(value) => updateScoringWeight(weight.source_type, 'enabled', value)}
                          />
                        </div>
                        
                        {weight.enabled && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Weight Multiplier</Label>
                              <span className="text-sm font-medium">{weight.weight}x</span>
                            </div>
                            <Slider
                              value={[weight.weight]}
                              onValueChange={(value) => updateScoringWeight(weight.source_type, 'weight', value[0])}
                              max={3}
                              min={-3}
                              step={0.1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>-3.0 (Strong Negative)</span>
                              <span>0 (Neutral)</span>
                              <span>+3.0 (Strong Positive)</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="automation" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Automation Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure how the system automatically calculates and updates reputation scores.
                  </p>

                  {getSettingsByCategory('automation').concat(getSettingsByCategory('validation')).map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label className="font-medium">
                          {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Label>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                      {renderSettingControl(setting)}
                    </div>
                  ))}

                  <Separator />

                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                    <div className="space-y-1">
                      <Label className="font-medium">Manual Recalculation</Label>
                      <p className="text-sm text-muted-foreground">
                        Trigger a manual recalculation of all reputation scores with current settings
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={recalculateAllScores} 
                      disabled={saving}
                    >
                      {saving ? 'Recalculating...' : 'Recalculate All Scores'}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="privacy" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Privacy & Access Control</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage who can view reputation scores and detailed breakdowns.
                  </p>

                  {getSettingsByCategory('privacy').map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label className="font-medium">
                          {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Label>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                      {renderSettingControl(setting)}
                    </div>
                  ))}

                  <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                    <h4 className="font-medium text-blue-900">Data Retention Policy</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      Reputation scores and their source data are retained for audit purposes. 
                      Historical data older than 7 years is automatically archived.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}