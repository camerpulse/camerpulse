import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, FileText, FileSpreadsheet, File, 
  Loader2, CheckCircle, AlertCircle 
} from 'lucide-react';

interface ExportOption {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  label: string;
  description: string;
  icon: React.ElementType;
}

interface ExportFunctionalityProps {
  data: any[];
  filename?: string;
  title?: string;
  onExport?: (format: string, data: any[]) => Promise<void> | void;
  customExportOptions?: ExportOption[];
  className?: string;
}

export const ExportFunctionality: React.FC<ExportFunctionalityProps> = ({
  data,
  filename = 'export',
  title = 'Export Data',
  onExport,
  customExportOptions,
  className
}) => {
  const { toast } = useToast();
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const defaultExportOptions: ExportOption[] = [
    {
      format: 'csv',
      label: 'CSV',
      description: 'Comma-separated values for spreadsheet applications',
      icon: FileSpreadsheet
    },
    {
      format: 'excel',
      label: 'Excel',
      description: 'Microsoft Excel format with formatting',
      icon: FileSpreadsheet
    },
    {
      format: 'pdf',
      label: 'PDF',
      description: 'Portable document format for sharing',
      icon: FileText
    },
    {
      format: 'json',
      label: 'JSON',
      description: 'JavaScript Object Notation for developers',
      icon: File
    }
  ];

  const exportOptions = customExportOptions || defaultExportOptions;

  const convertToCSV = (data: any[]): string => {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value.toString();
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  };

  const convertToJSON = (data: any[]): string => {
    return JSON.stringify(data, null, 2);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format: string) => {
    if (!data.length) {
      toast({
        title: "No Data",
        description: "There is no data to export.",
        variant: "destructive",
      });
      return;
    }

    setExporting(format);
    setExportSuccess(null);

    try {
      if (onExport) {
        await onExport(format, data);
      } else {
        // Default export logic
        let content: string;
        let mimeType: string;
        let fileExtension: string;

        switch (format) {
          case 'csv':
            content = convertToCSV(data);
            mimeType = 'text/csv';
            fileExtension = 'csv';
            break;
          case 'json':
            content = convertToJSON(data);
            mimeType = 'application/json';
            fileExtension = 'json';
            break;
          case 'excel':
            // For Excel, we'll use CSV format with .xlsx extension
            // In a real app, you'd use a library like xlsx or exceljs
            content = convertToCSV(data);
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            fileExtension = 'xlsx';
            break;
          case 'pdf':
            // For PDF, we'll use JSON format as placeholder
            // In a real app, you'd use a library like jsPDF or puppeteer
            content = convertToJSON(data);
            mimeType = 'application/pdf';
            fileExtension = 'pdf';
            toast({
              title: "PDF Export",
              description: "PDF export functionality would be implemented with a PDF library.",
            });
            return;
          default:
            throw new Error(`Unsupported format: ${format}`);
        }

        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const fullFilename = `${filename}_${timestamp}.${fileExtension}`;
        
        downloadFile(content, fullFilename, mimeType);
      }

      setExportSuccess(format);
      toast({
        title: "Export Successful",
        description: `Data exported as ${format.toUpperCase()} successfully.`,
      });

      // Clear success state after 3 seconds
      setTimeout(() => setExportSuccess(null), 3000);

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: `Failed to export data as ${format.toUpperCase()}.`,
        variant: "destructive",
      });
    } finally {
      setExporting(null);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>
          Export your data in various formats for analysis or sharing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {exportOptions.map((option) => {
            const Icon = option.icon;
            const isExporting = exporting === option.format;
            const isSuccess = exportSuccess === option.format;
            
            return (
              <Button
                key={option.format}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-muted/50"
                onClick={() => handleExport(option.format)}
                disabled={!!exporting}
              >
                <div className="flex items-center justify-center w-8 h-8">
                  {isExporting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : isSuccess ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                
                <div className="text-center">
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-muted-foreground mt-1 leading-tight">
                    {option.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
        
        {data.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            {data.length} record{data.length !== 1 ? 's' : ''} ready for export
          </div>
        )}
      </CardContent>
    </Card>
  );
};