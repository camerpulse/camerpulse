import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, MapPin, Calendar, Users, Globe, Mail, Phone, 
  Star, TrendingUp, Award, Target, Eye, FileText, 
  MessageSquare, ThumbsUp, Building2, CheckCircle, XCircle, Clock
} from "lucide-react";
import { PartyEmbed } from "@/components/AI/OfficialEmbedEngine";

interface PoliticalParty {
  id: string;
  name: string;
  acronym: string;
  logo_url?: string;
  founding_date?: string;
  headquarters_city?: string;
  headquarters_region?: string;
  official_website?: string;
  contact_email?: string;
  contact_phone?: string;
  party_president?: string;
  vice_president?: string;
  secretary_general?: string;
  treasurer?: string;
  mps_count: number;
  senators_count: number;
  mayors_count: number;
  mission?: string;
  vision?: string;
  ideology?: string;
  political_leaning?: string;
  historical_promises?: string[];
  promises_fulfilled: number;
  promises_failed: number;
  promises_ongoing: number;
  approval_rating: number;
  transparency_rating: number;
  development_rating: number;
  trust_rating: number;
  total_ratings: number;
  founded_by?: string[];
  key_milestones?: any;
  media_gallery?: string[];
}

interface PartyRating {
  id: string;
  approval_rating: number;
  transparency_rating: number;
  development_rating: number;
  trust_rating: number;
  comment?: string;
  user_id: string;
}

const PoliticalPartyDetail = () => {
  const { slug, id } = useParams<{ slug?: string } & { id?: string }>();
  const partyId = id || slug;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [userRating, setUserRating] = useState({
    approval_rating: 5,
    transparency_rating: 5,
    development_rating: 5,
    trust_rating: 5,
    comment: ""
  });
  const [showRatingForm, setShowRatingForm] = useState(false);

  const { data: party, isLoading } = useQuery({
    queryKey: ["political-party", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("political_parties")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as PoliticalParty;
    },
    enabled: !!id
  });

  const { data: existingRating } = useQuery({
    queryKey: ["party-rating", id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("party_ratings")
        .select("*")
        .eq("party_id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as PartyRating | null;
    },
    enabled: !!id
  });

  const ratingMutation = useMutation({
    mutationFn: async (rating: typeof userRating) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in to rate");

      const { error } = await supabase
        .from("party_ratings")
        .upsert({
          party_id: id!,
          user_id: user.id,
          ...rating
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Rating submitted successfully!" });
      setShowRatingForm(false);
      queryClient.invalidateQueries({ queryKey: ["political-party", id] });
      queryClient.invalidateQueries({ queryKey: ["party-rating", id] });
    },
    onError: () => {
      toast({ title: "Failed to submit rating", variant: "destructive" });
    }
  });

  const StarRating = ({ value, onChange, readonly = false }: { 
    value: number, 
    onChange?: (value: number) => void,
    readonly?: boolean 
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 cursor-pointer transition-colors ${
            star <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
          onClick={() => !readonly && onChange?.(star)}
        />
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading party details...</div>
        </div>
      </div>
    );
  }

  if (!party) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Political party not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/political-parties">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Political Parties
          </Button>
        </Link>

        {/* Party Header */}
        <div className="bg-card rounded-lg p-6 mb-6 shadow-sm border">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              {party.logo_url ? (
                <img 
                  src={party.logo_url} 
                  alt={`${party.name} logo`}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                  <Building2 className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-primary mb-2">{party.name}</h1>
              {party.acronym && (
                <p className="text-xl font-semibold text-muted-foreground mb-3">
                  {party.acronym}
                </p>
              )}
              
              <div className="flex flex-wrap gap-3 mb-4">
                <Badge variant="secondary">{party.political_leaning}</Badge>
                <Badge variant="outline">{party.ideology}</Badge>
                <Badge className="bg-green-100 text-green-800">
                  {party.mps_count} MPs • {party.senators_count} Senators • {party.mayors_count} Mayors
                </Badge>
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {party.headquarters_city}, {party.headquarters_region}
                </div>
                {party.founding_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Founded {new Date(party.founding_date).getFullYear()}
                  </div>
                )}
                {party.official_website && (
                  <a 
                    href={party.official_website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    Official Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Leadership */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Leadership
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {party.party_president && (
                  <div className="flex justify-between">
                    <span className="font-medium">President:</span>
                    <span>{party.party_president}</span>
                  </div>
                )}
                {party.vice_president && (
                  <div className="flex justify-between">
                    <span className="font-medium">Vice President:</span>
                    <span>{party.vice_president}</span>
                  </div>
                )}
                {party.secretary_general && (
                  <div className="flex justify-between">
                    <span className="font-medium">Secretary General:</span>
                    <span>{party.secretary_general}</span>
                  </div>
                )}
                {party.treasurer && (
                  <div className="flex justify-between">
                    <span className="font-medium">Treasurer:</span>
                    <span>{party.treasurer}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mission & Vision */}
            {(party.mission || party.vision) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Mission & Vision
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {party.mission && (
                    <div>
                      <h4 className="font-semibold mb-2">Mission</h4>
                      <p className="text-muted-foreground">{party.mission}</p>
                    </div>
                  )}
                  {party.vision && (
                    <div>
                      <h4 className="font-semibold mb-2">Vision</h4>
                      <p className="text-muted-foreground">{party.vision}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Promise Tracker */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Promise Tracker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-2xl font-bold">{party.promises_fulfilled}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Fulfilled</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-yellow-600 mb-2">
                      <Clock className="h-5 w-5" />
                      <span className="text-2xl font-bold">{party.promises_ongoing}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Ongoing</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
                      <XCircle className="h-5 w-5" />
                      <span className="text-2xl font-bold">{party.promises_failed}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Failed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Party Officials */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Party Officials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PartyEmbed partyId={party.id} />
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Headquarters: {party.headquarters_city}, {party.headquarters_region}</span>
                </div>
                {party.contact_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <a href={`mailto:${party.contact_email}`} className="text-primary hover:underline">
                      {party.contact_email}
                    </a>
                  </div>
                )}
                {party.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <a href={`tel:${party.contact_phone}`} className="text-primary hover:underline">
                      {party.contact_phone}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Overall Ratings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Citizen Ratings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Overall Approval</span>
                    <div className="flex items-center gap-2">
                      <StarRating value={Math.round(party.approval_rating)} readonly />
                      <span className="font-semibold">{party.approval_rating.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Transparency</span>
                    <div className="flex items-center gap-2">
                      <StarRating value={Math.round(party.transparency_rating)} readonly />
                      <span className="font-semibold">{party.transparency_rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Development Focus</span>
                    <div className="flex items-center gap-2">
                      <StarRating value={Math.round(party.development_rating)} readonly />
                      <span className="font-semibold">{party.development_rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Public Trust</span>
                    <div className="flex items-center gap-2">
                      <StarRating value={Math.round(party.trust_rating)} readonly />
                      <span className="font-semibold">{party.trust_rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <Separator />
                
                <p className="text-sm text-muted-foreground text-center">
                  Based on {party.total_ratings} citizen ratings
                </p>

                {!existingRating ? (
                  <Button 
                    onClick={() => setShowRatingForm(true)}
                    className="w-full"
                    disabled={showRatingForm}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Rate This Party
                  </Button>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">You have rated this party</p>
                    <Button 
                      variant="outline"
                      onClick={() => setShowRatingForm(true)}
                      className="w-full"
                    >
                      Update Rating
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rating Form */}
            {showRatingForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Rate This Party</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Overall Approval</label>
                      <StarRating 
                        value={userRating.approval_rating} 
                        onChange={(value) => setUserRating(prev => ({...prev, approval_rating: value}))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Transparency</label>
                      <StarRating 
                        value={userRating.transparency_rating} 
                        onChange={(value) => setUserRating(prev => ({...prev, transparency_rating: value}))}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Development Focus</label>
                      <StarRating 
                        value={userRating.development_rating} 
                        onChange={(value) => setUserRating(prev => ({...prev, development_rating: value}))}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Public Trust</label>
                      <StarRating 
                        value={userRating.trust_rating} 
                        onChange={(value) => setUserRating(prev => ({...prev, trust_rating: value}))}
                      />
                    </div>
                  </div>

                  <Textarea
                    placeholder="Share your thoughts about this party (optional)"
                    value={userRating.comment}
                    onChange={(e) => setUserRating(prev => ({...prev, comment: e.target.value}))}
                  />

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => ratingMutation.mutate(userRating)}
                      disabled={ratingMutation.isPending}
                      className="flex-1"
                    >
                      Submit Rating
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowRatingForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Political Representation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Political Representation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Members of Parliament</span>
                  <Badge variant="secondary">{party.mps_count}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Senators</span>
                  <Badge variant="secondary">{party.senators_count}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Mayors</span>
                  <Badge variant="secondary">{party.mayors_count}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliticalPartyDetail;