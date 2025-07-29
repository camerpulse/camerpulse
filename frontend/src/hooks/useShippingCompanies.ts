import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ShippingCompany {
  id: string;
  company_name: string;
  company_code?: string;
  description?: string;
  regions?: string[];
  services?: string[];
  contact_email?: string;
  contact_phone?: string;
  years_in_business?: number;
  is_verified?: boolean;
  partnership_status?: string;
  logo_url?: string;
  created_at: string;
  avg_rating?: number;
  total_reviews?: number;
  // Map database fields to expected UI fields
  name?: string;
  code?: string;
  rating?: number;
  totalReviews?: number;
  contactEmail?: string;
  contactPhone?: string;
  yearsInBusiness?: number;
  isVerified?: boolean;
  partnershipStatus?: string;
  vehicleTypes?: string[];
}

export const useShippingCompanies = () => {
  const [companies, setCompanies] = useState<ShippingCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch companies from existing shipping_companies table
      const { data: companiesData, error: companiesError } = await supabase
        .from('shipping_companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (companiesError) {
        throw companiesError;
      }

      // Get ratings for each company and map fields for UI compatibility
      const companiesWithRatings = await Promise.all(
        (companiesData || []).map(async (company) => {
          const { data: ratingsData } = await supabase
            .rpc('calculate_company_ratings', { company_uuid: company.id });

          const avgRating = ratingsData && ratingsData[0]?.avg_overall_rating || 0;
          const totalReviews = ratingsData && ratingsData[0]?.total_reviews || 0;

          return {
            ...company,
            avg_rating: avgRating,
            total_reviews: totalReviews,
            // Add UI-compatible mappings using actual database fields
            name: company.company_name,
            code: `SHIP-${company.id.slice(0, 6)}`, // Generate since company_code doesn't exist
            rating: avgRating,
            totalReviews: totalReviews,
            contactEmail: company.email || '',
            contactPhone: company.phone || '',
            yearsInBusiness: new Date().getFullYear() - 2020, // Default
            isVerified: company.verification_status === 'verified',
            partnershipStatus: 'registered', // Default since field doesn't exist
            vehicleTypes: ['Trucks', 'Vans'], // Default since not in schema
          } as ShippingCompany;
        })
      );

      setCompanies(companiesWithRatings);
    } catch (err: any) {
      console.error('Error fetching companies:', err);
      setError('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return {
    companies,
    loading,
    error,
    refetch: fetchCompanies
  };
};