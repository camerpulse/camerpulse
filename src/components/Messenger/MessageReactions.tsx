import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { Smile, Plus } from 'lucide-react';

interface MessageReactionsProps {
  messageId: string;
  className?: string;
}

const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡', '👎', '🎉'];

export const MessageReactions: React.FC<MessageReactionsProps> = ({ 
  messageId, 
  className 
}) => {
  const { reactionSummary, loading, toggleReaction } = useMessageReactions(messageId);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiSelect = async (emoji: string) => {
    await toggleReaction(emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className={cn('flex items-center gap-1 mt-1', className)}>
      {/* Existing reactions */}
      {reactionSummary.map(({ emoji, count, hasUserReacted }) => (
        <Button
          key={emoji}
          variant={hasUserReacted ? "default" : "outline"}
          size="sm"
          className={cn(
            'h-6 px-2 text-xs rounded-full',
            hasUserReacted && 'bg-primary/20 border-primary'
          )}
          onClick={() => toggleReaction(emoji)}
          disabled={loading}
        >
          <span className="mr-1">{emoji}</span>
          <span>{count}</span>
        </Button>
      ))}

      {/* Add reaction button */}
      <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 rounded-full opacity-60 hover:opacity-100 transition-opacity"
            disabled={loading}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-4 gap-1">
            {COMMON_EMOJIS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-muted"
                onClick={() => handleEmojiSelect(emoji)}
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
