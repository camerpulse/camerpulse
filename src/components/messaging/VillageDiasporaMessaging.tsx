import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, MoreVertical, Search, Paperclip, Smile, Users, Globe, Heart, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderLocation: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'voice' | 'video' | 'translation';
  isRead: boolean;
  originalLanguage?: string;
  translatedContent?: string;
}

interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'community' | 'emergency';
  title: string;
  participants: string[];
  lastMessage: Message;
  unreadCount: number;
  avatar?: string;
  description?: string;
  language?: string;
  location?: string;
  isOnline?: boolean;
}

interface CommunityChannel {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  type: 'village_updates' | 'diaspora_news' | 'cultural_exchange' | 'business' | 'emergency';
  isPrivate: boolean;
  lastActivity: string;
}

const SAMPLE_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    type: 'direct',
    title: 'Mama Josephine',
    participants: ['village-elder', 'diaspora-user'],
    lastMessage: {
      id: 'm1',
      senderId: 'village-elder',
      senderName: 'Mama Josephine',
      senderLocation: 'Yaoundé, Cameroon',
      content: 'My child, thank you for the money you sent for the health center. The whole village is grateful! 🙏',
      timestamp: '2025-01-27T10:30:00Z',
      type: 'text',
      isRead: false
    },
    unreadCount: 2,
    avatar: 'https://images.unsplash.com/photo-1491349174775-aaafddd81942?w=100',
    location: 'Yaoundé Village',
    isOnline: true
  },
  {
    id: '2',
    type: 'group',
    title: 'Yaoundé Development Committee',
    participants: ['member1', 'member2', 'member3', 'diaspora-user'],
    lastMessage: {
      id: 'm2',
      senderId: 'member2',
      senderName: 'Jean-Claude Mbarga',
      senderLocation: 'Montreal, Canada',
      content: 'I can help with the solar panel project. Let me connect you with suppliers in Canada.',
      timestamp: '2025-01-27T09:15:00Z',
      type: 'text',
      isRead: true
    },
    unreadCount: 0,
    description: 'Village development discussions and project planning',
    language: 'French/English'
  },
  {
    id: '3',
    type: 'community',
    title: 'Village Emergency Network',
    participants: ['emergency-contacts'],
    lastMessage: {
      id: 'm3',
      senderId: 'emergency-coordinator',
      senderName: 'Dr. Sarah Nkomo',
      senderLocation: 'Yaoundé Health Center',
      content: '[EMERGENCY] Need urgent medical supplies for flood victims. Diaspora support needed.',
      timestamp: '2025-01-27T08:45:00Z',
      type: 'text',
      isRead: false
    },
    unreadCount: 1
  }
];

const SAMPLE_CHANNELS: CommunityChannel[] = [
  {
    id: '1',
    name: 'Village News & Updates',
    description: 'Daily news and important announcements from the village',
    memberCount: 245,
    type: 'village_updates',
    isPrivate: false,
    lastActivity: '2 hours ago'
  },
  {
    id: '2',
    name: 'Diaspora Success Stories',
    description: 'Share achievements and inspire others in the diaspora',
    memberCount: 189,
    type: 'diaspora_news',
    isPrivate: false,
    lastActivity: '1 hour ago'
  },
  {
    id: '3',
    name: 'Cultural Exchange Hub',
    description: 'Share traditions, recipes, and cultural practices',
    memberCount: 156,
    type: 'cultural_exchange',
    isPrivate: false,
    lastActivity: '30 minutes ago'
  },
  {
    id: '4',
    name: 'Business & Investment',
    description: 'Opportunities and partnerships between village and diaspora',
    memberCount: 98,
    type: 'business',
    isPrivate: true,
    lastActivity: '4 hours ago'
  }
];

const SAMPLE_MESSAGES: Message[] = [
  {
    id: '1',
    senderId: 'village-elder',
    senderName: 'Mama Josephine',
    senderLocation: 'Yaoundé, Cameroon',
    content: 'Good morning my child! How are you doing in Canada? We miss you so much here in the village.',
    timestamp: '2025-01-27T08:00:00Z',
    type: 'text',
    isRead: true
  },
  {
    id: '2',
    senderId: 'diaspora-user',
    senderName: 'You',
    senderLocation: 'Toronto, Canada',
    content: 'Good morning Mama! I am doing well. I just sent some money for the health center project. How is the construction going?',
    timestamp: '2025-01-27T08:15:00Z',
    type: 'text',
    isRead: true
  },
  {
    id: '3',
    senderId: 'village-elder',
    senderName: 'Mama Josephine',
    senderLocation: 'Yaoundé, Cameroon',
    content: 'Oh my child, you are so generous! The construction is going very well. Let me send you some photos.',
    timestamp: '2025-01-27T08:30:00Z',
    type: 'text',
    isRead: true
  },
  {
    id: '4',
    senderId: 'village-elder',
    senderName: 'Mama Josephine',
    senderLocation: 'Yaoundé, Cameroon',
    content: 'My child, thank you for the money you sent for the health center. The whole village is grateful! 🙏',
    timestamp: '2025-01-27T10:30:00Z',
    type: 'text',
    isRead: false
  }
];

export const VillageDiasporaMessaging: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string>('1');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Here you would implement the actual message sending logic
      console.log('Sending message:', messageInput);
      setMessageInput('');
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'village_updates': return <MessageCircle className="h-4 w-4" />;
      case 'diaspora_news': return <Globe className="h-4 w-4" />;
      case 'cultural_exchange': return <Heart className="h-4 w-4" />;
      case 'business': return <Users className="h-4 w-4" />;
      case 'emergency': return <Phone className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const currentConversation = SAMPLE_CONVERSATIONS.find(c => c.id === selectedConversation);

  return (
    <div className="h-[800px] flex bg-background border rounded-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-3">Village-Diaspora Connect</h2>
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

        <Tabs defaultValue="conversations" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mx-4 mt-2">
            <TabsTrigger value="conversations">Chats</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
          </TabsList>

          <TabsContent value="conversations" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-1 p-2">
                {SAMPLE_CONVERSATIONS.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-muted ${
                      selectedConversation === conversation.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={conversation.avatar} />
                          <AvatarFallback>
                            {conversation.title.split(' ').map(word => word[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate">{conversation.title}</h4>
                          <div className="flex items-center gap-2">
                            {conversation.type === 'emergency' && (
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatTime(conversation.lastMessage.timestamp)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage.content}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">
                            {conversation.location || conversation.description}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs px-2 py-0">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="channels" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-2 p-2">
                {SAMPLE_CHANNELS.map((channel) => (
                  <div
                    key={channel.id}
                    className="p-3 rounded-lg cursor-pointer transition-all hover:bg-muted"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getChannelIcon(channel.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{channel.name}</h4>
                          {channel.isPrivate && (
                            <Badge variant="outline" className="text-xs">Private</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{channel.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {channel.memberCount} members
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {channel.lastActivity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={currentConversation.avatar} />
                  <AvatarFallback>
                    {currentConversation.title.split(' ').map(word => word[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{currentConversation.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentConversation.isOnline ? 'Online' : 'Last seen 2 hours ago'} • {currentConversation.location}
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
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {SAMPLE_MESSAGES.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === 'diaspora-user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === 'diaspora-user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {message.senderId !== 'diaspora-user' && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">{message.senderName}</span>
                          <span className="text-xs opacity-70">{message.senderLocation}</span>
                        </div>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-end mt-1">
                        <span className="text-xs opacity-70">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="pr-10"
                  />
                  <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <Globe className="h-3 w-3" />
                <span>Auto-translation enabled (French ⟷ English)</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">Choose a chat or channel to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};