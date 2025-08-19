import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { advancedSanitizeInput, logSecurityEvent } from "@/utils/security";

export interface SearchResult {
  id: string;
  type: "politician" | "party";
  name: string;
  slug?: string;
  role?: string;
  region?: string;
  party?: string;
  description?: string;
  logo_url?: string;
  profile_image_url?: string;
  performance_score?: number;
}

export function usePoliticalSearch(query: string, limit: number = 20) {
  return useQuery({
    queryKey: ["political-search", query, limit],
    queryFn: async () => {
      const trimmed = query?.trim() ?? "";
      if (trimmed.length < 2) return [] as SearchResult[];

      // Security: Sanitize search input to prevent XSS and SQL injection
      const sanitizedQuery = advancedSanitizeInput(trimmed);
      
      // Security: Log search attempts for monitoring
      if (trimmed !== sanitizedQuery) {
        await logSecurityEvent(
          'suspicious_search_attempt',
          'search',
          undefined,
          { originalQuery: trimmed, sanitizedQuery },
          'medium'
        );
      }

      // Security: Validate query length to prevent DoS
      if (sanitizedQuery.length > 100) {
        throw new Error('Search query too long');
      }

      const { data, error } = await supabase.rpc("secure_political_search", {
        p_query: sanitizedQuery,
        p_limit: Math.min(limit, 50), // Cap limit to prevent resource abuse
        p_offset: 0
      });

      if (error) {
        await logSecurityEvent(
          'search_error',
          'search',
          undefined,
          { error: error.message, query: sanitizedQuery },
          'low'
        );
        throw error;
      }

      const results: SearchResult[] = (data || []).map((row: any) => ({
        id: row.id,
        type: (row.entity_type as "politician" | "party") ?? "politician",
        name: row.name,
        slug: row.slug ?? undefined,
        role: row.role_title ?? undefined,
        region: row.region ?? undefined,
        description: row.description ?? undefined,
        logo_url: row.logo_url ?? undefined,
        profile_image_url: row.profile_image_url ?? undefined,
        performance_score: row.performance_score ?? undefined,
      }));

      const searchTerm = trimmed.toLowerCase();
      return results.sort((a, b) => {
        const aExact = a.name?.toLowerCase().includes(searchTerm);
        const bExact = b.name?.toLowerCase().includes(searchTerm);
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return (a.name || '').localeCompare(b.name || '');
      });
    },
    enabled: (query?.trim()?.length ?? 0) >= 2,
  });
}