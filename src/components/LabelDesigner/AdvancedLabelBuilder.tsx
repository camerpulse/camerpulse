import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Type, 
  Square, 
  User, 
  UserCheck, 
  Package, 
  Clock, 
  QrCode, 
  Barcode, 
  Building2, 
  Hash, 
  FileText, 
  Minus,
  Save,
  Printer,
  Download,
  Eye,
  Layers,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Palette,
  Grid,
  Move,
  RotateCcw,
  Undo2,
  Redo2,
  Copy,
  ClipboardCopy,
  ZoomIn,
  ZoomOut,
  Upload,
  FolderOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLabelTemplates } from '@/hooks/useLabelTemplates';
import { CodeGenerator } from '@/utils/codeGeneration';

interface LabelElement {
  id: string;
  type: 'text' | 'barcode' | 'qr' | 'image' | 'shape' | 'dynamic-field';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  style: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right';
    color?: string;
    backgroundColor?: string;
    border?: string;
    padding?: number;
    margin?: number;
  };
  binding?: string; // For dynamic fields
  layer: number;
}

interface Template {
  id: string;
  name: string;
  elements: LabelElement[];
  dimensions: { width: number; height: number };
  createdAt: string;
  updatedAt: string;
}

const FIELD_LIBRARY = [
  { type: 'text', icon: Type, label: 'Text Input Field', binding: 'custom' },
  { type: 'text', icon: FileText, label: 'Static Text Block', binding: 'static' },
  { type: 'dynamic-field', icon: User, label: 'Sender Info Block', binding: 'sender' },
  { type: 'dynamic-field', icon: UserCheck, label: 'Receiver Info Block', binding: 'receiver' },
  { type: 'dynamic-field', icon: Package, label: 'Status Dropdown', binding: 'status' },
  { type: 'dynamic-field', icon: Package, label: 'Delivery Type', binding: 'deliveryType' },
  { type: 'dynamic-field', icon: Clock, label: 'Estimated Delivery Time', binding: 'estimatedDelivery' },
  { type: 'barcode', icon: Barcode, label: 'Barcode Generator', binding: 'trackingNumber' },
  { type: 'qr', icon: QrCode, label: 'QR Code Generator', binding: 'trackingNumber' },
  { type: 'image', icon: Building2, label: 'Company Logo', binding: 'companyLogo' },
  { type: 'dynamic-field', icon: Hash, label: 'Tracking Number', binding: 'trackingNumber' },
  { type: 'text', icon: FileText, label: 'Custom Notes Field', binding: 'notes' },
  { type: 'shape', icon: Minus, label: 'Line Separator', binding: 'separator' },
  { type: 'text', icon: FileText, label: 'Template Footer', binding: 'footer' },
];

const FONT_FAMILIES = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Roboto', 'Open Sans'];
const FONT_WEIGHTS = ['normal', 'bold', '300', '400', '500', '600', '700', '800'];

export const AdvancedLabelBuilder: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { createTemplate, fetchTemplates, templates } = useLabelTemplates();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [templateName, setTemplateName] = useState('New Template');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [elements, setElements] = useState<LabelElement[]>([]);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 400, height: 600 });
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<LabelElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [zoom, setZoom] = useState(100);
  const [clipboard, setClipboard] = useState<LabelElement | null>(null);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);

  // Handle drag and drop from field library
  const handleDragStart = useCallback((e: React.DragEvent, fieldType: any) => {
    e.dataTransfer.setData('application/json', JSON.stringify(fieldType));
  }, []);

  // Handle drop on canvas
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const fieldData = JSON.parse(e.dataTransfer.getData('application/json'));
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newElement: LabelElement = {
      id: `element-${Date.now()}`,
      type: fieldData.type,
      x: snapToGrid ? Math.round(x / 10) * 10 : x,
      y: snapToGrid ? Math.round(y / 10) * 10 : y,
      width: fieldData.type === 'text' ? 120 : fieldData.type === 'barcode' ? 200 : fieldData.type === 'qr' ? 80 : 100,
      height: fieldData.type === 'text' ? 30 : fieldData.type === 'barcode' ? 50 : fieldData.type === 'qr' ? 80 : 30,
      content: fieldData.label,
      style: {
        fontSize: 14,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        textAlign: 'left',
        color: '#000000',
        backgroundColor: 'transparent',
        padding: 4,
      },
      binding: fieldData.binding,
      layer: elements.length,
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
    
    toast({
      title: "Element Added",
      description: `${fieldData.label} added to canvas`,
    });
  }, [elements.length, snapToGrid, toast]);

  // Handle element selection
  const handleElementClick = useCallback((elementId: string) => {
    setSelectedElement(elementId);
  }, []);

  // Handle element property updates
  const updateElementProperty = useCallback((elementId: string, property: string, value: any) => {
    setElements(prev => prev.map(el => 
      el.id === elementId 
        ? { ...el, [property]: value }
        : el
    ));
  }, []);

  // Handle element style updates
  const updateElementStyle = useCallback((elementId: string, styleProperty: string, value: any) => {
    setElements(prev => prev.map(el => 
      el.id === elementId 
        ? { ...el, style: { ...el.style, [styleProperty]: value } }
        : el
    ));
  }, []);

  // Delete selected element
  const deleteSelectedElement = useCallback(() => {
    if (selectedElement) {
      setElements(prev => prev.filter(el => el.id !== selectedElement));
      setSelectedElement(null);
      toast({
        title: "Element Deleted",
        description: "Selected element has been removed",
      });
    }
  }, [selectedElement, toast]);

  // Generate barcode/QR code
  const generateCode = useCallback(async (element: LabelElement) => {
    try {
      if (element.type === 'barcode') {
        const barcodeUrl = CodeGenerator.generateBarcode(element.content || 'SAMPLE123', {
          format: 'CODE128',
          width: 2,
          height: 100,
        });
        return barcodeUrl;
      } else if (element.type === 'qr') {
        const qrUrl = await CodeGenerator.generateQRCode(
          `https://camerpulse.cm/track/${element.content || 'SAMPLE123'}`,
          { width: 80 }
        );
        return qrUrl;
      }
    } catch (error) {
      console.error('Error generating code:', error);
    }
    return null;
  }, []);

  // Save template to Supabase
  const saveTemplate = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save templates",
        variant: "destructive",
      });
      return;
    }

    try {
      const templateData = {
        template_name: templateName,
        template_type: 'shipping_label' as const,
        label_size: 'custom',
        orientation: 'portrait' as const,
        template_config: {
          elements,
          canvasDimensions,
        },
        branding_config: {},
        fields_config: {},
        created_by: user.id,
        is_default: false,
        is_active: true,
      };

      await createTemplate(templateData);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  }, [templateName, elements, canvasDimensions, user, createTemplate]);

  // Print label
  const printLabel = useCallback(() => {
    window.print();
    toast({
      title: "Print Started",
      description: "Label is being sent to printer",
    });
  }, [toast]);

  // Export as PDF
  const exportPDF = useCallback(() => {
    // Implementation would use jsPDF or similar
    toast({
      title: "Export Started",
      description: "Label is being exported as PDF",
    });
  }, [toast]);

  // Undo/Redo functionality
  const addToHistory = useCallback((newElements: LabelElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements([...history[historyIndex - 1]]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements([...history[historyIndex + 1]]);
    }
  }, [history, historyIndex]);

  // Copy/Paste functionality
  const copyElement = useCallback(() => {
    if (selectedElement) {
      const element = elements.find(el => el.id === selectedElement);
      if (element) {
        setClipboard({ ...element });
        toast({
          title: "Copied",
          description: "Element copied to clipboard",
        });
      }
    }
  }, [selectedElement, elements, toast]);

  const pasteElement = useCallback(() => {
    if (clipboard) {
      const newElement = {
        ...clipboard,
        id: `element-${Date.now()}`,
        x: clipboard.x + 20,
        y: clipboard.y + 20,
      };
      const newElements = [...elements, newElement];
      setElements(newElements);
      addToHistory(newElements);
      setSelectedElement(newElement.id);
      toast({
        title: "Pasted",
        description: "Element pasted from clipboard",
      });
    }
  }, [clipboard, elements, addToHistory, toast]);

  // Zoom functionality
  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(200, prev + 25));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(50, prev - 25));
  }, []);

  // Load template from library
  const loadTemplate = useCallback((template: any) => {
    if (template.template_config?.elements) {
      setElements(template.template_config.elements);
      if (template.template_config.canvasDimensions) {
        setCanvasDimensions(template.template_config.canvasDimensions);
      }
      setTemplateName(template.template_name);
      addToHistory(template.template_config.elements);
      setShowTemplateLibrary(false);
      toast({
        title: "Template Loaded",
        description: `Template "${template.template_name}" loaded successfully`,
      });
    }
  }, [addToHistory, toast]);

  const selectedElementData = selectedElement ? elements.find(el => el.id === selectedElement) : null;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <div className="h-16 border-b flex items-center justify-between px-6 bg-card">
        <div className="flex items-center gap-4">
          <Building2 className="h-8 w-8 text-primary" />
          <div className="flex items-center gap-2">
            <Label htmlFor="templateName">Template:</Label>
            <Input
              id="templateName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-48"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={saveTemplate} variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
          <Button onClick={() => {}} variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Panel - Field Library */}
        <div className="w-64 border-r bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Field Library</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="p-4 space-y-2">
                {FIELD_LIBRARY.map((field, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, field)}
                    className="flex items-center gap-2 p-2 rounded border cursor-grab hover:bg-muted active:cursor-grabbing"
                  >
                    <field.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs">{field.label}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </div>

        {/* Center Panel - Canvas */}
        <div className="flex-1 flex flex-col">
          <div className="h-12 border-b flex items-center justify-between px-4 bg-muted/30">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGrid(!showGrid)}
                className={showGrid ? 'bg-muted' : ''}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSnapToGrid(!snapToGrid)}
                className={snapToGrid ? 'bg-muted' : ''}
              >
                <Move className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <span className="text-xs text-muted-foreground">
                Canvas: {canvasDimensions.width}×{canvasDimensions.height}px
              </span>
            </div>
            <div className="flex items-center gap-2">
              {selectedElement && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={deleteSelectedElement}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-8 bg-muted/20">
            <div className="flex justify-center">
              <div
                ref={canvasRef}
                className="relative bg-white shadow-lg"
                style={{
                  width: canvasDimensions.width,
                  height: canvasDimensions.height,
                  backgroundImage: showGrid ? 'radial-gradient(circle, #ccc 1px, transparent 1px)' : 'none',
                  backgroundSize: showGrid ? '10px 10px' : 'auto',
                }}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {elements.map((element) => (
                  <div
                    key={element.id}
                    className={`absolute border cursor-move ${
                      selectedElement === element.id ? 'border-primary border-2' : 'border-dashed border-gray-300'
                    }`}
                    style={{
                      left: element.x,
                      top: element.y,
                      width: element.width,
                      height: element.height,
                      fontSize: element.style.fontSize,
                      fontFamily: element.style.fontFamily,
                      fontWeight: element.style.fontWeight,
                      textAlign: element.style.textAlign,
                      color: element.style.color,
                      backgroundColor: element.style.backgroundColor,
                      padding: element.style.padding,
                    }}
                    onClick={() => handleElementClick(element.id)}
                  >
                    {element.type === 'text' || element.type === 'dynamic-field' ? (
                      <div className="w-full h-full flex items-center">
                        {element.binding === 'trackingNumber' ? 'TRK123456789' :
                         element.binding === 'sender' ? 'Sender: John Doe\n123 Main St' :
                         element.binding === 'receiver' ? 'Receiver: Jane Smith\n456 Oak Ave' :
                         element.binding === 'status' ? 'Status: In Transit' :
                         element.binding === 'deliveryType' ? 'Express Delivery' :
                         element.binding === 'estimatedDelivery' ? 'Est. Delivery: 2024-01-15' :
                         element.content}
                      </div>
                    ) : element.type === 'barcode' ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Barcode className="h-6 w-6 text-gray-500" />
                        <span className="text-xs ml-1">Barcode</span>
                      </div>
                    ) : element.type === 'qr' ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <QrCode className="h-6 w-6 text-gray-500" />
                        <span className="text-xs ml-1">QR</span>
                      </div>
                    ) : element.type === 'shape' ? (
                      <div className="w-full h-full bg-gray-400"></div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-xs">{element.type}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Properties Editor */}
        <div className="w-80 border-l bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Properties</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedElementData ? (
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-4">
                  <div>
                    <Label>Content</Label>
                    <Input
                      value={selectedElementData.content}
                      onChange={(e) => updateElementProperty(selectedElement!, 'content', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Width</Label>
                      <Input
                        type="number"
                        value={selectedElementData.width}
                        onChange={(e) => updateElementProperty(selectedElement!, 'width', parseInt(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Height</Label>
                      <Input
                        type="number"
                        value={selectedElementData.height}
                        onChange={(e) => updateElementProperty(selectedElement!, 'height', parseInt(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>X Position</Label>
                      <Input
                        type="number"
                        value={selectedElementData.x}
                        onChange={(e) => updateElementProperty(selectedElement!, 'x', parseInt(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Y Position</Label>
                      <Input
                        type="number"
                        value={selectedElementData.y}
                        onChange={(e) => updateElementProperty(selectedElement!, 'y', parseInt(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {(selectedElementData.type === 'text' || selectedElementData.type === 'dynamic-field') && (
                    <>
                      <div>
                        <Label>Font Family</Label>
                        <Select
                          value={selectedElementData.style.fontFamily}
                          onValueChange={(value) => updateElementStyle(selectedElement!, 'fontFamily', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FONT_FAMILIES.map(font => (
                              <SelectItem key={font} value={font}>{font}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Font Size: {selectedElementData.style.fontSize}px</Label>
                        <Slider
                          value={[selectedElementData.style.fontSize || 14]}
                          onValueChange={([value]) => updateElementStyle(selectedElement!, 'fontSize', value)}
                          min={8}
                          max={48}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label>Font Weight</Label>
                        <Select
                          value={selectedElementData.style.fontWeight}
                          onValueChange={(value) => updateElementStyle(selectedElement!, 'fontWeight', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FONT_WEIGHTS.map(weight => (
                              <SelectItem key={weight} value={weight}>{weight}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Text Alignment</Label>
                        <div className="flex gap-1 mt-1">
                          <Button
                            variant={selectedElementData.style.textAlign === 'left' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateElementStyle(selectedElement!, 'textAlign', 'left')}
                          >
                            <AlignLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={selectedElementData.style.textAlign === 'center' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateElementStyle(selectedElement!, 'textAlign', 'center')}
                          >
                            <AlignCenter className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={selectedElementData.style.textAlign === 'right' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateElementStyle(selectedElement!, 'textAlign', 'right')}
                          >
                            <AlignRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <Label>Text Color</Label>
                    <Input
                      type="color"
                      value={selectedElementData.style.color}
                      onChange={(e) => updateElementStyle(selectedElement!, 'color', e.target.value)}
                      className="mt-1 h-10"
                    />
                  </div>

                  <div>
                    <Label>Background Color</Label>
                    <Input
                      type="color"
                      value={selectedElementData.style.backgroundColor === 'transparent' ? '#ffffff' : selectedElementData.style.backgroundColor}
                      onChange={(e) => updateElementStyle(selectedElement!, 'backgroundColor', e.target.value)}
                      className="mt-1 h-10"
                    />
                  </div>

                  <div>
                    <Label>Padding: {selectedElementData.style.padding}px</Label>
                    <Slider
                      value={[selectedElementData.style.padding || 4]}
                      onValueChange={([value]) => updateElementStyle(selectedElement!, 'padding', value)}
                      min={0}
                      max={20}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  {selectedElementData.binding && (
                    <div>
                      <Label>Field Binding</Label>
                      <Input
                        value={selectedElementData.binding}
                        onChange={(e) => updateElementProperty(selectedElement!, 'binding', e.target.value)}
                        className="mt-1"
                        placeholder="e.g., trackingNumber, sender.name"
                      />
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Layers className="h-8 w-8 mx-auto mb-2" />
                <p>Select an element to edit properties</p>
              </div>
            )}
          </CardContent>
        </div>
      </div>

      {/* Bottom Panel - Actions */}
      <div className="h-16 border-t flex items-center justify-between px-6 bg-card">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{elements.length} elements</span>
          {selectedElement && <span>• {selectedElementData?.type} selected</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={printLabel} variant="default" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={exportPDF} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={saveTemplate} variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>
    </div>
  );
};