import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Send, 
  Users, 
  MoreVertical,
  Phone,
  Video,
  Archive,
  Trash2,
  Ban,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMessenger, type Conversation, type Message } from '@/hooks/useMessenger';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { MediaUpload, MediaPreview } from './MediaUpload';
import { MediaMessage } from './MediaMessage';
import { MessageReactions } from './MessageReactions';
import { MessageOptions } from './MessageOptions';
import { TypingIndicator } from './TypingIndicator';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { useTyping } from '@/hooks/useTyping';
import { supabase } from '@/integrations/supabase/client';

interface PulseMessengerProps {
  className?: string;
}

export const PulseMessenger: React.FC<PulseMessengerProps> = ({ className }) => {
  const { user } = useAuth();
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    loading,
    sendMessage,
    createConversation,
    fetchMessages,
    markConversationAsRead,
    toggleBlockUser
  } = useMessenger();
  
  const { uploadFile, uploading } = useMediaUpload();
  const { isTyping, typingMessage, handleTyping } = useTyping(activeConversation?.id || null);

  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle conversation selection
  const handleConversationSelect = async (conversation: Conversation) => {
    setActiveConversation(conversation);
    await fetchMessages(conversation.id);
    await markConversationAsRead(conversation.id);
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (!activeConversation || (!newMessage.trim() && !pendingFile)) return;
    
    if (pendingFile) {
      await handleSendMediaMessage();
    } else {
      await sendMessage(activeConversation.id, newMessage);
      setNewMessage('');
    }
  };

  // Handle sending media message
  const handleSendMediaMessage = async () => {
    if (!activeConversation || !pendingFile) return;

    try {
      setUploadProgress(20);
      
      // Send message first to get message ID
      const messageText = newMessage.trim() || `📎 ${pendingFile.name}`;
      await sendMessage(activeConversation.id, messageText, 'media');
      
      setUploadProgress(40);
      
      // Get the latest message ID (the one we just sent)
      const { data: latestMessage } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', activeConversation.id)
        .eq('sender_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (latestMessage) {
        setUploadProgress(60);
        
        // Upload the file
        await uploadFile(pendingFile, activeConversation.id, latestMessage.id);
        
        setUploadProgress(100);
      }
      
      // Reset form
      setNewMessage('');
      setPendingFile(null);
      setUploadProgress(0);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send media message",
        variant: "destructive"
      });
      setUploadProgress(0);
    }
  };

  // Handle file selection
  const handleFileSelect = (file: File, type: string) => {
    setPendingFile(file);
    if (!newMessage.trim()) {
      setNewMessage(`Sending ${type}...`);
    }
  };

  // Handle key press in message input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format message time
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className={cn('flex h-[600px] bg-background border rounded-lg overflow-hidden', className)}>
      {/* Conversations Sidebar */}
      <div className="w-80 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Pulse Messenger</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNewChatDialog(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No conversations yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setShowNewChatDialog(true)}
                >
                  Start a conversation
                </Button>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    'p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors',
                    activeConversation?.id === conversation.id && 'bg-muted'
                  )}
                  onClick={() => handleConversationSelect(conversation)}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {conversation.is_group ? (
                          <Users className="h-5 w-5" />
                        ) : (
                          conversation.title.substring(0, 2).toUpperCase()
                        )}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">
                          {conversation.title}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {formatMessageTime(conversation.last_message_at)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.description || 'No messages yet'}
                        </p>
                        {conversation.unread_count && conversation.unread_count > 0 && (
                          <Badge variant="default" className="h-5 min-w-5 text-xs">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {activeConversation.is_group ? (
                      <Users className="h-4 w-4" />
                    ) : (
                      activeConversation.title.substring(0, 2).toUpperCase()
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{activeConversation.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {activeConversation.is_group ? 
                      `${activeConversation.participants?.length || 0} participants` : 
                      'Online'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive conversation
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Ban className="h-4 w-4 mr-2" />
                      Block user
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        'flex group',
                        message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[70%] rounded-lg px-3 py-2 relative',
                          message.sender_id === user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        {activeConversation.is_group && message.sender_id !== user?.id && (
                          <p className="text-xs font-medium mb-1 opacity-70">
                            {message.sender_email}
                          </p>
                        )}
                        <p className="text-sm">
                          {message.content}
                          {message.edited_at && (
                            <span className="text-xs opacity-50 ml-2">(edited)</span>
                          )}
                        </p>
                        
                        {/* Media attachments */}
                        <MediaMessage 
                          messageId={message.id}
                          isOwn={message.sender_id === user?.id}
                          className="mt-2"
                        />
                        
                        {/* Message reactions */}
                        <MessageReactions messageId={message.id} />
                        
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-70">
                            {formatMessageTime(message.created_at)}
                          </span>
                          <div className="flex items-center space-x-1">
                            {message.sender_id === user?.id && (
                              <span className="text-xs opacity-70">
                                {message.is_read ? '✓✓' : '✓'}
                              </span>
                            )}
                            <MessageOptions
                              messageId={message.id}
                              content={message.content}
                              isOwn={message.sender_id === user?.id}
                              onMessageUpdate={() => fetchMessages(activeConversation.id)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {/* Typing indicator */}
                {isTyping && (
                  <TypingIndicator message={typingMessage} />
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              {/* File preview */}
              {pendingFile && (
                <div className="mb-3">
                  <MediaPreview
                    file={pendingFile}
                    onRemove={() => {
                      setPendingFile(null);
                      setNewMessage('');
                    }}
                    uploading={uploading}
                    uploadProgress={uploadProgress}
                  />
                </div>
              )}
              
              <div className="flex space-x-2">
                <MediaUpload
                  onFileSelect={handleFileSelect}
                  disabled={uploading}
                />
                
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={handleKeyPress}
                  disabled={uploading}
                  className="min-h-[40px] max-h-32 resize-none flex-1"
                  rows={1}
                />
                
                <Button
                  onClick={handleSendMessage}
                  disabled={(!newMessage.trim() && !pendingFile) || uploading}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* No conversation selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">Welcome to Pulse Messenger</h3>
              <p className="text-muted-foreground mb-4">
                Select a conversation or start a new one to begin messaging
              </p>
              <Button onClick={() => setShowNewChatDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Start New Conversation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};