import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Award, TrendingUp, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const PoliticiansPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Political Representatives</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Track the performance of your political representatives. Hold leaders accountable through transparency and civic engagement.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Tracked Politicians
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">156</div>
            <p className="text-sm text-muted-foreground">From all regions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Rated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">24</div>
            <p className="text-sm text-muted-foreground">Above 4.5 rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">2,340</div>
            <p className="text-sm text-muted-foreground">Citizen reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">3.8</div>
            <p className="text-sm text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Political Tracking System</h2>
        <p className="text-muted-foreground mb-6">
          Our comprehensive political tracking and rating system is being developed to ensure transparency and accountability in governance.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/auth">Join Platform</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/rankings/top-politicians">View Rankings</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PoliticiansPage;