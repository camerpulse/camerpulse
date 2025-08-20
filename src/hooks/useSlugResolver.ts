import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { parseSlugForId } from '@/utils/slug';

interface UseSlugResolverOptions {
  table: string;
  idColumn?: string;
  slugColumn?: string;
}

interface SlugResolverResult<T> {
  entity: T | null;
  loading: boolean;
  error: string | null;
  entityId: string | null;
  canonicalSlug?: string;
  isRedirect?: boolean;
}

interface SlugResolution {
  id: string;
  slug: string;
  is_redirect: boolean;
  redirect_from?: string;
}

/**
 * Modern hook to resolve slug URLs with redirect handling
 */
export function useSlugResolver<T = any>(
  options: UseSlugResolverOptions
): SlugResolverResult<T> {
  const { slug: slugParam, id: idParam } = useParams<{ slug?: string; id?: string }>();
  const navigate = useNavigate();
  const slugOrId = slugParam || idParam;
  const { table } = options;

  // First resolve the slug to get entity ID and handle redirects
  const { data: resolution, isLoading: isResolving, error: resolveError } = useQuery({
    queryKey: ['resolve-slug', table, slugOrId],
    queryFn: async () => {
      if (!slugOrId) return null;
      
      const { data, error } = await supabase.rpc('get_entity_by_slug', {
        entity_type: table,
        input_slug: slugOrId
      });
      
      if (error) {
        console.error('Slug resolution error:', error);
        throw error;
      }
      
      return data && data.length > 0 ? data[0] as SlugResolution : null;
    },
    enabled: !!slugOrId
  });

  // Handle redirects
  useEffect(() => {
    if (resolution?.is_redirect && resolution.slug !== slugOrId) {
      // Redirect to the canonical URL
      const newPath = window.location.pathname.replace(slugOrId!, resolution.slug);
      navigate(newPath, { replace: true });
    }
  }, [resolution, slugOrId, navigate]);

  // Fetch the actual entity data
  const { data: entity, isLoading: isEntityLoading, error: entityError } = useQuery({
    queryKey: [table, 'by-id', resolution?.id],
    queryFn: async () => {
      if (!resolution?.id) return null;
      
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', resolution.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!resolution?.id
  });

  return {
    entity,
    loading: isResolving || isEntityLoading,
    error: resolveError?.message || entityError?.message || null,
    entityId: resolution?.id || null,
    canonicalSlug: resolution?.slug,
    isRedirect: resolution?.is_redirect || false
  };
}

/**
 * Enhanced politician slug resolver with party data
 */
export function usePoliticianBySlug(entityType: 'politicians' | 'mps' | 'senators' | 'ministers', slug: string) {
  const navigate = useNavigate();
  
  // Resolve slug and handle redirects
  const { data: resolution, isLoading: isResolving, error: resolveError } = useQuery({
    queryKey: ['resolve-slug', entityType, slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase.rpc('get_entity_by_slug', {
        entity_type: entityType,
        input_slug: slug
      });
      
      if (error) throw error;
      return data && data.length > 0 ? data[0] as SlugResolution : null;
    },
    enabled: !!slug
  });

  // Handle redirects
  useEffect(() => {
    if (resolution?.is_redirect && resolution.slug !== slug) {
      const newPath = window.location.pathname.replace(slug, resolution.slug);
      navigate(newPath, { replace: true });
    }
  }, [resolution, slug, navigate]);

  // Fetch politician with party data
  const { data: politician, isLoading: isPoliticianLoading, error: politicianError } = useQuery({
    queryKey: [entityType, 'by-id', resolution?.id],
    queryFn: async () => {
      if (!resolution?.id) return null;
      
      const { data, error } = await supabase
        .from(entityType)
        .select(`
          *,
          political_parties (
            id,
            name,
            acronym,
            logo_url,
            slug
          )
        `)
        .eq('id', resolution.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!resolution?.id
  });

  return {
    data: politician,
    canonicalSlug: resolution?.slug,
    isRedirect: resolution?.is_redirect || false,
    isLoading: isResolving || isPoliticianLoading,
    error: resolveError || politicianError
  };
}

/**
 * Political party slug resolver
 */
export function usePoliticalPartyBySlug(slug: string) {
  const navigate = useNavigate();
  
  const { data: resolution, isLoading: isResolving, error: resolveError } = useQuery({
    queryKey: ['resolve-slug', 'political_parties', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase.rpc('get_entity_by_slug', {
        entity_type: 'political_parties',
        input_slug: slug
      });
      
      if (error) throw error;
      return data && data.length > 0 ? data[0] as SlugResolution : null;
    },
    enabled: !!slug
  });

  useEffect(() => {
    if (resolution?.is_redirect && resolution.slug !== slug) {
      const newPath = window.location.pathname.replace(slug, resolution.slug);
      navigate(newPath, { replace: true });
    }
  }, [resolution, slug, navigate]);

  const { data: party, isLoading: isPartyLoading, error: partyError } = useQuery({
    queryKey: ['political_parties', 'by-id', resolution?.id],
    queryFn: async () => {
      if (!resolution?.id) return null;
      
      const { data, error } = await supabase
        .from('political_parties')
        .select('*')
        .eq('id', resolution.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!resolution?.id
  });

  return {
    data: party,
    canonicalSlug: resolution?.slug,
    isRedirect: resolution?.is_redirect || false,
    isLoading: isResolving || isPartyLoading,
    error: resolveError || partyError
  };
}

/**
 * Legacy specific hooks for backward compatibility
 */
export function usePoliticianSlug() {
  return useSlugResolver({
    table: 'politicians'
  });
}

export function useSenatorSlug() {
  return useSlugResolver({
    table: 'senators'
  });
}

export function useVillageSlug() {
  return useSlugResolver({
    table: 'villages'
  });
}

export function useHospitalSlug() {
  return useSlugResolver({
    table: 'hospitals'
  });
}

export function useSchoolSlug() {
  return useSlugResolver({
    table: 'schools'
  });
}

export function usePetitionSlug() {
  return useSlugResolver({
    table: 'petitions'
  });
}

export function useEventSlug() {
  return useSlugResolver({
    table: 'events'
  });
}

export function useMPSlug() {
  return useSlugResolver({
    table: 'mps'
  });
}

export function useMinisterSlug() {
  return useSlugResolver({
    table: 'ministers'
  });
}