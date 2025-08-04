import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  Vote,
  Users,
  MapPin,
  BookOpen,
  Shield,
  Star,
  TrendingUp,
  MessageSquare,
  Award,
  Heart,
  Plus,
  ArrowRight,
  Bell,
  Calendar,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function CamerPulseDashboard() {
  const stats = [
    { label: 'My Petitions', value: '3', icon: Vote, link: '/petitions' },
    { label: 'Village Connections', value: '12', icon: MapPin, link: '/villages' },
    { label: 'Learning Progress', value: '85%', icon: BookOpen, link: '/civic-education' },
    { label: 'Civic Score', value: '742', icon: Star, link: '/profile' }
  ];

  const recentActivity = [
    {
      id: '1',
      type: 'petition',
      title: 'Signed: Better Roads for Douala',
      description: 'Your signature was added to the petition',
      timestamp: '2 hours ago',
      icon: Vote,
      color: 'text-blue-500'
    },
    {
      id: '2',
      type: 'village',
      title: 'Connected with Bamenda Community',
      description: 'New connection in your village network',
      timestamp: '1 day ago',
      icon: Users,
      color: 'text-green-500'
    },
    {
      id: '3',
      type: 'education',
      title: 'Completed: Constitution Chapter 3',
      description: 'Earned 50 civic knowledge points',
      timestamp: '2 days ago',
      icon: Award,
      color: 'text-purple-500'
    }
  ];

  const quickActions = [
    {
      title: 'Find My Village',
      description: 'Connect with your ancestral village',
      icon: MapPin,
      link: '/villages',
      color: 'bg-emerald-500'
    },
    {
      title: 'Start Petition',
      description: 'Create a petition for change',
      icon: Vote,
      link: '/petitions/create',
      color: 'bg-blue-500'
    },
    {
      title: 'Learn Civics',
      description: 'Continue your civic education',
      icon: BookOpen,
      link: '/civic-education',
      color: 'bg-purple-500'
    },
    {
      title: 'Transparency',
      description: 'Track government accountability',
      icon: Shield,
      link: '/transparency',
      color: 'bg-orange-500'
    }
  ];

  const notifications = [
    {
      id: '1',
      message: 'New petition in your region: "Clean Water Initiative"',
      time: '30 min ago',
      unread: true
    },
    {
      id: '2',
      message: 'Your village page has 5 new members',
      time: '2 hours ago',
      unread: true
    },
    {
      id: '3',
      message: 'Weekly civic quiz is now available',
      time: '1 day ago',
      unread: false
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome to CamerPulse</h1>
          <p className="text-muted-foreground">Your civic engagement dashboard</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Link to="/profile">
            <Button size="sm">
              <Users className="h-4 w-4 mr-2" />
              Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Link key={index} to={stat.link}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with civic engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Link key={index} to={action.link}>
                    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <action.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium group-hover:text-primary transition-colors">{action.title}</h3>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest civic engagement activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                    <activity.icon className={`h-5 w-5 mt-1 ${activity.color}`} />
                    <div className="flex-1">
                      <h4 className="font-medium">{activity.title}</h4>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" className="w-full">
                  <Clock className="h-4 w-4 mr-2" />
                  View All Activity
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications & Updates */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Notifications
                <Badge variant="secondary">3 new</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className={`p-3 rounded-lg border ${notification.unread ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'}`}>
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Notifications
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Civic Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Community Meeting</p>
                    <p className="text-xs text-muted-foreground">Tomorrow, 3:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <Vote className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-sm">Petition Deadline</p>
                    <p className="text-xs text-muted-foreground">3 days remaining</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium text-sm">Civic Quiz Week</p>
                    <p className="text-xs text-muted-foreground">Starts Monday</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Featured Content */}
      <Card>
        <CardHeader>
          <CardTitle>Featured for You</CardTitle>
          <CardDescription>Personalized civic engagement opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Constitution Week</h3>
              <p className="text-sm text-muted-foreground mb-3">Learn about fundamental rights and duties</p>
              <Link to="/civic-education">
                <Button size="sm" variant="outline">Join Learning</Button>
              </Link>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Regional Town Hall</h3>
              <p className="text-sm text-muted-foreground mb-3">Virtual discussion on local development</p>
              <Button size="sm" variant="outline">Register</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Village Heritage Project</h3>
              <p className="text-sm text-muted-foreground mb-3">Share your village's history and culture</p>
              <Link to="/villages">
                <Button size="sm" variant="outline">Contribute</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CamerPulseDashboard;