import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLabelPrinting } from '@/hooks/useLabelPrinting';
import { 
  Printer, 
  Download, 
  RefreshCw, 
  Calendar, 
  Search, 
  FileText,
  Copy,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const PrintHistoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState('week');
  
  const { 
    printHistory, 
    loading, 
    fetchPrintHistory, 
    reprintLabel,
    generateAndDownloadPDF 
  } = useLabelPrinting();
  
  const { toast } = useToast();

  useEffect(() => {
    fetchPrintHistory();
  }, [fetchPrintHistory]);

  const filteredHistory = printHistory.filter(entry => {
    const matchesSearch = searchTerm === '' || 
      entry.template_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.shipment_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || entry.print_type === filterType;
    
    return matchesSearch && matchesType;
  });

  const handleReprint = async (entry: any, printType: 'duplicate' | 'copy') => {
    try {
      await reprintLabel(entry, printType);
      toast({
        title: "Success",
        description: `Label ${printType} printed successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to print ${printType}`,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPrintTypeColor = (printType: string) => {
    switch (printType) {
      case 'original': return 'default';
      case 'duplicate': return 'secondary';
      case 'copy': return 'outline';
      default: return 'default';
    }
  };

  const getStats = () => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const todayPrints = printHistory.filter(entry => 
      new Date(entry.created_at) >= todayStart
    ).length;
    
    const weekPrints = printHistory.filter(entry => 
      new Date(entry.created_at) >= weekStart
    ).length;
    
    const totalPrints = printHistory.length;
    
    return { todayPrints, weekPrints, totalPrints };
  };

  const stats = getStats();

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Print History</h1>
          <p className="text-muted-foreground">View and manage your label printing history</p>
        </div>
        
        <Button 
          onClick={() => fetchPrintHistory()}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Printer size={20} className="text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.todayPrints}</div>
                <div className="text-sm text-muted-foreground">Today</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.weekPrints}</div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText size={20} className="text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalPrints}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by template or shipment ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="original">Original</SelectItem>
                <SelectItem value="duplicate">Duplicate</SelectItem>
                <SelectItem value="copy">Copy</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle>Print History</CardTitle>
          <CardDescription>
            {filteredHistory.length} of {printHistory.length} records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw size={24} className="mx-auto animate-spin mb-2" />
                <p>Loading print history...</p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-8">
                <FileText size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">No print history found</p>
                <p className="text-muted-foreground">
                  {searchTerm || filterType !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Start printing labels to see history here'
                  }
                </p>
              </div>
            ) : (
              filteredHistory.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Printer size={20} className="text-primary" />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {entry.template_id ? `Template: ${entry.template_id}` : 'Direct Print'}
                        </span>
                        <Badge variant={getPrintTypeColor(entry.print_type)}>
                          {entry.print_type}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatDate(entry.created_at)}
                        </div>
                        
                        {entry.shipment_id && (
                          <span>Shipment: {entry.shipment_id}</span>
                        )}
                        
                        {entry.label_format && (
                          <span>Format: {entry.label_format}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReprint(entry, 'duplicate')}
                      className="flex items-center gap-1"
                    >
                      <Copy size={14} />
                      Duplicate
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReprint(entry, 'copy')}
                      className="flex items-center gap-1"
                    >
                      <Printer size={14} />
                      Reprint
                    </Button>

                    {entry.file_path && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Download size={14} />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};