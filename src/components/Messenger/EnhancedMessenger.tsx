import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  Settings,
  Smile,
  Paperclip,
  Image,
  File,
  Star,
  Pin,
  Reply,
  Forward,
  Edit,
  Clock,
  CheckCheck,
  VolumeX,
  Volume2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMessenger, type Conversation, type Message } from '@/hooks/useMessenger';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PresenceIndicator } from './PresenceIndicator';
import { TypingIndicator } from './TypingIndicator';

interface EnhancedMessengerProps {
  className?: string;
}

export const EnhancedMessenger: React.FC<EnhancedMessengerProps> = ({ className }) => {
  const { user } = useAuth();
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    loading,
    unreadCount,
    sendMessage,
    createConversation,
    fetchMessages,
    markConversationAsRead,
    toggleBlockUser
  } = useMessenger();

  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participants?.some(p => p.user_email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle conversation selection
  const handleConversationSelect = async (conversation: Conversation) => {
    setActiveConversation(conversation);
    await fetchMessages(conversation.id);
    await markConversationAsRead(conversation.id);
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (!activeConversation || !newMessage.trim()) return;
    
    try {
      await sendMessage(activeConversation.id, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
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

  // Get conversation preview
  const getConversationPreview = (conversation: Conversation) => {
    if (conversation.description) return conversation.description;
    return conversation.is_group ? 'Group conversation' : 'Direct message';
  };

  return (
    <TooltipProvider>
      <div className={cn('flex h-[700px] bg-background border rounded-xl shadow-lg overflow-hidden', className)}>
        {/* Enhanced Conversations Sidebar */}
        <div className={cn(
          'border-r flex flex-col bg-card/50 transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-80'
        )}>
          {/* Enhanced Header */}
          <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center bg-destructive">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </div>
                {!sidebarCollapsed && (
                  <div>
                    <h2 className="font-semibold text-lg">Pulse Messenger</h2>
                    <p className="text-xs text-muted-foreground">Secure civic communication</p>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewChatDialog(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>New conversation</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{sidebarCollapsed ? 'Expand' : 'Collapse'}</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Enhanced Search */}
            {!sidebarCollapsed && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
            )}
          </div>

          {/* Enhanced Conversations List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  {!sidebarCollapsed && (
                    <>
                      <p className="text-sm">No conversations yet</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => setShowNewChatDialog(true)}
                      >
                        Start a conversation
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={cn(
                      'rounded-lg cursor-pointer hover:bg-muted/50 transition-all duration-200 border border-transparent hover:border-primary/20',
                      activeConversation?.id === conversation.id && 'bg-primary/10 border-primary/30 shadow-sm',
                      sidebarCollapsed ? 'p-2 mb-2' : 'p-3 mb-2'
                    )}
                    onClick={() => handleConversationSelect(conversation)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className={cn("transition-all", sidebarCollapsed ? "h-8 w-8" : "h-10 w-10")}>
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-medium">
                            {conversation.is_group ? (
                              <Users className="h-5 w-5" />
                            ) : (
                              conversation.title.substring(0, 2).toUpperCase()
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <PresenceIndicator 
                          userId={conversation.participants?.[0]?.user_id || ''} 
                          className="absolute -bottom-1 -right-1"
                        />
                      </div>
                      
                      {!sidebarCollapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium truncate text-sm">
                              {conversation.title}
                            </h3>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-muted-foreground">
                                {formatMessageTime(conversation.last_message_at)}
                              </span>
                              {conversation.unread_count && conversation.unread_count > 0 && (
                                <Badge variant="destructive" className="h-5 min-w-5 text-xs">
                                  {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-muted-foreground truncate">
                              {getConversationPreview(conversation)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Enhanced Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              {/* Enhanced Chat Header */}
              <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-primary/5 to-secondary/5">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-medium">
                      {activeConversation.is_group ? (
                        <Users className="h-5 w-5" />
                      ) : (
                        activeConversation.title.substring(0, 2).toUpperCase()
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{activeConversation.title}</h3>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-muted-foreground">
                        {activeConversation.is_group ? 
                          `${activeConversation.participants?.length || 0} participants` : 
                          'Direct message'
                        }
                      </p>
                      {!activeConversation.is_group && (
                        <PresenceIndicator 
                          userId={activeConversation.participants?.[0]?.user_id || ''} 
                          showText={true}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Voice call</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Video call</TooltipContent>
                  </Tooltip>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Star className="h-4 w-4 mr-2" />
                        Star conversation
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <VolumeX className="h-4 w-4 mr-2" />
                        Mute notifications
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
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

              {/* Enhanced Messages */}
              <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-background to-muted/20">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <h3 className="text-lg font-medium mb-2">Start the conversation!</h3>
                      <p className="text-sm">Send a message to begin your secure conversation.</p>
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const isOwn = message.sender_id === user?.id;
                      const showAvatar = !isOwn && (index === 0 || messages[index - 1].sender_id !== message.sender_id);
                      
                      return (
                        <div
                          key={message.id}
                          className={cn(
                            'flex group',
                            isOwn ? 'justify-end' : 'justify-start'
                          )}
                        >
                          <div className={cn('flex items-end space-x-2 max-w-[75%]', isOwn && 'flex-row-reverse space-x-reverse')}>
                            {showAvatar && !isOwn && (
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs bg-muted">
                                  {message.sender_email?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div
                              className={cn(
                                'rounded-2xl px-4 py-2 relative shadow-sm border transition-all duration-200 hover:shadow-md',
                                isOwn
                                  ? 'bg-primary text-primary-foreground border-primary/20'
                                  : 'bg-card border-border'
                              )}
                            >
                              {activeConversation.is_group && !isOwn && showAvatar && (
                                <p className="text-xs font-medium mb-1 opacity-70">
                                  {message.sender_email}
                                </p>
                              )}
                              
                              <p className="text-sm leading-relaxed">
                                {message.content}
                                {message.edited_at && (
                                  <span className="text-xs opacity-50 ml-2 italic">(edited)</span>
                                )}
                              </p>
                              
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs opacity-70">
                                  {formatMessageTime(message.created_at)}
                                </span>
                                <div className="flex items-center space-x-1">
                                  {isOwn && (
                                    <span className="text-xs opacity-70">
                                      {message.is_read ? <CheckCheck className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                    </span>
                                  )}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>
                                        <Reply className="h-4 w-4 mr-2" />
                                        Reply
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Forward className="h-4 w-4 mr-2" />
                                        Forward
                                      </DropdownMenuItem>
                                      {isOwn && (
                                        <DropdownMenuItem>
                                          <Edit className="h-4 w-4 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-destructive">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  
                  {/* Typing indicator */}
                  <TypingIndicator 
                    conversationId={activeConversation?.id || ''} 
                    currentUserId={user?.id || ''} 
                  />
                </div>
              </ScrollArea>

              {/* Enhanced Message Input */}
              <div className="p-4 border-t bg-card/50">
                <div className="flex items-end space-x-2">
                  <div className="flex space-x-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Attach file</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Image className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Send image</TooltipContent>
                    </Tooltip>
                  </div>
                  
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pr-20 bg-background"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || loading}
                    size="sm"
                    className="h-8"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="mb-6">
                  <MessageSquare className="h-20 w-20 mx-auto mb-4 text-primary/50" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Welcome to Pulse Messenger</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Secure, encrypted messaging for civic engagement. Select a conversation to start chatting
                  or create a new conversation to connect with fellow citizens.
                </p>
                <Button
                  onClick={() => setShowNewChatDialog(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Start New Conversation
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};