import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { QrCode, Barcode, Download, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { CodeGenerator, QRCodeOptions, BarcodeOptions } from '@/utils/codeGeneration';

interface CodeGeneratorComponentProps {
  onCodeGenerated?: (dataUrl: string, type: 'qr' | 'barcode') => void;
}

export const CodeGeneratorComponent: React.FC<CodeGeneratorComponentProps> = ({ onCodeGenerated }) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'barcode'>('qr');
  const [qrText, setQrText] = useState('');
  const [barcodeText, setBarcodeText] = useState('');
  const [qrCode, setQrCode] = useState<string>('');
  const [barcode, setBarcode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // QR Code options
  const [qrOptions, setQrOptions] = useState<QRCodeOptions>({
    errorCorrectionLevel: 'M',
    width: 256,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  // Barcode options
  const [barcodeOptions, setBarcodeOptions] = useState<BarcodeOptions>({
    format: 'CODE128',
    width: 2,
    height: 100,
    displayValue: true,
    fontSize: 20,
    background: '#FFFFFF',
    lineColor: '#000000',
    margin: 10,
  });

  const generateQRCode = async () => {
    if (!qrText.trim()) {
      toast.error('Please enter text for QR code');
      return;
    }

    setIsGenerating(true);
    try {
      const dataUrl = await CodeGenerator.generateQRCode(qrText, qrOptions);
      setQrCode(dataUrl);
      onCodeGenerated?.(dataUrl, 'qr');
      toast.success('QR code generated successfully');
    } catch (error) {
      toast.error('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateBarcode = () => {
    if (!barcodeText.trim()) {
      toast.error('Please enter text for barcode');
      return;
    }

    if (!CodeGenerator.validateBarcodeText(barcodeText, barcodeOptions.format || 'CODE128')) {
      toast.error(`Invalid text for ${barcodeOptions.format} format`);
      return;
    }

    setIsGenerating(true);
    try {
      const dataUrl = CodeGenerator.generateBarcode(barcodeText, barcodeOptions);
      setBarcode(dataUrl);
      onCodeGenerated?.(dataUrl, 'barcode');
      toast.success('Barcode generated successfully');
    } catch (error) {
      toast.error('Failed to generate barcode');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCode = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Code Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'qr' | 'barcode')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="qr" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              QR Code
            </TabsTrigger>
            <TabsTrigger value="barcode" className="flex items-center gap-2">
              <Barcode className="h-4 w-4" />
              Barcode
            </TabsTrigger>
          </TabsList>

          <TabsContent value="qr" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qr-text">Text or URL</Label>
              <Input
                id="qr-text"
                value={qrText}
                onChange={(e) => setQrText(e.target.value)}
                placeholder="Enter text or URL to encode"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Error Correction Level</Label>
                <Select
                  value={qrOptions.errorCorrectionLevel}
                  onValueChange={(value) => 
                    setQrOptions(prev => ({ ...prev, errorCorrectionLevel: value as any }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Low (7%)</SelectItem>
                    <SelectItem value="M">Medium (15%)</SelectItem>
                    <SelectItem value="Q">Quartile (25%)</SelectItem>
                    <SelectItem value="H">High (30%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Size: {qrOptions.width}px</Label>
                <Slider
                  value={[qrOptions.width || 256]}
                  onValueChange={([value]) => setQrOptions(prev => ({ ...prev, width: value }))}
                  min={128}
                  max={512}
                  step={16}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qr-dark-color">Dark Color</Label>
                <Input
                  id="qr-dark-color"
                  type="color"
                  value={qrOptions.color?.dark || '#000000'}
                  onChange={(e) => 
                    setQrOptions(prev => ({ 
                      ...prev, 
                      color: { ...prev.color, dark: e.target.value }
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qr-light-color">Light Color</Label>
                <Input
                  id="qr-light-color"
                  type="color"
                  value={qrOptions.color?.light || '#FFFFFF'}
                  onChange={(e) => 
                    setQrOptions(prev => ({ 
                      ...prev, 
                      color: { ...prev.color, light: e.target.value }
                    }))
                  }
                />
              </div>
            </div>

            <Button 
              onClick={generateQRCode} 
              disabled={isGenerating || !qrText.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <QrCode className="h-4 w-4 mr-2" />
              )}
              Generate QR Code
            </Button>

            {qrCode && (
              <div className="space-y-2">
                <div className="flex justify-center p-4 bg-muted rounded-lg">
                  <img src={qrCode} alt="Generated QR Code" className="max-w-full" />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => downloadCode(qrCode, 'qrcode.png')}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(qrText)}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Text
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="barcode" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="barcode-text">Barcode Text</Label>
              <Input
                id="barcode-text"
                value={barcodeText}
                onChange={(e) => setBarcodeText(e.target.value)}
                placeholder="Enter text to encode"
              />
            </div>

            <div className="space-y-2">
              <Label>Barcode Format</Label>
              <Select
                value={barcodeOptions.format}
                onValueChange={(value) => 
                  setBarcodeOptions(prev => ({ ...prev, format: value as any }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CODE128">CODE128</SelectItem>
                  <SelectItem value="CODE39">CODE39</SelectItem>
                  <SelectItem value="EAN13">EAN13</SelectItem>
                  <SelectItem value="EAN8">EAN8</SelectItem>
                  <SelectItem value="UPC">UPC</SelectItem>
                  <SelectItem value="ITF14">ITF14</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {CodeGenerator.getFormatDescription(barcodeOptions.format || 'CODE128')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Height: {barcodeOptions.height}px</Label>
                <Slider
                  value={[barcodeOptions.height || 100]}
                  onValueChange={([value]) => setBarcodeOptions(prev => ({ ...prev, height: value }))}
                  min={50}
                  max={200}
                  step={10}
                />
              </div>

              <div className="space-y-2">
                <Label>Width: {barcodeOptions.width}</Label>
                <Slider
                  value={[barcodeOptions.width || 2]}
                  onValueChange={([value]) => setBarcodeOptions(prev => ({ ...prev, width: value }))}
                  min={1}
                  max={5}
                  step={0.5}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="display-value"
                checked={barcodeOptions.displayValue}
                onCheckedChange={(checked) => 
                  setBarcodeOptions(prev => ({ ...prev, displayValue: checked }))
                }
              />
              <Label htmlFor="display-value">Display text below barcode</Label>
            </div>

            <Button 
              onClick={generateBarcode} 
              disabled={isGenerating || !barcodeText.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Barcode className="h-4 w-4 mr-2" />
              )}
              Generate Barcode
            </Button>

            {barcode && (
              <div className="space-y-2">
                <div className="flex justify-center p-4 bg-muted rounded-lg">
                  <img src={barcode} alt="Generated Barcode" className="max-w-full" />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => downloadCode(barcode, 'barcode.png')}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(barcodeText)}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Text
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CodeGeneratorComponent;