import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Globe, 
  Calendar, 
  MapPin, 
  Star, 
  ExternalLink,
  Building2,
  TrendingUp,
  Award
} from 'lucide-react';
import { usePoliticalPartyWithMembers } from '@/hooks/usePoliticalEntityRelations';
import { AppLayout } from '@/components/Layout/AppLayout';
import { NavigationBreadcrumb } from '@/components/Navigation/NavigationBreadcrumb';

export default function PoliticalPartyPage() {
  const { id } = useParams<{ id: string }>();

  const { data: party, isLoading, error } = usePoliticalPartyWithMembers(id!);

  if (isLoading) {
    return (
      <AppLayout>
        <NavigationBreadcrumb 
          items={[
            { label: 'Politics', href: '/politics' },
            { label: 'Political Parties', href: '/political-parties' },
            { label: 'Loading...', href: '#' }
          ]} 
        />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading party information...</div>
        </div>
      </AppLayout>
    );
  }

  if (error || !party) {
    return (
      <AppLayout>
        <NavigationBreadcrumb 
          items={[
            { label: 'Politics', href: '/politics' },
            { label: 'Political Parties', href: '/political-parties' },
            { label: 'Not Found', href: '#' }
          ]} 
        />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Political Party Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The political party you're looking for could not be found.
            </p>
            <Link to="/political-parties">
              <Button>Browse All Parties</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const getEntityPath = (entity: any) => {
    switch (entity.entity_type) {
      case 'senator':
        return `/senators/${entity.id}`;
      case 'minister':
        return `/ministers/${entity.id}`;
      case 'mp':
        return `/mps/${entity.id}`;
      case 'politician':
        return `/politicians/${entity.id}`;
      default:
        return '#';
    }
  };

  const getEntityTypeLabel = (type: string) => {
    switch (type) {
      case 'senator':
        return 'Senator';
      case 'minister':
        return 'Minister';
      case 'mp':
        return 'MP';
      case 'politician':
        return 'Politician';
      default:
        return type;
    }
  };

  const getAllMembers = () => {
    return [
      ...party.members.senators,
      ...party.members.ministers,
      ...party.members.mps,
      ...party.members.politicians,
    ].sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
  };

  const getAverageRating = () => {
    const allMembers = getAllMembers();
    const membersWithRatings = allMembers.filter(m => m.average_rating && m.average_rating > 0);
    if (membersWithRatings.length === 0) return 0;
    return membersWithRatings.reduce((sum, m) => sum + (m.average_rating || 0), 0) / membersWithRatings.length;
  };

  const renderMemberCard = (member: any) => (
    <Link key={member.id} to={getEntityPath(member)}>
      <Card className="hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.profile_picture_url} alt={member.name} />
              <AvatarFallback>
                {member.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm truncate">{member.name}</h4>
                {member.is_verified && (
                  <Badge variant="secondary" className="text-xs">Verified</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{getEntityTypeLabel(member.entity_type)}</span>
                {member.position && member.position !== member.name && (
                  <>
                    <span>•</span>
                    <span className="truncate">{member.position}</span>
                  </>
                )}
                {member.region && (
                  <>
                    <span>•</span>
                    <span>{member.region}</span>
                  </>
                )}
              </div>
              {member.average_rating && member.average_rating > 0 && (
                <div className="flex items-center text-xs mt-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                  <span>{member.average_rating.toFixed(1)}</span>
                  {member.total_ratings && (
                    <span className="text-muted-foreground ml-1">({member.total_ratings})</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <AppLayout>
      <NavigationBreadcrumb 
        items={[
          { label: 'Politics', href: '/politics' },
          { label: 'Political Parties', href: '/political-parties' },
          { label: party.name, href: `#` }
        ]} 
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Party Header */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                {party.logo_url && (
                  <div className="flex-shrink-0">
                    <img 
                      src={party.logo_url} 
                      alt={party.name}
                      className="w-24 h-24 object-contain rounded-lg border"
                    />
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{party.name}</h1>
                      {party.acronym && (
                        <Badge variant="outline" className="text-sm">
                          {party.acronym}
                        </Badge>
                      )}
                    </div>
                    
                    {party.official_website && (
                      <Link to={party.official_website} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <Globe className="h-4 w-4 mr-2" />
                          Official Website
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Members</p>
                        <p className="font-semibold">{party.member_count}</p>
                      </div>
                    </div>
                    
                    {party.founded_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Founded</p>
                          <p className="font-semibold">
                            {new Date(party.founded_date).getFullYear()}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {party.party_president && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">President</p>
                          <p className="font-semibold">{party.party_president}</p>
                        </div>
                      </div>
                    )}
                    
                    {getAverageRating() > 0 && (
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Avg Rating</p>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="font-semibold">{getAverageRating().toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Party Members */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">
              All Members ({party.member_count})
            </TabsTrigger>
            <TabsTrigger value="senators">
              Senators ({party.members.senators.length})
            </TabsTrigger>
            <TabsTrigger value="ministers">
              Ministers ({party.members.ministers.length})
            </TabsTrigger>
            <TabsTrigger value="mps">
              MPs ({party.members.mps.length})
            </TabsTrigger>
            <TabsTrigger value="politicians">
              Politicians ({party.members.politicians.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  All Party Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getAllMembers().length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getAllMembers().map(renderMemberCard)}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No members found for this party.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="senators" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Senators</CardTitle>
              </CardHeader>
              <CardContent>
                {party.members.senators.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {party.members.senators.map(renderMemberCard)}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No senators found for this party.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ministers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ministers</CardTitle>
              </CardHeader>
              <CardContent>
                {party.members.ministers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {party.members.ministers.map(renderMemberCard)}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No ministers found for this party.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mps" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Members of Parliament</CardTitle>
              </CardHeader>
              <CardContent>
                {party.members.mps.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {party.members.mps.map(renderMemberCard)}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No MPs found for this party.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="politicians" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Other Politicians</CardTitle>
              </CardHeader>
              <CardContent>
                {party.members.politicians.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {party.members.politicians.map(renderMemberCard)}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No other politicians found for this party.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}