import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Music,
  Briefcase,
  Building,
  Stethoscope,
  Home,
  Star,
  MapPin,
  Calendar
} from 'lucide-react';
import type { 
  MusicProfile,
  JobProfile,
  HealthcareProfile,
  VillageMembership
} from '@/hooks/useUnifiedProfile';

interface ProfileModulesProps {
  musicProfile?: MusicProfile;
  jobProfile?: JobProfile;
  healthcareProfile?: HealthcareProfile;
  villageMemberships: VillageMembership[];
}

export const ProfileModules: React.FC<ProfileModulesProps> = ({
  musicProfile,
  jobProfile,
  healthcareProfile,
  villageMemberships
}) => {
  const activeModules = [
    musicProfile && 'music',
    jobProfile && 'professional',
    healthcareProfile && 'healthcare',
    villageMemberships.length > 0 && 'village'
  ].filter(Boolean);

  if (activeModules.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Active Modules</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Music Module */}
        {musicProfile && (
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Music className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-medium">Music Profile</h4>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">Stage Name:</span>
                  <span className="text-sm text-muted-foreground ml-2">{musicProfile.stage_name}</span>
                </div>
                {musicProfile.genres && musicProfile.genres.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Genres:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {musicProfile.genres.slice(0, 3).map((genre, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">{genre}</Badge>
                      ))}
                      {musicProfile.genres.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{musicProfile.genres.length - 3}</Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Professional Module */}
        {jobProfile && (
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-medium">Professional Profile</h4>
              </div>
              <div className="space-y-2">
                {jobProfile.job_title && (
                  <div>
                    <span className="text-sm font-medium">Position:</span>
                    <span className="text-sm text-muted-foreground ml-2">{jobProfile.job_title}</span>
                  </div>
                )}
                {jobProfile.company && (
                  <div>
                    <span className="text-sm font-medium">Company:</span>
                    <span className="text-sm text-muted-foreground ml-2">{jobProfile.company}</span>
                  </div>
                )}
                {jobProfile.skills && jobProfile.skills.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Skills:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {jobProfile.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">{skill}</Badge>
                      ))}
                      {jobProfile.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{jobProfile.skills.length - 3}</Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}


        {/* Healthcare Module */}
        {healthcareProfile && (
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Stethoscope className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-medium">Healthcare Profile</h4>
              </div>
              <div className="space-y-2">
                {healthcareProfile.specialization && (
                  <div>
                    <span className="text-sm font-medium">Specialization:</span>
                    <span className="text-sm text-muted-foreground ml-2">{healthcareProfile.specialization}</span>
                  </div>
                )}
                {healthcareProfile.institution && (
                  <div>
                    <span className="text-sm font-medium">Institution:</span>
                    <span className="text-sm text-muted-foreground ml-2">{healthcareProfile.institution}</span>
                  </div>
                )}
                {healthcareProfile.years_of_experience && (
                  <div>
                    <span className="text-sm font-medium">Experience:</span>
                    <span className="text-sm text-muted-foreground ml-2">{healthcareProfile.years_of_experience} years</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Village Memberships */}
        {villageMemberships.length > 0 && (
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-medium">Village Memberships</h4>
              </div>
              <div className="space-y-2">
                {villageMemberships.slice(0, 2).map((membership, index) => (
                  <div key={index} className="space-y-1">
                    <div>
                      <span className="text-sm font-medium">{membership.village_name}</span>
                      <Badge variant="outline" className="text-xs ml-2">{membership.role}</Badge>
                    </div>
                    {membership.region && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {membership.region}
                      </div>
                    )}
                  </div>
                ))}
                {villageMemberships.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{villageMemberships.length - 2} more villages
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};