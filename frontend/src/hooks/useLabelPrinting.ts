import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { 
  generatePDFFromElement, 
  generateThermalPDF, 
  printLabel, 
  downloadPDF,
  validatePrintData,
  type LabelPrintData,
  type PrintOptions,
  type PDFOptions 
} from '@/utils/labelPrinting';

export interface PrintHistoryEntry {
  id: string;
  template_id?: string;
  shipment_id?: string;
  print_type: string;
  printed_by: string;
  label_format?: string;
  printer_type?: string;
  print_settings?: any;
  file_path?: string;
  download_count?: number;
  last_downloaded_at?: string;
  created_at: string;
}

export const useLabelPrinting = () => {
  const [loading, setLoading] = useState(false);
  const [printHistory, setPrintHistory] = useState<PrintHistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Generate and download PDF
  const generateAndDownloadPDF = useCallback(async (
    element: HTMLElement,
    filename: string,
    options: PDFOptions = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const pdfBlob = await generatePDFFromElement(element, filename, options);
      downloadPDF(pdfBlob, filename);
      
      toast({
        title: "Success",
        description: "PDF generated and downloaded successfully",
      });
      
      return pdfBlob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate PDF';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Print label
  const printLabelFromElement = useCallback(async (
    element: HTMLElement,
    data: LabelPrintData,
    options: PrintOptions = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Validate print data
      const validationErrors = validatePrintData(data);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Generate PDF
      const pdfBlob = options.thermalPrinter 
        ? await generateThermalPDF(element, options)
        : await generatePDFFromElement(element, 'label.pdf');

      // Print the label
      await printLabel(pdfBlob, options);

      // Log the print action
      await logPrintAction({
        template_id: data.templateId,
        shipment_id: data.shipmentId,
        print_type: 'original',
        printed_by: '', // Will be set in logPrintAction
        label_format: options.thermalPrinter ? 'THERMAL_PDF' : 'PDF',
        printer_type: options.thermalPrinter ? 'thermal' : 'standard',
        print_settings: {
          thermalPrinter: options.thermalPrinter,
          paperSize: options.paperSize,
          quality: options.quality,
        },
      });

      toast({
        title: "Success",
        description: "Label printed successfully",
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to print label';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Log print action to database (simplified to match actual schema)
  const logPrintAction = useCallback(async (printData: Partial<PrintHistoryEntry>) => {
    try {
      const user = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('label_print_history')
        .insert({
          ...printData,
          printed_by: user.data.user?.id || '',
          print_type: printData.print_type || 'original',
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local history
      setPrintHistory(prev => [data, ...prev]);
      
      return data;
    } catch (error) {
      console.error('Error logging print action:', error);
      // Don't throw here as it shouldn't block the printing process
    }
  }, []);

  // Fetch print history
  const fetchPrintHistory = useCallback(async (agencyId?: string, limit: number = 50) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('label_print_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Note: agency filtering would need to be implemented based on actual schema
      const { data, error } = await query;

      if (error) throw error;

      setPrintHistory(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch print history';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Reprint label
  const reprintLabel = useCallback(async (
    historyEntry: PrintHistoryEntry,
    printType: 'duplicate' | 'copy' = 'duplicate'
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Log the reprint action
      await logPrintAction({
        template_id: historyEntry.template_id,
        shipment_id: historyEntry.shipment_id,
        print_type: printType,
        label_format: historyEntry.label_format,
        printer_type: historyEntry.printer_type,
        print_settings: historyEntry.print_settings,
      });

      toast({
        title: "Success",
        description: `Label ${printType} printed successfully`,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reprint label';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast, logPrintAction]);

  // Print multiple labels
  const printBatchLabels = useCallback(async (
    labels: Array<{ element: HTMLElement; data: LabelPrintData }>,
    options: PrintOptions = {},
    onProgress?: (completed: number, total: number) => void
  ) => {
    setLoading(true);
    setError(null);

    try {
      const results = [];
      
      for (let i = 0; i < labels.length; i++) {
        const { element, data } = labels[i];
        
        try {
          await printLabelFromElement(element, data, options);
          results.push({ success: true, data });
        } catch (err) {
          results.push({ 
            success: false, 
            data, 
            error: err instanceof Error ? err.message : 'Unknown error' 
          });
        }

        if (onProgress) {
          onProgress(i + 1, labels.length);
        }

        // Small delay between prints
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      toast({
        title: "Batch Print Complete",
        description: `${successful} labels printed successfully${failed > 0 ? `, ${failed} failed` : ''}`,
        variant: failed > 0 ? "destructive" : "default",
      });

      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to print batch labels';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast, printLabelFromElement]);

  const exportLabelAsImage = async (element: HTMLElement, format: 'png' | 'jpeg' = 'png', scale: number = 1): Promise<Blob> => {
    try {
      const canvas = await html2canvas(element, {
        scale: scale,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create image blob'));
          }
        }, `image/${format}`, 0.9);
      });
    } catch (error) {
      console.error('Export image failed:', error);
      throw error;
    }
  };

  return {
    loading,
    error,
    printHistory,
    generateAndDownloadPDF,
    printLabelFromElement,
    exportLabelAsImage,
    fetchPrintHistory,
    reprintLabel,
    printBatchLabels,
    logPrintAction,
  };
};