import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QuickCommentModal } from './QuickCommentModal';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  Repeat2,
  Flag,
  ExternalLink
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useBookmarkPost, usePulsePost, useReportPost } from '@/hooks/useEnhancedPostInteractions';
import { useToast } from '@/hooks/use-toast';

interface EnhancedInteractionBarProps {
  postId: string;
  originalId: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    user_has_liked: boolean;
    user_has_bookmarked?: boolean;
    user_has_pulsed?: boolean;
  };
  onLike: () => void;
  onComment?: () => void;
  onShare: () => void;
  postAuthor?: string;
  postPreview?: string;
  className?: string;
}

export const EnhancedInteractionBar: React.FC<EnhancedInteractionBarProps> = ({
  postId,
  originalId,
  engagement,
  onLike,
  onComment,
  onShare,
  postAuthor,
  postPreview,
  className = '',
}) => {
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  
  const bookmarkMutation = useBookmarkPost();
  const pulseMutation = usePulsePost();
  const reportMutation = useReportPost();
  const { toast } = useToast();

  const handleBookmark = () => {
    bookmarkMutation.mutate({
      postId: originalId,
      isBookmarked: engagement.user_has_bookmarked || false,
    });
  };

  const handlePulse = () => {
    pulseMutation.mutate({
      postId: originalId,
      isPulsed: engagement.user_has_pulsed || false,
    });
  };

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/post/${originalId}`;
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Post link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy link",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleReport = () => {
    if (!reportReason) {
      toast({
        title: "Please select a reason",
        description: "You must select a reason for reporting this post",
        variant: "destructive",
      });
      return;
    }

    reportMutation.mutate({
      postId: originalId,
      reason: reportReason,
      description: reportDescription,
    }, {
      onSuccess: () => {
        setReportDialogOpen(false);
        setReportReason('');
        setReportDescription('');
      }
    });
  };

  return (
    <div className={`flex items-center justify-between pt-3 border-t bg-muted/30 rounded-lg p-3 -mx-3 ${className}`}>
      <div className="flex items-center gap-1 sm:gap-4">
        {/* Like Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onLike}
          className={`flex items-center gap-1 sm:gap-2 hover:scale-105 transition-all px-2 sm:px-3 ${
            engagement.user_has_liked 
              ? 'text-red-500 hover:text-red-600' 
              : 'text-muted-foreground hover:text-red-500'
          }`}
        >
          <Heart className={`h-4 w-4 ${engagement.user_has_liked ? 'fill-current' : ''}`} />
          <span className="font-medium text-xs sm:text-sm">{engagement.likes}</span>
        </Button>

        {/* Comment Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (onComment) {
              onComment();
            } else {
              setCommentModalOpen(true);
            }
          }}
          className="flex items-center gap-1 sm:gap-2 text-muted-foreground hover:text-blue-500 hover:scale-105 transition-all px-2 sm:px-3"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="font-medium text-xs sm:text-sm">{engagement.comments || 0}</span>
        </Button>

        {/* Pulse Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePulse}
          disabled={pulseMutation.isPending}
          className={`flex items-center gap-1 sm:gap-2 hover:scale-105 transition-all px-2 sm:px-3 ${
            engagement.user_has_pulsed 
              ? 'text-green-500 hover:text-green-600' 
              : 'text-muted-foreground hover:text-green-500'
          }`}
        >
          <Repeat2 className={`h-4 w-4 ${engagement.user_has_pulsed ? 'fill-current' : ''}`} />
          <span className="font-medium text-xs sm:text-sm hidden sm:inline">Pulse</span>
        </Button>

        {/* Share Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onShare}
          className="flex items-center gap-1 sm:gap-2 text-muted-foreground hover:text-orange-500 hover:scale-105 transition-all px-2 sm:px-3"
        >
          <Share2 className="h-4 w-4" />
          <span className="font-medium text-xs sm:text-sm">{engagement.shares}</span>
        </Button>
      </div>

      {/* More Actions */}
      <div className="flex items-center gap-1">
        {/* Bookmark Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBookmark}
          disabled={bookmarkMutation.isPending}
          className={`hover:scale-105 transition-all p-2 ${
            engagement.user_has_bookmarked 
              ? 'text-yellow-500 hover:text-yellow-600' 
              : 'text-muted-foreground hover:text-yellow-500'
          }`}
        >
          <Bookmark className={`h-4 w-4 ${engagement.user_has_bookmarked ? 'fill-current' : ''}`} />
        </Button>

        {/* More Options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="hover:scale-105 transition-all p-2">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleCopyLink}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Copy link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Report post
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Report Post</DialogTitle>
                  <DialogDescription>
                    Help us understand what's wrong with this post. Your report will be reviewed by our moderation team.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label>Reason for reporting</Label>
                    <RadioGroup value={reportReason} onValueChange={setReportReason} className="mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="spam" id="spam" />
                        <Label htmlFor="spam">Spam or misleading content</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="harassment" id="harassment" />
                        <Label htmlFor="harassment">Harassment or bullying</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hate_speech" id="hate_speech" />
                        <Label htmlFor="hate_speech">Hate speech</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="misinformation" id="misinformation" />
                        <Label htmlFor="misinformation">False information</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="inappropriate" id="inappropriate" />
                        <Label htmlFor="inappropriate">Inappropriate content</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Other</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <Label htmlFor="report-description">Additional details (optional)</Label>
                    <Textarea
                      id="report-description"
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      placeholder="Provide more details about why you're reporting this post..."
                      className="mt-2"
                      maxLength={500}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setReportDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleReport}
                      disabled={!reportReason || reportMutation.isPending}
                      variant="destructive"
                    >
                      {reportMutation.isPending ? 'Submitting...' : 'Submit Report'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Quick Comment Modal */}
      <QuickCommentModal
        open={commentModalOpen}
        onOpenChange={setCommentModalOpen}
        postId={originalId}
        postAuthor={postAuthor}
        postPreview={postPreview}
      />
    </div>
  );
};