import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileEdit } from './ProfileEdit';
import { CompanyProfile } from './CompanyProfile';
import { RoleManagement } from './RoleManagement';
import { EmailVerification } from './EmailVerification';
import { 
  User, Building2, Shield, Mail, Settings, 
  UserCheck, CheckCircle, AlertCircle, Clock 
} from 'lucide-react';

export const UserManagementDashboard: React.FC = () => {
  const { user, profile } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>User Management</CardTitle>
            <CardDescription>Please log in to access user management features</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getVerificationBadge = (verified: boolean) => {
    return verified ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Verified
      </Badge>
    ) : (
      <Badge variant="secondary">
        <AlertCircle className="h-3 w-3 mr-1" />
        Unverified
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <Settings className="h-8 w-8 mr-3 text-primary" />
          User Management
        </h1>
        <p className="text-muted-foreground">Manage your profile, company information, and account settings</p>
      </div>

      {/* Quick Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profile</p>
                <p className="text-lg font-semibold">{profile?.display_name || profile?.username || 'Incomplete'}</p>
              </div>
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email Status</p>
                <div className="mt-1">
                  {getVerificationBadge(!!user.email_confirmed_at)}
                </div>
              </div>
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Company</p>
                <p className="text-sm">Not Set</p>
              </div>
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <Badge variant="outline">User</Badge>
              </div>
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center">
            <Building2 className="h-4 w-4 mr-2" />
            Company
          </TabsTrigger>
          <TabsTrigger value="verification" className="flex items-center">
            <Mail className="h-4 w-4 mr-2" />
            Verification
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Roles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileEdit />
        </TabsContent>

        <TabsContent value="company">
          <CompanyProfile />
        </TabsContent>

        <TabsContent value="verification">
          <EmailVerification />
        </TabsContent>

        <TabsContent value="roles">
          <RoleManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};