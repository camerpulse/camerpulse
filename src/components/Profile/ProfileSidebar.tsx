import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Calendar, 
  Globe, 
  Mail, 
  Phone, 
  Building,
  GraduationCap,
  Award,
  Star,
  Heart,
  Users,
  Briefcase,
  Languages,
  Shield,
  Target,
  BarChart3
} from 'lucide-react';

interface ProfileSidebarProps {
  profile: any;
  isOwnProfile: boolean;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  profile,
  isOwnProfile
}) => {
  const completionScore = profile.profile_completion_score || 0;

  return (
    <div className="space-y-6">
      {/* Profile Completion */}
      {isOwnProfile && completionScore < 100 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4" />
              Profile Completion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">{completionScore}%</span>
            </div>
            <Progress value={completionScore} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Complete your profile to increase visibility and connections.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4" />
            Contact Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="text-sm truncate">{profile.email}</div>
              </div>
            </div>
          )}
          
          {profile.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-muted-foreground">Phone</div>
                <div className="text-sm">{profile.phone}</div>
              </div>
            </div>
          )}
          
          {profile.location && (
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-muted-foreground">Location</div>
                <div className="text-sm">{profile.location}</div>
              </div>
            </div>
          )}
          
          {profile.website && (
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-muted-foreground">Website</div>
                <a 
                  href={profile.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline truncate block"
                >
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4" />
              Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill: string) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interests */}
      {profile.interests && profile.interests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Heart className="h-4 w-4" />
              Interests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest: string) => (
                <Badge key={interest} variant="outline" className="text-xs">
                  {interest}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Languages */}
      {profile.languages && profile.languages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Languages className="h-4 w-4" />
              Languages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {profile.languages.map((language: string) => (
                <div key={language} className="text-sm">{language}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <BarChart3 className="h-4 w-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <div className="font-medium">Posts this month</div>
            <div className="text-muted-foreground">{profile.monthly_posts || 0}</div>
          </div>
          <div className="text-sm">
            <div className="font-medium">Interactions</div>
            <div className="text-muted-foreground">{profile.monthly_interactions || 0}</div>
          </div>
          <div className="text-sm">
            <div className="font-medium">Profile views</div>
            <div className="text-muted-foreground">{profile.monthly_views || 0}</div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      {profile.social_links && Object.keys(profile.social_links).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4" />
              Social Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(profile.social_links).map(([platform, url]: [string, any]) => (
              <a 
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-primary hover:underline capitalize"
              >
                {platform}
              </a>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Civic Engagement */}
      {profile.civic_influence_score && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4" />
              Civic Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <div className="font-medium">Civic Score</div>
              <div className="text-muted-foreground">{profile.civic_influence_score}/100</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">Polls Created</div>
              <div className="text-muted-foreground">{profile.polls_created || 0}</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">Votes Cast</div>
              <div className="text-muted-foreground">{profile.votes_cast || 0}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mutual Connections */}
      {!isOwnProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              Mutual Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {profile.mutual_connections || 0} mutual connections
            </div>
            {/* TODO: Show mutual connection avatars */}
          </CardContent>
        </Card>
      )}
    </div>
  );
};