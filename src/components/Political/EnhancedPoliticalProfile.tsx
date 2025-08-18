import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Building, 
  Users, 
  Star, 
  TrendingUp, 
  Award, 
  Shield, 
  Eye,
  Heart,
  Share2,
  ExternalLink,
  Download,
  FileText,
  BarChart3,
  MessageSquare,
  Flag
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface EnhancedPoliticalProfileProps {
  entity: any;
  type: 'politician' | 'senator' | 'mp' | 'minister';
  isLoading?: boolean;
}

export const EnhancedPoliticalProfile: React.FC<EnhancedPoliticalProfileProps> = ({
  entity,
  type,
  isLoading = false
}) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('overview');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center space-x-6 animate-pulse">
              <div className="rounded-full bg-muted h-24 w-24" />
              <div className="space-y-3 flex-1">
                <div className="h-6 bg-muted rounded w-1/3" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-1/4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!entity) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-muted-foreground text-4xl mb-4">🔍</div>
          <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground">
            The {type} profile you're looking for doesn't exist or has been removed.
          </p>
          <Button className="mt-4" asChild>
            <Link to={`/${type}s`}>Back to Directory</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getEntityTitle = () => {
    switch (type) {
      case 'politician': return 'Politician';
      case 'senator': return 'Senator';
      case 'mp': return 'Member of Parliament';
      case 'minister': return 'Minister';
      default: return 'Political Figure';
    }
  };

  const performanceMetrics = [
    { 
      label: 'Performance Score', 
      value: entity.performance_score || 0, 
      color: 'text-blue-600',
      icon: TrendingUp 
    },
    { 
      label: 'Transparency Score', 
      value: entity.transparency_score || 0, 
      color: 'text-green-600',
      icon: Shield 
    },
    { 
      label: 'Integrity Rating', 
      value: entity.integrity_rating || 0, 
      color: 'text-purple-600',
      icon: Award 
    },
    { 
      label: 'Public Approval', 
      value: entity.approval_rating || 0, 
      color: 'text-orange-600',
      icon: Heart 
    }
  ];

  const legislativeData = [
    { label: 'Bills Proposed', value: entity.bills_proposed_count || 0 },
    { label: 'Bills Passed', value: entity.bills_passed_count || 0 },
    { label: 'Committee Memberships', value: entity.committee_memberships?.length || 0 },
    { label: 'Session Attendance', value: `${entity.attendance_rate || 0}%` }
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
            <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
              <AvatarImage src={entity.photo_url || entity.profile_picture_url} />
              <AvatarFallback className="text-4xl">
                {entity.name?.[0] || entity.full_name?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold">
                  {entity.name || entity.full_name}
                </h1>
                <p className="text-xl text-muted-foreground">
                  {entity.position || entity.office || getEntityTitle()}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {entity.political_party && (
                    <Badge variant="default" className="text-sm">
                      {entity.political_party}
                    </Badge>
                  )}
                  {entity.region && (
                    <Badge variant="outline" className="text-sm">
                      <MapPin className="h-3 w-3 mr-1" />
                      {entity.region}
                    </Badge>
                  )}
                  {entity.constituency && (
                    <Badge variant="outline" className="text-sm">
                      {entity.constituency}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center text-lg">
                  <Star className="h-5 w-5 text-yellow-500 mr-1" />
                  <span className="font-bold">{(entity.average_rating || 0).toFixed(1)}</span>
                  <span className="text-muted-foreground ml-1">
                    ({entity.total_ratings || 0} reviews)
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Eye className="h-4 w-4 mr-1" />
                  {entity.profile_views || 0} views
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-3">
              <Button 
                onClick={() => setIsFollowing(!isFollowing)}
                variant={isFollowing ? "outline" : "default"}
                className="min-w-[120px]"
              >
                <Heart className={`h-4 w-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <Card key={metric.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <IconComponent className={`h-4 w-4 mr-2 ${metric.color}`} />
                  {metric.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${metric.color}`}>
                  {metric.value.toFixed(1)}%
                </div>
                <Progress value={metric.value} className="mt-2" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="legislative">Legislative</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Biography</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {entity.biography || entity.bio || 
                     `${entity.name || entity.full_name} serves as ${entity.position || entity.office || getEntityTitle()} representing ${entity.region || entity.constituency || 'their constituency'}. More detailed biographical information will be added as it becomes available.`}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {entity.achievements?.map((achievement: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{achievement}</p>
                      </div>
                    )) || (
                      <p className="text-muted-foreground text-sm">
                        Key achievements and milestones will be displayed here as they are recorded.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Facts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {entity.date_of_birth && (
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Born: {new Date(entity.date_of_birth).toLocaleDateString()}</span>
                    </div>
                  )}
                  {entity.education && (
                    <div className="flex items-center text-sm">
                      <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Education: {entity.education}</span>
                    </div>
                  )}
                  {entity.years_in_office && (
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Years in Office: {entity.years_in_office}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Followers: {entity.follower_count || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Legislative Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {legislativeData.map((item) => (
                      <div key={item.label} className="text-center">
                        <div className="text-lg font-bold text-primary">
                          {item.value}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="legislative" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Legislative Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed legislative records, bill sponsorship, and voting history will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Performance trends, comparative analysis, and detailed metrics will be shown here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {entity.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <a href={`mailto:${entity.email}`} className="text-primary hover:underline">
                    {entity.email}
                  </a>
                </div>
              )}
              {entity.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <a href={`tel:${entity.phone}`} className="text-primary hover:underline">
                    {entity.phone}
                  </a>
                </div>
              )}
              {entity.office_address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <span>{entity.office_address}</span>
                </div>
              )}
              {entity.website_url && (
                <div className="flex items-center space-x-3">
                  <ExternalLink className="h-5 w-5 text-muted-foreground" />
                  <a 
                    href={entity.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Official Website
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Public Reviews & Ratings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Public reviews, ratings, and feedback will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};