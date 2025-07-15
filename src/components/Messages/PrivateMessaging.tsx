import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageCircle, 
  Send, 
  Search, 
  User,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  is_read: boolean;
  created_at: string;
  sender_profile?: {
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  receiver_profile?: {
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
}

interface Conversation {
  other_user_id: string;
  other_user_profile: {
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  last_message: Message;
  unread_count: number;
}

interface PrivateMessagingProps {
  recipientId?: string;
  recipientProfile?: {
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
}

export const PrivateMessaging: React.FC<PrivateMessagingProps> = ({
  recipientId,
  recipientProfile
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(recipientId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchUsers, setSearchUsers] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConversations();
      if (selectedConversation) {
        fetchMessages(selectedConversation);
      }
    }
  }, [user, selectedConversation]);

  useEffect(() => {
    if (recipientId && recipientProfile) {
      setSelectedConversation(recipientId);
    }
  }, [recipientId, recipientProfile]);

  const fetchConversations = async () => {
    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          receiver_id,
          is_read,
          created_at,
          updated_at
        `)
        .or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get unique user IDs and fetch their profiles
      const userIds = new Set<string>();
      messagesData?.forEach((message) => {
        userIds.add(message.sender_id);
        userIds.add(message.receiver_id);
      });

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', Array.from(userIds));

      const profileMap = new Map();
      profilesData?.forEach(profile => {
        profileMap.set(profile.user_id, profile);
      });

      // Group messages by conversation partner
      const conversationMap = new Map<string, Conversation>();
      
      messagesData?.forEach((message) => {
        const otherUserId = message.sender_id === user!.id ? message.receiver_id : message.sender_id;
        const otherUserProfile = profileMap.get(otherUserId);

        if (otherUserProfile && !conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            other_user_id: otherUserId,
            other_user_profile: otherUserProfile,
            last_message: {
              ...message,
              sender_profile: profileMap.get(message.sender_id),
              receiver_profile: profileMap.get(message.receiver_id)
            },
            unread_count: 0
          });
        }

        // Count unread messages from this user
        if (message.receiver_id === user!.id && !message.is_read) {
          const conv = conversationMap.get(otherUserId);
          if (conv) {
            conv.unread_count++;
          }
        }
      });

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId: string) => {
    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          receiver_id,
          is_read,
          created_at,
          updated_at
        `)
        .or(`and(sender_id.eq.${user!.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user!.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get profiles for message senders/receivers
      const userIds = new Set<string>();
      messagesData?.forEach((message) => {
        userIds.add(message.sender_id);
        userIds.add(message.receiver_id);
      });

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', Array.from(userIds));

      const profileMap = new Map();
      profilesData?.forEach(profile => {
        profileMap.set(profile.user_id, profile);
      });

      const messagesWithProfiles = messagesData?.map(message => ({
        ...message,
        sender_profile: profileMap.get(message.sender_id),
        receiver_profile: profileMap.get(message.receiver_id)
      })) || [];

      setMessages(messagesWithProfiles);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', otherUserId)
        .eq('receiver_id', user!.id)
        .eq('is_read', false);

      // Refresh conversations to update unread count
      fetchConversations();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user!.id,
          receiver_id: selectedConversation,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
      fetchMessages(selectedConversation);
      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès"
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const searchUsersFunction = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .neq('user_id', user!.id)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const startNewConversation = (profile: any) => {
    setSelectedConversation(profile.user_id);
    setSearchUsers('');
    setSearchResults([]);
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p>Vous devez être connecté pour accéder aux messages privés</p>
        </CardContent>
      </Card>
    );
  }

  const selectedProfile = recipientProfile || 
    conversations.find(c => c.other_user_id === selectedConversation)?.other_user_profile;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
      {/* Conversations List */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Messages</CardTitle>
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des utilisateurs..."
                value={searchUsers}
                onChange={(e) => {
                  setSearchUsers(e.target.value);
                  searchUsersFunction(e.target.value);
                }}
                className="pl-10"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="border rounded-md p-2 space-y-1 max-h-32 overflow-y-auto">
                {searchResults.map((profile) => (
                  <Button
                    key={profile.user_id}
                    variant="ghost"
                    className="w-full justify-start p-2 h-auto"
                    onClick={() => startNewConversation(profile)}
                  >
                    <Avatar className="w-6 h-6 mr-2">
                      <AvatarImage src={profile.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {profile.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{profile.display_name || profile.username}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {conversations.map((conversation) => (
              <Button
                key={conversation.other_user_id}
                variant={selectedConversation === conversation.other_user_id ? "secondary" : "ghost"}
                className="w-full justify-start p-3 h-auto"
                onClick={() => setSelectedConversation(conversation.other_user_id)}
              >
                <Avatar className="w-8 h-8 mr-3">
                  <AvatarImage src={conversation.other_user_profile.avatar_url} />
                  <AvatarFallback>
                    {conversation.other_user_profile.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      {conversation.other_user_profile.display_name || conversation.other_user_profile.username}
                    </span>
                    {conversation.unread_count > 0 && (
                      <Badge className="bg-primary text-primary-foreground text-xs">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {conversation.last_message.content}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(conversation.last_message.created_at), { 
                      addSuffix: true, 
                      locale: fr 
                    })}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="md:col-span-2">
        {selectedConversation && selectedProfile ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedProfile.avatar_url} />
                  <AvatarFallback>
                    {selectedProfile.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">
                    {selectedProfile.display_name || selectedProfile.username}
                  </h3>
                  <p className="text-sm text-muted-foreground">@{selectedProfile.username}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex flex-col h-full">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === user.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs opacity-70">
                          {formatDistanceToNow(new Date(message.created_at), { 
                            addSuffix: true, 
                            locale: fr 
                          })}
                        </span>
                        {message.sender_id === user.id && (
                          <CheckCircle2 
                            className={`w-3 h-3 ${message.is_read ? 'opacity-70' : 'opacity-40'}`} 
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Tapez votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 min-h-[60px] max-h-32"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    size="sm"
                    className="self-end"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="pt-6 text-center h-full flex items-center justify-center">
            <div>
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Sélectionnez une conversation pour commencer</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};