import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Textbox, Rect, Image as FabricImage } from 'fabric';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer, Download, RotateCcw, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

interface ShippingLabelData {
  tracking_number: string;
  sender_name: string;
  sender_address: {
    street: string;
    city: string;
    region: string;
    country: string;
    postal_code: string;
  };
  recipient_name: string;
  recipient_address: {
    street: string;
    city: string;
    region: string;
    country: string;
    postal_code: string;
  };
  package_details: {
    weight: string;
    dimensions: string;
    contents: string;
    value: string;
  };
}

const defaultLabelData: ShippingLabelData = {
  tracking_number: 'CEMAC' + Math.floor(Math.random() * 10000).toString().padStart(3, '0'),
  sender_name: 'Cemac Track Logistics',
  sender_address: {
    street: 'Business District',
    city: 'Douala',
    region: 'Littoral',
    country: 'Cameroon',
    postal_code: '00237'
  },
  recipient_name: '',
  recipient_address: {
    street: '',
    city: '',
    region: '',
    country: 'Cameroon',
    postal_code: '00237'
  },
  package_details: {
    weight: '',
    dimensions: '',
    contents: '',
    value: ''
  }
};

export const ShippingLabelGenerator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [labelData, setLabelData] = useState<ShippingLabelData>(defaultLabelData);
  const [labelSize, setLabelSize] = useState<'4x6' | '6x4'>('4x6');

  useEffect(() => {
    if (!canvasRef.current) return;

    const width = labelSize === '4x6' ? 400 : 600;
    const height = labelSize === '4x6' ? 600 : 400;

    const canvas = new FabricCanvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#ffffff',
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [labelSize]);

  useEffect(() => {
    if (fabricCanvas) {
      generateLabel();
    }
  }, [fabricCanvas, labelData]);

  const generateLabel = async () => {
    if (!fabricCanvas) return;

    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#ffffff';

    const width = fabricCanvas.width || 400;
    const height = fabricCanvas.height || 600;
    const padding = 20;

    // Border
    const border = new Rect({
      left: 5,
      top: 5,
      width: width - 10,
      height: height - 10,
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2,
      selectable: false,
    });
    fabricCanvas.add(border);

    let currentY = padding;

    // Header - Company Name
    const headerText = new Textbox(labelData.sender_name, {
      left: padding,
      top: currentY,
      width: width - (padding * 2),
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      selectable: false,
    });
    fabricCanvas.add(headerText);
    currentY += 40;

    // Tracking Number
    const trackingText = new Textbox(`Tracking: ${labelData.tracking_number}`, {
      left: padding,
      top: currentY,
      width: width - (padding * 2),
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      backgroundColor: '#f0f0f0',
      selectable: false,
    });
    fabricCanvas.add(trackingText);
    currentY += 50;

    // Generate QR Code
    try {
      const qrCodeDataURL = await QRCode.toDataURL(labelData.tracking_number, {
        width: 80,
        margin: 1,
      });
      
      FabricImage.fromURL(qrCodeDataURL).then((qrImage) => {
        qrImage.set({
          left: width - 100,
          top: currentY - 80,
          scaleX: 0.8,
          scaleY: 0.8,
          selectable: false,
        });
        fabricCanvas.add(qrImage);
        fabricCanvas.renderAll();
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }

    // From Section
    const fromLabel = new Textbox('FROM:', {
      left: padding,
      top: currentY,
      width: width - (padding * 2),
      fontSize: 12,
      fontWeight: 'bold',
      selectable: false,
    });
    fabricCanvas.add(fromLabel);
    currentY += 25;

    const senderAddress = `${labelData.sender_address.street}\n${labelData.sender_address.city}, ${labelData.sender_address.region}\n${labelData.sender_address.country} ${labelData.sender_address.postal_code}`;
    const senderText = new Textbox(senderAddress, {
      left: padding,
      top: currentY,
      width: width - (padding * 2),
      fontSize: 11,
      selectable: false,
    });
    fabricCanvas.add(senderText);
    currentY += 80;

    // To Section
    const toLabel = new Textbox('TO:', {
      left: padding,
      top: currentY,
      width: width - (padding * 2),
      fontSize: 12,
      fontWeight: 'bold',
      selectable: false,
    });
    fabricCanvas.add(toLabel);
    currentY += 25;

    const recipientName = new Textbox(labelData.recipient_name, {
      left: padding,
      top: currentY,
      width: width - (padding * 2),
      fontSize: 14,
      fontWeight: 'bold',
      selectable: false,
    });
    fabricCanvas.add(recipientName);
    currentY += 30;

    const recipientAddress = `${labelData.recipient_address.street}\n${labelData.recipient_address.city}, ${labelData.recipient_address.region}\n${labelData.recipient_address.country} ${labelData.recipient_address.postal_code}`;
    const recipientText = new Textbox(recipientAddress, {
      left: padding,
      top: currentY,
      width: width - (padding * 2),
      fontSize: 12,
      selectable: false,
    });
    fabricCanvas.add(recipientText);
    currentY += 100;

    // Package Details
    if (labelData.package_details.weight || labelData.package_details.contents) {
      const packageInfo = `Weight: ${labelData.package_details.weight} | Contents: ${labelData.package_details.contents}`;
      const packageText = new Textbox(packageInfo, {
        left: padding,
        top: currentY,
        width: width - (padding * 2),
        fontSize: 10,
        selectable: false,
      });
      fabricCanvas.add(packageText);
    }

    fabricCanvas.renderAll();
  };

  const handleInputChange = (field: string, value: string, section?: string) => {
    setLabelData(prev => {
      if (section) {
        const currentSection = prev[section as keyof ShippingLabelData];
        if (typeof currentSection === 'object' && currentSection !== null) {
          return {
            ...prev,
            [section]: {
              ...currentSection,
              [field]: value
            }
          };
        }
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const printLabel = () => {
    if (!fabricCanvas) return;
    
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    });

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Shipping Label</title>
            <style>
              body { margin: 0; padding: 20px; }
              img { max-width: 100%; height: auto; }
              @media print {
                body { margin: 0; padding: 0; }
                img { width: 4in; height: 6in; }
              }
            </style>
          </head>
          <body>
            <img src="${dataURL}" alt="Shipping Label" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }

    toast({
      title: "Label Ready",
      description: "Shipping label is ready to print",
    });
  };

  const downloadLabel = () => {
    if (!fabricCanvas) return;

    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    });

    const link = document.createElement('a');
    link.download = `shipping-label-${labelData.tracking_number}.png`;
    link.href = dataURL;
    link.click();

    toast({
      title: "Download Started",
      description: "Shipping label downloaded successfully",
    });
  };

  const resetLabel = () => {
    setLabelData(defaultLabelData);
    toast({
      title: "Label Reset",
      description: "Label data has been reset to default",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Label Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Shipping Label Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Label Size */}
          <div>
            <Label>Label Size</Label>
            <Select value={labelSize} onValueChange={(value: '4x6' | '6x4') => setLabelSize(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4x6">4" x 6" (Standard)</SelectItem>
                <SelectItem value="6x4">6" x 4" (Landscape)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tracking Number */}
          <div>
            <Label>Tracking Number</Label>
            <Input
              value={labelData.tracking_number}
              onChange={(e) => handleInputChange('tracking_number', e.target.value)}
              placeholder="Enter tracking number"
            />
          </div>

          {/* Recipient Information */}
          <div className="space-y-2">
            <Label className="text-lg font-semibold">Recipient Information</Label>
            <Input
              placeholder="Recipient Name"
              value={labelData.recipient_name}
              onChange={(e) => handleInputChange('recipient_name', e.target.value)}
            />
            <Input
              placeholder="Street Address"
              value={labelData.recipient_address.street}
              onChange={(e) => handleInputChange('street', e.target.value, 'recipient_address')}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="City"
                value={labelData.recipient_address.city}
                onChange={(e) => handleInputChange('city', e.target.value, 'recipient_address')}
              />
              <Input
                placeholder="Region"
                value={labelData.recipient_address.region}
                onChange={(e) => handleInputChange('region', e.target.value, 'recipient_address')}
              />
            </div>
          </div>

          {/* Package Details */}
          <div className="space-y-2">
            <Label className="text-lg font-semibold">Package Details</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Weight (e.g., 2.5kg)"
                value={labelData.package_details.weight}
                onChange={(e) => handleInputChange('weight', e.target.value, 'package_details')}
              />
              <Input
                placeholder="Dimensions"
                value={labelData.package_details.dimensions}
                onChange={(e) => handleInputChange('dimensions', e.target.value, 'package_details')}
              />
            </div>
            <Input
              placeholder="Contents"
              value={labelData.package_details.contents}
              onChange={(e) => handleInputChange('contents', e.target.value, 'package_details')}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={printLabel} className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={downloadLabel} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={resetLabel} variant="ghost">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Label Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Label Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-gray-50">
            <canvas ref={canvasRef} className="max-w-full border shadow-lg bg-white" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};