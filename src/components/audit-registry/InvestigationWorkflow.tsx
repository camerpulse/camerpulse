import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  User,
  Calendar,
  FileText
} from 'lucide-react';
import { useInvestigationRequests } from '@/hooks/useInvestigationRequests';
import { useToast } from '@/hooks/use-toast';

interface InvestigationWorkflowProps {
  auditId?: string;
  isAdmin?: boolean;
}

export const InvestigationWorkflow: React.FC<InvestigationWorkflowProps> = ({
  auditId,
  isAdmin = false
}) => {
  const { toast } = useToast();
  const { requests, isLoading, createRequest, updateRequestStatus, assignInvestigator } = useInvestigationRequests();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [formData, setFormData] = useState({
    audit_id: auditId || '',
    request_type: 'verification' as const,
    title: '',
    description: '',
    priority: 'medium' as const,
    estimated_duration_days: 30,
    budget_estimate: 0
  });

  const requestTypes = [
    { value: 'full_investigation', label: 'Full Investigation', icon: Search },
    { value: 'follow_up', label: 'Follow-up Investigation', icon: Eye },
    { value: 'verification', label: 'Fact Verification', icon: CheckCircle },
    { value: 'additional_evidence', label: 'Additional Evidence', icon: FileText }
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Medium Priority', color: 'bg-blue-100 text-blue-800' },
    { value: 'high', label: 'High Priority', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    under_review: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-gray-100 text-gray-800'
  };

  const handleCreateRequest = async () => {
    if (!formData.title || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const success = await createRequest({
      ...formData,
      status: 'pending',
      evidence_files: [],
      metadata: {}
    });

    if (success) {
      setShowCreateForm(false);
      setFormData({
        audit_id: auditId || '',
        request_type: 'verification',
        title: '',
        description: '',
        priority: 'medium',
        estimated_duration_days: 30,
        budget_estimate: 0
      });
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: string, notes?: string) => {
    await updateRequestStatus(requestId, newStatus as any, notes);
    setSelectedRequest(null);
  };

  const filteredRequests = auditId 
    ? requests.filter(req => req.audit_id === auditId)
    : requests;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Investigation Requests</h2>
        {!showCreateForm && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Request Investigation
          </Button>
        )}
      </div>

      {/* Create Request Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Submit Investigation Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Request Type</Label>
                <Select 
                  value={formData.request_type} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, request_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {requestTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Investigation Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief title describing what needs investigation"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of what should be investigated and why"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estimated Duration (Days)</Label>
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={formData.estimated_duration_days}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration_days: parseInt(e.target.value) }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Budget Estimate (FCFA)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.budget_estimate}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget_estimate: parseFloat(e.target.value) }))}
                  placeholder="Optional budget estimate"
                />
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Investigation requests are reviewed by our team before approval. 
                Provide as much detail as possible to help expedite the review process.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button onClick={handleCreateRequest}>
                Submit Request
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Investigation Requests List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading investigation requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">No Investigation Requests</h3>
              <p className="text-muted-foreground">
                {auditId ? "No investigations have been requested for this audit yet." : "No investigation requests found."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{request.title}</h3>
                        <p className="text-muted-foreground text-sm mb-2">
                          {request.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge className={statusColors[request.status as keyof typeof statusColors]}>
                        {request.status.replace('_', ' ')}
                      </Badge>
                      
                      <Badge className={priorities.find(p => p.value === request.priority)?.color}>
                        {request.priority} priority
                      </Badge>
                      
                      <Badge variant="outline">
                        {requestTypes.find(t => t.value === request.request_type)?.label}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(request.created_at).toLocaleDateString()}
                      </div>
                      
                      {request.estimated_duration_days && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {request.estimated_duration_days} days estimated
                        </div>
                      )}
                      
                      {request.assigned_to && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          Assigned
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:w-48">
                    <Button size="sm" variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    
                    {isAdmin && request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleStatusUpdate(request.id, 'approved')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="flex-1"
                          onClick={() => handleStatusUpdate(request.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};