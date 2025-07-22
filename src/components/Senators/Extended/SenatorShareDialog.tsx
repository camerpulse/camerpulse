import { useState } from 'react';
import { Share2, Twitter, Facebook, Linkedin, MessageCircle, Send, Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Senator } from '@/hooks/useSenators';
import { 
  shareToTwitter, 
  shareToFacebook, 
  shareToLinkedIn, 
  shareToWhatsApp, 
  shareToTelegram, 
  copyToClipboard, 
  nativeShare,
  shareSenatorProfile
} from '@/utils/socialSharing';

interface SenatorShareDialogProps {
  senator: Senator;
  trigger: React.ReactNode;
}

export const SenatorShareDialog = ({ senator, trigger }: SenatorShareDialogProps) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareData = shareSenatorProfile({
    name: senator.name,
    position: senator.position,
    party: senator.political_party || 'Independent',
    trustScore: senator.trust_score || 0,
    id: senator.id
  });

  const handleShare = async (platform: string) => {
    try {
      switch (platform) {
        case 'native':
          const shared = await nativeShare(shareData);
          if (!shared) {
            // Fallback to copy link if native share not available
            handleCopyLink();
          }
          break;
        case 'twitter':
          shareToTwitter(shareData);
          break;
        case 'facebook':
          shareToFacebook(shareData);
          break;
        case 'linkedin':
          shareToLinkedIn(shareData);
          break;
        case 'whatsapp':
          shareToWhatsApp(shareData);
          break;
        case 'telegram':
          shareToTelegram(shareData);
          break;
        case 'copy':
          await handleCopyLink();
          break;
      }
      
      if (platform !== 'copy') {
        toast.success('Shared successfully!');
      }
    } catch (error) {
      toast.error('Failed to share. Please try again.');
    }
  };

  const handleCopyLink = async () => {
    try {
      await copyToClipboard(shareData);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareOptions = [
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      color: 'hover:bg-blue-50 hover:text-blue-600',
      description: 'Share on Twitter'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'hover:bg-blue-50 hover:text-blue-700',
      description: 'Share on Facebook'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'hover:bg-blue-50 hover:text-blue-800',
      description: 'Share on LinkedIn'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'hover:bg-green-50 hover:text-green-600',
      description: 'Share on WhatsApp'
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: Send,
      color: 'hover:bg-blue-50 hover:text-blue-500',
      description: 'Share on Telegram'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Senator Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Senator Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {senator.profile_image && (
                  <img
                    src={senator.profile_image}
                    alt={senator.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="font-semibold">{senator.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {senator.position} • {senator.political_party}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Trust Score: {senator.trust_score || 0}/100
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Share Options */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Share via:</h4>
            <div className="grid grid-cols-2 gap-2">
              {shareOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <Button
                    key={option.id}
                    variant="outline"
                    onClick={() => handleShare(option.id)}
                    className={`justify-start gap-2 ${option.color}`}
                  >
                    <IconComponent className="h-4 w-4" />
                    {option.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Copy Link */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Direct Link</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {shareData.url}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Native Share (if available) */}
          {'share' in navigator && (
            <Button
              variant="secondary"
              onClick={() => handleShare('native')}
              className="w-full gap-2"
            >
              <Share2 className="h-4 w-4" />
              More sharing options
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};