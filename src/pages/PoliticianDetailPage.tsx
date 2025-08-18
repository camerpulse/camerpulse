import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Helmet } from 'react-helmet-async';
import { 
  MapPin, 
  Calendar, 
  Globe, 
  Mail, 
  Phone,
  Users,
  Star,
  TrendingUp,
  Award,
  ExternalLink,
  Building2,
  Heart,
  MessageCircle,
  Share2
} from 'lucide-react';
import { usePoliticianBySlug } from '@/hooks/usePoliticalData';
import { PoliticianRating } from '@/components/Politicians/PoliticianRating';
import { AppLayout } from '@/components/Layout/AppLayout';
import { NavigationBreadcrumb } from '@/components/Navigation/NavigationBreadcrumb';

const PoliticianDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: politician, isLoading, error } = usePoliticianBySlug(slug!);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading politician profile...</div>
        </div>
      </AppLayout>
    );
  }

  if (error || !politician) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Politician Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The politician you're looking for could not be found.
            </p>
            <Link to="/politicians">
              <Button>Browse Politicians</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 80) return 'text-green-600';
    if (rating >= 60) return 'text-yellow-600';
    if (rating >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <>
      <Helmet>
        <title>{politician.name} - Political Profile | CamerPulse</title>
        <meta name="description" content={`${politician.name} political profile, ratings, and performance information. ${politician.bio || ''}`} />
        <meta name="keywords" content={`${politician.name}, Cameroon politician, ${politician.region}, ${politician.party}`} />
      </Helmet>
      
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <NavigationBreadcrumb 
            items={[
              { label: 'Politics', href: '/politics' },
              { label: 'Politicians', href: '/politicians' },
              { label: politician.name, href: '#' }
            ]} 
          />

          {/* Hero Section */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-shrink-0">
                  <Avatar className="h-32 w-32 border-4 border-border">
                    <AvatarImage 
                      src={politician.profile_image_url} 
                      alt={politician.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-3xl font-bold">
                      {politician.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row justify-between items-start mb-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{politician.name}</h1>
                      <p className="text-xl text-muted-foreground mb-3">
                        {politician.role_title || 'Political Representative'}
                      </p>
                      
                      <div className="flex items-center gap-4 flex-wrap mb-4">
                        {politician.party && (
                          <Badge variant="outline" className="text-sm">
                            {politician.party}
                          </Badge>
                        )}
                        
                        <Badge 
                          variant={politician.is_currently_in_office ? 'default' : 'secondary'}
                          className="text-sm"
                        >
                          {politician.is_currently_in_office ? 'In Office' : 'Former'}
                        </Badge>
                        
                        {politician.verified && (
                          <Badge variant="secondary" className="text-sm">
                            <Award className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Heart className="h-4 w-4 mr-1" />
                        Follow
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Key Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {politician.region && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{politician.region}</span>
                      </div>
                    )}
                    
                    {politician.constituency && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{politician.constituency}</span>
                      </div>
                    )}
                    
                    {politician.term_start_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Since {new Date(politician.term_start_date).getFullYear()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{politician.performance_score || 0}</div>
                      <div className="text-sm text-muted-foreground">Performance</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{politician.transparency_rating || 0}</div>
                      <div className="text-sm text-muted-foreground">Transparency</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{politician.integrity_rating || 0}</div>
                      <div className="text-sm text-muted-foreground">Integrity</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{politician.follower_count || 0}</div>
                      <div className="text-sm text-muted-foreground">Followers</div>
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
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="ratings">Ratings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Biography */}
              {politician.biography && (
                <Card>
                  <CardHeader>
                    <CardTitle>Biography</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {politician.biography}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Education & Background */}
              {politician.education && (
                <Card>
                  <CardHeader>
                    <CardTitle>Education</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{politician.education}</p>
                  </CardContent>
                </Card>
              )}

              {/* Career Background */}
              {politician.career_background && (
                <Card>
                  <CardHeader>
                    <CardTitle>Career Background</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{politician.career_background}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Overall Performance</span>
                      <span className={`text-sm font-semibold ${getRatingColor(politician.performance_score || 0)}`}>
                        {politician.performance_score || 0}/100
                      </span>
                    </div>
                    <Progress value={politician.performance_score || 0} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Transparency</span>
                      <span className={`text-sm font-semibold ${getRatingColor(politician.transparency_rating || 0)}`}>
                        {politician.transparency_rating || 0}/100
                      </span>
                    </div>
                    <Progress value={politician.transparency_rating || 0} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Integrity</span>
                      <span className={`text-sm font-semibold ${getRatingColor(politician.integrity_rating || 0)}`}>
                        {politician.integrity_rating || 0}/100
                      </span>
                    </div>
                    <Progress value={politician.integrity_rating || 0} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Development Impact</span>
                      <span className={`text-sm font-semibold ${getRatingColor(politician.development_impact_rating || 0)}`}>
                        {politician.development_impact_rating || 0}/100
                      </span>
                    </div>
                    <Progress value={politician.development_impact_rating || 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {politician.contact_office && (
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <span>{politician.contact_office}</span>
                    </div>
                  )}

                  {politician.contact_phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <span>{politician.contact_phone}</span>
                    </div>
                  )}

                  {politician.contact_website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <a 
                        href={politician.contact_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {politician.contact_website}
                        <ExternalLink className="h-4 w-4 ml-1 inline" />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ratings" className="space-y-6">
              <PoliticianRating
                politicianId={politician.id}
                politicianName={politician.name}
                currentRating={(politician.performance_score || 0) / 20}
                totalRatings={0}
                showForm={true}
              />
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </>
  );
};

export default PoliticianDetailPage;