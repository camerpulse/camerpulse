import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, BookOpen, BarChart3, Bell, AlertTriangle, FileText, Award } from 'lucide-react';
import { ModeratorApplicationForm } from '@/components/moderators/ModeratorApplicationForm';
import { ModeratorDashboard } from '@/components/moderators/ModeratorDashboard';
import { ModeratorLeaderboard } from '@/components/moderators/ModeratorLeaderboard';
import { AdminModeratorDashboard } from '@/components/moderators/AdminModeratorDashboard';
import { ModeratorNotifications } from '@/components/moderators/ModeratorNotifications';
import { ModeratorAppeals } from '@/components/moderators/ModeratorAppeals';
import { ModeratorTraining } from '@/components/moderators/ModeratorTraining';
import { ModeratorAnalytics } from '@/components/moderators/ModeratorAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function ModeratorPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Check user's moderator status and role
  const { data: userRole } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      return data?.role || 'citizen';
    },
    enabled: !!user
  });

  const { data: moderatorStatus } = useQuery({
    queryKey: ['moderator-status', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Check for existing application
      const { data: application } = await supabase
        .from('moderator_applications')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Check for moderator record
      const { data: moderator } = await supabase
        .from('civic_moderators')
        .select('*')
        .eq('user_id', user.id)
        .single();

      return {
        application,
        moderator,
        hasApplied: !!application,
        isModerator: !!moderator && moderator.status === 'approved'
      };
    },
    enabled: !!user
  });

  const isAdmin = userRole === 'admin';
  const isModerator = moderatorStatus?.isModerator;
  const hasApplied = moderatorStatus?.hasApplied;

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground text-center">
              Please log in to access the Moderator Portal
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Civic Moderator Portal</h1>
          {isModerator && (
            <Badge variant="default" className="bg-green-600">
              <Award className="w-3 h-3 mr-1" />
              Active Moderator
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          {isModerator 
            ? "Manage civic submissions and maintain community standards"
            : "Apply to become a civic moderator and help maintain community standards"
          }
        </p>
      </div>

      {/* Show application form if user hasn't applied */}
      {!hasApplied && !isModerator && !isAdmin && (
        <ModeratorApplicationForm />
      )}

      {/* Show application status if user has applied but isn't approved yet */}
      {hasApplied && !isModerator && !isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Application Status
            </CardTitle>
            <CardDescription>
              Your moderator application is being reviewed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Application Under Review</p>
                <p className="text-sm text-blue-700">
                  Status: {moderatorStatus?.application?.application_status || 'Submitted'}
                </p>
                <p className="text-sm text-blue-700">
                  We'll notify you once your application has been processed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show full portal for moderators and admins */}
      {(isModerator || isAdmin) && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Overview
            </TabsTrigger>
            {isModerator && (
              <>
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="appeals" className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Appeals
                </TabsTrigger>
                <TabsTrigger value="training" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Training
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Leaderboard
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Admin
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Moderation System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our civic moderation system ensures content quality and community safety through trained volunteer moderators.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Community-Driven</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Transparent</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Fair Appeals Process</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {isModerator && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Quick Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Pending Reviews</span>
                          <Badge variant="secondary">0</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Completed Today</span>
                          <Badge variant="secondary">0</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Response Time</span>
                          <Badge variant="secondary">~2h</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Your Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Current Level</span>
                          <Badge variant="default">Level 1</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Badges Earned</span>
                          <Badge variant="secondary">0</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Training Complete</span>
                          <Badge variant="secondary">0%</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          {isModerator && (
            <>
              <TabsContent value="dashboard">
                <ModeratorDashboard />
              </TabsContent>

              <TabsContent value="notifications">
                <ModeratorNotifications />
              </TabsContent>

              <TabsContent value="appeals">
                <ModeratorAppeals />
              </TabsContent>

              <TabsContent value="training">
                <ModeratorTraining />
              </TabsContent>

              <TabsContent value="analytics">
                <ModeratorAnalytics />
              </TabsContent>
            </>
          )}

          <TabsContent value="leaderboard">
            <ModeratorLeaderboard />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin">
              <AdminModeratorDashboard />
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}