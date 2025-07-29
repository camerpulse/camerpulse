import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageActions } from './MessageActions';
import { MessageReactions } from './MessageReactionsEnhanced';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  updated_at: string;
  message_type?: string;
  metadata?: any;
  sender?: {
    display_name: string;
    username: string;
    avatar_url?: string;
  };
}

interface MessageReaction {
  id: string;
  user_id: string;
  reaction_value: string;
  reaction_type: string;
}

interface EnhancedMessageItemProps {
  message: Message;
  currentUserId: string;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  onReply?: (messageId: string) => void;
}

export const EnhancedMessageItem: React.FC<EnhancedMessageItemProps> = ({
  message,
  currentUserId,
  isOwnMessage,
  showAvatar = true,
  onReply
}) => {
  const [reactions, setReactions] = useState<MessageReaction[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  useEffect(() => {
    loadReactions();
  }, [message.id]);

  const loadReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('message_reactions_enhanced')
        .select('*')
        .eq('message_id', message.id);

      if (error) throw error;
      setReactions(data || []);
    } catch (error) {
      console.error('Error loading reactions:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      // Save original content to edit history
      await supabase
        .from('message_edit_history')
        .insert({
          message_id: message.id,
          original_content: message.content,
          edited_content: editedContent,
          edited_by: currentUserId
        });

      // Update the message
      await supabase
        .from('messages')
        .update({ 
          content: editedContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', message.id);

      setIsEditing(false);
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditedContent(message.content);
    setIsEditing(false);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isForwardedMessage = message.message_type === 'forwarded';
  const isEditedMessage = message.updated_at !== message.created_at;

  return (
    <div className={cn(
      "group flex gap-3 p-3 hover:bg-muted/30 transition-colors",
      isOwnMessage && "flex-row-reverse"
    )}>
      {/* Avatar */}
      {showAvatar && !isOwnMessage && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.sender?.avatar_url} />
          <AvatarFallback>
            {message.sender?.display_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message content */}
      <div className={cn(
        "flex-1 min-w-0",
        isOwnMessage && "text-right"
      )}>
        {/* Sender name and timestamp */}
        {!isOwnMessage && (
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">
              {message.sender?.display_name || message.sender?.username}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(message.created_at)}
            </span>
          </div>
        )}

        {/* Forwarded message indicator */}
        {isForwardedMessage && (
          <div className="flex items-center gap-1 mb-2">
            <Badge variant="secondary" className="text-xs">
              Forwarded
            </Badge>
          </div>
        )}

        {/* Message content */}
        <div className={cn(
          "rounded-lg px-3 py-2 max-w-md",
          isOwnMessage 
            ? "bg-primary text-primary-foreground ml-auto" 
            : "bg-muted"
        )}>
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full bg-transparent border border-border rounded p-2 text-sm resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancelEdit}
                  className="text-xs px-2 py-1 rounded hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>
              
              {/* Edited indicator */}
              {isEditedMessage && (
                <span className="text-xs opacity-70 mt-1 block">
                  (edited)
                </span>
              )}
            </>
          )}
        </div>

        {/* Message reactions */}
        <MessageReactions
          messageId={message.id}
          existingReactions={reactions}
          onReactionUpdate={loadReactions}
        />

        {/* Timestamp for own messages */}
        {isOwnMessage && (
          <div className="text-xs text-muted-foreground mt-1">
            {formatTime(message.created_at)}
          </div>
        )}
      </div>

      {/* Message actions */}
      <div className="flex items-center">
        <MessageActions
          messageId={message.id}
          messageContent={message.content}
          senderId={message.sender_id}
          currentUserId={currentUserId}
          onReply={() => onReply?.(message.id)}
          onEdit={handleEdit}
          onDelete={() => {/* Handle delete */}}
        />
      </div>
    </div>
  );
};