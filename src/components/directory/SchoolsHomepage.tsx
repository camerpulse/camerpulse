import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Institution } from "@/types/directory";
import { Search, Star, MapPin, Plus, GraduationCap, BookOpen, Users } from "lucide-react";
import { Link } from "react-router-dom";

export const SchoolsHomepage = () => {
  const [schools, setSchools] = useState<Institution[]>([]);
  const [featuredSchools, setFeaturedSchools] = useState<Institution[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .eq('institution_type', 'school')
        .order('average_rating', { ascending: false })
        .limit(20);

      if (error) throw error;

      setSchools(data || []);
      setFeaturedSchools(data?.filter(school => school.is_featured || school.is_sponsored).slice(0, 3) || []);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const schoolTypes = [
    { id: "all", label: "All Schools", icon: GraduationCap },
    { id: "primary", label: "Primary", icon: BookOpen },
    { id: "secondary", label: "Secondary", icon: Users },
    { id: "university", label: "University", icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Schools Directory</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover and rate educational institutions across Cameroon. Find the best schools in your area and help others make informed decisions.
          </p>
        </div>

        {/* Search Bar */}
        <Card className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search schools by name, location, or type..."
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

        {/* School Type Tabs */}
        <Tabs value={selectedType} onValueChange={setSelectedType}>
          <TabsList className="grid w-full grid-cols-4">
            {schoolTypes.map((type) => (
              <TabsTrigger key={type.id} value={type.id} className="flex items-center gap-2">
                <type.icon className="h-4 w-4" />
                {type.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Featured Schools Slider */}
        {featuredSchools.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Featured Schools</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredSchools.map((school) => (
                <Card key={school.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{school.name}</CardTitle>
                      {school.is_sponsored && (
                        <Badge variant="secondary">Sponsored</Badge>
                      )}
                    </div>
                    {renderStars(school.average_rating)}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {school.city}, {school.region}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {school.description || "No description available"}
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm text-gray-500">
                          {school.total_reviews} reviews
                        </span>
                        {school.is_verified && (
                          <Badge variant="outline">Verified</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Top Rated Schools */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Top Rated Schools</h2>
            <Link to="/schools/all">
              <Button variant="outline">View All Schools</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.slice(0, 6).map((school) => (
              <Card key={school.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{school.name}</CardTitle>
                  {renderStars(school.average_rating)}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {school.city}, {school.region}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {school.description || "No description available"}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-gray-500">
                        {school.total_reviews} reviews
                      </span>
                      {school.is_verified && (
                        <Badge variant="outline">Verified</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <Card className="p-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold">Add Your School</h3>
            <p className="text-blue-100">
              Help build the most comprehensive directory of schools in Cameroon
            </p>
            <Button size="lg" variant="secondary">
              <Plus className="h-4 w-4 mr-2" />
              Add School
            </Button>
          </div>
        </Card>

        {/* Verification Legend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Understanding Our Verification System</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Verified</Badge>
              <span className="text-sm">Officially verified institution</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Sponsored</Badge>
              <span className="text-sm">Promoted listing</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">Featured</Badge>
              <span className="text-sm">Highlighted for quality</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};