import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  Mail, 
  Send, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  Users,
  MessageSquare,
  Target,
  BarChart3,
  Clock,
  Settings,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DailyReportData {
  date: string;
  totalAnalyzed: number;
  sentimentBreakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
  emotionalTones: Array<{ emotion: string; count: number; percentage: number }>;
  dangerIndex: number;
  threatLevel: string;
  topTrends: Array<{ topic: string; volume: number; sentiment: number }>;
  politicalMentions: Array<{ figure: string; mentions: number; sentiment: number }>;
  regionalActivity: Array<{ region: string; activity: number; alertLevel: string }>;
  platformBreakdown: Array<{ platform: string; count: number; percentage: number }>;
  keyEvents: Array<{ event: string; impact: string; time: string }>;
}

interface ExportSettings {
  format: 'pdf' | 'html';
  includeCharts: boolean;
  includeRawData: boolean;
  customLogo: string;
  headerText: string;
}

interface ScheduleSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  recipients: string[];
  channels: ('email' | 'telegram' | 'admin')[];
  telegramChatId?: string;
}

export const DailyReportGenerator: React.FC = () => {
  const [reportData, setReportData] = useState<DailyReportData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'pdf',
    includeCharts: true,
    includeRawData: false,
    customLogo: '',
    headerText: 'CamerPulse Intelligence - Daily Report'
  });
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings>({
    enabled: false,
    frequency: 'daily',
    time: '08:00',
    recipients: [],
    channels: ['admin'],
    telegramChatId: ''
  });
  const [newRecipient, setNewRecipient] = useState('');

  const { toast } = useToast();

  // Generate daily report data
  const generateReport = async (date: string) => {
    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('daily-report-generator', {
        body: { action: 'generate_daily_report', date }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setReportData(response.data.report);
      
      toast({
        title: 'Report Generated',
        description: `Daily report for ${date} has been generated successfully.`
      });
    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate daily report',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Export report
  const exportReport = async () => {
    if (!reportData) return;
    
    setIsExporting(true);
    try {
      const response = await supabase.functions.invoke('daily-report-generator', {
        body: { 
          action: 'export_report', 
          reportData,
          settings: exportSettings
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Create download link
      const blob = new Blob([response.data.content], { 
        type: exportSettings.format === 'pdf' ? 'application/pdf' : 'text/html' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `camerpulse-report-${reportData.date}.${exportSettings.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: `Report exported as ${exportSettings.format.toUpperCase()}`
      });
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export report',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Schedule report
  const saveScheduleSettings = async () => {
    try {
      const response = await supabase.functions.invoke('daily-report-generator', {
        body: { 
          action: 'save_schedule', 
          settings: scheduleSettings
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: 'Schedule Updated',
        description: 'Report schedule settings have been saved successfully.'
      });
    } catch (error: any) {
      toast({
        title: 'Schedule Failed',
        description: error.message || 'Failed to save schedule settings',
        variant: 'destructive'
      });
    }
  };

  // Load existing schedule on mount
  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const response = await supabase.functions.invoke('daily-report-generator', {
          body: { action: 'get_schedule' }
        });

        if (response.data?.schedule) {
          setScheduleSettings(response.data.schedule);
        }
      } catch (error) {
        console.error('Failed to load schedule:', error);
      }
    };

    loadSchedule();
  }, []);

  const addRecipient = () => {
    if (newRecipient && !scheduleSettings.recipients.includes(newRecipient)) {
      setScheduleSettings(prev => ({
        ...prev,
        recipients: [...prev.recipients, newRecipient]
      }));
      setNewRecipient('');
    }
  };

  const removeRecipient = (email: string) => {
    setScheduleSettings(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email)
    }));
  };

  const getDangerColor = (index: number) => {
    if (index >= 70) return 'destructive';
    if (index >= 50) return 'secondary';
    return 'default';
  };

  const getThreatBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Daily Report Generator</h2>
          <p className="text-muted-foreground">
            Generate comprehensive daily intelligence reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40"
          />
          <Button 
            onClick={() => generateReport(selectedDate)}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <BarChart3 className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="report" className="space-y-4">
        <TabsList>
          <TabsTrigger value="report">Report</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        {/* Report Tab */}
        <TabsContent value="report">
          {reportData ? (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Analyzed</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportData.totalAnalyzed.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      Posts analyzed today
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Danger Index</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">{reportData.dangerIndex}/100</div>
                      <Progress value={reportData.dangerIndex} className="h-2" />
                      <Badge variant={getDangerColor(reportData.dangerIndex)}>
                        {reportData.threatLevel.toUpperCase()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sentiment</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Positive: {reportData.sentimentBreakdown.positive}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-red-600">Negative: {reportData.sentimentBreakdown.negative}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Neutral: {reportData.sentimentBreakdown.neutral}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Platform Coverage</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {reportData.platformBreakdown.slice(0, 3).map((platform, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{platform.platform}</span>
                          <span>{platform.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Analysis */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Emotional Tones */}
                <Card>
                  <CardHeader>
                    <CardTitle>Emotional Tones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {reportData.emotionalTones.map((emotion, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{emotion.emotion}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={emotion.percentage} className="w-20 h-2" />
                            <span className="text-sm text-muted-foreground">{emotion.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Political Mentions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Political Mentions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {reportData.politicalMentions.map((mention, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{mention.figure}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant={mention.sentiment > 0 ? 'default' : 'destructive'}>
                              {mention.sentiment > 0 ? '+' : ''}{mention.sentiment.toFixed(1)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{mention.mentions}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Trending Topics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {reportData.topTrends.map((trend, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{trend.topic}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant={trend.sentiment > 0 ? 'default' : 'destructive'}>
                              {trend.sentiment.toFixed(1)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{trend.volume}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Regional Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Regional Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {reportData.regionalActivity.map((region, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{region.region}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant={getThreatBadgeColor(region.alertLevel)}>
                              {region.alertLevel}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{region.activity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Key Events */}
              {reportData.keyEvents.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Key Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {reportData.keyEvents.map((event, index) => (
                        <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                          <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="space-y-1 flex-1">
                            <p className="text-sm font-medium">{event.event}</p>
                            <p className="text-xs text-muted-foreground">{event.impact}</p>
                            <p className="text-xs text-muted-foreground">{event.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Report Generated</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Select a date and click "Generate Report" to create a daily intelligence summary.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Export Settings</CardTitle>
              <CardDescription>
                Configure export format and styling options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select 
                    value={exportSettings.format} 
                    onValueChange={(value: 'pdf' | 'html') => 
                      setExportSettings(prev => ({ ...prev, format: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="html">HTML Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="charts"
                      checked={exportSettings.includeCharts}
                      onCheckedChange={(checked) =>
                        setExportSettings(prev => ({ ...prev, includeCharts: checked }))
                      }
                    />
                    <Label htmlFor="charts">Include Charts</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="rawdata"
                      checked={exportSettings.includeRawData}
                      onCheckedChange={(checked) =>
                        setExportSettings(prev => ({ ...prev, includeRawData: checked }))
                      }
                    />
                    <Label htmlFor="rawdata">Include Raw Data</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Report Header</Label>
                <Input
                  value={exportSettings.headerText}
                  onChange={(e) =>
                    setExportSettings(prev => ({ ...prev, headerText: e.target.value }))
                  }
                  placeholder="Report title"
                />
              </div>

              <div className="space-y-2">
                <Label>Custom Logo URL (Optional)</Label>
                <Input
                  value={exportSettings.customLogo}
                  onChange={(e) =>
                    setExportSettings(prev => ({ ...prev, customLogo: e.target.value }))
                  }
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <Button 
                onClick={exportReport}
                disabled={!reportData || isExporting}
                className="w-full"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Automated Scheduling</CardTitle>
              <CardDescription>
                Configure automatic report generation and delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  checked={scheduleSettings.enabled}
                  onCheckedChange={(checked) =>
                    setScheduleSettings(prev => ({ ...prev, enabled: checked }))
                  }
                />
                <Label htmlFor="enabled">Enable Automatic Reports</Label>
              </div>

              {scheduleSettings.enabled && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select 
                        value={scheduleSettings.frequency} 
                        onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                          setScheduleSettings(prev => ({ ...prev, frequency: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={scheduleSettings.time}
                        onChange={(e) =>
                          setScheduleSettings(prev => ({ ...prev, time: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Delivery Channels</Label>
                    <div className="flex flex-wrap gap-2">
                      {(['email', 'telegram', 'admin'] as const).map((channel) => (
                        <Button
                          key={channel}
                          variant={scheduleSettings.channels.includes(channel) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setScheduleSettings(prev => ({
                              ...prev,
                              channels: prev.channels.includes(channel)
                                ? prev.channels.filter(c => c !== channel)
                                : [...prev.channels, channel]
                            }));
                          }}
                        >
                          {channel === 'email' && <Mail className="mr-1 h-3 w-3" />}
                          {channel === 'telegram' && <Send className="mr-1 h-3 w-3" />}
                          {channel === 'admin' && <Settings className="mr-1 h-3 w-3" />}
                          {channel.charAt(0).toUpperCase() + channel.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {scheduleSettings.channels.includes('email') && (
                    <div className="space-y-4">
                      <Label>Email Recipients</Label>
                      <div className="flex gap-2">
                        <Input
                          type="email"
                          placeholder="Enter email address"
                          value={newRecipient}
                          onChange={(e) => setNewRecipient(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                        />
                        <Button onClick={addRecipient} size="sm">Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {scheduleSettings.recipients.map((email) => (
                          <Badge key={email} variant="secondary" className="cursor-pointer" 
                                 onClick={() => removeRecipient(email)}>
                            {email} ×
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {scheduleSettings.channels.includes('telegram') && (
                    <div className="space-y-2">
                      <Label>Telegram Chat ID</Label>
                      <Input
                        placeholder="Enter Telegram chat ID"
                        value={scheduleSettings.telegramChatId || ''}
                        onChange={(e) =>
                          setScheduleSettings(prev => ({ ...prev, telegramChatId: e.target.value }))
                        }
                      />
                    </div>
                  )}

                  <Button onClick={saveScheduleSettings} className="w-full">
                    <Calendar className="mr-2 h-4 w-4" />
                    Save Schedule Settings
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DailyReportGenerator;