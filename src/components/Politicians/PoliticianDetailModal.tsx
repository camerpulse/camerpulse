import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Star,
  MapPin,
  Calendar,
  Phone,
  Globe,
  Mail,
  UserCheck,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Users,
  Building,
  GraduationCap,
  Briefcase,
  Heart,
  MessageCircle
} from 'lucide-react';

interface PoliticianDetailModalProps {
  politicianId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface PoliticianPromise {
  id: string;
  promise_text: string;
  status: 'fulfilled' | 'unfulfilled' | 'in_progress';
  date_made?: string;
  date_updated?: string;
  evidence_url?: string;
  description?: string;
}

export const PoliticianDetailModal: React.FC<PoliticianDetailModalProps> = ({
  politicianId,
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [politician, setPolitician] = useState<any>(null);
  const [promises, setPromises] = useState<PoliticianPromise[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (politicianId && isOpen) {
      fetchPoliticianDetails();
    }
  }, [politicianId, isOpen]);

  const fetchPoliticianDetails = async () => {
    if (!politicianId) return;

    setLoading(true);
    try {
      // Fetch politician details
      const { data: politicianData, error: politicianError } = await supabase
        .from('politicians')
        .select(`
          *,
          political_parties!political_party_id (
            id,
            name,
            acronym,
            logo_url,
            official_website
          ),
          approval_ratings(rating, user_id),
          politician_detailed_ratings(
            integrity_rating,
            development_impact_rating,
            transparency_rating,
            user_id,
            comment
          ),
          politician_follows!politician_id(user_id)
        `)
        .eq('id', politicianId)
        .single();

      if (politicianError) throw politicianError;

      // Fetch promises
      const { data: promisesData, error: promisesError } = await supabase
        .from('politician_promises')
        .select('*')
        .eq('politician_id', politicianId)
        .order('date_made', { ascending: false });

      if (promisesError) throw promisesError;

      // Process politician data
      const ratings = politicianData.approval_ratings || [];
      const detailedRatings = politicianData.politician_detailed_ratings || [];
      
      const processedPolitician = {
        ...politicianData,
        average_rating: ratings.length > 0 
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
          : 0,
        total_ratings: ratings.length,
        user_rating: user ? ratings.find(r => r.user_id === user.id)?.rating : undefined,
        integrity_rating: detailedRatings.length > 0
          ? detailedRatings.reduce((sum, r) => sum + (r.integrity_rating || 0), 0) / detailedRatings.length
          : 0,
        development_impact_rating: detailedRatings.length > 0
          ? detailedRatings.reduce((sum, r) => sum + (r.development_impact_rating || 0), 0) / detailedRatings.length
          : 0,
        transparency_rating: detailedRatings.length > 0
          ? detailedRatings.reduce((sum, r) => sum + (r.transparency_rating || 0), 0) / detailedRatings.length
          : 0,
        is_following: user 
          ? politicianData.politician_follows?.some(f => f.user_id === user.id) || false
          : false,
        political_party: politicianData.political_parties
      };

      setPolitician(processedPolitician);
      setPromises((promisesData || []).map(p => ({
        ...p,
        status: p.status as 'fulfilled' | 'unfulfilled' | 'in_progress'
      })));
    } catch (error) {
      console.error('Error fetching politician details:', error);
      toast({
        title: "Error",
        description: "Unable to load politician details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPromiseStatusColor = (status: string) => {
    switch (status) {
      case 'fulfilled': return 'text-green-600 bg-green-100';
      case 'unfulfilled': return 'text-red-600 bg-red-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPromiseStatusText = (status: string) => {
    switch (status) {
      case 'fulfilled': return 'Fulfilled';
      case 'unfulfilled': return 'Unfulfilled';
      case 'in_progress': return 'En cours';
      default: return 'Inconnue';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US');
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (!politician && !loading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Politician Profile</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cameroon-primary"></div>
          </div>
        ) : politician ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={politician.profile_image_url} />
                  <AvatarFallback className="bg-cameroon-yellow text-cameroon-primary text-2xl">
                    {politician.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold">{politician.name}</h2>
                    {politician.verified && (
                      <Badge className="bg-blue-500 text-white">
                        <UserCheck className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg font-medium text-cameroon-primary mb-1">
                    {politician.role_title}
                  </p>
                  {politician.political_party && (
                    <p className="text-gray-600 mb-2">{politician.political_party.name}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {politician.region && (
                      <Badge variant="secondary">
                        <MapPin className="w-3 h-3 mr-1" />
                        {politician.region}
                      </Badge>
                    )}
                    {politician.level_of_office && (
                      <Badge variant="outline">{politician.level_of_office}</Badge>
                    )}
                    {politician.gender && (
                      <Badge variant="outline">{politician.gender}</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 md:ml-auto">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-cameroon-primary">
                    {politician.civic_score}
                  </div>
                  <div className="text-sm text-gray-600">Civic Score</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-cameroon-primary">
                    {politician.average_rating?.toFixed(1) || '0'}
                  </div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-cameroon-primary">
                    {politician.follower_count || 0}
                  </div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-cameroon-primary">
                    {promises.length}
                  </div>
                  <div className="text-sm text-gray-600">Promises</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="promises">Promises</TabsTrigger>
                <TabsTrigger value="ratings">Ratings</TabsTrigger>
                <TabsTrigger value="info">Information</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Bio */}
                {politician.bio && (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-gray-700">{politician.bio}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Ratings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Ratings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Integrity</span>
                          <span className="text-sm text-gray-600">
                            {politician.integrity_rating?.toFixed(1) || '0'}/5
                          </span>
                        </div>
                        <Progress value={(politician.integrity_rating || 0) * 20} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Development Impact</span>
                          <span className="text-sm text-gray-600">
                            {politician.development_impact_rating?.toFixed(1) || '0'}/5
                          </span>
                        </div>
                        <Progress value={(politician.development_impact_rating || 0) * 20} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Transparency</span>
                          <span className="text-sm text-gray-600">
                            {politician.transparency_rating?.toFixed(1) || '0'}/5
                          </span>
                        </div>
                        <Progress value={(politician.transparency_rating || 0) * 20} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {politician.contact_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{politician.contact_phone}</span>
                        </div>
                      )}
                      {politician.contact_website && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-500" />
                          <a 
                            href={politician.contact_website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {politician.contact_website}
                          </a>
                        </div>
                      )}
                      {politician.contact_office && (
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{politician.contact_office}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="promises" className="space-y-4">
                {promises.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-gray-500">No promises recorded</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {promises.map((promise) => (
                      <Card key={promise.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {promise.status === 'fulfilled' && <CheckCircle className="w-5 h-5 text-green-500" />}
                              {promise.status === 'unfulfilled' && <XCircle className="w-5 h-5 text-red-500" />}
                              {promise.status === 'in_progress' && <Clock className="w-5 h-5 text-yellow-500" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <Badge className={getPromiseStatusColor(promise.status)}>
                                  {getPromiseStatusText(promise.status)}
                                </Badge>
                                {promise.date_made && (
                                  <span className="text-xs text-gray-500">
                                    {formatDate(promise.date_made)}
                                  </span>
                                )}
                              </div>
                              <p className="font-medium mb-2">{promise.promise_text}</p>
                              {promise.description && (
                                <p className="text-sm text-gray-600 mb-2">{promise.description}</p>
                              )}
                              {promise.evidence_url && (
                                <a
                                  href={promise.evidence_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  View Evidence
                                </a>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ratings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Ratings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <p>Detailed ratings feature coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {politician.birth_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">
                            {formatDate(politician.birth_date)}
                            {calculateAge(politician.birth_date) && 
                              ` (${calculateAge(politician.birth_date)} years old)`
                            }
                          </span>
                        </div>
                      )}
                      {politician.education && (
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{politician.education}</span>
                        </div>
                      )}
                      {politician.career_background && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{politician.career_background}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {politician.political_party && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Political Party</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-3">
                          {politician.political_party.logo_url && (
                            <img 
                              src={politician.political_party.logo_url} 
                              alt={politician.political_party.name}
                              className="w-12 h-12 object-contain"
                            />
                          )}
                          <div>
                            <h4 className="font-medium">{politician.political_party.name}</h4>
                            {politician.political_party.acronym && (
                              <p className="text-sm text-gray-600">({politician.political_party.acronym})</p>
                            )}
                            {politician.political_party.official_website && (
                              <a
                                href={politician.political_party.official_website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                              >
                                Official Website
                              </a>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {/* Follow/Unfollow logic */}}
              >
                {politician.is_following ? (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
              <Button variant="outline" className="flex-1">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact
              </Button>
              <Button variant="outline" className="flex-1">
                <Heart className="w-4 h-4 mr-2" />
                Support
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};