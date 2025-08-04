import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  Vote,
  Users,
  MapPin,
  BookOpen,
  ArrowRight,
  Bell,
  TrendingUp,
  Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function MobileOptimizedDashboard() {
  const quickActions = [
    {
      title: 'Find Village',
      icon: MapPin,
      link: '/villages',
      color: 'bg-emerald-500',
      description: 'Connect with your heritage'
    },
    {
      title: 'Sign Petition',
      icon: Vote,
      link: '/petitions',
      color: 'bg-blue-500',
      description: 'Support causes'
    },
    {
      title: 'Learn Civics',
      icon: BookOpen,
      link: '/civic-education',
      color: 'bg-purple-500',
      description: 'Know your rights'
    },
    {
      title: 'Community',
      icon: Users,
      link: '/feed',
      color: 'bg-orange-500',
      description: 'Join discussions'
    }
  ];

  const stats = [
    { label: 'Petitions', value: '3', change: '+2' },
    { label: 'Village Links', value: '12', change: '+5' },
    { label: 'Civic Score', value: '742', change: '+25' }
  ];

  const notifications = [
    {
      message: 'New petition in your region',
      time: '30m ago',
      unread: true
    },
    {
      message: 'Village page updated',
      time: '2h ago',
      unread: true
    },
    {
      message: 'Weekly quiz available',
      time: '1d ago',
      unread: false
    }
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Mobile Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Globe className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">CamerPulse</h1>
        </div>
        <p className="text-sm text-muted-foreground">Your civic engagement hub</p>
      </div>

      {/* Quick Stats - Mobile optimized */}
      <div className="grid grid-cols-3 gap-2">
        {stats.map((stat, index) => (
          <Card key={index} className="p-3">
            <div className="text-center">
              <div className="text-lg font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
              <div className="text-xs text-green-600">{stat.change}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions - Mobile Grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.link}>
                <div className="p-3 border rounded-lg hover:shadow-md transition-shadow text-center space-y-2">
                  <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center mx-auto`}>
                    <action.icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mobile Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Updates</CardTitle>
            <Badge variant="secondary">3 new</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <div key={index} className={`p-3 rounded-lg border text-sm ${
                notification.unread ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'
              }`}>
                <p className="font-medium">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mobile CTA */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4 text-center space-y-3">
          <Heart className="h-6 w-6 text-primary mx-auto" />
          <div>
            <h3 className="font-medium">Make an Impact</h3>
            <p className="text-sm text-muted-foreground">
              Join thousands of Cameroonians building a better future
            </p>
          </div>
          <Link to="/villages">
            <Button size="sm" className="w-full">
              Find Your Village
              <ArrowRight className="h-3 w-3 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}