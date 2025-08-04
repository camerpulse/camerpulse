import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, Flag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Rating {
  id: string;
  rating: number;
  comment?: string;
  user_id: string;
  created_at: string;
  profiles?: {
    display_name?: string;
    avatar_url?: string;
  };
}

interface CompanyRatingProps {
  companyId: string;
  hasRated: boolean;
  onRatingSubmitted: () => void;
}

export default function CompanyRating({ companyId, hasRated, onRatingSubmitted }: CompanyRatingProps) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchRatings();
  }, [companyId]);

  const fetchRatings = async () => {
    try {
      const { data, error } = await supabase
        .from('company_ratings')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRatings(data || []);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to rate this company",
        variant: "destructive",
      });
      return;
    }

    if (newRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('company_ratings')
        .insert({
          company_id: companyId,
          user_id: user.id,
          rating: newRating,
          comment: newComment || null,
        });

      if (error) throw error;

      toast({
        title: "Rating Submitted",
        description: "Thank you for your feedback!",
      });

      setNewRating(0);
      setNewComment('');
      onRatingSubmitted();
      fetchRatings();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onStarClick?: (star: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 cursor-pointer transition-colors ${
          i < rating 
            ? 'text-yellow-400 fill-current' 
            : interactive 
              ? 'text-gray-300 hover:text-yellow-400' 
              : 'text-gray-300'
        }`}
        onClick={() => interactive && onStarClick?.(i + 1)}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getUserInitials = (userId: string) => {
    return userId.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Form */}
      {user && !hasRated && (
        <Card>
          <CardHeader>
            <CardTitle>Rate This Company</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Your Rating</label>
              <div className="flex gap-1">
                {renderStars(newRating, true, setNewRating)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Comment (Optional)</label>
              <Textarea
                placeholder="Share your experience with this company..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={submitRating} disabled={submitting || newRating === 0}>
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Ratings List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Customer Reviews ({ratings.length})</h3>
        
        {ratings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">No Reviews Yet</h4>
              <p className="text-muted-foreground">
                Be the first to review this company and help others make informed decisions.
              </p>
            </CardContent>
          </Card>
        ) : (
          ratings.map((rating) => (
            <Card key={rating.id}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={rating.profiles?.avatar_url} />
                    <AvatarFallback>
                      {getUserInitials(rating.user_id)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm">
                          {rating.profiles?.display_name || 'Anonymous User'}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {renderStars(rating.rating)}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(rating.created_at)}
                          </span>
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        <Flag className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {rating.comment && (
                      <p className="text-muted-foreground leading-relaxed">
                        {rating.comment}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 mt-3">
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Helpful
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}