import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Users, Send, Pin, Clock, AlertTriangle } from 'lucide-react';

interface ChatMessage {
  id: string;
  user: {
    name: string;
    avatar?: string;
    role: string;
  };
  message: string;
  timestamp: string;
  isPinned?: boolean;
  isAnnouncement?: boolean;
  replies?: ChatMessage[];
}

interface ChatChannel {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  lastActivity: string;
  isPrivate?: boolean;
}

export const VillageChat: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [newMessage, setNewMessage] = useState('');

  // Demo data
  const channels: ChatChannel[] = [
    {
      id: 'general',
      name: 'General Discussion',
      description: 'Main village chat for all residents',
      memberCount: 234,
      lastActivity: '2 minutes ago'
    },
    {
      id: 'announcements',
      name: 'Announcements',
      description: 'Official village announcements',
      memberCount: 456,
      lastActivity: '1 hour ago'
    },
    {
      id: 'development',
      name: 'Development Projects',
      description: 'Discuss village development initiatives',
      memberCount: 89,
      lastActivity: '30 minutes ago'
    },
    {
      id: 'events',
      name: 'Events & Festivals',
      description: 'Plan and discuss village events',
      memberCount: 123,
      lastActivity: '15 minutes ago'
    },
    {
      id: 'marketplace',
      name: 'Village Marketplace',
      description: 'Buy, sell, and trade within the village',
      memberCount: 178,
      lastActivity: '5 minutes ago'
    }
  ];

  const messages: Record<string, ChatMessage[]> = {
    general: [
      {
        id: '1',
        user: { name: 'Chief Mballa', avatar: '', role: 'Village Chief' },
        message: 'Good morning everyone! The water project meeting is scheduled for tomorrow at 2 PM.',
        timestamp: '2 hours ago',
        isPinned: true,
        isAnnouncement: true
      },
      {
        id: '2',
        user: { name: 'Marie Nkomo', avatar: '', role: 'Community Leader' },
        message: 'Thank you Chief! Will this be at the community center?',
        timestamp: '1 hour ago'
      },
      {
        id: '3',
        user: { name: 'Paul Essomba', avatar: '', role: 'Resident' },
        message: 'Yes, looking forward to this. We really need better water access.',
        timestamp: '45 minutes ago'
      },
      {
        id: '4',
        user: { name: 'Grace Fotso', avatar: '', role: 'Teacher' },
        message: 'The school children will benefit greatly from this project.',
        timestamp: '30 minutes ago'
      }
    ],
    announcements: [
      {
        id: '5',
        user: { name: 'Village Administration', avatar: '', role: 'Official' },
        message: 'New health clinic construction begins next month. Government funding approved!',
        timestamp: '1 day ago',
        isPinned: true,
        isAnnouncement: true
      }
    ],
    development: [
      {
        id: '6',
        user: { name: 'Engineer Kamga', avatar: '', role: 'Project Manager' },
        message: 'Solar panel installation is 60% complete. Should be finished by end of month.',
        timestamp: '3 hours ago'
      }
    ]
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    // In a real app, this would send the message to the backend
    setNewMessage('');
  };

  const currentMessages = messages[selectedChannel] || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center mb-2">
          <MessageCircle className="h-6 w-6 mr-2 text-primary" />
          Village Chat
        </h2>
        <p className="text-muted-foreground">Connect with your community members</p>
      </div>

      <Tabs value={selectedChannel} onValueChange={setSelectedChannel} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          {channels.map((channel) => (
            <TabsTrigger key={channel.id} value={channel.id} className="text-xs">
              {channel.name.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {channels.map((channel) => (
          <TabsContent key={channel.id} value={channel.id}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Channel Info */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">{channel.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{channel.description}</p>
                    
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{channel.memberCount} members</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Last activity: {channel.lastActivity}</span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Online Now</h4>
                      <div className="space-y-2">
                        {['Chief Mballa', 'Marie Nkomo', 'Paul Essomba'].map((user) => (
                          <div key={user} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm">{user}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chat Messages */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        {channel.name}
                      </CardTitle>
                      <Badge variant="secondary">{currentMessages.length} messages</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96 w-full pr-4">
                      <div className="space-y-4">
                        {currentMessages.map((message) => (
                          <div key={message.id} className="flex space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={message.user.avatar} />
                              <AvatarFallback>
                                {message.user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="text-sm font-medium">{message.user.name}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {message.user.role}
                                </Badge>
                                {message.isPinned && (
                                  <Pin className="h-3 w-3 text-primary" />
                                )}
                                {message.isAnnouncement && (
                                  <AlertTriangle className="h-3 w-3 text-orange-500" />
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {message.timestamp}
                                </span>
                              </div>
                              
                              <div className={`p-3 rounded-lg ${
                                message.isAnnouncement 
                                  ? 'bg-orange-50 border border-orange-200' 
                                  : 'bg-muted'
                              }`}>
                                <p className="text-sm">{message.message}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="flex space-x-2 mt-4">
                      <Input
                        placeholder={`Message ${channel.name}...`}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={handleSendMessage} size="sm">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};