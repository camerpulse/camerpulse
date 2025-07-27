import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ProductUpdate {
  id: string;
  title: string;
  price: number;
  stock_quantity: number;
  updated_at: string;
}

interface VendorPresence {
  vendor_id: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  last_seen: string;
}

interface InventoryAlert {
  id: string;
  product_id: string;
  vendor_id: string;
  alert_type: 'low_stock' | 'out_of_stock' | 'restock' | 'price_change';
  message: string;
  current_value: number;
}

interface RealtimeNotification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data: any;
  created_at: string;
  read_at?: string;
}

export const useRealtimeUpdates = (userId?: string) => {
  const [productUpdates, setProductUpdates] = useState<ProductUpdate[]>([]);
  const [vendorPresence, setVendorPresence] = useState<Map<string, VendorPresence>>(new Map());
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [channels, setChannels] = useState<RealtimeChannel[]>([]);

  useEffect(() => {
    if (!userId) return;

    const channelList: RealtimeChannel[] = [];

    // Products real-time updates
    const productsChannel = supabase
      .channel('marketplace-products')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marketplace_products'
        },
        (payload) => {
          const product = payload.new as ProductUpdate;
          
          if (payload.eventType === 'UPDATE') {
            setProductUpdates(prev => {
              const filtered = prev.filter(p => p.id !== product.id);
              return [...filtered, product].slice(-20); // Keep last 20 updates
            });
          }
        }
      )
      .subscribe();

    // Vendor presence updates
    const presenceChannel = supabase
      .channel('vendor-presence')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vendor_presence'
        },
        (payload) => {
          const presence = payload.new as VendorPresence;
          
          setVendorPresence(prev => {
            const newMap = new Map(prev);
            if (payload.eventType === 'DELETE') {
              newMap.delete(presence.vendor_id);
            } else {
              newMap.set(presence.vendor_id, presence);
            }
            return newMap;
          });
        }
      )
      .subscribe();

    // Inventory alerts
    const inventoryChannel = supabase
      .channel('inventory-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'inventory_alerts'
        },
        (payload) => {
          const alert = payload.new as InventoryAlert;
          setInventoryAlerts(prev => [alert, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    // User notifications
    const notificationsChannel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'realtime_notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const notification = payload.new as RealtimeNotification;
          setNotifications(prev => [notification, ...prev].slice(0, 100));
        }
      )
      .subscribe();

    channelList.push(productsChannel, presenceChannel, inventoryChannel, notificationsChannel);
    setChannels(channelList);

    return () => {
      channelList.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [userId]);

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('realtime_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const updateVendorStatus = async (vendorId: string, status: VendorPresence['status']) => {
    try {
      await supabase.rpc('update_vendor_presence', {
        p_vendor_id: vendorId,
        p_status: status,
        p_device_info: {
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error updating vendor status:', error);
    }
  };

  return {
    productUpdates,
    vendorPresence,
    inventoryAlerts,
    notifications: notifications.filter(n => !n.read_at),
    allNotifications: notifications,
    markNotificationAsRead,
    updateVendorStatus,
    isConnected: channels.length > 0
  };
};

export const useVendorPresence = (vendorId?: string) => {
  const [status, setStatus] = useState<VendorPresence['status']>('offline');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!vendorId) return;

    const updateStatus = async (newStatus: VendorPresence['status']) => {
      try {
        await supabase.rpc('update_vendor_presence', {
          p_vendor_id: vendorId,
          p_status: newStatus
        });
        setStatus(newStatus);
      } catch (error) {
        console.error('Error updating vendor presence:', error);
      }
    };

    // Set initial status
    updateStatus(isOnline ? 'online' : 'offline');

    // Update status based on online/offline
    if (isOnline && status === 'offline') {
      updateStatus('online');
    } else if (!isOnline) {
      updateStatus('offline');
    }

    // Heartbeat to keep presence alive
    const heartbeat = setInterval(() => {
      if (isOnline && status !== 'offline') {
        updateStatus(status);
      }
    }, 30000); // Every 30 seconds

    // Clean up on unmount
    return () => {
      clearInterval(heartbeat);
      updateStatus('offline');
    };
  }, [vendorId, isOnline, status]);

  const setVendorStatus = async (newStatus: VendorPresence['status']) => {
    if (!vendorId) return;
    
    try {
      await supabase.rpc('update_vendor_presence', {
        p_vendor_id: vendorId,
        p_status: newStatus
      });
      setStatus(newStatus);
    } catch (error) {
      console.error('Error setting vendor status:', error);
    }
  };

  return {
    status,
    setStatus: setVendorStatus,
    isOnline
  };
};
