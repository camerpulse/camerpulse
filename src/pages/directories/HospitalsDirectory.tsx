import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Phone, Heart, Users, Star, Plus, AlertTriangle, Clock, Shield, CheckCircle } from "lucide-react";

// Mock data for hospitals
const mockHospitals = [
  {
    id: "1",
    name: "Yaounde General Hospital",
    hospital_type: "general",
    region: "Centre",
    city: "Yaounde",
    is_verified: true,
    is_24_hours: true,
    average_rating: 4.3,
    total_ratings: 45,
    bed_capacity: 500,
    description: "Major public hospital serving the capital region",
    specializations: ["emergency", "surgery", "maternity", "pediatrics"],
    services: ["emergency", "surgery", "pharmacy", "laboratory"],
    emergency_number: "117",
    accepts_insurance: true
  },
  {
    id: "2", 
    name: "Bamenda Regional Hospital",
    hospital_type: "general",
    region: "Northwest",
    city: "Bamenda",
    is_verified: true,
    is_24_hours: true,
    average_rating: 4.1,
    total_ratings: 32,
    bed_capacity: 300,
    description: "Main regional hospital for Northwest region",
    specializations: ["general_medicine", "surgery", "obstetrics"],
    services: ["emergency", "outpatient", "pharmacy"],
    emergency_number: "117",
    accepts_insurance: true
  },
  {
    id: "3",
    name: "Douala Laquintinie Hospital",
    hospital_type: "specialized",
    region: "Littoral",
    city: "Douala",
    is_verified: true,
    is_24_hours: true,
    average_rating: 4.6,
    total_ratings: 78,
    bed_capacity: 400,
    description: "Leading specialized medical center in Douala",
    specializations: ["cardiology", "neurology", "oncology"],
    services: ["emergency", "surgery", "intensive_care", "radiology"],
    emergency_number: "117",
    accepts_insurance: true
  }
];

export default function HospitalsDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");

  const filteredHospitals = mockHospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospital.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || hospital.hospital_type === selectedType;
    const matchesRegion = selectedRegion === "all" || hospital.region === selectedRegion;
    return matchesSearch && matchesType && matchesRegion;
  });

  const emergencyHospitals = mockHospitals.filter(hospital => 
    hospital.is_24_hours && hospital.services.includes("emergency")
  );

  const topRatedHospitals = mockHospitals
    .filter(hospital => hospital.total_ratings > 0)
    .sort((a, b) => b.average_rating - a.average_rating)
    .slice(0, 6);

  const regions = Array.from(new Set(mockHospitals.map(hospital => hospital.region)));
  const hospitalTypes = Array.from(new Set(mockHospitals.map(hospital => hospital.hospital_type)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="h-12 w-12" />
            <h1 className="text-4xl md:text-5xl font-bold">Hospitals Directory</h1>
          </div>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Find quality healthcare facilities across Cameroon. Emergency services, specialized care, and trusted medical institutions at your fingertips.
          </p>
          
          {/* Emergency Alert */}
          <div className="bg-red-700 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-semibold">Emergency Services</span>
            </div>
            <p>For medical emergencies, call 117 or visit the nearest 24-hour hospital listed below.</p>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg p-4 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search hospitals or cities..."
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
                {hospitalTypes.map(type => (
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
        {/* Emergency Map Locator */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            Emergency 24/7 Hospitals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {emergencyHospitals.map(hospital => (
              <Card key={hospital.id} className="border-red-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {hospital.name}
                        <Badge variant="destructive" className="text-xs">24/7</Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {hospital.city}, {hospital.region}
                      </CardDescription>
                    </div>
                    {hospital.is_verified && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-red-500" />
                      <span className="font-semibold">Emergency: {hospital.emergency_number}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4" />
                      {hospital.bed_capacity} beds
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {hospital.services.slice(0, 3).map(service => (
                        <Badge key={service} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Add Hospital CTA */}
        <div className="mb-8 text-center">
          <Card className="inline-block">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Is your hospital missing?</h3>
              <p className="text-muted-foreground mb-4">Add your healthcare facility to help patients find you</p>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your Hospital
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Hospital Type Tabs */}
        <Tabs value={selectedType} onValueChange={setSelectedType} className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Hospitals</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="specialized">Specialized</TabsTrigger>
            <TabsTrigger value="clinic">Clinics</TabsTrigger>
            <TabsTrigger value="health_center">Health Centers</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Top Rated Hospitals */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Top Rated Hospitals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topRatedHospitals.map(hospital => (
              <Card key={hospital.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{hospital.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {hospital.city}, {hospital.region}
                      </CardDescription>
                    </div>
                    {hospital.is_verified && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{hospital.hospital_type}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{hospital.average_rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">
                          ({hospital.total_ratings} reviews)
                        </span>
                      </div>
                    </div>
                    
                    {hospital.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {hospital.description}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {hospital.bed_capacity} beds
                      </div>
                      {hospital.is_24_hours && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          24/7
                        </div>
                      )}
                      {hospital.accepts_insurance && (
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Insurance
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {hospital.specializations.slice(0, 3).map(spec => (
                        <Badge key={spec} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {hospital.specializations.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{hospital.specializations.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* All Hospitals Results */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              All Hospitals ({filteredHospitals.length})
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHospitals.map(hospital => (
              <Card key={hospital.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{hospital.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {hospital.city}, {hospital.region}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      {hospital.is_24_hours && (
                        <Badge variant="destructive" className="text-xs">24/7</Badge>
                      )}
                      {hospital.is_verified && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{hospital.hospital_type}</Badge>
                      {hospital.total_ratings > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{hospital.average_rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    
                    {hospital.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {hospital.description}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {hospital.bed_capacity} beds
                      </div>
                      {hospital.emergency_number && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-red-500" />
                          Emergency
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {hospital.services.slice(0, 3).map(service => (
                        <Badge key={service} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                      {hospital.services.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{hospital.services.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Rating Explainer */}
        <div className="mt-12 bg-red-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Healthcare Quality Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium">Verified Hospital</div>
                <div className="text-muted-foreground">Confirmed by Ministry of Health</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">24/7</Badge>
              <div>
                <div className="font-medium">Emergency Services</div>
                <div className="text-muted-foreground">Round-the-clock emergency care</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-medium">Insurance Accepted</div>
                <div className="text-muted-foreground">Accepts health insurance plans</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}