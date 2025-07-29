import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useLabelTemplates } from '@/hooks/useLabelTemplates';
import { LabelField } from '@/types/labelTypes';
import { LABEL_SIZES } from '@/utils/labelGeneration';
import { 
  Save, 
  Copy, 
  Trash2, 
  Edit, 
  Download, 
  Upload, 
  Filter,
  Search,
  FileText,
  Clock,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/utils/dateUtils';

interface TemplateManagerProps {
  onLoadTemplate?: (template: any) => void;
  currentTemplate?: {
    name: string;
    fields: LabelField[];
    dimensions: { width: number; height: number };
    size: keyof typeof LABEL_SIZES;
  };
  agencyId?: string;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  onLoadTemplate,
  currentTemplate,
  agencyId
}) => {
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate, duplicateTemplate } = useLabelTemplates();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [templateName, setTemplateName] = useState(currentTemplate?.name || '');
  const [templateDescription, setTemplateDescription] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const { toast } = useToast();

  // Filter and search templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.template_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || template.template_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleSaveTemplate = async () => {
    if (!templateName.trim() || !currentTemplate) {
      toast({
        title: "Validation Error",
        description: "Template name and fields are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const templateData = {
        template_name: templateName,
        template_type: 'shipping_label' as const,
        description: templateDescription,
        template_fields: JSON.stringify(currentTemplate.fields),
        label_size: currentTemplate.size,
        agency_id: agencyId,
        is_active: true
      };

      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, templateData);
        toast({
          title: "Template updated",
          description: `Template "${templateName}" has been updated successfully`,
        });
      } else {
        await createTemplate(templateData);
        toast({
          title: "Template saved",
          description: `Template "${templateName}" has been saved successfully`,
        });
      }

      setShowSaveDialog(false);
      setEditingTemplate(null);
      setTemplateName('');
      setTemplateDescription('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    try {
      await deleteTemplate(templateId);
      toast({
        title: "Template deleted",
        description: `Template "${templateName}" has been deleted`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateTemplate = async (template: any) => {
    try {
      const newName = `${template.template_name} (Copy)`;
      await duplicateTemplate(template.id, newName);
      toast({
        title: "Template duplicated",
        description: `Template duplicated as "${newName}"`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate template",
        variant: "destructive",
      });
    }
  };

  const handleExportTemplate = (template: any) => {
    const exportData = {
      name: template.template_name,
      description: template.description || 'No description',
      fields: JSON.parse(template.template_fields || '[]'),
      size: template.label_size,
      type: template.template_type,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.template_name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Template exported",
      description: `Template "${template.template_name}" exported successfully`,
    });
  };

  const handleImportTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);

        // Validate import data structure
        if (!importData.name || !importData.fields || !Array.isArray(importData.fields)) {
          throw new Error('Invalid template file format');
        }

        const templateData = {
          template_name: `${importData.name} (Imported)`,
          template_type: importData.type || 'shipping_label' as const,
          description: importData.description || 'Imported template',
          template_fields: JSON.stringify(importData.fields),
          label_size: importData.size || 'A4',
          agency_id: agencyId,
          is_active: true
        };

        await createTemplate(templateData);
        toast({
          title: "Template imported",
          description: `Template "${templateData.template_name}" imported successfully`,
        });
        setShowImportDialog(false);
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Failed to import template. Please check the file format.",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const openEditDialog = (template: any) => {
    setEditingTemplate(template);
    setTemplateName(template.template_name);
    setTemplateDescription(template.description || '');
    setShowSaveDialog(true);
  };

  const getTemplateStats = (template: any) => {
    try {
      const fields = JSON.parse(template.template_fields || '[]') as LabelField[];
      return {
        fieldCount: fields.length,
        requiredFields: fields.filter(f => f.is_required).length,
        fieldTypes: Array.from(new Set(fields.map(f => f.field_type))).length
      };
    } catch {
      return { fieldCount: 0, requiredFields: 0, fieldTypes: 0 };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Template Manager</h2>
          <p className="text-muted-foreground">Manage your label templates</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Upload size={16} />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-file">Select Template File</Label>
                  <Input
                    id="template-file"
                    type="file"
                    accept=".json"
                    onChange={handleImportTemplate}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Select a JSON template file to import
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Save size={16} />
                Save Current
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'Edit Template' : 'Save Template'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    placeholder="Enter template name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="template-description">Description (Optional)</Label>
                  <Input
                    id="template-description"
                    placeholder="Enter template description"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                  />
                </div>
                {currentTemplate && (
                  <div className="space-y-2">
                    <Label>Template Info</Label>
                    <div className="flex gap-2">
                      <Badge variant="outline">{currentTemplate.fields.length} fields</Badge>
                      <Badge variant="outline">{currentTemplate.size}</Badge>
                      <Badge variant="outline">{currentTemplate.dimensions.width}×{currentTemplate.dimensions.height}px</Badge>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveTemplate}>
                  {editingTemplate ? 'Update' : 'Save'} Template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-muted-foreground" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="shipping_label">Shipping Label</SelectItem>
                          <SelectItem value="invoice_label">Invoice Label</SelectItem>
                          <SelectItem value="warehouse_label">Warehouse Label</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No templates found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search criteria' : 'Create your first template to get started'}
            </p>
          </div>
        ) : (
          filteredTemplates.map((template) => {
            const stats = getTemplateStats(template);
            return (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.template_name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {template.template_type.replace('_', ' ')} • Created {formatDate(template.created_at || '')}
                      </CardDescription>
                    </div>
                    <Badge variant={template.template_type === 'shipping_label' ? 'default' : 'secondary'}>
                      {template.template_type.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">{stats.fieldCount} fields</Badge>
                    <Badge variant="outline">{stats.requiredFields} required</Badge>
                    <Badge variant="outline">{template.label_size}</Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock size={14} />
                    <span>{formatDate(template.created_at)}</span>
                    {template.created_by && (
                      <>
                        <User size={14} />
                        <span>{template.created_by}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => onLoadTemplate?.(template)}
                      className="flex-1"
                    >
                      Load Template
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(template)}
                    >
                      <Edit size={14} />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicateTemplate(template)}
                    >
                      <Copy size={14} />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportTemplate(template)}
                    >
                      <Download size={14} />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Template</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{template.template_name}"? 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteTemplate(template.id, template.template_name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};