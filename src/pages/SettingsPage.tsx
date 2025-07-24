import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Palette, Bell, Shield } from 'lucide-react';

const SettingsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Platform Settings</h1>
        <p className="text-lg text-muted-foreground">
          Customize your CamerPulse experience and preferences.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Theme, language, and display preferences.
            </p>
            <Button variant="outline" size="sm">Configure</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Manage notification preferences for polls, updates, and activities.
            </p>
            <Button variant="outline" size="sm">Manage</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Control your privacy settings and security preferences.
            </p>
            <Button variant="outline" size="sm">Review</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              General platform settings and preferences.
            </p>
            <Button variant="outline" size="sm">Edit</Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-8">
        <p className="text-muted-foreground">
          Advanced settings panel is under development.
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;