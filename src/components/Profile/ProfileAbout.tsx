import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin,
  Globe,
  Mail,
  Phone,
  Calendar,
  Users,
  CheckCircle,
  Flag
} from 'lucide-react';
import type { UnifiedProfile } from '@/hooks/useUnifiedProfile';

interface ProfileAboutProps {
  profile: UnifiedProfile;
  detailed?: boolean;
}

export const ProfileAbout: React.FC<ProfileAboutProps> = ({
  profile,
  detailed = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          About {profile.display_name || profile.username}
        </h3>
        
        <div className="space-y-6">
          {/* Bio Section */}
          {profile.bio && (
            <div>
              <h4 className="font-medium text-foreground mb-2">Bio</h4>
              <p className="text-muted-foreground">{profile.bio}</p>
            </div>
          )}

          {/* Contact & Location Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Location</div>
                  <div className="text-muted-foreground">{profile.location}</div>
                </div>
              </div>
            )}
            
            {profile.website_url && (
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Website</div>
                  <a 
                    href={profile.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {profile.website_url.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              </div>
            )}

            {detailed && profile.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Email</div>
                  <div className="text-muted-foreground">{profile.email}</div>
                </div>
              </div>
            )}

            {detailed && profile.phone_number && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Phone</div>
                  <div className="text-muted-foreground">{profile.phone_number}</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Joined</div>
                <div className="text-muted-foreground">{formatDate(profile.created_at)}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Profile Type</div>
                <div className="text-muted-foreground capitalize">{profile.profile_type || 'Personal'}</div>
              </div>
            </div>
          </div>

          {/* Skills & Interests */}
          {profile.skills && profile.skills.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-3">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          )}

          {profile.interests && profile.interests.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-3">Interests</h4>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <Badge key={index} variant="outline">{interest}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Profile Status */}
          <div>
            <h4 className="font-medium text-foreground mb-3">Profile Status</h4>
            <div className="flex flex-wrap items-center gap-3">
              {profile.verified && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Verified</span>
                </div>
              )}
              
              {profile.is_diaspora && (
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Diaspora Member</span>
                </div>
              )}
              
              <Badge variant="outline" className="text-xs">
                {profile.verification_status || 'Unverified'}
              </Badge>
              
              <Badge variant="secondary" className="text-xs">
                {profile.profile_visibility} Profile
              </Badge>
            </div>
          </div>

          {/* Work Experience & Education */}
          {detailed && profile.work_experience && profile.work_experience.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-3">Work Experience</h4>
              <div className="space-y-3">
                {profile.work_experience.map((exp: any, index: number) => (
                  <div key={index} className="border-l-2 border-muted pl-4">
                    <div className="font-medium">{exp.title}</div>
                    <div className="text-sm text-muted-foreground">{exp.company}</div>
                    <div className="text-xs text-muted-foreground">{exp.period}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {detailed && profile.education && profile.education.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-3">Education</h4>
              <div className="space-y-3">
                {profile.education.map((edu: any, index: number) => (
                  <div key={index} className="border-l-2 border-muted pl-4">
                    <div className="font-medium">{edu.degree}</div>
                    <div className="text-sm text-muted-foreground">{edu.institution}</div>
                    <div className="text-xs text-muted-foreground">{edu.year}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};