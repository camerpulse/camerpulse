import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Institution } from "@/types/directory";
import { Search, Star, MapPin, Plus, Pill, Leaf, Clock, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export const PharmaciesHomepage = () => {
  const [pharmacies, setPharmacies] = useState<Institution[]>([]);
  const [featuredPharmacies, setFeaturedPharmacies] = useState<Institution[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [medicineSearch, setMedicineSearch] = useState("");

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .eq('institution_type', 'pharmacy')
        .order('average_rating', { ascending: false })
        .limit(20);

      if (error) throw error;

      setPharmacies(data || []);
      setFeaturedPharmacies(data?.filter(pharmacy => pharmacy.is_featured || pharmacy.is_sponsored).slice(0, 3) || []);
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-purple-400 text-purple-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Pharmacies Directory</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find licensed pharmacies and traditional medicine shops across Cameroon. Check medicine availability and compare prices.
          </p>
        </div>

        {/* Medicine Availability Search */}
        <Card className="p-6 bg-gradient-to-r from-purple-100 to-pink-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Medicine Availability Search
          </h3>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search for specific medicines or drugs..."
                value={medicineSearch}
                onChange={(e) => setMedicineSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Find Medicine
            </Button>
          </div>
        </Card>

        {/* Regular Search Bar */}
        <Card className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search pharmacies by name or location..."
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

        {/* Location-based Recommendations */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Pharmacies Near You</h3>
            <Button variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              Use My Location
            </Button>
          </div>
          <p className="text-gray-600">
            Enable location access to find the nearest pharmacies and check real-time medicine availability.
          </p>
        </Card>

        {/* Top Rated & Featured Pharmacies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Rated */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Top Rated Pharmacies</h2>
            <div className="space-y-4">
              {pharmacies.slice(0, 3).map((pharmacy) => (
                <Card key={pharmacy.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{pharmacy.name}</h3>
                        {renderStars(pharmacy.average_rating)}
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <MapPin className="h-4 w-4" />
                          {pharmacy.city}, {pharmacy.region}
                        </div>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {pharmacy.description || "No description available"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {pharmacy.is_verified && (
                          <Badge variant="outline">
                            <Shield className="h-3 w-3 mr-1" />
                            Licensed
                          </Badge>
                        )}
                        <span className="text-sm text-gray-500">
                          {pharmacy.total_reviews} reviews
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Featured Herbal Shops */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Featured Traditional Medicine</h2>
            <div className="space-y-4">
              {featuredPharmacies.map((pharmacy) => (
                <Card key={pharmacy.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{pharmacy.name}</h3>
                          <Leaf className="h-4 w-4 text-green-600" />
                        </div>
                        {renderStars(pharmacy.average_rating)}
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <MapPin className="h-4 w-4" />
                          {pharmacy.city}, {pharmacy.region}
                        </div>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {pharmacy.description || "Traditional herbal medicine"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {pharmacy.is_sponsored && (
                          <Badge variant="secondary">Sponsored</Badge>
                        )}
                        <span className="text-sm text-gray-500">
                          {pharmacy.total_reviews} reviews
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* All Pharmacies Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">All Pharmacies</h2>
            <Link to="/pharmacies/all">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pharmacies.slice(0, 6).map((pharmacy) => (
              <Card key={pharmacy.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{pharmacy.name}</CardTitle>
                  {renderStars(pharmacy.average_rating)}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {pharmacy.city}, {pharmacy.region}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {pharmacy.description || "No description available"}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-gray-500">
                        {pharmacy.total_reviews} reviews
                      </span>
                      {pharmacy.is_verified && (
                        <Badge variant="outline">
                          <Shield className="h-3 w-3 mr-1" />
                          Licensed
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* License Badge Explanation */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Understanding Our License System</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <Shield className="h-3 w-3 mr-1" />
                Licensed
              </Badge>
              <span className="text-sm">Ministry of Health verified</span>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-green-600" />
              <span className="text-sm">Traditional medicine available</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm">24/7 availability</span>
            </div>
          </div>
        </Card>

        {/* Call to Action */}
        <Card className="p-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold">Claim Your Pharmacy</h3>
            <p className="text-purple-100">
              Join our network and help customers find your medicines
            </p>
            <Button size="lg" variant="secondary">
              <Plus className="h-4 w-4 mr-2" />
              Claim Pharmacy
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};