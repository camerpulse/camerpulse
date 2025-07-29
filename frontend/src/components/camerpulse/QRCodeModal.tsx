import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode, Download, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeModalProps {
  url: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function QRCodeModal({ url, title, description, children }: QRCodeModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const { toast } = useToast();

  const generateQRCode = async () => {
    try {
      // Using QR Server API for generating QR codes
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
      setQrCodeUrl(qrUrl);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      });
    }
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `${title.replace(/\s+/g, '_')}_QRCode.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description || `Check out ${title} on CamerPulse`,
          url: url,
        });
      } catch (error) {
        // Fallback to clipboard
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link Copied",
        description: "Profile link has been copied to clipboard",
      });
    });
  };

  return (
    <Dialog onOpenChange={(open) => open && generateQRCode()}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="icon" title="QR Code">
            <QrCode className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code - {title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          {qrCodeUrl ? (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <img 
                src={qrCodeUrl} 
                alt={`QR Code for ${title}`}
                className="w-64 h-64"
              />
            </div>
          ) : (
            <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center">
              <QrCode className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          
          <p className="text-sm text-muted-foreground text-center">
            {description || `Scan to view ${title} profile`}
          </p>
          
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={downloadQRCode}
              disabled={!qrCodeUrl}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={shareQRCode}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}