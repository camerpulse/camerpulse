import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Star, 
  Users, 
  Phone, 
  Mail, 
  Globe, 
  Award,
  Clock,
  Calendar,
  DollarSign,
  GraduationCap,
  Flag,
  MessageSquare,
  Eye,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface School {
  id: string;
  name: string;
  school_type: string;
  ownership: string;
  region: string;
  division: string;
  village_or_city: string;
  languages_taught: string[];
  programs_offered?: string;
  photo_gallery: string[];
  founder_or_don?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_website?: string;
  verification_status: string;
  claim_status: string;
  address?: string;
  description?: string;
  established_year?: number;
  student_capacity?: number;
  current_enrollment?: number;
  fees_range_min?: number;
  fees_range_max?: number;
  average_rating: number;
  total_ratings: number;
  created_at: string;
}

interface SchoolRating {
  id: string;
  teaching_quality: number;
  academic_performance: number;
  infrastructure: number;
  discipline_safety: number;
  tech_access: number;
  community_trust: number;
  inclusiveness: number;
  overall_rating: number;
  review_text?: string;
  created_at: string;
}

interface SchoolDetailsDialogProps {
  school: School;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function SchoolDetailsDialog({ school, open, onOpenChange, onUpdate }: SchoolDetailsDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ratings, setRatings] = useState<SchoolRating[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(false);

  useEffect(() => {
    if (open) {
      fetchRatings();
    }
  }, [open, school.id]);

  const fetchRatings = async () => {
    try {
      setLoadingRatings(true);
      const { data, error } = await supabase
        .from('school_ratings')
        .select('*')
        .eq('school_id', school.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRatings(data || []);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoadingRatings(false);
    }
  };

  const getVerificationBadge = (status: string) => {
    const badges = {
      verified: { label: '✓ Verified', color: 'bg-green-100 text-green-800' },
      pending: { label: 'Pending Verification', color: 'bg-yellow-100 text-yellow-800' },
      under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-800' },
      rejected: { label: 'Verification Rejected', color: 'bg-red-100 text-red-800' }
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getOwnershipColor = (ownership: string) => {
    const colors = {
      government: 'bg-blue-100 text-blue-800',
      private: 'bg-purple-100 text-purple-800',
      community: 'bg-green-100 text-green-800',
      religious: 'bg-orange-100 text-orange-800',
      ngo: 'bg-pink-100 text-pink-800'
    };
    return colors[ownership as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSchoolTypeIcon = (type: string) => {
    const icons = {
      nursery: '🏫',
      primary: '📚',
      secondary: '🎓',
      vocational: '🛠️',
      university: '🏛️',
      special: '⭐'
    };
    return icons[type as keyof typeof icons] || '🏫';
  };

  const formatFeeRange = (min?: number, max?: number) => {
    if (!min && !max) return 'Contact school for fees';
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} FCFA per year`;
    if (min) return `From ${min.toLocaleString()} FCFA per year`;
    if (max) return `Up to ${max.toLocaleString()} FCFA per year`;
    return 'Fees not specified';
  };

  const ratingCategories = [
    { key: 'teaching_quality', label: 'Teaching Quality' },
    { key: 'academic_performance', label: 'Academic Performance' },
    { key: 'infrastructure', label: 'Infrastructure' },
    { key: 'discipline_safety', label: 'Discipline & Safety' },
    { key: 'tech_access', label: 'Technology Access' },
    { key: 'community_trust', label: 'Community Trust' },
    { key: 'inclusiveness', label: 'Inclusiveness' }
  ];

  const calculateCategoryAverage = (category: string) => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + (rating[category as keyof SchoolRating] as number || 0), 0);
    return sum / ratings.length;
  };

  const handleClaimSchool = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to claim this school",
        variant: "destructive"
      });
      return;
    }

    // TODO: Implement claim school functionality
    toast({
      title: "Claim request submitted",
      description: "Your claim request will be reviewed by our team",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl mb-2">
                {getSchoolTypeIcon(school.school_type)} {school.name}
              </DialogTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <MapPin className="h-4 w-4" />
                <span>{school.village_or_city}, {school.division}, {school.region}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getOwnershipColor(school.ownership)}>
                  {school.ownership.charAt(0).toUpperCase() + school.ownership.slice(1)}
                </Badge>
                <Badge className={getVerificationBadge(school.verification_status).color}>
                  {getVerificationBadge(school.verification_status).label}
                </Badge>
                {school.claim_status === 'unclaimed' && (
                  <Badge variant="outline">
                    <Flag className="h-3 w-3 mr-1" />
                    Claimable
                  </Badge>
                )}
              </div>
            </div>
            {school.claim_status === 'unclaimed' && (
              <Button onClick={handleClaimSchool} variant="outline">
                Claim School
              </Button>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ratings">Ratings & Reviews</TabsTrigger>
            <TabsTrigger value="contact">Contact & Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Rating Summary */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {school.average_rating ? school.average_rating.toFixed(1) : '0.0'}
                    </div>
                    <div className="flex items-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star}
                          className={`h-4 w-4 ${
                            star <= (school.average_rating || 0) 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {school.total_ratings || 0} reviews
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    {ratingCategories.slice(0, 4).map((category) => (
                      <div key={category.key} className="flex items-center gap-2">
                        <span className="text-sm w-24 text-right">{category.label}:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ 
                              width: `${(calculateCategoryAverage(category.key) / 5) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm w-8">{calculateCategoryAverage(category.key).toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* School Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    School Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">
                      {school.school_type.charAt(0).toUpperCase() + school.school_type.slice(1)}
                    </span>
                  </div>
                  {school.established_year && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Established:</span>
                      <span className="font-medium">{school.established_year}</span>
                    </div>
                  )}
                  {school.founder_or_don && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Founder:</span>
                      <span className="font-medium">{school.founder_or_don}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Languages:</span>
                    <div className="flex flex-wrap gap-1">
                      {school.languages_taught.map((lang, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Enrollment & Capacity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {school.student_capacity && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Capacity:</span>
                      <span className="font-medium">{school.student_capacity.toLocaleString()} students</span>
                    </div>
                  )}
                  {school.current_enrollment && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Enrollment:</span>
                      <span className="font-medium">{school.current_enrollment.toLocaleString()} students</span>
                    </div>
                  )}
                  {school.student_capacity && school.current_enrollment && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Occupancy:</span>
                      <span className="font-medium">
                        {Math.round((school.current_enrollment / school.student_capacity) * 100)}%
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fees:</span>
                    <span className="font-medium text-sm">
                      {formatFeeRange(school.fees_range_min, school.fees_range_max)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            {school.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About This School</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{school.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Programs */}
            {school.programs_offered && (
              <Card>
                <CardHeader>
                  <CardTitle>Programs Offered</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{school.programs_offered}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ratings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Ratings Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ratingCategories.map((category) => (
                    <div key={category.key} className="flex items-center justify-between p-3 border rounded">
                      <span className="font-medium">{category.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star}
                              className={`h-4 w-4 ${
                                star <= calculateCategoryAverage(category.key) 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium">
                          {calculateCategoryAverage(category.key).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingRatings ? (
                  <div className="text-center py-6">Loading reviews...</div>
                ) : ratings.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    No reviews yet. Be the first to rate this school!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ratings.filter(rating => rating.review_text).slice(0, 5).map((rating) => (
                      <div key={rating.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= rating.overall_rating 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">{rating.overall_rating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(rating.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        {rating.review_text && (
                          <p className="text-sm text-muted-foreground">{rating.review_text}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {school.contact_phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{school.contact_phone}</div>
                        <a 
                          href={`tel:${school.contact_phone}`}
                          className="text-xs text-primary hover:underline"
                        >
                          Call now
                        </a>
                      </div>
                    </div>
                  )}

                  {school.contact_email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{school.contact_email}</div>
                        <a 
                          href={`mailto:${school.contact_email}`}
                          className="text-xs text-primary hover:underline"
                        >
                          Send email
                        </a>
                      </div>
                    </div>
                  )}

                  {school.contact_website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{school.contact_website}</div>
                        <a 
                          href={school.contact_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          Visit website <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  {!school.contact_phone && !school.contact_email && !school.contact_website && (
                    <p className="text-sm text-muted-foreground">
                      Contact information not available. 
                      {school.claim_status === 'unclaimed' && (
                        <span> School administrators can claim this listing to add contact details.</span>
                      )}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Location Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Region:</span>
                      <span className="font-medium">{school.region}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Division:</span>
                      <span className="font-medium">{school.division}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">City/Village:</span>
                      <span className="font-medium">{school.village_or_city}</span>
                    </div>
                    {school.address && (
                      <div className="pt-2 border-t">
                        <span className="text-muted-foreground">Address:</span>
                        <p className="font-medium">{school.address}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Listed on:</span>
                  <span className="font-medium">
                    {formatDistanceToNow(new Date(school.created_at), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Verification Status:</span>
                  <Badge className={getVerificationBadge(school.verification_status).color}>
                    {getVerificationBadge(school.verification_status).label}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Claim Status:</span>
                  <Badge variant={school.claim_status === 'unclaimed' ? 'outline' : 'secondary'}>
                    {school.claim_status === 'unclaimed' ? 'Available to Claim' : 'Claimed'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}