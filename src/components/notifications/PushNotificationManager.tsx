import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PushNotificationManagerProps {
  onTokenRegistered?: (token: string) => void;
}

export const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({
  onTokenRegistered
}) => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    // Check if Push API is supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (isSupported && permission === 'granted' && user) {
      registerPushToken();
    }
  }, [isSupported, permission, user]);

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error('Push notifications are not supported in this browser');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Push notifications enabled');
        await registerPushToken();
      } else {
        toast.error('Push notifications permission denied');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to request notification permission');
    }
  };

  const registerPushToken = async () => {
    if (!user || isRegistering) return;

    try {
      setIsRegistering(true);

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Get push subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(
          // You'll need to replace this with your VAPID public key
          'BDd3_hVL9fNUMM7h2cHWHBIU7hpODdCVIDJjtqWOqhq5G9N7hJfGGQ-8nFKHPfUEJm3_jJf4nGdAVbSwk3o7CqM'
        )
      });

      // Store token in database
      const { error } = await supabase
        .from('user_push_tokens')
        .upsert({
          user_id: user.id,
          token: JSON.stringify(subscription),
          platform: 'web',
          is_active: true
        });

      if (error) throw error;

      onTokenRegistered?.(JSON.stringify(subscription));
      console.log('Push token registered successfully');

    } catch (error) {
      console.error('Error registering push token:', error);
      toast.error('Failed to register for push notifications');
    } finally {
      setIsRegistering(false);
    }
  };

  const urlB64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  if (!isSupported) {
    return null;
  }

  if (permission === 'default') {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 mb-2">
          Enable push notifications to receive real-time updates
        </p>
        <button
          onClick={requestPermission}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          disabled={isRegistering}
        >
          {isRegistering ? 'Setting up...' : 'Enable Notifications'}
        </button>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          Push notifications are disabled. You can enable them in your browser settings.
        </p>
      </div>
    );
  }

  return null;
};