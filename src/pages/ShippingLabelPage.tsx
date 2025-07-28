import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/Layout/AppLayout';
import { ShippingLabel } from '@/components/Shipping/ShippingLabel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Download, Share, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ShippingLabelPage = () => {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  const { toast } = useToast();
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShipment = async () => {
      if (!trackingNumber) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('shipments')
          .select('*')
          .eq('tracking_number', trackingNumber)
          .single();

        if (error) {
          toast({
            title: "Error",
            description: "Failed to fetch shipment details",
            variant: "destructive"
          });
          return;
        }

        setShipment(data);
      } catch (error) {
        console.error('Error fetching shipment:', error);
        toast({
          title: "Error",
          description: "Failed to fetch shipment details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchShipment();
  }, [trackingNumber, toast]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real implementation, you would generate a PDF
    toast({
      title: "Download Started",
      description: "Your shipping label PDF is being prepared...",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Shipping Label - ${trackingNumber}`,
        text: `Track your package with tracking number: ${trackingNumber}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Shipping label link copied to clipboard",
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="bg-muted h-8 w-64 rounded mb-4"></div>
              <div className="bg-muted h-96 rounded"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!shipment) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Shipping Label Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The requested shipping label could not be found.
            </p>
            <Button asChild>
              <Link to="/shipping">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shipping
              </Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-6 print:hidden">
            <div>
              <Button asChild variant="ghost" className="mb-4">
                <Link to="/shipping">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Shipping
                </Link>
              </Button>
              <h1 className="text-3xl font-bold">Shipping Label</h1>
              <p className="text-muted-foreground">
                Professional shipping label for {trackingNumber}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-base px-4 py-2">
                {shipment.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <Card className="mb-6 print:hidden">
            <CardHeader>
              <CardTitle>Label Actions</CardTitle>
              <CardDescription>
                Print, download, or share this shipping label
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handlePrint} className="flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Print Label
                </Button>
                <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button onClick={handleShare} variant="outline" className="flex items-center gap-2">
                  <Share className="h-4 w-4" />
                  Share
                </Button>
                <Button asChild variant="outline">
                  <Link to={`/shipping/track/${trackingNumber}`}>
                    Track Package
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Label */}
          <div className="print:shadow-none">
            <ShippingLabel shipment={shipment} />
          </div>

          {/* Additional Info */}
          <Card className="mt-6 print:hidden">
            <CardHeader>
              <CardTitle>Important Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                <p>• Please ensure the shipping label is clearly visible and securely attached to your package</p>
                <p>• Keep this tracking number for your records: <strong>{trackingNumber}</strong></p>
                <p>• You can track your package status at any time using the tracking link above</p>
                <p>• Contact CamerPulse Express at +237-677-123-456 for any shipping inquiries</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default ShippingLabelPage;