import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface BulkData {
  id: string;
  [key: string]: any;
}

interface GenerationJob {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalItems: number;
  processedItems: number;
  createdAt: Date;
  completedAt?: Date;
  errorMessage?: string;
}

export const BulkLabelGenerator: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'manual' | 'jobs'>('upload');
  const [bulkData, setBulkData] = useState<BulkData[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [generationJobs, setGenerationJobs] = useState<GenerationJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual data entry
  const [manualDataRows, setManualDataRows] = useState<BulkData[]>([
    { id: '1', name: '', address: '', tracking: '' }
  ]);

  // Sample templates
  const templates = [
    { id: 'shipping', name: 'Shipping Label', fields: ['name', 'address', 'tracking', 'weight'] },
    { id: 'product', name: 'Product Label', fields: ['product_name', 'sku', 'price', 'barcode'] },
    { id: 'address', name: 'Address Label', fields: ['name', 'address', 'postal_code'] },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/json') {
      handleJSONUpload(file);
    } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      handleCSVUpload(file);
    } else {
      toast.error('Please upload a CSV or JSON file');
    }
  };

  const handleJSONUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (Array.isArray(data)) {
          const processedData = data.map((item, index) => ({
            id: `json-${index}`,
            ...item
          }));
          setBulkData(processedData);
          toast.success(`Loaded ${processedData.length} records from JSON`);
        } else {
          toast.error('JSON file must contain an array of objects');
        }
      } catch (error) {
        toast.error('Invalid JSON file format');
      }
    };
    reader.readAsText(file);
  };

  const handleCSVUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          toast.error('CSV file must have at least a header and one data row');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const obj: BulkData = { id: `csv-${index}` };
          headers.forEach((header, i) => {
            obj[header] = values[i] || '';
          });
          return obj;
        });

        setBulkData(data);
        toast.success(`Loaded ${data.length} records from CSV`);
      } catch (error) {
        toast.error('Error parsing CSV file');
      }
    };
    reader.readAsText(file);
  };

  const addManualRow = () => {
    const newRow: BulkData = {
      id: `manual-${Date.now()}`,
      name: '',
      address: '',
      tracking: ''
    };
    setManualDataRows(prev => [...prev, newRow]);
  };

  const updateManualRow = (id: string, field: string, value: string) => {
    setManualDataRows(prev =>
      prev.map(row => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const removeManualRow = (id: string) => {
    setManualDataRows(prev => prev.filter(row => row.id !== id));
  };

  const generateFromManualData = () => {
    const validRows = manualDataRows.filter(row => 
      Object.values(row).some(value => value && value.toString().trim())
    );
    
    if (validRows.length === 0) {
      toast.error('Please enter some data first');
      return;
    }

    setBulkData(validRows);
    toast.success(`Prepared ${validRows.length} records for generation`);
  };

  const startBulkGeneration = async () => {
    if (bulkData.length === 0) {
      toast.error('No data to process');
      return;
    }

    if (!selectedTemplate) {
      toast.error('Please select a template');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    // Create a new generation job
    const job: GenerationJob = {
      id: `job-${Date.now()}`,
      name: `Bulk Generation - ${new Date().toLocaleDateString()}`,
      status: 'processing',
      totalItems: bulkData.length,
      processedItems: 0,
      createdAt: new Date(),
    };

    setGenerationJobs(prev => [job, ...prev]);

    // Simulate bulk generation process
    try {
      for (let i = 0; i < bulkData.length; i++) {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const progressPercent = ((i + 1) / bulkData.length) * 100;
        setProgress(progressPercent);
        
        // Update job progress
        setGenerationJobs(prev =>
          prev.map(j =>
            j.id === job.id
              ? { ...j, processedItems: i + 1 }
              : j
          )
        );
      }

      // Mark job as completed
      setGenerationJobs(prev =>
        prev.map(j =>
          j.id === job.id
            ? { ...j, status: 'completed', completedAt: new Date() }
            : j
        )
      );

      toast.success(`Successfully generated ${bulkData.length} labels`);
    } catch (error) {
      // Mark job as failed
      setGenerationJobs(prev =>
        prev.map(j =>
          j.id === job.id
            ? { ...j, status: 'failed', errorMessage: 'Generation failed' }
            : j
        )
      );
      toast.error('Bulk generation failed');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadSampleCSV = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) {
      toast.error('Please select a template first');
      return;
    }

    const headers = template.fields.join(',');
    const sampleRow = template.fields.map(() => 'Sample Data').join(',');
    const csvContent = `${headers}\n${sampleRow}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name.toLowerCase().replace(/\s+/g, '_')}_template.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Sample CSV template downloaded');
  };

  const exportResults = (jobId: string) => {
    const job = generationJobs.find(j => j.id === jobId);
    if (!job) return;

    const results = {
      jobId: job.id,
      jobName: job.name,
      status: job.status,
      totalItems: job.totalItems,
      processedItems: job.processedItems,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      data: bulkData
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bulk_generation_results_${job.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Generation results exported');
  };

  const getStatusIcon = (status: GenerationJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bulk Label Generator</h1>
          <p className="text-muted-foreground">Generate multiple labels from data sources</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <FileSpreadsheet className="h-3 w-3" />
          {bulkData.length} records loaded
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Data Input</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upload">File Upload</TabsTrigger>
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                  <TabsTrigger value="jobs">Generation Jobs</TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Upload Data File</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept=".csv,.json"
                          className="hidden"
                        />
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          className="flex-1"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File
                        </Button>
                        <Button
                          onClick={downloadSampleCSV}
                          variant="outline"
                          disabled={!selectedTemplate}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Sample CSV
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports CSV and JSON files. Maximum 1000 records.
                      </p>
                    </div>

                    {bulkData.length > 0 && (
                      <div>
                        <Label>Data Preview</Label>
                        <ScrollArea className="h-64 mt-2 border rounded-md">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {Object.keys(bulkData[0] || {}).map(key => (
                                  <TableHead key={key}>{key}</TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {bulkData.slice(0, 10).map((row) => (
                                <TableRow key={row.id}>
                                  {Object.values(row).map((value, index) => (
                                    <TableCell key={index} className="max-w-32 truncate">
                                      {value?.toString() || ''}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                        {bulkData.length > 10 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Showing first 10 of {bulkData.length} records
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="manual" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Manual Data Entry</Label>
                    <Button onClick={addManualRow} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Row
                    </Button>
                  </div>
                  
                  <ScrollArea className="h-64 border rounded-md">
                    <div className="p-4 space-y-3">
                      {manualDataRows.map((row) => (
                        <div key={row.id} className="grid grid-cols-4 gap-2 items-center">
                          <Input
                            placeholder="Name"
                            value={row.name || ''}
                            onChange={(e) => updateManualRow(row.id, 'name', e.target.value)}
                          />
                          <Input
                            placeholder="Address"
                            value={row.address || ''}
                            onChange={(e) => updateManualRow(row.id, 'address', e.target.value)}
                          />
                          <Input
                            placeholder="Tracking"
                            value={row.tracking || ''}
                            onChange={(e) => updateManualRow(row.id, 'tracking', e.target.value)}
                          />
                          <Button
                            onClick={() => removeManualRow(row.id)}
                            size="sm"
                            variant="ghost"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <Button onClick={generateFromManualData} variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Use Manual Data
                  </Button>
                </TabsContent>

                <TabsContent value="jobs" className="space-y-4">
                  <div>
                    <Label>Generation History</Label>
                    <ScrollArea className="h-64 mt-2">
                      {generationJobs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <FileSpreadsheet className="h-8 w-8 mx-auto mb-2" />
                          <p>No generation jobs yet</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {generationJobs.map((job) => (
                            <Card key={job.id} className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(job.status)}
                                  <div>
                                    <p className="font-medium">{job.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {job.processedItems}/{job.totalItems} items
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  {job.status === 'completed' && (
                                    <Button
                                      onClick={() => exportResults(job.id)}
                                      size="sm"
                                      variant="ghost"
                                    >
                                      <Download className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                              {job.status === 'processing' && (
                                <Progress value={(job.processedItems / job.totalItems) * 100} className="mt-2" />
                              )}
                            </Card>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplate && (
                <div>
                  <Label>Template Fields</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {templates
                      .find(t => t.id === selectedTemplate)
                      ?.fields.map((field) => (
                        <Badge key={field} variant="outline" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}

              {isProcessing && (
                <div>
                  <Label>Generation Progress</Label>
                  <Progress value={progress} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(progress)}% complete
                  </p>
                </div>
              )}

              <Button
                onClick={startBulkGeneration}
                disabled={isProcessing || bulkData.length === 0 || !selectedTemplate}
                className="w-full"
              >
                {isProcessing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Printer className="h-4 w-4 mr-2" />
                )}
                {isProcessing ? 'Generating...' : 'Generate Labels'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BulkLabelGenerator;