import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Users, Star, Plus, Crown, TrendingUp, Search, Filter, MapIcon, Compass, Calendar, Award } from "lucide-react";
import { useVillages } from "@/hooks/useVillages";
import { AppLayout } from "@/components/Layout/AppLayout";
import AddVillageForm from "@/components/Villages/AddVillageForm";

export default function VillagesDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: villages, isLoading } = useVillages();

  const filteredVillages = villages?.filter(village => {
    const matchesSearch = village.village_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === "all" || village.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const regions = [...new Set(villages?.map(v => v.region))];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading Villages...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        {/* Modern Hero Section */}
        <div className="relative overflow-hidden">
          <div className="bg-gradient-hero">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative container mx-auto px-4 py-16 sm:py-24">
              <div className="text-center text-white">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <Crown className="h-8 w-8" />
                  </div>
                  <h1 className="responsive-heading font-bold">Villages of Cameroon</h1>
                </div>
                <p className="text-lg sm:text-xl mb-8 max-w-3xl mx-auto opacity-90">
                  Discover the rich cultural heritage and vibrant communities that form the backbone of our nation
                </p>
                
                {/* Enhanced Search Interface */}
                <div className="max-w-5xl mx-auto">
                  <Card className="p-6 shadow-elegant backdrop-blur-sm border-white/20">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search villages, chiefs, regions..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-12"
                        />
                      </div>
                      
                      <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="All Regions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Regions</SelectItem>
                          {regions.map(region => (
                            <SelectItem key={region} value={region}>{region}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rating">Top Rated</SelectItem>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="population">Population</SelectItem>
                          <SelectItem value="recent">Recently Added</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Quick Stats */}
          <section className="mb-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="directory-card text-center bg-gradient-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 bg-directory-village/10 rounded-lg">
                      <MapIcon className="h-6 w-6 text-directory-village" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{villages?.length || 0}</div>
                  <p className="text-sm text-muted-foreground">Villages</p>
                </CardContent>
              </Card>

              <Card className="directory-card text-center bg-gradient-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Compass className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{regions.length}</div>
                  <p className="text-sm text-muted-foreground">Regions</p>
                </CardContent>
              </Card>

              <Card className="directory-card text-center bg-gradient-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <Crown className="h-6 w-6 text-secondary" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{villages?.filter(v => v.is_verified).length || 0}</div>
                  <p className="text-sm text-muted-foreground">Chiefs</p>
                </CardContent>
              </Card>

              <Card className="directory-card text-center bg-gradient-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Award className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{villages?.filter(v => v.overall_rating >= 4).length || 0}</div>
                  <p className="text-sm text-muted-foreground">Highly Rated</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Explore Villages</h2>
              <p className="text-muted-foreground">
                Showing {filteredVillages?.length || 0} of {villages?.length || 0} villages
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <AddVillageForm />
            </div>
          </div>

          {/* Villages Grid */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVillages?.map(village => (
                <Card key={village.id} className="directory-card group overflow-hidden border-0 shadow-md hover:shadow-elegant">
                  <div className="aspect-video bg-gradient-to-br from-directory-village/20 to-directory-village/5 relative">
                    <div className="absolute top-4 left-4">
                      {village.is_verified && (
                        <Badge className="bg-directory-verified text-white">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary">
                        ⭐ {village.overall_rating.toFixed(1)}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="font-semibold text-lg">{village.village_name}</h3>
                      <p className="text-sm opacity-90 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {village.division}, {village.region}
                      </p>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{village.population_estimate?.toLocaleString() || 'N/A'} people</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{village.subdivision || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <p>Rich cultural heritage and community spirit</p>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="p-2 bg-muted/50 rounded-lg">
                          <div className="text-sm font-semibold">{village.infrastructure_score.toFixed(1)}</div>
                          <div className="text-xs text-muted-foreground">Infra</div>
                        </div>
                        <div className="p-2 bg-muted/50 rounded-lg">
                          <div className="text-sm font-semibold">{village.education_score.toFixed(1)}</div>
                          <div className="text-xs text-muted-foreground">Education</div>
                        </div>
                        <div className="p-2 bg-muted/50 rounded-lg">
                          <div className="text-sm font-semibold">{village.health_score.toFixed(1)}</div>
                          <div className="text-xs text-muted-foreground">Health</div>
                        </div>
                        <div className="p-2 bg-muted/50 rounded-lg">
                          <div className="text-sm font-semibold">{village.peace_security_score.toFixed(1)}</div>
                          <div className="text-xs text-muted-foreground">Peace</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex -space-x-1">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-6 h-6 bg-muted rounded-full border-2 border-card"></div>
                          ))}
                          <div className="w-6 h-6 bg-muted-foreground/20 rounded-full border-2 border-card flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">+</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) || (
                <div className="col-span-full text-center py-12">
                  <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">No villages found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search criteria' : 'No villages available yet'}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}