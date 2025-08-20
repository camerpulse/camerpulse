import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useCreatePost } from '@/hooks/useProductionPostInteractions';
import {
  ImageIcon,
  MapPin,
  Hash,
  Smile,
  X,
  Loader2,
} from 'lucide-react';

interface PostComposerProps {
  onClose?: () => void;
  placeholder?: string;
}

export const PostComposer: React.FC<PostComposerProps> = ({ 
  onClose,
  placeholder = "What's happening in your community?" 
}) => {
  const { user, profile } = useAuth();
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const createPostMutation = useCreatePost();

  const handleSubmit = () => {
    if (!content.trim()) return;

    createPostMutation.mutate(
      {
        content: content.trim(),
        location: location.trim() || undefined,
      },
      {
        onSuccess: () => {
          setContent('');
          setLocation('');
          setIsExpanded(false);
          onClose?.();
        },
      }
    );
  };

  const handleTextareaClick = () => {
    setIsExpanded(true);
  };

  const handleCancel = () => {
    setContent('');
    setLocation('');
    setIsExpanded(false);
    onClose?.();
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please sign in to create posts</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Share Your Voice</CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback>
              {profile?.display_name?.charAt(0) || 
               profile?.username?.charAt(0) || 
               user?.email?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onClick={handleTextareaClick}
              placeholder={placeholder}
              className="min-h-[100px] resize-none border-none p-0 text-lg placeholder:text-muted-foreground focus-visible:ring-0"
              maxLength={280}
            />
            
            {isExpanded && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Add location (optional)"
                    className="flex-1 text-sm bg-transparent border-none outline-none placeholder:text-muted-foreground"
                    maxLength={100}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" disabled>
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" disabled>
                      <Hash className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" disabled>
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${content.length > 250 ? 'text-red-500' : 'text-muted-foreground'}`}>
                      {content.length}/280
                    </span>
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!content.trim() || createPostMutation.isPending}
                      size="sm"
                    >
                      {createPostMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        'Post'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {!isExpanded && content.length === 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              <Hash className="h-4 w-4" />
              <MapPin className="h-4 w-4" />
              <Smile className="h-4 w-4" />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim()}
              size="sm"
              variant="outline"
            >
              Post
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};