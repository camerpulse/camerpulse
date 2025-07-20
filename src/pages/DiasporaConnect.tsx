import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Heart, Users, Calendar, DollarSign, Building } from 'lucide-react';

const DiasporaConnect: React.FC = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Globe className="mx-auto h-16 w-16 text-primary mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Diaspora Connect
          </h1>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with your home community, support development projects, and make a lasting impact from anywhere in the world.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Make Donations</h3>
              <p className="text-muted-foreground mb-4">
                Support verified projects and emergency relief efforts in your home region.
              </p>
              <Button className="w-full" onClick={() => window.location.href = '/diaspora/donations'}>
                <DollarSign className="h-4 w-4 mr-2" />
                Donate Now
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Building className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Browse Projects</h3>
              <p className="text-muted-foreground mb-4">
                Discover verified development projects across all regions of Cameroon.
              </p>
              <Button variant="outline" className="w-full">
                View Projects
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Join Events</h3>
              <p className="text-muted-foreground mb-4">
                Participate in virtual town halls and community discussions.
              </p>
              <Button variant="outline" className="w-full">
                View Events
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Ready to Make an Impact?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Join thousands of Cameroonians worldwide who are actively contributing to the development of their home communities.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => window.location.href = '/diaspora/auth'}>
                Create Diaspora Profile
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiasporaConnect;