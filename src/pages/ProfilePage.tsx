import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Settings, Shield, Edit } from 'lucide-react';

const ProfilePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">User Profile</h1>
        <p className="text-lg text-muted-foreground">
          Manage your CamerPulse profile and civic engagement settings.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Comprehensive profile management is coming soon. You'll be able to manage your civic identity, track your engagement, and customize your experience.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Edit className="h-4 w-4" />
                <span>Edit personal information</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4" />
                <span>Privacy settings</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Settings className="h-4 w-4" />
                <span>Notification preferences</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button>Sign In to Access Profile</Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;