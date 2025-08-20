import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Bot, 
  Shield, 
  Zap, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Settings,
  Eye,
  Ban
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ModerationRule {
  id: string;
  name: string;
  type: 'keyword' | 'pattern' | 'sentiment' | 'spam';
  enabled: boolean;
  sensitivity: number;
  action: 'flag' | 'hide' | 'delete';
  criteria: string;
  description: string;
}

interface AutoModerationStats {
  totalActions: number;
  flaggedContent: number;
  hiddenContent: number;
  deletedContent: number;
  accuracyRate: number;
  falsePositives: number;
}

export const AutoModerationTools: React.FC = () => {
  const [rules, setRules] = useState<ModerationRule[]>([
    {
      id: '1',
      name: 'Hate Speech Detection',
      type: 'keyword',
      enabled: true,
      sensitivity: 80,
      action: 'flag',
      criteria: 'hate, discriminatory language',
      description: 'Detects potentially harmful hate speech and discriminatory language'
    },
    {
      id: '2',
      name: 'Spam Filter',
      type: 'spam',
      enabled: true,
      sensitivity: 70,
      action: 'hide',
      criteria: 'repetitive content, excessive links',
      description: 'Identifies and handles spam content automatically'
    },
    {
      id: '3',
      name: 'Harassment Detection',
      type: 'pattern',
      enabled: true,
      sensitivity: 75,
      action: 'flag',
      criteria: 'harassment patterns, bullying',
      description: 'Detects patterns of harassment and bullying behavior'
    }
  ]);

  const [stats, setStats] = useState<AutoModerationStats>({
    totalActions: 1247,
    flaggedContent: 892,
    hiddenContent: 234,
    deletedContent: 121,
    accuracyRate: 87.3,
    falsePositives: 45
  });

  const [newRule, setNewRule] = useState<Partial<ModerationRule>>({
    name: '',
    type: 'keyword',
    sensitivity: 75,
    action: 'flag',
    criteria: '',
    description: ''
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const toggleRule = async (ruleId: string, enabled: boolean) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled } : rule
    ));

    toast({
      title: enabled ? "Rule Enabled" : "Rule Disabled",
      description: `Auto-moderation rule has been ${enabled ? 'enabled' : 'disabled'}`
    });
  };

  const updateRuleSensitivity = async (ruleId: string, sensitivity: number) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, sensitivity } : rule
    ));
  };

  const createRule = async () => {
    if (!newRule.name || !newRule.criteria) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const rule: ModerationRule = {
      id: Date.now().toString(),
      name: newRule.name,
      type: newRule.type || 'keyword',
      enabled: true,
      sensitivity: newRule.sensitivity || 75,
      action: newRule.action || 'flag',
      criteria: newRule.criteria,
      description: newRule.description || ''
    };

    setRules(prev => [...prev, rule]);
    setNewRule({
      name: '',
      type: 'keyword',
      sensitivity: 75,
      action: 'flag',
      criteria: '',
      description: ''
    });
    setIsCreateDialogOpen(false);

    toast({
      title: "Rule Created",
      description: "New auto-moderation rule has been created successfully"
    });
  };

  const deleteRule = async (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
    toast({
      title: "Rule Deleted",
      description: "Auto-moderation rule has been deleted"
    });
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'flag': return 'secondary';
      case 'hide': return 'outline';
      case 'delete': return 'destructive';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'keyword': return <Shield className="h-4 w-4" />;
      case 'pattern': return <Eye className="h-4 w-4" />;
      case 'sentiment': return <Bot className="h-4 w-4" />;
      case 'spam': return <Ban className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Auto-Moderation Tools</h2>
          <p className="text-muted-foreground">Configure AI-powered content moderation</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Moderation Rule</DialogTitle>
              <DialogDescription>
                Configure a new auto-moderation rule
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Rule Name</label>
                <Input
                  value={newRule.name || ''}
                  onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter rule name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={newRule.type || 'keyword'}
                  onChange={(e) => setNewRule(prev => ({ ...prev, type: e.target.value as any }))}
                >
                  <option value="keyword">Keyword</option>
                  <option value="pattern">Pattern</option>
                  <option value="sentiment">Sentiment</option>
                  <option value="spam">Spam</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Action</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={newRule.action || 'flag'}
                  onChange={(e) => setNewRule(prev => ({ ...prev, action: e.target.value as any }))}
                >
                  <option value="flag">Flag for Review</option>
                  <option value="hide">Hide Content</option>
                  <option value="delete">Delete Content</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Sensitivity: {newRule.sensitivity || 75}%</label>
                <Slider
                  value={[newRule.sensitivity || 75]}
                  onValueChange={(value) => setNewRule(prev => ({ ...prev, sensitivity: value[0] }))}
                  max={100}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Criteria</label>
                <Input
                  value={newRule.criteria || ''}
                  onChange={(e) => setNewRule(prev => ({ ...prev, criteria: e.target.value }))}
                  placeholder="Enter detection criteria"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newRule.description || ''}
                  onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this rule does"
                />
              </div>
              <Button onClick={createRule} className="w-full">
                Create Rule
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Statistics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalActions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Automated actions taken</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.flaggedContent}</div>
                <p className="text-xs text-muted-foreground">Items flagged for review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.accuracyRate}%</div>
                <p className="text-xs text-muted-foreground">AI accuracy rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">False Positives</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.falsePositives}</div>
                <p className="text-xs text-muted-foreground">Incorrectly flagged</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Rules Summary</CardTitle>
              <CardDescription>Currently enabled auto-moderation rules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {rules.filter(rule => rule.enabled).map(rule => (
                  <div key={rule.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(rule.type)}
                      <span className="font-medium">{rule.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getActionColor(rule.action)}>{rule.action}</Badge>
                      <span className="text-sm text-muted-foreground">{rule.sensitivity}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="space-y-4">
            {rules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(rule.type)}
                      <div>
                        <CardTitle className="text-lg">{rule.name}</CardTitle>
                        <CardDescription>{rule.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Badge variant={getActionColor(rule.action)}>{rule.action}</Badge>
                      <Badge variant="outline">{rule.type}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Criteria: {rule.criteria}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Sensitivity: {rule.sensitivity}%
                      </label>
                      <Slider
                        value={[rule.sensitivity]}
                        onValueChange={(value) => updateRuleSensitivity(rule.id, value[0])}
                        max={100}
                        min={1}
                        step={1}
                        className="mt-2"
                        disabled={!rule.enabled}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Moderation Settings</CardTitle>
              <CardDescription>Global settings for AI moderation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Global moderation settings will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};