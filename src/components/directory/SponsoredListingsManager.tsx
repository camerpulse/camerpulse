import { useState, useEffect } from 'react';
import { Calendar, CreditCard, Crown, MapPin, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Institution, SponsoredListing } from '@/types/directory';

interface SponsoredListingsManagerProps {
  institution: Institution;
  onPurchaseComplete?: () => void;
}

export const SponsoredListingsManager = ({ institution, onPurchaseComplete }: SponsoredListingsManagerProps) => {
  const [activeSponsorships, setActiveSponsorships] = useState<SponsoredListing[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'homepage_banner' | 'top_of_search' | 'map_pin_priority'>('homepage_banner');
  const [duration, setDuration] = useState(7);
  const [customDuration, setCustomDuration] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchActiveSponsorships();
  }, [institution.id]);

  const fetchActiveSponsorships = async () => {
    try {
      const { data, error } = await supabase
        .from('sponsored_listings')
        .select('*')
        .eq('institution_id', institution.id)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString());

      if (error) throw error;
      setActiveSponsorships((data as unknown as SponsoredListing[]) || []);
    } catch (error) {
      console.error('Error fetching sponsorships:', error);
    }
  };

  const sponsorshipOptions = [
    {
      type: 'homepage_banner',
      name: 'Homepage Banner',
      description: 'Featured prominently on the directory homepage',
      icon: Crown,
      pricing: { 7: 5000, 30: 18000, custom: 800 }, // FCFA per day for custom
    },
    {
      type: 'top_of_search',
      name: 'Top of Search Results',
      description: 'Appear first in search results for your category',
      icon: TrendingUp,
      pricing: { 7: 3500, 30: 12000, custom: 600 },
    },
    {
      type: 'map_pin_priority',
      name: 'Priority Map Pin',
      description: 'Highlighted pin on the map view',
      icon: MapPin,
      pricing: { 7: 2500, 30: 8500, custom: 400 },
    },
  ];

  const getPrice = (type: string, days: number) => {
    const option = sponsorshipOptions.find(opt => opt.type === type);
    if (!option) return 0;
    
    if (days === 7) return option.pricing[7];
    if (days === 30) return option.pricing[30];
    return option.pricing.custom * days;
  };

  const handlePurchase = async () => {
    if (!selectedType || (!duration && !customDuration)) return;

    try {
      setIsProcessing(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to purchase sponsored listings",
          variant: "destructive",
        });
        return;
      }

      const finalDuration = duration || parseInt(customDuration);
      const price = getPrice(selectedType, finalDuration);
      const startsAt = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(startsAt.getDate() + finalDuration);

      const { error } = await supabase
        .from('sponsored_listings')
        .insert({
          institution_id: institution.id,
          sponsor_user_id: user.user.id,
          listing_type: selectedType,
          duration_days: finalDuration,
          amount_paid: price,
          starts_at: startsAt.toISOString(),
          expires_at: expiresAt.toISOString(),
          is_active: true,
          payment_status: 'paid', // In real implementation, integrate with payment gateway
          analytics_data: {},
        });

      if (error) throw error;

      toast({
        title: "Sponsorship Activated",
        description: `Your ${sponsorshipOptions.find(opt => opt.type === selectedType)?.name} is now active for ${finalDuration} days!`,
      });

      setIsDialogOpen(false);
      fetchActiveSponsorships();
      onPurchaseComplete?.();
    } catch (error) {
      console.error('Error purchasing sponsorship:', error);
      toast({
        title: "Purchase Failed",
        description: "Failed to activate sponsorship. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getRemainingDays = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffTime = expires.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <div className="space-y-6">
      {/* Active Sponsorships */}
      {activeSponsorships.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Active Sponsorships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeSponsorships.map((sponsorship) => {
                const option = sponsorshipOptions.find(opt => opt.type === sponsorship.listing_type);
                const remainingDays = getRemainingDays(sponsorship.expires_at);
                
                return (
                  <div key={sponsorship.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {option?.icon && <option.icon className="h-5 w-5 text-primary" />}
                      <div>
                        <p className="font-medium">{option?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {remainingDays} days remaining
                        </p>
                      </div>
                    </div>
                    <Badge variant={remainingDays > 7 ? "default" : "destructive"}>
                      {sponsorship.payment_status === 'paid' ? 'Active' : 'Pending'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Purchase New Sponsorship */}
      <Card>
        <CardHeader>
          <CardTitle>Promote Your Institution</CardTitle>
          <p className="text-muted-foreground">
            Increase visibility and attract more visitors with sponsored listings
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {sponsorshipOptions.map((option) => {
              const Icon = option.icon;
              const isActive = activeSponsorships.some(s => s.listing_type === option.type);
              
              return (
                <Card key={option.type} className={`relative ${isActive ? 'border-yellow-400 bg-yellow-50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <Icon className="h-8 w-8 text-primary" />
                      <h3 className="font-semibold">{option.name}</h3>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                      
                      <div className="space-y-1 text-sm">
                        <p>7 days: {formatPrice(option.pricing[7])}</p>
                        <p>30 days: {formatPrice(option.pricing[30])}</p>
                        <p className="text-xs text-muted-foreground">
                          Custom: {formatPrice(option.pricing.custom)}/day
                        </p>
                      </div>

                      {isActive && (
                        <Badge className="absolute -top-2 -right-2" variant="secondary">
                          Active
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  Purchase Sponsorship
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Purchase Sponsored Listing</DialogTitle>
                  <DialogDescription>
                    Select your preferred sponsorship type and duration
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label>Sponsorship Type</Label>
                    <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sponsorshipOptions.map((option) => (
                          <SelectItem key={option.type} value={option.type}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Duration</Label>
                    <Select value={duration.toString()} onValueChange={(value) => {
                      if (value === 'custom') {
                        setDuration(0);
                      } else {
                        setDuration(parseInt(value));
                        setCustomDuration('');
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="custom">Custom duration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {duration === 0 && (
                    <div>
                      <Label>Custom Duration (days)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="365"
                        value={customDuration}
                        onChange={(e) => setCustomDuration(e.target.value)}
                        placeholder="Enter number of days"
                      />
                    </div>
                  )}

                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Cost:</span>
                      <span className="text-lg font-bold">
                        {formatPrice(getPrice(selectedType, duration || parseInt(customDuration || '0')))}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handlePurchase} 
                      disabled={isProcessing || (!duration && !customDuration)}
                      className="flex-1"
                    >
                      {isProcessing ? 'Processing...' : 'Purchase Now'}
                    </Button>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};