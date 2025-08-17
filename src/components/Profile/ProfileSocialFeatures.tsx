import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { FollowButton } from '@/components/Social/FollowButton';
import { useProfileSystem } from '@/hooks/useProfileSystem';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MessageCircle, 
  Share2, 
  Flag, 
  Star, 
  Shield,
  ExternalLink,
  Copy,
  Mail,
  Phone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileSocialFeaturesProps {
  userId: string;
  username: string;
  profileData: any;
  isOwnProfile?: boolean;
}

export const ProfileSocialFeatures: React.FC<ProfileSocialFeaturesProps> = ({
  userId,
  username,
  profileData,
  isOwnProfile = false
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { reportProfile, rateProfile } = useProfileSystem();
  
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [ratingType, setRatingType] = useState<'trust' | 'performance' | 'transparency' | 'responsiveness'>('trust');
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  const handleStartConversation = () => {
    const conversationUrl = `/messenger?startConversation=${userId}`;
    navigateToMessage(userId);
  };

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/profile/${username}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${profileData.display_name || username}'s Profile`,
        text: 'Check out this profile on CamerPulse',
        url: profileUrl
      });
    } else {
      navigator.clipboard.writeText(profileUrl);
      toast({
        title: "Link copied!",
        description: "Profile link has been copied to clipboard"
      });
    }
  };

  const handleReport = async () => {
    if (!reportType || !reportReason.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a report type and provide a reason",
        variant: "destructive"
      });
      return;
    }

    await reportProfile(profileData.id, reportType, reportReason);
    setShowReportDialog(false);
    setReportType('');
    setReportReason('');
  };

  const handleRating = async () => {
    if (!ratingType || ratingValue < 1 || ratingValue > 5) {
      toast({
        title: "Invalid rating",
        description: "Please provide a valid rating between 1-5",
        variant: "destructive"
      });
      return;
    }

    await rateProfile(profileData.id, ratingType, ratingValue, ratingComment);
    setShowRatingDialog(false);
    setRatingType('trust');
    setRatingValue(5);
    setRatingComment('');
  };

  if (isOwnProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Share Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleShareProfile} className="w-full">
            <Share2 className="w-4 h-4 mr-2" />
            Share Profile
          </Button>
          
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Your profile link:</p>
            <div className="flex items-center space-x-2">
              <Input 
                value={`${window.location.origin}/profile/${username}`}
                readOnly
                className="text-xs"
              />
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/profile/${username}`);
                  toast({ title: "Link copied!" });
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Follow Button */}
        <FollowButton 
          targetUserId={userId}
          targetUsername={username}
          variant="default"
          className="w-full"
        />

        {/* Message Button */}
        <Button 
          onClick={handleStartConversation}
          variant="outline" 
          className="w-full"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Send Message
        </Button>

        {/* Share Profile */}
        <Button 
          onClick={handleShareProfile}
          variant="outline" 
          className="w-full"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share Profile
        </Button>

        {/* Rate User */}
        <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Star className="w-4 h-4 mr-2" />
              Rate User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rate {profileData.display_name || username}</DialogTitle>
              <DialogDescription>
                Your rating helps build trust in the community
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Rating Type</label>
                <Select value={ratingType} onValueChange={(value: any) => setRatingType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trust">Trust & Reliability</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="transparency">Transparency</SelectItem>
                    <SelectItem value="responsiveness">Responsiveness</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Rating (1-5 stars)</label>
                <div className="flex items-center space-x-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingValue(star)}
                      className="focus:outline-none"
                    >
                      <Star 
                        className={`w-6 h-6 ${
                          star <= ratingValue 
                            ? 'text-yellow-500 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Comment (optional)</label>
                <Textarea 
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Share your experience..."
                  className="mt-2"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleRating}>Submit Rating</Button>
                <Button variant="outline" onClick={() => setShowRatingDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Report User */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
              <Flag className="w-4 h-4 mr-2" />
              Report User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report {profileData.display_name || username}</DialogTitle>
              <DialogDescription>
                Help us keep the community safe by reporting inappropriate behavior
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spam">Spam</SelectItem>
                    <SelectItem value="harassment">Harassment</SelectItem>
                    <SelectItem value="fake_profile">Fake Profile</SelectItem>
                    <SelectItem value="inappropriate_content">Inappropriate Content</SelectItem>
                    <SelectItem value="scam">Scam/Fraud</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Additional Details</label>
                <Textarea 
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Please provide more details about the issue..."
                  className="mt-2"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleReport} variant="destructive">
                  Submit Report
                </Button>
                <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Contact Information (if available) */}
        {(profileData.contact_email || profileData.contact_phone) && (
          <div className="border-t pt-4 space-y-2">
            <p className="text-sm font-medium">Contact</p>
            {profileData.contact_email && (
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="w-4 h-4" />
                <span>{profileData.contact_email}</span>
              </div>
            )}
            {profileData.contact_phone && (
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4" />
                <span>{profileData.contact_phone}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};