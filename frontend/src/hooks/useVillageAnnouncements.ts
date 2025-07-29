import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VillageAnnouncement {
  id: string;
  village_id: string;
  user_id: string;
  title: string;
  content: string;
  announcement_type: string;
  priority: string;
  is_pinned: boolean;
  expires_at: string | null;
  attachments: any;
  views_count: number;
  reactions: any;
  created_at: string;
  updated_at: string;
}

export const useVillageAnnouncements = (villageId: string) => {
  const [announcements, setAnnouncements] = useState<VillageAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('village_announcements')
        .select('*')
        .eq('village_id', villageId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast({
        title: "Error",
        description: "Failed to load announcements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAnnouncement = async (announcementData: Partial<VillageAnnouncement>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create announcements",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('village_announcements')
        .insert({
          village_id: villageId,
          user_id: user.id,
          title: announcementData.title || '',
          content: announcementData.content || '',
          ...announcementData,
        });

      if (error) throw error;

      await fetchAnnouncements();
      toast({
        title: "Success",
        description: "Announcement created successfully",
      });
      return true;
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast({
        title: "Error",
        description: "Failed to create announcement",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateAnnouncement = async (id: string, updates: Partial<VillageAnnouncement>) => {
    try {
      const { error } = await supabase
        .from('village_announcements')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchAnnouncements();
      toast({
        title: "Success",
        description: "Announcement updated successfully",
      });
      return true;
    } catch (error) {
      console.error('Error updating announcement:', error);
      toast({
        title: "Error",
        description: "Failed to update announcement",
        variant: "destructive",
      });
      return false;
    }
  };

  const incrementViews = async (id: string) => {
    try {
      const { error } = await supabase
        .from('village_announcements')
        .update({ 
          views_count: announcements.find(a => a.id === id)?.views_count + 1 || 1 
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating views:', error);
    }
  };

  useEffect(() => {
    if (villageId) {
      fetchAnnouncements();
    }
  }, [villageId]);

  return {
    announcements,
    loading,
    createAnnouncement,
    updateAnnouncement,
    incrementViews,
    refetch: fetchAnnouncements,
  };
};