import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { LabelField } from '@/types/labelTypes';
import { Settings, Trash2, Type, Palette } from 'lucide-react';

interface FieldEditorProps {
  field: LabelField;
  onUpdate: (updates: Partial<LabelField>) => void;
  onRemove: () => void;
}

export const FieldEditor: React.FC<FieldEditorProps> = ({
  field,
  onUpdate,
  onRemove
}) => {
  const handleStyleUpdate = (styleKey: string, value: any) => {
    onUpdate({
      style: {
        ...field.style,
        [styleKey]: value
      }
    });
  };

  const handlePositionUpdate = (axis: 'x' | 'y', value: number) => {
    onUpdate({
      position: {
        ...field.position,
        [axis]: value
      }
    });
  };

  const handleSizeUpdate = (dimension: 'width' | 'height', value: number) => {
    onUpdate({
      size: {
        ...field.size,
        [dimension]: value
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings size={16} />
            Field Settings
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRemove}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 size={14} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Properties */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="field-label">Label</Label>
            <Input
              id="field-label"
              value={field.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="field-type">Type</Label>
            <Select 
              value={field.field_type} 
              onValueChange={(value: LabelField['field_type']) => onUpdate({ field_type: value })}
            >
              <SelectTrigger id="field-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="barcode">Barcode</SelectItem>
                <SelectItem value="qr_code">QR Code</SelectItem>
                <SelectItem value="image">Image</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {field.field_type === 'text' && (
            <div>
              <Label htmlFor="default-value">Default Value</Label>
              <Textarea
                id="default-value"
                value={field.default_value || ''}
                onChange={(e) => onUpdate({ default_value: e.target.value })}
                placeholder="Enter default text or use {{placeholders}}"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use placeholders like {`{{tracking_number}}, {{sender_name}}, {{receiver_address}}`}
              </p>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="required"
              checked={field.is_required}
              onCheckedChange={(checked) => onUpdate({ is_required: checked })}
            />
            <Label htmlFor="required">Required field</Label>
          </div>
        </div>

        {/* Position and Size */}
        <div className="space-y-3 border-t pt-4">
          <h4 className="font-medium text-sm">Position & Size</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="pos-x">X Position</Label>
              <Input
                id="pos-x"
                type="number"
                value={field.position.x}
                onChange={(e) => handlePositionUpdate('x', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="pos-y">Y Position</Label>
              <Input
                id="pos-y"
                type="number"
                value={field.position.y}
                onChange={(e) => handlePositionUpdate('y', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="number"
                value={field.size.width}
                onChange={(e) => handleSizeUpdate('width', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="number"
                value={field.size.height}
                onChange={(e) => handleSizeUpdate('height', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        {/* Style Settings for Text Fields */}
        {field.field_type === 'text' && (
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Type size={14} />
              Text Style
            </h4>

            <div>
              <Label htmlFor="font-size">Font Size: {field.style?.fontSize || 14}px</Label>
              <Slider
                id="font-size"
                min={8}
                max={48}
                step={1}
                value={[field.style?.fontSize || 14]}
                onValueChange={([value]) => handleStyleUpdate('fontSize', value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="font-weight">Font Weight</Label>
              <Select 
                value={field.style?.fontWeight || 'normal'} 
                onValueChange={(value) => handleStyleUpdate('fontWeight', value)}
              >
                <SelectTrigger id="font-weight">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                  <SelectItem value="lighter">Light</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="text-color" className="flex items-center gap-2">
                <Palette size={14} />
                Text Color
              </Label>
              <Input
                id="text-color"
                type="color"
                value={field.style?.color || '#000000'}
                onChange={(e) => handleStyleUpdate('color', e.target.value)}
                className="h-10"
              />
            </div>

            <div>
              <Label htmlFor="text-align">Text Alignment</Label>
              <Select 
                value={field.style?.textAlign || 'left'} 
                onValueChange={(value) => handleStyleUpdate('textAlign', value)}
              >
                <SelectTrigger id="text-align">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Barcode/QR Code Settings */}
        {(field.field_type === 'barcode' || field.field_type === 'qr_code') && (
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-medium text-sm">Code Settings</h4>
            
            <div>
              <Label htmlFor="data-source">Data Source</Label>
              <Select 
                value={field.validation_rules?.dataSource || 'tracking_number'} 
                onValueChange={(value) => onUpdate({ 
                  validation_rules: { ...field.validation_rules, dataSource: value }
                })}
              >
                <SelectTrigger id="data-source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tracking_number">Tracking Number</SelectItem>
                  <SelectItem value="order_id">Order ID</SelectItem>
                  <SelectItem value="custom">Custom Value</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {field.validation_rules?.dataSource === 'custom' && (
              <div>
                <Label htmlFor="custom-data">Custom Data</Label>
                <Input
                  id="custom-data"
                  value={field.default_value || ''}
                  onChange={(e) => onUpdate({ default_value: e.target.value })}
                  placeholder="Enter custom data for the code"
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};