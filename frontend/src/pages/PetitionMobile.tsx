import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Accessibility, 
  Wifi, 
  Download, 
  Bell, 
  Eye,
  Volume2,
  Type,
  Palette,
  Zap,
  Globe,
  Users,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

export default function PetitionMobile() {
  const [pwaEnabled, setPwaEnabled] = React.useState(true);
  const [offlineMode, setOfflineMode] = React.useState(true);
  const [pushNotifications, setPushNotifications] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState('auto');

  const mobileStats = {
    mobileUsers: 68,
    tabletUsers: 22,
    desktopUsers: 10,
    pwaInstalls: 1247,
    offlineActions: 89,
    avgLoadTime: 1.2
  };

  const deviceBreakpoints = [
    { name: 'Mobile Small', size: '320px - 480px', usage: 35, color: 'bg-blue-500' },
    { name: 'Mobile Large', size: '481px - 768px', usage: 33, color: 'bg-green-500' },
    { name: 'Tablet', size: '769px - 1024px', usage: 22, color: 'bg-yellow-500' },
    { name: 'Desktop', size: '1025px+', usage: 10, color: 'bg-purple-500' }
  ];

  const accessibilityFeatures = [
    {
      name: 'Screen Reader Support',
      description: 'ARIA labels and semantic HTML',
      status: 'enabled',
      coverage: 98
    },
    {
      name: 'High Contrast Mode',
      description: 'Enhanced visual accessibility',
      status: 'enabled',
      coverage: 95
    },
    {
      name: 'Font Size Scaling',
      description: 'Responsive text sizing',
      status: 'enabled',
      coverage: 100
    },
    {
      name: 'Keyboard Navigation',
      description: 'Full keyboard accessibility',
      status: 'enabled',
      coverage: 92
    },
    {
      name: 'Voice Commands',
      description: 'Voice-activated interactions',
      status: 'beta',
      coverage: 75
    }
  ];

  const mobileOptimizations = [
    {
      feature: 'Touch Gestures',
      status: 'active',
      description: 'Swipe, pinch, and tap interactions',
      impact: 'high'
    },
    {
      feature: 'Offline Caching',
      status: 'active',
      description: 'Store petitions for offline viewing',
      impact: 'medium'
    },
    {
      feature: 'Lazy Loading',
      status: 'active',
      description: 'Progressive image and content loading',
      impact: 'high'
    },
    {
      feature: 'Compression',
      status: 'active',
      description: 'Optimized asset delivery',
      impact: 'high'
    },
    {
      feature: 'Service Worker',
      status: 'active',
      description: 'Background sync and caching',
      impact: 'medium'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Smartphone className="h-8 w-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold">Mobile & Accessibility</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
            Comprehensive mobile optimization and accessibility features for universal access
          </p>
        </div>

        {/* Mobile Usage Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mobile Users</CardTitle>
              <Smartphone className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-blue-600">{mobileStats.mobileUsers}%</div>
              <p className="text-xs text-muted-foreground">Primary platform</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PWA Installs</CardTitle>
              <Download className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{mobileStats.pwaInstalls.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">App installations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Load Time</CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{mobileStats.avgLoadTime}s</div>
              <p className="text-xs text-muted-foreground">Average mobile</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Offline Actions</CardTitle>
              <Wifi className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{mobileStats.offlineActions}</div>
              <p className="text-xs text-muted-foreground">Cached interactions</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="responsive" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="responsive" className="text-xs md:text-sm">Responsive Design</TabsTrigger>
            <TabsTrigger value="pwa" className="text-xs md:text-sm">PWA Features</TabsTrigger>
            <TabsTrigger value="accessibility" className="text-xs md:text-sm">Accessibility</TabsTrigger>
            <TabsTrigger value="performance" className="text-xs md:text-sm">Performance</TabsTrigger>
          </TabsList>

          {/* Responsive Design */}
          <TabsContent value="responsive" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Device Usage Distribution
                  </CardTitle>
                  <CardDescription>How users access the petition platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {deviceBreakpoints.map((device) => (
                    <div key={device.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{device.name}</span>
                        <span className="text-sm text-muted-foreground">{device.usage}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={device.usage} className="flex-1" />
                        <span className="text-xs text-muted-foreground w-20">{device.size}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mobile Optimizations</CardTitle>
                  <CardDescription>Active mobile performance features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mobileOptimizations.map((opt) => (
                    <div key={opt.feature} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <div>
                          <h4 className="font-medium text-sm">{opt.feature}</h4>
                          <p className="text-xs text-muted-foreground">{opt.description}</p>
                        </div>
                      </div>
                      <Badge variant={opt.impact === 'high' ? 'default' : 'secondary'}>
                        {opt.impact}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PWA Features */}
          <TabsContent value="pwa" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Progressive Web App
                  </CardTitle>
                  <CardDescription>Native app-like experience on mobile devices</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">PWA Installation</h4>
                      <p className="text-sm text-muted-foreground">
                        Enable "Add to Home Screen" functionality
                      </p>
                    </div>
                    <Switch checked={pwaEnabled} onCheckedChange={setPwaEnabled} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Offline Support</h4>
                      <p className="text-sm text-muted-foreground">
                        Cache content for offline viewing
                      </p>
                    </div>
                    <Switch checked={offlineMode} onCheckedChange={setOfflineMode} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Push Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Send updates about petition progress
                      </p>
                    </div>
                    <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Theme Preference</h4>
                    <Select value={darkMode} onValueChange={setDarkMode}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light Mode</SelectItem>
                        <SelectItem value="dark">Dark Mode</SelectItem>
                        <SelectItem value="auto">Auto (System)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>PWA Capabilities</CardTitle>
                  <CardDescription>Native features available in the web app</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <Bell className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-medium">Push Notifications</h4>
                      <p className="text-sm text-muted-foreground">Real-time petition updates</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <Download className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Background Sync</h4>
                      <p className="text-sm text-muted-foreground">Sync when connectivity returns</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <Wifi className="h-5 w-5 text-purple-600" />
                    <div>
                      <h4 className="font-medium">Offline Mode</h4>
                      <p className="text-sm text-muted-foreground">View cached petitions offline</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <Globe className="h-5 w-5 text-yellow-600" />
                    <div>
                      <h4 className="font-medium">Share Integration</h4>
                      <p className="text-sm text-muted-foreground">Native share functionality</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Accessibility */}
          <TabsContent value="accessibility" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Accessibility className="h-5 w-5" />
                    Accessibility Features
                  </CardTitle>
                  <CardDescription>WCAG 2.1 AA compliance and inclusive design</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {accessibilityFeatures.map((feature) => (
                    <div key={feature.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{feature.name}</span>
                          <Badge variant={feature.status === 'enabled' ? 'default' : 'secondary'}>
                            {feature.status}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">{feature.coverage}%</span>
                      </div>
                      <Progress value={feature.coverage} />
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Accessibility Settings</CardTitle>
                  <CardDescription>User customization options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <div>
                        <h4 className="font-medium">High Contrast</h4>
                        <p className="text-sm text-muted-foreground">Enhanced visual contrast</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      <div>
                        <h4 className="font-medium">Large Text</h4>
                        <p className="text-sm text-muted-foreground">Increased font sizes</p>
                      </div>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      <div>
                        <h4 className="font-medium">Screen Reader</h4>
                        <p className="text-sm text-muted-foreground">Enhanced audio descriptions</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      <div>
                        <h4 className="font-medium">Reduced Motion</h4>
                        <p className="text-sm text-muted-foreground">Minimize animations</p>
                      </div>
                    </div>
                    <Switch />
                  </div>

                  <div className="pt-4 border-t">
                    <Button className="w-full">Test Accessibility</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Core Web Vitals</CardTitle>
                  <CardDescription>Mobile performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">First Contentful Paint</span>
                      <span className="text-sm font-medium text-green-600">1.2s</span>
                    </div>
                    <Progress value={85} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Largest Contentful Paint</span>
                      <span className="text-sm font-medium text-green-600">2.1s</span>
                    </div>
                    <Progress value={90} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Cumulative Layout Shift</span>
                      <span className="text-sm font-medium text-green-600">0.05</span>
                    </div>
                    <Progress value={95} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">First Input Delay</span>
                      <span className="text-sm font-medium text-green-600">45ms</span>
                    </div>
                    <Progress value={92} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mobile Insights</CardTitle>
                  <CardDescription>Usage patterns and optimization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Touch Targets</h4>
                      <p className="text-sm text-muted-foreground">44px minimum size</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Viewport Meta</h4>
                      <p className="text-sm text-muted-foreground">Responsive scaling</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Image Optimization</h4>
                      <p className="text-sm text-muted-foreground">WebP format support</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Code Splitting</h4>
                      <p className="text-sm text-muted-foreground">Lazy loading active</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Score</CardTitle>
                  <CardDescription>Overall mobile optimization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">94</div>
                    <div className="text-sm text-muted-foreground">Lighthouse Score</div>
                    <Progress value={94} className="mt-2" />
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between">
                      <span className="text-sm">Performance</span>
                      <span className="text-sm font-medium">94</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Accessibility</span>
                      <span className="text-sm font-medium">98</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Best Practices</span>
                      <span className="text-sm font-medium">96</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">SEO</span>
                      <span className="text-sm font-medium">92</span>
                    </div>
                  </div>

                  <Button className="w-full mt-4">Run Performance Test</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Install Mobile App
          </Button>
          <Button variant="outline" size="lg" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            View Mobile Analytics
          </Button>
        </div>
      </div>
    </div>
  );
}