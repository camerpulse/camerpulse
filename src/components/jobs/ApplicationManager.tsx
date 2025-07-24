import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JobApplication } from '@/types/jobs';
import { 
  User, 
  Mail, 
  Phone, 
  FileText, 
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ApplicationManagerProps {
  applications: JobApplication[];
  onStatusUpdate?: () => void;
}

export const ApplicationManager: React.FC<ApplicationManagerProps> = ({ 
  applications, 
  onStatusUpdate 
}) => {
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<number | null>(null);

  const filteredApplications = applications.filter(app => 
    filterStatus === 'all' || app.status === filterStatus
  );

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ 
          status: newStatus,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast.success(`Application ${newStatus} successfully`);
      onStatusUpdate?.();
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application status');
    }
  };

  const addNotes = async (applicationId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ 
          notes: notes
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast.success('Notes saved successfully');
      setNotes('');
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes');
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: 'Pending Review', variant: 'secondary' as const, icon: Clock },
      reviewed: { label: 'Reviewed', variant: 'default' as const, icon: CheckCircle },
      interviewed: { label: 'Interviewed', variant: 'default' as const, icon: User },
      hired: { label: 'Hired', variant: 'default' as const, icon: CheckCircle },
      rejected: { label: 'Rejected', variant: 'destructive' as const, icon: XCircle }
    };

    const statusConfig = config[status as keyof typeof config] || config.pending;
    const Icon = statusConfig.icon;

    return (
      <Badge variant={statusConfig.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {statusConfig.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Application Manager</h2>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Applications</SelectItem>
            <SelectItem value="pending">Pending Review</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="interviewed">Interviewed</SelectItem>
            <SelectItem value="hired">Hired</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-semibold text-lg">
            Applications ({filteredApplications.length})
          </h3>
          
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No applications found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredApplications.map((app) => (
                <Card 
                  key={app.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedApp?.id === app.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedApp(app)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{app.applicant_name || 'Unknown Applicant'}</h4>
                        {getStatusBadge(app.status || 'pending')}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Applied: {new Date(app.applied_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {app.applicant_email}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Application Details */}
        <div className="lg:col-span-2">
          {selectedApp ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {selectedApp.applicant_name || 'Unknown Applicant'}
                </CardTitle>
                <CardDescription>
                  Applied {new Date(selectedApp.applied_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <Tabs defaultValue="details" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Contact Information</label>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{selectedApp.applicant_email}</span>
                          </div>
                          {selectedApp.applicant_phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{selectedApp.applicant_phone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Documents</label>
                        <div className="space-y-1">
                          {selectedApp.cv_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={selectedApp.cv_url} target="_blank" rel="noopener noreferrer">
                                <FileText className="h-4 w-4 mr-2" />
                                View Resume
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </Button>
                          )}
                          {selectedApp.portfolio_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={selectedApp.portfolio_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Portfolio
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedApp.cover_letter && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Cover Letter</label>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">{selectedApp.cover_letter}</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="actions" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Update Status</label>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateApplicationStatus(selectedApp.id, 'reviewed')}
                          >
                            Mark as Reviewed
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateApplicationStatus(selectedApp.id, 'interviewed')}
                          >
                            Schedule Interview
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateApplicationStatus(selectedApp.id, 'hired')}
                          >
                            Hire Candidate
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateApplicationStatus(selectedApp.id, 'rejected')}
                          >
                            Reject Application
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="notes" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Internal Notes</label>
                        <Textarea
                          placeholder="Add your notes about this candidate..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="min-h-[100px]"
                        />
                        <Button 
                          className="mt-2" 
                          onClick={() => addNotes(selectedApp.id, notes)}
                          disabled={!notes.trim()}
                        >
                          Save Notes
                        </Button>
                      </div>

                      {selectedApp.notes && (
                        <div>
                          <label className="text-sm font-medium mb-2 block">Existing Notes</label>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm whitespace-pre-wrap">{selectedApp.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select an Application</h3>
                <p className="text-muted-foreground">
                  Choose an application from the list to view details and manage it.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};