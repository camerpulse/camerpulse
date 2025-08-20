import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Camera,
  Video,
  MapPin,
  Plus,
  Loader2,
  X,
  Image as ImageIcon
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useCreatePost } from '@/hooks/usePosts';

interface PostComposerProps {
  onPostCreated?: () => void;
}

export const PostComposer: React.FC<PostComposerProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'pulse' | 'announcement' | 'civic_update'>('pulse');
  const [location, setLocation] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);

  const createPost = useCreatePost();

  const handleSubmit = async () => {
    if (!content.trim()) return;

    await createPost.mutateAsync({
      content: content.trim(),
      type: postType,
      location: location || undefined,
      media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
    });

    // Reset form
    setContent('');
    setPostType('pulse');
    setLocation('');
    setMediaUrls([]);
    setIsExpanded(false);
    onPostCreated?.();
  };

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // In a real app, you'd upload these to storage and get URLs
      // For now, we'll create temporary URLs for demo
      const newUrls = Array.from(files).map(file => URL.createObjectURL(file));
      setMediaUrls(prev => [...prev, ...newUrls]);
    }
  };

  const removeMedia = (urlToRemove: string) => {
    setMediaUrls(prev => prev.filter(url => url !== urlToRemove));
    URL.revokeObjectURL(urlToRemove); // Clean up temporary URLs
  };

  const getCharacterCount = () => content.length;
  const maxLength = 500;
  const isNearLimit = getCharacterCount() > maxLength * 0.8;
  const isOverLimit = getCharacterCount() > maxLength;

  if (!user) {
    return (
      <Card className="border-border">
        <CardContent className="p-4 text-center">
          <p className="text-muted-foreground">Please log in to create posts</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardContent className="p-4">
        {!isExpanded ? (
          <div 
            className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-primary/30 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setIsExpanded(true)}
          >
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user.user_metadata?.display_name?.[0] || user.email?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1 text-muted-foreground">What's happening in Cameroon?</span>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user.user_metadata?.display_name?.[0] || user.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Select value={postType} onValueChange={(value: any) => setPostType(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pulse">Pulse</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="civic_update">Civic Update</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {postType !== 'pulse' && (
                    <Badge variant="secondary" className="text-xs">
                      {postType.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
                
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your civic thoughts..."
                  className="min-h-[100px] resize-none border-primary/20 focus:border-primary"
                  maxLength={maxLength}
                />
                
                <div className="flex justify-between items-center text-xs">
                  <span className={`${isNearLimit ? 'text-warning' : 'text-muted-foreground'} ${isOverLimit ? 'text-destructive' : ''}`}>
                    {getCharacterCount()}/{maxLength}
                  </span>
                </div>

                {/* Location input */}
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Add location (optional)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="flex-1 text-sm bg-transparent border-none outline-none placeholder:text-muted-foreground"
                  />
                </div>

                {/* Media previews */}
                {mediaUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {mediaUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt="Media preview"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeMedia(url)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      id="media-upload"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                    <Button variant="ghost" size="sm" asChild>
                      <label htmlFor="media-upload" className="cursor-pointer">
                        <ImageIcon className="w-4 h-4" />
                      </label>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Camera className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setIsExpanded(false);
                        setContent('');
                        setLocation('');
                        setMediaUrls([]);
                        setPostType('pulse');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleSubmit}
                      disabled={createPost.isPending || !content.trim() || isOverLimit}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {createPost.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Share Pulse
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};