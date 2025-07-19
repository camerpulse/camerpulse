import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PharmacyCard } from "@/components/pharmacies/PharmacyCard";
import { AddPharmacyDialog } from "@/components/pharmacies/AddPharmacyDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pill, Plus, Search, MapPin } from "lucide-react";
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

export default function PharmaciesDirectory() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [deliveryFilter, setDeliveryFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const cameroonRegions = [
    "Adamawa", "Centre", "East", "Far North", "Littoral", 
    "North", "Northwest", "South", "Southwest", "West"
  ];

  const pharmacyTypes = [
    { value: "registered_pharmacy", label: "Registered Pharmacy" },
    { value: "otc_store", label: "OTC Store" },
    { value: "herbal_shop", label: "Herbal Shop" },
    { value: "hospital_linked", label: "Hospital Linked" }
  ];

  useEffect(() => {
    fetchPharmacies();
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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Pill className="h-8 w-8 text-primary" />
            Pharmacies Directory
          </h1>
          <p className="text-muted-foreground">
            Find registered pharmacies, OTC stores, and herbal shops across Cameroon
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Pharmacy
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search pharmacies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger>
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
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {pharmacyTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={deliveryFilter} onValueChange={setDeliveryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Delivery Options" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Options</SelectItem>
            <SelectItem value="delivery">Delivery Available</SelectItem>
            <SelectItem value="no_delivery">No Delivery</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="gap-2">
          <MapPin className="h-4 w-4" />
          Map View
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-2xl font-bold text-primary">{pharmacies.length}</h3>
          <p className="text-muted-foreground">Total Pharmacies</p>
        </div>
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-2xl font-bold text-primary">
            {pharmacies.filter(p => p.status === 'verified').length}
          </h3>
          <p className="text-muted-foreground">Verified</p>
        </div>
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-2xl font-bold text-primary">
            {pharmacies.filter(p => p.delivery_available).length}
          </h3>
          <p className="text-muted-foreground">Delivery Available</p>
        </div>
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-2xl font-bold text-primary">
            {new Set(pharmacies.map(p => p.region)).size}
          </h3>
          <p className="text-muted-foreground">Regions Covered</p>
        </div>
      </div>

      {/* Results */}
      {filteredPharmacies.length === 0 ? (
        <div className="text-center py-12">
          <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No pharmacies found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or add a new pharmacy.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPharmacies.map((pharmacy) => (
            <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} onUpdate={fetchPharmacies} />
          ))}
        </div>
      )}

      <AddPharmacyDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onPharmacyAdded={fetchPharmacies}
      />
    </div>
  );
}