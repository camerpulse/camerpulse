import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Printer, 
  Download, 
  Eye, 
  Grid, 
  List,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react';
import { LabelPreview } from './LabelPreview';
import { useToast } from '@/hooks/use-toast';

interface BulkPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Array<Record<string, any>>;
  templateId: string;
  templateConfig?: any;
  onPrint: (selectedItems: Array<Record<string, any>>) => void;
  onExport: (selectedItems: Array<Record<string, any>>, format: string) => void;
}

export const BulkPreviewModal: React.FC<BulkPreviewModalProps> = ({
  open,
  onOpenChange,
  data,
  templateId,
  templateConfig,
  onPrint,
  onExport
}) => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const validData = data.filter(item => !item.validationErrors?.length);
  const invalidData = data.filter(item => item.validationErrors?.length > 0);

  const paginatedData = validData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(validData.length / itemsPerPage);

  const toggleSelection = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAll = () => {
    setSelectedItems(validData.map(item => item.id));
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const handlePrint = () => {
    const itemsToPrint = validData.filter(item => selectedItems.includes(item.id));
    if (itemsToPrint.length === 0) {
      toast({
        title: "Print Error",
        description: "Please select items to print",
        variant: "destructive",
      });
      return;
    }
    onPrint(itemsToPrint);
    onOpenChange(false);
  };

  const handleExport = (format: string) => {
    const itemsToExport = validData.filter(item => selectedItems.includes(item.id));
    if (itemsToExport.length === 0) {
      toast({
        title: "Export Error",
        description: "Please select items to export",
        variant: "destructive",
      });
      return;
    }
    onExport(itemsToExport, format);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Label Preview
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Preview ({validData.length})</TabsTrigger>
            <TabsTrigger value="errors">Errors ({invalidData.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {selectedItems.length} / {validData.length} selected
                </Badge>
                <Button onClick={selectAll} size="sm" variant="ghost">
                  Select All
                </Button>
                <Button onClick={clearSelection} size="sm" variant="ghost">
                  Clear
                </Button>
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    size="sm"
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    size="sm"
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>

            <ScrollArea className="h-96">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
                  {paginatedData.map((item) => (
                    <div
                      key={item.id}
                      className={`relative cursor-pointer transition-all ${
                        selectedItems.includes(item.id)
                          ? 'ring-2 ring-primary ring-offset-2'
                          : 'hover:ring-1 hover:ring-muted-foreground'
                      }`}
                      onClick={() => toggleSelection(item.id)}
                    >
                      <LabelPreview
                        data={item}
                        templateId={templateId}
                        templateConfig={templateConfig}
                        compact
                      />
                      {selectedItems.includes(item.id) && (
                        <div className="absolute top-1 right-1">
                          <CheckCircle className="h-4 w-4 text-primary bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 p-2">
                  {paginatedData.map((item, index) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedItems.includes(item.id)
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => toggleSelection(item.id)}
                    >
                      <div className="flex-shrink-0">
                        {selectedItems.includes(item.id) ? (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        ) : (
                          <div className="h-4 w-4 border rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Label #{((currentPage - 1) * itemsPerPage) + index + 1}</p>
                        <p className="text-sm text-muted-foreground">
                          {Object.entries(item)
                            .filter(([key]) => !['id', 'selected', 'validationErrors'].includes(key))
                            .slice(0, 3)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(' • ')
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="errors" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="space-y-3 p-2">
                {invalidData.map((item, index) => (
                  <div key={item.id} className="border border-destructive/20 bg-destructive/5 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">Record #{index + 1}</p>
                        <div className="mt-1 space-y-1">
                          {item.validationErrors?.map((error: string, errorIndex: number) => (
                            <p key={errorIndex} className="text-sm text-destructive">
                              • {error}
                            </p>
                          ))}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Data: {Object.entries(item)
                            .filter(([key]) => !['id', 'selected', 'validationErrors'].includes(key))
                            .map(([key, value]) => `${key}: ${value || 'empty'}`)
                            .join(' • ')
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {invalidData.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p>No validation errors found!</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              onClick={() => handleExport('pdf')}
              variant="outline"
              size="sm"
              disabled={selectedItems.length === 0}
            >
              <Download className="h-4 w-4 mr-1" />
              Export PDF
            </Button>
            <Button
              onClick={() => handleExport('png')}
              variant="outline"
              size="sm"
              disabled={selectedItems.length === 0}
            >
              <Download className="h-4 w-4 mr-1" />
              Export Images
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={handlePrint}
              disabled={selectedItems.length === 0}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Selected ({selectedItems.length})
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkPreviewModal;