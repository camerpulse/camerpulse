import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InvestigationRequest {
  id: string;
  audit_id: string;
  request_type: 'full_investigation' | 'follow_up' | 'verification' | 'additional_evidence';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  assigned_to?: string;
  evidence_files: string[];
  investigation_notes?: string;
  findings?: string;
  recommendations?: string;
  estimated_duration_days?: number;
  actual_duration_days?: number;
  budget_estimate?: number;
  budget_approved?: number;
  approval_notes?: string;
  rejection_reason?: string;
  completed_at?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  metadata: any;
}

export const useInvestigationRequests = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<InvestigationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch investigation requests
  const fetchRequests = async (auditId?: string) => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('audit_investigation_requests')
        .select(`
          *,
          audit_registry!inner(document_title, entity_audited)
        `)
        .order('created_at', { ascending: false });

      if (auditId) {
        query = query.eq('audit_id', auditId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching investigation requests:', error);
      toast({
        title: "Error",
        description: "Failed to load investigation requests.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create investigation request
  const createRequest = async (requestData: Omit<InvestigationRequest, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('audit_investigation_requests')
        .insert({
          ...requestData,
          requester_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "Your investigation request has been submitted for review."
      });

      await fetchRequests();
      return true;
    } catch (error) {
      console.error('Error creating investigation request:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit investigation request. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Update investigation request status (admin/investigator only)
  const updateRequestStatus = async (
    requestId: string, 
    status: InvestigationRequest['status'],
    notes?: string
  ): Promise<boolean> => {
    try {
      const updateData: any = { status, updated_at: new Date().toISOString() };
      
      if (status === 'approved' && notes) {
        updateData.approval_notes = notes;
      } else if (status === 'rejected' && notes) {
        updateData.rejection_reason = notes;
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('audit_investigation_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Investigation request has been ${status}.`
      });

      await fetchRequests();
      return true;
    } catch (error) {
      console.error('Error updating request status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update request status.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Assign investigator
  const assignInvestigator = async (requestId: string, investigatorId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('audit_investigation_requests')
        .update({
          assigned_to: investigatorId,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Investigator Assigned",
        description: "Investigation has been assigned to an investigator."
      });

      await fetchRequests();
      return true;
    } catch (error) {
      console.error('Error assigning investigator:', error);
      toast({
        title: "Assignment Failed",
        description: "Failed to assign investigator.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Add investigation findings
  const addFindings = async (
    requestId: string, 
    findings: string, 
    recommendations?: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('audit_investigation_requests')
        .update({
          findings,
          recommendations,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Findings Added",
        description: "Investigation findings have been recorded."
      });

      await fetchRequests();
      return true;
    } catch (error) {
      console.error('Error adding findings:', error);
      toast({
        title: "Update Failed",
        description: "Failed to add findings.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Get investigation statistics
  const getInvestigationStats = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_investigation_statistics');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching investigation stats:', error);
      return null;
    }
  };

  // Setup real-time subscriptions
  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel('investigation_requests_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'audit_investigation_requests' },
        () => fetchRequests()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    requests,
    isLoading,
    createRequest,
    updateRequestStatus,
    assignInvestigator,
    addFindings,
    getInvestigationStats,
    refetchRequests: fetchRequests
  };
};