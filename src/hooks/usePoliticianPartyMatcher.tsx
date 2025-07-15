import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePoliticianPartyMatcher = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const matchPoliticiansToParties = useMutation({
    mutationFn: async () => {
      // Get all politicians without party affiliations
      const { data: politicians, error: politiciansError } = await supabase
        .from('politicians')
        .select('id, name, political_party_id')
        .is('political_party_id', null);

      if (politiciansError) throw politiciansError;

      // Get all political parties
      const { data: parties, error: partiesError } = await supabase
        .from('political_parties')
        .select('id, name, acronym, party_president');

      if (partiesError) throw partiesError;

      const matches: { politicianId: string, partyId: string, confidence: number }[] = [];

      // Match politicians to parties based on various criteria
      politicians?.forEach(politician => {
        parties?.forEach(party => {
          let confidence = 0;

          // Exact name match with party president
          if (party.party_president && politician.name.toLowerCase().includes(party.party_president.toLowerCase())) {
            confidence = 0.9;
          }

          // If politician name contains party name or acronym
          if (party.acronym && politician.name.toLowerCase().includes(party.acronym.toLowerCase())) {
            confidence = Math.max(confidence, 0.7);
          }

          if (politician.name.toLowerCase().includes(party.name.toLowerCase().split(' ')[0])) {
            confidence = Math.max(confidence, 0.6);
          }

          if (confidence > 0.6) {
            matches.push({
              politicianId: politician.id,
              partyId: party.id,
              confidence
            });
          }
        });
      });

      // Sort by confidence and take best matches
      const bestMatches = matches
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 50); // Limit to 50 matches per run

      // Update politicians with party affiliations
      const updates = await Promise.all(
        bestMatches.map(match =>
          supabase
            .from('politicians')
            .update({ political_party_id: match.partyId })
            .eq('id', match.politicianId)
        )
      );

      const successCount = updates.filter(update => !update.error).length;
      const errorCount = updates.filter(update => update.error).length;

      return {
        totalMatches: bestMatches.length,
        successCount,
        errorCount,
        matches: bestMatches
      };
    },
    onSuccess: (data) => {
      toast({
        title: "Politician-Party Matching Complete",
        description: `${data.successCount} politicians linked to parties, ${data.errorCount} errors`,
      });
      queryClient.invalidateQueries({ queryKey: ["politicians"] });
    },
    onError: (error) => {
      toast({
        title: "Matching Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    matchPoliticiansToParties,
    isMatching: matchPoliticiansToParties.isPending
  };
};

export default usePoliticianPartyMatcher;