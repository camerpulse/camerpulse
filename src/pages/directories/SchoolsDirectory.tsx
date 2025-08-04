import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Phone, GraduationCap, Users, Star, Plus, BookOpen, Globe, CheckCircle } from "lucide-react";

// Mock data that matches the expected structure
const mockSchools = [
  {
    id: "1",
    name: "École Primaire de Yaoundé",
    school_type: "primary",
    region: "Centre",
    village_or_city: "Yaoundé",
    verification_status: "verified" as const,
    average_rating: 4.5,
    total_ratings: 25,
    current_enrollment: 450,
    description: "A well-established primary school in the heart of Yaoundé",
    features: ["library", "computer_lab", "sports_field"],
    languages_of_instruction: ["French", "English"]
  },
  {
    id: "2", 
    name: "Government High School Bamenda",
    school_type: "secondary",
    region: "Northwest",
    village_or_city: "Bamenda",
    verification_status: "verified" as const,
    average_rating: 4.2,
    total_ratings: 18,
    current_enrollment: 800,
    description: "Premier secondary education institution in Bamenda",
    features: ["science_lab", "library", "sports_complex"],
    languages_of_instruction: ["English", "French"]
  },
  {
    id: "3",
    name: "University of Buea",
    school_type: "university", 
    region: "Southwest",
    village_or_city: "Buea",
    verification_status: "verified" as const,
    average_rating: 4.7,
    total_ratings: 52,
    current_enrollment: 15000,
    description: "Leading anglophone university in Cameroon",
    features: ["research_center", "library", "hostels", "medical_center"],
    languages_of_instruction: ["English"]
  }
];

export default function SchoolsDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");

  const filteredSchools = mockSchools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.village_or_city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || school.school_type === selectedType;
    const matchesRegion = selectedRegion === "all" || school.region === selectedRegion;
    return matchesSearch && matchesType && matchesRegion;
  });

  const featuredSchools = mockSchools.filter(school => 
    school.verification_status === "verified" && school.average_rating >= 4.0
  ).slice(0, 4);

  const topRatedSchools = mockSchools
    .filter(school => school.total_ratings > 0)
    .sort((a, b) => b.average_rating - a.average_rating)
    .slice(0, 6);

  const regions = Array.from(new Set(mockSchools.map(school => school.region)));
  const schoolTypes = Array.from(new Set(mockSchools.map(school => school.school_type)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap className="h-12 w-12" />
            <h1 className="text-4xl md:text-5xl font-bold">Schools Directory</h1>
          </div>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Discover quality educational institutions across Cameroon. Find schools, compare ratings, and make informed decisions for your child's education.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg p-4 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search schools or cities..."
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
                {schoolTypes.map(type => (
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
        {/* Add School CTA */}
        <div className="mb-8 text-center">
          <Card className="inline-block">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Is your school missing?</h3>
              <p className="text-muted-foreground mb-4">Add your school to our directory and reach more families</p>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your School
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Featured Schools Slider */}
        {featuredSchools.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-500" />
              Featured Schools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredSchools.map(school => (
                <Card key={school.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{school.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {school.village_or_city}, {school.region}
                        </CardDescription>
                      </div>
                      {school.verification_status === "verified" && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Badge variant="secondary">{school.school_type}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{school.average_rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">
                          ({school.total_ratings} reviews)
                        </span>
                      </div>
                      {school.current_enrollment && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4" />
                          {school.current_enrollment} students
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* School Type Tabs */}
        <Tabs value={selectedType} onValueChange={setSelectedType} className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Schools</TabsTrigger>
            <TabsTrigger value="primary">Primary</TabsTrigger>
            <TabsTrigger value="secondary">Secondary</TabsTrigger>
            <TabsTrigger value="university">University</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* All Schools Results */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              All Schools ({filteredSchools.length})
            </h2>
          </div>
          
          {filteredSchools.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No schools found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or add the first school in this area.
                </p>
                <Button className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Add School
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchools.map(school => (
                <Card key={school.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{school.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {school.village_or_city}, {school.region}
                        </CardDescription>
                      </div>
                      {school.verification_status === "verified" && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{school.school_type}</Badge>
                        {school.total_ratings > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">{school.average_rating.toFixed(1)}</span>
                            <span className="text-sm text-muted-foreground">
                              ({school.total_ratings})
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {school.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {school.description}
                        </p>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {school.current_enrollment && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {school.current_enrollment}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {school.languages_of_instruction.join(", ")}
                        </div>
                      </div>
                      
                      {school.features.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {school.features.slice(0, 3).map(feature => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {school.features.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{school.features.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Verification Legend */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Verification Badge Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium">Verified School</div>
                <div className="text-muted-foreground">Confirmed by government or community</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="font-medium">Rated School</div>
                <div className="text-muted-foreground">Has parent and student reviews</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Featured</Badge>
              <div>
                <div className="font-medium">Featured Schools</div>
                <div className="text-muted-foreground">Top-rated and verified institutions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}