import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Download, Plus, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';

interface ExportFormData {
  export_name: string;
  export_type: string;
  format: string;
  filters: any;
}

export const DataExport: React.FC = () => {
  const { exportJobs, createExportJob, loading } = useAnalytics();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  const { register, handleSubmit, reset, setValue, watch } = useForm<ExportFormData>({
    defaultValues: {
      export_name: '',
      export_type: 'analytics',
      format: 'csv',
      filters: {}
    }
  });

  const exportType = watch('export_type');

  const onSubmit = async (data: ExportFormData) => {
    try {
      const filters = {
        ...data.filters,
        start_date: dateRange?.from?.toISOString(),
        end_date: dateRange?.to?.toISOString()
      };

      await createExportJob({
        ...data,
        data_query: {
          export_type: data.export_type,
          filters
        },
        filters
      });
      
      setIsCreateDialogOpen(false);
      reset();
      setDateRange(undefined);
    } catch (error) {
      console.error('Error creating export job:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: 'default',
      processing: 'secondary',
      failed: 'destructive',
      pending: 'outline'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getExportTypeDescription = (type: string) => {
    const descriptions: Record<string, string> = {
      analytics: 'Export analytics events and user interactions',
      performance: 'Export performance metrics and timing data',
      reports: 'Export generated reports and their results',
      custom: 'Export custom data based on specific queries'
    };
    return descriptions[type] || 'Custom data export';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Data Export</h3>
          <p className="text-sm text-muted-foreground">
            Export analytics data in various formats
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Export
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Data Export</DialogTitle>
              <DialogDescription>
                Configure a new data export job with custom parameters
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="export_name">Export Name</Label>
                  <Input
                    id="export_name"
                    {...register('export_name', { required: true })}
                    placeholder="Analytics Export Q4 2023"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="export_type">Data Type</Label>
                  <Select onValueChange={(value) => setValue('export_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="analytics">Analytics Events</SelectItem>
                      <SelectItem value="performance">Performance Metrics</SelectItem>
                      <SelectItem value="reports">Reports Data</SelectItem>
                      <SelectItem value="custom">Custom Query</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="format">Export Format</Label>
                  <Select onValueChange={(value) => setValue('format', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <DatePickerWithRange
                    date={dateRange}
                    onDateChange={setDateRange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Export Description</Label>
                <div className="text-sm text-muted-foreground">
                  {getExportTypeDescription(exportType)}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Export</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {exportJobs.map((job) => (
          <Card key={job.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">{job.export_name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(job.status)}
                    <Badge variant="outline">{job.export_type}</Badge>
                    <Badge variant="outline">{job.format.toUpperCase()}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(job.status)}
                  {job.status === 'completed' && job.file_path && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {job.status === 'processing' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{job.progress_percentage}%</span>
                  </div>
                  <Progress value={job.progress_percentage} className="h-2" />
                  {job.processed_records && job.total_records && (
                    <div className="text-xs text-muted-foreground">
                      {job.processed_records.toLocaleString()} of {job.total_records.toLocaleString()} records processed
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Created</div>
                  <div>{new Date(job.created_at).toLocaleDateString()}</div>
                </div>
                {job.completed_at && (
                  <div>
                    <div className="text-muted-foreground">Completed</div>
                    <div>{new Date(job.completed_at).toLocaleDateString()}</div>
                  </div>
                )}
                {job.total_records && (
                  <div>
                    <div className="text-muted-foreground">Records</div>
                    <div>{job.total_records.toLocaleString()}</div>
                  </div>
                )}
                {job.file_size_bytes && (
                  <div>
                    <div className="text-muted-foreground">File Size</div>
                    <div>{formatFileSize(job.file_size_bytes)}</div>
                  </div>
                )}
              </div>

              {job.error_message && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-sm text-red-800">
                    <strong>Error:</strong> {job.error_message}
                  </div>
                </div>
              )}

              {job.expires_at && (
                <div className="text-xs text-muted-foreground">
                  Expires on {new Date(job.expires_at).toLocaleDateString()}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {exportJobs.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Download className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Exports Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first data export to get started
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Export
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};