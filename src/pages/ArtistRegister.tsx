import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Upload, CreditCard, Smartphone, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const genres = [
  "Afrobeat", "Makossa", "Bikutsi", "Assiko", "Hip Hop", "R&B", 
  "Pop", "Gospel", "Traditional", "Jazz", "Blues", "Reggae", "Other"
];

const regions = [
  "Adamawa", "Centre", "East", "Far North", "Littoral", 
  "North", "Northwest", "South", "Southwest", "West"
];

const languages = [
  "English"
];

const ArtistRegister = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    stageName: "",
    realName: "",
    gender: "",
    nationality: "Cameroon",
    region: "",
    genres: [] as string[],
    languagesSpoken: [] as string[],
    bioShort: "",
    bioFull: "",
    phoneNumber: "",
    email: "",
    socialMediaLinks: {
      instagram: "",
      facebook: "",
      twitter: "",
      youtube: "",
      tiktok: ""
    },
    profilePhoto: null as File | null,
    idDocument: null as File | null,
    agreeToTerms: false
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMediaLinks: { ...prev.socialMediaLinks, [platform]: value }
    }));
  };

  const handleGenreToggle = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const handleLanguageToggle = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languagesSpoken: prev.languagesSpoken.includes(language)
        ? prev.languagesSpoken.filter(l => l !== language)
        : [...prev.languagesSpoken, language]
    }));
  };

  const handleFileUpload = (field: 'profilePhoto' | 'idDocument', file: File) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async () => {
    if (!formData.agreeToTerms) {
      toast({
        variant: "destructive",
        title: "Terms Required",
        description: "Please agree to the terms and conditions"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Here we would integrate with Stripe for payment
      // For now, we'll just submit the application
      const { error } = await supabase.from('artist_applications').insert({
        stage_name: formData.stageName,
        real_name: formData.realName,
        gender: formData.gender,
        nationality: formData.nationality,
        region: formData.region,
        genres: formData.genres,
        languages_spoken: formData.languagesSpoken,
        bio_short: formData.bioShort,
        bio_full: formData.bioFull,
        phone_number: formData.phoneNumber,
        social_media_links: formData.socialMediaLinks,
        payment_status: 'pending'
      });

      if (error) throw error;

      toast({
        title: "Application Submitted",
        description: "Your application is pending payment. You'll be redirected to complete payment."
      });

      // Redirect to payment
      setCurrentStep(4);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Please try again or contact support"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stageName">Stage Name *</Label>
          <Input
            id="stageName"
            value={formData.stageName}
            onChange={(e) => handleInputChange('stageName', e.target.value)}
            placeholder="Your artistic name"
          />
        </div>
        <div>
          <Label htmlFor="realName">Real Name *</Label>
          <Input
            id="realName"
            value={formData.realName}
            onChange={(e) => handleInputChange('realName', e.target.value)}
            placeholder="Full legal name"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label>Gender</Label>
          <Select onValueChange={(value) => handleInputChange('gender', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Nationality</Label>
          <Input value="Cameroon" disabled />
        </div>
        <div>
          <Label>Region *</Label>
          <Select onValueChange={(value) => handleInputChange('region', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map(region => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="your.email@example.com"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            placeholder="+237 6XX XXX XXX"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <Label>Music Genres *</Label>
        <p className="text-sm text-muted-foreground mb-3">Select all that apply to your music</p>
        <div className="flex flex-wrap gap-2">
          {genres.map(genre => (
            <Badge
              key={genre}
              variant={formData.genres.includes(genre) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleGenreToggle(genre)}
            >
              {genre}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label>Languages Spoken *</Label>
        <p className="text-sm text-muted-foreground mb-3">Languages you can perform in</p>
        <div className="flex flex-wrap gap-2">
          {languages.map(language => (
            <Badge
              key={language}
              variant={formData.languagesSpoken.includes(language) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleLanguageToggle(language)}
            >
              {language}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="bioShort">Short Bio *</Label>
        <Textarea
          id="bioShort"
          value={formData.bioShort}
          onChange={(e) => handleInputChange('bioShort', e.target.value)}
          placeholder="Brief description (max 200 characters)"
          maxLength={200}
        />
        <p className="text-sm text-muted-foreground mt-1">
          {formData.bioShort.length}/200 characters
        </p>
      </div>

      <div>
        <Label htmlFor="bioFull">Full Bio</Label>
        <Textarea
          id="bioFull"
          value={formData.bioFull}
          onChange={(e) => handleInputChange('bioFull', e.target.value)}
          placeholder="Detailed artist biography, musical journey, achievements..."
          rows={6}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <Label>Social Media Links</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Add your social media profiles to help fans find you
        </p>
        <div className="space-y-3">
          {Object.entries(formData.socialMediaLinks).map(([platform, value]) => (
            <div key={platform} className="flex items-center gap-3">
              <div className="w-20 text-sm capitalize">{platform}:</div>
              <Input
                value={value}
                onChange={(e) => handleSocialMediaChange(platform, e.target.value)}
                placeholder={`Your ${platform} username or URL`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label>Profile Photo *</Label>
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Upload your professional photo
            </p>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload('profilePhoto', e.target.files[0])}
            />
            {formData.profilePhoto && (
              <p className="text-sm text-green-600 mt-2">✓ {formData.profilePhoto.name}</p>
            )}
          </div>
        </div>

        <div>
          <Label>National ID/Passport *</Label>
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Upload clear ID document
            </p>
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => e.target.files?.[0] && handleFileUpload('idDocument', e.target.files[0])}
            />
            {formData.idDocument && (
              <p className="text-sm text-green-600 mt-2">✓ {formData.idDocument.name}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="terms"
          checked={formData.agreeToTerms}
          onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked)}
        />
        <Label htmlFor="terms" className="text-sm">
          I agree to the terms and conditions and privacy policy
        </Label>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center space-y-6">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Complete Payment
            </CardTitle>
            <CardDescription>
              One-time membership fee to activate your artist account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-4">25,000 FCFA</div>
            <div className="space-y-3">
              <Button className="w-full" variant="outline">
                <Smartphone className="w-4 h-4 mr-2" />
                Mobile Money (MTN/Orange)
              </Button>
              <Button className="w-full" variant="outline">
                <CreditCard className="w-4 h-4 mr-2" />
                Credit/Debit Card
              </Button>
              <Button className="w-full" variant="outline">
                <Globe className="w-4 h-4 mr-2" />
                PayPal / Crypto
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Artist Registration</CardTitle>
                <CardDescription>
                  Step {currentStep} of 4 - {
                    currentStep === 1 ? "Personal Information" :
                    currentStep === 2 ? "Artist Details" :
                    currentStep === 3 ? "Media & Documents" :
                    "Payment"
                  }
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(step => (
                  <div
                    key={step}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === currentStep
                        ? "bg-primary text-primary-foreground"
                        : step < currentStep
                        ? "bg-green-600 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < 4 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={
                    (currentStep === 1 && (!formData.stageName || !formData.realName || !formData.email)) ||
                    (currentStep === 2 && (formData.genres.length === 0 || !formData.bioShort)) ||
                    (currentStep === 3 && (!formData.profilePhoto || !formData.idDocument || !formData.agreeToTerms))
                  }
                >
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : "Complete Registration"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ArtistRegister;