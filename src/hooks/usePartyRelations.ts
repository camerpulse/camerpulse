import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PartyMemberFilter = {
  role?: "mp" | "senator" | "minister" | "mayor" | "governor" | "politician" | "all";
  region?: string | "all";
  gender?: "male" | "female" | "all";
  status?: "current" | "all"; // current = is_current true
  search?: string;
  sortBy?: "name" | "role" | "region" | "rating";
  sortOrder?: "asc" | "desc";
};

export interface PartyMember {
  id: string;
  full_name: string;
  role?: string;
  position_title?: string | null;
  region?: string | null;
  gender?: string | null;
  profile_picture_url?: string | null;
  slug?: string | null;
  average_rating?: number | null;
  total_ratings?: number | null;
  is_current: boolean;
  start_date: string | null;
  end_date: string | null;
}

async function fetchPartyMembersRaw(partyId: string, status: "current" | "all" = "current") {
  const { data: affiliations, error } = await supabase
    .from("party_affiliations")
    .select("id, politician_id, start_date, end_date, is_current, position_in_party")
    .eq("party_id", partyId)
    .order("start_date", { ascending: false });

  if (error) throw error;
  if (!affiliations || affiliations.length === 0) return [] as PartyMember[];

  const filtered = status === "current" ? affiliations.filter(a => a.is_current) : affiliations;
  const ids = Array.from(new Set(filtered.map((a) => a.politician_id)));
  if (ids.length === 0) return [] as PartyMember[];

  const { data: politiciansData, error: polErr } = await supabase
    .from("politicians")
    .select("id, full_name, role, position_title, region, gender, profile_picture_url, slug, average_rating, total_ratings")
    .in("id", ids);

  if (polErr) throw polErr;

  const byId = new Map(politiciansData?.map((p) => [p.id, p]) || []);

  const members: PartyMember[] = filtered
    .map((a) => {
      const p = byId.get(a.politician_id);
      if (!p) return null;
      return {
        id: p.id,
        full_name: p.full_name,
        role: p.role,
        position_title: p.position_title,
        region: p.region,
        gender: p.gender,
        profile_picture_url: p.profile_picture_url,
        slug: p.slug,
        average_rating: p.average_rating,
        total_ratings: p.total_ratings,
        is_current: a.is_current,
        start_date: a.start_date,
        end_date: a.end_date,
      } as PartyMember;
    })
    .filter(Boolean) as PartyMember[];

  return members;
}

export function usePartyMembers(partyId?: string, filters?: PartyMemberFilter) {
  return useQuery({
    queryKey: ["party-members", partyId, filters],
    queryFn: async () => {
      if (!partyId) return [] as PartyMember[];
      const status = filters?.status ?? "current";
      let members = await fetchPartyMembersRaw(partyId, status);

      // Client-side filter
      if (filters?.role && filters.role !== "all") {
        members = members.filter((m) => (m.role || "politician") === filters.role);
      }
      if (filters?.region && filters.region !== "all") {
        members = members.filter((m) => (m.region || "").toLowerCase() === filters.region!.toLowerCase());
      }
      if (filters?.gender && filters.gender !== "all") {
        members = members.filter((m) => (m.gender || "").toLowerCase() === filters.gender);
      }
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase();
        members = members.filter((m) => m.full_name.toLowerCase().includes(q) || (m.position_title || "").toLowerCase().includes(q));
      }

      const sortBy = filters?.sortBy || "rating";
      const order = filters?.sortOrder || "desc";
      const dir = order === "asc" ? 1 : -1;

      members.sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.full_name.localeCompare(b.full_name) * dir;
          case "role":
            return (a.role || "").localeCompare(b.role || "") * dir;
          case "region":
            return (a.region || "").localeCompare(b.region || "") * dir;
          case "rating":
          default:
            return (((a.average_rating || 0) - (b.average_rating || 0)) * dir);
        }
      });

      return members;
    },
    enabled: !!partyId,
  });
}

export function usePoliticianAffiliations(politicianId?: string) {
  return useQuery({
    queryKey: ["politician-affiliations", politicianId],
    queryFn: async () => {
      if (!politicianId) return [] as any[];
      const { data, error } = await supabase
        .from("party_affiliations")
        .select("id, party_id, start_date, end_date, is_current")
        .eq("politician_id", politicianId)
        .order("start_date", { ascending: false });
      if (error) throw error;

      if (!data || data.length === 0) return [] as any[];
      const partyIds = Array.from(new Set(data.map((d) => d.party_id)));
      const { data: parties, error: pErr } = await supabase
        .from("political_parties")
        .select("id, name, acronym, logo_url, slug")
        .in("id", partyIds);
      if (pErr) throw pErr;
      const partyById = new Map(parties?.map((p) => [p.id, p]) || []);

      return data.map((a) => ({
        ...a,
        party: partyById.get(a.party_id) || null,
      }));
    },
    enabled: !!politicianId,
  });
}
