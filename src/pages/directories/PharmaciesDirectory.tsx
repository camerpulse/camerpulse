import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Phone, Pill, Clock, Star, Plus, Search, CheckCircle, Truck, Leaf } from "lucide-react";

// Mock data for pharmacies
const mockPharmacies = [
  {
    id: "1",
    name: "Pharmacie du Centre",
    pharmacy_type: "modern",
    region: "Centre",
    city: "Yaounde",
    is_verified: true,
    is_24_hours: true,
    average_rating: 4.4,
    total_ratings: 28,
    description: "Full-service pharmacy with wide range of medications",
    services: ["prescription", "consultation", "delivery", "blood_pressure_check"],
    medicine_categories: ["prescription", "otc", "vitamins", "medical_supplies"],
    delivery_available: true,
    delivery_radius_km: 15,
    accepts_insurance: true,
    pharmacist_name: "Dr. Marie Ngono"
  },
  {
    id: "2", 
    name: "Herbal Remedies Bamenda",
    pharmacy_type: "herbal",
    region: "Northwest",
    city: "Bamenda",
    is_verified: true,
    is_24_hours: false,
    average_rating: 4.2,
    total_ratings: 35,
    description: "Traditional herbal medicine and natural remedies",
    services: ["herbal_consultation", "traditional_medicine", "wellness_products"],
    medicine_categories: ["herbal", "traditional", "natural_supplements"],
    delivery_available: false,
    accepts_insurance: false,
    pharmacist_name: "Traditional Healer John Fru"
  },
  {
    id: "3",
    name: "Express Pharmacy Douala",
    pharmacy_type: "modern",
    region: "Littoral",
    city: "Douala",
    is_verified: true,
    is_24_hours: true,
    average_rating: 4.6,
    total_ratings: 52,
    description: "Fast service pharmacy with home delivery",
    services: ["prescription", "consultation", "delivery", "emergency_supply"],
    medicine_categories: ["prescription", "otc", "baby_care", "first_aid"],
    delivery_available: true,
    delivery_radius_km: 20,
    accepts_insurance: true,
    pharmacist_name: "Dr. Paul Essomba"
  }
];

export default function PharmaciesDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [medicineSearch, setMedicineSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");

  const filteredPharmacies = mockPharmacies.filter(pharmacy => {
    const matchesSearch = pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pharmacy.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || pharmacy.pharmacy_type === selectedType;
    const matchesRegion = selectedRegion === "all" || pharmacy.region === selectedRegion;
    return matchesSearch && matchesType && matchesRegion;
  });

  const pharmaciesWithDelivery = mockPharmacies.filter(pharmacy => 
    pharmacy.delivery_available
  );

  const topRatedPharmacies = mockPharmacies
    .filter(pharmacy => pharmacy.total_ratings > 0)
    .sort((a, b) => b.average_rating - a.average_rating)
    .slice(0, 6);

  const herbalShops = mockPharmacies.filter(pharmacy => 
    pharmacy.pharmacy_type === "herbal"
  );

  const regions = Array.from(new Set(mockPharmacies.map(pharmacy => pharmacy.region)));
  const pharmacyTypes = Array.from(new Set(mockPharmacies.map(pharmacy => pharmacy.pharmacy_type)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Pill className="h-12 w-12" />
            <h1 className="text-4xl md:text-5xl font-bold">Pharmacies Directory</h1>
          </div>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Find licensed pharmacies and traditional medicine shops across Cameroon. Check medicine availability, compare services, and get your health needs met.
          </p>
          
          {/* Medicine Availability Search */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg p-4 shadow-xl mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Check Medicine Availability</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search for medicine..."
                value={medicineSearch}
                onChange={(e) => setMedicineSearch(e.target.value)}
                className="text-gray-900"
              />
              <Button className="gap-2">
                <Search className="h-4 w-4" />
                Check Availability
              </Button>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Request Medicine
              </Button>
            </div>
          </div>
          
          {/* Main Search Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg p-4 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search pharmacies or cities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:col-span-2 text-gray-900"
              />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              >
                <option value="all">All Types</option>
                {pharmacyTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              >
                <option value="all">All Regions</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Location-based Recommendations */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Truck className="h-6 w-6 text-green-500" />
            Pharmacies with Home Delivery
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pharmaciesWithDelivery.map(pharmacy => (
              <Card key={pharmacy.id} className="border-green-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {pharmacy.name}
                        <Badge variant="secondary" className="text-xs bg-green-100">Delivery</Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {pharmacy.city}, {pharmacy.region}
                      </CardDescription>
                    </div>
                    {pharmacy.is_verified && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="h-4 w-4 text-green-500" />
                      <span>Delivery radius: {pharmacy.delivery_radius_km}km</span>
                    </div>
                    {pharmacy.is_24_hours && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>24/7 Service</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{pharmacy.average_rating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">
                        ({pharmacy.total_ratings} reviews)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Add Pharmacy CTA */}
        <div className="mb-8 text-center">
          <Card className="inline-block">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Claim Your Pharmacy</h3>
              <p className="text-muted-foreground mb-4">Add your pharmacy to help customers find you and manage your online presence</p>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Claim Your Pharmacy
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Pharmacy Type Tabs */}
        <Tabs value={selectedType} onValueChange={setSelectedType} className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Pharmacies</TabsTrigger>
            <TabsTrigger value="modern">Modern</TabsTrigger>
            <TabsTrigger value="traditional">Traditional</TabsTrigger>
            <TabsTrigger value="herbal">Herbal</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Top Rated Pharmacies */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Top Rated Pharmacies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topRatedPharmacies.map(pharmacy => (
              <Card key={pharmacy.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{pharmacy.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {pharmacy.city}, {pharmacy.region}
                      </CardDescription>
                    </div>
                    {pharmacy.is_verified && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {pharmacy.pharmacy_type === "herbal" && <Leaf className="h-3 w-3" />}
                        {pharmacy.pharmacy_type}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{pharmacy.average_rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">
                          ({pharmacy.total_ratings} reviews)
                        </span>
                      </div>
                    </div>
                    
                    {pharmacy.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {pharmacy.description}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {pharmacy.is_24_hours && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          24/7
                        </div>
                      )}
                      {pharmacy.delivery_available && (
                        <div className="flex items-center gap-1">
                          <Truck className="h-3 w-3" />
                          Delivery
                        </div>
                      )}
                      {pharmacy.pharmacist_name && (
                        <div className="text-xs text-muted-foreground col-span-2">
                          Pharmacist: {pharmacy.pharmacist_name}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {pharmacy.services.slice(0, 3).map(service => (
                        <Badge key={service} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                      {pharmacy.services.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{pharmacy.services.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured Herbal Shops */}
        {herbalShops.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Leaf className="h-6 w-6 text-green-600" />
              Traditional & Herbal Medicine
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {herbalShops.map(pharmacy => (
                <Card key={pharmacy.id} className="border-green-200 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {pharmacy.name}
                          <Leaf className="h-4 w-4 text-green-600" />
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {pharmacy.city}, {pharmacy.region}
                        </CardDescription>
                      </div>
                      {pharmacy.is_verified && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{pharmacy.average_rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">
                          ({pharmacy.total_ratings} reviews)
                        </span>
                      </div>
                      {pharmacy.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {pharmacy.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {pharmacy.medicine_categories.map(category => (
                          <Badge key={category} variant="outline" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* All Pharmacies Results */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              All Pharmacies ({filteredPharmacies.length})
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPharmacies.map(pharmacy => (
              <Card key={pharmacy.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{pharmacy.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {pharmacy.city}, {pharmacy.region}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      {pharmacy.is_24_hours && (
                        <Badge variant="secondary" className="text-xs">24/7</Badge>
                      )}
                      {pharmacy.is_verified && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {pharmacy.pharmacy_type === "herbal" && <Leaf className="h-3 w-3" />}
                        {pharmacy.pharmacy_type}
                      </Badge>
                      {pharmacy.total_ratings > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{pharmacy.average_rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    
                    {pharmacy.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {pharmacy.description}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {pharmacy.delivery_available && (
                        <div className="flex items-center gap-1">
                          <Truck className="h-3 w-3" />
                          Delivery
                        </div>
                      )}
                      {pharmacy.accepts_insurance && (
                        <div className="text-xs text-green-600">
                          Insurance accepted
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {pharmacy.services.slice(0, 3).map(service => (
                        <Badge key={service} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                      {pharmacy.services.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{pharmacy.services.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Licensed Badge Meaning */}
        <div className="mt-12 bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Pharmacy License Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium">Licensed Pharmacy</div>
                <div className="text-muted-foreground">Verified by Pharmacy Board of Cameroon</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">Traditional Medicine</div>
                <div className="text-muted-foreground">Certified traditional healers and herbal shops</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-medium">Home Delivery</div>
                <div className="text-muted-foreground">Medicines delivered to your doorstep</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}