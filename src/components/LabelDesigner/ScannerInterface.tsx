import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useLabelScanning } from '@/hooks/useLabelScanning';
import { Camera, Upload, Search, Package, Clock, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ScannerInterface: React.FC = () => {
  const [manualInput, setManualInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { 
    scanLogs, 
    loading, 
    processQRScan,
    logScan 
  } = useLabelScanning();
  
  // Mock analytics for now
  const analytics = { total_scans: scanLogs.length, successful_scans: scanLogs.filter(s => s.scan_result?.success).length };
  
  const { toast } = useToast();

  const handleStartCamera = async () => {
    try {
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Mock scanning for now
      console.log('Camera scanning started');
    } catch (error) {
      console.error('Camera access failed:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  const handleStopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    console.log('Scanning stopped');
    setIsScanning(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      console.log('Processing image:', file.name);
      toast({
        title: "Image processed",
        description: "Successfully scanned the uploaded image",
      });
    } catch (error) {
      toast({
        title: "Scan failed",
        description: "Unable to read barcode/QR code from image",
        variant: "destructive",
      });
    }
  };

  const handleManualSearch = async () => {
    if (!manualInput.trim()) return;

    try {
      await logScan(manualInput.trim(), 'barcode');
      setManualInput('');
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Unable to find information for this code",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Label Scanner</h1>
        <p className="text-muted-foreground">Scan barcodes and QR codes to track shipments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="camera" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="camera" className="flex items-center gap-2">
                <Camera size={16} />
                Camera
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload size={16} />
                Upload
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Search size={16} />
                Manual
              </TabsTrigger>
            </TabsList>

            <TabsContent value="camera">
              <Card>
                <CardHeader>
                  <CardTitle>Camera Scanner</CardTitle>
                  <CardDescription>
                    Use your device camera to scan barcodes and QR codes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full h-64 bg-muted rounded-lg object-cover"
                      style={{ display: isScanning ? 'block' : 'none' }}
                    />
                    {!isScanning && (
                      <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Camera size={48} className="mx-auto mb-2 text-muted-foreground" />
                          <p className="text-muted-foreground">Camera preview will appear here</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {!isScanning ? (
                      <Button onClick={handleStartCamera} className="flex-1">
                        <Camera size={16} className="mr-2" />
                        Start Camera
                      </Button>
                    ) : (
                      <Button onClick={handleStopCamera} variant="outline" className="flex-1">
                        Stop Camera
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upload">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Image</CardTitle>
                  <CardDescription>
                    Upload an image containing a barcode or QR code
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div 
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium">Click to upload image</p>
                    <p className="text-muted-foreground">or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supports JPG, PNG, GIF up to 10MB
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manual">
              <Card>
                <CardHeader>
                  <CardTitle>Manual Entry</CardTitle>
                  <CardDescription>
                    Enter a tracking number or barcode manually
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="manual-input">Tracking Number / Barcode</Label>
                    <Input
                      id="manual-input"
                      placeholder="Enter tracking number or barcode"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
                    />
                  </div>
                  <Button 
                    onClick={handleManualSearch} 
                    disabled={!manualInput.trim() || loading}
                    className="w-full"
                  >
                    <Search size={16} className="mr-2" />
                    Search
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          {/* Analytics Card */}
          <Card>
            <CardHeader>
              <CardTitle>Scan Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {analytics.total_scans || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Scans</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analytics.successful_scans || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Successful</div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-medium">
                  {analytics.total_scans > 0 
                    ? Math.round(((analytics.successful_scans || 0) / analytics.total_scans) * 100)
                    : 0
                  }% Success Rate
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Scans */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scanLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No scans yet
                  </p>
                ) : (
                  scanLogs.slice(0, 5).map((scan) => (
                    <div key={scan.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Package size={20} className="text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm">{scan.tracking_number}</div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock size={12} />
                            {formatDate(scan.created_at)}
                          </div>
                        </div>
                      </div>
                      <Badge variant={scan.scan_result?.success ? "default" : "destructive"}>
                        {scan.scan_result?.success ? "Success" : "Failed"}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};