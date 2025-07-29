import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp,
  Settings,
  Download,
  Share,
  Eye,
  Edit3,
  Plus
} from 'lucide-react';

export const DataVisualizationModule = ({ hasPermission, logActivity, stats }: {
  hasPermission: (required: string) => boolean;
  logActivity: (action: string, details: any) => Promise<void>;
  stats: any;
}) => {
  const [selectedChart, setSelectedChart] = useState('bar');
  const [activeView, setActiveView] = useState('gallery');

  const chartTypes = [
    { id: 'bar', name: 'Bar Chart', icon: BarChart3, description: 'Compare categories' },
    { id: 'line', name: 'Line Chart', icon: LineChart, description: 'Show trends over time' },
    { id: 'pie', name: 'Pie Chart', icon: PieChart, description: 'Display proportions' },
    { id: 'scatter', name: 'Scatter Plot', icon: TrendingUp, description: 'Show correlations' }
  ];

  const visualizations = [
    { id: 1, name: 'User Growth Trends', type: 'Line Chart', category: 'User Analytics', lastModified: '2 hours ago', views: 1234 },
    { id: 2, name: 'Revenue Distribution', type: 'Pie Chart', category: 'Finance', lastModified: '1 day ago', views: 856 },
    { id: 3, name: 'Performance Metrics', type: 'Bar Chart', category: 'System', lastModified: '3 hours ago', views: 642 },
    { id: 4, name: 'Engagement Correlation', type: 'Scatter Plot', category: 'User Analytics', lastModified: '5 hours ago', views: 423 }
  ];

  const templates = [
    { id: 1, name: 'Executive Dashboard', description: 'High-level KPI overview', charts: 6 },
    { id: 2, name: 'Financial Report', description: 'Revenue and cost analysis', charts: 4 },
    { id: 3, name: 'User Analytics', description: 'User behavior insights', charts: 8 },
    { id: 4, name: 'Performance Monitor', description: 'System performance tracking', charts: 5 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Visualization Studio</h2>
          <p className="text-muted-foreground">
            Create interactive charts and visualizations from your data
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Visualization
        </Button>
      </div>

      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="builder">Chart Builder</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your Visualizations</h3>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="user-analytics">User Analytics</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visualizations.map((viz) => (
              <Card key={viz.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{viz.name}</CardTitle>
                    <Badge variant="outline">{viz.type}</Badge>
                  </div>
                  <CardDescription>{viz.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-muted h-32 rounded-md flex items-center justify-center">
                      <BarChart3 className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{viz.lastModified}</span>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {viz.views}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit3 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Chart Type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {chartTypes.map((chart) => (
                    <div
                      key={chart.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedChart === chart.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedChart(chart.id)}
                    >
                      <div className="flex items-center gap-3">
                        <chart.icon className="h-5 w-5" />
                        <div>
                          <p className="font-medium text-sm">{chart.name}</p>
                          <p className="text-xs text-muted-foreground">{chart.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Data Source</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user-metrics">User Metrics</SelectItem>
                      <SelectItem value="financial-data">Financial Data</SelectItem>
                      <SelectItem value="system-logs">System Logs</SelectItem>
                      <SelectItem value="custom-query">Custom Query</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Chart Preview</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted h-80 rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">Chart preview will appear here</p>
                      <p className="text-sm text-muted-foreground">Select a data source to begin</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <h3 className="text-lg font-semibold">Visualization Templates</h3>

          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {template.charts} charts included
                    </span>
                    <Button variant="outline" size="sm">
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <h3 className="text-lg font-semibold">Visualization Settings</h3>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Default Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Default Chart Type</label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select default chart" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Color Scheme</label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select color scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="vibrant">Vibrant</SelectItem>
                      <SelectItem value="pastel">Pastel</SelectItem>
                      <SelectItem value="monochrome">Monochrome</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Export Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Default Format</label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="jpg">JPG</SelectItem>
                      <SelectItem value="svg">SVG</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Resolution</label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select resolution" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (72 DPI)</SelectItem>
                      <SelectItem value="medium">Medium (150 DPI)</SelectItem>
                      <SelectItem value="high">High (300 DPI)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};