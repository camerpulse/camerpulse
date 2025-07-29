import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
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
  CheckCircle
} from 'lucide-react';
import { MessagingModal } from '@/components/Politics/MessagingModal';
import { RatingModal } from '@/components/Politics/RatingModal';
import { ClaimProfileModal } from '@/components/Politics/ClaimProfileModal';
import { SuggestEditModal } from '@/components/Politics/SuggestEditModal';

export const PoliticianDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [showMessaging, setShowMessaging] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showClaim, setShowClaim] = useState(false);
  const [showSuggestEdit, setShowSuggestEdit] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Mock data - replace with actual data fetching
  const politician = {
    id: id || '1',
    name: 'Hon. Paul Biya',
    position: 'President of the Republic',
    party: 'CPDM',
    region: 'Centre',
    photo: '',
    rating: 4.2,
    totalRatings: 1234,
    isVerified: true,
    isClaimed: false,
    biography: 'Paul Biya has been serving as the President of Cameroon since 1982. He is one of the longest-serving heads of state in Africa and has led significant development initiatives across the country.',
    achievements: [
      'Infrastructure Development Projects',
      'Educational Reforms',
      'Economic Stabilization Programs',
      'Peace and Security Initiatives'
    ],
    contact: {
      email: 'contact@presidency.gov.cm',
      phone: '+237 222 220 025',
      website: 'https://www.prc.cm'
    },
    stats: {
      yearsInOffice: 41,
      billsSponsored: 45,
      projectsCompleted: 120,
      followers: 25000
    },
    socialMedia: {
      twitter: '@PaulBiya_Official',
      facebook: 'PaulBiyaOfficial',
      instagram: '@paulbiya_official'
    }
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
                  <AvatarImage src={politician.photo} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {getInitials(politician.name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                      <h1 className="text-3xl font-bold">{politician.name}</h1>
                      {politician.isVerified && (
                        <CheckCircle className="h-6 w-6 text-blue-500" />
                      )}
                    </div>
                    <p className="text-xl text-muted-foreground mb-3">{politician.position}</p>
                    
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                      <Badge variant="secondary">{politician.party}</Badge>
                      <Badge variant="outline">
                        <MapPin className="h-3 w-3 mr-1" />
                        {politician.region}
                      </Badge>
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        {politician.stats.yearsInOffice} years in office
                      </Badge>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= politician.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium">{politician.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({politician.totalRatings} ratings)
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

                    {!politician.isClaimed && (
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
              <div className="text-2xl font-bold text-primary">{politician.stats.yearsInOffice}</div>
              <div className="text-sm text-muted-foreground">Years in Office</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{politician.stats.billsSponsored}</div>
              <div className="text-sm text-muted-foreground">Bills Sponsored</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{politician.stats.projectsCompleted}</div>
              <div className="text-sm text-muted-foreground">Projects Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{politician.stats.followers.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="about" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
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
                  {politician.biography}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>Key Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {politician.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{achievement}</span>
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
                  <a href={`mailto:${politician.contact.email}`} className="text-blue-600 hover:underline">
                    {politician.contact.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <a href={`tel:${politician.contact.phone}`} className="text-blue-600 hover:underline">
                    {politician.contact.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <a href={politician.contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Official Website
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
        recipientId={politician.id}
        recipientName={politician.name}
        recipientType="politician"
      />

      <RatingModal
        open={showRating}
        onClose={() => setShowRating(false)}
        entityId={politician.id}
        entityName={politician.name}
        entityType="politician"
      />

      <ClaimProfileModal
        open={showClaim}
        onClose={() => setShowClaim(false)}
        profileId={politician.id}
        profileName={politician.name}
        profileType="politician"
      />

      <SuggestEditModal
        open={showSuggestEdit}
        onClose={() => setShowSuggestEdit(false)}
        profileId={politician.id}
        profileName={politician.name}
        profileType="politician"
      />
    </div>
  );
};