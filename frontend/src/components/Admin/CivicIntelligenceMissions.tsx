import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Target, 
  Play, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  FileText, 
  TrendingUp,
  Shield,
  Users,
  MapPin,
  BarChart3,
  Brain,
  Sparkles,
  Settings,
  Lightbulb
} from 'lucide-react';

interface Mission {
  id: string;
  mission_title: string;
  mission_objective: string;
  mission_prompt: string;
  target_entities: string[];
  data_sources: string[];
  regions: string[];
  priority_level: string;
  mission_type: string;
  status: string;
  output_type: string;
  is_public: boolean;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  execution_duration_seconds?: number;
}

interface Finding {
  id: string;
  finding_type: string;
  finding_title: string;
  finding_description: string;
  severity_level: string;
  confidence_score: number;
  created_at: string;
}

interface Alert {
  id: string;
  alert_type: string;
  alert_title: string;
  alert_description: string;
  severity: string;
  confidence_level: number;
  is_acknowledged: boolean;
  created_at: string;
}

const CivicIntelligenceMissions: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const { toast } = useToast();

  // New Mission Form State
  const [newMission, setNewMission] = useState({
    title: '',
    objective: '',
    prompt: '',
    priority: 'medium',
    type: 'investigation',
    output: 'dashboard',
    isPublic: false,
    regions: [] as string[],
    entities: [] as string[],
    dataSources: [] as string[]
  });

  useEffect(() => {
    loadMissions();
    loadAlerts();
  }, []);

  const loadMissions = async () => {
    try {
      const { data, error } = await supabase
        .from('civic_intelligence_missions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMissions(data || []);
    } catch (error) {
      console.error('Error loading missions:', error);
      toast({
        title: "Error",
        description: "Failed to load civic intelligence missions",
        variant: "destructive"
      });
    }
  };

  const loadFindings = async (missionId: string) => {
    try {
      const { data, error } = await supabase
        .from('civic_mission_findings')
        .select('*')
        .eq('mission_id', missionId)
        .order('severity_level', { ascending: false });

      if (error) throw error;
      setFindings(data || []);
    } catch (error) {
      console.error('Error loading findings:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('civic_mission_alerts')
        .select('*')
        .eq('is_acknowledged', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const createMission = async () => {
    if (!newMission.title || !newMission.objective || !newMission.prompt) {
      toast({
        title: "Validation Error",
        description: "Please fill in title, objective, and mission prompt",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('civic-intelligence-missions', {
        body: {
          action: 'create',
          mission_data: {
            title: newMission.title,
            objective: newMission.objective,
            prompt: newMission.prompt,
            target_entities: newMission.entities,
            data_sources: newMission.dataSources,
            regions: newMission.regions,
            priority_level: newMission.priority,
            mission_type: newMission.type,
            output_type: newMission.output,
            is_public: newMission.isPublic
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Mission Created",
        description: `Civic intelligence mission "${newMission.title}" has been created successfully`
      });

      // Reset form
      setNewMission({
        title: '',
        objective: '',
        prompt: '',
        priority: 'medium',
        type: 'investigation',
        output: 'dashboard',
        isPublic: false,
        regions: [],
        entities: [],
        dataSources: []
      });

      loadMissions();
    } catch (error) {
      console.error('Error creating mission:', error);
      toast({
        title: "Error",
        description: "Failed to create civic intelligence mission",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const executeMission = async (missionId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('civic-intelligence-missions', {
        body: {
          action: 'execute',
          mission_id: missionId
        }
      });

      if (error) throw error;

      toast({
        title: "Mission Executing",
        description: `Ashen is now analyzing civic data for this mission. Found ${data.findings_count} insights.`
      });

      loadMissions();
      if (selectedMission?.id === missionId) {
        loadFindings(missionId);
      }
      loadAlerts();
    } catch (error) {
      console.error('Error executing mission:', error);
      toast({
        title: "Error",
        description: "Failed to execute civic intelligence mission",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectMission = (mission: Mission) => {
    setSelectedMission(mission);
    loadFindings(mission.id);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'running': return <TrendingUp className="h-4 w-4 animate-pulse" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const predefinedPrompts = [
    "Investigate fake promises by political parties in Northwest and Southwest regions",
    "Analyze budget use patterns in MINEPAT for 2023-2024",
    "Identify politicians with low ratings and poor sentiment correlation",
    "Track youth engagement in voter registration by region",
    "Detect corruption patterns in government contract allocations",
    "Monitor election integrity and voting anomalies",
    "Analyze regional development project delivery vs budget allocation"
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Civic Intelligence Missions</h1>
        <Sparkles className="h-5 w-5 text-amber-500" />
      </div>

      <Tabs defaultValue="create" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create">New Mission</TabsTrigger>
          <TabsTrigger value="missions">Active Missions</TabsTrigger>
          <TabsTrigger value="findings">Findings</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Create Civic Intelligence Mission
              </CardTitle>
              <CardDescription>
                Define a civic investigation for Ashen to execute autonomously
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Mission Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Budget Audit for Southwest Region"
                    value={newMission.title}
                    onChange={(e) => setNewMission({...newMission, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Mission Type</Label>
                  <Select value={newMission.type} onValueChange={(value) => setNewMission({...newMission, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="investigation">Investigation</SelectItem>
                      <SelectItem value="analysis">Analysis</SelectItem>
                      <SelectItem value="monitoring">Monitoring</SelectItem>
                      <SelectItem value="audit">Audit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="objective">Mission Objective</Label>
                <Input
                  id="objective"
                  placeholder="What should this mission accomplish?"
                  value={newMission.objective}
                  onChange={(e) => setNewMission({...newMission, objective: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">Mission Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe what you want Ashen to investigate in natural language..."
                  value={newMission.prompt}
                  onChange={(e) => setNewMission({...newMission, prompt: e.target.value})}
                  rows={4}
                />
                <div className="text-sm text-muted-foreground">
                  <strong>Example prompts:</strong>
                  <div className="mt-2 space-y-1">
                    {predefinedPrompts.slice(0, 3).map((prompt, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setNewMission({...newMission, prompt})}
                          className="text-xs h-auto p-1"
                        >
                          <Lightbulb className="h-3 w-3 mr-1" />
                          Use
                        </Button>
                        <span className="text-xs">{prompt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newMission.priority} onValueChange={(value) => setNewMission({...newMission, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="output">Output Type</Label>
                  <Select value={newMission.output} onValueChange={(value) => setNewMission({...newMission, output: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                      <SelectItem value="report">Report</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                      <SelectItem value="summary">Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="public"
                    checked={newMission.isPublic}
                    onChange={(e) => setNewMission({...newMission, isPublic: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="public" className="text-sm">Make Public</Label>
                </div>
              </div>

              <Button onClick={createMission} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2 animate-spin" />
                    Creating Mission...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Create Mission
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="missions" className="space-y-4">
          <div className="grid gap-4">
            {missions.map((mission) => (
              <Card key={mission.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => selectMission(mission)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{mission.mission_title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={mission.status === 'completed' ? 'default' : mission.status === 'running' ? 'secondary' : 'outline'}>
                        {getStatusIcon(mission.status)}
                        <span className="ml-1">{mission.status}</span>
                      </Badge>
                      <Badge variant="outline">{mission.priority_level}</Badge>
                    </div>
                  </div>
                  <CardDescription>{mission.mission_objective}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{mission.mission_type}</span>
                      <span>•</span>
                      <span>{mission.regions?.length || 0} regions</span>
                      <span>•</span>
                      <span>{new Date(mission.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2">
                      {mission.status === 'pending' && (
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); executeMission(mission.id); }}>
                          <Play className="h-4 w-4 mr-1" />
                          Execute
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="findings" className="space-y-4">
          {selectedMission ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Findings for: {selectedMission.mission_title}</CardTitle>
                  <CardDescription>
                    Autonomous intelligence findings from civic data analysis
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {findings.map((finding) => (
                    <Card key={finding.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getSeverityColor(finding.severity_level)}`} />
                              <h4 className="font-semibold">{finding.finding_title}</h4>
                              <Badge variant="outline">{finding.finding_type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{finding.finding_description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Confidence: {Math.round(finding.confidence_score * 100)}%</span>
                              <span>•</span>
                              <span>{new Date(finding.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Select a mission to view its findings</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Active Civic Alerts
              </CardTitle>
              <CardDescription>
                High-priority findings requiring immediate attention
              </CardDescription>
            </CardHeader>
          </Card>
          
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`h-4 w-4 ${alert.severity === 'critical' ? 'text-red-500' : 'text-orange-500'}`} />
                        <h4 className="font-semibold">{alert.alert_title}</h4>
                        <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.alert_description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Confidence: {Math.round(alert.confidence_level * 100)}%</span>
                        <span>•</span>
                        <span>{new Date(alert.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Acknowledge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {alerts.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="text-muted-foreground">No active alerts. All systems monitoring normally.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CivicIntelligenceMissions;