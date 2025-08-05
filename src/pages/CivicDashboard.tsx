import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Vote, 
  MessageSquare, 
  Bell, 
  TrendingUp, 
  Calendar,
  FileText,
  MapPin
} from 'lucide-react';

/**
 * Civic Dashboard - User's personalized civic engagement overview
 */
const CivicDashboard: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Civic Dashboard</h1>
          <p className="text-muted-foreground">
            Your personalized civic engagement overview
          </p>
        </div>
        <Button>
          <Bell className="w-4 h-4 mr-2" />
          View All Notifications
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Petitions Signed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Politicians Followed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              +1 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Civic Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">750</div>
            <p className="text-xs text-muted-foreground">
              +50 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Upcoming this month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest civic engagement activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Signed petition for education reform</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Followed MP John Doe</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Commented on healthcare proposal</p>
                <p className="text-xs text-muted-foreground">3 days ago</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get engaged with your community</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline">
              <Vote className="w-4 h-4 mr-2" />
              Browse Petitions
            </Button>
            <Button className="w-full" variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Find Politicians
            </Button>
            <Button className="w-full" variant="outline">
              <MapPin className="w-4 h-4 mr-2" />
              Explore Villages
            </Button>
            <Button className="w-full" variant="outline">
              <MessageSquare className="w-4 h-4 mr-2" />
              Join Discussions
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Engagement Goal</CardTitle>
          <CardDescription>Track your civic participation progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Civic Actions</span>
              <span className="text-sm text-muted-foreground">7/10</span>
            </div>
            <Progress value={70} className="w-full" />
            <div className="flex gap-2">
              <Badge variant="secondary">Petitions: 3/4</Badge>
              <Badge variant="secondary">Polls: 2/3</Badge>
              <Badge variant="secondary">Comments: 2/3</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CivicDashboard;