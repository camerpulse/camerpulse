import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Shield, QrCode } from "lucide-react";

interface ArtistIDCardProps {
  artistData: {
    id: string;
    artist_id_number: string;
    stage_name: string;
    real_name: string;
    membership_expires_at?: string;
    id_card_url?: string;
    features_enabled?: any;
  };
  showDownload?: boolean;
}

const ArtistIDCard = ({ artistData, showDownload = true }: ArtistIDCardProps) => {
  const generateQRCode = () => {
    // This would generate a QR code linking to the artist's public profile
    return `https://camerpulse.com/artist/${artistData.artist_id_number}`;
  };

  const downloadPDF = () => {
    // This would generate and download a PDF version of the ID card
    console.log("Generating PDF for", artistData.artist_id_number);
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-2 border-primary/20 relative overflow-hidden">
        {/* Watermark */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-4 right-4 text-6xl font-bold text-primary rotate-12">
            OFFICIAL
          </div>
        </div>

        <CardContent className="p-6 space-y-4">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary">CAMERPULSE OFFICIAL</span>
            </div>
            <h3 className="text-lg font-bold">Artist Identification Card</h3>
          </div>

          {/* Photo and Basic Info */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg bg-muted border-2 border-primary/20 flex items-center justify-center overflow-hidden">
              {artistData.id_card_url ? (
                <img 
                  src={artistData.id_card_url} 
                  alt={artistData.stage_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-muted-foreground text-center">Artist Photo</span>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg">{artistData.stage_name}</h4>
              <p className="text-sm text-muted-foreground">{artistData.real_name}</p>
              <Badge variant="secondary" className="mt-1">
                <Shield className="w-3 h-3 mr-1" />
                Verified Artist
              </Badge>
            </div>
          </div>

          {/* ID Details */}
          <div className="space-y-3 pt-2 border-t border-dashed border-muted-foreground/30">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">ID Number:</span>
              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {artistData.artist_id_number}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Valid Until:</span>
              <span className="text-sm">
                {artistData.membership_expires_at 
                  ? new Date(artistData.membership_expires_at).toLocaleDateString()
                  : "Lifetime"
                }
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Status:</span>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Active
              </Badge>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center pt-2">
            <div className="bg-white p-3 rounded border border-muted-foreground/30">
              <QrCode className="w-16 h-16 text-muted-foreground" />
            </div>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Scan to verify authenticity
          </p>

          {/* Features Enabled */}
          {artistData.features_enabled && (
            <div className="pt-2 border-t border-dashed border-muted-foreground/30">
              <p className="text-xs font-medium mb-2">Enabled Features:</p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(artistData.features_enabled).map(([feature, enabled]) => 
                  enabled && (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature.replace('_', ' ')}
                    </Badge>
                  )
                )}
              </div>
            </div>
          )}

          {/* Digital Signature */}
          <div className="text-center pt-2 border-t border-muted-foreground/20">
            <p className="text-xs text-muted-foreground">
              Digitally verified by CamerPulse • {new Date().getFullYear()}
            </p>
            <div className="mt-1 text-xs font-mono text-primary/70">
              #{artistData.id.substr(-8).toUpperCase()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download Button */}
      {showDownload && (
        <div className="mt-4 text-center">
          <Button onClick={downloadPDF} variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download PDF Version
          </Button>
        </div>
      )}
    </div>
  );
};

export default ArtistIDCard;