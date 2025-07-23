import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Bell, Shield, Calendar, Users, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TenderSettingsPanelProps {
  tenderId: string;
  onClose: () => void;
}

export default function TenderSettingsPanel({ tenderId, onClose }: TenderSettingsPanelProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [settings, setSettings] = useState({
    allowComments: true,
    allowQuestions: true,
    autoNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    publicBidCount: true,
    allowLateBids: false,
    requireVerification: true,
    deadlineExtension: '',
    maxBidders: 100,
    communicationMethod: 'platform'
  });

  const [blacklistedCompanies, setBlacklistedCompanies] = useState<string[]>([
    'Example Blacklisted Company'
  ]);

  const [newBlacklist, setNewBlacklist] = useState('');

  const handleSettingChange = (key: string, value: boolean | string | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const addToBlacklist = () => {
    if (newBlacklist.trim()) {
      setBlacklistedCompanies(prev => [...prev, newBlacklist.trim()]);
      setNewBlacklist('');
      toast({
        title: "Company Blacklisted",
        description: "The company has been added to your blacklist.",
      });
    }
  };

  const removeFromBlacklist = (company: string) => {
    setBlacklistedCompanies(prev => prev.filter(c => c !== company));
    toast({
      title: "Company Removed",
      description: "The company has been removed from your blacklist.",
    });
  };

  const extendDeadline = async () => {
    if (!settings.deadlineExtension) return;
    
    setIsLoading(true);
    try {
      // Extend deadline logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Deadline Extended",
        description: `Tender deadline has been extended by ${settings.deadlineExtension} days.`,
      });
      
      setSettings(prev => ({ ...prev, deadlineExtension: '' }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extend deadline. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // Save settings logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Saved",
        description: "Your tender settings have been updated successfully.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Settings className="h-6 w-6" />
        <div>
          <h2 className="text-2xl font-bold">Tender Settings</h2>
          <p className="text-muted-foreground">Manage your tender preferences and restrictions</p>
        </div>
      </div>

      {/* Bidder Interaction Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Bidder Interaction
          </CardTitle>
          <CardDescription>
            Control how bidders can interact with your tender
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Allow Comments</Label>
              <p className="text-sm text-muted-foreground">Let bidders post public comments</p>
            </div>
            <Switch
              checked={settings.allowComments}
              onCheckedChange={(checked) => handleSettingChange('allowComments', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Allow Questions</Label>
              <p className="text-sm text-muted-foreground">Let bidders ask questions privately</p>
            </div>
            <Switch
              checked={settings.allowQuestions}
              onCheckedChange={(checked) => handleSettingChange('allowQuestions', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Show Bid Count</Label>
              <p className="text-sm text-muted-foreground">Display number of bids received publicly</p>
            </div>
            <Switch
              checked={settings.publicBidCount}
              onCheckedChange={(checked) => handleSettingChange('publicBidCount', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Require Company Verification</Label>
              <p className="text-sm text-muted-foreground">Only allow verified companies to bid</p>
            </div>
            <Switch
              checked={settings.requireVerification}
              onCheckedChange={(checked) => handleSettingChange('requireVerification', checked)}
            />
          </div>

          <div>
            <Label htmlFor="maxBidders">Maximum Number of Bidders</Label>
            <Input
              id="maxBidders"
              type="number"
              value={settings.maxBidders}
              onChange={(e) => handleSettingChange('maxBidders', parseInt(e.target.value))}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Communication Method</Label>
            <Select 
              value={settings.communicationMethod} 
              onValueChange={(value) => handleSettingChange('communicationMethod', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="platform">Platform Only</SelectItem>
                <SelectItem value="email">Email Allowed</SelectItem>
                <SelectItem value="phone">Phone Allowed</SelectItem>
                <SelectItem value="all">All Methods</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose how you want to be notified about tender activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto Notifications</Label>
              <p className="text-sm text-muted-foreground">Automatically notify about new bids</p>
            </div>
            <Switch
              checked={settings.autoNotifications}
              onCheckedChange={(checked) => handleSettingChange('autoNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
            </div>
            <Switch
              checked={settings.smsNotifications}
              onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Deadline Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Deadline Management
          </CardTitle>
          <CardDescription>
            Extend submission deadlines if needed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Allow Late Bids</Label>
              <p className="text-sm text-muted-foreground">Accept bids after deadline with penalty</p>
            </div>
            <Switch
              checked={settings.allowLateBids}
              onCheckedChange={(checked) => handleSettingChange('allowLateBids', checked)}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Extend Deadline</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Number of days"
                type="number"
                value={settings.deadlineExtension}
                onChange={(e) => handleSettingChange('deadlineExtension', e.target.value)}
              />
              <Button 
                onClick={extendDeadline} 
                disabled={!settings.deadlineExtension || isLoading}
              >
                {isLoading ? 'Extending...' : 'Extend'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              This will notify all bidders about the deadline extension
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Blacklist Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Blacklist Management
          </CardTitle>
          <CardDescription>
            Manage companies that are not allowed to bid
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Company name to blacklist"
              value={newBlacklist}
              onChange={(e) => setNewBlacklist(e.target.value)}
            />
            <Button onClick={addToBlacklist} disabled={!newBlacklist.trim()}>
              Add
            </Button>
          </div>

          {blacklistedCompanies.length > 0 && (
            <div className="space-y-2">
              <Label>Blacklisted Companies</Label>
              {blacklistedCompanies.map((company, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">{company}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFromBlacklist(company)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={saveSettings} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}