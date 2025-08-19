import React from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { useHospitalSlug } from '@/hooks/useSlugResolver';
import { EntitySEO } from '@/components/SEO/EntitySEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Star, 
  Users, 
  Building, 
  Shield,
  Ambulance,
  Heart,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

const HospitalDetailPage: React.FC = () => {
  const { entity: hospital, loading, error } = useHospitalSlug();

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner size="lg" text="Loading hospital details..." />
        </div>
      </AppLayout>
    );
  }

  if (error || !hospital) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Hospital Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The hospital you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/hospitals">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Hospitals
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <EntitySEO 
        entity={hospital}
        entityType="hospital"
        isLoading={loading}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/hospitals">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Hospitals
          </Button>
        </Link>

        {/* Hospital Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl font-bold text-primary mb-2">
                  {hospital.name}
                </CardTitle>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">{hospital.type}</Badge>
                  <Badge variant="outline">{hospital.ownership}</Badge>
                  {hospital.emergency_services && (
                    <Badge className="bg-red-100 text-red-800">
                      <Ambulance className="h-3 w-3 mr-1" />
                      Emergency Services
                    </Badge>
                  )}
                  <Badge className="bg-blue-100 text-blue-800">
                    {hospital.verification_status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{hospital.village_or_city}, {hospital.division}, {hospital.region}</span>
                  </div>
                  {hospital.overall_rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{hospital.overall_rating?.toFixed(1)} ({hospital.total_ratings} reviews)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Services */}
            {hospital.services_offered && hospital.services_offered.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Services Offered
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {hospital.services_offered.map((service, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-500" />
                        <span>{service}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Working Hours */}
            {hospital.working_hours && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Working Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{hospital.working_hours}</p>
                </CardContent>
              </Card>
            )}

            {/* Photo Gallery */}
            {hospital.photo_gallery && hospital.photo_gallery.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Photo Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hospital.photo_gallery.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`${hospital.name} - Image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hospital.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${hospital.phone}`} className="text-primary hover:underline">
                      {hospital.phone}
                    </a>
                  </div>
                )}
                {hospital.whatsapp && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <a 
                      href={`https://wa.me/${hospital.whatsapp}`} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      WhatsApp: {hospital.whatsapp}
                    </a>
                  </div>
                )}
                {hospital.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${hospital.email}`} className="text-primary hover:underline">
                      {hospital.email}
                    </a>
                  </div>
                )}
                {hospital.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <a 
                      href={hospital.website} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full">
                  <Heart className="h-4 w-4 mr-2" />
                  Rate This Hospital
                </Button>
                <Button variant="outline" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Write Review
                </Button>
                <Button variant="outline" className="w-full">
                  <Building className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default HospitalDetailPage;