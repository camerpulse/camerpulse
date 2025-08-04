import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Institution, SponsoredListing } from "@/types/directory";
import { 
  Star, 
  TrendingUp, 
  MapPin, 
  Clock, 
  DollarSign,
  CreditCard,
  Target,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const SponsoredListings = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<string>("");
  const [sponsorshipType, setSponsorshipType] = useState<string>("homepage_banner");
  const [duration, setDuration] = useState<string>("7");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserInstitutions();
  }, []);

  const fetchUserInstitutions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .eq('claimed_by', user.id)
        .order('name');

      if (error) throw error;
      setInstitutions(data || []);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    }
  };

  const sponsorshipOptions = [
    {
      id: "homepage_banner",
      name: "Homepage Banner",
      description: "Featured prominently on the directory homepage",
      price: 25000,
      icon: Target,
      features: ["Prime visibility", "Rich media display", "Call-to-action button"]
    },
    {
      id: "top_of_search",
      name: "Search Priority",
      description: "Always appear at the top of search results",
      price: 15000,
      icon: TrendingUp,
      features: ["Search priority", "Enhanced listing", "Sponsored badge"]
    },
    {
      id: "map_pin_priority",
      name: "Map Priority",
      description: "Highlighted pin and priority display on maps",
      price: 10000,
      icon: MapPin,
      features: ["Map highlighting", "Priority pin", "Location boost"]
    }
  ];

  const durationOptions = [
    { days: 7, label: "1 Week", multiplier: 1 },
    { days: 30, label: "1 Month", multiplier: 3.5, discount: "Save 12%" },
    { days: 90, label: "3 Months", multiplier: 9, discount: "Save 25%" },
    { days: 365, label: "1 Year", multiplier: 30, discount: "Save 40%" },
  ];

  const calculatePrice = () => {
    const selectedOption = sponsorshipOptions.find(opt => opt.id === sponsorshipType);
    const selectedDuration = durationOptions.find(opt => opt.days === parseInt(duration));
    
    if (!selectedOption || !selectedDuration) return 0;
    
    return Math.round(selectedOption.price * selectedDuration.multiplier);
  };

  const handlePurchase = async () => {
    if (!selectedInstitution) {
      toast({
        title: "Error",
        description: "Please select an institution to sponsor",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + parseInt(duration));

      // Create sponsored listing record
      const { error } = await supabase
        .from('sponsored_listings')
        .insert({
          institution_id: selectedInstitution,
          sponsor_user_id: user.id,
          listing_type: sponsorshipType,
          duration_days: parseInt(duration),
          amount_paid: calculatePrice(),
          starts_at: startDate.toISOString(),
          expires_at: endDate.toISOString(),
          payment_status: 'pending'
        });

      if (error) throw error;

      // In a real implementation, this would integrate with Stripe
      // For now, we'll just mark as paid
      await supabase
        .from('institutions')
        .update({ 
          is_sponsored: true,
          sponsored_until: endDate.toISOString()
        })
        .eq('id', selectedInstitution);

      toast({
        title: "Success",
        description: "Sponsorship activated successfully!",
      });

      // Reset form
      setSelectedInstitution("");
      setSponsorshipType("homepage_banner");
      setDuration("7");

    } catch (error) {
      console.error('Error purchasing sponsorship:', error);
      toast({
        title: "Error",
        description: "Failed to activate sponsorship",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedOption = sponsorshipOptions.find(opt => opt.id === sponsorshipType);
  const selectedDurationInfo = durationOptions.find(opt => opt.days === parseInt(duration));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Sponsored Listings</h1>
          <p className="text-lg text-gray-600">
            Boost your institution's visibility and reach more people
          </p>
        </div>

        {/* Institution Selection */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Select Institution to Sponsor</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {institutions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  You don't have any claimed institutions yet.
                </p>
                <Button variant="outline">Claim an Institution</Button>
              </div>
            ) : (
              <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an institution" />
                </SelectTrigger>
                <SelectContent>
                  {institutions.map((institution) => (
                    <SelectItem key={institution.id} value={institution.id}>
                      <div className="flex items-center gap-2">
                        <span>{institution.name}</span>
                        <Badge variant="outline">{institution.institution_type}</Badge>
                        {institution.is_sponsored && (
                          <Badge variant="secondary">Currently Sponsored</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {/* Sponsorship Options */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Choose Sponsorship Type</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <RadioGroup value={sponsorshipType} onValueChange={setSponsorshipType}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sponsorshipOptions.map((option) => (
                  <div key={option.id} className="relative">
                    <RadioGroupItem
                      value={option.id}
                      id={option.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={option.id}
                      className="flex flex-col p-4 bg-white border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <option.icon className="h-6 w-6 text-blue-600" />
                        <div>
                          <h3 className="font-semibold">{option.name}</h3>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Starting at</span>
                          <span className="text-lg font-bold text-blue-600">
                            {option.price.toLocaleString()} FCFA
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {option.features.map((feature, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center gap-1">
                              <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Duration Selection */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Select Duration</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <RadioGroup value={duration} onValueChange={setDuration}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {durationOptions.map((option) => (
                  <div key={option.days} className="relative">
                    <RadioGroupItem
                      value={option.days.toString()}
                      id={option.days.toString()}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={option.days.toString()}
                      className="flex flex-col p-4 bg-white border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:bg-gray-50 transition-colors text-center"
                    >
                      <div className="font-semibold mb-1">{option.label}</div>
                      <div className="text-sm text-gray-600 mb-2">{option.days} days</div>
                      {option.discount && (
                        <Badge variant="secondary" className="text-xs">
                          {option.discount}
                        </Badge>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Price Summary */}
        {selectedOption && selectedDurationInfo && (
          <Card className="p-6 bg-blue-50 border-blue-200">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Price Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>{selectedOption.name}</span>
                  <span>{selectedOption.price.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Duration: {selectedDurationInfo.label}</span>
                  <span>× {selectedDurationInfo.multiplier}</span>
                </div>
                {selectedDurationInfo.discount && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Discount</span>
                    <span>{selectedDurationInfo.discount}</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">
                      {calculatePrice().toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Purchase Button */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={handlePurchase}
            disabled={!selectedInstitution || loading}
            className="px-8"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Purchase Sponsorship
              </>
            )}
          </Button>
        </div>

        {/* Benefits */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Why Sponsor Your Listing?
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Increased Visibility</h3>
                <p className="text-sm text-gray-600">
                  Get noticed by more potential customers and clients
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Targeted Exposure</h3>
                <p className="text-sm text-gray-600">
                  Reach users actively looking for your services
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Performance Analytics</h3>
                <p className="text-sm text-gray-600">
                  Track views, clicks, and engagement metrics
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};