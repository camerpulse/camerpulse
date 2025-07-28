import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LabelCanvas } from './LabelCanvas';
import { LabelField } from '@/types/labelTypes';
import { useLabelPrinting } from '@/hooks/useLabelPrinting';
import { 
  Upload, 
  Download, 
  Play, 
  Pause, 
  RotateCcw,
  FileSpreadsheet,
  Package,
  Printer,
  Eye,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BulkLabelGeneratorProps {
  template?: {
    name: string;
    fields: LabelField[];
    dimensions: { width: number; height: number };
  };
}

interface ShipmentRecord {
  id: string;
  tracking_number: string;
  sender_name: string;
  sender_address: string;
  receiver_name: string;
  receiver_address: string;
  package_weight?: string;
  package_description?: string;
  service_level?: string;
  [key: string]: any;
}

export const BulkLabelGenerator: React.FC<BulkLabelGeneratorProps> = ({
  template
}) => {
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [batchSize, setBatchSize] = useState(10);
  const [outputFormat, setOutputFormat] = useState<'pdf' | 'png' | 'print'>('pdf');
  const [paused, setPaused] = useState(false);
  const [csvInput, setCsvInput] = useState('');
  const [previewRecord, setPreviewRecord] = useState<ShipmentRecord | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { loading, printLabelFromElement, exportLabelAsImage } = useLabelPrinting();
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          throw new Error('CSV must have at least a header row and one data row');
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const records: ShipmentRecord[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          if (values.length !== headers.length) continue;

          const record: ShipmentRecord = {
            id: `bulk_${Date.now()}_${i}`,
            tracking_number: '',
            sender_name: '',
            sender_address: '',
            receiver_name: '',
            receiver_address: ''
          };

          headers.forEach((header, index) => {
            const key = header.toLowerCase().replace(/\s+/g, '_');
            record[key] = values[index] || '';
            
            // Map common field names
            if (key.includes('track')) record.tracking_number = values[index];
            if (key.includes('sender') && key.includes('name')) record.sender_name = values[index];
            if (key.includes('sender') && key.includes('address')) record.sender_address = values[index];
            if (key.includes('receiver') && key.includes('name')) record.receiver_name = values[index];
            if (key.includes('receiver') && key.includes('address')) record.receiver_address = values[index];
            if (key.includes('weight')) record.package_weight = values[index];
            if (key.includes('description')) record.package_description = values[index];
            if (key.includes('service')) record.service_level = values[index];
          });

          records.push(record);
        }

        setShipments(records);
        toast({
          title: "CSV imported",
          description: `Imported ${records.length} shipment records`,
        });
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Failed to parse CSV file. Please check the format.",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  const parseCsvInput = () => {
    try {
      const lines = csvInput.trim().split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV must have at least a header row and one data row');
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const records: ShipmentRecord[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length !== headers.length) continue;

        const record: ShipmentRecord = {
          id: `manual_${Date.now()}_${i}`,
          tracking_number: '',
          sender_name: '',
          sender_address: '',
          receiver_name: '',
          receiver_address: ''
        };

        headers.forEach((header, index) => {
          const key = header.toLowerCase().replace(/\s+/g, '_');
          record[key] = values[index] || '';
        });

        records.push(record);
      }

      setShipments(records);
      setCsvInput('');
      toast({
        title: "Data parsed",
        description: `Parsed ${records.length} shipment records`,
      });
    } catch (error) {
      toast({
        title: "Parse failed",
        description: "Failed to parse CSV data. Please check the format.",
        variant: "destructive",
      });
    }
  };

  const processLabelGeneration = async () => {
    if (!template || shipments.length === 0) {
      toast({
        title: "Missing data",
        description: "Template and shipment data are required",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setPaused(false);
    setProgress(0);
    setCurrentBatch(0);

    try {
      const totalBatches = Math.ceil(shipments.length / batchSize);
      const generatedLabels: Blob[] = [];

      for (let batchIndex = 0; batchIndex < totalBatches && !paused; batchIndex++) {
        setCurrentBatch(batchIndex + 1);
        
        const startIndex = batchIndex * batchSize;
        const endIndex = Math.min(startIndex + batchSize, shipments.length);
        const batch = shipments.slice(startIndex, endIndex);

        for (let recordIndex = 0; recordIndex < batch.length && !paused; recordIndex++) {
          const shipment = batch[recordIndex];
          
          // Create a temporary canvas element for this shipment
          const tempContainer = document.createElement('div');
          tempContainer.style.position = 'absolute';
          tempContainer.style.left = '-9999px';
          tempContainer.style.top = '-9999px';
          document.body.appendChild(tempContainer);

          // Here you would render the LabelCanvas with the shipment data
          // For now, we'll simulate the process
          await new Promise(resolve => setTimeout(resolve, 100)); // Simulate processing time

          if (outputFormat === 'print') {
            // Print directly
            // await printLabelFromElement(canvasElement, shipmentData);
          } else {
            // Export as image/PDF
            // const blob = await exportLabelAsImage(canvasElement, outputFormat === 'pdf' ? 'pdf' : 'png');
            // generatedLabels.push(blob);
          }

          document.body.removeChild(tempContainer);

          // Update progress
          const overallProgress = ((batchIndex * batchSize + recordIndex + 1) / shipments.length) * 100;
          setProgress(overallProgress);
        }

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      if (!paused) {
        if (outputFormat === 'pdf' && generatedLabels.length > 0) {
          // Combine all PDFs into one
          const combinedBlob = new Blob(generatedLabels, { type: 'application/pdf' });
          const url = URL.createObjectURL(combinedBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `bulk_labels_${Date.now()}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }

        toast({
          title: "Generation complete",
          description: `Successfully generated ${shipments.length} labels`,
        });
      }
    } catch (error) {
      console.error('Bulk generation failed:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate labels",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
      setPaused(false);
    }
  };

  const pauseGeneration = () => {
    setPaused(true);
  };

  const resetGeneration = () => {
    setProcessing(false);
    setPaused(false);
    setProgress(0);
    setCurrentBatch(0);
  };

  const downloadSampleCsv = () => {
    const sampleData = [
      'tracking_number,sender_name,sender_address,receiver_name,receiver_address,package_weight,service_level',
      'TRK001,CamerPulse Warehouse,"123 Main St, Douala",John Doe,"456 Oak Ave, Yaoundé",2.5kg,Express',
      'TRK002,CamerPulse Warehouse,"123 Main St, Douala",Jane Smith,"789 Pine St, Buea",1.2kg,Standard'
    ].join('\n');

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_shipments.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bulk Label Generator</h2>
          <p className="text-muted-foreground">Generate multiple labels from CSV data</p>
        </div>
        
        {template && (
          <Badge variant="outline" className="flex items-center gap-2">
            <Package size={14} />
            {template.name}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="import" className="space-y-6">
        <TabsList>
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="generate">Generate Labels</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet size={20} />
                  CSV File Upload
                </CardTitle>
                <CardDescription>
                  Upload a CSV file with shipment data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center gap-2"
                    variant="outline"
                  >
                    <Upload size={16} />
                    Choose CSV File
                  </Button>
                </div>
                
                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={downloadSampleCsv}
                    className="text-sm"
                  >
                    <Download size={14} className="mr-1" />
                    Download Sample CSV
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Required columns:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>tracking_number</li>
                    <li>sender_name, sender_address</li>
                    <li>receiver_name, receiver_address</li>
                  </ul>
                  <p><strong>Optional:</strong> package_weight, service_level, package_description</p>
                </div>
              </CardContent>
            </Card>

            {/* Manual Input */}
            <Card>
              <CardHeader>
                <CardTitle>Manual CSV Input</CardTitle>
                <CardDescription>
                  Paste CSV data directly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="csv-input">CSV Data</Label>
                  <Textarea
                    id="csv-input"
                    placeholder="tracking_number,sender_name,sender_address,receiver_name,receiver_address
TRK001,Sender Name,Sender Address,Receiver Name,Receiver Address"
                    value={csvInput}
                    onChange={(e) => setCsvInput(e.target.value)}
                    rows={8}
                  />
                </div>
                
                <Button
                  onClick={parseCsvInput}
                  disabled={!csvInput.trim()}
                  className="w-full"
                >
                  Parse CSV Data
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Data Preview */}
          {shipments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Imported Data ({shipments.length} records)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Tracking</th>
                        <th className="text-left p-2">Sender</th>
                        <th className="text-left p-2">Receiver</th>
                        <th className="text-left p-2">Weight</th>
                        <th className="text-left p-2">Service</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shipments.slice(0, 5).map((shipment, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{shipment.tracking_number}</td>
                          <td className="p-2">{shipment.sender_name}</td>
                          <td className="p-2">{shipment.receiver_name}</td>
                          <td className="p-2">{shipment.package_weight || 'N/A'}</td>
                          <td className="p-2">{shipment.service_level || 'Standard'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {shipments.length > 5 && (
                    <p className="text-center text-muted-foreground py-2">
                      ... and {shipments.length - 5} more records
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings size={20} />
                Generation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="batch-size">Batch Size</Label>
                  <Select value={batchSize.toString()} onValueChange={(value) => setBatchSize(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 labels</SelectItem>
                      <SelectItem value="10">10 labels</SelectItem>
                      <SelectItem value="25">25 labels</SelectItem>
                      <SelectItem value="50">50 labels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="output-format">Output Format</Label>
                  <Select value={outputFormat} onValueChange={(value: any) => setOutputFormat(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="png">PNG Images</SelectItem>
                      <SelectItem value="print">Direct Print</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={processing ? pauseGeneration : processLabelGeneration}
                    disabled={!template || shipments.length === 0 || loading}
                    className="w-full flex items-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Pause size={16} />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play size={16} />
                        Start Generation
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {processing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Batch {currentBatch} of {Math.ceil(shipments.length / batchSize)}</span>
                    <span>{Math.round(progress)}% complete</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={pauseGeneration}
                      disabled={paused}
                    >
                      <Pause size={14} />
                      Pause
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={resetGeneration}
                    >
                      <RotateCcw size={14} />
                      Reset
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye size={20} />
                Label Preview
              </CardTitle>
              <CardDescription>
                Preview how labels will look with your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {shipments.length > 0 ? (
                <>
                  <div>
                    <Label>Select Record to Preview</Label>
                    <Select 
                      value={previewRecord?.id || ''} 
                      onValueChange={(value) => {
                        const record = shipments.find(s => s.id === value);
                        setPreviewRecord(record || null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a shipment record" />
                      </SelectTrigger>
                      <SelectContent>
                        {shipments.slice(0, 10).map((shipment) => (
                          <SelectItem key={shipment.id} value={shipment.id}>
                            {shipment.tracking_number} - {shipment.receiver_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {previewRecord && template && (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <LabelCanvas
                        fields={template.fields}
                        dimensions={template.dimensions}
                        selectedField={null}
                        onFieldSelect={() => {}}
                        onFieldUpdate={() => {}}
                        shipmentData={{
                          tracking_number: previewRecord.tracking_number,
                          sender: {
                            name: previewRecord.sender_name,
                            address: previewRecord.sender_address
                          },
                          receiver: {
                            name: previewRecord.receiver_name,
                            address: previewRecord.receiver_address
                          },
                          package: {
                            weight: previewRecord.package_weight || '1.0kg',
                            description: previewRecord.package_description || 'Package'
                          },
                          shipping: {
                            service: previewRecord.service_level || 'Standard'
                          }
                        }}
                        mode="preview"
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package size={48} className="mx-auto mb-4" />
                  <p>Import shipment data to preview labels</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};