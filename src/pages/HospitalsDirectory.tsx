import React, { useState, useEffect } from 'react';
import { Plus, Search, MapPin, Filter, Phone, Globe, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { HospitalCard } from '@/components/hospitals/HospitalCard';
import { AddHospitalDialog } from '@/components/hospitals/AddHospitalDialog';
import { HospitalRatingDialog } from '@/components/hospitals/HospitalRatingDialog';
import { HospitalDetailsDialog } from '@/components/hospitals/HospitalDetailsDialog';

interface Hospital {
  id: string;
  name: string;
  type: string;
  ownership: string;
  region: string;
  division: string;
  village_or_city: string;
  emergency_services: boolean;
  working_hours?: string;
  services_offered?: string[];
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  verification_status: string;
  overall_rating: number;
  total_ratings: number;
  created_at: string;
}

export default function HospitalsDirectory() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedOwnership, setSelectedOwnership] = useState<string>('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRateDialog, setShowRateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const { toast } = useToast();

  const cameroonRegions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const hospitalTypes = [
    'general', 'private_clinic', 'district', 'diagnostic_center', 'emergency', 'traditional'
  ];

  const ownershipTypes = [
    'government', 'private', 'community', 'mission', 'ngo'
  ];

  const fetchHospitals = async () => {
    try {
      let query = supabase
        .from('hospitals')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,village_or_city.ilike.%${searchQuery}%,division.ilike.%${searchQuery}%`);
      }

      if (selectedRegion) {
        query = query.eq('region', selectedRegion);
      }

      if (selectedType) {
        query = query.eq('type', selectedType as any);
      }

      if (selectedOwnership) {
        query = query.eq('ownership', selectedOwnership as any);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching hospitals:', error);
        toast({
          title: 'Error',
          description: 'Failed to load hospitals',
          variant: 'destructive',
        });
        return;
      }

      setHospitals(data || []);
    } catch (error) {
      console.error('Error in fetchHospitals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load hospitals',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [searchQuery, selectedRegion, selectedType, selectedOwnership]);

  const handleViewDetails = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setShowDetailsDialog(true);
  };

  const handleRateHospital = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setShowRateDialog(true);
  };

  const handleHospitalAdded = () => {
    setShowAddDialog(false);
    fetchHospitals();
    toast({
      title: 'Success',
      description: 'Hospital added successfully!',
    });
  };

  const handleRatingAdded = () => {
    setShowRateDialog(false);
    fetchHospitals();
    toast({
      title: 'Success',
      description: 'Rating submitted successfully!',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-full">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Hospitals Directory
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover and rate healthcare facilities across Cameroon. Help others find quality medical care in their communities.
          </p>
        </div>

        {/* Search and Filters */}
        <Card variant="civic" className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search hospitals, cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Region Filter */}
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Regions</SelectItem>
                {cameroonRegions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {hospitalTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Add Hospital Button */}
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Hospital
            </Button>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card variant="civic">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{hospitals.length}</div>
              <div className="text-sm text-muted-foreground">Total Hospitals</div>
            </CardContent>
          </Card>
          <Card variant="civic">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">
                {hospitals.filter(h => h.verification_status === 'verified').length}
              </div>
              <div className="text-sm text-muted-foreground">Verified</div>
            </CardContent>
          </Card>
          <Card variant="civic">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">
                {hospitals.filter(h => h.emergency_services).length}
              </div>
              <div className="text-sm text-muted-foreground">Emergency Services</div>
            </CardContent>
          </Card>
          <Card variant="civic">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">
                {hospitals.filter(h => h.overall_rating > 0).length}
              </div>
              <div className="text-sm text-muted-foreground">Rated Hospitals</div>
            </CardContent>
          </Card>
        </div>

        {/* Hospitals Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : hospitals.length === 0 ? (
          <Card variant="civic" className="p-8 text-center">
            <div className="space-y-4">
              <Plus className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-semibold">No hospitals found</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedRegion || selectedType || selectedOwnership
                  ? "Try adjusting your search criteria"
                  : "Be the first to add a hospital to the directory"}
              </p>
              <Button 
                onClick={() => setShowAddDialog(true)}
                variant="outline"
              >
                Add First Hospital
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitals.map((hospital) => (
              <HospitalCard
                key={hospital.id}
                hospital={hospital}
                onViewDetails={handleViewDetails}
                onRate={handleRateHospital}
              />
            ))}
          </div>
        )}

        {/* Dialogs */}
        <AddHospitalDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onHospitalAdded={handleHospitalAdded}
        />

        {selectedHospital && (
          <>
            <HospitalRatingDialog
              open={showRateDialog}
              onOpenChange={setShowRateDialog}
              hospital={selectedHospital}
              onRatingAdded={handleRatingAdded}
            />

            <HospitalDetailsDialog
              open={showDetailsDialog}
              onOpenChange={setShowDetailsDialog}
              hospital={selectedHospital}
              onRate={() => {
                setShowDetailsDialog(false);
                setShowRateDialog(true);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}