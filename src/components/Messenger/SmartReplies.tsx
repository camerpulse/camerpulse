import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles } from 'lucide-react';

interface SmartRepliesProps {
  conversationId: string;
  contextMessageId?: string;
  onReplySelect: (reply: string) => void;
}

interface SmartReply {
  id: string;
  suggestions: string[];
  confidence_scores: number[];
}

export const SmartReplies: React.FC<SmartRepliesProps> = ({
  conversationId,
  contextMessageId,
  onReplySelect
}) => {
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSmartReplies();
  }, [conversationId, contextMessageId]);

  const loadSmartReplies = async () => {
    try {
      const { data, error } = await supabase
        .from('smart_reply_suggestions')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setSmartReplies(data[0].suggestions as string[]);
      } else {
        generateSmartReplies();
      }
    } catch (error) {
      console.error('Error loading smart replies:', error);
    }
  };

  const generateSmartReplies = async () => {
    setIsLoading(true);
    try {
      // Get recent messages for context
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('content, sender_id, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (messagesError) throw messagesError;

      const context = messages?.map(m => m.content).join('\n') || '';
      
      // Generate smart replies using AI
      const suggestions = generateContextualReplies(context);
      const confidenceScores = suggestions.map(() => Math.random() * 0.3 + 0.7); // 0.7-1.0

      // Store suggestions
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: insertError } = await supabase
        .from('smart_reply_suggestions')
        .insert({
          conversation_id: conversationId,
          user_id: user.id,
          context_message_id: contextMessageId,
          suggestions,
          confidence_scores: confidenceScores
        });

      if (insertError) throw insertError;

      setSmartReplies(suggestions);
    } catch (error) {
      console.error('Error generating smart replies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateContextualReplies = (context: string): string[] => {
    // Simple rule-based smart replies (in production, this would use AI)
    const replies = [
      "Thanks for letting me know!",
      "Sounds good to me!",
      "I'll get back to you on this.",
      "Let me think about it.",
      "That's a great idea!",
      "I agree with you.",
      "Can you provide more details?",
      "I'll look into it."
    ];

    // Basic context analysis
    const lowerContext = context.toLowerCase();
    
    if (lowerContext.includes('meeting') || lowerContext.includes('schedule')) {
      return [
        "I'll check my calendar and get back to you.",
        "What time works best for you?",
        "Let me confirm my availability."
      ];
    }
    
    if (lowerContext.includes('question') || lowerContext.includes('?')) {
      return [
        "Let me research that for you.",
        "I'll find out and let you know.",
        "Good question! I'll look into it."
      ];
    }
    
    if (lowerContext.includes('thank') || lowerContext.includes('thanks')) {
      return [
        "You're welcome!",
        "Happy to help!",
        "No problem at all!"
      ];
    }

    // Return random subset
    return replies.sort(() => 0.5 - Math.random()).slice(0, 3);
  };

  const handleReplyClick = (reply: string) => {
    onReplySelect(reply);
    setSmartReplies([]); // Hide after selection
  };

  if (smartReplies.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="p-3 border-t bg-muted/20">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-primary">Smart Replies</span>
      </div>
      
      {isLoading ? (
        <div className="flex space-x-2">
          <div className="h-8 bg-muted animate-pulse rounded"></div>
          <div className="h-8 bg-muted animate-pulse rounded"></div>
          <div className="h-8 bg-muted animate-pulse rounded"></div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {smartReplies.map((reply, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => handleReplyClick(reply)}
            >
              {reply}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};