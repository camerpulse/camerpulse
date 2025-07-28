import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface NotificationTemplate {
  id: string;
  template_name: string;
  channel: string;
  subject: string;
  content: string;
  variables: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduledNotification {
  id: string;
  user_id: string;
  template_id?: string;
  title: string;
  message: string;
  notification_type: string;
  priority: string;
  data: any;
  action_url?: string;
  icon?: string;
  target_regions?: string[];
  scheduled_for: string;
  status: string;
  sent_at?: string;
  error_message?: string;
  retry_count: number;
  max_retries: number;
}

export interface NotificationAttachment {
  id: string;
  notification_id: string;
  attachment_type: string;
  file_url: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  thumbnail_url?: string;
  metadata: any;
}

export interface NotificationAction {
  id: string;
  notification_id: string;
  action_type: string;
  label: string;
  action_url?: string;
  action_data: any;
  style: string;
  is_primary: boolean;
}

export const useAdvancedNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch notification templates
  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('is_active', true)
        .order('template_name', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load notification templates",
        variant: "destructive"
      });
    }
  };

  // Fetch scheduled notifications for user
  const fetchScheduledNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('scheduled_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      setScheduledNotifications(data || []);
    } catch (error) {
      console.error('Error fetching scheduled notifications:', error);
    }
  };

  // Create rich notification with template
  const createFromTemplate = async (
    templateId: string,
    variables: Record<string, any> = {},
    scheduledFor?: Date
  ) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create notifications",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Process template variables
      let title = template.subject;
      let message = template.content;
      
      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        title = title.replace(new RegExp(placeholder, 'g'), value);
        message = message.replace(new RegExp(placeholder, 'g'), value);
      });

      const notificationData = {
        user_id: user.id,
        template_id: templateId,
        title,
        message,
        notification_type: template.channel,
        priority: 'moderate',
        data: { ...variables },
        created_by: user.id
      };

      if (scheduledFor) {
        // Schedule notification
        const { error } = await supabase
          .from('scheduled_notifications')
          .insert({
            ...notificationData,
            scheduled_for: scheduledFor.toISOString()
          });

        if (error) throw error;
        
        toast({
          title: "Notification scheduled",
          description: `Notification will be sent on ${scheduledFor.toLocaleDateString()}`,
        });
        
        await fetchScheduledNotifications();
      } else {
        // Send immediately
        const { error } = await supabase
          .from('notifications')
          .insert({
            user_id: notificationData.user_id,
            type: notificationData.notification_type,
            title: notificationData.title,
            message: notificationData.message,
            data: notificationData.data
          });

        if (error) throw error;
        
        toast({
          title: "Notification sent",
          description: "Your notification has been delivered",
        });
      }

      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      toast({
        title: "Error",
        description: "Failed to create notification",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Schedule notification
  const scheduleNotification = async (
    notification: Omit<ScheduledNotification, 'id' | 'user_id' | 'created_by' | 'retry_count' | 'status'>,
    scheduledFor: Date
  ) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('scheduled_notifications')
        .insert({
          ...notification,
          user_id: user.id,
          created_by: user.id,
          scheduled_for: scheduledFor.toISOString(),
          status: 'pending',
          retry_count: 0
        });

      if (error) throw error;

      toast({
        title: "Notification scheduled",
        description: `Notification will be sent on ${scheduledFor.toLocaleDateString()}`,
      });

      await fetchScheduledNotifications();
      return true;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      toast({
        title: "Error",
        description: "Failed to schedule notification",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cancel scheduled notification
  const cancelScheduledNotification = async (notificationId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('scheduled_notifications')
        .update({ status: 'cancelled' })
        .eq('id', notificationId);

      if (error) throw error;

      toast({
        title: "Notification cancelled",
        description: "The scheduled notification has been cancelled",
      });

      await fetchScheduledNotifications();
      return true;
    } catch (error) {
      console.error('Error cancelling notification:', error);
      toast({
        title: "Error",
        description: "Failed to cancel notification",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Add attachment to notification
  const addAttachment = async (
    notificationId: string,
    attachment: Omit<NotificationAttachment, 'id' | 'notification_id'>
  ) => {
    try {
      const { error } = await supabase
        .from('notification_attachments')
        .insert({
          ...attachment,
          notification_id: notificationId
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding attachment:', error);
      return false;
    }
  };

  // Add action to notification
  const addAction = async (
    notificationId: string,
    action: Omit<NotificationAction, 'id' | 'notification_id'>
  ) => {
    try {
      const { error } = await supabase
        .from('notification_actions')
        .insert({
          ...action,
          notification_id: notificationId
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding action:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchTemplates();
    if (user) {
      fetchScheduledNotifications();
    }
  }, [user]);

  return {
    templates,
    scheduledNotifications,
    loading,
    createFromTemplate,
    scheduleNotification,
    cancelScheduledNotification,
    addAttachment,
    addAction,
    fetchTemplates,
    fetchScheduledNotifications
  };
};