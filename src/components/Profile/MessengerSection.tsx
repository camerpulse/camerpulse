import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Users, 
  Clock, 
  Send, 
  Archive,
  Settings,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMessenger } from '@/hooks/useMessenger';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export const MessengerSection: React.FC = () => {
  const { user } = useAuth();
  const { conversations, unreadCount } = useMessenger();

  // Get recent conversations (last 3)
  const recentConversations = conversations.slice(0, 3);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="bg-gradient-to-br from-card to-muted/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <MessageSquare className="h-5 w-5 text-primary" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center bg-destructive">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg">Pulse Messenger</CardTitle>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/messenger">
              <MessageSquare className="h-4 w-4 mr-2" />
              Open
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-primary/5">
            <div className="text-2xl font-bold text-primary">{conversations.length}</div>
            <div className="text-xs text-muted-foreground">Conversations</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/5">
            <div className="text-2xl font-bold text-secondary">{unreadCount}</div>
            <div className="text-xs text-muted-foreground">Unread</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-accent/5">
            <div className="text-2xl font-bold text-accent-foreground">24h</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Recent Conversations
          </h4>
          
          {recentConversations.length > 0 ? (
            <div className="space-y-2">
              {recentConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {conversation.is_group ? (
                        <Users className="h-4 w-4" />
                      ) : (
                        conversation.title.substring(0, 2).toUpperCase()
                      )}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">
                        {conversation.title}
                      </p>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(conversation.last_message_at)}
                        </span>
                        {conversation.unread_count && conversation.unread_count > 0 && (
                          <Badge variant="destructive" className="h-4 w-4 p-0 text-xs">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {conversation.description || (conversation.is_group ? 'Group conversation' : 'Direct message')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
              <Button asChild variant="outline" size="sm" className="mt-2">
                <Link to="/messenger">
                  <Send className="h-4 w-4 mr-2" />
                  Start messaging
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-2 pt-2 border-t">
          <Button asChild variant="ghost" size="sm" className="flex-1">
            <Link to="/messenger">
              <Send className="h-4 w-4 mr-2" />
              New Chat
            </Link>
          </Button>
          <Button variant="ghost" size="sm">
            <Archive className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};