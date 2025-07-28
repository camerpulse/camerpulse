import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LabelCanvas } from './LabelCanvas';
import { LabelField } from '@/types/labelTypes';

interface PrintPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fields: LabelField[];
  dimensions: { width: number; height: number };
  shipmentData?: any;
}

export const PrintPreviewDialog: React.FC<PrintPreviewDialogProps> = ({
  open,
  onOpenChange,
  fields,
  dimensions,
  shipmentData
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Print Preview</DialogTitle>
        </DialogHeader>
        <div className="h-96">
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
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => window.print()}>
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};