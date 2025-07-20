import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Institution } from "@/types/directory";
import { Search, Star, MapPin, Plus, Heart, Stethoscope, Ambulance, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

export const HospitalsHomepage = () => {
  const [hospitals, setHospitals] = useState<Institution[]>([]);
  const [featuredHospitals, setFeaturedHospitals] = useState<Institution[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .eq('institution_type', 'hospital')
        .order('average_rating', { ascending: false })
        .limit(20);

      if (error) throw error;

      setHospitals(data || []);
      setFeaturedHospitals(data?.filter(hospital => hospital.is_featured || hospital.is_sponsored).slice(0, 3) || []);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-green-400 text-green-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const hospitalTypes = [
    { id: "all", label: "All Hospitals", icon: Heart },
    { id: "general", label: "General", icon: Building2 },
    { id: "specialist", label: "Specialist", icon: Stethoscope },
    { id: "emergency", label: "Emergency", icon: Ambulance },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Hospitals Directory</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find trusted healthcare facilities across Cameroon. Access emergency services, specialist care, and community health centers.
          </p>
        </div>

        {/* Emergency Map Locator */}
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Ambulance className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-900">Emergency Services</h3>
                <p className="text-red-700">Find the nearest emergency hospital</p>
              </div>
            </div>
            <Button variant="destructive">
              Find Emergency Care
            </Button>
          </div>
        </Card>

        {/* Search Bar */}
        <Card className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search hospitals by name, specialty, or location..."
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

        {/* Hospital Type Tabs */}
        <Tabs value={selectedType} onValueChange={setSelectedType}>
          <TabsList className="grid w-full grid-cols-4">
            {hospitalTypes.map((type) => (
              <TabsTrigger key={type.id} value={type.id} className="flex items-center gap-2">
                <type.icon className="h-4 w-4" />
                {type.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Featured Hospitals */}
        {featuredHospitals.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Featured Hospitals</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredHospitals.map((hospital) => (
                <Card key={hospital.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{hospital.name}</CardTitle>
                      {hospital.is_sponsored && (
                        <Badge variant="secondary">Sponsored</Badge>
                      )}
                    </div>
                    {renderStars(hospital.average_rating)}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {hospital.city}, {hospital.region}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {hospital.description || "No description available"}
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm text-gray-500">
                          {hospital.total_reviews} reviews
                        </span>
                        {hospital.is_verified && (
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

        {/* Top Rated Hospitals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Top Rated Hospitals</h2>
            <Link to="/hospitals/all">
              <Button variant="outline">View All Hospitals</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitals.slice(0, 6).map((hospital) => (
              <Card key={hospital.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{hospital.name}</CardTitle>
                  {renderStars(hospital.average_rating)}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {hospital.city}, {hospital.region}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {hospital.description || "No description available"}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-gray-500">
                        {hospital.total_reviews} reviews
                      </span>
                      {hospital.is_verified && (
                        <Badge variant="outline">Verified</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Rating Explainer Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">How We Rate Hospitals</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium">Cleanliness</h4>
              <p className="text-sm text-gray-600">Hygiene standards</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Stethoscope className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium">Staff Quality</h4>
              <p className="text-sm text-gray-600">Professional care</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Ambulance className="h-6 w-6 text-red-600" />
              </div>
              <h4 className="font-medium">Emergency Response</h4>
              <p className="text-sm text-gray-600">Speed of care</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium">Facilities</h4>
              <p className="text-sm text-gray-600">Equipment quality</p>
            </div>
          </div>
        </Card>

        {/* Call to Action */}
        <Card className="p-8 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold">Add Your Hospital</h3>
            <p className="text-green-100">
              Help patients find quality healthcare in their community
            </p>
            <Button size="lg" variant="secondary">
              <Plus className="h-4 w-4 mr-2" />
              Add Hospital
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};