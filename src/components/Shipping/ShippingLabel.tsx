import React from 'react';
import { QrCode, Package, MapPin, Calendar, Weight, Truck, Phone, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ShippingLabelProps {
  shipment: {
    tracking_number: string;
    sender_info: {
      name: string;
      phone?: string;
      email?: string;
    };
    receiver_info: {
      name: string;
      phone?: string;
      email?: string;
    };
    origin_address: string;
    destination_address: string;
    weight_kg: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    service_level: string;
    shipping_type: string;
    estimated_delivery_date?: string;
    created_at: string;
    package_details?: {
      description?: string;
    };
  };
  variant?: 'full' | 'compact';
}

export const ShippingLabel: React.FC<ShippingLabelProps> = ({ 
  shipment, 
  variant = 'full' 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatService = (service: string) => {
    return service.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white shadow-xl border-2 border-primary/20 print:shadow-none">
      <CardContent className="p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-glow text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-playfair">CamerPulse Express</h1>
              <p className="text-primary-foreground/80">Professional Shipping Solutions</p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 rounded-lg p-3">
                <QrCode className="h-12 w-12 mx-auto" />
                <p className="text-xs mt-1">Scan to Track</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tracking Number */}
        <div className="bg-secondary/10 border-b-2 border-dashed border-primary/30 p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground font-medium">TRACKING NUMBER</p>
            <p className="text-3xl font-bold font-mono tracking-wider text-primary">
              {shipment.tracking_number}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Service Information */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">{formatService(shipment.service_level)}</p>
                <p className="text-sm text-muted-foreground">{formatService(shipment.shipping_type)}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="text-sm font-medium">
                <Calendar className="h-3 w-3 mr-1" />
                {shipment.estimated_delivery_date 
                  ? formatDate(shipment.estimated_delivery_date)
                  : 'TBD'
                }
              </Badge>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* From */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <MapPin className="h-4 w-4" />
                <span className="font-semibold">FROM</span>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 border-l-4 border-primary">
                <p className="font-medium text-lg">{shipment.sender_info.name}</p>
                {shipment.sender_info.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Phone className="h-3 w-3" />
                    {shipment.sender_info.phone}
                  </div>
                )}
                {shipment.sender_info.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {shipment.sender_info.email}
                  </div>
                )}
                <p className="text-sm mt-2 text-foreground/80">{shipment.origin_address}</p>
              </div>
            </div>

            {/* To */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-accent">
                <MapPin className="h-4 w-4" />
                <span className="font-semibold">TO</span>
              </div>
              <div className="bg-accent/10 rounded-lg p-4 border-l-4 border-accent">
                <p className="font-medium text-lg">{shipment.receiver_info.name}</p>
                {shipment.receiver_info.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Phone className="h-3 w-3" />
                    {shipment.receiver_info.phone}
                  </div>
                )}
                {shipment.receiver_info.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {shipment.receiver_info.email}
                  </div>
                )}
                <p className="text-sm mt-2 text-foreground/80">{shipment.destination_address}</p>
              </div>
            </div>
          </div>

          {/* Package Details */}
          <div className="bg-muted/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-4 w-4 text-primary" />
              <span className="font-semibold">PACKAGE DETAILS</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Weight:</span>
                <div className="flex items-center gap-1 font-medium">
                  <Weight className="h-3 w-3" />
                  {shipment.weight_kg} kg
                </div>
              </div>
              {shipment.dimensions && (
                <div>
                  <span className="text-muted-foreground">Dimensions:</span>
                  <p className="font-medium">
                    {shipment.dimensions.length} × {shipment.dimensions.width} × {shipment.dimensions.height} cm
                  </p>
                </div>
              )}
            </div>
            {shipment.package_details?.description && (
              <div className="mt-3 pt-3 border-t">
                <span className="text-muted-foreground text-sm">Description:</span>
                <p className="font-medium">{shipment.package_details.description}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t pt-4 text-center text-xs text-muted-foreground">
            <p>Label generated on {formatDate(shipment.created_at)}</p>
            <p className="mt-1">For support, visit camerpulse.com/shipping or call +237-XXX-XXXX</p>
          </div>
        </div>

        {/* Barcode area */}
        <div className="bg-muted/10 border-t p-4 text-center">
          <div className="inline-block bg-white border-2 border-dashed border-muted-foreground/30 p-3 rounded">
            <div className="space-y-1">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex gap-px">
                  {[...Array(20)].map((_, j) => (
                    <div 
                      key={j} 
                      className={`w-1 h-4 ${
                        Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'
                      }`} 
                    />
                  ))}
                </div>
              ))}
            </div>
            <p className="text-xs font-mono mt-2">{shipment.tracking_number}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};