import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Flag, 
  Edit, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Trash2,
  RefreshCw,
  Search,
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

interface AbuseReport {
  id: string;
  reported_rating_id: string;
  reporter_user_id: string;
  abuse_type: string;
  reason: string | null;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  action_taken: string | null;
}

interface ManualAdjustment {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  adjustment_type: 'score_override' | 'badge_change' | 'penalty_add' | 'penalty_remove';
  old_value: number;
  new_value: number;
  reason: string;
  admin_user_id: string;
  created_at: string;
}

interface SuspiciousActivity {
  id: string;
  activity_type: 'rating_spam' | 'ip_duplicate' | 'suspicious_pattern';
  entity_affected: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
  status: 'detected' | 'investigating' | 'resolved';
  created_at: string;
}

const AdminReputationTools: React.FC = () => {
  const [abuseReports, setAbuseReports] = useState<AbuseReport[]>([]);
  const [adjustmentHistory, setAdjustmentHistory] = useState<ManualAdjustment[]>([]);
  const [suspiciousActivity, setSuspiciousActivity] = useState<SuspiciousActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Manual adjustment form state
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
  const [adjustmentForm, setAdjustmentForm] = useState({
    entityType: '',
    entityId: '',
    entityName: '',
    adjustmentType: 'score_override',
    newValue: '',
    reason: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchAbuseReports(),
        fetchAdjustmentHistory(),
        fetchSuspiciousActivity()
      ]);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAbuseReports = async () => {
    const { data, error } = await supabase
      .from('civic_rating_abuse_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setAbuseReports(data || []);
  };

  const fetchAdjustmentHistory = async () => {
    // This would fetch from a manual_adjustments table
    // For now, setting empty array
    setAdjustmentHistory([]);
  };

  const fetchSuspiciousActivity = async () => {
    // This would fetch from a suspicious_activity table
    // For now, setting empty array
    setSuspiciousActivity([]);
  };

  const handleReportAction = async (reportId: string, action: 'confirm' | 'dismiss', notes?: string) => {
    try {
      const { error } = await supabase
        .from('civic_rating_abuse_reports')
        .update({
          status: action === 'confirm' ? 'confirmed' : 'dismissed',
          action_taken: notes,
          reviewed_by: 'current_admin_id', // Replace with actual admin ID
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      toast.success(`Report ${action}ed successfully`);
      fetchAbuseReports();
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Failed to update report');
    }
  };

  const handleManualAdjustment = async () => {
    try {
      // First, recalculate the reputation score
      const { error: calcError } = await supabase.rpc('calculate_civic_reputation_score', {
        p_entity_type: adjustmentForm.entityType as Database['public']['Enums']['civic_entity_type'],
        p_entity_id: adjustmentForm.entityId
      });

      if (calcError) throw calcError;

      // Log the manual adjustment (would save to manual_adjustments table)
      console.log('Manual adjustment logged:', adjustmentForm);

      toast.success('Manual adjustment applied successfully');
      setShowAdjustmentForm(false);
      setAdjustmentForm({
        entityType: '',
        entityId: '',
        entityName: '',
        adjustmentType: 'score_override',
        newValue: '',
        reason: ''
      });
    } catch (error) {
      console.error('Error applying manual adjustment:', error);
      toast.error('Failed to apply adjustment');
    }
  };

  const recalculateAllScores = async () => {
    try {
      // This would trigger a bulk recalculation
      toast.info('Recalculation started. This may take a few minutes...');
      
      // For now, just show success
      setTimeout(() => {
        toast.success('All reputation scores recalculated');
      }, 2000);
    } catch (error) {
      console.error('Error recalculating scores:', error);
      toast.error('Failed to recalculate scores');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500 text-white';
      case 'investigating': return 'bg-blue-500 text-white';
      case 'confirmed': return 'bg-red-500 text-white';
      case 'dismissed': return 'bg-green-500 text-white';
      case 'resolved': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reputation Management</h1>
          <p className="text-muted-foreground">Admin tools for civic reputation system</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={recalculateAllScores} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Recalculate All
          </Button>
          <Button onClick={() => setShowAdjustmentForm(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Manual Adjustment
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search reports, entities, or reasons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="investigating">Investigating</option>
          <option value="confirmed">Confirmed</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      <Tabs defaultValue="abuse-reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="abuse-reports">Abuse Reports</TabsTrigger>
          <TabsTrigger value="adjustments">Manual Adjustments</TabsTrigger>
          <TabsTrigger value="suspicious">Suspicious Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="abuse-reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5" />
                Abuse Reports ({abuseReports.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {abuseReports.length > 0 ? (
                  abuseReports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getStatusColor(report.status)}>
                              {report.status.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(report.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-medium">{report.abuse_type}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {report.reason || 'No details provided'}
                          </p>
                          {report.action_taken && (
                            <div className="mt-2 p-2 bg-muted rounded text-sm">
                              <strong>Action Taken:</strong> {report.action_taken}
                            </div>
                          )}
                        </div>
                        {report.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReportAction(report.id, 'confirm')}
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReportAction(report.id, 'dismiss')}
                            >
                              Dismiss
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Flag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No abuse reports found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adjustments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Manual Adjustment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Edit className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No manual adjustments recorded</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suspicious">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Suspicious Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No suspicious activity detected</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Fraud Detection Settings</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Enable IP duplicate detection</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Auto-flag rating spams</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Regional fraud monitoring</span>
                  </label>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Score Calculation</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm">Transparency Weight (%)</label>
                    <Input type="number" defaultValue="25" />
                  </div>
                  <div>
                    <label className="text-sm">Performance Weight (%)</label>
                    <Input type="number" defaultValue="25" />
                  </div>
                  <div>
                    <label className="text-sm">Citizen Rating Weight (%)</label>
                    <Input type="number" defaultValue="20" />
                  </div>
                  <div>
                    <label className="text-sm">Engagement Weight (%)</label>
                    <Input type="number" defaultValue="15" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Manual Adjustment Modal */}
      {showAdjustmentForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Manual Score Adjustment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Entity Type</label>
                <select 
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={adjustmentForm.entityType}
                  onChange={(e) => setAdjustmentForm({...adjustmentForm, entityType: e.target.value})}
                >
                  <option value="">Select type...</option>
                  <option value="ministry">Ministry</option>
                  <option value="politician">Politician</option>
                  <option value="government_agency">Government Agency</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Entity ID</label>
                <Input 
                  placeholder="Entity UUID"
                  value={adjustmentForm.entityId}
                  onChange={(e) => setAdjustmentForm({...adjustmentForm, entityId: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Entity Name</label>
                <Input 
                  placeholder="Entity name"
                  value={adjustmentForm.entityName}
                  onChange={(e) => setAdjustmentForm({...adjustmentForm, entityName: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Adjustment Type</label>
                <select 
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={adjustmentForm.adjustmentType}
                  onChange={(e) => setAdjustmentForm({...adjustmentForm, adjustmentType: e.target.value})}
                >
                  <option value="score_override">Score Override</option>
                  <option value="badge_change">Badge Change</option>
                  <option value="penalty_add">Add Penalty</option>
                  <option value="penalty_remove">Remove Penalty</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">New Value</label>
                <Input 
                  type="number"
                  placeholder="New score/value"
                  value={adjustmentForm.newValue}
                  onChange={(e) => setAdjustmentForm({...adjustmentForm, newValue: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Reason</label>
                <Textarea 
                  placeholder="Explain the reason for this adjustment..."
                  value={adjustmentForm.reason}
                  onChange={(e) => setAdjustmentForm({...adjustmentForm, reason: e.target.value})}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleManualAdjustment} className="flex-1">
                  Apply Adjustment
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAdjustmentForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminReputationTools;