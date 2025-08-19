import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Send, 
  Phone, 
  Video, 
  MoreHorizontal,
  Search,
  Paperclip,
  Smile,
  Check,
  CheckCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  sent_at: string;
  read_at?: string;
  message_type: 'text' | 'image' | 'file' | 'voice';
  metadata?: any;
}

interface Conversation {
  id: string;
  participant_id: string;
  participant_name: string;
  participant_avatar?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
  is_online?: boolean;
}

export const RealTimeMessaging: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
      setupRealtimeSubscription();
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      // Load conversations from database
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participants:conversation_participants(
            user_id,
            profiles:user_id(display_name, avatar_url)
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Transform data for UI
      const formattedConversations = data?.map(conv => ({
        id: conv.id,
        participant_id: conv.participants[0]?.user_id,
        participant_name: conv.participants[0]?.profiles?.display_name || 'Unknown',
        participant_avatar: conv.participants[0]?.profiles?.avatar_url,
        last_message: conv.last_message,
        last_message_time: conv.updated_at,
        unread_count: conv.unread_count || 0,
        is_online: false // Will be updated via presence
      })) || [];

      setConversations(formattedConversations);
      setLoading(false);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load conversations"
      });
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('sent_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load messages"
      });
    }
  };

  const setupRealtimeSubscription = () => {
    // Subscribe to new messages
    const messageSubscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        const newMessage = payload.new as Message;
        if (newMessage.recipient_id === user?.id || newMessage.sender_id === user?.id) {
          setMessages(prev => [...prev, newMessage]);
          
          // Update conversation last message
          setConversations(prev => prev.map(conv => 
            conv.id === newMessage.conversation_id 
              ? {
                  ...conv,
                  last_message: newMessage.content,
                  last_message_time: newMessage.sent_at,
                  unread_count: newMessage.sender_id !== user?.id ? conv.unread_count + 1 : conv.unread_count
                }
              : conv
          ));
        }
      })
      .subscribe();

    // Subscribe to typing indicators
    const typingSubscription = supabase
      .channel('typing')
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        setIsTyping(prev => ({
          ...prev,
          [payload.user_id]: payload.is_typing
        }));
      })
      .subscribe();

    return () => {
      messageSubscription.unsubscribe();
      typingSubscription.unsubscribe();
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: newMessage,
          sender_id: user.id,
          conversation_id: activeConversation,
          message_type: 'text',
          sent_at: new Date().toISOString()
        });

      if (error) throw error;

      setNewMessage('');
      stopTyping();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message"
      });
    }
  };

  const handleTyping = () => {
    if (!activeConversation || !user) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator
    supabase.channel('typing').send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: user.id,
        conversation_id: activeConversation,
        is_typing: true
      }
    });

    // Stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(stopTyping, 3000);
  };

  const stopTyping = () => {
    if (!activeConversation || !user) return;

    supabase.channel('typing').send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: user.id,
        conversation_id: activeConversation,
        is_typing: false
      }
    });
  };

  const markAsRead = async (conversationId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('recipient_id', user?.id)
        .is('read_at', null);

      // Update local state
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
      ));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participant_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeConversationData = conversations.find(conv => conv.id === activeConversation);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] bg-card rounded-lg border overflow-hidden">
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r border-border">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="h-[calc(100%-80px)]">
          <div className="p-2">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => {
                  setActiveConversation(conversation.id);
                  loadMessages(conversation.id);
                  markAsRead(conversation.id);
                }}
                className={cn(
                  "w-full p-3 rounded-lg text-left hover:bg-muted/50 transition-colors mb-1",
                  activeConversation === conversation.id && "bg-primary/10"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversation.participant_avatar} />
                      <AvatarFallback>
                        {conversation.participant_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.is_online && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm truncate">
                        {conversation.participant_name}
                      </p>
                      {conversation.last_message_time && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(conversation.last_message_time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground truncate">
                        {conversation.last_message || 'Start a conversation...'}
                      </p>
                      {conversation.unread_count > 0 && (
                        <Badge variant="destructive" className="h-5 min-w-[20px] text-xs px-1">
                          {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-background/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activeConversationData?.participant_avatar} />
                    <AvatarFallback>
                      {activeConversationData?.participant_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{activeConversationData?.participant_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {activeConversationData?.is_online ? 'Online' : 'Last seen recently'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwnMessage = message.sender_id === user?.id;
                  
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        isOwnMessage ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-2xl px-4 py-2 text-sm",
                          isOwnMessage
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p>{message.content}</p>
                        <div
                          className={cn(
                            "flex items-center justify-between mt-1 text-xs",
                            isOwnMessage
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          )}
                        >
                          <span>
                            {new Date(message.sent_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {isOwnMessage && (
                            <div className="ml-2">
                              {message.read_at ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {Object.entries(isTyping).some(([userId, typing]) => 
                  typing && userId !== user?.id
                ) && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="pr-10"
                  />
                  <Button
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-1 top-1/2 transform -translate-y-1/2"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">Select a conversation</h3>
              <p className="text-sm text-muted-foreground">
                Choose a conversation to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};