import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { PharmacyRatingDialog } from "./PharmacyRatingDialog";
import { PharmacyDetailsDialog } from "./PharmacyDetailsDialog";
import { useState } from "react";
import { Star, MapPin, Clock, Truck, Shield, Phone } from "lucide-react";

interface PharmacyCardProps {
  pharmacy: {
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
  };
  onUpdate?: () => void;
}

export function PharmacyCard({ pharmacy, onUpdate }: PharmacyCardProps) {
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const formatPharmacyType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getStatusColor = (status: string) => {
    return status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const formatRating = (rating: number) => {
    return rating ? rating.toFixed(1) : '0.0';
  };

  return (
    <>
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1 line-clamp-1">{pharmacy.name}</h3>
              <Badge variant="secondary" className="text-xs">
                {formatPharmacyType(pharmacy.type)}
              </Badge>
            </div>
            <Badge className={`${getStatusColor(pharmacy.status)} text-xs`}>
              {pharmacy.status === 'verified' ? (
                <Shield className="h-3 w-3 mr-1" />
              ) : null}
              {pharmacy.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="line-clamp-1">
              {pharmacy.village_or_city}, {pharmacy.division}, {pharmacy.region}
            </span>
          </div>

          {pharmacy.pharmacist_in_charge && (
            <div className="text-sm">
              <span className="font-medium">Pharmacist:</span> {pharmacy.pharmacist_in_charge}
            </div>
          )}

          {pharmacy.license_number && (
            <div className="text-sm">
              <span className="font-medium">License:</span> {pharmacy.license_number}
            </div>
          )}

          {pharmacy.working_hours && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="line-clamp-1">{pharmacy.working_hours}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{formatRating(pharmacy.overall_rating)}</span>
              <span className="text-xs text-muted-foreground">
                ({pharmacy.total_ratings} reviews)
              </span>
            </div>
            
            {pharmacy.delivery_available && (
              <div className="flex items-center text-green-600">
                <Truck className="h-4 w-4 mr-1" />
                <span className="text-xs">Delivery</span>
              </div>
            )}
          </div>

          {pharmacy.contact_info?.phone && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{pharmacy.contact_info.phone}</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="grid grid-cols-2 gap-2 pt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsDetailsDialogOpen(true)}
          >
            View Details
          </Button>
          <Button 
            size="sm"
            onClick={() => setIsRatingDialogOpen(true)}
          >
            Rate Pharmacy
          </Button>
        </CardFooter>
      </Card>

      <PharmacyRatingDialog
        pharmacy={pharmacy}
        open={isRatingDialogOpen}
        onOpenChange={setIsRatingDialogOpen}
        onRatingAdded={onUpdate || (() => {})}
      />

      <PharmacyDetailsDialog
        pharmacy={pharmacy}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
      />
    </>
  );
}