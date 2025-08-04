import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RefreshCw, Save, AlertTriangle } from 'lucide-react';

interface FeatureFlag {
  id: string;
  feature_name: string;
  is_enabled: boolean;
  disabled_reason?: string;
  disabled_at?: string;
  updated_at: string;
}

export const FeatureFlagsDashboard = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFlags = async () => {
    try {
      const { data, error } = await supabase
        .from('system_feature_flags')
        .select('*')
        .order('feature_name');

      if (error) throw error;
      setFlags(data || []);
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      toast({
        title: "Error",
        description: "Failed to fetch feature flags",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const toggleFlag = async (flagId: string, newValue: boolean) => {
    setSaving(flagId);
    try {
      const { error } = await supabase
        .from('system_feature_flags')
        .update({ 
          is_enabled: newValue,
          disabled_at: newValue ? null : new Date().toISOString()
        })
        .eq('id', flagId);

      if (error) throw error;

      setFlags(flags.map(flag => 
        flag.id === flagId 
          ? { ...flag, is_enabled: newValue, disabled_at: newValue ? null : new Date().toISOString() }
          : flag
      ));

      toast({
        title: "Success",
        description: `Feature ${newValue ? 'enabled' : 'disabled'} successfully`
      });
    } catch (error) {
      console.error('Error updating feature flag:', error);
      toast({
        title: "Error",
        description: "Failed to update feature flag",
        variant: "destructive"
      });
    } finally {
      setSaving(null);
    }
  };

  const updateReason = async (flagId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('system_feature_flags')
        .update({ disabled_reason: reason })
        .eq('id', flagId);

      if (error) throw error;

      setFlags(flags.map(flag => 
        flag.id === flagId ? { ...flag, disabled_reason: reason } : flag
      ));

      toast({
        title: "Success",
        description: "Reason updated successfully"
      });
    } catch (error) {
      console.error('Error updating reason:', error);
      toast({
        title: "Error",
        description: "Failed to update reason",
        variant: "destructive"
      });
    }
  };

  const getCategoryColor = (featureName: string) => {
    if (featureName.includes('civic') || featureName.includes('government') || featureName.includes('citizen')) {
      return 'bg-green-100 text-green-800';
    }
    if (featureName.includes('ashen') || featureName.includes('ai')) {
      return 'bg-red-100 text-red-800';
    }
    if (featureName.includes('artist') || featureName.includes('fan')) {
      return 'bg-purple-100 text-purple-800';
    }
    if (featureName.includes('marketplace') || featureName.includes('job')) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading feature flags...</span>
      </div>
    );
  }

  const enabledCount = flags.filter(f => f.is_enabled).length;
  const disabledCount = flags.length - enabledCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Feature Flags Management</h1>
          <p className="text-muted-foreground">
            Control platform features and simplification progress
          </p>
        </div>
        <Button onClick={fetchFlags} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{enabledCount}</div>
            <div className="text-sm text-muted-foreground">Features Enabled</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{disabledCount}</div>
            <div className="text-sm text-muted-foreground">Features Disabled</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((disabledCount / flags.length) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Simplification Progress</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {flags.map((flag) => (
          <Card key={flag.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{flag.feature_name}</CardTitle>
                  <Badge className={getCategoryColor(flag.feature_name)}>
                    {flag.feature_name.split('_')[0]}
                  </Badge>
                  {!flag.is_enabled && (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Disabled
                    </Badge>
                  )}
                </div>
                <Switch
                  checked={flag.is_enabled}
                  onCheckedChange={(checked) => toggleFlag(flag.id, checked)}
                  disabled={saving === flag.id}
                />
              </div>
            </CardHeader>
            <CardContent>
              {!flag.is_enabled && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Disabled Reason:</label>
                    <Textarea
                      value={flag.disabled_reason || ''}
                      onChange={(e) => {
                        setFlags(flags.map(f => 
                          f.id === flag.id 
                            ? { ...f, disabled_reason: e.target.value }
                            : f
                        ));
                      }}
                      placeholder="Enter reason for disabling this feature..."
                      className="mt-1"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => updateReason(flag.id, flag.disabled_reason || '')}
                    className="ml-auto"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save Reason
                  </Button>
                </div>
              )}
              {flag.disabled_at && (
                <div className="text-xs text-muted-foreground mt-2">
                  Disabled: {new Date(flag.disabled_at).toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};