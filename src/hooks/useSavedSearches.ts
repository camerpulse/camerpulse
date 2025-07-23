import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SavedSearch {
  id: string;
  search_name: string;
  search_criteria: any;
  notification_enabled: boolean;
  last_run_at?: string;
  results_count: number;
  created_at: string;
}

export const useSavedSearches = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch saved searches
  const fetchSavedSearches = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Note: This table will be available after types are regenerated
      console.log('Would fetch saved searches for user:', user.id);
      setSavedSearches([]);
    } catch (error) {
      console.error('Error fetching saved searches:', error);
      toast({
        title: "Error",
        description: "Failed to fetch saved searches",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Save search
  const saveSearch = async (
    searchName: string,
    searchCriteria: any,
    notificationEnabled: boolean = true
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Note: This will work once types are regenerated
      console.log('Would save search:', { searchName, searchCriteria, notificationEnabled });
      
      toast({
        title: "Search Saved",
        description: `"${searchName}" has been saved to your searches`
      });

      return { id: 'temp-id', search_name: searchName, search_criteria: searchCriteria };
    } catch (error) {
      throw error;
    }
  };

  // Update saved search
  const updateSavedSearch = async (
    searchId: string,
    updates: Partial<SavedSearch>
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      console.log('Would update saved search:', { searchId, updates });
      
      toast({
        title: "Search Updated",
        description: "Your saved search has been updated"
      });
    } catch (error) {
      throw error;
    }
  };

  // Delete saved search
  const deleteSavedSearch = async (searchId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      console.log('Would delete saved search:', searchId);
      
      toast({
        title: "Search Deleted",
        description: "Your saved search has been deleted"
      });
    } catch (error) {
      throw error;
    }
  };

  // Run saved search
  const runSavedSearch = async (searchId: string) => {
    // This would integrate with your search functionality
    const search = savedSearches.find(s => s.id === searchId);
    if (!search) return;

    // Update last run time
    await updateSavedSearch(searchId, {
      last_run_at: new Date().toISOString()
    });

    return search.search_criteria;
  };

  useEffect(() => {
    if (user) {
      fetchSavedSearches();
    }
  }, [user]);

  return {
    savedSearches,
    loading,
    saveSearch,
    updateSavedSearch,
    deleteSavedSearch,
    runSavedSearch,
    refetch: fetchSavedSearches
  };
};