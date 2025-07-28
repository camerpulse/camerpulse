import React, { useState } from 'react';
import { CamerLogisticsLayout } from '@/components/Layout/CamerLogisticsLayout';
import { MobileCard, MobileCardContent, MobileCardHeader, MobileCardTitle } from '@/components/ui/mobile-card';
import { MobileButton, MobileInput, MobileFormField, MobileForm } from '@/components/ui/mobile-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Package, 
  MapPin, 
  Calculator, 
  Clock, 
  Shield, 
  CheckCircle,
  Truck,
  ArrowRight,
  Star
} from 'lucide-react';

export const ShipPackagePage = () => {
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    senderName: '',
    senderPhone: '',
    senderAddress: '',
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    packageType: '',
    weight: '',
    description: '',
    deliverySpeed: 'standard'
  });

  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);

  const calculatePrice = () => {
    // Simple price calculation logic
    const basePrice = 2500; // Base price in FCFA
    const weightMultiplier = parseFloat(formData.weight) || 1;
    const speedMultiplier = formData.deliverySpeed === 'express' ? 1.5 : 1;
    
    const price = Math.round(basePrice * weightMultiplier * speedMultiplier);
    setEstimatedPrice(price);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <CamerLogisticsLayout>
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary-glow/20 text-white border-primary-glow/30">
              <Package className="h-4 w-4 mr-2" />
              Ship Your Package
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Send Packages Anywhere in Cameroon
            </h1>
            
            <p className="text-lg sm:text-xl text-primary-foreground/90 max-w-3xl mx-auto">
              Fast, reliable, and secure shipping with real-time tracking and insurance protection.
            </p>
          </div>
        </div>
      </section>

      {/* Shipping Form */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2">
                <MobileCard>
                  <MobileCardHeader>
                    <MobileCardTitle className="text-2xl">Package Details</MobileCardTitle>
                  </MobileCardHeader>
                  <MobileCardContent>
                    {isMobile ? (
                      <MobileForm className="space-y-6">
                        {/* Sender Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-primary border-b border-border pb-2">
                            Sender Information
                          </h3>
                          <MobileFormField label="Full Name" required>
                            <MobileInput
                              value={formData.senderName}
                              onChange={(e) => handleInputChange('senderName', e.target.value)}
                              placeholder="Enter sender's full name"
                            />
                          </MobileFormField>
                          <MobileFormField label="Phone Number" required>
                            <MobileInput
                              value={formData.senderPhone}
                              onChange={(e) => handleInputChange('senderPhone', e.target.value)}
                              placeholder="+237 6XX XXX XXX"
                            />
                          </MobileFormField>
                          <MobileFormField label="Pickup Address" required>
                            <Textarea
                              value={formData.senderAddress}
                              onChange={(e) => handleInputChange('senderAddress', e.target.value)}
                              placeholder="Enter complete pickup address"
                              className="min-h-[80px]"
                            />
                          </MobileFormField>
                        </div>

                        {/* Receiver Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-primary border-b border-border pb-2">
                            Receiver Information
                          </h3>
                          <MobileFormField label="Full Name" required>
                            <MobileInput
                              value={formData.receiverName}
                              onChange={(e) => handleInputChange('receiverName', e.target.value)}
                              placeholder="Enter receiver's full name"
                            />
                          </MobileFormField>
                          <MobileFormField label="Phone Number" required>
                            <MobileInput
                              value={formData.receiverPhone}
                              onChange={(e) => handleInputChange('receiverPhone', e.target.value)}
                              placeholder="+237 6XX XXX XXX"
                            />
                          </MobileFormField>
                          <MobileFormField label="Delivery Address" required>
                            <Textarea
                              value={formData.receiverAddress}
                              onChange={(e) => handleInputChange('receiverAddress', e.target.value)}
                              placeholder="Enter complete delivery address"
                              className="min-h-[80px]"
                            />
                          </MobileFormField>
                        </div>

                        {/* Package Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-primary border-b border-border pb-2">
                            Package Information
                          </h3>
                          <MobileFormField label="Package Type" required>
                            <Select value={formData.packageType} onValueChange={(value) => handleInputChange('packageType', value)}>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select package type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="documents">Documents</SelectItem>
                                <SelectItem value="electronics">Electronics</SelectItem>
                                <SelectItem value="clothing">Clothing</SelectItem>
                                <SelectItem value="food">Food Items</SelectItem>
                                <SelectItem value="fragile">Fragile Items</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </MobileFormField>
                          <MobileFormField label="Weight (kg)" required>
                            <MobileInput
                              type="number"
                              value={formData.weight}
                              onChange={(e) => handleInputChange('weight', e.target.value)}
                              placeholder="0.0"
                              step="0.1"
                            />
                          </MobileFormField>
                          <MobileFormField label="Description">
                            <Textarea
                              value={formData.description}
                              onChange={(e) => handleInputChange('description', e.target.value)}
                              placeholder="Brief description of package contents"
                              className="min-h-[60px]"
                            />
                          </MobileFormField>
                          <MobileFormField label="Delivery Speed" required>
                            <Select value={formData.deliverySpeed} onValueChange={(value) => handleInputChange('deliverySpeed', value)}>
                              <SelectTrigger className="h-12">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="standard">Standard (2-3 days)</SelectItem>
                                <SelectItem value="express">Express (1-2 days)</SelectItem>
                                <SelectItem value="same-day">Same Day</SelectItem>
                              </SelectContent>
                            </Select>
                          </MobileFormField>
                        </div>
                      </MobileForm>
                    ) : (
                      <form className="space-y-8">
                        {/* Desktop form with same fields but different styling */}
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-primary">Sender Information</h3>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="senderName">Full Name *</Label>
                                <Input
                                  id="senderName"
                                  value={formData.senderName}
                                  onChange={(e) => handleInputChange('senderName', e.target.value)}
                                  placeholder="Enter sender's full name"
                                  className="h-12"
                                />
                              </div>
                              <div>
                                <Label htmlFor="senderPhone">Phone Number *</Label>
                                <Input
                                  id="senderPhone"
                                  value={formData.senderPhone}
                                  onChange={(e) => handleInputChange('senderPhone', e.target.value)}
                                  placeholder="+237 6XX XXX XXX"
                                  className="h-12"
                                />
                              </div>
                              <div>
                                <Label htmlFor="senderAddress">Pickup Address *</Label>
                                <Textarea
                                  id="senderAddress"
                                  value={formData.senderAddress}
                                  onChange={(e) => handleInputChange('senderAddress', e.target.value)}
                                  placeholder="Enter complete pickup address"
                                  className="min-h-[80px]"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-primary">Receiver Information</h3>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="receiverName">Full Name *</Label>
                                <Input
                                  id="receiverName"
                                  value={formData.receiverName}
                                  onChange={(e) => handleInputChange('receiverName', e.target.value)}
                                  placeholder="Enter receiver's full name"
                                  className="h-12"
                                />
                              </div>
                              <div>
                                <Label htmlFor="receiverPhone">Phone Number *</Label>
                                <Input
                                  id="receiverPhone"
                                  value={formData.receiverPhone}
                                  onChange={(e) => handleInputChange('receiverPhone', e.target.value)}
                                  placeholder="+237 6XX XXX XXX"
                                  className="h-12"
                                />
                              </div>
                              <div>
                                <Label htmlFor="receiverAddress">Delivery Address *</Label>
                                <Textarea
                                  id="receiverAddress"
                                  value={formData.receiverAddress}
                                  onChange={(e) => handleInputChange('receiverAddress', e.target.value)}
                                  placeholder="Enter complete delivery address"
                                  className="min-h-[80px]"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-primary">Package Information</h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="packageType">Package Type *</Label>
                              <Select value={formData.packageType} onValueChange={(value) => handleInputChange('packageType', value)}>
                                <SelectTrigger className="h-12">
                                  <SelectValue placeholder="Select package type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="documents">Documents</SelectItem>
                                  <SelectItem value="electronics">Electronics</SelectItem>
                                  <SelectItem value="clothing">Clothing</SelectItem>
                                  <SelectItem value="food">Food Items</SelectItem>
                                  <SelectItem value="fragile">Fragile Items</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="weight">Weight (kg) *</Label>
                              <Input
                                id="weight"
                                type="number"
                                value={formData.weight}
                                onChange={(e) => handleInputChange('weight', e.target.value)}
                                placeholder="0.0"
                                step="0.1"
                                className="h-12"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={formData.description}
                              onChange={(e) => handleInputChange('description', e.target.value)}
                              placeholder="Brief description of package contents"
                              className="min-h-[60px]"
                            />
                          </div>
                          <div>
                            <Label htmlFor="deliverySpeed">Delivery Speed *</Label>
                            <Select value={formData.deliverySpeed} onValueChange={(value) => handleInputChange('deliverySpeed', value)}>
                              <SelectTrigger className="h-12">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="standard">Standard (2-3 days)</SelectItem>
                                <SelectItem value="express">Express (1-2 days)</SelectItem>
                                <SelectItem value="same-day">Same Day</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </form>
                    )}
                  </MobileCardContent>
                </MobileCard>
              </div>

              {/* Price Calculator & Summary */}
              <div className="space-y-6">
                <MobileCard>
                  <MobileCardHeader>
                    <MobileCardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Price Calculator
                    </MobileCardTitle>
                  </MobileCardHeader>
                  <MobileCardContent>
                    <div className="space-y-4">
                      {isMobile ? (
                        <MobileButton onClick={calculatePrice} className="w-full bg-primary hover:bg-primary/90">
                          <Calculator className="h-4 w-4 mr-2" />
                          Calculate Price
                        </MobileButton>
                      ) : (
                        <Button onClick={calculatePrice} className="w-full bg-primary hover:bg-primary/90 h-12">
                          <Calculator className="h-4 w-4 mr-2" />
                          Calculate Price
                        </Button>
                      )}
                      
                      {estimatedPrice && (
                        <div className="bg-primary/5 rounded-lg p-4 text-center">
                          <p className="text-sm text-muted-foreground">Estimated Price</p>
                          <p className="text-2xl font-bold text-primary">{estimatedPrice.toLocaleString()} FCFA</p>
                        </div>
                      )}
                    </div>
                  </MobileCardContent>
                </MobileCard>

                {/* Features */}
                <MobileCard>
                  <MobileCardHeader>
                    <MobileCardTitle>Included Features</MobileCardTitle>
                  </MobileCardHeader>
                  <MobileCardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Real-time tracking</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Insurance coverage</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">SMS notifications</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">Secure handling</span>
                      </div>
                    </div>
                  </MobileCardContent>
                </MobileCard>

                {/* Book Shipment Button */}
                <div className="space-y-4">
                  {isMobile ? (
                    <MobileButton className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                      <Package className="h-5 w-5 mr-2" />
                      Book Shipment
                    </MobileButton>
                  ) : (
                    <Button size="lg" className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-14">
                      <Package className="h-5 w-5 mr-2" />
                      Book Shipment
                    </Button>
                  )}
                  
                  <p className="text-xs text-muted-foreground text-center">
                    By booking, you agree to our terms and conditions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </CamerLogisticsLayout>
  );
};