import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SlugUpdateResult {
  success: boolean;
  error?: string;
  slug?: string;
}

export const useProfileSlug = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const updateProfileSlug = async (newSlug: string): Promise<SlugUpdateResult> => {
    setIsUpdating(true);
    try {
      const { data, error } = await supabase.rpc('update_profile_slug', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_new_slug: newSlug
      });

      if (error) throw error;

      const result = (data as any) as SlugUpdateResult;
      
      if (result.success) {
        toast({
          title: "Profile URL updated successfully",
          description: `Your new profile URL is: @${result.slug}`,
        });
      } else {
        toast({
          title: "Error updating profile URL",
          description: result.error,
          variant: "destructive",
        });
      }

      return result;
    } catch (error) {
      console.error('Error updating profile slug:', error);
      const errorResult = {
        success: false,
        error: 'Failed to update profile URL. Please try again.'
      };
      
      toast({
        title: "Error updating profile URL",
        description: errorResult.error,
        variant: "destructive",
      });
      
      return errorResult;
    } finally {
      setIsUpdating(false);
    }
  };

  const generateSlugFromText = async (text: string): Promise<string | null> => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.rpc('generate_profile_slug', {
        input_text: text
      });

      if (error) throw error;
      return data as string;
    } catch (error) {
      console.error('Error generating slug:', error);
      toast({
        title: "Error generating slug",
        description: "Failed to generate a suggested URL. Please try manually.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const validateSlug = async (slug: string): Promise<boolean> => {
    setIsValidating(true);
    try {
      const { data, error } = await supabase.rpc('validate_profile_slug', {
        slug_input: slug
      });

      if (error) throw error;
      return data as boolean;
    } catch (error) {
      console.error('Error validating slug:', error);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const checkSlugAvailability = async (slug: string, excludeUserId?: string): Promise<boolean> => {
    try {
      const query = supabase
        .from('profiles')
        .select('profile_slug')
        .eq('profile_slug', slug);

      if (excludeUserId) {
        query.neq('user_id', excludeUserId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      return !data; // Return true if no data found (slug is available)
    } catch (error) {
      console.error('Error checking slug availability:', error);
      return false;
    }
  };

  return {
    updateProfileSlug,
    generateSlugFromText,
    validateSlug,
    checkSlugAvailability,
    isUpdating,
    isGenerating,
    isValidating,
  };
};