import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface NotificationEvent {
  type: 'bid_submitted' | 'tender_updated' | 'deadline_warning' | 'award_announced' | 'system_alert';
  tenderId?: string;
  userId?: string;
  data: any;
  timestamp: string;
}

interface RealtimeMessage {
  type: 'notification' | 'tender_update' | 'user_notification' | 'connection_established' | 'subscribed' | 'authenticated' | 'pong';
  channel?: string;
  tenderId?: string;
  userId?: string;
  event?: NotificationEvent;
  connectionId?: string;
  timestamp: string;
}

interface RealtimeContextType {
  isConnected: boolean;
  lastMessage: RealtimeMessage | null;
  subscribeTo: (type: 'tender' | 'channel', id: string) => void;
  unsubscribeFrom: (type: 'tender' | 'channel', id: string) => void;
  sendMessage: (message: any) => void;
  connectionId: string | null;
  notifications: NotificationEvent[];
  clearNotifications: () => void;
  markAsRead: (index: number) => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<RealtimeMessage | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const maxReconnectAttempts = 5;

  const connectWebSocket = useCallback(() => {
    if (socket?.readyState === WebSocket.OPEN) {
      return;
    }

    console.log('Connecting to WebSocket...');
    
    const ws = new WebSocket('wss://wsiorhtiovwcajiarydw.functions.supabase.co/realtime-notifications');
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setReconnectAttempt(0);
      
      // Authenticate if user is logged in
      if (user) {
        ws.send(JSON.stringify({
          type: 'authenticate',
          userId: user.id
        }));
      }
      
      // Subscribe to public feed
      ws.send(JSON.stringify({
        type: 'subscribe_channel',
        channel: 'public_feed'
      }));
    };
    
    ws.onmessage = (event) => {
      try {
        const message: RealtimeMessage = JSON.parse(event.data);
        console.log('Received message:', message);
        setLastMessage(message);
        
        switch (message.type) {
          case 'connection_established':
            setConnectionId(message.connectionId || null);
            break;
            
          case 'notification':
          case 'tender_update':
          case 'user_notification':
            if (message.event) {
              setNotifications(prev => [message.event!, ...prev.slice(0, 49)]); // Keep last 50
              
              // Show toast notification
              const event = message.event;
              const title = getNotificationTitle(event);
              const description = getNotificationDescription(event);
              
              toast({
                title,
                description,
                duration: event.type === 'deadline_warning' ? 10000 : 5000,
              });
              
              // Browser notification if permission granted
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(title, {
                  body: description,
                  icon: '/icon-192.png',
                  badge: '/icon-192.png',
                  tag: `${event.type}-${event.tenderId || 'system'}`,
                });
              }
            }
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onclose = (event) => {
      console.log('WebSocket closed:', event);
      setIsConnected(false);
      setSocket(null);
      
      // Attempt to reconnect
      if (reconnectAttempt < maxReconnectAttempts) {
        const timeout = Math.pow(2, reconnectAttempt) * 1000; // Exponential backoff
        console.log(`Reconnecting in ${timeout}ms (attempt ${reconnectAttempt + 1})`);
        
        setTimeout(() => {
          setReconnectAttempt(prev => prev + 1);
          connectWebSocket();
        }, timeout);
      } else {
        console.error('Max reconnection attempts reached');
        toast({
          title: "Connection Lost",
          description: "Unable to maintain real-time connection. Please refresh the page.",
          variant: "destructive",
        });
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    setSocket(ws);
  }, [user, reconnectAttempt, toast]);

  const getNotificationTitle = (event: NotificationEvent): string => {
    switch (event.type) {
      case 'bid_submitted':
        return 'New Bid Submitted';
      case 'tender_updated':
        return 'Tender Updated';
      case 'deadline_warning':
        return 'Deadline Warning';
      case 'award_announced':
        return 'Award Announced';
      case 'system_alert':
        return 'System Alert';
      default:
        return 'Notification';
    }
  };

  const getNotificationDescription = (event: NotificationEvent): string => {
    switch (event.type) {
      case 'bid_submitted':
        return `${event.data.bidderName} submitted a bid of ${event.data.bidAmount} ${event.data.currency}`;
      case 'tender_updated':
        return `Tender status updated to: ${event.data.status}`;
      case 'deadline_warning':
        return event.data.message;
      case 'award_announced':
        return `Contract awarded to ${event.data.winnerName}`;
      case 'system_alert':
        return event.data.message;
      default:
        return 'You have a new notification';
    }
  };

  const subscribeTo = useCallback((type: 'tender' | 'channel', id: string) => {
    if (socket && isConnected) {
      const messageType = type === 'tender' ? 'subscribe_tender' : 'subscribe_channel';
      const payload = type === 'tender' ? { tenderId: id } : { channel: id };
      
      socket.send(JSON.stringify({
        type: messageType,
        ...payload
      }));
    }
  }, [socket, isConnected]);

  const unsubscribeFrom = useCallback((type: 'tender' | 'channel', id: string) => {
    if (socket && isConnected) {
      const messageType = type === 'tender' ? 'unsubscribe_tender' : 'unsubscribe_channel';
      const payload = type === 'tender' ? { tenderId: id } : { channel: id };
      
      socket.send(JSON.stringify({
        type: messageType,
        ...payload
      }));
    }
  }, [socket, isConnected]);

  const sendMessage = useCallback((message: any) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
    }
  }, [socket, isConnected]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markAsRead = useCallback((index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Connect WebSocket on mount
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  // Ping to keep connection alive
  useEffect(() => {
    if (isConnected && socket) {
      const pingInterval = setInterval(() => {
        socket.send(JSON.stringify({ type: 'ping' }));
      }, 30000); // Ping every 30 seconds
      
      return () => clearInterval(pingInterval);
    }
  }, [isConnected, socket]);

  const value: RealtimeContextType = {
    isConnected,
    lastMessage,
    subscribeTo,
    unsubscribeFrom,
    sendMessage,
    connectionId,
    notifications,
    clearNotifications,
    markAsRead
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};
