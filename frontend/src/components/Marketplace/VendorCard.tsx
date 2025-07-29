import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Shield, 
  Star, 
  MapPin, 
  ShoppingBag, 
  ExternalLink,
  QrCode,
  CreditCard,
  Truck
} from 'lucide-react';

interface VendorProps {
  id: string;
  name: string;
  vendorId: string;
  businessName: string;
  category: string;
  location: string;
  rating: number;
  totalReviews: number;
  verified: boolean;
  avatar?: string;
  description: string;
  productsCount: number;
  escrowActive: boolean;
  joinedDate: string;
  lastActive: string;
}

export const VendorCard = ({ vendor }: { vendor: VendorProps }) => {
  const getRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-4 h-4 ${i <= rating ? 'text-accent fill-current' : 'text-muted-foreground'}`} 
        />
      );
    }
    return stars;
  };

  return (
    <Card className="border-border/50 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-14 h-14 border-2 border-primary/20">
            <AvatarImage src={vendor.avatar} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {vendor.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-foreground">{vendor.businessName}</h3>
              {vendor.verified && (
                <Badge className="bg-cm-green text-white px-2 py-1">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground">{vendor.name}</p>
            <p className="text-sm text-primary font-medium">{vendor.category}</p>
            
            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{vendor.location}</span>
            </div>
          </div>
        </div>

        {/* Vendor ID Badge */}
        <div className="bg-gradient-flag p-3 rounded-lg mb-4">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-xs opacity-90">Vendor ID</p>
              <p className="font-mono font-bold">{vendor.vendorId}</p>
            </div>
            <QrCode className="w-6 h-6" />
          </div>
        </div>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1">
            {getRatingStars(vendor.rating)}
          </div>
          <span className="text-sm font-medium text-foreground">{vendor.rating}</span>
          <span className="text-sm text-muted-foreground">({vendor.totalReviews} reviews)</span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {vendor.description}
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <ShoppingBag className="w-4 h-4 text-primary" />
            <span>{vendor.productsCount} Products</span>
          </div>
          
          {vendor.escrowActive && (
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="w-4 h-4 text-cm-green" />
              <span>Escrow Protected</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <Truck className="w-4 h-4 text-primary" />
            <span>Fast Shipping</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-cm-green" />
            <span>KYC Verified</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="text-lg font-bold text-foreground">{vendor.rating}</div>
            <div className="text-xs text-muted-foreground">Rating</div>
          </div>
          
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="text-lg font-bold text-foreground">{vendor.productsCount}</div>
            <div className="text-xs text-muted-foreground">Products</div>
          </div>
          
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="text-lg font-bold text-foreground">{vendor.totalReviews}</div>
            <div className="text-xs text-muted-foreground">Reviews</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mb-3">
          <Button variant="default" size="sm" className="flex-1">
            <ShoppingBag className="w-4 h-4 mr-2" />
            View Store
          </Button>
          
          <Button variant="outline" size="sm" className="flex-1">
            <ExternalLink className="w-4 h-4 mr-2" />
            Verify ID
          </Button>
        </div>

        {/* Vendor Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Joined: {vendor.joinedDate}</p>
          <p>Last active: {vendor.lastActive}</p>
        </div>
      </CardContent>
    </Card>
  );
};