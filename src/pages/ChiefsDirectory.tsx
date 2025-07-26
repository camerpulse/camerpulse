import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Crown, Users, MapPin, Star, Plus, Scroll, Award, Phone, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/Layout/AppLayout";

interface Chief {
  id: string;
  village_id: string;
  chief_name: string;
  chief_title: string;
  current_chief: boolean;
  lineage_history: string;
  notable_achievements: string;
  throne_name: string;
  ceremonial_titles: string[];
  traditional_regalia: string;
  palace_location: string;
  succession_type: string;
  contact_phone?: string;
  contact_email?: string;
  profile_photo_url?: string;
  village?: {
    village_name: string;
    region: string;
    division: string;
  };
}

const ChiefsDirectory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedChief, setSelectedChief] = useState<Chief | null>(null);

  const { data: chiefs, isLoading } = useQuery({
    queryKey: ["chiefs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("village_chiefs")
        .select(`
          *,
          village:villages(village_name, region, division)
        `)
        .eq("current_chief", true)
        .order("chief_name");
      
      if (error) throw error;
      return data as Chief[];
    },
  });

  const regions = [...new Set(chiefs?.map(chief => chief.village?.region).filter(Boolean))];

  const filteredChiefs = chiefs?.filter(chief => {
    const matchesSearch = chief.chief_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chief.village?.village_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === "all" || chief.village?.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading Traditional Leaders...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="bg-gradient-hero">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative container mx-auto px-4 py-16 sm:py-24">
              <div className="text-center text-white">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <Crown className="h-8 w-8" />
                  </div>
                  <h1 className="responsive-heading font-bold">Traditional Leaders Directory</h1>
                </div>
                <p className="text-lg sm:text-xl mb-8 max-w-3xl mx-auto opacity-90">
                  Meet the custodians of Cameroon's rich cultural heritage and traditional governance
                </p>
                
                {/* Search Interface */}
                <div className="max-w-4xl mx-auto">
                  <Card className="p-6 shadow-elegant backdrop-blur-sm border-white/20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="relative md:col-span-2">
                        <Input
                          placeholder="Search chiefs, villages, regions..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="h-12"
                        />
                      </div>
                      
                      <select
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="px-3 py-3 border border-input rounded-md h-12"
                      >
                        <option value="all">All Regions</option>
                        {regions.map(region => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Stats */}
          <section className="mb-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="directory-card text-center bg-gradient-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Crown className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{chiefs?.length || 0}</div>
                  <p className="text-sm text-muted-foreground">Traditional Leaders</p>
                </CardContent>
              </Card>

              <Card className="directory-card text-center bg-gradient-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <MapPin className="h-6 w-6 text-secondary" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{regions.length}</div>
                  <p className="text-sm text-muted-foreground">Regions</p>
                </CardContent>
              </Card>

              <Card className="directory-card text-center bg-gradient-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Scroll className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {chiefs?.filter(c => c.succession_type?.includes('Hereditary')).length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Hereditary Thrones</p>
                </CardContent>
              </Card>

              <Card className="directory-card text-center bg-gradient-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 bg-rating-excellent/10 rounded-lg">
                      <Award className="h-6 w-6 text-rating-excellent" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {chiefs?.filter(c => c.ceremonial_titles?.includes('His Royal Highness') || c.ceremonial_titles?.includes('His Majesty')).length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Royal Titles</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Traditional Leaders</h2>
              <p className="text-muted-foreground">
                Showing {filteredChiefs?.length || 0} of {chiefs?.length || 0} leaders
              </p>
            </div>
            
            <Button className="gap-2 bg-gradient-hero text-white border-0 shadow-elegant">
              <Plus className="h-4 w-4" />
              Suggest Chief Update
            </Button>
          </div>

          {/* Chiefs Grid */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChiefs?.map(chief => (
                <Card key={chief.id} className="directory-card group overflow-hidden border-0 shadow-md hover:shadow-elegant">
                  <div className="aspect-video bg-gradient-to-br from-secondary/20 to-secondary/5 relative">
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-primary text-white">
                        {chief.chief_title}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Crown className="h-6 w-6 text-secondary" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="font-semibold text-lg">{chief.chief_name}</h3>
                      <p className="text-sm opacity-90 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {chief.village?.village_name}, {chief.village?.region}
                      </p>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{chief.throne_name}</Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">Royal</span>
                        </div>
                      </div>

                      {chief.ceremonial_titles && (
                        <div>
                          <p className="text-sm font-medium mb-1">Titles</p>
                          <div className="flex flex-wrap gap-1">
                            {chief.ceremonial_titles.slice(0, 2).map((title, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {title}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {chief.notable_achievements}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex gap-2">
                          {chief.contact_phone && (
                            <Button variant="ghost" size="sm">
                              <Phone className="h-4 w-4" />
                            </Button>
                          )}
                          {chief.contact_email && (
                            <Button variant="ghost" size="sm">
                              <Mail className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="default" size="sm" onClick={() => setSelectedChief(chief)}>
                              View Profile
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Crown className="h-5 w-5" />
                                {chief.chief_name}
                              </DialogTitle>
                            </DialogHeader>
                            {selectedChief && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="font-medium">Title</p>
                                    <p className="text-muted-foreground">{selectedChief.chief_title}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Throne Name</p>
                                    <p className="text-muted-foreground">{selectedChief.throne_name}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Village</p>
                                    <p className="text-muted-foreground">{selectedChief.village?.village_name}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Region</p>
                                    <p className="text-muted-foreground">{selectedChief.village?.region}</p>
                                  </div>
                                </div>

                                {selectedChief.ceremonial_titles && (
                                  <div>
                                    <p className="font-medium mb-2">Ceremonial Titles</p>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedChief.ceremonial_titles.map((title, index) => (
                                        <Badge key={index} variant="secondary">{title}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <p className="font-medium mb-2">Lineage History</p>
                                  <p className="text-muted-foreground">{selectedChief.lineage_history}</p>
                                </div>

                                <div>
                                  <p className="font-medium mb-2">Notable Achievements</p>
                                  <p className="text-muted-foreground">{selectedChief.notable_achievements}</p>
                                </div>

                                <div>
                                  <p className="font-medium mb-2">Traditional Regalia</p>
                                  <p className="text-muted-foreground">{selectedChief.traditional_regalia}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="font-medium">Palace Location</p>
                                    <p className="text-muted-foreground">{selectedChief.palace_location}</p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Succession Type</p>
                                    <p className="text-muted-foreground">{selectedChief.succession_type}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) || (
                <div className="col-span-full text-center py-12">
                  <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">No traditional leaders found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search criteria' : 'No leaders available yet'}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
};

export default ChiefsDirectory;