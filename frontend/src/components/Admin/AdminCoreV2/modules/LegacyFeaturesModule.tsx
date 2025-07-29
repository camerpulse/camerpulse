import React, { useState } from 'react';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Shield, 
  Users, 
  ShoppingBag, 
  MessageSquare, 
  DollarSign,
  Lock,
  Clock,
  Power,
  BookOpen,
  Volume2,
  Languages,
  GraduationCap,
  FileText,
  Search,
  MessageCircle
} from 'lucide-react';

interface LegacyFeaturesModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const LegacyFeaturesModule: React.FC<LegacyFeaturesModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [activeTab, setActiveTab] = useState('system-settings');

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Legacy Features & System Configuration"
        description="Legacy admin features, system settings, and specialized configuration tools"
        icon={Settings}
        iconColor="text-gray-600"
        badge={{
          text: "Legacy Support",
          variant: "outline"
        }}
        onRefresh={() => {
          logActivity('legacy_features_refresh', { timestamp: new Date() });
        }}
      />

      {/* Legacy Features Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Features"
          value="12"
          icon={Power}
          description="System features enabled"
        />
        <StatCard
          title="Learning Modules"
          value="12"
          icon={BookOpen}
          description="Civic education content"
        />
        <StatCard
          title="Voice Languages"
          value="3"
          icon={Volume2}
          description="EN, FR, Pidgin"
        />
        <StatCard
          title="Daily Learners"
          value="2.3k"
          icon={GraduationCap}
          trend={{ value: 15, isPositive: true, period: "this week" }}
        />
      </div>

      {/* Legacy Features Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="system-settings">System Settings</TabsTrigger>
          <TabsTrigger value="feature-toggles">Feature Toggles</TabsTrigger>
          <TabsTrigger value="civic-learning">Civic Learning</TabsTrigger>
          <TabsTrigger value="user-management">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="system-settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Maintenance Mode</div>
                    <div className="text-sm text-muted-foreground">Disable public access</div>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Registration</div>
                    <div className="text-sm text-muted-foreground">Allow new user signups</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Email Verification</div>
                    <div className="text-sm text-muted-foreground">Require email confirmation</div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Force 2FA</div>
                    <div className="text-sm text-muted-foreground">Require two-factor authentication</div>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Session Timeout</div>
                    <div className="text-sm text-muted-foreground">Auto-logout after inactivity</div>
                  </div>
                  <Select defaultValue="24h">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 hour</SelectItem>
                      <SelectItem value="24h">24 hours</SelectItem>
                      <SelectItem value="7d">7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feature-toggles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>Enable or disable platform features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Marketplace</div>
                      <div className="text-sm text-muted-foreground">Enable vendor marketplace</div>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Political Claims</div>
                      <div className="text-sm text-muted-foreground">Allow profile claiming</div>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Pulse Feed</div>
                      <div className="text-sm text-muted-foreground">Social content sharing</div>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Donations</div>
                      <div className="text-sm text-muted-foreground">Accept platform donations</div>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="civic-learning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Civic Learning Hub Management
              </CardTitle>
              <CardDescription>
                Manage educational content, learning paths, and voice settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Voice Settings (Independent AI)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Speech Rate</Label>
                    <Select defaultValue="1.0">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.5">0.5x (Slow)</SelectItem>
                        <SelectItem value="0.75">0.75x</SelectItem>
                        <SelectItem value="1.0">1.0x (Normal)</SelectItem>
                        <SelectItem value="1.25">1.25x</SelectItem>
                        <SelectItem value="1.5">1.5x (Fast)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Voice Pitch</Label>
                    <Select defaultValue="1.0">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.5">Low</SelectItem>
                        <SelectItem value="1.0">Normal</SelectItem>
                        <SelectItem value="1.5">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Alert>
                  <Volume2 className="h-4 w-4" />
                  <AlertDescription>
                    Using browser's built-in Web Speech API for 100% independent operation. No external dependencies required.
                  </AlertDescription>
                </Alert>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Content Management
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Manage Learning Paths
                  </Button>
                  <Button className="justify-start" variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    Edit Knowledge Library
                  </Button>
                  <Button className="justify-start" variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Configure CivicBot
                  </Button>
                  <Button className="justify-start" variant="outline">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Youth Edition Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user-management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  <div>
                    <div className="font-medium">Approve KYC Documents</div>
                    <div className="text-sm text-muted-foreground">Verify user identities</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  <div>
                    <div className="font-medium">Suspend/Ban Users</div>
                    <div className="text-sm text-muted-foreground">Manage user access</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <Lock className="h-4 w-4 mr-2" />
                  <div>
                    <div className="font-medium">Reset User Passwords</div>
                    <div className="text-sm text-muted-foreground">Account recovery tools</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <div>
                    <div className="font-medium">Send Warnings/Notifications</div>
                    <div className="text-sm text-muted-foreground">User communication</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};