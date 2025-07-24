import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Settings,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Shield,
  Clock,
  BarChart3,
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface ScoreAdjustment {
  id: string;
  entityType: string;
  entityId: string;
  entityName: string;
  oldScore: number;
  newScore: number;
  reason: string;
  adjustedBy: string;
  adjustedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface FlaggedIssue {
  id: string;
  entityType: string;
  entityId: string;
  entityName: string;
  flagType: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'investigating' | 'resolved' | 'dismissed';
  flaggedBy: string;
  flaggedAt: string;
}

interface SystemConfig {
  automaticScoring: boolean;
  scoreRecalculationInterval: number;
  minimumDataPoints: number;
  transparencyThreshold: number;
  flaggedScoreThreshold: number;
  enableRealTimeUpdates: boolean;
  requireApprovalForManualChanges: boolean;
}

export function AdminReputationPanel() {
  const [loading, setLoading] = useState(false);
  const [scoreAdjustments, setScoreAdjustments] = useState<ScoreAdjustment[]>([]);
  const [flaggedIssues, setFlaggedIssues] = useState<FlaggedIssue[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    automaticScoring: true,
    scoreRecalculationInterval: 24,
    minimumDataPoints: 5,
    transparencyThreshold: 70,
    flaggedScoreThreshold: 30,
    enableRealTimeUpdates: true,
    requireApprovalForManualChanges: true
  });
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentForm, setAdjustmentForm] = useState({
    entityType: '',
    entityId: '',
    entityName: '',
    currentScore: 0,
    newScore: 0,
    reason: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Mock data - replace with actual API calls
    const mockAdjustments: ScoreAdjustment[] = [
      {
        id: '1',
        entityType: 'politician',
        entityId: 'pol-1',
        entityName: 'Hon. John Tamfu',
        oldScore: 75,
        newScore: 82,
        reason: 'Manual adjustment for recent healthcare initiative',
        adjustedBy: 'Admin User',
        adjustedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        status: 'approved'
      },
      {
        id: '2',
        entityType: 'ministry',
        entityId: 'min-1',
        entityName: 'Ministry of Health',
        oldScore: 68,
        newScore: 65,
        reason: 'Correction for data quality issues',
        adjustedBy: 'System Admin',
        adjustedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        status: 'pending'
      }
    ];

    const mockFlags: FlaggedIssue[] = [
      {
        id: '1',
        entityType: 'politician',
        entityId: 'pol-2',
        entityName: 'MP Victoria Besong',
        flagType: 'data_quality',
        reason: 'Inconsistent score calculation',
        severity: 'medium',
        status: 'investigating',
        flaggedBy: 'Citizen User',
        flaggedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
      },
      {
        id: '2',
        entityType: 'village',
        entityId: 'vil-1',
        entityName: 'Kumbo',
        flagType: 'manipulation',
        reason: 'Suspected vote manipulation',
        severity: 'high',
        status: 'active',
        flaggedBy: 'Anonymous',
        flaggedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
      }
    ];

    setScoreAdjustments(mockAdjustments);
    setFlaggedIssues(mockFlags);
    setLoading(false);
  };

  const handleManualAdjustment = async () => {
    if (!adjustmentForm.entityName || !adjustmentForm.reason || adjustmentForm.newScore < 0 || adjustmentForm.newScore > 100) {
      toast({
        title: "Invalid Input",
        description: "Please fill all fields and ensure score is between 0-100",
        variant: "destructive"
      });
      return;
    }

    const newAdjustment: ScoreAdjustment = {
      id: Date.now().toString(),
      entityType: adjustmentForm.entityType,
      entityId: adjustmentForm.entityId || 'manual-' + Date.now(),
      entityName: adjustmentForm.entityName,
      oldScore: adjustmentForm.currentScore,
      newScore: adjustmentForm.newScore,
      reason: adjustmentForm.reason,
      adjustedBy: 'Current Admin',
      adjustedAt: new Date().toISOString(),
      status: systemConfig.requireApprovalForManualChanges ? 'pending' : 'approved'
    };

    setScoreAdjustments(prev => [newAdjustment, ...prev]);
    setShowAdjustmentModal(false);
    setAdjustmentForm({
      entityType: '',
      entityId: '',
      entityName: '',
      currentScore: 0,
      newScore: 0,
      reason: ''
    });

    toast({
      title: "Score Adjustment Submitted",
      description: systemConfig.requireApprovalForManualChanges 
        ? "Adjustment pending approval" 
        : "Score updated successfully",
    });
  };

  const handleFlagAction = async (flagId: string, action: 'resolve' | 'dismiss' | 'investigate') => {
    setFlaggedIssues(prev => 
      prev.map(flag => 
        flag.id === flagId 
          ? { ...flag, status: action === 'resolve' ? 'resolved' : action === 'dismiss' ? 'dismissed' : 'investigating' }
          : flag
      )
    );

    toast({
      title: "Flag Updated",
      description: `Flag has been ${action}d successfully`,
    });
  };

  const handleConfigUpdate = async () => {
    toast({
      title: "Configuration Updated",
      description: "System configuration has been saved successfully",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-destructive border-destructive';
      case 'high': return 'text-orange-600 border-orange-600';
      case 'medium': return 'text-warning border-warning';
      case 'low': return 'text-muted-foreground border-muted-foreground';
      default: return 'text-muted-foreground border-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': case 'resolved': return 'text-success border-success';
      case 'pending': case 'investigating': return 'text-warning border-warning';
      case 'rejected': case 'dismissed': return 'text-muted-foreground border-muted-foreground';
      case 'active': return 'text-destructive border-destructive';
      default: return 'text-muted-foreground border-muted-foreground';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Reputation Admin Panel</h1>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showAdjustmentModal} onOpenChange={setShowAdjustmentModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Manual Adjustment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Manual Score Adjustment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="entityType">Entity Type</Label>
                  <Select 
                    value={adjustmentForm.entityType} 
                    onValueChange={(value) => setAdjustmentForm(prev => ({ ...prev, entityType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select entity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="politician">Politician</SelectItem>
                      <SelectItem value="ministry">Ministry</SelectItem>
                      <SelectItem value="village">Village</SelectItem>
                      <SelectItem value="citizen">Citizen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="entityName">Entity Name</Label>
                  <Input
                    id="entityName"
                    value={adjustmentForm.entityName}
                    onChange={(e) => setAdjustmentForm(prev => ({ ...prev, entityName: e.target.value }))}
                    placeholder="Enter entity name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentScore">Current Score</Label>
                    <Input
                      id="currentScore"
                      type="number"
                      min="0"
                      max="100"
                      value={adjustmentForm.currentScore}
                      onChange={(e) => setAdjustmentForm(prev => ({ ...prev, currentScore: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newScore">New Score</Label>
                    <Input
                      id="newScore"
                      type="number"
                      min="0"
                      max="100"
                      value={adjustmentForm.newScore}
                      onChange={(e) => setAdjustmentForm(prev => ({ ...prev, newScore: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="reason">Reason for Adjustment</Label>
                  <Textarea
                    id="reason"
                    value={adjustmentForm.reason}
                    onChange={(e) => setAdjustmentForm(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Explain why this adjustment is necessary..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAdjustmentModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleManualAdjustment}>
                    <Save className="h-4 w-4 mr-2" />
                    Submit
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="adjustments" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="adjustments">Score Adjustments</TabsTrigger>
          <TabsTrigger value="flags">Flagged Issues</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="adjustments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Recent Score Adjustments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scoreAdjustments.map((adjustment) => (
                  <div key={adjustment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{adjustment.entityName}</h4>
                        <Badge variant="outline">{adjustment.entityType}</Badge>
                        <Badge variant="outline" className={getStatusColor(adjustment.status)}>
                          {adjustment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{adjustment.reason}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>By: {adjustment.adjustedBy}</span>
                        <span>At: {new Date(adjustment.adjustedAt).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{adjustment.oldScore}</span>
                          <span>→</span>
                          <span className="font-semibold text-primary">{adjustment.newScore}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {adjustment.newScore > adjustment.oldScore ? '+' : ''}
                          {adjustment.newScore - adjustment.oldScore}
                        </div>
                      </div>
                      
                      {adjustment.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flags" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Flagged Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flaggedIssues.map((flag) => (
                  <div key={flag.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{flag.entityName}</h4>
                        <Badge variant="outline">{flag.entityType}</Badge>
                        <Badge variant="outline" className={getSeverityColor(flag.severity)}>
                          {flag.severity}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(flag.status)}>
                          {flag.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>{flag.flagType}:</strong> {flag.reason}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>By: {flag.flaggedBy}</span>
                        <span>At: {new Date(flag.flaggedAt).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    {flag.status === 'active' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleFlagAction(flag.id, 'investigate')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Investigate
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleFlagAction(flag.id, 'resolve')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleFlagAction(flag.id, 'dismiss')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Score Adjustments */}
                {scoreAdjustments.map((adjustment) => (
                  <div key={`adj-${adjustment.id}`} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-muted rounded-lg">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">Score adjusted: {adjustment.oldScore} → {adjustment.newScore}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm">{adjustment.entityName}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{adjustment.reason}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <span>By: {adjustment.adjustedBy}</span>
                        <span>At: {new Date(adjustment.adjustedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Flagged Issues */}
                {flaggedIssues.map((flag) => (
                  <div key={`flag-${flag.id}`} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-muted rounded-lg">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">Flag {flag.status}: {flag.flagType}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm">{flag.entityName}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{flag.reason}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <span>By: {flag.flaggedBy}</span>
                        <span>At: {new Date(flag.flaggedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Scoring Settings</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Automatic Scoring</Label>
                      <p className="text-sm text-muted-foreground">Enable automatic score calculation</p>
                    </div>
                    <Switch 
                      checked={systemConfig.automaticScoring}
                      onCheckedChange={(checked) => setSystemConfig(prev => ({ ...prev, automaticScoring: checked }))}
                    />
                  </div>

                  <div>
                    <Label>Recalculation Interval (hours)</Label>
                    <Input
                      type="number"
                      value={systemConfig.scoreRecalculationInterval}
                      onChange={(e) => setSystemConfig(prev => ({ ...prev, scoreRecalculationInterval: parseInt(e.target.value) || 24 }))}
                    />
                  </div>

                  <div>
                    <Label>Minimum Data Points</Label>
                    <Input
                      type="number"
                      value={systemConfig.minimumDataPoints}
                      onChange={(e) => setSystemConfig(prev => ({ ...prev, minimumDataPoints: parseInt(e.target.value) || 5 }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Threshold Settings</h4>
                  
                  <div>
                    <Label>Transparency Threshold</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={systemConfig.transparencyThreshold}
                      onChange={(e) => setSystemConfig(prev => ({ ...prev, transparencyThreshold: parseInt(e.target.value) || 70 }))}
                    />
                  </div>

                  <div>
                    <Label>Flagged Score Threshold</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={systemConfig.flaggedScoreThreshold}
                      onChange={(e) => setSystemConfig(prev => ({ ...prev, flaggedScoreThreshold: parseInt(e.target.value) || 30 }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Real-time Updates</Label>
                      <p className="text-sm text-muted-foreground">Enable live score updates</p>
                    </div>
                    <Switch 
                      checked={systemConfig.enableRealTimeUpdates}
                      onCheckedChange={(checked) => setSystemConfig(prev => ({ ...prev, enableRealTimeUpdates: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Approval</Label>
                      <p className="text-sm text-muted-foreground">Manual changes need approval</p>
                    </div>
                    <Switch 
                      checked={systemConfig.requireApprovalForManualChanges}
                      onCheckedChange={(checked) => setSystemConfig(prev => ({ ...prev, requireApprovalForManualChanges: checked }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t">
                <Button onClick={handleConfigUpdate}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}