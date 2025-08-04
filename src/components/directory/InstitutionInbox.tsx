import { useState, useEffect } from 'react';
import { Send, Mail, AlertCircle, CheckCircle, Clock, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { InstitutionMessage } from '@/types/directory';

interface InstitutionInboxProps {
  institutionId: string;
  institutionName: string;
}

export const InstitutionInbox = ({ institutionId, institutionName }: InstitutionInboxProps) => {
  const [messages, setMessages] = useState<InstitutionMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<InstitutionMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<InstitutionMessage | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [messageFilter, setMessageFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, [institutionId]);

  useEffect(() => {
    filterMessages();
  }, [messages, messageFilter, typeFilter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      // Use type assertion since table is not in generated types yet
      const { data, error } = await supabase
        .from('institution_messages' as any)
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages((data as unknown as InstitutionMessage[]) || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterMessages = () => {
    let filtered = messages;

    if (messageFilter !== 'all') {
      filtered = filtered.filter(message => {
        switch (messageFilter) {
          case 'unread':
            return !message.is_read;
          case 'replied':
            return message.replied_at !== null;
          case 'unreplied':
            return message.replied_at === null;
          default:
            return true;
        }
      });
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(message => message.message_type === typeFilter);
    }

    setFilteredMessages(filtered);
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('institution_messages' as any)
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const sendReply = async () => {
    if (!selectedMessage || !replyContent.trim()) return;

    try {
      setIsReplying(true);
      const { error } = await supabase
        .from('institution_messages' as any)
        .update({
          reply_content: replyContent.trim(),
          replied_at: new Date().toISOString(),
        })
        .eq('id', selectedMessage.id);

      if (error) throw error;

      toast({
        title: "Reply Sent",
        description: "Your reply has been sent successfully",
      });

      setMessages(prev => prev.map(msg => 
        msg.id === selectedMessage.id 
          ? { ...msg, reply_content: replyContent.trim(), replied_at: new Date().toISOString() }
          : msg
      ));

      setSelectedMessage(null);
      setReplyContent('');
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Reply Failed",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsReplying(false);
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'support':
        return <Mail className="h-4 w-4 text-blue-500" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMessageBadge = (message: InstitutionMessage) => {
    if (!message.is_read) {
      return <Badge variant="destructive">New</Badge>;
    }
    if (message.replied_at) {
      return <Badge variant="default">Replied</Badge>;
    }
    return <Badge variant="secondary">Read</Badge>;
  };

  const getSenderTypeBadge = (type: string) => {
    switch (type) {
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>;
      case 'moderator':
        return <Badge variant="default">Moderator</Badge>;
      default:
        return <Badge variant="outline">User</Badge>;
    }
  };

  const getUnreadCount = () => messages.filter(msg => !msg.is_read).length;
  const getUrgentCount = () => messages.filter(msg => msg.message_type === 'urgent' && !msg.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{messages.length}</p>
                <p className="text-sm text-muted-foreground">Total Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{getUnreadCount()}</p>
                <p className="text-sm text-muted-foreground">Unread</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{getUrgentCount()}</p>
                <p className="text-sm text-muted-foreground">Urgent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Messages for {institutionName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Filter by Status</Label>
              <Select value={messageFilter} onValueChange={setMessageFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="unreplied">Needs Reply</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label>Filter by Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No messages found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((message) => (
            <Card 
              key={message.id} 
              className={`transition-all hover:shadow-md cursor-pointer ${
                !message.is_read ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => {
                setSelectedMessage(message);
                if (!message.is_read) {
                  markAsRead(message.id);
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getMessageIcon(message.message_type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{message.subject}</h4>
                        {getSenderTypeBadge(message.sender_type)}
                        {getMessageBadge(message)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        From: {message.sender_name}
                      </p>
                      <p className="text-sm line-clamp-2">{message.message_content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(message.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getMessageIcon(selectedMessage.message_type)}
                  {selectedMessage.subject}
                </DialogTitle>
                <DialogDescription>
                  From {selectedMessage.sender_name} • {new Date(selectedMessage.created_at).toLocaleString()}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  {getSenderTypeBadge(selectedMessage.sender_type)}
                  {getMessageBadge(selectedMessage)}
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedMessage.message_content}</p>
                </div>

                {selectedMessage.reply_content && (
                  <div>
                    <h4 className="font-semibold mb-2">Your Reply:</h4>
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <p className="whitespace-pre-wrap">{selectedMessage.reply_content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Sent: {new Date(selectedMessage.replied_at!).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {!selectedMessage.reply_content && (
                  <div className="space-y-3">
                    <Label>Reply to this message:</Label>
                    <Textarea
                      placeholder="Type your reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={sendReply} 
                        disabled={isReplying || !replyContent.trim()}
                        className="gap-2"
                      >
                        <Send className="h-4 w-4" />
                        {isReplying ? 'Sending...' : 'Send Reply'}
                      </Button>
                      <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};