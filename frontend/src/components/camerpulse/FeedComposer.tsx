/**
 * FeedComposer Component
 * 
 * Rich post composer for the CamerPulse Feed
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from './UserAvatar';
import { useToast } from '@/hooks/use-toast';
import { 
  Camera, 
  Video, 
  Vote, 
  MapPin, 
  Hash, 
  Smile,
  X,
  Send,
  Plus
} from 'lucide-react';
import type { CivicUser } from './types';

interface FeedComposerProps {
  user: CivicUser;
  onPost: (content: string, attachments?: any[]) => void;
  expanded?: boolean;
  onToggleExpanded?: () => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export const FeedComposer: React.FC<FeedComposerProps> = ({
  user,
  onPost,
  expanded = false,
  onToggleExpanded,
  placeholder = "What's happening in Cameroon?",
  maxLength = 500,
  className = ''
}) => {
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) return;

    setIsPosting(true);
    try {
      await onPost(content, attachments);
      setContent('');
      setAttachments([]);
      if (onToggleExpanded) onToggleExpanded();
      
      toast({
        title: "Pulse shared!",
        description: "Your civic voice has been heard by the community."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share your pulse. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPosting(false);
    }
  };

  const extractHashtags = () => {
    const hashtags = content.match(/#[a-zA-Z0-9_]+/g) || [];
    return hashtags.slice(0, 5); // Limit to 5 hashtags
  };

  const extractMentions = () => {
    const mentions = content.match(/@[a-zA-Z0-9_]+/g) || [];
    return mentions.slice(0, 10); // Limit to 10 mentions
  };

  if (!expanded) {
    return (
      <Card className={`border-cm-red/20 hover:border-cm-red/40 transition-colors cursor-pointer ${className}`}>
        <CardContent className="p-4" onClick={onToggleExpanded}>
          <div className="flex items-center gap-3">
            <UserAvatar user={user} size="default" />
            <div className="flex-1 p-3 bg-muted/30 rounded-lg border border-dashed border-cm-red/30">
              <span className="text-muted-foreground">{placeholder}</span>
            </div>
            <Button size="sm" className="bg-cm-red hover:bg-cm-red/90 text-white">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-cm-red/20 ${className}`}>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} size="default" showDiaspora={true} />
            <div>
              <p className="font-medium text-foreground">{user.name}</p>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
            {user.isDiaspora && (
              <Badge variant="outline" className="border-cm-yellow text-cm-yellow">
                🌍 Diaspora
              </Badge>
            )}
          </div>
          {onToggleExpanded && (
            <Button variant="ghost" size="icon" onClick={onToggleExpanded}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Content Area */}
        <div className="space-y-3">
          <Textarea
            placeholder={placeholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] resize-none border-cm-red/20 focus:border-cm-red bg-background"
            maxLength={maxLength}
          />
          
          {/* Character count and hashtags preview */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              {extractHashtags().length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  <Hash className="w-3 h-3 text-muted-foreground mt-0.5" />
                  {extractHashtags().map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              {extractMentions().length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  <span className="text-xs text-muted-foreground">Mentions:</span>
                  {extractMentions().map((mention, index) => (
                    <span key={index} className="text-xs text-cm-green">
                      {mention}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <span className={`text-xs ${content.length > maxLength * 0.8 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {content.length}/{maxLength}
            </span>
          </div>
        </div>

        {/* Media Attachments */}
        {attachments.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {attachments.map((attachment, index) => (
              <div key={index} className="relative p-2 border rounded-lg bg-muted/50">
                <span className="text-sm">{attachment}</span>
                <Button
                  variant="ghost" 
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-cm-green"
              onClick={() => toast({ title: "Feature coming soon", description: "Photo upload will be available soon." })}
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Photo</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-cm-green"
              onClick={() => toast({ title: "Feature coming soon", description: "Video upload will be available soon." })}
            >
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Video</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-cm-yellow"
              onClick={() => toast({ title: "Feature coming soon", description: "Poll creation will be available soon." })}
            >
              <Vote className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Poll</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-cm-red"
              onClick={() => toast({ title: "Feature coming soon", description: "Location tagging will be available soon." })}
            >
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Location</span>
            </Button>
          </div>
          
          <div className="flex gap-2">
            {onToggleExpanded && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onToggleExpanded}
              >
                Cancel
              </Button>
            )}
            <Button 
              size="sm"
              onClick={handlePost}
              disabled={!content.trim() || isPosting || content.length > maxLength}
              className="bg-cm-green hover:bg-cm-green/90 text-white"
            >
              <Send className="w-4 h-4 mr-1" />
              {isPosting ? 'Sharing...' : 'Share Pulse'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};