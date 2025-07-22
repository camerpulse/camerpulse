import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EmailPreferences {
  senator_claim_notifications: boolean;
  senator_report_notifications: boolean;
  senator_message_notifications: boolean;
  general_notifications: boolean;
  email_frequency: 'immediate' | 'daily' | 'weekly';
}

export interface NotificationData {
  type: 'senator_claim' | 'senator_report' | 'senator_message' | 'general';
  recipientEmail: string;
  recipientUserId?: string;
  recipientName?: string;
  data: {
    senatorName?: string;
    senatorId?: string;
    claimType?: string;
    reportType?: string;
    messageSubject?: string;
    messageContent?: string;
    actionUrl?: string;
    status?: string;
    [key: string]: any;
  };
}

export const useEmailNotifications = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Send email notification
  const sendNotification = async (notificationData: NotificationData): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Call the edge function to send email
      const { data, error } = await supabase.functions.invoke('send-senator-notifications', {
        body: notificationData
      });

      if (error) throw error;

      console.log('Email notification sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Error sending email notification:', error);
      toast({
        title: "Email Notification Failed",
        description: "Failed to send email notification. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get user's email preferences (placeholder since table doesn't exist)
  const getEmailPreferences = async (userId: string): Promise<EmailPreferences | null> => {
    try {
      // Return default preferences since table doesn't exist yet
      return {
        senator_claim_notifications: true,
        senator_report_notifications: true,
        senator_message_notifications: true,
        general_notifications: true,
        email_frequency: 'immediate'
      };
    } catch (error) {
      console.error('Error fetching email preferences:', error);
      return null;
    }
  };

  // Update user's email preferences (placeholder)
  const updateEmailPreferences = async (
    userId: string, 
    preferences: Partial<EmailPreferences>
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      // TODO: Implement when senator_email_preferences table is created
      toast({
        title: "Preferences Updated",
        description: "Your email notification preferences have been updated."
      });

      return true;
    } catch (error) {
      console.error('Error updating email preferences:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update email preferences.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get notification history for a user (placeholder)
  const getNotificationHistory = async (userId: string) => {
    try {
      // Return empty array since table doesn't exist yet
      return [];
    } catch (error) {
      console.error('Error fetching notification history:', error);
      return [];
    }
  };

  // Convenience functions for specific notification types
  const sendClaimNotification = async (
    recipientEmail: string,
    senatorName: string,
    claimType: string,
    status: string,
    recipientUserId?: string,
    recipientName?: string,
    adminNotes?: string,
    actionUrl?: string
  ) => {
    return sendNotification({
      type: 'senator_claim',
      recipientEmail,
      recipientUserId,
      recipientName,
      data: {
        senatorName,
        claimType,
        status,
        adminNotes,
        actionUrl
      }
    });
  };

  const sendReportNotification = async (
    recipientEmail: string,
    senatorName: string,
    reportType: string,
    reportCategory: string,
    description: string,
    severity: string,
    recipientUserId?: string,
    recipientName?: string,
    actionUrl?: string
  ) => {
    return sendNotification({
      type: 'senator_report',
      recipientEmail,
      recipientUserId,
      recipientName,
      data: {
        senatorName,
        reportType,
        reportCategory,
        description,
        severity,
        actionUrl
      }
    });
  };

  const sendMessageNotification = async (
    recipientEmail: string,
    messageSubject: string,
    messageContent: string,
    messageType: string,
    priority: string,
    recipientUserId?: string,
    recipientName?: string,
    actionUrl?: string
  ) => {
    return sendNotification({
      type: 'senator_message',
      recipientEmail,
      recipientUserId,
      recipientName,
      data: {
        messageSubject,
        messageContent,
        messageType,
        priority,
        actionUrl
      }
    });
  };

  return {
    sendNotification,
    sendClaimNotification,
    sendReportNotification,
    sendMessageNotification,
    getEmailPreferences,
    updateEmailPreferences,
    getNotificationHistory,
    isLoading
  };
};