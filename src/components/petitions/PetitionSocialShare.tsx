import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Share2,
  Copy,
  Facebook,
  Twitter,
  MessageCircle,
  Mail,
  Check,
  Users,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface PetitionSocialShareProps {
  petition: {
    id: string;
    title: string;
    description: string;
    current_signatures: number;
    goal_signatures: number;
    slug?: string;
  };
  currentUrl: string;
}

export const PetitionSocialShare: React.FC<PetitionSocialShareProps> = ({
  petition,
  currentUrl
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const shareText = `📢 ${petition.title}\n\n${petition.description}\n\n${petition.current_signatures}/${petition.goal_signatures} signatures so far. Help us reach our goal!`;
  const hashTags = ['petition', 'changecameroon', 'civicengagement'];

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const text = `${shareText} ${hashTags.map(tag => `#${tag}`).join(' ')}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToWhatsApp = () => {
    const text = `${shareText}\n\n${currentUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareViaEmail = () => {
    const subject = `📢 Sign this petition: ${petition.title}`;
    const body = `${shareText}\n\nSign here: ${currentUrl}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  const shareWithCustomMessage = () => {
    const text = customMessage || shareText;
    copyToClipboard(`${text}\n\n${currentUrl}`);
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: petition.title,
          text: shareText,
          url: currentUrl
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast.error('Sharing failed');
        }
      }
    } else {
      copyToClipboard(currentUrl);
    }
  };

  const progressPercentage = (petition.current_signatures / petition.goal_signatures) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this petition</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Petition Summary */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-sm mb-2 line-clamp-2">{petition.title}</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Users className="w-3 h-3" />
                <span>{petition.current_signatures.toLocaleString()} signatures</span>
                <span>•</span>
                <span>{Math.round(progressPercentage)}% of goal</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-600">Active campaign</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Share Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={shareToFacebook}>
              <Facebook className="w-4 h-4 mr-2 text-blue-600" />
              Facebook
            </Button>
            <Button variant="outline" size="sm" onClick={shareToTwitter}>
              <Twitter className="w-4 h-4 mr-2 text-blue-400" />
              Twitter
            </Button>
            <Button variant="outline" size="sm" onClick={shareToWhatsApp}>
              <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
              WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={shareViaEmail}>
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <label className="text-xs font-medium">Customize your message:</label>
            <Textarea
              placeholder="Add your personal message to encourage others to sign..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
              className="text-sm"
            />
            <Button onClick={shareWithCustomMessage} className="w-full" size="sm">
              <Copy className="w-4 h-4 mr-2" />
              Copy Custom Message
            </Button>
          </div>

          {/* Direct Link */}
          <div className="space-y-2">
            <label className="text-xs font-medium">Direct link:</label>
            <div className="flex gap-2">
              <Input
                value={currentUrl}
                readOnly
                className="text-xs"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyToClipboard(currentUrl)}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Native Share (if available) */}
          {navigator.share && (
            <Button onClick={nativeShare} className="w-full">
              <Share2 className="w-4 h-4 mr-2" />
              Share via Device
            </Button>
          )}

          {/* Share Tips */}
          <div className="bg-muted p-3 rounded-lg">
            <h5 className="text-xs font-medium mb-2">💡 Sharing Tips:</h5>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Tag relevant friends and communities</li>
              <li>• Share in local groups and forums</li>
              <li>• Add your personal story to connect with others</li>
              <li>• Share multiple times throughout the campaign</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};