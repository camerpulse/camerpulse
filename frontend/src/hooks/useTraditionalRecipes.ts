import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type TraditionalRecipe = Database['public']['Tables']['traditional_recipes']['Row'];

export { type TraditionalRecipe };

export const useTraditionalRecipes = (villageId: string) => {
  const [recipes, setRecipes] = useState<TraditionalRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('traditional_recipes')
        .select('*')
        .eq('village_id', villageId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes((data as any[]) || []);
    } catch (error) {
      console.error('Error fetching traditional recipes:', error);
      toast({
        title: "Error",
        description: "Failed to load traditional recipes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitRecipe = async (recipeData: Partial<TraditionalRecipe>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to submit recipes",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('traditional_recipes')
        .insert({
          ...recipeData,
          village_id: villageId,
          user_id: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;

      setRecipes(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Traditional recipe submitted successfully",
      });

      return data;
    } catch (error) {
      console.error('Error submitting recipe:', error);
      toast({
        title: "Error",
        description: "Failed to submit recipe",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateRecipe = async (id: string, updates: Partial<TraditionalRecipe>) => {
    try {
      const { data, error } = await supabase
        .from('traditional_recipes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setRecipes(prev => prev.map(recipe => 
        recipe.id === id ? data : recipe
      ));

      toast({
        title: "Success",
        description: "Recipe updated successfully",
      });

      return data;
    } catch (error) {
      console.error('Error updating recipe:', error);
      toast({
        title: "Error",
        description: "Failed to update recipe",
        variant: "destructive",
      });
      throw error;
    }
  };

  const incrementViews = async (id: string) => {
    try {
      await supabase
        .from('traditional_recipes')
        .update({ views_count: recipes.find(r => r.id === id)?.views_count + 1 })
        .eq('id', id);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  useEffect(() => {
    if (villageId) {
      fetchRecipes();
    }
  }, [villageId]);

  return {
    recipes,
    loading,
    submitRecipe,
    updateRecipe,
    incrementViews,
    refetch: fetchRecipes,
  };
};