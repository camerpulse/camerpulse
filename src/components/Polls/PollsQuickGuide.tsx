import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Plus, 
  Vote, 
  Shield, 
  Users, 
  TrendingUp,
  Eye,
  Share2,
  Settings,
  ArrowRight
} from 'lucide-react';

export const PollsQuickGuide = () => {
  const { user } = useAuth();

  const features = [
    {
      title: "Create Polls",
      description: "Design custom polls with advanced options",
      icon: Plus,
      link: user ? "/dashboard/polls" : "/auth",
      badge: "Easy Setup",
      color: "text-primary"
    },
    {
      title: "Track Performance",
      description: "Monitor votes, engagement, and analytics",
      icon: BarChart3,
      link: user ? "/dashboard/polls" : "/auth",
      badge: "Real-time",
      color: "text-emerald-500"
    },
    {
      title: "Participate",
      description: "Vote on community polls and civic issues",
      icon: Vote,
      link: "/polls",
      badge: "Active",
      color: "text-blue-500"
    },
    {
      title: "Share Results",
      description: "Export and embed poll results anywhere",
      icon: Share2,
      link: user ? "/dashboard/polls" : "/auth",
      badge: "Shareable",
      color: "text-purple-500"
    }
  ];

  const steps = [
    { step: 1, title: "Sign In", description: "Create your account to start", link: "/auth" },
    { step: 2, title: "Access Dashboard", description: "Go to My Polls Dashboard", link: "/dashboard/polls" },
    { step: 3, title: "Create Poll", description: "Design your first poll", link: "/dashboard/polls" },
    { step: 4, title: "Share & Track", description: "Monitor performance", link: "/dashboard/polls" }
  ];

  return (
    <div className="space-y-8">
      {/* Quick Features */}
      <div>
        <h3 className="text-xl font-semibold mb-4">How to Use CamerPulse Polls</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-opacity-10 flex items-center justify-center`} 
                         style={{ backgroundColor: `${feature.color}20` }}>
                      <Icon className={`w-5 h-5 ${feature.color}`} />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <h4 className="font-medium mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {feature.description}
                  </p>
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link to={feature.link} className="flex items-center gap-2">
                      {feature.title === "Participate" || user ? "Get Started" : "Sign In Required"}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Step by Step Guide */}
      {!user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Getting Started Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {steps.map((step, index) => (
                <div key={index} className="text-center space-y-2">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-semibold">
                    {step.step}
                  </div>
                  <h4 className="font-medium">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                  <Button asChild size="sm" variant="ghost">
                    <Link to={step.link}>Go to Step {step.step}</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Dashboard Quick Access */}
      {user && (
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Welcome back!</h3>
                <p className="text-muted-foreground">
                  Ready to create polls and engage with the community?
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild>
                  <Link to="/dashboard/polls" className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    My Dashboard
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
      )}

      {/* Security & Trust */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium mb-1">Secure & Transparent</h4>
              <p className="text-sm text-muted-foreground">
                All polls feature advanced fraud protection, real-time analytics, and transparent results.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>127K+ Active Users</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};