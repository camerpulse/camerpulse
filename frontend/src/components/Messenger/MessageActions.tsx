import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, Forward, Copy, Edit, Trash2, Reply } from 'lucide-react';
import { MessageForwarding } from './MessageForwarding';

interface MessageActionsProps {
  messageId: string;
  messageContent: string;
  senderId: string;
  currentUserId: string;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  messageId,
  messageContent,
  senderId,
  currentUserId,
  onReply,
  onEdit,
  onDelete
}) => {
  const { toast } = useToast();
  const [showForwardDialog, setShowForwardDialog] = useState(false);

  const isOwnMessage = senderId === currentUserId;

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(messageContent);
      toast({
        title: "Success",
        description: "Message copied to clipboard",
      });
    } catch (error) {
      console.error('Error copying message:', error);
      toast({
        title: "Error",
        description: "Failed to copy message",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMessage = async () => {
    if (!isOwnMessage) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Message deleted",
      });

      onDelete?.();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {onReply && (
            <DropdownMenuItem onClick={onReply}>
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem onClick={() => setShowForwardDialog(true)}>
            <Forward className="h-4 w-4 mr-2" />
            Forward
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleCopyMessage}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </DropdownMenuItem>
          
          {isOwnMessage && onEdit && (
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
          )}
          
          {isOwnMessage && (
            <DropdownMenuItem 
              onClick={handleDeleteMessage}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <MessageForwarding
        messageId={messageId}
        messageContent={messageContent}
        isOpen={showForwardDialog}
        onOpenChange={setShowForwardDialog}
      />
    </>
  );
};