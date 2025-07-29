import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Heart, 
  Building,
  Calendar,
  MapPin,
  ArrowLeft,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DiasporaImpact: React.FC = () => {
  const navigate = useNavigate();

  // Mock data for demonstration
  const impactStats = {
    totalDonations: 2450000,
    projectsFunded: 23,
    communitiesReached: 45,
    diasporaMembers: 1250,
    successRate: 89
  };

  const recentProjects = [
    {
      id: 1,
      name: "Bamenda Water Project",
      region: "North West",
      funded: 850000,
      goal: 1000000,
      beneficiaries: 2500,
      status: "In Progress"
    },
    {
      id: 2,
      name: "Douala School Renovation",
      region: "Littoral",
      funded: 450000,
      goal: 450000,
      beneficiaries: 800,
      status: "Completed"
    },
    {
      id: 3,
      name: "Yaoundé Health Center",
      region: "Centre",
      funded: 320000,
      goal: 600000,
      beneficiaries: 1200,
      status: "Funding"
    }
  ];

  const topContributors = [
    { name: "USA Diaspora", amount: 650000, members: 450 },
    { name: "France Diaspora", amount: 520000, members: 320 },
    { name: "Canada Diaspora", amount: 380000, members: 180 },
    { name: "UK Diaspora", amount: 290000, members: 150 },
    { name: "Germany Diaspora", amount: 210000, members: 120 }
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/diaspora-connect')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to DiasporaConnect
          </Button>
          
          <div className="text-center">
            <Globe className="mx-auto h-16 w-16 text-primary mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Diaspora Impact Dashboard
            </h1>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              See the real impact of the Cameroonian diaspora on homeland development and community progress.
            </p>
          </div>
        </div>

        {/* Impact Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <DollarSign className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <div className="text-2xl font-bold text-foreground mb-2">
                {(impactStats.totalDonations / 1000000).toFixed(1)}M FCFA
              </div>
              <p className="text-sm text-muted-foreground">Total Donations</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Building className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <div className="text-2xl font-bold text-foreground mb-2">
                {impactStats.projectsFunded}
              </div>
              <p className="text-sm text-muted-foreground">Projects Funded</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <MapPin className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <div className="text-2xl font-bold text-foreground mb-2">
                {impactStats.communitiesReached}
              </div>
              <p className="text-sm text-muted-foreground">Communities Reached</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <div className="text-2xl font-bold text-foreground mb-2">
                {impactStats.diasporaMembers.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Active Members</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <div className="text-2xl font-bold text-foreground mb-2">
                {impactStats.successRate}%
              </div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Recent Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{project.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {project.region} Region
                        </p>
                      </div>
                      <Badge variant={
                        project.status === 'Completed' ? 'default' : 
                        project.status === 'In Progress' ? 'secondary' : 'outline'
                      }>
                        {project.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{((project.funded / project.goal) * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={(project.funded / project.goal) * 100} className="h-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{(project.funded / 1000).toFixed(0)}K FCFA raised</span>
                        <span>{project.beneficiaries.toLocaleString()} beneficiaries</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Top Contributors */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Top Contributors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topContributors.map((contributor, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{contributor.name}</p>
                      <p className="text-sm text-muted-foreground">{contributor.members} members</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {(contributor.amount / 1000).toFixed(0)}K
                      </p>
                      <p className="text-xs text-muted-foreground">FCFA</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <Card>
          <CardContent className="p-8 text-center">
            <Heart className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Join the Movement</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Be part of Cameroon's development story. Your contribution, no matter the size, makes a real difference in communities across the nation.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/diaspora/auth')}>
                Join Diaspora Network
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/diaspora')}>
                View Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiasporaImpact;