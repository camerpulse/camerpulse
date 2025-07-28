import React, { useState, useRef, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
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
  RefreshCw,
  Eye,
  Settings,
  Save,
  MapPin,
  Package,
  Hash
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLabelTemplates } from '@/hooks/useLabelTemplates';
import { useLabelPrinting } from '@/hooks/useLabelPrinting';

interface BulkData {
  id: string;
  selected?: boolean;
  validationErrors?: string[];
  [key: string]: any;
}

interface GenerationJob {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalItems: number;
  processedItems: number;
  successfulItems: number;
  failedItems: number;
  createdAt: Date;
  completedAt?: Date;
  errorMessage?: string;
  templateId?: string;
  printedLabels: string[];
}

interface ValidationRule {
  field: string;
  required?: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  message: string;
}

export const BulkLabelGenerator: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { templates: dbTemplates, loading: templatesLoading } = useLabelTemplates();
  const { printLabelFromElement, printBatchLabels } = useLabelPrinting();
  
  const [activeTab, setActiveTab] = useState<'upload' | 'manual' | 'jobs' | 'validation'>('upload');
  const [bulkData, setBulkData] = useState<BulkData[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [generationJobs, setGenerationJobs] = useState<GenerationJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([]);
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [autoTrackingGeneration, setAutoTrackingGeneration] = useState(true);
  const [batchSize, setBatchSize] = useState(10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual data entry
  const [manualDataRows, setManualDataRows] = useState<BulkData[]>([
    { id: '1', selected: true, name: '', address: '', tracking: '' }
  ]);

  // Enhanced templates with both local and database templates
  const templates = [
    { id: 'shipping', name: 'Shipping Label', fields: ['name', 'address', 'tracking', 'weight'], source: 'local' },
    { id: 'product', name: 'Product Label', fields: ['product_name', 'sku', 'price', 'barcode'], source: 'local' },
    { id: 'address', name: 'Address Label', fields: ['name', 'address', 'postal_code'], source: 'local' },
    ...(dbTemplates?.map(t => ({
      id: t.id,
      name: t.template_name,
      fields: Object.keys(t.fields_config || {}),
      source: 'database' as const,
      template_config: t.template_config,
      fields_config: t.fields_config
    })) || [])
  ];

  useEffect(() => {
    // Set default validation rules based on selected template
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        const rules: ValidationRule[] = template.fields.map(field => ({
          field,
          required: ['name', 'address', 'tracking'].includes(field),
          message: `${field} is required`
        }));
        
        // Add specific validation rules
        if (template.fields.includes('tracking')) {
          rules.push({
            field: 'tracking',
            pattern: /^[A-Z0-9]{10,20}$/,
            message: 'Tracking number must be 10-20 alphanumeric characters'
          });
        }
        
        setValidationRules(rules);
      }
    }
  }, [selectedTemplate, templates]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/json') {
      handleJSONUpload(file);
    } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      handleCSVUpload(file);
    } else {
      toast({
        title: "Upload Error",
        description: "Please upload a CSV or JSON file",
        variant: "destructive",
      });
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
          toast({
            title: "Success",
            description: `Loaded ${processedData.length} records from JSON`,
          });
        } else {
          toast({
            title: "Upload Error",
            description: "JSON file must contain an array of objects",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Upload Error", 
          description: "Invalid JSON file format",
          variant: "destructive",
        });
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
          toast({
            title: "Upload Error",
            description: "CSV file must have at least a header and one data row",
            variant: "destructive",
          });
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
        toast({
          title: "Success",
          description: `Loaded ${data.length} records from CSV`,
        });
      } catch (error) {
        toast({
          title: "Upload Error",
          description: "Error parsing CSV file",
          variant: "destructive",
        });
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

  const updateManualRow = (id: string, field: string, value: string | boolean) => {
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
      toast({
        title: "Entry Error",
        description: "Please enter some data first",
        variant: "destructive",
      });
      return;
    }

    setBulkData(validRows);
    toast({
      title: "Success",
      description: `Prepared ${validRows.length} records for generation`,
    });
  };

  const startBulkGeneration = async () => {
    if (bulkData.length === 0) {
      toast({
        title: "Generation Error",
        description: "No data to process",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTemplate) {
      toast({
        title: "Generation Error",
        description: "Please select a template",
        variant: "destructive",
      });
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
      successfulItems: 0,
      failedItems: 0,
      createdAt: new Date(),
      templateId: selectedTemplate,
      printedLabels: []
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

      toast({
        title: "Success",
        description: `Successfully generated ${bulkData.length} labels`,
      });
    } catch (error) {
      // Mark job as failed
      setGenerationJobs(prev =>
        prev.map(j =>
          j.id === job.id
            ? { ...j, status: 'failed', errorMessage: 'Generation failed' }
            : j
        )
      );
      toast({
        title: "Generation Error",
        description: "Bulk generation failed",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadSampleCSV = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) {
      toast({
        title: "Download Error",
        description: "Please select a template first",
        variant: "destructive",
      });
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
    
    toast({
      title: "Success",
      description: "Sample CSV template downloaded",
    });
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
    
    toast({
      title: "Success",
      description: "Generation results exported",
    });
  };

  const validateBulkData = () => {
    const validatedData = bulkData.map(row => {
      const errors: string[] = [];
      
      validationRules.forEach(rule => {
        const value = row[rule.field];
        
        if (rule.required && (!value || value.toString().trim() === '')) {
          errors.push(`${rule.field} is required`);
        }
        
        if (value && rule.pattern && !rule.pattern.test(value.toString())) {
          errors.push(rule.message);
        }
        
        if (value && rule.minLength && value.toString().length < rule.minLength) {
          errors.push(`${rule.field} must be at least ${rule.minLength} characters`);
        }
        
        if (value && rule.maxLength && value.toString().length > rule.maxLength) {
          errors.push(`${rule.field} must be no more than ${rule.maxLength} characters`);
        }
      });
      
      return { ...row, validationErrors: errors };
    });
    
    setBulkData(validatedData);
    
    const errorCount = validatedData.filter(row => row.validationErrors?.length > 0).length;
    toast({
      title: "Validation Complete",
      description: `${validatedData.length - errorCount} valid records, ${errorCount} with errors`,
      variant: errorCount > 0 ? "destructive" : "default"
    });
  };

  const generateTrackingNumbers = () => {
    const updatedData = bulkData.map(row => {
      if (!row.tracking || row.tracking.toString().trim() === '') {
        return {
          ...row,
          tracking: `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        };
      }
      return row;
    });
    
    setBulkData(updatedData);
    toast({
      title: "Success",
      description: "Tracking numbers generated for empty fields",
    });
  };

  const toggleRowSelection = (id: string, selected: boolean) => {
    setBulkData(prev =>
      prev.map(row => (row.id === id ? { ...row, selected } : row))
    );
  };

  const toggleAllSelection = (selected: boolean) => {
    setBulkData(prev => prev.map(row => ({ ...row, selected })));
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
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="upload">File Upload</TabsTrigger>
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                  <TabsTrigger value="validation">Validation</TabsTrigger>
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
                        <div key={row.id} className="grid grid-cols-5 gap-2 items-center">
                          <Checkbox 
                            checked={row.selected}
                            onCheckedChange={(checked) => updateManualRow(row.id, 'selected', checked)}
                          />
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

                <TabsContent value="validation" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Data Validation</Label>
                      <Button 
                        onClick={() => validateBulkData()} 
                        size="sm" 
                        variant="outline"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Validate All
                      </Button>
                    </div>

                    {bulkData.length > 0 && (
                      <div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <Card className="p-3">
                            <div className="text-center">
                              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
                              <p className="text-sm font-medium">Valid</p>
                              <p className="text-lg font-bold text-green-600">
                                {bulkData.filter(row => !row.validationErrors?.length).length}
                              </p>
                            </div>
                          </Card>
                          <Card className="p-3">
                            <div className="text-center">
                              <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-1" />
                              <p className="text-sm font-medium">Errors</p>
                              <p className="text-lg font-bold text-red-600">
                                {bulkData.filter(row => row.validationErrors?.length > 0).length}
                              </p>
                            </div>
                          </Card>
                          <Card className="p-3">
                            <div className="text-center">
                              <Package className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                              <p className="text-sm font-medium">Total</p>
                              <p className="text-lg font-bold text-blue-600">{bulkData.length}</p>
                            </div>
                          </Card>
                        </div>

                        <ScrollArea className="h-48 border rounded-md">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Row</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Issues</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {bulkData.map((row, index) => (
                                <TableRow key={row.id}>
                                  <TableCell>#{index + 1}</TableCell>
                                  <TableCell>
                                    {row.validationErrors?.length > 0 ? (
                                      <Badge variant="destructive">Error</Badge>
                                    ) : (
                                      <Badge variant="default">Valid</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="max-w-48">
                                    {row.validationErrors?.join(', ') || 'None'}
                                  </TableCell>
                                  <TableCell>
                                    <Button size="sm" variant="ghost">
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </div>
                    )}

                    <div>
                      <Label>Validation Rules</Label>
                      <div className="space-y-2 mt-2">
                        {validationRules.map((rule, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <p className="font-medium">{rule.field}</p>
                              <p className="text-xs text-muted-foreground">{rule.message}</p>
                            </div>
                            <Badge variant={rule.required ? "default" : "outline"}>
                              {rule.required ? "Required" : "Optional"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
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
                        <div className="flex items-center gap-2">
                          {template.source === 'database' ? (
                            <Save className="h-3 w-3 text-blue-500" />
                          ) : (
                            <FileText className="h-3 w-3 text-gray-500" />
                          )}
                          {template.name}
                        </div>
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

              <div className="space-y-3 border-t pt-4">
                <Label className="text-sm font-medium">Processing Options</Label>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Auto-generate tracking numbers</Label>
                    <Checkbox 
                      checked={autoTrackingGeneration}
                      onCheckedChange={(checked) => setAutoTrackingGeneration(checked === true)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Preview before printing</Label>
                    <Checkbox 
                      checked={previewEnabled}
                      onCheckedChange={(checked) => setPreviewEnabled(checked === true)}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm">Batch size</Label>
                    <Select value={batchSize.toString()} onValueChange={(value) => setBatchSize(parseInt(value))}>
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 labels</SelectItem>
                        <SelectItem value="10">10 labels</SelectItem>
                        <SelectItem value="20">20 labels</SelectItem>
                        <SelectItem value="50">50 labels</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {isProcessing && (
                <div>
                  <Label>Generation Progress</Label>
                  <Progress value={progress} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(progress)}% complete
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {autoTrackingGeneration && bulkData.length > 0 && (
                  <Button
                    onClick={generateTrackingNumbers}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    <Hash className="h-4 w-4 mr-2" />
                    Generate Tracking Numbers
                  </Button>
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
              </div>
            </CardContent>
          </Card>

          {bulkData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Selected items</span>
                  <Badge variant="outline">
                    {bulkData.filter(row => row.selected).length || 0} / {bulkData.length}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => toggleAllSelection(true)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Select All
                  </Button>
                  <Button
                    onClick={() => toggleAllSelection(false)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Clear All
                  </Button>
                </div>

                <Button
                  onClick={validateBulkData}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Validate Data
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkLabelGenerator;