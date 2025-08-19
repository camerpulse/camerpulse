import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Link2, UserPlus, Users } from "lucide-react";
import { PoliticalSearch } from "@/components/Political/PoliticalSearch";

interface LinkingCandidate {
  politician_id: string;
  politician_name: string;
  party_id: string;
  party_name: string;
  confidence: number;
  reason: string;
}

export function PoliticalManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  // Get unlinked politicians and parties
  const { data: unlinkedPoliticians } = useQuery({
    queryKey: ["unlinked-politicians"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("politicians")
        .select("id, name, role_title, region")
        .is("political_party_id", null)
        .limit(50);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: linkingCandidates } = useQuery({
    queryKey: ["linking-candidates"],
    queryFn: async () => {
      // Get politicians without current party affiliations
      const { data: politicians, error: polError } = await supabase
        .from("politicians")
        .select("id, name")
        .limit(100);

      if (polError) throw polError;

      // Get parties
      const { data: parties, error: partyError } = await supabase
        .from("political_parties")
        .select("id, name, president_name")
        .eq("is_active", true);

      if (partyError) throw partyError;

      // Simple name matching algorithm
      const candidates: LinkingCandidate[] = [];
      
      politicians?.forEach(politician => {
        parties?.forEach(party => {
          // Check if politician name includes party president name or vice versa
          const politicianName = politician.name.toLowerCase();
          const partyPresident = (party.president_name || "").toLowerCase();
          
          let confidence = 0;
          let reason = "";
          
          if (partyPresident && politicianName.includes(partyPresident)) {
            confidence = 0.9;
            reason = "Name matches party president";
          } else if (partyPresident && partyPresident.includes(politicianName)) {
            confidence = 0.8;
            reason = "Partial name match with president";
          }
          
          if (confidence > 0.7) {
            candidates.push({
              politician_id: politician.id,
              politician_name: politician.name,
              party_id: party.id,
              party_name: party.name,
              confidence,
              reason,
            });
          }
        });
      });

      return candidates.sort((a, b) => b.confidence - a.confidence);
    },
  });

  const linkPoliticianMutation = useMutation({
    mutationFn: async ({ politicianId, partyId }: { politicianId: string; partyId: string }) => {
      // Create party affiliation
      const { error } = await supabase
        .from("party_affiliations")
        .insert({
          politician_id: politicianId,
          party_id: partyId,
          is_current: true,
          start_date: new Date().toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Politician linked to party successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["unlinked-politicians"] });
      queryClient.invalidateQueries({ queryKey: ["linking-candidates"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to link politician to party",
        variant: "destructive",
      });
    },
  });

  const handleBulkLink = async () => {
    const candidates = linkingCandidates?.filter(c => 
      selectedCandidates.includes(`${c.politician_id}-${c.party_id}`)
    );

    if (!candidates?.length) return;

    try {
      await Promise.all(
        candidates.map(candidate =>
          linkPoliticianMutation.mutateAsync({
            politicianId: candidate.politician_id,
            partyId: candidate.party_id,
          })
        )
      );
      
      setSelectedCandidates([]);
      toast({
        title: "Success",
        description: `Linked ${candidates.length} politicians to parties`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Some links failed to create",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Political Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Global Search</h3>
            <PoliticalSearch />
          </div>

          <Tabs defaultValue="candidates" className="w-full">
            <TabsList>
              <TabsTrigger value="candidates">Linking Candidates</TabsTrigger>
              <TabsTrigger value="unlinked">Unlinked Politicians</TabsTrigger>
            </TabsList>

            <TabsContent value="candidates" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Suggested Links</h3>
                {selectedCandidates.length > 0 && (
                  <Button onClick={handleBulkLink} disabled={linkPoliticianMutation.isPending}>
                    <Link2 className="w-4 h-4 mr-2" />
                    Link Selected ({selectedCandidates.length})
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {linkingCandidates?.map((candidate) => {
                  const id = `${candidate.politician_id}-${candidate.party_id}`;
                  const isSelected = selectedCandidates.includes(id);
                  
                  return (
                    <div
                      key={id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        isSelected ? "bg-accent" : "hover:bg-muted"
                      }`}
                      onClick={() => {
                        setSelectedCandidates(prev =>
                          prev.includes(id)
                            ? prev.filter(item => item !== id)
                            : [...prev, id]
                        );
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {candidate.politician_name} → {candidate.party_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {candidate.reason}
                          </p>
                        </div>
                        <Badge variant={candidate.confidence > 0.8 ? "default" : "secondary"}>
                          {Math.round(candidate.confidence * 100)}% match
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                
                {!linkingCandidates?.length && (
                  <p className="text-muted-foreground text-center py-8">
                    No linking candidates found
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="unlinked" className="space-y-4">
              <h3 className="text-lg font-medium">Unlinked Politicians</h3>
              
              <div className="grid gap-3">
                {unlinkedPoliticians?.map((politician) => (
                  <Card key={politician.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{politician.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {politician.role_title} • {politician.region}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Link
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {!unlinkedPoliticians?.length && (
                  <p className="text-muted-foreground text-center py-8">
                    All politicians are linked
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}