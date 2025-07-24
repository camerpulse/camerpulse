import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, Users, Zap } from 'lucide-react';

const PulsePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">⚡ CamerPulse Feed</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Real-time civic engagement feed. Stay updated with the pulse of democracy in Cameroon.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">247</div>
            <p className="text-sm text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trending Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">12</div>
            <p className="text-sm text-muted-foreground">Hot discussions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">8,432</div>
            <p className="text-sm text-muted-foreground">Online now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Pulse Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">87</div>
            <p className="text-sm text-muted-foreground">Engagement level</p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Real-time Civic Engagement</h2>
        <p className="text-muted-foreground mb-6">
          The pulse feed will show live updates from polls, political discussions, community activities, and civic engagement across Cameroon.
        </p>
        <Button>Coming Soon</Button>
      </div>
    </div>
  );
};

export default PulsePage;