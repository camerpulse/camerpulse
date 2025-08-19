import React from 'react';
import { PromiseTracker } from '@/components/AI/PromiseTracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Target,
  Users,
  TrendingUp
} from 'lucide-react';

const Promises: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            National Promise Index
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Track and analyze political promises in Cameroon. 
            A platform for transparency and civic accountability for all citizens.
          </p>
          <div className="flex justify-center gap-4">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
              <Target className="w-4 h-4 mr-2" />
              Transparency
            </Badge>
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              Citizen Participation
            </Badge>
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
              <CheckCircle className="w-4 h-4 mr-2" />
              Accountability
            </Badge>
          </div>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Promise Tracking</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Track in real-time the progress of political promises 
                and their effective implementation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Citizen Votes</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Participate in promise evaluation through citizen votes 
                and share your opinion.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Emotional Analysis</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Discover the emotional impact of promises on the population 
                through sentiment data.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Promise Tracker */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">All Promises</CardTitle>
          </CardHeader>
          <CardContent>
            <PromiseTracker />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Promises;