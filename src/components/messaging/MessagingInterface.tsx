import React, { useState } from 'react';
import { ConversationList } from './ConversationList';
import { MessageThread } from './MessageThread';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useConversations } from '@/hooks/useConversations';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle, Search, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const MessagingInterface: React.FC = () => {
  const { user } = useAuth();
  const { conversations, startDirectMessage } = useConversations();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [searchUsername, setSearchUsername] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  const handleStartNewChat = async () => {
    if (!searchUsername.trim()) {
      toast.error('Please enter a username');
      return;
    }

    setSearchLoading(true);
    try {
      // First, find the user by username
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('user_id, username, display_name')
        .eq('username', searchUsername.trim())
        .single();

      if (error || !profiles) {
        toast.error('User not found');
        return;
      }

      if (profiles.user_id === user?.id) {
        toast.error('You cannot message yourself');
        return;
      }

      // Start direct message
      const conversationId = await startDirectMessage(profiles.user_id);
      if (conversationId) {
        setSelectedConversationId(conversationId);
        setShowNewChatDialog(false);
        setSearchUsername('');
        toast.success(`Started conversation with @${profiles.username}`);
      }
    } catch (error) {
      console.error('Error starting new chat:', error);
      toast.error('Failed to start conversation');
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="h-full flex gap-6">
      {/* Conversation List */}
      <div className="w-80 h-full">
        <ConversationList
          selectedConversationId={selectedConversationId || undefined}
          onSelectConversation={setSelectedConversationId}
          onStartNewChat={() => setShowNewChatDialog(true)}
        />
      </div>

      {/* Message Thread */}
      <div className="flex-1 h-full">
        {selectedConversation ? (
          <MessageThread
            conversationId={selectedConversation.id}
            conversationName={
              selectedConversation.name ||
              (selectedConversation.type === 'direct' 
                ? selectedConversation.participants.find(p => p.user_id !== user?.id)?.profile?.display_name || 'Unknown User'
                : `Group (${selectedConversation.participants.length} members)`)
            }
            conversationType={selectedConversation.type}
            participantCount={selectedConversation.participants.length}
            onBack={() => setSelectedConversationId(null)}
          />
        ) : (
          <Card className="h-full">
            <CardContent className="p-8 flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a Conversation</h3>
              <p className="text-muted-foreground mb-6">
                Choose a conversation from the list to start messaging
              </p>
              <Button onClick={() => setShowNewChatDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Start New Chat
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* New Chat Dialog */}
      <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Chat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Find User by Username</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Enter username (without @)"
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                    className="pl-10"
                    onKeyDown={(e) => e.key === 'Enter' && handleStartNewChat()}
                  />
                </div>
                <Button 
                  onClick={handleStartNewChat}
                  disabled={searchLoading || !searchUsername.trim()}
                >
                  {searchLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Start Chat'
                  )}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter the username of the person you want to message
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};