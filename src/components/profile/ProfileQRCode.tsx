import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode, Download, Share2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileQRCodeProps {
  profileSlug: string;
  displayName: string;
}

export const ProfileQRCode: React.FC<ProfileQRCodeProps> = ({
  profileSlug,
  displayName
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  const profileUrl = `${window.location.origin}/@${profileSlug}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(profileUrl)}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "URL copied!",
      description: "Profile URL copied to clipboard"
    });
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${profileSlug}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "QR Code downloaded",
      description: "QR code saved to your device"
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${displayName}'s CamerPulse Profile`,
          text: `Check out ${displayName}'s civic profile on CamerPulse`,
          url: profileUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopyUrl();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <QrCode className="h-4 w-4 mr-2" />
          QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Profile QR Code</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 text-center">
          <div className="bg-white p-4 rounded-lg border inline-block">
            <img
              src={qrCodeUrl}
              alt="Profile QR Code"
              className="w-64 h-64"
            />
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">{displayName}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Scan to view profile on CamerPulse
            </p>
            <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
              {profileUrl}
            </p>
          </div>
          
          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={handleCopyUrl}>
              <Copy className="h-4 w-4 mr-2" />
              Copy URL
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadQR}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="default" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};