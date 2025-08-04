import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Palette } from 'lucide-react';
import { TemplateField, FONT_OPTIONS } from '@/utils/labelGeneration';

interface FieldPropertiesPanelProps {
  field: TemplateField;
  onUpdate: (field: TemplateField) => void;
  onDelete: () => void;
}

export const FieldPropertiesPanel: React.FC<FieldPropertiesPanelProps> = ({
  field,
  onUpdate,
  onDelete
}) => {
  const updateField = (updates: Partial<TemplateField>) => {
    onUpdate({ ...field, ...updates });
  };

  const updateStyle = (styleUpdates: Partial<TemplateField['style']>) => {
    onUpdate({
      ...field,
      style: { ...field.style, ...styleUpdates }
    });
  };

  const updateData = (dataUpdates: Partial<TemplateField['data']>) => {
    onUpdate({
      ...field,
      data: { ...field.data, ...dataUpdates }
    });
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Field Properties</h3>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Basic Properties */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Basic</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Field Label</Label>
            <Input
              value={field.label}
              onChange={(e) => updateField({ label: e.target.value })}
              className="h-8"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label className="text-xs">Enabled</Label>
            <Switch
              checked={field.enabled}
              onCheckedChange={(enabled) => updateField({ enabled })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs">Required</Label>
            <Switch
              checked={field.required}
              onCheckedChange={(required) => updateField({ required })}
            />
          </div>

          <div className="text-xs text-muted-foreground">
            Type: {field.type}
          </div>
        </CardContent>
      </Card>

      {/* Position & Size */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Position & Size</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">X Position</Label>
              <Input
                type="number"
                value={field.position.x}
                onChange={(e) => updateField({
                  position: { ...field.position, x: Number(e.target.value) }
                })}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Y Position</Label>
              <Input
                type="number"
                value={field.position.y}
                onChange={(e) => updateField({
                  position: { ...field.position, y: Number(e.target.value) }
                })}
                className="h-8"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Width</Label>
              <Input
                type="number"
                value={field.size.width}
                onChange={(e) => updateField({
                  size: { ...field.size, width: Number(e.target.value) }
                })}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Height</Label>
              <Input
                type="number"
                value={field.size.height}
                onChange={(e) => updateField({
                  size: { ...field.size, height: Number(e.target.value) }
                })}
                className="h-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Text Styling (for text fields) */}
      {(field.type === 'text') && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Text Style
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Font Family</Label>
              <Select
                value={field.style?.fontFamily || 'Roboto'}
                onValueChange={(fontFamily) => updateStyle({ fontFamily: fontFamily as any })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Font Size</Label>
                <Input
                  type="number"
                  value={field.style?.fontSize || 12}
                  onChange={(e) => updateStyle({ fontSize: Number(e.target.value) })}
                  className="h-8"
                  min="6"
                  max="72"
                />
              </div>
              <div>
                <Label className="text-xs">Font Weight</Label>
                <Select
                  value={field.style?.fontWeight || 'normal'}
                  onValueChange={(fontWeight) => updateStyle({ fontWeight: fontWeight as 'normal' | 'bold' })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs">Text Align</Label>
              <Select
                value={field.style?.textAlign || 'left'}
                onValueChange={(textAlign) => updateStyle({ textAlign: textAlign as 'left' | 'center' | 'right' })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={field.style?.color || '#000000'}
                  onChange={(e) => updateStyle({ color: e.target.value })}
                  className="h-8 w-16 p-1"
                />
                <Input
                  value={field.style?.color || '#000000'}
                  onChange={(e) => updateStyle({ color: e.target.value })}
                  className="h-8 flex-1"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={field.style?.backgroundColor || '#ffffff'}
                  onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                  className="h-8 w-16 p-1"
                />
                <Input
                  value={field.style?.backgroundColor || '#ffffff'}
                  onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                  className="h-8 flex-1"
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Barcode Settings */}
      {field.type === 'barcode' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Barcode Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Barcode Format</Label>
              <Select
                value={field.data?.format || 'CODE128'}
                onValueChange={(format) => updateData({ format })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CODE128">CODE128</SelectItem>
                  <SelectItem value="CODE39">CODE39</SelectItem>
                  <SelectItem value="EAN13">EAN13</SelectItem>
                  <SelectItem value="EAN8">EAN8</SelectItem>
                  <SelectItem value="UPC">UPC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs">Display Value</Label>
              <Switch
                checked={field.data?.displayValue !== false}
                onCheckedChange={(displayValue) => updateData({ displayValue })}
              />
            </div>

            <div>
              <Label className="text-xs">Line Width</Label>
              <Input
                type="number"
                value={field.data?.width || 2}
                onChange={(e) => updateData({ width: Number(e.target.value) })}
                className="h-8"
                min="1"
                max="5"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Code Settings */}
      {field.type === 'qr_code' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">QR Code Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Error Correction</Label>
              <Select
                value={field.data?.errorCorrectionLevel || 'M'}
                onValueChange={(errorCorrectionLevel) => updateData({ errorCorrectionLevel })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Low (~7%)</SelectItem>
                  <SelectItem value="M">Medium (~15%)</SelectItem>
                  <SelectItem value="Q">Quartile (~25%)</SelectItem>
                  <SelectItem value="H">High (~30%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs">Include Tracking URL</Label>
              <Switch
                checked={field.data?.includeTrackingURL !== false}
                onCheckedChange={(includeTrackingURL) => updateData({ includeTrackingURL })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Border Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Border</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Border Width</Label>
            <Input
              type="number"
              value={field.style?.border?.width || 0}
              onChange={(e) => updateStyle({
                border: { 
                  ...field.style?.border, 
                  width: Number(e.target.value) 
                }
              })}
              className="h-8"
              min="0"
              max="10"
            />
          </div>

          {(field.style?.border?.width || 0) > 0 && (
            <>
              <div>
                <Label className="text-xs">Border Style</Label>
                <Select
                  value={field.style?.border?.style || 'solid'}
                  onValueChange={(style) => updateStyle({
                    border: { ...field.style?.border, style: style as 'solid' | 'dashed' | 'dotted' }
                  })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="dashed">Dashed</SelectItem>
                    <SelectItem value="dotted">Dotted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Border Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={field.style?.border?.color || '#000000'}
                    onChange={(e) => updateStyle({
                      border: { ...field.style?.border, color: e.target.value }
                    })}
                    className="h-8 w-16 p-1"
                  />
                  <Input
                    value={field.style?.border?.color || '#000000'}
                    onChange={(e) => updateStyle({
                      border: { ...field.style?.border, color: e.target.value }
                    })}
                    className="h-8 flex-1"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};