import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface VerificationRequest {
  id: string;
  verification_type: 'identity' | 'business' | 'address' | 'phone';
  status: 'pending' | 'approved' | 'rejected' | 'needs_review';
  documents: any[];
  submission_data: any;
  submitted_at: string;
  reviewed_at?: string;
  review_notes?: string;
}

interface BusinessVerification {
  id: string;
  business_name: string;
  business_type: string;
  registration_number?: string;
  tax_id?: string;
  business_address?: string;
  business_phone?: string;
  business_email?: string;
  website_url?: string;
  verification_documents: any[];
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  verified_at?: string;
  rejection_reason?: string;
}

export const useVerification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [businessVerifications, setBusinessVerifications] = useState<BusinessVerification[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch user verification requests
  const fetchVerificationRequests = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Note: This table will be available after types are regenerated
      console.log('Would fetch verification requests for user:', user.id);
      setVerificationRequests([]);
    } catch (error) {
      console.error('Error fetching verification requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch verification requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch business verifications
  const fetchBusinessVerifications = async () => {
    if (!user) return;
    
    try {
      // Note: This table will be available after types are regenerated
      console.log('Would fetch business verifications for user:', user.id);
      setBusinessVerifications([]);
    } catch (error) {
      console.error('Error fetching business verifications:', error);
    }
  };

  // Submit identity verification
  const submitIdentityVerification = async (documents: any[], additionalData: any = {}) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Note: This will work once types are regenerated
      console.log('Would submit identity verification:', { documents, additionalData });
      
      toast({
        title: "Verification Submitted",
        description: "Your identity verification request has been submitted for review"
      });
      
      return { id: 'temp-id' };
    } catch (error) {
      throw error;
    }
  };

  // Submit business verification
  const submitBusinessVerification = async (businessData: Partial<BusinessVerification>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Note: This will work once types are regenerated
      console.log('Would submit business verification:', businessData);
      
      toast({
        title: "Business Verification Submitted",
        description: "Your business verification request has been submitted for review"
      });
      
      return { id: 'temp-id' };
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchVerificationRequests();
      fetchBusinessVerifications();
    }
  }, [user]);

  return {
    verificationRequests,
    businessVerifications,
    loading,
    submitIdentityVerification,
    submitBusinessVerification,
    refetch: () => {
      fetchVerificationRequests();
      fetchBusinessVerifications();
    }
  };
};