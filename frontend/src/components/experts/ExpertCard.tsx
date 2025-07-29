import React from 'react';
import { ExpertProfile } from '@/hooks/useExperts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Star, 
  MapPin, 
  DollarSign, 
  Clock, 
  User, 
  Award,
  Briefcase,
  MessageCircle,
  Eye
} from 'lucide-react';

interface ExpertCardProps {
  expert: ExpertProfile;
  onViewProfile?: (expert: ExpertProfile) => void;
  onContactExpert?: (expert: ExpertProfile) => void;
  showFullProfile?: boolean;
}

export const ExpertCard: React.FC<ExpertCardProps> = ({ 
  expert, 
  onViewProfile, 
  onContactExpert,
  showFullProfile = false 
}) => {
  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'not_available': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (title: string) => {
    return title.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatRate = (min?: number, max?: number, currency = 'FCFA') => {
    if (!min && !max) return 'Rate negotiable';
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}/hr`;
    if (min) return `From ${min.toLocaleString()} ${currency}/hr`;
    if (max) return `Up to ${max.toLocaleString()} ${currency}/hr`;
    return 'Rate negotiable';
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${showFullProfile ? 'max-w-4xl mx-auto' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(expert.professional_title)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg">{expert.professional_title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {expert.location && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {expert.location}
                  </div>
                )}
                {expert.is_verified && (
                  <Badge variant="default" className="text-xs">
                    <Award className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {expert.is_featured && (
                  <Badge variant="secondary" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <Badge className={getAvailabilityColor(expert.availability)}>
              {expert.availability.replace('_', ' ')}
            </Badge>
            {expert.average_rating > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{expert.average_rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({expert.total_reviews})</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Bio */}
        {expert.bio && (
          <CardDescription className={showFullProfile ? '' : 'line-clamp-3'}>
            {expert.bio}
          </CardDescription>
        )}

        {/* Key Stats */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Briefcase className="h-4 w-4" />
            {expert.years_experience} years exp.
          </div>
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {expert.total_projects} projects
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {expert.response_time_hours}h response
          </div>
          {expert.profile_views > 0 && (
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {expert.profile_views} views
            </div>
          )}
        </div>

        {/* Rate */}
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {formatRate(expert.hourly_rate_min, expert.hourly_rate_max, expert.currency)}
          </span>
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {expert.skills.slice(0, showFullProfile ? expert.skills.length : 5).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {!showFullProfile && expert.skills.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{expert.skills.length - 5} more
              </Badge>
            )}
          </div>
        </div>

        {/* Expanded content for full profile */}
        {showFullProfile && (
          <div className="space-y-6 pt-4 border-t">
            {/* Languages */}
            {expert.languages.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Languages</h4>
                <div className="flex flex-wrap gap-1">
                  {expert.languages.map((language, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Work Preferences */}
            <div>
              <h4 className="font-medium mb-2">Work Preferences</h4>
              <div className="flex flex-wrap gap-1">
                {expert.work_preference.map((pref, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {pref.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Portfolio */}
            {expert.portfolio_items.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Portfolio</h4>
                <div className="space-y-2">
                  {expert.portfolio_items.map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <h5 className="font-medium">{item.title}</h5>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      )}
                      {item.url && (
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline mt-1 inline-block"
                        >
                          View Project →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {expert.education.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Education</h4>
                <div className="space-y-2">
                  {expert.education.map((edu, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{edu.degree}</p>
                        <p className="text-sm text-muted-foreground">{edu.institution}</p>
                      </div>
                      {edu.year && (
                        <span className="text-sm text-muted-foreground">{edu.year}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {expert.certifications.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Certifications</h4>
                <div className="space-y-2">
                  {expert.certifications.map((cert, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{cert.name}</p>
                        <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                      </div>
                      {cert.year && (
                        <span className="text-sm text-muted-foreground">{cert.year}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          {!showFullProfile && onViewProfile && (
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onViewProfile(expert)}
            >
              View Profile
            </Button>
          )}
          {onContactExpert && expert.availability === 'available' && (
            <Button 
              className="flex-1 flex items-center gap-2"
              onClick={() => onContactExpert(expert)}
            >
              <MessageCircle className="h-4 w-4" />
              Contact Expert
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};