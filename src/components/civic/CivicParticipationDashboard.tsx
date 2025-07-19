import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Users, Calendar, Heart, 
  Plus, MessageSquare, Vote, MapPin,
  Clock, User, Hash
} from 'lucide-react';
import { 
  usePetitions, 
  useForumCategories, 
  useForumTopics,
  useCommunityEvents, 
  useVolunteerOpportunities 
} from '@/hooks/useCivicParticipation';
import { formatDistanceToNow } from 'date-fns';

export const CivicParticipationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('petitions');
  
  const { data: petitions } = usePetitions();
  const { data: forumCategories } = useForumCategories();
  const { data: forumTopics } = useForumTopics();
  const { data: events } = useCommunityEvents({ status: 'upcoming' });
  const { data: volunteerOpportunities } = useVolunteerOpportunities({ status: 'active' });

  const stats = [
    {
      title: 'Active Petitions',
      value: petitions?.filter(p => p.status === 'active').length || 0,
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'Forum Discussions',
      value: forumTopics?.length || 0,
      icon: MessageSquare,
      color: 'text-green-600'
    },
    {
      title: 'Upcoming Events',
      value: events?.length || 0,
      icon: Calendar,
      color: 'text-purple-600'
    },
    {
      title: 'Volunteer Opportunities',
      value: volunteerOpportunities?.length || 0,
      icon: Heart,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Civic Participation
          </h1>
          <p className="text-muted-foreground mt-2">
            Engage with your community through petitions, forums, events, and volunteer work
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create New
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="petitions">Petitions</TabsTrigger>
          <TabsTrigger value="forums">Forums</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="volunteer">Volunteer</TabsTrigger>
        </TabsList>

        <TabsContent value="petitions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Active Petitions</h2>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Start Petition
            </Button>
          </div>
          
          <div className="grid gap-4">
            {petitions?.slice(0, 5).map((petition) => (
              <Card key={petition.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{petition.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {petition.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {petition.current_signatures} signatures
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {petition.location || 'Cameroon'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDistanceToNow(new Date(petition.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={petition.status === 'active' ? 'default' : 'secondary'}>
                        {petition.status}
                      </Badge>
                      <div className="mt-2">
                        <div className="text-sm text-muted-foreground">
                          Goal: {petition.goal_signatures}
                        </div>
                        <div className="w-24 bg-muted rounded-full h-2 mt-1">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ 
                              width: `${Math.min(100, (petition.current_signatures / petition.goal_signatures) * 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Badge variant="outline">{petition.category}</Badge>
                      <Badge variant="outline">{petition.target_institution}</Badge>
                    </div>
                    <Button size="sm">
                      <Vote className="h-4 w-4 mr-2" />
                      Sign Petition
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="forums" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Community Forums</h2>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Topic
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forumCategories?.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-3 h-3 rounded-full mt-2"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{category.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {category.description}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                        <span>
                          {forumTopics?.filter(t => t.category_id === category.id).length || 0} topics
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Discussions</h3>
            {forumTopics?.slice(0, 5).map((topic) => (
              <Card key={topic.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">{topic.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          Creator
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {topic.reply_count} replies
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDistanceToNow(new Date(topic.last_activity_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {topic.is_pinned && (
                        <Badge variant="secondary" className="text-xs">Pinned</Badge>
                      )}
                      {topic.tags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Hash className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </div>

          <div className="grid gap-4">
            {events?.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        <Badge variant="outline">{event.event_type}</Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(event.start_time).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(event.start_time).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'}>
                        {event.status}
                      </Badge>
                      {event.max_attendees && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          {event.current_attendees}/{event.max_attendees} attending
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      {event.tags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      {event.registration_required ? 'Register' : 'Attend'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="volunteer" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Volunteer Opportunities</h2>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Post Opportunity
            </Button>
          </div>

          <div className="grid gap-4">
            {volunteerOpportunities?.map((opportunity) => (
              <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{opportunity.title}</h3>
                        <Badge variant="outline">{opportunity.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        by {opportunity.organization}
                      </p>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {opportunity.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {opportunity.time_commitment}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {opportunity.location}
                        </span>
                        {opportunity.spots_available && (
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {opportunity.spots_available - opportunity.spots_filled} spots left
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={opportunity.status === 'active' ? 'default' : 'secondary'}>
                        {opportunity.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      {opportunity.skills_required?.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <Button size="sm">
                      <Heart className="h-4 w-4 mr-2" />
                      Apply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};