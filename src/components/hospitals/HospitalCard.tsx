import React from 'react';
import { MapPin, Star, Phone, Clock, Shield, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { URLBuilder } from '@/utils/slugUtils';
import { useNavigation } from '@/hooks/useNavigation';

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
  verification_status: string;
  overall_rating: number;
  total_ratings: number;
}

interface HospitalCardProps {
  hospital: Hospital;
  onViewDetails: (hospital: Hospital) => void;
  onRate: (hospital: Hospital) => void;
}

export function HospitalCard({ hospital, onViewDetails, onRate }: HospitalCardProps) {
  const { navigateTo } = useNavigation();
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

  return (
    <Card variant="civic" className="h-full flex flex-col hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg line-clamp-2 flex-1">{hospital.name}</CardTitle>
          {hospital.emergency_services && (
            <Shield className="h-5 w-5 text-red-500 flex-shrink-0" />
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="truncate">{hospital.village_or_city}, {hospital.division}</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Type and Ownership */}
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
        </div>

        {/* Services Preview */}
        {hospital.services_offered && hospital.services_offered.length > 0 && (
          <div className="space-y-1">
            <div className="text-sm font-medium">Services:</div>
            <div className="text-sm text-muted-foreground line-clamp-2">
              {hospital.services_offered.slice(0, 3).join(', ')}
              {hospital.services_offered.length > 3 && '...'}
            </div>
          </div>
        )}

        {/* Working Hours */}
        {hospital.working_hours && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="truncate">{hospital.working_hours}</span>
          </div>
        )}

        {/* Contact */}
        {hospital.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span className="truncate">{hospital.phone}</span>
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">
              {hospital.overall_rating > 0 ? hospital.overall_rating.toFixed(1) : 'No ratings'}
            </span>
          </div>
          {hospital.total_ratings > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{hospital.total_ratings}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              const url = URLBuilder.institutions.hospitals.detail(hospital);
              navigateTo(url);
            }}
            className="flex-1"
          >
            View Details
          </Button>
          <Button 
            size="sm" 
            onClick={() => onRate(hospital)}
            className="flex-1"
          >
            Rate Hospital
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}