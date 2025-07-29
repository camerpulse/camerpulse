import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/types/jobs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CompanyRegistrationData {
  company_name: string;
  company_type: string;
  sector: string;
  description?: string;
  physical_address: string;
  region: string;
  division: string;
  phone_number: string;
  email: string;
  website_url?: string;
  social_media_links?: Record<string, string>;
  employee_count_range: string;
  tax_identification_number: string;
}

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Get user's company
  const getUserCompany = async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user company:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching user company:', error);
      return null;
    }
  };

  // Register new company
  const registerCompany = async (data: CompanyRegistrationData) => {
    if (!user) {
      toast.error('You must be logged in to register a company');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      setLoading(true);
      
      const { data: company, error } = await supabase
        .from('companies')
        .insert({
          ...data,
          user_id: user.id,
          status: 'pending',
          payment_status: 'pending'
        } as any)
        .select()
        .single();

      if (error) {
        console.error('Error registering company:', error);
        toast.error('Failed to register company');
        return { success: false, error: error.message };
      }

      toast.success('Company registered successfully!');
      return { success: true, data: company };
    } catch (error) {
      console.error('Error registering company:', error);
      toast.error('Failed to register company');
      return { success: false, error: 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  // Update company
  const updateCompany = async (companyId: string, updates: Partial<CompanyRegistrationData>) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('companies')
        .update(updates as any)
        .eq('id', companyId)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating company:', error);
        toast.error('Failed to update company');
        return { success: false, error: error.message };
      }

      toast.success('Company updated successfully!');
      return { success: true, data };
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error('Failed to update company');
      return { success: false, error: 'Update failed' };
    } finally {
      setLoading(false);
    }
  };

  // Get company jobs
  const getCompanyJobs = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          job_categories (
            id,
            name,
            slug
          )
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching company jobs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching company jobs:', error);
      return [];
    }
  };

  // Get job applications for company
  const getJobApplications = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          jobs!inner (
            id,
            title,
            company_id
          ),
          profiles (
            id,
            username,
            display_name
          )
        `)
        .eq('jobs.company_id', companyId)
        .order('applied_at', { ascending: false });

      if (error) {
        console.error('Error fetching job applications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching job applications:', error);
      return [];
    }
  };

  return {
    companies,
    loading,
    getUserCompany,
    registerCompany,
    updateCompany,
    getCompanyJobs,
    getJobApplications
  };
};