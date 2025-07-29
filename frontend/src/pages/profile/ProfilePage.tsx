import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { UserProfileCard } from '@/components/profile/UserProfileCard';
import { UserProfileForm } from '@/components/profile/UserProfileForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Edit, 
  ArrowLeft, 
  Settings,
  Award,
  Users,
  Eye,
  Calendar,
  Briefcase,
  GraduationCap,
  Star,
  BarChart3,
  Vote
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    userProfile, 
    getUserProfile, 
    getProfileByUsername, 
    trackProfileView,
    sendConnectionRequest 
  } = useUserProfile();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const isOwnProfile = !username || profile?.user_id === user?.id;

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      let profileData = null;

      if (username) {
        // Load profile by username
        profileData = await getProfileByUsername(username);
        if (profileData && profileData.user_id !== user?.id) {
          // Track profile view for other users
          await trackProfileView(profileData.user_id);
        }
      } else if (user) {
        // Load own profile
        profileData = await getUserProfile();
      }

      setProfile(profileData);
      setLoading(false);
    };

    loadProfile();
  }, [username, user]);

  const handleEditSuccess = () => {
    setIsEditing(false);
    // Reload profile data
    if (isOwnProfile) {
      getUserProfile().then(setProfile);
    }
  };

  const handleSendMessage = () => {
    // Navigate to messaging system (to be implemented)
    console.log('Send message to', profile.user_id);
  };

  const handleConnect = async () => {
    if (profile) {
      await sendConnectionRequest(profile.user_id, 'friend');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {username ? `User @${username} doesn't exist or has a private profile.` : 'Please create your profile first.'}
            </p>
            {isOwnProfile && (
              <Button onClick={() => setIsEditing(true)}>
                Create Profile
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate(-1)} className="ml-2">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Button>
          </div>
          <UserProfileForm onSuccess={handleEditSuccess} existingProfile={profile} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/users')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold">
              {isOwnProfile ? 'My Profile' : `${profile.display_name || profile.username}'s Profile`}
            </h1>
            <p className="text-muted-foreground">
              {isOwnProfile ? 'Manage your personal information' : 'View profile details'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <UserProfileCard
              profile={profile}
              isOwnProfile={isOwnProfile}
              onEditProfile={() => setIsEditing(true)}
              onSendMessage={handleSendMessage}
              onConnect={handleConnect}
              showActions={true}
            />
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="polls">My Polls</TabsTrigger>
                <TabsTrigger value="connections">Connections</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Extended Bio */}
                {profile.bio && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        About
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="leading-relaxed">{profile.bio}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Skills & Expertise */}
                {profile.skills && profile.skills.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        Skills & Expertise
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill: string) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Interests */}
                {profile.interests && profile.interests.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Interests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest: string) => (
                          <Badge key={interest} variant="outline">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Languages */}
                {profile.languages && profile.languages.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Languages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profile.languages.map((language: string) => (
                          <Badge key={language} variant="outline">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Experience Tab */}
              <TabsContent value="experience" className="space-y-6">
                {/* Work Experience */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Work Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profile.work_experience && profile.work_experience.length > 0 ? (
                      <div className="space-y-4">
                        {profile.work_experience.map((exp: any, index: number) => (
                          <div key={index} className="border-l-2 border-primary pl-4">
                            <h4 className="font-semibold">{exp.position}</h4>
                            <p className="text-muted-foreground">{exp.company}</p>
                            <p className="text-sm text-muted-foreground">
                              {exp.start_date} - {exp.end_date || 'Present'}
                            </p>
                            {exp.description && (
                              <p className="text-sm mt-2">{exp.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No work experience added yet.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Education */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profile.education && profile.education.length > 0 ? (
                      <div className="space-y-4">
                        {profile.education.map((edu: any, index: number) => (
                          <div key={index} className="border-l-2 border-secondary pl-4">
                            <h4 className="font-semibold">{edu.degree}</h4>
                            <p className="text-muted-foreground">{edu.institution}</p>
                            <p className="text-sm text-muted-foreground">
                              {edu.start_year} - {edu.end_year || 'Present'}
                            </p>
                            {edu.description && (
                              <p className="text-sm mt-2">{edu.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No education information added yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Achievements & Awards
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profile.achievements && profile.achievements.length > 0 ? (
                      <div className="space-y-4">
                        {profile.achievements.map((achievement: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4">
                            <h4 className="font-semibold">{achievement.title}</h4>
                            <p className="text-muted-foreground">{achievement.organization}</p>
                            <p className="text-sm text-muted-foreground">{achievement.date}</p>
                            {achievement.description && (
                              <p className="text-sm mt-2">{achievement.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No achievements added yet.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Portfolio */}
                {profile.portfolio_items && profile.portfolio_items.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Portfolio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.portfolio_items.map((item: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4">
                            <h4 className="font-semibold">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            {item.url && (
                              <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-sm"
                              >
                                View Project
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* My Polls Tab */}
              <TabsContent value="polls" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      My Polls Activity
                    </CardTitle>
                    <CardDescription>
                      Polls you've created and participated in
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
                        <Vote className="h-8 w-8 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Polls Created</p>
                          <p className="text-2xl font-bold">--</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-secondary/5 rounded-lg">
                        <BarChart3 className="h-8 w-8 text-secondary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Votes Cast</p>
                          <p className="text-2xl font-bold">--</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Quick Actions</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Button 
                          onClick={() => navigate('/dashboard/polls')}
                          className="flex items-center gap-2"
                        >
                          <BarChart3 className="h-4 w-4" />
                          My Dashboard
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => navigate('/polls')}
                          className="flex items-center gap-2"
                        >
                          <Vote className="h-4 w-4" />
                          Browse Polls
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Connections Tab */}
              <TabsContent value="connections" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Connections
                    </CardTitle>
                    <CardDescription>
                      Friends and professional connections
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center py-8">
                      Connections feature coming soon...
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};