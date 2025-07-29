import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Download, RefreshCw, Users, Building, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ImportResult {
  type: string;
  success: boolean;
  imported?: number;
  errors?: string[];
  data?: any;
  error?: string;
}

export const DataImportDashboard = () => {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [progress, setProgress] = useState(0);

  const handleImportMPs = async () => {
    setIsImporting(true);
    setProgress(25);
    
    try {
      const { data, error } = await supabase.functions.invoke('mp-data-importer');
      
      setProgress(100);
      
      if (error) {
        throw error;
      }
      
      const result: ImportResult = {
        type: 'MPs',
        success: data.success,
        imported: data.imported,
        errors: data.errors
      };
      
      setImportResults(prev => [result, ...prev]);
      
      toast({
        title: data.success ? "MPs Import Successful" : "MPs Import Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
      
    } catch (error) {
      console.error('Error importing MPs:', error);
      toast({
        title: "Import Error",
        description: "Failed to import MPs data",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setProgress(0);
    }
  };

  const handleImportMinisters = async () => {
    setIsImporting(true);
    setProgress(25);
    
    try {
      const { data, error } = await supabase.functions.invoke('minister-data-importer');
      
      setProgress(100);
      
      if (error) {
        throw error;
      }
      
      const result: ImportResult = {
        type: 'Ministers',
        success: data.success,
        imported: data.imported,
        errors: data.errors
      };
      
      setImportResults(prev => [result, ...prev]);
      
      toast({
        title: data.success ? "Ministers Import Successful" : "Ministers Import Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
      
    } catch (error) {
      console.error('Error importing Ministers:', error);
      toast({
        title: "Import Error",
        description: "Failed to import Ministers data",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setProgress(0);
    }
  };

  const handleScheduledImport = async () => {
    setIsImporting(true);
    setProgress(25);
    
    try {
      const { data, error } = await supabase.functions.invoke('data-import-scheduler');
      
      setProgress(100);
      
      if (error) {
        throw error;
      }
      
      setImportResults(prev => [...data.results, ...prev]);
      
      toast({
        title: data.success ? "Scheduled Import Successful" : "Scheduled Import Completed with Issues",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
      
    } catch (error) {
      console.error('Error running scheduled import:', error);
      toast({
        title: "Import Error",
        description: "Failed to run scheduled import",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Data Import Dashboard</h2>
        <Badge variant="secondary">Legislative Directory</Badge>
      </div>

      {/* Import Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Import MPs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Import Members of Parliament from the National Assembly website
            </p>
            <Button 
              onClick={handleImportMPs}
              disabled={isImporting}
              className="w-full"
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Import MPs
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="h-5 w-5" />
              Import Ministers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Import Government Ministers from official sources
            </p>
            <Button 
              onClick={handleImportMinisters}
              disabled={isImporting}
              className="w-full"
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Import Ministers
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <RefreshCw className="h-5 w-5" />
              Run Full Import
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Import both MPs and Ministers in a single operation
            </p>
            <Button 
              onClick={handleScheduledImport}
              disabled={isImporting}
              className="w-full"
              variant="outline"
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Full Import
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      {isImporting && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Import Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {importResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Recent Import Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {importResults.slice(0, 10).map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium">{result.type} Import</span>
                    </div>
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "Success" : "Failed"}
                    </Badge>
                  </div>
                  
                  {result.imported !== undefined && (
                    <p className="text-sm text-muted-foreground">
                      Imported: {result.imported} records
                    </p>
                  )}
                  
                  {result.errors && result.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-red-600">Errors:</p>
                      <ul className="text-xs text-red-500 mt-1 space-y-1">
                        {result.errors.slice(0, 3).map((error, errorIndex) => (
                          <li key={errorIndex}>• {error}</li>
                        ))}
                        {result.errors.length > 3 && (
                          <li>• ... and {result.errors.length - 3} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  {result.error && (
                    <p className="text-sm text-red-500 mt-2">{result.error}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};