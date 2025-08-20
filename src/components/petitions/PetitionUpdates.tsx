import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreateUpdateDialog } from '@/components/petitions/CreateUpdateDialog';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, FileText } from 'lucide-react';

interface Update {
  id: string;
  petition_id: string;
  created_by: string;
  title: string;
  content: string;
  attachments: string[];
  created_at: string;
  creator_name?: string;
}

interface PetitionUpdatesProps {
  petitionId: string;
}

export function PetitionUpdates({ petitionId }: PetitionUpdatesProps) {
  const { user } = useAuth();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [petitionData, setPetitionData] = useState<{ title: string; created_by: string } | null>(null);

  useEffect(() => {
    fetchPetitionData();
    fetchUpdates();
  }, [petitionId]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!petitionId) return;

    const channel = supabase
      .channel('petition-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'petition_updates',
          filter: `petition_id=eq.${petitionId}`
        },
        () => {
          fetchUpdates();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [petitionId]);

  const fetchPetitionData = async () => {
    try {
      const { data, error } = await supabase
        .from('petitions')
        .select('title, created_by')
        .eq('id', petitionId)
        .single();

      if (error) throw error;
      setPetitionData(data);
    } catch (error) {
      console.error('Error fetching petition data:', error);
    }
  };

  const fetchUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('petition_updates')
        .select(`
          id,
          petition_id,
          created_by,
          title,
          content,
          attachments,
          created_at,
          profiles!petition_updates_created_by_fkey (
            display_name,
            avatar_url
          )
        `)
        .eq('petition_id', petitionId)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedUpdates = data?.map(update => ({
        id: update.id,
        petition_id: update.petition_id,
        created_by: update.created_by,
        title: update.title,
        content: update.content,
        attachments: update.attachments || [],
        created_at: update.created_at,
        creator_name: update.profiles?.display_name || 'Petition Creator'
      })) || [];
      
      setUpdates(formattedUpdates);
    } catch (error) {
      console.error('Error fetching updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCreated = () => {
    fetchUpdates();
  };

  const isCreator = user && petitionData && user.id === petitionData.created_by;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-5 bg-muted rounded w-2/3"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Updates ({updates.length})
          </div>
          {isCreator && (
            <CreateUpdateDialog
              petitionId={petitionId}
              petitionTitle={petitionData?.title || ''}
              onUpdateCreated={handleUpdateCreated}
            />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {updates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No updates yet. Check back later for progress reports.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {updates.map((update, index) => (
              <div key={update.id} className="relative">
                {index !== updates.length - 1 && (
                  <div className="absolute left-4 top-8 bottom-0 w-px bg-border"></div>
                )}
                
                <div className="flex space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{update.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        Update
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <Calendar className="h-3 w-3" />
                      {new Date(update.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      <span className="mx-2">•</span>
                      <span>by {update.creator_name}</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {update.content}
                    </p>
                    
                    {update.attachments && update.attachments.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {update.attachments.length} attachment(s)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}