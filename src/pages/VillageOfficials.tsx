import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Crown, Users, Phone, Mail, MapPin, 
  Star, Award, Calendar, User, Building, Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AppLayout } from '@/components/Layout/AppLayout';

interface Official {
  id: string;
  name: string;
  position: string;
  role_type: string;
  contact_phone?: string;
  contact_email?: string;
  years_in_office?: number;
  education_background?: string;
  achievements?: string[];
  photo_url?: string;
  is_active: boolean;
  appointed_date?: string;
}

const VillageOfficials = () => {
  const { id: villageId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [village, setVillage] = useState<any>(null);
  const [officials, setOfficials] = useState<Official[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const officialCategories = [
    { value: 'all', label: 'All Officials' },
    { value: 'traditional', label: 'Traditional Leaders' },
    { value: 'administrative', label: 'Administrative' },
    { value: 'elected', label: 'Elected Representatives' },
    { value: 'appointed', label: 'Appointed Officials' }
  ];

  useEffect(() => {
    if (villageId) {
      fetchData();
    }
  }, [villageId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch village data
      const { data: villageData, error: villageError } = await supabase
        .from('villages')
        .select('id, village_name, region, division, subdivision')
        .eq('id', villageId)
        .single();

      if (villageError) throw villageError;
      setVillage(villageData);

      // Fetch officials/leaders data
      const { data: officialsData, error: officialsError } = await supabase
        .from('village_leaders')
        .select('*')
        .eq('village_id', villageId)
        .order('position');

      if (officialsError) throw officialsError;
      setOfficials(officialsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load village officials');
    } finally {
      setLoading(false);
    }
  };

  const getOfficialsByCategory = (category: string) => {
    if (category === 'all') return officials;
    return officials.filter(official => official.role_type === category);
  };

  const getRoleIcon = (roleType: string) => {
    switch (roleType) {
      case 'traditional': return <Crown className="h-5 w-5" />;
      case 'administrative': return <Building className="h-5 w-5" />;
      case 'elected': return <Users className="h-5 w-5" />;
      case 'appointed': return <Shield className="h-5 w-5" />;
      default: return <User className="h-5 w-5" />;
    }
  };

  const getRoleBadgeColor = (roleType: string) => {
    switch (roleType) {
      case 'traditional': return 'bg-purple-100 text-purple-800';
      case 'administrative': return 'bg-blue-100 text-blue-800';
      case 'elected': return 'bg-green-100 text-green-800';
      case 'appointed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!village) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center p-8">
            <CardContent>
              <h2 className="text-2xl font-bold mb-4">Village Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The village you're looking for doesn't exist.
              </p>
              <Link to="/villages">
                <Button>Back to Villages</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/villages/${villageId}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Village
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              Village Officials
            </h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-2">
              <MapPin className="h-4 w-4" />
              {village.village_name}, {village.subdivision}, {village.region}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            {officialCategories.map(category => (
              <TabsTrigger key={category.value} value={category.value}>
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {officialCategories.map(category => (
            <TabsContent key={category.value} value={category.value}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getOfficialsByCategory(category.value).length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Officials Found</h3>
                    <p className="text-muted-foreground">
                      No officials are registered in this category yet.
                    </p>
                  </div>
                ) : (
                  getOfficialsByCategory(category.value).map((official) => (
                    <Card key={official.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={official.photo_url} alt={official.name} />
                            <AvatarFallback className="text-lg">
                              {official.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <CardTitle className="text-xl">{official.name}</CardTitle>
                            <p className="text-muted-foreground font-medium">{official.position}</p>
                            <Badge className={getRoleBadgeColor(official.role_type)}>
                              <div className="flex items-center gap-1">
                                {getRoleIcon(official.role_type)}
                                {official.role_type}
                              </div>
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Contact Information */}
                        <div className="space-y-2">
                          {official.contact_phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{official.contact_phone}</span>
                            </div>
                          )}
                          {official.contact_email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="truncate">{official.contact_email}</span>
                            </div>
                          )}
                        </div>

                        {/* Years in Office */}
                        {official.years_in_office && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{official.years_in_office} years in office</span>
                          </div>
                        )}

                        {/* Education Background */}
                        {official.education_background && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Education</h4>
                            <p className="text-sm text-muted-foreground">{official.education_background}</p>
                          </div>
                        )}

                        {/* Achievements */}
                        {official.achievements && official.achievements.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                              <Award className="h-4 w-4" />
                              Key Achievements
                            </h4>
                            <div className="space-y-1">
                              {official.achievements.slice(0, 3).map((achievement, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  <span>{achievement}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Status */}
                        <div className="pt-2 border-t">
                          <Badge variant={official.is_active ? "default" : "secondary"}>
                            {official.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default VillageOfficials;