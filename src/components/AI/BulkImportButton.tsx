import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Loader2, Zap } from "lucide-react";
import { useQueryClient } from '@tanstack/react-query';

export const BulkImportButton = () => {
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const runAutonomousAI = async () => {
    setIsRunning(true);
    
    try {
      toast({
        title: "🤖 Politica AI Activated",
        description: "AI is now running autonomously: importing, verifying & updating all parties...",
      });

      const { data, error } = await supabase.functions.invoke('politica-ai-manager');

      if (error) throw error;

      toast({
        title: "✅ Autonomous Operation Complete",
        description: data.message,
        duration: 5000,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['villages'] });
      queryClient.invalidateQueries({ queryKey: ['politicians'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    } catch (error) {
      console.error('Autonomous AI error:', error);
      toast({
        title: "❌ AI Operation Failed",
        description: error.message || "Failed to run autonomous AI operation",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Button 
      onClick={runAutonomousAI} 
      disabled={isRunning}
      className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
    >
      {isRunning ? (
        <>
          <Loader2 className="h-4 w-4" />
          <span>AI Running...</span>
        </>
      ) : (
        <>
          <Zap className="h-4 w-4" />
          <Bot className="h-4 w-4" />
          <span>Run Autonomous AI</span>
        </>
      )}
    </Button>
  );
};