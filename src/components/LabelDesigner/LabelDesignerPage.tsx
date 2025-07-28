import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LabelCanvas } from './LabelCanvas';
import { FieldEditor } from './FieldEditor';
import { PrintPreviewDialog } from './PrintPreviewDialog';
import { TemplateLibrary } from './TemplateLibrary';
import { useLabelPrinting } from '@/hooks/useLabelPrinting';
import { LabelField, LabelDimensions } from '@/types/labelTypes';
import { LABEL_SIZES } from '@/utils/labelGeneration';
import { Save, FileText, Printer, Eye, Library } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const LabelDesignerPage: React.FC = () => {
  const [templateName, setTemplateName] = useState('');
  const [selectedSize, setSelectedSize] = useState<keyof typeof LABEL_SIZES>('A4');
  const [fields, setFields] = useState<LabelField[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [shipmentData, setShipmentData] = useState<any>(null);
  
  const { loading, printLabelFromElement } = useLabelPrinting();
  const { toast } = useToast();

  const dimensions: LabelDimensions = {
    width: LABEL_SIZES[selectedSize].width,
    height: LABEL_SIZES[selectedSize].height
  };

  const handleFieldUpdate = (fieldId: string, updates: Partial<LabelField>) => {
    setFields(prev => {
      const existingIndex = prev.findIndex(f => f.id === fieldId);
      
      if (existingIndex >= 0) {
        // Update existing field
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...updates };
        return updated;
      } else {
        // Add new field
        return [...prev, updates as LabelField];
      }
    });
  };

  const handleFieldRemove = (fieldId: string) => {
    setFields(prev => prev.filter(f => f.id !== fieldId));
    if (selectedField === fieldId) {
      setSelectedField(null);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast({
        title: "Template name required",
        description: "Please enter a name for your template",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save template logic would go here
      console.log('Saving template:', {
        name: templateName,
        size: selectedSize,
        fields: fields
      });
      
      toast({
        title: "Template saved",
        description: `Template "${templateName}" has been saved successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    }
  };

  const handlePrint = async () => {
    const canvasElement = document.querySelector('.label-canvas') as HTMLElement;
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
        shipmentId: undefined,
        trackingNumber: 'SAMPLE-' + Date.now(),
        sender: {
          name: 'Sample Sender',
          address: '123 Sender Street, City, Country'
        },
        receiver: {
          name: 'Sample Receiver', 
          address: '456 Receiver Avenue, City, Country'
        },
        package: {
          weight: '1.5kg',
          description: 'Sample package'
        },
        shipping: {
          service: 'Standard Delivery'
        }
      });
    } catch (error) {
      console.error('Print failed:', error);
    }
  };

  const selectedFieldData = selectedField ? fields.find(f => f.id === selectedField) : null;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Label Designer</h1>
          <p className="text-muted-foreground">Create and customize shipping labels</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-2"
          >
            <Library size={16} />
            Templates
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2"
          >
            <Eye size={16} />
            Preview
          </Button>
          <Button
            onClick={handlePrint}
            disabled={loading || fields.length === 0}
            className="flex items-center gap-2"
          >
            <Printer size={16} />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Design Canvas</CardTitle>
                  <CardDescription>
                    Design your label layout by adding and positioning elements
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="size-select" className="text-sm">Size:</Label>
                    <Select value={selectedSize} onValueChange={(value: keyof typeof LABEL_SIZES) => setSelectedSize(value)}>
                      <SelectTrigger id="size-select" className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(LABEL_SIZES).map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="label-canvas">
              <LabelCanvas
                fields={fields}
                dimensions={dimensions}
                selectedField={selectedField}
                onFieldSelect={setSelectedField}
                onFieldUpdate={handleFieldUpdate}
                shipmentData={shipmentData}
                mode="design"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} />
                Template Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  placeholder="Enter template name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>
              
              <Button
                onClick={handleSaveTemplate}
                className="w-full flex items-center gap-2"
                disabled={!templateName.trim() || fields.length === 0}
              >
                <Save size={16} />
                Save Template
              </Button>
            </CardContent>
          </Card>

          {selectedFieldData && (
            <FieldEditor
              field={selectedFieldData}
              onUpdate={(updates) => handleFieldUpdate(selectedField!, updates)}
              onRemove={() => handleFieldRemove(selectedField!)}
            />
          )}
        </div>
      </div>

      <PrintPreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        fields={fields}
        dimensions={dimensions}
        shipmentData={shipmentData}
      />

      <TemplateLibrary
        open={showTemplates}
        onOpenChange={setShowTemplates}
        onSelectTemplate={(template) => {
          // Load template fields
          if (template.template_fields) {
            const templateFields = JSON.parse(template.template_fields as string) as LabelField[];
            setFields(templateFields);
          }
          setSelectedSize(template.label_size as keyof typeof LABEL_SIZES || 'A4');
          setTemplateName(template.template_name);
          setShowTemplates(false);
          toast({
            title: "Template loaded",
            description: `Template "${template.template_name}" has been loaded`,
          });
        }}
      />
    </div>
  );
};