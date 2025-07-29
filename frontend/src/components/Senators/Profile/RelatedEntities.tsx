import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Building, MapPin, FileText, Users, Globe } from 'lucide-react';
import { Senator } from '@/hooks/useSenators';

interface RelatedEntitiesProps {
  senator: Senator;
}

export function RelatedEntities({ senator }: RelatedEntitiesProps) {
  const relatedLinks = [
    {
      id: 'senate_profile',
      title: 'Official Senate Profile',
      description: 'View official Senate biographical information',
      icon: Building,
      url: senator.official_senate_url || '#',
      type: 'external'
    },
    {
      id: 'political_party',
      title: `${senator.political_party || senator.party_affiliation} Party Page`,
      description: 'Learn about the political party and platform',
      icon: Users,
      url: '#',
      type: 'internal'
    },
    {
      id: 'region_dashboard',
      title: `${senator.region} Intelligence Dashboard`,
      description: 'Regional data, demographics, and civic insights',
      icon: MapPin,
      url: '#',
      type: 'internal'
    },
    {
      id: 'petitions',
      title: 'Related Petitions',
      description: 'Petitions mentioning or targeting this senator',
      icon: FileText,
      url: '#',
      type: 'internal'
    },
    {
      id: 'municipality',
      title: `${senator.constituency} Municipal Data`,
      description: 'Local government and municipal information',
      icon: Globe,
      url: '#',
      type: 'internal'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Related Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {relatedLinks.map((link) => {
          const IconComponent = link.icon;
          
          return (
            <Button
              key={link.id}
              variant="outline"
              className="w-full h-auto p-4 justify-start"
              asChild
            >
              <a 
                href={link.url}
                target={link.type === 'external' ? '_blank' : '_self'}
                rel={link.type === 'external' ? 'noopener noreferrer' : undefined}
                className="text-left"
              >
                <div className="flex items-start gap-3">
                  <IconComponent className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{link.title}</p>
                      {link.type === 'external' && (
                        <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {link.description}
                    </p>
                  </div>
                </div>
              </a>
            </Button>
          );
        })}

        {/* Quick Stats */}
        <div className="pt-4 border-t">
          <h4 className="font-semibold text-sm mb-3">Quick Regional Stats</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2 bg-muted/30 rounded text-center">
              <p className="font-medium">Population</p>
              <p className="text-muted-foreground">2.1M</p>
            </div>
            <div className="p-2 bg-muted/30 rounded text-center">
              <p className="font-medium">Active Petitions</p>
              <p className="text-muted-foreground">12</p>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        {senator.social_media_links && Object.keys(senator.social_media_links).length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-semibold text-sm mb-3">Social Media</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(senator.social_media_links).map(([platform, url]) => (
                <Button
                  key={platform}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  asChild
                >
                  <a href={url as string} target="_blank" rel="noopener noreferrer">
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}