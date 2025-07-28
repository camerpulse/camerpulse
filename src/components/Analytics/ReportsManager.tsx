import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Plus, Play, Eye, Calendar, FileText, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface ReportFormData {
  report_name: string;
  report_type: string;
  description: string;
  data_sources: string[];
  filters: any;
  visualization_config: any;
  is_public: boolean;
}

export const ReportsManager: React.FC = () => {
  const { reports, createReport, executeReport, loading } = useAnalytics();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const { register, handleSubmit, reset, setValue, watch } = useForm<ReportFormData>({
    defaultValues: {
      report_name: '',
      report_type: 'analytics_summary',
      description: '',
      data_sources: ['realtime_analytics_events'],
      filters: {},
      visualization_config: {},
      is_public: false
    }
  });

  const reportType = watch('report_type');

  const onSubmit = async (data: ReportFormData) => {
    try {
      await createReport({
        ...data,
        configuration: {},
        data_sources: [data.report_type],
        filters: data.filters || {},
        visualization_config: data.visualization_config || {}
      });
      setIsCreateDialogOpen(false);
      reset();
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  const handleExecuteReport = async (reportId: string) => {
    try {
      await executeReport(reportId);
    } catch (error) {
      console.error('Error executing report:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: 'default',
      draft: 'secondary',
      archived: 'outline'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getReportTypeDescription = (type: string) => {
    const descriptions: Record<string, string> = {
      analytics_summary: 'Overall analytics summary with key metrics',
      user_behavior: 'Detailed user behavior and interaction patterns',
      performance: 'Application performance metrics and trends',
      custom: 'Custom report with configurable data sources'
    };
    return descriptions[type] || 'Custom report';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Analytics Reports</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage custom analytics reports
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Report</DialogTitle>
              <DialogDescription>
                Configure a new analytics report with custom parameters
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="report_name">Report Name</Label>
                  <Input
                    id="report_name"
                    {...register('report_name', { required: true })}
                    placeholder="Weekly Analytics Summary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="report_type">Report Type</Label>
                  <Select onValueChange={(value) => setValue('report_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="analytics_summary">Analytics Summary</SelectItem>
                      <SelectItem value="user_behavior">User Behavior</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Describe what this report will analyze..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Report Configuration</Label>
                <div className="text-sm text-muted-foreground">
                  {getReportTypeDescription(reportType)}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_public"
                  {...register('is_public')}
                  className="rounded"
                />
                <Label htmlFor="is_public" className="text-sm">
                  Make this report public
                </Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Report</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <Card key={report.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">{report.report_name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(report.status)}
                    <Badge variant="outline">{report.report_type}</Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExecuteReport(report.id)}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {report.description && (
                <CardDescription className="text-sm">
                  {report.description}
                </CardDescription>
              )}
              
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                Created {new Date(report.created_at).toLocaleDateString()}
              </div>

              {report.last_generated_at && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <FileText className="h-3 w-3 mr-1" />
                  Last run {new Date(report.last_generated_at).toLocaleString()}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Play className="h-3 w-3 mr-1" />
                    Run
                  </Button>
                </div>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {reports.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first analytics report to get started
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};