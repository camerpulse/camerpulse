import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useLikePost, useSharePost } from '@/hooks/usePostInteractions';
import { Post } from '@/hooks/usePosts';
import { formatDistanceToNow } from 'date-fns';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  MapPin,
  Hash,
} from 'lucide-react';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const navigate = useNavigate();
  const likeMutation = useLikePost();
  const shareMutation = useSharePost();

  const handleLike = () => {
    likeMutation.mutate({
      postId: post.id,
      isLiked: post.user_has_liked || false,
    });
  };

  const handleShare = () => {
    shareMutation.mutate(post.id);
  };

  const handleProfileClick = () => {
    if (post.profiles?.username) {
      navigate(`/profile/${post.profiles.username}`);
    }
  };

  const handlePostClick = () => {
    navigate(`/post/${post.id}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3" onClick={handleProfileClick}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.profiles?.avatar_url} />
              <AvatarFallback>
                {post.profiles?.display_name?.charAt(0) || 
                 post.profiles?.username?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">
                  {post.profiles?.display_name || post.profiles?.username || 'Anonymous'}
                </h4>
                {post.profiles?.verified && (
                  <Badge variant="secondary" className="text-xs px-1">
                    ✓
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>@{post.profiles?.username || 'anonymous'}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(post.created_at))} ago</span>
                {post.location && (
                  <>
                    <span>•</span>
                    <MapPin className="h-3 w-3" />
                    <span>{post.location}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div onClick={handlePostClick}>
          <p className="text-sm leading-relaxed mb-4 whitespace-pre-wrap">
            {post.content}
          </p>
          
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {post.hashtags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  <Hash className="h-2 w-2 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {post.media_urls && post.media_urls.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {post.media_urls.slice(0, 4).map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt="Post media"
                  className="rounded-lg object-cover aspect-video"
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Engagement Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={likeMutation.isPending}
              className={`flex items-center gap-2 ${
                post.user_has_liked ? 'text-red-500' : 'text-muted-foreground'
              }`}
            >
              <Heart className={`h-4 w-4 ${post.user_has_liked ? 'fill-current' : ''}`} />
              <span>{post.like_count || 0}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePostClick}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post.comment_count || 0}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              disabled={shareMutation.isPending}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <Share2 className="h-4 w-4" />
              <span>{post.share_count || 0}</span>
            </Button>
          </div>
          
          {post.sentiment && (
            <Badge 
              variant="outline" 
              className={`text-xs ${
                post.sentiment === 'positive' ? 'text-green-600' :
                post.sentiment === 'negative' ? 'text-red-600' :
                'text-gray-600'
              }`}
            >
              {post.sentiment}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};