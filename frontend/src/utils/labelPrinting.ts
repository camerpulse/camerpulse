import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LabelSize, LABEL_SIZES } from './labelGeneration';

// PDF generation utilities
export interface PDFOptions {
  orientation?: 'portrait' | 'landscape';
  unit?: 'pt' | 'mm' | 'cm' | 'in';
  format?: string | [number, number];
  compress?: boolean;
  precision?: number;
}

export interface PrintOptions {
  copies?: number;
  printerId?: string;
  paperSize?: LabelSize;
  quality?: 'draft' | 'normal' | 'high';
  colorMode?: 'color' | 'grayscale' | 'blackwhite';
  thermalPrinter?: boolean;
}

export interface LabelPrintData {
  templateId?: string;
  shipmentId?: string;
  agencyId?: string;
  trackingNumber: string;
  sender: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
  };
  receiver: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
  };
  package: {
    weight?: string;
    dimensions?: string;
    description?: string;
    value?: string;
  };
  shipping: {
    service: string;
    estimatedDelivery?: string;
    price?: string;
    currency?: string;
  };
  agency?: {
    name: string;
    logo?: string;
    contact?: string;
  };
}

// Generate PDF from HTML element
export const generatePDFFromElement = async (
  element: HTMLElement,
  filename: string,
  options: PDFOptions = {}
): Promise<Blob> => {
  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    // Get label size for PDF dimensions
    const labelSize = LABEL_SIZES.A4; // Default to A4
    const orientation = options.orientation || 'portrait';
    
    const pdf = new jsPDF({
      orientation,
      unit: options.unit || 'pt',
      format: options.format || [labelSize.width, labelSize.height],
      compress: options.compress !== false,
      precision: options.precision || 2,
    });

    // Calculate dimensions to fit the content
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = orientation === 'portrait' ? labelSize.width : labelSize.height;
    const imgHeight = orientation === 'portrait' ? labelSize.height : labelSize.width;
    
    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

// Generate thermal printer optimized version
export const generateThermalPDF = async (
  element: HTMLElement,
  options: PrintOptions = {}
): Promise<Blob> => {
  const thermalWidth = 288; // 4 inches at 72 DPI
  const thermalHeight = 432; // 6 inches at 72 DPI

  try {
    const canvas = await html2canvas(element, {
      scale: 1,
      width: thermalWidth,
      height: thermalHeight,
      backgroundColor: '#ffffff',
      useCORS: true,
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: [thermalWidth, thermalHeight],
      compress: true,
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, thermalWidth, thermalHeight);
    
    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating thermal PDF:', error);
    throw new Error('Failed to generate thermal printer PDF');
  }
};

// Print label directly
export const printLabel = async (
  pdfBlob: Blob,
  options: PrintOptions = {}
): Promise<void> => {
  try {
    const url = URL.createObjectURL(pdfBlob);
    
    if (options.thermalPrinter) {
      // For thermal printers, open in new window with specific print settings
      const printWindow = window.open(url, '_blank', 'width=400,height=600');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
            URL.revokeObjectURL(url);
          }, 1000);
        };
      }
    } else {
      // Regular printing
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
            URL.revokeObjectURL(url);
          }, 1000);
        };
      }
    }
  } catch (error) {
    console.error('Error printing label:', error);
    throw new Error('Failed to print label');
  }
};

// Download PDF
export const downloadPDF = (pdfBlob: Blob, filename: string): void => {
  try {
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw new Error('Failed to download PDF');
  }
};

// Validate print data
export const validatePrintData = (data: LabelPrintData): string[] => {
  const errors: string[] = [];

  if (!data.trackingNumber?.trim()) {
    errors.push('Tracking number is required');
  }

  if (!data.sender?.name?.trim()) {
    errors.push('Sender name is required');
  }

  if (!data.sender?.address?.trim()) {
    errors.push('Sender address is required');
  }

  if (!data.receiver?.name?.trim()) {
    errors.push('Receiver name is required');
  }

  if (!data.receiver?.address?.trim()) {
    errors.push('Receiver address is required');
  }

  if (!data.shipping?.service?.trim()) {
    errors.push('Shipping service is required');
  }

  return errors;
};

// Label size utilities
export const calculateOptimalSize = (
  content: string,
  maxWidth: number,
  fontSize: number
): { width: number; height: number } => {
  // Create temporary element to measure text
  const temp = document.createElement('div');
  temp.style.position = 'absolute';
  temp.style.visibility = 'hidden';
  temp.style.fontSize = `${fontSize}px`;
  temp.style.width = `${maxWidth}px`;
  temp.style.wordWrap = 'break-word';
  temp.textContent = content;
  
  document.body.appendChild(temp);
  const { offsetWidth, offsetHeight } = temp;
  document.body.removeChild(temp);

  return {
    width: Math.min(offsetWidth, maxWidth),
    height: offsetHeight,
  };
};

// Print preview utilities
export const generatePreviewHTML = (
  data: LabelPrintData,
  template: any,
  branding?: any
): string => {
  const brandColors = branding ? {
    primary: branding.primary_color || '#10b981',
    text: branding.text_color || '#1f2937',
    background: branding.background_color || '#ffffff',
  } : {
    primary: '#10b981',
    text: '#1f2937',
    background: '#ffffff',
  };

  return `
    <div style="
      width: 400px;
      height: 600px;
      background: ${brandColors.background};
      color: ${brandColors.text};
      font-family: ${branding?.primary_font || 'Arial'}, sans-serif;
      padding: 20px;
      border: 1px solid #e5e7eb;
      position: relative;
    ">
      ${branding?.logo_url ? `
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${branding.logo_url}" alt="Logo" style="max-height: 60px; max-width: 200px;">
        </div>
      ` : ''}
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div style="flex: 1; margin-right: 10px;">
          <h3 style="margin: 0 0 10px 0; color: ${brandColors.primary};">From:</h3>
          <div style="font-size: 12px; line-height: 1.4;">
            <div style="font-weight: bold;">${data.sender.name}</div>
            <div>${data.sender.address}</div>
            ${data.sender.phone ? `<div>Phone: ${data.sender.phone}</div>` : ''}
          </div>
        </div>
        
        <div style="flex: 1; margin-left: 10px;">
          <h3 style="margin: 0 0 10px 0; color: ${brandColors.primary};">To:</h3>
          <div style="font-size: 12px; line-height: 1.4;">
            <div style="font-weight: bold;">${data.receiver.name}</div>
            <div>${data.receiver.address}</div>
            ${data.receiver.phone ? `<div>Phone: ${data.receiver.phone}</div>` : ''}
          </div>
        </div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">
          Tracking: ${data.trackingNumber}
        </div>
        <div style="margin: 20px 0;">
          <canvas id="barcode-${Date.now()}" style="max-width: 100%;"></canvas>
        </div>
      </div>
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 30px;">
        <div style="font-size: 12px;">
          <div style="font-weight: bold;">Service: ${data.shipping.service}</div>
          ${data.shipping.estimatedDelivery ? `<div>Est. Delivery: ${data.shipping.estimatedDelivery}</div>` : ''}
        </div>
        
        <div style="width: 80px; height: 80px; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center;">
          <canvas id="qr-${Date.now()}" style="max-width: 100%; max-height: 100%;"></canvas>
        </div>
      </div>
      
      ${branding?.enable_watermark && branding?.watermark_url ? `
        <div style="
          position: absolute;
          bottom: 10px;
          right: 10px;
          opacity: 0.3;
        ">
          <img src="${branding.watermark_url}" alt="Watermark" style="max-height: 40px;">
        </div>
      ` : ''}
    </div>
  `;
};

// Batch printing utilities
export interface BatchPrintJob {
  id: string;
  data: LabelPrintData;
  template: any;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

export const processBatchPrint = async (
  jobs: BatchPrintJob[],
  options: PrintOptions = {},
  onProgress?: (completed: number, total: number) => void
): Promise<BatchPrintJob[]> => {
  const results: BatchPrintJob[] = [];
  
  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    
    try {
      // Validate data
      const errors = validatePrintData(job.data);
      if (errors.length > 0) {
        results.push({
          ...job,
          status: 'error',
          error: errors.join(', '),
        });
        continue;
      }

      // Process the job (this would integrate with actual printing)
      results.push({
        ...job,
        status: 'completed',
      });

      // Report progress
      if (onProgress) {
        onProgress(i + 1, jobs.length);
      }

      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      results.push({
        ...job,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
};