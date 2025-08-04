import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Institution, VillageData } from "@/types/directory";
import { 
  Search, 
  Star, 
  MapPin, 
  Plus, 
  Crown, 
  Users, 
  TrendingUp, 
  Heart,
  GraduationCap,
  Handshake,
  Award,
  DollarSign,
  FileText
} from "lucide-react";
import { Link } from "react-router-dom";

export const VillagesHomepage = () => {
  const [villages, setVillages] = useState<Institution[]>([]);
  const [villageData, setVillageData] = useState<Record<string, VillageData>>({});
  const [featuredVillages, setFeaturedVillages] = useState<Institution[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRanking, setSelectedRanking] = useState("development");

  useEffect(() => {
    fetchVillages();
  }, []);

  const fetchVillages = async () => {
    try {
      const { data: villagesData, error: villagesError } = await supabase
        .from('institutions')
        .select('*')
        .eq('institution_type', 'village')
        .order('average_rating', { ascending: false })
        .limit(20);

      if (villagesError) throw villagesError;

      setVillages(villagesData || []);
      setFeaturedVillages(villagesData?.filter(village => village.is_featured || village.is_sponsored).slice(0, 3) || []);

      // Fetch village-specific data
      if (villagesData && villagesData.length > 0) {
        const { data: villageDataRes, error: villageDataError } = await supabase
          .from('village_data')
          .select('*')
          .in('institution_id', villagesData.map(v => v.id));

        if (!villageDataError && villageDataRes) {
          const dataMap = villageDataRes.reduce((acc, data) => {
            acc[data.institution_id] = data;
            return acc;
          }, {} as Record<string, VillageData>);
          setVillageData(dataMap);
        }
      }
    } catch (error) {
      console.error('Error fetching villages:', error);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const getVillageScore = (villageId: string, type: string) => {
    const data = villageData[villageId];
    if (!data) return 0;
    
    switch (type) {
      case 'development': return data.development_score;
      case 'culture': return data.culture_score;
      case 'education': return data.education_score;
      case 'conflict_resolution': return data.conflict_resolution_score;
      default: return 0;
    }
  };

  const rankingTypes = [
    { id: "development", label: "Development", icon: TrendingUp, color: "bg-green-500" },
    { id: "culture", label: "Culture", icon: Heart, color: "bg-purple-500" },
    { id: "education", label: "Education", icon: GraduationCap, color: "bg-blue-500" },
    { id: "conflict_resolution", label: "Peace", icon: Handshake, color: "bg-orange-500" },
  ];

  const topVillagesByRanking = villages
    .map(village => ({
      ...village,
      score: getVillageScore(village.id, selectedRanking)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Villages Directory</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the rich heritage and development progress of Cameroonian villages. Connect with community leaders and support local initiatives.
          </p>
        </div>

        {/* Search Bar */}
        <Card className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search villages by name or region..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </Card>

        {/* Village Rankings Board */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Village Rankings</h2>
          <Tabs value={selectedRanking} onValueChange={setSelectedRanking}>
            <TabsList className="grid w-full grid-cols-4">
              {rankingTypes.map((type) => (
                <TabsTrigger key={type.id} value={type.id} className="flex items-center gap-2">
                  <type.icon className="h-4 w-4" />
                  {type.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={selectedRanking} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {topVillagesByRanking.map((village, index) => (
                  <Card key={village.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                        }`}>
                          {index + 1}
                        </div>
                        {index < 3 && <Crown className="h-4 w-4 text-yellow-500" />}
                      </div>
                      <h3 className="font-semibold text-sm">{village.name}</h3>
                      <p className="text-xs text-gray-600">{village.region}</p>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>Score</span>
                          <span className="font-bold">{village.score}/100</span>
                        </div>
                        <Progress value={village.score} className="h-2 mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Featured Villages Slider */}
        {featuredVillages.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Featured Villages</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredVillages.map((village) => {
                const data = villageData[village.id];
                return (
                  <Card key={village.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{village.name}</CardTitle>
                        {village.is_sponsored && (
                          <Badge variant="secondary">Sponsored</Badge>
                        )}
                      </div>
                      {renderStars(village.average_rating)}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          {village.region}
                        </div>
                        {data && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Crown className="h-4 w-4 text-amber-600" />
                              <span>Chief: {data.chief_name || "Not specified"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-4 w-4 text-blue-600" />
                              <span>Population: {data.population?.toLocaleString() || "Unknown"}</span>
                            </div>
                          </div>
                        )}
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {village.description || "A beautiful village with rich cultural heritage"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
            <Award className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <h3 className="font-semibold">Village Awards</h3>
            <p className="text-sm text-gray-600">Recognition programs</p>
          </Card>
          
          <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
            <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold">Fundraising</h3>
            <p className="text-sm text-gray-600">Support projects</p>
          </Card>
          
          <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
            <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold">Petitions</h3>
            <p className="text-sm text-gray-600">Community voice</p>
          </Card>
          
          <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
            <Crown className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold">Chief Profiles</h3>
            <p className="text-sm text-gray-600">Meet leaders</p>
          </Card>
        </div>

        {/* All Villages */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">All Villages</h2>
            <Link to="/villages/all">
              <Button variant="outline">View All Villages</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {villages.slice(0, 6).map((village) => {
              const data = villageData[village.id];
              return (
                <Card key={village.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{village.name}</CardTitle>
                    {renderStars(village.average_rating)}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {village.region}
                      </div>
                      {data && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Crown className="h-4 w-4 text-amber-600" />
                            <span>Chief: {data.chief_name || "Not specified"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-blue-600" />
                            <span>Pop: {data.population?.toLocaleString() || "Unknown"}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm text-gray-500">
                          {village.total_reviews} reviews
                        </span>
                        {village.is_verified && (
                          <Badge variant="outline">Verified</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <Card className="p-8 bg-gradient-to-r from-amber-600 to-orange-600 text-white">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold">Add Your Village</h3>
            <p className="text-amber-100">
              Showcase your community's heritage and connect with the diaspora
            </p>
            <Button size="lg" variant="secondary">
              <Plus className="h-4 w-4 mr-2" />
              Add Village
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};