import React from 'react';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useUserPresence } from '@/hooks/useUserPresence';

interface TypingIndicatorProps {
  conversationId: string;
  currentUserId: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  conversationId,
  currentUserId
}) => {
  const { typingUsers } = useTypingIndicator(conversationId);
  const { getUserPresence } = useUserPresence();

  // Filter out current user and get active typing users
  const activeTypingUsers = typingUsers.filter(user => 
    user.user_id !== currentUserId &&
    new Date().getTime() - new Date(user.last_activity).getTime() < 30000 // 30 seconds
  );

  if (activeTypingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (activeTypingUsers.length === 1) {
      const user = getUserPresence(activeTypingUsers[0].user_id);
      return `Someone is typing...`;
    } else if (activeTypingUsers.length === 2) {
      return `2 people are typing...`;
    } else {
      return `${activeTypingUsers.length} people are typing...`;
    }
  };

  return (
    <div className="flex items-center space-x-2 px-4 py-2 text-sm text-muted-foreground">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{getTypingText()}</span>
    </div>
  );
};