import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Paperclip,
  Smile,
  Phone,
  VideoIcon,
  MoreVertical,
  CheckCheck,
  Clock,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
}

interface MessagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  recipientType: 'politician' | 'senator' | 'mp' | 'minister';
}

export const MessagingModal: React.FC<MessagingModalProps> = ({
  isOpen,
  onClose,
  recipientId,
  recipientName,
  recipientType
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const loadMessages = async () => {
    if (!user) return;

    try {
      // For demo purposes, we'll create some sample messages
      // In production, this would fetch from a real messages table
      const sampleMessages: Message[] = [
        {
          id: '1',
          content: `Hello ${recipientName}, I hope this message finds you well. I wanted to reach out regarding...`,
          sender_id: user.id,
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          is_read: true
        },
        {
          id: '2',
          content: 'Thank you for your message. I appreciate your interest in civic engagement. I will review your concerns and get back to you soon.',
          sender_id: recipientId,
          created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          is_read: false
        }
      ];
      
      setMessages(sampleMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !user) return;

    setLoading(true);
    try {
      // For demo purposes, we'll add the message locally
      // In production, this would save to the database
      const newMessage: Message = {
        id: Date.now().toString(),
        content: message.trim(),
        sender_id: user.id,
        created_at: new Date().toISOString(),
        is_read: false
      };

      setMessages(prev => [...prev, newMessage]);
      setMessage('');

      toast({
        title: "Message Sent",
        description: `Your message has been sent to ${recipientName}`,
      });

      // Scroll to bottom
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      }, 100);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMessages();
    }
  }, [isOpen]);

  if (!user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg h-[600px] flex flex-col p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" alt={recipientName} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(recipientName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">{recipientName}</h3>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  {recipientType.charAt(0).toUpperCase() + recipientType.slice(1)}
                </Badge>
                <span className="text-xs text-green-600">● Online</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <VideoIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.sender_id === user.id ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[70%] rounded-lg px-3 py-2 text-sm",
                      msg.sender_id === user.id
                        ? "bg-green-600 text-white"
                        : "bg-muted text-foreground"
                    )}
                  >
                    <p>{msg.content}</p>
                    <div
                      className={cn(
                        "flex items-center justify-end mt-1 space-x-1 text-xs",
                        msg.sender_id === user.id
                          ? "text-green-100"
                          : "text-muted-foreground"
                      )}
                    >
                      <span>
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {msg.sender_id === user.id && (
                        <div>
                          {msg.is_read ? (
                            <CheckCheck className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex items-end space-x-2">
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder={`Message ${recipientName}...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[40px] max-h-[120px] resize-none"
                rows={1}
              />
            </div>
            
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                <Smile className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={sendMessage}
                disabled={!message.trim() || loading}
                className="bg-green-600 hover:bg-green-700 text-white h-10 w-10 p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2">
            Messages are encrypted and secure. Response time may vary.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};