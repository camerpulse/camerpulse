import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  School, 
  Building2, 
  Pill, 
  TreePine, 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink,
  Search,
  Filter,
  Shield,
  User,
  Crown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ClaimInstitutionDialog } from '@/components/directory/ClaimInstitutionDialog';

interface Institution {
  id: string;
  name: string;
  institution_type: string;
  description?: string;
  address?: string;
  region?: string;
  email?: string;
  phone?: string;
  website?: string;
  city?: string;
  is_verified: boolean;
  claimed_by?: string;
  claim_status?: string;
  is_active: boolean;
  average_rating?: number;
}

interface InstitutionClaim {
  id: string;
  institution_id: string;
  status: string;
  created_at: string;
}

const institutionTypeIcons = {
  school: School,
  hospital: Building2,
  pharmacy: Pill,
  village: TreePine,
  government: Building2,
  business: Building2
};

const institutionTypeColors = {
  school: 'bg-blue-100 text-blue-800',
  hospital: 'bg-red-100 text-red-800',
  pharmacy: 'bg-green-100 text-green-800',
  village: 'bg-amber-100 text-amber-800',
  government: 'bg-purple-100 text-purple-800',
  business: 'bg-gray-100 text-gray-800'
};

export default function InstitutionDirectory() {
  const { toast } = useToast();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [userClaims, setUserClaims] = useState<InstitutionClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);

  const regions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  useEffect(() => {
    loadInstitutions();
    loadUserClaims();
  }, []);

  const loadInstitutions = async () => {
    try {
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setInstitutions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load institutions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserClaims = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('institution_claims')
        .select('id, institution_id, status, created_at')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserClaims(data || []);
    } catch (error: any) {
      console.error('Error loading user claims:', error);
    }
  };

  const filteredInstitutions = institutions.filter(institution => {
    const matchesType = selectedType === 'all' || institution.institution_type === selectedType;
    const matchesRegion = selectedRegion === 'all' || institution.region === selectedRegion;
    const matchesSearch = !searchQuery || 
      institution.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      institution.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      institution.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      institution.city?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesRegion && matchesSearch;
  });

  const handleClaimInstitution = (institution: Institution) => {
    setSelectedInstitution(institution);
    setClaimDialogOpen(true);
  };

  const getUserClaimForInstitution = (institutionId: string) => {
    return userClaims.find(claim => claim.institution_id === institutionId);
  };

  const renderInstitutionCard = (institution: Institution) => {
    const IconComponent = institutionTypeIcons[institution.institution_type as keyof typeof institutionTypeIcons] || Building2;
    const typeColor = institutionTypeColors[institution.institution_type as keyof typeof institutionTypeColors] || 'bg-gray-100 text-gray-800';
    const userClaim = getUserClaimForInstitution(institution.id);
    const isVerified = institution.is_verified;
    const isClaimed = institution.claimed_by && institution.claim_status === 'verified';

    return (
      <Card key={institution.id} className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <IconComponent className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {institution.name}
                  {isVerified && (
                    <Shield className="h-4 w-4 text-blue-600" />
                  )}
                  {isClaimed && (
                    <Crown className="h-4 w-4 text-amber-600" />
                  )}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={typeColor}>
                    {institution.institution_type.charAt(0).toUpperCase() + institution.institution_type.slice(1)}
                  </Badge>
                  {institution.region && (
                    <Badge variant="outline" className="text-xs">
                      {institution.region}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {userClaim ? (
              <Badge 
                variant={userClaim.status === 'verified' ? 'default' : 'secondary'}
                className="capitalize"
              >
                {userClaim.status}
              </Badge>
            ) : !isClaimed && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleClaimInstitution(institution)}
                className="flex items-center gap-1"
              >
                <User className="h-3 w-3" />
                Claim
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {institution.description && (
            <CardDescription className="text-sm">
              {institution.description}
            </CardDescription>
          )}

          <div className="space-y-2">
            {(institution.address || institution.city) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {institution.address || institution.city}
              </div>
            )}
            
            {institution.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {institution.email}
              </div>
            )}
            
            {institution.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                {institution.phone}
              </div>
            )}
          </div>

          {institution.website && (
            <div className="pt-2">
              <a 
                href={institution.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Visit Website
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading institutions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Institution Directory</h1>
          <p className="text-muted-foreground">
            Discover and connect with schools, hospitals, pharmacies, and villages across Cameroon
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search institutions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Institution Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="school">Schools</SelectItem>
                  <SelectItem value="hospital">Hospitals</SelectItem>
                  <SelectItem value="pharmacy">Pharmacies</SelectItem>
                  <SelectItem value="village">Villages</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Found {filteredInstitutions.length} institution{filteredInstitutions.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {selectedType !== 'all' && `${selectedType} • `}
              {selectedRegion !== 'all' && `${selectedRegion} • `}
              {searchQuery && `"${searchQuery}" • `}
            </span>
          </div>
        </div>

        {/* Institution Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstitutions.map(renderInstitutionCard)}
        </div>

        {filteredInstitutions.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No institutions found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}

        {/* Claim Institution Dialog */}
        <ClaimInstitutionDialog
          institution={selectedInstitution}
          open={claimDialogOpen}
          onOpenChange={setClaimDialogOpen}
          onClaimSubmitted={() => {
            loadUserClaims();
            setClaimDialogOpen(false);
          }}
        />
      </div>
    </div>
  );
}