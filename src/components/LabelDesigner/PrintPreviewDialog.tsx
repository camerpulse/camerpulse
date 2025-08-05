import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LabelCanvas } from './LabelCanvas';
import { LabelField } from '@/types/labelTypes';
import { useLabelPrinting } from '@/hooks/useLabelPrinting';
import { Download, Printer, Share, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PrintPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fields: LabelField[];
  dimensions: { width: number; height: number };
  shipmentData?: any;
  templateName?: string;
}

export const PrintPreviewDialog: React.FC<PrintPreviewDialogProps> = ({
  open,
  onOpenChange,
  fields,
  dimensions,
  shipmentData,
  templateName = 'Label Preview'
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const { loading, printLabelFromElement, exportLabelAsImage } = useLabelPrinting();
  const { toast } = useToast();

  const handlePrint = async () => {
    const canvasElement = previewRef.current?.querySelector('.label-canvas') as HTMLElement;
    if (!canvasElement) {
      toast({
        title: "Error",
        description: "Cannot find label canvas for printing",
        variant: "destructive",
      });
      return;
    }

    try {
      await printLabelFromElement(canvasElement, {
        templateId: undefined,
        shipmentId: shipmentData?.id,
        trackingNumber: shipmentData?.tracking_number || 'PREVIEW-' + Date.now(),
        sender: shipmentData?.sender || {
          name: 'Preview Sender',
          address: '123 Preview Street, City, Country'
        },
        receiver: shipmentData?.receiver || {
          name: 'Preview Receiver',
          address: '456 Preview Avenue, City, Country'
        },
        package: shipmentData?.package || {
          weight: '1.0kg',
          description: 'Preview package'
        },
        shipping: shipmentData?.shipping || {
          service: 'Standard Delivery'
        }
      });
    } catch (error) {
      console.error('Print failed:', error);
    }
  };

  const handleExport = async () => {
    const canvasElement = previewRef.current?.querySelector('.label-canvas') as HTMLElement;
    if (!canvasElement) {
      toast({
        title: "Error",
        description: "Cannot find label canvas for export",
        variant: "destructive",
      });
      return;
    }

    try {
      const imageBlob = await exportLabelAsImage(canvasElement, 'png', 1.5);
      const url = URL.createObjectURL(imageBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${templateName.replace(/\s+/g, '_')}_preview.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: "Label exported as PNG image",
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export failed",
        description: "Failed to export label as image",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const canvasElement = previewRef.current?.querySelector('.label-canvas') as HTMLElement;
        if (canvasElement) {
          const imageBlob = await exportLabelAsImage(canvasElement, 'png', 1.0);
          const file = new File([imageBlob], `${templateName}_preview.png`, { type: 'image/png' });
          
          await navigator.share({
            title: templateName,
            text: 'Check out this label design',
            files: [file]
          });
        }
      } catch (error) {
        console.error('Share failed:', error);
        toast({
          title: "Share failed",
          description: "Failed to share label",
          variant: "destructive",
        });
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      try {
        await navigator.clipboard.writeText(window.location.origin + window.location.pathname);
        toast({
          title: "Link copied",
          description: "Preview link copied to clipboard",
        });
      } catch (error) {
        toast({
          title: "Share not supported",
          description: "Your browser doesn't support sharing",
          variant: "destructive",
        });
      }
    }
  };

  const getLabelStats = () => {
    const totalFields = fields.length;
    const requiredFields = fields.filter(f => f.is_required).length;
    const fieldTypes = Array.from(new Set(fields.map(f => f.field_type)));
    
    return {
      totalFields,
      requiredFields,
      fieldTypes: fieldTypes.length
    };
  };

  const stats = getLabelStats();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Eye size={20} />
                {templateName} - Print Preview
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{stats.totalFields} fields</Badge>
                <Badge variant="outline">{stats.requiredFields} required</Badge>
                <Badge variant="outline">{stats.fieldTypes} types</Badge>
                <Badge variant="outline">{dimensions.width}×{dimensions.height}px</Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto" ref={previewRef}>
          <div className="p-4 bg-gray-50 min-h-[400px] flex items-center justify-center">
            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
              <LabelCanvas
                fields={fields}
                dimensions={dimensions}
                selectedField={null}
                onFieldSelect={() => {}}
                onFieldUpdate={() => {}}
                shipmentData={shipmentData}
                mode="preview"
              />
            </div>
          </div>
          
          {shipmentData && (
            <div className="p-4 border-t bg-background">
              <h4 className="font-medium mb-3">Shipment Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Tracking Number</p>
                  <p>{shipmentData.tracking_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Service</p>
                  <p>{shipmentData.shipping?.service || 'Standard'}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Weight</p>
                  <p>{shipmentData.package?.weight || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Description</p>
                  <p>{shipmentData.package?.description || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share size={16} />
              Share
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Export PNG
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              onClick={handlePrint}
              disabled={loading || fields.length === 0}
              className="flex items-center gap-2"
            >
              <Printer size={16} />
              Print Label
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};