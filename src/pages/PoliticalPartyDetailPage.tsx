import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Helmet } from 'react-helmet-async';
import { 
  Users, 
  Globe, 
  Calendar, 
  MapPin, 
  Star, 
  ExternalLink,
  Building2,
  TrendingUp,
  Award,
  Mail,
  Phone
} from 'lucide-react';
import { usePoliticalPartyBySlug, usePoliticalPartyMembers } from '@/hooks/usePoliticalData';
import { PoliticianCard } from '@/components/Politicians/PoliticianCard';
import { AppLayout } from '@/components/Layout/AppLayout';
import { NavigationBreadcrumb } from '@/components/Navigation/NavigationBreadcrumb';

const PoliticalPartyDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: party, isLoading, error } = usePoliticalPartyBySlug(slug!);
  const { data: members } = usePoliticalPartyMembers(party?.id || '');

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading political party...</div>
        </div>
      </AppLayout>
    );
  }

  if (error || !party) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Political Party Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The political party you're looking for could not be found.
            </p>
            <Link to="/political-parties">
              <Button>Browse Political Parties</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const totalMembers = party.mps_count + party.senators_count + party.mayors_count;

  return (
    <>
      <Helmet>
        <title>{party.name} - Political Party Profile | CamerPulse</title>
        <meta name="description" content={`${party.name} political party profile, leadership, platform, and member information. ${party.mission || ''}`} />
        <meta name="keywords" content={`${party.name}, ${party.acronym}, Cameroon political party, party platform, political organization`} />
      </Helmet>
      
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <NavigationBreadcrumb 
            items={[
              { label: 'Politics', href: '/politics' },
              { label: 'Political Parties', href: '/political-parties' },
              { label: party.name, href: '#' }
            ]} 
          />

          {/* Hero Section */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {party.logo_url && (
                  <div className="flex-shrink-0">
                    <img 
                      src={party.logo_url} 
                      alt={`${party.name} logo`}
                      className="w-32 h-32 object-contain rounded-lg border-4 border-border"
                    />
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row justify-between items-start mb-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{party.name}</h1>
                      {party.acronym && (
                        <p className="text-xl text-muted-foreground mb-3">
                          {party.acronym}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 flex-wrap mb-4">
                        <Badge 
                          variant={party.is_active ? 'default' : 'destructive'}
                          className="text-sm"
                        >
                          {party.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        
                        {party.ideology && (
                          <Badge variant="outline" className="text-sm">
                            {party.ideology}
                          </Badge>
                        )}
                        
                        {party.political_leaning && (
                          <Badge variant="secondary" className="text-sm">
                            {party.political_leaning}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {party.official_website && (
                        <Button variant="outline" size="sm" asChild>
                          <a 
                            href={party.official_website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Globe className="h-4 w-4 mr-1" />
                            Website
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Key Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {party.headquarters_region && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {party.headquarters_city}, {party.headquarters_region}
                        </span>
                      </div>
                    )}
                    
                    {party.founding_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Founded {new Date(party.founding_date).getFullYear()}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{totalMembers} Representatives</span>
                    </div>
                  </div>

                  {/* Membership Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{party.mps_count}</div>
                      <div className="text-sm text-muted-foreground">MPs</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{party.senators_count}</div>
                      <div className="text-sm text-muted-foreground">Senators</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{party.mayors_count}</div>
                      <div className="text-sm text-muted-foreground">Mayors</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="leadership">Leadership</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Mission & Vision */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {party.mission && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Mission</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {party.mission}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {party.vision && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Vision</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {party.vision}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Performance Metrics */}
              {party.total_ratings > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Public Ratings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-lg font-bold">{party.approval_rating.toFixed(1)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Overall Rating</p>
                        <p className="text-xs text-muted-foreground">({party.total_ratings} ratings)</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary mb-2">
                          {party.trust_rating.toFixed(1)}/5
                        </div>
                        <p className="text-sm text-muted-foreground">Trust</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary mb-2">
                          {party.transparency_rating.toFixed(1)}/5
                        </div>
                        <p className="text-sm text-muted-foreground">Transparency</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary mb-2">
                          {party.development_rating.toFixed(1)}/5
                        </div>
                        <p className="text-sm text-muted-foreground">Development</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="leadership" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Party Leadership</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {party.party_president && (
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <h3 className="font-semibold">Party President</h3>
                        <p className="text-muted-foreground">{party.party_president}</p>
                      </div>
                    </div>
                  )}

                  {party.vice_president && (
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <h3 className="font-semibold">Vice President</h3>
                        <p className="text-muted-foreground">{party.vice_president}</p>
                      </div>
                    </div>
                  )}

                  {party.secretary_general && (
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <h3 className="font-semibold">Secretary General</h3>
                        <p className="text-muted-foreground">{party.secretary_general}</p>
                      </div>
                    </div>
                  )}

                  {party.treasurer && (
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <h3 className="font-semibold">Treasurer</h3>
                        <p className="text-muted-foreground">{party.treasurer}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Party Members</CardTitle>
                </CardHeader>
                <CardContent>
                  {members && members.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {members.map((member) => (
                        <PoliticianCard
                          key={member.id}
                          politician={member}
                          showFullDetails={false}
                          showRating={true}
                          showFollow={false}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Members Listed</h3>
                      <p className="text-muted-foreground">
                        Member information is not yet available for this party.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {party.contact_email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <a 
                        href={`mailto:${party.contact_email}`}
                        className="text-primary hover:underline"
                      >
                        {party.contact_email}
                      </a>
                    </div>
                  )}

                  {party.contact_phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <span>{party.contact_phone}</span>
                    </div>
                  )}

                  {party.headquarters_address && (
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <span>{party.headquarters_address}</span>
                    </div>
                  )}

                  {party.official_website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <a 
                        href={party.official_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {party.official_website}
                        <ExternalLink className="h-4 w-4 ml-1 inline" />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </>
  );
};

export default PoliticalPartyDetailPage;