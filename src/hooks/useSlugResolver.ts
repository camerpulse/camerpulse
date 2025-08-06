import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { parseSlugForId } from '@/utils/slugUtils';

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
}

/**
 * Hook to resolve slug URLs to actual entity data
 * Supports both slug-based and ID-based URLs for backward compatibility
 */
export function useSlugResolver<T = any>(
  options: UseSlugResolverOptions
): SlugResolverResult<T> {
  const { slug: slugParam, id: idParam } = useParams<{ slug?: string; id?: string }>();
  const slugOrId = slugParam || idParam;
  const [entity, setEntity] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entityId, setEntityId] = useState<string | null>(null);

  const {
    table,
    idColumn = 'id',
    slugColumn = 'slug'
  } = options;

  useEffect(() => {
    const resolveEntity = async () => {
      if (!slugOrId) {
        setError('No identifier provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let query = supabase.from(table).select('*');

        // Try to parse as slug first (contains hyphens or is a UUID)
        const parsedId = parseSlugForId(slugOrId);
        
        if (parsedId) {
          // It's a slug with ID at the end, query by ID
          query = query.eq(idColumn, parsedId);
          setEntityId(parsedId);
        } else if (slugOrId.includes('-') || /^[a-z-]+$/.test(slugOrId)) {
          // It's a slug without ID, try to match by name
          // Convert slug back to potential name variations and try exact matches first
          const nameFromSlug = slugOrId.replace(/-/g, ' ');
          
          // Try different name variations (case-insensitive exact match)
          const nameVariations = [
            nameFromSlug, // dr elizabeth teke
            nameFromSlug.replace(/^dr\s+/i, 'Dr. '), // Dr. elizabeth teke
            nameFromSlug.replace(/^hon\s+/i, 'Hon. '), // Hon. elizabeth teke
            nameFromSlug.split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ') // Dr Elizabeth Teke
          ];
          
          // Try exact matches first, then fallback to ilike
          let found = false;
          for (const variation of nameVariations) {
            const { data: exactMatch } = await supabase
              .from(table)
              .select('*')
              .ilike('name', variation)
              .maybeSingle();
            
            if (exactMatch) {
              setEntity(exactMatch);
              setEntityId(exactMatch[idColumn]);
              found = true;
              break;
            }
          }
          
          if (!found) {
            // Fallback to broader search
            query = query.ilike('name', `%${nameFromSlug}%`);
          } else {
            return; // Exit early if found
          }
        } else {
          // It's likely a raw ID, query by ID
          query = query.eq(idColumn, slugOrId);
          setEntityId(slugOrId);
        }

        const { data, error: queryError } = await query.maybeSingle();

        if (queryError) {
          console.error(`Error fetching ${table}:`, queryError);
          setError(`Failed to load ${table.slice(0, -1)}`);
          return;
        }

        if (!data) {
          setError(`${table.slice(0, -1).charAt(0).toUpperCase() + table.slice(1, -1)} not found`);
          return;
        }

        setEntity(data);
        setEntityId(data[idColumn]);
      } catch (err) {
        console.error('Error resolving slug:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    resolveEntity();
  }, [slugOrId, table, idColumn, slugColumn]);

  return { entity, loading, error, entityId };
}

/**
 * Specific hooks for different entity types
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