import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Save, 
  Download, 
  Printer, 
  Eye, 
  Plus, 
  Trash2, 
  Copy, 
  Move, 
  Palette,
  Type,
  QrCode,
  BarChart3
} from 'lucide-react';
import { LabelCanvas } from './LabelCanvas';
import { FieldPropertiesPanel } from './FieldPropertiesPanel';
import { TemplateLibrary } from './TemplateLibrary';
import { PrintPreviewDialog } from './PrintPreviewDialog';
import { 
  TemplateField, 
  LabelSize, 
  LABEL_SIZES, 
  FONT_OPTIONS, 
  COLOR_SCHEMES,
  DEFAULT_TEMPLATE_FIELDS,
  validateTemplate
} from '@/utils/labelGeneration';
import { useLabelTemplates } from '@/hooks/useLabelTemplates';

interface LabelDesignerProps {
  shipmentData?: any;
  agencyId?: string;
  onSave?: (template: any) => void;
  initialTemplate?: any;
}

export const LabelDesigner: React.FC<LabelDesignerProps> = ({
  shipmentData,
  agencyId,
  onSave,
  initialTemplate
}) => {
  const { toast } = useToast();
  const { createTemplate, updateTemplate } = useLabelTemplates();
  
  // Template state
  const [templateName, setTemplateName] = useState(initialTemplate?.template_name || 'New Template');
  const [labelSize, setLabelSize] = useState<LabelSize>(initialTemplate?.label_size || 'A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    initialTemplate?.orientation || 'portrait'
  );
  const [fields, setFields] = useState<TemplateField[]>(
    initialTemplate?.fields_config || DEFAULT_TEMPLATE_FIELDS
  );
  
  // UI state
  const [selectedField, setSelectedField] = useState<TemplateField | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<'design' | 'preview'>('design');

  // Canvas dimensions based on label size and orientation
  const getCanvasDimensions = () => {
    const size = LABEL_SIZES[labelSize];
    const isLandscape = orientation === 'landscape';
    
    return {
      width: isLandscape ? size.height : size.width,
      height: isLandscape ? size.width : size.height,
    };
  };

  const handleAddField = (type: TemplateField['type']) => {
    const newField: TemplateField = {
      id: `field_${Date.now()}`,
      type,
      label: `New ${type}`,
      enabled: true,
      required: false,
      position: { x: 50, y: 50 },
      size: { width: 100, height: 30 },
      style: {
        fontSize: 12,
        fontFamily: 'Roboto',
        color: '#1f2937',
      },
    };

    if (type === 'barcode') {
      newField.data = { format: 'CODE128', displayValue: true };
      newField.size = { width: 200, height: 50 };
    } else if (type === 'qr_code') {
      newField.data = { errorCorrectionLevel: 'M' };
      newField.size = { width: 100, height: 100 };
    }

    setFields(prev => [...prev, newField]);
    setSelectedField(newField);
  };

  const handleUpdateField = (updatedField: TemplateField) => {
    setFields(prev => 
      prev.map(field => 
        field.id === updatedField.id ? updatedField : field
      )
    );
    setSelectedField(updatedField);
  };

  const handleDeleteField = (fieldId: string) => {
    setFields(prev => prev.filter(field => field.id !== fieldId));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
  };

  const handleDuplicateField = (field: TemplateField) => {
    const duplicatedField: TemplateField = {
      ...field,
      id: `field_${Date.now()}`,
      label: `${field.label} (Copy)`,
      position: {
        x: field.position.x + 20,
        y: field.position.y + 20,
      },
    };

    setFields(prev => [...prev, duplicatedField]);
    setSelectedField(duplicatedField);
  };

  const handleSaveTemplate = async () => {
    // Validate template
    const errors = validateTemplate(fields);
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const templateData = {
        template_name: templateName,
        template_type: 'shipping_label' as const,
        agency_id: agencyId,
        label_size: labelSize,
        orientation,
        template_config: {
          canvasDimensions: getCanvasDimensions(),
        },
        fields_config: fields,
        branding_config: {
          primary_color: COLOR_SCHEMES.camerpulse.primary,
          secondary_color: COLOR_SCHEMES.camerpulse.secondary,
          font_family: 'Roboto',
        },
      };

      let result;
      if (initialTemplate?.id) {
        result = await updateTemplate(initialTemplate.id, templateData);
      } else {
        result = await createTemplate(templateData);
      }

      onSave?.(result);
      toast({
        title: "Success",
        description: "Template saved successfully",
      });
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    setMode('preview');
    setShowPreview(true);
  };

  const handleExportPDF = () => {
    // Implementation for PDF export will be added
    toast({
      title: "Export PDF",
      description: "PDF export functionality coming soon",
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="text-lg font-semibold border-none p-0 h-auto focus:ring-0"
                placeholder="Template Name"
              />
              <p className="text-sm text-muted-foreground">
                {labelSize} • {orientation} • {fields.filter(f => f.enabled).length} fields
              </p>
            </div>
            <Badge variant="secondary">{mode}</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplateLibrary(true)}
            >
              Template Library
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button
              onClick={handleSaveTemplate}
              disabled={saving}
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Toolbar */}
        <div className="w-64 border-r bg-muted/20 p-4 space-y-4">
          <div>
            <Label className="text-sm font-medium">Label Settings</Label>
            <div className="space-y-2 mt-2">
              <Select value={labelSize} onValueChange={(value: LabelSize) => setLabelSize(value)}>
                <SelectTrigger>
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
              
              <Select value={orientation} onValueChange={(value: 'portrait' | 'landscape') => setOrientation(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Add Elements</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddField('text')}
                className="h-8"
              >
                <Type className="h-3 w-3 mr-1" />
                Text
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddField('barcode')}
                className="h-8"
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                Barcode
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddField('qr_code')}
                className="h-8"
              >
                <QrCode className="h-3 w-3 mr-1" />
                QR Code
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddField('image')}
                className="h-8"
              >
                <Plus className="h-3 w-3 mr-1" />
                Image
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Field List</Label>
            <div className="space-y-1 mt-2 max-h-64 overflow-y-auto">
              {fields.map((field) => (
                <div
                  key={field.id}
                  className={`p-2 rounded text-xs cursor-pointer border ${
                    selectedField?.id === field.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background hover:bg-muted'
                  }`}
                  onClick={() => setSelectedField(field)}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{field.label}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-4 w-4 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateField(field);
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-4 w-4 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteField(field.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-muted-foreground">
                    {field.type} • {field.enabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 p-4">
          <Card className="h-full">
            <CardContent className="p-4 h-full">
              <LabelCanvas
                fields={fields}
                dimensions={getCanvasDimensions()}
                selectedField={selectedField}
                onFieldSelect={setSelectedField}
                onFieldUpdate={handleUpdateField}
                shipmentData={shipmentData}
                mode={mode}
              />
            </CardContent>
          </Card>
        </div>

        {/* Properties Panel */}
        {selectedField && (
          <div className="w-80 border-l bg-background">
            <FieldPropertiesPanel
              field={selectedField}
              onUpdate={handleUpdateField}
              onDelete={() => handleDeleteField(selectedField.id)}
            />
          </div>
        )}
      </div>

      {/* Dialogs */}
      {showPreview && (
        <PrintPreviewDialog
          open={showPreview}
          onOpenChange={setShowPreview}
          fields={fields}
          dimensions={getCanvasDimensions()}
          shipmentData={shipmentData}
        />
      )}

      {showTemplateLibrary && (
        <TemplateLibrary
          open={showTemplateLibrary}
          onOpenChange={setShowTemplateLibrary}
          onSelectTemplate={(template) => {
            setFields(template.fields_config);
            setLabelSize(template.label_size);
            setOrientation(template.orientation);
            setTemplateName(`${template.template_name} (Copy)`);
            setShowTemplateLibrary(false);
          }}
          agencyId={agencyId}
        />
      )}
    </div>
  );
};