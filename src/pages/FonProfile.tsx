import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Crown, Star, MapPin, Calendar, Phone, Mail, 
  ChevronRight, ArrowLeft, Award, Shield, Users,
  Eye, Heart, MessageSquare, Flag, Edit, Share2,
  Globe, Camera, BookOpen, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTraditionalLeaderBySlug } from '@/hooks/useTraditionalLeaders';

interface TraditionalLeader {
  id: string;
  full_name: string;
  title: string;
  village_id?: string;
  region: string;
  division?: string;
  subdivision?: string;
  gender?: string;
  accession_date?: string;
  birth_date?: string;
  biography?: string;
  portrait_url?: string;
  regalia_photos?: string[];
  honors?: string[];
  achievements?: string[];
  cultural_significance?: string;
  languages_spoken?: string[];
  contact_phone?: string;
  contact_email?: string;
  official_residence?: string;
  dynasty_name?: string;
  predecessor_name?: string;
  successor_name?: string;
  is_verified: boolean;
  overall_rating: number;
  total_ratings: number;
  status: string;
  slug: string;
  villages?: {
    village_name: string;
  };
}

interface LeaderRating {
  id: string;
  overall_rating: number;
  leadership_rating?: number;
  cultural_preservation_rating?: number;
  community_development_rating?: number;
  accessibility_rating?: number;
  review_title?: string;
  review_content?: string;
  created_at: string;
  profiles?: {
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
}

const FonProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const { leader, loading, error } = useTraditionalLeaderBySlug(slug || '');
  const [ratings, setRatings] = useState<LeaderRating[]>([]);
  const [user, setUser] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [newRating, setNewRating] = useState({
    overall_rating: 5,
    leadership_rating: 5,
    cultural_preservation_rating: 5,
    community_development_rating: 5,
    accessibility_rating: 5,
    review_title: '',
    review_content: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (leader) {
      fetchRatings();
    }
  }, [leader, user]);

  const fetchRatings = async () => {
    if (!leader) return;

    try {
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('traditional_leader_ratings')
        .select(`
          *,
          profiles:user_id(username, display_name, avatar_url)
        `)
        .eq('leader_id', leader.id)
        .eq('is_flagged', false)
        .order('created_at', { ascending: false });

      if (ratingsError) throw ratingsError;
      setRatings(ratingsData || []);

      // Check if current user has rated
      if (user) {
        const userRatingData = ratingsData?.find(r => r.user_id === user.id);
        setUserRating(userRatingData);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      toast.error('Failed to load ratings');
    }
  };

  const submitRating = async () => {
    if (!user || !leader) {
      toast.error('Please log in to submit a rating');
      return;
    }

    try {
      const { error } = await supabase
        .from('traditional_leader_ratings')
        .insert({
          leader_id: leader.id,
          user_id: user.id,
          ...newRating
        });

      if (error) throw error;
      
      toast.success('Rating submitted successfully!');
      setShowRatingForm(false);
      fetchRatings(); // Refresh ratings
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    }
  };

  const getTitleInfo = (title: string) => {
    const titles = {
      'fon': { label: 'Fon', emoji: '👑', description: 'Traditional ruler of the Fondom' },
      'chief': { label: 'Chief', emoji: '🏛️', description: 'Traditional village leader' },
      'sultan': { label: 'Sultan', emoji: '🕌', description: 'Islamic traditional ruler' },
      'lamido': { label: 'Lamido', emoji: '⚔️', description: 'Fulani traditional leader' },
      'emir': { label: 'Emir', emoji: '🌟', description: 'Traditional emirate ruler' },
      'oba': { label: 'Oba', emoji: '👑', description: 'Yoruba traditional king' },
      'sarki': { label: 'Sarki', emoji: '🏰', description: 'Hausa traditional ruler' },
      'etsu': { label: 'Etsu', emoji: '🔱', description: 'Nupe traditional leader' },
      'mai': { label: 'Mai', emoji: '⭐', description: 'Traditional ruler title' }
    };
    return titles[title] || { label: title, emoji: '👑', description: 'Traditional leader' };
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-amber-400/50 text-amber-400" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground" />);
    }

    return stars;
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const shareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${leader?.full_name} - ${getTitleInfo(leader?.title || '').label}`,
          text: `Learn about ${leader?.full_name}, ${getTitleInfo(leader?.title || '').label} of ${leader?.villages?.village_name}, ${leader?.region}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Profile link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <div className="animate-pulse">
          <div className="h-80 bg-gradient-to-r from-amber-800 to-orange-700" />
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="p-6">
                    <div className="space-y-4">
                      <div className="h-6 bg-muted rounded w-1/3" />
                      <div className="h-4 bg-muted rounded w-full" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                    </div>
                  </Card>
                ))}
              </div>
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="h-32 bg-muted rounded" />
                    <div className="h-6 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded" />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!leader) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <Card className="max-w-md text-center p-8">
          <CardContent className="space-y-4">
            <Crown className="h-16 w-16 text-amber-400 mx-auto" />
            <h2 className="text-2xl font-bold text-amber-900">Leader Not Found</h2>
            <p className="text-amber-700">
              The traditional leader you're looking for doesn't exist or has been removed.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Link to="/fons">
                <Button className="bg-amber-600 hover:bg-amber-700">
                  Browse Directory
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const titleInfo = getTitleInfo(leader.title);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-amber-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-amber-600 hover:text-amber-800">Home</Link>
            <ChevronRight className="h-4 w-4 text-amber-400" />
            <Link to="/fons" className="text-amber-600 hover:text-amber-800">Fons Directory</Link>
            <ChevronRight className="h-4 w-4 text-amber-400" />
            <span className="font-medium text-amber-900">{leader.full_name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-amber-800 via-orange-700 to-red-800 text-white overflow-hidden">
        {/* African Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm10 0c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Portrait */}
            <div className="relative">
              <div className="w-48 h-48 lg:w-64 lg:h-64 rounded-lg overflow-hidden border-4 border-amber-300 shadow-2xl">
                {leader.portrait_url ? (
                  <img 
                    src={leader.portrait_url} 
                    alt={leader.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-b from-amber-200 to-orange-200 flex items-center justify-center">
                    <Crown className="h-24 w-24 text-amber-700" />
                  </div>
                )}
              </div>
              
              {/* Decorative Frame */}
              <div className="absolute -inset-2 border-2 border-amber-200/50 rounded-lg pointer-events-none" />
            </div>

            {/* Leader Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{titleInfo.emoji}</span>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold mb-2">{leader.full_name}</h1>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-amber-600 text-white text-lg px-3 py-1">
                        {titleInfo.label}
                      </Badge>
                      {leader.is_verified && (
                        <Badge className="bg-emerald-600 text-white text-lg px-3 py-1">
                          <Shield className="h-4 w-4 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="text-white border-white hover:bg-white hover:text-amber-800"
                    onClick={shareProfile}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-white border-white hover:bg-white hover:text-amber-800"
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Report
                  </Button>
                </div>
              </div>

              <p className="text-amber-100 text-lg mb-4">{titleInfo.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-amber-100">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>{leader.villages?.village_name || 'Multiple Villages'}, {leader.region}</span>
                </div>
                
                {leader.accession_date && (
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>Enthroned {new Date(leader.accession_date).getFullYear()}</span>
                  </div>
                )}

                {leader.total_ratings > 0 && (
                  <div className="flex items-center">
                    <div className="flex items-center mr-2">
                      {renderStars(leader.overall_rating)}
                    </div>
                    <span>{leader.overall_rating.toFixed(1)} ({leader.total_ratings} reviews)</span>
                  </div>
                )}

                {leader.dynasty_name && (
                  <div className="flex items-center">
                    <Crown className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>{leader.dynasty_name} Dynasty</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="village">Village</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Biography */}
                {leader.biography && (
                  <Card className="border-amber-200">
                    <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100">
                      <CardTitle className="flex items-center text-amber-900">
                        <BookOpen className="h-5 w-5 mr-2" />
                        Biography
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-amber-800 leading-relaxed">{leader.biography}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Cultural Significance */}
                {leader.cultural_significance && (
                  <Card className="border-amber-200">
                    <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100">
                      <CardTitle className="flex items-center text-amber-900">
                        <Sparkles className="h-5 w-5 mr-2" />
                        Cultural Significance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-amber-800 leading-relaxed">{leader.cultural_significance}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Honors & Achievements */}
                {(leader.honors?.length > 0 || leader.achievements?.length > 0) && (
                  <Card className="border-amber-200">
                    <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100">
                      <CardTitle className="flex items-center text-amber-900">
                        <Award className="h-5 w-5 mr-2" />
                        Honors & Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      {leader.honors?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-amber-900 mb-2">Honors</h4>
                          <ul className="list-disc list-inside space-y-1 text-amber-800">
                            {leader.honors.map((honor, index) => (
                              <li key={index}>{honor}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {leader.achievements?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-amber-900 mb-2">Achievements</h4>
                          <ul className="list-disc list-inside space-y-1 text-amber-800">
                            {leader.achievements.map((achievement, index) => (
                              <li key={index}>{achievement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="gallery" className="space-y-6">
                <Card className="border-amber-200">
                  <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100">
                    <CardTitle className="flex items-center text-amber-900">
                      <Camera className="h-5 w-5 mr-2" />
                      Royal Gallery
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {leader.regalia_photos?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {leader.regalia_photos.map((photo, index) => (
                          <div key={index} className="aspect-square rounded-lg overflow-hidden border-2 border-amber-200">
                            <img 
                              src={photo} 
                              alt={`${leader.full_name} regalia ${index + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Camera className="h-16 w-16 mx-auto text-amber-400 mb-4" />
                        <p className="text-amber-700">No photos available yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                {/* Rating Summary */}
                {leader.total_ratings > 0 && (
                  <Card className="border-amber-200">
                    <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100">
                      <CardTitle className="flex items-center text-amber-900">
                        <Star className="h-5 w-5 mr-2" />
                        Rating Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-amber-900 mb-2">
                            {leader.overall_rating.toFixed(1)}
                          </div>
                          <div className="flex items-center justify-center mb-2">
                            {renderStars(leader.overall_rating)}
                          </div>
                          <p className="text-amber-700">{leader.total_ratings} review{leader.total_ratings !== 1 ? 's' : ''}</p>
                        </div>
                        
                        <div className="space-y-3">
                          {/* Rating breakdown would go here */}
                          <div className="flex items-center">
                            <span className="text-sm text-amber-700 w-20">5 stars</span>
                            <Progress value={75} className="flex-1 mx-2" />
                            <span className="text-sm text-amber-700">75%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Add Review Button */}
                {user && !userRating && (
                  <Card className="border-amber-200">
                    <CardContent className="p-6 text-center">
                      <h3 className="text-lg font-semibold text-amber-900 mb-2">Share Your Experience</h3>
                      <p className="text-amber-700 mb-4">Help others learn about this traditional leader</p>
                      <Button 
                        onClick={() => setShowRatingForm(true)}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Write a Review
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                  {ratings.map((rating) => (
                    <Card key={rating.id} className="border-amber-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={rating.profiles?.avatar_url} />
                              <AvatarFallback>
                                {rating.profiles?.display_name?.[0] || rating.profiles?.username?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-amber-900">
                                {rating.profiles?.display_name || rating.profiles?.username || 'Anonymous'}
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center">
                                  {renderStars(rating.overall_rating)}
                                </div>
                                <span className="text-sm text-amber-700">
                                  {new Date(rating.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {rating.review_title && (
                          <h4 className="font-semibold text-amber-900 mb-2">{rating.review_title}</h4>
                        )}
                        
                        {rating.review_content && (
                          <p className="text-amber-800">{rating.review_content}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="village" className="space-y-6">
                {leader.village_id ? (
                  <Card className="border-amber-200">
                    <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100">
                      <CardTitle className="flex items-center text-amber-900">
                        <MapPin className="h-5 w-5 mr-2" />
                        Village Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-amber-900">
                            {leader.villages?.village_name}
                          </h3>
                          <p className="text-amber-700">{leader.subdivision}, {leader.division}, {leader.region}</p>
                        </div>
                        
                        <Link to={`/villages/${leader.villages?.village_name?.toLowerCase().replace(/\s+/g, '-')}`}>
                          <Button className="bg-amber-600 hover:bg-amber-700">
                            <Eye className="h-4 w-4 mr-2" />
                            Visit Village Page
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-amber-200">
                    <CardContent className="p-6 text-center">
                      <MapPin className="h-16 w-16 mx-auto text-amber-400 mb-4" />
                      <p className="text-amber-700">This leader oversees multiple villages or the specific village information is not available.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card className="border-amber-200 sticky top-4">
              <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100">
                <CardTitle className="text-amber-900">Quick Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {leader.birth_date && (
                  <div>
                    <h4 className="font-semibold text-amber-900">Age</h4>
                    <p className="text-amber-800">{calculateAge(leader.birth_date)} years old</p>
                  </div>
                )}

                {leader.languages_spoken?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-amber-900">Languages</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {leader.languages_spoken.map((lang, index) => (
                        <Badge key={index} variant="outline" className="border-amber-300 text-amber-700">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {leader.predecessor_name && (
                  <div>
                    <h4 className="font-semibold text-amber-900">Predecessor</h4>
                    <p className="text-amber-800">{leader.predecessor_name}</p>
                  </div>
                )}

                {leader.official_residence && (
                  <div>
                    <h4 className="font-semibold text-amber-900">Official Residence</h4>
                    <p className="text-amber-800">{leader.official_residence}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            {(leader.contact_phone || leader.contact_email) && (
              <Card className="border-amber-200">
                <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100">
                  <CardTitle className="text-amber-900">Contact</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {leader.contact_phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-amber-600" />
                      <a href={`tel:${leader.contact_phone}`} className="text-amber-800 hover:text-amber-900">
                        {leader.contact_phone}
                      </a>
                    </div>
                  )}
                  
                  {leader.contact_email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-amber-600" />
                      <a href={`mailto:${leader.contact_email}`} className="text-amber-800 hover:text-amber-900">
                        {leader.contact_email}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Related Leaders */}
            <Card className="border-amber-200">
              <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100">
                <CardTitle className="text-amber-900">Related Leaders</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Link to={`/fons?region=${leader.region}`}>
                    <Button variant="outline" className="w-full justify-start border-amber-300 text-amber-700 hover:bg-amber-50">
                      <Users className="h-4 w-4 mr-2" />
                      Other leaders from {leader.region}
                    </Button>
                  </Link>
                  
                  <Link to={`/fons?title=${leader.title}`}>
                    <Button variant="outline" className="w-full justify-start border-amber-300 text-amber-700 hover:bg-amber-50">
                      <Crown className="h-4 w-4 mr-2" />
                      Other {getTitleInfo(leader.title).label}s
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Rating Form Modal would go here */}
      
    </div>
  );
};

export default FonProfile;