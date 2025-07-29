import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Smile, Plus } from 'lucide-react';

interface MessageReactionsProps {
  messageId: string;
  existingReactions: Array<{
    id: string;
    user_id: string;
    reaction_value: string;
    reaction_type: string;
  }>;
  onReactionUpdate: () => void;
}

const COMMON_EMOJIS = [
  '👍', '👎', '❤️', '😂', '😮', '😢', '😡', '🔥', '👏', '🎉',
  '💯', '✅', '❌', '👀', '🙏', '💪', '🤔', '😍', '🤯', '🥳'
];

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  existingReactions,
  onReactionUpdate
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleReaction = async (emoji: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user already reacted with this emoji
      const existingReaction = existingReactions.find(
        r => r.user_id === user.id && r.reaction_value === emoji
      );

      if (existingReaction) {
        // Remove reaction
        await supabase
          .from('message_reactions_enhanced')
          .delete()
          .eq('id', existingReaction.id);
      } else {
        // Add reaction
        await supabase
          .from('message_reactions_enhanced')
          .insert({
            message_id: messageId,
            user_id: user.id,
            reaction_type: 'emoji',
            reaction_value: emoji
          });
      }

      onReactionUpdate();
      setIsOpen(false);
    } catch (error) {
      console.error('Error handling reaction:', error);
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive"
      });
    }
  };

  // Group reactions by emoji and count
  const reactionCounts = existingReactions.reduce((acc, reaction) => {
    const emoji = reaction.reaction_value;
    if (!acc[emoji]) {
      acc[emoji] = { count: 0, users: [] };
    }
    acc[emoji].count++;
    acc[emoji].users.push(reaction.user_id);
    return acc;
  }, {} as Record<string, { count: number; users: string[] }>);

  return (
    <div className="flex items-center gap-1 mt-1">
      {/* Display existing reactions */}
      {Object.entries(reactionCounts).map(([emoji, data]) => (
        <Button
          key={emoji}
          variant="outline"
          size="sm"
          className="h-6 px-2 text-xs hover:bg-muted"
          onClick={() => handleReaction(emoji)}
        >
          <span className="mr-1">{emoji}</span>
          <span>{data.count}</span>
        </Button>
      ))}

      {/* Add reaction button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-muted"
          >
            <Smile className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3">
          <div className="grid grid-cols-10 gap-1">
            {COMMON_EMOJIS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-muted"
                onClick={() => handleReaction(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};