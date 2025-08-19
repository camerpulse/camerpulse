import React from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { useSchoolSlug } from '@/hooks/useSlugResolver';
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
  Star, 
  Users, 
  Building, 
  GraduationCap,
  BookOpen,
  Languages,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SchoolDetailPage: React.FC = () => {
  const { entity: school, loading, error } = useSchoolSlug();

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner size="lg" text="Loading school details..." />
        </div>
      </AppLayout>
    );
  }

  if (error || !school) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">School Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The school you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/schools">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Schools
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <EntitySEO 
        entity={school}
        entityType="school"
        isLoading={loading}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/schools">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Schools
          </Button>
        </Link>

        {/* School Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl font-bold text-primary mb-2">
                  {school.name}
                </CardTitle>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">{school.school_type}</Badge>
                  <Badge variant="outline">{school.ownership}</Badge>
                  <Badge className="bg-green-100 text-green-800">
                    {school.verification_status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{school.village_or_city}, {school.division}, {school.region}</span>
                  </div>
                  {school.overall_rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{school.overall_rating?.toFixed(1)} ({school.total_ratings} reviews)</span>
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
            {/* Languages Taught */}
            {school.languages_taught && school.languages_taught.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Languages className="h-5 w-5" />
                    Languages of Instruction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {school.languages_taught.map((language, index) => (
                      <Badge key={index} variant="secondary">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Programs Offered */}
            {school.programs_offered && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Programs Offered
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{school.programs_offered}</p>
                </CardContent>
              </Card>
            )}

            {/* Founder Information */}
            {school.founder_or_don && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Founder/Donor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{school.founder_or_don}</p>
                </CardContent>
              </Card>
            )}

            {/* Photo Gallery */}
            {school.photo_gallery && school.photo_gallery.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Photo Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {school.photo_gallery.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`${school.name} - Image ${index + 1}`}
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
                {school.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${school.contact_phone}`} className="text-primary hover:underline">
                      {school.contact_phone}
                    </a>
                  </div>
                )}
                {school.contact_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${school.contact_email}`} className="text-primary hover:underline">
                      {school.contact_email}
                    </a>
                  </div>
                )}
                {school.website_url && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <a 
                      href={school.website_url} 
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
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Rate This School
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

export default SchoolDetailPage;