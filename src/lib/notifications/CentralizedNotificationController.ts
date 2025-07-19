import { supabase } from '@/integrations/supabase/client';

export interface NotificationEvent {
  event: string;
  payload: {
    user_id: string;
    recipient_type: 'artist' | 'fan' | 'admin';
    metadata: Record<string, any>;
  };
}

export interface NotificationChannel {
  type: 'email' | 'in_app' | 'push' | 'sms' | 'whatsapp';
  enabled: boolean;
  config?: Record<string, any>;
}

export interface NotificationTemplate {
  id: string;
  event_type: string;
  channel: string;
  subject?: string;
  content: string;
  variables: string[];
}

export interface NotificationFlow {
  id: string;
  event_type: string;
  recipient_type: string;
  channel: string;
  template_id: string;
  priority: number;
  delay_minutes?: number;
  condition_logic?: Record<string, any>;
  flow_name?: string;
  is_active: boolean;
}

class CentralizedNotificationController {
  private static instance: CentralizedNotificationController;
  private eventHandlers: Map<string, Function> = new Map();
  private realtimeChannel: any;

  private constructor() {
    this.initializeRealtimeChannel();
    this.registerEventHandlers();
  }

  public static getInstance(): CentralizedNotificationController {
    if (!CentralizedNotificationController.instance) {
      CentralizedNotificationController.instance = new CentralizedNotificationController();
    }
    return CentralizedNotificationController.instance;
  }

  private initializeRealtimeChannel() {
    this.realtimeChannel = supabase
      .channel('notification_events')
      .on('broadcast', { event: 'notification_trigger' }, (payload) => {
        this.handleNotificationEvent(payload.payload as NotificationEvent);
      })
      .subscribe();
  }

  private registerEventHandlers() {
    // Artist-related events
    this.eventHandlers.set('artist_submission', this.handleArtistSubmission);
    this.eventHandlers.set('artist_verified', this.handleArtistVerified);
    this.eventHandlers.set('artist_denied', this.handleArtistVerified); // Reuse verified handler
    this.eventHandlers.set('artist_new_follower', this.handleNewFollower);
    
    // Music-related events
    this.eventHandlers.set('song_uploaded', this.handleSongUploaded);
    this.eventHandlers.set('song_milestone', this.handleSongMilestone);
    
    // Event-related events
    this.eventHandlers.set('event_published', this.handleEventPublished);
    this.eventHandlers.set('ticket_purchased', this.handleTicketPurchased);
    this.eventHandlers.set('event_reminder', this.handleEventReminder);
    
    // Award-related events
    this.eventHandlers.set('award_nomination', this.handleAwardNomination);
    this.eventHandlers.set('award_win', this.handleAwardWin);
    this.eventHandlers.set('voting_opened', this.handleVotingOpened);
  }

  public async triggerNotification(event: NotificationEvent): Promise<void> {
    console.log(`Triggering notification for event: ${event.event}`);
    
    try {
      // Validate event structure
      this.validateEvent(event);
      
      // Get notification flows for this event
      const flows = await this.getNotificationFlows(event);
      
      // Process each flow
      for (const flow of flows) {
        await this.processNotificationFlow(event, flow);
      }
      
      // Broadcast to real-time listeners
      await this.broadcastEvent(event);
      
    } catch (error) {
      console.error('Error triggering notification:', error);
      throw error;
    }
  }

  private validateEvent(event: NotificationEvent): void {
    if (!event.event || !event.payload) {
      throw new Error('Invalid event structure');
    }
    
    if (!event.payload.user_id || !event.payload.recipient_type) {
      throw new Error('Missing required payload fields');
    }
    
    if (!['artist', 'fan', 'admin'].includes(event.payload.recipient_type)) {
      throw new Error('Invalid recipient type');
    }
  }

  private async getNotificationFlows(event: NotificationEvent): Promise<any[]> {
    const { data, error } = await supabase
      .from('notification_flows')
      .select(`
        *,
        notification_templates (*)
      `)
      .eq('event_type', this.mapEventToType(event.event) as any)
      .eq('recipient_type', event.payload.recipient_type)
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) {
      console.error('Error fetching notification flows:', error);
      return [];
    }

    return data || [];
  }

  private mapEventToType(event: string): string {
    const eventMap: Record<string, string> = {
      'artist_submission': 'artist_profile_submitted',
      'artist_verified': 'artist_verified',
      'artist_denied': 'artist_denied',
      'artist_new_follower': 'artist_new_follower',
      'song_uploaded': 'new_song_uploaded',
      'song_milestone': 'song_milestone_reached',
      'event_published': 'new_event_published',
      'ticket_purchased': 'ticket_purchased',
      'event_reminder': 'event_reminder_24h',
      'award_nomination': 'artist_award_nomination',
      'award_win': 'artist_award_win',
      'voting_opened': 'voting_opens',
    };

    return eventMap[event] || event;
  }

  private async processNotificationFlow(event: NotificationEvent, flow: any): Promise<void> {
    try {
      // Check user preferences
      const canSend = await this.checkUserPreferences(
        event.payload.user_id,
        flow.event_type,
        flow.channel
      );

      if (!canSend) {
        console.log(`User ${event.payload.user_id} has disabled ${flow.channel} for ${flow.event_type}`);
        return;
      }

      // Check flow conditions
      if (flow.condition_logic && !this.evaluateConditions(flow.condition_logic, event)) {
        console.log(`Flow conditions not met for ${flow.flow_name}`);
        return;
      }

      // Prepare template data
      const templateData = this.prepareTemplateData(event, flow);

      // Handle delay if specified
      if (flow.delay_minutes && flow.delay_minutes > 0) {
        await this.scheduleNotification(event, flow, templateData);
        return;
      }

      // Send notification immediately
      await this.sendNotification(event, flow, templateData);

    } catch (error) {
      console.error(`Error processing flow ${flow.id}:`, error);
    }
  }

  private async checkUserPreferences(userId: string, eventType: string, channel: string): Promise<boolean> {
    const { data } = await supabase
      .from('user_notification_preferences')
      .select('is_enabled')
      .eq('user_id', userId)
      .eq('event_type', eventType as any)
      .eq('channel', channel as any)
      .single();

    // Default to enabled if no preference set
    return data?.is_enabled !== false;
  }

  private evaluateConditions(conditions: Record<string, any>, event: NotificationEvent): boolean {
    // Simple condition evaluation - can be expanded for complex logic
    for (const [key, expectedValue] of Object.entries(conditions)) {
      const actualValue = this.getNestedValue(event.payload.metadata, key);
      if (actualValue !== expectedValue) {
        return false;
      }
    }
    return true;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private prepareTemplateData(event: NotificationEvent, flow: any): Record<string, any> {
    const baseData = {
      user_id: event.payload.user_id,
      recipient_type: event.payload.recipient_type,
      ...event.payload.metadata
    };

    // Add event-specific data preparation
    const handler = this.eventHandlers.get(event.event);
    if (handler) {
      return handler.call(this, baseData);
    }

    return baseData;
  }

  private async scheduleNotification(event: NotificationEvent, flow: any, templateData: Record<string, any>): Promise<void> {
    const scheduledAt = new Date();
    scheduledAt.setMinutes(scheduledAt.getMinutes() + flow.delay_minutes);

    await supabase
      .from('notification_queue')
      .insert({
        flow_id: flow.id,
        recipient_id: event.payload.user_id,
        event_type: flow.event_type,
        channel: flow.channel,
        template_data: templateData,
        scheduled_at: scheduledAt.toISOString()
      });
  }

  private async sendNotification(event: NotificationEvent, flow: any, templateData: Record<string, any>): Promise<void> {
    // Call centralized notification engine
    const response = await fetch('/functions/v1/centralized-notification-engine', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzaW9yaHRpb3Z3Y2FqaWFyeWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODE3ODAsImV4cCI6MjA2Nzg1Nzc4MH0.4GKFhQTxlEzj6oTcfnAZQpPxPHW0nqGDEfBe-gVGoNE`
      },
      body: JSON.stringify({
        event_type: flow.event_type,
        recipient_id: event.payload.user_id,
        recipient_type: event.payload.recipient_type,
        data: templateData
      })
    });

    if (!response.ok) {
      throw new Error(`Notification delivery failed: ${response.statusText}`);
    }

    // Log the notification
    await this.logNotification(event, flow, templateData, 'sent');
  }

  private async logNotification(event: NotificationEvent, flow: any, templateData: Record<string, any>, status: string): Promise<void> {
    await supabase
      .from('notification_logs')
      .insert({
        flow_id: flow.id,
        recipient_id: event.payload.user_id,
        event_type: flow.event_type as any,
        channel: flow.channel as any,
        status: status as any,
        template_data: templateData as any,
        sent_at: status === 'sent' ? new Date().toISOString() : null
      });
  }

  private async broadcastEvent(event: NotificationEvent): Promise<void> {
    await this.realtimeChannel.send({
      type: 'broadcast',
      event: 'notification_sent',
      payload: event
    });
  }

  private async handleNotificationEvent(event: NotificationEvent): Promise<void> {
    // Handle real-time notification events from other clients
    console.log('Received real-time notification event:', event);
    
    // Update UI state, show toast, etc.
    if (event.payload.recipient_type === 'fan') {
      this.showInAppNotification(event);
    }
  }

  private showInAppNotification(event: NotificationEvent): void {
    // Show in-app notification (toast, notification bell, etc.)
    const eventMessages: Record<string, string> = {
      'song_uploaded': 'New music is available!',
      'event_published': 'New event published!',
      'award_nomination': 'Artist nominated for award!',
      'artist_verified': 'Artist verification complete!'
    };

    const message = eventMessages[event.event] || 'New notification';
    
    // This would integrate with your toast system
    console.log('In-app notification:', message);
  }

  // Event-specific handlers
  private handleArtistSubmission(data: Record<string, any>): Record<string, any> {
    return {
      ...data,
      artist_name: data.stage_name || data.real_name,
      submission_date: new Date().toLocaleDateString()
    };
  }

  private handleArtistVerified(data: Record<string, any>): Record<string, any> {
    return {
      ...data,
      artist_name: data.stage_name || data.real_name,
      verification_date: new Date().toLocaleDateString(),
      dashboard_link: `https://camerplay.com/artist/dashboard`
    };
  }

  private handleSongUploaded(data: Record<string, any>): Record<string, any> {
    return {
      ...data,
      artist_name: data.artist_name,
      song_title: data.song_title,
      song_page_link: `https://camerplay.com/music/track/${data.track_id}`,
      release_date: new Date().toLocaleDateString()
    };
  }

  private handleTicketPurchased(data: Record<string, any>): Record<string, any> {
    return {
      ...data,
      full_name: data.full_name,
      event_name: data.event_name,
      event_location: data.event_location,
      event_datetime: data.event_datetime,
      ticket_type: data.ticket_type,
      qr_code_link: data.qr_code_link
    };
  }

  private handleAwardNomination(data: Record<string, any>): Record<string, any> {
    return {
      ...data,
      artist_name: data.artist_name,
      award_category: data.award_category,
      award_dashboard_link: `https://camerplay.com/awards/dashboard/${data.artist_id}`,
      voting_start_date: data.voting_start_date
    };
  }

  private handleNewFollower(data: Record<string, any>): Record<string, any> {
    return {
      ...data,
      artist_name: data.artist_name,
      follower_name: data.follower_name,
      follower_count: data.follower_count
    };
  }

  private handleEventPublished(data: Record<string, any>): Record<string, any> {
    return {
      ...data,
      artist_name: data.artist_name,
      event_name: data.event_name,
      event_date: data.event_date,
      event_location: data.event_location,
      ticket_link: data.ticket_link
    };
  }

  private handleSongMilestone(data: Record<string, any>): Record<string, any> {
    return {
      ...data,
      artist_name: data.artist_name,
      song_title: data.song_title,
      milestone_type: data.milestone_type,
      milestone_value: data.milestone_value
    };
  }

  private handleAwardWin(data: Record<string, any>): Record<string, any> {
    return {
      ...data,
      artist_name: data.artist_name,
      award_category: data.award_category,
      award_year: new Date().getFullYear()
    };
  }

  private handleVotingOpened(data: Record<string, any>): Record<string, any> {
    return {
      ...data,
      voting_category: data.category,
      voting_deadline: data.deadline,
      voting_link: data.voting_link
    };
  }

  private handleEventReminder(data: Record<string, any>): Record<string, any> {
    return {
      ...data,
      event_name: data.event_name,
      event_datetime: data.event_datetime,
      event_location: data.event_location,
      hours_until_event: data.hours_until_event || 24
    };
  }

  // Public API methods
  public async triggerArtistSubmission(userId: string, artistData: Record<string, any>): Promise<void> {
    await this.triggerNotification({
      event: 'artist_submission',
      payload: {
        user_id: userId,
        recipient_type: 'artist',
        metadata: artistData
      }
    });
  }

  public async triggerSongUpload(artistId: string, songData: Record<string, any>): Promise<void> {
    // Notify artist
    await this.triggerNotification({
      event: 'song_uploaded',
      payload: {
        user_id: artistId,
        recipient_type: 'artist',
        metadata: songData
      }
    });

    // Notify fans (this would be handled by getting followers)
    const followers = await this.getArtistFollowers(artistId);
    for (const follower of followers) {
      await this.triggerNotification({
        event: 'song_uploaded',
        payload: {
          user_id: follower.fan_user_id,
          recipient_type: 'fan',
          metadata: songData
        }
      });
    }
  }

  private async getArtistFollowers(artistId: string): Promise<any[]> {
    const { data } = await supabase
      .from('artist_followers')
      .select('fan_user_id')
      .eq('artist_user_id', artistId)
      .eq('notifications_enabled', true);

    return data || [];
  }

  public destroy(): void {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
    }
  }
}

// Export singleton instance
export const notificationController = CentralizedNotificationController.getInstance();

// Helper functions for easy usage
export const triggerNotification = (event: NotificationEvent) => 
  notificationController.triggerNotification(event);

export const triggerArtistSubmission = (userId: string, artistData: Record<string, any>) =>
  notificationController.triggerArtistSubmission(userId, artistData);

export const triggerSongUpload = (artistId: string, songData: Record<string, any>) =>
  notificationController.triggerSongUpload(artistId, songData);