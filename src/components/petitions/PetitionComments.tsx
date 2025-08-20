import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CommentForm } from '@/components/petitions/CommentForm';
import { CommentList } from '@/components/petitions/CommentList';
import { MessageCircle } from 'lucide-react';

interface Comment {
  id: string;
  petition_id: string;
  user_id: string;
  commenter_name: string;
  comment_text: string;
  is_approved: boolean;
  created_at: string;
  avatar_url?: string;
}

interface PetitionCommentsProps {
  petitionId: string;
}

export function PetitionComments({ petitionId }: PetitionCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [petitionId]);

  // Subscribe to realtime comments
  useEffect(() => {
    if (!petitionId) return;

    const channel = supabase
      .channel('petition-comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'petition_comments',
          filter: `petition_id=eq.${petitionId}`
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [petitionId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('petition_comments')
        .select(`
          id,
          petition_id,
          user_id,
          comment_text,
          is_approved,
          created_at,
          profiles!petition_comments_user_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .eq('petition_id', petitionId)
        .eq('is_approved', true)
        .eq('is_flagged', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedComments = data?.map(comment => ({
        id: comment.id,
        petition_id: comment.petition_id,
        user_id: comment.user_id,
        commenter_name: comment.profiles?.display_name || 'Anonymous User',
        comment_text: comment.comment_text,
        is_approved: comment.is_approved,
        created_at: comment.created_at,
        avatar_url: comment.profiles?.avatar_url
      })) || [];
      
      setComments(formattedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentAdded = (newCommentObj: Comment) => {
    setComments(prev => [newCommentObj, ...prev]);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
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
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        <CommentForm 
          petitionId={petitionId}
          onCommentAdded={handleCommentAdded}
        />

        {/* Comments List */}
        <CommentList 
          comments={comments}
          loading={loading}
        />
      </CardContent>
    </Card>
  );
}