import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  MessageSquare, 
  Heart, 
  Share2, 
  Calendar,
  MapPin,
  Plus,
  Search,
  Settings,
  UserPlus,
  Eye,
  Clock
} from "lucide-react";
import { CamerPlayHeader } from "@/components/Layout/CamerPlayHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UserGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  region: string;
  privacy_level: string;
  member_count: number;
  post_count: number;
  created_at: string;
}

interface SocialPost {
  id: string;
  content: string;
  post_type: string;
  author_id: string;
  visibility: string;
  like_count: number;
  comment_count: number;
  share_count: number;
  created_at: string;
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  event_type: string;
  location: string;
  is_virtual: boolean;
  start_time: string;
  current_attendees: number;
  max_attendees: number;
  status: string;
}

interface UserConnection {
  id: string;
  following_id: string;
  connection_type: string;
  created_at: string;
}

const SocialCommunity: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [activeTab, setActiveTab] = useState('feed');

  useEffect(() => {
    fetchSocialData();
  }, []);

  const fetchSocialData = async () => {
    try {
      // Mock data for social community
      setGroups([
        { 
          id: "1", 
          name: "Civic Engagement Cameroon", 
          description: "Community for civic participation discussions",
          member_count: 1245,
          privacy_level: "public",
          category: "civic",
          region: "National",
          post_count: 567,
          created_at: "2024-01-01T00:00:00Z"
        },
        { 
          id: "2", 
          name: "Youth Development Network", 
          description: "Empowering young leaders across Cameroon",
          member_count: 890,
          privacy_level: "public", 
          category: "youth",
          region: "Centre",
          post_count: 342,
          created_at: "2024-01-05T00:00:00Z"
        }
      ]);

      setPosts([
        { 
          id: "1", 
          content: "Great discussion on improving education in rural areas!", 
          post_type: "text",
          author_id: "user1",
          visibility: "public",
          like_count: 156, 
          comment_count: 23,
          share_count: 12,
          created_at: "2024-01-15T10:00:00Z"
        },
        { 
          id: "2", 
          content: "Community clean-up event was a huge success!", 
          post_type: "text",
          author_id: "user2",
          visibility: "public",
          like_count: 89, 
          comment_count: 12,
          share_count: 5,
          created_at: "2024-01-14T15:30:00Z"
        }
      ]);

      setEvents([
        { 
          id: "1", 
          title: "Community Health Fair", 
          description: "Free health screenings and consultations",
          event_type: "health",
          location: "Yaounde Central Hospital",
          is_virtual: false,
          start_time: "2024-02-15T09:00:00Z",
          current_attendees: 234,
          max_attendees: 500,
          status: "scheduled"
        },
        { 
          id: "2", 
          title: "Youth Leadership Summit", 
          description: "Annual gathering of young leaders",
          event_type: "education",
          location: "Virtual Event",
          is_virtual: true,
          start_time: "2024-03-20T08:00:00Z", 
          current_attendees: 567,
          max_attendees: 1000,
          status: "scheduled"
        }
      ]);

      // Mock connections if user is logged in
      if (user) {
        setConnections([
          {
            id: "1",
            following_id: "user123",
            connection_type: "following",
            created_at: "2024-01-10T00:00:00Z"
          },
          {
            id: "2", 
            following_id: "user456",
            connection_type: "mutual",
            created_at: "2024-01-08T00:00:00Z"
          }
        ]);
      }
    } catch (error) {
      toast({
        title: "Error loading social data",
        description: "Could not load community data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!user || !newPost.trim()) return;

    try {
      // Mock post creation - would use real database when tables exist
      const newPostData = {
        id: Date.now().toString(),
        content: newPost,
        author_id: user.id,
        post_type: 'text',
        visibility: 'public',
        like_count: 0,
        comment_count: 0,
        share_count: 0,
        created_at: new Date().toISOString()
      };
      
      setPosts(prev => [newPostData, ...prev]);
      setNewPost('');
      
      toast({
        title: "Post created",
        description: "Your post has been shared successfully.",
      });
    } catch (error) {
      toast({
        title: "Error creating post",
        description: "Could not create your post.",
        variant: "destructive",
      });
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!user) return;

    try {
      // Mock group joining - would use real database when tables exist
      setGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, member_count: group.member_count + 1 }
          : group
      ));

      toast({
        title: "Joined group",
        description: "You have successfully joined the group.",
      });
    } catch (error) {
      toast({
        title: "Error joining group",
        description: "Could not join the group.",
        variant: "destructive",
      });
    }
  };

  const registerForEvent = async (eventId: string) => {
    if (!user) return;

    try {
      // Mock event registration - would use real database when tables exist
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, attendee_count: event.attendee_count + 1 }
          : event
      ));

      toast({
        title: "Registered for event",
        description: "You have successfully registered for the event.",
      });
    } catch (error) {
      toast({
        title: "Error registering",
        description: "Could not register for the event.",
        variant: "destructive",
      });
    }
  };

  const likePost = async (postId: string) => {
    if (!user) return;

    try {
      // Mock post liking - would use real database when tables exist
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, like_count: post.like_count + 1 }
          : post
      ));

      toast({
        title: "Post liked",
        description: "You liked this post.",
      });
    } catch (error) {
      console.log('Like error:', error);
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <CamerPlayHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading community data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CamerPlayHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Social Community</h1>
              <p className="text-muted-foreground">Connect, share, and engage with your community</p>
            </div>
            <Button onClick={() => setActiveTab('groups')}>
              <Users className="mr-2 h-4 w-4" />
              Explore Groups
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-primary" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{groups.length}</p>
                    <p className="text-xs text-muted-foreground">Active Groups</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <MessageSquare className="h-8 w-8 text-primary" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{posts.length}</p>
                    <p className="text-xs text-muted-foreground">Recent Posts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-primary" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{events.length}</p>
                    <p className="text-xs text-muted-foreground">Upcoming Events</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <UserPlus className="h-8 w-8 text-primary" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{connections.length}</p>
                    <p className="text-xs text-muted-foreground">Your Connections</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="feed" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Social Feed
              </TabsTrigger>
              <TabsTrigger value="groups" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Groups
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Events
              </TabsTrigger>
              <TabsTrigger value="connections" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Connections
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="space-y-6">
              {user && (
                <Card>
                  <CardHeader>
                    <CardTitle>Share Something</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="What's on your mind?"
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <div className="flex justify-end">
                        <Button onClick={createPost} disabled={!newPost.trim()}>
                          <Share2 className="mr-2 h-4 w-4" />
                          Share Post
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarImage src="" />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">User</span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                            <Badge variant="outline">{post.visibility}</Badge>
                          </div>
                          <p className="mb-4">{post.content}</p>
                          <div className="flex items-center gap-4">
                            <Button size="sm" variant="ghost" onClick={() => likePost(post.id)}>
                              <Heart className="mr-1 h-4 w-4" />
                              {post.like_count}
                            </Button>
                            <Button size="sm" variant="ghost">
                              <MessageSquare className="mr-1 h-4 w-4" />
                              {post.comment_count}
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Share2 className="mr-1 h-4 w-4" />
                              {post.share_count}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="groups" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {groups.map((group) => (
                  <Card key={group.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{group.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <MapPin className="h-4 w-4" />
                            {group.region}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">{group.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {group.description}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {group.member_count} members
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {group.post_count} posts
                          </span>
                        </div>
                        <Button size="sm" onClick={() => joinGroup(group.id)}>
                          Join Group
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="events" className="space-y-6">
              <div className="space-y-4">
                {events.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {event.description}
                          </p>
                          <div className="flex items-center gap-4 mb-4">
                            <span className="text-sm flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatEventDate(event.start_time)}
                            </span>
                            {event.is_virtual ? (
                              <Badge variant="secondary">Virtual</Badge>
                            ) : (
                              <span className="text-sm flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {event.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline">{event.event_type}</Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {event.current_attendees}/{event.max_attendees || '∞'} attending
                          </span>
                          <Badge variant="outline">{event.status}</Badge>
                        </div>
                        <Button size="sm" onClick={() => registerForEvent(event.id)}>
                          Register
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="connections" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Network</CardTitle>
                  <CardDescription>Manage your connections and followers</CardDescription>
                </CardHeader>
                <CardContent>
                  {connections.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">You haven't connected with anyone yet.</p>
                      <Button className="mt-4">
                        <Search className="mr-2 h-4 w-4" />
                        Find People
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {connections.map((connection) => (
                        <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage src="" />
                              <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">User {connection.following_id.slice(0, 8)}</p>
                              <p className="text-sm text-muted-foreground">
                                Connected {new Date(connection.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{connection.connection_type}</Badge>
                            <Button size="sm" variant="outline">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SocialCommunity;