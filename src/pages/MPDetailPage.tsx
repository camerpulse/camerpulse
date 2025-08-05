import React, { useState } from 'react';
import { useMPSlug } from '@/hooks/useSlugResolver';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  MapPin, 
  Calendar, 
  Phone, 
  Mail, 
  Globe, 
  MessageSquare,
  Edit,
  Flag,
  Share2,
  Heart,
  CheckCircle,
  Users,
  FileText,
  Award,
  Building
} from 'lucide-react';
import { MessagingModal } from '@/components/Politics/MessagingModal';
import { RatingModal } from '@/components/Politics/RatingModal';
import { ClaimProfileModal } from '@/components/Politics/ClaimProfileModal';
import { SuggestEditModal } from '@/components/Politics/SuggestEditModal';

export const MPDetailPage: React.FC = () => {
  const { entity: mp, loading, error, entityId } = useMPSlug();
  const [showMessaging, setShowMessaging] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showClaim, setShowClaim] = useState(false);
  const [showSuggestEdit, setShowSuggestEdit] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Mock data - replace with actual data fetching
  const mp = {
    id: id || '1',
    name: 'Hon. Cavaye Yeguie Djibril',
    position: 'Speaker of the National Assembly',
    party: 'CPDM',
    region: 'Far North',
    constituency: 'Tokombéré',
    photo: '',
    rating: 4.1,
    totalRatings: 892,
    isVerified: true,
    isClaimed: false,
    biography: 'Hon. Cavaye Yeguie Djibril has been serving as Speaker of the National Assembly since 2013. He has been a Member of Parliament for Tokombéré constituency since 1997, representing the people of the Far North region with dedication and commitment.',
    achievements: [
      'Speaker of National Assembly since 2013',
      'MP for Tokombéré since 1997',
      'Champion of rural development projects',
      'Advocate for educational infrastructure'
    ],
    contact: {
      email: 'speaker@parliament.cm',
      phone: '+237 222 233 456',
      website: 'https://www.parliament.cm'
    },
    stats: {
      yearsInParliament: 27,
      billsSponsored: 23,
      motionsRaised: 45,
      followers: 18500
    },
    committees: [
      'Committee on Constitutional Laws',
      'Committee on Finance and Budget',
      'Committee on Rural Development'
    ],
    legislation: [
      'Education Infrastructure Development Bill 2023',
      'Rural Electrification Amendment Act 2022',
      'Agricultural Modernization Law 2021'
    ]
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2);
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <Avatar className="h-32 w-32 mx-auto md:mx-0">
                  <AvatarImage src={mp.photo} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {getInitials(mp.name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                      <h1 className="text-3xl font-bold">{mp.name}</h1>
                      {mp.isVerified && (
                        <CheckCircle className="h-6 w-6 text-blue-500" />
                      )}
                    </div>
                    <p className="text-xl text-muted-foreground mb-3">{mp.position}</p>
                    
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                      <Badge variant="secondary">{mp.party}</Badge>
                      <Badge variant="outline">
                        <MapPin className="h-3 w-3 mr-1" />
                        {mp.region}
                      </Badge>
                      <Badge variant="outline">
                        <Building className="h-3 w-3 mr-1" />
                        {mp.constituency}
                      </Badge>
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        {mp.stats.yearsInParliament} years in Parliament
                      </Badge>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= mp.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium">{mp.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({mp.totalRatings} ratings)
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <Button 
                      onClick={() => setShowMessaging(true)}
                      className="bg-[#28a745] hover:bg-[#218838] text-white"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowRating(true)}
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Rate
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleFollow}
                      >
                        <Heart className={`h-4 w-4 mr-1 ${isFollowing ? 'fill-red-500 text-red-500' : ''}`} />
                        {isFollowing ? 'Following' : 'Follow'}
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowSuggestEdit(true)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Suggest Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                      >
                        <Share2 className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                    </div>

                    {!mp.isClaimed && (
                      <Button 
                        variant="outline" 
                        onClick={() => setShowClaim(true)}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <Flag className="h-4 w-4 mr-2" />
                        Claim This Profile
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{mp.stats.yearsInParliament}</div>
              <div className="text-sm text-muted-foreground">Years in Parliament</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{mp.stats.billsSponsored}</div>
              <div className="text-sm text-muted-foreground">Bills Sponsored</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{mp.stats.motionsRaised}</div>
              <div className="text-sm text-muted-foreground">Motions Raised</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{mp.stats.followers.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="about" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="committees">Committees</TabsTrigger>
            <TabsTrigger value="legislation">Legislation</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="ratings">Ratings</TabsTrigger>
          </TabsList>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>Biography</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {mp.biography}
                </p>
                
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Key Achievements</h3>
                  <ul className="space-y-3">
                    {mp.achievements.map((achievement, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="committees">
            <Card>
              <CardHeader>
                <CardTitle>Committee Memberships</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {mp.committees.map((committee, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{committee}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="legislation">
            <Card>
              <CardHeader>
                <CardTitle>Recent Legislation</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {mp.legislation.map((bill, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{bill}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <a href={`mailto:${mp.contact.email}`} className="text-blue-600 hover:underline">
                    {mp.contact.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <a href={`tel:${mp.contact.phone}`} className="text-blue-600 hover:underline">
                    {mp.contact.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <a href={mp.contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Official Parliament Page
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ratings">
            <Card>
              <CardHeader>
                <CardTitle>Ratings & Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Ratings and reviews will be displayed here.
                  </p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setShowRating(true)}
                  >
                    Be the first to rate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <MessagingModal
        open={showMessaging}
        onClose={() => setShowMessaging(false)}
        recipientId={mp.id}
        recipientName={mp.name}
        recipientType="mp"
      />

      <RatingModal
        open={showRating}
        onClose={() => setShowRating(false)}
        entityId={mp.id}
        entityName={mp.name}
        entityType="mp"
      />

      <ClaimProfileModal
        open={showClaim}
        onClose={() => setShowClaim(false)}
        profileId={mp.id}
        profileName={mp.name}
        profileType="mp"
      />

      <SuggestEditModal
        open={showSuggestEdit}
        onClose={() => setShowSuggestEdit(false)}
        profileId={mp.id}
        profileName={mp.name}
        profileType="mp"
      />
    </div>
  );
};