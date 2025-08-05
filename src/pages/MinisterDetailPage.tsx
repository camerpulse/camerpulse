import React, { useState } from 'react';
import { useMinisterSlug } from '@/hooks/useSlugResolver';
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
  Building2,
  Briefcase
} from 'lucide-react';
import { MessagingModal } from '@/components/Politics/MessagingModal';
import { RatingModal } from '@/components/Politics/RatingModal';
import { ClaimProfileModal } from '@/components/Politics/ClaimProfileModal';
import { SuggestEditModal } from '@/components/Politics/SuggestEditModal';

export const MinisterDetailPage: React.FC = () => {
  const { entity: minister, loading, error, entityId } = useMinisterSlug();
  const [showMessaging, setShowMessaging] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showClaim, setShowClaim] = useState(false);
  const [showSuggestEdit, setShowSuggestEdit] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Mock data - replace with actual data fetching
  const minister = {
    id: id || '1',
    name: 'Dr. Minette Libom Li Likeng',
    position: 'Minister of Posts and Telecommunications',
    ministry: 'Ministry of Posts and Telecommunications',
    party: 'CPDM',
    region: 'Centre',
    photo: '',
    rating: 4.3,
    totalRatings: 1156,
    isVerified: true,
    isClaimed: false,
    biography: 'Dr. Minette Libom Li Likeng has been serving as Minister of Posts and Telecommunications since 2015. She is a distinguished engineer and technology leader who has spearheaded major digital transformation initiatives in Cameroon, including the expansion of internet connectivity and mobile communications infrastructure.',
    achievements: [
      'Led national digital transformation strategy',
      'Expanded mobile network coverage to rural areas',
      'Launched national e-governance initiatives',
      'Established cybersecurity framework',
      'Promoted women in technology programs'
    ],
    contact: {
      email: 'minister@minpostel.gov.cm',
      phone: '+237 222 221 500',
      website: 'https://www.minpostel.gov.cm'
    },
    stats: {
      yearsInOffice: 9,
      projectsLaunched: 35,
      budgetManaged: '850B FCFA',
      followers: 32000
    },
    departments: [
      'Telecommunications Regulation',
      'Postal Services',
      'Information Technology',
      'Digital Innovation',
      'Cybersecurity'
    ],
    recentInitiatives: [
      'National Broadband Infrastructure Project 2024',
      'Digital Cameroon 2025 Strategy',
      'Rural Connectivity Enhancement Program',
      'National Cybersecurity Policy Implementation',
      'E-Government Services Platform'
    ],
    education: [
      'PhD in Telecommunications Engineering',
      'Master in Computer Science',
      'Bachelor in Electrical Engineering'
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
                  <AvatarImage src={minister.photo} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {getInitials(minister.name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                      <h1 className="text-3xl font-bold">{minister.name}</h1>
                      {minister.isVerified && (
                        <CheckCircle className="h-6 w-6 text-blue-500" />
                      )}
                    </div>
                    <p className="text-xl text-muted-foreground mb-1">{minister.position}</p>
                    <p className="text-lg text-primary mb-3">{minister.ministry}</p>
                    
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                      <Badge variant="secondary">{minister.party}</Badge>
                      <Badge variant="outline">
                        <MapPin className="h-3 w-3 mr-1" />
                        {minister.region}
                      </Badge>
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        {minister.stats.yearsInOffice} years in office
                      </Badge>
                      <Badge variant="outline">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {minister.stats.budgetManaged} budget
                      </Badge>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= minister.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium">{minister.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({minister.totalRatings} ratings)
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

                    {!minister.isClaimed && (
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
              <div className="text-2xl font-bold text-primary">{minister.stats.yearsInOffice}</div>
              <div className="text-sm text-muted-foreground">Years in Office</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{minister.stats.projectsLaunched}</div>
              <div className="text-sm text-muted-foreground">Projects Launched</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-lg font-bold text-primary">{minister.stats.budgetManaged}</div>
              <div className="text-sm text-muted-foreground">Budget Managed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{minister.stats.followers.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="about" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="initiatives">Initiatives</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="ratings">Ratings</TabsTrigger>
          </TabsList>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>Biography</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {minister.biography}
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Key Achievements</h3>
                    <ul className="space-y-3">
                      {minister.achievements.map((achievement, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Education</h3>
                    <ul className="space-y-3">
                      {minister.education.map((edu, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>{edu}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments">
            <Card>
              <CardHeader>
                <CardTitle>Ministry Departments</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {minister.departments.map((department, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{department}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="initiatives">
            <Card>
              <CardHeader>
                <CardTitle>Recent Initiatives</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {minister.recentInitiatives.map((initiative, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{initiative}</span>
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
                  <a href={`mailto:${minister.contact.email}`} className="text-blue-600 hover:underline">
                    {minister.contact.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <a href={`tel:${minister.contact.phone}`} className="text-blue-600 hover:underline">
                    {minister.contact.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <a href={minister.contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Official Ministry Website
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
        recipientId={minister.id}
        recipientName={minister.name}
        recipientType="minister"
      />

      <RatingModal
        open={showRating}
        onClose={() => setShowRating(false)}
        entityId={minister.id}
        entityName={minister.name}
        entityType="minister"
      />

      <ClaimProfileModal
        open={showClaim}
        onClose={() => setShowClaim(false)}
        profileId={minister.id}
        profileName={minister.name}
        profileType="minister"
      />

      <SuggestEditModal
        open={showSuggestEdit}
        onClose={() => setShowSuggestEdit(false)}
        profileId={minister.id}
        profileName={minister.name}
        profileType="minister"
      />
    </div>
  );
};