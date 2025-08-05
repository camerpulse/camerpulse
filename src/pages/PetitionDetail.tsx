import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Users,
  Calendar,
  MapPin,
  Target,
  Share2,
  Heart,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Send,
  Flag,
  TrendingUp
} from 'lucide-react';

interface Petition {
  id: string;
  title: string;
  description: string;
  petition_text: string;
  target_recipients: string[];
  goal_signatures: number;
  current_signatures: number;
  creator_id: string;
  category: string;
  region: string;
  status: string;
  featured: boolean;
  verified: boolean;
  tags: string[];
  image_url?: string;
  deadline_date?: string;
  created_at: string;
  updated_at: string;
}

interface PetitionSignature {
  id: string;
  petition_id: string;
  user_id?: string;
  full_name: string;
  email?: string;
  location?: string;
  comment?: string;
  is_anonymous: boolean;
  verified: boolean;
  created_at: string;
}

interface PetitionUpdate {
  id: string;
  petition_id: string;
  author_id: string;
  title: string;
  content: string;
  update_type: string;
  created_at: string;
}

export default function PetitionDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [petition, setPetition] = useState<Petition | null>(null);
  const [signatures, setSignatures] = useState<PetitionSignature[]>([]);
  const [updates, setUpdates] = useState<PetitionUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingLoading, setSigningLoading] = useState(false);
  const [hasUserSigned, setHasUserSigned] = useState(false);

  // Signature form state
  const [signatureForm, setSignatureForm] = useState({
    full_name: '',
    email: '',
    location: '',
    comment: '',
    is_anonymous: false
  });

  useEffect(() => {
    if (id) {
      fetchPetitionData();
    }
  }, [id, user]);

  const fetchPetitionData = async () => {
    if (!id) return;

    setLoading(true);
    try {
      // Fetch petition details
      const { data: petitionData, error: petitionError } = await supabase
        .from('petitions')
        .select('*')
        .eq('id', id)
        .single();

      if (petitionError) throw petitionError;
      setPetition(petitionData);

      // Fetch signatures
      const { data: signaturesData, error: signaturesError } = await supabase
        .from('petition_signatures')
        .select('*')
        .eq('petition_id', id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (signaturesError) throw signaturesError;
      setSignatures(signaturesData || []);

      // Check if current user has signed
      if (user) {
        const userSignature = signaturesData?.find(sig => sig.user_id === user.id);
        setHasUserSigned(!!userSignature);
        
        if (userSignature) {
          setSignatureForm({
            full_name: userSignature.full_name,
            email: userSignature.email || '',
            location: userSignature.location || '',
            comment: userSignature.comment || '',
            is_anonymous: userSignature.is_anonymous
          });
        }
      }

      // Fetch updates
      const { data: updatesData, error: updatesError } = await supabase
        .from('petition_updates')
        .select('*')
        .eq('petition_id', id)
        .order('created_at', { ascending: false });

      if (updatesError) throw updatesError;
      setUpdates(updatesData || []);

    } catch (error) {
      console.error('Error fetching petition data:', error);
      toast({
        title: "Error",
        description: "Failed to load petition details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const signPetition = async () => {
    if (!petition || !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to sign this petition.",
        variant: "destructive"
      });
      return;
    }

    if (!signatureForm.full_name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your full name.",
        variant: "destructive"
      });
      return;
    }

    setSigningLoading(true);
    try {
      const { error } = await supabase
        .from('petition_signatures')
        .insert({
          petition_id: petition.id,
          user_id: user.id,
          full_name: signatureForm.full_name,
          email: user.email,
          location: signatureForm.location,
          comment: signatureForm.comment,
          is_anonymous: signatureForm.is_anonymous
        });

      if (error) throw error;

      toast({
        title: "Thank you!",
        description: "Your signature has been added to this petition."
      });

      setHasUserSigned(true);
      fetchPetitionData(); // Refresh data to show updated count

    } catch (error: any) {
      console.error('Error signing petition:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign petition. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSigningLoading(false);
    }
  };

  const getProgressPercentage = () => {
    if (!petition) return 0;
    return Math.min((petition.current_signatures / petition.goal_signatures) * 100, 100);
  };

  const formatTimeRemaining = () => {
    if (!petition?.deadline_date) return null;
    
    const now = new Date();
    const end = new Date(petition.deadline_date);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Deadline passed';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours} hour${hours > 1 ? 's' : ''} left`;
  };

  const shareModal = () => {
    if (navigator.share) {
      navigator.share({
        title: petition?.title,
        text: petition?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Petition link copied to clipboard!"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!petition) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Petition Not Found</h3>
              <p className="text-muted-foreground mb-4">
                This petition doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate('/petitions')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Petitions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/petitions')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={shareModal}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Flag className="h-4 w-4 mr-2" />
              Report
            </Button>
          </div>
        </div>

        {/* Petition Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge>{petition.category.replace('_', ' ')}</Badge>
              {petition.featured && <Badge variant="secondary">Featured</Badge>}
              {petition.verified && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            
            <CardTitle className="text-2xl">{petition.title}</CardTitle>
            <p className="text-muted-foreground text-lg">{petition.description}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-4">
              {petition.region && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{petition.region}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Started {format(new Date(petition.created_at), 'MMM d, yyyy')}</span>
              </div>
              {petition.deadline_date && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatTimeRemaining()}</span>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Petition Text */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Petition Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{petition.petition_text}</p>
                </div>
                
                {petition.target_recipients.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">Addressed to:</h4>
                    <div className="flex flex-wrap gap-2">
                      {petition.target_recipients.map((recipient, index) => (
                        <Badge key={index} variant="outline">
                          {recipient}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Updates */}
            {updates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Updates ({updates.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {updates.map((update, index) => (
                      <div key={update.id} className={index > 0 ? 'border-t pt-4' : ''}>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={
                            update.update_type === 'victory' ? 'default' :
                            update.update_type === 'milestone' ? 'secondary' : 'outline'
                          }>
                            {update.update_type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(update.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <h4 className="font-semibold mb-1">{update.title}</h4>
                        <p className="text-sm text-muted-foreground">{update.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {petition.current_signatures.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      of {petition.goal_signatures.toLocaleString()} signatures
                    </div>
                  </div>
                  
                  <Progress value={getProgressPercentage()} className="h-3" />
                  
                  <div className="text-center text-sm text-muted-foreground">
                    {Math.round(getProgressPercentage())}% complete
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sign Petition Card */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {hasUserSigned ? 'You signed this petition' : 'Sign this petition'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasUserSigned ? (
                  <div className="text-center py-4">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Thank you for supporting this cause!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        value={signatureForm.full_name}
                        onChange={(e) => setSignatureForm(prev => ({ ...prev, full_name: e.target.value }))}
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location (Optional)</Label>
                      <Input
                        id="location"
                        value={signatureForm.location}
                        onChange={(e) => setSignatureForm(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Your city/region"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="comment">Comment (Optional)</Label>
                      <Textarea
                        id="comment"
                        value={signatureForm.comment}
                        onChange={(e) => setSignatureForm(prev => ({ ...prev, comment: e.target.value }))}
                        placeholder="Why is this important to you?"
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="anonymous"
                        checked={signatureForm.is_anonymous}
                        onCheckedChange={(checked) => 
                          setSignatureForm(prev => ({ ...prev, is_anonymous: checked as boolean }))
                        }
                      />
                      <Label htmlFor="anonymous" className="text-sm">
                        Sign anonymously
                      </Label>
                    </div>

                    <Button 
                      onClick={signPetition} 
                      disabled={signingLoading || !signatureForm.full_name.trim()}
                      className="w-full"
                    >
                      {signingLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Sign Petition
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Signatures */}
            {signatures.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Recent Signatures
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {signatures.slice(0, 10).map((signature) => (
                      <div key={signature.id} className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {signature.full_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">
                            {signature.is_anonymous ? 'Anonymous' : signature.full_name}
                          </p>
                          {signature.location && (
                            <p className="text-xs text-muted-foreground">{signature.location}</p>
                          )}
                          {signature.comment && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              "{signature.comment}"
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(signature.created_at), 'MMM d')}
                        </span>
                      </div>
                    ))}
                    
                    {signatures.length > 10 && (
                      <Button variant="outline" size="sm" className="w-full">
                        View all {petition.current_signatures} signatures
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}