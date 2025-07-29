import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Calendar, 
  Clock,
  Download,
  Share,
  Play,
  Pause,
  Settings,
  Plus,
  Filter,
  Search,
  Eye,
  Edit3,
  Copy
} from 'lucide-react';

export const AdvancedReportingModule = () => {
  const [activeView, setActiveView] = useState('reports');
  const [searchTerm, setSearchTerm] = useState('');

  const reports = [
    {
      id: 1,
      name: 'Executive Summary Report',
      description: 'Comprehensive overview of key business metrics',
      type: 'Automated',
      schedule: 'Monthly',
      lastRun: '2024-01-01 09:00',
      nextRun: '2024-02-01 09:00',
      status: 'active',
      recipients: 5
    },
    {
      id: 2,
      name: 'Financial Performance Analysis',
      description: 'Detailed financial metrics and trends',
      type: 'Automated',
      schedule: 'Weekly',
      lastRun: '2024-01-15 08:00',
      nextRun: '2024-01-22 08:00',
      status: 'active',
      recipients: 3
    },
    {
      id: 3,
      name: 'User Engagement Deep Dive',
      description: 'In-depth analysis of user behavior patterns',
      type: 'Manual',
      schedule: 'On-demand',
      lastRun: '2024-01-10 14:30',
      nextRun: 'Manual',
      status: 'draft',
      recipients: 8
    },
    {
      id: 4,
      name: 'Security Audit Report',
      description: 'System security assessment and recommendations',
      type: 'Automated',
      schedule: 'Quarterly',
      lastRun: '2023-10-01 10:00',
      nextRun: '2024-04-01 10:00',
      status: 'scheduled',
      recipients: 2
    }
  ];

  const templates = [
    {
      id: 1,
      name: 'Business Performance',
      description: 'Standard business KPI report template',
      category: 'Business',
      sections: 6,
      charts: 8
    },
    {
      id: 2,
      name: 'Technical Health Check',
      description: 'System performance and technical metrics',
      category: 'Technical',
      sections: 4,
      charts: 12
    },
    {
      id: 3,
      name: 'User Analytics',
      description: 'User behavior and engagement analysis',
      category: 'Analytics',
      sections: 5,
      charts: 10
    },
    {
      id: 4,
      name: 'Financial Summary',
      description: 'Revenue, costs, and financial projections',
      category: 'Finance',
      sections: 7,
      charts: 6
    }
  ];

  const scheduleOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    draft: 'bg-yellow-100 text-yellow-800',
    scheduled: 'bg-blue-100 text-blue-800',
    paused: 'bg-gray-100 text-gray-800'
  };

  const filteredReports = reports.filter(report =>
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Advanced Reporting</h2>
          <p className="text-muted-foreground">
            Create, schedule, and manage comprehensive business reports
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Report
        </Button>
      </div>

      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="builder">Report Builder</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                      <CardDescription>{report.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[report.status as keyof typeof statusColors]}>
                        {report.status}
                      </Badge>
                      <Badge variant="outline">{report.type}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm font-medium">Schedule</p>
                      <p className="text-sm text-muted-foreground">{report.schedule}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Last Run</p>
                      <p className="text-sm text-muted-foreground">{report.lastRun}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Next Run</p>
                      <p className="text-sm text-muted-foreground">{report.nextRun}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Recipients</p>
                      <p className="text-sm text-muted-foreground">{report.recipients} users</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Play className="h-3 w-3 mr-1" />
                      Run Now
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit3 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="h-3 w-3 mr-1" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Report Templates</h3>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {template.sections} sections • {template.charts} charts
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="h-3 w-3 mr-1" />
                        Use Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <h3 className="text-lg font-semibold">Report Builder</h3>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Report Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="report-name">Report Name</Label>
                    <Input id="report-name" placeholder="Enter report name" />
                  </div>
                  <div>
                    <Label htmlFor="report-description">Description</Label>
                    <Textarea id="report-description" placeholder="Describe your report" />
                  </div>
                  <div>
                    <Label htmlFor="report-template">Template</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business">Business Performance</SelectItem>
                        <SelectItem value="technical">Technical Health</SelectItem>
                        <SelectItem value="analytics">User Analytics</SelectItem>
                        <SelectItem value="financial">Financial Summary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Schedule Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="schedule-frequency">Frequency</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {scheduleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="schedule-time">Time</Label>
                    <Input id="schedule-time" type="time" defaultValue="09:00" />
                  </div>
                  <div>
                    <Label htmlFor="recipients">Recipients</Label>
                    <Textarea id="recipients" placeholder="Enter email addresses (comma separated)" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-base">Report Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Executive Summary</h4>
                        <div className="bg-muted h-20 rounded"></div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Key Performance Indicators</h4>
                        <div className="grid gap-2 grid-cols-2">
                          <div className="bg-muted h-16 rounded"></div>
                          <div className="bg-muted h-16 rounded"></div>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Trend Analysis</h4>
                        <div className="bg-muted h-32 rounded"></div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Detailed Metrics</h4>
                        <div className="bg-muted h-24 rounded"></div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex gap-2">
            <Button>Save Report</Button>
            <Button variant="outline">Save as Template</Button>
            <Button variant="outline">Preview</Button>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <h3 className="text-lg font-semibold">Report Settings</h3>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Default Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="default-format">Default Export Format</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="est">Eastern Time</SelectItem>
                      <SelectItem value="pst">Pacific Time</SelectItem>
                      <SelectItem value="cet">Central European Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select notification level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Reports</SelectItem>
                      <SelectItem value="errors">Errors Only</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="retention">Report Retention</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select retention period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
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