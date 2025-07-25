import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Image as ImageIcon,
  Video,
  MapPin,
  Smile,
  Hash,
  AtSign,
  Globe,
  Users,
  Lock,
  Send,
  X,
  Upload
} from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
  wallUserId?: string; // If posting on someone else's wall
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
  wallUserId
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [location, setLocation] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [feeling, setFeeling] = useState('');

  const feelings = [
    '😊 Happy', '😍 Loved', '😎 Cool', '🤔 Thoughtful', '😴 Tired',
    '🎉 Excited', '😂 Amused', '😌 Blessed', '💪 Motivated', '🔥 Fired up'
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleCreatePost = async () => {
    if (!content.trim() && !selectedImage) {
      toast({
        title: "Error",
        description: "Please add some content or an image",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsPosting(true);
      
      let imageUrl = null;
      
      // Upload image if selected
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${user?.id}_${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, selectedImage);

        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName);
          
        imageUrl = urlData.publicUrl;
      }

      // Create the post
      const postData = {
        user_id: user?.id,
        content: content.trim(),
        privacy_level: privacy,
        image_url: imageUrl,
        location: location || null,
        feeling: feeling || null,
        wall_user_id: wallUserId || user?.id
      };

      const { error } = await supabase
        .from('pulse_posts')
        .insert(postData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post created successfully",
      });

      // Reset form
      setContent('');
      setPrivacy('public');
      setLocation('');
      setFeeling('');
      setSelectedImage(null);
      setImagePreview(null);
      
      onPostCreated();
      onClose();
      
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>
                {getInitials(user?.user_metadata?.display_name || user?.email || 'U')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-semibold">
                {user?.user_metadata?.display_name || user?.email}
              </div>
              <Select value={privacy} onValueChange={setPrivacy}>
                <SelectTrigger className="w-auto h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Public
                    </div>
                  </SelectItem>
                  <SelectItem value="friends">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Friends Only
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Only Me
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Post Content */}
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] text-lg border-none resize-none focus:ring-0 p-0"
          />

          {/* Feeling/Activity */}
          {feeling && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Smile className="h-3 w-3" />
                feeling {feeling}
                <button onClick={() => setFeeling('')} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          )}

          {/* Location */}
          {location && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <MapPin className="h-3 w-3" />
                {location}
                <button onClick={() => setLocation('')} className="ml-1">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          )}

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full max-h-64 object-cover rounded-lg"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Post Actions */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <label htmlFor="image-upload" className="cursor-pointer">
                <Button variant="ghost" size="sm" asChild>
                  <span>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Photo
                  </span>
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </label>
              
              <Button variant="ghost" size="sm">
                <Video className="h-4 w-4 mr-2" />
                Video
              </Button>
              
              <Select value={feeling} onValueChange={setFeeling}>
                <SelectTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Smile className="h-4 w-4 mr-2" />
                    Feeling
                  </Button>
                </SelectTrigger>
                <SelectContent>
                  {feelings.map((feelingOption) => (
                    <SelectItem key={feelingOption} value={feelingOption}>
                      {feelingOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  const newLocation = prompt('Where are you?');
                  if (newLocation) setLocation(newLocation);
                }}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Location
              </Button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreatePost}
              disabled={(!content.trim() && !selectedImage) || isPosting}
            >
              <Send className="h-4 w-4 mr-2" />
              {isPosting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};