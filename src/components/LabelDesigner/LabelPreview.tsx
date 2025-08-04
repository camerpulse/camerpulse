import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin, Hash, Calendar, User } from 'lucide-react';

interface LabelPreviewProps {
  data: Record<string, any>;
  templateId?: string;
  templateConfig?: any;
  className?: string;
  compact?: boolean;
}

export const LabelPreview: React.FC<LabelPreviewProps> = ({
  data,
  templateId,
  templateConfig,
  className = "",
  compact = false
}) => {
  const renderShippingLabel = () => (
    <div className="space-y-3 p-4 bg-white border-2 border-dashed border-primary/20 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          <span className="font-bold text-sm">SHIPPING LABEL</span>
        </div>
        <Badge variant="outline" className="text-xs">
          {new Date().toLocaleDateString()}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">FROM:</p>
          <div className="text-sm">
            <p className="font-medium">CamerPulse Logistics</p>
            <p>123 Business Ave</p>
            <p>Yaoundé, Cameroon</p>
          </div>
        </div>
        
        <div>
          <p className="text-xs text-muted-foreground mb-1">TO:</p>
          <div className="text-sm">
            <p className="font-medium">{data.name || 'Recipient Name'}</p>
            <p>{data.address || 'Delivery Address'}</p>
            <p>{data.postal_code || data.city || 'City, Region'}</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-2">
          <Hash className="h-3 w-3" />
          <span className="text-xs font-mono">{data.tracking || 'TRK-XXXXXXXXXX'}</span>
        </div>
        {data.weight && (
          <div className="flex items-center gap-1">
            <span className="text-xs">Weight: {data.weight}kg</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderProductLabel = () => (
    <div className="space-y-2 p-4 bg-white border-2 border-dashed border-secondary/20 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-secondary" />
          <span className="font-bold text-sm">PRODUCT LABEL</span>
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="font-bold text-lg">{data.product_name || 'Product Name'}</h3>
        <div className="flex justify-between items-center">
          <Badge variant="outline">{data.sku || 'SKU-123456'}</Badge>
          <span className="font-bold text-lg text-primary">
            {data.price ? `${data.price} FCFA` : '0 FCFA'}
          </span>
        </div>
      </div>
      
      <div className="flex justify-center pt-2">
        <div className="bg-gray-800 text-white p-2 font-mono text-xs rounded">
          {data.barcode || '||||| ||||| |||||'}
        </div>
      </div>
    </div>
  );

  const renderAddressLabel = () => (
    <div className="space-y-3 p-4 bg-white border-2 border-dashed border-accent/20 rounded-lg">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-accent" />
        <span className="font-bold text-sm">ADDRESS LABEL</span>
      </div>
      
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2 mb-2">
          <User className="h-4 w-4" />
          <span className="font-bold text-lg">{data.name || 'Recipient Name'}</span>
        </div>
        <p className="text-sm">{data.address || 'Street Address'}</p>
        <p className="text-sm font-medium">{data.postal_code || 'Postal Code'}</p>
        <p className="text-xs text-muted-foreground">
          {data.city || data.region || 'City, Region'}
        </p>
      </div>
    </div>
  );

  const renderCustomLabel = () => (
    <div className="space-y-3 p-4 bg-white border-2 border-dashed border-muted/20 rounded-lg">
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4" />
        <span className="font-bold text-sm">CUSTOM LABEL</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        {Object.entries(data).map(([key, value]) => {
          if (key === 'id' || key === 'selected' || key === 'validationErrors') return null;
          return (
            <div key={key} className="space-y-1">
              <p className="text-muted-foreground capitalize">{key.replace('_', ' ')}:</p>
              <p className="font-medium">{value?.toString() || '-'}</p>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderLabel = () => {
    switch (templateId) {
      case 'shipping':
        return renderShippingLabel();
      case 'product':
        return renderProductLabel();
      case 'address':
        return renderAddressLabel();
      default:
        return renderCustomLabel();
    }
  };

  if (compact) {
    return (
      <div className={`scale-75 origin-top-left ${className}`}>
        {renderLabel()}
      </div>
    );
  }

  return (
    <div className={className}>
      {renderLabel()}
    </div>
  );
};

export default LabelPreview;