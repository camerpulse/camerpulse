import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/Layout/AppLayout';
import { useSenator, useSenatorRatings } from '@/hooks/useSenators';
import { SenatorRatingForm } from '@/components/Senators/SenatorRatingForm';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Star, MapPin, Phone, Mail, ArrowLeft, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

export default function SenatorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: senator, isLoading } = useSenator(id!);
  const { data: ratings } = useSenatorRatings(id!);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!senator) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Senator Not Found</h1>
            <Link to="/senators">
              <Button>Back to Senators</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-500';
    if (rating >= 3) return 'text-yellow-500';
    if (rating >= 2) return 'text-orange-500';
    return 'text-red-500';
  };

  const ratingBreakdown = {
    5: ratings?.filter(r => r.overall_rating === 5).length || 0,
    4: ratings?.filter(r => r.overall_rating === 4).length || 0,
    3: ratings?.filter(r => r.overall_rating === 3).length || 0,
    2: ratings?.filter(r => r.overall_rating === 2).length || 0,
    1: ratings?.filter(r => r.overall_rating === 1).length || 0,
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/senators">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Senators
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Senator Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <Avatar className="h-32 w-32 ring-4 ring-muted">
                    <AvatarImage 
                      src={senator.photo_url} 
                      alt={senator.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary/10 to-secondary/10">
                      {getInitials(senator.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground mb-2">
                        {senator.name}
                      </h1>
                      <Badge variant="secondary" className="text-sm">
                        {senator.position}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Star className={`h-5 w-5 fill-current ${getRatingColor(senator.average_rating)}`} />
                        <span className="font-semibold text-lg">
                          {senator.average_rating ? senator.average_rating.toFixed(1) : 'N/A'}
                        </span>
                        <span className="text-muted-foreground">
                          ({senator.total_ratings} reviews)
                        </span>
                      </div>
                      
                      {senator.is_verified && (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                          Verified
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {senator.region && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {senator.region}
                        </div>
                      )}
                      {senator.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {senator.email}
                        </div>
                      )}
                      {senator.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {senator.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            {senator.about && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {senator.about}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {senator.constituency && (
                  <div>
                    <span className="font-medium">Constituency:</span>
                    <span className="ml-2 text-muted-foreground">{senator.constituency}</span>
                  </div>
                )}
                
                {senator.party_affiliation && (
                  <div>
                    <span className="font-medium">Party:</span>
                    <span className="ml-2 text-muted-foreground">{senator.party_affiliation}</span>
                  </div>
                )}
                
                <div>
                  <span className="font-medium">Years of Service:</span>
                  <span className="ml-2 text-muted-foreground">{senator.years_of_service} years</span>
                </div>
                
                <div>
                  <span className="font-medium">Member Since:</span>
                  <span className="ml-2 text-muted-foreground">
                    {format(new Date(senator.created_at), 'MMMM yyyy')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Ratings Section */}
            <Card>
              <CardHeader>
                <CardTitle>Rating Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(ratingBreakdown).reverse().map(([stars, count]) => (
                    <div key={stars} className="flex items-center space-x-3">
                      <span className="w-8 text-sm font-medium">{stars} ★</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary rounded-full h-2 transition-all" 
                          style={{ 
                            width: `${senator.total_ratings > 0 ? (count / senator.total_ratings) * 100 : 0}%` 
                          }}
                        />
                      </div>
                      <span className="w-8 text-sm text-muted-foreground text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            {ratings && ratings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ratings.slice(0, 5).map((rating) => (
                      <div key={rating.id} className="border-b border-muted pb-4 last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= rating.overall_rating 
                                      ? 'text-yellow-400 fill-current' 
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {rating.is_anonymous ? 'Anonymous' : 'Verified User'}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(rating.created_at!), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        {rating.comment && (
                          <p className="text-sm text-muted-foreground">{rating.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SenatorRatingForm senatorId={senator.id} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}