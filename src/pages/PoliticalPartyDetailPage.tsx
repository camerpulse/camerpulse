import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AppLayout } from '@/components/Layout/AppLayout';
import { usePoliticalParty, usePoliticalPartyMembers } from '@/hooks/usePoliticalParties';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calendar, MapPin, Globe, Crown, Gavel, Building, Star } from 'lucide-react';
import { EnhancedPoliticalCard } from '@/components/Political/EnhancedPoliticalCard';

const PoliticalPartyDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: party, isLoading, error } = usePoliticalParty(slug || '');
  const { data: members, isLoading: membersLoading } = usePoliticalPartyMembers(party?.id || '');

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (error || !party) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive">Party Not Found</h1>
          <p className="text-muted-foreground mt-2">The requested political party could not be found.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>{party.name} ({party.acronym}) - Political Party | CamerPulse</title>
        <meta 
          name="description" 
          content={`Learn about ${party.name} (${party.acronym}), ${party.description || 'a political party in Cameroon'}. View their members, ideology, and political activities on CamerPulse.`}
        />
        <meta 
          name="keywords" 
          content={`${party.name}, ${party.acronym}, Cameroon political party, ${party.ideology || 'politics'}, political members, CamerPulse`}
        />
        <link rel="canonical" href={`https://camerpulse.com/parties/${slug}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${party.name} (${party.acronym}) - Political Party | CamerPulse`} />
        <meta property="og:description" content={`Learn about ${party.name} (${party.acronym}), ${party.description || 'a political party in Cameroon'}.`} />
        <meta property="og:type" content="organization" />
        <meta property="og:url" content={`https://camerpulse.com/parties/${slug}`} />
        {party.logo_url && <meta property="og:image" content={party.logo_url} />}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${party.name} (${party.acronym}) | CamerPulse`} />
        <meta name="twitter:description" content={`Learn about ${party.name} (${party.acronym}), ${party.description || 'a political party in Cameroon'}.`} />
        {party.logo_url && <meta name="twitter:image" content={party.logo_url} />}
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "PoliticalParty",
            "name": party.name,
            "alternateName": party.acronym,
            "description": party.description,
            "foundingDate": party.founded_year?.toString(),
            "address": {
              "@type": "PostalAddress",
              "addressLocality": party.headquarters,
              "addressCountry": "Cameroon"
            },
            "logo": party.logo_url,
            "url": party.website_url,
            "sameAs": party.website_url ? [party.website_url] : undefined,
            "memberOf": {
              "@type": "Country",
              "name": "Cameroon"
            }
          })}
        </script>
      </Helmet>
      
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Party Header */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8 mb-8">
            <div className="flex items-start space-x-6">
              {party.logo_url && (
                <img 
                  src={party.logo_url} 
                  alt={`${party.name} logo`}
                  className="w-24 h-24 object-contain rounded-lg bg-white p-2"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <h1 className="text-4xl font-bold text-foreground">{party.name}</h1>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {party.acronym}
                  </Badge>
                  {party.is_ruling_party && (
                    <Badge className="bg-yellow-500 text-yellow-50">
                      <Crown className="w-4 h-4 mr-1" />
                      Ruling Party
                    </Badge>
                  )}
                </div>
                
                {party.description && (
                  <p className="text-lg text-muted-foreground mb-6 max-w-3xl">{party.description}</p>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {party.founded_year && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="text-sm">Founded {party.founded_year}</span>
                    </div>
                  )}
                  {party.headquarters && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span className="text-sm">{party.headquarters}</span>
                    </div>
                  )}
                  {party.member_count && (
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="text-sm">{party.member_count.toLocaleString()} members</span>
                    </div>
                  )}
                  {party.website_url && (
                    <div className="flex items-center space-x-2">
                      <Globe className="w-5 h-5 text-primary" />
                      <a 
                        href={party.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Official Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Political Representation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Gavel className="w-5 h-5 mr-2" />
                    Political Representation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{party.seats_national_assembly || 0}</div>
                      <div className="text-sm text-muted-foreground">National Assembly Seats</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{party.seats_senate || 0}</div>
                      <div className="text-sm text-muted-foreground">Senate Seats</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{members?.totalMembers || 0}</div>
                      <div className="text-sm text-muted-foreground">Total Officials</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Party Members */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Party Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {membersLoading ? (
                    <div className="text-center py-8">Loading members...</div>
                  ) : (
                    <div className="space-y-8">
                      {/* Ministers */}
                      {members?.ministers && members.ministers.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Ministers ({members.ministers.length})</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {members.ministers.map((minister) => (
                              <EnhancedPoliticalCard
                                key={minister.id}
                                entity={minister}
                                type="minister"
                                variant="compact"
                                showActions={false}
                                showContact={false}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* MPs */}
                      {members?.mps && members.mps.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Members of Parliament ({members.mps.length})</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {members.mps.map((mp) => (
                              <EnhancedPoliticalCard
                                key={mp.id}
                                entity={mp}
                                type="mp"
                                variant="compact"
                                showActions={false}
                                showContact={false}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Senators */}
                      {members?.senators && members.senators.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Senators ({members.senators.length})</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {members.senators.map((senator) => (
                              <EnhancedPoliticalCard
                                key={senator.id}
                                entity={senator}
                                type="senator"
                                variant="compact"
                                showActions={false}
                                showContact={false}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {(!members || members.totalMembers === 0) && (
                        <div className="text-center py-8 text-muted-foreground">
                          No party members found in our database yet.
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Party Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Party Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {party.ideology && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Ideology</label>
                      <p className="mt-1">{party.ideology}</p>
                    </div>
                  )}
                  
                  {party.president_name && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Party President</label>
                      <p className="mt-1">{party.president_name}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <p className="mt-1">
                      <Badge variant={party.is_active ? "default" : "secondary"}>
                        {party.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {party.website_url && (
                    <Button asChild variant="outline" className="w-full">
                      <a href={party.website_url} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 mr-2" />
                        Visit Website
                      </a>
                    </Button>
                  )}
                  
                  <Button variant="outline" className="w-full">
                    <Star className="w-4 h-4 mr-2" />
                    Follow Party
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
};

export default PoliticalPartyDetailPage;