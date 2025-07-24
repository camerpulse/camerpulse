import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Users, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageThreadsProps {
  messageId: string;
  messageContent: string;
  conversationId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Thread {
  id: string;
  thread_title: string | null;
  created_by: string;
  created_at: string;
  message_count: number;
}

interface ThreadMessage {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender?: {
    display_name: string;
    avatar_url?: string;
  };
}

export const MessageThreads: React.FC<MessageThreadsProps> = ({
  messageId,
  messageContent,
  conversationId,
  isOpen,
  onOpenChange
}) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [threadMessages, setThreadMessages] = useState<ThreadMessage[]>([]);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadThreads();
    }
  }, [isOpen, messageId]);

  useEffect(() => {
    if (selectedThread) {
      loadThreadMessages();
    }
  }, [selectedThread]);

  const loadThreads = async () => {
    try {
      const { data, error } = await supabase
        .from('message_threads')
        .select(`
          *,
          thread_messages(count)
        `)
        .eq('parent_message_id', messageId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const threadsWithCount = data.map(thread => ({
        ...thread,
        message_count: thread.thread_messages?.[0]?.count || 0
      }));

      setThreads(threadsWithCount);
    } catch (error) {
      console.error('Error loading threads:', error);
    }
  };

  const loadThreadMessages = async () => {
    if (!selectedThread) return;

    try {
      const { data, error } = await supabase
        .from('thread_messages')
        .select(`
          message_id,
          messages!inner(
            id,
            content,
            sender_id,
            created_at
          )
        `)
        .eq('thread_id', selectedThread.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const messages: ThreadMessage[] = data.map(item => ({
        id: item.messages.id,
        content: item.messages.content,
        sender_id: item.messages.sender_id,
        created_at: item.messages.created_at
      }));

      setThreadMessages(messages);
    } catch (error) {
      console.error('Error loading thread messages:', error);
    }
  };

  const createThread = async () => {
    if (!newThreadTitle.trim()) {
      toast({
        title: "Thread title required",
        description: "Please enter a title for the thread.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('create_message_thread', {
        p_parent_message_id: messageId,
        p_thread_title: newThreadTitle.trim()
      });

      if (error) throw error;

      await loadThreads();
      setNewThreadTitle('');
      setIsCreatingThread(false);
      
      toast({
        title: "Thread created",
        description: "Your thread has been created successfully."
      });
    } catch (error) {
      console.error('Error creating thread:', error);
      toast({
        title: "Error",
        description: "Failed to create thread. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addMessageToThread = async () => {
    if (!selectedThread || !newMessage.trim()) return;

    setLoading(true);
    try {
      // Create the message first
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          content: newMessage.trim(),
          sender_id: (await supabase.auth.getUser()).data.user?.id,
          receiver_id: 'system'
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Add to thread
      const { error: threadError } = await supabase
        .from('thread_messages')
        .insert({
          thread_id: selectedThread.id,
          message_id: messageData.id
        });

      if (threadError) throw threadError;

      setNewMessage('');
      await loadThreadMessages();
      
      toast({
        title: "Message sent",
        description: "Your message has been added to the thread."
      });
    } catch (error) {
      console.error('Error adding message to thread:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPreviewText = (content: string) => {
    return content.length > 50 ? content.substring(0, 50) + '...' : content;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[600px] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {selectedThread && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedThread(null)}
                className="p-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <MessageCircle className="w-5 h-5" />
            <DialogTitle>
              {selectedThread ? selectedThread.thread_title || 'Thread' : 'Message Threads'}
            </DialogTitle>
          </div>
        </DialogHeader>

        {!selectedThread ? (
          <div className="flex-1 flex flex-col">
            {/* Original message */}
            <div className="p-4 bg-muted rounded-lg mb-4">
              <h4 className="font-medium mb-2">Original Message:</h4>
              <p className="text-sm">{getPreviewText(messageContent)}</p>
            </div>

            {/* Create thread section */}
            {!isCreatingThread ? (
              <Button
                onClick={() => setIsCreatingThread(true)}
                className="mb-4"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Start a Thread
              </Button>
            ) : (
              <div className="space-y-2 mb-4">
                <Input
                  placeholder="Thread title..."
                  value={newThreadTitle}
                  onChange={(e) => setNewThreadTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createThread()}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={createThread} disabled={loading}>
                    {loading ? 'Creating...' : 'Create Thread'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setIsCreatingThread(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Threads list */}
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {threads.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No threads yet</p>
                    <p className="text-sm">Start a thread to organize your discussion</p>
                  </div>
                ) : (
                  threads.map((thread) => (
                    <div
                      key={thread.id}
                      className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => setSelectedThread(thread)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium">
                          {thread.thread_title || 'Untitled Thread'}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          <span>{thread.message_count}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(thread.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Thread messages */}
            <ScrollArea className="flex-1 mb-4">
              <div className="space-y-3">
                {threadMessages.map((message) => {
                  const isOwnMessage = message.sender_id === (supabase.auth.getUser() as any)?.data?.user?.id;
                  
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        isOwnMessage && "flex-row-reverse"
                      )}
                    >
                      <div className={cn(
                        "max-w-xs px-3 py-2 rounded-lg",
                        isOwnMessage 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      )}>
                        {!isOwnMessage && (
                          <div className="text-xs font-medium mb-1">
                            {message.sender?.display_name || 'Unknown'}
                          </div>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <div className={cn(
                          "text-xs mt-1",
                          isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          {formatTime(message.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* New message input */}
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addMessageToThread()}
                className="flex-1"
              />
              <Button 
                onClick={addMessageToThread} 
                disabled={!newMessage.trim() || loading}
              >
                Send
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};