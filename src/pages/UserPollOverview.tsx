import React from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { PollsQuickGuide } from '@/components/Polls/PollsQuickGuide';
import { 
  BarChart3, 
  Plus, 
  Vote, 
  Eye, 
  Share2,
  Settings,
  TrendingUp,
  Users,
  Clock,
  Shield,
  Target,
  ArrowRight,
  Zap
} from 'lucide-react';

const UserPollOverview = () => {
  const { user, profile } = useAuth();

  const quickActions = [
    {
      title: "Create New Poll",
      description: "Design and launch a new poll",
      icon: Plus,
      link: "/dashboard/polls",
      color: "text-primary",
      badge: "Quick Start"
    },
    {
      title: "My Dashboard",
      description: "Manage all your polls in one place",
      icon: BarChart3,
      link: "/dashboard/polls",
      color: "text-emerald-500",
      badge: "Analytics"
    },
    {
      title: "Browse Polls",
      description: "Participate in community discussions",
      icon: Vote,
      link: "/polls",
      color: "text-blue-500",
      badge: "Active"
    },
    {
      title: "My Activity",
      description: "View your voting history",
      icon: Eye,
      link: "/polls/user-dashboard",
      color: "text-purple-500",
      badge: "History"
    }
  ];

  const features = [
    {
      title: "Advanced Analytics",
      description: "Real-time vote tracking and performance metrics",
      icon: TrendingUp,
      available: true
    },
    {
      title: "Fraud Protection",
      description: "CAPTCHA and bot detection for secure voting",
      icon: Shield,
      available: true
    },
    {
      title: "Regional Insights",
      description: "See how different regions respond to your polls",
      icon: Target,
      available: true
    },
    {
      title: "Export & Sharing",
      description: "Share results anywhere and export data",
      icon: Share2,
      available: true
    }
  ];

  const steps = [
    {
      step: 1,
      title: "Create Your First Poll",
      description: "Use our poll creator with templates and advanced options",
      icon: Plus
    },
    {
      step: 2,
      title: "Share & Promote",
      description: "Share your poll across social media and messaging apps",
      icon: Share2
    },
    {
      step: 3,
      title: "Monitor Performance",
      description: "Track votes, engagement, and regional sentiment",
      icon: BarChart3
    },
    {
      step: 4,
      title: "Analyze Results",
      description: "Export data and gain insights from your results",
      icon: TrendingUp
    }
  ];

  if (!user) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to access your personalized poll dashboard and create your own polls.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/auth">Sign In to Continue</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/polls">Browse Public Polls</Link>
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {profile?.display_name || user.email?.split('@')[0]}!
            </h1>
            <p className="text-muted-foreground">
              Ready to create engaging polls and connect with the Cameroonian community?
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow group cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg bg-opacity-10 flex items-center justify-center`} 
                           style={{ backgroundColor: `${action.color}20` }}>
                        <Icon className={`w-5 h-5 ${action.color}`} />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {action.badge}
                      </Badge>
                    </div>
                    <h3 className="font-medium mb-2 group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {action.description}
                    </p>
                    <Button asChild size="sm" className="w-full">
                      <Link to={action.link} className="flex items-center gap-2">
                        Access
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* How to Get Started */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                How to Get Started with Polls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={index} className="text-center space-y-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-semibold text-sm">
                        {step.step}
                      </div>
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  );
                })}
              </div>
              <div className="text-center mt-6">
                <Button asChild size="lg">
                  <Link to="/dashboard/polls" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Your First Poll Now
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Platform Features */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What You Can Do with CamerPulse Polls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-border/50">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                      <Badge variant={feature.available ? "default" : "secondary"} className="text-xs">
                        {feature.available ? "Available" : "Coming Soon"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Guide */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Complete Guide</h2>
            <PollsQuickGuide />
          </div>

          {/* Quick Stats */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Ready to Make an Impact?</h3>
                  <p className="text-muted-foreground">
                    Join 127K+ active citizens using CamerPulse to shape conversations across Cameroon.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild>
                    <Link to="/dashboard/polls" className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Go to Dashboard
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/polls" className="flex items-center gap-2">
                      <Vote className="w-4 h-4" />
                      Browse Polls
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default UserPollOverview;