import { useEffect } from 'react';
import { notificationController, triggerNotification, NotificationEvent } from '@/lib/notifications/CentralizedNotificationController';
import { useToast } from '@/hooks/use-toast';

export const useNotificationSystem = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Initialize notification system
    const controller = notificationController;
    
    // Cleanup on unmount
    return () => {
      controller.destroy();
    };
  }, []);

  // Helper function to trigger notifications with toast feedback
  const trigger = async (event: NotificationEvent) => {
    try {
      await triggerNotification(event);
      toast({
        title: "Notification Sent",
        description: `${event.event} notification triggered successfully`
      });
    } catch (error) {
      console.error('Notification error:', error);
      toast({
        variant: "destructive",
        title: "Notification Failed",
        description: "Failed to send notification"
      });
    }
  };

  // Convenience methods for common notifications
  const triggerArtistSubmission = async (userId: string, artistData: Record<string, any>) => {
    await trigger({
      event: 'artist_submission',
      payload: {
        user_id: userId,
        recipient_type: 'artist',
        metadata: artistData
      }
    });
  };

  const triggerSongUpload = async (artistId: string, songData: Record<string, any>) => {
    await trigger({
      event: 'song_uploaded',
      payload: {
        user_id: artistId,
        recipient_type: 'artist',
        metadata: songData
      }
    });
  };

  const triggerEventPublished = async (artistId: string, eventData: Record<string, any>) => {
    await trigger({
      event: 'event_published',
      payload: {
        user_id: artistId,
        recipient_type: 'artist',
        metadata: eventData
      }
    });
  };

  const triggerTicketPurchased = async (userId: string, ticketData: Record<string, any>) => {
    await trigger({
      event: 'ticket_purchased',
      payload: {
        user_id: userId,
        recipient_type: 'fan',
        metadata: ticketData
      }
    });
  };

  const triggerAwardNomination = async (artistId: string, awardData: Record<string, any>) => {
    await trigger({
      event: 'award_nomination',
      payload: {
        user_id: artistId,
        recipient_type: 'artist',
        metadata: awardData
      }
    });
  };

  return {
    trigger,
    triggerArtistSubmission,
    triggerSongUpload,
    triggerEventPublished,
    triggerTicketPurchased,
    triggerAwardNomination
  };
};

// Example usage in components:
// const { triggerSongUpload } = useNotificationSystem();
// 
// const handleSongUpload = async () => {
//   await triggerSongUpload(artistId, {
//     song_title: "New Song",
//     artist_name: "Artist Name",
//     track_id: "track123"
//   });
// };