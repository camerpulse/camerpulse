import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Flag,
  MoreVertical,
  Send,
  Smile,
  Image,
  Link2,
  Copy,
  Twitter,
  Facebook,
  Linkedin,
  Zap,
  TrendingUp,
  Eye,
  Users,
  Award
} from 'lucide-react';

interface Post {
  id: string;
  content: string;
  like_count: number;
  comment_count: number;
  share_count: number;
  view_count?: number;
  user_has_liked: boolean;
  user_has_shared: boolean;
  user_has_bookmarked: boolean;
  profiles: {
    username: string;
    display_name: string;
    avatar_url?: string;
    verified?: boolean;
  };
  created_at: string;
}

interface EnhancedPostInteractionsProps {
  post: Post;
  onInteraction?: (postId: string, type: string) => void;
  compact?: boolean;
}

export const EnhancedPostInteractions: React.FC<EnhancedPostInteractionsProps> = ({
  post,
  onInteraction,
  compact = false
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [reactions, setReactions] = useState({
    like: post.user_has_liked,
    bookmark: post.user_has_bookmarked,
    share: post.user_has_shared
  });
  const [counts, setCounts] = useState({
    likes: post.like_count,
    comments: post.comment_count,
    shares: post.share_count,
    views: post.view_count || 0
  });

  const commentInputRef = useRef<HTMLInputElement>(null);

  const handleReaction = async (type: 'like' | 'bookmark' | 'share') => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to interact with posts.",
        variant: "destructive"
      });
      return;
    }

    const isCurrentlyActive = reactions[type];
    
    // Optimistic update
    setReactions(prev => ({ ...prev, [type]: !isCurrentlyActive }));
    
    if (type === 'like') {
      setCounts(prev => ({ 
        ...prev, 
        likes: isCurrentlyActive ? prev.likes - 1 : prev.likes + 1 
      }));
    } else if (type === 'share') {
      setCounts(prev => ({ 
        ...prev, 
        shares: isCurrentlyActive ? prev.shares - 1 : prev.shares + 1 
      }));
    }

    try {
      // Call parent callback
      onInteraction?.(post.id, type);

      // Show feedback
      if (!isCurrentlyActive) {
        const messages = {
          like: "Post liked! 👍",
          bookmark: "Post bookmarked! 🔖",
          share: "Post shared! 📢"
        };
        
        toast({
          description: messages[type],
          duration: 2000
        });
      }
    } catch (error) {
      // Revert optimistic update on error
      setReactions(prev => ({ ...prev, [type]: isCurrentlyActive }));
      if (type === 'like') {
        setCounts(prev => ({ 
          ...prev, 
          likes: isCurrentlyActive ? prev.likes + 1 : prev.likes - 1 
        }));
      }
      
      toast({
        title: "Error",
        description: "Failed to update reaction. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleComment = () => {
    setShowComments(!showComments);
    if (!showComments) {
      setTimeout(() => commentInputRef.current?.focus(), 100);
    }
  };

  const submitComment = async () => {
    if (!newComment.trim() || !user) return;

    setIsSubmittingComment(true);
    try {
      // Simulate comment submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCounts(prev => ({ ...prev, comments: prev.comments + 1 }));
      setNewComment('');
      
      toast({
        description: "Comment posted! 💬",
        duration: 2000
      });
      
      onInteraction?.(post.id, 'comment');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = (platform?: string) => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    const shareText = `Check out this post by ${post.profiles.display_name}: ${post.content.slice(0, 100)}...`;

    if (platform === 'copy') {
      navigator.clipboard.writeText(postUrl);
      toast({ description: "Link copied to clipboard! 📋" });
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`);
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`);
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`);
    }
    
    setShowShare(false);
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (compact) {
    return (
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <button
          onClick={() => handleReaction('like')}
          className={cn(
            "flex items-center gap-1 hover:text-red-500 transition-colors",
            reactions.like && "text-red-500"
          )}
        >
          <Heart className={cn("w-4 h-4", reactions.like && "fill-current")} />
          <span>{formatCount(counts.likes)}</span>
        </button>
        
        <button
          onClick={handleComment}
          className="flex items-center gap-1 hover:text-blue-500 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{formatCount(counts.comments)}</span>
        </button>
        
        <button
          onClick={() => setShowShare(!showShare)}
          className="flex items-center gap-1 hover:text-green-500 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>{formatCount(counts.shares)}</span>
        </button>
        
        {counts.views > 0 && (
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{formatCount(counts.views)}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main interaction buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleReaction('like')}
            className={cn(
              "gap-2 hover:bg-red-50 hover:text-red-600",
              reactions.like && "text-red-600 bg-red-50"
            )}
          >
            <Heart className={cn("w-4 h-4", reactions.like && "fill-current")} />
            <span>{formatCount(counts.likes)}</span>
            {reactions.like && <Zap className="w-3 h-3" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleComment}
            className="gap-2 hover:bg-blue-50 hover:text-blue-600"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{formatCount(counts.comments)}</span>
          </Button>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShare(!showShare)}
              className={cn(
                "gap-2 hover:bg-green-50 hover:text-green-600",
                reactions.share && "text-green-600"
              )}
            >
              <Share2 className="w-4 h-4" />
              <span>{formatCount(counts.shares)}</span>
            </Button>
            
            {showShare && (
              <div className="absolute top-full left-0 mt-2 bg-background border border-border rounded-lg shadow-lg p-3 z-10 min-w-48">
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare('copy')}
                    className="w-full justify-start gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare('twitter')}
                    className="w-full justify-start gap-2"
                  >
                    <Twitter className="w-4 h-4" />
                    Share on Twitter
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare('facebook')}
                    className="w-full justify-start gap-2"
                  >
                    <Facebook className="w-4 h-4" />
                    Share on Facebook
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare('linkedin')}
                    className="w-full justify-start gap-2"
                  >
                    <Linkedin className="w-4 h-4" />
                    Share on LinkedIn
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleReaction('bookmark')}
            className={cn(
              "hover:bg-yellow-50 hover:text-yellow-600",
              reactions.bookmark && "text-yellow-600"
            )}
          >
            <Bookmark className={cn("w-4 h-4", reactions.bookmark && "fill-current")} />
          </Button>
          
          {counts.views > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground px-2">
              <Eye className="w-4 h-4" />
              <span>{formatCount(counts.views)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Engagement metrics */}
      {(counts.likes > 10 || counts.shares > 5) && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {counts.likes > 10 && (
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Trending</span>
            </div>
          )}
          {counts.shares > 5 && (
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>Viral</span>
            </div>
          )}
          {post.profiles.verified && (
            <div className="flex items-center gap-1">
              <Award className="w-3 h-3" />
              <span>Verified Author</span>
            </div>
          )}
        </div>
      )}

      {/* Comments section */}
      {showComments && (
        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user?.email?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex items-center gap-2">
              <Input
                ref={commentInputRef}
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && submitComment()}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={submitComment}
                disabled={!newComment.trim() || isSubmittingComment}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Mock comment */}
          <div className="flex items-start gap-3 pl-2">
            <Avatar className="w-7 h-7">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">John Doe</span>
                  <span className="text-xs text-muted-foreground">2h ago</span>
                </div>
                <p className="text-sm">Great insights! This really highlights the importance of civic engagement.</p>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <button className="hover:text-foreground">Like</button>
                <button className="hover:text-foreground">Reply</button>
                <span>3 likes</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};