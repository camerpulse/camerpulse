import React from 'react';
import { Link } from 'react-router-dom';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Clock,
  Zap,
  Activity,
  Target,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Flame
} from 'lucide-react';
import { useMobileDetection } from '@/hooks/useMobileDetection';

export function ModernDashboard() {
  const { isMobile } = useMobileDetection();
  
  // Debug logging
  console.log('ModernDashboard is rendering!', { isMobile });
  
  // If mobile, we could return a mobile-optimized version
  // For now, keeping the responsive design approach
  
  const stats = [
    { 
      label: 'Petitions Signed', 
      value: '12', 
      icon: Vote, 
      link: '/petitions',
      change: '+3 this week',
      color: 'text-blue-500',
      trend: 'up'
    },
    { 
      label: 'Village Connections', 
      value: '8', 
      icon: MapPin, 
      link: '/villages',
      change: '+2 new',
      color: 'text-emerald-500',
      trend: 'up'
    },
    { 
      label: 'Civic Score', 
      value: '856', 
      icon: Star, 
      link: '/profile',
      change: '+124 points',
      color: 'text-amber-500',
      trend: 'up'
    },
    { 
      label: 'Impact Reach', 
      value: '2.4K', 
      icon: TrendingUp, 
      link: '/analytics',
      change: '+18%',
      color: 'text-purple-500',
      trend: 'up'
    }
  ];

  const quickActions = [
    {
      title: 'Start Petition',
      description: 'Create a petition for change in your community',
      icon: Vote,
      link: '/petitions/create',
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      featured: true
    },
    {
      title: 'Find Village',
      description: 'Connect with your ancestral village',
      icon: MapPin,
      link: '/villages',
      gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600'
    },
    {
      title: 'Learn Civics',
      description: 'Continue your civic education journey',
      icon: BookOpen,
      link: '/civic-education',
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      title: 'Track Progress',
      description: 'Monitor government accountability',
      icon: Shield,
      link: '/transparency',
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600'
    }
  ];

  const recentActivity = [
    {
      id: '1',
      type: 'petition',
      title: 'Signed \\"Better Healthcare Access\\"',
      description: 'Your signature was added successfully',
      timestamp: '2 hours ago',
      icon: Vote,
      user: { name: 'You', avatar: '/avatar.png' },
      status: 'completed'
    },
    {
      id: '2',
      type: 'village',
      title: 'Joined Bamenda Community Group',
      description: 'New connection in your village network',
      timestamp: '1 day ago',
      icon: Users,
      user: { name: 'You', avatar: '/avatar.png' },
      status: 'completed'
    },
    {
      id: '3',
      type: 'education',
      title: 'Completed Constitution Module',
      description: 'Earned 50 civic knowledge points',
      timestamp: '2 days ago',
      icon: Award,
      user: { name: 'You', avatar: '/avatar.png' },
      status: 'completed'
    }
  ];

  const upcomingEvents = [
    {
      id: '1',
      title: 'Community Town Hall',
      description: 'Virtual discussion on local development projects',
      date: 'Tomorrow',
      time: '3:00 PM',
      type: 'meeting',
      attendees: 142
    },
    {
      id: '2',
      title: 'Petition Deadline',
      description: '\\"Clean Water Initiative\\" needs 500 more signatures',
      date: 'In 3 days',
      time: '11:59 PM',
      type: 'deadline',
      urgent: true
    },
    {
      id: '3',
      title: 'Civic Quiz Week',
      description: 'Weekly knowledge challenge begins',
      date: 'Monday',
      time: '9:00 AM',
      type: 'education',
      reward: '100 XP'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-hero p-8 text-white">
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-white/30">
                  Welcome back!
                </Badge>
                <Badge className="bg-accent/90 text-white">
                  <Flame className="h-3 w-3 mr-1" />
                  3-day streak
                </Badge>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold">
                Make Your Voice <span className="text-accent">Heard</span>
              </h1>
              <p className="text-xl text-white/80 max-w-2xl">
                Join thousands of Cameroonians working together to build a better future through civic engagement.
              </p>
              <div className="flex flex-wrap gap-3">
                <EnhancedButton variant="glass" size="lg">
                  <Plus className="h-5 w-5" />
                  Create Petition
                </EnhancedButton>
                <EnhancedButton variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                  <Activity className="h-5 w-5" />
                  View Activity
                </EnhancedButton>
              </div>
            </div>
            
            {/* Progress Circle */}
            <div className="flex-shrink-0">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-sm"></div>
                <div className="absolute inset-2 rounded-full bg-white/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">Level 3</div>
                    <div className="text-sm opacity-80">Civic Leader</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Link key={index} to={stat.link}>
            <EnhancedCard variant="interactive" className="group">
              <EnhancedCardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <div className="flex items-center gap-1 text-xs text-emerald-600">
                      <TrendingUp className="h-3 w-3" />
                      {stat.change}
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl bg-primary/10 group-hover:scale-110 transition-transform ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>
          </Link>
        ))
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <EnhancedCard>
            <EnhancedCardHeader>
              <EnhancedCardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Quick Actions
              </EnhancedCardTitle>
              <EnhancedCardDescription>
                Jump into civic engagement with these popular actions
              </EnhancedCardDescription>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Link key={index} to={action.link}>
                    <EnhancedCard 
                      variant="interactive" 
                      className={`group relative overflow-hidden ${action.featured ? 'ring-2 ring-primary/20' : ''}`}
                    >
                      <EnhancedCardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl ${action.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <action.icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold group-hover:text-primary transition-colors">
                              {action.title}
                              {action.featured && (
                                <Badge className="ml-2 text-xs">Popular</Badge>
                              )}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </EnhancedCardContent>
                    </EnhancedCard>
                  </Link>
                ))
                }
              </div>
            </EnhancedCardContent>
          </EnhancedCard>

          {/* Recent Activity */}
          <EnhancedCard>
            <EnhancedCardHeader>
              <EnhancedCardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Recent Activity
              </EnhancedCardTitle>
              <EnhancedCardDescription>
                Your latest civic engagement activities
              </EnhancedCardDescription>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={activity.user.avatar} />
                      <AvatarFallback className="bg-gradient-primary text-white">
                        {activity.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <activity.icon className="h-4 w-4 text-primary" />
                        <h4 className="font-medium">{activity.title}</h4>
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))
                }
              </div>
              <EnhancedButton variant="outline" fullWidth className="mt-4">
                <Clock className="h-4 w-4" />
                View Full Activity Log
              </EnhancedButton>
            </EnhancedCardContent>
          </EnhancedCard>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <EnhancedCard>
            <EnhancedCardHeader>
              <EnhancedCardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Events
                </div>
                <Badge variant="secondary">3 active</Badge>
              </EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className={`p-4 rounded-lg border ${event.urgent ? 'border-destructive/20 bg-destructive/5' : 'border-border bg-muted/30'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          {event.urgent && (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{event.date}</span>
                          <span>{event.time}</span>
                        </div>
                        {event.attendees && (
                          <div className="flex items-center gap-1 mt-2">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{event.attendees} attending</span>
                          </div>
                        )}
                      </div>
                      <Badge variant={event.type === 'deadline' ? 'destructive' : 'secondary'} className="text-xs">
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                ))
                }
              </div>
              <EnhancedButton variant="outline" fullWidth className="mt-4">
                View All Events
              </EnhancedButton>
            </EnhancedCardContent>
          </EnhancedCard>

          {/* Progress Card */}
          <EnhancedCard variant="gradient">
            <EnhancedCardHeader>
              <EnhancedCardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Monthly Goal
              </EnhancedCardTitle>
              <EnhancedCardDescription>
                Civic engagement progress
              </EnhancedCardDescription>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Petitions Signed</span>
                    <span className="font-medium">8/10</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Learning Modules</span>
                    <span className="font-medium">3/5</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Community Events</span>
                    <span className="font-medium">2/3</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/20">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">Almost there!</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Complete 2 more actions to unlock "Civic Champion" badge
                </p>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </div>
      </div>
    </div>
  );
}

export default ModernDashboard;
