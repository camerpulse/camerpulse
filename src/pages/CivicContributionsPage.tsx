import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserSuggestionsDashboard } from '@/components/CivicSuggestions/UserSuggestionsDashboard';
import { SuggestionButton } from '@/components/CivicSuggestions/SuggestionButton';
import { ModerationDashboard } from '@/components/CivicSuggestions/ModerationDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/routing/ProtectedRoute';
import { 
  Users, 
  FileText, 
  Star, 
  ShieldCheck, 
  Plus, 
  CheckSquare,
  Award,
  TrendingUp
} from 'lucide-react';

const CivicContributionsPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const isModeratorOrAdmin = hasRole('admin') || hasRole('moderator');

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Contribute to CamerPulse</h1>
            <p className="text-xl text-gray-600 mb-8">
              Help build Cameroon's most comprehensive civic database by suggesting new entities and improvements
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="text-center">
                  <Plus className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                  <CardTitle>Suggest New Entities</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 text-center">
                    Add politicians, schools, hospitals, companies, and more to our database
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <CheckSquare className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <CardTitle>Improve Existing Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 text-center">
                    Update information, correct errors, and add missing details
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <Star className="h-12 w-12 text-yellow-600 mx-auto mb-2" />
                  <CardTitle>Write Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 text-center">
                    Share your experiences to help other citizens make informed decisions
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Button size="lg" onClick={() => window.location.href = '/auth'}>
                Get Started - Sign Up Free
              </Button>
              <p className="text-sm text-gray-500">
                Join thousands of Cameroonians building a more transparent society
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Civic Contributions</h1>
            <p className="text-gray-600">Contribute to building Cameroon's civic database</p>
          </div>
          
          <div className="flex gap-3">
            <SuggestionButton mode="suggest_new" />
          </div>
        </div>

        {/* Quick Actions Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Politicians & Officials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Add MPs, senators, mayors, ministers, and other political figures
              </p>
              <SuggestionButton 
                mode="suggest_new" 
                entityType="politician"
                className="w-full"
              />
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Institutions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Schools, hospitals, government offices, and public services
              </p>
              <SuggestionButton 
                mode="suggest_new" 
                entityType="school"
                className="w-full"
              />
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Businesses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Companies, pharmacies, and other business entities
              </p>
              <SuggestionButton 
                mode="suggest_new" 
                entityType="company"
                className="w-full"
              />
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-5 w-5 text-orange-600" />
                Communities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Villages, councils, traditional authorities, and local communities
              </p>
              <SuggestionButton 
                mode="suggest_new" 
                entityType="village"
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="my-contributions" className="w-full">
          <TabsList className={`grid w-full ${isModeratorOrAdmin ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <TabsTrigger value="my-contributions">My Contributions</TabsTrigger>
            {isModeratorOrAdmin && (
              <TabsTrigger value="moderation">Moderation Queue</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="my-contributions" className="mt-6">
            <UserSuggestionsDashboard />
          </TabsContent>

          {isModeratorOrAdmin && (
            <TabsContent value="moderation" className="mt-6">
              <ProtectedRoute requiredRoles={['admin', 'moderator']}>
                <ModerationDashboard />
              </ProtectedRoute>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default CivicContributionsPage;