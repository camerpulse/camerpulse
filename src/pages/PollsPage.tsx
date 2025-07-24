import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Vote, TrendingUp, Users, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const PollsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">CamerPulse Polls</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Participate in democratic polls and civic engagement across Cameroon. Your voice matters in shaping our nation's future.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="h-5 w-5" />
              Active Polls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">12</div>
            <p className="text-sm text-muted-foreground">Currently running polls</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">15,234</div>
            <p className="text-sm text-muted-foreground">Citizens engaged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">78%</div>
            <p className="text-sm text-muted-foreground">Average completion</p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
        <p className="text-muted-foreground mb-6">
          Our comprehensive polling system is under development. Soon you'll be able to create, participate in, and analyze civic polls.
        </p>
        <Button asChild>
          <Link to="/auth">Join Waitlist</Link>
        </Button>
      </div>
    </div>
  );
};

export default PollsPage;