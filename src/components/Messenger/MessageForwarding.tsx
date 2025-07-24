import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Forward, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface MessageForwardingProps {
  messageId: string;
  messageContent: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Conversation {
  id: string;
  title: string;
  is_group: boolean;
  participants: Array<{
    user_id: string;
  }>;
}

export const MessageForwarding: React.FC<MessageForwardingProps> = ({
  messageId,
  messageContent,
  isOpen,
  onOpenChange
}) => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversations, setSelectedConversations] = useState<string[]>([]);
  const [forwardContext, setForwardContext] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isForwarding, setIsForwarding] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          title,
          is_group,
          participants:conversation_participants(user_id)
        `)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    }
  };

  const handleForward = async () => {
    if (selectedConversations.length === 0) return;

    setIsForwarding(true);
    try {
      const promises = selectedConversations.map(conversationId =>
        supabase.rpc('forward_message', {
          p_original_message_id: messageId,
          p_target_conversation_id: conversationId,
          p_forward_context: forwardContext || null
        })
      );

      await Promise.all(promises);

      toast({
        title: "Success",
        description: `Message forwarded to ${selectedConversations.length} conversation(s)`,
      });

      onOpenChange(false);
      setSelectedConversations([]);
      setForwardContext('');
    } catch (error) {
      console.error('Error forwarding message:', error);
      toast({
        title: "Error",
        description: "Failed to forward message",
        variant: "destructive"
      });
    } finally {
      setIsForwarding(false);
    }
  };

  const getConversationName = (conversation: Conversation) => {
    if (conversation.title) return conversation.title;
    
    if (conversation.is_group) {
      return `Group (${conversation.participants.length} members)`;
    } else {
      return 'Direct conversation';
    }
  };

  const filteredConversations = conversations.filter(conv =>
    getConversationName(conv).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Forward className="h-4 w-4" />
            Forward Message
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Original message preview */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Original message:</p>
            <p className="text-sm line-clamp-3">{messageContent}</p>
          </div>

          {/* Optional context message */}
          <div>
            <label className="text-sm font-medium">Add a message (optional)</label>
            <Textarea
              placeholder="Add a comment when forwarding..."
              value={forwardContext}
              onChange={(e) => setForwardContext(e.target.value)}
              className="mt-1"
              rows={2}
            />
          </div>

          {/* Search conversations */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Conversation list */}
          <ScrollArea className="h-60">
            <div className="space-y-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedConversations.includes(conversation.id)
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => {
                    setSelectedConversations(prev =>
                      prev.includes(conversation.id)
                        ? prev.filter(id => id !== conversation.id)
                        : [...prev, conversation.id]
                    );
                  }}
                >
                  <p className="font-medium text-sm">{getConversationName(conversation)}</p>
                  <p className="text-xs text-muted-foreground">
                    {conversation.is_group ? `${conversation.participants.length} members` : 'Direct message'}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleForward}
            disabled={selectedConversations.length === 0 || isForwarding}
          >
            {isForwarding ? 'Forwarding...' : `Forward to ${selectedConversations.length} chat(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};