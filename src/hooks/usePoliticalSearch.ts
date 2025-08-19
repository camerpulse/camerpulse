import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      if (!query || query.trim().length < 2) return [] as SearchResult[];

      const searchTerm = query.trim().toLowerCase();
      const results: SearchResult[] = [];

      // Search politicians
      const { data: politicians, error: politiciansError } = await supabase
        .from("politicians")
        .select("id, name, slug, role_title, region, performance_score, profile_image_url")
        .or(`name.ilike.%${searchTerm}%,role_title.ilike.%${searchTerm}%,region.ilike.%${searchTerm}%`)
        .limit(limit);

      if (politiciansError) throw politiciansError;

      // Search political parties
      const { data: parties, error: partiesError } = await supabase
        .from("political_parties")
        .select("id, name, slug, description, logo_url, acronym")
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,acronym.ilike.%${searchTerm}%`)
        .eq("is_active", true)
        .limit(limit);

      if (partiesError) throw partiesError;

      // Transform politicians
      politicians?.forEach(politician => {
        results.push({
          id: politician.id,
          type: "politician",
          name: politician.name,
          slug: politician.slug,
          role: politician.role_title,
          region: politician.region,
          profile_image_url: politician.profile_image_url,
          performance_score: politician.performance_score,
        });
      });

      // Transform parties
      parties?.forEach(party => {
        results.push({
          id: party.id,
          type: "party",
          name: party.name,
          slug: party.slug,
          description: party.description,
          logo_url: party.logo_url,
        });
      });

      // Sort by relevance (exact matches first, then partial matches)
      return results.sort((a, b) => {
        const aExact = a.name.toLowerCase().includes(searchTerm);
        const bExact = b.name.toLowerCase().includes(searchTerm);
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return a.name.localeCompare(b.name);
      });
    },
    enabled: query.trim().length >= 2,
  });
}