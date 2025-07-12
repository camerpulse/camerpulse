import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, Loader2 } from "lucide-react";

export const BulkImportButton = () => {
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleBulkImport = async () => {
    setIsImporting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('politica-ai-scanner', {
        body: {
          bulk_import: true,
          target_type: 'political_party'
        }
      });

      if (error) throw error;

      toast({
        title: "Bulk Import Completed",
        description: `Imported ${data.imported} new parties, updated ${data.updated} existing parties. Total found: ${data.total_found}`,
      });

      // Refresh the page to show new data
      window.location.reload();
    } catch (error) {
      console.error('Bulk import error:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import parties from MINAT website",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Button 
      onClick={handleBulkImport} 
      disabled={isImporting}
      className="gap-2"
    >
      {isImporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {isImporting ? "Importing..." : "Import All Parties from MINAT"}
    </Button>
  );
};