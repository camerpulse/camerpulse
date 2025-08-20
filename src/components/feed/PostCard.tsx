import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  MoreHorizontal,
  MapPin,
  Trash2,
  Edit3,
  Flag
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useTogglePostInteraction, useSharePost } from '@/hooks/usePostInteractions';
import { useDeletePost } from '@/hooks/usePosts';
import type { Post } from '@/hooks/usePosts';
import { CommentsSection } from './CommentsSection';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  
  const toggleInteraction = useTogglePostInteraction();
  const sharePost = useSharePost();
  const deletePost = useDeletePost();

  const isOwnPost = user?.id === post.user_id;

  const handleLike = () => {
    toggleInteraction.mutate({ postId: post.id, interactionType: 'like' });
  };

  const handleBookmark = () => {
    toggleInteraction.mutate({ postId: post.id, interactionType: 'bookmark' });
  };

  const handleShare = () => {
    sharePost.mutate({ postId: post.id, post });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePost.mutate(post.id);
    }
  };

  const handleReport = () => {
    toggleInteraction.mutate({ postId: post.id, interactionType: 'report' });
  };

  const renderHashtags = () => {
    if (!post.hashtags?.length) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-3">
        {post.hashtags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            #{tag}
          </Badge>
        ))}
      </div>
    );
  };

  const getPostTypeColor = () => {
    switch (post.type) {
      case 'announcement': return 'bg-blue-500/10 text-blue-600';
      case 'civic_update': return 'bg-green-500/10 text-green-600';
      case 'poll': return 'bg-purple-500/10 text-purple-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  return (
    <Card className="bg-card border-border hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.profiles?.avatar_url} />
            <AvatarFallback>
              {post.profiles?.display_name?.[0] || post.profiles?.username?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="font-semibold text-foreground truncate">
                  {post.profiles?.display_name || post.profiles?.username || 'Anonymous'}
                </span>
                {post.profiles?.verified && (
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    ✓
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  @{post.profiles?.username || 'anonymous'}
                </span>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
                {post.type !== 'pulse' && (
                  <Badge className={`text-xs ${getPostTypeColor()}`}>
                    {post.type.replace('_', ' ')}
                  </Badge>
                )}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isOwnPost && (
                    <>
                      <DropdownMenuItem>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={handleDelete}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleReport}>
                    <Flag className="h-4 w-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {post.location && (
              <div className="flex items-center gap-1 mb-2">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{post.location}</span>
              </div>
            )}
            
            <div className="text-foreground mb-3 leading-relaxed whitespace-pre-wrap break-words">
              {post.content}
            </div>
            
            {renderHashtags()}
            
            {post.media_urls && post.media_urls.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
                {post.media_urls.slice(0, 4).map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt="Post media"
                    className="w-full h-32 object-cover"
                    loading="lazy"
                  />
                ))}
                {post.media_urls.length > 4 && (
                  <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-2 py-1 rounded-tl">
                    +{post.media_urls.length - 4} more
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between pt-3 border-t border-border mt-3">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={toggleInteraction.isPending}
                  className={`text-muted-foreground hover:text-red-500 transition-colors ${
                    post.user_has_liked ? 'text-red-500' : ''
                  }`}
                >
                  <Heart className={`h-4 w-4 mr-1 ${post.user_has_liked ? 'fill-current' : ''}`} />
                  <span className="text-sm">{post.like_count || 0}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                  className="text-muted-foreground hover:text-blue-500 transition-colors"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">{post.comment_count || 0}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  disabled={sharePost.isPending}
                  className={`text-muted-foreground hover:text-green-500 transition-colors ${
                    post.user_has_shared ? 'text-green-500' : ''
                  }`}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  <span className="text-sm">{post.share_count || 0}</span>
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                disabled={toggleInteraction.isPending}
                className={`text-muted-foreground hover:text-yellow-500 transition-colors ${
                  post.user_has_bookmarked ? 'text-yellow-500' : ''
                }`}
              >
                <Bookmark className={`h-4 w-4 ${post.user_has_bookmarked ? 'fill-current' : ''}`} />
              </Button>
            </div>
            
            {showComments && (
              <div className="mt-4 pt-4 border-t border-border">
                <CommentsSection postId={post.id} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};