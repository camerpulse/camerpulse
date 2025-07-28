import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Package, Truck, Calculator } from 'lucide-react';

interface ShipmentFormData {
  // Sender info
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  senderAddress: string;
  
  // Receiver info
  receiverName: string;
  receiverPhone: string;
  receiverEmail: string;
  receiverAddress: string;
  
  // Package details
  packageDescription: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  declaredValue: string;
  
  // Shipping options
  shippingType: string;
  serviceLevel: string;
  requiresSignature: boolean;
  isFragile: boolean;
  specialInstructions: string;
}

const CreateShipment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ShipmentFormData>({
    senderName: '',
    senderPhone: '',
    senderEmail: '',
    senderAddress: '',
    receiverName: '',
    receiverPhone: '',
    receiverEmail: '',
    receiverAddress: '',
    packageDescription: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    declaredValue: '',
    shippingType: 'standard',
    serviceLevel: 'standard',
    requiresSignature: false,
    isFragile: false,
    specialInstructions: ''
  });

  useEffect(() => {
    if (user) {
      checkUserCompany();
    }
  }, [user]);

  const checkUserCompany = async () => {
    try {
      const { data, error } = await supabase
        .from('shipping_company_staff')
        .select('company_id')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .single();

      if (error) {
        toast({
          title: "Access Required",
          description: "You need to be associated with a shipping company to create shipments.",
          variant: "destructive"
        });
        navigate('/shipping/register');
        return;
      }

      setCompanyId(data.company_id);
    } catch (error) {
      console.error('Error checking user company:', error);
    }
  };

  const handleInputChange = (field: keyof ShipmentFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset shipping cost when package details change
    if (['weight', 'length', 'width', 'height', 'shippingType', 'serviceLevel'].includes(field)) {
      setShippingCost(null);
    }
  };

  const calculateShippingCost = async () => {
    if (!formData.weight || !companyId) return;
    
    setCalculating(true);
    try {
      // Mock calculation - in real app, this would use shipping rates table
      const weight = parseFloat(formData.weight);
      const baseRate = formData.serviceLevel === 'economy' ? 5000 : 
                      formData.serviceLevel === 'premium' ? 15000 : 10000;
      const perKgRate = 2000;
      const cost = baseRate + (weight * perKgRate);
      
      setShippingCost(cost);
      
      toast({
        title: "Shipping Cost Calculated",
        description: `Estimated cost: ${cost.toLocaleString()} FCFA`
      });
    } catch (error) {
      console.error('Error calculating shipping cost:', error);
      toast({
        title: "Calculation Error",
        description: "Failed to calculate shipping cost",
        variant: "destructive"
      });
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    
    setLoading(true);
    try {
      const shipmentData = {
        shipping_company_id: companyId,
        sender_info: {
          name: formData.senderName,
          phone: formData.senderPhone,
          email: formData.senderEmail
        },
        receiver_info: {
          name: formData.receiverName,
          phone: formData.receiverPhone,
          email: formData.receiverEmail
        },
        package_details: {
          description: formData.packageDescription,
          weight_kg: parseFloat(formData.weight),
          dimensions: {
            length: parseFloat(formData.length || '0'),
            width: parseFloat(formData.width || '0'),
            height: parseFloat(formData.height || '0')
          }
        },
        origin_address: formData.senderAddress,
        destination_address: formData.receiverAddress,
        shipping_type: formData.shippingType,
        service_level: formData.serviceLevel,
        weight_kg: parseFloat(formData.weight),
        dimensions: {
          length: parseFloat(formData.length || '0'),
          width: parseFloat(formData.width || '0'),
          height: parseFloat(formData.height || '0')
        },
        declared_value: formData.declaredValue ? parseFloat(formData.declaredValue) : 0,
        shipping_cost: shippingCost || 0,
        requires_signature: formData.requiresSignature,
        is_fragile: formData.isFragile,
        special_instructions: formData.specialInstructions || null,
        created_by: user?.id
      };

      const { data, error } = await supabase
        .from('shipments')
        .insert(shipmentData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Shipment Created",
        description: `Tracking number: ${data.tracking_number}`
      });

      navigate(`/shipping/track/${data.tracking_number}`);
    } catch (error) {
      console.error('Error creating shipment:', error);
      toast({
        title: "Error",
        description: "Failed to create shipment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Create New Shipment</h1>
              <p className="text-muted-foreground">Create a new shipment and generate tracking information</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sender Information */}
            <Card>
              <CardHeader>
                <CardTitle>Sender Information</CardTitle>
                <CardDescription>Details of the person sending the package</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="senderName">Full Name *</Label>
                    <Input
                      id="senderName"
                      value={formData.senderName}
                      onChange={(e) => handleInputChange('senderName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="senderPhone">Phone Number *</Label>
                    <Input
                      id="senderPhone"
                      value={formData.senderPhone}
                      onChange={(e) => handleInputChange('senderPhone', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="senderEmail">Email Address</Label>
                    <Input
                      id="senderEmail"
                      type="email"
                      value={formData.senderEmail}
                      onChange={(e) => handleInputChange('senderEmail', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="senderAddress">Complete Address *</Label>
                  <Textarea
                    id="senderAddress"
                    value={formData.senderAddress}
                    onChange={(e) => handleInputChange('senderAddress', e.target.value)}
                    placeholder="Include street, city, region, and postal code"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Receiver Information */}
            <Card>
              <CardHeader>
                <CardTitle>Receiver Information</CardTitle>
                <CardDescription>Details of the person receiving the package</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="receiverName">Full Name *</Label>
                    <Input
                      id="receiverName"
                      value={formData.receiverName}
                      onChange={(e) => handleInputChange('receiverName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="receiverPhone">Phone Number *</Label>
                    <Input
                      id="receiverPhone"
                      value={formData.receiverPhone}
                      onChange={(e) => handleInputChange('receiverPhone', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="receiverEmail">Email Address</Label>
                    <Input
                      id="receiverEmail"
                      type="email"
                      value={formData.receiverEmail}
                      onChange={(e) => handleInputChange('receiverEmail', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="receiverAddress">Complete Address *</Label>
                  <Textarea
                    id="receiverAddress"
                    value={formData.receiverAddress}
                    onChange={(e) => handleInputChange('receiverAddress', e.target.value)}
                    placeholder="Include street, city, region, and postal code"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Package Details */}
            <Card>
              <CardHeader>
                <CardTitle>Package Details</CardTitle>
                <CardDescription>Information about the package being shipped</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="packageDescription">Package Description *</Label>
                  <Textarea
                    id="packageDescription"
                    value={formData.packageDescription}
                    onChange={(e) => handleInputChange('packageDescription', e.target.value)}
                    placeholder="Describe the contents of the package"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="weight">Weight (kg) *</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="length">Length (cm)</Label>
                    <Input
                      id="length"
                      type="number"
                      value={formData.length}
                      onChange={(e) => handleInputChange('length', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="width">Width (cm)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={formData.width}
                      onChange={(e) => handleInputChange('width', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="declaredValue">Declared Value (FCFA)</Label>
                  <Input
                    id="declaredValue"
                    type="number"
                    value={formData.declaredValue}
                    onChange={(e) => handleInputChange('declaredValue', e.target.value)}
                    placeholder="For insurance purposes"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Options */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Options</CardTitle>
                <CardDescription>Choose your preferred shipping method and service level</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shippingType">Shipping Type</Label>
                    <Select value={formData.shippingType} onValueChange={(value) => handleInputChange('shippingType', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="express">Express</SelectItem>
                        <SelectItem value="overnight">Overnight</SelectItem>
                        <SelectItem value="international">International</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="serviceLevel">Service Level</Label>
                    <Select value={formData.serviceLevel} onValueChange={(value) => handleInputChange('serviceLevel', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="economy">Economy</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requiresSignature"
                      checked={formData.requiresSignature}
                      onCheckedChange={(checked) => handleInputChange('requiresSignature', checked as boolean)}
                    />
                    <Label htmlFor="requiresSignature">Requires signature on delivery</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isFragile"
                      checked={formData.isFragile}
                      onCheckedChange={(checked) => handleInputChange('isFragile', checked as boolean)}
                    />
                    <Label htmlFor="isFragile">Fragile item - handle with care</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="specialInstructions">Special Instructions</Label>
                  <Textarea
                    id="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                    placeholder="Any special delivery instructions..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cost Calculation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Shipping Cost
                </CardTitle>
                <CardDescription>Calculate the cost for this shipment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={calculateShippingCost}
                    disabled={!formData.weight || calculating}
                    className="flex items-center gap-2"
                  >
                    <Calculator className="h-4 w-4" />
                    {calculating ? 'Calculating...' : 'Calculate Cost'}
                  </Button>
                  
                  {shippingCost && (
                    <div className="text-lg font-semibold text-primary">
                      Estimated Cost: {shippingCost.toLocaleString()} FCFA
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/shipping/dashboard')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !shippingCost}
                className="flex items-center gap-2"
              >
                <Truck className="h-4 w-4" />
                {loading ? 'Creating...' : 'Create Shipment'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default CreateShipment;