import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PharmacyCard } from "@/components/pharmacies/PharmacyCard";
import { AddPharmacyDialog } from "@/components/pharmacies/AddPharmacyDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Pill, 
  Plus, 
  Search, 
  MapPin, 
  Shield, 
  Clock, 
  Truck, 
  Star, 
  CheckCircle, 
  AlertTriangle,
  Leaf,
  Heart,
  Globe,
  ChevronRight,
  Building,
  TrendingUp,
  Award,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Pharmacy {
  id: string;
  name: string;
  type: string;
  license_number: string | null;
  pharmacist_in_charge: string | null;
  region: string;
  division: string;
  village_or_city: string;
  working_hours: string | null;
  delivery_available: boolean;
  photo_gallery: string[];
  contact_info: any;
  status: string;
  overall_rating: number;
  total_ratings: number;
  created_at: string;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  pharmacy_name: string;
  category: string;
  date: string;
}

interface MedicineAvailability {
  medicine: string;
  available_pharmacies: number;
  last_updated: string;
}

export default function PharmaciesDirectory() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [featuredPharmacies, setFeaturedPharmacies] = useState<Pharmacy[]>([]);
  const [topRatedPharmacies, setTopRatedPharmacies] = useState<Pharmacy[]>([]);
  const [featuredHerbalShops, setFeaturedHerbalShops] = useState<Pharmacy[]>([]);
  const [healthNews, setHealthNews] = useState<NewsItem[]>([]);
  const [medicineSearch, setMedicineSearch] = useState("");
  const [medicineAvailability, setMedicineAvailability] = useState<MedicineAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [deliveryFilter, setDeliveryFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const cameroonRegions = [
    "Adamawa", "Centre", "East", "Far North", "Littoral", 
    "North", "Northwest", "South", "Southwest", "West"
  ];

  const pharmacyTypes = [
    { value: "registered_pharmacy", label: "Registered Pharmacy", icon: "💊" },
    { value: "otc_store", label: "OTC Store", icon: "🏪" },
    { value: "herbal_shop", label: "Herbal Shop", icon: "🌿" },
    { value: "hospital_linked", label: "Hospital Linked", icon: "🏥" }
  ];

  useEffect(() => {
    fetchPharmacies();
    fetchFeaturedPharmacies();
    fetchTopRatedPharmacies();
    fetchFeaturedHerbalShops();
    fetchHealthNews();
    fetchMedicineAvailability();
  }, []);

  const fetchPharmacies = async () => {
    try {
      const { data, error } = await supabase
        .from("pharmacies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPharmacies(data || []);
    } catch (error) {
      console.error("Error fetching pharmacies:", error);
      toast({
        title: "Error",
        description: "Failed to load pharmacies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedPharmacies = async () => {
    try {
      const { data, error } = await supabase
        .from("pharmacies")
        .select("*")
        .eq("status", "verified")
        .order("overall_rating", { ascending: false })
        .limit(6);

      if (error) throw error;
      setFeaturedPharmacies(data || []);
    } catch (error) {
      console.error("Error fetching featured pharmacies:", error);
    }
  };

  const fetchTopRatedPharmacies = async () => {
    try {
      const { data, error } = await supabase
        .from("pharmacies")
        .select("*")
        .gte("overall_rating", 4.0)
        .order("overall_rating", { ascending: false })
        .limit(8);

      if (error) throw error;
      setTopRatedPharmacies(data || []);
    } catch (error) {
      console.error("Error fetching top rated pharmacies:", error);
    }
  };

  const fetchFeaturedHerbalShops = async () => {
    try {
      const { data, error } = await supabase
        .from("pharmacies")
        .select("*")
        .eq("type", "herbal_shop")
        .order("overall_rating", { ascending: false })
        .limit(6);

      if (error) throw error;
      setFeaturedHerbalShops(data || []);
    } catch (error) {
      console.error("Error fetching herbal shops:", error);
    }
  };

  const fetchHealthNews = async () => {
    // Mock health news data
    const mockNews: NewsItem[] = [
      {
        id: '1',
        title: 'New Antimalarial Drug Now Available Nationwide',
        summary: 'Latest WHO-approved treatment reaches all major pharmacies',
        pharmacy_name: 'Ministry of Health',
        category: 'Medicine',
        date: '2024-01-15'
      },
      {
        id: '2',
        title: 'Traditional Medicine Research Shows Promising Results',
        summary: 'Local herbal remedies prove effective in clinical trials',
        pharmacy_name: 'Cameroon Traditional Medicine Institute',
        category: 'Research',
        date: '2024-01-12'
      },
      {
        id: '3',
        title: 'Mobile Pharmacy Services Expand to Rural Areas',
        summary: 'New delivery network brings medicines to remote villages',
        pharmacy_name: 'CamerHealth Network',
        category: 'Access',
        date: '2024-01-10'
      }
    ];
    setHealthNews(mockNews);
  };

  const fetchMedicineAvailability = async () => {
    // Mock medicine availability data
    const mockAvailability: MedicineAvailability[] = [
      { medicine: "Paracetamol", available_pharmacies: 45, last_updated: "2024-01-15" },
      { medicine: "Amoxicillin", available_pharmacies: 32, last_updated: "2024-01-15" },
      { medicine: "Artemether-Lumefantrine", available_pharmacies: 28, last_updated: "2024-01-14" },
      { medicine: "Metformin", available_pharmacies: 25, last_updated: "2024-01-14" },
      { medicine: "Ibuprofen", available_pharmacies: 38, last_updated: "2024-01-15" }
    ];
    setMedicineAvailability(mockAvailability);
  };

  const filteredPharmacies = pharmacies.filter((pharmacy) => {
    const matchesSearch = pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pharmacy.village_or_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pharmacy.division.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === "all" || pharmacy.region === selectedRegion;
    const matchesType = selectedType === "all" || pharmacy.type === selectedType;
    const matchesDelivery = deliveryFilter === "all" || 
                           (deliveryFilter === "delivery" && pharmacy.delivery_available) ||
                           (deliveryFilter === "no_delivery" && !pharmacy.delivery_available);
    
    return matchesSearch && matchesRegion && matchesType && matchesDelivery;
  });

  const getPharmaciesByType = (type: string) => {
    if (type === "all") return filteredPharmacies;
    return filteredPharmacies.filter(pharmacy => pharmacy.type === type);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const searchMedicine = () => {
    if (medicineSearch.trim()) {
      toast({
        title: "Medicine Search",
        description: `Searching for "${medicineSearch}" across all pharmacies...`,
      });
      // In real implementation, this would search the medicine database
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Pill className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p>Loading pharmacies...</p>
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Pill className="h-10 w-10" />
                <h1 className="text-4xl font-bold">Pharmacies Directory</h1>
              </div>
              <p className="text-xl opacity-90 max-w-2xl mx-auto mb-6">
                Find licensed pharmacies, check medicine availability, and discover traditional herbal shops across Cameroon
              </p>
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span>{pharmacies.length} Pharmacies</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span>{pharmacies.filter(p => p.delivery_available).length} Delivery Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>{pharmacies.filter(p => p.status === 'verified').length} Licensed</span>
                </div>
              </div>
            </div>

            {/* Medicine Availability Search */}
            <div className="max-w-4xl mx-auto mb-6">
              <Alert className="mb-4 bg-green-100 border-green-200">
                <Heart className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Need specific medicine?</strong> Search availability across all registered pharmacies in real-time.
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search for specific medicine (e.g., Paracetamol, Amoxicillin)..."
                    value={medicineSearch}
                    onChange={(e) => setMedicineSearch(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70"
                    onKeyPress={(e) => e.key === 'Enter' && searchMedicine()}
                  />
                </div>
                <Button
                  onClick={searchMedicine}
                  className="bg-white text-green-600 hover:bg-white/90"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Find Medicine
                </Button>
              </div>

              {/* Quick Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {cameroonRegions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {pharmacyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={deliveryFilter} onValueChange={setDeliveryFilter}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Delivery Options" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Options</SelectItem>
                    <SelectItem value="delivery">Delivery Available</SelectItem>
                    <SelectItem value="no_delivery">No Delivery</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-white text-green-600 hover:bg-white/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Pharmacy
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Medicine Availability Widget */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Pill className="h-6 w-6 text-primary" />
              Popular Medicine Availability
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {medicineAvailability.map((item) => (
                <Card key={item.medicine} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-2">{item.medicine}</h3>
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">{item.available_pharmacies} pharmacies</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Updated: {item.last_updated}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Location-based Recommendations */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" />
                Pharmacies Near You
              </h2>
              <Button variant="outline" size="sm">
                <MapPin className="h-4 w-4 mr-1" />
                Enable Location
              </Button>
            </div>
            <Alert className="mb-6">
              <MapPin className="h-4 w-4" />
              <AlertDescription>
                Enable location services to see nearby pharmacies and check medicine availability in your area.
              </AlertDescription>
            </Alert>
          </section>

          {/* Top Rated Pharmacies */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Top Rated Pharmacies
              </h2>
              <Button variant="outline" size="sm">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {topRatedPharmacies.slice(0, 8).map((pharmacy) => (
                <Card key={pharmacy.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-1 mb-2">
                      {renderStars(pharmacy.overall_rating)}
                      <span className="text-sm font-medium ml-1">
                        {pharmacy.overall_rating.toFixed(1)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{pharmacy.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {pharmacy.village_or_city}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {pharmacy.total_ratings} ratings
                      </Badge>
                      {pharmacy.delivery_available && (
                        <Badge variant="secondary" className="text-xs">
                          <Truck className="h-3 w-3 mr-1" />
                          Delivery
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Featured Herbal Shops */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Leaf className="h-6 w-6 text-green-600" />
                Featured Traditional Medicine
              </h2>
              <Button variant="outline" size="sm">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredHerbalShops.map((shop) => (
                <Card key={shop.id} className="hover:shadow-lg transition-shadow border-green-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          {shop.name}
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            <Leaf className="h-3 w-3 mr-1" />
                            Herbal
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {shop.village_or_city}, {shop.region}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(shop.overall_rating)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span>Traditional Medicine</span>
                      {shop.status === 'verified' && (
                        <Badge variant="default" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Licensed
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Pharmacy Type Tabs */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Building className="h-6 w-6 text-primary" />
              Browse by Pharmacy Type
            </h2>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                {pharmacyTypes.map(type => (
                  <TabsTrigger key={type.value} value={type.value}>
                    <span className="hidden sm:inline">{type.icon}</span>
                    <span className="ml-1 text-xs">{type.label.split(' ')[0]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value="all">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {getPharmaciesByType('all').slice(0, 9).map((pharmacy) => (
                    <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} onUpdate={fetchPharmacies} />
                  ))}
                </div>
              </TabsContent>
              
              {pharmacyTypes.map(type => (
                <TabsContent key={type.value} value={type.value}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {getPharmaciesByType(type.value).slice(0, 9).map((pharmacy) => (
                      <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} onUpdate={fetchPharmacies} />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </section>

          {/* Licensed Badge Meaning */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Understanding Pharmacy Licenses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <Badge variant="default">Licensed</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Verified by Ministry of Health, licensed pharmacist on duty
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <Badge variant="secondary">Pending</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Application under review by health authorities
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  <Badge variant="outline">Traditional</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Registered traditional medicine practitioner
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                  <Badge variant="outline">Community Added</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Added by community members, verification pending
                </p>
              </Card>
            </div>
          </section>

          {/* Health News Bar */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              Health & Medicine News
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {healthNews.map((news) => (
                <Card key={news.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{news.category}</Badge>
                      <span className="text-sm text-muted-foreground">{news.date}</span>
                    </div>
                    <CardTitle className="text-lg">{news.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{news.summary}</p>
                    <p className="text-sm font-medium">{news.pharmacy_name}</p>
                    <Button variant="link" className="p-0 h-auto mt-2">
                      Read More <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Claim Your Pharmacy CTA */}
          <section className="text-center py-12 bg-green-50 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Claim Your Pharmacy</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Are you a pharmacy owner? Claim your listing to manage information, respond to reviews, 
              and help patients find your services more easily.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" onClick={() => setIsAddDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-5 w-5 mr-2" />
                Add New Pharmacy
              </Button>
              <Button size="lg" variant="outline">
                <Shield className="h-5 w-5 mr-2" />
                Claim Existing Pharmacy
              </Button>
            </div>
          </section>
        </div>

        <AddPharmacyDialog 
          open={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen}
          onPharmacyAdded={fetchPharmacies}
        />
      </div>
  );
}