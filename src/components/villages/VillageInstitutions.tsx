import React, { useState, useEffect } from 'react';
import { 
  Building2, GraduationCap, Hospital, Store, Church, 
  MapPin, Phone, Globe, Clock, Star, Plus, Search,
  Users, Briefcase, Shield, Landmark
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface VillageInstitutionsProps {
  village: any;
}

interface Institution {
  id: string;
  name: string;
  type: string;
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  status: string;
}

export const VillageInstitutions: React.FC<VillageInstitutionsProps> = ({ village }) => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const institutionTypes = [
    { id: 'all', name: 'All', icon: Building2, color: 'text-blue-600' },
    { id: 'schools', name: 'Schools', icon: GraduationCap, color: 'text-green-600' },
    { id: 'hospitals', name: 'Health Centers', icon: Hospital, color: 'text-red-600' },
    { id: 'businesses', name: 'Businesses', icon: Store, color: 'text-purple-600' },
    { id: 'religious', name: 'Religious', icon: Church, color: 'text-yellow-600' },
    { id: 'government', name: 'Government', icon: Landmark, color: 'text-indigo-600' },
    { id: 'associations', name: 'Associations', icon: Users, color: 'text-pink-600' },
  ];

  useEffect(() => {
    fetchInstitutions();
  }, [village.id]);

  const fetchInstitutions = async () => {
    try {
      // Fetch from multiple tables based on location
      const [schoolsResponse, hospitalsResponse, businessesResponse] = await Promise.all([
        supabase
          .from('schools')
          .select('*')
          .ilike('village_or_city', `%${village.village_name}%`),
        supabase
          .from('hospitals')
          .select('*')
          .ilike('village_or_city', `%${village.village_name}%`),
        supabase
          .from('institutions')
          .select('*')
          .eq('village_id', village.id)
      ]);

      const allInstitutions = [
        ...(schoolsResponse.data || []).map(school => ({ ...school, type: 'schools' })),
        ...(hospitalsResponse.data || []).map(hospital => ({ ...hospital, type: 'hospitals' })),
        ...(businessesResponse.data || [])
      ];

      setInstitutions(allInstitutions);
    } catch (error) {
      console.error('Error fetching institutions:', error);
      toast.error('Failed to load institutions');
    } finally {
      setLoading(false);
    }
  };

  const filteredInstitutions = institutions.filter(institution => {
    const matchesSearch = !searchTerm || 
      institution.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || institution.type === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getInstitutionIcon = (type: string) => {
    const typeConfig = institutionTypes.find(t => t.id === type);
    const IconComponent = typeConfig?.icon || Building2;
    return <IconComponent className={`h-5 w-5 ${typeConfig?.color || 'text-gray-600'}`} />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="default" className="bg-green-100 text-green-800">Verified</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">Unverified</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-20 bg-muted rounded" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Building2 className="h-6 w-6 mr-2" />
            Village Directory
          </h2>
          <p className="text-muted-foreground">
            Discover schools, hospitals, businesses and other institutions in {village.village_name}
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Institution
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search institutions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex flex-wrap justify-center gap-1 h-auto p-1 bg-muted">
          {institutionTypes.map((type) => {
            const IconComponent = type.icon;
            const count = type.id === 'all' 
              ? institutions.length 
              : institutions.filter(inst => inst.type === type.id).length;
            
            return (
              <TabsTrigger key={type.id} value={type.id} className="flex items-center gap-1 px-3 py-2 text-sm">
                <IconComponent className="h-4 w-4" />
                <span className="hidden sm:inline">{type.name}</span>
                <Badge variant="secondary" className="text-xs ml-1">
                  {count}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeCategory} className="space-y-4">
          {filteredInstitutions.length === 0 ? (
            <Card className="text-center p-12">
              <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No institutions found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : `No ${activeCategory === 'all' ? 'institutions' : activeCategory} registered yet`
                }
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add First Institution
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInstitutions.map((institution) => (
                <Card key={institution.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getInstitutionIcon(institution.type)}
                        <CardTitle className="text-lg">{institution.name}</CardTitle>
                      </div>
                      {getStatusBadge(institution.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {institution.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {institution.description}
                      </p>
                    )}

                    <div className="space-y-2">
                      {institution.address && (
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{institution.address}</span>
                        </div>
                      )}
                      
                      {institution.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                          <a href={`tel:${institution.phone}`} className="hover:text-primary">
                            {institution.phone}
                          </a>
                        </div>
                      )}

                      {institution.website && (
                        <div className="flex items-center text-sm">
                          <Globe className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                          <a 
                            href={institution.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-primary truncate"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}

                      {institution.rating && (
                        <div className="flex items-center text-sm">
                          <Star className="h-4 w-4 mr-2 text-yellow-500 fill-current" />
                          <span>{institution.rating.toFixed(1)} / 5.0</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {institutionTypes.slice(1, 5).map((type) => {
          const count = institutions.filter(inst => inst.type === type.id).length;
          const IconComponent = type.icon;
          
          return (
            <Card key={type.id} className="text-center p-4">
              <IconComponent className={`h-8 w-8 mx-auto mb-2 ${type.color}`} />
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-sm text-muted-foreground">{type.name}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};