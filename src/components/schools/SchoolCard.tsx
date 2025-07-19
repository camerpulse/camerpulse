import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Star, 
  Users, 
  Phone, 
  Mail, 
  Globe, 
  Award,
  Eye,
  Clock,
  ExternalLink,
  Heart,
  Flag,
  MessageSquare
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { SchoolDetailsDialog } from './SchoolDetailsDialog';
import { RateSchoolDialog } from './RateSchoolDialog';

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

interface SchoolCardProps {
  school: School;
  onUpdate: () => void;
}

export function SchoolCard({ school, onUpdate }: SchoolCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showRating, setShowRating] = useState(false);

  const getVerificationBadge = (status: string) => {
    const badges = {
      verified: { label: '✓ Verified', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      pending: { label: 'Pending', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      under_review: { label: 'Under Review', variant: 'outline' as const, color: 'bg-blue-100 text-blue-800' },
      rejected: { label: 'Rejected', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' }
    };
    return badges[status as keyof typeof badges] || badges.pending;
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

  const formatFeeRange = (min?: number, max?: number) => {
    if (!min && !max) return 'Fees not specified';
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} FCFA`;
    if (min) return `From ${min.toLocaleString()} FCFA`;
    if (max) return `Up to ${max.toLocaleString()} FCFA`;
    return 'Contact school for fees';
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">
                  {getSchoolTypeIcon(school.school_type)}
                </span>
                <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                  {school.name}
                </h3>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <MapPin className="h-3 w-3" />
                <span className="line-clamp-1">
                  {school.village_or_city}, {school.division}, {school.region}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className={getOwnershipColor(school.ownership)}
                >
                  {school.ownership.charAt(0).toUpperCase() + school.ownership.slice(1)}
                </Badge>
                
                <Badge 
                  className={getVerificationBadge(school.verification_status).color}
                >
                  {getVerificationBadge(school.verification_status).label}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Rating Section */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
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
            <span className="text-sm font-medium">
              {school.average_rating ? school.average_rating.toFixed(1) : '0.0'}
            </span>
            <span className="text-xs text-muted-foreground">
              ({school.total_ratings || 0} reviews)
            </span>
          </div>

          {/* School Info */}
          <div className="space-y-2 text-sm mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                Type: {school.school_type.charAt(0).toUpperCase() + school.school_type.slice(1)}
              </span>
            </div>
            
            {school.established_year && (
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Established: {school.established_year}
                </span>
              </div>
            )}

            {(school.student_capacity || school.current_enrollment) && (
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {school.current_enrollment && school.student_capacity 
                    ? `${school.current_enrollment}/${school.student_capacity} students`
                    : school.current_enrollment 
                    ? `${school.current_enrollment} students`
                    : `Capacity: ${school.student_capacity} students`
                  }
                </span>
              </div>
            )}

            <div className="text-muted-foreground">
              {formatFeeRange(school.fees_range_min, school.fees_range_max)}
            </div>
          </div>

          {/* Languages */}
          {school.languages_taught && school.languages_taught.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {school.languages_taught.map((language, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {language}
                </Badge>
              ))}
            </div>
          )}

          {/* Description */}
          {school.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {school.description}
            </p>
          )}

          {/* Contact Info */}
          <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
            {school.contact_phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>Phone</span>
              </div>
            )}
            {school.contact_email && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span>Email</span>
              </div>
            )}
            {school.contact_website && (
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                <span>Website</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setShowDetails(true)}
            >
              <Eye className="h-3 w-3 mr-1" />
              View Details
            </Button>
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => setShowRating(true)}
            >
              <Star className="h-3 w-3 mr-1" />
              Rate School
            </Button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
            <span>
              Added {formatDistanceToNow(new Date(school.created_at), { addSuffix: true })}
            </span>
            <div className="flex items-center gap-2">
              {school.claim_status === 'unclaimed' && (
                <Badge variant="outline" className="text-xs">
                  <Flag className="h-2 w-2 mr-1" />
                  Claimable
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <SchoolDetailsDialog 
        school={school}
        open={showDetails}
        onOpenChange={setShowDetails}
        onUpdate={onUpdate}
      />

      <RateSchoolDialog 
        school={school}
        open={showRating}
        onOpenChange={setShowRating}
        onSuccess={onUpdate}
      />
    </>
  );
}