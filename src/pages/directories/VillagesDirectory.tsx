import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Star, Plus, Crown, Heart, BookOpen, CheckCircle, TrendingUp } from "lucide-react";

// Mock data for villages
const mockVillages = [
  {
    id: "1",
    name: "Bafut",
    region: "Northwest",
    division: "Mezam",
    population: 95000,
    is_verified: true,
    development_rating: 4.2,
    culture_rating: 4.8,
    education_rating: 3.9,
    conflict_resolution_rating: 4.5,
    overall_ranking: 1,
    chief_name: "Fon Abumbi II",
    description: "Historic palace and rich cultural heritage",
    heritage_sites: ["Royal Palace", "Traditional Markets"],
    notable_elites: [{"name": "Dr. John Niba", "field": "Medicine"}],
    ongoing_projects: [{"name": "Water Project", "budget": 50000000}],
    facilities: ["school", "health_center", "market", "palace"]
  },
  {
    id: "2",
    name: "Foumban",
    region: "West",
    division: "Noun",
    population: 83522,
    is_verified: true,
    development_rating: 4.1,
    culture_rating: 4.9,
    education_rating: 4.2,
    conflict_resolution_rating: 4.3,
    overall_ranking: 2,
    chief_name: "Sultan Nabil Mbombo Njoya",
    description: "Cultural capital with royal palace and museums",
    heritage_sites: ["Sultan's Palace", "Foumban Museum"],
    notable_elites: [{"name": "Prof. Ahmadou Ahidjo", "field": "Politics"}],
    ongoing_projects: [{"name": "Tourism Development", "budget": 100000000}],
    facilities: ["university", "hospital", "market", "museum"]
  }
];

export default function VillagesDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");

  const filteredVillages = mockVillages.filter(village => {
    const matchesSearch = village.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === "all" || village.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="h-12 w-12" />
            <h1 className="text-4xl md:text-5xl font-bold">Villages Directory</h1>
          </div>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Discover Cameroon's rich cultural heritage through our villages. Explore traditional authority, development projects, and community initiatives.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg p-4 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search villages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:col-span-2 text-gray-900"
              />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              >
                <option value="all">All Regions</option>
                <option value="Northwest">Northwest</option>
                <option value="West">West</option>
                <option value="Centre">Centre</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Ranking Board */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-amber-500" />
            Village Rankings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">Development</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">4.2</div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">Culture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">4.8</div>
                <p className="text-sm text-muted-foreground">Heritage Score</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">Education</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">4.0</div>
                <p className="text-sm text-muted-foreground">Access Rating</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">Peace</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">4.4</div>
                <p className="text-sm text-muted-foreground">Conflict Resolution</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Add Village CTA */}
        <div className="mb-8 text-center">
          <Card className="inline-block">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Add Your Village</h3>
              <p className="text-muted-foreground mb-4">Share your village's story and showcase its unique heritage</p>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your Village
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Featured Villages */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Featured Villages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredVillages.map(village => (
              <Card key={village.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {village.name}
                        <Badge variant="secondary">#{village.overall_ranking}</Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {village.division}, {village.region}
                      </CardDescription>
                    </div>
                    {village.is_verified && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">{village.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {village.population.toLocaleString()} people
                      </div>
                      <div className="flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        {village.chief_name}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-semibold">{village.development_rating}</div>
                        <div className="text-muted-foreground">Development</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{village.culture_rating}</div>
                        <div className="text-muted-foreground">Culture</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{village.education_rating}</div>
                        <div className="text-muted-foreground">Education</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{village.conflict_resolution_rating}</div>
                        <div className="text-muted-foreground">Peace</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {village.facilities.map(facility => (
                        <Badge key={facility} variant="outline" className="text-xs">
                          {facility}
                        </Badge>
                      ))}
                    </div>

                    {village.ongoing_projects.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-1">Active Projects</div>
                        <div className="text-xs text-muted-foreground">
                          {village.ongoing_projects[0].name} - {(village.ongoing_projects[0].budget / 1000000).toFixed(1)}M FCFA
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}