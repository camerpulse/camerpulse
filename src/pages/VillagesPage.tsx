import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Users, Heart, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const VillagesPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">🏘️ Villages Directory</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Every Cameroonian is born from a village. Explore your roots, connect with your community, and celebrate our diverse heritage.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Total Villages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">13,287</div>
            <p className="text-sm text-muted-foreground">Across 10 regions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Connected Communities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">2,456</div>
            <p className="text-sm text-muted-foreground">Active on platform</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Regional Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">10/10</div>
            <p className="text-sm text-muted-foreground">Complete coverage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Cultural Stories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">1,890</div>
            <p className="text-sm text-muted-foreground">Shared heritage</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Explore by Region</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Centre</span>
              <span className="text-sm text-muted-foreground">1,432 villages</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Littoral</span>
              <span className="text-sm text-muted-foreground">987 villages</span>
            </div>
            <div className="flex justify-between items-center">
              <span>West</span>
              <span className="text-sm text-muted-foreground">1,876 villages</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Northwest</span>
              <span className="text-sm text-muted-foreground">2,109 villages</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Southwest</span>
              <span className="text-sm text-muted-foreground">1,234 villages</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-l-2 border-primary pl-4">
              <div className="font-semibold">Bamenda village profile updated</div>
              <div className="text-sm text-muted-foreground">2 hours ago</div>
            </div>
            <div className="border-l-2 border-green-500 pl-4">
              <div className="font-semibold">New village added: Foumbot</div>
              <div className="text-sm text-muted-foreground">5 hours ago</div>
            </div>
            <div className="border-l-2 border-blue-500 pl-4">
              <div className="font-semibold">Cultural story shared from Kribi</div>
              <div className="text-sm text-muted-foreground">1 day ago</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Connect with Your Roots</h2>
        <p className="text-muted-foreground mb-6">
          Discover your village's history, connect with fellow community members, and contribute to preserving our cultural heritage.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/auth">Register Your Village</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/villages/search">Search Villages</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VillagesPage;