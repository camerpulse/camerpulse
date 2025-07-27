import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, Target, TrendingUp, Users, BarChart3, Plus, Edit, Trash2 } from 'lucide-react';

interface AbTestConfig {
  id: string;
  test_name: string;
  description: string;
  is_active: boolean;
  traffic_allocation: any;
  start_date: string;
  end_date?: string;
  success_metrics: any;
  created_at: string;
  updated_at: string;
}

export function AbTestConfiguration() {
  const { user, isAdmin } = useAuth();
  const [configs, setConfigs] = useState<AbTestConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingConfig, setEditingConfig] = useState<AbTestConfig | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  // Form state for new/edit config
  const [formData, setFormData] = useState({
    test_name: '',
    description: '',
    is_active: true,
    traffic_allocation: { control: 50, personalized: 25, trending: 25 } as any,
    end_date: '',
    success_metrics: ['click_through_rate', 'conversion_rate']
  });

  const fetchConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('ab_test_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Error fetching A/B test configs:', error);
      toast.error('Failed to load A/B test configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      const configData = {
        ...formData,
        end_date: formData.end_date || null,
        traffic_allocation: formData.traffic_allocation,
        success_metrics: formData.success_metrics
      };

      if (editingConfig) {
        const { error } = await supabase
          .from('ab_test_configs')
          .update(configData)
          .eq('id', editingConfig.id);

        if (error) throw error;
        toast.success('A/B test configuration updated successfully');
      } else {
        const { error } = await supabase
          .from('ab_test_configs')
          .insert(configData);

        if (error) throw error;
        toast.success('A/B test configuration created successfully');
      }

      setEditingConfig(null);
      setShowNewForm(false);
      setFormData({
        test_name: '',
        description: '',
        is_active: true,
        traffic_allocation: { control: 50, personalized: 25, trending: 25 },
        end_date: '',
        success_metrics: ['click_through_rate', 'conversion_rate']
      });
      fetchConfigs();
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save configuration');
    }
  };

  const handleDeleteConfig = async (configId: string) => {
    if (!confirm('Are you sure you want to delete this A/B test configuration?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('ab_test_configs')
        .delete()
        .eq('id', configId);

      if (error) throw error;
      toast.success('A/B test configuration deleted');
      fetchConfigs();
    } catch (error) {
      console.error('Error deleting config:', error);
      toast.error('Failed to delete configuration');
    }
  };

  const handleToggleActive = async (config: AbTestConfig) => {
    try {
      const { error } = await supabase
        .from('ab_test_configs')
        .update({ is_active: !config.is_active })
        .eq('id', config.id);

      if (error) throw error;
      toast.success(`A/B test ${config.is_active ? 'deactivated' : 'activated'}`);
      fetchConfigs();
    } catch (error) {
      console.error('Error toggling config:', error);
      toast.error('Failed to update configuration');
    }
  };

  const startEditing = (config: AbTestConfig) => {
    setEditingConfig(config);
    setFormData({
      test_name: config.test_name,
      description: config.description,
      is_active: config.is_active,
      traffic_allocation: config.traffic_allocation,
      end_date: config.end_date?.split('T')[0] || '',
      success_metrics: config.success_metrics
    });
    setShowNewForm(true);
  };

  const updateTrafficAllocation = (group: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      traffic_allocation: {
        ...prev.traffic_allocation,
        [group]: value
      }
    }));
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchConfigs();
    }
  }, [user, isAdmin]);

  if (!user || !isAdmin) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Admin access required</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">A/B Test Configuration</h2>
          <p className="text-muted-foreground">Manage recommendation algorithm testing</p>
        </div>
        <Button onClick={() => setShowNewForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Test
        </Button>
      </div>

      {showNewForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingConfig ? 'Edit' : 'Create'} A/B Test Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="test_name">Test Name</Label>
                <Input
                  id="test_name"
                  value={formData.test_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, test_name: e.target.value }))}
                  placeholder="e.g., recommendation_algorithm_test"
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date (Optional)</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the purpose of this A/B test"
              />
            </div>

            <div>
              <Label>Traffic Allocation (%)</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                {Object.entries(formData.traffic_allocation).map(([group, percentage]) => (
                  <div key={group}>
                    <Label htmlFor={group} className="text-sm capitalize">{group}</Label>
                    <Input
                      id={group}
                      type="number"
                      min="0"
                      max="100"
                      value={percentage as number}
                      onChange={(e) => updateTrafficAllocation(group, parseInt(e.target.value) || 0)}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total: {(() => {
                  const total = Object.values(formData.traffic_allocation).reduce((sum: number, val: any) => {
                    return sum + Number(val);
                  }, 0);
                  return `${total}%`;
                })()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label>Active</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveConfig}>
                {editingConfig ? 'Update' : 'Create'} Test
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowNewForm(false);
                  setEditingConfig(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {configs.map((config) => (
            <Card key={config.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      {config.test_name}
                      {config.is_active && (
                        <Badge variant="default" className="ml-2">Active</Badge>
                      )}
                    </CardTitle>
                    <p className="text-muted-foreground mt-1">{config.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(config)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(config)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteConfig(config.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="allocation" className="w-full">
                  <TabsList>
                    <TabsTrigger value="allocation">Traffic Allocation</TabsTrigger>
                    <TabsTrigger value="metrics">Success Metrics</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>

                  <TabsContent value="allocation" className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(config.traffic_allocation).map(([group, percentage]) => (
                        <div key={group} className="text-center p-4 border rounded">
                          <div className="text-2xl font-bold text-primary">{percentage as number}%</div>
                          <div className="text-sm text-muted-foreground capitalize">{group}</div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="metrics" className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {config.success_metrics.map((metric) => (
                        <Badge key={metric} variant="secondary">
                          {metric.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Created:</span>
                        <span className="ml-2 text-muted-foreground">
                          {new Date(config.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Updated:</span>
                        <span className="ml-2 text-muted-foreground">
                          {new Date(config.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                      {config.end_date && (
                        <div>
                          <span className="font-medium">End Date:</span>
                          <span className="ml-2 text-muted-foreground">
                            {new Date(config.end_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}

          {configs.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No A/B test configurations found</p>
                <Button 
                  onClick={() => setShowNewForm(true)}
                  className="mt-4"
                  variant="outline"
                >
                  Create Your First Test
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}