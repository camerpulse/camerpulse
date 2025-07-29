import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Phone, Mail, Globe, Truck, Star, Shield, User, Award } from "lucide-react";

interface PharmacyDetailsDialogProps {
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PharmacyDetailsDialog({ pharmacy, open, onOpenChange }: PharmacyDetailsDialogProps) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{pharmacy.name}</span>
            <Badge className={`${getStatusColor(pharmacy.status)} text-xs`}>
              {pharmacy.status === 'verified' ? (
                <Shield className="h-3 w-3 mr-1" />
              ) : null}
              {pharmacy.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-sm">
                {formatPharmacyType(pharmacy.type)}
              </Badge>
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{formatRating(pharmacy.overall_rating)}</span>
                <span className="text-muted-foreground">({pharmacy.total_ratings} reviews)</span>
              </div>
            </div>

            {pharmacy.pharmacist_in_charge && (
              <div className="flex items-center text-sm">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium">Pharmacist in Charge:</span>
                <span className="ml-2">{pharmacy.pharmacist_in_charge}</span>
              </div>
            )}

            {pharmacy.license_number && (
              <div className="flex items-center text-sm">
                <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium">License Number:</span>
                <span className="ml-2">{pharmacy.license_number}</span>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </h3>
            <p className="text-muted-foreground">
              {pharmacy.village_or_city}, {pharmacy.division}, {pharmacy.region}
            </p>
          </div>

          {/* Working Hours */}
          {pharmacy.working_hours && (
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Working Hours
              </h3>
              <p className="text-muted-foreground">{pharmacy.working_hours}</p>
            </div>
          )}

          {/* Services */}
          <div className="space-y-2">
            <h3 className="font-semibold">Services</h3>
            <div className="flex items-center gap-4">
              {pharmacy.delivery_available && (
                <div className="flex items-center text-green-600">
                  <Truck className="h-4 w-4 mr-2" />
                  <span className="text-sm">Delivery Available</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          {pharmacy.contact_info && Object.keys(pharmacy.contact_info).length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Contact Information</h3>
              <div className="space-y-2">
                {pharmacy.contact_info.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{pharmacy.contact_info.phone}</span>
                  </div>
                )}
                {pharmacy.contact_info.whatsapp && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-green-600" />
                    <span>WhatsApp: {pharmacy.contact_info.whatsapp}</span>
                  </div>
                )}
                {pharmacy.contact_info.email && (
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{pharmacy.contact_info.email}</span>
                  </div>
                )}
                {pharmacy.contact_info.website && (
                  <div className="flex items-center text-sm">
                    <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a 
                      href={pharmacy.contact_info.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {pharmacy.contact_info.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="space-y-2">
            <h3 className="font-semibold">Additional Information</h3>
            <p className="text-sm text-muted-foreground">
              Added on {formatDate(pharmacy.created_at)}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1">
              Claim Pharmacy
            </Button>
            <Button className="flex-1">
              Contact Pharmacy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}