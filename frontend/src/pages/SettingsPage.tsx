import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Printer, 
  Palette, 
  Bell, 
  Shield, 
  Database,
  Save,
  RefreshCw,
  User,
  Building,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Mock settings state - replace with real state management
  const [settings, setSettings] = useState({
    // General
    companyName: 'CamerPulse',
    companyAddress: '123 Main Street, Douala, Cameroon',
    defaultLabelSize: 'A4',
    defaultOrientation: 'portrait',
    
    // Printing
    printerName: 'Default Printer',
    printQuality: 'high',
    autoCalibrate: true,
    printSpoolPath: '/var/spool/printer',
    
    // Notifications
    emailNotifications: true,
    printJobNotifications: true,
    scanNotifications: false,
    errorAlerts: true,
    
    // Security
    requireAuthentication: false,
    sessionTimeout: 30,
    backupFrequency: 'daily',
    
    // Theme
    theme: 'system',
    accentColor: 'blue',
    sidebarCollapsed: false
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSettings({
      companyName: 'CamerPulse',
      companyAddress: '123 Main Street, Douala, Cameroon',
      defaultLabelSize: 'A4',
      defaultOrientation: 'portrait',
      printerName: 'Default Printer',
      printQuality: 'high',
      autoCalibrate: true,
      printSpoolPath: '/var/spool/printer',
      emailNotifications: true,
      printJobNotifications: true,
      scanNotifications: false,
      errorAlerts: true,
      requireAuthentication: false,
      sessionTimeout: 30,
      backupFrequency: 'daily',
      theme: 'system',
      accentColor: 'blue',
      sidebarCollapsed: false
    });
    
    toast({
      title: "Settings reset",
      description: "All settings have been reset to defaults",
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="w-8 h-8" />
            Settings
          </h1>
          <p className="text-muted-foreground">
            Configure your label management system
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="printing">Printing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Company Information
              </CardTitle>
              <CardDescription>
                Basic information about your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={settings.companyName}
                    onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="company-address">Company Address</Label>
                  <Input
                    id="company-address"
                    value={settings.companyAddress}
                    onChange={(e) => setSettings(prev => ({ ...prev, companyAddress: e.target.value }))}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="default-label-size">Default Label Size</Label>
                  <Select value={settings.defaultLabelSize} onValueChange={(value) => setSettings(prev => ({ ...prev, defaultLabelSize: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="A5">A5</SelectItem>
                      <SelectItem value="A6">A6</SelectItem>
                      <SelectItem value="4x6">4×6 inches</SelectItem>
                      <SelectItem value="Receipt">Receipt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="default-orientation">Default Orientation</Label>
                  <Select value={settings.defaultOrientation} onValueChange={(value) => setSettings(prev => ({ ...prev, defaultOrientation: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Printing Settings */}
        <TabsContent value="printing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="w-5 h-5" />
                Print Configuration
              </CardTitle>
              <CardDescription>
                Configure printer settings and print quality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="printer-name">Printer Name</Label>
                  <Input
                    id="printer-name"
                    value={settings.printerName}
                    onChange={(e) => setSettings(prev => ({ ...prev, printerName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="print-quality">Print Quality</Label>
                  <Select value={settings.printQuality} onValueChange={(value) => setSettings(prev => ({ ...prev, printQuality: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High Quality</SelectItem>
                      <SelectItem value="best">Best Quality</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="print-spool-path">Print Spool Path</Label>
                <Input
                  id="print-spool-path"
                  value={settings.printSpoolPath}
                  onChange={(e) => setSettings(prev => ({ ...prev, printSpoolPath: e.target.value }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Calibrate Printer</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically calibrate printer before each print job
                  </p>
                </div>
                <Switch
                  checked={settings.autoCalibrate}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoCalibrate: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure when and how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Print Job Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when print jobs complete
                    </p>
                  </div>
                  <Switch
                    checked={settings.printJobNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, printJobNotifications: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Scan Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when QR codes are scanned
                    </p>
                  </div>
                  <Switch
                    checked={settings.scanNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, scanNotifications: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Error Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts for system errors
                    </p>
                  </div>
                  <Switch
                    checked={settings.errorAlerts}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, errorAlerts: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security & Privacy
              </CardTitle>
              <CardDescription>
                Manage security settings and data backup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require login to access the application
                  </p>
                </div>
                <Switch
                  checked={settings.requireAuthentication}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireAuthentication: checked }))}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="backup-frequency">Backup Frequency</Label>
                  <Select value={settings.backupFrequency} onValueChange={(value) => setSettings(prev => ({ ...prev, backupFrequency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance & Theme
              </CardTitle>
              <CardDescription>
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={settings.theme} onValueChange={(value) => setSettings(prev => ({ ...prev, theme: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <Select value={settings.accentColor} onValueChange={(value) => setSettings(prev => ({ ...prev, accentColor: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sidebar Collapsed by Default</Label>
                  <p className="text-sm text-muted-foreground">
                    Start with the sidebar collapsed
                  </p>
                </div>
                <Switch
                  checked={settings.sidebarCollapsed}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, sidebarCollapsed: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
