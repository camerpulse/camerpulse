import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  Mail, 
  Send, 
  PenTool,
  TrendingUp, 
  AlertTriangle,
  Users,
  Globe,
  Calendar,
  Loader2,
  Eye,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NarrativeReport {
  id: string;
  date: string;
  type: 'daily' | 'weekly';
  title: string;
  summary: string;
  narrative: string;
  keyInsights: string[];
  quotableQuotes: string[];
  tone: 'journalistic' | 'analyst' | 'diplomatic';
  metadata: {
    emotionalShifts: Array<{ region: string; shift: string; analysis: string }>;
    dangerSpikes: Array<{ location: string; level: string; context: string }>;
    partyMomentum: Array<{ party: string; trend: string; analysis: string }>;
    trendingIssues: Array<{ issue: string; volume: number; sentiment: string; analysis: string }>;
  };
  generatedAt: string;
}

interface GenerationSettings {
  tone: 'journalistic' | 'analyst' | 'diplomatic';
  length: 'brief' | 'standard' | 'detailed';
  focus: 'balanced' | 'security' | 'political' | 'social';
  includeQuotes: boolean;
  includePredictions: boolean;
  language: 'english' | 'french';
}

export const CivicNarrativeGenerator: React.FC = () => {
  const [narrativeReports, setNarrativeReports] = useState<NarrativeReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<NarrativeReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportType, setReportType] = useState<'daily' | 'weekly'>('daily');
  const [settings, setSettings] = useState<GenerationSettings>({
    tone: 'journalistic',
    length: 'standard',
    focus: 'balanced',
    includeQuotes: true,
    includePredictions: false,
    language: 'english'
  });

  const { toast } = useToast();

  // Load existing narrative reports
  useEffect(() => {
    loadNarrativeReports();
  }, []);

  const loadNarrativeReports = async () => {
    try {
      const response = await supabase.functions.invoke('civic-narrative-generator', {
        body: { action: 'list_reports', limit: 10 }
      });

      if (response.data?.reports) {
        setNarrativeReports(response.data.reports);
      }
    } catch (error) {
      console.error('Failed to load narrative reports:', error);
    }
  };

  // Generate new narrative report
  const generateNarrativeReport = async () => {
    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('civic-narrative-generator', {
        body: { 
          action: 'generate_narrative',
          date: selectedDate,
          type: reportType,
          settings
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const newReport = response.data.report;
      setNarrativeReports(prev => [newReport, ...prev]);
      setSelectedReport(newReport);
      
      toast({
        title: 'Narrative Generated',
        description: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} narrative report has been generated successfully.`
      });
    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate narrative report',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Export narrative report
  const exportReport = async (format: 'pdf' | 'html' | 'txt') => {
    if (!selectedReport) return;
    
    setIsExporting(true);
    try {
      const response = await supabase.functions.invoke('civic-narrative-generator', {
        body: { 
          action: 'export_narrative',
          reportId: selectedReport.id,
          format
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Create download link
      const mimeTypes = {
        pdf: 'application/pdf',
        html: 'text/html',
        txt: 'text/plain'
      };
      
      const blob = new Blob([response.data.content], { type: mimeTypes[format] });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `civic-narrative-${selectedReport.date}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: `Narrative exported as ${format.toUpperCase()}`
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

  // Send report via email/telegram
  const sendReport = async (channel: 'email' | 'telegram', recipient: string) => {
    if (!selectedReport) return;
    
    try {
      const response = await supabase.functions.invoke('civic-narrative-generator', {
        body: { 
          action: 'send_narrative',
          reportId: selectedReport.id,
          channel,
          recipient
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: 'Report Sent',
        description: `Narrative report sent via ${channel} successfully.`
      });
    } catch (error: any) {
      toast({
        title: 'Send Failed',
        description: error.message || `Failed to send via ${channel}`,
        variant: 'destructive'
      });
    }
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'journalistic': return 'default';
      case 'analyst': return 'secondary';
      case 'diplomatic': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Civic Narrative Generator</h2>
          <p className="text-muted-foreground">
            AI-powered natural language summaries of civic events and trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={reportType} onValueChange={(value: 'daily' | 'weekly') => setReportType(value)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40"
          />
          <Button 
            onClick={generateNarrativeReport}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <PenTool className="mr-2 h-4 w-4" />
                Generate Narrative
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="narrative" className="space-y-4">
        <TabsList>
          <TabsTrigger value="narrative">Narrative</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Narrative Tab */}
        <TabsContent value="narrative">
          {selectedReport ? (
            <div className="space-y-6">
              {/* Report Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{selectedReport.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <Calendar className="h-4 w-4" />
                        {selectedReport.date} • {selectedReport.type.charAt(0).toUpperCase() + selectedReport.type.slice(1)} Report
                        <Badge variant={getToneColor(selectedReport.tone)} className="ml-2">
                          {selectedReport.tone}
                        </Badge>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => exportReport('pdf')}>
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => exportReport('html')}>
                        <Download className="mr-2 h-4 w-4" />
                        HTML
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => sendReport('email', '')}>
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Executive Summary */}
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-semibold mb-2">Executive Summary</h3>
                      <p className="text-sm">{selectedReport.summary}</p>
                    </div>

                    {/* Main Narrative */}
                    <div>
                      <h3 className="font-semibold mb-3">Analysis</h3>
                      <div className="prose prose-sm max-w-none">
                        {selectedReport.narrative.split('\n\n').map((paragraph, index) => (
                          <p key={index} className="mb-4 text-sm leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Key Insights */}
                    {selectedReport.keyInsights.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Key Insights</h3>
                        <ul className="space-y-2">
                          {selectedReport.keyInsights.map((insight, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Quotable Quotes */}
                    {selectedReport.quotableQuotes.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Notable Statements</h3>
                        <div className="space-y-3">
                          {selectedReport.quotableQuotes.map((quote, index) => (
                            <blockquote key={index} className="border-l-4 border-primary pl-4 italic text-sm">
                              "{quote}"
                            </blockquote>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Breakdown */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Emotional Shifts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Regional Emotional Shifts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedReport.metadata.emotionalShifts.map((shift, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{shift.region}</span>
                            <Badge variant="outline">{shift.shift}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{shift.analysis}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Danger Spikes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Civic Danger Spikes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedReport.metadata.dangerSpikes.map((spike, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{spike.location}</span>
                            <Badge variant={spike.level === 'high' ? 'destructive' : 'secondary'}>
                              {spike.level}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{spike.context}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Party Momentum */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Political Momentum</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedReport.metadata.partyMomentum.map((momentum, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{momentum.party}</span>
                            <Badge variant={momentum.trend === 'rising' ? 'default' : 'secondary'}>
                              {momentum.trend}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{momentum.analysis}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Trending Issues */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Trending Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedReport.metadata.trendingIssues.map((issue, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{issue.issue}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{issue.volume}</Badge>
                              <Badge variant={issue.sentiment === 'positive' ? 'default' : 'destructive'}>
                                {issue.sentiment}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{issue.analysis}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <PenTool className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Narrative Selected</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Generate a new narrative report or select an existing one from the Reports tab
                </p>
                <Button onClick={() => generateNarrativeReport()} disabled={isGenerating}>
                  Generate Your First Narrative
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <div className="grid gap-4">
            {narrativeReports.map((report) => (
              <Card key={report.id} className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedReport(report)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{report.title}</h3>
                        <Badge variant={getToneColor(report.tone)}>{report.tone}</Badge>
                        <Badge variant="outline">{report.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{report.summary}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{report.date}</span>
                        <span>{report.keyInsights.length} insights</span>
                        <span>{report.quotableQuotes.length} quotes</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReport(report);
                      }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        exportReport('pdf');
                      }}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Generation Settings</CardTitle>
              <CardDescription>
                Configure how AI generates narrative reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tone">Writing Tone</Label>
                  <Select value={settings.tone} onValueChange={(value: any) => setSettings(prev => ({ ...prev, tone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="journalistic">Journalistic</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                      <SelectItem value="diplomatic">Diplomatic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="length">Report Length</Label>
                  <Select value={settings.length} onValueChange={(value: any) => setSettings(prev => ({ ...prev, length: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brief">Brief</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="focus">Analysis Focus</Label>
                  <Select value={settings.focus} onValueChange={(value: any) => setSettings(prev => ({ ...prev, focus: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="security">Security-Focused</SelectItem>
                      <SelectItem value="political">Political-Focused</SelectItem>
                      <SelectItem value="social">Social-Focused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={settings.language} onValueChange={(value: any) => setSettings(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="french" disabled>Français (Disabled)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="quotes">Include Quotable Statements</Label>
                    <p className="text-sm text-muted-foreground">
                      Generate impactful quotes from the analysis
                    </p>
                  </div>
                  <Switch
                    id="quotes"
                    checked={settings.includeQuotes}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, includeQuotes: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="predictions">Include Predictions</Label>
                    <p className="text-sm text-muted-foreground">
                      Add forward-looking analysis and predictions
                    </p>
                  </div>
                  <Switch
                    id="predictions"
                    checked={settings.includePredictions}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, includePredictions: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};