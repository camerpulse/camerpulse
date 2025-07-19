import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, Send, Reply, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Track {
  id: string;
  title: string;
  artist_name: string;
  duration_seconds: number;
  audio_url: string;
}

interface Comment {
  id: string;
  content: string;
  timestamp_seconds?: number;
  created_at: string;
  user_id: string;
  parent_comment_id?: string;
  user_profile?: {
    full_name: string;
    avatar_url?: string;
  };
  replies?: Comment[];
}

interface SocialFeaturesProps {
  track: Track;
  currentUser?: any;
}

export const SocialFeatures: React.FC<SocialFeaturesProps> = ({ track, currentUser }) => {
  const { toast } = useToast();
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shares, setShares] = useState(0);

  useEffect(() => {
    if (track.id) {
      fetchSocialData();
    }
  }, [track.id]);

  const fetchSocialData = async () => {
    try {
      // Fetch likes count
      const { count: likesCount } = await supabase
        .from("track_likes")
        .select("*", { count: "exact", head: true })
        .eq("track_id", track.id);

      setLikes(likesCount || 0);

      // Check if current user liked
      if (currentUser) {
        const { data: userLike } = await supabase
          .from("track_likes")
          .select("id")
          .eq("track_id", track.id)
          .eq("user_id", currentUser.id)
          .single();

        setIsLiked(!!userLike);
      }

      // Fetch comments
      const { data: commentsData } = await supabase
        .from("track_comments")
        .select(`
          *,
          user_profile:profiles(full_name, avatar_url)
        `)
        .eq("track_id", track.id)
        .is("parent_comment_id", null)
        .order("created_at", { ascending: false });

      if (commentsData) {
        // Fetch replies for each comment
        const commentsWithReplies = await Promise.all(
          commentsData.map(async (comment) => {
            const { data: replies } = await supabase
              .from("track_comments")
              .select(`
                *,
                user_profile:profiles(full_name, avatar_url)
              `)
              .eq("parent_comment_id", comment.id)
              .order("created_at", { ascending: true });

            return { ...comment, replies: replies || [] };
          })
        );

        setComments(commentsWithReplies);
      }

      // Fetch shares count
      const { count: sharesCount } = await supabase
        .from("track_shares")
        .select("*", { count: "exact", head: true })
        .eq("track_id", track.id);

      setShares(sharesCount || 0);
    } catch (error) {
      console.error("Error fetching social data:", error);
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to like tracks",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isLiked) {
        await supabase
          .from("track_likes")
          .delete()
          .eq("track_id", track.id)
          .eq("user_id", currentUser.id);

        setLikes(prev => prev - 1);
        setIsLiked(false);
      } else {
        await supabase
          .from("track_likes")
          .insert({
            track_id: track.id,
            user_id: currentUser.id,
          });

        setLikes(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Error handling like:", error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  };

  const handleComment = async () => {
    if (!currentUser) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("track_comments")
        .insert({
          track_id: track.id,
          user_id: currentUser.id,
          content: newComment.trim(),
          parent_comment_id: replyTo,
        })
        .select(`
          *,
          user_profile:profiles(full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      if (replyTo) {
        // Update the specific comment's replies
        setComments(prev => prev.map(comment => 
          comment.id === replyTo 
            ? { ...comment, replies: [...(comment.replies || []), data] }
            : comment
        ));
      } else {
        // Add new top-level comment
        setComments(prev => [data, ...prev]);
      }

      setNewComment("");
      setReplyTo(null);

      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully",
      });
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (platform: string) => {
    if (!currentUser) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to share tracks",
        variant: "destructive",
      });
      return;
    }

    try {
      await supabase
        .from("track_shares")
        .insert({
          track_id: track.id,
          user_id: currentUser.id,
          platform,
        });

      setShares(prev => prev + 1);

      // Generate share URL
      const shareUrl = `${window.location.origin}/camerplay/player?track=${track.id}`;
      const shareText = `Check out "${track.title}" by ${track.artist_name} on CamerPlay!`;

      if (platform === "twitter") {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
      } else if (platform === "facebook") {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
      } else if (platform === "whatsapp") {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`, "_blank");
      } else if (platform === "copy") {
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied",
          description: "Share link copied to clipboard",
        });
      }
    } catch (error) {
      console.error("Error sharing track:", error);
      toast({
        title: "Error",
        description: "Failed to share track",
        variant: "destructive",
      });
    }
  };

  const deleteComment = async (commentId: string, isReply: boolean, parentId?: string) => {
    if (!currentUser) return;

    try {
      await supabase
        .from("track_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", currentUser.id);

      if (isReply && parentId) {
        setComments(prev => prev.map(comment => 
          comment.id === parentId 
            ? { ...comment, replies: comment.replies?.filter(reply => reply.id !== commentId) || [] }
            : comment
        ));
      } else {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
      }

      toast({
        title: "Comment deleted",
        description: "Your comment has been removed",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`flex gap-3 ${isReply ? "ml-8 mt-2" : "mb-4"}`}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.user_profile?.avatar_url} />
        <AvatarFallback>
          {comment.user_profile?.full_name?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-secondary rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">
              {comment.user_profile?.full_name || "Anonymous"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(comment.created_at)}
            </span>
          </div>
          <p className="text-sm">{comment.content}</p>
        </div>
        <div className="flex items-center gap-4 mt-2">
          {!isReply && (
            <button
              onClick={() => setReplyTo(comment.id)}
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              <Reply size={12} />
              Reply
            </button>
          )}
          {currentUser?.id === comment.user_id && (
            <button
              onClick={() => deleteComment(comment.id, isReply, comment.parent_comment_id)}
              className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-1"
            >
              <Trash2 size={12} />
              Delete
            </button>
          )}
        </div>
        {comment.replies?.map(reply => renderComment(reply, true))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Social Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 transition-colors ${
                  isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                }`}
              >
                <Heart size={20} className={isLiked ? "fill-current" : ""} />
                <span className="text-sm font-medium">{likes}</span>
              </button>

              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageCircle size={20} />
                <span className="text-sm font-medium">{comments.length}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShare("copy")}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Share2 size={20} />
                  <span className="text-sm font-medium">{shares}</span>
                </button>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare("twitter")}
                    className="h-8 px-2"
                  >
                    Twitter
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare("facebook")}
                    className="h-8 px-2"
                  >
                    Facebook
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare("whatsapp")}
                    className="h-8 px-2"
                  >
                    WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Comment */}
          <div className="space-y-3">
            {replyTo && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Reply size={14} />
                Replying to comment
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyTo(null)}
                  className="h-6 px-2"
                >
                  Cancel
                </Button>
              </div>
            )}
            <div className="flex gap-3">
              {currentUser && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.avatar_url} />
                  <AvatarFallback>
                    {currentUser.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder={replyTo ? "Write a reply..." : "Add a comment..."}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleComment}
                    disabled={!newComment.trim() || loading}
                    size="sm"
                  >
                    <Send size={14} className="mr-2" />
                    {replyTo ? "Reply" : "Comment"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map(comment => renderComment(comment))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};