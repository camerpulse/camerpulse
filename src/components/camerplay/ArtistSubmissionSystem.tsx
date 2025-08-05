import * as React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  User, 
  Music, 
  Camera, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Upload
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ExistingArtist {
  id: string;
  stage_name: string;
  real_name: string;
  bio_short?: string;
  profile_photo_url?: string;
  region?: string;
  application_status?: string;
  similarity_score: number;
}

interface ArtistFormData {
  stageName: string;
  realName: string;
  gender: string;
  originVillage: string;
  region: string;
  genres: string[];
  languages: string[];
  activeYears: string;
  bio: string;
  quote?: string;
  profilePhoto?: File;
  coverBanner?: File;
  logo?: File;
  performanceLink?: string;
  socialLinks: Record<string, string>;
  firstSong?: string;
  pastEvents?: string;
  awards?: string;
  idDocument?: File;
  supportingEvidence?: File;
}

const REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

const GENRES = [
  'Afrobeats', 'Bikutsi', 'Makossa', 'Assiko', 'Ndombolo',
  'Hip Hop', 'R&B', 'Gospel', 'Traditional', 'Folk',
  'Jazz', 'Blues', 'Reggae', 'Pop', 'Rock'
];

const LANGUAGES = [
  'French', 'English', 'Ewondo', 'Duala', 'Fulfulde',
  'Bamileke', 'Bassa', 'Mafa', 'Mundang', 'Ngumba'
];

export const ArtistSubmissionSystem: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = React.useState(1);
  const [searchResults, setSearchResults] = React.useState<ExistingArtist[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [showClaimForm, setShowClaimForm] = React.useState(false);
  const [selectedArtist, setSelectedArtist] = React.useState<ExistingArtist | null>(null);
  const [loading, setLoading] = React.useState(false);
  
  // Search form state
  const [searchData, setSearchData] = React.useState({
    stageName: '',
    socialUrl: '',
    region: ''
  });
  
  // Main form state
  const [formData, setFormData] = React.useState<ArtistFormData>({
    stageName: '',
    realName: user?.user_metadata?.full_name || '',
    gender: '',
    originVillage: '',
    region: '',
    genres: [],
    languages: [],
    activeYears: '',
    bio: '',
    quote: '',
    socialLinks: {},
    firstSong: '',
    pastEvents: '',
    awards: ''
  });
  
  const [agreedToTerms, setAgreedToTerms] = React.useState({
    authorized: false,
    truthful: false,
    reviewed: false,
    guidelines: false
  });

  // Check if user is already an artist
  React.useEffect(() => {
    checkExistingArtist();
  }, [user]);

  const checkExistingArtist = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('artist_memberships')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data && !error) {
        // User is already an artist, redirect to their profile
        toast({
          title: "Already Registered",
          description: "You're already a verified artist. Redirecting to your profile...",
        });
        // In a real app, you'd redirect to /camerplay/artists/[slug]
        return;
      }
    } catch (error) {
      console.error('Error checking existing artist:', error);
    }
  };

  const searchExistingArtists = async () => {
    setIsSearching(true);
    try {
      const { data, error } = await supabase.rpc('search_artists', {
        p_stage_name: searchData.stageName || null,
        p_social_url: searchData.socialUrl || null,
        p_region: searchData.region || null
      });
      
      if (error) throw error;
      setSearchResults(data || []);
      
      if (data && data.length > 0) {
        toast({
          title: "Potential Matches Found",
          description: `Found ${data.length} similar artist profiles. Please review them.`,
        });
      } else {
        toast({
          title: "No Matches Found",
          description: "No existing profiles match your search. You can proceed with creating a new profile.",
        });
        setCurrentStep(2); // Skip to onboarding form
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search for existing artists. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleClaimProfile = async (artistId: string, claimReason: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('artist_profile_claims')
        .insert({
          user_id: user.id,
          claimed_artist_id: artistId,
          claim_type: 'ownership',
          claim_reason: claimReason
        });
      
      if (error) throw error;
      
      toast({
        title: "Claim Submitted",
        description: "Your profile claim has been submitted for review. You'll be notified once it's processed.",
      });
      
      setShowClaimForm(false);
    } catch (error) {
      console.error('Claim error:', error);
      toast({
        title: "Claim Failed",
        description: "Failed to submit claim. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const submitApplication = async () => {
    if (!user) return;
    
    // Validate required fields
    const requiredFields = ['stageName', 'realName', 'gender', 'region', 'bio'];
    for (const field of requiredFields) {
      if (!formData[field as keyof ArtistFormData]) {
        toast({
          title: "Missing Information",
          description: `Please fill in the ${field} field.`,
          variant: "destructive"
        });
        return;
      }
    }
    
    // Check terms agreement
    const allTermsAgreed = Object.values(agreedToTerms).every(agreed => agreed);
    if (!allTermsAgreed) {
      toast({
        title: "Terms Required",
        description: "Please agree to all terms and conditions before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const applicationData = {
        user_id: user.id,
        stage_name: formData.stageName,
        real_name: formData.realName,
        gender: formData.gender,
        region: formData.region,
        genres: formData.genres,
        languages_spoken: formData.languages,
        bio_short: formData.bio.substring(0, 200),
        bio_full: formData.bio,
        social_media_links: formData.socialLinks,
        application_status: 'submitted'
      };
      
      const { error } = await supabase
        .from('artist_applications')
        .insert(applicationData);
      
      if (error) throw error;
      
      toast({
        title: "Application Submitted!",
        description: "Your artist application has been submitted for review. You'll be notified once it's processed.",
      });
      
      setCurrentStep(4); // Success step
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderSearchStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Check for Existing Artist Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Before we proceed, let's check if your Artist Profile already exists in our database.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="stageName">Stage Name</Label>
            <Input
              id="stageName"
              value={searchData.stageName}
              onChange={(e) => setSearchData(prev => ({ ...prev, stageName: e.target.value }))}
              placeholder="Your artist name"
            />
          </div>
          <div>
            <Label htmlFor="socialUrl">Social Media URL (Optional)</Label>
            <Input
              id="socialUrl"
              value={searchData.socialUrl}
              onChange={(e) => setSearchData(prev => ({ ...prev, socialUrl: e.target.value }))}
              placeholder="Instagram, YouTube, etc."
            />
          </div>
          <div>
            <Label htmlFor="region">Region (Optional)</Label>
            <Select value={searchData.region} onValueChange={(value) => setSearchData(prev => ({ ...prev, region: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((region) => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button 
          onClick={searchExistingArtists}
          disabled={isSearching || !searchData.stageName}
          className="w-full"
        >
          {isSearching ? "Searching..." : "Search for Existing Profile"}
        </Button>
        
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Potential Matches Found:</h3>
            {searchResults.map((artist) => (
              <Card key={artist.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {artist.profile_photo_url && (
                      <img 
                        src={artist.profile_photo_url} 
                        alt={artist.stage_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h4 className="font-semibold">{artist.stage_name}</h4>
                      <p className="text-sm text-muted-foreground">{artist.real_name}</p>
                      <p className="text-xs text-muted-foreground">{artist.region}</p>
                      <Badge variant={artist.application_status === 'approved' ? 'default' : 'secondary'}>
                        {artist.application_status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {Math.round(artist.similarity_score)}% match
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedArtist(artist);
                        setShowClaimForm(true);
                      }}
                    >
                      Claim This Profile
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                None of These Match - Create New
              </Button>
              <Button variant="outline" onClick={() => setSearchResults([])}>
                Search Again
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderOnboardingForm = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Artist Identity & Basic Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stageName" variant="required">Stage Name</Label>
              <Input
                id="stageName"
                value={formData.stageName}
                onChange={(e) => setFormData(prev => ({ ...prev, stageName: e.target.value }))}
                placeholder="Your artist name"
              />
            </div>
            <div>
              <Label htmlFor="realName" variant="required">Real Name</Label>
              <Input
                id="realName"
                value={formData.realName}
                onChange={(e) => setFormData(prev => ({ ...prev, realName: e.target.value }))}
                placeholder="Your legal name"
              />
            </div>
            <div>
              <Label htmlFor="gender" variant="required">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
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
              <Label htmlFor="region" variant="required">Region</Label>
              <Select value={formData.region} onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((region) => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="bio" variant="required">Artist Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us about yourself, your music, and your journey..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>
        <Button onClick={() => setCurrentStep(3)}>
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderTermsStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Terms & Submission
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="authorized"
              checked={agreedToTerms.authorized}
              onCheckedChange={(checked) => setAgreedToTerms(prev => ({ ...prev, authorized: !!checked }))}
            />
            <Label htmlFor="authorized" className="text-sm">
              I confirm I am the artist or authorized to submit this profile.
            </Label>
          </div>
          <div className="flex items-start space-x-3">
            <Checkbox
              id="truthful"
              checked={agreedToTerms.truthful}
              onCheckedChange={(checked) => setAgreedToTerms(prev => ({ ...prev, truthful: !!checked }))}
            />
            <Label htmlFor="truthful" className="text-sm">
              All information is truthful and accurate.
            </Label>
          </div>
          <div className="flex items-start space-x-3">
            <Checkbox
              id="reviewed"
              checked={agreedToTerms.reviewed}
              onCheckedChange={(checked) => setAgreedToTerms(prev => ({ ...prev, reviewed: !!checked }))}
            />
            <Label htmlFor="reviewed" className="text-sm">
              I understand this profile will be reviewed before going live.
            </Label>
          </div>
          <div className="flex items-start space-x-3">
            <Checkbox
              id="guidelines"
              checked={agreedToTerms.guidelines}
              onCheckedChange={(checked) => setAgreedToTerms(prev => ({ ...prev, guidelines: !!checked }))}
            />
            <Label htmlFor="guidelines" className="text-sm">
              I agree to CamerPulse & CamerPlay Artist Guidelines.
            </Label>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep(2)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Form
          </Button>
          <Button 
            onClick={submitApplication}
            disabled={loading || !Object.values(agreedToTerms).every(agreed => agreed)}
          >
            {loading ? "Submitting..." : "Submit for Verification"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderSuccessStep = () => (
    <Card>
      <CardContent className="pt-6 text-center space-y-4">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
        <h2 className="text-2xl font-bold">Application Submitted!</h2>
        <p className="text-muted-foreground">
          Your artist application has been submitted for verification. 
          You'll receive a notification once it's reviewed and approved.
        </p>
        <Button onClick={() => window.location.href = '/'}>
          Return to Home
        </Button>
      </CardContent>
    </Card>
  );

  // Redirect if not logged in
  if (!user) {
    React.useEffect(() => {
      window.location.href = '/auth?returnTo=/camerplay/submit-artist';
    }, []);
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Artist Registration</h1>
          <p className="text-muted-foreground">
            Join CamerPlay as a verified artist and showcase your music to the world
          </p>
          
          {/* Progress indicator */}
          <div className="mt-6">
            <Progress value={(currentStep / 4) * 100} className="w-full max-w-md mx-auto" />
            <div className="flex justify-center mt-2 text-sm text-muted-foreground">
              Step {currentStep} of 4
            </div>
          </div>
        </div>

        {currentStep === 1 && renderSearchStep()}
        {currentStep === 2 && renderOnboardingForm()}
        {currentStep === 3 && renderTermsStep()}
        {currentStep === 4 && renderSuccessStep()}

        {/* Claim Form Modal */}
        {showClaimForm && selectedArtist && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Claim Artist Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Claiming profile for: <strong>{selectedArtist.stage_name}</strong>
                  </p>
                  <Label htmlFor="claimReason">Reason for claim</Label>
                  <Textarea
                    id="claimReason"
                    placeholder="Explain why this profile belongs to you..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowClaimForm(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => {
                      const reason = (document.getElementById('claimReason') as HTMLTextAreaElement)?.value;
                      if (reason) {
                        handleClaimProfile(selectedArtist.id, reason);
                      }
                    }}
                    disabled={loading}
                  >
                    Submit Claim
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};