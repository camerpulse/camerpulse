import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Globe, Clock, Shield, Star, Users, MessageSquare, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';

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
  aggregate_ratings?: any;
  created_at: string;
}

interface HospitalDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hospital: Hospital;
  onRate: () => void;
}

interface Rating {
  id: string;
  cleanliness: number;
  staff_response_time: number;
  equipment_availability: number;
  service_quality: number;
  emergency_readiness: number;
  patient_experience: number;
  review_text?: string;
  anonymous: boolean;
  created_at: string;
}

export function HospitalDetailsDialog({ open, onOpenChange, hospital, onRate }: HospitalDetailsDialogProps) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(true);

  useEffect(() => {
    if (open) {
      fetchRatings();
    }
  }, [open, hospital.id]);

  const fetchRatings = async () => {
    try {
      const { data, error } = await supabase
        .from('hospital_ratings')
        .select('*')
        .eq('hospital_id', hospital.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching ratings:', error);
        return;
      }

      setRatings(data || []);
    } catch (error) {
      console.error('Error in fetchRatings:', error);
    } finally {
      setLoadingRatings(false);
    }
  };

  const getTypeLabel = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getOwnershipLabel = (ownership: string) => {
    return ownership.charAt(0).toUpperCase() + ownership.slice(1);
  };

  const getOwnershipColor = (ownership: string) => {
    const colors = {
      government: 'bg-blue-100 text-blue-800',
      private: 'bg-purple-100 text-purple-800',
      community: 'bg-green-100 text-green-800',
      mission: 'bg-orange-100 text-orange-800',
      ngo: 'bg-pink-100 text-pink-800',
    };
    return colors[ownership as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getVerificationColor = (status: string) => {
    return status === 'verified' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const ratingCriteria = [
    { key: 'cleanliness', label: 'Cleanliness' },
    { key: 'staff_response_time', label: 'Staff Response' },
    { key: 'equipment_availability', label: 'Equipment' },
    { key: 'service_quality', label: 'Service Quality' },
    { key: 'emergency_readiness', label: 'Emergency Ready' },
    { key: 'patient_experience', label: 'Patient Experience' },
  ];

  const aggregateRatings = hospital.aggregate_ratings || {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{hospital.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {getTypeLabel(hospital.type)}
              </Badge>
              <Badge className={getOwnershipColor(hospital.ownership)}>
                {getOwnershipLabel(hospital.ownership)}
              </Badge>
              <Badge className={getVerificationColor(hospital.verification_status)}>
                {hospital.verification_status === 'verified' ? 'Verified' : 'Unverified'}
              </Badge>
              {hospital.emergency_services && (
                <Badge className="bg-red-100 text-red-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Emergency Services
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{hospital.village_or_city}, {hospital.division}, {hospital.region}</span>
            </div>
          </div>

          {/* Rating Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Overall Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl font-bold">
                  {hospital.overall_rating > 0 ? hospital.overall_rating.toFixed(1) : 'N/A'}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{hospital.total_ratings} rating{hospital.total_ratings !== 1 ? 's' : ''}</span>
                </div>
                <Button onClick={onRate} size="sm">
                  Rate Hospital
                </Button>
              </div>

              {hospital.total_ratings > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {ratingCriteria.map(criteria => (
                    <div key={criteria.key} className="text-center">
                      <div className="text-lg font-semibold">
                        {aggregateRatings[criteria.key]?.toFixed(1) || 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">{criteria.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact & Services Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {hospital.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{hospital.phone}</span>
                  </div>
                )}
                {hospital.whatsapp && (
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span>WhatsApp: {hospital.whatsapp}</span>
                  </div>
                )}
                {hospital.email && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">@</span>
                    <span>{hospital.email}</span>
                  </div>
                )}
                {hospital.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={hospital.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      Visit Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {hospital.working_hours && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{hospital.working_hours}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
              </CardHeader>
              <CardContent>
                {hospital.services_offered && hospital.services_offered.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {hospital.services_offered.map((service, index) => (
                      <Badge key={index} variant="outline">
                        {service}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No services listed</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRatings ? (
                <div>Loading reviews...</div>
              ) : ratings.length > 0 ? (
                <div className="space-y-4">
                  {ratings.filter(rating => rating.review_text).slice(0, 5).map((rating, index) => (
                    <div key={rating.id}>
                      {index > 0 && <Separator className="my-4" />}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= Math.round((
                                      rating.cleanliness + 
                                      rating.staff_response_time + 
                                      rating.equipment_availability + 
                                      rating.service_quality + 
                                      rating.emergency_readiness + 
                                      rating.patient_experience
                                    ) / 6)
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {rating.anonymous ? 'Anonymous' : 'Patient'}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(rating.created_at)}
                          </span>
                        </div>
                        {rating.review_text && (
                          <p className="text-sm">{rating.review_text}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No reviews yet. Be the first to rate this hospital!</p>
              )}
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground text-center">
            Hospital added on {formatDate(hospital.created_at)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}