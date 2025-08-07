import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useMarketplace } from '@/hooks/useMarketplace';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Package,
  CreditCard,
  Truck,
  Shield,
  X
} from 'lucide-react';

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({ isOpen, onClose }) => {
  const {
    cartItems,
    cartTotal,
    cartItemCount,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    isUpdatingQuantity,
    isRemovingFromCart,
    isClearingCart
  } = useMarketplace();

  const formatPrice = (price: number, currency = 'XAF') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'XAF' ? 'XAF' : currency
    }).format(price);
  };

  const subtotal = cartTotal;
  const shipping = 0; // Free shipping for now
  const tax = subtotal * 0.18; // 18% VAT for Cameroon
  const total = subtotal + shipping + tax;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Shopping Cart ({cartItemCount} {cartItemCount === 1 ? 'item' : 'items'})
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="max-h-[calc(90vh-200px)] overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Your cart is empty</p>
              <p className="text-muted-foreground mb-4">Add some products to get started</p>
              <Button onClick={onClose}>Continue Shopping</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Cart Items */}
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                  <img
                    src={item.product?.images?.[0] || '/placeholder.svg'}
                    alt={item.product?.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  
                  <div className="flex-1 space-y-2">
                    <h4 className="font-medium">{item.product?.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.product?.price || 0, item.product?.currency)}
                    </p>
                    
                    {/* Vendor info */}
                    {item.product?.vendor && (
                      <div className="flex items-center gap-2">
                        <Avatar className="w-4 h-4">
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {item.product.vendor.business_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {item.product.vendor.business_name}
                        </span>
                        {item.product.vendor.verification_status === 'verified' && (
                          <Shield className="w-3 h-3 text-green-500" />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => updateCartQuantity({ itemId: item.id, quantity: item.quantity - 1 })}
                        disabled={isUpdatingQuantity}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateCartQuantity({ itemId: item.id, quantity: parseInt(e.target.value) || 1 })}
                        className="w-16 h-8 text-center"
                        min="1"
                      />
                      
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => updateCartQuantity({ itemId: item.id, quantity: item.quantity + 1 })}
                        disabled={isUpdatingQuantity}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Item total */}
                    <p className="font-medium">
                      {formatPrice((item.product?.price || 0) * item.quantity, item.product?.currency)}
                    </p>

                    {/* Remove button */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                      onClick={() => removeFromCart(item.id)}
                      disabled={isRemovingFromCart}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={clearCart}
                  disabled={isClearingCart}
                >
                  Clear Cart
                </Button>
                
                <Button variant="outline" onClick={onClose}>
                  Continue Shopping
                </Button>
              </div>

              <Separator />

              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Tax (18%):</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-2 py-4">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Shield className="w-3 h-3 text-green-500" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Truck className="w-3 h-3 text-primary" />
                  <span>Fast Shipping</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CreditCard className="w-3 h-3 text-yellow-500" />
                  <span>Escrow Protected</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button className="w-full" size="lg">
                <CreditCard className="w-4 h-4 mr-2" />
                Proceed to Checkout
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};