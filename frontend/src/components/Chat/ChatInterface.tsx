import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle, User, Store } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  sender_type: 'customer' | 'vendor';
  is_read: boolean;
  created_at: string;
}

interface ChatConversation {
  id: string;
  customer_id: string;
  vendor_id: string;
  related_product_id?: string;
  last_message_at?: string;
  status: string;
  marketplace_vendors?: {
    business_name: string;
    logo_url?: string;
  };
  marketplace_products?: {
    name: string;
    image_url?: string;
  };
  unread_count?: number;
}

interface ChatInterfaceProps {
  productId?: string;
  vendorId?: string;
  onClose?: () => void;
}

export const ChatInterface = ({ productId, vendorId, onClose }: ChatInterfaceProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // Fetch conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['chat-conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('chat_conversations')
        .select(`
          *,
          marketplace_vendors (business_name, logo_url),
          marketplace_products (name, image_url)
        `)
        .or(`customer_id.eq.${user.id},vendor_id.in.(SELECT id FROM marketplace_vendors WHERE user_id = '${user.id}')`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  // Fetch messages for selected conversation
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['chat-messages', selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', selectedConversation)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!selectedConversation,
  });

  // Create or get conversation
  const createConversationMutation = useMutation({
    mutationFn: async ({ vendorId, productId }: { vendorId: string; productId?: string }) => {
      if (!user) throw new Error('User not authenticated');

      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('customer_id', user.id)
        .eq('vendor_id', vendorId)
        .eq('related_product_id', productId || null)
        .single();

      if (existingConversation) {
        return existingConversation.id;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          customer_id: user.id,
          vendor_id: vendorId,
          related_product_id: productId,
          conversation_type: productId ? 'product_inquiry' : 'general'
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    },
    onSuccess: (conversationId) => {
      setSelectedConversation(conversationId);
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      if (!user) throw new Error('User not authenticated');

      // Determine sender type
      const conversation = conversations?.find(c => c.id === conversationId);
      const senderType = conversation?.customer_id === user.id ? 'customer' : 'vendor';

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          sender_type: senderType,
          content: content.trim(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
    },
    onError: (error) => {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    },
  });

  // Auto-create conversation if vendorId is provided
  useEffect(() => {
    if (vendorId && user && !selectedConversation) {
      createConversationMutation.mutate({ vendorId, productId });
    }
  }, [vendorId, productId, user]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!selectedConversation) return;

    const channel = supabase
      .channel(`chat_messages:${selectedConversation}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${selectedConversation}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedConversation] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation, queryClient]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: newMessage,
    });
  };

  const getConversationTitle = (conversation: ChatConversation) => {
    if (conversation.marketplace_products) {
      return `Re: ${conversation.marketplace_products.name}`;
    }
    return conversation.marketplace_vendors?.business_name || 'Chat';
  };

  const getConversationSubtitle = (conversation: ChatConversation) => {
    if (conversation.marketplace_vendors) {
      return conversation.marketplace_vendors.business_name;
    }
    return 'Direct message';
  };

  if (conversationsLoading) {
    return (
      <Card className="h-96">
        <CardContent className="p-6 flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>Messages</span>
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex min-h-0">
        {/* Conversations List */}
        <div className="w-1/3 border-r pr-4">
          <ScrollArea className="h-full">
            <div className="space-y-2">
              {conversations?.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation === conversation.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={conversation.marketplace_vendors?.logo_url} />
                      <AvatarFallback>
                        <Store className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {getConversationTitle(conversation)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {getConversationSubtitle(conversation)}
                      </p>
                      {conversation.last_message_at && (
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                    {conversation.unread_count && conversation.unread_count > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}

              {conversations?.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No conversations yet
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col pl-4">
          {selectedConversation ? (
            <>
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    messages?.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            message.sender_id === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  disabled={sendMessageMutation.isPending}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};